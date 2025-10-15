import EventEmitter = require("events");
import { Seaport } from "@opensea/seaport-js";
import { OrderComponents } from "@opensea/seaport-js/lib/types";
import {
  BigNumberish,
  Overrides,
  Signer,
  ethers,
  JsonRpcProvider,
} from "ethers";
import { OpenSeaAPI } from "./api/api";
import { CollectionOffer, Listing, Offer, Order } from "./api/types";
import { WPOL_ADDRESS } from "./constants";
import { OrderV2 } from "./orders/types";
import { AssetsManager } from "./sdk/assets";
import { CancellationManager } from "./sdk/cancellation";
import { FulfillmentManager } from "./sdk/fulfillment";
import { OrdersManager } from "./sdk/orders";
import { TokensManager } from "./sdk/tokens";
import {
  EventData,
  EventType,
  Chain,
  OpenSeaAPIConfig,
  OrderSide,
  AssetWithTokenStandard,
  AssetWithTokenId,
} from "./types";
import {
  getDefaultConduit,
  getOfferPaymentToken,
  getSeaportInstance,
} from "./utils/utils";

/**
 * The OpenSea SDK main class.
 * @category Main Classes
 */
export class OpenSeaSDK {
  /** Provider to use for transactions. */
  public provider: JsonRpcProvider;
  /** Seaport v1.6 client @see {@link https://github.com/ProjectOpenSea/seaport-js} */
  public seaport_v1_6: Seaport;
  /** Logger function to use when debugging */
  public logger: (arg: string) => void;
  /** API instance */
  public readonly api: OpenSeaAPI;
  /** The configured chain */
  public readonly chain: Chain;
  /** Internal cache of decimals for payment tokens to save network requests */
  private _cachedPaymentTokenDecimals: { [address: string]: number } = {};

  private _emitter: EventEmitter;
  private _signerOrProvider: Signer | JsonRpcProvider;

  // Manager instances
  private _tokensManager: TokensManager;
  private _assetsManager: AssetsManager;
  private _cancellationManager: CancellationManager;
  private _ordersManager: OrdersManager;
  private _fulfillmentManager: FulfillmentManager;

  /**
   * Create a new instance of OpenSeaSDK.
   * @param signerOrProvider Signer or provider to use for transactions. For example:
   * `new ethers.providers.JsonRpcProvider('https://mainnet.infura.io')` or
   * `new ethers.Wallet(privKey, provider)`
   * @param apiConfig configuration options, including `chain`
   * @param logger optional function for logging debug strings. defaults to no logging
   */
  constructor(
    signerOrProvider: Signer | JsonRpcProvider,
    apiConfig: OpenSeaAPIConfig = {},
    logger?: (arg: string) => void,
  ) {
    // API config
    apiConfig.chain ??= Chain.Mainnet;
    this.chain = apiConfig.chain;
    this.api = new OpenSeaAPI(apiConfig);

    this.provider = ((signerOrProvider as Signer).provider ??
      signerOrProvider) as JsonRpcProvider;
    this._signerOrProvider = signerOrProvider ?? this.provider;

    const defaultConduit = getDefaultConduit(this.chain);
    this.seaport_v1_6 = new Seaport(this._signerOrProvider, {
      conduitKeyToConduit: {
        [defaultConduit.key]: defaultConduit.address,
      },
      overrides: { defaultConduitKey: defaultConduit.key },
    });

    // Emit events
    this._emitter = new EventEmitter();

    // Logger: default to no logging if fn not provided
    this.logger = logger ?? ((arg: string) => arg);

    // Cache decimals for offer and listing payment tokens to skip network request
    const offerPaymentToken = getOfferPaymentToken(this.chain).toLowerCase();
    const listingPaymentToken = getOfferPaymentToken(this.chain).toLowerCase();
    this._cachedPaymentTokenDecimals[offerPaymentToken] = 18;
    this._cachedPaymentTokenDecimals[listingPaymentToken] = 18;

    // Initialize manager instances
    this._tokensManager = new TokensManager(
      this._signerOrProvider,
      this.chain,
      this._dispatch.bind(this),
      this._confirmTransaction.bind(this),
      this._requireAccountIsAvailable.bind(this),
      this.getNativeWrapTokenAddress.bind(this),
    );

    this._assetsManager = new AssetsManager(
      this._signerOrProvider,
      this.provider,
      this.chain,
      this._dispatch.bind(this),
      this._confirmTransaction.bind(this),
      this._requireAccountIsAvailable.bind(this),
      this.logger,
    );

    this._cancellationManager = new CancellationManager(
      this.api,
      this.chain,
      this._signerOrProvider,
      this._dispatch.bind(this),
      this._confirmTransaction.bind(this),
      (protocolAddress: string) =>
        getSeaportInstance(protocolAddress, this.seaport_v1_6),
    );

    this._ordersManager = new OrdersManager(
      this.seaport_v1_6,
      this.api,
      this.chain,
      this._requireAccountIsAvailable.bind(this),
      this._getPriceParameters.bind(this),
    );

    this._fulfillmentManager = new FulfillmentManager(
      this._ordersManager,
      this.api,
      this.seaport_v1_6,
      this._dispatch.bind(this),
      this._confirmTransaction.bind(this),
      this._requireAccountIsAvailable.bind(this),
    );
  }

