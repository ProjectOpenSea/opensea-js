import { assert } from "chai";
import { suite, test } from "mocha";
import {
  BAYC_CONTRACT_ADDRESS,
  BAYC_TOKEN_ID,
  mainAPI,
  MAINNET_API_KEY,
  testnetAPI,
} from "../utils/constants";

suite("API", () => {
  test("API has correct base url", () => {
    assert.equal(mainAPI.apiBaseUrl, "https://api.opensea.io");
    assert.equal(testnetAPI.apiBaseUrl, "https://testnets-api.opensea.io");
  });

  test("Includes API key in request", async () => {
    const oldLogger = mainAPI.logger;

    const logPromise = new Promise<void>((resolve, reject) => {
      mainAPI.logger = (log) => {
        try {
          assert.include(log, `"X-API-KEY":"${MAINNET_API_KEY}"`);
          resolve();
        } catch (e) {
          reject(e);
        } finally {
          mainAPI.logger = oldLogger;
        }
      };
      mainAPI.getPaymentTokens({ symbol: "WETH" });
    });

    await logPromise;
  });

  test("API fetches fees for an asset", async () => {
    const asset = await mainAPI.getAsset({
      tokenAddress: BAYC_CONTRACT_ADDRESS,
      tokenId: BAYC_TOKEN_ID,
    });
    assert.exists(asset);
    assert.equal(asset.tokenId, BAYC_TOKEN_ID);
  });

  test("API fetches assets", async () => {
    const { assets } = await mainAPI.getAssets({
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
      await mainAPI.get(`/asset/${BAYC_CONTRACT_ADDRESS}/202020202020`);
    } catch (error) {
      assert.include((error as Error).message, "Not found");
    }
  });
});
