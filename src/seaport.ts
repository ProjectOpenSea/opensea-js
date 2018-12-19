import * as Web3 from 'web3'
import { WyvernProtocol } from 'wyvern-js'
import * as WyvernSchemas from 'wyvern-schemas'
import * as _ from 'lodash'
import { OpenSeaAPI } from './api'
import { CanonicalWETH, ERC20, ERC721, getMethod } from './contracts'
import { ECSignature, FeeMethod, HowToCall, Network, OpenSeaAPIConfig, OrderSide, SaleKind, UnhashedOrder, Order, UnsignedOrder, PartialReadonlyContractAbi, EventType, EventData, OpenSeaAsset, WyvernSchemaName, OpenSeaAssetBundleJSON, WyvernAtomicMatchParameters, FungibleToken, WyvernAsset } from './types'
import {
  confirmTransaction, feeRecipient, findAsset,
  makeBigNumber, orderToJSON,
  personalSignAsync, promisify,
  sendRawTransaction, estimateCurrentPrice,
  getWyvernAsset, INVERSE_BASIS_POINT, getOrderHash, getCurrentGasPrice, delay, assignOrdersToSides, estimateGas, NULL_ADDRESS,
  DEFAULT_BUYER_FEE_BASIS_POINTS, DEFAULT_SELLER_FEE_BASIS_POINTS, MAX_ERROR_LENGTH,
  encodeAtomicizedTransfer,
  encodeProxyCall,
  NULL_BLOCK_HASH,
  SELL_ORDER_BATCH_SIZE,
  RINKEBY_PROVIDER_URL,
  MAINNET_PROVIDER_URL
} from './utils'
import { BigNumber } from 'bignumber.js'
import { EventEmitter, EventSubscription } from 'fbemitter'

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
  public gasIncreaseFactor = 1.2

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
    // Kill tslint "no this used" warning
    if (!this._emitter) {
      return
    }

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
    })

    await this._confirmTransaction(txHash, EventType.UnwrapWeth, "Unwrapping W-ETH")
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
   * @param bountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of this order
   */
  public async createBuyOrder(
      { tokenId, tokenAddress, accountAddress, startAmount, expirationTime = 0, paymentTokenAddress, bountyBasisPoints = 0 }:
      { tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        startAmount: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
        bountyBasisPoints?: number; }
    ): Promise<Order> {

    const asset: OpenSeaAsset | null = await this.api.getAsset(tokenAddress, tokenId)
    if (!asset) {
      throw new Error('No asset found for this order')
    }

    const order = await this._makeBuyOrder({ asset, accountAddress, startAmount, expirationTime, paymentTokenAddress, bountyBasisPoints })

    // NOTE not in Wyvern exchange code:
    // frontend checks to make sure
    // token is approved and sufficiently available
    await this._validateBuyOrderParameters({ order, accountAddress })

    const hashedOrder = {
      ...order,
      hash: getOrderHash(order)
    }
    let signature
    try {
      signature = await this._signOrder(hashedOrder)
    } catch (error) {
      console.error(error)
      this._dispatch(EventType.OrderDenied, { order: hashedOrder, accountAddress })
      throw new Error("You declined to sign your offer. Just a reminder: there's no gas needed anymore to create offers!")
    }

    const orderWithSignature = {
      ...hashedOrder,
      ...signature
    }
    return this._validateAndPostOrder(orderWithSignature)
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
   * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
   * @param bountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of this order
   */
  public async createSellOrder(
      { tokenId, tokenAddress, accountAddress, startAmount, endAmount, expirationTime = 0, paymentTokenAddress, bountyBasisPoints = 0 }:
      { tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
        bountyBasisPoints?: number; }
    ): Promise<Order> {

    const asset: OpenSeaAsset | null = await this.api.getAsset(tokenAddress, tokenId)
    if (!asset) {
      throw new Error('No asset found for this order')
    }

    const order = await this._makeSellOrder({ asset, accountAddress, startAmount, endAmount, expirationTime, paymentTokenAddress, bountyBasisPoints })

    await this._validateSellOrderParameters({ order, accountAddress })

    const hashedOrder = {
      ...order,
      hash: getOrderHash(order)
    }
    let signature
    try {
      signature = await this._signOrder(hashedOrder)
    } catch (error) {
      console.error(error)
      this._dispatch(EventType.OrderDenied, { order: hashedOrder, accountAddress })
      throw new Error("You declined to sign your auction. Just a reminder: there's no gas needed anymore to create auctions!")
    }

    const orderWithSignature = {
      ...hashedOrder,
      ...signature
    }

    return this._validateAndPostOrder(orderWithSignature)
  }

  /**
   * Create multiple sell orders in bulk to auction assets out of an asset factory.
   * Will throw a 'You do not own this asset' error if the maker doesn't own the factory.
   * Items will mint to users' wallets only when they buy them. See https://docs.opensea.io/docs/opensea-initial-item-sale-tutorial for more info.
   * If the user hasn't approved access to the token yet, this will emit `ApproveAllAssets` (or `ApproveAsset` if the contract doesn't support approve-all) before asking for approval.
   * @param param0 __namedParameters Object
   * @param assetId Identifier for the asset factory
   * @param factoryAddress Address of the factory contract
   * @param accountAddress Address of the factory owner's wallet
   * @param startAmount Price of the asset at the start of the auction. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
   * @param endAmount Optional price of the asset at the end of its expiration time. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
   * @param expirationTime Expiration time for the orders, in seconds. An expiration time of 0 means "never expire."
   * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
   * @param numberOfOrders Number of times to repeat creating the same order. If greater than 5, creates them in batches of 5. Requires an `apiKey` to be set during seaport initialization in order to not be throttled by the API.
   */
  public async createFactorySellOrders(
      { assetId, factoryAddress, accountAddress, startAmount, endAmount, expirationTime = 0, paymentTokenAddress, numberOfOrders = 1 }:
      { assetId: string; factoryAddress: string; accountAddress: string; startAmount: number; endAmount?: number; expirationTime?: number; paymentTokenAddress?: string; numberOfOrders?: number }
    ): Promise<Order[]> {

    const asset: OpenSeaAsset | null = await this.api.getAsset(factoryAddress, assetId)
    if (!asset) {
      throw new Error('No asset template found')
    }

    if (numberOfOrders < 1) {
      throw new Error('Need to make at least one sell order')
    }

    // Validate just a single dummy order but don't post it
    const dummyOrder = await this._makeSellOrder({ asset, accountAddress, startAmount, endAmount, expirationTime, paymentTokenAddress })
    await this._validateSellOrderParameters({ order: dummyOrder, accountAddress })

    const _makeAndPostOneSellOrder = async () => {
      const order = await this._makeSellOrder({ asset, accountAddress, startAmount, endAmount, expirationTime, paymentTokenAddress })

      const hashedOrder = {
        ...order,
        hash: getOrderHash(order)
      }
      let signature
      try {
        signature = await this._signOrder(hashedOrder)
      } catch (error) {
        console.error(error)
        this._dispatch(EventType.OrderDenied, { order: hashedOrder, accountAddress })
        throw new Error("You declined to sign your auction, or your web3 provider can't sign using personal_sign. Try 'web3-provider-engine' and make sure a mnemonic is set. Just a reminder: there's no gas needed anymore to mint tokens!")
      }

      const orderWithSignature = {
        ...hashedOrder,
        ...signature
      }

      return this._validateAndPostOrder(orderWithSignature)
    }

    const range = _.range(numberOfOrders)
    const batches  = _.chunk(range, SELL_ORDER_BATCH_SIZE)
    let allOrdersCreated: Order[] = []

    for (const subRange of batches) {
      // Will block until all SELL_ORDER_BATCH_SIZE orders
      // have come back in parallel
      const batchOrdersCreated = await Promise.all(subRange.map(_makeAndPostOneSellOrder))

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
   * @param startAmount Price of the asset at the start of the auction
   * @param endAmount Optional price of the asset at the end of its expiration time
   * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
   * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
   * @param bountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of this order
   */
  public async createBundleSellOrder(
      { bundleName, bundleDescription, bundleExternalLink, assets, accountAddress, startAmount, endAmount, expirationTime = 0, paymentTokenAddress, bountyBasisPoints = 0 }:
      { bundleName: string;
        bundleDescription?: string;
        bundleExternalLink?: string;
        assets: Array<{tokenId: string; tokenAddress: string}>;
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
        bountyBasisPoints?: number; }
    ): Promise<Order> {

    const order = await this._makeBundleSellOrder({ bundleName, bundleDescription, bundleExternalLink, assets, accountAddress, startAmount, endAmount, expirationTime, paymentTokenAddress, bountyBasisPoints })

    await this._validateSellOrderParameters({ order, accountAddress })

    const hashedOrder = {
      ...order,
      hash: getOrderHash(order)
    }
    let signature
    try {
      signature = await this._signOrder(hashedOrder)
    } catch (error) {
      console.error(error)
      this._dispatch(EventType.OrderDenied, { order: hashedOrder, accountAddress })
      throw new Error("You declined to sign your auction. Just a reminder: there's no gas needed anymore to create auctions!")
    }

    const orderWithSignature = {
      ...hashedOrder,
      ...signature
    }

    return this._validateAndPostOrder(orderWithSignature)
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
      { order: Order; accountAddress: string; referrerAddress?: string }
    ) {
    const matchingOrder = this._makeMatchingOrder({ order, accountAddress })

    const { buy, sell } = assignOrdersToSides(order, matchingOrder)

    const metadata = referrerAddress
    const transactionHash = await this._atomicMatch({ buy, sell, accountAddress, metadata })

    await this._confirmTransaction(transactionHash.toString(), EventType.MatchOrders, "Fulfilling order")
  }

  /**
   * Cancel an order on-chain, preventing it from ever being fulfilled.
   * @param param0 __namedParameters Object
   * @param order The order to cancel
   * @param accountAddress The order maker's wallet address
   */
  public async cancelOrder(
      { order, accountAddress }:
      { order: Order; accountAddress: string}
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
      order.v, order.r, order.s,
      { from: accountAddress, gasPrice })

    await this._confirmTransaction(transactionHash.toString(), EventType.CancelOrder, "Cancelling order")
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
   * @returns Transaction hash if a new transaction was created, otherwise null
   */
  public async approveNonFungibleToken(
      { tokenId, tokenAddress, accountAddress, proxyAddress = null, tokenAbi = ERC721, skipApproveAllIfTokenAddressIn = [] }:
      { tokenId: string; tokenAddress: string; accountAddress: string; proxyAddress: string | null; tokenAbi?: PartialReadonlyContractAbi; skipApproveAllIfTokenAddressIn?: string[] }
    ): Promise<string | null> {
    const tokenContract = this.web3.eth.contract(tokenAbi as any[])
    const erc721 = await tokenContract.at(tokenAddress)

    if (!proxyAddress) {
      proxyAddress = await this._getProxy(accountAddress)
      if (!proxyAddress) {
        throw new Error('Uninitialized account')
      }
    }

    // NOTE:
    // Use this long way of calling so we can check for method existence.
    // If isNaN(isApprovedForAll) == true, then
    // result for isApprovedForAllCallHash was '0x'

    const isApprovedCheckData = erc721.isApprovedForAll.getData(accountAddress, proxyAddress)
    // Decentraland used to reverse the arguments to isApprovedForAll, so we needed to special case that. :(
    // if (erc721.address == DECENTRALAND_AUCTION_CONFIG['1']) {
    //   isApprovedCheckData = erc721.isApprovedForAll.getData(proxyAddress, accountAddress)
    // }

    const isApprovedForAllCallHash = await promisify<string>(c => this.web3.eth.call({
      from: accountAddress,
      to: erc721.address,
      data: isApprovedCheckData,
    }, c))
    const isApprovedForAll = parseInt(isApprovedForAllCallHash)

    if (isApprovedForAll == 1) {
      // Supports ApproveAll
      // Result was NULL_BLOCK_HASH + 1
      this.logger('Already approved proxy for all tokens')
      return null
    }

    if (isApprovedForAll == 0) {
      // Supports ApproveAll
      //  Result was NULL_BLOCK_HASH
      //  not approved for all yet

      if (skipApproveAllIfTokenAddressIn.includes(tokenAddress)) {
        this.logger('Already approving proxy for all tokens in another transaction')
        return null
      }
      skipApproveAllIfTokenAddressIn.push(tokenAddress)

      try {
        this._dispatch(EventType.ApproveAllAssets, { accountAddress, proxyAddress, tokenAddress })

        const gasPrice = await this._computeGasPrice()
        const txHash = await sendRawTransaction(this.web3, {
          from: accountAddress,
          to: erc721.address,
          data: erc721.setApprovalForAll.getData(proxyAddress, true),
          gasPrice
        })
        await this._confirmTransaction(txHash, EventType.ApproveAllAssets, 'Approving all tokens of this type for trading')
        return txHash
      } catch (error) {
        console.error(error)
        throw new Error("Couldn't get permission to trade these tokens. Remember, you only have to approve them once for this item type!")
      }
    }

    // Does not support ApproveAll (ERC721 v1 or v2)
    this.logger('Contract does not support Approve All')

    // Note: approvedAddr will be '0x' if not supported
    let approvedAddr = await promisify(c => erc721.getApproved.call(tokenId, c))
    if (approvedAddr == proxyAddress) {
      this.logger('Already approved proxy for this token')
      return null
    }
    this.logger(`Approve response: ${approvedAddr}`)

    // SPECIAL CASING

    if (approvedAddr == '0x') {
      // CRYPTOKITTIES check
      approvedAddr = await promisify(c => erc721.kittyIndexToApproved.call(tokenId, c))
      if (approvedAddr == proxyAddress) {
        this.logger('Already approved proxy for this kitty')
        return null
      }
      this.logger(`CryptoKitties approve response: ${approvedAddr}`)
    }

    if (approvedAddr == '0x') {
      // ETHEREMON check
      approvedAddr = await promisify(c => erc721.allowed.call(accountAddress, tokenId, c))
      if (approvedAddr == proxyAddress) {
        this.logger('Already allowed proxy for this token')
        return null
      }
      this.logger(`"allowed" response: ${approvedAddr}`)
    }

    // Call `approve`

    try {
      this._dispatch(EventType.ApproveAsset, { accountAddress, proxyAddress, tokenAddress, tokenId })

      const gasPrice = await this._computeGasPrice()
      const txHash = await sendRawTransaction(this.web3, {
        from: accountAddress,
        to: erc721.address,
        data: erc721.approve.getData(proxyAddress, tokenId),
        gasPrice
      })

      await this._confirmTransaction(txHash, EventType.ApproveAsset, "Approving single token for trading")
      return txHash
    } catch (error) {
      console.error(error)
      throw new Error("Couldn't get permission to trade this token.")
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
      { accountAddress: string; tokenAddress: string; minimumAmount?: BigNumber }
    ): Promise<string | null> {
    const approvedAmount = await this._getApprovedTokenCount({ accountAddress, tokenAddress })
    if (approvedAmount.toNumber() >= minimumAmount.toNumber()) {
      this.logger('Already approved enough currency for trading')
      return null
    }
    this.logger(`Not enough token approved for trade: ${approvedAmount}`)

    const contractAddress = WyvernProtocol.getTokenTransferProxyAddress(this._networkName)

    this._dispatch(EventType.ApproveCurrency, { accountAddress, tokenAddress })

    const gasPrice = await this._computeGasPrice()
    const txHash = await sendRawTransaction(this.web3, {
      from: accountAddress,
      to: tokenAddress,
      data: WyvernSchemas.encodeCall(getMethod(ERC20, 'approve'),
        [contractAddress, WyvernProtocol.MAX_UINT_256.toString()]),
      gasPrice
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
   */
  public async isOrderFulfillable(
      { order, accountAddress, referrerAddress }:
      { order: Order; accountAddress: string; referrerAddress?: string }
    ): Promise<boolean> {
    const matchingOrder = this._makeMatchingOrder({ order, accountAddress })

    const { buy, sell } = assignOrdersToSides(order, matchingOrder)

    try {
      // TODO check calldataCanMatch too?
      // const isValid = await this._validateMatch({ buy, sell, accountAddress })
      const metadata = referrerAddress
      const gas = await this._estimateGasForMatch({ buy, sell, accountAddress, metadata })

      this.logger(`Gas estimate for ${order.side == OrderSide.Sell ? "sell" : "buy"} order: ${gas}`)

      return gas > 0
    } catch (error) {
      return false
    }
  }

  /**
   * WIP Returns whether an asset is transferrable.
   * (Currently returns true too often, even when asset is locked by contract.)
   * An asset may not be transferrable if its transfer function
   * is locked for some reason, e.g. an item is being rented within a game
   * or trading has been locked for an item type.
   * @param param0 __namedParamters Object
   * @param tokenId ID of the token to check
   * @param tokenAddress Address of the token's contract
   * @param fromAddress The account address that currently owns the asset
   * @param toAddress The account address that will be acquiring the asset
   * @param tokenAbi ABI for the token contract. Defaults to ERC-721
   */
  public async isAssetTransferrable(
    { tokenId, tokenAddress, fromAddress, toAddress, tokenAbi = ERC721 }:
    { tokenId: string; tokenAddress: string; fromAddress: string; toAddress: string; tokenAbi?: PartialReadonlyContractAbi }
  ): Promise<boolean> {
    const tokenContract = this.web3.eth.contract(tokenAbi as any[])
    const erc721 = await tokenContract.at(tokenAddress)
    const proxy = await this._getProxy(fromAddress)
    if (!proxy) {
      console.error(`This asset's owner (${fromAddress}) no longer has a proxy!`)
      return false
    }
    const data = erc721.transferFrom.getData(fromAddress, toAddress, tokenId)

    try {
      const gas = await estimateGas(this.web3, {
        from: proxy,
        to: tokenAddress,
        data
      })
      return gas > 0
    } catch (error) {
      return false
    }
  }

  /**
   * Transfer one or more assets to another address
   * @param param0 __namedParamaters Object
   * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to transfer.
   * @param fromAddress The owner's wallet address
   * @param toAddress The recipient's wallet address
   */
  public async transferAll(
      { assets, fromAddress, toAddress }:
      { assets: Array<{tokenId: string; tokenAddress: string}>; fromAddress: string; toAddress: string }
    ): Promise<void> {

    const schema = this._getSchema()
    const wyAssets = assets.map(asset => getWyvernAsset(schema, asset.tokenId, asset.tokenAddress))

    const { calldata } = encodeAtomicizedTransfer(schema, wyAssets, fromAddress, toAddress, this._wyvernProtocol.wyvernAtomicizer)

    let proxyAddress = await this._getProxy(fromAddress)
    if (!proxyAddress) {
      proxyAddress = await this._initializeProxy(fromAddress)
    }

    await this._approveAll({wyAssets, accountAddress: fromAddress, proxyAddress})

    this._dispatch(EventType.TransferAll, { accountAddress: fromAddress, toAddress, assets })

    const gasPrice = await this._computeGasPrice()
    const txHash = await sendRawTransaction(this.web3, {
      from: fromAddress,
      to: proxyAddress,
      data: encodeProxyCall(WyvernProtocol.getAtomicizerContractAddress(this._networkName), HowToCall.DelegateCall, calldata),
      gasPrice
    })

    await this._confirmTransaction(txHash, EventType.TransferAll, `Transferring ${assets.length} asset${assets.length == 1 ? '' : 's'}`)
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
      { symbol?: string; address?: string; name?: string } = {}
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
      { accountAddress: string; tokenAddress?: string; tokenAbi?: PartialReadonlyContractAbi }
    ) {
    if (!tokenAddress) {
      tokenAddress = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address
    }
    const amount = await promisify(c => this.web3.eth.call({
      from: accountAddress,
      to: tokenAddress,
      data: WyvernSchemas.encodeCall(getMethod(tokenAbi, 'balanceOf'), [accountAddress]),
    }, c))

    return makeBigNumber(amount.toString())
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
    { buy: Order; sell: Order; accountAddress: string; metadata?: string }): Promise<number> {

    let value
    if (buy.maker == accountAddress && buy.paymentToken == NULL_ADDRESS) {
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
        [buy.v, sell.v],
        [buy.r, buy.s, sell.r, sell.s,
          metadata],
          // Typescript error in estimate gas method, so use any
          { from: accountAddress, value } as any)
  }

  /**
   * Estimate the gas needed to transfer assets in bulk
   * @param param0 __namedParamaters Object
   * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to transfer.
   * @param fromAddress The owner's wallet address
   * @param toAddress The recipient's wallet address
   */
  public async _estimateGasForTransfer(
      { assets, fromAddress, toAddress }:
      { assets: Array<{tokenId: string; tokenAddress: string}>; fromAddress: string; toAddress: string }
    ): Promise<number> {

    const schema = this._getSchema()
    const wyAssets = assets.map(asset => getWyvernAsset(schema, asset.tokenId, asset.tokenAddress))

    const proxyAddress = await this._getProxy(fromAddress)
    if (!proxyAddress) {
      throw new Error('Uninitialized proxy address')
    }

    await this._approveAll({wyAssets, accountAddress: fromAddress, proxyAddress})

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
        await delay(3000)
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

    await this._confirmTransaction(transactionHash, EventType.InitializeAccount, "Initializing proxy for account")

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
      { accountAddress: string; tokenAddress?: string}
    ) {
    if (!tokenAddress) {
      tokenAddress = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address
    }
    const contractAddress = WyvernProtocol.getTokenTransferProxyAddress(this._networkName)
    const approved = await promisify<string>(c => this.web3.eth.call({
      from: accountAddress,
      to: tokenAddress,
      data: WyvernSchemas.encodeCall(getMethod(ERC20, 'allowance'),
        [accountAddress, contractAddress]),
    }, c))
    return makeBigNumber(approved)
  }

  public async _makeBuyOrder(
      { asset, accountAddress, startAmount, expirationTime = 0, paymentTokenAddress, bountyBasisPoints = 0 }:
      { asset: OpenSeaAsset; accountAddress: string; startAmount: number; expirationTime?: number; paymentTokenAddress?: string; bountyBasisPoints?: number }
    ): Promise<UnhashedOrder> {

    const schema = this._getSchema()
    const wyAsset = getWyvernAsset(schema, asset.tokenId, asset.assetContract.address)
    const metadata = {
      asset: wyAsset,
      schema: schema.name,
    }
    // Small offset to account for latency
    const listingTime = Math.round(Date.now() / 1000 - 100)
    const buyerFee = asset.assetContract.buyerFeeBasisPoints
    const sellerFee = asset.assetContract.sellerFeeBasisPoints

    const { target, calldata, replacementPattern } = WyvernSchemas.encodeBuy(schema, wyAsset, accountAddress)

    const paymentToken = paymentTokenAddress || WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address
    const { basePrice, extra } = await this._getPriceParameters(paymentToken, startAmount)

    return {
      exchange: WyvernProtocol.getExchangeContractAddress(this._networkName),
      maker: accountAddress,
      taker: NULL_ADDRESS,
      makerRelayerFee: makeBigNumber(buyerFee),
      takerRelayerFee: makeBigNumber(sellerFee),
      makerProtocolFee: makeBigNumber(0),
      takerProtocolFee: makeBigNumber(0),
      makerReferrerFee: makeBigNumber(bountyBasisPoints),
      feeMethod: FeeMethod.SplitFee,
      feeRecipient,
      side: OrderSide.Buy,
      saleKind: SaleKind.FixedPrice,
      target,
      howToCall: HowToCall.Call,
      calldata,
      replacementPattern,
      staticTarget: NULL_ADDRESS,
      staticExtradata: '0x',
      paymentToken,
      basePrice,
      extra,
      listingTime: makeBigNumber(listingTime),
      expirationTime: makeBigNumber(expirationTime),
      salt: WyvernProtocol.generatePseudoRandomSalt(),
      metadata,
    }
  }

  public async _makeSellOrder(
      { asset, accountAddress, startAmount, endAmount, expirationTime = 0, paymentTokenAddress, bountyBasisPoints = 0 }:
      { asset: OpenSeaAsset; accountAddress: string; startAmount: number; endAmount?: number; expirationTime?: number; paymentTokenAddress?: string; bountyBasisPoints?: number }
    ): Promise<UnhashedOrder> {

    const schema = this._getSchema()
    const wyAsset = getWyvernAsset(schema, asset.tokenId, asset.assetContract.address)
    // Small offset to account for latency
    const listingTime = Math.round(Date.now() / 1000 - 100)
    const buyerFee = asset.assetContract.buyerFeeBasisPoints
    const sellerFee = asset.assetContract.sellerFeeBasisPoints

    const { target, calldata, replacementPattern } = WyvernSchemas.encodeSell(schema, wyAsset, accountAddress)

    const orderSaleKind = endAmount != null && endAmount !== startAmount
      ? SaleKind.DutchAuction
      : SaleKind.FixedPrice

    const paymentToken = paymentTokenAddress || NULL_ADDRESS
    const { basePrice, extra } = await this._getPriceParameters(paymentToken, startAmount, endAmount)

    return {
      exchange: WyvernProtocol.getExchangeContractAddress(this._networkName),
      maker: accountAddress,
      taker: NULL_ADDRESS,
      makerRelayerFee: makeBigNumber(sellerFee),
      takerRelayerFee: makeBigNumber(buyerFee),
      makerProtocolFee: makeBigNumber(0),
      takerProtocolFee: makeBigNumber(0),
      makerReferrerFee: makeBigNumber(bountyBasisPoints),
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
      paymentToken,
      basePrice,
      extra,
      listingTime: makeBigNumber(listingTime),
      expirationTime: makeBigNumber(expirationTime),
      salt: WyvernProtocol.generatePseudoRandomSalt(),
      metadata: {
        asset: wyAsset,
        schema: schema.name,
      }
    }
  }

  public async _makeBundleSellOrder(
      { bundleName, bundleDescription, bundleExternalLink, assets, accountAddress, startAmount, endAmount, expirationTime = 0, paymentTokenAddress, bountyBasisPoints = 0 }:
      { bundleName: string; bundleDescription?: string; bundleExternalLink?: string; assets: Array<{tokenId: string; tokenAddress: string}>; accountAddress: string; startAmount: number; endAmount?: number; expirationTime?: number; paymentTokenAddress?: string; bountyBasisPoints?: number }
    ): Promise<UnhashedOrder> {

    const schema = this._getSchema()

    const wyAssets = assets.map(asset => getWyvernAsset(schema, asset.tokenId, asset.tokenAddress))

    const bundle: OpenSeaAssetBundleJSON = {
      assets: wyAssets,
      name: bundleName,
      description: bundleDescription,
      external_link: bundleExternalLink
    }

    let buyerFee = DEFAULT_BUYER_FEE_BASIS_POINTS
    let sellerFee = DEFAULT_SELLER_FEE_BASIS_POINTS

    // If all assets are for the same contract, use its fees
    if (_.uniqBy(assets, 'tokenAddress').length == 1) {
      const { tokenAddress, tokenId } = assets[0]
      const asset: OpenSeaAsset | null = await this.api.getAsset(tokenAddress, tokenId)
      if (!asset) {
        throw new Error('No asset found for this order')
      }
      buyerFee = asset.assetContract.buyerFeeBasisPoints
      sellerFee = asset.assetContract.sellerFeeBasisPoints
    }

    const { calldata, replacementPattern } = WyvernSchemas.encodeAtomicizedSell(schema, wyAssets, accountAddress, this._wyvernProtocol.wyvernAtomicizer)

    const paymentToken = paymentTokenAddress || NULL_ADDRESS
    const { basePrice, extra } = await this._getPriceParameters(paymentToken, startAmount, endAmount)

    // Small offset to account for latency
    const listingTime = Math.round(Date.now() / 1000 - 100)

    const orderSaleKind = endAmount != null && endAmount !== startAmount
      ? SaleKind.DutchAuction
      : SaleKind.FixedPrice

    return {
      exchange: WyvernProtocol.getExchangeContractAddress(this._networkName),
      maker: accountAddress,
      taker: NULL_ADDRESS,
      makerRelayerFee: makeBigNumber(sellerFee),
      takerRelayerFee: makeBigNumber(buyerFee),
      makerProtocolFee: makeBigNumber(0),
      takerProtocolFee: makeBigNumber(0),
      makerReferrerFee: makeBigNumber(bountyBasisPoints),
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
      paymentToken,
      basePrice,
      extra,
      listingTime: makeBigNumber(listingTime),
      expirationTime: makeBigNumber(expirationTime),
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
    const schema = this._getSchema()
    const listingTime = Math.round(Date.now() / 1000 - 1000)

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

    const matchingOrder: UnhashedOrder = {
      exchange: order.exchange,
      maker: accountAddress,
      taker: order.maker,
      makerRelayerFee: order.makerRelayerFee,
      takerRelayerFee: order.takerRelayerFee,
      makerProtocolFee: order.makerProtocolFee,
      takerProtocolFee: order.takerProtocolFee,
      makerReferrerFee: order.makerReferrerFee,
      feeMethod: order.feeMethod,
      feeRecipient: NULL_ADDRESS,
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
      listingTime: makeBigNumber(listingTime),
      expirationTime: makeBigNumber(0),
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
   */
  public async _validateMatch(
      { buy, sell, accountAddress }:
      { buy: Order; sell: Order; accountAddress: string }
    ): Promise<boolean> {

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

    if (!ordersCanMatch) {
      throw new Error('Unable to match offer with auction. Please refresh or restart your wallet and try again!')
    }
    this.logger(`Orders matching: ${ordersCanMatch}`)

    const orderCalldataCanMatch = await this._wyvernProtocolReadOnly.wyvernExchange.orderCalldataCanMatch.callAsync(buy.calldata, buy.replacementPattern, sell.calldata, sell.replacementPattern)
    this.logger(`Order calldata matching: ${orderCalldataCanMatch}`)

    if (!orderCalldataCanMatch) {
      throw new Error('Unable to match offer details with auction. Please refresh or restart your wallet and try again!')
    }
    return true
  }

  // Throws
  public async _validateSellOrderParameters(
      { order, accountAddress }:
      { order: UnhashedOrder; accountAddress: string }
    ) {

    const wyAssets = order.metadata.bundle
      ? order.metadata.bundle.assets
      : order.metadata.asset
        ? [order.metadata.asset]
        : []
    const tokenAddress = order.paymentToken

    await this._approveAll({wyAssets, accountAddress})

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

  public async _approveAll(
      { wyAssets, accountAddress, proxyAddress = null}:
      { wyAssets: WyvernAsset[]; accountAddress: string; proxyAddress?: string | null}
    ) {
    const schema = this._getSchema()
    proxyAddress = proxyAddress || await this._getProxy(accountAddress)
    if (!proxyAddress) {
      proxyAddress = await this._initializeProxy(accountAddress)
    }
    const proxy = proxyAddress
    const contractsWithApproveAll: string[] = []

    return Promise.all(wyAssets.map(async wyAsset => {
      // Verify that the taker owns the asset
      const where = await findAsset(this.web3, { account: accountAddress, proxy, wyAsset, schema })
      if (where != 'account') {
        // small todo: handle the 'proxy' case, which shouldn't happen ever anyway
        throw new Error('You do not own this asset.')
      }

      return this.approveNonFungibleToken({
        tokenId: wyAsset.id.toString(),
        tokenAddress: wyAsset.address,
        accountAddress,
        proxyAddress,
        skipApproveAllIfTokenAddressIn: contractsWithApproveAll
      })
    }))
  }

  // Throws
  public async _validateBuyOrderParameters(
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
   * Compute the `basePrice` and `extra` parameters to be used to price an order.
   * @param tokenAddress Address of the ERC-20 token to use for trading.
   * Use the null address for ETH
   * @param startAmount The base value for the order, in the token's main units (e.g. ETH instead of wei)
   * @param endAmount The end value for the order, in the token's main units (e.g. ETH instead of wei). If unspecified, the order's `extra` attribute will be 0
   */
  private async _getPriceParameters(tokenAddress: string, startAmount: number, endAmount?: number) {
    const isEther = tokenAddress == NULL_ADDRESS
    const tokens = await this.getFungibleTokens({ address: tokenAddress })
    const token = tokens[0]

    if (!isEther && !token) {
      throw new Error(`No ERC-20 token found for '${tokenAddress}'`)
    }

    const priceDiff = endAmount != null
      ? startAmount - endAmount
      : 0

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

  /**
   * Private helper methods
   */

  private async _atomicMatch(
      { buy, sell, accountAddress, metadata = NULL_BLOCK_HASH }:
      { buy: Order; sell: Order; accountAddress: string; metadata?: string }
    ) {
    let value

    // Case: user is the seller (and fulfilling a buy order)
    if (sell.maker.toLowerCase() == accountAddress.toLowerCase() && sell.feeRecipient == NULL_ADDRESS) {
      // USER IS THE SELLER
      await this._validateSellOrderParameters({ order: sell, accountAddress })

      const buyValid = await this._wyvernProtocolReadOnly.wyvernExchange.validateOrder_.callAsync(
        [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken],
        [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt],
        buy.feeMethod,
        buy.side,
        buy.saleKind,
        buy.howToCall,
        buy.calldata,
        buy.replacementPattern,
        buy.staticExtradata,
        buy.v, buy.r, buy.s,
        { from: accountAddress })
      if (!buyValid) {
        throw new Error('Invalid offer. Please restart your wallet/browser and try again!')
      }
      this.logger(`Buy order is valid: ${buyValid}`)

    } else if (buy.maker.toLowerCase() == accountAddress.toLowerCase()) {
      // USER IS THE BUYER
      await this._validateBuyOrderParameters({ order: buy, counterOrder: sell, accountAddress })

      const sellValid = await this._wyvernProtocolReadOnly.wyvernExchange.validateOrder_.callAsync(
        [sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
        [sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
        sell.feeMethod,
        sell.side,
        sell.saleKind,
        sell.howToCall,
        sell.calldata,
        sell.replacementPattern,
        sell.staticExtradata,
        sell.v, sell.r, sell.s,
        { from: accountAddress })
      if (!sellValid) {
        throw new Error('Invalid auction. Please restart your wallet/browser and try again!')
      }
      this.logger(`Sell order validation: ${sellValid}`)

      // If using ETH to pay, set the value of the transaction to the current price
      if (buy.paymentToken == NULL_ADDRESS) {
        value = await this._getRequiredAmountForTakingSellOrder(sell)
      }
    } else {
      // User is neither - matching service
    }

    await this._validateMatch({ buy, sell, accountAddress })

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
      [buy.v, sell.v],
      [buy.r, buy.s, sell.r, sell.s,
        metadata]
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

      this._dispatch(EventType.TransactionDenied, { buy, sell, accountAddress, matchMetadata: metadata })

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

  // Throws
  private async _validateAndPostOrder(order: Order) {
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

    const valid = await this._wyvernProtocolReadOnly.wyvernExchange.validateOrder_.callAsync(
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      order.v,
      order.r || '0x',
      order.s || '0x')

    if (!valid) {
      console.error(order)
      throw new Error('Invalid order. Please restart your wallet/browser and try again!')
    }
    this.logger('Order is valid')

    const confirmedOrder = await this.api.postOrder(orderToJSON(order))
    return confirmedOrder
  }

  private async _signOrder(
      order: UnsignedOrder
    ): Promise<ECSignature> {
    const message = order.hash
    const signerAddress = order.maker

    this._dispatch(EventType.CreateOrder, { order, accountAddress: order.maker })

    return personalSignAsync(this.web3, message, signerAddress)
  }

  private _getSchema(schemaName = WyvernSchemaName.ERC721) {
    const schema = WyvernSchemas.schemas[this._networkName].filter(s => s.name == schemaName)[0]

    if (!schema) {
      throw new Error('No schema found for this asset; please check back later!')
    }
    return schema
  }

  private _dispatch(event: EventType, data: EventData) {
    this._emitter.emit(event, data)
  }

  private async _confirmTransaction(transactionHash: string, event: EventType, description: string) {

    const transactionEventData = { transactionHash, event }
    this.logger(`Transaction started: ${description}`)
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
}
