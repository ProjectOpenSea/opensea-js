import BigNumber from 'bignumber.js'
import { WyvernProtocol } from 'wyvern-js'
import * as ethUtil from 'ethereumjs-util'
import * as _ from 'lodash'
import * as Web3 from 'web3'
import * as WyvernSchemas from 'wyvern-schemas'
import { WyvernAtomicizerContract } from 'wyvern-js/lib/abi_gen/wyvern_atomicizer'
import { AnnotatedFunctionABI, FunctionInputKind } from 'wyvern-js/lib/types'

import { OpenSeaPort } from '../src'
import { ECSignature, Order, OrderSide, SaleKind, Web3Callback, TxnCallback, OrderJSON, UnhashedOrder, OpenSeaAsset, OpenSeaAssetBundle, UnsignedOrder, WyvernAsset } from './types'

export const NULL_ADDRESS = WyvernProtocol.NULL_ADDRESS
export const NULL_BLOCK_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'
export const feeRecipient = '0x5b3256965e7c3cf26e11fcaf296dfc8807c01073'
export const INVERSE_BASIS_POINT = 10000
export const MAX_UINT_256 = WyvernProtocol.MAX_UINT_256
export const WYVERN_EXCHANGE_ADDRESS_MAINNET = "0x7be8076f4ea4a4ad08075c2508e481d6c946d12b"
export const WYVERN_EXCHANGE_ADDRESS_RINKEBY = "0x5206e78b21ce315ce284fb24cf05e0585a93b1d9"
export const DEFAULT_BUYER_FEE_BASIS_POINTS = 0
export const DEFAULT_SELLER_FEE_BASIS_POINTS = 250
export const MAX_ERROR_LENGTH = 120

const proxyABI: any = {'constant': false, 'inputs': [{'name': 'dest', 'type': 'address'}, {'name': 'howToCall', 'type': 'uint8'}, {'name': 'calldata', 'type': 'bytes'}], 'name': 'proxy', 'outputs': [{'name': 'success', 'type': 'bool'}], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}

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
        resolve("Transaction complete!")
      } else {
        reject(new Error(`Transaction failed :( You might have already completed this action. See more on the mainnet at etherscan.io/txn/${txHash}`))
      }
    })
  })
}

export const assetFromJSON = (asset: any): OpenSeaAsset => {
  const isAnimated = asset.image_url && asset.image_url.endsWith('.gif')
  const isSvg = asset.image_url && asset.image_url.endsWith('.svg')
  const fromJSON: OpenSeaAsset = {
    tokenId: asset.token_id.toString(),
    name: asset.name,
    owner: asset.owner,
    assetContract: {
      name: asset.asset_contract.name,
      description: asset.asset_contract.description,
      address: asset.asset_contract.address,
      tokenSymbol: asset.asset_contract.symbol,
      buyerFeeBasisPoints: asset.asset_contract.buyer_fee_basis_points,
      sellerFeeBasisPoints: asset.asset_contract.seller_fee_basis_points,
      imageUrl: asset.asset_contract.image_url,
      stats: asset.asset_contract.stats,
      traits: asset.asset_contract.traits,
      externalLink: asset.asset_contract.external_link,
      wikiLink: asset.asset_contract.wiki_link,
    },
    orders: asset.orders ? asset.orders.map(orderFromJSON) : null,
    sellOrders: asset.sell_orders ? asset.sell_orders.map(orderFromJSON) : null,
    buyOrders: asset.buy_orders ? asset.buy_orders.map(orderFromJSON) : null,

    isPresale: asset.is_presale,
    // Don't use previews if it's a special image
    imageUrl: isAnimated || isSvg
      ? asset.image_url
      : (asset.image_preview_url || asset.image_url),
    imagePreviewUrl: asset.image_preview_url,
    imageUrlOriginal: asset.image_original_url,
    imageUrlThumbnail: asset.image_thumbnail_url,

    externalLink: asset.external_link,
    openseaLink: asset.permalink,
    traits: asset.traits,
    numSales: asset.num_sales,
    lastSale: asset.last_sale,
    backgroundColor: asset.background_color ? `#${asset.background_color}` : null,
  }
  // If orders were included, put them in sell/buy order groups
  if (fromJSON.orders && !fromJSON.sellOrders) {
    fromJSON.sellOrders = fromJSON.orders.filter(o => o.side == OrderSide.Sell)
  }
  if (fromJSON.orders && !fromJSON.buyOrders) {
    fromJSON.buyOrders = fromJSON.orders.filter(o => o.side == OrderSide.Buy)
  }
  return fromJSON
}

