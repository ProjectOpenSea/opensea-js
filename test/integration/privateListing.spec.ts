import { describe, expect, test } from "vitest"
import { Chain } from "../../src/types"
import { getFeeRecipient } from "../../src/utils/utils"
import { ensureVarsOrSkip, normalizeChainName } from "../utils/runtime"
import {
  CREATE_LISTING_CHAIN,
  CREATE_LISTING_CONTRACT_ADDRESS,
  CREATE_LISTING_TOKEN_ID,
  getSdkForChain,
  LISTING_AMOUNT,
  requireIntegrationEnv,
  walletAddress,
} from "../utils/setupIntegration"
import { expectValidOrder, getRandomExpiration } from "../utils/utils"

describe(`SDK: Private Listings Integration - ${normalizeChainName(CREATE_LISTING_CHAIN)}`, () => {
  beforeEach(() => {
    requireIntegrationEnv()
  })

  test("Post Private Listing - Mainnet", async function () {
    if (
      !ensureVarsOrSkip(this, {
        CREATE_LISTING_CONTRACT_ADDRESS,
        CREATE_LISTING_TOKEN_ID,
      })
    ) {
      return
    }

    const chain = CREATE_LISTING_CHAIN
    const sdk = getSdkForChain(chain)

    const buyerAddress = "0x0000000000000000000000000000000000000001"
    const expirationTime = getRandomExpiration()

    const privateListing = {
      accountAddress: walletAddress,
      amount: LISTING_AMOUNT,
      asset: {
        tokenAddress: CREATE_LISTING_CONTRACT_ADDRESS,
        tokenId: CREATE_LISTING_TOKEN_ID,
      },
      buyerAddress,
      expirationTime,
    }
    const order = await sdk.createListing(privateListing)
    expectValidOrder(order)

    expect(order.protocolData.parameters.consideration).toBeDefined()

    const hasMarketplaceFee = order.protocolData.parameters.consideration.some(
      (item: { recipient?: string }) =>
        item.recipient?.toLowerCase() ===
        getFeeRecipient(Chain.Mainnet).toLowerCase(),
    )

    expect(hasMarketplaceFee).toBe(false)
  })

  test("Post Regular Listing - Mainnet (for comparison)", async function () {
    if (
      !ensureVarsOrSkip(this, {
        CREATE_LISTING_CONTRACT_ADDRESS,
        CREATE_LISTING_TOKEN_ID,
      })
    ) {
      return
    }

    const chain2 = CREATE_LISTING_CHAIN
    const sdk2 = getSdkForChain(chain2)

    const expirationTime = getRandomExpiration()
    const regularListing = {
      accountAddress: walletAddress,
      amount: LISTING_AMOUNT,
      asset: {
        tokenAddress: CREATE_LISTING_CONTRACT_ADDRESS,
        tokenId: CREATE_LISTING_TOKEN_ID,
      },
      expirationTime,
    }
    const order = await sdk2.createListing(regularListing)
    expectValidOrder(order)

    expect(order.protocolData.parameters.consideration).toBeDefined()
    expect(order.protocolData.parameters.consideration.length).toBeGreaterThan(
      0,
    )
  })
})
