import EventEmitter = require("events");
import { Seaport } from "@opensea/seaport-js";
import { OPENSEA_CONDUIT_KEY } from "@opensea/seaport-js/lib/constants";
import {
  AdvancedOrder,
  ConsiderationInputItem,
  CreateInputItem,
  OrderComponents,
} from "@opensea/seaport-js/lib/types";
import {
  BigNumber,
  BigNumberish,
  Contract,
  FixedNumber,
  Wallet,
  ethers,
  providers,
} from "ethers";
import { parseEther } from "ethers/lib/utils";
import { OpenSeaAPI } from "./api/api";
import { Offer, NFT } from "./api/types";
import {
  INVERSE_BASIS_POINT,
  DEFAULT_ZONE,
  ENGLISH_AUCTION_ZONE,
} from "./constants";
import {
  constructPrivateListingCounterOrder,
  getPrivateListingConsiderations,
  getPrivateListingFulfillments,
} from "./orders/privateListings";
import { OrderV2 } from "./orders/types";
import { DEFAULT_SEAPORT_CONTRACT_ADDRESS } from "./orders/utils";
import {
  ERC1155__factory,
  ERC20__factory,
  ERC721__factory,
} from "./typechain/contracts";
import {
  Asset,
  ComputedFees,
  EventData,
  EventType,
  Chain,
  OpenSeaAPIConfig,
  OpenSeaAsset,
  OpenSeaCollection,
  OrderSide,
  TokenStandard,
  OpenSeaFungibleToken,
} from "./types";
import {
  delay,
  getMaxOrderExpirationTimestamp,
  hasErrorCode,
  getAssetItemType,
  getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress,
  feesToBasisPoints,
  requireValidProtocol,
  getWETHAddress,
} from "./utils/utils";

/**
 * The OpenSea SDK main class.
 * @category Main Classes
 */
export class OpenSeaSDK {
  /** Provider to use for transactions. */
  public provider: providers.JsonRpcProvider;
  /** Seaport v1.5 client  @see {@link https://github.com/ProjectOpenSea/seaport}*/
  public seaport_v1_5: Seaport;
  /** Logger function to use when debugging */
  public logger: (arg: string) => void;
  /** API instance */
  public readonly api: OpenSeaAPI;
  /** The configured chain */
  public readonly chain: Chain;

  private _emitter: EventEmitter;
  private _signerOrProvider: Wallet | providers.JsonRpcProvider;