export const assetBundleFromJSON = (asset_bundle: any): OpenSeaAssetBundle => {

  const fromJSON: OpenSeaAssetBundle = {
    assets: asset_bundle.assets.map(assetFromJSON),
    name: asset_bundle.name,
    slug: asset_bundle.slug,
    description: asset_bundle.description,
    externalLink: asset_bundle.external_link,
    permalink: asset_bundle.permalink,

    sellOrders: asset_bundle.sell_orders ? asset_bundle.sell_orders.map(orderFromJSON) : null
  }

  return fromJSON
}

export const orderFromJSON = (order: any): Order => {

  const fromJSON: Order = {
    hash: order.order_hash || order.hash,
    cancelledOrFinalized: order.cancelled || order.finalized,
    markedInvalid: order.marked_invalid,
    metadata: order.metadata,
    exchange: order.exchange,
    makerAccount: order.maker,
    takerAccount: order.maker,
    // Use string address to conform to Wyvern Order schema
    maker: order.maker.address,
    taker: order.taker.address,
    makerRelayerFee: new BigNumber(order.maker_relayer_fee),
    takerRelayerFee: new BigNumber(order.taker_relayer_fee),
    makerProtocolFee: new BigNumber(order.maker_protocol_fee),
    takerProtocolFee: new BigNumber(order.taker_protocol_fee),
    feeMethod: order.fee_method,
    feeRecipientAccount: order.fee_recipient,
    feeRecipient: order.fee_recipient.address,
    side: order.side,
    saleKind: order.sale_kind,
    target: order.target,
    howToCall: order.how_to_call,
    calldata: order.calldata,
    replacementPattern: order.replacement_pattern,
    staticTarget: order.static_target,
    staticExtradata: order.static_extradata,
    paymentToken: order.payment_token,
    basePrice: new BigNumber(order.base_price),
    extra: new BigNumber(order.extra),
    listingTime: new BigNumber(order.listing_time),
    expirationTime: new BigNumber(order.expiration_time),
    salt: new BigNumber(order.salt),
    v: parseInt(order.v),
    r: order.r,
    s: order.s,

    asset: order.asset ? assetFromJSON(order.asset) : undefined,
    assetBundle: order.asset_bundle ? assetBundleFromJSON(order.asset_bundle) : undefined
  }

  fromJSON.currentPrice = estimateCurrentPrice(fromJSON)

  return fromJSON
}

/**
 * Convert an order to JSON, hashing it as well if necessary
 * @param order order (hashed or unhashed)
 */
