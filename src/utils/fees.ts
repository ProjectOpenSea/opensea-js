import { FixedNumber } from "ethers";
import { FIXED_NUMBER_100 } from "../constants";
import { Fee } from "../types";

const _expandExponentialNumberString = (value: string): string => {
  const trimmed = value.trim();
  if (!/[eE]/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/^([+-]?)(\d+(?:\.\d+)?)[eE]([+-]?\d+)$/);
  if (!match) {
    return trimmed;
  }

  const sign = match[1] ?? "";
  const coefficient = match[2];
  const exponent = parseInt(match[3], 10);

  const [integerPart, fractionalPart = ""] = coefficient.split(".");
  const digits = `${integerPart}${fractionalPart}`;
  const decimalIndex = integerPart.length + exponent;

  if (decimalIndex <= 0) {
    return `${sign}0.${"0".repeat(-decimalIndex)}${digits}`;
  }
  if (decimalIndex >= digits.length) {
    return `${sign}${digits}${"0".repeat(decimalIndex - digits.length)}`;
  }
  return `${sign}${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
};

/**
 * Sums up the basis points for fees.
 * @param fees The fees to sum up
 * @returns sum of basis points
 */
export const totalBasisPointsForFees = (fees: Fee[]): bigint => {
  const feeBasisPoints = fees.map((fee) => basisPointsForFee(fee));
  const totalBasisPoints = feeBasisPoints.reduce(
    (sum, basisPoints) => basisPoints + sum,
    0n,
  );
  return totalBasisPoints;
};

/**
 * Converts a fee to its basis points representation.
 * @param fee The fee to convert
 * @returns the basis points
 */
export const basisPointsForFee = (fee: Fee): bigint => {
  const feeString = _expandExponentialNumberString(fee.fee.toString());
  return BigInt(
    FixedNumber.fromString(feeString)
      .mul(FIXED_NUMBER_100)
      .toFormat(0) // format to 0 decimal places to convert to bigint
      .toString(),
  );
};
