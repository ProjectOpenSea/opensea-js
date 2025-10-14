import { assert, expect } from "chai";
import { ethers } from "ethers";
import { suite, test } from "mocha";
import { sdk } from "../utils/sdk";

suite("SDK: offchainCancelOrders", () => {
  test("Should throw an error when no order hashes are provided", async () => {
    try {
      await sdk.offchainCancelOrders({
        orderHashes: [],
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include("At least one order hash must be provided");
    }
  });

  test("Should throw an error when offererSignatures length doesn't match orderHashes length", async () => {
    try {
      await sdk.offchainCancelOrders({
        orderHashes: ["0x123", "0x456"],
        offererSignatures: ["0xabc"],
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(
        "offererSignatures array must have the same length as orderHashes array",
      );
    }
  });
});
