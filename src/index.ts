import * as Web3 from 'web3'
import { WyvernProtocol } from 'wyvern-js/lib'
import * as WyvernSchemas from 'wyvern-schemas'

import { OpenSeaAPI } from './api'
import { CanonicalWETH, DECENTRALAND_AUCTION_CONFIG, ERC20, ERC721, getMethod } from './contracts'
import { ECSignature, FeeMethod, HowToCall, Network, OpenSeaAPIConfig, OrderSide, SaleKind } from './types'
import {
  confirmTransaction, encodeCall, feeRecipient, findAsset,
  makeBigNumber, orderToJSON,
  personalSignAsync, promisify,
  sendRawTransaction, computeCurrentPrice
} from './wyvern'
import BigNumber from 'bignumber.js'

export class OpenSea {

  private web3: Web3
  private networkName: Network
  private wyvernProtocol: WyvernProtocol
  private api: OpenSeaAPI

  constructor(
    provider: Web3.Provider,
    apiConfig: OpenSeaAPIConfig = {
      networkName: Network.Main,
      gasPrice: makeBigNumber(100000),
    }) {

    // Web3 Config
    this.web3 = new Web3(provider)
    this.networkName = networkName

    // WyvernJS config
    this.wyvernProtocol = new WyvernProtocol(provider, {
      network: this.networkName,
      gasPrice,
    })

    // API config
    this.api = new OpenSeaAPI(apiConfig)
  }

  public async wrapEth({ amountInEth, accountAddress, awaitConfirmation = true }) {

    const token = WyvernSchemas.tokens[this.networkName].canonicalWrappedEther

    const baseAmount = WyvernProtocol.toBaseUnitAmount(makeBigNumber(amountInEth), token.decimals)

    return sendRawTransaction(this.web3, {
      fromAddress: accountAddress,
      toAddress: token.address,
      value: baseAmount,
      data: encodeCall(getMethod(CanonicalWETH, 'deposit'), []),
      awaitConfirmation,
    })
  }

  public async unwrapWeth({ amountInEth, accountAddress, awaitConfirmation = true }) {

    const token = WyvernSchemas.tokens[this.networkName].canonicalWrappedEther

    const baseAmount = WyvernProtocol.toBaseUnitAmount(makeBigNumber(amountInEth), token.decimals)

    return sendRawTransaction(this.web3, {
      fromAddress: accountAddress,
      toAddress: token.address,
      value: 0,
      data: encodeCall(getMethod(CanonicalWETH, 'withdraw'), [baseAmount.toString()]),
      awaitConfirmation,
    })
  }

