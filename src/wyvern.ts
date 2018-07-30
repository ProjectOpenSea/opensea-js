import BigNumber from 'bignumber.js'
import * as ethUtil from 'ethereumjs-util'
import * as _ from 'lodash'
import * as Web3 from 'web3'
import { WyvernProtocol } from 'wyvern-js/lib'

import { ECSignature, Order, OrderSide, SaleKind, Web3Callback, TxnCallback, OrderJSON, UnhashedOrder } from './types'

export const NULL_BLOCK_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

export const feeRecipient = '0x5b3256965e7c3cf26e11fcaf296dfc8807c01073'

// OTHER

const txCallbacks: {[key: string]: TxnCallback[]} = {}

/**
 * Promisify a callback-syntax web3 function
 * @param inner callback function that accepts a Web3 callback function and passes
 * it to the Web3 function
 */
export async function promisify<T>(
    inner: (fn: Web3Callback<T>) => void
  ) {
  return new Promise<T>((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      resolve(res)
    })
  )
}

const track = (web3: Web3, txHash: string, onFinalized: TxnCallback) => {
  if (txCallbacks[txHash]) {
    txCallbacks[txHash].push(onFinalized)
  } else {
    txCallbacks[txHash] = [onFinalized]
    const poll = async () => {
      // if (!web3) {
      //   setTimeout(poll, 1000)
      //   return
      // }
      const tx = await promisify<Web3.Transaction>(c => web3.eth.getTransaction(txHash, c))
      if (tx && tx.blockHash && tx.blockHash !== NULL_BLOCK_HASH) {
        const receipt = await promisify<Web3.TransactionReceipt | null>(c => web3.eth.getTransactionReceipt(txHash, c))
        if (!receipt) {
          // Hack: assume success if no receipt
          console.warn('No receipt found for ', txHash)
        }
        const status = receipt
          ? parseInt((receipt.status || "0").toString()) == 1
          : true
        txCallbacks[txHash].map(f => f(status))
        delete txCallbacks[txHash]
      } else {
        setTimeout(poll, 1000)
      }
    }
    poll().catch()
  }
}

export const confirmTransaction = async (web3: Web3, txHash: string) => {
  return new Promise((resolve, reject) => {
    track(web3, txHash, (didSucceed: boolean) => {
      if (didSucceed) {
        resolve('Transaction complete')
      } else {
        reject('Transaction failed')
      }
    })
  })
}

export const orderFromJSON = (order: any): Order => {
  const hash = WyvernProtocol.getOrderHashHex(order)
  if (hash !== order.hash) {
    console.error('Invalid order hash')
  }
  const fromJSON: Order = {
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
    feeMethod: order.feeMethod,
    feeRecipient: order.feeRecipient,
    side: order.side,
    saleKind: order.saleKind,
    target: order.target,
    howToCall: order.howToCall,
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
    s: order.s,
  }

  fromJSON.currentPrice = estimateCurrentPrice(order)

  return fromJSON
}

export const orderToJSON = (order: Order | UnhashedOrder): OrderJSON => {
  const asJSON = {
    ...order,

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
    staticTarget: order.staticTarget.toLowerCase(),
    paymentToken: order.paymentToken.toLowerCase(),
    basePrice: order.basePrice.toString(),
    extra: order.extra.toString(),
    listingTime: order.listingTime.toString(),
    expirationTime: order.expirationTime.toString(),
    salt: order.salt.toString()
  }
  return asJSON
}

