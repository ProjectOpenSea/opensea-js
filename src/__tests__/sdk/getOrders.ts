import "../support/setup";
import { expect } from "chai";
import { suite, test } from "mocha";
import Web3 from "web3";
import { TESTNET_PROVIDER_URL } from "../../constants";
import { OpenSeaSDK } from "../../index";
import { Network } from "../../types";
import { TESTNET_API_KEY } from "../constants";
import { expectValidOrder } from "../utils";

// Client setup
const testnetProvider = new Web3.providers.HttpProvider(TESTNET_PROVIDER_URL);
const testnetClient = new OpenSeaSDK(testnetProvider, {
  networkName: Network.Goerli,
  apiKey: TESTNET_API_KEY,
});

suite("Getting orders", () => {
  ["ask", "bid"].forEach((side) => {
    test(`getOrder should return a single order > ${side}`, async () => {
      const order = await testnetClient.api.getOrder({
        protocol: "seaport",
        side: "ask",
      });
      expectValidOrder(order);
    });
  });

  test(`getOrder should throw if no order found`, async () => {
    await expect(
      testnetClient.api.getOrder({
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
      const { orders, next, previous } = await testnetClient.api.getOrders({
        protocol: "seaport",
        side: "ask",
      });
      orders.map((order) => expectValidOrder(order));
      expect(next).to.not.be.undefined;
      expect(previous).to.not.be.undefined;
    });
  });
});
