import { assert } from "chai";
import { suite, test } from "mocha";
import { client } from "../utils/constants";

suite("SDK: orders", () => {
  test("Fungible tokens filter", async () => {
    const manaAddress = "0x0f5d2fb29fb7d3cfee444a200298f468908cc942";
    const manaPaymentToken = await client.api.getPaymentToken(manaAddress);
    assert.isNotNull(manaPaymentToken);
    assert.equal(manaPaymentToken.name, "Decentraland MANA");
    assert.equal(manaPaymentToken.address, manaAddress);
    assert.equal(manaPaymentToken.decimals, 18);

    const daiAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
    const daiPaymentToken = await client.api.getPaymentToken(daiAddress);
    assert.isNotNull(daiPaymentToken);
    assert.equal(daiPaymentToken.name, "Dai");
    assert.equal(daiPaymentToken.decimals, 18);
  });
});
