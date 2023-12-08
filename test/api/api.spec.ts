import { assert } from "chai";
import { suite, test } from "mocha";
import { Chain } from "../../src";
import { getWETHAddress } from "../../src/utils";
import {
  BAYC_CONTRACT_ADDRESS,
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
          assert.include(log, `"x-api-key":"${MAINNET_API_KEY}"`);
          resolve();
        } catch (e) {
          reject(e);
        } finally {
          mainAPI.logger = oldLogger;
        }
      };
      const wethAddress = getWETHAddress(Chain.Mainnet);
      mainAPI.getPaymentToken(wethAddress);
    });

    await logPromise;
  });

  test("API handles errors", async () => {
    // 404 Not found for random token id
    try {
      await mainAPI.getNFT(BAYC_CONTRACT_ADDRESS, "404040");
    } catch (error) {
      assert.include((error as Error).message, "not found");
    }
  });
});
