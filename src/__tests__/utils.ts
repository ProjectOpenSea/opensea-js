import { expect } from "chai";
import { validateOrder } from "../orders/schemas";
import { OrderV2 } from "../orders/types";

export const expectValidOrder = (order: OrderV2) => {
  const isOrderValid = validateOrder(order);
  expect(
    isOrderValid,
    `Order type is invalid: ${JSON.stringify(validateOrder.errors)}`
  ).to.be.true;
};
