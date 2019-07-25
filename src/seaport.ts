import * as Web3 from 'web3'
import { WyvernProtocol } from 'wyvern-js'
import * as WyvernSchemas from 'wyvern-schemas'
import * as _ from 'lodash'
import { OpenSeaAPI } from './api'
import { CanonicalWETH, ERC20, ERC721, getMethod } from './contracts'
import { ECSignature, FeeMethod, HowToCall, Network, OpenSeaAPIConfig, OrderSide, SaleKind, UnhashedOrder, Order, UnsignedOrder, PartialReadonlyContractAbi, EventType, EventData, OpenSeaAsset, WyvernSchemaName, WyvernAtomicMatchParameters, FungibleToken, WyvernAsset, OpenSeaFees, Asset, OpenSeaAssetContract, WyvernAssetLocation, WyvernNFTAsset, WyvernFTAsset, NFTVersion } from './types'
import {
  confirmTransaction, findAsset,
  makeBigNumber, orderToJSON,
  personalSignAsync,
  sendRawTransaction, estimateCurrentPrice, INVERSE_BASIS_POINT, getOrderHash,
  getCurrentGasPrice, delay, assignOrdersToSides, estimateGas, NULL_ADDRESS,
  DEFAULT_BUYER_FEE_BASIS_POINTS, DEFAULT_SELLER_FEE_BASIS_POINTS, MAX_ERROR_LENGTH,
  DEFAULT_GAS_INCREASE_FACTOR,
  MIN_EXPIRATION_SECONDS,
  OPENSEA_FEE_RECIPIENT,
  encodeAtomicizedTransfer,
  encodeProxyCall,
  NULL_BLOCK_HASH,
  SELL_ORDER_BATCH_SIZE,
  RINKEBY_PROVIDER_URL,
  MAINNET_PROVIDER_URL,
  OPENSEA_SELLER_BOUNTY_BASIS_POINTS,
  DEFAULT_MAX_BOUNTY,
  validateAndFormatWalletAddress,
  ORDER_MATCHING_LATENCY_SECONDS,
  getWyvernBundle,
  getWyvernNFTAsset,
  encodeTransferCall,
  getTransferFeeSettings,
  rawCall,
  promisifyCall,
  annotateERC721TransferABI,
  CK_ADDRESS,
  CK_RINKEBY_ADDRESS,
} from './utils'
import { BigNumber } from 'bignumber.js'
import { EventEmitter, EventSubscription } from 'fbemitter'
import { isValidAddress } from 'ethereumjs-util'
import { AnnotatedFunctionABI } from 'wyvern-js/lib/types'

export class OpenSeaPort {

  // Web3 instance to use
  public web3: Web3
  // Logger function to use when debugging
  public logger: (arg: string) => void
  // API instance on this seaport
  public readonly api: OpenSeaAPI
  // Extra gwei to add to the mean gas price when making transactions
  public gasPriceAddition = new BigNumber(3)
  // Multiply gas estimate by this factor when making transactions
  public gasIncreaseFactor = DEFAULT_GAS_INCREASE_FACTOR

  private _networkName: Network
  private _wyvernProtocol: WyvernProtocol
  private _wyvernProtocolReadOnly: WyvernProtocol
  private _emitter: EventEmitter

  /**
   * Your very own seaport.
   * Create a new instance of OpenSeaJS.
   * @param provider Web3 Provider to use for transactions. For example:
   *  `const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')`
   * @param apiConfig configuration options, including `networkName`
   * @param logger logger, optional, a function that will be called with debugging
   *  information
   */
  constructor(provider: Web3.Provider, apiConfig: OpenSeaAPIConfig = {}, logger?: (arg: string) => void) {

    apiConfig.networkName = apiConfig.networkName || Network.Main
    apiConfig.gasPrice = apiConfig.gasPrice || makeBigNumber(300000)

    // API config
    this.api = new OpenSeaAPI(apiConfig)

    // Web3 Config
    this.web3 = new Web3(provider)
    this._networkName = apiConfig.networkName

    // WyvernJS config
    this._wyvernProtocol = new WyvernProtocol(provider, {
      network: this._networkName,
      gasPrice: apiConfig.gasPrice,
    })

    // WyvernJS config for readonly (optimization for infura calls)
    const readonlyProvider = new Web3.providers.HttpProvider(this._networkName == Network.Main ? MAINNET_PROVIDER_URL : RINKEBY_PROVIDER_URL)
    this._wyvernProtocolReadOnly = new WyvernProtocol(readonlyProvider, {
      network: this._networkName,
      gasPrice: apiConfig.gasPrice,
    })

    // Emit events
    this._emitter = new EventEmitter()

    // Debugging: default to nothing
    this.logger = logger || ((arg: string) => arg)
  }

  /**
   * Add a listener to a marketplace event
   * @param event An event to listen for
   * @param listener A callback that will accept an object with event data
   * @param once Whether the listener should only be called once
   */
  public addListener(event: EventType, listener: (data: EventData) => void, once = false): EventSubscription {
    const subscription = once
      ? this._emitter.once(event, listener)
      : this._emitter.addListener(event, listener)
    return subscription
  }

  /**
   * Remove an event listener, included here for completeness.
   * Simply calls `.remove()` on a subscription
   * @param subscription The event subscription returned from `addListener`
   */
  public removeListener(subscription: EventSubscription) {
    subscription.remove()
  }

  /**
   * Remove all event listeners. Good idea to call this when you're unmounting
   * a component that listens to events to make UI updates
   * @param event Optional EventType to remove listeners for
   */
  public removeAllListeners(event?: EventType) {
    this._emitter.removeAllListeners(event)
  }

  /**
   * Wrap ETH into W-ETH.
   * W-ETH is needed for placing buy orders (making offers).
   * Emits the `WrapEth` event when the transaction is prompted.
   * @param param0 __namedParameters Object
   * @param amountInEth How much ether to wrap
   * @param accountAddress Address of the user's wallet containing the ether
   */
  public async wrapEth(
      { amountInEth, accountAddress }:
      { amountInEth: number; accountAddress: string }
    ) {

    const token = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther

    const amount = WyvernProtocol.toBaseUnitAmount(makeBigNumber(amountInEth), token.decimals)

    this._dispatch(EventType.WrapEth, { accountAddress, amount })

    const gasPrice = await this._computeGasPrice()
    const txHash = await sendRawTransaction(this.web3, {
      from: accountAddress,
      to: token.address,
      value: amount,
      data: WyvernSchemas.encodeCall(getMethod(CanonicalWETH, 'deposit'), []),
      gasPrice
    }, error => {
      this._dispatch(EventType.TransactionDenied, { error, accountAddress })
    })

    await this._confirmTransaction(txHash, EventType.WrapEth, "Wrapping ETH")
  }

  /**
   * Unwrap W-ETH into ETH.
   * Emits the `UnwrapWeth` event when the transaction is prompted.
   * @param param0 __namedParameters Object
   * @param amountInEth How much W-ETH to unwrap
   * @param accountAddress Address of the user's wallet containing the W-ETH
   */
  public async unwrapWeth(
      { amountInEth, accountAddress }:
      { amountInEth: number; accountAddress: string }
    ) {

    const token = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther

    const amount = WyvernProtocol.toBaseUnitAmount(makeBigNumber(amountInEth), token.decimals)

    this._dispatch(EventType.UnwrapWeth, { accountAddress, amount })

    const gasPrice = await this._computeGasPrice()
    const txHash = await sendRawTransaction(this.web3, {
      from: accountAddress,
      to: token.address,
      value: 0,
      data: WyvernSchemas.encodeCall(getMethod(CanonicalWETH, 'withdraw'), [amount.toString()]),
      gasPrice
    }, error => {
      this._dispatch(EventType.TransactionDenied, { error, accountAddress })
    })

    await this._confirmTransaction(txHash, EventType.UnwrapWeth, "Unwrapping W-ETH")
  }

  /**
   * Create a buy order to make an offer on a bundle or group of assets.
   * Will throw an 'Insufficient balance' error if the maker doesn't have enough W-ETH to make the offer.
   * If the user hasn't approved W-ETH access yet, this will emit `ApproveCurrency` before asking for approval.
   * @param param0 __namedParameters Object
   * @param tokenIds Token IDs of the assets.
   * @param tokenAddresses Addresses of the tokens' contracts. Must be the same length as `tokenIds`. Each address corresponds with its respective token ID in the `tokenIds` array.
   * @param accountAddress Address of the maker's wallet
   * @param startAmount Value of the offer, in units of the payment token (or wrapped ETH if no payment token address specified)
   * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire"
   * @param paymentTokenAddress Optional address for using an ERC-20 token in the order. If unspecified, defaults to W-ETH
   * @param sellOrder Optional sell order (like an English auction) to ensure fee compatibility
   * @param schemaName The Wyvern schema name corresponding to the asset type
   */
  public async createBundleBuyOrder(
      { tokenIds, tokenAddresses, accountAddress, startAmount, expirationTime = 0, paymentTokenAddress, sellOrder, schemaName = WyvernSchemaName.ERC721 }:
      { tokenIds: string[];
        tokenAddresses: string[];
        accountAddress: string;
        startAmount: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
        sellOrder?: Order;
        schemaName?: WyvernSchemaName; }
    ): Promise<Order> {

    if (!tokenIds || !tokenAddresses || tokenIds.length != tokenAddresses.length) {
      throw new Error("The 'tokenIds' and 'tokenAddresses' arrays must exist and have the same length.")
    }

    const assets: Asset[] = _.zipWith(tokenIds, tokenAddresses, (tokenId, tokenAddress) => {
      return { tokenAddress, tokenId }
    })

    paymentTokenAddress = paymentTokenAddress || WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address

    const order = await this._makeBundleBuyOrder({
      assets,
      accountAddress,
      startAmount,
      expirationTime,
      paymentTokenAddress,
      extraBountyBasisPoints: 0,
      sellOrder,
      schemaName
    })

    // NOTE not in Wyvern exchange code:
    // frontend checks to make sure
    // token is approved and sufficiently available
    await this._buyOrderValidationAndApprovals({ order, accountAddress })

    const hashedOrder = {
      ...order,
      hash: getOrderHash(order)
    }
    let signature
    try {
      signature = await this._authorizeOrder(hashedOrder)
    } catch (error) {
      console.error(error)
      throw new Error("You declined to authorize your offer")
    }

    const orderWithSignature = {
      ...hashedOrder,
      ...signature
    }
    return this.validateAndPostOrder(orderWithSignature)
  }