  /**
   * Create a new instance of OpenSeaJS.
   * @param provider Provider to use for transactions. For example:
   *  `const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io')`
   * @param apiConfig configuration options, including `chain`
   * @param logger function that will be called with debugging
   * @param wallet ethers wallet for order posting
   *  information
   */
  constructor(
    provider: providers.JsonRpcProvider,
    apiConfig: OpenSeaAPIConfig = {},
    logger?: (arg: string) => void,
    wallet?: Wallet,
  ) {
    // API config
    apiConfig.chain ??= Chain.Mainnet;
    this.chain = apiConfig.chain;
    this.api = new OpenSeaAPI(apiConfig);

    this.provider = provider;
    this._signerOrProvider = wallet ?? this.provider;

    this.seaport_v1_5 = new Seaport(this._signerOrProvider, {
      overrides: { defaultConduitKey: OPENSEA_CONDUIT_KEY },
    });

    // Emit events
    this._emitter = new EventEmitter();

    // Logger: default to no logging if fn not provided
    this.logger = logger ?? ((arg: string) => arg);
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
   * Wrap ETH into WETH.
   * W-ETH is needed for placing buy orders (making offers).
   * @param options
   * @param options.amountInEth Amount of ether to wrap
   * @param options.accountAddress Address of the user's wallet containing the ether
   */
  public async wrapEth({
    amountInEth,
    accountAddress,
  }: {
    amountInEth: BigNumberish;
    accountAddress: string;
  }) {
    await this._requireAccountIsAvailable(accountAddress);

    const value = parseEther(FixedNumber.from(amountInEth).toString());

    this._dispatch(EventType.WrapEth, { accountAddress, amount: value });

    const wethContract = new Contract(
      getWETHAddress(this.chain),
      ["function deposit() payable"],
      this._signerOrProvider,
    );

    wethContract.connect(this.provider);
    try {
      const transaction = await wethContract.deposit({ value });
      await this._confirmTransaction(
        transaction.hash,
        EventType.WrapEth,
        "Wrapping ETH",
      );
    } catch (error) {
      console.error(error);
      this._dispatch(EventType.TransactionDenied, { error, accountAddress });
    }
  }

  /**
   * Unwrap WETH into ETH.
   * Emits the `UnwrapWeth` event when the transaction is prompted.
   * @param options
   * @param options.amountInEth How much WETH to unwrap
   * @param options.accountAddress Address of the user's wallet containing the WETH
   */
  public async unwrapWeth({
    amountInEth,
    accountAddress,
  }: {
    amountInEth: BigNumberish;
    accountAddress: string;
  }) {
    await this._requireAccountIsAvailable(accountAddress);

    const amount = parseEther(FixedNumber.from(amountInEth).toString());

    this._dispatch(EventType.UnwrapWeth, { accountAddress, amount });

    const wethContract = new Contract(
      getWETHAddress(this.chain),
      ["function withdraw(uint wad) public"],
      this._signerOrProvider,
    );

    wethContract.connect(this.provider);
    try {
      const transaction = await wethContract.withdraw(amount);
      await this._confirmTransaction(
        transaction.hash,
        EventType.UnwrapWeth,
        "Unwrapping W-ETH",
      );
    } catch (error) {
      console.error(error);
      this._dispatch(EventType.TransactionDenied, { error, accountAddress });
    }
  }

  private getAmountWithBasisPointsApplied = (
    amount: BigNumber,
    basisPoints: number,
  ): string => {
    return amount.mul(basisPoints).div(INVERSE_BASIS_POINT).toString();
  };

  private async getFees({
    collection,
    paymentTokenAddress,
    startAmount,
    endAmount,
  }: {
    collection: OpenSeaCollection;
    paymentTokenAddress: string;
    startAmount: BigNumber;
    endAmount?: BigNumber;
  }): Promise<{
    sellerFee: ConsiderationInputItem;
    openseaSellerFees: ConsiderationInputItem[];
    collectionSellerFees: ConsiderationInputItem[];
  }> {
    // Seller fee basis points
    const osFees = collection.fees?.openseaFees;
    const creatorFees = collection.fees?.sellerFees;

    const openseaSellerFeeBasisPoints = feesToBasisPoints(osFees);
    const collectionSellerFeeBasisPoints = feesToBasisPoints(creatorFees);

    // Seller basis points
    const sellerBasisPoints =
      INVERSE_BASIS_POINT -
      openseaSellerFeeBasisPoints -
      collectionSellerFeeBasisPoints;

    const getConsiderationItem = (basisPoints: number, recipient?: string) => {
      return {
        token: paymentTokenAddress,
        amount: this.getAmountWithBasisPointsApplied(startAmount, basisPoints),
        endAmount: this.getAmountWithBasisPointsApplied(
          endAmount ?? startAmount,
          basisPoints,
        ),
        recipient,
      };
    };

    const getConsiderationItemsFromFeeCategory = (
      feeCategory: Map<string, number>,
    ): ConsiderationInputItem[] => {
      return Array.from(feeCategory.entries()).map(
        ([recipient, basisPoints]) => {
          return getConsiderationItem(basisPoints, recipient);
        },
      );
    };

    return {
      sellerFee: getConsiderationItem(sellerBasisPoints),
      openseaSellerFees:
        openseaSellerFeeBasisPoints > 0 && collection.fees
          ? getConsiderationItemsFromFeeCategory(osFees)
          : [],
      collectionSellerFees:
        collectionSellerFeeBasisPoints > 0 && collection.fees
          ? getConsiderationItemsFromFeeCategory(creatorFees)
          : [],
    };
  }

  private getNFTItems(
    nfts: NFT[],
    quantities: BigNumber[] = [],
  ): CreateInputItem[] {
    return nfts.map((nft, index) => ({
      itemType: getAssetItemType(
        nft.token_standard.toUpperCase() as TokenStandard,
      ),
      token:
        getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress(
          nft.contract,
        ),
      identifier: nft.identifier ?? undefined,
      amount: quantities[index].toString() ?? "1",
    }));
  }

  /**
   * Create a buy order to make an offer on an asset.
   * @param options
   * @param options.asset The asset to trade
   * @param options.accountAddress Address of the wallet making the buy order
   * @param options.startAmount Value of the offer in units, not base units e.g. not wei, of the payment token (or WETH if no payment token address specified)
   * @param options.quantity The number of assets to bid for (if fungible or semi-fungible). Defaults to 1.
   * @param options.domain An optional domain to be hashed and included in the first four bytes of the random salt.
   * @param options.salt Arbitrary salt. If not passed in, a random salt will be generated with the first four bytes being the domain hash or empty.
   * @param options.expirationTime Expiration time for the order, in UTC seconds
   * @param options.paymentTokenAddress ERC20 address for the payment token in the order. If unspecified, defaults to WETH
   * @returns The {@link OrderV2} that was created.
   *
   * @throws Error if the asset does not contain a token id.
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the startAmount is not greater than 0.
   * @throws Error if paymentTokenAddress is not WETH on anything other than Ethereum mainnet.
   */
  public async createBuyOrder({
    asset,
    accountAddress,
    startAmount,
    quantity = 1,
    domain,
    salt,
    expirationTime,
    paymentTokenAddress,
  }: {
    asset: Asset;
    accountAddress: string;
    startAmount: BigNumberish;
    quantity?: BigNumberish;
    domain?: string;
    salt?: BigNumberish;
    expirationTime?: BigNumberish;
    paymentTokenAddress?: string;
  }): Promise<OrderV2> {
    await this._requireAccountIsAvailable(accountAddress);

    if (!asset.tokenId) {
      throw new Error("Asset must have a tokenId");
    }
    paymentTokenAddress = paymentTokenAddress ?? getWETHAddress(this.chain);

    const { nft } = await this.api.getNFT(
      this.chain,
      asset.tokenAddress,
      asset.tokenId,
    );
    const considerationAssetItems = this.getNFTItems(
      [nft],
      [BigNumber.from(quantity ?? 1)],
    );

    const { basePrice } = await this._getPriceParameters(
      OrderSide.Buy,
      paymentTokenAddress,
      expirationTime ?? getMaxOrderExpirationTimestamp(),
      startAmount,
    );

    const collection = await this.api.getCollection(nft.collection);

    const { openseaSellerFees, collectionSellerFees } = await this.getFees({
      collection,
      paymentTokenAddress,
      startAmount: basePrice,
    });
    const considerationFeeItems = [
      ...openseaSellerFees,
      ...collectionSellerFees,
    ];

    const { executeAllActions } = await this.seaport_v1_5.createOrder(
      {
        offer: [
          {
            token: paymentTokenAddress,
            amount: basePrice.toString(),
          },
        ],
        consideration: [...considerationAssetItems, ...considerationFeeItems],
        endTime:
          expirationTime !== undefined
            ? BigNumber.from(expirationTime).toString()
            : getMaxOrderExpirationTimestamp().toString(),
        zone: DEFAULT_ZONE,
        domain,
        salt: BigNumber.from(salt ?? 0).toString(),
        restrictedByZone: false,
        allowPartialFills: true,
      },
      accountAddress,
    );
    const order = await executeAllActions();

    return this.api.postOrder(order, {
      protocol: "seaport",
      protocolAddress: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
      side: "bid",
    });
  }

  /**
   * Create a sell order to make a listing for a asset.
   * @param options
   * @param options.asset The asset to trade
   * @param options.accountAddress  Address of the wallet making the sell order
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
   * @returns The {@link OrderV2} that was created.
   *
   * @throws Error if the asset does not contain a token id.
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the startAmount is not greater than 0.
   * @throws Error if paymentTokenAddress is not WETH on anything other than Ethereum mainnet.
   */
  public async createSellOrder({
    asset,
    accountAddress,
    startAmount,
    endAmount,
    quantity = 1,
    domain,
    salt,
    listingTime,
    expirationTime,
    paymentTokenAddress = ethers.constants.AddressZero,
    buyerAddress,
    englishAuction,
  }: {
    asset: Asset;
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
  }): Promise<OrderV2> {
    await this._requireAccountIsAvailable(accountAddress);

    if (!asset.tokenId) {
      throw new Error("Asset must have a tokenId");
    }

    const { nft } = await this.api.getNFT(
      this.chain,
      asset.tokenAddress,
      asset.tokenId,
    );
    const offerAssetItems = this.getNFTItems(
      [nft],
      [BigNumber.from(quantity ?? 1)],
    );

    if (englishAuction && paymentTokenAddress == ethers.constants.AddressZero) {
      throw new Error(
        `English auctions must use wrapped ETH or an ERC-20 token.`,
      );
    }

    const { basePrice, endPrice } = await this._getPriceParameters(
      OrderSide.Sell,
      paymentTokenAddress,
      expirationTime ?? getMaxOrderExpirationTimestamp(),
      startAmount,
      endAmount ?? undefined,
    );

    const collection = await this.api.getCollection(nft.collection);

    const { sellerFee, openseaSellerFees, collectionSellerFees } =
      await this.getFees({
        collection,
        paymentTokenAddress,
        startAmount: basePrice,
        endAmount: endPrice,
      });
    const considerationFeeItems = [
      sellerFee,
      ...openseaSellerFees,
      ...collectionSellerFees,
    ];

    if (buyerAddress) {
      considerationFeeItems.push(
        ...getPrivateListingConsiderations(offerAssetItems, buyerAddress),
      );
    }

    const { executeAllActions } = await this.seaport_v1_5.createOrder(
      {
        offer: offerAssetItems,
        consideration: considerationFeeItems,
        startTime: listingTime?.toString(),
        endTime:
          expirationTime?.toString() ??
          getMaxOrderExpirationTimestamp().toString(),
        zone: englishAuction ? ENGLISH_AUCTION_ZONE : DEFAULT_ZONE,
        domain,
        salt: BigNumber.from(salt ?? 0).toString(),
        restrictedByZone: englishAuction ? true : false,
        allowPartialFills: englishAuction ? false : true,
      },
      accountAddress,
    );
    const order = await executeAllActions();

    return this.api.postOrder(order, {
      protocol: "seaport",
      protocolAddress: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
      side: "ask",
    });
  }

  /**
   * Create a offer (buy order) for a collection.
   * @param options
   * @param options.collectionSlug Identifier for the collection.
   * @param options.accountAddress Address of the wallet making the offer.
   * @param options.amount Value of the offer in units, not base units e.g. not wei, of the payment token (or WETH if no payment token address specified).
   * @param options.quantity The number of assets to bid for (if fungible or semi-fungible).
   * @param options.domain An optional domain to be hashed and included in the first four bytes of the random salt. This can be used for on-chain order attribution to assist with analytics.
   * @param options.salt Arbitrary salt. If not passed in, a random salt will be generated with the first four bytes being the domain hash or empty.
   * @param options.expirationTime Expiration time for the order, in UTC seconds.
   * @param options.paymentTokenAddress ERC20 address for the payment token in the order. If unspecified, defaults to WETH.
   * @returns The {@link Offer} that was created.
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
  }: {
    collectionSlug: string;
    accountAddress: string;
    amount: BigNumberish;
    quantity: number;
    domain?: string;
    salt?: BigNumberish;
    expirationTime?: number | string;
    paymentTokenAddress: string;
  }): Promise<Offer | null> {
    await this._requireAccountIsAvailable(accountAddress);

    const collection = await this.api.getCollection(collectionSlug);
    const buildOfferResult = await this.api.buildOffer(
      accountAddress,
      quantity,
      collectionSlug,
    );
    const item = buildOfferResult.partialParameters.consideration[0];
    const convertedConsiderationItem = {
      itemType: item.itemType,
      token: item.token,
      identifier: item.identifierOrCriteria,
      amount: item.startAmount,
    };

    const { basePrice } = await this._getPriceParameters(
      OrderSide.Buy,
      paymentTokenAddress,
      expirationTime ?? getMaxOrderExpirationTimestamp(),
      amount,
    );
    const { openseaSellerFees, collectionSellerFees } = await this.getFees({
      collection,
      paymentTokenAddress,
      startAmount: basePrice,
      endAmount: basePrice,
    });

    const considerationItems = [
      convertedConsiderationItem,
      ...openseaSellerFees,
      ...collectionSellerFees,
    ];

    const payload = {
      offerer: accountAddress,
      offer: [
        {
          token: paymentTokenAddress,
          amount: basePrice.toString(),
        },
      ],
      consideration: considerationItems,
      endTime:
        expirationTime?.toString() ??
        getMaxOrderExpirationTimestamp().toString(),
      zone: buildOfferResult.partialParameters.zone,
      domain,
      salt: BigNumber.from(salt ?? 0).toString(),
      restrictedByZone: true,
      allowPartialFills: true,
    };

    const { executeAllActions } = await this.seaport_v1_5.createOrder(
      payload,
      accountAddress,
    );
    const order = await executeAllActions();

    return this.api.postCollectionOffer(order, collectionSlug);
  }

  private async fulfillPrivateOrder({
    order,
    accountAddress,
    domain,
  }: {
    order: OrderV2;
    accountAddress: string;
    domain?: string;
  }): Promise<string> {
    if (!order.taker?.address) {
      throw new Error(
        "Order is not a private listing - must have a taker address",
      );
    }
    const counterOrder = constructPrivateListingCounterOrder(
      order.protocolData,
      order.taker.address,
    );
    const fulfillments = getPrivateListingFulfillments(order.protocolData);
    const transaction = await this.seaport_v1_5
      .matchOrders({
        orders: [order.protocolData, counterOrder],
        fulfillments,
        overrides: {
          value: counterOrder.parameters.offer[0].startAmount,
        },
        accountAddress,
        domain,
      })
      .transact();
    const transactionReceipt = await transaction.wait();

    await this._confirmTransaction(
      transactionReceipt.transactionHash,
      EventType.MatchOrders,
      "Fulfilling order",
    );
    return transactionReceipt.transactionHash;
  }

  /**
   * Fulfill or "take" an order for an asset. The order can be either a buy or sell order.
   * @param options
   * @param options.order The order to fulfill, a.k.a. "take"
   * @param options.accountAddress Address of the wallet taking the offer.
   * @param options.recipientAddress The optional address to receive the order's item(s) or curriencies. If not specified, defaults to accountAddress.
   * @param options.domain An optional domain to be hashed and included at the end of fulfillment calldata.  This can be used for on-chain order attribution to assist with analytics.
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
    domain,
  }: {
    order: OrderV2;
    accountAddress: string;
    recipientAddress?: string;
    domain?: string;
  }): Promise<string> {
    await this._requireAccountIsAvailable(accountAddress);
    requireValidProtocol(order.protocolAddress);

    let extraData: string | undefined = undefined;

    if (order.orderHash) {
      const result = await this.api.generateFulfillmentData(
        accountAddress,
        order.orderHash,
        order.protocolAddress,
        order.side,
      );

      // If the order is using offer protection, the extraData
      // must be included with the order to successfully fulfill.
      const inputData = result.fulfillment_data.transaction.input_data;
      if ("orders" in inputData && "extraData" in inputData.orders[0]) {
        extraData = (inputData.orders[0] as AdvancedOrder).extraData;
      }

      const signature = result.fulfillment_data.orders[0].signature;
      order.clientSignature = signature;
      order.protocolData.signature = signature;
    }

    const isPrivateListing = !!order.taker;
    if (isPrivateListing) {
      if (recipientAddress) {
        throw new Error(
          "Private listings cannot be fulfilled with a recipient address",
        );
      }
      return this.fulfillPrivateOrder({
        order,
        accountAddress,
        domain,
      });
    }

    const { executeAllActions } = await this.seaport_v1_5.fulfillOrder({
      order: order.protocolData,
      accountAddress,
      recipientAddress,
      extraData,
      domain,
    });
    const transaction = await executeAllActions();

    await this._confirmTransaction(
      transaction.hash,
      EventType.MatchOrders,
      "Fulfilling order",
    );
    return transaction.hash;
  }

  private async cancelSeaportOrders({
    orders,
    accountAddress,
    domain,
    protocolAddress,
  }: {
    orders: OrderComponents[];
    accountAddress: string;
    domain?: string;
    protocolAddress?: string;
  }): Promise<string> {
    if (!protocolAddress) {
      protocolAddress = DEFAULT_SEAPORT_CONTRACT_ADDRESS;
    }

    const transaction = await this.seaport_v1_5
      .cancelOrders(orders, accountAddress, domain)
      .transact();

    return transaction.hash;
  }

  /**
   * Cancel an order on-chain, preventing it from ever being fulfilled.
   * @param options
   * @param options.order The order to cancel
   * @param options.accountAddress The account address that will be cancelling the order.
   * @param options.domain An optional domain to be hashed and included at the end of fulfillment calldata.  This can be used for on-chain order attribution to assist with analytics.
   *
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the order's protocol address is not supported by OpenSea. See {@link isValidProtocol}.
   */
  public async cancelOrder({
    order,
    accountAddress,
    domain,
  }: {
    order: OrderV2;
    accountAddress: string;
    domain?: string;
  }) {
    await this._requireAccountIsAvailable(accountAddress);
    requireValidProtocol(order.protocolAddress);

    this._dispatch(EventType.CancelOrder, { orderV2: order, accountAddress });

    // Transact and get the transaction hash
    const transactionHash = await this.cancelSeaportOrders({
      orders: [order.protocolData.parameters],
      accountAddress,
      domain,
      protocolAddress: order.protocolAddress,
    });

    // Await transaction confirmation
    await this._confirmTransaction(
      transactionHash,
      EventType.CancelOrder,
      "Cancelling order",
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
    requireValidProtocol(order.protocolAddress);

    try {
      const isValid = await this.seaport_v1_5
        .validate([order.protocolData], accountAddress)
        .callStatic();
      return !!isValid;
    } catch (error) {
      if (hasErrorCode(error) && error.code === "CALL_EXCEPTION") {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get an account's balance of any Asset. This asset can be an ERC20, ERC1155, or ERC721.
   * @param options
   * @param options.accountAddress Account address to check
   * @param options.asset The Asset to check balance for. tokenStandard must be set.
   * @param retries How many times to retry if balance is 0. Defaults to 1.
   * @returns The balance of the asset for the account.
   *
   * @throws Error if the token standard does not support balanceOf.
   */
  public async getBalance(
    { accountAddress, asset }: { accountAddress: string; asset: Asset },
    retries = 1,
  ): Promise<BigNumber> {
    try {
      switch (asset.tokenStandard) {
        case TokenStandard.ERC20: {
          const contract = new ethers.Contract(
            asset.tokenAddress,
            ERC20__factory.createInterface(),
            this.provider,
          );
          return await contract.callStatic.balanceOf(accountAddress);
        }
        case TokenStandard.ERC1155: {
          const contract = new ethers.Contract(
            asset.tokenAddress,
            ERC1155__factory.createInterface(),
            this.provider,
          );
          return await contract.callStatic.balanceOf(
            accountAddress,
            asset.tokenId,
          );
        }
        case TokenStandard.ERC721: {
          const contract = new ethers.Contract(
            asset.tokenAddress,
            ERC721__factory.createInterface(),
            this.provider,
          );
          try {
            const owner = await contract.callStatic.ownerOf(asset.tokenId);
            return owner.toLowerCase() == accountAddress.toLowerCase()
              ? BigNumber.from(1)
              : BigNumber.from(0);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            this.logger(
              `Failed to get ownerOf ERC721: ${error.message ?? error}`,
            );
            return BigNumber.from(0);
          }
        }
        default:
          throw new Error("Unsupported token standard for getBalance");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (retries <= 0) {
        throw new Error(
          `Unable to get owner from smart contract: ${error.message ?? error}`,
        );
      } else {
        await delay(500);
        // Recursively check owner again
        return await this.getBalance({ accountAddress, asset }, retries - 1);
      }
    }
  }

  /**
   * Compute the fees for an order.
   * @param options
   * @param options.asset Asset to use for fees. May be blank ONLY for multi-collection bundles.
   * @returns The {@link ComputedFees} for the order.
   */
  public async computeFees({
    asset,
  }: {
    asset?: OpenSeaAsset;
  }): Promise<ComputedFees> {
    const openseaBuyerFeeBasisPoints = 0;
    let openseaSellerFeeBasisPoints = 0;
    const devBuyerFeeBasisPoints = 0;
    let devSellerFeeBasisPoints = 0;

    if (asset) {
      const fees = asset.collection.fees;
      openseaSellerFeeBasisPoints = +feesToBasisPoints(fees?.openseaFees);
      devSellerFeeBasisPoints = +feesToBasisPoints(fees?.sellerFees);
    }

    return {
      totalBuyerFeeBasisPoints:
        openseaBuyerFeeBasisPoints + devBuyerFeeBasisPoints,
      totalSellerFeeBasisPoints:
        openseaSellerFeeBasisPoints + devSellerFeeBasisPoints,
      openseaBuyerFeeBasisPoints,
      openseaSellerFeeBasisPoints,
      devBuyerFeeBasisPoints,
      devSellerFeeBasisPoints,
    };
  }

  /**
   * Instead of signing an off-chain order, this methods allows you to approve an order
   * with on on-chain transaction.
   * @param order Order to approve
   * @param domain An optional domain to be hashed and included at the end of fulfillment calldata.  This can be used for on-chain order attribution to assist with analytics.
   * @returns Transaction hash of the approval transaction
   *
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the order's protocol address is not supported by OpenSea. See {@link isValidProtocol}.
   */
  public async approveOrder(order: OrderV2, domain?: string) {
    await this._requireAccountIsAvailable(order.maker.address);
    requireValidProtocol(order.protocolAddress);

    this._dispatch(EventType.ApproveOrder, {
      orderV2: order,
      accountAddress: order.maker.address,
    });

    const transaction = await this.seaport_v1_5
      .validate([order.protocolData], order.maker.address, domain)
      .transact();

    await this._confirmTransaction(
      transaction.hash,
      EventType.ApproveOrder,
      "Approving order",
    );

    return transaction.hash;
  }

  /**
   * Compute the `basePrice` and `extra` parameters to be used to price an order.
   * Also validates the expiration time and auction type.
   * @param tokenAddress Address of the ERC-20 token to use for trading.
   * Use the null address for ETH
   * @param expirationTime When the auction expires, or 0 if never.
   * @param startAmount The base value for the order, in the token's main units (e.g. ETH instead of wei)
   * @param endAmount The end value for the order, in the token's main units (e.g. ETH instead of wei). If unspecified, the order's `extra` attribute will be 0
   */
  private async _getPriceParameters(
    orderSide: OrderSide,
    tokenAddress: string,
    expirationTime: BigNumberish,
    startAmount: BigNumberish,
    endAmount?: BigNumberish,
  ) {
    const isEther = tokenAddress === ethers.constants.AddressZero;
    let paymentToken: OpenSeaFungibleToken | undefined;
    if (!isEther && [Chain.Mainnet, Chain.Sepolia].includes(this.chain)) {
      const { tokens } = await this.api.getPaymentTokens({
        address: tokenAddress.toLowerCase(),
      });
      paymentToken = tokens[0];
    }
    const decimals = paymentToken?.decimals ?? 18;

    const startAmountWei = ethers.utils.parseUnits(
      startAmount.toString(),
      decimals,
    );
    const endAmountWei = endAmount
      ? ethers.utils.parseUnits(endAmount.toString(), decimals)
      : undefined;
    const priceDiffWei =
      endAmountWei !== undefined
        ? startAmountWei.sub(endAmountWei)
        : BigNumber.from(0);

    const basePrice = startAmountWei;
    const endPrice = endAmountWei;
    const extra = priceDiffWei;

    // Validation
    if (startAmount == null || startAmountWei.lt(0)) {
      throw new Error(`Starting price must be a number >= 0`);
    }
    if (!isEther && !paymentToken) {
      try {
        if (
          tokenAddress.toLowerCase() == getWETHAddress(this.chain).toLowerCase()
        ) {
          paymentToken = {
            name: "Wrapped Ether",
            symbol: "WETH",
            decimals: 18,
            address: tokenAddress,
          };
        }
      } catch (error) {
        throw new Error(
          `No ERC-20 token found for ${tokenAddress}, only WETH is currently supported for chains other than Mainnet Ethereum`,
        );
      }
    }
    if (isEther && orderSide === OrderSide.Buy) {
      throw new Error(`Offers must use wrapped ETH or an ERC-20 token.`);
    }
    if (priceDiffWei.lt(0)) {
      throw new Error(
        "End price must be less than or equal to the start price.",
      );
    }
    if (priceDiffWei.gt(0) && BigNumber.from(expirationTime).isZero()) {
      throw new Error(
        "Expiration time must be set if order will change in price.",
      );
    }
    return { basePrice, extra, paymentToken, endPrice };
  }

  private _dispatch(event: EventType, data: EventData) {
    this._emitter.emit(event, data);
  }

  /**
   * Throws an error if an account is not available through the provider.
   *
   * @param accountAddress The account address to check is available.
   */
  private async _requireAccountIsAvailable(accountAddress: string) {
    const accountAddressChecksummed = ethers.utils.getAddress(accountAddress);
    if (
      (this._signerOrProvider.constructor.name === Wallet.name &&
        (this._signerOrProvider as Wallet).address ===
          accountAddressChecksummed) ||
      (this._signerOrProvider.constructor.name ===
        providers.JsonRpcProvider.name &&
        (
          await (
            this._signerOrProvider as providers.JsonRpcProvider
          ).listAccounts()
        ).includes(accountAddressChecksummed))
    ) {
      return;
    }
    throw new Error(
      `Specified accountAddress is not available through wallet or provider: ${accountAddressChecksummed}`,
    );
  }

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
