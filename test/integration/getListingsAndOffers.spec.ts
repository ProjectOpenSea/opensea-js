import { describe, expect, test } from "vitest"
import { Chain } from "../../src/types"
import { getSdkForChain } from "../utils/setupIntegration"

describe("SDK: getAllOffers", () => {
  test("Get All Offers", async () => {
    const slug = "cool-cats-nft"
    const response = await getSdkForChain(Chain.Mainnet).api.getAllOffers(slug)

    expect(response, "Response should not be null").toBeTruthy()
    expect(
      response.offers[0].order_hash,
      "Order hash should not be null",
    ).toBeTruthy()
    expect(response.offers[0].chain, "Chain should not be null").toBeTruthy()
    expect(
      response.offers[0].protocol_address,
      "Protocol address should not be null",
    ).toBeTruthy()
    expect(
      response.offers[0].protocol_data,
      "Protocol data should not be null",
    ).toBeTruthy()
  })
})

describe("SDK: getAllListings", () => {
  test("Get All Listings", async () => {
    const slug = "cool-cats-nft"
    const response = await getSdkForChain(Chain.Mainnet).api.getAllListings(
      slug,
    )

    expect(response, "Response should not be null").toBeTruthy()
    expect(
      response.listings[0].order_hash,
      "Order hash should not be null",
    ).toBeTruthy()
    expect(response.listings[0].chain, "Chain should not be null").toBeTruthy()
    expect(
      response.listings[0].protocol_address,
      "Protocol address should not be null",
    ).toBeTruthy()
    expect(
      response.listings[0].protocol_data,
      "Protocol data should not be null",
    ).toBeTruthy()
    // Verify listing has nested price.current structure
    expect(typeof response.listings[0].price).toBe("object")
    expect(typeof response.listings[0].price.current).toBe("object")
    expect(typeof response.listings[0].price.current.currency).toBe("string")
    expect(typeof response.listings[0].price.current.decimals).toBe("number")
    expect(typeof response.listings[0].price.current.value).toBe("string")
    expect(
      response.next,
      "Cursor for next page should not be null",
    ).toBeTruthy()

    // Should get the next page of listings
    const responsePage2 = await getSdkForChain(
      Chain.Mainnet,
    ).api.getAllListings(slug, undefined, response.next)
    expect(responsePage2, "Response should not be null").toBeTruthy()
    expect(response.listings).not.toEqual(responsePage2.listings)
    expect(response.next).not.toBe(responsePage2.next)
  })
})

describe("SDK: getBestOffer", () => {
  test("Get Best Offer", async () => {
    const slug = "cool-cats-nft"
    const tokenId = 1
    const response = await getSdkForChain(Chain.Mainnet).api.getBestOffer(
      slug,
      tokenId,
    )

    expect(typeof response.price.currency).toBe("string")
    expect(typeof response.price.decimals).toBe("number")
    expect(typeof response.price.value).toBe("string")

    expect(response, "Response should not be null").toBeTruthy()
    expect(response.order_hash, "Order hash should not be null").toBeTruthy()
    expect(response.chain, "Chain should not be null").toBeTruthy()
    expect(
      response.protocol_address,
      "Protocol address should not be null",
    ).toBeTruthy()
    expect(
      response.protocol_data,
      "Protocol data should not be null",
    ).toBeTruthy()
  })
})

describe("SDK: getBestListing", () => {
  test("Get Best Listing", async () => {
    const slug = "cool-cats-nft"
    const { listings } = await getSdkForChain(Chain.Mainnet).api.getAllListings(
      slug,
    )
    const listing = listings[0]
    const tokenId =
      listing.protocol_data.parameters.offer[0].identifierOrCriteria
    const response = await getSdkForChain(Chain.Mainnet).api.getBestListing(
      slug,
      tokenId,
    )

    expect(response, "Response should not be null").toBeTruthy()
    expect(response.order_hash, "Order hash should not be null").toBeTruthy()
    expect(response.chain, "Chain should not be null").toBeTruthy()
    expect(
      response.protocol_address,
      "Protocol address should not be null",
    ).toBeTruthy()
    expect(
      response.protocol_data,
      "Protocol data should not be null",
    ).toBeTruthy()
    // Verify listing has nested price.current structure
    expect(typeof response.price).toBe("object")
    expect(typeof response.price.current).toBe("object")
    expect(typeof response.price.current.currency).toBe("string")
    expect(typeof response.price.current.decimals).toBe("number")
    expect(typeof response.price.current.value).toBe("string")
    expect(listing.order_hash).toBe(response.order_hash)
    expect(listing.protocol_address).toBe(response.protocol_address)
  })
})

describe("SDK: getBestListings", () => {
  test("Get Best Listing", async () => {
    const slug = "cool-cats-nft"
    const response = await getSdkForChain(Chain.Mainnet).api.getBestListings(
      slug,
    )

    expect(response, "Response should not be null").toBeTruthy()
    expect(response.listings, "Listings should not be null").toBeTruthy()
  })
})

describe("SDK: getTraitOffers", () => {
  test("Get Trait Offers", async () => {
    const slug = "boredapeyachtclub"
    const type = "Fur"
    const value = "Solid Gold"
    const response = await getSdkForChain(Chain.Mainnet).api.getTraitOffers(
      slug,
      type,
      value,
    )

    expect(response, "Response should not be null").toBeTruthy()
    expect(response.offers, "Offers should not be null").toBeTruthy()
    expect(Array.isArray(response.offers)).toBe(true)

    if (response.offers.length > 0) {
      const offer = response.offers[0]
      expect(offer.order_hash, "Order hash should not be null").toBeTruthy()
      expect(offer.chain, "Chain should not be null").toBeTruthy()
      expect(
        offer.protocol_address,
        "Protocol address should not be null",
      ).toBeTruthy()
      expect(
        offer.protocol_data,
        "Protocol data should not be null",
      ).toBeTruthy()
      expect(
        offer.criteria,
        "Criteria should not be null for trait offers",
      ).toBeTruthy()
      expect(
        offer.criteria?.trait,
        "Trait criteria should not be null",
      ).toBeTruthy()
      expect(offer.criteria?.trait?.type).toBe(type)
      expect(offer.criteria?.trait?.value).toBe(value)
    }
  })

  test("Get Trait Offers with pagination", async () => {
    const slug = "boredapeyachtclub"
    const type = "Fur"
    const value = "Solid Gold"
    const response = await getSdkForChain(Chain.Mainnet).api.getTraitOffers(
      slug,
      type,
      value,
      5,
    )

    expect(response, "Response should not be null").toBeTruthy()
    expect(response.offers, "Offers should not be null").toBeTruthy()
    expect(response.offers.length <= 5).toBe(true)
  })
})
