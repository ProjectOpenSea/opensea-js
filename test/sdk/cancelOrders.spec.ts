import { OrderComponents } from "@opensea/seaport-js/lib/types";
import { expect } from "chai";
import { ethers } from "ethers";
import { suite, test } from "mocha";
import { OrderV2 } from "../../src/orders/types";
import { DEFAULT_SEAPORT_CONTRACT_ADDRESS } from "../../src/orders/utils";
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
    } catch (e) {
      expect((e as Error).message).to.include(
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
    } catch (e) {
      expect((e as Error).message).to.include(
        "At least one order must be provided",
      );
    }
  });

  test("Should throw an error when orderHashes array is empty", async () => {
    try {
      await sdk.cancelOrders({
        orderHashes: [],
        accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e) {
      expect((e as Error).message).to.include(
        "At least one order hash must be provided",
      );
    }
  });

  test("Should attempt to fetch orders from API when using orderHashes", async () => {
    try {
      await sdk.cancelOrders({
        orderHashes: ["0x123"],
        accountAddress,
        protocolAddress: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
      });
      throw new Error("should have thrown");
    } catch (e) {
      // Should fail when trying to fetch the order from the API
      // Either "Not found" or network error depending on the API state
      expect((e as Error).message).to.satisfy(
        (msg: string) =>
          msg.includes("Not found") ||
          msg.includes("Server Error") ||
          msg.includes("Unauthorized") ||
          msg.includes("accountAddress is not available"),
      );
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    try {
      await sdk.cancelOrders({
        orders: [mockOrderV2],
        accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e) {
      // Should fail when checking wallet availability
      // Either proper wallet check error or RPC auth error if provider is misconfigured
      expect((e as Error).message).to.satisfy(
        (msg: string) =>
          msg.includes("accountAddress is not available") ||
          msg.includes("Unauthorized") ||
          msg.includes("Must be authenticated"),
      );
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
    } catch (e) {
      // We expect it to fail on wallet check, not on input validation
      // Either proper wallet check error or RPC auth error if provider is misconfigured
      expect((e as Error).message).to.satisfy(
        (msg: string) =>
          msg.includes("accountAddress is not available") ||
          msg.includes("Unauthorized") ||
          msg.includes("Must be authenticated"),
      );
    }
  });
});

suite("SDK: cancelOrder (singular)", () => {
  const wallet = ethers.Wallet.createRandom();
  const accountAddress = wallet.address;

  test("Should throw an error when neither order nor orderHash is provided", async () => {
    try {
      await sdk.cancelOrder({
        accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e) {
      expect((e as Error).message).to.include(
        "Either order or orderHash must be provided",
      );
    }
  });

  test("Should attempt to fetch order from API when using orderHash", async () => {
    try {
      await sdk.cancelOrder({
        orderHash: "0x123",
        accountAddress,
        protocolAddress: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
      });
      throw new Error("should have thrown");
    } catch (e) {
      // Should fail when trying to fetch the order from the API
      // Either "Not found" or network error depending on the API state
      expect((e as Error).message).to.satisfy(
        (msg: string) =>
          msg.includes("Not found") ||
          msg.includes("Server Error") ||
          msg.includes("Unauthorized") ||
          msg.includes("accountAddress is not available"),
      );
    }
  });

  test("Should throw an error when using cancelOrder with OrderV2 without wallet", async () => {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    try {
      await sdk.cancelOrder({
        order: mockOrderV2,
        accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e) {
      // Should fail when checking wallet availability
      // Either proper wallet check error or RPC auth error if provider is misconfigured
      expect((e as Error).message).to.satisfy(
        (msg: string) =>
          msg.includes("accountAddress is not available") ||
          msg.includes("Unauthorized") ||
          msg.includes("Must be authenticated"),
      );
    }
  });
});