export const findAsset = async (
  web3: Web3,
  {account, proxy, wyAsset, schema}:
  {account: string; proxy: string; wyAsset: any; schema: any}
  ) => {
  let owner
  const ownerOf = schema.functions.ownerOf
  if (ownerOf) {
    const abi = ownerOf(wyAsset)
    const contract = web3.eth.contract([abi]).at(abi.target)
    if (abi.inputs.filter((x: any) => x.value === undefined).length === 0) {
      owner = await promisify<string>(c => contract[abi.name].call(...abi.inputs.map((i: any) => i.value.toString()), c))
      owner = owner.toLowerCase()
    }
  }

  /* This is a bit Ethercraft-specific. */
  let proxyCount
  let myCount
  const countOf = schema.functions.countOf
  if (countOf) {
    const abi = countOf(wyAsset)
    const contract = web3.eth.contract([abi]).at(abi.target)
    if (proxy) {
      proxyCount = await promisify<BigNumber>(c => contract[abi.name].call([proxy], c))
      proxyCount = proxyCount.toNumber()
    } else {
      proxyCount = 0
    }
    myCount = await promisify<BigNumber>(c => contract[abi.name].call([account], c))
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

/**
 * Sign messages using web3 personal signatures
 * @param web3 Web3 instance
 * @param message message to sign
 * @param signerAddress web3 address signing the message
 */
export async function personalSignAsync(web3: Web3, message: string, signerAddress: string
  ): Promise<ECSignature> {

  const signature = await promisify<Web3.JSONRPCResponsePayload>(c => web3.currentProvider.sendAsync({
      method: 'personal_sign', // 'eth_signTypedData',
      params: [message, signerAddress],
      from: signerAddress,
    } as any, c)
  )

  return parseSignatureHex(signature.result)
}

/**
 * Special fixes for making BigNumbers using web3 results
 * @param arg An arg or the result of a web3 call to turn into a BigNumber
 */
export function makeBigNumber(arg: number | string): BigNumber {
  // Zero sometimes returned as 0x from contracts
  if (arg === '0x') {
    arg = 0
  }
  // fix "new BigNumber() number type has more than 15 significant digits"
  arg = arg.toString()
  return new BigNumber(arg)
}

/**
 * Send a transaction to the blockchain and optionally confirm it
 * @param web3 Web3 instance
 * @param fromAddress address sending transaction
 * @param toAddress destination contract address
 * @param data data to send to contract
 * @param value value in ETH to send with data
 * @param awaitConfirmation whether we should wait for blockchain to confirm
 */
export async function sendRawTransaction(
    web3: Web3,
    {fromAddress, toAddress, data, value = 0, awaitConfirmation = true}:
    {fromAddress: string; toAddress: string; data: any; value?: number | BigNumber; awaitConfirmation?: boolean}
  ) {

  const txHash = await promisify(c => web3.eth.sendTransaction({
    from: fromAddress,
    to: toAddress,
    value,
    data,
  }, c))

  if (awaitConfirmation) {
    await confirmTransaction(web3, txHash.toString())
  }

  return txHash
}

// sourced from 0x.js:
// https://github.com/ProjectWyvern/wyvern-js/blob/39999cb93ce5d80ea90b4382182d1bd4339a9c6c/src/utils/signature_utils.ts
function parseSignatureHex(signature: string): ECSignature {
  // HACK: There is no consensus on whether the signatureHex string should be formatted as
  // v + r + s OR r + s + v, and different clients (even different versions of the same client)
  // return the signature params in different orders. In order to support all client implementations,
  // we parse the signature in both ways, and evaluate if either one is a valid signature.
  const validVParamValues = [27, 28]

  const ecSignatureRSV = _parseSignatureHexAsRSV(signature)
  if (_.includes(validVParamValues, ecSignatureRSV.v)) {
    return ecSignatureRSV
  }

  // For older clients
  const ecSignatureVRS = _parseSignatureHexAsVRS(signature)
  if (_.includes(validVParamValues, ecSignatureVRS.v)) {
    return ecSignatureVRS
  }

  throw new Error('Invalid signature')

  function _parseSignatureHexAsVRS(signatureHex: string) {
    const signatureBuffer: any = ethUtil.toBuffer(signatureHex)
    let v = signatureBuffer[0]
    if (v < 27) {
      v += 27
    }
    const r = signatureBuffer.slice(1, 33)
    const s = signatureBuffer.slice(33, 65)
    const ecSignature = {
      v,
      r: ethUtil.bufferToHex(r),
      s: ethUtil.bufferToHex(s),
    }
    return ecSignature
  }

  function _parseSignatureHexAsRSV(signatureHex: string) {
    const { v, r, s } = ethUtil.fromRpcSig(signatureHex)
    const ecSignature = {
        v,
        r: ethUtil.bufferToHex(r),
        s: ethUtil.bufferToHex(s),
    }
    return ecSignature
  }
}

/**
 * Estimates the price 30 seconds ago
 */
export function estimateCurrentPrice(order: Order, shouldRoundUp = true) {
  let { basePrice, listingTime, expirationTime, extra } = order
  const { side } = order

  const now = new BigNumber(Date.now() / 1000).minus(30)
  basePrice = new BigNumber(basePrice)
  listingTime = new BigNumber(listingTime)
  expirationTime = new BigNumber(expirationTime)
  extra = new BigNumber(extra)

  let exactPrice = basePrice

  if (order.saleKind == SaleKind.FixedPrice) {
    // Do nothing, price is correct
  } else if (order.saleKind == SaleKind.DutchAuction) {
    const diff = extra.times(now.minus(listingTime))
                  .dividedBy(expirationTime.minus(listingTime))

    exactPrice = side == OrderSide.Sell
      /* Sell-side - start price: basePrice. End price: basePrice - extra. */
      ? basePrice.minus(diff)
      /* Buy-side - start price: basePrice. End price: basePrice + extra. */
      : basePrice.plus(diff)
  }

  return shouldRoundUp ? exactPrice.ceil() : exactPrice
}