  public async createBuyOrder({ tokenId, tokenAddress, accountAddress, amountInEth, expirationTime = 0 }) {
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
    const order = {
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

    const orderJSON = orderToJSON(order)
    let signature
    try {
      signature = await this._signOrder({ order: orderJSON })
    } catch (error) {
      console.error(error)
      throw new Error("You declined to sign your offer. Just a reminder: there's no gas needed anymore to create offers!")
    }

    orderJSON.v = signature.v
    orderJSON.r = signature.r
    orderJSON.s = signature.s

    return this._validateAndPostOrder(orderJSON)
  }

  public async createSellOrder({ tokenId, tokenAddress, accountAddress, startAmountInEth, endAmountInEth, expirationTime = 0 }) {
    const schema = this._getSchema()
    const wyAsset = this._getWyvernAsset(schema, { tokenId, tokenAddress })
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

    const order = {
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

    const orderJSON = orderToJSON(order)
    let signature
    try {
      signature = await this._signOrder({ order: orderJSON })
    } catch (error) {
      console.error(error)
      throw new Error("You declined to sign your auction. Just a reminder: there's no gas needed anymore to create auctions!")
    }

    orderJSON.v = signature.v
    orderJSON.r = signature.r
    orderJSON.s = signature.s

    return this._validateAndPostOrder(orderJSON)
  }

  public async fulfillOrder({ order, accountAddress }) {
    const orderToMatch = await this._makeMatchingOrder({ order, accountAddress })

    const buy = order.side == OrderSide.Buy ? order : orderToMatch
    const sell = order.side == OrderSide.Buy ? orderToMatch : order
    const txHash = await this._atomicMatch({ buy, sell, accountAddress })
    return txHash
  }

  public async cancelOrder({ order, accountAddress }) {
    const protocolInstance = this.wyvernProtocol
    const txHash = await protocolInstance.wyvernExchange.cancelOrder_.sendTransactionAsync(
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
    return txHash
  }

  public async getApprovedTokenCount({ accountAddress, tokenAddress }) {
    const contractAddress = WyvernProtocol.getTokenTransferProxyAddress(this.networkName)
    const approved = await promisify(c => this.web3.eth.call({
      from: accountAddress,
      to: tokenAddress,
      data: encodeCall(getMethod(ERC20, 'allowance'),
        [accountAddress, contractAddress]),
    }, c))
    return makeBigNumber(approved)
  }

  public async approveNonFungibleToken({ tokenId, tokenAddress, accountAddress, proxyAddress, tokenAbi = ERC721 }) {
    const tokenContract = this.web3.eth.contract(tokenAbi)
    const erc721 = await tokenContract.at(tokenAddress)

    if (!proxyAddress) {
      proxyAddress = this._getProxy(accountAddress)
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

    const isApprovedForAllCallHash = await promisify(c => this.web3.eth.call({
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

      // TODO dispatch({ type: ActionTypes.APPROVE_ALL_ASSETS })
      try {
        const txHash = await sendRawTransaction(this.web3, {
          fromAddress: accountAddress,
          toAddress: erc721.address,
          data: erc721.setApprovalForAll.getData(proxyAddress, true),
          confirmTransaction: true,
        })
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
    // TODO dispatch({ type: ActionTypes.APPROVE_ASSET })
    try {
      const txHash = await sendRawTransaction(this.web3, {
        fromAddress: accountAddress,
        toAddress: erc721.address,
        data: erc721.approve.getData(proxyAddress, tokenId),
        confirmTransaction: true,
      })
    } catch (error) {
      console.error(error)
      throw new Error('Failed to approve access to this token. OpenSea has been alerted, but you can also chat with us on Discord.')
    }
  }

  // Returns transaction hash
  public async approveFungibleToken({ accountAddress, tokenAddress }) {
    const contractAddress = WyvernProtocol.getTokenTransferProxyAddress(this.networkName)

    const txHash = await sendRawTransaction(this.web3, {
      fromAddress: accountAddress,
      toAddress: tokenAddress,
      data: encodeCall(getMethod(ERC20, 'approve'),
        [contractAddress, WyvernProtocol.MAX_UINT_256.toString()]),
      awaitConfirmation: true,
    })
    return txHash
  }

  /**
   * Gets the price for the order using the contract
   * @param {object} order Wyvern order object
   */
  public async getCurrentPrice(order) {
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

  public async _atomicMatch({ buy, sell, accountAddress }) {
    const protocolInstance = this.wyvernProtocol
    let value, orderLookupHash

    /* This is a bug, short-circuit not working properly. */
    if (!buy.r || !buy.s) {
      buy.v = sell.v
      buy.r = sell.r
      buy.s = sell.s
    } else {
      sell.v = buy.v
      sell.r = buy.r
      sell.s = buy.s
    }

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
    }

    // Case: user is the buyer.
    if (buy.maker.toLowerCase() == accountAddress.toLowerCase()) {
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
        const estimatedPrice = await computeCurrentPrice(sell)
        value = BigNumber.max(currentPrice, estimatedPrice)
      }

      orderLookupHash = sell.hash
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

    const args = [[buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target,
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
    { from: accountAddress, value }]

    let txHash
    try {
      txHash = await protocolInstance.wyvernExchange.atomicMatch_.sendTransactionAsync(...args)
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

  public async _makeMatchingOrder({ order, accountAddress }) {
    const schema = this._getSchema()
    const listingTime = Math.round(Date.now() / 1000 - 1000)
    const { target, calldata, replacementPattern } = order.side == OrderSide.Buy
      ? WyvernSchemas.encodeSell(schema, order.metadata.asset, accountAddress)
      : WyvernSchemas.encodeBuy(schema, order.metadata.asset, accountAddress)
    return {
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
      extra: 0,
      listingTime: makeBigNumber(listingTime),
      expirationTime: makeBigNumber(0),
      salt: WyvernProtocol.generatePseudoRandomSalt(),
      metadata: order.metadata,
    }
  }

  // Returns null if no proxy and throws if method not available
  public async _getProxy(accountAddress) {
    const protocolInstance = this.wyvernProtocol
    let proxyAddress = await protocolInstance.wyvernProxyRegistry.proxies.callAsync(accountAddress)

    if (proxyAddress == '0x') {
      throw new Error("Couldn't retrieve your account from the blockchain - make sure you're on the correct Ethereum network!")
    }

    if (!proxyAddress || proxyAddress == WyvernProtocol.NULL_ADDRESS) {
      proxyAddress = null
    }
    return proxyAddress
  }

  public async _initializeProxy(accountAddress) {
    const protocolInstance = this.wyvernProtocol
    const txHash = await protocolInstance.wyvernProxyRegistry.registerProxy.sendTransactionAsync({
      from: accountAddress,
    })
    // TODO dispatch(ExchangeActions._setTransactionHash(txHash))
    await confirmTransaction(txHash)
    const proxyAddress = await this._getProxy(accountAddress)
    if (!proxyAddress) {
      throw new Error('Failed to initialize your account, please try again')
    }
    return proxyAddress
  }

  // Throws
  public async _validateSellOrderParameters({ order, accountAddress }: { Order, string }) {
    const schema = this._getSchema()
    const wyAsset = order.metadata.asset
    let proxyAddress = await this._getProxy(accountAddress)
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

    if (!proxyAddress) {
      // TODO dispatch({ type: ActionTypes.INITIALIZE_PROXY })
      proxyAddress = await this._initializeProxy(accountAddress)
      // dispatch({ type: ActionTypes.RESET_EXCHANGE })
    }

    await this.approveNonFungibleToken({
      tokenId: wyAsset.id,
      tokenAddress: wyAsset.address,
      accountAddress,
      proxyAddress,
    })

    // Check sell parameters
    const protocolInstance = this.wyvernProtocol
    const sellValidArgs = [
      [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
      [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      { from: accountAddress }]

    const sellValid = await protocolInstance.wyvernExchange.validateOrderParameters_.callAsync(...sellValidArgs)
    if (!sellValid) {
      throw new Error(`Failed to validate sell order parameters: ${JSON.stringify(sellValidArgs)}`)
    }
  }

  // Throws
  public async _validateBuyOrderParameters({ order, accountAddress }: { Order, string }) {
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
    const buyValidArgs = [[order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
    [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
    order.feeMethod,
    order.side,
    order.saleKind,
    order.howToCall,
    order.calldata,
    order.replacementPattern,
    order.staticExtradata,
    { from: accountAddress }]
    const buyValid = await protocolInstance.wyvernExchange.validateOrderParameters_.callAsync(...buyValidArgs)
    if (!buyValid) {
      throw new Error(`Failed to validate buy order parameters: ${JSON.stringify(buyValidArgs)}`)
    }
  }

  public async _getTokenBalance({ accountAddress, tokenAddress, tokenAbi = ERC20 }) {
    if (!tokenAddress) {
      tokenAddress = WyvernSchemas.tokens[this.networkName].canonicalWrappedEther.address
    }
    const amount = await promisify(c => this.web3.eth.call({
      from: accountAddress,
      to: tokenAddress,
      data: encodeCall(getMethod(tokenAbi, 'balanceOf'), [accountAddress]),
    }, c))

    return makeBigNumber(amount)
  }

  // Throws
  public async _validateAndPostOrder(order) {
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
      parseInt(order.v),
      order.r || '0x',
      order.s || '0x')

    if (!valid) {
      console.error(order)
      throw new Error('Invalid order')
    }
    // onCheck(true, 'Order is valid')

    await this.api.postOrder(order)
  }

  public async _signOrder({ order }): Promise<ECSignature> {
    const message = order.hash || WyvernProtocol.getOrderHashHex(order)
    const signerAddress = order.maker

    return personalSignAsync(this.web3, { message, signerAddress })
  }

  public _getSchema(schemaName = 'ERC721') {
    const schema = WyvernSchemas.schemas[this.networkName].filter(s => s.name == schemaName)[0]

    if (!schema) {
      throw new Error('No schema found for this asset; please check back later!')
    }
    return schema
  }
}

function _getWyvernAsset(schema, { tokenId, tokenAddress }) {
  return schema.assetFromFields({
    'ID': tokenId.toString(),
    'Address': tokenAddress,
  })
}
