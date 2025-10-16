import { randomBytes } from "crypto";
import { expect } from "chai";
import { OrderV2 } from "../../src/orders/types";
import { getCurrentUnixTimestamp, TimeInSeconds } from "../../src/utils";

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

/**
 * Generates a random expiration timestamp between 15 minutes and 1 hour from now.
 * Uses cryptographically secure random bytes with rejection sampling to ensure
 * uniform distribution and avoid modulo bias. The result is rounded down to the
 * nearest minute for cleaner test values.
 *
 * @returns Unix timestamp in seconds representing a future expiration time (rounded to minute)
 */
export const getRandomExpiration = (): number => {
  const now = getCurrentUnixTimestamp();
  const fifteenMinutes = TimeInSeconds.MINUTE * 15;
  const oneHour = TimeInSeconds.HOUR;
  const range = oneHour - fifteenMinutes + 1;

  const maxValue = 0xffffffff; // 2^32 - 1
  const rejectionThreshold = maxValue - (maxValue % range);

  let randomValue: number;
  do {
    const randomBuffer = randomBytes(4);
    randomValue = randomBuffer.readUInt32BE(0);
  } while (randomValue >= rejectionThreshold);

  const randomSeconds = (randomValue % range) + fifteenMinutes;
  const futureTimestamp = now + randomSeconds;

  // Round down to the nearest minute for cleaner test values
  return Math.floor(futureTimestamp / TimeInSeconds.MINUTE) * TimeInSeconds.MINUTE;
};

export const getRandomSalt = (): bigint => {
  const saltBuffer = randomBytes(32);
  return BigInt("0x" + saltBuffer.toString("hex"));
};

/**
 * Process items in batches with controlled concurrency
 * @param items Array of items to process
 * @param batchSize Number of items to process concurrently in each batch
 * @param processor Async function to process each item
 */
export const processInBatches = async <T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const promises = batch.map(processor);
    const batchResults = await Promise.all(promises);

    results.push(...batchResults);
  }

  return results;
};