  /**
   * Create a buy order to make an offer on an asset.
   * Will throw an 'Insufficient balance' error if the maker doesn't have enough W-ETH to make the offer.
   * If the user hasn't approved W-ETH access yet, this will emit `ApproveCurrency` before asking for approval.
   * @param param0 __namedParameters Object
   * @param tokenId Token ID
   * @param tokenAddress Address of the token's contract
   * @param accountAddress Address of the maker's wallet
   * @param startAmount Value of the offer, in units of the payment token (or wrapped ETH if no payment token address specified)
   * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire"
   * @param paymentTokenAddress Optional address for using an ERC-20 token in the order. If unspecified, defaults to W-ETH
   * @param sellOrder Optional sell order (like an English auction) to ensure fee compatibility
   * @param schemaName The Wyvern schema name corresponding to the asset type
   */
  public async createBuyOrder(
      { tokenId, tokenAddress, accountAddress, startAmount, expirationTime = 0, paymentTokenAddress, sellOrder, schemaName = WyvernSchemaName.ERC721 }:
      { tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        startAmount: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
        sellOrder?: Order;
        schemaName?: WyvernSchemaName; }
    ): Promise<Order> {

    const asset: Asset = { tokenAddress, tokenId }

    paymentTokenAddress = paymentTokenAddress || WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address

    const order = await this._makeBuyOrder({
      asset,
      accountAddress,
      startAmount,
      expirationTime,
      paymentTokenAddress,
      extraBountyBasisPoints: 0,
      sellOrder,
      schemaName
    })

    // NOTE not in Wyvern exchange code:
    // frontend checks to make sure
    // token is approved and sufficiently available
    await this._buyOrderValidationAndApprovals({ order, accountAddress })

    const hashedOrder = {
      ...order,
      hash: getOrderHash(order)
    }
    let signature
    try {
      signature = await this._authorizeOrder(hashedOrder)
    } catch (error) {
      console.error(error)
      throw new Error("You declined to authorize your offer")
    }

    const orderWithSignature = {
      ...hashedOrder,
      ...signature
    }
    return this.validateAndPostOrder(orderWithSignature)
  }

  /**
   * Create a sell order to auction an asset.
   * Will throw a 'You do not own this asset' error if the maker doesn't have the asset.
   * If the user hasn't approved access to the token yet, this will emit `ApproveAllAssets` (or `ApproveAsset` if the contract doesn't support approve-all) before asking for approval.
   * @param param0 __namedParameters Object
   * @param tokenId Token ID
   * @param tokenAddress Address of the token's contract
   * @param accountAddress Address of the maker's wallet
   * @param startAmount Price of the asset at the start of the auction. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
   * @param endAmount Optional price of the asset at the end of its expiration time. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
   * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
   * @param waitForHighestBid If set to true, this becomes an English auction that increases in price for every bid. The highest bid wins when the auction expires, as long as it's at least `startAmount`. `expirationTime` must be > 0.
   * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
   * @param extraBountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of this order
   * @param buyerAddress Optional address that's allowed to purchase this item. If specified, no other address will be able to take the order, unless its value is the null address.
   * @param buyerEmail Optional email of the user that's allowed to purchase this item. If specified, a user will have to verify this email before being able to take the order.
   * @param schemaName The Wyvern schema name corresponding to the asset type
   */
  public async createSellOrder(
      { tokenId, tokenAddress, accountAddress, startAmount, endAmount, expirationTime = 0, waitForHighestBid = false, paymentTokenAddress, extraBountyBasisPoints = 0, buyerAddress, buyerEmail, schemaName = WyvernSchemaName.ERC721 }:
      { tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        expirationTime?: number;
        waitForHighestBid?: boolean;
        paymentTokenAddress?: string;
        extraBountyBasisPoints?: number;
        buyerAddress?: string;
        buyerEmail?: string;
        schemaName?: WyvernSchemaName; }
    ): Promise<Order> {

    const asset = { tokenAddress, tokenId }

    const order = await this._makeSellOrder({
      asset,
      accountAddress,
      startAmount,
      endAmount,
      expirationTime,
      waitForHighestBid,
      paymentTokenAddress: paymentTokenAddress || NULL_ADDRESS,
      extraBountyBasisPoints,
      buyerAddress: buyerAddress || NULL_ADDRESS,
      schemaName
    })

    await this._sellOrderValidationAndApprovals({ order, accountAddress })

    if (buyerEmail) {
      await this._createEmailWhitelistEntry({ order, buyerEmail })
    }

    const hashedOrder = {
      ...order,
      hash: getOrderHash(order)
    }
    let signature
    try {
      signature = await this._authorizeOrder(hashedOrder)
    } catch (error) {
      console.error(error)
      throw new Error("You declined to authorize your auction")
    }

    const orderWithSignature = {
      ...hashedOrder,
      ...signature
    }

    return this.validateAndPostOrder(orderWithSignature)
  }

  /**
   * Create multiple sell orders in bulk to auction assets out of an asset factory.
   * Will throw a 'You do not own this asset' error if the maker doesn't own the factory.
   * Items will mint to users' wallets only when they buy them. See https://docs.opensea.io/docs/opensea-initial-item-sale-tutorial for more info.
   * If the user hasn't approved access to the token yet, this will emit `ApproveAllAssets` (or `ApproveAsset` if the contract doesn't support approve-all) before asking for approval.
   * @param param0 __namedParameters Object
   * @param assetId Identifier for the asset, if you just want to post orders for one asset.
   * @param assetIds Identifiers for the assets, if you want to post orders for many assets at once.
   * @param factoryAddress Address of the factory contract
   * @param accountAddress Address of the factory owner's wallet
   * @param startAmount Price of the asset at the start of the auction, or minimum acceptable bid if it's an English auction. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
   * @param endAmount Optional price of the asset at the end of its expiration time. If not specified, will be set to `startAmount`. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
   * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
   * @param waitForHighestBid If set to true, this becomes an English auction that increases in price for every bid. The highest bid wins when the auction expires, as long as it's at least `startAmount`. `expirationTime` must be > 0.
   * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
   * @param extraBountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of each order
   * @param buyerAddress Optional address that's allowed to purchase each item. If specified, no other address will be able to take each order.
   * @param buyerEmail Optional email of the user that's allowed to purchase each item. If specified, a user will have to verify this email before being able to take each order.
   * @param numberOfOrders Number of times to repeat creating the same order for each asset. If greater than 5, creates them in batches of 5. Requires an `apiKey` to be set during seaport initialization in order to not be throttled by the API.
   */
  public async createFactorySellOrders(
      { assetId, assetIds, factoryAddress, accountAddress, startAmount, endAmount, expirationTime = 0, waitForHighestBid = false, paymentTokenAddress, extraBountyBasisPoints = 0, buyerAddress, buyerEmail, numberOfOrders = 1, schemaName = WyvernSchemaName.ERC721 }:
      { assetId?: string;
        assetIds?: string[];
        factoryAddress: string;
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        expirationTime?: number;
        waitForHighestBid?: boolean;
        paymentTokenAddress?: string;
        extraBountyBasisPoints?: number;
        buyerAddress?: string;
        buyerEmail?: string;
        numberOfOrders?: number;
        schemaName?: WyvernSchemaName }
    ): Promise<Order[]> {

    if (numberOfOrders < 1) {
      throw new Error('Need to make at least one sell order')
    }

    const factoryIds = assetIds || (assetId ? [ assetId ] : [])
    if (!factoryIds.length) {
      throw new Error('Need either one assetId or an array of assetIds')
    }

    const assets: Asset[] = factoryIds.map(tokenId => ({ tokenAddress: factoryAddress, tokenId }))

    // Validate just a single dummy order but don't post it
    const dummyOrder = await this._makeSellOrder({
      asset: assets[0],
      accountAddress,
      startAmount,
      endAmount,
      expirationTime,
      waitForHighestBid,
      paymentTokenAddress: paymentTokenAddress || NULL_ADDRESS,
      extraBountyBasisPoints,
      buyerAddress: buyerAddress || NULL_ADDRESS,
      schemaName
    })
    await this._sellOrderValidationAndApprovals({ order: dummyOrder, accountAddress })

    const _makeAndPostOneSellOrder = async (asset: Asset) => {
      const order = await this._makeSellOrder({
        asset,
        accountAddress,
        startAmount,
        endAmount,
        expirationTime,
        waitForHighestBid,
        paymentTokenAddress: paymentTokenAddress || NULL_ADDRESS,
        extraBountyBasisPoints,
        buyerAddress: buyerAddress || NULL_ADDRESS,
        schemaName
      })

      if (buyerEmail) {
        await this._createEmailWhitelistEntry({ order, buyerEmail })
      }

      const hashedOrder = {
        ...order,
        hash: getOrderHash(order)
      }
      let signature
      try {
        signature = await this._authorizeOrder(hashedOrder)
      } catch (error) {
        console.error(error)
        throw new Error("You declined to authorize your auction, or your web3 provider can't sign using personal_sign. Try 'web3-provider-engine' and make sure a mnemonic is set. Just a reminder: there's no gas needed anymore to mint tokens!")
      }

      const orderWithSignature = {
        ...hashedOrder,
        ...signature
      }

      return this.validateAndPostOrder(orderWithSignature)
    }

    const range = _.range(numberOfOrders * assets.length)
    const batches  = _.chunk(range, SELL_ORDER_BATCH_SIZE)
    let allOrdersCreated: Order[] = []

    // 2 orders, 10 assets
    // range = [0, 1, 2, 3, 4, ... 19]

    for (const subRange of batches) {
      // subRange = e.g. [5, 6, 7, 8, 9]
      // batches of assets = e.g. [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, ... 10]

      // Will block until all SELL_ORDER_BATCH_SIZE orders
      // have come back in parallel
      const batchOrdersCreated = await Promise.all(subRange.map(async assetOrderIndex => {
        const assetIndex = Math.floor(assetOrderIndex / numberOfOrders)
        return _makeAndPostOneSellOrder(assets[assetIndex])
      }))

      this.logger(`Created and posted a batch of ${batchOrdersCreated.length} orders in parallel.`)

      allOrdersCreated = [
        ...allOrdersCreated,
        ...batchOrdersCreated
      ]

      // Don't overwhelm router
      await delay(1000)
    }

    return allOrdersCreated
  }

  /**
   * Create a sell order to auction a bundle of assets.
   * Will throw a 'You do not own this asset' error if the maker doesn't have one of the assets.
   * If the user hasn't approved access to any of the assets yet, this will emit `ApproveAllAssets` (or `ApproveAsset` if the contract doesn't support approve-all) before asking for approval for each asset.
   * @param param0 __namedParameters Object
   * @param bundleName Name of the bundle
   * @param bundleDescription Optional description of the bundle. Markdown is allowed.
   * @param bundleExternalLink Optional link to a page that adds context to the bundle.
   * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to bundle together.
   * @param accountAddress The address of the maker of the bundle and the owner of all the assets.
   * @param startAmount Price of the asset at the start of the auction, or minimum acceptable bid if it's an English auction.
   * @param endAmount Optional price of the asset at the end of its expiration time. If not specified, will be set to `startAmount`.
   * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
   * @param waitForHighestBid If set to true, this becomes an English auction that increases in price for every bid. The highest bid wins when the auction expires, as long as it's at least `startAmount`. `expirationTime` must be > 0.
   * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
   * @param extraBountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of this order
   * @param buyerAddress Optional address that's allowed to purchase this bundle. If specified, no other address will be able to take the order, unless it's the null address.
   * @param schemaName The Wyvern schema name corresponding to the asset type
   */
  public async createBundleSellOrder(
      { bundleName, bundleDescription, bundleExternalLink, assets, accountAddress, startAmount, endAmount, expirationTime = 0, waitForHighestBid = false, paymentTokenAddress, extraBountyBasisPoints = 0, buyerAddress, schemaName = WyvernSchemaName.ERC721 }:
      { bundleName: string;
        bundleDescription?: string;
        bundleExternalLink?: string;
        assets: Asset[];
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        expirationTime?: number;
        waitForHighestBid?: boolean;
        paymentTokenAddress?: string;
        extraBountyBasisPoints?: number;
        buyerAddress?: string;
        schemaName?: WyvernSchemaName; }
    ): Promise<Order> {

    const order = await this._makeBundleSellOrder({
      bundleName,
      bundleDescription,
      bundleExternalLink,
      assets,
      accountAddress,
      startAmount,
      endAmount,
      expirationTime,
      waitForHighestBid,
      paymentTokenAddress: paymentTokenAddress || NULL_ADDRESS,
      extraBountyBasisPoints,
      buyerAddress: buyerAddress || NULL_ADDRESS,
      schemaName
    })

    await this._sellOrderValidationAndApprovals({ order, accountAddress })

    const hashedOrder = {
      ...order,
      hash: getOrderHash(order)
    }
    let signature
    try {
      signature = await this._authorizeOrder(hashedOrder)
    } catch (error) {
      console.error(error)
      throw new Error("You declined to authorize your auction")
    }

    const orderWithSignature = {
      ...hashedOrder,
      ...signature
    }

    return this.validateAndPostOrder(orderWithSignature)
  }

