import * as Web3 from 'web3'
import { WyvernProtocol } from 'wyvern-js/lib'
import * as WyvernSchemas from 'wyvern-schemas'

import { OpenSeaAPI } from './api'
import { CanonicalWETH, DECENTRALAND_AUCTION_CONFIG, ERC20, ERC721, getMethod } from './contracts'
import { ECSignature, FeeMethod, HowToCall, Network, OpenSeaAPIConfig, OrderSide, SaleKind, UnhashedOrder, Order, UnsignedOrder, PartialReadonlyContractAbi, EventType } from './types'
import {
  confirmTransaction, feeRecipient, findAsset,
  makeBigNumber, orderToJSON, orderFromJSON,
  personalSignAsync, promisify,
  sendRawTransaction, estimateCurrentPrice
} from './wyvern'
import { BigNumber } from 'bignumber.js'
import { EventEmitter, EventSubscription } from 'fbemitter'

export { orderToJSON, orderFromJSON }

export class OpenSea {

  private web3: Web3
  private networkName: Network
  private wyvernProtocol: WyvernProtocol
  private api: OpenSeaAPI
  private emitter: EventEmitter

  constructor(provider: Web3.Provider, apiConfig: OpenSeaAPIConfig = {}) {

    apiConfig.networkName = apiConfig.networkName || Network.Main
    apiConfig.gasPrice = apiConfig.gasPrice || makeBigNumber(100000)

    // Web3 Config
    this.web3 = new Web3(provider)
    this.networkName = apiConfig.networkName

    // WyvernJS config
    this.wyvernProtocol = new WyvernProtocol(provider, {
      network: this.networkName,
      gasPrice: apiConfig.gasPrice,
    })

    // API config
    this.api = new OpenSeaAPI(apiConfig)

    // Emit events
    this.emitter = new EventEmitter()
  }

  public addListener(event: EventType, listener: (...args: any[]) => void, once = false): EventSubscription {
    const subscription = once
      ? this.emitter.once(event, listener)
      : this.emitter.addListener(event, listener)
    return subscription
  }

  public removeAllListeners(event?: EventType) {
    this.emitter.removeAllListeners(event)
  }

  public async wrapEth(
      { amountInEth, accountAddress }:
      { amountInEth: number; accountAddress: string; awaitConfirmation?: boolean}
    ) {

    const token = WyvernSchemas.tokens[this.networkName].canonicalWrappedEther

    const amount = WyvernProtocol.toBaseUnitAmount(makeBigNumber(amountInEth), token.decimals)

    const transactionHash = sendRawTransaction(this.web3, {
      fromAddress: accountAddress,
      toAddress: token.address,
      value: amount,
      data: WyvernSchemas.encodeCall(getMethod(CanonicalWETH, 'deposit'), []),
      awaitConfirmation: false,
    })

    this._dispatch(EventType.WrapEth, { accountAddress, amount, transactionHash })

    await confirmTransaction(this.web3, transactionHash.toString())

    this._dispatch(EventType.WrapEthComplete, { accountAddress, amount })
  }

  public async unwrapWeth(
    { amountInEth, accountAddress }:
    { amountInEth: number; accountAddress: string; awaitConfirmation?: boolean}
    ) {

    const token = WyvernSchemas.tokens[this.networkName].canonicalWrappedEther

    const amount = WyvernProtocol.toBaseUnitAmount(makeBigNumber(amountInEth), token.decimals)

    const transactionHash = sendRawTransaction(this.web3, {
      fromAddress: accountAddress,
      toAddress: token.address,
      value: 0,
      data: WyvernSchemas.encodeCall(getMethod(CanonicalWETH, 'withdraw'), [amount.toString()]),
      awaitConfirmation: false,
    })

    this._dispatch(EventType.UnwrapWeth, { accountAddress, amount, transactionHash })

    await confirmTransaction(this.web3, transactionHash.toString())

    this._dispatch(EventType.UnwrapWethComplete, { accountAddress, amount })
  }

