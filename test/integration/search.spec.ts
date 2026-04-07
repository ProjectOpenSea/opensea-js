import { describe, expect, test } from "vitest"
import { Chain } from "../../src/types"
import { getSdkForChain } from "../utils/setupIntegration"

describe("SDK: search", () => {
  test("Search for collections by name", async () => {
    const response = await getSdkForChain(Chain.Mainnet).api.search({
      query: "bored ape",
      asset_types: ["collection"],
      limit: 5,
    })

    expect(response.results, "Results should exist").toBeTruthy()
    expect(response.results.length).toBeGreaterThan(0)
    expect(response.results[0].type).toBe("collection")
    expect(
      response.results[0].collection,
      "Collection data should be present",
    ).toBeTruthy()
    expect(
      response.results[0].collection?.name,
      "Collection name should exist",
    ).toBeTruthy()
    expect(
      response.results[0].collection?.opensea_url,
      "Collection opensea_url should exist",
    ).toBeTruthy()
  })

  test("Search across all asset types", async () => {
    const response = await getSdkForChain(Chain.Mainnet).api.search({
      query: "ethereum",
      asset_types: ["collection", "token"],
      limit: 10,
    })

    expect(response.results, "Results should exist").toBeTruthy()
    expect(response.results.length).toBeGreaterThan(0)

    const types = response.results.map(r => r.type)
    expect(
      types.includes("collection") || types.includes("token"),
      "Should return collections or tokens",
    ).toBe(true)
  })
})
