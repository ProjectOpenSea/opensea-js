import BigNumber from 'bignumber.js'
import * as Web3 from 'web3'
import {
  Network,
  HowToCall,
  SaleKind,
  Order as WyvernOrder
} from 'wyvern-js/lib/types'

export {
  Network,
  HowToCall,
  SaleKind,
}

export type Web3Callback<T> = (err: Error | null, result: T) => void
export type Web3RPCCallback = Web3Callback<Web3.JSONRPCResponsePayload>
export type TxnCallback = (result: boolean) => void

// To simplify typifying ABIs:
export interface PartialAbiDefinition {
  type: Web3.AbiType | string // Not Partial!
  name?: string
  inputs?: object[]
  outputs?: object[]
  payable?: boolean
  constant?: boolean
  anonymous?: boolean
  stateMutability?: Web3.ConstructorStateMutability | string
}
export type PartialReadonlyContractAbi = Array<Readonly<PartialAbiDefinition>>

export interface OpenSeaAPIConfig {
  networkName?: Network
  apiKey?: string
  gasPrice?: BigNumber
}

export enum OrderSide {
  Buy = 0,
  Sell = 1,
}

export enum FeeMethod {
  ProtocolFee = 0,
  SplitFee = 1,
}

export interface ECSignature {
  v: number
  r: string
  s: string
}

export interface WyvernAsset {
  id: string
  address: string
}

export interface Order extends WyvernOrder {
  feeMethod: FeeMethod
  side: OrderSide
  saleKind: SaleKind
  howToCall: HowToCall

  hash: string

  metadata: {asset: WyvernAsset; schema: string}

  v: number
  r: string
  s: string

  // Server side appends
  cancelledOrFinalized?: boolean
  markedInvalid?: boolean
  currentPrice?: BigNumber
}

// Fancy TypeScript magic...
export type UnsignedOrder = Pick<Order, Exclude<keyof Order, keyof ECSignature>>
export type UnhashedOrder = Pick<UnsignedOrder, Exclude<keyof UnsignedOrder, "hash">>

export interface OrderJSON {
  exchange: string
  maker: string
  taker: string
  makerRelayerFee: string
  takerRelayerFee: string
  makerProtocolFee: string
  takerProtocolFee: string
  feeRecipient: string
  feeMethod: string
  side: string
  saleKind: string
  target: string
  howToCall: string
  calldata: string
  replacementPattern: string
  staticTarget: string
  staticExtradata: string
  paymentToken: string
  basePrice: string
  extra: string
  listingTime: string
  expirationTime: string
  salt: string

  metadata: {asset: WyvernAsset; schema: string}

  // Optional, so that we can JSONify orders before sending them to getOrderHashHex
  hash?: string
  v?: number
  r?: string
  s?: string

  // Used by orderbook to make queries easier
  tokenAddress?: string,
  tokenId?: number | string
}

export interface OrderbookResponse {
  orders: OrderJSON[]
  count: number
}
