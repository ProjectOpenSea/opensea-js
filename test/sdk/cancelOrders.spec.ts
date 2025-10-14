import { expect } from "chai";
import { ethers } from "ethers";
import { suite, test } from "mocha";
import { DEFAULT_SEAPORT_CONTRACT_ADDRESS } from "../../src/orders/utils";
import { OrderV2, OrderComponents } from "../../src/orders/types";
import { sdk } from "../utils/sdk";

suite("SDK: cancelOrders", () => {
  const wallet = ethers.Wallet.createRandom();
  const accountAddress = wallet.address;

  test("Should throw an error when neither orders nor orderHashes is provided", async () => {
    try {
      await sdk.cancelOrders({
        accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(
        "Either orders or orderHashes must be provided",
      );
    }
  });

  test("Should throw an error when orders array is empty", async () => {
    try {
      await sdk.cancelOrders({
        orders: [],
        accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include("At least one order must be provided");
    }
  });

  test("Should throw an error when orderHashes array is empty", async () => {
    try {
      await sdk.cancelOrders({
        orderHashes: [],
        accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include("At least one order hash must be provided");
    }
  });

  test("Should throw an error when using orderHashes (onchain cancellation requires full order data)", async () => {
    try {
      await sdk.cancelOrders({
        orderHashes: ["0x123"],
        accountAddress,
        protocolAddress: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(
        "Onchain order cancellation requires full order data",
      );
      expect(e.message).to.include("offchainCancelOrder");
    }
  });

  test("Should throw an error when using cancelOrders without wallet", async () => {
    const mockOrderV2: OrderV2 = {
      orderHash: "0x123",
      chain: "ethereum",
      type: "basic",
      price: {
        current: {
          currency: "0x0000000000000000000000000000000000000000",
          decimals: 18,
          value: "1000000000000000000",
        },
      },
      protocolAddress: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
      protocolData: {
        parameters: {
          offerer: "0x0000000000000000000000000000000000000001",
          zone: "0x0000000000000000000000000000000000000000",
          offer: [],
          consideration: [],
          orderType: 0,
          startTime: "0",
          endTime: "0",
          zoneHash:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          salt: "0",
          conduitKey:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          totalOriginalConsiderationItems: 0,
          counter: 0,
        },
        signature: "0x",
      },
    } as any;

    const expectedErrorMessage = `Specified accountAddress is not available through wallet or provider: ${accountAddress}`;

    try {
      await sdk.cancelOrders({
        orders: [mockOrderV2],
        accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }
  });

  test("Should accept OrderComponents directly", async () => {
    const mockOrderComponents: OrderComponents = {
      offerer: "0x0000000000000000000000000000000000000001",
      zone: "0x0000000000000000000000000000000000000000",
      offer: [],
      consideration: [],
      orderType: 0,
      startTime: "0",
      endTime: "0",
      zoneHash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      salt: "0",
      conduitKey:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      totalOriginalConsiderationItems: 0,
      counter: 0,
    };

    try {
      await sdk.cancelOrders({
        orders: [mockOrderComponents],
        accountAddress,
      });
      throw new Error("should have thrown wallet error");
    } catch (e: any) {
      // We expect it to fail on wallet check, not on input validation
      expect(e.message).to.include("accountAddress is not available");
    }
  });
});
