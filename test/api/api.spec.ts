import { assert } from "chai";
import { suite, test } from "mocha";
import { Chain } from "../../src";
import { getOfferPaymentToken } from "../../src/utils";
import {
  BAYC_CONTRACT_ADDRESS,
  api,
  OPENSEA_API_KEY,
} from "../utils/constants";

suite("API", () => {
  test("API has correct base url", () => {
    assert.equal(api.apiBaseUrl, "https://api.opensea.io");
  });

  test("Includes API key in request", async () => {
    const oldLogger = api.logger;

    const logPromise = new Promise<void>((resolve, reject) => {
      api.logger = (log) => {
        try {
          assert.include(log, `"x-api-key":"${OPENSEA_API_KEY}"`);
          resolve();
        } catch (e) {
          reject(e);
        } finally {
          api.logger = oldLogger;
        }
      };
      const offerPaymentToken = getOfferPaymentToken(Chain.Mainnet);
      api.getPaymentToken(offerPaymentToken);
    });

    await logPromise;
  });

  test("API handles errors", async () => {
    // 404 Not found for random token id
    try {
      await api.getNFT(BAYC_CONTRACT_ADDRESS, "404040");
    } catch (error) {
      assert.include((error as Error).message, "not found");
    }
  });
});
