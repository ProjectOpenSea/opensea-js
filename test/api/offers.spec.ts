import { OrderComponents } from "@opensea/seaport-js/lib/types";
import { expect } from "chai";
import { suite, test } from "mocha";
import * as sinon from "sinon";
import { OffersAPI } from "../../src/api/offers";
import {
  BuildOfferResponse,
  ListCollectionOffersResponse,
  GetBestOfferResponse,
  GetOffersResponse,
  CollectionOffer,
  Offer,
} from "../../src/api/types";
import { ProtocolData } from "../../src/orders/types";

suite("API: OffersAPI", () => {
  let mockGet: sinon.SinonStub;
  let mockPost: sinon.SinonStub;
  let offersAPI: OffersAPI;

  beforeEach(() => {
    mockGet = sinon.stub();
    mockPost = sinon.stub();
    offersAPI = new OffersAPI(mockGet, mockPost);
  });

  afterEach(() => {
    sinon.restore();
  });

  suite("getAllOffers", () => {
    test("fetches all offers for a collection without parameters", async () => {
      const mockResponse: GetOffersResponse = {
        offers: [
          {
            order_hash: "0x123",
            chain: "ethereum",
            type: "basic",
            price: {
              current: {
                currency: "WETH",
                decimals: 18,
                value: "500000000000000000",
              },
            },
            protocol_data: {} as unknown as ProtocolData,
            protocol_address: "0xabc",
          } as unknown as Offer,
        ],
        next: "cursor-123",
      };

      mockGet.resolves(mockResponse);

      const result = await offersAPI.getAllOffers("test-collection");

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/offers/collection/test-collection/all",
      );
      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: undefined,
        next: undefined,
      });
      expect(result.offers).to.have.length(1);
      expect(result.next).to.equal("cursor-123");
    });

    test("fetches all offers with limit parameter", async () => {
      const mockResponse: GetOffersResponse = {
        offers: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await offersAPI.getAllOffers("test-collection", 50);

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: 50,
        next: undefined,
      });
    });

    test("fetches all offers with pagination cursor", async () => {
      const mockResponse: GetOffersResponse = {
        offers: [],
        next: "cursor-456",
      };

      mockGet.resolves(mockResponse);

      await offersAPI.getAllOffers("test-collection", undefined, "cursor-123");

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: undefined,
        next: "cursor-123",
      });
    });

    test("fetches all offers with both limit and pagination", async () => {
      const mockResponse: GetOffersResponse = {
        offers: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await offersAPI.getAllOffers("test-collection", 25, "cursor-xyz");

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: 25,
        next: "cursor-xyz",
      });
    });

    test("handles empty offers array", async () => {
      const mockResponse: GetOffersResponse = {
        offers: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      const result = await offersAPI.getAllOffers("test-collection");

      expect(result.offers).to.be.an("array").that.is.empty;
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("Collection not found"));

      try {
        await offersAPI.getAllOffers("nonexistent-collection");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Collection not found");
      }
    });
  });

  suite("getTraitOffers", () => {
    test("fetches trait offers without optional parameters", async () => {
      const mockResponse: GetOffersResponse = {
        offers: [
          {
            order_hash: "0xabc",
          } as unknown as Offer,
        ],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      const result = await offersAPI.getTraitOffers(
        "test-collection",
        "Background",
        "Blue",
      );

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/offers/collection/test-collection/traits",
      );
      expect(mockGet.firstCall.args[1]).to.deep.equal({
        type: "Background",
        value: "Blue",
        limit: undefined,
        next: undefined,
        float_value: undefined,
        int_value: undefined,
      });
      expect(result.offers).to.have.length(1);
    });

    test("fetches trait offers with limit parameter", async () => {
      const mockResponse: GetOffersResponse = {
        offers: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await offersAPI.getTraitOffers(
        "test-collection",
        "Background",
        "Red",
        30,
      );

      expect(mockGet.firstCall.args[1]).to.deep.include({
        type: "Background",
        value: "Red",
        limit: 30,
      });
    });

    test("fetches trait offers with pagination cursor", async () => {
      const mockResponse: GetOffersResponse = {
        offers: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await offersAPI.getTraitOffers(
        "test-collection",
        "Eyes",
        "Laser",
        undefined,
        "cursor-abc",
      );

      expect(mockGet.firstCall.args[1]).to.deep.include({
        type: "Eyes",
        value: "Laser",
        next: "cursor-abc",
      });
    });

    test("fetches trait offers with float value", async () => {
      const mockResponse: GetOffersResponse = {
        offers: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await offersAPI.getTraitOffers(
        "test-collection",
        "Rarity",
        "Score",
        undefined,
        undefined,
        95.5,
      );

      expect(mockGet.firstCall.args[1]).to.deep.include({
        type: "Rarity",
        value: "Score",
        float_value: 95.5,
      });
    });

    test("fetches trait offers with int value", async () => {
      const mockResponse: GetOffersResponse = {
        offers: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await offersAPI.getTraitOffers(
        "test-collection",
        "Level",
        "Power",
        undefined,
        undefined,
        undefined,
        100,
      );

      expect(mockGet.firstCall.args[1]).to.deep.include({
        type: "Level",
        value: "Power",
        int_value: 100,
      });
    });

    test("fetches trait offers with all parameters", async () => {
      const mockResponse: GetOffersResponse = {
        offers: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await offersAPI.getTraitOffers(
        "test-collection",
        "Trait",
        "Value",
        20,
        "cursor-xyz",
        75.5,
        50,
      );

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        type: "Trait",
        value: "Value",
        limit: 20,
        next: "cursor-xyz",
        float_value: 75.5,
        int_value: 50,
      });
    });

    test("handles empty offers array", async () => {
      const mockResponse: GetOffersResponse = {
        offers: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      const result = await offersAPI.getTraitOffers(
        "test-collection",
        "Type",
        "Value",
      );

      expect(result.offers).to.be.an("array").that.is.empty;
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("Trait not found"));

      try {
        await offersAPI.getTraitOffers("test-collection", "Invalid", "Trait");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Trait not found");
      }
    });
  });

  suite("getBestOffer", () => {
    test("fetches best offer with string tokenId", async () => {
      const mockResponse: GetBestOfferResponse = {
        order_hash: "0xbest123",
        chain: "ethereum",
        type: "basic",
        price: {
          current: {
            currency: "WETH",
            decimals: 18,
            value: "750000000000000000",
          },
        },
        protocol_data: {} as unknown as ProtocolData,
        protocol_address: "0xdef456",
      } as unknown as GetBestOfferResponse;

      mockGet.resolves(mockResponse);

      const result = await offersAPI.getBestOffer("test-collection", "1234");

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/offers/collection/test-collection/nfts/1234/best",
      );
      expect(mockGet.firstCall.args[1]).to.be.undefined;
      expect(result.order_hash).to.equal("0xbest123");
    });

    test("fetches best offer with number tokenId", async () => {
      const mockResponse: GetBestOfferResponse = {
        order_hash: "0xdef",
      } as unknown as GetBestOfferResponse;

      mockGet.resolves(mockResponse);

      await offersAPI.getBestOffer("test-collection", 5678);

      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/offers/collection/test-collection/nfts/5678/best",
      );
    });

    test("handles large token IDs", async () => {
      const mockResponse: GetBestOfferResponse = {
        order_hash: "0x123",
      } as unknown as GetBestOfferResponse;

      mockGet.resolves(mockResponse);

      const largeTokenId = "99999999999999999999";
      await offersAPI.getBestOffer("test-collection", largeTokenId);

      expect(mockGet.firstCall.args[0]).to.include(largeTokenId);
    });

    test("throws error when no offer found", async () => {
      mockGet.rejects(new Error("No offer found"));

      try {
        await offersAPI.getBestOffer("test-collection", "999");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("No offer found");
      }
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("Server Error"));

      try {
        await offersAPI.getBestOffer("test-collection", "123");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Server Error");
      }
    });
  });

  suite("buildOffer", () => {
    test("builds collection offer without trait parameters", async () => {
      const mockResponse: BuildOfferResponse = {
        partialParameters: {
          offerer: "0xofferer123",
          offer: [],
          consideration: [],
        } as unknown as BuildOfferResponse["partialParameters"],
      };

      mockPost.resolves(mockResponse);

      const result = await offersAPI.buildOffer(
        "0xofferer123",
        5,
        "test-collection",
        true,
      );

      expect(mockPost.calledOnce).to.be.true;
      expect(mockPost.firstCall.args[0]).to.equal("/api/v2/offers/build");
      expect(result.partialParameters).to.exist;
    });

    test("builds collection offer with offerProtectionEnabled false", async () => {
      const mockResponse: BuildOfferResponse = {
        partialParameters:
          {} as unknown as BuildOfferResponse["partialParameters"],
      };

      mockPost.resolves(mockResponse);

      await offersAPI.buildOffer("0xofferer123", 10, "test-collection", false);

      expect(mockPost.calledOnce).to.be.true;
    });

    test("builds collection offer with trait type and value", async () => {
      const mockResponse: BuildOfferResponse = {
        partialParameters:
          {} as unknown as BuildOfferResponse["partialParameters"],
      };

      mockPost.resolves(mockResponse);

      await offersAPI.buildOffer(
        "0xofferer123",
        3,
        "test-collection",
        true,
        "Background",
        "Blue",
      );

      expect(mockPost.calledOnce).to.be.true;
    });

    test("throws error when only traitType is provided", async () => {
      try {
        await offersAPI.buildOffer(
          "0xofferer123",
          5,
          "test-collection",
          true,
          "Background",
          undefined,
        );
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include(
          "Both traitType and traitValue must be defined if one is defined",
        );
      }
    });

    test("throws error when only traitValue is provided", async () => {
      try {
        await offersAPI.buildOffer(
          "0xofferer123",
          5,
          "test-collection",
          true,
          undefined,
          "Blue",
        );
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include(
          "Both traitType and traitValue must be defined if one is defined",
        );
      }
    });

    test("throws error on API failure", async () => {
      mockPost.rejects(new Error("Build failed"));

      try {
        await offersAPI.buildOffer("0xofferer123", 5, "test-collection", true);
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Build failed");
      }
    });
  });

  suite("getCollectionOffers", () => {
    test("fetches collection offers for a slug", async () => {
      const mockResponse: ListCollectionOffersResponse = {
        offers: [
          {
            protocol_data: {} as unknown as ProtocolData,
            protocol_address: "0xabc",
          } as unknown as CollectionOffer,
        ],
      };

      mockGet.resolves(mockResponse);

      const result = await offersAPI.getCollectionOffers("test-collection");

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/offers/collection/test-collection",
      );
      expect(result).to.deep.equal(mockResponse);
      expect(result?.offers).to.have.length(1);
    });

    test("handles empty offers list", async () => {
      const mockResponse: ListCollectionOffersResponse = {
        offers: [],
      };

      mockGet.resolves(mockResponse);

      const result = await offersAPI.getCollectionOffers("test-collection");

      expect(result?.offers).to.be.an("array").that.is.empty;
    });

    test("returns null when appropriate", async () => {
      mockGet.resolves(null);

      const result = await offersAPI.getCollectionOffers("test-collection");

      expect(result).to.be.null;
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("Collection not found"));

      try {
        await offersAPI.getCollectionOffers("nonexistent-collection");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Collection not found");
      }
    });
  });

  suite("postCollectionOffer", () => {
    test("posts collection offer without trait parameters", async () => {
      const mockOrder: ProtocolData = {
        parameters: {
          offerer: "0xofferer123",
          offer: [],
          consideration: [],
        } as unknown as OrderComponents,
        signature: "0xsig123",
      };

      const mockResponse: CollectionOffer = {
        protocol_data: mockOrder,
        protocol_address: "0xabc",
      } as unknown as CollectionOffer;

      mockPost.resolves(mockResponse);

      const result = await offersAPI.postCollectionOffer(
        mockOrder,
        "test-collection",
      );

      expect(mockPost.calledOnce).to.be.true;
      expect(mockPost.firstCall.args[0]).to.equal("/api/v2/offers");
      expect(result).to.deep.equal(mockResponse);
    });

    test("posts collection offer with trait type and value", async () => {
      const mockOrder: ProtocolData = {
        parameters: {} as unknown as OrderComponents,
        signature: "0xsig456",
      };

      const mockResponse: CollectionOffer = {
        protocol_data: mockOrder,
      } as unknown as CollectionOffer;

      mockPost.resolves(mockResponse);

      await offersAPI.postCollectionOffer(
        mockOrder,
        "test-collection",
        "Background",
        "Red",
      );

      expect(mockPost.calledOnce).to.be.true;
    });

    test("returns null when appropriate", async () => {
      const mockOrder: ProtocolData = {
        parameters: {} as unknown as OrderComponents,
        signature: "0xsig",
      };

      mockPost.resolves(null);

      const result = await offersAPI.postCollectionOffer(
        mockOrder,
        "test-collection",
      );

      expect(result).to.be.null;
    });

    test("throws error on API failure", async () => {
      const mockOrder: ProtocolData = {
        parameters: {} as unknown as OrderComponents,
        signature: "0xsig",
      };

      mockPost.rejects(new Error("Post failed"));

      try {
        await offersAPI.postCollectionOffer(mockOrder, "test-collection");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Post failed");
      }
    });
  });

  suite("Constructor", () => {
    test("initializes with get and post functions", () => {
      const getFunc = sinon.stub();
      const postFunc = sinon.stub();
      const api = new OffersAPI(getFunc, postFunc);

      expect(api).to.be.instanceOf(OffersAPI);
    });
  });
});
