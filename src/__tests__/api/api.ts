import { assert } from "chai";
import { suite, test } from "mocha";
import {
  BAYC_CONTRACT_ADDRESS,
  BAYC_TOKEN_ID,
  mainApi,
  MAINNET_API_KEY,
  testnetApi,
} from "../constants";

suite("api", () => {
  test("API has correct base url", () => {
    assert.equal(mainApi.apiBaseUrl, "https://api.opensea.io");
    assert.equal(testnetApi.apiBaseUrl, "https://testnets-api.opensea.io");
  });

  test("Includes API key in request", async () => {
    const oldLogger = mainApi.logger;

    const logPromise = new Promise<void>((resolve, reject) => {
      mainApi.logger = (log) => {
        try {
          assert.include(log, `"X-API-KEY":"${MAINNET_API_KEY}"`);
          resolve();
        } catch (e) {
          reject(e);
        } finally {
          mainApi.logger = oldLogger;
        }
      };
      mainApi.getPaymentTokens({ symbol: "WETH" });
    });

    await logPromise;
  });

  test("API fetches fees for an asset", async () => {
    const asset = await mainApi.getAsset({
      tokenAddress: BAYC_CONTRACT_ADDRESS,
      tokenId: BAYC_TOKEN_ID,
    });
    assert.exists(asset);
    assert.equal(asset.tokenId, BAYC_TOKEN_ID);
  });

  test("API fetches assets", async () => {
    const { assets } = await mainApi.getAssets({
      asset_contract_address: BAYC_CONTRACT_ADDRESS,
      order_by: "sale_date",
    });
    assert.isArray(assets);
    const asset = assets[0];
    assert.exists(asset);
  });

  test("API handles errors", async () => {
    // 404 Not found for random token id
    try {
      await mainApi.get(`/asset/${BAYC_CONTRACT_ADDRESS}/202020202020`);
    } catch (error) {
      assert.include((error as Error).message, "Not found");
    }
  });
});
