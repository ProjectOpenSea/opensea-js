import { assert } from "chai";
import { suite, test } from "mocha";
import { OrderSide } from "../../src/types";
import { api } from "../utils/sdk";

suite("Generating fulfillment data", () => {
  test(`Generate fulfillment data for listing`, async () => {
    const order = await api.getOrder({
      protocol: "seaport",
      side: OrderSide.LISTING,
    });

    if (order.orderHash == null) {
      return;
    }

    const fulfillment = await api.generateFulfillmentData(
      "0x000000000000000000000000000000000000dEaD",
      order.orderHash,
      order.protocolAddress,
      order.side,
    );

    assert.exists(fulfillment.fulfillment_data.orders[0].signature);
  });

  test(`Generate fulfillment data for offer`, async () => {
    const order = await api.getOrder({
      protocol: "seaport",
      side: OrderSide.OFFER,
    });

    if (order.orderHash == null) {
      return;
    }

    const fulfillment = await api.generateFulfillmentData(
      "0x000000000000000000000000000000000000dEaD",
      order.orderHash,
      order.protocolAddress,
      order.side,
    );

    assert.exists(fulfillment.fulfillment_data.orders[0].signature);
  });
});