  /**
   * Add a listener for events emitted by the SDK.
   * @param event The {@link EventType} to listen to.
   * @param listener A callback that will accept an object with {@link EventData}\
   * @param once Whether the listener should only be called once, or continue listening until removed.
   */
  public addListener(
    event: EventType,
    listener: (data: EventData) => void,
    once = false,
  ) {
    if (once) {
      this._emitter.once(event, listener);
    } else {
      this._emitter.addListener(event, listener);
    }
  }

  /**
   * Remove an event listener by calling `.removeListener()` on an event and listener.
   * @param event The {@link EventType} to remove a listener for\
   * @param listener The listener to remove
   */
  public removeListener(event: EventType, listener: (data: EventData) => void) {
    this._emitter.removeListener(event, listener);
  }

  /**
   * Remove all event listeners. This should be called when you're unmounting
   * a component that listens to events to make UI updates.
   * @param event Optional EventType to remove listeners for
   */
  public removeAllListeners(event?: EventType) {
    this._emitter.removeAllListeners(event);
  }

  /**
   * Get the appropriate token address for wrap/unwrap operations.
   * For Polygon, use WPOL. For other chains, use getOfferPaymentToken,
   * which is the wrapped native asset for the chain.
   * @param chain The chain to get the token address for
   * @returns The token address for wrap/unwrap operations
   */
  public getNativeWrapTokenAddress(chain: Chain): string {
    switch (chain) {
      case Chain.Polygon:
        return WPOL_ADDRESS;
      default:
        return getOfferPaymentToken(chain);
    }
  }

  /**
   * Wrap native asset into wrapped native asset (e.g. ETH into WETH, POL into WPOL).
   * Wrapped native assets are needed for making offers.
   * @param options
   * @param options.amountInEth Amount of native asset to wrap
   * @param options.accountAddress Address of the user's wallet containing the native asset
   */
  public async wrapEth({
    amountInEth,
    accountAddress,
  }: {
    amountInEth: BigNumberish;
    accountAddress: string;
  }) {
    return this._tokensManager.wrapEth({ amountInEth, accountAddress });
  }

  /**
   * Unwrap wrapped native asset into native asset (e.g. WETH into ETH, WPOL into POL).
   * Emits the `UnwrapWeth` event when the transaction is prompted.
   * @param options
   * @param options.amountInEth How much wrapped native asset to unwrap
   * @param options.accountAddress Address of the user's wallet containing the wrapped native asset
   */
  public async unwrapWeth({
    amountInEth,
    accountAddress,
  }: {
    amountInEth: BigNumberish;
    accountAddress: string;
  }) {
    return this._tokensManager.unwrapWeth({ amountInEth, accountAddress });
  }

