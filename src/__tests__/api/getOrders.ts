import "../support/setup";
import { expect } from "chai";
import { suite, test } from "mocha";
import { OrderSide } from "src/orders/types";
import { BAYC_CONTRACT_ADDRESS, BAYC_TOKEN_IDS, mainApi } from "../constants";
import { expectValidOrder } from "../utils";

suite("Getting orders", () => {
  [<OrderSide>"ask", <OrderSide>"bid"].forEach((side) => {
    test(`getOrder should return a single order > ${side}`, async () => {
      const order = await mainApi.getOrder({
        protocol: "seaport",
        side,
      });
      expectValidOrder(order);
    });
  });

  test(`getOrder should throw if no order found`, async () => {
    await expect(
      mainApi.getOrder({
        protocol: "seaport",
        side: "ask",
        maker: "0x000000000000000000000000000000000000dEaD",
      })
    )
      .to.eventually.be.rejected.and.be.an.instanceOf(Error)
      .and.have.property("message", "Not found: no matching order found");
  });

  [<OrderSide>"ask", <OrderSide>"bid"].forEach((side) => {
    test(`getOrders should return a list of orders > ${side}`, async () => {
      const { orders, next, previous } = await mainApi.getOrders({
        protocol: "seaport",
        side,
        tokenIds: BAYC_TOKEN_IDS,
        assetContractAddress: BAYC_CONTRACT_ADDRESS,
      });
      orders.map((order) => expectValidOrder(order));
      expect(next).to.not.be.undefined;
      expect(previous).to.not.be.undefined;
    });
  });
});
