import { describe, expect, test } from "vitest"
import { Chain } from "../../src/types"
import { decodeTokenIds } from "../../src/utils/utils"
import { getSdkForChain } from "../utils/setupIntegration"

describe("SDK: getCollectionOffers", () => {
  test("Get Collection Offers", async () => {
    const slug = "cool-cats-nft"
    const response = await getSdkForChain(
      Chain.Mainnet,
    ).api.getCollectionOffers(slug)

    expect(response, "Response should not be null").toBeTruthy()
    expect(response.offers, "Collection offers should not be null").toBeTruthy()
    expect(response.offers.length).toBeGreaterThan(0)
    const offer = response.offers[0]
    expect(offer.order_hash, "Order hash should not be null").toBeTruthy()
    expect(offer.criteria).toBeTruthy()
    const tokens = offer.criteria?.encoded_token_ids
    expect(tokens).toBeTruthy()

    const encodedTokenIds = offer.criteria?.encoded_token_ids
    expect(encodedTokenIds).toBeTruthy()

    const decodedTokenIds = decodeTokenIds(encodedTokenIds as string)
    expect(decodedTokenIds[0], "Decoded tokens should not be null").toBeTruthy()
  })
})
