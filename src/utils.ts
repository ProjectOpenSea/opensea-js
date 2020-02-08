import BigNumber from 'bignumber.js'
import {WyvernProtocol} from 'wyvern-js'
import * as ethUtil from 'ethereumjs-util'
import * as _ from 'lodash'
import * as Web3 from 'web3'
import * as WyvernSchemas from 'wyvern-schemas'
import {
  AnnotatedFunctionABI,
  FunctionInputKind,
  FunctionOutputKind,
  Schema,
  StateMutability
} from 'wyvern-schemas/dist/types'
import {WyvernAtomicizerContract} from 'wyvern-js/lib/abi_gen/wyvern_atomicizer'
import {HowToCall} from 'wyvern-js/lib/types'
import {ERC1155} from './contracts'

import {OpenSeaPort} from '../src'
import {
  Asset,
  AssetContractType,
  ECSignature,
  OpenSeaAccount,
  OpenSeaAsset,
  OpenSeaAssetBundle,
  OpenSeaAssetContract,
  OpenSeaCollection,
  OpenSeaFungibleToken,
  OpenSeaTraitStats,
  Order,
  OrderJSON,
  OrderSide,
  SaleKind,
  Transaction,
  TxnCallback,
  UnhashedOrder,
  UnsignedOrder,
  Web3Callback,
  WyvernAsset,
  WyvernBundle,
  WyvernFTAsset,
  WyvernNFTAsset,
  WyvernSchemaName
} from './types'

export const NULL_ADDRESS = WyvernProtocol.NULL_ADDRESS
export const NULL_BLOCK_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'
export const OPENSEA_FEE_RECIPIENT = '0x5b3256965e7c3cf26e11fcaf296dfc8807c01073'
export const DEP_INFURA_KEY = 'e8695bce67944848aa95459fac052f8e'
export const MAINNET_PROVIDER_URL = 'https://eth-mainnet.alchemyapi.io/jsonrpc/y5dLONzfAJh-oCY02DCP3UWCT2pSEXMo'
export const RINKEBY_PROVIDER_URL = 'https://eth-rinkeby.alchemyapi.io/jsonrpc/-yDg7wmgGw5LdsP4p4kyxRYuDzCkXtoI'
export const INVERSE_BASIS_POINT = 10000
export const MAX_UINT_256 = WyvernProtocol.MAX_UINT_256
export const WYVERN_EXCHANGE_ADDRESS_MAINNET = "0x7be8076f4ea4a4ad08075c2508e481d6c946d12b"
export const WYVERN_EXCHANGE_ADDRESS_RINKEBY = "0x5206e78b21ce315ce284fb24cf05e0585a93b1d9"
export const ENJIN_COIN_ADDRESS = '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c'
export const ENJIN_ADDRESS = '0xfaaFDc07907ff5120a76b34b731b278c38d6043C'
export const ENJIN_LEGACY_ADDRESS = '0x8562c38485B1E8cCd82E44F89823dA76C98eb0Ab'
export const CK_ADDRESS = '0x06012c8cf97bead5deae237070f9587f8e7a266d'
export const CK_RINKEBY_ADDRESS = '0x16baf0de678e52367adc69fd067e5edd1d33e3bf'
export const WRAPPED_NFT_FACTORY_ADDRESS_MAINNET = '0xf11b5815b143472b7f7c52af0bfa6c6a2c8f40e1'
export const WRAPPED_NFT_FACTORY_ADDRESS_RINKEBY = '0x94c71c87244b862cfd64d36af468309e4804ec09'
export const WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_MAINNET = '0x995835145dd85c012f3e2d7d5561abd626658c04'
export const WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_RINKEBY = '0xaa775Eb452353aB17f7cf182915667c2598D43d3'
export const UNISWAP_FACTORY_ADDRESS_MAINNET = '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95'
export const UNISWAP_FACTORY_ADDRESS_RINKEBY = '0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36'
export const DEFAULT_WRAPPED_NFT_LIQUIDATION_UNISWAP_SLIPPAGE_IN_BASIS_POINTS = 1000
export const CHEEZE_WIZARDS_GUILD_ADDRESS = WyvernProtocol.NULL_ADDRESS // TODO: Update this address once Dapper has deployed their mainnet contracts
export const CHEEZE_WIZARDS_GUILD_RINKEBY_ADDRESS = '0x095731b672b76b00A0b5cb9D8258CD3F6E976cB2'
export const CHEEZE_WIZARDS_BASIC_TOURNAMENT_ADDRESS = WyvernProtocol.NULL_ADDRESS // TODO: Update this address once Dapper has deployed their mainnet contracts
export const CHEEZE_WIZARDS_BASIC_TOURNAMENT_RINKEBY_ADDRESS = '0x8852f5F7d1BB867AAf8fdBB0851Aa431d1df5ca1'
export const DECENTRALAND_ESTATE_ADDRESS = '0x959e104e1a4db6317fa58f8295f586e1a978c297'
export const STATIC_CALL_TX_ORIGIN_ADDRESS = '0xbff6ade67e3717101dd8d0a7f3de1bf6623a2ba8'
export const STATIC_CALL_TX_ORIGIN_RINKEBY_ADDRESS = '0xe291abab95677bc652a44f973a8e06d48464e11c'
export const STATIC_CALL_CHEEZE_WIZARDS_ADDRESS = WyvernProtocol.NULL_ADDRESS // TODO: Deploy this address once Dapper has deployed their mainnet contracts
export const STATIC_CALL_CHEEZE_WIZARDS_RINKEBY_ADDRESS = '0x8a640bdf8886dd6ca1fad9f22382b50deeacde08'
export const STATIC_CALL_DECENTRALAND_ESTATES_ADDRESS = '0x93c3cd7ba04556d2e3d7b8106ce0f83e24a87a7e'
export const DEFAULT_BUYER_FEE_BASIS_POINTS = 0
export const DEFAULT_SELLER_FEE_BASIS_POINTS = 250
export const OPENSEA_SELLER_BOUNTY_BASIS_POINTS = 100
export const DEFAULT_MAX_BOUNTY = DEFAULT_SELLER_FEE_BASIS_POINTS
export const MIN_EXPIRATION_SECONDS = 10
export const ORDER_MATCHING_LATENCY_SECONDS = 60 * 60 * 24 * 7
export const SELL_ORDER_BATCH_SIZE = 3
export const DEFAULT_GAS_INCREASE_FACTOR = 1.1

