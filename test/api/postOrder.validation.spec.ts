import { describe, expect, test } from "vitest"
import { OpenSeaAPI } from "../../src/api/api"
import type { OrderAPIOptions } from "../../src/orders/types"
import { Chain, OrderSide } from "../../src/types"

describe("API: postOrder validation", () => {
  const api = new OpenSeaAPI({ chain: Chain.Mainnet })
  const mockOrder: any = {
    parameters: {
      offerer: "0x1234567890123456789012345678901234567890",
      zone: "0x1234567890123456789012345678901234567890",
      orderType: 0,
      startTime: "1234567890",
      endTime: "9876543210",
      zoneHash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      salt: "1234567890",
      offer: [],
      consideration: [],
      totalOriginalConsiderationItems: 0,
      conduitKey:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
    signature: "0x",
  }

  test("should throw error when side is missing", async () => {
    const apiOptions = {
      protocolAddress: "0x1234567890123456789012345678901234567890",
    }

    try {
      await api.postOrder(mockOrder, apiOptions as OrderAPIOptions)
      throw new Error("Should have thrown an error")
    } catch (error: any) {
      expect(error.message).toBe("apiOptions.side is required")
    }
  })

  test("should throw error when protocolAddress is missing", async () => {
    const apiOptions = {
      side: OrderSide.LISTING,
    }

    try {
      await api.postOrder(mockOrder, apiOptions as OrderAPIOptions)
      throw new Error("Should have thrown an error")
    } catch (error: any) {
      expect(error.message).toBe("apiOptions.protocolAddress is required")
    }
  })

  test("should throw error when order is missing", async () => {
    const apiOptions = {
      side: OrderSide.LISTING,
      protocolAddress: "0x1234567890123456789012345678901234567890",
    } as OrderAPIOptions

    try {
      await api.postOrder(null as any, apiOptions)
      throw new Error("Should have thrown an error")
    } catch (error: any) {
      expect(error.message).toBe("order data is required")
    }
  })

  test("should throw error for unsupported protocol", async () => {
    const apiOptions = {
      protocol: "unsupported" as "seaport",
      side: OrderSide.LISTING,
      protocolAddress: "0x1234567890123456789012345678901234567890",
    }

    try {
      await api.postOrder(mockOrder, apiOptions)
      throw new Error("Should have thrown an error")
    } catch (error: any) {
      expect(error.message).toBe(
        "Currently only 'seaport' protocol is supported",
      )
    }
  })

  test("should throw error for invalid side value", async () => {
    const apiOptions = {
      side: "invalid_side" as OrderSide,
      protocolAddress: "0x1234567890123456789012345678901234567890",
    }

    try {
      await api.postOrder(mockOrder, apiOptions)
      throw new Error("Should have thrown an error")
    } catch (error: any) {
      expect(error.message).toBe("side must be either 'ask' or 'bid'")
    }
  })

  test("should throw error for invalid protocol address format", async () => {
    const apiOptions = {
      side: OrderSide.LISTING,
      protocolAddress: "invalid_address",
    } as OrderAPIOptions

    try {
      await api.postOrder(mockOrder, apiOptions)
      throw new Error("Should have thrown an error")
    } catch (error: any) {
      expect(error.message).toBe("Invalid protocol address format")
    }
  })
})
