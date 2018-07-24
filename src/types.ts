import { BigNumber } from '@0xproject/utils';

export interface OpenSeaAPIConfig {
  network: Network;
  gasPrice?: BigNumber;
}

export enum Network {
  Main = 'main',
  Rinkeby = 'rinkeby',
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

export interface ECSignature {
  v: number;
  r: string;
  s: string;
}

export interface Order {
  exchange: string;
  maker: string;
  taker: string;
  makerRelayerFee: BigNumber;
  takerRelayerFee: BigNumber;
  makerProtocolFee: BigNumber;
  takerProtocolFee: BigNumber;
  feeRecipient: string;
  feeMethod: number;
  side: number;
  saleKind: number;
  target: string;
  howToCall: number;
  calldata: string;
  replacementPattern: string;
  staticTarget: string;
  staticExtradata: string;
  paymentToken: string;
  basePrice: BigNumber;
  extra: BigNumber;
  listingTime: BigNumber;
  expirationTime: BigNumber;
  salt: BigNumber;
}
