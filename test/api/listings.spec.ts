import { expect } from "chai";
import { suite, test } from "mocha";
import * as sinon from "sinon";
import { ListingsAPI } from "../../src/api/listings";
import {
  GetBestListingResponse,
  GetListingsResponse,
  Listing,
} from "../../src/api/types";
import { OrderV2 } from "../../src/orders/types";
import { Chain } from "../../src/types";
import { createMockFetcher } from "../fixtures/fetcher";

suite("API: ListingsAPI", () => {
  let mockGet: sinon.SinonStub;
  let listingsAPI: ListingsAPI;

  beforeEach(() => {
    const { fetcher, mockGet: getMock } = createMockFetcher();
    mockGet = getMock;
    listingsAPI = new ListingsAPI(fetcher, Chain.Mainnet);
  });

  afterEach(() => {
    sinon.restore();
  });

  suite("getAllListings", () => {
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
      };

      mockGet.resolves(mockResponse);

      const result = await listingsAPI.getAllListings("test-collection");

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/listings/collection/test-collection/all",
      );
      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: undefined,
        next: undefined,
      });
      expect(result.listings).to.have.length(1);
      expect(result.next).to.equal("cursor-123");
    });

    test("fetches all listings with limit parameter", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await listingsAPI.getAllListings("test-collection", 50);

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: 50,
        next: undefined,
      });
    });

    test("fetches all listings with pagination cursor", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: "cursor-456",
      };

      mockGet.resolves(mockResponse);

      await listingsAPI.getAllListings(
        "test-collection",
        undefined,
        "cursor-123",
      );

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: undefined,
        next: "cursor-123",
      });
    });

    test("fetches all listings with both limit and pagination", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await listingsAPI.getAllListings("test-collection", 25, "cursor-xyz");

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: 25,
        next: "cursor-xyz",
      });
    });

    test("handles collection slug with special characters", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await listingsAPI.getAllListings("collection-name-123");

      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/listings/collection/collection-name-123/all",
      );
    });

    test("handles empty listings array", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      const result = await listingsAPI.getAllListings("test-collection");

      expect(result.listings).to.be.an("array").that.is.empty;
    });

    test("handles multiple listings in response", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [
          { order_hash: "0x1" } as unknown as Listing,
          { order_hash: "0x2" } as unknown as Listing,
          { order_hash: "0x3" } as unknown as Listing,
        ],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      const result = await listingsAPI.getAllListings("test-collection");

      expect(result.listings).to.have.length(3);
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("API Error"));

      try {
        await listingsAPI.getAllListings("test-collection");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("API Error");
      }
    });

    test("throws error when collection not found", async () => {
      mockGet.rejects(new Error("Collection not found"));

      try {
        await listingsAPI.getAllListings("nonexistent-collection");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Collection not found");
      }
    });
  });

  suite("getBestListing", () => {
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
      } as unknown as Listing;

      mockGet.resolves(mockResponse);

      const result = await listingsAPI.getBestListing(
        "test-collection",
        "1234",
      );

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/listings/collection/test-collection/nfts/1234/best",
      );
      expect(mockGet.firstCall.args[1]).to.be.undefined;
      expect(result.order_hash).to.equal("0xabc123");
    });

    test("fetches best listing for a token with number tokenId", async () => {
      const mockResponse: GetBestListingResponse = {
        order_hash: "0xdef",
      } as unknown as Listing;

      mockGet.resolves(mockResponse);

      await listingsAPI.getBestListing("test-collection", 5678);

      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/listings/collection/test-collection/nfts/5678/best",
      );
    });

    test("handles large token IDs", async () => {
      const mockResponse: GetBestListingResponse = {
        order_hash: "0x123",
      } as unknown as Listing;

      mockGet.resolves(mockResponse);

      const largeTokenId = "99999999999999999999";
      await listingsAPI.getBestListing("test-collection", largeTokenId);

      expect(mockGet.firstCall.args[0]).to.include(largeTokenId);
    });

    test("handles collection slug with special characters", async () => {
      const mockResponse: GetBestListingResponse = {
        order_hash: "0x456",
      } as unknown as Listing;

      mockGet.resolves(mockResponse);

      await listingsAPI.getBestListing("my-collection-v2", "100");

      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/listings/collection/my-collection-v2/nfts/100/best",
      );
    });

    test("throws error when no listing found", async () => {
      mockGet.rejects(new Error("No listing found"));

      try {
        await listingsAPI.getBestListing("test-collection", "999");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("No listing found");
      }
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("Server Error"));

      try {
        await listingsAPI.getBestListing("test-collection", "123");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Server Error");
      }
    });
  });

  suite("getBestListings", () => {
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
      };

      mockGet.resolves(mockResponse);

      const result = await listingsAPI.getBestListings("test-collection");

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/listings/collection/test-collection/best",
      );
      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: undefined,
        next: undefined,
      });
      expect(result.listings).to.have.length(2);
    });

    test("fetches best listings with limit parameter", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await listingsAPI.getBestListings("test-collection", 10);

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: 10,
        next: undefined,
      });
    });

    test("fetches best listings with pagination cursor", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: "cursor-next",
      };

      mockGet.resolves(mockResponse);

      await listingsAPI.getBestListings(
        "test-collection",
        undefined,
        "cursor-prev",
      );

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: undefined,
        next: "cursor-prev",
      });
    });

    test("fetches best listings with both limit and pagination", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await listingsAPI.getBestListings("test-collection", 20, "cursor-abc");

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: 20,
        next: "cursor-abc",
      });
    });

    test("handles collection slug with dashes", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await listingsAPI.getBestListings("my-awesome-collection");

      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/listings/collection/my-awesome-collection/best",
      );
    });

    test("handles empty listings array", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      const result = await listingsAPI.getBestListings("test-collection");

      expect(result.listings).to.be.an("array").that.is.empty;
    });

    test("handles response with pagination cursor", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [{ order_hash: "0x1" } as unknown as Listing],
        next: "next-cursor-value",
      };

      mockGet.resolves(mockResponse);

      const result = await listingsAPI.getBestListings("test-collection");

      expect(result.next).to.equal("next-cursor-value");
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("API Error"));

      try {
        await listingsAPI.getBestListings("test-collection");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("API Error");
      }
    });

    test("throws error when collection not found", async () => {
      mockGet.rejects(new Error("Collection not found"));

      try {
        await listingsAPI.getBestListings("nonexistent-collection");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Collection not found");
      }
    });
  });

  suite("getNFTListings", () => {
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
      };

      mockGet.resolves(mockResponse);

      const result = await listingsAPI.getNFTListings(
        "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
        "1",
      );

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/orders/ethereum/seaport/listings",
      );
      expect(mockGet.firstCall.args[1]).to.deep.include({
        asset_contract_address: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
        token_ids: ["1"],
      });
      expect(result.listings).to.have.length(1);
      expect(result.listings[0].order_hash).to.equal("0xabc123");
      expect(result.next).to.equal("cursor-123");
    });

    test("fetches listings with limit parameter", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await listingsAPI.getNFTListings("0xContract", "100", 50);

      expect(mockGet.firstCall.args[1]).to.deep.include({
        asset_contract_address: "0xContract",
        token_ids: ["100"],
        limit: 50,
      });
    });

    test("fetches listings with pagination cursor", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [
          {
            order_hash: "0xdef456",
          } as unknown as Listing,
        ],
        next: "cursor-next",
      };

      mockGet.resolves(mockResponse);

      await listingsAPI.getNFTListings(
        "0xContract",
        "200",
        undefined,
        "cursor-prev",
      );

      expect(mockGet.firstCall.args[1]).to.deep.include({
        asset_contract_address: "0xContract",
        token_ids: ["200"],
        cursor: "cursor-prev",
      });
    });

    test("fetches listings with custom chain parameter", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await listingsAPI.getNFTListings(
        "0xContract",
        "1",
        undefined,
        undefined,
        Chain.Polygon,
      );

      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/orders/polygon/seaport/listings",
      );
    });

    test("fetches listings with all parameters", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [
          { order_hash: "0x111" } as unknown as Listing,
          { order_hash: "0x222" } as unknown as Listing,
        ],
        next: "cursor-abc",
      };

      mockGet.resolves(mockResponse);

      await listingsAPI.getNFTListings(
        "0xContract",
        "999",
        20,
        "cursor-xyz",
        Chain.Arbitrum,
      );

      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/orders/arbitrum/seaport/listings",
      );
      expect(mockGet.firstCall.args[1]).to.deep.include({
        asset_contract_address: "0xContract",
        token_ids: ["999"],
        limit: 20,
        cursor: "cursor-xyz",
      });
    });

    test("handles empty listings array", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      const result = await listingsAPI.getNFTListings("0xContract", "1");

      expect(result.listings).to.be.an("array").that.is.empty;
    });

    test("handles large token IDs", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      const largeTokenId = "999999999999999999999999";
      await listingsAPI.getNFTListings("0xContract", largeTokenId);

      expect(mockGet.firstCall.args[1]).to.deep.include({
        token_ids: [largeTokenId],
      });
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("API Error"));

      try {
        await listingsAPI.getNFTListings("0xContract", "1");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("API Error");
      }
    });
  });

  suite("Constructor", () => {
    test("initializes with get function and chain", () => {
      const { fetcher } = createMockFetcher();
      const api = new ListingsAPI(fetcher, Chain.Mainnet);

      expect(api).to.be.instanceOf(ListingsAPI);
    });
  });

  suite("remaining_quantity field", () => {
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
      } as unknown as Listing;

      mockGet.resolves(mockResponse);

      const result = await listingsAPI.getBestListing(
        "test-collection",
        "1234",
      );

      expect(result.remaining_quantity).to.equal(1);
    });

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
      };

      mockGet.resolves(mockResponse);

      const result = await listingsAPI.getAllListings("test-collection");

      expect(result.listings[0].remaining_quantity).to.equal(1);
      expect(result.listings[1].remaining_quantity).to.equal(5);
    });

    test("getBestListings includes remaining_quantity for partially filled orders", async () => {
      const mockResponse: GetListingsResponse = {
        listings: [
          {
            order_hash: "0x333",
            remaining_quantity: 3,
          } as unknown as Listing,
        ],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      const result = await listingsAPI.getBestListings("test-collection");

      expect(result.listings[0].remaining_quantity).to.equal(3);
    });
  });
});
