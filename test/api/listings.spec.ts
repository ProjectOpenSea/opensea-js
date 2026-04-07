import { describe, expect, test, vi } from "vitest"
import { ListingsAPI } from "../../src/api/listings"
import type {
  GetBestListingResponse,
  GetListingsResponse,
  Listing,
} from "../../src/api/types"
import type { OrderV2 } from "../../src/orders/types"
import { Chain } from "../../src/types"
import { createMockFetcher } from "../fixtures/fetcher"

describe("API: ListingsAPI", () => {
  let mockGet: ReturnType<typeof vi.fn>
  let listingsAPI: ListingsAPI

  beforeEach(() => {
    const { fetcher, mockGet: getMock } = createMockFetcher()
    mockGet = getMock
    listingsAPI = new ListingsAPI(fetcher, Chain.Mainnet)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("getAllListings", () => {
    test("fetches all listings for a collection without parameters", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [
          {
            order_hash: "0x123",
            chain: Chain.Mainnet,
            type: "basic",
            price: {
              current: {
                currency: "ETH",
                decimals: 18,
                value: "1000000000000000000",
              },
            },
            protocol_data: {} as unknown as OrderV2,
            protocol_address: "0xabc",
          } as unknown as Listing,
        ],
        next: "cursor-123",
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await listingsAPI.getAllListings("test-collection")

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet.mock.calls[0][0]).toBe(
        "/api/v2/listings/collection/test-collection/all",
      )
      expect(mockGet.mock.calls[0][1]).toEqual({
        limit: undefined,
        next: undefined,
      })
      expect(result.listings).toHaveLength(1)
      expect(result.next).toBe("cursor-123")
    })

    test("fetches all listings with limit parameter", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      await listingsAPI.getAllListings("test-collection", 50)

      expect(mockGet.mock.calls[0][1]).toEqual({
        limit: 50,
        next: undefined,
      })
    })

    test("fetches all listings with pagination cursor", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: "cursor-456",
      }

      mockGet.mockResolvedValue(mockResponse)

      await listingsAPI.getAllListings(
        "test-collection",
        undefined,
        "cursor-123",
      )

      expect(mockGet.mock.calls[0][1]).toEqual({
        limit: undefined,
        next: "cursor-123",
      })
    })

    test("fetches all listings with both limit and pagination", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      await listingsAPI.getAllListings("test-collection", 25, "cursor-xyz")

      expect(mockGet.mock.calls[0][1]).toEqual({
        limit: 25,
        next: "cursor-xyz",
      })
    })

    test("handles collection slug with special characters", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      await listingsAPI.getAllListings("collection-name-123")

      expect(mockGet.mock.calls[0][0]).toBe(
        "/api/v2/listings/collection/collection-name-123/all",
      )
    })

    test("handles empty listings array", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await listingsAPI.getAllListings("test-collection")

      expect(result.listings).toEqual([])
    })

    test("handles multiple listings in response", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [
          { order_hash: "0x1" } as unknown as Listing,
          { order_hash: "0x2" } as unknown as Listing,
          { order_hash: "0x3" } as unknown as Listing,
        ],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await listingsAPI.getAllListings("test-collection")

      expect(result.listings).toHaveLength(3)
    })

    test("throws error on API failure", async () => {
      mockGet.mockRejectedValue(new Error("API Error"))

      try {
        await listingsAPI.getAllListings("test-collection")
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("API Error")
      }
    })

    test("throws error when collection not found", async () => {
      mockGet.mockRejectedValue(new Error("Collection not found"))

      try {
        await listingsAPI.getAllListings("nonexistent-collection")
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Collection not found")
      }
    })
  })

  describe("getBestListing", () => {
    test("fetches best listing for a token with string tokenId", async () => {
      const mockResponse: GetBestListingResponse = {
        order_hash: "0xabc123",
        chain: Chain.Mainnet,
        type: "basic",
        price: {
          current: {
            currency: "ETH",
            decimals: 18,
            value: "1500000000000000000",
          },
        },
        protocol_data: {} as unknown as OrderV2,
        protocol_address: "0xdef456",
      } as unknown as Listing

      mockGet.mockResolvedValue(mockResponse)

      const result = await listingsAPI.getBestListing("test-collection", "1234")

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet.mock.calls[0][0]).toBe(
        "/api/v2/listings/collection/test-collection/nfts/1234/best",
      )
      expect(mockGet.mock.calls[0][1]).toBeUndefined()
      expect(result.order_hash).toBe("0xabc123")
    })

    test("fetches best listing for a token with number tokenId", async () => {
      const mockResponse: GetBestListingResponse = {
        order_hash: "0xdef",
      } as unknown as Listing

      mockGet.mockResolvedValue(mockResponse)

      await listingsAPI.getBestListing("test-collection", 5678)

      expect(mockGet.mock.calls[0][0]).toBe(
        "/api/v2/listings/collection/test-collection/nfts/5678/best",
      )
    })

    test("handles large token IDs", async () => {
      const mockResponse: GetBestListingResponse = {
        order_hash: "0x123",
      } as unknown as Listing

      mockGet.mockResolvedValue(mockResponse)

      const largeTokenId = "99999999999999999999"
      await listingsAPI.getBestListing("test-collection", largeTokenId)

      expect(mockGet.mock.calls[0][0]).toContain(largeTokenId)
    })

    test("handles collection slug with special characters", async () => {
      const mockResponse: GetBestListingResponse = {
        order_hash: "0x456",
      } as unknown as Listing

      mockGet.mockResolvedValue(mockResponse)

      await listingsAPI.getBestListing("my-collection-v2", "100")

      expect(mockGet.mock.calls[0][0]).toBe(
        "/api/v2/listings/collection/my-collection-v2/nfts/100/best",
      )
    })

    test("throws error when no listing found", async () => {
      mockGet.mockRejectedValue(new Error("No listing found"))

      try {
        await listingsAPI.getBestListing("test-collection", "999")
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("No listing found")
      }
    })

    test("throws error on API failure", async () => {
      mockGet.mockRejectedValue(new Error("Server Error"))

      try {
        await listingsAPI.getBestListing("test-collection", "123")
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Server Error")
      }
    })
  })

  describe("getBestListings", () => {
    test("fetches best listings for a collection without parameters", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [
          {
            order_hash: "0x111",
            price: {
              current: {
                value: "1000000000000000000",
              },
            },
          } as unknown as Listing,
          {
            order_hash: "0x222",
            price: {
              current: {
                value: "1100000000000000000",
              },
            },
          } as unknown as Listing,
        ],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await listingsAPI.getBestListings("test-collection")

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet.mock.calls[0][0]).toBe(
        "/api/v2/listings/collection/test-collection/best",
      )
      expect(mockGet.mock.calls[0][1]).toEqual({
        limit: undefined,
        next: undefined,
      })
      expect(result.listings).toHaveLength(2)
    })

    test("fetches best listings with limit parameter", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      await listingsAPI.getBestListings("test-collection", 10)

      expect(mockGet.mock.calls[0][1]).toEqual({
        limit: 10,
        next: undefined,
      })
    })

    test("fetches best listings with pagination cursor", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: "cursor-next",
      }

      mockGet.mockResolvedValue(mockResponse)

      await listingsAPI.getBestListings(
        "test-collection",
        undefined,
        "cursor-prev",
      )

      expect(mockGet.mock.calls[0][1]).toEqual({
        limit: undefined,
        next: "cursor-prev",
      })
    })

    test("fetches best listings with both limit and pagination", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      await listingsAPI.getBestListings("test-collection", 20, "cursor-abc")

      expect(mockGet.mock.calls[0][1]).toEqual({
        limit: 20,
        next: "cursor-abc",
      })
    })

    test("handles collection slug with dashes", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      await listingsAPI.getBestListings("my-awesome-collection")

      expect(mockGet.mock.calls[0][0]).toBe(
        "/api/v2/listings/collection/my-awesome-collection/best",
      )
    })

    test("handles empty listings array", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await listingsAPI.getBestListings("test-collection")

      expect(result.listings).toEqual([])
    })

    test("handles response with pagination cursor", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [{ order_hash: "0x1" } as unknown as Listing],
        next: "next-cursor-value",
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await listingsAPI.getBestListings("test-collection")

      expect(result.next).toBe("next-cursor-value")
    })

    test("throws error on API failure", async () => {
      mockGet.mockRejectedValue(new Error("API Error"))

      try {
        await listingsAPI.getBestListings("test-collection")
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("API Error")
      }
    })

    test("throws error when collection not found", async () => {
      mockGet.mockRejectedValue(new Error("Collection not found"))

      try {
        await listingsAPI.getBestListings("nonexistent-collection")
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Collection not found")
      }
    })
  })

  describe("getNFTListings", () => {
    test("fetches listings for a specific NFT", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [
          {
            order_hash: "0xabc123",
            chain: Chain.Mainnet,
            type: "basic",
            price: {
              current: {
                currency: "ETH",
                decimals: 18,
                value: "1000000000000000000",
              },
            },
            protocol_data: {} as unknown as OrderV2,
            protocol_address: "0xprotocol",
          } as unknown as Listing,
        ],
        next: "cursor-123",
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await listingsAPI.getNFTListings(
        "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
        "1",
      )

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet.mock.calls[0][0]).toBe(
        "/api/v2/orders/ethereum/seaport/listings",
      )
      expect(mockGet.mock.calls[0][1]).toMatchObject({
        asset_contract_address: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
        token_ids: ["1"],
      })
      expect(result.listings).toHaveLength(1)
      expect(result.listings[0].order_hash).toBe("0xabc123")
      expect(result.next).toBe("cursor-123")
    })

    test("fetches listings with limit parameter", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      await listingsAPI.getNFTListings("0xContract", "100", 50)

      expect(mockGet.mock.calls[0][1]).toMatchObject({
        asset_contract_address: "0xContract",
        token_ids: ["100"],
        limit: 50,
      })
    })

    test("fetches listings with pagination cursor", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [
          {
            order_hash: "0xdef456",
          } as unknown as Listing,
        ],
        next: "cursor-next",
      }

      mockGet.mockResolvedValue(mockResponse)

      await listingsAPI.getNFTListings(
        "0xContract",
        "200",
        undefined,
        "cursor-prev",
      )

      expect(mockGet.mock.calls[0][1]).toMatchObject({
        asset_contract_address: "0xContract",
        token_ids: ["200"],
        cursor: "cursor-prev",
      })
    })

    test("fetches listings with custom chain parameter", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      await listingsAPI.getNFTListings(
        "0xContract",
        "1",
        undefined,
        undefined,
        Chain.Polygon,
      )

      expect(mockGet.mock.calls[0][0]).toBe(
        "/api/v2/orders/polygon/seaport/listings",
      )
    })

    test("fetches listings with all parameters", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [
          { order_hash: "0x111" } as unknown as Listing,
          { order_hash: "0x222" } as unknown as Listing,
        ],
        next: "cursor-abc",
      }

      mockGet.mockResolvedValue(mockResponse)

      await listingsAPI.getNFTListings(
        "0xContract",
        "999",
        20,
        "cursor-xyz",
        Chain.Arbitrum,
      )

      expect(mockGet.mock.calls[0][0]).toBe(
        "/api/v2/orders/arbitrum/seaport/listings",
      )
      expect(mockGet.mock.calls[0][1]).toMatchObject({
        asset_contract_address: "0xContract",
        token_ids: ["999"],
        limit: 20,
        cursor: "cursor-xyz",
      })
    })

    test("handles empty listings array", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await listingsAPI.getNFTListings("0xContract", "1")

      expect(result.listings).toEqual([])
    })

    test("handles large token IDs", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      const largeTokenId = "999999999999999999999999"
      await listingsAPI.getNFTListings("0xContract", largeTokenId)

      expect(mockGet.mock.calls[0][1]).toMatchObject({
        token_ids: [largeTokenId],
      })
    })

    test("throws error on API failure", async () => {
      mockGet.mockRejectedValue(new Error("API Error"))

      try {
        await listingsAPI.getNFTListings("0xContract", "1")
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("API Error")
      }
    })
  })

  describe("Constructor", () => {
    test("initializes with get function and chain", () => {
      const { fetcher } = createMockFetcher()
      const api = new ListingsAPI(fetcher, Chain.Mainnet)

      expect(api).toBeInstanceOf(ListingsAPI)
    })
  })

  describe("remaining_quantity field", () => {
    test("getBestListing includes remaining_quantity in response", async () => {
      const mockResponse: GetBestListingResponse = {
        order_hash: "0xabc123",
        chain: Chain.Mainnet,
        type: "basic",
        price: {
          current: {
            currency: "ETH",
            decimals: 18,
            value: "1500000000000000000",
          },
        },
        protocol_data: {} as unknown as OrderV2,
        protocol_address: "0xdef456",
        remaining_quantity: 1,
      } as unknown as Listing

      mockGet.mockResolvedValue(mockResponse)

      const result = await listingsAPI.getBestListing("test-collection", "1234")

      expect(result.remaining_quantity).toBe(1)
    })

    test("getAllListings includes remaining_quantity for each listing", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [
          {
            order_hash: "0x111",
            remaining_quantity: 1,
          } as unknown as Listing,
          {
            order_hash: "0x222",
            remaining_quantity: 5,
          } as unknown as Listing,
        ],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await listingsAPI.getAllListings("test-collection")

      expect(result.listings[0].remaining_quantity).toBe(1)
      expect(result.listings[1].remaining_quantity).toBe(5)
    })

    test("getBestListings includes remaining_quantity for partially filled orders", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [
          {
            order_hash: "0x333",
            remaining_quantity: 3,
          } as unknown as Listing,
        ],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await listingsAPI.getBestListings("test-collection")

      expect(result.listings[0].remaining_quantity).toBe(3)
    })
  })
})
