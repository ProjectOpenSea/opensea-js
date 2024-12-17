import "../utils/setup";
import { expect } from "chai";
import { suite, test } from "mocha";
import { OrderProtocol, OrderSide } from "../../src/types";
import { mainAPI } from "../utils/constants";

suite("Generating fulfillment data", () => {
  test(`Generate fulfillment data for listing`, async () => {
    const order = await mainAPI.getOrder({
      protocol: OrderProtocol.SEAPORT,
      side: OrderSide.LISTING,
    });

    expect(order).to.not.be.undefined;
    expect(order.orderHash).to.not.be.null;

    if (!order || !order.orderHash) {
      return;
    }

    const fulfillment = await mainAPI.generateFulfillmentData(
      "0x000000000000000000000000000000000000dEaD",
      order.orderHash,
      order.protocolAddress,
      order.side,
    );

    expect(fulfillment).to.not.be.undefined;
    expect(fulfillment.fulfillment_data).to.not.be.undefined;
    expect(fulfillment.fulfillment_data.orders).to.be.an("array").that.is.not
      .empty;
    expect(fulfillment.fulfillment_data.orders[0].signature).to.exist;
  });

  test(`Generate fulfillment data for offer`, async () => {
    const order = await mainAPI.getOrder({
      protocol: OrderProtocol.SEAPORT,
      side: OrderSide.OFFER,
    });

    expect(order).to.not.be.undefined;
    expect(order.orderHash).to.not.be.null;

    if (!order || !order.orderHash) {
      return;
    }

    const fulfillment = await mainAPI.generateFulfillmentData(
      "0x000000000000000000000000000000000000dEaD",
      order.orderHash,
      order.protocolAddress,
      order.side,
    );

    expect(fulfillment).to.not.be.undefined;
    expect(fulfillment.fulfillment_data).to.not.be.undefined;
    expect(fulfillment.fulfillment_data.orders).to.be.an("array").that.is.not
      .empty;
    expect(fulfillment.fulfillment_data.orders[0].signature).to.exist;
  });
});