  /**
   * Fullfill or "take" an order for an asset, either a buy or sell order
   * @param param0 __namedParamaters Object
   * @param order The order to fulfill, a.k.a. "take"
   * @param accountAddress The taker's wallet address
   * @param referrerAddress The optional address that referred the order
   */
  public async fulfillOrder(
      { order, accountAddress, referrerAddress }:
      { order: Order;
        accountAddress: string;
        referrerAddress?: string }
    ) {
    const matchingOrder = this._makeMatchingOrder({ order, accountAddress })

    const { buy, sell } = assignOrdersToSides(order, matchingOrder)

    const metadata = this._getMetadata(order, referrerAddress)
    const transactionHash = await this._atomicMatch({ buy, sell, accountAddress, metadata })

    await this._confirmTransaction(transactionHash.toString(), EventType.MatchOrders, "Fulfilling order", async () => {
      const isOpen = await this._validateOrder(order)
      return !isOpen
    })
  }

  /**
   * Cancel an order on-chain, preventing it from ever being fulfilled.
   * @param param0 __namedParameters Object
   * @param order The order to cancel
   * @param accountAddress The order maker's wallet address
   */
  public async cancelOrder(
      { order, accountAddress }:
      { order: Order;
        accountAddress: string}
    ) {

    this._dispatch(EventType.CancelOrder, { order, accountAddress })

    const gasPrice = await this._computeGasPrice()
    const transactionHash = await this._wyvernProtocol.wyvernExchange.cancelOrder_.sendTransactionAsync(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      order.v || 0,
      order.r || NULL_BLOCK_HASH,
      order.s || NULL_BLOCK_HASH,
      { from: accountAddress, gasPrice })

    await this._confirmTransaction(transactionHash.toString(), EventType.CancelOrder, "Cancelling order", async () => {
      const isOpen = await this._validateOrder(order)
      return !isOpen
    })
  }

  /**
   * Approve a non-fungible token for use in trades.
   * Requires an account to be initialized first.
   * Called internally, but exposed for dev flexibility.
   * Checks to see if already approved, first. Then tries different approval methods from best to worst.
   * @param param0 __namedParamters Object
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
  public async approveNonFungibleToken(
      { tokenId, tokenAddress, accountAddress, proxyAddress = null, tokenAbi = ERC721, skipApproveAllIfTokenAddressIn = [], schemaName = WyvernSchemaName.ERC721 }:
      { tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        proxyAddress: string | null;
        tokenAbi?: PartialReadonlyContractAbi;
        skipApproveAllIfTokenAddressIn?: string[];
        schemaName?: WyvernSchemaName; }
    ): Promise<string | null> {

    const schema = this._getSchema(schemaName)
    const tokenContract = this.web3.eth.contract(tokenAbi as any[])
    const erc721 = await tokenContract.at(tokenAddress)

    if (!proxyAddress) {
      proxyAddress = await this._getProxy(accountAddress)
      if (!proxyAddress) {
        throw new Error('Uninitialized account')
      }
    }

    const approvalAllCheck = async () => {
      // NOTE:
      // Use this long way of calling so we can check for method existence on a bool-returning method.
      const isApprovedForAllRaw = await rawCall(this.web3, {
        from: accountAddress,
        to: erc721.address,
        data: erc721.isApprovedForAll.getData(accountAddress, proxyAddress)
      })
      return parseInt(isApprovedForAllRaw)
    }
    const isApprovedForAll = await approvalAllCheck()

    if (isApprovedForAll == 1) {
      // Supports ApproveAll
      this.logger('Already approved proxy for all tokens')
      return null
    }

    if (isApprovedForAll == 0) {
      // Supports ApproveAll
      //  not approved for all yet

      if (skipApproveAllIfTokenAddressIn.includes(tokenAddress)) {
        this.logger('Already approving proxy for all tokens in another transaction')
        return null
      }
      skipApproveAllIfTokenAddressIn.push(tokenAddress)

      try {
        this._dispatch(EventType.ApproveAllAssets, {
          accountAddress,
          proxyAddress,
          contractAddress: tokenAddress
        })

        const gasPrice = await this._computeGasPrice()
        const txHash = await sendRawTransaction(this.web3, {
          from: accountAddress,
          to: erc721.address,
          data: erc721.setApprovalForAll.getData(proxyAddress, true),
          gasPrice
        }, error => {
          this._dispatch(EventType.TransactionDenied, { error, accountAddress })
        })
        await this._confirmTransaction(txHash, EventType.ApproveAllAssets, 'Approving all tokens of this type for trading', async () => {
          const result = await approvalAllCheck()
          return result == 1
        })
        return txHash
      } catch (error) {
        console.error(error)
        throw new Error("Couldn't get permission to approve these tokens for trading. Their contract might not be implemented correctly. Please contact the developer!")
      }
    }

    // Does not support ApproveAll (ERC721 v1 or v2)
    this.logger('Contract does not support Approve All')

    const approvalOneCheck = async () => {
      // Note: approvedAddr will be '0x' if not supported
      let approvedAddr = await promisifyCall<string>(c => erc721.getApproved.call(tokenId, c))
      if (approvedAddr == proxyAddress) {
        this.logger('Already approved proxy for this token')
        return true
      }
      this.logger(`Approve response: ${approvedAddr}`)

      // SPECIAL CASING

      if (!approvedAddr) {
        // CRYPTOKITTIES check
        approvedAddr = await promisifyCall<string>(c => erc721.kittyIndexToApproved.call(tokenId, c))
        if (approvedAddr == proxyAddress) {
          this.logger('Already approved proxy for this kitty')
          return true
        }
        this.logger(`CryptoKitties approve response: ${approvedAddr}`)
      }

      if (!approvedAddr) {
        // ETHEREMON check
        approvedAddr = await promisifyCall<string>(c => erc721.allowed.call(accountAddress, tokenId, c))
        if (approvedAddr == proxyAddress) {
          this.logger('Already allowed proxy for this Etheremon')
          return true
        }
        this.logger(`"allowed" response: ${approvedAddr}`)
      }
      return false
    }

    const isApprovedForOne = await approvalOneCheck()
    if (isApprovedForOne) {
      return null
    }

    // Call `approve`

    try {
      this._dispatch(EventType.ApproveAsset, {
        accountAddress,
        proxyAddress,
        asset: getWyvernNFTAsset(schema, tokenId, tokenAddress)
      })

      const gasPrice = await this._computeGasPrice()
      const txHash = await sendRawTransaction(this.web3, {
        from: accountAddress,
        to: erc721.address,
        data: erc721.approve.getData(proxyAddress, tokenId),
        gasPrice
      }, error => {
        this._dispatch(EventType.TransactionDenied, { error, accountAddress })
      })

      await this._confirmTransaction(txHash, EventType.ApproveAsset, "Approving single token for trading", approvalOneCheck)
      return txHash
    } catch (error) {
      console.error(error)
      throw new Error("Couldn't get permission to approve this token for trading. Its contract might not be implemented correctly. Please contact the developer!")
    }
  }

  /**
   * Approve a fungible token (e.g. W-ETH) for use in trades.
   * Called internally, but exposed for dev flexibility.
   * Checks to see if the minimum amount is already approved, first.
   * @param param0 __namedParamters Object
   * @param accountAddress The user's wallet address
   * @param tokenAddress The contract address of the token being approved
   * @param minimumAmount The minimum amount needed to skip a transaction. Defaults to the max-integer.
   * @returns Transaction hash if a new transaction occurred, otherwise null
   */
  public async approveFungibleToken(
      { accountAddress, tokenAddress, minimumAmount = WyvernProtocol.MAX_UINT_256 }:
      { accountAddress: string;
        tokenAddress: string;
        minimumAmount?: BigNumber }
    ): Promise<string | null> {
    const approvedAmount = await this._getApprovedTokenCount({ accountAddress, tokenAddress })
    if (approvedAmount.toNumber() >= minimumAmount.toNumber()) {
      this.logger('Already approved enough currency for trading')
      return null
    }
    this.logger(`Not enough token approved for trade: ${approvedAmount}`)

    const contractAddress = WyvernProtocol.getTokenTransferProxyAddress(this._networkName)

    this._dispatch(EventType.ApproveCurrency, {
      accountAddress,
      contractAddress: tokenAddress
    })

    const gasPrice = await this._computeGasPrice()
    const txHash = await sendRawTransaction(this.web3, {
      from: accountAddress,
      to: tokenAddress,
      data: WyvernSchemas.encodeCall(getMethod(ERC20, 'approve'),
        [contractAddress, WyvernProtocol.MAX_UINT_256.toString()]),
      gasPrice
    }, error => {
      this._dispatch(EventType.TransactionDenied, { error, accountAddress })
    })

    await this._confirmTransaction(txHash, EventType.ApproveCurrency, "Approving currency for trading")
    return txHash
  }

  /**
   * Gets the price for the order using the contract
   * @param order The order to calculate the price for
   */
  public async getCurrentPrice(order: Order) {

    const currentPrice = await this._wyvernProtocolReadOnly.wyvernExchange.calculateCurrentPrice_.callAsync(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
    )
    return currentPrice
  }

  /**
   * Returns whether an order is fulfillable.
   * An order may not be fulfillable if a target item's transfer function
   * is locked for some reason, e.g. an item is being rented within a game
   * or trading has been locked for an item type.
   * @param param0 __namedParamters Object
   * @param order Order to check
   * @param accountAddress The account address that will be fulfilling the order
   * @param referrerAddress The optional address that referred the order
   * @param retries How many times to retry if false
   */
  public async isOrderFulfillable(
      { order, accountAddress, referrerAddress }:
      { order: Order;
        accountAddress: string;
        referrerAddress?: string },
      retries = 1
    ): Promise<boolean> {

    const matchingOrder = this._makeMatchingOrder({ order, accountAddress })

    const { buy, sell } = assignOrdersToSides(order, matchingOrder)

    try {
      // TODO check calldataCanMatch too?
      // const isValid = await this._validateMatch({ buy, sell, accountAddress })
      const metadata = this._getMetadata(order, referrerAddress)
      const gas = await this._estimateGasForMatch({ buy, sell, accountAddress, metadata })

      this.logger(`Gas estimate for ${order.side == OrderSide.Sell ? "sell" : "buy"} order: ${gas}`)

      return gas > 0

    } catch (error) {

      if (retries <= 0) {
        console.error(error)
        return false
      }
      await delay(500)
      return this.isOrderFulfillable({ order, accountAddress, referrerAddress }, retries - 1)
    }
  }

