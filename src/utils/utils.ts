import { ethers } from "ethers";
import { MAX_EXPIRATION_MONTHS } from "../constants";

// Re-export all utilities from specialized modules
export * from "./converters";
export * from "./chain";
export * from "./fees";
export * from "./protocol";

/**
 * Estimate gas usage for a transaction.
 * @param provider The Provider
 * @param from Address sending transaction
 * @param to Destination contract address
 * @param data Data to send to contract
 * @param value Value in ETH to send with data
 */
export async function estimateGas(
  provider: ethers.Provider,
  { from, to, data, value = 0n }: ethers.Transaction,
) {
  return await provider.estimateGas({
    from,
    to,
    value: value.toString(),
    data,
  });
}

/**
 * The longest time that an order is valid for is one month from the current date
 * @returns unix timestamp
 */
export const getMaxOrderExpirationTimestamp = () => {
  const maxExpirationDate = new Date();

  maxExpirationDate.setMonth(
    maxExpirationDate.getMonth() + MAX_EXPIRATION_MONTHS,
  );
  maxExpirationDate.setDate(maxExpirationDate.getDate() - 1);

  return Math.round(maxExpirationDate.getTime() / 1000);
};

interface ErrorWithCode extends Error {
  code: string;
}

export const hasErrorCode = (error: unknown): error is ErrorWithCode => {
  const untypedError = error as Partial<ErrorWithCode>;
  return !!untypedError.code;
};

/**
 * Calculate the next power of 2 greater than or equal to the given number.
 * Used for padding bulk orders to satisfy Seaport's merkle tree requirements.
 * @param n The number to round up
 * @returns The next power of 2 (minimum 2, maximum 2^24)
 */
export const getNextPowerOfTwo = (n: number): number => {
  if (n < 2) {
    return 2;
  }
  if (n > 2 ** 24) {
    throw new Error("Bulk orders cannot exceed 2^24 orders");
  }
  // If already a power of 2, return as is
  if ((n & (n - 1)) === 0) {
    return n;
  }
  // Otherwise, find next power of 2
  return 2 ** Math.ceil(Math.log2(n));
};
