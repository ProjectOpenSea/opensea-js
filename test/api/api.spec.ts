import { assert } from "chai";
import { suite, test } from "mocha";
import * as sinon from "sinon";
import { Chain, OpenSeaRateLimitError } from "../../src";
import { getOfferPaymentToken } from "../../src/utils";
import { BAYC_CONTRACT_ADDRESS } from "../utils/constants";
import { OPENSEA_API_KEY } from "../utils/env";
import { api } from "../utils/sdk";

suite("API", () => {
  let fetchStub: sinon.SinonStub | undefined;

  afterEach(() => {
    // Restore any stubs after each test
    if (fetchStub) {
      fetchStub.restore();
      fetchStub = undefined;
    }
  });

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

  test("API handles rate limit errors with retry-after", async function () {
    // Set longer timeout since this test involves retry delays
    this.timeout(10000);

    // Mock the _fetch method directly to simulate rate limit response followed by success
    const rateLimitError = new Error(
      "429 Too Many Requests",
    ) as OpenSeaRateLimitError;
    rateLimitError.retryAfter = 1; // Use 1 second to keep test fast
    rateLimitError.responseBody = { error: "Rate limited" };

    const successResponse = {
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      eth_price: "1",
      name: "Ether",
      symbol: "ETH",
      usd_price: "1800",
    };

    // First call fails with rate limit, second call succeeds
    fetchStub = sinon
      .stub(api as unknown as { _fetch: () => Promise<unknown> }, "_fetch")
      .onFirstCall()
      .rejects(rateLimitError)
      .onSecondCall()
      .resolves(successResponse);

    // This should auto-retry and eventually succeed
    const result = await api.getPaymentToken(
      "0x0000000000000000000000000000000000000000",
    );

    assert.equal(fetchStub.callCount, 2); // Should have retried once
    assert.equal(result.address, "0x0000000000000000000000000000000000000000");
  });

  test("API handles custom 599 rate limit errors with retry-after", async function () {
    // Set longer timeout since this test involves retry delays
    this.timeout(10000);

    // Mock the _fetch method to simulate 599 rate limit response followed by success
    const rateLimitError = new Error(
      "599 Network Connect Timeout Error",
    ) as OpenSeaRateLimitError;
    rateLimitError.retryAfter = 1; // Use 1 second to keep test fast
    rateLimitError.responseBody = { message: "Custom rate limit" };

    const successResponse = {
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      eth_price: "1",
      name: "Ether",
      symbol: "ETH",
      usd_price: "1800",
    };

    // First call fails with 599, second call succeeds
    fetchStub = sinon
      .stub(api as unknown as { _fetch: () => Promise<unknown> }, "_fetch")
      .onFirstCall()
      .rejects(rateLimitError)
      .onSecondCall()
      .resolves(successResponse);

    // This should auto-retry and eventually succeed
    const result = await api.getPaymentToken(
      "0x0000000000000000000000000000000000000000",
    );

    assert.equal(fetchStub.callCount, 2); // Should have retried once
    assert.equal(result.address, "0x0000000000000000000000000000000000000000");
  });

  test("API handles invalid retry-after header gracefully", async function () {
    // Set longer timeout since this test involves retry delays (exponential backoff)
    this.timeout(10000);

    // Test the robust header parsing by simulating an invalid retry-after header
    const rateLimitError = new Error(
      "429 Too Many Requests",
    ) as OpenSeaRateLimitError;
    rateLimitError.retryAfter = undefined; // Simulate invalid header parsing
    rateLimitError.responseBody = { error: "Rate limited" };

    const successResponse = {
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      eth_price: "1",
      name: "Ether",
      symbol: "ETH",
      usd_price: "1800",
    };

    // First call fails, second call succeeds (tests exponential backoff)
    fetchStub = sinon
      .stub(api as unknown as { _fetch: () => Promise<unknown> }, "_fetch")
      .onFirstCall()
      .rejects(rateLimitError)
      .onSecondCall()
      .resolves(successResponse);

    // This should auto-retry with exponential backoff and eventually succeed
    const result = await api.getPaymentToken(
      "0x0000000000000000000000000000000000000000",
    );

    assert.equal(fetchStub.callCount, 2); // Should have retried once
    assert.equal(result.address, "0x0000000000000000000000000000000000000000");
  });
});
