import { OrderWithCounter } from "@opensea/seaport-js/lib/types";
import { OpenSeaAccount, OpenSeaAssetBundle } from "../types";

// Protocol data
type OrderProtocolToProtocolData = {
  seaport: OrderWithCounter;
};
export type OrderProtocol = keyof OrderProtocolToProtocolData;
export type ProtocolData =
  OrderProtocolToProtocolData[keyof OrderProtocolToProtocolData];

// Protocol agnostic order data
type OrderType = "basic" | "dutch" | "english" | "criteria";
export type OrderSide = "ask" | "bid";
export type OrderFee = {
  account: OpenSeaAccount;
  basisPoints: string;
};

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
  makerFees: OrderFee[];
  takerFees: OrderFee[];
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

export type OrderAPIOptions = {
  protocol?: OrderProtocol;
  side: OrderSide;
};

export type OrdersQueryOptions = OrderAPIOptions & {
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
  tokenId?: string;
  tokenIds?: string[];
  assetContractAddress?: string;
  orderBy?: OpenOrderOrderingOption;
  orderDirection?: OrderByDirection;
  onlyEnglish?: boolean;
};

export type SerializedOrderV2 = {
  created_date: string;
  closing_date: string | null;
  listing_time: number;
  expiration_time: number;
  order_hash: string | null;
  maker: unknown;
  taker: unknown | null;
  protocol_data: ProtocolData;
  protocol_address: string;
  current_price: string;
  maker_fees: {
    account: unknown;
    basis_points: string;
  }[];
  taker_fees: {
    account: unknown;
    basis_points: string;
  }[];
  side: OrderSide;
  order_type: OrderType;
  cancelled: boolean;
  finalized: boolean;
  marked_invalid: boolean;
  client_signature: string | null;
  maker_asset_bundle: unknown;
  taker_asset_bundle: unknown;
};

export type QueryCursors = {
  next: string | null;
  previous: string | null;
};

export type OrdersQueryResponse = QueryCursors & {
  orders: SerializedOrderV2[];
};

export type OrdersPostQueryResponse = { order: SerializedOrderV2 };
