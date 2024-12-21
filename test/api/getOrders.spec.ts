import "../utils/setup";
import { expect } from "chai";
import { suite, test } from "mocha";
import { OrderProtocol } from "../../src/orders/types";
import { Chain, OrderSide } from "../../src/types";
import {
  BAYC_CONTRACT_ADDRESS,
  BAYC_TOKEN_IDS,
  expectValidOrder,
  mainAPI,
} from "../utils/constants";

suite("Getting orders", () => {
  [OrderSide.LISTING, OrderSide.OFFER].forEach((side) => {
    test(`getOrder should return a single order > ${side}`, async () => {
      const order = await mainAPI.getOrder({
        protocol: OrderProtocol.SEAPORT,
        side,
      });
      expect(order).to.not.be.undefined;
      if (order) {
        expectValidOrder(order);
      }
    });
  });

  test(`getOrder should handle not found case`, async () => {
    try {
      await mainAPI.getOrder({
        protocol: OrderProtocol.SEAPORT,
        side: OrderSide.LISTING,
        maker: "0x000000000000000000000000000000000000dEaD",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).to.include("Not found");
      }
    }
  });

  [OrderSide.LISTING, OrderSide.OFFER].forEach((side) => {
    test(`getOrders should return a list of orders > ${side}`, async () => {
      const { orders, next, previous } = await mainAPI.getOrders({
        protocol: OrderProtocol.SEAPORT,
        side,
        tokenIds: BAYC_TOKEN_IDS,
        assetContractAddress: BAYC_CONTRACT_ADDRESS,
      });
      expect(orders).to.be.an("array");
      orders.forEach((order) => {
        if (order) {
          expectValidOrder(order);
        }
      });
      // Pagination fields may be undefined based on results
      if (next) {
        expect(next).to.be.a("string");
      }
      if (previous) {
        expect(previous).to.be.a("string");
      }
    });
  });
});