export const orderToJSON = (order: Order | UnhashedOrder): OrderJSON => {
  const asJSON: any = {
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
  const hash = 'hash' in order ? order.hash : getOrderHash(asJSON)
  if ('v' in order) {
    asJSON.v = order.v
    asJSON.r = order.r
    asJSON.s = order.s
  }
  asJSON.hash = hash
  asJSON.metadata = order.metadata
  return asJSON
}

// Taken from Wyvern demo exchange
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
export function makeBigNumber(arg: number | string | BigNumber): BigNumber {
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
 * @param gasPrice gas price to use. If unspecified, uses web3 default (mean gas price)
 * @param value value in ETH to send with data. Defaults to 0
 * @param awaitConfirmation whether we should wait for blockchain to confirm. Defaults to false
 */
export async function sendRawTransaction(
    web3: Web3,
    {from, to, data, gasPrice, value = 0}: Web3.TxData,
    awaitConfirmation = false
  ): Promise<string> {

  const txHashRes = await promisify(c => web3.eth.sendTransaction({
    from,
    to,
    value,
    data,
    gasPrice
  }, c))
  const txHash = txHashRes.toString()

  if (awaitConfirmation) {
    await confirmTransaction(web3, txHash)
  }

  return txHash
}

/**
 * Estimate Gas usage for a transaction
 * @param web3 Web3 instance
 * @param fromAddress address sending transaction
 * @param toAddress destination contract address
 * @param data data to send to contract
 * @param value value in ETH to send with data
 */
export async function estimateGas(
    web3: Web3,
    {from, to, data, value = 0 }: Web3.TxData
  ): Promise<number> {

  const amount = await promisify<number>(c => web3.eth.estimateGas({
    from,
    to,
    value,
    data,
  }, c))

  return amount
}

/**
 * Get mean gas price for sending a txn, in wei
 * @param web3 Web3 instance
 */
export async function getCurrentGasPrice(web3: Web3): Promise<BigNumber> {
  const meanGas = await promisify<BigNumber>(c => web3.eth.getGasPrice(c))
  return meanGas
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
 * Estimates the price of an order
 * @param order The order to estimate price on
 * @param secondsToBacktrack The number of seconds to subtract on current time,
 *  to fix race conditions
 * @param shouldRoundUp Whether to round up fractional wei
 */
export function estimateCurrentPrice(order: Order, secondsToBacktrack = 30, shouldRoundUp = true) {
  let { basePrice, listingTime, expirationTime, extra } = order
  const { side } = order

  const now = new BigNumber(Date.now() / 1000).minus(secondsToBacktrack)
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

/**
 * Get the Wyvern representation of an asset
 * @param schema The WyvernSchema needed to access this asset
 * @param tokenId The token's id
 * @param tokenAddress The address of the token's contract
 */
export function getWyvernAsset(
    schema: any, tokenId: string, tokenAddress: string
  ): WyvernAsset {
  return schema.assetFromFields({
    'ID': tokenId.toString(),
    'Address': tokenAddress,
  })
}

/**
 * Get the non-prefixed hash for the order
 * (Fixes a Wyvern typescript issue and casing issue)
 * @param order order to hash
 */
export function getOrderHash(order: UnhashedOrder) {
  const orderWithStringTypes = {
    ...order,
    maker: order.maker.toLowerCase(),
    taker: order.taker.toLowerCase(),
    feeRecipient: order.feeRecipient.toLowerCase(),
    side: order.side.toString(),
    saleKind: order.saleKind.toString(),
    howToCall: order.howToCall.toString(),
    feeMethod: order.feeMethod.toString()
  }
  return WyvernProtocol.getOrderHashHex(orderWithStringTypes as any)
}

/**
 * Assign an order and a new matching order to their buy/sell sides
 * @param order Original order
 * @param matchingOrder The result of _makeMatchingOrder
 */
export function assignOrdersToSides(order: Order, matchingOrder: UnsignedOrder ): { buy: Order; sell: Order } {

  const isSellOrder = order.side == OrderSide.Sell

  let buy: Order
  let sell: Order
  if (!isSellOrder) {
    buy = order
    sell = {
      ...matchingOrder,
      v: buy.v,
      r: buy.r,
      s: buy.s
    }
  } else {
    sell = order
    buy = {
      ...matchingOrder,
      v: sell.v,
      r: sell.r,
      s: sell.s
    }
  }

  return { buy, sell }
}

// BROKEN
// TODO fix this calldata for buy orders
async function canSettleOrder(client: OpenSeaPort, order: Order, matchingOrder: Order): Promise<boolean> {

  // HACK that doesn't always work
  //  to change null address to 0x1111111... for replacing calldata
  const calldata = order.calldata.slice(0, 98) + "1111111111111111111111111111111111111111" + order.calldata.slice(138)

  const seller = order.side == OrderSide.Buy ? matchingOrder.maker : order.maker
  const proxy = await client._getProxy(seller)
  if (!proxy) {
    console.warn(`No proxy found for seller ${seller}`)
    return false
  }
  const contract = (client.web3.eth.contract([proxyABI])).at(proxy)
  return promisify<boolean>(c =>
    contract.proxy.call(
      order.target,
      order.howToCall,
      calldata,
      {from: seller},
    c)
  )
}

/**
 * Delay using setTimeout
 * @param ms milliseconds to wait
 */
export async function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms))
}

/**
 * Encode the atomicized transfer of many assets
 * @param schema Wyvern Schema for the assets
 * @param assets List of assets to transfer
 * @param from Current address owning the assets
 * @param to Destination address
 * @param atomicizer Wyvern Atomicizer instance
 */
export function encodeAtomicizedTransfer(schema: any, assets: WyvernAsset[], from: string, to: string, atomicizer: WyvernAtomicizerContract) {

  const transactions = assets.map((asset: any) => {
    // Need to use transfer because transferFrom sometimes doesn't let the user
    // call it without approval, including CK
    const transfer = schema.functions.transfer(asset)
    const calldata = encodeTransferCall(transfer, from, to)
    return {
      calldata,
      address: transfer.target,
      value: new BigNumber(0),
    }
  })

  const atomicizedCalldata = atomicizer.atomicize.getABIEncodedTransactionData(
    transactions.map((t: any) => t.address),
    transactions.map((t: any) => t.value),
    transactions.map((t: any) => new BigNumber((t.calldata.length - 2) / 2)), // subtract 2 for '0x', divide by 2 for hex
    transactions.map((t: any) => t.calldata).reduce((x: string, y: string) => x + y.slice(2)), // cut off the '0x'
  )

  return {
    calldata: atomicizedCalldata,
  }
}

/**
 * Encode a transfer call for a Wyvern schema function
 * @param transferAbi Annotated Wyvern ABI
 * @param from From address
 * @param to To address
 */
export function encodeTransferCall(transferAbi: AnnotatedFunctionABI, from: string, to: string) {
  const parameters = transferAbi.inputs.map(input => {
    switch (input.kind) {
      case FunctionInputKind.Asset:
        return input.value
      case FunctionInputKind.Replaceable:
        return to
      case FunctionInputKind.Owner:
        return from
    }
  })
  return WyvernSchemas.encodeCall(transferAbi, parameters)
}