  /**
   * Create and submit an offer on an asset.
   * @param options
   * @param options.asset The asset to trade. tokenAddress and tokenId must be defined.
   * @param options.accountAddress Address of the wallet making the offer.
   * @param options.startAmount Value of the offer in units, not base units e.g. not wei, of the payment token (or WETH if no payment token address specified)
   * @param options.quantity The number of assets to bid for (if fungible or semi-fungible). Defaults to 1.
   * @param options.domain An optional domain to be hashed and included in the first four bytes of the random salt.
   * @param options.salt Arbitrary salt. If not passed in, a random salt will be generated with the first four bytes being the domain hash or empty.
   * @param options.expirationTime Expiration time for the order, in UTC seconds
   * @param options.paymentTokenAddress ERC20 address for the payment token in the order. If unspecified, defaults to WETH
   * @param options.zone The zone to use for the order. If unspecified, defaults to the chain's signed zone for order protection.
   *
   * @returns The {@link OrderV2} that was created.
   *
   * @throws Error if the asset does not contain a token id.
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the startAmount is not greater than 0.
   * @throws Error if paymentTokenAddress is not WETH on anything other than Ethereum mainnet.
   */
  public async createOffer({
    asset,
    accountAddress,
    startAmount,
    quantity = 1,
    domain,
    salt,
    expirationTime,
    paymentTokenAddress,
    zone,
  }: {
    asset: AssetWithTokenId;
    accountAddress: string;
    startAmount: BigNumberish;
    quantity?: BigNumberish;
    domain?: string;
    salt?: BigNumberish;
    expirationTime?: BigNumberish;
    paymentTokenAddress?: string;
    zone?: string;
  }): Promise<OrderV2> {
    return this._ordersManager.createOffer({
      asset,
      accountAddress,
      startAmount,
      quantity,
      domain,
      salt,
      expirationTime,
      paymentTokenAddress,
      zone,
    });
  }

  /**
   * Create and submit a listing for an asset.
   * @param options
   * @param options.asset The asset to trade. tokenAddress and tokenId must be defined.
   * @param options.accountAddress  Address of the wallet making the listing
   * @param options.startAmount Value of the listing at the start of the auction in units, not base units e.g. not wei, of the payment token (or WETH if no payment token address specified)
   * @param options.endAmount Value of the listing at the end of the auction. If specified, price will change linearly between startAmount and endAmount as time progresses.
   * @param options.quantity The number of assets to list (if fungible or semi-fungible). Defaults to 1.
   * @param options.domain An optional domain to be hashed and included in the first four bytes of the random salt. This can be used for on-chain order attribution to assist with analytics.
   * @param options.salt Arbitrary salt. If not passed in, a random salt will be generated with the first four bytes being the domain hash or empty.
   * @param options.listingTime Optional time when the order will become fulfillable, in UTC seconds. Undefined means it will start now.
   * @param options.expirationTime Expiration time for the order, in UTC seconds.
   * @param options.paymentTokenAddress ERC20 address for the payment token in the order. If unspecified, defaults to ETH
   * @param options.buyerAddress Optional address that's allowed to purchase this item. If specified, no other address will be able to take the order, unless its value is the null address.
   * @param options.englishAuction If true, the order will be listed as an English auction.
   * @param options.includeOptionalCreatorFees If true, optional creator fees will be included in the listing. Default: false.
   * @param options.zone The zone to use for the order. For order protection, pass SIGNED_ZONE. If unspecified, defaults to no zone.
   * @returns The {@link OrderV2} that was created.
   *
   * @throws Error if the asset does not contain a token id.
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the startAmount is not greater than 0.
   * @throws Error if paymentTokenAddress is not WETH on anything other than Ethereum mainnet.
   */
  public async createListing({
    asset,
    accountAddress,
    startAmount,
    endAmount,
    quantity = 1,
    domain,
    salt,
    listingTime,
    expirationTime,
    paymentTokenAddress,
    buyerAddress,
    englishAuction,
    includeOptionalCreatorFees = false,
    zone,
  }: {
    asset: AssetWithTokenId;
    accountAddress: string;
    startAmount: BigNumberish;
    endAmount?: BigNumberish;
    quantity?: BigNumberish;
    domain?: string;
    salt?: BigNumberish;
    listingTime?: number;
    expirationTime?: number;
    paymentTokenAddress?: string;
    buyerAddress?: string;
    englishAuction?: boolean;
    includeOptionalCreatorFees?: boolean;
    zone?: string;
  }): Promise<OrderV2> {
    return this._ordersManager.createListing({
      asset,
      accountAddress,
      startAmount,
      endAmount,
      quantity,
      domain,
      salt,
      listingTime,
      expirationTime,
      paymentTokenAddress,
      buyerAddress,
      englishAuction,
      includeOptionalCreatorFees,
      zone,
    });
  }

