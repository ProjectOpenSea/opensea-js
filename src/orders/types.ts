import { OrderWithNonce } from "seaport-js/lib/types";
import { OpenSeaAccount, OpenSeaAssetBundle } from "../types";

// Protocol data
export type OrderProtocol = "seaport" | "wyvern";
type ConsiderationProtocolData = OrderWithNonce;
type ProtocolData = ConsiderationProtocolData;

// Protocol agnostic order data
type OrderType = "basic" | "dutch" | "english" | "criteria";
export type OrderSide = "ask" | "bid";

export type OrderV2 = {
  createdDate: string;
  closingDate: string | null;
  listingTime: number;
  expirationTime: number;
  orderHash: string | null;
  maker: OpenSeaAccount;
  taker: OpenSeaAccount | null;
  protocolData: ProtocolData;
  protocolAddress: string;
  currentPrice: string;
  makerFees: {
    account: OpenSeaAccount;
    basisPoints: string;
  }[];
  takerFees: {
    account: OpenSeaAccount;
    basisPoints: string;
  }[];
  side: OrderSide;
  orderType: OrderType;
  cancelled: boolean;
  finalized: boolean;
  markedInvalid: boolean;
  clientSignature: string | null;
  makerAssetBundle: OpenSeaAssetBundle;
  takerAssetBundle: OpenSeaAssetBundle;
};

// API query types
type OpenOrderOrderingOption = "created_date" | "eth_price";
type OrderByDirection = "asc" | "desc";

export type OrdersQueryOptions = {
  protocol: OrderProtocol;
  side: OrderSide;

  limit: number;
  cursor?: string;

  paymentTokenAddress?: string;
  maker?: string;
  taker?: string;
  owner?: string;
  bundled?: boolean;
  includeBundled?: boolean;
  listedAfter?: number | string;
  listedBefore?: number | string;
  tokenIds?: number[];
  assetContractAddress?: string;
  orderBy?: OpenOrderOrderingOption;
  orderDirection?: OrderByDirection;
  onlyEnglish?: boolean;
};

export type OrdersQueryResponse = {
  next: string | null;
  previous: string | null;
  orders: OrderV2[];
};