  /**
   * Returns whether an asset is transferrable.
   * An asset may not be transferrable if its transfer function
   * is locked for some reason, e.g. an item is being rented within a game
   * or trading has been locked for an item type.
   * @param param0 __namedParamters Object
   * @param tokenId ID of the token to check
   * @param tokenAddress Address of the token's contract
   * @param fromAddress The account address that currently owns the asset
   * @param toAddress The account address that will be acquiring the asset
   * @param didOwnerApprove If the owner and fromAddress has already approved the asset for sale. Required if checking an ERC-721 v1 asset (like CryptoKitties) that doesn't check if the transferFrom caller is the owner of the asset (only allowing it if it's an approved address).
   * @param schemaName The Wyvern schema name corresponding to the asset type
   * @param retries How many times to retry if false
   */
  public async isAssetTransferrable(
    { tokenId, tokenAddress, fromAddress, toAddress, didOwnerApprove = false, schemaName = WyvernSchemaName.ERC721 }:
    { tokenId: string;
      tokenAddress: string;
      fromAddress: string;
      toAddress: string;
      didOwnerApprove?: boolean;
      schemaName?: WyvernSchemaName; },
    retries = 1
  ): Promise<boolean> {

    const schema = this._getSchema(schemaName)
    const wyAsset = getWyvernNFTAsset(schema, tokenId, tokenAddress)
    const abi = schema.functions.transfer(wyAsset)

    let from = fromAddress
    if (didOwnerApprove) {
      const proxyAddress = await this._getProxy(fromAddress)
      if (!proxyAddress) {
        console.error(`This asset's owner (${fromAddress}) does not have a proxy!`)
        return false
      }
      from = proxyAddress
    }

    try {

      const gas = await estimateGas(this.web3, {
        from,
        to: abi.target,
        data: encodeTransferCall(abi, fromAddress, toAddress)
      })
      return gas > 0

    } catch (error) {

      if (retries <= 0) {
        console.error(error)
        return false
      }
      await delay(500)
      return this.isAssetTransferrable({ tokenId, tokenAddress, fromAddress, toAddress, didOwnerApprove, schemaName }, retries - 1)
    }
  }

  /**
   * DEPRECATED: use `transfer` instead, which works for
   * more types of assets (including fungibles and old
   * non-fungibles).
   * Transfer an NFT asset to another address
   * @param param0 __namedParamaters Object
   * @param asset The asset to transfer
   * @param fromAddress The owner's wallet address
   * @param toAddress The recipient's wallet address
   * @param isWyvernAsset Whether the passed asset is a generic WyvernAsset, for backwards compatibility
   * @param schemaName The Wyvern schema name corresponding to the asset type
   * @returns Transaction hash
   */
  public async transferOne(
      { asset, fromAddress, toAddress, isWyvernAsset = false, schemaName = WyvernSchemaName.ERC721 }:
      { asset: Asset | WyvernAsset;
        fromAddress: string;
        toAddress: string;
        isWyvernAsset?: boolean;
        schemaName?: WyvernSchemaName; }
    ): Promise<string> {

    const schema = this._getSchema(schemaName)
    let wyAsset
    if (isWyvernAsset) {
      wyAsset = asset as WyvernAsset
    } else {
      const openseaAsset = asset as Asset
      wyAsset = getWyvernNFTAsset(schema, openseaAsset.tokenId, openseaAsset.tokenAddress)
    }

    const abi = schema.functions.transfer(wyAsset)

    this._dispatch(EventType.TransferOne, { accountAddress: fromAddress, toAddress, asset })

    const gasPrice = await this._computeGasPrice()
    const txHash = await sendRawTransaction(this.web3, {
      from: fromAddress,
      to: abi.target,
      data: encodeTransferCall(abi, fromAddress, toAddress),
      gasPrice
    }, error => {
      this._dispatch(EventType.TransactionDenied, { error, accountAddress: fromAddress })
    })

    await this._confirmTransaction(txHash, EventType.TransferOne, `Transferring asset`)
    return txHash
  }

  /**
   * Transfer a fungible or non-fungible asset to another address
   * @param param0 __namedParamaters Object
   * @param fromAddress The owner's wallet address
   * @param toAddress The recipient's wallet address
   * @param asset The fungible or non-fungible asset to transfer
   * @param quantity The amount of the asset to transfer, if it's fungible (optional)
   * @param schemaName The Wyvern schema name corresponding to the asset type.
   * Defaults to "ERC721" (non-fungible) assets, but can be ERC1155, ERC20, and others.
   * @returns Transaction hash
   */
  public async transfer(
      { fromAddress, toAddress, asset,
        quantity = 1, schemaName = WyvernSchemaName.ERC721 }:
      { fromAddress: string;
        toAddress: string;
        asset: Asset | FungibleToken;
        quantity?: number;
        schemaName?: WyvernSchemaName; }
    ): Promise<string> {

    const schema = this._getSchema(schemaName)
    const wyAsset = 'tokenId' in asset
      ? getWyvernNFTAsset(schema, asset.tokenId, asset.tokenAddress)
      : { address: asset.address }
    const isCryptoKitties = wyAsset.address in [CK_ADDRESS, CK_RINKEBY_ADDRESS]
    // Since CK is common, infer isOldNFT from it in case user
    // didn't pass in `nftVersion`
    const isOldNFT = isCryptoKitties || [NFTVersion.ERC721v1, NFTVersion.ERC721v2].includes((asset as any).nftVersion)

    let abi: AnnotatedFunctionABI

    if (quantity != 1) {

      if (!schema.functions.transferQuantity) {
        throw new Error("This asset is non-fungible and does not support transferring quantities.")
      }
      abi = schema.functions.transferQuantity(wyAsset, quantity)

    } else if (isOldNFT && 'id' in wyAsset) {
      // TODO: why does typescript need 'id' in wyAsset? redundant
      abi = annotateERC721TransferABI(wyAsset)

    } else {

      abi = schema.functions.transfer(wyAsset)

    }

    this._dispatch(EventType.TransferOne, { accountAddress: fromAddress, toAddress, asset })

    const gasPrice = await this._computeGasPrice()
    const txHash = await sendRawTransaction(this.web3, {
      from: fromAddress,
      to: abi.target,
      data: encodeTransferCall(abi, fromAddress, toAddress),
      gasPrice
    }, error => {
      this._dispatch(EventType.TransactionDenied, { error, accountAddress: fromAddress })
    })

    await this._confirmTransaction(txHash, EventType.TransferOne, `Transferring asset`)
    return txHash
  }

  /**
   * Transfer one or more assets to another address.
   * ERC-721 and ERC-1155 assets are supported
   * @param param0 __namedParamaters Object
   * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to transfer.
   * @param fromAddress The owner's wallet address
   * @param toAddress The recipient's wallet address
   * @param schemaName The Wyvern schema name corresponding to the asset type
   * @returns Transaction hash
   */
  public async transferAll(
      { assets, fromAddress, toAddress, schemaName = WyvernSchemaName.ERC721 }:
      { assets: Asset[];
        fromAddress: string;
        toAddress: string;
        schemaName?: WyvernSchemaName; }
    ): Promise<string> {

    toAddress = validateAndFormatWalletAddress(this.web3, toAddress)

    const schema = this._getSchema(schemaName)
    const wyAssets = assets.map(asset => getWyvernNFTAsset(schema, asset.tokenId, asset.tokenAddress))

    const { calldata } = encodeAtomicizedTransfer(schema, wyAssets, fromAddress, toAddress, this._wyvernProtocol.wyvernAtomicizer)

    let proxyAddress = await this._getProxy(fromAddress)
    if (!proxyAddress) {
      proxyAddress = await this._initializeProxy(fromAddress)
    }

    await this._approveAll({schema, wyAssets, accountAddress: fromAddress, proxyAddress})

    this._dispatch(EventType.TransferAll, { accountAddress: fromAddress, toAddress, assets })

    const gasPrice = await this._computeGasPrice()
    const txHash = await sendRawTransaction(this.web3, {
      from: fromAddress,
      to: proxyAddress,
      data: encodeProxyCall(WyvernProtocol.getAtomicizerContractAddress(this._networkName), HowToCall.DelegateCall, calldata),
      gasPrice
    }, error => {
      this._dispatch(EventType.TransactionDenied, { error, accountAddress: fromAddress })
    })

    await this._confirmTransaction(txHash, EventType.TransferAll, `Transferring ${assets.length} asset${assets.length == 1 ? '' : 's'}`)
    return txHash
  }

  /**
   * Get known fungible tokens (ERC-20) that match your filters.
   * @param param0 __namedParamters Object
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
  public async getFungibleTokens(
      { symbol, address, name }:
      { symbol?: string;
        address?: string;
        name?: string } = {}
    ): Promise<FungibleToken[]> {

    const tokenSettings = WyvernSchemas.tokens[this._networkName]

    const { tokens } = await this.api.getTokens({ symbol, address, name })

    const offlineTokens: FungibleToken[] = [
      tokenSettings.canonicalWrappedEther,
      ...tokenSettings.otherTokens,
    ].filter(t => {
      if (symbol != null && t.symbol.toLowerCase() != symbol.toLowerCase()) {
        return false
      }
      if (address != null && t.address.toLowerCase() != address.toLowerCase()) {
        return false
      }
      if (name != null && t.name != name) {
        return false
      }
      return true
    })

    return [
      ...offlineTokens,
      ...tokens
    ]
  }

  /**
   * Get the balance of a fungible token.
   * @param param0 __namedParameters Object
   * @param accountAddress User's account address
   * @param tokenAddress Optional address of the token's contract.
   *  Defaults to W-ETH
   * @param tokenAbi ABI for the token's contract. Defaults to ERC20
   */
  public async getTokenBalance(
      { accountAddress, tokenAddress, tokenAbi = ERC20 }:
      { accountAddress: string;
        tokenAddress?: string;
        tokenAbi?: PartialReadonlyContractAbi }
    ) {
    if (!tokenAddress) {
      tokenAddress = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address
    }
    const amount = await rawCall(this.web3, {
      from: accountAddress,
      to: tokenAddress,
      data: WyvernSchemas.encodeCall(getMethod(tokenAbi, 'balanceOf'), [accountAddress]),
    })

    return makeBigNumber(amount.toString())
  }

