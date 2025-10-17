import { expect } from "chai";
import { suite, test } from "mocha";
import { serializeOrdersQueryOptions } from "../../src/orders/utils";
import { OrderSide } from "../../src/types";
import { BAYC_CONTRACT_ADDRESS, BAYC_TOKEN_IDS } from "../utils/constants";
import { api } from "../utils/sdk";
import { expectValidOrder } from "../utils/utils";

suite("Getting orders", () => {
  [OrderSide.LISTING, OrderSide.OFFER].forEach((side) => {
    test(`getOrder should return a single order > ${side}`, async () => {
      const order = await api.getOrder({
        protocol: "seaport",
        side,
      });
      expectValidOrder(order);
    });
  });

  test(`getOrder should throw if no order found`, async () => {
    try {
      await api.getOrder({
        protocol: "seaport",
        side: OrderSide.LISTING,
        maker: "0x000000000000000000000000000000000000dEaD",
      });
      expect.fail("Expected an error to be thrown");
    } catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error).to.have.property(
        "message",
        "Not found: no matching order found",
      );
    }
  });

  [OrderSide.LISTING, OrderSide.OFFER].forEach((side) => {
    test(`getOrders should return a list of orders > ${side}`, async () => {
      const { orders, next } = await api.getOrders({
        protocol: "seaport",
        side,
        tokenIds: BAYC_TOKEN_IDS,
        assetContractAddress: BAYC_CONTRACT_ADDRESS,
      });
      orders.map((order) => expectValidOrder(order));
      expect(next).to.not.be.undefined;
    });
  });

  test("serializeOrdersQueryOptions omits undefined tokenId", () => {
    expect(serializeOrdersQueryOptions({}).token_ids).to.be.undefined;
  });
});
