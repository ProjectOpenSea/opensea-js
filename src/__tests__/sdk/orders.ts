import { BigNumber } from "bignumber.js";
import { assert } from "chai";
import { suite, test } from "mocha";
import Web3 from "web3";
import { MAINNET_PROVIDER_URL } from "../../constants";
import { OpenSeaSDK } from "../../index";
import { Network, OrderJSON } from "../../types";
import { orderFromJSON } from "../../utils/utils";
import {
  ALEX_ADDRESS,
  ALEX_ADDRESS_2,
  DIGITAL_ART_CHAIN_ADDRESS,
  DIGITAL_ART_CHAIN_TOKEN_ID,
  MAINNET_API_KEY,
  MYTHEREUM_ADDRESS,
  MYTHEREUM_TOKEN_ID,
} from "../constants";
import ordersJSONFixture from "../fixtures/orders.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ordersJSON = ordersJSONFixture as any;

const provider = new Web3.providers.HttpProvider(MAINNET_PROVIDER_URL);

const client = new OpenSeaSDK(
  provider,
  {
    networkName: Network.Main,
    apiKey: MAINNET_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`)
);

const assetsForBundleOrder = [
  { tokenId: MYTHEREUM_TOKEN_ID.toString(), tokenAddress: MYTHEREUM_ADDRESS },
  {
    tokenId: DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
    tokenAddress: DIGITAL_ART_CHAIN_ADDRESS,
  },
];

const assetsForBulkTransfer = assetsForBundleOrder;

suite("SDK: orders", () => {
  ordersJSON.map((orderJSON: OrderJSON, index: number) => {
    test("Order #" + index + " has correct types", () => {
      const order = orderFromJSON(orderJSON);
      assert.instanceOf(order.basePrice, BigNumber);
      assert.typeOf(order.maker, "string");
      assert.equal(+order.quantity, 1);
    });
  });

  test("Bulk transfer", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS_2;

    const gas = await client._estimateGasForTransfer({
      assets: assetsForBulkTransfer,
      fromAddress: accountAddress,
      toAddress: takerAddress,
    });

    assert.isAbove(gas, 0);
  });

  test("Fungible tokens filter", async () => {
    const manaTokens = (await client.api.getPaymentTokens({ symbol: "MANA" }))
      .tokens;
    assert.equal(manaTokens.length, 1);
    const mana = manaTokens[0];
    assert.isNotNull(mana);
    assert.equal(mana.name, "Decentraland MANA");
    assert.equal(mana.address, "0x0f5d2fb29fb7d3cfee444a200298f468908cc942");
    assert.equal(mana.decimals, 18);

    const dai = (await client.api.getPaymentTokens({ symbol: "DAI" }))
      .tokens[0];
    assert.isNotNull(dai);
    assert.equal(dai.name, "Dai Stablecoin");
    assert.equal(dai.decimals, 18);

    const all = await client.api.getPaymentTokens();
    assert.isNotEmpty(all);
  });
});
