import { assert } from "chai";
import { suite, test } from "mocha";
import { Chain } from "../../src/types";
import { getSdkForChain } from "../utils/setupIntegration";

suite("SDK: search", () => {
  test("Search for collections by name", async () => {
    const response = await getSdkForChain(Chain.Mainnet).api.search({
      query: "bored ape",
      asset_types: ["collection"],
      limit: 5,
    });

    assert(response.results, "Results should exist");
    assert(response.results.length > 0, "Should return at least one result");
    assert.equal(
      response.results[0].type,
      "collection",
      "First result should be a collection",
    );
    assert(response.results[0].collection, "Collection data should be present");
    assert(
      response.results[0].collection?.name,
      "Collection name should exist",
    );
    assert(
      response.results[0].collection?.opensea_url,
      "Collection opensea_url should exist",
    );
  });

  test("Search across all asset types", async () => {
    const response = await getSdkForChain(Chain.Mainnet).api.search({
      query: "ethereum",
      asset_types: ["collection", "token"],
      limit: 10,
    });

    assert(response.results, "Results should exist");
    assert(response.results.length > 0, "Should return at least one result");

    const types = response.results.map((r) => r.type);
    assert(
      types.includes("collection") || types.includes("token"),
      "Should return collections or tokens",
    );
  });
});
