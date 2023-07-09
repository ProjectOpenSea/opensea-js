import { assert } from "chai";
import { suite, test } from "mocha";
import { OpenSeaSDK } from "../../src/index";
import { Chain } from "../../src/types";
import { MAINNET_API_KEY, RPC_PROVIDER_MAINNET } from "../utils/constants";

const client = new OpenSeaSDK(
  RPC_PROVIDER_MAINNET,
  {
    chain: Chain.Mainnet,
    apiKey: MAINNET_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`),
);

suite("SDK: orders", () => {
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