  /**
   * Create and submit a collection offer.
   * @param options
   * @param options.collectionSlug Identifier for the collection.
   * @param options.accountAddress Address of the wallet making the offer.
   * @param options.amount Value of the offer in units, not base units e.g. not wei, of the payment token (or WETH if no payment token address specified).
   * @param options.quantity The number of assets to bid for (if fungible or semi-fungible).
   * @param options.domain An optional domain to be hashed and included in the first four bytes of the random salt. This can be used for on-chain order attribution to assist with analytics.
   * @param options.salt Arbitrary salt. If not passed in, a random salt will be generated with the first four bytes being the domain hash or empty.
   * @param options.expirationTime Expiration time for the order, in UTC seconds.
   * @param options.paymentTokenAddress ERC20 address for the payment token in the order. If unspecified, defaults to WETH.
   * @param options.offerProtectionEnabled Build the offer on OpenSea's signed zone to provide offer protections from receiving an item which is disabled from trading.
   * @param options.traitType If defined, the trait name to create the collection offer for.
   * @param options.traitValue If defined, the trait value to create the collection offer for.
   * @returns The {@link CollectionOffer} that was created.
   */
  public async createCollectionOffer({
    collectionSlug,
    accountAddress,
    amount,
    quantity,
    domain,
    salt,
    expirationTime,
    paymentTokenAddress,
    offerProtectionEnabled = true,
    traitType,
    traitValue,
  }: {
    collectionSlug: string;
    accountAddress: string;
    amount: BigNumberish;
    quantity: number;
    domain?: string;
    salt?: BigNumberish;
    expirationTime?: number | string;
    paymentTokenAddress: string;
    offerProtectionEnabled?: boolean;
    traitType?: string;
    traitValue?: string;
  }): Promise<CollectionOffer | null> {
    return this._ordersManager.createCollectionOffer({
      collectionSlug,
      accountAddress,
      amount,
      quantity,
      domain,
      salt,
      expirationTime,
      paymentTokenAddress,
      offerProtectionEnabled,
      traitType,
      traitValue,
    });
  }

  /**
   * Fulfill an order for an asset. The order can be either a listing or an offer.
   * @param options
   * @param options.order The order to fulfill, a.k.a. "take"
   * @param options.accountAddress Address of the wallet taking the offer.
   * @param options.recipientAddress The optional address to receive the order's item(s) or currencies. If not specified, defaults to accountAddress.
   * @param options.domain An optional domain to be hashed and included at the end of fulfillment calldata.  This can be used for on-chain order attribution to assist with analytics.
   * @param options.assetContractAddress Optional address of the NFT contract for criteria offers (e.g., collection offers). Required when fulfilling collection offers.
   * @param options.tokenId Optional token ID for criteria offers (e.g., collection offers). Required when fulfilling collection offers.
   * @param options.overrides Transaction overrides, ignored if not set.
   * @returns Transaction hash of the order.
   *
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the order's protocol address is not supported by OpenSea. See {@link isValidProtocol}.
   * @throws Error if attempting to fulfill the order with a recipient address which does not match a private listing.
   */
  public async fulfillOrder({
    order,
    accountAddress,
    recipientAddress,
    unitsToFill,
    domain,
    assetContractAddress,
    tokenId,
    overrides,
  }: {
    order: OrderV2 | Order | Listing | Offer;
    accountAddress: string;
    recipientAddress?: string;
    unitsToFill?: BigNumberish;
    domain?: string;
    assetContractAddress?: string;
    tokenId?: string;
    overrides?: Overrides;
  }): Promise<string> {
    return this._fulfillmentManager.fulfillOrder({
      order,
      accountAddress,
      recipientAddress,
      unitsToFill,
      domain,
      assetContractAddress,
      tokenId,
      overrides,
    });
  }