  /**
   * Compute the fees for an order
   * @param param0 __namedParameters
   * @param assets Array of addresses and ids that will be in the order
   * @param assetContract Optional prefetched asset contract (including fees) to use instead of assets
   * @param side The side of the order (buy or sell)
   * @param isPrivate Whether the order is private or not (known taker)
   * @param extraBountyBasisPoints The basis points to add for the bounty. Will throw if it exceeds the assets' contract's OpenSea fee.
   */
  public async computeFees(
      { assets, assetContract, side, isPrivate = false, extraBountyBasisPoints = 0 }:
      { assets?: Asset[];
        assetContract?: OpenSeaAssetContract;
        side: OrderSide;
        isPrivate?: boolean;
        extraBountyBasisPoints?: number }
    ): Promise<OpenSeaFees> {

    let asset: OpenSeaAsset | null = null

    let totalBuyerFeeBPS = DEFAULT_BUYER_FEE_BASIS_POINTS
    let totalSellerFeeBPS = DEFAULT_SELLER_FEE_BASIS_POINTS
    let openseaBuyerFeeBPS = totalBuyerFeeBPS
    let openseaSellerFeeBPS = totalSellerFeeBPS
    let devBuyerFeeBPS = 0
    let devSellerFeeBPS = 0
    let transferFee = makeBigNumber(0)
    let transferFeeTokenAddress = null
    let maxTotalBountyBPS = DEFAULT_MAX_BOUNTY

    // If all assets are for the same contract and it's a non-private sale, use its fees
    if (assets && _.uniqBy(assets, a => a.tokenAddress).length == 1) {
      const { tokenAddress, tokenId } = assets[0]
      asset = await this.api.getAsset(tokenAddress, tokenId)
      if (!asset) {
        throw new Error(`Could not find asset with ID ${tokenId} and address ${tokenAddress}`)
      }
      assetContract = asset.assetContract
    }

    if (assetContract) {
      totalBuyerFeeBPS = assetContract.buyerFeeBasisPoints
      totalSellerFeeBPS = assetContract.sellerFeeBasisPoints
      openseaBuyerFeeBPS = assetContract.openseaBuyerFeeBasisPoints
      openseaSellerFeeBPS = assetContract.openseaSellerFeeBasisPoints
      devBuyerFeeBPS = assetContract.devBuyerFeeBasisPoints
      devSellerFeeBPS = assetContract.devSellerFeeBasisPoints

      maxTotalBountyBPS = openseaSellerFeeBPS
    }

    // Compute transferFrom fees
    if (side == OrderSide.Sell && asset) {
      // Server-side knowledge
      transferFee = asset.transferFee
        ? makeBigNumber(asset.transferFee)
        : transferFee
      transferFeeTokenAddress = asset.transferFeePaymentToken
        ? asset.transferFeePaymentToken.address
        : transferFeeTokenAddress

      try {
        // web3 call to update it
        const result = await getTransferFeeSettings(this.web3, { asset })
        transferFee = result.transferFee != null ? result.transferFee : transferFee
        transferFeeTokenAddress = result.transferFeeTokenAddress || transferFeeTokenAddress
      } catch (error) {
        // Use server defaults
        console.error(error)
      }
    }

    // Compute bounty
    let sellerBountyBPS = side == OrderSide.Sell
      ? extraBountyBasisPoints
      : 0

    // Check that bounty is in range of the opensea fee
    const bountyTooLarge = sellerBountyBPS + OPENSEA_SELLER_BOUNTY_BASIS_POINTS > maxTotalBountyBPS
    if (sellerBountyBPS > 0 && bountyTooLarge) {
      let errorMessage = `Total bounty exceeds the maximum for this asset type (${maxTotalBountyBPS / 100}%).`
      if (maxTotalBountyBPS >= OPENSEA_SELLER_BOUNTY_BASIS_POINTS) {
        errorMessage += ` Remember that OpenSea will add ${OPENSEA_SELLER_BOUNTY_BASIS_POINTS / 100}% for referrers with OpenSea accounts!`
      }
      throw new Error(errorMessage)
    }

    // Remove fees for private orders
    if (isPrivate) {
      totalBuyerFeeBPS = 0
      totalSellerFeeBPS = 0
      openseaBuyerFeeBPS = 0
      openseaSellerFeeBPS = 0
      devBuyerFeeBPS = 0
      devSellerFeeBPS = 0
      sellerBountyBPS = 0
    }

    return {
      totalBuyerFeeBPS,
      totalSellerFeeBPS,
      openseaBuyerFeeBPS,
      openseaSellerFeeBPS,
      devBuyerFeeBPS,
      devSellerFeeBPS,
      sellerBountyBPS,
      transferFee,
      transferFeeTokenAddress,
    }
  }

  /**
   * Validate and post an order to the OpenSea orderbook.
   * @param order The order to post. Can either be signed by the maker or pre-approved on the Wyvern contract using approveOrder. See https://github.com/ProjectWyvern/wyvern-ethereum/blob/master/contracts/exchange/Exchange.sol#L178
   * @returns The order as stored by the orderbook
   */
  public async validateAndPostOrder(order: Order): Promise<Order> {
    const hash = await this._wyvernProtocolReadOnly.wyvernExchange.hashOrder_.callAsync(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata)

    if (hash !== order.hash) {
      console.error(order)
      throw new Error(`Order couldn't be validated by the exchange due to a hash mismatch. Make sure your wallet is on the right network!`)
    }
    this.logger('Order hashes match')

    // Validation is called server-side
    const confirmedOrder = await this.api.postOrder(orderToJSON(order))
    return confirmedOrder
  }

  /**
   * Compute the gas price for sending a txn, in wei
   * Will be slightly above the mean to make it faster
   */
  public async _computeGasPrice(): Promise<BigNumber> {
    const meanGas = await getCurrentGasPrice(this.web3)
    const weiToAdd = this.web3.toWei(this.gasPriceAddition, 'gwei')
    return meanGas.plus(weiToAdd)
  }

  /**
   * Compute the gas amount for sending a txn
   * Will be slightly above the result of estimateGas to make it more reliable
   * @param estimation The result of estimateGas for a transaction
   */
  public _correctGasAmount(estimation: number): number {
    return Math.ceil(estimation * this.gasIncreaseFactor)
  }

