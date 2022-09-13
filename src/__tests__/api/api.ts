import { assert } from "chai";
import { suite, test } from "mocha";
import {
  apiToTest,
  TESTNET_ASSET_ADDRESS,
  TESTNET_SELLER_FEE,
  TESTNET_TOKEN_ID,
  mainApi,
  testnetApi,
  TESTNET_API_KEY,
  TESTNET_WALLET_ADDRESS,
} from "../constants";

suite("api", () => {
  test("API has correct base url", () => {
    assert.equal(mainApi.apiBaseUrl, "https://api.opensea.io");
    assert.equal(testnetApi.apiBaseUrl, "https://testnets-api.opensea.io");
  });

  test("Includes API key in token request", async () => {
    const oldLogger = testnetApi.logger;

    const logPromise = new Promise<void>((resolve, reject) => {
      testnetApi.logger = (log) => {
        try {
          assert.include(log, `"X-API-KEY":"${TESTNET_API_KEY}"`);
          resolve();
        } catch (e) {
          reject(e);
        } finally {
          testnetApi.logger = oldLogger;
        }
      };
      testnetApi.getPaymentTokens({ symbol: "WETH" });
    });

    await logPromise;
  });

  test("API fetches fees for an asset", async () => {
    const asset = await apiToTest.getAsset({
      tokenAddress: TESTNET_ASSET_ADDRESS,
      tokenId: TESTNET_TOKEN_ID,
    });
    assert.exists(asset);
    assert.equal(asset.tokenId, TESTNET_TOKEN_ID.toString());
    assert.equal(
      asset.collection.fees?.openseaFees.get(TESTNET_WALLET_ADDRESS),
      TESTNET_SELLER_FEE
    );
  });

  test("API fetches assets", async () => {
    const { assets } = await apiToTest.getAssets({
      asset_contract_address: TESTNET_ASSET_ADDRESS,
      order_by: "sale_date",
    });
    assert.isArray(assets);
    const asset = assets[0];
    assert.exists(asset);
  });

  test("API handles errors", async () => {
    // 401 Unauthorized
    try {
      await apiToTest.get("/user");
    } catch (error) {
      assert.include((error as Error).message, "Unauthorized");
    }

    // 404 Not found for random token id
    try {
      await apiToTest.get(`/asset/${TESTNET_ASSET_ADDRESS}/72`);
    } catch (error) {
      assert.include((error as Error).message, "Not found");
    }
  });
});
