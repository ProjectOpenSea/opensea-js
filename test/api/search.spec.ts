import { describe, expect, test, vi } from "vitest"
import { SearchAPI } from "../../src/api/search"
import type {
  AccountSearchResult,
  CollectionSearchResult,
  NftSearchResult,
  SearchResponse,
  TokenSearchResult,
} from "../../src/api/types"
import { createMockFetcher } from "../fixtures/fetcher"

const mockCollectionResult: CollectionSearchResult = {
  collection: "bored-ape-yacht-club",
  name: "Bored Ape Yacht Club",
  image_url: "https://example.com/bayc.png",
  is_disabled: false,
  is_nsfw: false,
  opensea_url: "https://opensea.io/collection/bored-ape-yacht-club",
}

const mockTokenResult: TokenSearchResult = {
  address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  chain: "ethereum",
  name: "Wrapped Ether",
  symbol: "WETH",
  image_url: "https://example.com/weth.png",
  usd_price: "3500.00",
  decimals: 18,
  opensea_url:
    "https://opensea.io/token/ethereum/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
}

const mockNftResult: NftSearchResult = {
  identifier: "1234",
  collection: "bored-ape-yacht-club",
  contract: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
  name: "Bored Ape #1234",
  image_url: "https://example.com/ape1234.png",
  opensea_url:
    "https://opensea.io/assets/ethereum/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D/1234",
}

const mockAccountResult: AccountSearchResult = {
  address: "0x1234567890abcdef1234567890abcdef12345678",
  username: "testuser",
  profile_image_url: "https://example.com/avatar.png",
  opensea_url: "https://opensea.io/testuser",
}

describe("API: SearchAPI", () => {
  let mockGet: ReturnType<typeof vi.fn>
  let searchAPI: SearchAPI

  beforeEach(() => {
    const { fetcher, mockGet: getMock } = createMockFetcher()
    mockGet = getMock
    searchAPI = new SearchAPI(fetcher)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("search", () => {
    test("searches with query only", async () => {
      const mockResponse: SearchResponse = {
        results: [{ type: "collection", collection: mockCollectionResult }],
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await searchAPI.search({ query: "bored ape" })

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet.mock.calls[0][0]).toBe("/api/v2/search")
      expect(mockGet.mock.calls[0][1]).toEqual({
        query: "bored ape",
      })
      expect(result.results).toHaveLength(1)
      expect(result.results[0].type).toBe("collection")
      expect(result.results[0].collection?.name).toBe("Bored Ape Yacht Club")
    })

    test("searches with chain filter", async () => {
      const mockResponse: SearchResponse = { results: [] }
      mockGet.mockResolvedValue(mockResponse)

      await searchAPI.search({
        query: "test",
        chains: ["ethereum", "polygon"],
      })

      expect(mockGet.mock.calls[0][1]).toEqual({
        query: "test",
        chains: ["ethereum", "polygon"],
      })
    })

    test("searches with asset type filter", async () => {
      const mockResponse: SearchResponse = { results: [] }
      mockGet.mockResolvedValue(mockResponse)

      await searchAPI.search({
        query: "test",
        asset_types: ["collection", "nft"],
      })

      expect(mockGet.mock.calls[0][1]).toEqual({
        query: "test",
        asset_types: ["collection", "nft"],
      })
    })

    test("searches with limit", async () => {
      const mockResponse: SearchResponse = { results: [] }
      mockGet.mockResolvedValue(mockResponse)

      await searchAPI.search({ query: "test", limit: 10 })

      expect(mockGet.mock.calls[0][1]).toEqual({
        query: "test",
        limit: 10,
      })
    })

    test("searches with all parameters", async () => {
      const mockResponse: SearchResponse = { results: [] }
      mockGet.mockResolvedValue(mockResponse)

      await searchAPI.search({
        query: "ape",
        chains: ["ethereum"],
        asset_types: ["collection", "nft", "token", "account"],
        limit: 50,
      })

      expect(mockGet.mock.calls[0][1]).toEqual({
        query: "ape",
        chains: ["ethereum"],
        asset_types: ["collection", "nft", "token", "account"],
        limit: 50,
      })
    })

    test("returns mixed result types", async () => {
      const mockResponse: SearchResponse = {
        results: [
          { type: "collection", collection: mockCollectionResult },
          { type: "token", token: mockTokenResult },
          { type: "nft", nft: mockNftResult },
          { type: "account", account: mockAccountResult },
        ],
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await searchAPI.search({ query: "test" })

      expect(result.results).toHaveLength(4)
      expect(result.results[0].type).toBe("collection")
      expect(result.results[0].collection?.collection).toBe(
        "bored-ape-yacht-club",
      )
      expect(result.results[1].type).toBe("token")
      expect(result.results[1].token?.symbol).toBe("WETH")
      expect(result.results[2].type).toBe("nft")
      expect(result.results[2].nft?.identifier).toBe("1234")
      expect(result.results[3].type).toBe("account")
      expect(result.results[3].account?.username).toBe("testuser")
    })

    test("handles empty results", async () => {
      const mockResponse: SearchResponse = { results: [] }
      mockGet.mockResolvedValue(mockResponse)

      const result = await searchAPI.search({ query: "nonexistent" })

      expect(result.results).toEqual([])
    })

    test("handles account with null username", async () => {
      const mockResponse: SearchResponse = {
        results: [
          {
            type: "account",
            account: { ...mockAccountResult, username: null },
          },
        ],
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await searchAPI.search({ query: "0x1234" })

      expect(result.results[0].account?.username).toBeNull()
    })

    test("throws error on API failure", async () => {
      mockGet.mockRejectedValue(new Error("API Error"))

      try {
        await searchAPI.search({ query: "test" })
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("API Error")
      }
    })
  })

  describe("Constructor", () => {
    test("initializes with fetcher", () => {
      const { fetcher } = createMockFetcher()
      const api = new SearchAPI(fetcher)

      expect(api).toBeInstanceOf(SearchAPI)
    })
  })
})
