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

  test(`Generate fulfillment data for collection offer with consideration parameters`, async () => {
    // Get a collection offer (criteria offer)
    const offers = await api.getAllOffers("boredapeyachtclub", 1);

    if (!offers.offers || offers.offers.length === 0) {
      // Skip if no offers available
      return;
    }

    // Find a criteria offer (collection or trait offer)
    const collectionOffer = offers.offers.find((offer) => offer.criteria);

    if (!collectionOffer || !collectionOffer.order_hash) {
      // Skip if no collection offers available
      return;
    }

    try {
      // Test with consideration parameters for criteria offers
      const fulfillment = await api.generateFulfillmentData(
        "0x000000000000000000000000000000000000dEaD",
        collectionOffer.order_hash,
        collectionOffer.protocol_address,
        OrderSide.OFFER,
        "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", // BAYC contract
        "1", // Token ID
      );

      assert.exists(fulfillment.fulfillment_data.orders[0].signature);
      assert.equal(fulfillment.protocol, "seaport");
    } catch (error) {
      // Order may no longer be active/valid - skip test
      if (error instanceof Error && error.message.includes("Order not found")) {
        return;
      }
      throw error;
    }
  });
});
