import { expect } from "chai";
import { suite, test } from "mocha";
import * as sinon from "sinon";
import { CollectionsAPI } from "../../src/api/collections";
import {
  GetCollectionResponse,
  GetCollectionsResponse,
  CollectionOrderByOption,
} from "../../src/api/types";
import { Chain, OpenSeaCollectionStats } from "../../src/types";

suite("API: CollectionsAPI", () => {
  let mockGet: sinon.SinonStub;
  let collectionsAPI: CollectionsAPI;

  beforeEach(() => {
    mockGet = sinon.stub();
    collectionsAPI = new CollectionsAPI(mockGet);
  });

  afterEach(() => {
    sinon.restore();
  });

  suite("getCollection", () => {
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
        payment_tokens: [],
        total_supply: 10000,
        created_date: "2024-01-01T00:00:00Z",
      } as any;

      mockGet.resolves(mockResponse);

      const result = await collectionsAPI.getCollection("test-collection");

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/collections/test-collection",
      );
      expect(result).to.deep.equal(mockResponse);
    });

    test("handles slug with special characters", async () => {
      const mockResponse: GetCollectionResponse = {
        collection: "test-collection-123",
      } as any;

      mockGet.resolves(mockResponse);

      await collectionsAPI.getCollection("test-collection-123");

      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/collections/test-collection-123",
      );
    });

    test("throws error when collection not found", async () => {
      mockGet.rejects(new Error("Collection not found"));

      try {
        await collectionsAPI.getCollection("nonexistent-collection");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Collection not found");
      }
    });
  });

  suite("getCollections", () => {
    test("fetches collections with default parameters", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [
          {
            collection: "collection-1",
            name: "Collection 1",
          } as any,
          {
            collection: "collection-2",
            name: "Collection 2",
          } as any,
        ],
        next: "cursor-123",
      };

      mockGet.resolves(mockResponse);

      const result = await collectionsAPI.getCollections();

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal("/api/v2/collections");
      expect(mockGet.firstCall.args[1]).to.deep.equal({
        order_by: CollectionOrderByOption.CREATED_DATE,
        chain: undefined,
        creator_username: undefined,
        include_hidden: false,
        limit: undefined,
        next: undefined,
      });
      expect(result.collections).to.have.length(2);
      expect(result.next).to.equal("cursor-123");
    });

    test("fetches collections with orderBy parameter", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [],
      };

      mockGet.resolves(mockResponse);

      await collectionsAPI.getCollections(CollectionOrderByOption.MARKET_CAP);

      expect(mockGet.firstCall.args[1]).to.deep.include({
        order_by: CollectionOrderByOption.MARKET_CAP,
      });
    });

    test("fetches collections filtered by chain", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [],
      };

      mockGet.resolves(mockResponse);

      await collectionsAPI.getCollections(
        CollectionOrderByOption.CREATED_DATE,
        Chain.Polygon,
      );

      expect(mockGet.firstCall.args[1]).to.deep.include({
        chain: Chain.Polygon,
      });
    });

    test("fetches collections filtered by creator username", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [],
      };

      mockGet.resolves(mockResponse);

      await collectionsAPI.getCollections(
        CollectionOrderByOption.CREATED_DATE,
        undefined,
        "test-creator",
      );

      expect(mockGet.firstCall.args[1]).to.deep.include({
        creator_username: "test-creator",
      });
    });

    test("fetches collections with includeHidden set to true", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [],
      };

      mockGet.resolves(mockResponse);

      await collectionsAPI.getCollections(
        CollectionOrderByOption.CREATED_DATE,
        undefined,
        undefined,
        true,
      );

      expect(mockGet.firstCall.args[1]).to.deep.include({
        include_hidden: true,
      });
    });

    test("fetches collections with limit parameter", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [],
      };

      mockGet.resolves(mockResponse);

      await collectionsAPI.getCollections(
        CollectionOrderByOption.CREATED_DATE,
        undefined,
        undefined,
        false,
        50,
      );

      expect(mockGet.firstCall.args[1]).to.deep.include({
        limit: 50,
      });
    });

    test("fetches collections with pagination cursor", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [],
        next: "cursor-456",
      };

      mockGet.resolves(mockResponse);

      await collectionsAPI.getCollections(
        CollectionOrderByOption.CREATED_DATE,
        undefined,
        undefined,
        false,
        undefined,
        "cursor-123",
      );

      expect(mockGet.firstCall.args[1]).to.deep.include({
        next: "cursor-123",
      });
    });

    test("fetches collections with all parameters", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [],
      };

      mockGet.resolves(mockResponse);

      await collectionsAPI.getCollections(
        CollectionOrderByOption.SEVEN_DAY_VOLUME,
        Chain.Mainnet,
        "creator-username",
        true,
        25,
        "cursor-xyz",
      );

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        order_by: CollectionOrderByOption.SEVEN_DAY_VOLUME,
        chain: Chain.Mainnet,
        creator_username: "creator-username",
        include_hidden: true,
        limit: 25,
        next: "cursor-xyz",
      });
    });

    test("transforms collections using collectionFromJSON", async () => {
      const mockResponse = {
        collections: [
          {
            collection: "collection-1",
            name: "Collection 1",
          } as any,
        ],
      };

      mockGet.resolves(mockResponse);

      const result = await collectionsAPI.getCollections();

      // Verify that the collections were processed
      expect(result.collections).to.have.length(1);
      expect(result.collections[0]).to.have.property("collection");
    });

    test("handles empty collections list", async () => {
      const mockResponse: GetCollectionsResponse = {
        collections: [],
      };

      mockGet.resolves(mockResponse);

      const result = await collectionsAPI.getCollections();

      expect(result.collections).to.be.an("array").that.is.empty;
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("API Error"));

      try {
        await collectionsAPI.getCollections();
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("API Error");
      }
    });
  });

  suite("getCollectionStats", () => {
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
      };

      mockGet.resolves(mockResponse);

      const result = await collectionsAPI.getCollectionStats("test-collection");

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/collections/test-collection/stats",
      );
      expect(result).to.deep.equal(mockResponse);
      expect(result.total.volume).to.equal(1000);
      expect(result.total.sales).to.equal(500);
    });

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
      };

      mockGet.resolves(mockResponse);

      await collectionsAPI.getCollectionStats("collection-with-dashes");

      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/collections/collection-with-dashes/stats",
      );
    });

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
      };

      mockGet.resolves(mockResponse);

      const result = await collectionsAPI.getCollectionStats("new-collection");

      expect(result.total.volume).to.equal(0);
      expect(result.total.sales).to.equal(0);
      expect(result.intervals).to.be.an("array").that.is.empty;
    });

    test("throws error when stats not found", async () => {
      mockGet.rejects(new Error("Stats not found"));

      try {
        await collectionsAPI.getCollectionStats("nonexistent-collection");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Stats not found");
      }
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("Server Error"));

      try {
        await collectionsAPI.getCollectionStats("test-collection");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Server Error");
      }
    });
  });

  suite("Constructor", () => {
    test("initializes with get function", () => {
      const getFunc = sinon.stub();
      const api = new CollectionsAPI(getFunc);

      expect(api).to.be.instanceOf(CollectionsAPI);
    });
  });
});