  /**
   * Cancel multiple orders onchain, preventing them from being fulfilled.
   * This method accepts either full OrderV2 objects, OrderComponents, or order hashes with protocol address.
   *
   * **Event Behavior**: For backwards compatibility with the singular `cancelOrder` method,
   * this method dispatches a `CancelOrder` event for the first order only, and only when
   * an OrderV2 object is available (either provided directly or fetched via orderHashes).
   * No event is dispatched when using OrderComponents directly, as they lack the full order data.
   *
   * @param options
   * @param options.orders Array of orders to cancel. Can be OrderV2 objects or OrderComponents.
   * @param options.orderHashes Optional array of order hashes to cancel. Must provide protocolAddress if using this.
   * @param options.accountAddress The account address cancelling the orders.
   * @param options.protocolAddress Required when using orderHashes. The Seaport protocol address for the orders.
   * @param options.domain An optional domain to be hashed and included at the end of fulfillment calldata.
   * @param options.overrides Transaction overrides, ignored if not set.
   * @returns Transaction hash of the cancellation.
   *
   * @throws Error if orderHashes is provided without protocolAddress.
   * @throws Error if neither orders nor orderHashes is provided.
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the order's protocol address is not supported by OpenSea. See {@link isValidProtocol}.
   */
  public async cancelOrders({
    orders,
    orderHashes,
    accountAddress,
    protocolAddress,
    domain,
    overrides,
  }: {
    orders?: Array<OrderV2 | OrderComponents>;
    orderHashes?: string[];
    accountAddress: string;
    protocolAddress?: string;
    domain?: string;
    overrides?: Overrides;
  }): Promise<string> {
    return this._cancellationManager.cancelOrders({
      orders,
      orderHashes,
      accountAddress,
      protocolAddress,
      domain,
      overrides,
    });
  }

  /**
   * Cancel an order onchain, preventing it from ever being fulfilled.
   * This method accepts either a full OrderV2 object or an order hash with protocol address.
   *
   * @param options
   * @param options.order The order to cancel (OrderV2 object)
   * @param options.orderHash Optional order hash to cancel. Must provide protocolAddress if using this.
   * @param options.accountAddress The account address that will be cancelling the order.
   * @param options.protocolAddress Required when using orderHash. The Seaport protocol address for the order.
   * @param options.domain An optional domain to be hashed and included at the end of fulfillment calldata.  This can be used for on-chain order attribution to assist with analytics.
   *
   * @throws Error if neither order nor orderHash is provided.
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the order's protocol address is not supported by OpenSea. See {@link isValidProtocol}.
   *
   * @example
   * // Cancel using OrderV2 object
   * await sdk.cancelOrder({
   *   order: orderV2Object,
   *   accountAddress: "0x..."
   * });
   *
   * @example
   * // Cancel using order hash
   * await sdk.cancelOrder({
   *   orderHash: "0x123...",
   *   protocolAddress: "0xabc...",
   *   accountAddress: "0x..."
   * });
   */
  public async cancelOrder({
    order,
    orderHash,
    accountAddress,
    protocolAddress,
    domain,
  }: {
    order?: OrderV2;
    orderHash?: string;
    accountAddress: string;
    protocolAddress?: string;
    domain?: string;
  }) {
    return this._cancellationManager.cancelOrder({
      order,
      orderHash,
      accountAddress,
      protocolAddress,
      domain,
    });
  }

  /**
   * Offchain cancel an order, offer or listing, by its order hash when protected by the SignedZone.
   * Protocol and Chain are required to prevent hash collisions.
   * Please note cancellation is only assured if a fulfillment signature was not vended prior to cancellation.
   * @param protocolAddress The Seaport address for the order.
   * @param orderHash The order hash, or external identifier, of the order.
   * @param chain The chain where the order is located.
   * @param offererSignature An EIP-712 signature from the offerer of the order.
   *                         If this is not provided, the API key used to initialize the SDK must belong to the order's offerer.
   *                         The signature must be a EIP-712 signature consisting of the order's Seaport contract's
   *                         name, version, address, and chain. The struct to sign is `OrderHash` containing a
   *                         single bytes32 field.
   * @param useSignerToDeriveOffererSignature Derive the offererSignature from the Ethers signer passed into this sdk.
   * @returns The response from the API.
   */
  public async offchainCancelOrder(
    protocolAddress: string,
    orderHash: string,
    chain: Chain = this.chain,
    offererSignature?: string,
    useSignerToDeriveOffererSignature?: boolean,
  ) {
    return this._cancellationManager.offchainCancelOrder(
      protocolAddress,
      orderHash,
      chain,
      offererSignature,
      useSignerToDeriveOffererSignature,
    );
  }

