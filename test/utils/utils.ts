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
    "remainingQuantity",
  ];
  for (const field of requiredFields) {
    expect(field in order).to.be.true;
  }
};

export const getRandomExpiration = (): number => {
  const now = Math.floor(Date.now() / 1000);
  const fifteenMinutes = 15 * 60;
  const oneHour = 60 * 60;
  const randomSeconds =
    Math.floor(Math.random() * (oneHour - fifteenMinutes + 1)) + fifteenMinutes;
  return now + randomSeconds;
};
