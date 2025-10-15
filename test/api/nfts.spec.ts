import { expect } from "chai";
import { suite, test } from "mocha";
import * as sinon from "sinon";
import { NFTsAPI } from "../../src/api/nfts";
import {
  ListNFTsResponse,
  GetNFTResponse,
  GetContractResponse,
} from "../../src/api/types";
import { Chain } from "../../src/types";
import { createMockFetcher } from "../fixtures/fetcher";
import { mockNFT, mockNFTDetailed, createMockNFT } from "../fixtures/nfts";

suite("API: NFTsAPI", () => {
  let mockGet: sinon.SinonStub;
  let mockPost: sinon.SinonStub;
  let nftsAPI: NFTsAPI;

  beforeEach(() => {
    const {
      fetcher,
      mockGet: getMock,
      mockPost: postMock,
    } = createMockFetcher();
    mockGet = getMock;
    mockPost = postMock;
    nftsAPI = new NFTsAPI(fetcher, Chain.Mainnet);
  });

  afterEach(() => {
    sinon.restore();
  });

  suite("getNFTsByCollection", () => {
    test("fetches NFTs for a collection without parameters", async () => {
      const mockResponse: ListNFTsResponse = {
        nfts: [mockNFT],
        next: "cursor-123",
      };

      mockGet.resolves(mockResponse);

      const result = await nftsAPI.getNFTsByCollection("test-collection");

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/collection/test-collection/nfts",
      );
      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: undefined,
        next: undefined,
      });
      expect(result.nfts).to.have.length(1);
      expect(result.next).to.equal("cursor-123");
    });

    test("fetches NFTs with limit parameter", async () => {
      const mockResponse = {
        nfts: [],
        next: undefined,
      } as unknown as ListNFTsResponse;

      mockGet.resolves(mockResponse);

      await nftsAPI.getNFTsByCollection("test-collection", 50);

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: 50,
        next: undefined,
      });
    });

    test("fetches NFTs with pagination cursor", async () => {
      const mockResponse = {
        nfts: [],
        next: undefined,
      } as unknown as ListNFTsResponse;

      mockGet.resolves(mockResponse);

      await nftsAPI.getNFTsByCollection(
        "test-collection",
        undefined,
        "cursor-abc",
      );

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: undefined,
        next: "cursor-abc",
      });
    });

    test("fetches NFTs with both limit and pagination", async () => {
      const mockResponse = {
        nfts: [],
        next: undefined,
      } as unknown as ListNFTsResponse;

      mockGet.resolves(mockResponse);

      await nftsAPI.getNFTsByCollection("test-collection", 25, "cursor-xyz");

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: 25,
        next: "cursor-xyz",
      });
    });

    test("handles empty NFTs array", async () => {
      const mockResponse = {
        nfts: [],
        next: undefined,
      } as unknown as ListNFTsResponse;

      mockGet.resolves(mockResponse);

      const result = await nftsAPI.getNFTsByCollection("test-collection");

      expect(result.nfts).to.be.an("array").that.is.empty;
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("Collection not found"));

      try {
        await nftsAPI.getNFTsByCollection("nonexistent-collection");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Collection not found");
      }
    });
  });

  suite("getNFTsByContract", () => {
    test("fetches NFTs for a contract without optional parameters", async () => {
      const mockResponse = {
        nfts: [createMockNFT({ identifier: "1", contract: "0xabc123" })],
        next: undefined,
      } as unknown as ListNFTsResponse;

      mockGet.resolves(mockResponse);

      const result = await nftsAPI.getNFTsByContract("0xabc123");

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        `/api/v2/chain/${Chain.Mainnet}/contract/0xabc123/nfts`,
      );
      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: undefined,
        next: undefined,
      });
      expect(result.nfts).to.have.length(1);
    });

    test("fetches NFTs with limit parameter", async () => {
      const mockResponse = {
        nfts: [],
        next: undefined,
      } as unknown as ListNFTsResponse;

      mockGet.resolves(mockResponse);

      await nftsAPI.getNFTsByContract("0xabc123", 30);

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: 30,
        next: undefined,
      });
    });

    test("fetches NFTs with pagination cursor", async () => {
      const mockResponse = {
        nfts: [],
        next: undefined,
      } as unknown as ListNFTsResponse;

      mockGet.resolves(mockResponse);

      await nftsAPI.getNFTsByContract("0xabc123", undefined, "cursor-def");

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: undefined,
        next: "cursor-def",
      });
    });

    test("fetches NFTs with custom chain parameter", async () => {
      const mockResponse = {
        nfts: [],
        next: undefined,
      } as unknown as ListNFTsResponse;

      mockGet.resolves(mockResponse);

      await nftsAPI.getNFTsByContract(
        "0xabc123",
        undefined,
        undefined,
        Chain.Polygon,
      );

      expect(mockGet.firstCall.args[0]).to.equal(
        `/api/v2/chain/${Chain.Polygon}/contract/0xabc123/nfts`,
      );
    });

    test("uses default chain when not specified", async () => {
      const mockResponse = {
        nfts: [],
        next: undefined,
      } as unknown as ListNFTsResponse;

      mockGet.resolves(mockResponse);

      await nftsAPI.getNFTsByContract("0xabc123");

      expect(mockGet.firstCall.args[0]).to.include(Chain.Mainnet);
    });

    test("fetches NFTs with all parameters", async () => {
      const mockResponse = {
        nfts: [],
        next: undefined,
      } as unknown as ListNFTsResponse;

      mockGet.resolves(mockResponse);

      await nftsAPI.getNFTsByContract(
        "0xabc123",
        20,
        "cursor-123",
        Chain.Polygon,
      );

      expect(mockGet.firstCall.args[0]).to.equal(
        `/api/v2/chain/${Chain.Polygon}/contract/0xabc123/nfts`,
      );
      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: 20,
        next: "cursor-123",
      });
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("Contract not found"));

      try {
        await nftsAPI.getNFTsByContract("0xinvalid");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Contract not found");
      }
    });
  });

  suite("getNFTsByAccount", () => {
    test("fetches NFTs owned by an account without optional parameters", async () => {
      const mockResponse = {
        nfts: [
          createMockNFT({ identifier: "1", contract: "0x123" }),
          createMockNFT({ identifier: "2", contract: "0x456" }),
        ],
        next: undefined,
      } as unknown as ListNFTsResponse;

      mockGet.resolves(mockResponse);

      const result = await nftsAPI.getNFTsByAccount("0xowner123");

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        `/api/v2/chain/${Chain.Mainnet}/account/0xowner123/nfts`,
      );
      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: undefined,
        next: undefined,
      });
      expect(result.nfts).to.have.length(2);
    });

    test("fetches NFTs with limit parameter", async () => {
      const mockResponse = {
        nfts: [],
        next: undefined,
      } as unknown as ListNFTsResponse;

      mockGet.resolves(mockResponse);

      await nftsAPI.getNFTsByAccount("0xowner123", 15);

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: 15,
        next: undefined,
      });
    });

    test("fetches NFTs with pagination cursor", async () => {
      const mockResponse = {
        nfts: [],
        next: undefined,
      } as unknown as ListNFTsResponse;

      mockGet.resolves(mockResponse);

      await nftsAPI.getNFTsByAccount("0xowner123", undefined, "cursor-page2");

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: undefined,
        next: "cursor-page2",
      });
    });

    test("fetches NFTs with custom chain parameter", async () => {
      const mockResponse = {
        nfts: [],
        next: undefined,
      } as unknown as ListNFTsResponse;

      mockGet.resolves(mockResponse);

      await nftsAPI.getNFTsByAccount(
        "0xowner123",
        undefined,
        undefined,
        Chain.Polygon,
      );

      expect(mockGet.firstCall.args[0]).to.equal(
        `/api/v2/chain/${Chain.Polygon}/account/0xowner123/nfts`,
      );
    });

    test("uses default chain when not specified", async () => {
      const mockResponse = {
        nfts: [],
        next: undefined,
      } as unknown as ListNFTsResponse;

      mockGet.resolves(mockResponse);

      await nftsAPI.getNFTsByAccount("0xowner123");

      expect(mockGet.firstCall.args[0]).to.include(Chain.Mainnet);
    });

    test("fetches NFTs with all parameters", async () => {
      const mockResponse = {
        nfts: [],
        next: undefined,
      } as unknown as ListNFTsResponse;

      mockGet.resolves(mockResponse);

      await nftsAPI.getNFTsByAccount(
        "0xowner123",
        10,
        "cursor-next",
        Chain.Base,
      );

      expect(mockGet.firstCall.args[0]).to.equal(
        `/api/v2/chain/${Chain.Base}/account/0xowner123/nfts`,
      );
      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: 10,
        next: "cursor-next",
      });
    });

    test("handles empty NFTs array", async () => {
      const mockResponse = {
        nfts: [],
        next: undefined,
      } as unknown as ListNFTsResponse;

      mockGet.resolves(mockResponse);

      const result = await nftsAPI.getNFTsByAccount("0xowner123");

      expect(result.nfts).to.be.an("array").that.is.empty;
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("Account not found"));

      try {
        await nftsAPI.getNFTsByAccount("0xinvalid");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Account not found");
      }
    });
  });

  suite("getNFT", () => {
    test("fetches a single NFT by contract and identifier", async () => {
      const mockResponse: GetNFTResponse = {
        nft: mockNFTDetailed,
      };

      mockGet.resolves(mockResponse);

      const result = await nftsAPI.getNFT("0xcontract123", "1234");

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        `/api/v2/chain/${Chain.Mainnet}/contract/0xcontract123/nfts/1234`,
      );
      expect(mockGet.firstCall.args[1]).to.be.undefined;
      expect(result.nft.identifier).to.equal("1234");
      expect(result.nft.name).to.equal("Test NFT #1234");
    });

    test("fetches NFT with custom chain parameter", async () => {
      const mockResponse: GetNFTResponse = {
        nft: createMockNFT({ identifier: "5678", contract: "0xcontract456" }),
      };

      mockGet.resolves(mockResponse);

      await nftsAPI.getNFT("0xcontract456", "5678", Chain.Arbitrum);

      expect(mockGet.firstCall.args[0]).to.equal(
        `/api/v2/chain/${Chain.Arbitrum}/contract/0xcontract456/nfts/5678`,
      );
    });

    test("uses default chain when not specified", async () => {
      const mockResponse: GetNFTResponse = {
        nft: createMockNFT({ identifier: "1", contract: "0xcontract123" }),
      };

      mockGet.resolves(mockResponse);

      await nftsAPI.getNFT("0xcontract123", "1");

      expect(mockGet.firstCall.args[0]).to.include(Chain.Mainnet);
    });

    test("handles large token identifiers", async () => {
      const mockResponse: GetNFTResponse = {
        nft: createMockNFT({
          identifier: "99999999999999999999",
          contract: "0xcontract123",
        }),
      };

      mockGet.resolves(mockResponse);

      const largeId = "99999999999999999999";
      await nftsAPI.getNFT("0xcontract123", largeId);

      expect(mockGet.firstCall.args[0]).to.include(largeId);
    });

    test("throws error when NFT not found", async () => {
      mockGet.rejects(new Error("NFT not found"));

      try {
        await nftsAPI.getNFT("0xcontract123", "99999");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("NFT not found");
      }
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("Server Error"));

      try {
        await nftsAPI.getNFT("0xcontract123", "1");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Server Error");
      }
    });
  });

  suite("refreshNFTMetadata", () => {
    test("refreshes metadata for an NFT", async () => {
      const mockResponse = { success: true } as unknown;

      mockPost.resolves(mockResponse);

      const result = await nftsAPI.refreshNFTMetadata("0xcontract123", "1234");

      expect(mockPost.calledOnce).to.be.true;
      expect(mockPost.firstCall.args[0]).to.equal(
        `/api/v2/chain/${Chain.Mainnet}/contract/0xcontract123/nfts/1234/refresh`,
      );
      expect(mockPost.firstCall.args[1]).to.deep.equal({});
      expect(result).to.deep.equal(mockResponse);
    });

    test("refreshes metadata with custom chain parameter", async () => {
      const mockResponse = { success: true } as unknown;

      mockPost.resolves(mockResponse);

      await nftsAPI.refreshNFTMetadata("0xcontract456", "5678", Chain.Optimism);

      expect(mockPost.firstCall.args[0]).to.equal(
        `/api/v2/chain/${Chain.Optimism}/contract/0xcontract456/nfts/5678/refresh`,
      );
    });

    test("uses default chain when not specified", async () => {
      const mockResponse = { success: true } as unknown;

      mockPost.resolves(mockResponse);

      await nftsAPI.refreshNFTMetadata("0xcontract123", "1");

      expect(mockPost.firstCall.args[0]).to.include(Chain.Mainnet);
    });

    test("sends empty body in POST request", async () => {
      const mockResponse = { success: true } as unknown;

      mockPost.resolves(mockResponse);

      await nftsAPI.refreshNFTMetadata("0xcontract123", "1");

      expect(mockPost.firstCall.args[1]).to.deep.equal({});
    });

    test("handles large token identifiers", async () => {
      const mockResponse = { success: true } as unknown;

      mockPost.resolves(mockResponse);

      const largeId = "88888888888888888888";
      await nftsAPI.refreshNFTMetadata("0xcontract123", largeId);

      expect(mockPost.firstCall.args[0]).to.include(largeId);
    });

    test("throws error when NFT not found", async () => {
      mockPost.rejects(new Error("NFT not found"));

      try {
        await nftsAPI.refreshNFTMetadata("0xcontract123", "99999");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("NFT not found");
      }
    });

    test("throws error on API failure", async () => {
      mockPost.rejects(new Error("Refresh failed"));

      try {
        await nftsAPI.refreshNFTMetadata("0xcontract123", "1");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Refresh failed");
      }
    });
  });

  suite("getContract", () => {
    test("fetches contract information without optional chain parameter", async () => {
      const mockResponse: GetContractResponse = {
        address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
        chain: "ethereum",
        collection: "boredapeyachtclub",
        name: "Bored Ape Yacht Club",
        contract_standard: "erc721",
      };

      mockGet.resolves(mockResponse);

      const result = await nftsAPI.getContract(
        "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
      );

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        `/api/v2/chain/${Chain.Mainnet}/contract/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d`,
      );
      expect(result.address).to.equal(
        "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
      );
      expect(result.collection).to.equal("boredapeyachtclub");
      expect(result.name).to.equal("Bored Ape Yacht Club");
      expect(result.contract_standard).to.equal("erc721");
    });

    test("fetches contract with custom chain parameter", async () => {
      const mockResponse: GetContractResponse = {
        address: "0xabc123",
        chain: "polygon",
        collection: "test-collection",
        name: "Test Contract",
        contract_standard: "erc1155",
      };

      mockGet.resolves(mockResponse);

      const result = await nftsAPI.getContract("0xabc123", Chain.Polygon);

      expect(mockGet.firstCall.args[0]).to.equal(
        `/api/v2/chain/${Chain.Polygon}/contract/0xabc123`,
      );
      expect(result.chain).to.equal("polygon");
    });

    test("uses default chain when not specified", async () => {
      const mockResponse: GetContractResponse = {
        address: "0xtest",
        chain: "ethereum",
        collection: null,
        name: "Test",
        contract_standard: "erc721",
      };

      mockGet.resolves(mockResponse);

      await nftsAPI.getContract("0xtest");

      expect(mockGet.firstCall.args[0]).to.include(Chain.Mainnet);
    });

    test("handles contract without associated collection", async () => {
      const mockResponse: GetContractResponse = {
        address: "0xnoCollection",
        chain: "ethereum",
        collection: null,
        name: "Standalone Contract",
        contract_standard: "erc721",
      };

      mockGet.resolves(mockResponse);

      const result = await nftsAPI.getContract("0xnoCollection");

      expect(result.collection).to.be.null;
      expect(result.name).to.equal("Standalone Contract");
    });

    test("handles ERC1155 contracts", async () => {
      const mockResponse: GetContractResponse = {
        address: "0xerc1155",
        chain: "ethereum",
        collection: "multi-token-collection",
        name: "Multi Token Contract",
        contract_standard: "erc1155",
      };

      mockGet.resolves(mockResponse);

      const result = await nftsAPI.getContract("0xerc1155");

      expect(result.contract_standard).to.equal("erc1155");
    });

    test("handles different chains", async () => {
      const chains = [
        Chain.Mainnet,
        Chain.Polygon,
        Chain.Arbitrum,
        Chain.Optimism,
        Chain.Base,
      ];

      for (const chain of chains) {
        mockGet.reset();
        const mockResponse: GetContractResponse = {
          address: "0xtest",
          chain: chain.toLowerCase(),
          collection: "test",
          name: "Test",
          contract_standard: "erc721",
        };

        mockGet.resolves(mockResponse);

        await nftsAPI.getContract("0xtest", chain);

        expect(mockGet.firstCall.args[0]).to.equal(
          `/api/v2/chain/${chain}/contract/0xtest`,
        );
      }
    });

    test("preserves contract address case", async () => {
      const mockResponse: GetContractResponse = {
        address: "0xAbC123DeF456",
        chain: "ethereum",
        collection: "test",
        name: "Test",
        contract_standard: "erc721",
      };

      mockGet.resolves(mockResponse);

      await nftsAPI.getContract("0xAbC123DeF456");

      expect(mockGet.firstCall.args[0]).to.include("0xAbC123DeF456");
    });

    test("throws error when contract not found", async () => {
      mockGet.rejects(new Error("Contract not found"));

      try {
        await nftsAPI.getContract("0xinvalid");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Contract not found");
      }
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("Server Error"));

      try {
        await nftsAPI.getContract("0xtest");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Server Error");
      }
    });
  });

  suite("Constructor", () => {
    test("initializes with get, post, and chain parameters", () => {
      const { fetcher } = createMockFetcher();
      const api = new NFTsAPI(fetcher, Chain.Mainnet);

      expect(api).to.be.instanceOf(NFTsAPI);
    });

    test("initializes with different chain", () => {
      const { fetcher } = createMockFetcher();
      const api = new NFTsAPI(fetcher, Chain.Polygon);

      expect(api).to.be.instanceOf(NFTsAPI);
    });
  });
});
