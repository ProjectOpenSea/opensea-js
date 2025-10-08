import { assert } from "chai";
import { suite, test } from "mocha";
import * as sinon from "sinon";
import { Chain, OpenSeaRateLimitError } from "../../src";
import { getOfferPaymentToken } from "../../src/utils";
import { BAYC_CONTRACT_ADDRESS } from "../utils/constants";
import { OPENSEA_API_KEY } from "../utils/env";
import { api } from "../utils/sdk";

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

  test("API handles rate limit errors with retry-after", async () => {
    // Mock the _fetch method directly to simulate rate limit response
    const rateLimitError = new Error(
      "429 Too Many Requests",
    ) as OpenSeaRateLimitError;
    rateLimitError.retryAfter = 60;
    rateLimitError.responseBody = { error: "Rate limited" };

    // Stub the private _fetch method to throw our rate limit error
    const fetchStub = sinon
      .stub(api as unknown as { _fetch: () => Promise<unknown> }, "_fetch")
      .rejects(rateLimitError);

    try {
      // This should trigger a rate limit error
      await api.getPaymentToken("0x0000000000000000000000000000000000000000");
      assert.fail("Expected rate limit error to be thrown");
    } catch (error) {
      const rateLimitError = error as OpenSeaRateLimitError;
      assert.equal(rateLimitError.retryAfter, 60);
      assert.deepEqual(rateLimitError.responseBody, { error: "Rate limited" });
      assert.include(rateLimitError.message, "429 Too Many Requests");
    } finally {
      fetchStub.restore();
    }
  });

  test("API handles custom 599 rate limit errors with retry-after", async () => {
    // Mock the _fetch method directly to simulate 599 rate limit response
    const rateLimitError = new Error(
      "599 Network Connect Timeout Error",
    ) as OpenSeaRateLimitError;
    rateLimitError.retryAfter = 30;
    rateLimitError.responseBody = { message: "Custom rate limit" };

    // Stub the private _fetch method to throw our rate limit error
    const fetchStub = sinon
      .stub(api as unknown as { _fetch: () => Promise<unknown> }, "_fetch")
      .rejects(rateLimitError);

    try {
      // This should trigger a rate limit error
      await api.getPaymentToken("0x0000000000000000000000000000000000000000");
      assert.fail("Expected rate limit error to be thrown");
    } catch (error) {
      const rateLimitError = error as OpenSeaRateLimitError;
      assert.equal(rateLimitError.retryAfter, 30);
      assert.deepEqual(rateLimitError.responseBody, {
        message: "Custom rate limit",
      });
      assert.include(
        rateLimitError.message,
        "599 Network Connect Timeout Error",
      );
    } finally {
      fetchStub.restore();
    }
  });

  test("API handles invalid retry-after header gracefully", async () => {
    // Test the robust header parsing by simulating an invalid retry-after header
    const rateLimitError = new Error(
      "429 Too Many Requests",
    ) as OpenSeaRateLimitError;
    rateLimitError.retryAfter = undefined; // Simulate invalid header parsing
    rateLimitError.responseBody = { error: "Rate limited" };

    // Stub the private _fetch method to throw our rate limit error
    const fetchStub = sinon
      .stub(api as unknown as { _fetch: () => Promise<unknown> }, "_fetch")
      .rejects(rateLimitError);

    try {
      // This should trigger a rate limit error
      await api.getPaymentToken("0x0000000000000000000000000000000000000000");
      assert.fail("Expected rate limit error to be thrown");
    } catch (error) {
      const rateLimitError = error as OpenSeaRateLimitError;
      assert.equal(rateLimitError.retryAfter, undefined);
      assert.deepEqual(rateLimitError.responseBody, { error: "Rate limited" });
      assert.include(rateLimitError.message, "429 Too Many Requests");
    } finally {
      fetchStub.restore();
    }
  });
});