  public async createBuyOrder(
    { tokenId, tokenAddress, accountAddress, amountInEth, expirationTime = 0 }:
    { tokenId: string; tokenAddress: string; accountAddress: string; amountInEth: number; expirationTime?: number }
    ) {
    const token = WyvernSchemas.tokens[this.networkName].canonicalWrappedEther
    const schema = this._getSchema()
    const wyAsset = _getWyvernAsset(schema, { tokenId, tokenAddress })
    const metadata = {
      asset: wyAsset,
      schema: schema.name,
    }
    // Small offset to account for latency
    const listingTime = Math.round(Date.now() / 1000 - 100)

    const { target, calldata, replacementPattern } = WyvernSchemas.encodeBuy(schema, wyAsset, accountAddress)
    const order: UnhashedOrder = {
      exchange: WyvernProtocol.getExchangeContractAddress(this.networkName),
      maker: accountAddress,
      taker: WyvernProtocol.NULL_ADDRESS,
      makerRelayerFee: makeBigNumber(0),
      takerRelayerFee: makeBigNumber(0),
      makerProtocolFee: makeBigNumber(0),
      takerProtocolFee: makeBigNumber(0),
      feeMethod: FeeMethod.ProtocolFee,
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
      // TS Bug with wyvern 0x schemas
      hash: WyvernProtocol.getOrderHashHex(orderToJSON(order) as any)
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

  public async createSellOrder(
    { tokenId, tokenAddress, accountAddress, startAmountInEth, endAmountInEth, expirationTime = 0 }:
    { tokenId: string; tokenAddress: string; accountAddress: string; startAmountInEth: number; endAmountInEth: number; expirationTime?: number }
    ) {
    const schema = this._getSchema()
    const wyAsset = _getWyvernAsset(schema, { tokenId, tokenAddress })
    const metadata = {
      asset: wyAsset,
      schema: schema.name,
    }
    // Small offset to account for latency
    const listingTime = Math.round(Date.now() / 1000 - 100)

    const { target, calldata, replacementPattern } = WyvernSchemas.encodeSell(schema, wyAsset, accountAddress)

    const extraInEth = endAmountInEth != null
      ? startAmountInEth - endAmountInEth
      : 0

    const orderSaleKind = endAmountInEth != null && endAmountInEth !== startAmountInEth
      ? SaleKind.DutchAuction
      : SaleKind.FixedPrice

    const order: UnhashedOrder = {
      exchange: WyvernProtocol.getExchangeContractAddress(this.networkName),
      maker: accountAddress,
      taker: WyvernProtocol.NULL_ADDRESS,
      makerRelayerFee: makeBigNumber(0),
      takerRelayerFee: makeBigNumber(0),
      makerProtocolFee: makeBigNumber(0),
      takerProtocolFee: makeBigNumber(0),
      feeMethod: FeeMethod.ProtocolFee,
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
      metadata,
    }

    await this._validateSellOrderParameters({ order, accountAddress })

    const hashedOrder = {
      ...order,
      // TS Bug with wyvern 0x schemas
      hash: WyvernProtocol.getOrderHashHex(orderToJSON(order) as any)
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

    const transactionHash = await this._atomicMatch({ buy, sell, accountAddress })

    this._dispatch(EventType.MatchOrders, { buy, sell, accountAddress, transactionHash })

    await confirmTransaction(this.web3, transactionHash.toString())

    this._dispatch(EventType.MatchOrdersComplete, { buy, sell, accountAddress })
  }

  public async cancelOrder(
      { order, accountAddress }:
      { order: Order; accountAddress: string}
    ) {
    const protocolInstance = this.wyvernProtocol
    const transactionHash = await protocolInstance.wyvernExchange.cancelOrder_.sendTransactionAsync(
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
      { from: accountAddress })

    this._dispatch(EventType.CancelOrder, { order, accountAddress, transactionHash })

    await confirmTransaction(this.web3, transactionHash.toString())

    this._dispatch(EventType.CancelOrderComplete, { order, accountAddress })
  }

  public async getApprovedTokenCount(
      { accountAddress, tokenAddress }:
      { accountAddress: string; tokenAddress: string}
    ) {
    const contractAddress = WyvernProtocol.getTokenTransferProxyAddress(this.networkName)
    const approved = await promisify<string>(c => this.web3.eth.call({
      from: accountAddress,
      to: tokenAddress,
      data: WyvernSchemas.encodeCall(getMethod(ERC20, 'allowance'),
        [accountAddress, contractAddress]),
    }, c))
    return makeBigNumber(approved)
  }

  public async approveNonFungibleToken(
      { tokenId, tokenAddress, accountAddress, proxyAddress = null, tokenAbi = ERC721 }:
      { tokenId: string; tokenAddress: string; accountAddress: string; proxyAddress: string | null; tokenAbi?: PartialReadonlyContractAbi}
    ) {
    const tokenContract = this.web3.eth.contract(tokenAbi as any[])
    const erc721 = await tokenContract.at(tokenAddress)

    if (!proxyAddress) {
      proxyAddress = await this._getProxy(accountAddress)
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
      // onCheck(true, 'Already approved proxy for all tokens')
      return
    }

    if (isApprovedForAll == 0) {
      // Supports ApproveAll
      //  Result was NULL_BLOCK_HASH
      //  not approved for all yet

      try {
        const transactionHash = await sendRawTransaction(this.web3, {
          fromAddress: accountAddress,
          toAddress: erc721.address,
          data: erc721.setApprovalForAll.getData(proxyAddress, true),
          awaitConfirmation: false,
        })

        this._dispatch(EventType.ApproveAllAssets, { accountAddress, proxyAddress, tokenAddress, transactionHash })
        await confirmTransaction(this.web3, transactionHash.toString())
        this._dispatch(EventType.ApproveAllAssetsComplete, { accountAddress, proxyAddress, tokenAddress })

        return
      } catch (error) {
        console.error(error)
        throw new Error('Failed to approve access to these tokens. OpenSea has been alerted, but you can also chat with us on Discord.')
      }
    }

    // Does not support ApproveAll (ERC721 v1 or v2)
    // onCheck(true, 'Contract does not support Approve All')

    // Note: approvedAddr will be '0x' if not supported
    let approvedAddr = await promisify(c => erc721.getApproved.call(tokenId, c))
    if (approvedAddr == proxyAddress) {
      // onCheck(true, 'Already approved proxy for this token')
      return
    }
    // onCheck(true, `Approve response: ${approvedAddr}`)

    // SPECIAL CASING

    if (approvedAddr == '0x') {
      // CRYPTOKITTIES check
      approvedAddr = await promisify(c => erc721.kittyIndexToApproved.call(tokenId, c))
      if (approvedAddr == proxyAddress) {
        // onCheck(true, 'Already approved proxy for this kitty')
        return
      }
      // onCheck(true, `CryptoKitties approve response: ${approvedAddr}`)
    }

    if (approvedAddr == '0x') {
      // ETHEREMON check
      approvedAddr = await promisify(c => erc721.allowed.call(accountAddress, tokenId, c))
      if (approvedAddr == proxyAddress) {
        // onCheck(true, 'Already allowed proxy for this token')
        return
      }
      // onCheck(true, `"allowed" response: ${approvedAddr}`)
    }

    // Call `approve`

    try {
      const transactionHash = await sendRawTransaction(this.web3, {
        fromAddress: accountAddress,
        toAddress: erc721.address,
        data: erc721.approve.getData(proxyAddress, tokenId),
        awaitConfirmation: false
      })

      this._dispatch(EventType.ApproveAsset, { accountAddress, proxyAddress, tokenAddress, tokenId, transactionHash })
      await confirmTransaction(this.web3, transactionHash.toString())
      this._dispatch(EventType.ApproveAssetComplete, { accountAddress, proxyAddress, tokenAddress, tokenId })

      return
    } catch (error) {
      console.error(error)
      throw new Error('Failed to approve access to this token. OpenSea has been alerted, but you can also chat with us on Discord.')
    }
  }

  // Returns transaction hash
  public async approveFungibleToken(
      { accountAddress, tokenAddress }:
      { accountAddress: string; tokenAddress: string}
    ) {
    const contractAddress = WyvernProtocol.getTokenTransferProxyAddress(this.networkName)

    const txHash = await sendRawTransaction(this.web3, {
      fromAddress: accountAddress,
      toAddress: tokenAddress,
      data: WyvernSchemas.encodeCall(getMethod(ERC20, 'approve'),
        [contractAddress, WyvernProtocol.MAX_UINT_256.toString()]),
      awaitConfirmation: true,
    })
    return txHash
  }

  /**
   * Gets the price for the order using the contract
   */
  public async getCurrentPrice(order: Order) {
    const protocolInstance = this.wyvernProtocol

    const currentPrice = await protocolInstance.wyvernExchange.calculateCurrentPrice_.callAsync(
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
   * Helper methods
   */

  public async _atomicMatch(
      { buy, sell, accountAddress }:
      { buy: Order; sell: Order; accountAddress: string }
    ) {
    const protocolInstance = this.wyvernProtocol
    let value
    let orderLookupHash

    // Case: user is the seller (and fulfilling a buy order)
    if (sell.maker.toLowerCase() == accountAddress.toLowerCase() && sell.feeRecipient == WyvernProtocol.NULL_ADDRESS) {
      // USER IS THE SELLER
      await this._validateSellOrderParameters({ order: sell, accountAddress })

      const buyValid = await protocolInstance.wyvernExchange.validateOrder_.callAsync(
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
      // onCheck(buyValid, 'Buy order is valid')

      orderLookupHash = buy.hash

    } else if (buy.maker.toLowerCase() == accountAddress.toLowerCase()) {
      // USER IS THE BUYER
      await this._validateBuyOrderParameters({ order: buy, accountAddress })

      const sellValid = await protocolInstance.wyvernExchange.validateOrder_.callAsync(
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
      // onCheck(sellValid, 'Sell order validation')

      // If using ETH to pay, set the value of the transaction to the current price
      if (buy.paymentToken == WyvernProtocol.NULL_ADDRESS) {
        const currentPrice = await this.getCurrentPrice(sell)
        const estimatedPrice = estimateCurrentPrice(sell)
        value = BigNumber.max(currentPrice, estimatedPrice)
      }

      orderLookupHash = sell.hash
    } else {
      // User is neither - matching service
      // TODO
      orderLookupHash = buy.hash
    }

    const ordersCanMatch = await protocolInstance.wyvernExchange.ordersCanMatch_.callAsync(
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
    // onCheck(ordersCanMatch, "Orders matching")
    const orderCalldataCanMatch = await protocolInstance.wyvernExchange.orderCalldataCanMatch.callAsync(buy.calldata, buy.replacementPattern, sell.calldata, sell.replacementPattern)
    // onCheck(orderCalldataCanMatch, `Order calldata matching`)
    if (!orderCalldataCanMatch) {
      throw new Error('Unable to match offer with auction, due to the type of offer requested')
    }

    let txHash
    try {
      txHash = await protocolInstance.wyvernExchange.atomicMatch_.sendTransactionAsync([buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target,
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
        { from: accountAddress, value })
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

  public _makeMatchingOrder(
      { order, accountAddress }:
      { order: Order; accountAddress: string}
    ): UnsignedOrder {
    const schema = this._getSchema()
    const listingTime = Math.round(Date.now() / 1000 - 1000)
    const { target, calldata, replacementPattern } = order.side == OrderSide.Buy
      ? WyvernSchemas.encodeSell(schema, order.metadata.asset, accountAddress)
      : WyvernSchemas.encodeBuy(schema, order.metadata.asset, accountAddress)

    const matchingOrder: UnhashedOrder = {
      exchange: order.exchange,
      maker: accountAddress,
      taker: WyvernProtocol.NULL_ADDRESS,
      makerRelayerFee: makeBigNumber(0),
      takerRelayerFee: makeBigNumber(0),
      makerProtocolFee: makeBigNumber(0),
      takerProtocolFee: makeBigNumber(0),
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
      hash: WyvernProtocol.getOrderHashHex(matchingOrder)
    }
  }

  // Returns null if no proxy and throws if method not available
  public async _getProxy(accountAddress: string): Promise<string | null> {
    const protocolInstance = this.wyvernProtocol
    let proxyAddress: string | null = await protocolInstance.wyvernProxyRegistry.proxies.callAsync(accountAddress)

    if (proxyAddress == '0x') {
      throw new Error("Couldn't retrieve your account from the blockchain - make sure you're on the correct Ethereum network!")
    }

    if (!proxyAddress || proxyAddress == WyvernProtocol.NULL_ADDRESS) {
      proxyAddress = null
    }
    return proxyAddress
  }

  public async _initializeProxy(accountAddress: string) {
    const protocolInstance = this.wyvernProtocol
    const transactionHash = await protocolInstance.wyvernProxyRegistry.registerProxy.sendTransactionAsync({
      from: accountAddress,
    })
    this._dispatch(EventType.InitializeAccount, { accountAddress, transactionHash })

    await confirmTransaction(this.web3, transactionHash)

    const proxyAddress = await this._getProxy(accountAddress)
    if (!proxyAddress) {
      throw new Error('Failed to initialize your account, please try again')
    }

    this._dispatch(EventType.InitializeAccountComplete, { accountAddress, proxyAddress })

    return proxyAddress
  }

  // Throws
  public async _validateSellOrderParameters(
      { order, accountAddress }:
      { order: UnhashedOrder; accountAddress: string }
    ) {
    const schema = this._getSchema()
    const wyAsset = order.metadata.asset

    let proxyAddress = await this._getProxy(accountAddress)

    if (!proxyAddress) {
      proxyAddress = await this._initializeProxy(accountAddress)
    }
    const where = await findAsset(this.web3, { account: accountAddress, proxy: proxyAddress, wyAsset, schema })

    if (where == 'other') {
      throw new Error('You do not own this asset.')
    }

    // Won't happen - but withdraw needs fixing
    // if (where === 'proxy') {
    //   onCheck(false, 'You must first withdraw this asset.')
    //   await this._withdrawAsset(asset, accountAddress, proxyAddress)
    // }

    // else where === 'account':

    await this.approveNonFungibleToken({
      tokenId: wyAsset.id.toString(),
      tokenAddress: wyAsset.address,
      accountAddress,
      proxyAddress
    })

    // Check sell parameters
    const protocolInstance = this.wyvernProtocol

    const sellValid = await protocolInstance.wyvernExchange.validateOrderParameters_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
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
      throw new Error(`Failed to validate sell order parameters: ${JSON.stringify(order)}`)
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

      const required = order.basePrice /* NOTE: no buy-side auctions for now, so sell.saleKind === 0 */

      // Check WETH balance
      if (balance.toNumber() < required.toNumber()) {
        if (tokenAddress == WyvernSchemas.tokens[this.networkName].canonicalWrappedEther.address) {
          throw new Error('Insufficient balance. You may need to wrap Ether.')
        } else {
          throw new Error('Insufficient balance.')
        }
      }

      // Check token approval
      // This can be done at a higher level to show UI
      const approved = await this.getApprovedTokenCount({ accountAddress, tokenAddress })
      if (approved.toNumber() < required.toNumber()) {
        try {
          await this.approveFungibleToken({ accountAddress, tokenAddress })
        } catch (error) {
          console.error(error)
          throw new Error('You declined to approve your W-ETH.')
        }
      }
    }

    // Check order formation
    const protocolInstance = this.wyvernProtocol
    const buyValid = await protocolInstance.wyvernExchange.validateOrderParameters_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
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
      throw new Error(`Failed to validate buy order parameters: ${JSON.stringify(order)}`)
    }
  }

  public async _getTokenBalance(
      { accountAddress, tokenAddress, tokenAbi = ERC20 }:
      { accountAddress: string; tokenAddress: string; tokenAbi?: PartialReadonlyContractAbi }
    ) {
    if (!tokenAddress) {
      tokenAddress = WyvernSchemas.tokens[this.networkName].canonicalWrappedEther.address
    }
    const amount = await promisify(c => this.web3.eth.call({
      from: accountAddress,
      to: tokenAddress,
      data: WyvernSchemas.encodeCall(getMethod(tokenAbi, 'balanceOf'), [accountAddress]),
    }, c))

    return makeBigNumber(amount.toString())
  }

  // Throws
  public async _validateAndPostOrder(order: Order) {
    const protocolInstance = this.wyvernProtocol
    const hash = await protocolInstance.wyvernExchange.hashOrder_.callAsync(
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
    // onCheck(true, 'Order hashes match')

    const valid = await protocolInstance.wyvernExchange.validateOrder_.callAsync(
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
    // onCheck(true, 'Order is valid')

    await this.api.postOrder(orderToJSON(order))
  }

  public async _signOrder(
      order:
      {hash: string; maker: string}
    ): Promise<ECSignature> {
    const message = order.hash
    const signerAddress = order.maker

    return personalSignAsync(this.web3, message, signerAddress)
  }

  public _getSchema(schemaName = SchemaName.ERC721) {
    const schema = WyvernSchemas.schemas[this.networkName].filter(s => s.name == schemaName)[0]

    if (!schema) {
      throw new Error('No schema found for this asset; please check back later!')
    }
    return schema
  }

  public _dispatch(event: EventType, data = {}): void {
    this.emitter.emit(event, data)
  }
}

function _getWyvernAsset(
  schema: any,
  { tokenId, tokenAddress }:
  { tokenId: string; tokenAddress: string}
  ) {
  return schema.assetFromFields({
    'ID': tokenId.toString(),
    'Address': tokenAddress,
  })
}