  /**
   * Returns whether an order is fulfillable.
   * An order may not be fulfillable if a target item's transfer function
   * is locked for some reason, e.g. an item is being rented within a game
   * or trading has been locked for an item type.
   * @param options
   * @param options.order Order to check
   * @param options.accountAddress The account address that will be fulfilling the order
   * @returns True if the order is fulfillable, else False.
   *
   * @throws Error if the order's protocol address is not supported by OpenSea. See {@link isValidProtocol}.
   */
  public async isOrderFulfillable({
    order,
    accountAddress,
  }: {
    order: OrderV2;
    accountAddress: string;
  }): Promise<boolean> {
    return this._fulfillmentManager.isOrderFulfillable({
      order,
      accountAddress,
    });
  }

  /**
   * Get an account's balance of any Asset. This asset can be an ERC20, ERC1155, or ERC721.
   * @param options
   * @param options.accountAddress Account address to check
   * @param options.asset The Asset to check balance for. tokenStandard must be set.
   * @returns The balance of the asset for the account.
   *
   * @throws Error if the token standard does not support balanceOf.
   */
  public async getBalance({
    accountAddress,
    asset,
  }: {
    accountAddress: string;
    asset: AssetWithTokenStandard;
  }): Promise<bigint> {
    return this._assetsManager.getBalance({ accountAddress, asset });
  }

  /**
   * Transfer an asset. This asset can be an ERC20, ERC1155, or ERC721.
   * @param options
   * @param options.asset The Asset to transfer. tokenStandard must be set.
   * @param options.amount Amount of asset to transfer. Not used for ERC721.
   * @param options.fromAddress The address to transfer from
   * @param options.toAddress The address to transfer to
   * @param options.overrides Transaction overrides, ignored if not set.
   */
  public async transfer({
    asset,
    amount,
    fromAddress,
    toAddress,
    overrides,
  }: {
    asset: AssetWithTokenStandard;
    amount?: BigNumberish;
    fromAddress: string;
    toAddress: string;
    overrides?: Overrides;
  }): Promise<void> {
    return this._assetsManager.transfer({
      asset,
      amount,
      fromAddress,
      toAddress,
      overrides,
    });
  }

  /**
   * Bulk transfer multiple assets using OpenSea's TransferHelper contract.
   * This method is more gas-efficient than calling transfer() multiple times.
   * Note: All assets must be approved for transfer to the OpenSea conduit before calling this method.
   * @param options
   * @param options.assets Array of assets to transfer. Each asset must have tokenStandard set.
   * @param options.fromAddress The address to transfer from
   * @param options.overrides Transaction overrides, ignored if not set.
   * @returns Transaction hash of the bulk transfer
   *
   * @throws Error if any asset is missing required fields (tokenId for NFTs, amount for ERC20/ERC1155).
   * @throws Error if any asset is not approved for transfer to the OpenSea conduit.
   * @throws Error if the fromAddress is not available through wallet or provider.
   */
  public async bulkTransfer({
    assets,
    fromAddress,
    overrides,
  }: {
    assets: Array<{
      asset: AssetWithTokenStandard;
      toAddress: string;
      amount?: BigNumberish;
    }>;
    fromAddress: string;
    overrides?: Overrides;
  }): Promise<string> {
    return this._assetsManager.bulkTransfer({
      assets,
      fromAddress,
      overrides,
    });
  }

  /**
   * Batch approve multiple assets for transfer to the OpenSea conduit.
   * This method checks which assets need approval and batches them efficiently:
   * - 0 approvals needed: Returns early
   * - 1 approval needed: Sends single transaction
   * - 2+ approvals needed: Uses Multicall3 to batch all approvals in one transaction
   *
   * @param options
   * @param options.assets Array of assets to approve for transfer
   * @param options.fromAddress The address that owns the assets
   * @param options.overrides Transaction overrides, ignored if not set.
   * @returns Transaction hash of the approval transaction, or undefined if no approvals needed
   *
   * @throws Error if the fromAddress is not available through wallet or provider.
   */
  public async batchApproveAssets({
    assets,
    fromAddress,
    overrides,
  }: {
    assets: Array<{
      asset: AssetWithTokenStandard;
      amount?: BigNumberish;
    }>;
    fromAddress: string;
    overrides?: Overrides;
  }): Promise<string | undefined> {
    return this._assetsManager.batchApproveAssets({
      assets,
      fromAddress,
      overrides,
    });
  }

