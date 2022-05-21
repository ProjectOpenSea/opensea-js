import { expect } from "chai";
import { validateOrder } from "../orders/schemas";
import { OrderV2 } from "../orders/types";

export const areTimestampsNearlyEqual = (
  timestampA: number,
  timestampB: number,
  buffer = 5
) => {
  return Math.abs(timestampA - timestampB) <= buffer;
};

export const expectValidOrder = (order: OrderV2) => {
  const isOrderValid = validateOrder(order);
  expect(
    isOrderValid,
    `Order type is invalid: ${JSON.stringify(validateOrder.errors)}`
  ).to.be.true;
};
