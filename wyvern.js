import BigNumber from 'bignumber.js'
import { WyvernProtocol } from 'wyvern-js/lib'
import * as WyvernSchemas from 'wyvern-schemas'
import _ from 'lodash'

import * as ethUtil from 'ethereumjs-util';

// ENUMS FROM WYVERN CONTRACT

export const orderSide = {
  BUY: 0,
  SELL: 1
}

export const saleKind = {
  FIXED_PRICE: 0,
  DUTCH_AUCTION: 1
}

export const howToCall = {
  CALL: 0,
  DELEGATE_CALL: 1
}

export const feeMethod = {
  PROTOCOL_FEE: 0,
  SPLIT_FEE: 1
}

export const NULL_BLOCK_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

export const feeRecipient = "0x5b3256965e7C3cF26E11FCAf296DfC8807C01073"
// WyvernExchange.feeRecipient

// OTHER

var txCallbacks = {}

export const encodeCall = WyvernSchemas.encodeCall

export const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      resolve(res)
    })
  )

const track = (web3, {txHash}, onFinalized) => {
  if (txCallbacks[txHash]) {
    txCallbacks[txHash].push(onFinalized)
  } else {
    txCallbacks[txHash] = [onFinalized]
    const poll = async () => {
      // if (!web3) {
      //   setTimeout(poll, 1000)
      //   return
      // }
      const tx = await promisify(c => web3.eth.getTransaction(txHash, c))
      if (tx && tx.blockHash && tx.blockHash !== NULL_BLOCK_HASH) {
        const receipt = await promisify(c => web3.eth.getTransactionReceipt(txHash, c))
        if (!receipt) {
          // Hack: assume success if no receipt
          console.warn("No receipt found for ", txHash)
        }
        const status = receipt
          ? parseInt(receipt.status) === 1
          : true
        txCallbacks[txHash].map(f => f(status))
        delete txCallbacks[txHash]
      } else {
        setTimeout(poll, 1000)
      }
    }
    poll()
  }
}

export const confirmTransaction = async (web3, {txHash, onConfirmation}) => {
  await new Promise((resolve, reject) => {
    track(web3, {txHash}, (didSucceed) => {
      if (didSucceed) {
        resolve("Transaction complete")
      } else {
        reject("Transaction failed")
      }
    })
  })
}

export const orderFromJSON = (order) => {
  const hash = WyvernProtocol.getOrderHashHex(order)
  if (hash !== order.hash) {
    console.error("Invalid order hash")
  }
  var fromJSON = {
    hash: order.hash,
    cancelledOrFinalized: order.cancelledOrFinalized,
    markedInvalid: order.markedInvalid,
    metadata: order.metadata,
    exchange: order.exchange,
    maker: order.maker,
    taker: order.taker,
    makerRelayerFee: new BigNumber(order.makerRelayerFee),
    takerRelayerFee: new BigNumber(order.takerRelayerFee),
    makerProtocolFee: new BigNumber(order.makerProtocolFee),
    takerProtocolFee: new BigNumber(order.takerProtocolFee),
    feeMethod: JSON.parse(order.feeMethod),
    feeRecipient: order.feeRecipient,
    side: JSON.parse(order.side),
    saleKind: JSON.parse(order.saleKind),
    target: order.target,
    howToCall: JSON.parse(order.howToCall),
    calldata: order.calldata,
    replacementPattern: order.replacementPattern,
    staticTarget: order.staticTarget,
    staticExtradata: order.staticExtradata,
    paymentToken: order.paymentToken,
    basePrice: new BigNumber(order.basePrice),
    extra: new BigNumber(order.extra),
    listingTime: new BigNumber(order.listingTime),
    expirationTime: new BigNumber(order.expirationTime),
    salt: new BigNumber(order.salt),
    v: parseInt(order.v),
    r: order.r,
    s: order.s
  }

  fromJSON.currentPrice = computeCurrentPrice(order)

  if (order.asset) fromJSON.asset = assetFromJSON(order.asset)
  if (order.settlement) fromJSON.settlement = settlementFromJSON(order.settlement)
  return fromJSON
}

export const orderToJSON = (order) => {
  var asJSON = {
    exchange: order.exchange.toLowerCase(),
    maker: order.maker.toLowerCase(),
    taker: order.taker.toLowerCase(),
    makerRelayerFee: order.makerRelayerFee.toString(),
    takerRelayerFee: order.takerRelayerFee.toString(),
    makerProtocolFee: order.makerProtocolFee.toString(),
    takerProtocolFee: order.takerProtocolFee.toString(),
    feeMethod: order.feeMethod.toString(),
    feeRecipient: order.feeRecipient.toLowerCase(),
    side: order.side.toString(),
    saleKind: order.saleKind.toString(),
    target: order.target.toLowerCase(),
    howToCall: order.howToCall.toString(),
    calldata: order.calldata,
    replacementPattern: order.replacementPattern,
    staticTarget: order.staticTarget.toLowerCase(),
    staticExtradata: order.staticExtradata,
    paymentToken: order.paymentToken.toLowerCase(),
    basePrice: order.basePrice.toString(),
    extra: order.extra.toString(),
    listingTime: order.listingTime.toString(),
    expirationTime: order.expirationTime.toString(),
    salt: order.salt.toString()
  }
  const hash = WyvernProtocol.getOrderHashHex(asJSON)
  asJSON.hash = hash
  asJSON.metadata = order.metadata
  return asJSON
}

