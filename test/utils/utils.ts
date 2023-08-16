import { expect } from "chai";
import { OrderV2 } from "../../src/orders/types";

export const expectValidOrder = (order: OrderV2) => {
  const requiredFields = [
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
    "makerAssetBundle",
    "takerAssetBundle",
    "remainingQuantity",
  ];
  for (const field of requiredFields) {
    expect(field in order).to.be.true;
  }
};