const proxyABI: any = {'constant': false, 'inputs': [{'name': 'dest', 'type': 'address'}, {'name': 'howToCall', 'type': 'uint8'}, {'name': 'calldata', 'type': 'bytes'}], 'name': 'proxy', 'outputs': [{'name': 'success', 'type': 'bool'}], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}
const proxyAssertABI: any = {'constant': false, 'inputs': [{'name': 'dest', 'type': 'address'}, {'name': 'howToCall', 'type': 'uint8'}, {'name': 'calldata', 'type': 'bytes'}], 'name': 'proxyAssert', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}
export const annotateERC721TransferABI = (asset: WyvernNFTAsset): AnnotatedFunctionABI => ({
  "constant": false,
  "inputs": [
    {
      "name": "_to",
      "type": "address",
      "kind": FunctionInputKind.Replaceable
    },
    {
      "name": "_tokenId",
      "type": "uint256",
      "kind": FunctionInputKind.Asset,
      "value": asset.id
    }
  ],
  "target": asset.address,
  "name": "transfer",
  "outputs": [],
  "payable": false,
  "stateMutability": StateMutability.Nonpayable,
  "type": Web3.AbiType.Function
})

export const annotateERC20TransferABI = (asset: WyvernFTAsset): AnnotatedFunctionABI => ({
  "constant": false,
  "inputs": [
    {
      "name": "_to",
      "type": "address",
      "kind": FunctionInputKind.Replaceable
    },
    {
      "name": "_amount",
      "type": "uint256",
      "kind": FunctionInputKind.Count,
      "value": asset.quantity
    }
  ],
  "target": asset.address,
  "name": "transfer",
  "outputs": [
    {
      "name": "success",
      "type": "bool",
      "kind": FunctionOutputKind.Other
    }
  ],
  "payable": false,
  "stateMutability": StateMutability.Nonpayable,
  "type": Web3.AbiType.Function
})

