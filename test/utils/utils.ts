import { expect } from "chai";
import { OrderV2 } from "src/orders/types";

export const expectValidOrder = (
  order: OrderV2,
  usingDefaultMarketplaceFee = true
) => {
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
  ];
  for (const field of requiredFields) {
    expect(field in order).to.be.true;
  }
  if (usingDefaultMarketplaceFee) {
    if (order.makerFees.length > 0) {
      expect(parseInt(order.takerFees[0].basisPoints)).to.be.equal(0);
    } else {
      expect(parseInt(order.takerFees[0].basisPoints)).to.be.equal(50);
    }
  }
};
