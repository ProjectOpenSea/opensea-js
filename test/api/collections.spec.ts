import { describe, expect, test, vi } from "vitest"
import { CollectionsAPI } from "../../src/api/collections"
import {
  CollectionOrderByOption,
  type GetCollectionResponse,
  type GetCollectionsResponse,
  type GetTraitsResponse,
} from "../../src/api/types"
import {
  Chain,
  type OpenSeaCollection,
  type OpenSeaCollectionStats,
} from "../../src/types"
import { createMockFetcher } from "../fixtures/fetcher"

describe("API: CollectionsAPI", () => {
  let mockGet: ReturnType<typeof vi.fn>
  let collectionsAPI: CollectionsAPI

  beforeEach(() => {
    const { fetcher, mockGet: getMock } = createMockFetcher()
    mockGet = getMock
    collectionsAPI = new CollectionsAPI(fetcher)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("getCollection", () => {
    test("fetches a single collection by slug", async () => {
      const mockResponse: GetCollectionResponse = {
        collection: "test-collection",
        name: "Test Collection",
        description: "A test collection",
        image_url: "https://example.com/image.png",
        banner_image_url: "https://example.com/banner.png",
        owner: "0x1234567890123456789012345678901234567890",
        safelist_status: "verified",
        category: "art",
        is_disabled: false,
        is_nsfw: false,
        trait_offers_enabled: true,
        collection_offers_enabled: true,
        opensea_url: "https://opensea.io/collection/test-collection",
        project_url: "https://example.com",
        wiki_url: "https://wiki.example.com",
        discord_url: "https://discord.gg/example",
        telegram_url: "https://t.me/example",
        twitter_username: "testcollection",
        instagram_username: "testcollection",
        contracts: [],
        editors: [],
        fees: [],
        rarity: null,
        pricing_currencies: null,
        total_supply: 10000,
        created_date: "2024-01-01T00:00:00Z",
      } as unknown as GetCollectionResponse

      mockGet.mockResolvedValue(mockResponse)

      const result = await collectionsAPI.getCollection("test-collection")

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet.mock.calls[0][0]).toBe(
        "/api/v2/collections/test-collection",
      )
      // Verify the collection was transformed from snake_case to camelCase
      expect(result.collection).toBe("test-collection")
      expect(result.name).toBe("Test Collection")
      expect(result.imageUrl).toBe("https://example.com/image.png")
      expect(result.bannerImageUrl).toBe("https://example.com/banner.png")
      expect(result.safelistStatus).toBe("verified")
    })

    test("handles slug with special characters", async () => {
      const mockResponse: GetCollectionResponse = {
        collection: "test-collection-123",
      } as unknown as GetCollectionResponse

      mockGet.mockResolvedValue(mockResponse)

      await collectionsAPI.getCollection("test-collection-123")

      expect(mockGet.mock.calls[0][0]).toBe(
        "/api/v2/collections/test-collection-123",
      )
    })

    test("throws error when collection not found", async () => {
      mockGet.mockRejectedValue(new Error("Collection not found"))

      try {
        await collectionsAPI.getCollection("nonexistent-collection")
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Collection not found")
      }
    })
  })

  describe("getCollections", () => {
    test("fetches collections with default parameters", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [
          {
            collection: "collection-1",
            name: "Collection 1",
          } as unknown as OpenSeaCollection,
          {
            collection: "collection-2",
            name: "Collection 2",
          } as unknown as OpenSeaCollection,
        ],
        next: "cursor-123",
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await collectionsAPI.getCollections()

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet.mock.calls[0][0]).toBe("/api/v2/collections")
      expect(mockGet.mock.calls[0][1]).toEqual({
        order_by: CollectionOrderByOption.CREATED_DATE,
        chain: undefined,
        creator_username: undefined,
        include_hidden: false,
        limit: undefined,
        next: undefined,
      })
      expect(result.collections).toHaveLength(2)
      expect(result.next).toBe("cursor-123")
    })

    test("fetches collections with orderBy parameter", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [],
      }

      mockGet.mockResolvedValue(mockResponse)

      await collectionsAPI.getCollections(CollectionOrderByOption.MARKET_CAP)

      expect(mockGet.mock.calls[0][1]).toMatchObject({
        order_by: CollectionOrderByOption.MARKET_CAP,
      })
    })

    test("fetches collections filtered by chain", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [],
      }

      mockGet.mockResolvedValue(mockResponse)

      await collectionsAPI.getCollections(
        CollectionOrderByOption.CREATED_DATE,
        Chain.Polygon,
      )

      expect(mockGet.mock.calls[0][1]).toMatchObject({
        chain: Chain.Polygon,
      })
    })

    test("fetches collections filtered by creator username", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [],
      }

      mockGet.mockResolvedValue(mockResponse)

      await collectionsAPI.getCollections(
        CollectionOrderByOption.CREATED_DATE,
        undefined,
        "test-creator",
      )

      expect(mockGet.mock.calls[0][1]).toMatchObject({
        creator_username: "test-creator",
      })
    })

    test("fetches collections with includeHidden set to true", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [],
      }

      mockGet.mockResolvedValue(mockResponse)

      await collectionsAPI.getCollections(
        CollectionOrderByOption.CREATED_DATE,
        undefined,
        undefined,
        true,
      )

      expect(mockGet.mock.calls[0][1]).toMatchObject({
        include_hidden: true,
      })
    })

    test("fetches collections with limit parameter", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [],
      }

      mockGet.mockResolvedValue(mockResponse)

      await collectionsAPI.getCollections(
        CollectionOrderByOption.CREATED_DATE,
        undefined,
        undefined,
        false,
        50,
      )

      expect(mockGet.mock.calls[0][1]).toMatchObject({
        limit: 50,
      })
    })

    test("fetches collections with pagination cursor", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [],
        next: "cursor-456",
      }

      mockGet.mockResolvedValue(mockResponse)

      await collectionsAPI.getCollections(
        CollectionOrderByOption.CREATED_DATE,
        undefined,
        undefined,
        false,
        undefined,
        "cursor-123",
      )

      expect(mockGet.mock.calls[0][1]).toMatchObject({
        next: "cursor-123",
      })
    })

    test("fetches collections with all parameters", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [],
      }

      mockGet.mockResolvedValue(mockResponse)

      await collectionsAPI.getCollections(
        CollectionOrderByOption.SEVEN_DAY_VOLUME,
        Chain.Mainnet,
        "creator-username",
        true,
        25,
        "cursor-xyz",
      )

      expect(mockGet.mock.calls[0][1]).toEqual({
        order_by: CollectionOrderByOption.SEVEN_DAY_VOLUME,
        chain: Chain.Mainnet,
        creator_username: "creator-username",
        include_hidden: true,
        limit: 25,
        next: "cursor-xyz",
      })
    })

    test("transforms collections using collectionFromJSON", async () => {
      const mockResponse = {
        collections: [
          {
            collection: "collection-1",
            name: "Collection 1",
          } as unknown as OpenSeaCollection,
        ],
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await collectionsAPI.getCollections()

      // Verify that the collections were processed
      expect(result.collections).toHaveLength(1)
      expect(result.collections[0]).toHaveProperty("collection")
    })

    test("handles empty collections list", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [],
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await collectionsAPI.getCollections()

      expect(result.collections).toEqual([])
    })

    test("throws error on API failure", async () => {
      mockGet.mockRejectedValue(new Error("API Error"))

      try {
        await collectionsAPI.getCollections()
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("API Error")
      }
    })
  })

  describe("getCollectionStats", () => {
    test("fetches stats for a collection", async () => {
      const mockResponse: OpenSeaCollectionStats = {
        total: {
          volume: 1000,
          sales: 500,
          average_price: 2,
          num_owners: 250,
          market_cap: 5000,
          floor_price: 1.5,
          floor_price_symbol: "ETH",
        },
        intervals: [
          {
            interval: "one_day",
            volume: 100,
            volume_diff: 10,
            volume_change: 0.1,
            sales: 50,
            sales_diff: 5,
            average_price: 2,
          },
        ],
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await collectionsAPI.getCollectionStats("test-collection")

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet.mock.calls[0][0]).toBe(
        "/api/v2/collections/test-collection/stats",
      )
      expect(result).toEqual(mockResponse)
      expect(result.total.volume).toBe(1000)
      expect(result.total.sales).toBe(500)
    })

    test("fetches stats with various collection slugs", async () => {
      const mockResponse: OpenSeaCollectionStats = {
        total: {
          volume: 0,
          sales: 0,
          average_price: 0,
          num_owners: 0,
          market_cap: 0,
          floor_price: 0,
          floor_price_symbol: "ETH",
        },
        intervals: [],
      }

      mockGet.mockResolvedValue(mockResponse)

      await collectionsAPI.getCollectionStats("collection-with-dashes")

      expect(mockGet.mock.calls[0][0]).toBe(
        "/api/v2/collections/collection-with-dashes/stats",
      )
    })

    test("handles collection with no stats", async () => {
      const mockResponse: OpenSeaCollectionStats = {
        total: {
          volume: 0,
          sales: 0,
          average_price: 0,
          num_owners: 0,
          market_cap: 0,
          floor_price: 0,
          floor_price_symbol: "ETH",
        },
        intervals: [],
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await collectionsAPI.getCollectionStats("new-collection")

      expect(result.total.volume).toBe(0)
      expect(result.total.sales).toBe(0)
      expect(result.intervals).toEqual([])
    })

    test("throws error when stats not found", async () => {
      mockGet.mockRejectedValue(new Error("Stats not found"))

      try {
        await collectionsAPI.getCollectionStats("nonexistent-collection")
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Stats not found")
      }
    })

    test("throws error on API failure", async () => {
      mockGet.mockRejectedValue(new Error("Server Error"))

      try {
        await collectionsAPI.getCollectionStats("test-collection")
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Server Error")
      }
    })
  })

  describe("getTraits", () => {
    test("fetches traits for a collection", async () => {
      const mockResponse: GetTraitsResponse = {
        categories: {
          Background: "string",
          Fur: "string",
          Eyes: "string",
          Mouth: "string",
          Hat: "string",
        },
        counts: {
          Background: {
            Blue: 1234,
            Green: 2345,
            Red: 987,
          },
          Fur: {
            Brown: 1500,
            Black: 1200,
            "Golden Brown": 456,
          },
          Eyes: {
            Bored: 2500,
            Angry: 1800,
          },
        },
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await collectionsAPI.getTraits("boredapeyachtclub")

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet.mock.calls[0][0]).toBe("/api/v2/traits/boredapeyachtclub")
      expect(result.categories).toHaveProperty("Background")
      expect(result.categories).toHaveProperty("Fur")
      expect(result.counts).toHaveProperty("Background")
      expect(result.counts.Background).toHaveProperty("Blue")
      expect(result.counts.Background.Blue).toBe(1234)
      expect(result.counts.Fur["Golden Brown"]).toBe(456)
    })

    test("handles collection with no traits", async () => {
      const mockResponse: GetTraitsResponse = {
        categories: {},
        counts: {},
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await collectionsAPI.getTraits("no-traits-collection")

      expect(result.categories).toEqual({})
      expect(result.counts).toEqual({})
    })

    test("handles numeric traits", async () => {
      const mockResponse: GetTraitsResponse = {
        categories: {
          Level: "number",
          Power: "number",
        },
        counts: {
          Level: {
            "1": 100,
            "2": 200,
            "3": 300,
          },
          Power: {
            "100": 50,
            "200": 75,
            "300": 25,
          },
        },
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await collectionsAPI.getTraits("numeric-traits-collection")

      expect(result.categories.Level).toBe("number")
      expect(result.categories.Power).toBe("number")
      expect(result.counts.Level["1"]).toBe(100)
      expect(result.counts.Power["100"]).toBe(50)
    })

    test("handles date traits", async () => {
      const mockResponse: GetTraitsResponse = {
        categories: {
          CreatedDate: "date",
        },
        counts: {
          CreatedDate: {
            "2024-01-01": 50,
            "2024-01-02": 75,
          },
        },
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await collectionsAPI.getTraits("date-traits-collection")

      expect(result.categories.CreatedDate).toBe("date")
      expect(result.counts.CreatedDate["2024-01-01"]).toBe(50)
    })

    test("handles traits with special characters in values", async () => {
      const mockResponse: GetTraitsResponse = {
        categories: {
          Type: "string",
        },
        counts: {
          Type: {
            "Special-Character_123": 100,
            "With Spaces": 200,
            "With/Slash": 50,
          },
        },
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await collectionsAPI.getTraits("special-chars-collection")

      expect(result.counts.Type["Special-Character_123"]).toBe(100)
      expect(result.counts.Type["With Spaces"]).toBe(200)
      expect(result.counts.Type["With/Slash"]).toBe(50)
    })

    test("handles large trait counts", async () => {
      const mockResponse: GetTraitsResponse = {
        categories: {
          Color: "string",
        },
        counts: {
          Color: {
            Blue: 999999,
            Red: 1000000,
            Green: 500000,
          },
        },
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await collectionsAPI.getTraits("large-collection")

      expect(result.counts.Color.Blue).toBe(999999)
      expect(result.counts.Color.Red).toBe(1000000)
    })

    test("handles collection slugs with special characters", async () => {
      const mockResponse: GetTraitsResponse = {
        categories: {},
        counts: {},
      }

      mockGet.mockResolvedValue(mockResponse)

      await collectionsAPI.getTraits("collection-with-dashes-123")

      expect(mockGet.mock.calls[0][0]).toBe(
        "/api/v2/traits/collection-with-dashes-123",
      )
    })

    test("handles many trait categories", async () => {
      const categories: Record<string, "string" | "number" | "date"> = {}
      const counts: Record<string, Record<string, number>> = {}

      for (let i = 0; i < 20; i++) {
        const traitName = `Trait${i}`
        categories[traitName] = "string"
        counts[traitName] = {
          Value1: 10,
          Value2: 20,
        }
      }

      const mockResponse: GetTraitsResponse = {
        categories,
        counts,
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await collectionsAPI.getTraits("many-traits-collection")

      expect(Object.keys(result.categories)).toHaveLength(20)
      expect(Object.keys(result.counts)).toHaveLength(20)
    })

    test("throws error when collection not found", async () => {
      mockGet.mockRejectedValue(new Error("Collection not found"))

      try {
        await collectionsAPI.getTraits("nonexistent-collection")
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Collection not found")
      }
    })

    test("throws error on API failure", async () => {
      mockGet.mockRejectedValue(new Error("Server Error"))

      try {
        await collectionsAPI.getTraits("test-collection")
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Server Error")
      }
    })
  })

  describe("Constructor", () => {
    test("initializes with fetcher", () => {
      const { fetcher } = createMockFetcher()
      const api = new CollectionsAPI(fetcher)

      expect(api).toBeInstanceOf(CollectionsAPI)
    })
  })
})
