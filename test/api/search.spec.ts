import { expect } from "chai";
import { suite, test } from "mocha";
import * as sinon from "sinon";
import { SearchAPI } from "../../src/api/search";
import {
  SearchResponse,
  CollectionSearchResult,
  TokenSearchResult,
  NftSearchResult,
  AccountSearchResult,
} from "../../src/api/types";
import { createMockFetcher } from "../fixtures/fetcher";

const mockCollectionResult: CollectionSearchResult = {
  collection: "bored-ape-yacht-club",
  name: "Bored Ape Yacht Club",
  image_url: "https://example.com/bayc.png",
  is_disabled: false,
  is_nsfw: false,
  opensea_url: "https://opensea.io/collection/bored-ape-yacht-club",
};

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
};

const mockNftResult: NftSearchResult = {
  identifier: "1234",
  collection: "bored-ape-yacht-club",
  contract: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
  name: "Bored Ape #1234",
  image_url: "https://example.com/ape1234.png",
  opensea_url:
    "https://opensea.io/assets/ethereum/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D/1234",
};

const mockAccountResult: AccountSearchResult = {
  address: "0x1234567890abcdef1234567890abcdef12345678",
  username: "testuser",
  profile_image_url: "https://example.com/avatar.png",
  opensea_url: "https://opensea.io/testuser",
};

suite("API: SearchAPI", () => {
  let mockGet: sinon.SinonStub;
  let searchAPI: SearchAPI;

  beforeEach(() => {
    const { fetcher, mockGet: getMock } = createMockFetcher();
    mockGet = getMock;
    searchAPI = new SearchAPI(fetcher);
  });

  afterEach(() => {
    sinon.restore();
  });

  suite("search", () => {
    test("searches with query only", async () => {
      const mockResponse: SearchResponse = {
        results: [{ type: "collection", collection: mockCollectionResult }],
      };

      mockGet.resolves(mockResponse);

      const result = await searchAPI.search({ query: "bored ape" });

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal("/api/v2/search");
      expect(mockGet.firstCall.args[1]).to.deep.equal({
        query: "bored ape",
      });
      expect(result.results).to.have.length(1);
      expect(result.results[0].type).to.equal("collection");
      expect(result.results[0].collection?.name).to.equal(
        "Bored Ape Yacht Club",
      );
    });

    test("searches with chain filter", async () => {
      const mockResponse: SearchResponse = { results: [] };
      mockGet.resolves(mockResponse);

      await searchAPI.search({
        query: "test",
        chains: ["ethereum", "polygon"],
      });

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        query: "test",
        chains: ["ethereum", "polygon"],
      });
    });

    test("searches with asset type filter", async () => {
      const mockResponse: SearchResponse = { results: [] };
      mockGet.resolves(mockResponse);

      await searchAPI.search({
        query: "test",
        asset_types: ["collection", "nft"],
      });

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        query: "test",
        asset_types: ["collection", "nft"],
      });
    });

    test("searches with limit", async () => {
      const mockResponse: SearchResponse = { results: [] };
      mockGet.resolves(mockResponse);

      await searchAPI.search({ query: "test", limit: 10 });

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        query: "test",
        limit: 10,
      });
    });

    test("searches with all parameters", async () => {
      const mockResponse: SearchResponse = { results: [] };
      mockGet.resolves(mockResponse);

      await searchAPI.search({
        query: "ape",
        chains: ["ethereum"],
        asset_types: ["collection", "nft", "token", "account"],
        limit: 50,
      });

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        query: "ape",
        chains: ["ethereum"],
        asset_types: ["collection", "nft", "token", "account"],
        limit: 50,
      });
    });

    test("returns mixed result types", async () => {
      const mockResponse: SearchResponse = {
        results: [
          { type: "collection", collection: mockCollectionResult },
          { type: "token", token: mockTokenResult },
          { type: "nft", nft: mockNftResult },
          { type: "account", account: mockAccountResult },
        ],
      };

      mockGet.resolves(mockResponse);

      const result = await searchAPI.search({ query: "test" });

      expect(result.results).to.have.length(4);
      expect(result.results[0].type).to.equal("collection");
      expect(result.results[0].collection?.collection).to.equal(
        "bored-ape-yacht-club",
      );
      expect(result.results[1].type).to.equal("token");
      expect(result.results[1].token?.symbol).to.equal("WETH");
      expect(result.results[2].type).to.equal("nft");
      expect(result.results[2].nft?.identifier).to.equal("1234");
      expect(result.results[3].type).to.equal("account");
      expect(result.results[3].account?.username).to.equal("testuser");
    });

    test("handles empty results", async () => {
      const mockResponse: SearchResponse = { results: [] };
      mockGet.resolves(mockResponse);

      const result = await searchAPI.search({ query: "nonexistent" });

      expect(result.results).to.be.an("array").that.is.empty;
    });

    test("handles account with null username", async () => {
      const mockResponse: SearchResponse = {
        results: [
          {
            type: "account",
            account: { ...mockAccountResult, username: null },
          },
        ],
      };

      mockGet.resolves(mockResponse);

      const result = await searchAPI.search({ query: "0x1234" });

      expect(result.results[0].account?.username).to.be.null;
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("API Error"));

      try {
        await searchAPI.search({ query: "test" });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("API Error");
      }
    });
  });

  suite("Constructor", () => {
    test("initializes with fetcher", () => {
      const { fetcher } = createMockFetcher();
      const api = new SearchAPI(fetcher);

      expect(api).to.be.instanceOf(SearchAPI);
    });
  });
});