const SCHEMA_NAME_TO_ASSET_CONTRACT_TYPE: {[key in WyvernSchemaName]: AssetContractType} = {
  [WyvernSchemaName.ERC721]: AssetContractType.NonFungible,
  [WyvernSchemaName.ERC1155]: AssetContractType.SemiFungible,
  [WyvernSchemaName.ERC20]: AssetContractType.Fungible,
  [WyvernSchemaName.LegacyEnjin]: AssetContractType.SemiFungible,
  [WyvernSchemaName.ENSShortNameAuction]: AssetContractType.NonFungible,
}

// OTHER

const txCallbacks: {[key: string]: TxnCallback[]} = {}

/**
 * Promisify a callback-syntax web3 function
 * @param inner callback function that accepts a Web3 callback function and passes
 * it to the Web3 function
 */
async function promisify<T>(
    inner: (fn: Web3Callback<T>) => void
  ) {
  return new Promise<T>((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      resolve(res)
    })
  )
}

/**
 * Promisify a call a method on a contract,
 * handling Parity errors. Returns '0x' if error.
 * Note that if T is not "string", this may return a falsey
 * value when the contract doesn't support the method (e.g. `isApprovedForAll`).
 * @param callback An anonymous function that takes a web3 callback
 * and returns a Web3 Contract's call result, e.g. `c => erc721.ownerOf(3, c)`
 * @param onError callback when user denies transaction
 */
