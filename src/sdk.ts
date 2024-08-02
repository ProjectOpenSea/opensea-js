import EventEmitter = require("events");
import { Seaport } from "@opensea/seaport-js";
import {
  CROSS_CHAIN_SEAPORT_V1_5_ADDRESS,
  CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
  OPENSEA_CONDUIT_KEY,
} from "@opensea/seaport-js/lib/constants";
import {
  AdvancedOrder,
  ConsiderationInputItem,
  CreateInputItem,
  OrderComponents,
} from "@opensea/seaport-js/lib/types";
import {
  BigNumberish,
  Contract,
  FixedNumber,
  Overrides,
  Signer,
  ethers,
  parseEther,
  JsonRpcProvider,
  ContractTransactionResponse,
  ZeroAddress,
} from "ethers";
import { OpenSeaAPI } from "./api/api";
import { CollectionOffer, Listing, NFT, Order } from "./api/types";
import {
  INVERSE_BASIS_POINT,
  ENGLISH_AUCTION_ZONE_MAINNETS,
  ENGLISH_AUCTION_ZONE_TESTNETS,
} from "./constants";
import {
  constructPrivateListingCounterOrder,
  getPrivateListingConsiderations,
  getPrivateListingFulfillments,
} from "./orders/privateListings";
import { OrderType, OrderV2 } from "./orders/types";
import { DEFAULT_SEAPORT_CONTRACT_ADDRESS } from "./orders/utils";
import {
  ERC1155__factory,
  ERC20__factory,
  ERC721__factory,
} from "./typechain/contracts";
import {
  EventData,
  EventType,
  Chain,
  OpenSeaAPIConfig,
  OpenSeaCollection,
  OrderSide,
  TokenStandard,
  AssetWithTokenStandard,
  AssetWithTokenId,
} from "./types";
import {
  getMaxOrderExpirationTimestamp,
  hasErrorCode,
  getAssetItemType,
  getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress,
  requireValidProtocol,
  getWETHAddress,
  isTestChain,
  basisPointsForFee,
  totalBasisPointsForFees,
  getChainId,
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
  /** Seaport v1.5 client @see {@link https://github.com/ProjectOpenSea/seaport-js} */
  public seaport_v1_5: Seaport;
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.seaport_v1_5 = new Seaport(this._signerOrProvider as any, {
      overrides: {
        contractAddress: CROSS_CHAIN_SEAPORT_V1_5_ADDRESS,
        seaportVersion: "1.5",
        defaultConduitKey: OPENSEA_CONDUIT_KEY,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.seaport_v1_6 = new Seaport(this._signerOrProvider as any, {
      overrides: { defaultConduitKey: OPENSEA_CONDUIT_KEY },
    });

    // Emit events
    this._emitter = new EventEmitter();

    // Logger: default to no logging if fn not provided
    this.logger = logger ?? ((arg: string) => arg);

    // Cache decimals for WETH payment token to skip network request
    try {
      const wethAddress = getWETHAddress(this.chain).toLowerCase();
      this._cachedPaymentTokenDecimals[wethAddress] = 18;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message.includes("Unknown WETH address")) {
        // Ignore
      } else {
        console.error(error);
      }
    }
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
   * W-ETH is needed for making offers.
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

    const value = parseEther(FixedNumber.fromValue(amountInEth).toString());

    this._dispatch(EventType.WrapEth, { accountAddress, amount: value });

    const wethContract = new Contract(
      getWETHAddress(this.chain),
      ["function deposit() payable"],
      this._signerOrProvider,
    );

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

    const amount = parseEther(FixedNumber.fromValue(amountInEth).toString());

    this._dispatch(EventType.UnwrapWeth, { accountAddress, amount });

    const wethContract = new Contract(
      getWETHAddress(this.chain),
      ["function withdraw(uint wad) public"],
      this._signerOrProvider,
    );

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
    amount: bigint,
    basisPoints: bigint,
  ): string => {
    return ((amount * basisPoints) / INVERSE_BASIS_POINT).toString();
  };

  private async getFees({
    collection,
    seller,
    paymentTokenAddress,
    startAmount,
    endAmount,
    excludeOptionalCreatorFees,
  }: {
    collection: OpenSeaCollection;
    seller?: string;
    paymentTokenAddress: string;
    startAmount: bigint;
    endAmount?: bigint;
    excludeOptionalCreatorFees?: boolean;
  }): Promise<ConsiderationInputItem[]> {
    let collectionFees = collection.fees;
    if (excludeOptionalCreatorFees) {
      collectionFees = collectionFees.filter((fee) => fee.required);
    }
    const collectionFeesBasisPoints = totalBasisPointsForFees(collectionFees);
    const sellerBasisPoints = INVERSE_BASIS_POINT - collectionFeesBasisPoints;

    const getConsiderationItem = (basisPoints: bigint, recipient?: string) => {
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

    const considerationItems: ConsiderationInputItem[] = [];

    if (seller) {
      considerationItems.push(getConsiderationItem(sellerBasisPoints, seller));
    }
    if (collectionFeesBasisPoints > 0) {
      for (const fee of collectionFees) {
        considerationItems.push(
          getConsiderationItem(basisPointsForFee(fee), fee.recipient),
        );
      }
    }
    return considerationItems;
  }

  private getNFTItems(
    nfts: NFT[],
    quantities: bigint[] = [],
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
   * @param options.excludeOptionalCreatorFees If true, optional creator fees will be excluded from the offer. Default: false.
   * @param options.zone The zone to use for the order. For order protection, pass SIGNED_ZONE. If unspecified, defaults to no zone.
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
    paymentTokenAddress = getWETHAddress(this.chain),
    excludeOptionalCreatorFees = false,
    zone = ZeroAddress,
  }: {
    asset: AssetWithTokenId;
    accountAddress: string;
    startAmount: BigNumberish;
    quantity?: BigNumberish;
    domain?: string;
    salt?: BigNumberish;
    expirationTime?: BigNumberish;
    paymentTokenAddress?: string;
    excludeOptionalCreatorFees?: boolean;
    zone?: string;
  }): Promise<OrderV2> {
    await this._requireAccountIsAvailable(accountAddress);

    const { nft } = await this.api.getNFT(asset.tokenAddress, asset.tokenId);
    const considerationAssetItems = this.getNFTItems(
      [nft],
      [BigInt(quantity ?? 1)],
    );

    const { basePrice } = await this._getPriceParameters(
      OrderSide.OFFER,
      paymentTokenAddress,
      expirationTime ?? getMaxOrderExpirationTimestamp(),
      startAmount,
    );

    const collection = await this.api.getCollection(nft.collection);

    const considerationFeeItems = await this.getFees({
      collection,
      paymentTokenAddress,
      startAmount: basePrice,
      excludeOptionalCreatorFees,
    });

    if (collection.requiredZone) {
      zone = collection.requiredZone;
    }

    const { executeAllActions } = await this.seaport_v1_6.createOrder(
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
            ? BigInt(expirationTime).toString()
            : getMaxOrderExpirationTimestamp().toString(),
        zone,
        domain,
        salt: BigInt(salt ?? 0).toString(),
        restrictedByZone: zone !== ZeroAddress,
        allowPartialFills: true,
      },
      accountAddress,
    );
    const order = await executeAllActions();

    return this.api.postOrder(order, {
      protocol: "seaport",
      protocolAddress: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
      side: OrderSide.OFFER,
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
   * @param options.excludeOptionalCreatorFees If true, optional creator fees will be excluded from the listing. Default: false.
   * @param options.zone The zone to use for the order.  For order protection, pass SIGNED_ZONE. If unspecified, defaults to no zone.
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
    paymentTokenAddress = ethers.ZeroAddress,
    buyerAddress,
    englishAuction,
    excludeOptionalCreatorFees = false,
    zone = ZeroAddress,
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
    excludeOptionalCreatorFees?: boolean;
    zone?: string;
  }): Promise<OrderV2> {
    await this._requireAccountIsAvailable(accountAddress);

    const { nft } = await this.api.getNFT(asset.tokenAddress, asset.tokenId);
    const offerAssetItems = this.getNFTItems([nft], [BigInt(quantity ?? 1)]);

    if (englishAuction && paymentTokenAddress == ethers.ZeroAddress) {
      throw new Error(
        `English auctions must use wrapped ETH or an ERC-20 token.`,
      );
    }

    const { basePrice, endPrice } = await this._getPriceParameters(
      OrderSide.LISTING,
      paymentTokenAddress,
      expirationTime ?? getMaxOrderExpirationTimestamp(),
      startAmount,
      endAmount ?? undefined,
    );

    const collection = await this.api.getCollection(nft.collection);

    const considerationFeeItems = await this.getFees({
      collection,
      seller: accountAddress,
      paymentTokenAddress,
      startAmount: basePrice,
      endAmount: endPrice,
      excludeOptionalCreatorFees,
    });

    if (buyerAddress) {
      considerationFeeItems.push(
        ...getPrivateListingConsiderations(offerAssetItems, buyerAddress),
      );
    }

    if (englishAuction) {
      zone = isTestChain(this.chain)
        ? ENGLISH_AUCTION_ZONE_TESTNETS
        : ENGLISH_AUCTION_ZONE_MAINNETS;
    } else if (collection.requiredZone) {
      zone = collection.requiredZone;
    }

    const { executeAllActions } = await this.seaport_v1_6.createOrder(
      {
        offer: offerAssetItems,
        consideration: considerationFeeItems,
        startTime: listingTime?.toString(),
        endTime:
          expirationTime?.toString() ??
          getMaxOrderExpirationTimestamp().toString(),
        zone,
        domain,
        salt: BigInt(salt ?? 0).toString(),
        restrictedByZone: zone !== ZeroAddress,
        allowPartialFills: englishAuction ? false : true,
      },
      accountAddress,
    );
    const order = await executeAllActions();

    return this.api.postOrder(order, {
      protocol: "seaport",
      protocolAddress: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
      side: OrderSide.LISTING,
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
   * @param options.excludeOptionalCreatorFees If true, optional creator fees will be excluded from the offer. Default: false.
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
    paymentTokenAddress = getWETHAddress(this.chain),
    excludeOptionalCreatorFees = false,
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
    excludeOptionalCreatorFees?: boolean;
    offerProtectionEnabled?: boolean;
    traitType?: string;
    traitValue?: string;
  }): Promise<CollectionOffer | null> {
    await this._requireAccountIsAvailable(accountAddress);

    const collection = await this.api.getCollection(collectionSlug);
    const buildOfferResult = await this.api.buildOffer(
      accountAddress,
      quantity,
      collectionSlug,
      offerProtectionEnabled,
      traitType,
      traitValue,
    );
    const item = buildOfferResult.partialParameters.consideration[0];
    const convertedConsiderationItem = {
      itemType: item.itemType,
      token: item.token,
      identifier: item.identifierOrCriteria,
      amount: item.startAmount,
    };

    const { basePrice } = await this._getPriceParameters(
      OrderSide.LISTING,
      paymentTokenAddress,
      expirationTime ?? getMaxOrderExpirationTimestamp(),
      amount,
    );
    const considerationFeeItems = await this.getFees({
      collection,
      paymentTokenAddress,
      startAmount: basePrice,
      endAmount: basePrice,
      excludeOptionalCreatorFees,
    });

    const considerationItems = [
      convertedConsiderationItem,
      ...considerationFeeItems,
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
      salt: BigInt(salt ?? 0).toString(),
      restrictedByZone: true,
      allowPartialFills: true,
    };

    const { executeAllActions } = await this.seaport_v1_6.createOrder(
      payload,
      accountAddress,
    );
    const order = await executeAllActions();

    return this.api.postCollectionOffer(
      order,
      collectionSlug,
      traitType,
      traitValue,
    );
  }

  /**
   * Fulfill a private order for a designated address.
   * @param options
   * @param options.order The order to fulfill
   * @param options.accountAddress Address of the wallet taking the order.
   * @param options.domain An optional domain to be hashed and included at the end of fulfillment calldata.
   *                       This can be used for on-chain order attribution to assist with analytics.
   * @param options.overrides Transaction overrides, ignored if not set.
   * @returns Transaction hash of the order.
   */
  private async fulfillPrivateOrder({
    order,
    accountAddress,
    domain,
    overrides,
  }: {
    order: OrderV2;
    accountAddress: string;
    domain?: string;
    overrides?: Overrides;
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
    const seaport = this.getSeaport(order.protocolAddress);
    const transaction = await seaport
      .matchOrders({
        orders: [order.protocolData, counterOrder],
        fulfillments,
        overrides: {
          ...overrides,
          value: counterOrder.parameters.offer[0].startAmount,
        },
        accountAddress,
        domain,
      })
      .transact();
    const transactionReceipt = await transaction.wait();
    if (!transactionReceipt) {
      throw new Error("Missing transaction receipt");
    }

    await this._confirmTransaction(
      transactionReceipt.hash,
      EventType.MatchOrders,
      "Fulfilling order",
    );
    return transactionReceipt.hash;
  }

  /**
   * Fulfill an order for an asset. The order can be either a listing or an offer.
   * @param options
   * @param options.order The order to fulfill, a.k.a. "take"
   * @param options.accountAddress Address of the wallet taking the offer.
   * @param options.recipientAddress The optional address to receive the order's item(s) or currencies. If not specified, defaults to accountAddress.
   * @param options.domain An optional domain to be hashed and included at the end of fulfillment calldata.  This can be used for on-chain order attribution to assist with analytics.
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
    domain,
    overrides,
  }: {
    order: OrderV2 | Order;
    accountAddress: string;
    recipientAddress?: string;
    domain?: string;
    overrides?: Overrides;
  }): Promise<string> {
    await this._requireAccountIsAvailable(accountAddress);

    const protocolAddress =
      (order as OrderV2).protocolAddress ?? (order as Order).protocol_address;
    requireValidProtocol(protocolAddress);

    const orderHash =
      (order as OrderV2).orderHash ?? (order as Order).order_hash;

    const side =
      (order as OrderV2).side ??
      ([OrderType.BASIC, OrderType.ENGLISH].includes((order as Listing).type)
        ? OrderSide.LISTING
        : OrderSide.OFFER);

    let extraData: string | undefined = undefined;

    const protocolData =
      (order as OrderV2).protocolData ?? (order as Order).protocol_data;

    if (orderHash) {
      const result = await this.api.generateFulfillmentData(
        accountAddress,
        orderHash,
        protocolAddress,
        side,
      );

      // If the order is using offer protection, the extraData
      // must be included with the order to successfully fulfill.
      const inputData = result.fulfillment_data.transaction.input_data;
      if ("orders" in inputData && "extraData" in inputData.orders[0]) {
        extraData = (inputData.orders[0] as AdvancedOrder).extraData;
      }
      const signature = result.fulfillment_data.orders[0].signature;
      protocolData.signature = signature;
    }

    const isPrivateListing = "taker" in order ? !!order.taker : false;
    if (isPrivateListing) {
      if (recipientAddress) {
        throw new Error(
          "Private listings cannot be fulfilled with a recipient address",
        );
      }
      return this.fulfillPrivateOrder({
        order: order as OrderV2,
        accountAddress,
        domain,
        overrides,
      });
    }

    const seaport = this.getSeaport(protocolAddress);
    const { executeAllActions } = await seaport.fulfillOrder({
      order: protocolData,
      accountAddress,
      recipientAddress,
      extraData,
      domain,
      overrides,
    });
    const transaction = await executeAllActions();

    const transactionHash = ethers.Transaction.from(transaction).hash;
    if (!transactionHash) {
      throw new Error("Missing transaction hash");
    }

    await this._confirmTransaction(
      transactionHash,
      EventType.MatchOrders,
      "Fulfilling order",
    );
    return transactionHash;
  }

  /**
   * Utility function to get the Seaport client based on the address.
   * @param protocolAddress The Seaport address.
   */
  private getSeaport(protocolAddress: string): Seaport {
    const checksummedProtocolAddress = ethers.getAddress(protocolAddress);
    switch (checksummedProtocolAddress) {
      case CROSS_CHAIN_SEAPORT_V1_5_ADDRESS:
        return this.seaport_v1_5;
      case CROSS_CHAIN_SEAPORT_V1_6_ADDRESS:
        return this.seaport_v1_6;
      default:
        throw new Error(`Unsupported protocol address: ${protocolAddress}`);
    }
  }

  /**
   * Cancel orders onchain, preventing them from being fulfilled.
   * @param options
   * @param options.orders The orders to cancel
   * @param options.accountAddress The account address cancelling the orders.
   * @param options.domain An optional domain to be hashed and included at the end of fulfillment calldata.
   *                       This can be used for on-chain order attribution to assist with analytics.
   * @param options.overrides Transaction overrides, ignored if not set.
   * @returns Transaction hash of the order.
   */
  private async cancelSeaportOrders({
    orders,
    accountAddress,
    domain,
    protocolAddress = DEFAULT_SEAPORT_CONTRACT_ADDRESS,
    overrides,
  }: {
    orders: OrderComponents[];
    accountAddress: string;
    domain?: string;
    protocolAddress?: string;
    overrides?: Overrides;
  }): Promise<string> {
    const seaport = this.getSeaport(protocolAddress);

    const transaction = await seaport
      .cancelOrders(orders, accountAddress, domain, overrides)
      .transact();

    return transaction.hash;
  }

  /**
   * Cancel an order onchain, preventing it from ever being fulfilled.
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

  private _getSeaportVersion(protocolAddress: string) {
    const protocolAddressChecksummed = ethers.getAddress(protocolAddress);
    switch (protocolAddressChecksummed) {
      case CROSS_CHAIN_SEAPORT_V1_6_ADDRESS:
        return "1.6";
      case CROSS_CHAIN_SEAPORT_V1_5_ADDRESS:
        return "1.5";
      default:
        throw new Error("Unknown or unsupported protocol address");
    }
  }

  /**
   * Get the offerer signature for canceling an order offchain.
   * The signature will only be valid if the signer address is the address of the order's offerer.
   */
  private async _getOffererSignature(
    protocolAddress: string,
    orderHash: string,
    chain: Chain,
  ) {
    const chainId = getChainId(chain);
    const name = "Seaport";
    const version = this._getSeaportVersion(protocolAddress);

    if (
      typeof (this._signerOrProvider as Signer).signTypedData == "undefined"
    ) {
      throw new Error(
        "Please pass an ethers Signer into this sdk to derive an offerer signature",
      );
    }

    return (this._signerOrProvider as Signer).signTypedData(
      { chainId, name, version, verifyingContract: protocolAddress },
      { OrderHash: [{ name: "orderHash", type: "bytes32" }] },
      { orderHash },
    );
  }

  /**
   * Offchain cancel an order, offer or listing, by its order hash when protected by the SignedZone.
   * Protocol and Chain are required to prevent hash collisions.
   * Please note cancellation is only assured if a fulfillment signature was not vended prior to cancellation.
   * @param protocolAddress The Seaport address for the order.
   * @param orderHash The order hash, or external identifier, of the order.
   * @param chain The chain where the order is located.
   * @param offererSignature An EIP-712 signature from the offerer of the order.
   *                         If this is not provided, the user associated with the API Key will be checked instead.
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
    if (useSignerToDeriveOffererSignature) {
      offererSignature = await this._getOffererSignature(
        protocolAddress,
        orderHash,
        chain,
      );
    }
    return this.api.offchainCancelOrder(
      protocolAddress,
      orderHash,
      chain,
      offererSignature,
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

    const seaport = this.getSeaport(order.protocolAddress);

    try {
      const isValid = await seaport
        .validate([order.protocolData], accountAddress)
        .staticCall();
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
    switch (asset.tokenStandard) {
      case TokenStandard.ERC20: {
        const contract = ERC20__factory.connect(
          asset.tokenAddress,
          this.provider,
        );
        return await contract.balanceOf.staticCall(accountAddress);
      }
      case TokenStandard.ERC1155: {
        if (asset.tokenId === undefined || asset.tokenId === null) {
          throw new Error("Missing ERC1155 tokenId for getBalance");
        }
        const contract = ERC1155__factory.connect(
          asset.tokenAddress,
          this.provider,
        );
        return await contract.balanceOf.staticCall(
          accountAddress,
          asset.tokenId,
        );
      }
      case TokenStandard.ERC721: {
        if (asset.tokenId === undefined || asset.tokenId === null) {
          throw new Error("Missing ERC721 tokenId for getBalance");
        }
        const contract = ERC721__factory.connect(
          asset.tokenAddress,
          this.provider,
        );
        try {
          const owner = await contract.ownerOf.staticCall(asset.tokenId);
          return BigInt(owner.toLowerCase() == accountAddress.toLowerCase());
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          this.logger(
            `Failed to get ownerOf ERC721: ${error.message ?? error}`,
          );
          return 0n;
        }
      }
      default:
        throw new Error("Unsupported token standard for getBalance");
    }
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
    await this._requireAccountIsAvailable(fromAddress);
    overrides = { ...overrides, from: fromAddress };
    let transaction: Promise<ContractTransactionResponse>;

    switch (asset.tokenStandard) {
      case TokenStandard.ERC20: {
        if (!amount) {
          throw new Error("Missing ERC20 amount for transfer");
        }
        const contract = ERC20__factory.connect(
          asset.tokenAddress,
          this._signerOrProvider,
        );
        transaction = contract.transfer(toAddress, amount, overrides);
        break;
      }
      case TokenStandard.ERC1155: {
        if (asset.tokenId === undefined || asset.tokenId === null) {
          throw new Error("Missing ERC1155 tokenId for transfer");
        }
        if (!amount) {
          throw new Error("Missing ERC1155 amount for transfer");
        }
        const contract = ERC1155__factory.connect(
          asset.tokenAddress,
          this._signerOrProvider,
        );
        transaction = contract.safeTransferFrom(
          fromAddress,
          toAddress,
          asset.tokenId,
          amount,
          "",
          overrides,
        );
        break;
      }
      case TokenStandard.ERC721: {
        if (asset.tokenId === undefined || asset.tokenId === null) {
          throw new Error("Missing ERC721 tokenId for transfer");
        }
        const contract = ERC721__factory.connect(
          asset.tokenAddress,
          this._signerOrProvider,
        );
        transaction = contract.transferFrom(
          fromAddress,
          toAddress,
          asset.tokenId,
          overrides,
        );
        break;
      }
      default:
        throw new Error("Unsupported token standard for transfer");
    }

    try {
      const transactionResponse = await transaction;
      await this._confirmTransaction(
        transactionResponse.hash,
        EventType.Transfer,
        "Transferring asset",
      );
    } catch (error) {
      console.error(error);
      this._dispatch(EventType.TransactionDenied, {
        error,
        accountAddress: fromAddress,
      });
    }
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

    const seaport = this.getSeaport(order.protocolAddress);
    const transaction = await seaport
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
