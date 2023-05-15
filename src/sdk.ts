import { Seaport } from "@opensea/seaport-js";
import {
  ConsiderationInputItem,
  CreateInputItem,
  OrderComponents,
} from "@opensea/seaport-js/lib/types";
import { BigNumber } from "bignumber.js";
import { Web3JsProvider } from "ethereum-types";
import { ethers, providers } from "ethers";
import { EventEmitter, EventSubscription } from "fbemitter";
import * as _ from "lodash";
import Web3 from "web3";
import { WyvernProtocol } from "wyvern-js";
import { OpenSeaAPI } from "./api";
import {
  CK_ADDRESS,
  CONDUIT_KEYS_TO_CONDUIT,
  DEFAULT_GAS_INCREASE_FACTOR,
  DEFAULT_WRAPPED_NFT_LIQUIDATION_UNISWAP_SLIPPAGE_IN_BASIS_POINTS,
  ENJIN_COIN_ADDRESS,
  INVERSE_BASIS_POINT,
  MANA_ADDRESS,
  MIN_EXPIRATION_MINUTES,
  NULL_ADDRESS,
  NULL_BLOCK_HASH,
  CROSS_CHAIN_DEFAULT_CONDUIT_KEY,
  DEFAULT_ZONE_BY_NETWORK,
  ORDER_MATCHING_LATENCY_SECONDS,
  RPC_URL_PATH,
  UNISWAP_FACTORY_ADDRESS_MAINNET,
  UNISWAP_FACTORY_ADDRESS_RINKEBY,
  WETH_ADDRESS_BY_NETWORK,
  WRAPPED_NFT_FACTORY_ADDRESS_MAINNET,
  WRAPPED_NFT_FACTORY_ADDRESS_RINKEBY,
  WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_MAINNET,
  WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_RINKEBY,
  OPENSEA_LEGACY_FEE_RECIPIENT,
  MAX_UINT_256,
} from "./constants";
import {
  CanonicalWETH,
  ERC20,
  ERC721,
  getMethod,
  UniswapFactory,
  WrappedNFT,
  WrappedNFTFactory,
  WrappedNFTLiquidationProxy,
  UniswapExchange,
} from "./contracts";
import {
  constructPrivateListingCounterOrder,
  getPrivateListingConsiderations,
  getPrivateListingFulfillments,
} from "./orders/privateListings";
import { OrderV2, PostOfferResponse } from "./orders/types";
import { DEFAULT_SEAPORT_CONTRACT_ADDRESS } from "./orders/utils";
import { ERC1155Abi } from "./typechain/contracts/ERC1155Abi";
import { ERC721v3Abi } from "./typechain/contracts/ERC721v3Abi";
import { UniswapExchangeAbi } from "./typechain/contracts/UniswapExchangeAbi";
import { UniswapFactoryAbi } from "./typechain/contracts/UniswapFactoryAbi";
import { WrappedNFTAbi } from "./typechain/contracts/WrappedNFTAbi";
import { WrappedNFTFactoryAbi } from "./typechain/contracts/WrappedNFTFactoryAbi";
import {
  Asset,
  ComputedFees,
  EventData,
  EventType,
  FeeMethod,
  HowToCall,
  Network,
  OpenSeaAPIConfig,
  OpenSeaAsset,
  OpenSeaCollection,
  OpenSeaFungibleToken,
  OrderSide,
  PartialReadonlyContractAbi,
  TokenStandardVersion,
  UnhashedOrder,
  WyvernAsset,
  WyvernFTAsset,
  WyvernNFTAsset,
  WyvernSchemaName,
} from "./types";
import {
  encodeAtomicizedTransfer,
  encodeCall,
  encodeProxyCall,
  encodeTransferCall,
  schemas,
  Schema,
} from "./utils/schemas/schema";
import { getCanonicalWrappedEther, getTokens } from "./utils/tokens";
import {
  annotateERC20TransferABI,
  annotateERC721TransferABI,
  confirmTransaction,
  delay,
  estimateGas,
  getCurrentGasPrice,
  getNonCompliantApprovalAddress,
  getWyvernAsset,
  makeBigNumber,
  onDeprecated,
  rawCall,
  sendRawTransaction,
  validateAndFormatWalletAddress,
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
  // Extra gwei to add to the mean gas price when making transactions
  public gasPriceAddition = new BigNumber(3);
  // Multiply gas estimate by this factor when making transactions
  public gasIncreaseFactor = DEFAULT_GAS_INCREASE_FACTOR;

  private _networkName: Network;
  private _wyvernProtocol: WyvernProtocol;
  private _wyvernProtocolReadOnly: WyvernProtocol;
  private _wyvernConfigOverride?: OpenSeaAPIConfig["wyvernConfig"];
  private _emitter: EventEmitter;
  private _wrappedNFTFactoryAddress: string;
  private _wrappedNFTLiquidationProxyAddress: string;
  private _uniswapFactoryAddress: string;

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

    const providerOrSinger = wallet ? wallet : this.ethersProvider;

    this.seaport_v1_5 = new Seaport(providerOrSinger, {
      conduitKeyToConduit: CONDUIT_KEYS_TO_CONDUIT,
      overrides: {
        defaultConduitKey: CROSS_CHAIN_DEFAULT_CONDUIT_KEY,
      },
      seaportVersion: "1.5",
    });

    let networkForWyvernConfig = this._networkName;
    if (this._networkName == Network.Goerli) {
      networkForWyvernConfig = Network.Rinkeby;
    }

    // WyvernJS config
    this._wyvernProtocol = new WyvernProtocol(provider as Web3JsProvider, {
      network: networkForWyvernConfig,
      ...apiConfig.wyvernConfig,
    });

    // WyvernJS config for readonly (optimization for infura calls)
    this._wyvernProtocolReadOnly = useReadOnlyProvider
      ? new WyvernProtocol(readonlyProvider as Web3JsProvider, {
          network: networkForWyvernConfig,
          ...apiConfig.wyvernConfig,
        })
      : this._wyvernProtocol;

    // WrappedNFTLiquidationProxy Config
    this._wrappedNFTFactoryAddress =
      this._networkName == Network.Main
        ? WRAPPED_NFT_FACTORY_ADDRESS_MAINNET
        : WRAPPED_NFT_FACTORY_ADDRESS_RINKEBY;
    this._wrappedNFTLiquidationProxyAddress =
      this._networkName == Network.Main
        ? WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_MAINNET
        : WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_RINKEBY;
    this._uniswapFactoryAddress =
      this._networkName == Network.Main
        ? UNISWAP_FACTORY_ADDRESS_MAINNET
        : UNISWAP_FACTORY_ADDRESS_RINKEBY;

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
   * Wraps an arbitrary group of NFTs into their corresponding WrappedNFT ERC20 tokens.
   * Emits the `WrapAssets` event when the transaction is prompted.
   * @param param0 __namedParameters Object
   * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to bundle together.
   * @param accountAddress Address of the user's wallet
   */
  public async wrapAssets({
    assets,
    accountAddress,
  }: {
    assets: Asset[];
    accountAddress: string;
  }) {
    const schema = this._getSchema(WyvernSchemaName.ERC721);
    const wyAssets = assets.map((a) => getWyvernAsset(schema, a));

    // Separate assets out into two arrays of tokenIds and tokenAddresses
    const tokenIds = wyAssets.map((a) => a.id);
    const tokenAddresses = wyAssets.map((a) => a.address);

    // Check if all tokenAddresses match. If not, then we have a mixedBatch of
    // NFTs from different NFT core contracts
    const isMixedBatchOfAssets = !tokenAddresses.every(
      (val, _i, arr) => val === arr[0]
    );

    this._dispatch(EventType.WrapAssets, { assets: wyAssets, accountAddress });

    const txHash = await sendRawTransaction(
      this.web3,
      {
        from: accountAddress,
        to: this._wrappedNFTLiquidationProxyAddress,
        value: 0,
        data: encodeCall(getMethod(WrappedNFTLiquidationProxy, "wrapNFTs"), [
          tokenIds,
          tokenAddresses,
          isMixedBatchOfAssets,
        ]),
      },
      (error) => {
        this._dispatch(EventType.TransactionDenied, { error, accountAddress });
      }
    );

    await this._confirmTransaction(
      txHash,
      EventType.WrapAssets,
      "Wrapping Assets"
    );
  }

  /**
   * Unwraps an arbitrary group of NFTs from their corresponding WrappedNFT ERC20 tokens back into ERC721 tokens.
   * Emits the `UnwrapAssets` event when the transaction is prompted.
   * @param param0 __namedParameters Object
   * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to bundle together.
   * @param destinationAddresses Addresses that each resulting ERC721 token will be sent to. Must be the same length as `tokenIds`. Each address corresponds with its respective token ID in the `tokenIds` array.
   * @param accountAddress Address of the user's wallet
   */
  public async unwrapAssets({
    assets,
    destinationAddresses,
    accountAddress,
  }: {
    assets: Asset[];
    destinationAddresses: string[];
    accountAddress: string;
  }) {
    if (
      !assets ||
      !destinationAddresses ||
      assets.length != destinationAddresses.length
    ) {
      throw new Error(
        "The 'assets' and 'destinationAddresses' arrays must exist and have the same length."
      );
    }

    const schema = this._getSchema(WyvernSchemaName.ERC721);
    const wyAssets = assets.map((a) => getWyvernAsset(schema, a));

    // Separate assets out into two arrays of tokenIds and tokenAddresses
    const tokenIds = wyAssets.map((a) => a.id);
    const tokenAddresses = wyAssets.map((a) => a.address);

    // Check if all tokenAddresses match. If not, then we have a mixedBatch of
    // NFTs from different NFT core contracts
    const isMixedBatchOfAssets = !tokenAddresses.every(
      (val, _i, arr) => val === arr[0]
    );

    this._dispatch(EventType.UnwrapAssets, {
      assets: wyAssets,
      accountAddress,
    });

    const txHash = await sendRawTransaction(
      this.web3,
      {
        from: accountAddress,
        to: this._wrappedNFTLiquidationProxyAddress,
        value: 0,
        data: encodeCall(getMethod(WrappedNFTLiquidationProxy, "unwrapNFTs"), [
          tokenIds,
          tokenAddresses,
          destinationAddresses,
          isMixedBatchOfAssets,
        ]),
      },
      (error) => {
        this._dispatch(EventType.TransactionDenied, { error, accountAddress });
      }
    );

    await this._confirmTransaction(
      txHash,
      EventType.UnwrapAssets,
      "Unwrapping Assets"
    );
  }

  /**
   * Liquidates an arbitrary group of NFTs by atomically wrapping them into their
   * corresponding WrappedNFT ERC20 tokens, and then immediately selling those
   * ERC20 tokens on their corresponding Uniswap exchange.
   * Emits the `LiquidateAssets` event when the transaction is prompted.
   * @param param0 __namedParameters Object
   * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to bundle together.
   * @param accountAddress Address of the user's wallet
   * @param uniswapSlippageAllowedInBasisPoints The amount of slippage that a user will tolerate in their Uniswap trade; if Uniswap cannot fulfill the order without more slippage, the whole function will revert.
   */
  public async liquidateAssets({
    assets,
    accountAddress,
    uniswapSlippageAllowedInBasisPoints,
  }: {
    assets: Asset[];
    accountAddress: string;
    uniswapSlippageAllowedInBasisPoints: number;
  }) {
    // If no slippage parameter is provided, use a sane default value
    const uniswapSlippage =
      uniswapSlippageAllowedInBasisPoints === 0
        ? DEFAULT_WRAPPED_NFT_LIQUIDATION_UNISWAP_SLIPPAGE_IN_BASIS_POINTS
        : uniswapSlippageAllowedInBasisPoints;

    const schema = this._getSchema(WyvernSchemaName.ERC721);
    const wyAssets = assets.map((a) => getWyvernAsset(schema, a));

    // Separate assets out into two arrays of tokenIds and tokenAddresses
    const tokenIds = wyAssets.map((a) => a.id);
    const tokenAddresses = wyAssets.map((a) => a.address);

    // Check if all tokenAddresses match. If not, then we have a mixedBatch of
    // NFTs from different NFT core contracts
    const isMixedBatchOfAssets = !tokenAddresses.every(
      (val, _i, arr) => val === arr[0]
    );

    this._dispatch(EventType.LiquidateAssets, {
      assets: wyAssets,
      accountAddress,
    });

    const txHash = await sendRawTransaction(
      this.web3,
      {
        from: accountAddress,
        to: this._wrappedNFTLiquidationProxyAddress,
        value: 0,
        data: encodeCall(
          getMethod(WrappedNFTLiquidationProxy, "liquidateNFTs"),
          [tokenIds, tokenAddresses, isMixedBatchOfAssets, uniswapSlippage]
        ),
      },
      (error) => {
        this._dispatch(EventType.TransactionDenied, { error, accountAddress });
      }
    );

    await this._confirmTransaction(
      txHash,
      EventType.LiquidateAssets,
      "Liquidating Assets"
    );
  }

  /**
   * Purchases a bundle of WrappedNFT tokens from Uniswap and then unwraps them into ERC721 tokens.
   * Emits the `PurchaseAssets` event when the transaction is prompted.
   * @param param0 __namedParameters Object
   * @param numTokensToBuy The number of WrappedNFT tokens to purchase and unwrap
   * @param amount The estimated cost in wei for tokens (probably some ratio above the minimum amount to avoid the transaction failing due to frontrunning, minimum amount is found by calling UniswapExchange(uniswapAddress).getEthToTokenOutputPrice(numTokensToBuy.mul(10**18));
   * @param contractAddress Address of the corresponding NFT core contract for these NFTs.
   * @param accountAddress Address of the user's wallet
   */
  public async purchaseAssets({
    numTokensToBuy,
    amount,
    contractAddress,
    accountAddress,
  }: {
    numTokensToBuy: number;
    amount: BigNumber;
    contractAddress: string;
    accountAddress: string;
  }) {
    this._dispatch(EventType.PurchaseAssets, {
      amount,
      contractAddress,
      accountAddress,
    });

    const txHash = await sendRawTransaction(
      this.web3,
      {
        from: accountAddress,
        to: this._wrappedNFTLiquidationProxyAddress,
        value: amount,
        data: encodeCall(
          getMethod(WrappedNFTLiquidationProxy, "purchaseNFTs"),
          [numTokensToBuy, contractAddress]
        ),
      },
      (error) => {
        this._dispatch(EventType.TransactionDenied, { error, accountAddress });
      }
    );

    await this._confirmTransaction(
      txHash,
      EventType.PurchaseAssets,
      "Purchasing Assets"
    );
  }

  /**
   * Gets the estimated cost or payout of either buying or selling NFTs to Uniswap using either purchaseAssts() or liquidateAssets()
   * @param param0 __namedParameters Object
   * @param numTokens The number of WrappedNFT tokens to either purchase or sell
   * @param isBuying A bool for whether the user is buying or selling
   * @param contractAddress Address of the corresponding NFT core contract for these NFTs.
   */
  public async getQuoteFromUniswap({
    numTokens,
    isBuying,
    contractAddress,
  }: {
    numTokens: number;
    isBuying: boolean;
    contractAddress: string;
  }) {
    // Get UniswapExchange for WrappedNFTContract for contractAddress
    const wrappedNFTFactory = new this.web3.eth.Contract(
      WrappedNFTFactory,
      this._wrappedNFTFactoryAddress
    ) as unknown as WrappedNFTFactoryAbi;

    const wrappedNFTAddress: string = await wrappedNFTFactory.methods
      .nftContractToWrapperContract(contractAddress)
      .call();
    const wrappedNFT = new this.web3.eth.Contract(
      WrappedNFT,
      wrappedNFTAddress
    ) as unknown as WrappedNFTAbi;
    const uniswapFactory = new this.web3.eth.Contract(
      UniswapFactory,
      this._uniswapFactoryAddress
    ) as unknown as UniswapFactoryAbi;
    const uniswapExchangeAddress = await uniswapFactory.methods
      .getExchange(wrappedNFTAddress)
      .call();
    const uniswapExchange = new this.web3.eth.Contract(
      UniswapExchange,
      uniswapExchangeAddress
    ) as unknown as UniswapExchangeAbi;

    // Convert desired WNFT to wei
    const amount = toBaseUnitAmount(
      makeBigNumber(numTokens),
      Number(wrappedNFT.methods.decimals().call())
    );

    // Return quote from Uniswap
    if (isBuying) {
      return parseInt(
        await uniswapExchange.methods
          .getEthToTokenOutputPrice(amount.toString())
          .call()
      );
    } else {
      return parseInt(
        await uniswapExchange.methods
          .getTokenToEthInputPrice(amount.toString())
          .call()
      );
    }
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

    const amount = toBaseUnitAmount(makeBigNumber(amountInEth), token.decimals);

    this._dispatch(EventType.WrapEth, { accountAddress, amount });

    const txHash = await sendRawTransaction(
      this.web3,
      {
        from: accountAddress,
        to: token.address,
        value: amount,
        data: encodeCall(getMethod(CanonicalWETH, "deposit"), []),
      },
      (error) => {
        this._dispatch(EventType.TransactionDenied, { error, accountAddress });
      }
    );

    await this._confirmTransaction(txHash, EventType.WrapEth, "Wrapping ETH");
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

    const amount = toBaseUnitAmount(makeBigNumber(amountInEth), token.decimals);

    this._dispatch(EventType.UnwrapWeth, { accountAddress, amount });

    const txHash = await sendRawTransaction(
      this.web3,
      {
        from: accountAddress,
        to: token.address,
        value: 0,
        data: encodeCall(getMethod(CanonicalWETH, "withdraw"), [
          amount.toString(),
        ]),
      },
      (error) => {
        this._dispatch(EventType.TransactionDenied, { error, accountAddress });
      }
    );

    await this._confirmTransaction(
      txHash,
      EventType.UnwrapWeth,
      "Unwrapping W-ETH"
    );
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
    fallbackSchema?: WyvernSchemaName
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
   * Approve a non-fungible token for use in trades.
   * Requires an account to be initialized first.
   * Called internally, but exposed for dev flexibility.
   * Checks to see if already approved, first. Then tries different approval methods from best to worst.
   * @param param0 __namedParameters Object
   * @param tokenId Token id to approve, but only used if approve-all isn't
   *  supported by the token contract
   * @param tokenAddress The contract address of the token being approved
   * @param accountAddress The user's wallet address
   * @param proxyAddress Address of the user's proxy contract. If not provided,
   *  will attempt to fetch it from Wyvern.
   * @param tokenAbi ABI of the token's contract. Defaults to a flexible ERC-721
   *  contract.
   * @param skipApproveAllIfTokenAddressIn an optional list of token addresses that, if a token is approve-all type, will skip approval
   * @param schemaName The Wyvern schema name corresponding to the asset type
   * @returns Transaction hash if a new transaction was created, otherwise null
   */
  public async approveSemiOrNonFungibleToken({
    tokenId,
    tokenAddress,
    accountAddress,
    proxyAddress,
    tokenAbi = ERC721,
    skipApproveAllIfTokenAddressIn = new Set(),
    schemaName = WyvernSchemaName.ERC721,
  }: {
    tokenId: string;
    tokenAddress: string;
    accountAddress: string;
    proxyAddress?: string;
    tokenAbi?: PartialReadonlyContractAbi;
    skipApproveAllIfTokenAddressIn?: Set<string>;
    schemaName?: WyvernSchemaName;
  }): Promise<string | null> {
    const schema = this._getSchema(schemaName);
    const tokenContract = new this.web3.eth.Contract(
      tokenAbi,
      tokenAddress
    ) as unknown as ERC721v3Abi | ERC1155Abi;

    if (!proxyAddress) {
      proxyAddress = (await this._getProxy(accountAddress)) || undefined;
      if (!proxyAddress) {
        throw new Error("Uninitialized account");
      }
    }

    const approvalAllCheck = async () => {
      // NOTE:
      // Use this long way of calling so we can check for method existence on a bool-returning method.
      const isApprovedForAllRaw = await rawCall(this.web3ReadOnly, {
        from: accountAddress,
        to: tokenContract.options.address,
        data: tokenContract.methods
          .isApprovedForAll(accountAddress, proxyAddress as string)
          .encodeABI(),
      });
      return parseInt(isApprovedForAllRaw);
    };

    const isApprovedForAll = await approvalAllCheck();

    if (isApprovedForAll == 1) {
      // Supports ApproveAll
      this.logger("Already approved proxy for all tokens");
      return null;
    }

    if (isApprovedForAll == 0) {
      // Supports ApproveAll
      //  not approved for all yet

      if (skipApproveAllIfTokenAddressIn.has(tokenAddress)) {
        this.logger(
          "Already approving proxy for all tokens in another transaction"
        );
        return null;
      }
      skipApproveAllIfTokenAddressIn.add(tokenAddress);

      try {
        this._dispatch(EventType.ApproveAllAssets, {
          accountAddress,
          proxyAddress,
          contractAddress: tokenAddress,
        });

        const txHash = await sendRawTransaction(
          this.web3,
          {
            from: accountAddress,
            to: tokenContract.options.address,
            data: tokenContract.methods
              .setApprovalForAll(proxyAddress, true)
              .encodeABI(),
          },
          (error) => {
            this._dispatch(EventType.TransactionDenied, {
              error,
              accountAddress,
            });
          }
        );
        await this._confirmTransaction(
          txHash,
          EventType.ApproveAllAssets,
          "Approving all tokens of this type for trading",
          async () => {
            const result = await approvalAllCheck();
            return result == 1;
          }
        );
        return txHash;
      } catch (error) {
        console.error(error);
        throw new Error(
          "Couldn't get permission to approve these tokens for trading. Their contract might not be implemented correctly. Please contact the developer!"
        );
      }
    }

    // Does not support ApproveAll (ERC721 v1 or v2)
    this.logger("Contract does not support Approve All");

    const approvalOneCheck = async () => {
      // Note: approvedAddr will be 'undefined' if not supported
      let approvedAddr: string | undefined;
      try {
        approvedAddr = await (tokenContract as ERC721v3Abi).methods
          .getApproved(tokenId)
          .call();
        if (typeof approvedAddr === "string" && approvedAddr == "0x") {
          // Geth compatibility
          approvedAddr = undefined;
        }
      } catch (error) {
        console.error(error);
      }

      if (approvedAddr == proxyAddress) {
        this.logger("Already approved proxy for this token");
        return true;
      }
      this.logger(`Approve response: ${approvedAddr}`);

      // SPECIAL CASING non-compliant contracts
      if (!approvedAddr) {
        approvedAddr = await getNonCompliantApprovalAddress(
          // @ts-expect-error This is an actual contract instance
          tokenContract,
          tokenId,
          accountAddress
        );
        if (approvedAddr == proxyAddress) {
          this.logger("Already approved proxy for this item");
          return true;
        }
        this.logger(`Special-case approve response: ${approvedAddr}`);
      }
      return false;
    };

    const isApprovedForOne = await approvalOneCheck();
    if (isApprovedForOne) {
      return null;
    }

    // Call `approve`

    try {
      this._dispatch(EventType.ApproveAsset, {
        accountAddress,
        proxyAddress,
        asset: getWyvernAsset(schema, { tokenId, tokenAddress }),
      });

      const txHash = await sendRawTransaction(
        this.web3,
        {
          from: accountAddress,
          to: tokenContract.options.address,
          data: (tokenContract as ERC721v3Abi).methods
            .approve(proxyAddress, tokenId)
            .encodeABI(),
        },
        (error) => {
          this._dispatch(EventType.TransactionDenied, {
            error,
            accountAddress,
          });
        }
      );

      await this._confirmTransaction(
        txHash,
        EventType.ApproveAsset,
        "Approving single token for trading",
        approvalOneCheck
      );
      return txHash;
    } catch (error) {
      console.error(error);
      throw new Error(
        "Couldn't get permission to approve this token for trading. Its contract might not be implemented correctly. Please contact the developer!"
      );
    }
  }

  /**
   * Approve a fungible token (e.g. W-ETH) for use in trades.
   * Called internally, but exposed for dev flexibility.
   * Checks to see if the minimum amount is already approved, first.
   * @param param0 __namedParameters Object
   * @param accountAddress The user's wallet address
   * @param tokenAddress The contract address of the token being approved
   * @param proxyAddress The user's proxy address. If unspecified, uses the Wyvern token transfer proxy address.
   * @param minimumAmount The minimum amount needed to skip a transaction. Defaults to the max-integer.
   * @returns Transaction hash if a new transaction occurred, otherwise null
   */
  public async approveFungibleToken({
    accountAddress,
    tokenAddress,
    proxyAddress,
    minimumAmount = MAX_UINT_256,
  }: {
    accountAddress: string;
    tokenAddress: string;
    proxyAddress?: string;
    minimumAmount?: BigNumber;
  }): Promise<string | null> {
    proxyAddress =
      proxyAddress ||
      this._wyvernConfigOverride?.wyvernTokenTransferProxyContractAddress ||
      WyvernProtocol.getTokenTransferProxyAddress(this._networkName);

    const approvedAmount = await this._getApprovedTokenCount({
      accountAddress,
      tokenAddress,
      proxyAddress,
    });

    if (approvedAmount.isGreaterThanOrEqualTo(minimumAmount)) {
      this.logger("Already approved enough currency for trading");
      return null;
    }

    this.logger(
      `Not enough token approved for trade: ${approvedAmount} approved to transfer ${tokenAddress}`
    );

    this._dispatch(EventType.ApproveCurrency, {
      accountAddress,
      contractAddress: tokenAddress,
      proxyAddress,
    });

    const hasOldApproveMethod = [ENJIN_COIN_ADDRESS, MANA_ADDRESS].includes(
      tokenAddress.toLowerCase()
    );

    if (minimumAmount.isGreaterThan(0) && hasOldApproveMethod) {
      // Older erc20s require initial approval to be 0
      await this.unapproveFungibleToken({
        accountAddress,
        tokenAddress,
        proxyAddress,
      });
    }

    const txHash = await sendRawTransaction(
      this.web3,
      {
        from: accountAddress,
        to: tokenAddress,
        data: encodeCall(
          getMethod(ERC20, "approve"),
          // Always approve maximum amount, to prevent the need for followup
          // transactions (and because old ERC20s like MANA/ENJ are non-compliant)
          [proxyAddress, MAX_UINT_256.toString()]
        ),
      },
      (error) => {
        this._dispatch(EventType.TransactionDenied, { error, accountAddress });
      }
    );

    await this._confirmTransaction(
      txHash,
      EventType.ApproveCurrency,
      "Approving currency for trading",
      async () => {
        const newlyApprovedAmount = await this._getApprovedTokenCount({
          accountAddress,
          tokenAddress,
          proxyAddress,
        });
        return newlyApprovedAmount.isGreaterThanOrEqualTo(minimumAmount);
      }
    );
    return txHash;
  }

  /**
   * Un-approve a fungible token (e.g. W-ETH) for use in trades.
   * Called internally, but exposed for dev flexibility.
   * Useful for old ERC20s that require a 0 approval count before
   * changing the count
   * @param param0 __namedParameters Object
   * @param accountAddress The user's wallet address
   * @param tokenAddress The contract address of the token being approved
   * @param proxyAddress The user's proxy address. If unspecified, uses the Wyvern token transfer proxy address.
   * @returns Transaction hash
   */
  public async unapproveFungibleToken({
    accountAddress,
    tokenAddress,
    proxyAddress,
  }: {
    accountAddress: string;
    tokenAddress: string;
    proxyAddress?: string;
  }): Promise<string> {
    proxyAddress =
      proxyAddress ||
      this._wyvernConfigOverride?.wyvernTokenTransferProxyContractAddress ||
      WyvernProtocol.getTokenTransferProxyAddress(this._networkName);

    const txHash = await sendRawTransaction(
      this.web3,
      {
        from: accountAddress,
        to: tokenAddress,
        data: encodeCall(getMethod(ERC20, "approve"), [proxyAddress, 0]),
      },
      (error) => {
        this._dispatch(EventType.TransactionDenied, { error, accountAddress });
      }
    );

    await this._confirmTransaction(
      txHash,
      EventType.UnapproveCurrency,
      "Resetting Currency Approval",
      async () => {
        const newlyApprovedAmount = await this._getApprovedTokenCount({
          accountAddress,
          tokenAddress,
          proxyAddress,
        });
        return newlyApprovedAmount.isZero();
      }
    );
    return txHash;
  }

  /**
   * Register a domain on the Domain Registry contract.
   * @param domain The string domain to be hashed and registered on the Registry.
   * @returns Transaction hash
   */
  public async setDomain(domain: string): Promise<string> {
    const transaction = await this.seaport_v1_5.setDomain(domain).transact();

    await transaction.wait();

    return transaction.hash;
  }

  /**
   * Get the domain for a specific tag at a given index.
   * @param tag The tag to look up.
   * @param index The index of the domain to return.
   * @returns Domain
   */
  public async getDomain(tag: string, index: number): Promise<string> {
    return this.seaport_v1_5.getDomain(tag, index);
  }

  /**
   * Get the full array of domains for a specific tag.
   * @param tag The tag to look up.
   * @returns Array of domains
   */
  public async getDomains(tag: string): Promise<string[]> {
    return this.seaport_v1_5.getDomains(tag);
  }

  /**
   * Get the number of registered domains for a specific tag.
   * @param tag The tag to look up.
   * @returns Number of registered domains for input tag.
   */
  public async getNumberOfDomains(tag: string): Promise<BigNumber> {
    return new BigNumber(this.seaport_v1_5.getNumberOfDomains(tag).toString());
  }

  /**
   * Gets the current price for the order.
   */
  public async getCurrentPrice({
    order,
  }: {
    order: OrderV2;
  }): Promise<BigNumber> {
    return new BigNumber(order.currentPrice);
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
   * Returns whether an asset is transferrable.
   * An asset may not be transferrable if its transfer function
   * is locked for some reason, e.g. an item is being rented within a game
   * or trading has been locked for an item type.
   * @param param0 __namedParameters Object
   * @param tokenId DEPRECATED: Token ID. Use `asset` instead.
   * @param tokenAddress DEPRECATED: Address of the token's contract. Use `asset` instead.
   * @param asset The asset to trade
   * @param fromAddress The account address that currently owns the asset
   * @param toAddress The account address that will be acquiring the asset
   * @param quantity The amount of the asset to transfer, if it's fungible (optional). In units (not base units), e.g. not wei.
   * @param useProxy Use the `fromAddress`'s proxy contract only if the `fromAddress` has already approved the asset for sale. Required if checking an ERC-721 v1 asset (like CryptoKitties) that doesn't check if the transferFrom caller is the owner of the asset (only allowing it if it's an approved address).
   * @param retries How many times to retry if false
   */
  public async isAssetTransferrable(
    {
      asset,
      fromAddress,
      toAddress,
      quantity,
      useProxy = false,
    }: {
      asset: Asset;
      fromAddress: string;
      toAddress: string;
      quantity?: number | BigNumber;
      useProxy?: boolean;
    },
    retries = 1
  ): Promise<boolean> {
    const schema = this._getSchema(this._getSchemaName(asset));
    const quantityBN = quantity
      ? toBaseUnitAmount(makeBigNumber(quantity), asset.decimals || 0)
      : makeBigNumber(1);
    const wyAsset = getWyvernAsset(schema, asset, quantityBN);
    const abi = schema.functions.transfer(wyAsset);

    let from = fromAddress;
    if (useProxy) {
      const proxyAddress = await this._getProxy(fromAddress);
      if (!proxyAddress) {
        console.error(
          `This asset's owner (${fromAddress}) does not have a proxy!`
        );
        return false;
      }
      from = proxyAddress;
    }

    const data = encodeTransferCall(abi, fromAddress, toAddress);

    try {
      const gas = await estimateGas(this._getClientsForRead({ retries }).web3, {
        from,
        to: abi.target,
        data,
      });
      return gas > 0;
    } catch (error) {
      if (retries <= 0) {
        console.error(error);
        console.error(from, abi.target, data);
        return false;
      }
      await delay(500);
      return await this.isAssetTransferrable(
        { asset, fromAddress, toAddress, quantity, useProxy },
        retries - 1
      );
    }
  }

  /**
   * Transfer a fungible or non-fungible asset to another address
   * @param param0 __namedParamaters Object
   * @param fromAddress The owner's wallet address
   * @param toAddress The recipient's wallet address
   * @param asset The fungible or non-fungible asset to transfer
   * @param quantity The amount of the asset to transfer, if it's fungible (optional). In units (not base units), e.g. not wei.
   * @returns Transaction hash
   */
  public async transfer({
    fromAddress,
    toAddress,
    asset,
    quantity = 1,
  }: {
    fromAddress: string;
    toAddress: string;
    asset: Asset;
    quantity?: number | BigNumber;
  }): Promise<string> {
    const schema = this._getSchema(this._getSchemaName(asset));
    const quantityBN = toBaseUnitAmount(
      makeBigNumber(quantity),
      asset.decimals || 0
    );
    const wyAsset = getWyvernAsset(schema, asset, quantityBN);
    const isCryptoKitties = [CK_ADDRESS].includes(wyAsset.address);
    // Since CK is common, infer isOldNFT from it in case user
    // didn't pass in `version`
    const isOldNFT =
      isCryptoKitties ||
      (!!asset.version &&
        [TokenStandardVersion.ERC721v1, TokenStandardVersion.ERC721v2].includes(
          asset.version
        ));

    const abi =
      this._getSchemaName(asset) === WyvernSchemaName.ERC20
        ? annotateERC20TransferABI(wyAsset as WyvernFTAsset)
        : isOldNFT
        ? annotateERC721TransferABI(wyAsset as WyvernNFTAsset)
        : schema.functions.transfer(wyAsset);

    this._dispatch(EventType.TransferOne, {
      accountAddress: fromAddress,
      toAddress,
      asset: wyAsset,
    });

    const data = encodeTransferCall(abi, fromAddress, toAddress);
    const txHash = await sendRawTransaction(
      this.web3,
      {
        from: fromAddress,
        to: abi.target,
        data,
      },
      (error) => {
        this._dispatch(EventType.TransactionDenied, {
          error,
          accountAddress: fromAddress,
        });
      }
    );

    await this._confirmTransaction(
      txHash,
      EventType.TransferOne,
      `Transferring asset`
    );
    return txHash;
  }

  /**
   * Transfer one or more assets to another address.
   * ERC-721 and ERC-1155 assets are supported
   * @param param0 __namedParamaters Object
   * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to transfer.
   * @param fromAddress The owner's wallet address
   * @param toAddress The recipient's wallet address
   * @param schemaName The Wyvern schema name corresponding to the asset type, if not in each Asset definition
   * @returns Transaction hash
   */
  public async transferAll({
    assets,
    fromAddress,
    toAddress,
    schemaName = WyvernSchemaName.ERC721,
  }: {
    assets: Asset[];
    fromAddress: string;
    toAddress: string;
    schemaName?: WyvernSchemaName;
  }): Promise<string> {
    toAddress = validateAndFormatWalletAddress(this.web3, toAddress);

    const schemaNames = assets.map(
      (asset) => this._getSchemaName(asset) || schemaName
    );
    const wyAssets = assets.map((asset) =>
      getWyvernAsset(this._getSchema(this._getSchemaName(asset)), asset)
    );

    const { calldata, target } = encodeAtomicizedTransfer(
      schemaNames.map((name) => this._getSchema(name)),
      wyAssets,
      fromAddress,
      toAddress,
      this._wyvernProtocol,
      this._networkName
    );

    let proxyAddress = await this._getProxy(fromAddress);
    if (!proxyAddress) {
      proxyAddress = await this._initializeProxy(fromAddress);
    }

    await this._approveAll({
      schemaNames,
      wyAssets,
      accountAddress: fromAddress,
      proxyAddress,
    });

    this._dispatch(EventType.TransferAll, {
      accountAddress: fromAddress,
      toAddress,
      assets: wyAssets,
    });

    const txHash = await sendRawTransaction(
      this.web3,
      {
        from: fromAddress,
        to: proxyAddress,
        data: encodeProxyCall(target, HowToCall.DelegateCall, calldata),
      },
      (error) => {
        this._dispatch(EventType.TransactionDenied, {
          error,
          accountAddress: fromAddress,
        });
      }
    );

    await this._confirmTransaction(
      txHash,
      EventType.TransferAll,
      `Transferring ${assets.length} asset${assets.length == 1 ? "" : "s"}`
    );
    return txHash;
  }

  /**
   * Get known payment tokens (ERC-20) that match your filters.
   * @param param0 __namedParameters Object
   * @param symbol Filter by the ERC-20 symbol for the token,
   *    e.g. "DAI" for Dai stablecoin
   * @param address Filter by the ERC-20 contract address for the token,
   *    e.g. "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359" for Dai
   * @param name Filter by the name of the ERC-20 contract.
   *    Not guaranteed to exist or be unique for each token type.
   *    e.g. '' for Dai and 'Decentraland' for MANA
   * FUTURE: officiallySupported: Filter for tokens that are
   *    officially supported and shown on opensea.io
   */
  public async getFungibleTokens({
    symbol,
    address,
    name,
  }: { symbol?: string; address?: string; name?: string } = {}): Promise<
    OpenSeaFungibleToken[]
  > {
    onDeprecated("Use `api.getPaymentTokens` instead");

    const tokenSettings = getTokens(this._networkName);

    const { tokens } = await this.api.getPaymentTokens({
      symbol,
      address,
      name,
    });

    const offlineTokens: OpenSeaFungibleToken[] = [
      tokenSettings.canonicalWrappedEther,
      ...tokenSettings.otherTokens,
    ].filter((t) => {
      if (symbol != null && t.symbol.toLowerCase() != symbol.toLowerCase()) {
        return false;
      }
      if (address != null && t.address.toLowerCase() != address.toLowerCase()) {
        return false;
      }
      if (name != null && t.name != name) {
        return false;
      }
      return true;
    });

    return [...offlineTokens, ...tokens];
  }

  /**
   * Get an account's balance of any Asset.
   * @param param0 __namedParameters Object
   * @param accountAddress Account address to check
   * @param asset The Asset to check balance for
   * @param retries How many times to retry if balance is 0
   */
  public async getAssetBalance(
    { accountAddress, asset }: { accountAddress: string; asset: Asset },
    retries = 1
  ): Promise<BigNumber> {
    const schema = this._getSchema(this._getSchemaName(asset));
    const wyAsset = getWyvernAsset(schema, asset);

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
      return await this.getAssetBalance({ accountAddress, asset }, retries - 1);
    }
  }

  /**
   * Get the balance of a fungible token.
   * Convenience method for getAssetBalance for fungibles
   * @param param0 __namedParameters Object
   * @param accountAddress Account address to check
   * @param tokenAddress The address of the token to check balance for
   * @param schemaName Optional schema name for the fungible token
   * @param retries Number of times to retry if balance is undefined
   */
  public async getTokenBalance(
    {
      accountAddress,
      tokenAddress,
      schemaName = WyvernSchemaName.ERC20,
    }: {
      accountAddress: string;
      tokenAddress: string;
      schemaName?: WyvernSchemaName;
    },
    retries = 1
  ) {
    const asset: Asset = {
      tokenId: null,
      tokenAddress,
      schemaName,
    };
    return this.getAssetBalance({ accountAddress, asset }, retries);
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
   * DEPRECATED: ERC-1559
   * https://eips.ethereum.org/EIPS/eip-1559
   * Compute the gas price for sending a txn, in wei
   * Will be slightly above the mean to make it faster
   */
  public async _computeGasPrice(): Promise<BigNumber> {
    const meanGas = await getCurrentGasPrice(this.web3);
    const weiToAdd = this.web3.utils.toWei(
      this.gasPriceAddition.toString(),
      "gwei"
    );
    return meanGas.plus(weiToAdd);
  }

  /**
   * Compute the gas amount for sending a txn
   * Will be slightly above the result of estimateGas to make it more reliable
   * @param estimation The result of estimateGas for a transaction
   */
  public _correctGasAmount(estimation: number): number {
    return Math.ceil(estimation * this.gasIncreaseFactor);
  }

  /**
   * Get the proxy address for a user's wallet.
   * Internal method exposed for dev flexibility.
   * @param accountAddress The user's wallet address
   * @param retries Optional number of retries to do
   * @param wyvernProtocol optional wyvern protocol override
   */
  public async _getProxy(
    accountAddress: string,
    retries = 0
  ): Promise<string | null> {
    let proxyAddress: string | null =
      await this._wyvernProtocolReadOnly.wyvernProxyRegistry
        .proxies(accountAddress)
        .callAsync();

    if (proxyAddress == "0x") {
      throw new Error(
        "Couldn't retrieve your account from the blockchain - make sure you're on the correct Ethereum network!"
      );
    }

    if (!proxyAddress || proxyAddress == NULL_ADDRESS) {
      if (retries > 0) {
        await delay(1000);
        return await this._getProxy(accountAddress, retries - 1);
      }
      proxyAddress = null;
    }
    return proxyAddress;
  }

  /**
   * Initialize the proxy for a user's wallet.
   * Proxies are used to make trades on behalf of the order's maker so that
   *  trades can happen when the maker isn't online.
   * Internal method exposed for dev flexibility.
   * @param accountAddress The user's wallet address
   * @param wyvernProtocol optional wyvern protocol override
   */
  public async _initializeProxy(accountAddress: string): Promise<string> {
    this._dispatch(EventType.InitializeAccount, { accountAddress });
    this.logger(`Initializing proxy for account: ${accountAddress}`);

    const txnData = { from: accountAddress };
    const gasEstimate = await this._wyvernProtocol.wyvernProxyRegistry
      .registerProxy()
      .estimateGasAsync(txnData);
    const transactionHash = await this._wyvernProtocol.wyvernProxyRegistry
      .registerProxy()
      .sendTransactionAsync({
        ...txnData,
        gas: this._correctGasAmount(gasEstimate),
      });

    await this._confirmTransaction(
      transactionHash,
      EventType.InitializeAccount,
      "Initializing proxy for account",
      async () => {
        const polledProxy = await this._getProxy(accountAddress, 0);
        return !!polledProxy;
      }
    );

    const proxyAddress = await this._getProxy(accountAddress, 10);
    if (!proxyAddress) {
      throw new Error(
        "Failed to initialize your account :( Please restart your wallet/browser and try again!"
      );
    }

    return proxyAddress;
  }

  /**
   * For a fungible token to use in trades (like W-ETH), get the amount
   *  approved for use by the Wyvern transfer proxy.
   * Internal method exposed for dev flexibility.
   * @param param0 __namedParameters Object
   * @param accountAddress Address for the user's wallet
   * @param tokenAddress Address for the token's contract
   * @param proxyAddress User's proxy address. If undefined, uses the token transfer proxy address
   */
  public async _getApprovedTokenCount({
    accountAddress,
    tokenAddress,
    proxyAddress,
  }: {
    accountAddress: string;
    tokenAddress?: string;
    proxyAddress?: string;
  }) {
    if (!tokenAddress) {
      tokenAddress = getCanonicalWrappedEther(this._networkName).address;
    }
    const addressToApprove =
      proxyAddress ||
      this._wyvernConfigOverride?.wyvernTokenTransferProxyContractAddress ||
      WyvernProtocol.getTokenTransferProxyAddress(this._networkName);
    const approved = await rawCall(this.web3, {
      from: accountAddress,
      to: tokenAddress,
      data: encodeCall(getMethod(ERC20, "allowance"), [
        accountAddress,
        addressToApprove,
      ]),
    });
    return makeBigNumber(approved);
  }

  // For creating email whitelists on order takers
  public async _createEmailWhitelistEntry({
    order,
    buyerEmail,
  }: {
    order: UnhashedOrder;
    buyerEmail: string;
  }) {
    const asset = "asset" in order.metadata ? order.metadata.asset : undefined;
    if (!asset || !asset.id) {
      throw new Error("Whitelisting only available for non-fungible assets.");
    }
    await this.api.postAssetWhitelist(asset.address, asset.id, buyerEmail);
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

  public async _approveAll({
    schemaNames,
    wyAssets,
    accountAddress,
    proxyAddress,
  }: {
    schemaNames: WyvernSchemaName[];
    wyAssets: WyvernAsset[];
    accountAddress: string;
    proxyAddress?: string;
  }) {
    proxyAddress =
      proxyAddress || (await this._getProxy(accountAddress, 0)) || undefined;
    if (!proxyAddress) {
      proxyAddress = await this._initializeProxy(accountAddress);
    }
    const contractsWithApproveAll: Set<string> = new Set();

    return Promise.all(
      wyAssets.map(async (wyAsset, i) => {
        const schemaName = schemaNames[i];
        // Verify that the taker owns the asset
        let isOwner;
        try {
          isOwner = await this._ownsAssetOnChain({
            accountAddress,
            proxyAddress,
            wyAsset,
            schemaName,
          });
        } catch (error) {
          // let it through for assets we don't support yet
          isOwner = true;
        }
        if (!isOwner) {
          const minAmount = "quantity" in wyAsset ? wyAsset.quantity : 1;
          console.error(
            `Failed on-chain ownership check: ${accountAddress} on ${schemaName}:`,
            wyAsset
          );
          throw new Error(
            `You don't own enough to do that (${minAmount} base units of ${
              wyAsset.address
            }${wyAsset.id ? " token " + wyAsset.id : ""})`
          );
        }
        switch (schemaName) {
          case WyvernSchemaName.ERC721:
          case WyvernSchemaName.ERC721v3:
          case WyvernSchemaName.ERC1155:
          case WyvernSchemaName.LegacyEnjin:
          case WyvernSchemaName.ENSShortNameAuction:
            // Handle NFTs and SFTs
            // eslint-disable-next-line no-case-declarations
            const wyNFTAsset = wyAsset as WyvernNFTAsset;
            return await this.approveSemiOrNonFungibleToken({
              tokenId: wyNFTAsset.id.toString(),
              tokenAddress: wyNFTAsset.address,
              accountAddress,
              proxyAddress,
              schemaName,
              skipApproveAllIfTokenAddressIn: contractsWithApproveAll,
            });
          case WyvernSchemaName.ERC20:
            // Handle FTs
            // eslint-disable-next-line no-case-declarations
            const wyFTAsset = wyAsset as WyvernFTAsset;
            if (contractsWithApproveAll.has(wyFTAsset.address)) {
              // Return null to indicate no tx occurred
              return null;
            }
            contractsWithApproveAll.add(wyFTAsset.address);
            return await this.approveFungibleToken({
              tokenAddress: wyFTAsset.address,
              accountAddress,
              proxyAddress,
            });
          // For other assets, including contracts:
          // Send them to the user's proxy
          // if (where != WyvernAssetLocation.Proxy) {
          //   return this.transferOne({
          //     schemaName: schema.name,
          //     asset: wyAsset,
          //     isWyvernAsset: true,
          //     fromAddress: accountAddress,
          //     toAddress: proxy
          //   })
          // }
          // return true
        }
      })
    );
  }

  /**
   * Check if an account, or its proxy, owns an asset on-chain
   * @param accountAddress Account address for the wallet
   * @param proxyAddress Proxy address for the account
   * @param wyAsset asset to check. If fungible, the `quantity` attribute will be the minimum amount to own
   * @param schemaName WyvernSchemaName for the asset
   */
  public async _ownsAssetOnChain({
    accountAddress,
    proxyAddress,
    wyAsset,
    schemaName,
  }: {
    accountAddress: string;
    proxyAddress?: string | null;
    wyAsset: WyvernAsset;
    schemaName: WyvernSchemaName;
  }): Promise<boolean> {
    const asset: Asset = {
      tokenId: wyAsset.id || null,
      tokenAddress: wyAsset.address,
      schemaName,
    };

    const minAmount = new BigNumber(
      "quantity" in wyAsset ? wyAsset.quantity : 1
    );

    const accountBalance = await this.getAssetBalance({
      accountAddress,
      asset,
    });
    if (accountBalance.isGreaterThanOrEqualTo(minAmount)) {
      return true;
    }

    proxyAddress = proxyAddress || (await this._getProxy(accountAddress));
    if (proxyAddress) {
      const proxyBalance = await this.getAssetBalance({
        accountAddress: proxyAddress,
        asset,
      });
      if (proxyBalance.isGreaterThanOrEqualTo(minAmount)) {
        return true;
      }
    }

    return false;
  }

  public _getBuyFeeParameters(
    totalBuyerFeeBasisPoints: number,
    totalSellerFeeBasisPoints: number,
    sellOrder?: UnhashedOrder
  ) {
    this._validateFees(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints);

    let makerRelayerFee;
    let takerRelayerFee;

    if (sellOrder) {
      // Use the sell order's fees to ensure compatiblity and force the order
      // to only be acceptable by the sell order maker.
      // Swap maker/taker depending on whether it's an English auction (taker)
      // TODO add extraBountyBasisPoints when making bidder bounties
      makerRelayerFee = sellOrder.waitingForBestCounterOrder
        ? makeBigNumber(sellOrder.makerRelayerFee)
        : makeBigNumber(sellOrder.takerRelayerFee);
      takerRelayerFee = sellOrder.waitingForBestCounterOrder
        ? makeBigNumber(sellOrder.takerRelayerFee)
        : makeBigNumber(sellOrder.makerRelayerFee);
    } else {
      makerRelayerFee = makeBigNumber(totalBuyerFeeBasisPoints);
      takerRelayerFee = makeBigNumber(totalSellerFeeBasisPoints);
    }

    return {
      makerRelayerFee,
      takerRelayerFee,
      makerProtocolFee: makeBigNumber(0),
      takerProtocolFee: makeBigNumber(0),
      makerReferrerFee: makeBigNumber(0), // TODO use buyerBountyBPS
      feeRecipient: OPENSEA_LEGACY_FEE_RECIPIENT,
      feeMethod: FeeMethod.SplitFee,
    };
  }

  /**
   * Validate fee parameters
   * @param totalBuyerFeeBasisPoints Total buyer fees
   * @param totalSellerFeeBasisPoints Total seller fees
   */
  private _validateFees(
    totalBuyerFeeBasisPoints: number,
    totalSellerFeeBasisPoints: number
  ) {
    const maxFeePercent = INVERSE_BASIS_POINT / 100;

    if (
      totalBuyerFeeBasisPoints > INVERSE_BASIS_POINT ||
      totalSellerFeeBasisPoints > INVERSE_BASIS_POINT
    ) {
      throw new Error(
        `Invalid buyer/seller fees: must be less than ${maxFeePercent}%`
      );
    }

    if (totalBuyerFeeBasisPoints < 0 || totalSellerFeeBasisPoints < 0) {
      throw new Error(`Invalid buyer/seller fees: must be at least 0%`);
    }
  }

  /**
   * Get the listing and expiration time parameters for a new order
   * @param expirationTimestamp Timestamp to expire the order (in seconds), or 0 for non-expiring
   * @param listingTimestamp Timestamp to start the order (in seconds), or undefined to start it now
   * @param waitingForBestCounterOrder Whether this order should be hidden until the best match is found
   */
  private _getTimeParameters({
    expirationTimestamp = getMaxOrderExpirationTimestamp(),
    listingTimestamp,
    waitingForBestCounterOrder = false,
    isMatchingOrder = false,
  }: {
    expirationTimestamp?: number;
    listingTimestamp?: number;
    waitingForBestCounterOrder?: boolean;
    isMatchingOrder?: boolean;
  }) {
    const maxExpirationTimeStamp = getMaxOrderExpirationTimestamp();

    const minListingTimestamp = Math.round(Date.now() / 1000);

    if (!isMatchingOrder && expirationTimestamp === 0) {
      throw new Error("Expiration time cannot be 0");
    }
    if (listingTimestamp && listingTimestamp < minListingTimestamp) {
      throw new Error("Listing time cannot be in the past.");
    }
    if (listingTimestamp && listingTimestamp >= expirationTimestamp) {
      throw new Error("Listing time must be before the expiration time.");
    }

    if (waitingForBestCounterOrder && listingTimestamp) {
      throw new Error(`Cannot schedule an English auction for the future.`);
    }
    if (parseInt(expirationTimestamp.toString()) != expirationTimestamp) {
      throw new Error(`Expiration timestamp must be a whole number of seconds`);
    }
    if (expirationTimestamp > maxExpirationTimeStamp) {
      throw new Error("Expiration time must not exceed six months from now");
    }

    if (waitingForBestCounterOrder) {
      listingTimestamp = expirationTimestamp;
      // Expire one week from now, to ensure server can match it
      // Later, this will expire closer to the listingTime
      expirationTimestamp =
        expirationTimestamp + ORDER_MATCHING_LATENCY_SECONDS;

      // The minimum expiration time has to be at least fifteen minutes from now
      const minEnglishAuctionListingTimestamp =
        minListingTimestamp + MIN_EXPIRATION_MINUTES * 60;

      if (
        !isMatchingOrder &&
        listingTimestamp < minEnglishAuctionListingTimestamp
      ) {
        throw new Error(
          `Expiration time must be at least ${MIN_EXPIRATION_MINUTES} minutes from now`
        );
      }
    } else {
      // Small offset to account for latency
      listingTimestamp =
        listingTimestamp || Math.round(Date.now() / 1000 - 100);

      // The minimum expiration time has to be at least fifteen minutes from now
      const minExpirationTimestamp =
        listingTimestamp + MIN_EXPIRATION_MINUTES * 60;

      if (!isMatchingOrder && expirationTimestamp < minExpirationTimestamp) {
        throw new Error(
          `Expiration time must be at least ${MIN_EXPIRATION_MINUTES} minutes from the listing date`
        );
      }
    }

    return {
      listingTime: makeBigNumber(listingTimestamp),
      expirationTime: makeBigNumber(expirationTimestamp),
    };
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

    // Note: toBaseUnitAmount(makeBigNumber(startAmount), token.decimals)
    // will fail if too many decimal places, so special-case ether
    const basePrice = isEther
      ? makeBigNumber(
          this.web3.utils.toWei(startAmount.toString(), "ether")
        ).integerValue()
      : toBaseUnitAmount(startAmount, token.decimals);

    const endPrice = endAmount
      ? isEther
        ? makeBigNumber(
            this.web3.utils.toWei(endAmount.toString(), "ether")
          ).integerValue()
        : toBaseUnitAmount(endAmount, token.decimals)
      : undefined;

    const extra = isEther
      ? makeBigNumber(
          this.web3.utils.toWei(priceDiff.toString(), "ether")
        ).integerValue()
      : toBaseUnitAmount(priceDiff, token.decimals);

    const reservePrice = englishAuctionReservePrice
      ? isEther
        ? makeBigNumber(
            this.web3.utils.toWei(
              englishAuctionReservePrice.toString(),
              "ether"
            )
          ).integerValue()
        : toBaseUnitAmount(englishAuctionReservePrice, token.decimals)
      : undefined;

    return { basePrice, extra, paymentToken, reservePrice, endPrice };
  }

  private _getSchemaName(asset: Asset | OpenSeaAsset) {
    if (asset.schemaName) {
      return asset.schemaName;
    } else if ("assetContract" in asset) {
      return asset.assetContract.schemaName;
    }

    return undefined;
  }

  private _getSchema(schemaName?: WyvernSchemaName): Schema<WyvernAsset> {
    const schemaName_ = schemaName || WyvernSchemaName.ERC721;

    const schema = schemas[this._networkName].filter(
      (s) => s.name == schemaName_
    )[0];

    if (!schema) {
      throw new Error(
        `Trading for this asset (${schemaName_}) is not yet supported. Please contact us or check back later!`
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
   * @param wyvernProtocol optional wyvern protocol to use, has default
   * @param wyvernProtocol optional readonly wyvern protocol to use, has default
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

  /**
   * Returns whether or not an authenticated proxy is revoked for a specific account address
   * @param accountAddress
   * @returns
   */
  public async isAuthenticatedProxyRevoked(
    accountAddress: string
  ): Promise<boolean> {
    const proxy = await this._wyvernProtocol.getAuthenticatedProxy(
      accountAddress
    );

    return proxy.revoked().callAsync();
  }

  /**
   * Revokes an authenticated proxy's access i.e. for freezing listings
   * @param accountAddress
   * @returns transaction hash
   */
  public async revokeAuthenticatedProxyAccess(
    accountAddress: string
  ): Promise<string> {
    const proxy = await this._wyvernProtocol.getAuthenticatedProxy(
      accountAddress
    );
    return proxy.setRevoke(true).sendTransactionAsync({ from: accountAddress });
  }

  /**
   * Unrevokes an authenticated proxy's access i.e. for unfreezing listings
   * @param accountAddress
   * @returns transaction hash
   */
  public async unrevokeAuthenticatedProxyAccess(
    accountAddress: string
  ): Promise<string> {
    const proxy = await this._wyvernProtocol.getAuthenticatedProxy(
      accountAddress
    );
    return proxy.setRevoke(false).sendTransactionAsync({
      from: accountAddress,
    });
  }
}
