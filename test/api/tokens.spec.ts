import { describe, expect, test, vi } from "vitest"
import { TokensAPI } from "../../src/api/tokens"
import type {
  GetSwapQuoteResponse,
  GetTokenResponse,
  GetTopTokensResponse,
  GetTrendingTokensResponse,
  Token,
} from "../../src/api/types"
import { createMockFetcher } from "../fixtures/fetcher"

const mockToken: Token = {
  address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  chain: "ethereum",
  name: "Wrapped Ether",
  symbol: "WETH",
  decimals: 18,
  image_url: "https://example.com/weth.png",
  opensea_url:
    "https://opensea.io/tokens/ethereum/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
}

describe("API: TokensAPI", () => {
  let mockGet: ReturnType<typeof vi.fn>
  let tokensAPI: TokensAPI

  beforeEach(() => {
    const { fetcher, mockGet: getMock } = createMockFetcher()
    mockGet = getMock
    tokensAPI = new TokensAPI(fetcher)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("getTrendingTokens", () => {
    test("fetches trending tokens without parameters", async () => {
      const mockResponse: GetTrendingTokensResponse = {
        tokens: [mockToken],
        next: "cursor-123",
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await tokensAPI.getTrendingTokens()

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet.mock.calls[0][0]).toBe("/api/v2/tokens/trending")
      expect(mockGet.mock.calls[0][1]).toBeUndefined()
      expect(result.tokens).toHaveLength(1)
      expect(result.tokens[0].symbol).toBe("WETH")
      expect(result.next).toBe("cursor-123")
    })

    test("fetches trending tokens with limit", async () => {
      const mockResponse: GetTrendingTokensResponse = {
        tokens: [],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      await tokensAPI.getTrendingTokens({ limit: 10 })

      expect(mockGet.mock.calls[0][1]).toEqual({ limit: 10 })
    })

    test("fetches trending tokens with pagination cursor", async () => {
      const mockResponse: GetTrendingTokensResponse = {
        tokens: [],
        next: "cursor-456",
      }

      mockGet.mockResolvedValue(mockResponse)

      await tokensAPI.getTrendingTokens({ next: "cursor-123" })

      expect(mockGet.mock.calls[0][1]).toEqual({ next: "cursor-123" })
    })

    test("fetches trending tokens with limit and next", async () => {
      const mockResponse: GetTrendingTokensResponse = {
        tokens: [],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      await tokensAPI.getTrendingTokens({ limit: 5, next: "cursor-abc" })

      expect(mockGet.mock.calls[0][1]).toEqual({
        limit: 5,
        next: "cursor-abc",
      })
    })

    test("handles empty tokens array", async () => {
      const mockResponse: GetTrendingTokensResponse = {
        tokens: [],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await tokensAPI.getTrendingTokens()

      expect(result.tokens).toEqual([])
    })

    test("throws error on API failure", async () => {
      mockGet.mockRejectedValue(new Error("API Error"))

      try {
        await tokensAPI.getTrendingTokens()
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("API Error")
      }
    })
  })

  describe("getTopTokens", () => {
    test("fetches top tokens without parameters", async () => {
      const mockResponse: GetTopTokensResponse = {
        tokens: [mockToken],
        next: "cursor-123",
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await tokensAPI.getTopTokens()

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet.mock.calls[0][0]).toBe("/api/v2/tokens/top")
      expect(mockGet.mock.calls[0][1]).toBeUndefined()
      expect(result.tokens).toHaveLength(1)
      expect(result.next).toBe("cursor-123")
    })

    test("fetches top tokens with limit", async () => {
      const mockResponse: GetTopTokensResponse = {
        tokens: [],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      await tokensAPI.getTopTokens({ limit: 20 })

      expect(mockGet.mock.calls[0][1]).toEqual({ limit: 20 })
    })

    test("fetches top tokens with pagination cursor", async () => {
      const mockResponse: GetTopTokensResponse = {
        tokens: [],
        next: "cursor-456",
      }

      mockGet.mockResolvedValue(mockResponse)

      await tokensAPI.getTopTokens({ next: "cursor-123" })

      expect(mockGet.mock.calls[0][1]).toEqual({ next: "cursor-123" })
    })

    test("handles empty tokens array", async () => {
      const mockResponse: GetTopTokensResponse = {
        tokens: [],
        next: undefined,
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await tokensAPI.getTopTokens()

      expect(result.tokens).toEqual([])
    })

    test("throws error on API failure", async () => {
      mockGet.mockRejectedValue(new Error("API Error"))

      try {
        await tokensAPI.getTopTokens()
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("API Error")
      }
    })
  })

  describe("getSwapQuote", () => {
    test("fetches swap quote with required parameters", async () => {
      const mockResponse: GetSwapQuoteResponse = {
        price: "1.5",
        route: "direct",
      }

      mockGet.mockResolvedValue(mockResponse)

      const args = {
        token_in: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        token_out: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        amount: "1000000000000000000",
        chain: "ethereum",
      }

      const result = await tokensAPI.getSwapQuote(args)

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet.mock.calls[0][0]).toBe("/api/v2/swap/quote")
      expect(mockGet.mock.calls[0][1]).toEqual(args)
      expect(result).toHaveProperty("price", "1.5")
    })

    test("fetches swap quote with optional parameters", async () => {
      const mockResponse: GetSwapQuoteResponse = {
        price: "1.5",
      }

      mockGet.mockResolvedValue(mockResponse)

      const args = {
        token_in: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        token_out: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        amount: "1000000000000000000",
        chain: "ethereum",
        taker_address: "0x1234567890123456789012345678901234567890",
        slippage: 0.5,
      }

      await tokensAPI.getSwapQuote(args)

      expect(mockGet.mock.calls[0][1]).toEqual(args)
    })

    test("throws error on API failure", async () => {
      mockGet.mockRejectedValue(new Error("Insufficient liquidity"))

      try {
        await tokensAPI.getSwapQuote({
          token_in: "0x123",
          token_out: "0x456",
          amount: "1000",
          chain: "ethereum",
        })
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Insufficient liquidity")
      }
    })
  })

  describe("getToken", () => {
    test("fetches token details", async () => {
      const mockResponse: GetTokenResponse = mockToken

      mockGet.mockResolvedValue(mockResponse)

      const result = await tokensAPI.getToken(
        "ethereum",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      )

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet.mock.calls[0][0]).toBe(
        "/api/v2/chain/ethereum/token/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      )
      expect(result.name).toBe("Wrapped Ether")
      expect(result.symbol).toBe("WETH")
      expect(result.decimals).toBe(18)
    })

    test("handles different chains", async () => {
      const mockResponse: GetTokenResponse = {
        ...mockToken,
        chain: "polygon",
      }

      mockGet.mockResolvedValue(mockResponse)

      await tokensAPI.getToken("polygon", "0x123")

      expect(mockGet.mock.calls[0][0]).toBe("/api/v2/chain/polygon/token/0x123")
    })

    test("handles token with null image_url", async () => {
      const mockResponse: GetTokenResponse = {
        ...mockToken,
        image_url: null,
      }

      mockGet.mockResolvedValue(mockResponse)

      const result = await tokensAPI.getToken("ethereum", "0x123")

      expect(result.image_url).toBeNull()
    })

    test("throws error on API failure", async () => {
      mockGet.mockRejectedValue(new Error("Token not found"))

      try {
        await tokensAPI.getToken("ethereum", "0x000")
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Token not found")
      }
    })
  })

  describe("Constructor", () => {
    test("initializes with fetcher", () => {
      const { fetcher } = createMockFetcher()
      const api = new TokensAPI(fetcher)

      expect(api).toBeInstanceOf(TokensAPI)
    })
  })
})