export async function promisifyCall<T>(
    callback: (fn: Web3Callback<T>) => void,
    onError?: (error: Error) => void
  ): Promise<T | undefined> {

  try {

    const result: any = await promisify<T>(callback)
    if (result == '0x') {
      // Geth compatibility
      return undefined
    }
    return result as T

  } catch (error) {
    // Probably method not found, and web3 is a Parity node
    if (onError) {
      onError(error)
    } else {
      console.error(error)
    }
    return undefined
  }
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
    tokenAddress: asset.asset_contract.address,
    name: asset.name,
    description: asset.description,
    owner: asset.owner,
    assetContract: assetContractFromJSON(asset.asset_contract),
    collection: collectionFromJSON(asset.collection),
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
    lastSale: {
      eventType: asset.last_sale.event_type,
      auctionType: asset.last_sale.auction_type,
      totalPrice: asset.last_sale.total_price,
      transaction: transactionFromJSON(asset.last_sale.transaction)
    },
    backgroundColor: asset.background_color ? `#${asset.background_color}` : null,

    transferFee: asset.transfer_fee
      ? makeBigNumber(asset.transfer_fee)
      : null,
    transferFeePaymentToken: asset.transfer_fee_payment_token
      ? tokenFromJSON(asset.transfer_fee_payment_token)
      : null,
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

export const transactionFromJSON = (transaction: any): Transaction => {
  return {
    fromAccount: accountFromJSON(transaction.from_account),
    toAccount: accountFromJSON(transaction.to_account),
    createdDate: new Date(`${transaction.created_date}Z`),
    modifiedDate: new Date(`${transaction.modified_date}Z`),
    transactionHash: transaction.transaction_hash,
    transactionIndex: transaction.transaction_index,
    blockNumber: transaction.block_number,
    blockHash: transaction.block_hash,
    timestamp: new Date(`${transaction.timestamp}Z`),
  }
}

export const accountFromJSON = (account: any): OpenSeaAccount => {
  return {
    address: account.address,
    config: account.config,
    discordId: account.discord_id,
    profileImgUrl: account.profile_img_url,
    user: account.user
  }
}

export const assetBundleFromJSON = (asset_bundle: any): OpenSeaAssetBundle => {

  const fromJSON: OpenSeaAssetBundle = {
    maker: asset_bundle.maker,
    assets: asset_bundle.assets.map(assetFromJSON),
    assetContract: asset_bundle.asset_contract
      ? assetContractFromJSON(asset_bundle.asset_contract)
      : undefined,
    name: asset_bundle.name,
    slug: asset_bundle.slug,
    description: asset_bundle.description,
    externalLink: asset_bundle.external_link,
    permalink: asset_bundle.permalink,

    sellOrders: asset_bundle.sell_orders ? asset_bundle.sell_orders.map(orderFromJSON) : null
  }

  return fromJSON
}

export const assetContractFromJSON = (asset_contract: any): OpenSeaAssetContract => {
  return {
    name: asset_contract.name,
    description: asset_contract.description,
    type: asset_contract.asset_contract_type,
    schemaName: asset_contract.schema_name,
    address: asset_contract.address,
    tokenSymbol: asset_contract.symbol,
    buyerFeeBasisPoints: asset_contract.buyer_fee_basis_points,
    sellerFeeBasisPoints: asset_contract.seller_fee_basis_points,
    openseaBuyerFeeBasisPoints: asset_contract.opensea_buyer_fee_basis_points,
    openseaSellerFeeBasisPoints: asset_contract.opensea_seller_fee_basis_points,
    devBuyerFeeBasisPoints: asset_contract.dev_buyer_fee_basis_points,
    devSellerFeeBasisPoints: asset_contract.dev_seller_fee_basis_points,
    imageUrl: asset_contract.image_url,
    externalLink: asset_contract.external_link,
    wikiLink: asset_contract.wiki_link,
  }
}

export const collectionFromJSON = (collection: any): OpenSeaCollection => {
  const createdDate = new Date(`${collection.created_date}Z`)

  return {
    createdDate,
    name: collection.name,
    description: collection.description,
    slug: collection.slug,
    editors: collection.editors,
    hidden: collection.hidden,
    featured: collection.featured,
    featuredImageUrl: collection.featured_image_url,
    displayData: collection.display_data,
    paymentTokens: (collection.payment_tokens || []).map(tokenFromJSON),
    openseaBuyerFeeBasisPoints: collection.opensea_buyer_fee_basis_points,
    openseaSellerFeeBasisPoints: collection.opensea_seller_fee_basis_points,
    devBuyerFeeBasisPoints: collection.dev_buyer_fee_basis_points,
    devSellerFeeBasisPoints: collection.dev_seller_fee_basis_points,
    payoutAddress: collection.payout_address,
    imageUrl: collection.image_url,
    largeImageUrl: collection.large_image_url,
    stats: collection.stats,
    traitStats: collection.traits as OpenSeaTraitStats,
    externalLink: collection.external_url,
    wikiLink: collection.wiki_url,
  }
}

export const tokenFromJSON = (token: any): OpenSeaFungibleToken => {

  const fromJSON: OpenSeaFungibleToken = {
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    address: token.address,
    imageUrl: token.image_url,
    ethPrice: token.eth_price,
    usdPrice: token.usd_price,
  }

  return fromJSON
}

export const orderFromJSON = (order: any): Order => {

  const createdDate = new Date(`${order.created_date}Z`)

  const fromJSON: Order = {
    hash: order.order_hash || order.hash,
    cancelledOrFinalized: order.cancelled || order.finalized,
    markedInvalid: order.marked_invalid,
    metadata: order.metadata,
    quantity: new BigNumber(order.quantity || 1),
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
    makerReferrerFee: new BigNumber(order.maker_referrer_fee || 0),
    waitingForBestCounterOrder: order.fee_recipient.address == NULL_ADDRESS,
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
    currentBounty: new BigNumber(order.current_bounty || 0),
    currentPrice: new BigNumber(order.current_price || 0),

    createdTime: new BigNumber(Math.round(createdDate.getTime() / 1000)),
    listingTime: new BigNumber(order.listing_time),
    expirationTime: new BigNumber(order.expiration_time),

    salt: new BigNumber(order.salt),
    v: parseInt(order.v),
    r: order.r,
    s: order.s,

    paymentTokenContract: order.payment_token_contract ? tokenFromJSON(order.payment_token_contract) : undefined,
    asset: order.asset ? assetFromJSON(order.asset) : undefined,
    assetBundle: order.asset_bundle ? assetBundleFromJSON(order.asset_bundle) : undefined,
  }

  // Use client-side price calc, to account for buyer fee (not added by server) and latency
  fromJSON.currentPrice = estimateCurrentPrice(fromJSON)

  return fromJSON
}

/**
 * Convert an order to JSON, hashing it as well if necessary
 * @param order order (hashed or unhashed)
 */
export const orderToJSON = (order: Order): OrderJSON => {
  const asJSON: OrderJSON = {
    exchange: order.exchange.toLowerCase(),
    maker: order.maker.toLowerCase(),
    taker: order.taker.toLowerCase(),
    makerRelayerFee: order.makerRelayerFee.toString(),
    takerRelayerFee: order.takerRelayerFee.toString(),
    makerProtocolFee: order.makerProtocolFee.toString(),
    takerProtocolFee: order.takerProtocolFee.toString(),
    makerReferrerFee: order.makerReferrerFee.toString(),
    feeMethod: order.feeMethod,
    feeRecipient: order.feeRecipient.toLowerCase(),
    side: order.side,
    saleKind: order.saleKind,
    target: order.target.toLowerCase(),
    howToCall: order.howToCall,
    calldata: order.calldata,
    replacementPattern: order.replacementPattern,
    staticTarget: order.staticTarget.toLowerCase(),
    staticExtradata: order.staticExtradata,
    paymentToken: order.paymentToken.toLowerCase(),
    quantity: order.quantity.toString(),
    basePrice: order.basePrice.toString(),
    extra: order.extra.toString(),
    createdTime: order.createdTime
      ? order.createdTime.toString()
      : undefined,
    listingTime: order.listingTime.toString(),
    expirationTime: order.expirationTime.toString(),
    salt: order.salt.toString(),

    metadata: order.metadata,

    v: order.v,
    r: order.r,
    s: order.s,

    hash: order.hash
  }
  return asJSON
}

/**
 * Sign messages using web3 personal signatures
 * @param web3 Web3 instance
 * @param message message to sign
 * @param signerAddress web3 address signing the message
 * @returns A signature if provider can sign, otherwise null
 */
export async function personalSignAsync(web3: Web3, message: string, signerAddress: string
  ): Promise<ECSignature | null> {

  if ((web3.currentProvider as any).isDapper) {
    // Optimize Dapper - don't try signature
    return null
  }

  const signature = await promisify<Web3.JSONRPCResponsePayload>(c => web3.currentProvider.sendAsync({
      method: 'personal_sign',
      params: [message, signerAddress],
      from: signerAddress,
      id: new Date().getTime()
    } as any, c)
  )

  const error = (signature as any).error
  if (error) {
    return null
  }

  try {
    return parseSignatureHex(signature.result)
  } catch (error) {
    // Dapper wallet signature isn't parseable
    return null
  }
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
 * @param param0 __namedParameters
 * @param from address sending transaction
 * @param to destination contract address
 * @param data data to send to contract
 * @param gasPrice gas price to use. If unspecified, uses web3 default (mean gas price)
 * @param value value in ETH to send with data. Defaults to 0
 * @param onError callback when user denies transaction
 */
export async function sendRawTransaction(
    web3: Web3,
    {from, to, data, gasPrice, value = 0, gas}: Web3.TxData,
    onError: (error: Error) => void
  ): Promise<string> {

  if (gas == null) {
    // This gas cannot be increased due to an ethjs error
    gas = await estimateGas(web3, { from, to, data, value })
  }

  try {
    const txHashRes = await promisify<string>(c => web3.eth.sendTransaction({
      from,
      to,
      value,
      data,
      gas,
      gasPrice
    }, c))
    return txHashRes.toString()

  } catch (error) {

    onError(error)
    throw error
  }
}

/**
 * Call a method on a contract, sending arbitrary data and
 * handling Parity errors. Returns '0x' if error.
 * @param web3 Web3 instance
 * @param param0 __namedParameters
 * @param from address sending call
 * @param to destination contract address
 * @param data data to send to contract
 * @param onError callback when user denies transaction
 */
export async function rawCall(
    web3: Web3,
    { from, to, data }: Web3.CallData,
    onError?: (error: Error) => void
  ): Promise<string> {

  try {
    const result = await promisify<string>(c => web3.eth.call({
      from,
      to,
      data
    }, c))
    return result

  } catch (error) {
    // Probably method not found, and web3 is a Parity node
    if (onError) {
      onError(error)
    }
    // Backwards compatibility with Geth nodes
    return '0x'
  }
}

/**
 * Estimate Gas usage for a transaction
 * @param web3 Web3 instance
 * @param from address sending transaction
 * @param to destination contract address
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

/**
 * Get current transfer fees for an asset
 * @param web3 Web3 instance
 * @param asset The asset to check for transfer fees
 */
export async function getTransferFeeSettings(
    web3: Web3,
    { asset, accountAddress }: {
      asset: Asset;
      accountAddress?: string;
    }
  ) {
  let transferFee: BigNumber | undefined
  let transferFeeTokenAddress: string | undefined

  if (asset.tokenAddress.toLowerCase() == ENJIN_ADDRESS.toLowerCase()) {
    // Enjin asset
    const feeContract = web3.eth.contract(ERC1155 as any).at(asset.tokenAddress)

    const params = await promisifyCall<any[]>(c => feeContract.transferSettings(
        asset.tokenId,
        { from: accountAddress },
      c)
    )
    if (params) {
      transferFee = makeBigNumber(params[3])
      if (params[2] == 0) {
        transferFeeTokenAddress = ENJIN_COIN_ADDRESS
      }
    }
  }
  return { transferFee, transferFeeTokenAddress }
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
  const { side, takerRelayerFee, makerRelayerFee, saleKind, feeRecipient } = order

  const now = new BigNumber(Math.round(Date.now() / 1000)).minus(secondsToBacktrack)
  basePrice = new BigNumber(basePrice)
  listingTime = new BigNumber(listingTime)
  expirationTime = new BigNumber(expirationTime)
  extra = new BigNumber(extra)

  let exactPrice = basePrice

  if (saleKind == SaleKind.FixedPrice) {
    // Do nothing, price is correct
  } else if (saleKind == SaleKind.DutchAuction) {
    const diff = extra.times(now.minus(listingTime))
                  .dividedBy(expirationTime.minus(listingTime))

    exactPrice = side == OrderSide.Sell
      /* Sell-side - start price: basePrice. End price: basePrice - extra. */
      ? basePrice.minus(diff)
      /* Buy-side - start price: basePrice. End price: basePrice + extra. */
      : basePrice.plus(diff)
  }

  // Add buyer fee
  if (side == OrderSide.Sell) {
    // Buyer fee increases sale price
    const buyerFeeBPS = order.waitingForBestCounterOrder
      ? makerRelayerFee
      : takerRelayerFee
    exactPrice = exactPrice.times(+buyerFeeBPS / INVERSE_BASIS_POINT + 1)
  }

  return shouldRoundUp ? exactPrice.ceil() : exactPrice
}

/**
 * Wrapper function for getting generic Wyvern assets from OpenSea assets
 * @param schema Wyvern schema for the asset
 * @param asset The fungible or nonfungible asset to format
 */
export function getWyvernAsset(
    schema: Schema<WyvernAsset>,
    asset: Asset,
    quantity = new BigNumber(1)
  ) {
  if (SCHEMA_NAME_TO_ASSET_CONTRACT_TYPE[schema.name as WyvernSchemaName] == AssetContractType.NonFungible) {
    return getWyvernNFTAsset(schema as Schema<WyvernNFTAsset>, asset)
  } else {
    return getWyvernFTAsset(schema as Schema<WyvernFTAsset>, asset, quantity)
  }
}

/**
 * Get the Wyvern representation of an NFT asset
 * @param schema The WyvernSchema needed to access this asset
 * @param asset The asset
 */
export function getWyvernNFTAsset(
    schema: Schema<WyvernNFTAsset>, asset: Asset
  ): WyvernNFTAsset {

  return schema.assetFromFields({
    'ID': asset.tokenId != null
      ? asset.tokenId.toString()
      : undefined,
    'Address': asset.tokenAddress.toLowerCase(),
    'Name': asset.name,
  })
}

/**
 * Get the Wyvern representation of a fungible asset
 * @param schema The WyvernSchema needed to access this asset
 * @param asset The asset to trade
 * @param quantity The number of items to trade
 */
export function getWyvernFTAsset(
    schema: Schema<WyvernFTAsset>,
    asset: Asset,
    quantity: BigNumber
  ): WyvernFTAsset {

  const tokenId = asset.tokenId != null
    ? asset.tokenId
    : undefined

  return schema.assetFromFields({
    'ID': tokenId,
    'Quantity': quantity.toString(),
    'Address': asset.tokenAddress.toLowerCase(),
  })
}

/**
 * Get the Wyvern representation of a group of NFT assets
 * Sort order is enforced here. Throws if there's a duplicate.
 * @param schema The WyvernSchema needed to access these assets
 * @param assets Assets to bundle
 */
export function getWyvernBundle(
    schema: any, assets: Asset[]
  ): WyvernBundle {

  const wyAssets = assets.map(asset => getWyvernNFTAsset(schema, asset))
  const sorters = [(a: WyvernNFTAsset) => a.address, (a: WyvernNFTAsset) => a.id]
  const uniqueAssets = _.uniqBy(wyAssets, a => `${sorters[0](a)}-${sorters[1](a)}`)

  if (uniqueAssets.length != wyAssets.length) {
    throw new Error("Bundle can't contain duplicate assets")
  }

  const sortedWyAssets = _.sortBy(wyAssets, sorters)

  return {
    assets: sortedWyAssets
  }
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
export function encodeAtomicizedTransfer(schema: Schema<any>, assets: WyvernAsset[], from: string, to: string, atomicizer: WyvernAtomicizerContract) {

  const transactions = assets.map((asset: any) => {
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
    transactions.map((t: any) => t.calldata).reduce((x: string, current: string) => x + current.slice(2), '0x'), // cut off the '0x'
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
      case FunctionInputKind.Replaceable:
        return to
      case FunctionInputKind.Owner:
        return from
      case FunctionInputKind.Asset:
      default:
        if (input.value == null) {
          throw new Error(`Unsupported function input kind: ${input.kind}`)
        }
        return input.value
    }
  })
  return WyvernSchemas.encodeCall(transferAbi as Web3.MethodAbi, parameters)
}

/**
 * Encode a call to a user's proxy contract
 * @param address The address for the proxy to call
 * @param howToCall How to call the addres
 * @param calldata The data to use in the call
 * @param shouldAssert Whether to assert success in the proxy call
 */
export function encodeProxyCall(address: string, howToCall: HowToCall, calldata: string, shouldAssert = true) {
  const abi = shouldAssert ? proxyAssertABI : proxyABI
  return WyvernSchemas.encodeCall(abi, [address, howToCall, Buffer.from(calldata.slice(2), 'hex')])
}

/**
 * Validates that an address exists, isn't null, and is properly
 * formatted for Wyvern and OpenSea
 * @param address input address
 */
export function validateAndFormatWalletAddress(web3: Web3, address: string): string {
  if (!address) {
    throw new Error('No wallet address found')
  }
  if (!web3.isAddress(address)) {
    throw new Error('Invalid wallet address')
  }
  if (address == NULL_ADDRESS) {
    throw new Error('Wallet cannot be the null address')
  }
  return address.toLowerCase()
}

/**
 * Notify developer when a pattern will be deprecated
 * @param msg message to log to console
 */
export function onDeprecated(msg: string) {
  console.warn(`DEPRECATION NOTICE: ${msg}`)
}

/**
 * Get special-case approval addresses for an erc721 contract
 * @param erc721Contract contract to check
 */
export async function getNonCompliantApprovalAddress(erc721Contract: Web3.ContractInstance, tokenId: string, accountAddress: string): Promise<string | undefined> {

  // Throw errors if we don't have the ABI yet
  const onError = (e: Error) => { throw e }

  const results = await Promise.all([
    // CRYPTOKITTIES check
    promisifyCall<string>(c => erc721Contract.kittyIndexToApproved.call(tokenId, c), onError),
    // Etherbots check
    promisifyCall<string>(c => erc721Contract.partIndexToApproved.call(tokenId, c), onError),
  ])

  return _.compact(results)[0]
}
