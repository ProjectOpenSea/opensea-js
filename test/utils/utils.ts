import { randomBytes } from "crypto";
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
  const range = oneHour - fifteenMinutes + 1;

  const maxValue = 0xffffffff; // 2^32 - 1
  const rejectionThreshold = maxValue - (maxValue % range);

  let randomValue: number;
  do {
    const randomBuffer = randomBytes(4);
    randomValue = randomBuffer.readUInt32BE(0);
  } while (randomValue >= rejectionThreshold);

  const randomSeconds = (randomValue % range) + fifteenMinutes;
  return now + randomSeconds;
};

export const getRandomSalt = (): bigint => {
  const saltBuffer = randomBytes(32);
  return BigInt("0x" + saltBuffer.toString("hex"));
};
