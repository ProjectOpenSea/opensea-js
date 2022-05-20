import { OrderV2 } from "../orders/types";

export const areTimestampsNearlyEqual = (
  timestampA: number,
  timestampB: number,
  buffer = 5
) => {
  return Math.abs(timestampA - timestampB) <= buffer;
};

// Rudimentary test validation helper
export const assertIsOrderV2 = (order: OrderV2 | unknown): void => {
  if (!order || typeof order !== "object") {
    throw new Error(`Order is not an object: ${JSON.stringify(order)}`);
  }
  const EXPECTED_ORDERV2_KEYS = [
    "createdDate",
    "closingDate",
    "listingTime",
    "expirationTime",
    "orderHash",
    "maker",
    "taker",
    "protocolData",
    "protocolAddress",
    "currentPrice",
    "makerFees",
    "takerFees",
    "side",
    "orderType",
    "cancelled",
    "finalized",
    "markedInvalid",
    "clientSignature",
    "makerAssetBundle",
    "takerAssetBundle",
  ];
  const orderKeys = new Set(Object.keys(order));
  if (EXPECTED_ORDERV2_KEYS.some((key) => !orderKeys.has(key))) {
    console.error(orderKeys);
    throw new Error(`Order is missing expected keys: ${JSON.stringify(order)}`);
  }
};
