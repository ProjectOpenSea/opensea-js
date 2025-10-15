import { expect } from "chai";
import { suite, test } from "mocha";
import * as sinon from "sinon";
import { ListingsAPI } from "../../src/api/listings";
import {
  GetBestListingResponse,
  GetListingsResponse,
} from "../../src/api/types";

suite("API: ListingsAPI", () => {
  let mockGet: sinon.SinonStub;
  let listingsAPI: ListingsAPI;

  beforeEach(() => {
    mockGet = sinon.stub();
    listingsAPI = new ListingsAPI(mockGet);
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
            chain: "ethereum",
            type: "basic",
            price: {
              current: {
                currency: "ETH",
                decimals: 18,
                value: "1000000000000000000",
              },
            },
            protocol_data: {} as any,
            protocol_address: "0xabc",
          } as any,
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
          { order_hash: "0x1" } as any,
          { order_hash: "0x2" } as any,
          { order_hash: "0x3" } as any,
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
        chain: "ethereum",
        type: "basic",
        price: {
          current: {
            currency: "ETH",
            decimals: 18,
            value: "1500000000000000000",
          },
        },
        protocol_data: {} as any,
        protocol_address: "0xdef456",
      } as any;

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
      } as any;

      mockGet.resolves(mockResponse);

      await listingsAPI.getBestListing("test-collection", 5678);

      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/listings/collection/test-collection/nfts/5678/best",
      );
    });

    test("handles large token IDs", async () => {
      const mockResponse: GetBestListingResponse = {
        order_hash: "0x123",
      } as any;

      mockGet.resolves(mockResponse);

      const largeTokenId = "99999999999999999999";
      await listingsAPI.getBestListing("test-collection", largeTokenId);

      expect(mockGet.firstCall.args[0]).to.include(largeTokenId);
    });

    test("handles collection slug with special characters", async () => {
      const mockResponse: GetBestListingResponse = {
        order_hash: "0x456",
      } as any;

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
          } as any,
          {
            order_hash: "0x222",
            price: {
              current: {
                value: "1100000000000000000",
              },
            },
          } as any,
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
        listings: [{ order_hash: "0x1" } as any],
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

  suite("Constructor", () => {
    test("initializes with get function", () => {
      const getFunc = sinon.stub();
      const api = new ListingsAPI(getFunc);

      expect(api).to.be.instanceOf(ListingsAPI);
    });
  });
});