  /**
   * Instead of signing an off-chain order, this methods allows you to approve an order
   * with an on-chain transaction.
   * @param order Order to approve
   * @param domain An optional domain to be hashed and included at the end of fulfillment calldata.  This can be used for on-chain order attribution to assist with analytics.
   * @returns Transaction hash of the approval transaction
   *
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the order's protocol address is not supported by OpenSea. See {@link isValidProtocol}.
   */
  public async approveOrder(order: OrderV2, domain?: string) {
    return this._fulfillmentManager.approveOrder(order, domain);
  }

  /**
   * Validates an order onchain using Seaport's validate() method. This submits the order onchain
   * and pre-validates the order using Seaport, which makes it cheaper to fulfill since a signature
   * is not needed to be verified during fulfillment for the order, but is not strictly required
   * and the alternative is orders can be submitted to the API for free instead of sent onchain.
   * @param orderComponents Order components to validate onchain
   * @param accountAddress Address of the wallet that will pay the gas to validate the order
   * @returns Transaction hash of the validation transaction
   *
   * @throws Error if the accountAddress is not available through wallet or provider.
   */
  public async validateOrderOnchain(
    orderComponents: OrderComponents,
    accountAddress: string,
  ) {
    return this._fulfillmentManager.validateOrderOnchain(
      orderComponents,
      accountAddress,
    );
  }

  /**
   * Create and validate a listing onchain using Seaport's validate() method. This combines
   * order building with onchain validation in a single call.
   * @param options Listing parameters
   * @returns Transaction hash of the validation transaction
   */
  public async createListingAndValidateOnchain({
    asset,
    accountAddress,
    startAmount,
    endAmount,
    quantity = 1,
    domain,
    salt,
    listingTime,
    expirationTime,
    paymentTokenAddress,
    buyerAddress,
    englishAuction,
    includeOptionalCreatorFees = false,
    zone,
  }: {
    asset: AssetWithTokenId;
    accountAddress: string;
    startAmount: BigNumberish;
    endAmount?: BigNumberish;
    quantity?: BigNumberish;
    domain?: string;
    salt?: BigNumberish;
    listingTime?: number;
    expirationTime?: number;
    paymentTokenAddress?: string;
    buyerAddress?: string;
    englishAuction?: boolean;
    includeOptionalCreatorFees?: boolean;
    zone?: string;
  }): Promise<string> {
    return this._fulfillmentManager.createListingAndValidateOnchain({
      asset,
      accountAddress,
      startAmount,
      endAmount,
      quantity,
      domain,
      salt,
      listingTime,
      expirationTime,
      paymentTokenAddress,
      buyerAddress,
      englishAuction,
      includeOptionalCreatorFees,
      zone,
    });
  }

  /**
   * Create and validate an offer onchain using Seaport's validate() method. This combines
   * order building with onchain validation in a single call.
   * @param options Offer parameters
   * @returns Transaction hash of the validation transaction
   */
  public async createOfferAndValidateOnchain({
    asset,
    accountAddress,
    startAmount,
    quantity = 1,
    domain,
    salt,
    expirationTime,
    paymentTokenAddress,
    zone,
  }: {
    asset: AssetWithTokenId;
    accountAddress: string;
    startAmount: BigNumberish;
    quantity?: BigNumberish;
    domain?: string;
    salt?: BigNumberish;
    expirationTime?: BigNumberish;
    paymentTokenAddress?: string;
    zone?: string;
  }): Promise<string> {
    return this._fulfillmentManager.createOfferAndValidateOnchain({
      asset,
      accountAddress,
      startAmount,
      quantity,
      domain,
      salt,
      expirationTime,
      paymentTokenAddress,
      zone,
    });
  }

