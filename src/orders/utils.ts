import { CROSS_CHAIN_SEAPORT_V1_6_ADDRESS } from "@opensea/seaport-js/lib/constants";
import {
  OrdersQueryOptions,
  OrderV2,
  SerializedOrderV2,
  ProtocolData,
} from "./types";
import { Chain, OrderSide } from "../types";
import { accountFromJSON } from "../utils";

export const DEFAULT_SEAPORT_CONTRACT_ADDRESS =
  CROSS_CHAIN_SEAPORT_V1_6_ADDRESS;

export const getPostCollectionOfferPayload = (
  collectionSlug: string,
  protocol_data: ProtocolData,
  traitType?: string,
  traitValue?: string,
) => {
  const payload = {
    criteria: {
      collection: { slug: collectionSlug },
    },
    protocol_data,
    protocol_address: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
  };
  if (traitType && traitValue) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (payload.criteria as any).trait = {
      type: traitType,
      value: traitValue,
    };
  }
  return payload;
};

export const getBuildCollectionOfferPayload = (
  offererAddress: string,
  quantity: number,
  collectionSlug: string,
  offerProtectionEnabled: boolean,
  traitType?: string,
  traitValue?: string,
) => {
  const payload = {
    offerer: offererAddress,
    quantity,
    criteria: {
      collection: {
        slug: collectionSlug,
      },
    },
    protocol_address: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
    offer_protection_enabled: offerProtectionEnabled,
  };
  if (traitType && traitValue) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (payload.criteria as any).trait = {
      type: traitType,
      value: traitValue,
    };
  }
  return payload;
};

export const getFulfillmentDataPath = (side: OrderSide) => {
  const sidePath = side === OrderSide.ASK ? "listings" : "offers";
  return `/v2/${sidePath}/fulfillment_data`;
};

export const getFulfillListingPayload = (
  fulfillerAddress: string,
  order_hash: string,
  protocolAddress: string,
  chain: Chain,
) => {
  return {
    listing: {
      hash: order_hash,
      chain,
      protocol_address: protocolAddress,
    },
    fulfiller: {
      address: fulfillerAddress,
    },
  };
};

export const getFulfillOfferPayload = (
  fulfillerAddress: string,
  order_hash: string,
  protocolAddress: string,
  chain: Chain,
) => {
  return {
    offer: {
      hash: order_hash,
      chain,
      protocol_address: protocolAddress,
    },
    fulfiller: {
      address: fulfillerAddress,
    },
  };
};

type OrdersQueryPathOptions = "protocol" | "side";
export const serializeOrdersQueryOptions = (
  options: Omit<OrdersQueryOptions, OrdersQueryPathOptions>,
) => {
  return {
    limit: options.limit,
    cursor: options.cursor,

    payment_token_address: options.paymentTokenAddress,
    maker: options.maker,
    taker: options.taker,
    owner: options.owner,
    listed_after: options.listedAfter,
    listed_before: options.listedBefore,
    token_ids: options.tokenIds ?? [options.tokenId],
    asset_contract_address: options.assetContractAddress,
    order_by: options.orderBy,
    order_direction: options.orderDirection,
    only_english: options.onlyEnglish,
  };
};

export const deserializeOrder = (order: SerializedOrderV2): OrderV2 => {
  return {
    createdDate: order.created_date,
    closingDate: order.closing_date,
    listingTime: order.listing_time,
    expirationTime: order.expiration_time,
    orderHash: order.order_hash,
    maker: accountFromJSON(order.maker),
    taker: order.taker ? accountFromJSON(order.taker) : null,
    protocolData: order.protocol_data,
    protocolAddress: order.protocol_address,
    currentPrice: BigInt(order.current_price),
    makerFees: order.maker_fees.map(({ account, basis_points }) => ({
      account: accountFromJSON(account),
      basisPoints: basis_points,
    })),
    takerFees: order.taker_fees.map(({ account, basis_points }) => ({
      account: accountFromJSON(account),
      basisPoints: basis_points,
    })),
    side: order.side,
    orderType: order.order_type,
    cancelled: order.cancelled,
    finalized: order.finalized,
    markedInvalid: order.marked_invalid,
    clientSignature: order.client_signature,
    remainingQuantity: order.remaining_quantity,
  };
};
