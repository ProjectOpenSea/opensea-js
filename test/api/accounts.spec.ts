import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { AccountsAPI } from "../../src/api/accounts"
import type {
  ClosedPositionsResponse,
  PositionTokenTransfersResponse,
  WalletPnlResponse,
} from "../../src/api/types"
import { Chain } from "../../src/types"
import { createMockFetcher } from "../fixtures/fetcher"

const ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"

describe("API: AccountsAPI P&L", () => {
  let mockGet: ReturnType<typeof vi.fn>
  let accountsAPI: AccountsAPI

  beforeEach(() => {
    const { fetcher, mockGet: getMock } = createMockFetcher()
    mockGet = getMock
    accountsAPI = new AccountsAPI(fetcher, Chain.Mainnet)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("getWalletPnl", () => {
    test("fetches aggregated trading P&L for an account", async () => {
      const mockResponse = {
        realizedPnlUsd: "+1840.25",
        unrealizedPnlUsd: "-320.10",
        totalPnlUsd: "+1520.15",
        netInvestedUsd: "12500",
        currentValueUsd: "12179.90",
        returnPercentage: "+12.16",
      } as unknown as WalletPnlResponse

      mockGet.mockResolvedValue(mockResponse)

      const result = await accountsAPI.getWalletPnl(ADDRESS)

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet.mock.calls[0][0]).toBe(`/api/v2/account/${ADDRESS}/pnl`)
      expect(result.totalPnlUsd).toBe("+1520.15")
    })
  })

  describe("getWalletClosedPositions", () => {
    test("fetches closed positions with pagination args", async () => {
      const mockResponse = {
        closedPositions: [],
        totalCount: 0,
        next: undefined,
      } as unknown as ClosedPositionsResponse

      mockGet.mockResolvedValue(mockResponse)

      await accountsAPI.getWalletClosedPositions(ADDRESS, {
        sortBy: "realized_pnl_usd",
        limit: 50,
        next: "cursor-123",
      })

      expect(mockGet.mock.calls[0][0]).toBe(
        `/api/v2/account/${ADDRESS}/pnl/closed-positions`,
      )
      expect(mockGet.mock.calls[0][1]).toEqual({
        sortBy: "realized_pnl_usd",
        limit: 50,
        next: "cursor-123",
      })
    })

    test("fetches closed positions without args", async () => {
      const mockResponse = {
        closedPositions: [],
        totalCount: 0,
      } as unknown as ClosedPositionsResponse

      mockGet.mockResolvedValue(mockResponse)

      await accountsAPI.getWalletClosedPositions(ADDRESS)

      expect(mockGet.mock.calls[0][1]).toBeUndefined()
    })
  })

  describe("getWalletTokenTransfers", () => {
    test("fetches position token transfers with required currency args", async () => {
      const mockResponse = {
        tokenTransfers: [],
        totalCount: 0,
        next: undefined,
      } as unknown as PositionTokenTransfersResponse

      mockGet.mockResolvedValue(mockResponse)

      await accountsAPI.getWalletTokenTransfers(ADDRESS, {
        contractAddress: "0x0000000000000000000000000000000000000000",
        chain: "ethereum",
        limit: 20,
      })

      expect(mockGet.mock.calls[0][0]).toBe(
        `/api/v2/account/${ADDRESS}/pnl/token-transfers`,
      )
      expect(mockGet.mock.calls[0][1]).toEqual({
        contractAddress: "0x0000000000000000000000000000000000000000",
        chain: "ethereum",
        limit: 20,
      })
    })
  })
})
