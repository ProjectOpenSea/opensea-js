import { Seaport } from "@opensea/seaport-js"
import {
  CROSS_CHAIN_SEAPORT_V1_5_ADDRESS,
  CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
  ItemType,
} from "@opensea/seaport-js/lib/constants"
import { ethers } from "ethers"
import { describe, expect, test } from "vitest"
import {
  ALTERNATE_SEAPORT_V1_6_ADDRESS,
  SHARED_STOREFRONT_ADDRESSES,
  SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
} from "../../src/constants"
import { TokenStandard } from "../../src/types"
import {
  decodeTokenIds,
  getAssetItemType,
  getSeaportInstance,
  getSeaportVersion,
  isValidProtocol,
  remapSharedStorefrontAddress,
  requireValidProtocol,
} from "../../src/utils/protocol"

describe("Utils: protocol", () => {
  describe("isValidProtocol", () => {
    test("returns true for Seaport 1.6", () => {
      expect(isValidProtocol(CROSS_CHAIN_SEAPORT_V1_6_ADDRESS)).toBe(true)
    })

    test("returns true for alternate Seaport 1.6", () => {
      expect(isValidProtocol(ALTERNATE_SEAPORT_V1_6_ADDRESS)).toBe(true)
    })

    test("returns false for Seaport 1.5 (no longer supported)", () => {
      expect(isValidProtocol(CROSS_CHAIN_SEAPORT_V1_5_ADDRESS)).toBe(false)
    })

    test("returns false for random address", () => {
      const randomAddress = ethers.Wallet.createRandom().address
      expect(isValidProtocol(randomAddress)).toBe(false)
    })

    test("works with all forms of address (lowercase, checksum)", () => {
      const randomAddress = ethers.Wallet.createRandom().address

      // Mapping of [address, isValid]
      const addressesToCheck: [string, boolean][] = [
        [CROSS_CHAIN_SEAPORT_V1_6_ADDRESS, true],
        [ALTERNATE_SEAPORT_V1_6_ADDRESS, true],
        [CROSS_CHAIN_SEAPORT_V1_5_ADDRESS, false],
        [randomAddress, false],
      ]

      // Check default, lowercase, and checksum addresses
      const formatsToCheck = (address: string) => [
        address,
        address.toLowerCase(),
        ethers.getAddress(address),
      ]

      for (const [address, isValid] of addressesToCheck) {
        for (const formattedAddress of formatsToCheck(address)) {
          expect(isValidProtocol(formattedAddress)).toBe(isValid)
        }
      }
    })
  })

  describe("requireValidProtocol", () => {
    test("does not throw for valid protocol", () => {
      expect(() =>
        requireValidProtocol(CROSS_CHAIN_SEAPORT_V1_6_ADDRESS),
      ).not.toThrow()
    })

    test("throws for invalid protocol", () => {
      const randomAddress = ethers.Wallet.createRandom().address
      expect(() => requireValidProtocol(randomAddress)).toThrow(
        `Unsupported protocol address: ${randomAddress}`,
      )
    })

    test("throws for Seaport 1.5", () => {
      expect(() =>
        requireValidProtocol(CROSS_CHAIN_SEAPORT_V1_5_ADDRESS),
      ).toThrow("Unsupported protocol address")
    })
  })

  describe("getAssetItemType", () => {
    test("returns ERC20 ItemType for ERC20 token standard", () => {
      expect(getAssetItemType(TokenStandard.ERC20)).toBe(ItemType.ERC20)
    })

    test("returns ERC721 ItemType for ERC721 token standard", () => {
      expect(getAssetItemType(TokenStandard.ERC721)).toBe(ItemType.ERC721)
    })

    test("returns ERC1155 ItemType for ERC1155 token standard", () => {
      expect(getAssetItemType(TokenStandard.ERC1155)).toBe(ItemType.ERC1155)
    })

    test("throws for unknown token standard", () => {
      expect(() => getAssetItemType("UNKNOWN" as TokenStandard)).toThrow(
        "Unknown schema name: UNKNOWN",
      )
    })
  })

  describe("remapSharedStorefrontAddress", () => {
    test("returns checksummed lazy mint adapter address for shared storefront address", () => {
      for (const sharedStorefrontAddress of SHARED_STOREFRONT_ADDRESSES) {
        const result = remapSharedStorefrontAddress(sharedStorefrontAddress)
        expect(result).toBe(
          ethers.getAddress(
            SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
          ),
        )
      }
    })

    test("returns original address for non-shared storefront address", () => {
      const randomAddress = ethers.Wallet.createRandom().address
      const result = remapSharedStorefrontAddress(randomAddress)
      expect(result).toBe(randomAddress)
    })
  })

  describe("decodeTokenIds", () => {
    test("returns ['*'] when given '*' as input", () => {
      expect(decodeTokenIds("*")).toEqual(["*"])
    })

    test("returns [] when given empty string as input", () => {
      expect(decodeTokenIds("")).toEqual([])
    })

    test("correctly decodes a single number", () => {
      expect(decodeTokenIds("123")).toEqual(["123"])
    })

    test("correctly decodes multiple comma-separated numbers", () => {
      expect(decodeTokenIds("1,2,3,4")).toEqual(["1", "2", "3", "4"])
    })

    test("correctly decodes a range of numbers", () => {
      expect(decodeTokenIds("5:8")).toEqual(["5", "6", "7", "8"])
    })

    test("correctly decodes multiple ranges of numbers", () => {
      expect(decodeTokenIds("1:3,5:7")).toEqual(["1", "2", "3", "5", "6", "7"])
    })

    test("correctly decodes a mix of single numbers and ranges", () => {
      expect(decodeTokenIds("1,3:5,8")).toEqual(["1", "3", "4", "5", "8"])
    })

    test("handles very large numbers", () => {
      const largeNum = "999999999999999999999999999999"
      expect(decodeTokenIds(largeNum)).toEqual([largeNum])
    })

    test("handles range with very large numbers", () => {
      const result = decodeTokenIds(
        "999999999999999999999999999997:999999999999999999999999999999",
      )
      expect(result).toEqual([
        "999999999999999999999999999997",
        "999999999999999999999999999998",
        "999999999999999999999999999999",
      ])
    })

    test("throws error for invalid input format (letters)", () => {
      expect(() => decodeTokenIds("abc")).toThrow(
        "Invalid input format. Expected a valid comma-separated list of numbers and ranges.",
      )
    })

    test("throws error for invalid input format (mixed)", () => {
      expect(() => decodeTokenIds("1,2,abc")).toThrow("Invalid input format")
    })

    test("throws error for invalid range format (end < start)", () => {
      expect(() => decodeTokenIds("10:5")).toThrow(
        "Invalid range. End value: 5 must be greater than or equal to the start value: 10.",
      )
    })

    test("throws error for invalid range format (end = start - 1)", () => {
      expect(() => decodeTokenIds("5:4")).toThrow("Invalid range")
    })

    test("correctly decodes range where start = end", () => {
      expect(decodeTokenIds("5:5")).toEqual(["5"])
    })

    test("throws error for input with whitespace", () => {
      expect(() => decodeTokenIds(" 1,2,3")).toThrow(
        "whitespace is not allowed",
      )
      expect(() => decodeTokenIds("1 : 3")).toThrow("whitespace is not allowed")
      expect(() => decodeTokenIds("1, 2")).toThrow("whitespace is not allowed")
    })
  })

  describe("getSeaportInstance", () => {
    let mockSeaport: Seaport

    test("returns seaport for CROSS_CHAIN_SEAPORT_V1_6_ADDRESS", () => {
      const provider = new ethers.JsonRpcProvider()
      mockSeaport = new Seaport(provider)

      const result = getSeaportInstance(
        CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
        mockSeaport,
      )
      expect(result).toBe(mockSeaport)
    })

    test("returns seaport for ALTERNATE_SEAPORT_V1_6_ADDRESS", () => {
      const provider = new ethers.JsonRpcProvider()
      mockSeaport = new Seaport(provider)

      const result = getSeaportInstance(
        ALTERNATE_SEAPORT_V1_6_ADDRESS,
        mockSeaport,
      )
      expect(result).toBe(mockSeaport)
    })

    test("throws error for unsupported protocol address", () => {
      const provider = new ethers.JsonRpcProvider()
      mockSeaport = new Seaport(provider)
      const randomAddress = ethers.Wallet.createRandom().address

      expect(() => getSeaportInstance(randomAddress, mockSeaport)).toThrow(
        `Unsupported protocol address: ${randomAddress}`,
      )
    })

    test("works with lowercase address", () => {
      const provider = new ethers.JsonRpcProvider()
      mockSeaport = new Seaport(provider)

      const result = getSeaportInstance(
        CROSS_CHAIN_SEAPORT_V1_6_ADDRESS.toLowerCase(),
        mockSeaport,
      )
      expect(result).toBe(mockSeaport)
    })
  })

  describe("getSeaportVersion", () => {
    test("returns '1.6' for CROSS_CHAIN_SEAPORT_V1_6_ADDRESS", () => {
      expect(getSeaportVersion(CROSS_CHAIN_SEAPORT_V1_6_ADDRESS)).toBe("1.6")
    })

    test("returns '1.6' for ALTERNATE_SEAPORT_V1_6_ADDRESS", () => {
      expect(getSeaportVersion(ALTERNATE_SEAPORT_V1_6_ADDRESS)).toBe("1.6")
    })

    test("throws error for unsupported protocol address", () => {
      const randomAddress = ethers.Wallet.createRandom().address
      expect(() => getSeaportVersion(randomAddress)).toThrow(
        `Unsupported protocol address: ${randomAddress}`,
      )
    })

    test("throws error for Seaport 1.5", () => {
      expect(() => getSeaportVersion(CROSS_CHAIN_SEAPORT_V1_5_ADDRESS)).toThrow(
        "Unsupported protocol address",
      )
    })

    test("works with lowercase address", () => {
      expect(
        getSeaportVersion(CROSS_CHAIN_SEAPORT_V1_6_ADDRESS.toLowerCase()),
      ).toBe("1.6")
    })

    test("works with checksum address", () => {
      expect(
        getSeaportVersion(ethers.getAddress(CROSS_CHAIN_SEAPORT_V1_6_ADDRESS)),
      ).toBe("1.6")
    })
  })
})
