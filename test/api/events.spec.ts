import { expect } from "chai";
import { suite, test } from "mocha";
import * as sinon from "sinon";
import { EventsAPI } from "../../src/api/events";
import {
  AssetEventType,
  EventAsset,
  GetEventsResponse,
  ListingEvent,
  OfferEvent,
  SaleEvent,
  TransferEvent,
} from "../../src/api/types";
import { Chain } from "../../src/types";
import { createMockFetcher } from "../fixtures/fetcher";

suite("API: EventsAPI", () => {
  let mockGet: sinon.SinonStub;
  let eventsAPI: EventsAPI;

  beforeEach(() => {
    const { fetcher, mockGet: getMock } = createMockFetcher();
    mockGet = getMock;
    eventsAPI = new EventsAPI(fetcher);
  });

  afterEach(() => {
    sinon.restore();
  });

  suite("getEvents", () => {
    test("fetches events without parameters", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [
          {
            event_type: AssetEventType.LISTING,
            event_timestamp: 1234567890,
            chain: "ethereum",
            quantity: 1,
            payment: {
              quantity: "1000000000000000000",
              token_address: "0x0000000000000000000000000000000000000000",
              decimals: 18,
              symbol: "ETH",
            },
            start_date: null,
            expiration_date: 1234567990,
            asset: {} as EventAsset,
            maker: "0x123",
            taker: "",
            is_private_listing: false,
          } as ListingEvent,
        ],
        next: "cursor-123",
      };

      mockGet.resolves(mockResponse);

      const result = await eventsAPI.getEvents();

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal("/api/v2/events");
      expect(mockGet.firstCall.args[1]).to.be.undefined;
      expect(result.asset_events).to.have.length(1);
      expect(result.next).to.equal("cursor-123");
    });

    test("fetches events with event_type filter", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await eventsAPI.getEvents({ event_type: AssetEventType.SALE });

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        event_type: "sale",
      });
    });

    test("fetches events with limit parameter", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await eventsAPI.getEvents({ limit: 50 });

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: 50,
      });
    });

    test("fetches events with pagination cursor", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [],
        next: "cursor-456",
      };

      mockGet.resolves(mockResponse);

      await eventsAPI.getEvents({ next: "cursor-123" });

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        next: "cursor-123",
      });
    });

    test("fetches events with after timestamp", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await eventsAPI.getEvents({ after: 1234567890 });

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        after: 1234567890,
      });
    });

    test("fetches events with before timestamp", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await eventsAPI.getEvents({ before: 1234567890 });

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        before: 1234567890,
      });
    });

    test("fetches events with chain filter", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await eventsAPI.getEvents({ chain: "ethereum" });

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        chain: "ethereum",
      });
    });

    test("fetches events with multiple parameters", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await eventsAPI.getEvents({
        event_type: AssetEventType.SALE,
        limit: 25,
        chain: "ethereum",
        after: 1234567890,
      });

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        event_type: "sale",
        limit: 25,
        chain: "ethereum",
        after: 1234567890,
      });
    });

    test("handles empty events array", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      const result = await eventsAPI.getEvents();

      expect(result.asset_events).to.be.an("array").that.is.empty;
    });

    test("handles multiple events in response", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [
          { event_type: AssetEventType.LISTING } as ListingEvent,
          { event_type: AssetEventType.SALE } as SaleEvent,
          { event_type: AssetEventType.TRANSFER } as TransferEvent,
        ],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      const result = await eventsAPI.getEvents();

      expect(result.asset_events).to.have.length(3);
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("API Error"));

      try {
        await eventsAPI.getEvents();
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("API Error");
      }
    });
  });

  suite("getEventsByAccount", () => {
    test("fetches events for an account without parameters", async () => {
      const address = "0x1234567890123456789012345678901234567890";
      const mockResponse: GetEventsResponse = {
        asset_events: [
          {
            event_type: AssetEventType.TRANSFER,
            event_timestamp: 1234567890,
            chain: "ethereum",
            quantity: 1,
            transaction: "0xabc",
            from_address: "0x000",
            to_address: address,
            nft: {} as EventAsset,
          } as TransferEvent,
        ],
        next: "cursor-123",
      };

      mockGet.resolves(mockResponse);

      const result = await eventsAPI.getEventsByAccount(address);

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        `/api/v2/events/accounts/${address}`,
      );
      expect(mockGet.firstCall.args[1]).to.be.undefined;
      expect(result.asset_events).to.have.length(1);
      expect(result.next).to.equal("cursor-123");
    });

    test("fetches events for an account with parameters", async () => {
      const address = "0x1234567890123456789012345678901234567890";
      const mockResponse: GetEventsResponse = {
        asset_events: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await eventsAPI.getEventsByAccount(address, {
        event_type: AssetEventType.SALE,
        limit: 10,
      });

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        event_type: "sale",
        limit: 10,
      });
    });

    test("handles lowercase address", async () => {
      const address = "0xabcdef1234567890123456789012345678901234";
      const mockResponse: GetEventsResponse = {
        asset_events: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await eventsAPI.getEventsByAccount(address);

      expect(mockGet.firstCall.args[0]).to.include(address);
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("Account not found"));

      try {
        await eventsAPI.getEventsByAccount("0x123");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Account not found");
      }
    });
  });

  suite("getEventsByCollection", () => {
    test("fetches events for a collection without parameters", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [
          {
            event_type: AssetEventType.SALE,
            event_timestamp: 1234567890,
            chain: "ethereum",
            quantity: 1,
            transaction: "0xabc",
            order_hash: "0xdef",
            protocol_address: "0x123",
            payment: {
              quantity: "1000000000000000000",
              token_address: "0x0000000000000000000000000000000000000000",
              decimals: 18,
              symbol: "ETH",
            },
            closing_date: 1234567890,
            seller: "0x111",
            buyer: "0x222",
            nft: {} as EventAsset,
          } as SaleEvent,
        ],
        next: "cursor-123",
      };

      mockGet.resolves(mockResponse);

      const result = await eventsAPI.getEventsByCollection("test-collection");

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/events/collection/test-collection",
      );
      expect(mockGet.firstCall.args[1]).to.be.undefined;
      expect(result.asset_events).to.have.length(1);
      expect(result.next).to.equal("cursor-123");
    });

    test("fetches events for a collection with parameters", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await eventsAPI.getEventsByCollection("test-collection", {
        limit: 20,
        next: "cursor-xyz",
      });

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: 20,
        next: "cursor-xyz",
      });
    });

    test("handles collection slug with special characters", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await eventsAPI.getEventsByCollection("collection-name-123");

      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/events/collection/collection-name-123",
      );
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("Collection not found"));

      try {
        await eventsAPI.getEventsByCollection("nonexistent-collection");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Collection not found");
      }
    });
  });

  suite("getEventsByNFT", () => {
    test("fetches events for an NFT without parameters", async () => {
      const chain = Chain.Mainnet;
      const address = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
      const identifier = "1";
      const mockResponse: GetEventsResponse = {
        asset_events: [
          {
            event_type: AssetEventType.OFFER,
            event_timestamp: 1234567890,
            chain: "ethereum",
            quantity: 1,
            payment: {
              quantity: "1000000000000000000",
              token_address: "0x0000000000000000000000000000000000000000",
              decimals: 18,
              symbol: "ETH",
            },
            start_date: 1234567890,
            expiration_date: 1234567990,
            asset: {} as EventAsset,
            maker: "0x123",
            taker: "",
          } as OfferEvent,
        ],
        next: "cursor-123",
      };

      mockGet.resolves(mockResponse);

      const result = await eventsAPI.getEventsByNFT(chain, address, identifier);

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        `/api/v2/events/chain/${chain}/contract/${address}/nfts/${identifier}`,
      );
      expect(mockGet.firstCall.args[1]).to.be.undefined;
      expect(result.asset_events).to.have.length(1);
      expect(result.next).to.equal("cursor-123");
    });

    test("fetches events for an NFT with parameters", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await eventsAPI.getEventsByNFT(Chain.Mainnet, "0x123", "1", {
        event_type: AssetEventType.TRANSFER,
        limit: 5,
      });

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        event_type: "transfer",
        limit: 5,
      });
    });

    test("handles large token IDs", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      const largeTokenId = "99999999999999999999";
      await eventsAPI.getEventsByNFT(Chain.Mainnet, "0x123", largeTokenId);

      expect(mockGet.firstCall.args[0]).to.include(largeTokenId);
    });

    test("handles different chains", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await eventsAPI.getEventsByNFT(Chain.Polygon, "0x123", "1");

      expect(mockGet.firstCall.args[0]).to.include("polygon");
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("NFT not found"));

      try {
        await eventsAPI.getEventsByNFT(Chain.Mainnet, "0x123", "999");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("NFT not found");
      }
    });
  });

  suite("Constructor", () => {
    test("initializes with get function", () => {
      const { fetcher } = createMockFetcher();
      const api = new EventsAPI(fetcher);

      expect(api).to.be.instanceOf(EventsAPI);
    });
  });

  suite("Event Types", () => {
    test("handles listing events", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [
          {
            event_type: AssetEventType.LISTING,
            event_timestamp: 1234567890,
            chain: "ethereum",
            quantity: 1,
            payment: {
              quantity: "1000000000000000000",
              token_address: "0x0000000000000000000000000000000000000000",
              decimals: 18,
              symbol: "ETH",
            },
            start_date: null,
            expiration_date: 1234567990,
            asset: {
              identifier: "1",
              collection: "test",
              contract: "0x123",
              token_standard: "erc721",
              name: "Test NFT",
              description: "Test",
              image_url: "https://example.com/1.png",
              display_image_url: "https://example.com/1.png",
              display_animation_url: null,
              metadata_url: "https://example.com/metadata/1",
              opensea_url: "https://opensea.io/assets/ethereum/0x123/1",
              updated_at: "2023-01-01T00:00:00Z",
              is_disabled: false,
              is_nsfw: false,
            },
            maker: "0x123",
            taker: "",
            is_private_listing: false,
          } as ListingEvent,
        ],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      const result = await eventsAPI.getEvents();

      expect(result.asset_events[0].event_type).to.equal(
        AssetEventType.LISTING,
      );
      expect((result.asset_events[0] as ListingEvent).maker).to.equal("0x123");
    });

    test("handles sale events", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [
          {
            event_type: AssetEventType.SALE,
            event_timestamp: 1234567890,
            chain: "ethereum",
            quantity: 1,
            transaction: "0xabc",
            order_hash: "0xdef",
            protocol_address: "0x123",
            payment: {
              quantity: "1000000000000000000",
              token_address: "0x0000000000000000000000000000000000000000",
              decimals: 18,
              symbol: "ETH",
            },
            closing_date: 1234567890,
            seller: "0x111",
            buyer: "0x222",
            nft: {} as EventAsset,
          } as SaleEvent,
        ],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      const result = await eventsAPI.getEvents();

      expect(result.asset_events[0].event_type).to.equal(AssetEventType.SALE);
      expect((result.asset_events[0] as SaleEvent).seller).to.equal("0x111");
      expect((result.asset_events[0] as SaleEvent).buyer).to.equal("0x222");
    });

    test("handles transfer events", async () => {
      const mockResponse: GetEventsResponse = {
        asset_events: [
          {
            event_type: AssetEventType.TRANSFER,
            event_timestamp: 1234567890,
            chain: "ethereum",
            quantity: 1,
            transaction: "0xabc",
            from_address: "0x111",
            to_address: "0x222",
            nft: {} as EventAsset,
          } as TransferEvent,
        ],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      const result = await eventsAPI.getEvents();

      expect(result.asset_events[0].event_type).to.equal(
        AssetEventType.TRANSFER,
      );
      expect((result.asset_events[0] as TransferEvent).from_address).to.equal(
        "0x111",
      );
      expect((result.asset_events[0] as TransferEvent).to_address).to.equal(
        "0x222",
      );
    });
  });
});
