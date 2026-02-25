import { expect } from "chai";
import { suite, test } from "mocha";
import * as sinon from "sinon";
import { TokensAPI } from "../../src/api/tokens";
import {
  GetTrendingTokensResponse,
  GetTopTokensResponse,
  GetSwapQuoteResponse,
  GetTokenResponse,
  Token,
} from "../../src/api/types";
import { createMockFetcher } from "../fixtures/fetcher";

const mockToken: Token = {
  address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  chain: "ethereum",
  name: "Wrapped Ether",
  symbol: "WETH",
  decimals: 18,
  image_url: "https://example.com/weth.png",
  opensea_url:
    "https://opensea.io/tokens/ethereum/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
};

suite("API: TokensAPI", () => {
  let mockGet: sinon.SinonStub;
  let tokensAPI: TokensAPI;

  beforeEach(() => {
    const { fetcher, mockGet: getMock } = createMockFetcher();
    mockGet = getMock;
    tokensAPI = new TokensAPI(fetcher);
  });

  afterEach(() => {
    sinon.restore();
  });

  suite("getTrendingTokens", () => {
    test("fetches trending tokens without parameters", async () => {
      const mockResponse: GetTrendingTokensResponse = {
        tokens: [mockToken],
        next: "cursor-123",
      };

      mockGet.resolves(mockResponse);

      const result = await tokensAPI.getTrendingTokens();

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal("/api/v2/tokens/trending");
      expect(mockGet.firstCall.args[1]).to.be.undefined;
      expect(result.tokens).to.have.length(1);
      expect(result.tokens[0].symbol).to.equal("WETH");
      expect(result.next).to.equal("cursor-123");
    });

    test("fetches trending tokens with limit", async () => {
      const mockResponse: GetTrendingTokensResponse = {
        tokens: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await tokensAPI.getTrendingTokens({ limit: 10 });

      expect(mockGet.firstCall.args[1]).to.deep.equal({ limit: 10 });
    });

    test("fetches trending tokens with pagination cursor", async () => {
      const mockResponse: GetTrendingTokensResponse = {
        tokens: [],
        next: "cursor-456",
      };

      mockGet.resolves(mockResponse);

      await tokensAPI.getTrendingTokens({ next: "cursor-123" });

      expect(mockGet.firstCall.args[1]).to.deep.equal({ next: "cursor-123" });
    });

    test("fetches trending tokens with limit and next", async () => {
      const mockResponse: GetTrendingTokensResponse = {
        tokens: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await tokensAPI.getTrendingTokens({ limit: 5, next: "cursor-abc" });

      expect(mockGet.firstCall.args[1]).to.deep.equal({
        limit: 5,
        next: "cursor-abc",
      });
    });

    test("handles empty tokens array", async () => {
      const mockResponse: GetTrendingTokensResponse = {
        tokens: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      const result = await tokensAPI.getTrendingTokens();

      expect(result.tokens).to.be.an("array").that.is.empty;
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("API Error"));

      try {
        await tokensAPI.getTrendingTokens();
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("API Error");
      }
    });
  });

  suite("getTopTokens", () => {
    test("fetches top tokens without parameters", async () => {
      const mockResponse: GetTopTokensResponse = {
        tokens: [mockToken],
        next: "cursor-123",
      };

      mockGet.resolves(mockResponse);

      const result = await tokensAPI.getTopTokens();

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal("/api/v2/tokens/top");
      expect(mockGet.firstCall.args[1]).to.be.undefined;
      expect(result.tokens).to.have.length(1);
      expect(result.next).to.equal("cursor-123");
    });

    test("fetches top tokens with limit", async () => {
      const mockResponse: GetTopTokensResponse = {
        tokens: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      await tokensAPI.getTopTokens({ limit: 20 });

      expect(mockGet.firstCall.args[1]).to.deep.equal({ limit: 20 });
    });

    test("fetches top tokens with pagination cursor", async () => {
      const mockResponse: GetTopTokensResponse = {
        tokens: [],
        next: "cursor-456",
      };

      mockGet.resolves(mockResponse);

      await tokensAPI.getTopTokens({ next: "cursor-123" });

      expect(mockGet.firstCall.args[1]).to.deep.equal({ next: "cursor-123" });
    });

    test("handles empty tokens array", async () => {
      const mockResponse: GetTopTokensResponse = {
        tokens: [],
        next: undefined,
      };

      mockGet.resolves(mockResponse);

      const result = await tokensAPI.getTopTokens();

      expect(result.tokens).to.be.an("array").that.is.empty;
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("API Error"));

      try {
        await tokensAPI.getTopTokens();
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("API Error");
      }
    });
  });

  suite("getSwapQuote", () => {
    test("fetches swap quote with required parameters", async () => {
      const mockResponse: GetSwapQuoteResponse = {
        price: "1.5",
        route: "direct",
      };

      mockGet.resolves(mockResponse);

      const args = {
        token_in: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        token_out: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        amount: "1000000000000000000",
        chain: "ethereum",
      };

      const result = await tokensAPI.getSwapQuote(args);

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal("/api/v2/swap/quote");
      expect(mockGet.firstCall.args[1]).to.deep.equal(args);
      expect(result).to.have.property("price", "1.5");
    });

    test("fetches swap quote with optional parameters", async () => {
      const mockResponse: GetSwapQuoteResponse = {
        price: "1.5",
      };

      mockGet.resolves(mockResponse);

      const args = {
        token_in: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        token_out: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        amount: "1000000000000000000",
        chain: "ethereum",
        taker_address: "0x1234567890123456789012345678901234567890",
        slippage: 0.5,
      };

      await tokensAPI.getSwapQuote(args);

      expect(mockGet.firstCall.args[1]).to.deep.equal(args);
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("Insufficient liquidity"));

      try {
        await tokensAPI.getSwapQuote({
          token_in: "0x123",
          token_out: "0x456",
          amount: "1000",
          chain: "ethereum",
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Insufficient liquidity");
      }
    });
  });

  suite("getToken", () => {
    test("fetches token details", async () => {
      const mockResponse: GetTokenResponse = mockToken;

      mockGet.resolves(mockResponse);

      const result = await tokensAPI.getToken(
        "ethereum",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      );

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/chain/ethereum/token/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      );
      expect(result.name).to.equal("Wrapped Ether");
      expect(result.symbol).to.equal("WETH");
      expect(result.decimals).to.equal(18);
    });

    test("handles different chains", async () => {
      const mockResponse: GetTokenResponse = {
        ...mockToken,
        chain: "polygon",
      };

      mockGet.resolves(mockResponse);

      await tokensAPI.getToken("polygon", "0x123");

      expect(mockGet.firstCall.args[0]).to.equal(
        "/api/v2/chain/polygon/token/0x123",
      );
    });

    test("handles token with null image_url", async () => {
      const mockResponse: GetTokenResponse = {
        ...mockToken,
        image_url: null,
      };

      mockGet.resolves(mockResponse);

      const result = await tokensAPI.getToken("ethereum", "0x123");

      expect(result.image_url).to.be.null;
    });

    test("throws error on API failure", async () => {
      mockGet.rejects(new Error("Token not found"));

      try {
        await tokensAPI.getToken("ethereum", "0x000");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Token not found");
      }
    });
  });

  suite("Constructor", () => {
    test("initializes with fetcher", () => {
      const { fetcher } = createMockFetcher();
      const api = new TokensAPI(fetcher);

      expect(api).to.be.instanceOf(TokensAPI);
    });
  });
});