  /**
   * Compute the `basePrice` and `endPrice` parameters to be used to price an order.
   * Also validates the expiration time and auction type.
   * @param tokenAddress Address of the ERC-20 token to use for trading. Use the null address for ETH.
   * @param expirationTime When the auction expires, or 0 if never.
   * @param startAmount The base value for the order, in the token's main units (e.g. ETH instead of wei)
   * @param endAmount The end value for the order, in the token's main units (e.g. ETH instead of wei)
   */
  private async _getPriceParameters(
    orderSide: OrderSide,
    tokenAddress: string,
    expirationTime: BigNumberish,
    startAmount: BigNumberish,
    endAmount?: BigNumberish,
  ) {
    tokenAddress = tokenAddress.toLowerCase();
    const isEther = tokenAddress === ethers.ZeroAddress;
    let decimals = 18;
    if (!isEther) {
      if (tokenAddress in this._cachedPaymentTokenDecimals) {
        decimals = this._cachedPaymentTokenDecimals[tokenAddress];
      } else {
        const paymentToken = await this.api.getPaymentToken(tokenAddress);
        this._cachedPaymentTokenDecimals[tokenAddress] = paymentToken.decimals;
        decimals = paymentToken.decimals;
      }
    }

    const startAmountWei = ethers.parseUnits(startAmount.toString(), decimals);
    const endAmountWei = endAmount
      ? ethers.parseUnits(endAmount.toString(), decimals)
      : undefined;
    const priceDiffWei =
      endAmountWei !== undefined ? startAmountWei - endAmountWei : 0n;

    const basePrice = startAmountWei;
    const endPrice = endAmountWei;

    // Validation
    if (startAmount == null || startAmountWei < 0) {
      throw new Error("Starting price must be a number >= 0");
    }
    if (isEther && orderSide === OrderSide.OFFER) {
      throw new Error("Offers must use wrapped ETH or an ERC-20 token.");
    }
    if (priceDiffWei < 0) {
      throw new Error(
        "End price must be less than or equal to the start price.",
      );
    }
    if (priceDiffWei > 0 && BigInt(expirationTime) === 0n) {
      throw new Error(
        "Expiration time must be set if order will change in price.",
      );
    }
    return { basePrice, endPrice };
  }

  private _dispatch(event: EventType, data: EventData) {
    this._emitter.emit(event, data);
  }

  /** Get the accounts available from the signer or provider. */
  private async _getAvailableAccounts() {
    const availableAccounts: string[] = [];

    if ("address" in this._signerOrProvider) {
      availableAccounts.push(this._signerOrProvider.address as string);
    } else if ("listAccounts" in this._signerOrProvider) {
      const addresses = (await this._signerOrProvider.listAccounts()).map(
        (acct) => acct.address,
      );
      availableAccounts.push(...addresses);
    } else if ("getAddress" in this._signerOrProvider) {
      availableAccounts.push(await this._signerOrProvider.getAddress());
    }

    return availableAccounts;
  }

  /**
   * Throws an error if an account is not available through the provider.
   * @param accountAddress The account address to check is available.
   */
  private async _requireAccountIsAvailable(accountAddress: string) {
    const accountAddressChecksummed = ethers.getAddress(accountAddress);
    const availableAccounts = await this._getAvailableAccounts();

    if (availableAccounts.includes(accountAddressChecksummed)) {
      return;
    }

    throw new Error(
      `Specified accountAddress is not available through wallet or provider: ${accountAddressChecksummed}. Accounts available: ${
        availableAccounts.length > 0 ? availableAccounts.join(", ") : "none"
      }`,
    );
  }

  /**
   * Wait for a transaction to confirm and log the success or failure.
   * @param transactionHash The transaction hash to wait for.
   * @param event The event type to log.
   * @param description The description of the transaction.
   */
  private async _confirmTransaction(
    transactionHash: string,
    event: EventType,
    description: string,
  ): Promise<void> {
    const transactionEventData = { transactionHash, event };
    this.logger(`Transaction started: ${description}`);

    try {
      this._dispatch(EventType.TransactionCreated, transactionEventData);
      await this.provider.waitForTransaction(transactionHash);
      this.logger(`Transaction succeeded: ${description}`);
      this._dispatch(EventType.TransactionConfirmed, transactionEventData);
    } catch (error) {
      this.logger(`Transaction failed: ${description}`);
      this._dispatch(EventType.TransactionFailed, {
        ...transactionEventData,
        error,
      });
      throw error;
    }
  }
}
