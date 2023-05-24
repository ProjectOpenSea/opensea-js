import { Seaport } from "@opensea/seaport-js";
import {
  ConsiderationInputItem,
  CreateInputItem,
  OrderComponents,
} from "@opensea/seaport-js/lib/types";
import { BigNumber } from "bignumber.js";
import { Contract, FixedNumber, Wallet, ethers, providers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { EventEmitter, EventSubscription } from "fbemitter";
import Web3 from "web3";
import { OpenSeaAPI } from "./api";
import {
  CONDUIT_KEYS_TO_CONDUIT,
  INVERSE_BASIS_POINT,
  NULL_ADDRESS,
  NULL_BLOCK_HASH,
  CROSS_CHAIN_DEFAULT_CONDUIT_KEY,
  DEFAULT_ZONE_BY_NETWORK,
  RPC_URL_PATH,
  WETH_ADDRESS_BY_NETWORK,
} from "./constants";
import {
  constructPrivateListingCounterOrder,
  getPrivateListingConsiderations,
  getPrivateListingFulfillments,
} from "./orders/privateListings";
import { OrderV2, PostOfferResponse } from "./orders/types";
import { DEFAULT_SEAPORT_CONTRACT_ADDRESS } from "./orders/utils";
import {
  Asset,
  ComputedFees,
  EventData,
  EventType,
  Network,
  OpenSeaAPIConfig,
  OpenSeaAsset,
  OpenSeaCollection,
  OrderSide,
  AssetType,
  TokenStandard,
} from "./types";
import { schemas, Schema } from "./utils/schemas/schema";
import { getCanonicalWrappedEther } from "./utils/tokens";
import {
  confirmTransaction,
  delay,
  getAssetType,
  makeBigNumber,
  getMaxOrderExpirationTimestamp,
  hasErrorCode,
  getAssetItemType,
  BigNumberInput,
  getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress,
  feesToBasisPoints,
  isValidProtocol,
  toBaseUnitAmount,
} from "./utils/utils";

export class OpenSeaSDK {
  // Web3 instance to use
  public web3: Web3;
  public web3ReadOnly: Web3;
  // Ethers provider
  public ethersProvider: providers.Web3Provider;
  // Seaport v1.5 client
  public seaport_v1_5: Seaport;
  // Logger function to use when debugging
  public logger: (arg: string) => void;
  // API instance on this seaport
  public readonly api: OpenSeaAPI;

  private _networkName: Network;
  private _emitter: EventEmitter;
  private providerOrSigner: providers.Web3Provider | Wallet;

  /**
   * Your very own seaport.
   * Create a new instance of OpenSeaJS.
   * @param provider Web3 Provider to use for transactions. For example:
   *  `const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')`
   * @param apiConfig configuration options, including `networkName`
   * @param logger logger, optional, a function that will be called with debugging
   * @param wallet optional, if you'd like to use an ethers wallet for order posting
   *  information
   */
  constructor(
    provider: Web3["currentProvider"],
    apiConfig: OpenSeaAPIConfig = {},
    logger?: (arg: string) => void,
    wallet?: ethers.Wallet
  ) {
    // API config
    apiConfig.networkName = apiConfig.networkName || Network.Main;
    this.api = new OpenSeaAPI(apiConfig);

    this._networkName = apiConfig.networkName;

    const readonlyProvider = new Web3.providers.HttpProvider(
      `${this.api.apiBaseUrl}/${RPC_URL_PATH}`
    );

    const useReadOnlyProvider = apiConfig.useReadOnlyProvider ?? true;

    // Web3 Config
    this.web3 = new Web3(provider);
    this.web3ReadOnly = useReadOnlyProvider
      ? new Web3(readonlyProvider)
      : this.web3;

    // Ethers Config
    this.ethersProvider = new providers.Web3Provider(
      provider as providers.ExternalProvider
    );

    this.providerOrSigner = wallet ? wallet : this.ethersProvider;

    this.seaport_v1_5 = new Seaport(this.providerOrSigner, {
      conduitKeyToConduit: CONDUIT_KEYS_TO_CONDUIT,
      overrides: {
        defaultConduitKey: CROSS_CHAIN_DEFAULT_CONDUIT_KEY,
      },
      seaportVersion: "1.5",
    });

    // Emit events
    this._emitter = new EventEmitter();

    // Debugging: default to nothing
    this.logger = logger || ((arg: string) => arg);
  }

  /**
   * Add a listener to a marketplace event
   * @param event An event to listen for
   * @param listener A callback that will accept an object with event data
   * @param once Whether the listener should only be called once
   */
  public addListener(
    event: EventType,
    listener: (data: EventData) => void,
    once = false
  ): EventSubscription {
    const subscription = once
      ? this._emitter.once(event, listener)
      : this._emitter.addListener(event, listener);
    return subscription;
  }

  /**
   * Remove an event listener, included here for completeness.
   * Simply calls `.remove()` on a subscription
   * @param subscription The event subscription returned from `addListener`
   */
  public removeListener(subscription: EventSubscription) {
    subscription.remove();
  }

  /**
   * Remove all event listeners. Good idea to call this when you're unmounting
   * a component that listens to events to make UI updates
   * @param event Optional EventType to remove listeners for
   */
  public removeAllListeners(event?: EventType) {
    this._emitter.removeAllListeners(event);
  }

  /**
   * Wrap ETH into W-ETH.
   * W-ETH is needed for placing buy orders (making offers).
   * Emits the `WrapEth` event when the transaction is prompted.
   * @param param0 __namedParameters Object
   * @param amountInEth How much ether to wrap
   * @param accountAddress Address of the user's wallet containing the ether
   */
  public async wrapEth({
    amountInEth,
    accountAddress,
  }: {
    amountInEth: number;
    accountAddress: string;
  }) {
    const token = getCanonicalWrappedEther(this._networkName);

    const value = parseEther(amountInEth.toString());

    this._dispatch(EventType.WrapEth, { accountAddress, amount: value });

    const wethContract = new Contract(
      token.address,
      ["function deposit() payable"],
      this.providerOrSigner
    );

    wethContract.connect(this.ethersProvider);
    try {
      const transaction = await wethContract.deposit({ value });
      await this._confirmTransaction(
        transaction.hash,
        EventType.WrapEth,
        "Wrapping ETH"
      );
    } catch (error) {
      console.error(error);
      this._dispatch(EventType.TransactionDenied, { error, accountAddress });
    }
  }

  /**
   * Unwrap W-ETH into ETH.
   * Emits the `UnwrapWeth` event when the transaction is prompted.
   * @param param0 __namedParameters Object
   * @param amountInEth How much W-ETH to unwrap
   * @param accountAddress Address of the user's wallet containing the W-ETH
   */
  public async unwrapWeth({
    amountInEth,
    accountAddress,
  }: {
    amountInEth: number;
    accountAddress: string;
  }) {
    const token = getCanonicalWrappedEther(this._networkName);

    const amount = parseEther(amountInEth.toString());

    this._dispatch(EventType.UnwrapWeth, { accountAddress, amount });

    const wethContract = new Contract(
      token.address,
      ["function withdraw(uint wad) public"],
      this.providerOrSigner
    );

    wethContract.connect(this.ethersProvider);
    try {
      const transaction = await wethContract.withdraw(amount);
      await this._confirmTransaction(
        transaction.hash,
        EventType.UnwrapWeth,
        "Unwrapping W-ETH"
      );
    } catch (error) {
      console.error(error);
      this._dispatch(EventType.TransactionDenied, { error, accountAddress });
    }
  }

  private getAmountWithBasisPointsApplied = (
    amount: BigNumber,
    basisPoints: number
  ) => {
    return amount
      .multipliedBy(basisPoints)
      .dividedBy(INVERSE_BASIS_POINT)
      .toString();
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
          basisPoints
        ),
        recipient,
      };
    };

    const getConsiderationItemsFromFeeCategory = (
      feeCategory: Map<string, number>
    ): ConsiderationInputItem[] => {
      return Array.from(feeCategory.entries()).map(
        ([recipient, basisPoints]) => {
          return getConsiderationItem(basisPoints, recipient);
        }
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

  private getAssetItems(
    assets: Asset[],
    quantities: BigNumber[] = [],
    fallbackSchema?: TokenStandard
  ): CreateInputItem[] {
    return assets.map((asset, index) => ({
      itemType: getAssetItemType(this._getSchemaName(asset) ?? fallbackSchema),
      token:
        getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress(
          asset.tokenAddress
        ),
      identifier: asset.tokenId ?? undefined,
      amount: quantities[index].toString() ?? "1",
    }));
  }

  /**
   * Create a buy order to make an offer on an asset.
   * @param options Options for creating the buy order
   * @param options.asset The asset to trade
   * @param options.accountAddress Address of the maker's wallet
   * @param options.startAmount Value of the offer, in units of the payment token (or wrapped ETH if no payment token address specified)
   * @param options.quantity The number of assets to bid for (if fungible or semi-fungible). Defaults to 1. In units, not base units, e.g. not wei
   * @param options.domain An optional domain to be hashed and included in the first four bytes of the random salt.
   * @param options.salt Arbitrary salt. If not passed in, a random salt will be generated with the first four bytes being the domain hash or empty.
   * @param options.expirationTime Expiration time for the order, in seconds
   * @param options.paymentTokenAddress Optional address for using an ERC-20 token in the order. If unspecified, defaults to WETH
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
    startAmount: BigNumberInput;
    quantity?: BigNumberInput;
    domain?: string;
    salt?: string;
    expirationTime?: BigNumberInput;
    paymentTokenAddress?: string;
  }): Promise<OrderV2> {
    if (!asset.tokenId) {
      throw new Error("Asset must have a tokenId");
    }
    paymentTokenAddress =
      paymentTokenAddress ?? WETH_ADDRESS_BY_NETWORK[this._networkName];

    const openseaAsset = await this.api.getAsset(asset);
    const considerationAssetItems = this.getAssetItems(
      [openseaAsset],
      [makeBigNumber(quantity)]
    );

    const { basePrice } = await this._getPriceParameters(
      OrderSide.Buy,
      paymentTokenAddress,
      makeBigNumber(expirationTime ?? getMaxOrderExpirationTimestamp()),
      makeBigNumber(startAmount)
    );

    const { openseaSellerFees, collectionSellerFees: collectionSellerFees } =
      await this.getFees({
        collection: openseaAsset.collection,
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
          expirationTime?.toString() ??
          getMaxOrderExpirationTimestamp().toString(),
        zone: DEFAULT_ZONE_BY_NETWORK[this._networkName],
        domain,
        salt,
        restrictedByZone: false,
        allowPartialFills: true,
      },
      accountAddress
    );
    const order = await executeAllActions();

    return this.api.postOrder(order, {
      protocol: "seaport",
      protocolAddress: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
      side: "bid",
    });
  }

  /**
   * Create a sell order to auction an asset.
   * @param options Options for creating the sell order
   * @param options.asset The asset to trade
   * @param options.accountAddress Address of the maker's wallet
   * @param options.startAmount Price of the asset at the start of the auction. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
   * @param options.endAmount Optional price of the asset at the end of its expiration time. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
   * @param options.quantity The number of assets to sell (if fungible or semi-fungible). Defaults to 1. In units, not base units, e.g. not wei.
   * @param options.domain An optional domain to be hashed and included in the first four bytes of the random salt.
   * @param options.salt Arbitrary salt. If not passed in, a random salt will be generated with the first four bytes being the domain hash or empty.
   * @param options.listingTime Optional time when the order will become fulfillable, in UTC seconds. Undefined means it will start now.
   * @param options.expirationTime Expiration time for the order, in UTC seconds.
   * @param options.paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
   * @param options.buyerAddress Optional address that's allowed to purchase this item. If specified, no other address will be able to take the order, unless its value is the null address.
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
    paymentTokenAddress = NULL_ADDRESS,
    buyerAddress,
  }: {
    asset: Asset;
    accountAddress: string;
    startAmount: BigNumberInput;
    endAmount?: BigNumberInput;
    quantity?: BigNumberInput;
    domain?: string;
    salt?: string;
    listingTime?: string;
    expirationTime?: BigNumberInput;
    paymentTokenAddress?: string;
    buyerAddress?: string;
  }): Promise<OrderV2> {
    if (!asset.tokenId) {
      throw new Error("Asset must have a tokenId");
    }

    const openseaAsset = await this.api.getAsset(asset);
    const offerAssetItems = this.getAssetItems(
      [openseaAsset],
      [makeBigNumber(quantity)]
    );

    const { basePrice, endPrice } = await this._getPriceParameters(
      OrderSide.Sell,
      paymentTokenAddress,
      makeBigNumber(expirationTime ?? getMaxOrderExpirationTimestamp()),
      makeBigNumber(startAmount),
      endAmount !== undefined ? makeBigNumber(endAmount) : undefined
    );

    const {
      sellerFee,
      openseaSellerFees,
      collectionSellerFees: collectionSellerFees,
    } = await this.getFees({
      collection: openseaAsset.collection,
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
        ...getPrivateListingConsiderations(offerAssetItems, buyerAddress)
      );
    }

    const { executeAllActions } = await this.seaport_v1_5.createOrder(
      {
        offer: offerAssetItems,
        consideration: considerationFeeItems,
        startTime: listingTime,
        endTime:
          expirationTime?.toString() ??
          getMaxOrderExpirationTimestamp().toString(),
        zone: DEFAULT_ZONE_BY_NETWORK[this._networkName],
        domain,
        salt,
        restrictedByZone: false,
        allowPartialFills: true,
      },
      accountAddress
    );
    const order = await executeAllActions();

    return this.api.postOrder(order, {
      protocol: "seaport",
      protocolAddress: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
      side: "ask",
    });
  }

  /**
   * Create a collection offer
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
    amount: string;
    quantity: number;
    domain?: string;
    salt?: string;
    expirationTime?: BigNumberInput;
    paymentTokenAddress: string;
  }): Promise<PostOfferResponse | null> {
    const collection = await this.api.getCollection(collectionSlug);
    const buildOfferResult = await this.api.buildOffer(
      accountAddress,
      quantity,
      collectionSlug
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
      makeBigNumber(expirationTime ?? getMaxOrderExpirationTimestamp()),
      makeBigNumber(amount)
    );
    const { openseaSellerFees, collectionSellerFees: collectionSellerFees } =
      await this.getFees({
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
      zone: DEFAULT_ZONE_BY_NETWORK[this._networkName],
      domain,
      salt,
      restrictedByZone: false,
      allowPartialFills: true,
    };

    const { executeAllActions } = await this.seaport_v1_5.createOrder(
      payload,
      accountAddress
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
    if (!isValidProtocol(order.protocolAddress)) {
      throw new Error("Unsupported protocol");
    }

    if (!order.taker?.address) {
      throw new Error(
        "Order is not a private listing must have a taker address"
      );
    }
    const counterOrder = constructPrivateListingCounterOrder(
      order.protocolData,
      order.taker.address
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
      "Fulfilling order"
    );
    return transactionReceipt.transactionHash;
  }

  /**
   * Fullfill or "take" an order for an asset, either a buy or sell order
   * @param options fullfillment options
   * @param options.order The order to fulfill, a.k.a. "take"
   * @param options.accountAddress The taker's wallet address
   * @param options.recipientAddress The optional address to receive the order's item(s) or curriencies. If not specified, defaults to accountAddress
   * @param options.domain An optional domain to be hashed and included at the end of fulfillment calldata
   * @returns Transaction hash for fulfilling the order
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
    if (!isValidProtocol(order.protocolAddress)) {
      throw new Error("Unsupported protocol");
    }

    if (order.orderHash) {
      const result = await this.api.generateFulfillmentData(
        accountAddress,
        order.orderHash,
        order.protocolAddress,
        order.side
      );
      const signature = result.fulfillment_data.orders[0].signature;
      order.clientSignature = signature;
      order.protocolData.signature = signature;
    }

    const isPrivateListing = !!order.taker;
    if (isPrivateListing) {
      if (recipientAddress) {
        throw new Error(
          "Private listings cannot be fulfilled with a recipient address"
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
      domain,
    });
    const transaction = await executeAllActions();

    await this._confirmTransaction(
      transaction.hash,
      EventType.MatchOrders,
      "Fulfilling order"
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
   * @param param0 __namedParameters Object
   * @param order The order to cancel
   * @param accountAddress The order maker's wallet address
   * @param domain An optional domain to be hashed and included at the end of fulfillment calldata
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
    if (!isValidProtocol(order.protocolAddress)) {
      throw new Error("Unsupported protocol");
    }

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
      "Cancelling order"
    );
  }

  /**
   * Returns whether an order is fulfillable.
   * An order may not be fulfillable if a target item's transfer function
   * is locked for some reason, e.g. an item is being rented within a game
   * or trading has been locked for an item type.
   * @param param0 __namedParameters Object
   * @param order Order to check
   * @param accountAddress The account address that will be fulfilling the order
   * @param recipientAddress The optional address to receive the order's item(s) or curriencies. If not specified, defaults to accountAddress.
   * @param referrerAddress The optional address that referred the order
   */
  public async isOrderFulfillable({
    order,
    accountAddress,
  }: {
    order: OrderV2;
    accountAddress: string;
  }): Promise<boolean> {
    if (!isValidProtocol(order.protocolAddress)) {
      throw new Error("Unsupported protocol");
    }

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
   * Get an account's balance of any Asset.
   * @param param0 __namedParameters Object
   * @param accountAddress Account address to check
   * @param asset The Asset to check balance for
   * @param retries How many times to retry if balance is 0
   */
  public async getBalance(
    { accountAddress, asset }: { accountAddress: string; asset: Asset },
    retries = 1
  ): Promise<BigNumber> {
    const schema = this._getSchema(this._getSchemaName(asset));
    const wyAsset = getAssetType(schema, asset);

    if (schema.functions.countOf) {
      // ERC20 or ERC1155 (non-Enjin)

      const abi = schema.functions.countOf(wyAsset);
      const contract = new (this._getClientsForRead({
        retries,
      }).web3.eth.Contract)([abi], abi.target);
      const inputValues = abi.inputs
        .filter((x) => x.value !== undefined)
        .map((x) => x.value);

      const count = await contract.methods[abi.name](
        accountAddress,
        ...inputValues
      ).call();

      if (count !== undefined) {
        return new BigNumber(count);
      }
    } else if (schema.functions.ownerOf) {
      // ERC721 asset

      const abi = schema.functions.ownerOf(wyAsset);
      const contract = new (this._getClientsForRead({
        retries,
      }).web3.eth.Contract)([abi], abi.target);

      if (abi.inputs.filter((x) => x.value === undefined)[0]) {
        throw new Error(
          "Missing an argument for finding the owner of this asset"
        );
      }
      const inputValues = abi.inputs.map((i) => i.value.toString());
      try {
        const owner = await contract.methods[abi.name](...inputValues).call();
        if (owner) {
          return owner.toLowerCase() == accountAddress.toLowerCase()
            ? new BigNumber(1)
            : new BigNumber(0);
        }
        // eslint-disable-next-line no-empty
      } catch {}
    } else {
      // Missing ownership call - skip check to allow listings
      // by default
      throw new Error("Missing ownership schema for this asset type");
    }

    if (retries <= 0) {
      throw new Error("Unable to get current owner from smart contract");
    } else {
      await delay(500);
      // Recursively check owner again
      return await this.getBalance({ accountAddress, asset }, retries - 1);
    }
  }

  /**
   * Compute the fees for an order
   * @param param0 __namedParameters
   * @param asset Asset to use for fees. May be blank ONLY for multi-collection bundles.
   * @param side The side of the order (buy or sell)
   * @param accountAddress The account to check fees for (useful if fees differ by account, like transfer fees)
   */
  public async computeFees({
    asset,
  }: {
    asset?: OpenSeaAsset;
    side: OrderSide;
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
   * Instead of signing an off-chain order, you can approve an order
   * with on on-chain transaction using this method
   * @param order Order to approve
   * @param domain An optional domain to be hashed and included at the end of fulfillment calldata
   * @returns Transaction hash of the approval transaction
   */
  public async approveOrder(order: OrderV2, domain?: string) {
    if (!isValidProtocol(order.protocolAddress)) {
      throw new Error("Unsupported protocol");
    }

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
      "Approving order"
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
    expirationTime: BigNumber,
    startAmount: BigNumber,
    endAmount?: BigNumber,
    waitingForBestCounterOrder = false,
    englishAuctionReservePrice?: BigNumber
  ) {
    const priceDiff =
      endAmount != null ? startAmount.minus(endAmount) : new BigNumber(0);
    const paymentToken = tokenAddress.toLowerCase();
    const isEther = tokenAddress == NULL_ADDRESS;
    const { tokens } = await this.api.getPaymentTokens({
      address: paymentToken,
    });
    const token = tokens[0];

    // Validation
    if (startAmount.isNaN() || startAmount == null || startAmount.lt(0)) {
      throw new Error(`Starting price must be a number >= 0`);
    }
    if (!isEther && !token) {
      throw new Error(`No ERC-20 token found for '${paymentToken}'`);
    }
    if (isEther && waitingForBestCounterOrder) {
      throw new Error(
        `English auctions must use wrapped ETH or an ERC-20 token.`
      );
    }
    if (isEther && orderSide === OrderSide.Buy) {
      throw new Error(`Offers must use wrapped ETH or an ERC-20 token.`);
    }
    if (priceDiff.lt(0)) {
      throw new Error(
        "End price must be less than or equal to the start price."
      );
    }
    if (priceDiff.gt(0) && expirationTime.eq(0)) {
      throw new Error(
        "Expiration time must be set if order will change in price."
      );
    }
    if (
      englishAuctionReservePrice &&
      !englishAuctionReservePrice.isZero() &&
      !waitingForBestCounterOrder
    ) {
      throw new Error("Reserve prices may only be set on English auctions.");
    }
    if (
      englishAuctionReservePrice &&
      !englishAuctionReservePrice.isZero() &&
      englishAuctionReservePrice < startAmount
    ) {
      throw new Error(
        "Reserve price must be greater than or equal to the start amount."
      );
    }

    const basePrice = toBaseUnitAmount(
      FixedNumber.from(startAmount.toString()),
      token.decimals
    );

    const endPrice = endAmount
      ? toBaseUnitAmount(FixedNumber.from(endAmount.toString()), token.decimals)
      : undefined;

    const extra = toBaseUnitAmount(
      FixedNumber.from(priceDiff.toString()),
      token.decimals
    );

    const reservePrice = englishAuctionReservePrice
      ? toBaseUnitAmount(
          FixedNumber.from(englishAuctionReservePrice.toString()),
          token.decimals
        )
      : undefined;

    return { basePrice, extra, paymentToken, reservePrice, endPrice };
  }

  private _getSchemaName(asset: Asset | OpenSeaAsset) {
    if (asset.tokenStandard) {
      return asset.tokenStandard;
    } else if ("assetContract" in asset) {
      return asset.assetContract.tokenStandard;
    }

    return undefined;
  }

  private _getSchema(tokenStandard?: TokenStandard): Schema<AssetType> {
    const tokenStandard_ = tokenStandard || TokenStandard.ERC721;

    const schema = schemas[this._networkName].filter(
      (s) => s.name == tokenStandard_
    )[0];

    if (!schema) {
      throw new Error(
        `Trading for this asset (${tokenStandard_}) is not yet supported. Please contact us or check back later!`
      );
    }
    return schema;
  }

  private _dispatch(event: EventType, data: EventData) {
    this._emitter.emit(event, data);
  }

  /**
   * Get the clients to use for a read call
   * @param retries current retry value
   */
  private _getClientsForRead({ retries }: { retries: number }): {
    web3: Web3;
  } {
    if (retries > 0) {
      // Use injected provider by default
      return {
        web3: this.web3,
      };
    } else {
      // Use provided provider as fallback
      return {
        web3: this.web3ReadOnly,
      };
    }
  }

  private async _confirmTransaction(
    transactionHash: string,
    event: EventType,
    description: string,
    testForSuccess?: () => Promise<boolean>
  ): Promise<void> {
    const transactionEventData = { transactionHash, event };
    this.logger(`Transaction started: ${description}`);

    if (transactionHash == NULL_BLOCK_HASH) {
      // This was a smart contract wallet that doesn't know the transaction
      this._dispatch(EventType.TransactionCreated, { event });

      if (!testForSuccess) {
        // Wait if test not implemented
        this.logger(`Unknown action, waiting 1 minute: ${description}`);
        await delay(60 * 1000);
        return;
      }

      return await this._pollCallbackForConfirmation(
        event,
        description,
        testForSuccess
      );
    }

    // Normal wallet
    try {
      this._dispatch(EventType.TransactionCreated, transactionEventData);
      await confirmTransaction(this.web3, transactionHash);
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

  private async _pollCallbackForConfirmation(
    event: EventType,
    description: string,
    testForSuccess: () => Promise<boolean>
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const initialRetries = 60;

      const testResolve: (r: number) => Promise<void> = async (retries) => {
        const wasSuccessful = await testForSuccess();
        if (wasSuccessful) {
          this.logger(`Transaction succeeded: ${description}`);
          this._dispatch(EventType.TransactionConfirmed, { event });
          return resolve();
        } else if (retries <= 0) {
          return reject();
        }

        if (retries % 10 == 0) {
          this.logger(
            `Tested transaction ${
              initialRetries - retries + 1
            } times: ${description}`
          );
        }
        await delay(5000);
        return testResolve(retries - 1);
      };

      return testResolve(initialRetries);
    });
  }
}
