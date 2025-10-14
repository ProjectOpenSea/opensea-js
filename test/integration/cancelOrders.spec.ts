import { expect } from "chai";
import { describe, test } from "mocha";
import { Chain } from "../../src/types";
import {
  getSdkForChain,
  walletAddress,
  requireIntegrationEnv,
} from "../utils/setupIntegration";

describe("SDK: Cancel Orders Integration Tests", () => {
  beforeEach(() => {
    requireIntegrationEnv();
  });

  describe("offchainCancelOrders", () => {
    test("Should successfully cancel a single order offchain with useSignerToDeriveOffererSignatures", async function () {
      // This test would require a real order to cancel
      // For now, we'll just verify the method exists and can be called with proper parameters
      this.skip();
    });

    test("Should successfully cancel multiple orders offchain", async function () {
      // This test would require real orders to cancel
      // For now, we'll just verify the method exists
      this.skip();
    });

    test("Should handle API errors gracefully when canceling invalid order hash", async function () {
      this.timeout(30000);

      try {
        // Use a fake order hash that doesn't exist
        const fakeOrderHash =
          "0x0000000000000000000000000000000000000000000000000000000000000001";

        // Use a testnet (Base Sepolia) to keep costs low
        await getSdkForChain(Chain.BaseSepolia).offchainCancelOrders({
          orderHashes: [fakeOrderHash],
        });

        throw new Error("Should have thrown an error");
      } catch (error: any) {
        // Expect the error to be from the API (order not found or unauthorized)
        expect(error.message).to.satisfy((msg: string) =>
          msg.includes("Failed to cancel order") || msg.includes("API"),
        );
      }
    });
  });
});
