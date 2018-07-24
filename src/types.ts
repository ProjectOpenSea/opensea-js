import BigNumber from 'bignumber.js'

export interface OpenSeaAPIConfig {
  networkName?: Network
  apiKey?: string
  gasPrice?: BigNumber
}

export enum Network {
  Main = 'main',
  Rinkeby = 'rinkeby',
}

export enum OrderSide {
  Buy = 0,
  Sell = 1,
}

export enum SaleKind {
  FixedPrice = 0,
  EnglishAuction = 1,
  DutchAuction = 2,
}

export enum HowToCall {
  Call = 0,
  DelegateCall = 1,
  StaticCall = 2,
  Create = 3,
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

export interface Order {
  exchange: string
  maker: string
  taker: string
  makerRelayerFee: BigNumber
  takerRelayerFee: BigNumber
  makerProtocolFee: BigNumber
  takerProtocolFee: BigNumber
  feeRecipient: string
  feeMethod: FeeMethod
  side: OrderSide
  saleKind: SaleKind
  target: string
  howToCall: HowToCall
  calldata: string
  replacementPattern: string
  staticTarget: string
  staticExtradata: string
  paymentToken: string
  basePrice: BigNumber
  extra: BigNumber
  listingTime: BigNumber
  expirationTime: BigNumber
  salt: BigNumber
  r?: string,
  s?: string,
  v?: number
}
