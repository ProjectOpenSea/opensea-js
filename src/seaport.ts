import * as Web3 from 'web3'
import { WyvernProtocol } from 'wyvern-js/lib'
import * as WyvernSchemas from 'wyvern-schemas'

import { OpenSeaAPI } from './api'
import { CanonicalWETH, DECENTRALAND_AUCTION_CONFIG, ERC20, ERC721, getMethod } from './contracts'
import { ECSignature, FeeMethod, HowToCall, Network, OpenSeaAPIConfig, OrderSide, SaleKind, UnhashedOrder, Order, UnsignedOrder, PartialReadonlyContractAbi, EventType, EventData, OpenSeaAsset, WyvernSchemaName, OpenSeaAssetBundle, OpenSeaAssetBundleJSON } from './types'
import {
  confirmTransaction, feeRecipient, findAsset,
  makeBigNumber, orderToJSON,
  personalSignAsync, promisify,
  sendRawTransaction, estimateCurrentPrice,
  getWyvernAsset, INVERSE_BASIS_POINT, getOrderHash, getCurrentGasPrice, delay
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

  private _networkName: Network
  private _wyvernProtocol: WyvernProtocol
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
    apiConfig.gasPrice = apiConfig.gasPrice || makeBigNumber(100000)

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
      fromAddress: accountAddress,
      toAddress: token.address,
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
      fromAddress: accountAddress,
      toAddress: token.address,
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
   * @param amountInEth Ether value of the offer
   * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
   */
  public async createBuyOrder(
      { tokenId, tokenAddress, accountAddress, amountInEth, expirationTime = 0 }:
      { tokenId: string; tokenAddress: string; accountAddress: string; amountInEth: number; expirationTime?: number }
    ): Promise<Order> {

    const token = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther
    const schema = this._getSchema()
    const wyAsset = getWyvernAsset(schema, tokenId, tokenAddress)
    const metadata = {
      asset: wyAsset,
      schema: schema.name,
    }
    // Small offset to account for latency
    const listingTime = Math.round(Date.now() / 1000 - 100)

    const asset: OpenSeaAsset | null = await this.api.getAsset(tokenAddress, tokenId)
    if (!asset) {
      throw new Error('No asset found for this order')
    }
    const buyerFee = asset.assetContract.buyerFeeBasisPoints
    const sellerFee = asset.assetContract.sellerFeeBasisPoints

    const { target, calldata, replacementPattern } = WyvernSchemas.encodeBuy(schema, wyAsset, accountAddress)
    const order: UnhashedOrder = {
      exchange: WyvernProtocol.getExchangeContractAddress(this._networkName),
      maker: accountAddress,
      taker: WyvernProtocol.NULL_ADDRESS,
      makerRelayerFee: makeBigNumber(buyerFee),
      takerRelayerFee: makeBigNumber(sellerFee),
      makerProtocolFee: makeBigNumber(0),
      takerProtocolFee: makeBigNumber(0),
      feeMethod: FeeMethod.SplitFee,
      feeRecipient,
      side: OrderSide.Buy,
      saleKind: SaleKind.FixedPrice,
      target,
      howToCall: HowToCall.Call,
      calldata,
      replacementPattern,
      staticTarget: WyvernProtocol.NULL_ADDRESS,
      staticExtradata: '0x',
      paymentToken: token.address,
      basePrice: WyvernProtocol.toBaseUnitAmount(makeBigNumber(amountInEth), token.decimals),
      extra: WyvernProtocol.toBaseUnitAmount(makeBigNumber(0), token.decimals),
      listingTime: makeBigNumber(listingTime),
      expirationTime: makeBigNumber(expirationTime),
      salt: WyvernProtocol.generatePseudoRandomSalt(),
      metadata,
    }

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
   * @param startAmountInEth Price of the asset at the start of the auction
   * @param endAmountInEth Optional price of the asset at the end of its expiration time
   * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
   */
  public async createSellOrder(
      { tokenId, tokenAddress, accountAddress, startAmountInEth, endAmountInEth, expirationTime = 0 }:
      { tokenId: string; tokenAddress: string; accountAddress: string; startAmountInEth: number; endAmountInEth?: number; expirationTime?: number }
    ): Promise<Order> {

    const schema = this._getSchema()
    const wyAsset = getWyvernAsset(schema, tokenId, tokenAddress)
    // Small offset to account for latency
    const listingTime = Math.round(Date.now() / 1000 - 100)

    const asset: OpenSeaAsset | null = await this.api.getAsset(tokenAddress, tokenId)
    if (!asset) {
      throw new Error('No asset found for this order')
    }
    const buyerFee = asset.assetContract.buyerFeeBasisPoints
    const sellerFee = asset.assetContract.sellerFeeBasisPoints

    const { target, calldata, replacementPattern } = WyvernSchemas.encodeSell(schema, wyAsset, accountAddress)

    const extraInEth = endAmountInEth != null
      ? startAmountInEth - endAmountInEth
      : 0

    const orderSaleKind = endAmountInEth != null && endAmountInEth !== startAmountInEth
      ? SaleKind.DutchAuction
      : SaleKind.FixedPrice

    const order: UnhashedOrder = {
      exchange: WyvernProtocol.getExchangeContractAddress(this._networkName),
      maker: accountAddress,
      taker: WyvernProtocol.NULL_ADDRESS,
      makerRelayerFee: makeBigNumber(sellerFee),
      takerRelayerFee: makeBigNumber(buyerFee),
      makerProtocolFee: makeBigNumber(0),
      takerProtocolFee: makeBigNumber(0),
      feeMethod: FeeMethod.SplitFee,
      feeRecipient,
      side: OrderSide.Sell,
      saleKind: orderSaleKind,
      target,
      howToCall: HowToCall.Call,
      calldata,
      replacementPattern,
      staticTarget: WyvernProtocol.NULL_ADDRESS,
      staticExtradata: '0x',
      paymentToken: WyvernProtocol.NULL_ADDRESS, // use Ether
      // Note: WyvernProtocol.toBaseUnitAmount(makeBigNumber(startAmountInEth), token.decimals)
      // will fail if too many decimal places
      basePrice: makeBigNumber(this.web3.toWei(startAmountInEth, 'ether')).round(),
      extra: makeBigNumber(this.web3.toWei(extraInEth, 'ether')).round(),
      listingTime: makeBigNumber(listingTime),
      expirationTime: makeBigNumber(expirationTime),
      salt: WyvernProtocol.generatePseudoRandomSalt(),
      metadata: {
        asset: wyAsset,
        schema: schema.name,
      },
    }

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
      throw new Error("You declined to sign your auction. Just a reminder: there's no gas needed anymore to create auctions!")
    }

    const orderWithSignature = {
      ...hashedOrder,
      ...signature
    }

    return this._validateAndPostOrder(orderWithSignature)
  }

  /**
   * Create a sell order to auction a bundle of assets.
   * Will throw a 'You do not own this asset' error if the maker doesn't have one of the assets.
   * If the user hasn't approved access to any of the assets yet, this will emit `ApproveAllAssets` (or `ApproveAsset` if the contract doesn't support approve-all) before asking for approval for each asset.
   * @param param0 __namedParameters Object
   * @param tokenId Token ID
   * @param tokenAddress Address of the token's contract
   * @param accountAddress Address of the maker's wallet
   * @param startAmountInEth Price of the asset at the start of the auction
   * @param endAmountInEth Optional price of the asset at the end of its expiration time
   * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
   */
  public async createBundleSellOrder(
      { bundleName, bundleDescription, bundleExternalLink, assets, accountAddress, startAmountInEth, endAmountInEth, expirationTime = 0 }:
      { bundleName: string; bundleDescription?: string; bundleExternalLink?: string; assets: Array<{tokenId: string; tokenAddress: string}>; accountAddress: string; startAmountInEth: number; endAmountInEth?: number; expirationTime?: number }
    ): Promise<Order> {

    const order = this._makeBundleSellOrder({ bundleName, bundleDescription, bundleExternalLink, assets, accountAddress, startAmountInEth, endAmountInEth, expirationTime })

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
   */
  public async fulfillOrder(
      { order, accountAddress }:
      { order: Order; accountAddress: string}
    ) {
    const orderToMatch = this._makeMatchingOrder({ order, accountAddress })

    let buy: Order
    let sell: Order
    if (order.side == OrderSide.Buy) {
      buy = order
      sell = {
        ...orderToMatch,
        v: buy.v,
        r: buy.r,
        s: buy.s
      }
    } else {
      sell = order
      buy = {
        ...orderToMatch,
        v: sell.v,
        r: sell.r,
        s: sell.s
      }
    }

    this._dispatch(EventType.MatchOrders, { buy, sell, accountAddress })

    const transactionHash = await this._atomicMatch({ buy, sell, accountAddress })

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
   * @returns Transaction hash if a new transaction was created, otherwise null
   */
  public async approveNonFungibleToken(
      { tokenId, tokenAddress, accountAddress, proxyAddress = null, tokenAbi = ERC721 }:
      { tokenId: string; tokenAddress: string; accountAddress: string; proxyAddress: string | null; tokenAbi?: PartialReadonlyContractAbi}
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

    let isApprovedCheckData = erc721.isApprovedForAll.getData(accountAddress, proxyAddress)
    // Decentraland reverses the arguments to isApprovedForAll, so we need to special case that. :(
    if (erc721.address == DECENTRALAND_AUCTION_CONFIG['1']) {
      isApprovedCheckData = erc721.isApprovedForAll.getData(proxyAddress, accountAddress)
    }

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

      try {
        this._dispatch(EventType.ApproveAllAssets, { accountAddress, proxyAddress, tokenAddress })

        const gasPrice = await this._computeGasPrice()
        const txHash = await sendRawTransaction(this.web3, {
          fromAddress: accountAddress,
          toAddress: erc721.address,
          data: erc721.setApprovalForAll.getData(proxyAddress, true),
          gasPrice
        })
        await this._confirmTransaction(txHash, EventType.ApproveAllAssets, 'Approving all tokens of this type for trading')
        return txHash
      } catch (error) {
        console.error(error)
        throw new Error('Failed to approve access to these tokens. OpenSea has been alerted, but you can also chat with us on Discord.')
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
        fromAddress: accountAddress,
        toAddress: erc721.address,
        data: erc721.approve.getData(proxyAddress, tokenId),
        gasPrice
      })

      await this._confirmTransaction(txHash, EventType.ApproveAsset, "Approving single token for trading")
      return txHash
    } catch (error) {
      console.error(error)
      throw new Error('Failed to approve access to this token. OpenSea has been alerted, but you can also chat with us on Discord.')
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
      this.logger('Already approved enough fungible tokens for trading')
      return null
    }

    const contractAddress = WyvernProtocol.getTokenTransferProxyAddress(this._networkName)

    this._dispatch(EventType.ApproveCurrency, { accountAddress, tokenAddress })

    const gasPrice = await this._computeGasPrice()
    const txHash = await sendRawTransaction(this.web3, {
      fromAddress: accountAddress,
      toAddress: tokenAddress,
      data: WyvernSchemas.encodeCall(getMethod(ERC20, 'approve'),
        [contractAddress, WyvernProtocol.MAX_UINT_256.toString()]),
      gasPrice
    })

    await this._confirmTransaction(txHash, EventType.ApproveCurrency, "Approving fungible tokens for trading")
    return txHash
  }

  /**
   * Gets the price for the order using the contract
   * @param order The order to calculate the price for
   */
  public async getCurrentPrice(order: Order) {

    const currentPrice = await this._wyvernProtocol.wyvernExchange.calculateCurrentPrice_.callAsync(
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
   * Compute the gas price for sending a txn, in wei
   * Will be slightly above the mean to make it faster
   */
  public async _computeGasPrice(): Promise<BigNumber> {
    const meanGas = await getCurrentGasPrice(this.web3)
    const weiToAdd = this.web3.toWei(this.gasPriceAddition, 'gwei')
    return meanGas.plus(weiToAdd)
  }

  /**
   * Estimate the gas needed to match two orders
   * @param param0 __namedParamaters Object
   * @param buy The buy order to match
   * @param sell The sell order to match
   * @param accountAddress The taker's wallet address
   */
  public async _estimateGasForMatch(
    { buy, sell, accountAddress }:
    { buy: Order; sell: Order; accountAddress: string }): Promise<number> {

    let value
    if (buy.maker == accountAddress) {
      value = await this._getEthValueForTakingSellOrder(sell)
    }

    return this._wyvernProtocol.wyvernExchange.atomicMatch_.estimateGasAsync(
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
          WyvernProtocol.NULL_ADDRESS],
          // Typescript error in estimate gas method, so use any
          { from: accountAddress, value } as any)
  }

  /**
   * Get the proxy address for a user's wallet.
   * Internal method exposed for dev flexibility.
   * @param accountAddress The user's wallet address
   */
  public async _getProxy(accountAddress: string): Promise<string | null> {
    let proxyAddress: string | null = await this._wyvernProtocol.wyvernProxyRegistry.proxies.callAsync(accountAddress)

    if (proxyAddress == '0x') {
      throw new Error("Couldn't retrieve your account from the blockchain - make sure you're on the correct Ethereum network!")
    }

    if (!proxyAddress || proxyAddress == WyvernProtocol.NULL_ADDRESS) {
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
    const transactionHash = await this._wyvernProtocol.wyvernProxyRegistry.registerProxy.sendTransactionAsync({
      from: accountAddress,
      gasPrice
    })

    await this._confirmTransaction(transactionHash, EventType.InitializeAccount, "Initializing proxy for account")

    // Fix for Cipher and any other clients who get receipts too early
    await delay(800)

    const proxyAddress = await this._getProxy(accountAddress)
    if (!proxyAddress) {
      throw new Error('Failed to initialize your account, please try again')
    }

    return proxyAddress
  }

  /**
   * Get the balance of a fungible token.
   * Internal method exposed for dev flexibility.
   * @param param0 __namedParameters Object
   * @param accountAddress User's account address
   * @param tokenAddress Optional address of the token's contract.
   *  Defaults to W-ETH
   * @param tokenAbi ABI for the token's contract
   */
  public async _getTokenBalance(
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

  public _makeBundleSellOrder(
      { bundleName, bundleDescription, bundleExternalLink, assets, accountAddress, startAmountInEth, endAmountInEth, expirationTime = 0 }:
      { bundleName: string; bundleDescription?: string; bundleExternalLink?: string; assets: Array<{tokenId: string; tokenAddress: string}>; accountAddress: string; startAmountInEth: number; endAmountInEth?: number; expirationTime?: number }
    ): UnhashedOrder {

    const schema = this._getSchema()

    const wyAssets = assets.map(asset => getWyvernAsset(schema, asset.tokenId, asset.tokenAddress))

    const bundle: OpenSeaAssetBundleJSON = {
      assets: wyAssets,
      name: bundleName,
      description: bundleDescription,
      external_link: bundleExternalLink
    }

    const transactions = wyAssets.map(wyAsset => {
      const { target, calldata } = WyvernSchemas.encodeSell(schema, wyAsset, accountAddress)
      return {
        calldata,
        address: target,
        value: makeBigNumber(0)
      }
    })

    const atomicizedCalldata = this._wyvernProtocol.wyvernAtomicizer.atomicize.getABIEncodedTransactionData(
      transactions.map(t => t.address),
      transactions.map(t => t.value),
      transactions.map(t => makeBigNumber((t.calldata.length - 2) / 2)), // subtract 2 for '0x', divide by 2 for hex
      transactions.map(t => t.calldata).reduce((x, y) => x + y.slice(2)) // cut off the '0x'
    )

    // Small offset to account for latency
    const listingTime = Math.round(Date.now() / 1000 - 100)

    const extraInEth = endAmountInEth != null
      ? startAmountInEth - endAmountInEth
      : 0

    const orderSaleKind = endAmountInEth != null && endAmountInEth !== startAmountInEth
      ? SaleKind.DutchAuction
      : SaleKind.FixedPrice

    return {
      exchange: WyvernProtocol.getExchangeContractAddress(this._networkName),
      maker: accountAddress,
      taker: WyvernProtocol.NULL_ADDRESS,
      makerRelayerFee: makeBigNumber(0), // TODO decide fee policy for bundles
      takerRelayerFee: makeBigNumber(0),
      makerProtocolFee: makeBigNumber(0),
      takerProtocolFee: makeBigNumber(0),
      feeMethod: FeeMethod.SplitFee,
      feeRecipient,
      side: OrderSide.Sell,
      saleKind: orderSaleKind,
      target: WyvernProtocol.getAtomicizerContractAddress(this._networkName),
      howToCall: HowToCall.DelegateCall, // required DELEGATECALL to library for atomicizer
      calldata: atomicizedCalldata,
      replacementPattern: '0x',
      staticTarget: WyvernProtocol.NULL_ADDRESS,
      staticExtradata: '0x',
      paymentToken: WyvernProtocol.NULL_ADDRESS, // use Ether
      basePrice: makeBigNumber(this.web3.toWei(startAmountInEth, 'ether')).round(),
      extra: makeBigNumber(this.web3.toWei(extraInEth, 'ether')).round(),
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

    const getCalldata = () => {
      if (order.metadata.asset) {
        return order.side == OrderSide.Buy
          ? WyvernSchemas.encodeSell(schema, order.metadata.asset, accountAddress)
          : WyvernSchemas.encodeBuy(schema, order.metadata.asset, accountAddress)
      } else {
        return {
          target: WyvernProtocol.getAtomicizerContractAddress(this._networkName),
          calldata: order.calldata,
          replacementPattern: order.replacementPattern
        }
      }
    }

    const { target, calldata, replacementPattern } = getCalldata()

    const matchingOrder: UnhashedOrder = {
      exchange: order.exchange,
      maker: accountAddress,
      taker: WyvernProtocol.NULL_ADDRESS,
      makerRelayerFee: order.makerRelayerFee,
      takerRelayerFee: order.takerRelayerFee,
      makerProtocolFee: order.makerProtocolFee,
      takerProtocolFee: order.takerProtocolFee,
      feeMethod: order.feeMethod,
      feeRecipient: WyvernProtocol.NULL_ADDRESS,
      side: (order.side + 1) % 2,
      saleKind: SaleKind.FixedPrice,
      target,
      howToCall: order.howToCall,
      calldata,
      replacementPattern,
      staticTarget: WyvernProtocol.NULL_ADDRESS,
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

    const ordersCanMatch = await this._wyvernProtocol.wyvernExchange.ordersCanMatch_.callAsync(
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
      throw new Error('Unable to match offer with auction')
    }
    this.logger(`Orders matching: ${ordersCanMatch}`)

    const orderCalldataCanMatch = await this._wyvernProtocol.wyvernExchange.orderCalldataCanMatch.callAsync(buy.calldata, buy.replacementPattern, sell.calldata, sell.replacementPattern)
    this.logger(`Order calldata matching: ${orderCalldataCanMatch}`)

    if (!orderCalldataCanMatch) {
      throw new Error('Unable to match offer with auction, due to the type of offer requested')
    }
    return true
  }

  // Throws
  public async _validateSellOrderParameters(
      { order, accountAddress }:
      { order: UnhashedOrder; accountAddress: string }
    ) {
    const schema = this._getSchema()
    const wyAssets = order.metadata.bundle
      ? order.metadata.bundle.assets
      : order.metadata.asset
        ? [order.metadata.asset]
        : []
    const tokenAddress = order.paymentToken

    let proxyAddress = await this._getProxy(accountAddress)
    if (!proxyAddress) {
      proxyAddress = await this._initializeProxy(accountAddress)
    }
    const proxy = proxyAddress

    await Promise.all(wyAssets.map(async wyAsset => {
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
        proxyAddress
      })
    }))

    // For fulfilling bids,
    // need to approve access to fungible token because of the way fees are paid
    // This can be done at a higher level to show UI
    if (tokenAddress != WyvernProtocol.NULL_ADDRESS) {
      const minimumAmount = order.basePrice
      await this.approveFungibleToken({ accountAddress, tokenAddress, minimumAmount })
    }

    // Check sell parameters
    const sellValid = await this._wyvernProtocol.wyvernExchange.validateOrderParameters_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
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

  // Throws
  public async _validateBuyOrderParameters(
      { order, accountAddress }:
      { order: UnhashedOrder; accountAddress: string }
    ) {
    const tokenAddress = order.paymentToken

    if (tokenAddress != WyvernProtocol.NULL_ADDRESS) {

      const balance = await this._getTokenBalance({ accountAddress, tokenAddress })

      /* NOTE: no buy-side auctions for now, so sell.saleKind === 0 */
      const minimumAmount = order.basePrice

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
    const buyValid = await this._wyvernProtocol.wyvernExchange.validateOrderParameters_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
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
   * Private helper methods
   */

  private async _atomicMatch(
      { buy, sell, accountAddress }:
      { buy: Order; sell: Order; accountAddress: string }
    ) {
    let value
    let orderLookupHash

    // Case: user is the seller (and fulfilling a buy order)
    if (sell.maker.toLowerCase() == accountAddress.toLowerCase() && sell.feeRecipient == WyvernProtocol.NULL_ADDRESS) {
      // USER IS THE SELLER
      await this._validateSellOrderParameters({ order: sell, accountAddress })

      const buyValid = await this._wyvernProtocol.wyvernExchange.validateOrder_.callAsync(
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
        throw new Error('Invalid offer')
      }
      this.logger(`Buy order is valid: ${buyValid}`)

      orderLookupHash = buy.hash

    } else if (buy.maker.toLowerCase() == accountAddress.toLowerCase()) {
      // USER IS THE BUYER
      await this._validateBuyOrderParameters({ order: buy, accountAddress })

      const sellValid = await this._wyvernProtocol.wyvernExchange.validateOrder_.callAsync(
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
        throw new Error('Invalid auction')
      }
      this.logger(`Sell order validation: ${sellValid}`)

      // If using ETH to pay, set the value of the transaction to the current price
      if (buy.paymentToken == WyvernProtocol.NULL_ADDRESS) {
        value = await this._getEthValueForTakingSellOrder(sell)
      }

      orderLookupHash = sell.hash
    } else {
      // User is neither - matching service
      // TODO
      orderLookupHash = buy.hash
    }

    await this._validateMatch({ buy, sell, accountAddress })

    let txHash
    const gasPrice = await this._computeGasPrice()
    try {
      txHash = await this._wyvernProtocol.wyvernExchange.atomicMatch_.sendTransactionAsync([buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target,
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
          // Use the order hash so that OrdersMatched events can look it up
          orderLookupHash],
        { from: accountAddress, value, gasPrice })
    } catch (error) {
      console.error(error)
      throw new Error(`Failed to authorize transaction: "${
        error.message
          ? error.message
          : 'user denied'
        }..."`)
    }
    return txHash
  }

  private async _getEthValueForTakingSellOrder(sell: Order) {
    const currentPrice = await this.getCurrentPrice(sell)
    const estimatedPrice = estimateCurrentPrice(sell)

    const maxPrice = BigNumber.max(currentPrice, estimatedPrice)

    // TODO Why is this not always a big number?
    sell.takerRelayerFee = makeBigNumber(sell.takerRelayerFee.toString())
    const feePercentage = sell.takerRelayerFee.div(INVERSE_BASIS_POINT)
    const fee = feePercentage.times(maxPrice)
    return fee.plus(maxPrice).ceil()
  }

  // Throws
  private async _validateAndPostOrder(order: Order) {
    const hash = await this._wyvernProtocol.wyvernExchange.hashOrder_.callAsync(
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

    const valid = await this._wyvernProtocol.wyvernExchange.validateOrder_.callAsync(
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
      throw new Error('Invalid order')
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