export const findAsset = async (account, proxy, wyAsset, schema) => {
  var owner
  const ownerOf = schema.functions.ownerOf
  if (ownerOf) {
    const abi = ownerOf(wyAsset)
    const contract = web3.eth.contract([abi]).at(abi.target)
    if (abi.inputs.filter(x => x.value === undefined).length === 0) {
      owner = await promisify(c => contract[abi.name].call(...abi.inputs.map(i => i.value.toString()), c))
      owner = owner.toLowerCase()
    }
  }

  /* This is a bit Ethercraft-specific. */
  var proxyCount
  var myCount
  const countOf = schema.functions.countOf
  if (countOf) {
    const abi = countOf(wyAsset)
    const contract = web3.eth.contract([abi]).at(abi.target)
    if (proxy) {
      proxyCount = await promisify(c => contract[abi.name].call([proxy], c))
      proxyCount = proxyCount.toNumber()
    } else {
      proxyCount = 0
    }
    myCount = await promisify(c => contract[abi.name].call([account], c))
    myCount = myCount.toNumber()
  }
  if (owner !== undefined) {
    if (proxy && owner.toLowerCase() === proxy.toLowerCase()) {
      return 'proxy'
    } else if (owner.toLowerCase() === account.toLowerCase()) {
      return 'account'
    } else if (owner === '0x') {
      return 'unknown'
    } else {
      return 'other'
    }
  } else if (myCount !== undefined && proxyCount !== undefined) {
    if (proxyCount >= 1000000000000000000) {
      return 'proxy'
    } else if (myCount >= 1000000000000000000) {
      return 'account'
    } else {
      return 'other'
    }
  }
  return 'unknown'
}

export async function personalSignAsync(web3, {message, signerAddress}) {
  const signature = await promisify(c => web3.currentProvider.sendAsync({
      method: 'personal_sign', // 'eth_signTypedData',
      params: [message, signerAddress],
      from: signerAddress,
    }, c)
  )

  return parseSignatureHex(signature.result, message, signerAddress)
}

export function makeBigNumber(number) {
  // Zero sometimes returned as 0x from contracts
  if (number === '0x') {
    number = 0 
  }
  // fix "new BigNumber() number type has more than 15 significant digits"
  number = number.toString()
  return new BigNumber(number)
}

export async function sendRawTransaction(web3, {fromAddress, toAddress, data, value = 0, awaitConfirmation = true}) {

  const txHash = await promisify(c => web3.eth.sendTransaction({
    from: fromAddress,
    to: toAddress,
    value: value,
    data: data
  }, c))

  if (awaitConfirmation) {
    await confirmTransaction(web3, {txHash})
  }

  return txHash
}

function assetFromJSON(asset) {
  if (asset.buyOrders) {
    asset.buyOrders = asset.buyOrders.map(orderFromJSON)
  }
  if (asset.sellOrders) {
    asset.sellOrders = asset.sellOrders.map(orderFromJSON)
  }
  return asset
}

function settlementFromJSON(settlement) {
  settlement.price = makeBigNumber(settlement.price)
  if (settlement.order) {
    settlement.order = orderFromJSON(settlement.order)
  }
  return settlement
}

// sourced from 0x.js:
// https://github.com/ProjectWyvern/wyvern-js/blob/39999cb93ce5d80ea90b4382182d1bd4339a9c6c/src/utils/signature_utils.ts
function parseSignatureHex(signature, orderHash, signerAddress) {
  // HACK: There is no consensus on whether the signatureHex string should be formatted as
  // v + r + s OR r + s + v, and different clients (even different versions of the same client)
  // return the signature params in different orders. In order to support all client implementations,
  // we parse the signature in both ways, and evaluate if either one is a valid signature.
  const validVParamValues = [27, 28];

  const ecSignatureRSV = _parseSignatureHexAsRSV(signature);
  if (_.includes(validVParamValues, ecSignatureRSV.v)) {
    return ecSignatureRSV;
  }

  // For older clients
  const ecSignatureVRS = _parseSignatureHexAsVRS(signature);
  if (_.includes(validVParamValues, ecSignatureVRS.v)) {
    return ecSignatureVRS;
  }

  throw new Error("Invalid signature");

  function _parseSignatureHexAsVRS(signatureHex) {
    const signatureBuffer = ethUtil.toBuffer(signatureHex);
    let v = signatureBuffer[0];
    if (v < 27) {
      v += 27;
    }
    const r = signatureBuffer.slice(1, 33);
    const s = signatureBuffer.slice(33, 65);
    const ecSignature = {
      v,
      r: ethUtil.bufferToHex(r),
      s: ethUtil.bufferToHex(s),
    };
    return ecSignature;
  }
  
  function _parseSignatureHexAsRSV(signatureHex) {
    const { v, r, s } = ethUtil.fromRpcSig(signatureHex);
    const ecSignature = {
        v,
        r: ethUtil.bufferToHex(r),
        s: ethUtil.bufferToHex(s),
    };
    return ecSignature;
  }
}

/**
 * Gets the price for the API data or cached order passed in
 * @param {object} orderData API data about order
 * @param {object} cachedOrder Store order object
 */
export function computeCurrentPrice(order) {
  let { basePrice, listingTime, expirationTime, side, extra } = order

  const now = new BigNumber(Date.now() / 1000)
  basePrice = new BigNumber(basePrice)
  listingTime = new BigNumber(listingTime)
  expirationTime = new BigNumber(expirationTime)
  extra = new BigNumber(extra)

  if (order.saleKind == saleKind.FIXED_PRICE) {
    return basePrice
  } else if (order.saleKind == saleKind.DUTCH_AUCTION) {
    const diff = extra.times(now.minus(listingTime))
                  .dividedBy(expirationTime.minus(listingTime))
    if (side == orderSide.SELL) {
      /* Sell-side - start price: basePrice. End price: basePrice - extra. */
      return basePrice.minus(diff)
    } else {
      /* Buy-side - start price: basePrice. End price: basePrice + extra. */
      return basePrice.plus(diff)
    }
  }
}