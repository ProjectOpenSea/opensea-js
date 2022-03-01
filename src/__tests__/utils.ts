export const areTimestampsNearlyEqual = (
  timestampA: number,
  timestampB: number,
  buffer = 5
) => {
  return Math.abs(timestampA - timestampB) <= buffer;
};
