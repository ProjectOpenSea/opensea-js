import "../support/setup";
import { expect } from "chai";
import { suite, test } from "mocha";
import Web3 from "web3";
import { RINKEBY_PROVIDER_URL } from "../../constants";
import { OpenSeaSDK } from "../../index";
import { Network } from "../../types";
import { RINKEBY_API_KEY } from "../constants";
import { expectValidOrder } from "../utils";

// Client setup
const rinkebyProvider = new Web3.providers.HttpProvider(RINKEBY_PROVIDER_URL);
const rinkebyClient = new OpenSeaSDK(rinkebyProvider, {
  networkName: Network.Rinkeby,
  apiKey: RINKEBY_API_KEY,
});

suite("Getting orders", () => {
  ["ask", "bid"].forEach((side) => {
    test(`getOrder should return a single order > ${side}`, async () => {
      const order = await rinkebyClient.api.getOrder({
        protocol: "seaport",
        side: "ask",
      });
      expectValidOrder(order);
    });
  });

  test(`getOrder should throw if no order found`, async () => {
    await expect(
      rinkebyClient.api.getOrder({
        protocol: "seaport",
        side: "ask",
        maker: "0x000000000000000000000000000000000000dEaD",
      })
    )
      .to.eventually.be.rejected.and.be.an.instanceOf(Error)
      .and.have.property("message", "Not found: no matching order found");
  });

  ["ask", "bid"].forEach((side) => {
    test(`getOrders should return a list of orders > ${side}`, async () => {
      const { orders, next, previous } = await rinkebyClient.api.getOrders({
        protocol: "seaport",
        side: "ask",
      });
      orders.map((order) => expectValidOrder(order));
      expect(next).to.not.be.undefined;
      expect(previous).to.not.be.undefined;
    });
  });
});
