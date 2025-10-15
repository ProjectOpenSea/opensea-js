import { FixedNumber } from "ethers";
import { FIXED_NUMBER_100 } from "../constants";
import { Fee } from "../types";

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
  return BigInt(
    FixedNumber.fromString(fee.fee.toString())
      .mul(FIXED_NUMBER_100)
      .toFormat(0) // format to 0 decimal places to convert to bigint
      .toString(),
  );
};