  /**
   * Estimate the gas needed to match two orders
   * @param param0 __namedParamaters Object
   * @param buy The buy order to match
   * @param sell The sell order to match
   * @param accountAddress The taker's wallet address
   * @param metadata Metadata bytes32 to send with the match
   */
  public async _estimateGasForMatch(
      { buy, sell, accountAddress, metadata = NULL_BLOCK_HASH }:
      { buy: Order;
        sell: Order;
        accountAddress: string;
        metadata?: string }
    ): Promise<number> {

    let value
    if (buy.maker.toLowerCase() == accountAddress.toLowerCase() && buy.paymentToken == NULL_ADDRESS) {
      value = await this._getRequiredAmountForTakingSellOrder(sell)
    }

    return this._wyvernProtocolReadOnly.wyvernExchange.atomicMatch_.estimateGasAsync(
        [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
        [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
        [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall],
        buy.calldata,
        sell.calldata,
        buy.replacementPattern,
        sell.replacementPattern,
        buy.staticExtradata,
        sell.staticExtradata,
        [
          buy.v || 0,
          sell.v || 0
        ],
        [
          buy.r || NULL_BLOCK_HASH,
          buy.s || NULL_BLOCK_HASH,
          sell.r || NULL_BLOCK_HASH,
          sell.s || NULL_BLOCK_HASH,
          metadata
        ],
          // Typescript error in estimate gas method, so use any
          { from: accountAddress, value } as any)
  }

  /**
   * Estimate the gas needed to transfer assets in bulk
   * Used for tests
   * @param param0 __namedParamaters Object
   * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to transfer.
   * @param fromAddress The owner's wallet address
   * @param toAddress The recipient's wallet address
   * @param schemaName The Wyvern schema name corresponding to the asset type
   */
  public async _estimateGasForTransfer(
      { assets, fromAddress, toAddress, schemaName = WyvernSchemaName.ERC721 }:
      { assets: Asset[];
        fromAddress: string;
        toAddress: string;
        schemaName?: WyvernSchemaName; }
    ): Promise<number> {

    const schema = this._getSchema(schemaName)
    const wyAssets = assets.map(asset => getWyvernNFTAsset(schema, asset.tokenId, asset.tokenAddress))

    const proxyAddress = await this._getProxy(fromAddress)
    if (!proxyAddress) {
      throw new Error('Uninitialized proxy address')
    }

    await this._approveAll({schema, wyAssets, accountAddress: fromAddress, proxyAddress})

    const { calldata } = encodeAtomicizedTransfer(schema, wyAssets, fromAddress, toAddress, this._wyvernProtocol.wyvernAtomicizer)

    return estimateGas(this.web3, {
      from: fromAddress,
      to: proxyAddress,
      data: encodeProxyCall(WyvernProtocol.getAtomicizerContractAddress(this._networkName), HowToCall.DelegateCall, calldata)
    })
  }

  /**
   * Get the proxy address for a user's wallet.
   * Internal method exposed for dev flexibility.
   * @param accountAddress The user's wallet address
   * @param retries Optional number of retries to do
   */
  public async _getProxy(accountAddress: string, retries = 0): Promise<string | null> {
    let proxyAddress: string | null = await this._wyvernProtocolReadOnly.wyvernProxyRegistry.proxies.callAsync(accountAddress)

    if (proxyAddress == '0x') {
      throw new Error("Couldn't retrieve your account from the blockchain - make sure you're on the correct Ethereum network!")
    }

    if (!proxyAddress || proxyAddress == NULL_ADDRESS) {
      if (retries > 0) {
        await delay(1000)
        return this._getProxy(accountAddress, retries - 1)
      }
      proxyAddress = null
    }
    return proxyAddress
  }

  /**
   * Initialize the proxy for a user's wallet.
   * Proxies are used to make trades on behalf of the order's maker so that
   *  trades can happen when the maker isn't online.
   * Internal method exposed for dev flexibility.
   * @param accountAddress The user's wallet address
   */
  public async _initializeProxy(accountAddress: string): Promise<string> {

    this._dispatch(EventType.InitializeAccount, { accountAddress })

    const gasPrice = await this._computeGasPrice()
    const txnData: any = { from: accountAddress, gasPrice }
    const gasEstimate = await this._wyvernProtocolReadOnly.wyvernProxyRegistry.registerProxy.estimateGasAsync(txnData)

    const transactionHash = await this._wyvernProtocol.wyvernProxyRegistry.registerProxy.sendTransactionAsync({
      ...txnData,
      gas: this._correctGasAmount(gasEstimate)
    })

    await this._confirmTransaction(transactionHash, EventType.InitializeAccount, "Initializing proxy for account", async () => {
      const polledProxy = await this._getProxy(accountAddress)
      return !!polledProxy
    })

    await delay(1000)

    const proxyAddress = await this._getProxy(accountAddress, 2)
    if (!proxyAddress) {
      throw new Error('Failed to initialize your account :( Please restart your wallet/browser and try again!')
    }

    return proxyAddress
  }

  /**
   * For a fungible token to use in trades (like W-ETH), get the amount
   *  approved for use by the Wyvern transfer proxy.
   * Internal method exposed for dev flexibility.
   * @param param0 __namedParamters Object
   * @param accountAddress Address for the user's wallet
   * @param tokenAddress Address for the token's contract
   */
  public async _getApprovedTokenCount(
      { accountAddress, tokenAddress }:
      { accountAddress: string;
        tokenAddress?: string}
    ) {
    if (!tokenAddress) {
      tokenAddress = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address
    }
    const contractAddress = WyvernProtocol.getTokenTransferProxyAddress(this._networkName)
    const approved = await rawCall(this.web3, {
      from: accountAddress,
      to: tokenAddress,
      data: WyvernSchemas.encodeCall(getMethod(ERC20, 'allowance'),
        [accountAddress, contractAddress]),
    })
    return makeBigNumber(approved)
  }

  public async _makeBuyOrder(
      { asset, accountAddress, startAmount, expirationTime = 0, paymentTokenAddress, extraBountyBasisPoints = 0, sellOrder, schemaName }:
      { asset: Asset;
        accountAddress: string;
        startAmount: number;
        expirationTime: number;
        paymentTokenAddress: string;
        extraBountyBasisPoints: number;
        sellOrder?: UnhashedOrder;
        schemaName: WyvernSchemaName; }
    ): Promise<UnhashedOrder> {

    accountAddress = validateAndFormatWalletAddress(this.web3, accountAddress)
    const schema = this._getSchema(schemaName)
    const wyAsset = getWyvernNFTAsset(schema, asset.tokenId, asset.tokenAddress)

    let makerRelayerFee
    let takerRelayerFee

    if (sellOrder) {
      // Use the sell order's fees to ensure compatiblity
      // Swap maker/taker depending on whether it's an English auction (taker)
      // TODO add extraBountyBasisPoints when making bidder bounties
      makerRelayerFee = sellOrder.waitingForBestCounterOrder
        ? makeBigNumber(sellOrder.makerRelayerFee)
        : makeBigNumber(sellOrder.takerRelayerFee)
      takerRelayerFee = sellOrder.waitingForBestCounterOrder
        ? makeBigNumber(sellOrder.takerRelayerFee)
        : makeBigNumber(sellOrder.makerRelayerFee)
    } else {
      const { totalBuyerFeeBPS,
              totalSellerFeeBPS } = await this.computeFees({ assets: [asset], extraBountyBasisPoints, side: OrderSide.Buy })
      makerRelayerFee = makeBigNumber(totalBuyerFeeBPS)
      takerRelayerFee = makeBigNumber(totalSellerFeeBPS)
    }

    const { target, calldata, replacementPattern } = WyvernSchemas.encodeBuy(schema, wyAsset, accountAddress)

    const { basePrice, extra } = await this._getPriceParameters(paymentTokenAddress, expirationTime, startAmount)
    const times = this._getTimeParameters(expirationTime)

    return {
      exchange: WyvernProtocol.getExchangeContractAddress(this._networkName),
      maker: accountAddress,
      taker: NULL_ADDRESS,
      makerRelayerFee,
      takerRelayerFee,
      makerProtocolFee: makeBigNumber(0),
      takerProtocolFee: makeBigNumber(0),
      makerReferrerFee: makeBigNumber(0), // TODO use buyerBountyBPS
      waitingForBestCounterOrder: false,
      feeMethod: FeeMethod.SplitFee,
      feeRecipient: OPENSEA_FEE_RECIPIENT,
      side: OrderSide.Buy,
      saleKind: SaleKind.FixedPrice,
      target,
      howToCall: HowToCall.Call,
      calldata,
      replacementPattern,
      staticTarget: NULL_ADDRESS,
      staticExtradata: '0x',
      paymentToken: paymentTokenAddress,
      basePrice,
      extra,
      listingTime: times.listingTime,
      expirationTime: times.expirationTime,
      salt: WyvernProtocol.generatePseudoRandomSalt(),
      metadata: {
        asset: wyAsset,
        schema: schema.name,
      }
    }
  }

  public async _makeSellOrder(
      { asset, accountAddress, startAmount, endAmount, expirationTime, waitForHighestBid, paymentTokenAddress, extraBountyBasisPoints, buyerAddress, schemaName }:
      { asset: Asset;
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        waitForHighestBid: boolean;
        expirationTime: number;
        paymentTokenAddress: string;
        extraBountyBasisPoints: number;
        buyerAddress: string;
        schemaName: WyvernSchemaName }
    ): Promise<UnhashedOrder> {

    accountAddress = validateAndFormatWalletAddress(this.web3, accountAddress)
    const schema = this._getSchema(schemaName)
    const wyAsset = getWyvernNFTAsset(schema, asset.tokenId, asset.tokenAddress)
    const isPrivate = buyerAddress != NULL_ADDRESS
    const { totalSellerFeeBPS,
            totalBuyerFeeBPS,
            sellerBountyBPS } = await this.computeFees({ assets: [asset], side: OrderSide.Sell, isPrivate, extraBountyBasisPoints })

    const { target, calldata, replacementPattern } = WyvernSchemas.encodeSell(schema, wyAsset, accountAddress)

    const orderSaleKind = endAmount != null && endAmount !== startAmount
      ? SaleKind.DutchAuction
      : SaleKind.FixedPrice

    const { basePrice, extra } = await this._getPriceParameters(paymentTokenAddress, expirationTime, startAmount, endAmount, waitForHighestBid)
    const times = this._getTimeParameters(expirationTime, waitForHighestBid)
    // Use buyer as the maker when it's an English auction, so Wyvern sets prices correctly
    const feeRecipient = waitForHighestBid
      ? NULL_ADDRESS
      : OPENSEA_FEE_RECIPIENT

    // Swap maker/taker fees when it's an English auction,
    // since these sell orders are takers not makers
    const makerRelayerFee = waitForHighestBid
      ? makeBigNumber(totalBuyerFeeBPS)
      : makeBigNumber(totalSellerFeeBPS)
    const takerRelayerFee = waitForHighestBid
      ? makeBigNumber(totalSellerFeeBPS)
      : makeBigNumber(totalBuyerFeeBPS)

    return {
      exchange: WyvernProtocol.getExchangeContractAddress(this._networkName),
      maker: accountAddress,
      taker: buyerAddress,
      makerRelayerFee,
      takerRelayerFee,
      makerProtocolFee: makeBigNumber(0),
      takerProtocolFee: makeBigNumber(0),
      makerReferrerFee: makeBigNumber(sellerBountyBPS),
      waitingForBestCounterOrder: waitForHighestBid,
      feeMethod: FeeMethod.SplitFee,
      feeRecipient,
      side: OrderSide.Sell,
      saleKind: orderSaleKind,
      target,
      howToCall: HowToCall.Call,
      calldata,
      replacementPattern,
      staticTarget: NULL_ADDRESS,
      staticExtradata: '0x',
      paymentToken: paymentTokenAddress,
      basePrice,
      extra,
      listingTime: times.listingTime,
      expirationTime: times.expirationTime,
      salt: WyvernProtocol.generatePseudoRandomSalt(),
      metadata: {
        asset: wyAsset,
        schema: schema.name,
      }
    }
  }

  public async _makeBundleBuyOrder(
      { assets, accountAddress, startAmount, expirationTime = 0, paymentTokenAddress, extraBountyBasisPoints = 0, sellOrder, schemaName }:
      { assets: Asset[];
        accountAddress: string;
        startAmount: number;
        expirationTime: number;
        paymentTokenAddress: string;
        extraBountyBasisPoints: number;
        sellOrder?: UnhashedOrder;
        schemaName: WyvernSchemaName; }
    ): Promise<UnhashedOrder> {

    accountAddress = validateAndFormatWalletAddress(this.web3, accountAddress)
    const schema = this._getSchema(schemaName)
    const bundle = getWyvernBundle(schema, assets)

    let makerRelayerFee
    let takerRelayerFee

    if (sellOrder) {
      // Use the sell order's fees to ensure compatiblity
      // Swap maker/taker depending on whether it's an English auction (taker)
      // TODO add extraBountyBasisPoints when making bidder bounties
      makerRelayerFee = sellOrder.waitingForBestCounterOrder
        ? makeBigNumber(sellOrder.makerRelayerFee)
        : makeBigNumber(sellOrder.takerRelayerFee)
      takerRelayerFee = sellOrder.waitingForBestCounterOrder
        ? makeBigNumber(sellOrder.takerRelayerFee)
        : makeBigNumber(sellOrder.makerRelayerFee)
    } else {
      const { totalBuyerFeeBPS,
              totalSellerFeeBPS } = await this.computeFees({ assets, extraBountyBasisPoints, side: OrderSide.Buy })
      makerRelayerFee = makeBigNumber(totalBuyerFeeBPS)
      takerRelayerFee = makeBigNumber(totalSellerFeeBPS)
    }

    const { calldata, replacementPattern } = WyvernSchemas.encodeAtomicizedBuy(schema, bundle.assets, accountAddress, this._wyvernProtocol.wyvernAtomicizer)

    const { basePrice, extra } = await this._getPriceParameters(paymentTokenAddress, expirationTime, startAmount)
    const times = this._getTimeParameters(expirationTime)

    return {
      exchange: WyvernProtocol.getExchangeContractAddress(this._networkName),
      maker: accountAddress,
      taker: NULL_ADDRESS,
      makerRelayerFee,
      takerRelayerFee,
      makerProtocolFee: makeBigNumber(0),
      takerProtocolFee: makeBigNumber(0),
      makerReferrerFee: makeBigNumber(0), // TODO use buyerBountyBPS
      waitingForBestCounterOrder: false,
      feeMethod: FeeMethod.SplitFee,
      feeRecipient: OPENSEA_FEE_RECIPIENT,
      side: OrderSide.Buy,
      saleKind: SaleKind.FixedPrice,
      target: WyvernProtocol.getAtomicizerContractAddress(this._networkName),
      howToCall: HowToCall.DelegateCall, // required DELEGATECALL to library for atomicizer
      calldata,
      replacementPattern,
      staticTarget: NULL_ADDRESS,
      staticExtradata: '0x',
      paymentToken: paymentTokenAddress,
      basePrice,
      extra,
      listingTime: times.listingTime,
      expirationTime: times.expirationTime,
      salt: WyvernProtocol.generatePseudoRandomSalt(),
      metadata: {
        bundle,
        schema: schema.name,
      }
    }
  }

  public async _makeBundleSellOrder(
      { bundleName, bundleDescription, bundleExternalLink, assets, accountAddress, startAmount, endAmount, expirationTime, waitForHighestBid, paymentTokenAddress, extraBountyBasisPoints, buyerAddress, schemaName }:
      { bundleName: string;
        bundleDescription?: string;
        bundleExternalLink?: string;
        assets: Asset[];
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        expirationTime: number;
        waitForHighestBid: boolean;
        paymentTokenAddress: string;
        extraBountyBasisPoints: number;
        buyerAddress: string;
        schemaName: WyvernSchemaName; }
    ): Promise<UnhashedOrder> {

    accountAddress = validateAndFormatWalletAddress(this.web3, accountAddress)
    const schema = this._getSchema(schemaName)

    const bundle = getWyvernBundle(schema, assets)
    bundle.name = bundleName
    bundle.description = bundleDescription
    bundle.external_link = bundleExternalLink

    const isPrivate = buyerAddress != NULL_ADDRESS
    const {
      totalSellerFeeBPS,
      totalBuyerFeeBPS,
      sellerBountyBPS } = await this.computeFees({ assets, side: OrderSide.Sell, isPrivate, extraBountyBasisPoints })

    const { calldata, replacementPattern } = WyvernSchemas.encodeAtomicizedSell(schema, bundle.assets, accountAddress, this._wyvernProtocol.wyvernAtomicizer)

    const { basePrice, extra } = await this._getPriceParameters(paymentTokenAddress, expirationTime, startAmount, endAmount, waitForHighestBid)
    const times = this._getTimeParameters(expirationTime, waitForHighestBid)

    const orderSaleKind = endAmount != null && endAmount !== startAmount
      ? SaleKind.DutchAuction
      : SaleKind.FixedPrice
    // Use buyer as the maker when it's an English auction, so Wyvern sets prices correctly
    const feeRecipient = waitForHighestBid
      ? NULL_ADDRESS
      : OPENSEA_FEE_RECIPIENT

    return {
      exchange: WyvernProtocol.getExchangeContractAddress(this._networkName),
      maker: accountAddress,
      taker: buyerAddress,
      makerRelayerFee: makeBigNumber(totalSellerFeeBPS),
      takerRelayerFee: makeBigNumber(totalBuyerFeeBPS),
      makerProtocolFee: makeBigNumber(0),
      takerProtocolFee: makeBigNumber(0),
      makerReferrerFee: makeBigNumber(sellerBountyBPS),
      waitingForBestCounterOrder: waitForHighestBid,
      feeMethod: FeeMethod.SplitFee,
      feeRecipient,
      side: OrderSide.Sell,
      saleKind: orderSaleKind,
      target: WyvernProtocol.getAtomicizerContractAddress(this._networkName),
      howToCall: HowToCall.DelegateCall, // required DELEGATECALL to library for atomicizer
      calldata,
      replacementPattern,
      staticTarget: NULL_ADDRESS,
      staticExtradata: '0x',
      paymentToken: paymentTokenAddress,
      basePrice,
      extra,
      listingTime: times.listingTime,
      expirationTime: times.expirationTime,
      salt: WyvernProtocol.generatePseudoRandomSalt(),
      metadata: {
        bundle,
        schema: schema.name,
      },
    }
  }

  public _makeMatchingOrder(
      { order, accountAddress }:
      { order: UnsignedOrder; accountAddress: string}
    ): UnsignedOrder {

    accountAddress = validateAndFormatWalletAddress(this.web3, accountAddress)
    const schema = this._getSchema(order.metadata.schema)

    const computeOrderParams = () => {
      if (order.metadata.asset) {
        return order.side == OrderSide.Buy
          ? WyvernSchemas.encodeSell(schema, order.metadata.asset, accountAddress)
          : WyvernSchemas.encodeBuy(schema, order.metadata.asset, accountAddress)
      } else if (order.metadata.bundle) {
        // We're matching a bundle order
        const atomicized = order.side == OrderSide.Buy
          ? WyvernSchemas.encodeAtomicizedSell(schema, order.metadata.bundle.assets, accountAddress, this._wyvernProtocol.wyvernAtomicizer)
          : WyvernSchemas.encodeAtomicizedBuy(schema, order.metadata.bundle.assets, accountAddress, this._wyvernProtocol.wyvernAtomicizer)
        return {
          target: WyvernProtocol.getAtomicizerContractAddress(this._networkName),
          calldata: atomicized.calldata,
          replacementPattern: atomicized.replacementPattern
        }
      } else {
        throw new Error('Invalid order metadata')
      }
    }

    const { target, calldata, replacementPattern } = computeOrderParams()
    const times = this._getTimeParameters(0)
    // Compat for matching buy orders that have fee recipient still on them
    const feeRecipient = order.feeRecipient == NULL_ADDRESS
      ? OPENSEA_FEE_RECIPIENT
      : NULL_ADDRESS

    const matchingOrder: UnhashedOrder = {
      exchange: order.exchange,
      maker: accountAddress,
      taker: order.maker,
      makerRelayerFee: order.makerRelayerFee,
      takerRelayerFee: order.takerRelayerFee,
      makerProtocolFee: order.makerProtocolFee,
      takerProtocolFee: order.takerProtocolFee,
      makerReferrerFee: order.makerReferrerFee,
      waitingForBestCounterOrder: false,
      feeMethod: order.feeMethod,
      feeRecipient,
      side: (order.side + 1) % 2,
      saleKind: SaleKind.FixedPrice,
      target,
      howToCall: order.howToCall,
      calldata,
      replacementPattern,
      staticTarget: NULL_ADDRESS,
      staticExtradata: '0x',
      paymentToken: order.paymentToken,
      basePrice: order.basePrice,
      extra: makeBigNumber(0),
      listingTime: times.listingTime,
      expirationTime: times.expirationTime,
      salt: WyvernProtocol.generatePseudoRandomSalt(),
      metadata: order.metadata,
    }

    return {
      ...matchingOrder,
      hash: getOrderHash(matchingOrder)
    }
  }

  /**
   * Validate against Wyvern that a buy and sell order can match
   * @param param0 __namedParamters Object
   * @param buy The buy order to validate
   * @param sell The sell order to validate
   * @param accountAddress Address for the user's wallet
   * @param shouldValidateBuy Whether to validate the buy order individually.
   * @param shouldValidateSell Whether to validate the sell order individually.
   * @param retries How many times to retry if validation fails
   */
  public async _validateMatch(
      { buy, sell, accountAddress, shouldValidateBuy = false, shouldValidateSell = false }:
      { buy: Order;
        sell: Order;
        accountAddress: string;
        shouldValidateBuy?: boolean;
        shouldValidateSell?: boolean; },
      retries = 1
    ): Promise<boolean> {

    try {
      if (shouldValidateBuy) {
        const buyValid = await this._validateOrder(buy)
        this.logger(`Buy order is valid: ${buyValid}`)

        if (!buyValid) {
          throw new Error('Invalid buy order. Please restart your wallet/browser and try again!')
        }
      }

      if (shouldValidateSell) {
        const sellValid = await this._validateOrder(sell)
        this.logger(`Sell order is valid: ${sellValid}`)

        if (!sellValid) {
          throw new Error('Invalid sell order. Please restart your wallet/browser and try again!')
        }
      }

      const ordersCanMatch = await this._wyvernProtocolReadOnly.wyvernExchange.ordersCanMatch_.callAsync(
        [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
        [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
        [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall],
        buy.calldata,
        sell.calldata,
        buy.replacementPattern,
        sell.replacementPattern,
        buy.staticExtradata,
        sell.staticExtradata,
        { from: accountAddress },
      )
      this.logger(`Orders matching: ${ordersCanMatch}`)

      if (!ordersCanMatch) {
        throw new Error('Unable to match offer with auction. Please refresh or restart your wallet and try again!')
      }

      const orderCalldataCanMatch = await this._wyvernProtocolReadOnly.wyvernExchange.orderCalldataCanMatch.callAsync(buy.calldata, buy.replacementPattern, sell.calldata, sell.replacementPattern)
      this.logger(`Order calldata matching: ${orderCalldataCanMatch}`)

      if (!orderCalldataCanMatch) {
        throw new Error('Unable to match offer details with auction. Please refresh or restart your wallet and try again!')
      }
      return true

    } catch (error) {

      if (retries <= 0) {
        throw error
      }
      await delay(500)
      return this._validateMatch({ buy, sell, accountAddress, shouldValidateBuy, shouldValidateSell }, retries - 1)
    }
  }

  // For creating email whitelists on order takers
  public async _createEmailWhitelistEntry(
      { order, buyerEmail }:
      { order: UnhashedOrder;
        buyerEmail: string }
    ) {
    const asset = order.metadata.asset
    if (!asset || 'identifier' in asset) {
      throw new Error("Whitelisting only available for NFT assets.")
    }
    await this.api.postAssetWhitelist(asset.address, asset.id, buyerEmail)
  }

  // Throws
  public async _sellOrderValidationAndApprovals(
      { order, accountAddress }:
      { order: UnhashedOrder;
        accountAddress: string }
    ) {

    const schema = this._getSchema(order.metadata.schema)
    const wyAssets = order.metadata.bundle
      ? order.metadata.bundle.assets
      : order.metadata.asset
        ? [order.metadata.asset]
        : []
    const tokenAddress = order.paymentToken

    await this._approveAll({schema, wyAssets, accountAddress})

    // For fulfilling bids,
    // need to approve access to fungible token because of the way fees are paid
    // This can be done at a higher level to show UI
    if (tokenAddress != NULL_ADDRESS) {
      const minimumAmount = makeBigNumber(order.basePrice)
      await this.approveFungibleToken({ accountAddress, tokenAddress, minimumAmount })
    }

    // Check sell parameters
    const sellValid = await this._wyvernProtocolReadOnly.wyvernExchange.validateOrderParameters_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      { from: accountAddress })
    if (!sellValid) {
      console.error(order)
      throw new Error(`Failed to validate sell order parameters. Make sure you're on the right network!`)
    }
  }

  /**
   * Instead of signing an off-chain order, you can approve an order
   * with on on-chain transaction using this method
   * @param order Order to approve
   * @returns Transaction hash of the approval transaction
   */
  public async _approveOrder(order: UnsignedOrder) {
    const accountAddress = order.maker
    const gasPrice = await this._computeGasPrice()
    const includeInOrderBook = true

    this._dispatch(EventType.ApproveOrder, { order, accountAddress })

    const transactionHash = await this._wyvernProtocol.wyvernExchange.approveOrder_.sendTransactionAsync(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      includeInOrderBook,
      { from: accountAddress, gasPrice }
    )

    await this._confirmTransaction(transactionHash.toString(), EventType.ApproveOrder, "Approving order", async () => {
      const isApproved = await this._validateOrder(order)
      return isApproved
    })

    return transactionHash
  }

  public async _validateOrder(order: Order): Promise<boolean> {

    const isValid = await this._wyvernProtocolReadOnly.wyvernExchange.validateOrder_.callAsync(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      order.v || 0,
      order.r || NULL_BLOCK_HASH,
      order.s || NULL_BLOCK_HASH)

    return isValid

  }

  public async _approveAll(
      { schema, wyAssets, accountAddress, proxyAddress = null }:
      { schema: WyvernSchemas.Schema<any>;
        wyAssets: WyvernAsset[];
        accountAddress: string;
        proxyAddress?: string | null }
    ) {

    proxyAddress = proxyAddress || await this._getProxy(accountAddress)
    if (!proxyAddress) {
      proxyAddress = await this._initializeProxy(accountAddress)
    }
    const proxy = proxyAddress
    const contractsWithApproveAll: string[] = []

    return Promise.all(wyAssets.map(async wyAsset => {
      // Verify that the taker owns the asset
      const where = await findAsset(this.web3, { account: accountAddress, proxy, wyAsset, schema })
      if (where == WyvernAssetLocation.Other) {
        // small todo: handle the 'proxy' case, which shouldn't happen ever anyway
        throw new Error('You do not own this asset.')
      }
      switch (schema.name as WyvernSchemaName) {
        case WyvernSchemaName.ERC721:
        case WyvernSchemaName.ERC1155:
        case WyvernSchemaName.Enjin:
          // Handle NFTs
          const wyNFTAsset = wyAsset as WyvernNFTAsset
          return this.approveNonFungibleToken({
            tokenId: wyNFTAsset.id.toString(),
            tokenAddress: wyNFTAsset.address,
            accountAddress,
            proxyAddress,
            skipApproveAllIfTokenAddressIn: contractsWithApproveAll
          })
        case WyvernSchemaName.ERC20:
          const wyFTAsset = wyAsset as WyvernFTAsset
          return this.approveFungibleToken({
            tokenAddress: wyFTAsset.address,
            accountAddress
          })
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
    }))
  }

  // Throws
  public async _buyOrderValidationAndApprovals(
      { order, counterOrder, accountAddress }:
      { order: UnhashedOrder; counterOrder?: Order; accountAddress: string }
    ) {
    const tokenAddress = order.paymentToken

    if (tokenAddress != NULL_ADDRESS) {

      const balance = await this.getTokenBalance({ accountAddress, tokenAddress })

      /* NOTE: no buy-side auctions for now, so sell.saleKind === 0 */
      let minimumAmount = makeBigNumber(order.basePrice)
      if (counterOrder) {
        minimumAmount = await this._getRequiredAmountForTakingSellOrder(counterOrder)
      }

      // Check WETH balance
      if (balance.toNumber() < minimumAmount.toNumber()) {
        if (tokenAddress == WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address) {
          throw new Error('Insufficient balance. You may need to wrap Ether.')
        } else {
          throw new Error('Insufficient balance.')
        }
      }

      // Check token approval
      // This can be done at a higher level to show UI
      await this.approveFungibleToken({ accountAddress, tokenAddress, minimumAmount })
    }

    // Check order formation
    const buyValid = await this._wyvernProtocolReadOnly.wyvernExchange.validateOrderParameters_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      { from: accountAddress })
    if (!buyValid) {
      console.error(order)
      throw new Error(`Failed to validate buy order parameters. Make sure you're on the right network!`)
    }
  }

  /**
   * Get the listing and expiration time paramters for a new order
   * @param expirationTimestamp Timestamp to expire the order, or 0 for non-expiring
   * @param waitingForBestCounterOrder Whether this order should be hidden until the best match is found
   */
  private _getTimeParameters(
      expirationTimestamp: number,
      waitingForBestCounterOrder = false
    ) {

    // Validation
    const minExpirationTimestamp = Date.now() / 1000 + MIN_EXPIRATION_SECONDS
    if (expirationTimestamp != 0 && expirationTimestamp < minExpirationTimestamp) {
      throw new Error(`Expiration time must be at least ${MIN_EXPIRATION_SECONDS} seconds from now, or zero (non-expiring).`)
    }
    if (waitingForBestCounterOrder && expirationTimestamp == 0) {
      throw new Error('English auctions must have an expiration time.')
    }

    let listingTimestamp
    if (waitingForBestCounterOrder) {
      listingTimestamp = expirationTimestamp
      // Expire one week from now, to ensure server can match it
      // Later, this will expire closer to the listingTime
      expirationTimestamp = expirationTimestamp + ORDER_MATCHING_LATENCY_SECONDS
    } else {
      // Small offset to account for latency
      listingTimestamp = Math.round(Date.now() / 1000 - 100)
    }

    return {
      listingTime: makeBigNumber(listingTimestamp),
      expirationTime: makeBigNumber(expirationTimestamp),
    }
  }

  /**
   * Compute the `basePrice` and `extra` parameters to be used to price an order.
   * Also validates the expiration time and auction type.
   * @param tokenAddress Address of the ERC-20 token to use for trading.
   * Use the null address for ETH
   * @param expirationTime When the auction expires, or 0 if never.
   * @param startAmount The base value for the order, in the token's main units (e.g. ETH instead of wei)
   * @param endAmount The end value for the order, in the token's main units (e.g. ETH instead of wei). If unspecified, the order's `extra` attribute will be 0
   * @param waitingForBestCounterOrder If true, this is an English auction order that should increase in price with every counter order until `expirationTime`.
   */
  private async _getPriceParameters(
      tokenAddress: string,
      expirationTime: number,
      startAmount: number,
      endAmount ?: number,
      waitingForBestCounterOrder = false
    ) {

    const priceDiff = endAmount != null
      ? startAmount - endAmount
      : 0
    const isEther = tokenAddress == NULL_ADDRESS
    const tokens = await this.getFungibleTokens({ address: tokenAddress })
    const token = tokens[0]

    // Validation
    if (isNaN(startAmount) || startAmount == null || startAmount < 0) {
      throw new Error(`Starting price must be a number >= 0`)
    }
    if (!isEther && !token) {
      throw new Error(`No ERC-20 token found for '${tokenAddress}'`)
    }
    if (isEther && waitingForBestCounterOrder) {
      throw new Error(`English auctions must use wrapped ETH or an ERC-20 token.`)
    }
    if (priceDiff < 0) {
      throw new Error('End price must be less than or equal to the start price.')
    }
    if (priceDiff > 0 && expirationTime == 0) {
      throw new Error('Expiration time must be set if order will change in price.')
    }

    // Note: WyvernProtocol.toBaseUnitAmount(makeBigNumber(startAmount), token.decimals)
    // will fail if too many decimal places, so special-case ether
    const basePrice = isEther
      ? makeBigNumber(this.web3.toWei(startAmount, 'ether')).round()
      : WyvernProtocol.toBaseUnitAmount(makeBigNumber(startAmount), token.decimals)

    const extra = isEther
      ? makeBigNumber(this.web3.toWei(priceDiff, 'ether')).round()
      : WyvernProtocol.toBaseUnitAmount(makeBigNumber(priceDiff), token.decimals)

    return { basePrice, extra }
  }

  private _getMetadata(order: Order, referrerAddress ?: string) {
    // TODO order.referrer
    if (!referrerAddress || !isValidAddress(referrerAddress)) {
      return undefined
    }
    return referrerAddress
  }

  private async _atomicMatch(
      { buy, sell, accountAddress, metadata = NULL_BLOCK_HASH }:
      { buy: Order; sell: Order; accountAddress: string; metadata?: string }
    ) {
    let value
    let shouldValidateBuy = true
    let shouldValidateSell = true

    if (sell.maker.toLowerCase() == accountAddress.toLowerCase()) {
      // USER IS THE SELLER, only validate the buy order
      await this._sellOrderValidationAndApprovals({ order: sell, accountAddress })
      shouldValidateSell = false

    } else if (buy.maker.toLowerCase() == accountAddress.toLowerCase()) {
      // USER IS THE BUYER, only validate the sell order
      await this._buyOrderValidationAndApprovals({ order: buy, counterOrder: sell, accountAddress })
      shouldValidateBuy = false

      // If using ETH to pay, set the value of the transaction to the current price
      if (buy.paymentToken == NULL_ADDRESS) {
        value = await this._getRequiredAmountForTakingSellOrder(sell)
      }
    } else {
      // User is neither - matching service
    }

    await this._validateMatch({ buy, sell, accountAddress, shouldValidateBuy, shouldValidateSell })

    this._dispatch(EventType.MatchOrders, { buy, sell, accountAddress, matchMetadata: metadata })

    let txHash
    const gasPrice = await this._computeGasPrice()
    const txnData: any = { from: accountAddress, value, gasPrice }
    const args: WyvernAtomicMatchParameters = [
      [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target,
      buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
      [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
      [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall],
      buy.calldata,
      sell.calldata,
      buy.replacementPattern,
      sell.replacementPattern,
      buy.staticExtradata,
      sell.staticExtradata,
      [
        buy.v || 0,
        sell.v || 0
      ],
      [
        buy.r || NULL_BLOCK_HASH,
        buy.s || NULL_BLOCK_HASH,
        sell.r || NULL_BLOCK_HASH,
        sell.s || NULL_BLOCK_HASH,
        metadata
      ]
    ]

    // Estimate gas first
    try {
      // Typescript splat doesn't typecheck
      const gasEstimate = await this._wyvernProtocolReadOnly.wyvernExchange.atomicMatch_.estimateGasAsync(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], txnData)
      txnData.gas = this._correctGasAmount(gasEstimate)
    } catch (error) {
      console.error(error)
      throw new Error(`Oops, the Ethereum network rejected this transaction :( The OpenSea devs have been alerted, but this problem is typically due an item being locked or untransferrable. The exact error was "${error.message.substr(0, MAX_ERROR_LENGTH)}..."`)
    }

    // Then do the transaction
    try {
      this.logger(`Fulfilling order with gas set to ${txnData.gas}`)
      txHash = await this._wyvernProtocol.wyvernExchange.atomicMatch_.sendTransactionAsync(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], txnData)
    } catch (error) {
      console.error(error)

      this._dispatch(EventType.TransactionDenied, { error, buy, sell, accountAddress, matchMetadata: metadata })

      throw new Error(`Failed to authorize transaction: "${
        error.message
          ? error.message
          : 'user denied'
        }..."`)
    }
    return txHash
  }

  private async _getRequiredAmountForTakingSellOrder(sell: Order) {
    const currentPrice = await this.getCurrentPrice(sell)
    const estimatedPrice = estimateCurrentPrice(sell)

    const maxPrice = BigNumber.max(currentPrice, estimatedPrice)

    // TODO Why is this not always a big number?
    sell.takerRelayerFee = makeBigNumber(sell.takerRelayerFee)
    const feePercentage = sell.takerRelayerFee.div(INVERSE_BASIS_POINT)
    const fee = feePercentage.times(maxPrice)
    return fee.plus(maxPrice).ceil()
  }

  private async _authorizeOrder(
      order: UnsignedOrder
    ): Promise<Partial<ECSignature>> {
    const message = order.hash
    const signerAddress = order.maker

    this._dispatch(EventType.CreateOrder, { order, accountAddress: order.maker })

    try {
      const signature = await personalSignAsync(this.web3, message, signerAddress)
      if (signature) {
        return signature
      }
      // The web3 provider is probably a smart contract wallet
      // Fallback to on-chain approval
      await this._approveOrder(order)
      // Return an empty signature
      return {}
    } catch (error) {
      this._dispatch(EventType.OrderDenied, { order, accountAddress: signerAddress })
      throw error
    }
  }

  private _getSchema(schemaName: WyvernSchemaName): WyvernSchemas.Schema <any> {
    const schema = WyvernSchemas.schemas[this._networkName].filter(s => s.name == schemaName)[0]

    if (!schema) {
      throw new Error('Trading for this asset is not yet supported. Please contact us or check back later!')
    }
    return schema
  }

  private _dispatch(event: EventType, data: EventData) {
    this._emitter.emit(event, data)
  }

  private async _confirmTransaction(transactionHash: string, event: EventType, description: string, testForSuccess?: () => Promise<boolean>): Promise<any> {

    const transactionEventData = { transactionHash, event }
    this.logger(`Transaction started: ${description}`)

    if (transactionHash == NULL_BLOCK_HASH) {
      // This was a smart contract wallet that doesn't know the transaction
      this._dispatch(EventType.TransactionCreated, { event })

      if (!testForSuccess) {
        // Wait if test not implemented
        this.logger(`Unknown action, waiting 1 minute: ${description}`)
        await delay(60 * 1000)
        return
      }

      return this._pollCallbackForConfirmation(event, description, testForSuccess)
    }

    // Normal wallet
    try {
      this._dispatch(EventType.TransactionCreated, transactionEventData)
      await confirmTransaction(this.web3, transactionHash)
      this.logger(`Transaction succeeded: ${description}`)
      this._dispatch(EventType.TransactionConfirmed, transactionEventData)
    } catch (error) {
      this.logger(`Transaction failed: ${description}`)
      this._dispatch(EventType.TransactionFailed, {
        ...transactionEventData, error
      })
      throw error
    }
  }

  private async _pollCallbackForConfirmation(event: EventType, description: string, testForSuccess: () => Promise<boolean>): Promise<any> {

    return new Promise(async (resolve, reject) => {

      const initialRetries = 60

      const testResolve: (r: number) => Promise<any> = async retries => {

        const wasSuccessful = await testForSuccess()
        if (wasSuccessful) {
          this.logger(`Transaction succeeded: ${description}`)
          this._dispatch(EventType.TransactionConfirmed, { event })
          return resolve()
        } else if (retries <= 0) {
          return reject()
        }

        if (retries % 10 == 0) {
          this.logger(`Tested transaction ${initialRetries - retries + 1} times: ${description}`)
        }
        await delay(5000)
        return testResolve(retries - 1)
      }

      return testResolve(initialRetries)
    })
  }
}
