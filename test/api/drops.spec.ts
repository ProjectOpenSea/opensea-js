import { beforeEach, describe, expect, test, type vi } from "vitest"
import { DropsAPI } from "../../src/api/drops"
import type { CrossChainDropMintResponse } from "../../src/api/types"
import { createMockFetcher } from "../fixtures/fetcher"

describe("API: DropsAPI", () => {
  let mockPost: ReturnType<typeof vi.fn>
  let dropsAPI: DropsAPI

  beforeEach(() => {
    const { fetcher, mockPost: postMock } = createMockFetcher()
    mockPost = postMock
    dropsAPI = new DropsAPI(fetcher)
  })

  test("builds cross-chain mint transactions with the full request", async () => {
    const response: CrossChainDropMintResponse = {
      transactions: [
        {
          chain: "base",
          to: "0xrelay",
          data: "0x1234",
          value: "1000",
          valueHex: "0x3e8",
        },
      ],
      receiptRequest: {
        swapQuote: {
          fromAssets: [
            {
              chain: "base",
              contract: "0x0000000000000000000000000000000000000000",
              amount: "1000",
            },
          ],
          toAssets: [
            {
              chain: "ape_chain",
              contract: "0xnft",
              tokenId: "0",
              amount: "1",
            },
          ],
        },
        relayRequestId: "0xrequest",
      },
    }
    mockPost.mockResolvedValue(response)

    const result = await dropsAPI.buildCrossChainMintTransactions("pyro", {
      payer: "0xpayer",
      minter: "0xminter",
      quantity: 1,
      payment: {
        chain: "base",
        tokenAddress: "0x0000000000000000000000000000000000000000",
      },
    })

    expect(mockPost).toHaveBeenCalledWith(
      "/api/v2/drops/pyro/cross_chain_mint",
      {
        payer: "0xpayer",
        minter: "0xminter",
        quantity: 1,
        payment: {
          chain: "base",
          tokenAddress: "0x0000000000000000000000000000000000000000",
        },
      },
    )
    expect(result).toBe(response)
  })
})
