import "../support/setup";
import { assert } from "chai";
import { suite, test } from "mocha";
import { mainApi } from "../constants";

suite("Generating fulfillment data", () => {
  test(`Generate fulfillment data for listing`, async () => {
    const order = await mainApi.getOrder({
      protocol: "seaport",
      side: "ask",
    });

    if (order.orderHash == null) {
      return;
    }

    const fulfillment = await mainApi.generateFulfillmentData(
      "0x000000000000000000000000000000000000dEaD",
      order.orderHash,
      order.protocolAddress,
      order.side
    );

    assert.exists(fulfillment.fulfillment_data.orders[0].signature);
  });

  test(`Generate fulfillment data for offer`, async () => {
    const order = await mainApi.getOrder({
      protocol: "seaport",
      side: "bid",
    });

    if (order.orderHash == null) {
      return;
    }

    const fulfillment = await mainApi.generateFulfillmentData(
      "0x000000000000000000000000000000000000dEaD",
      order.orderHash,
      order.protocolAddress,
      order.side
    );

    assert.exists(fulfillment.fulfillment_data.orders[0].signature);
  });
});
