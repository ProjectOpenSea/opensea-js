import { assert } from "chai";
import { suite, test } from "mocha";
import { sdk } from "./setup";
import { SafelistStatus } from "../../src/types";

suite("SDK: getCollection", () => {
  test("Get Verified Collection", async () => {
    const slug = "cool-cats-nft";
    const collection = await sdk.api.getCollection(slug);

    assert(collection, "Collection should not be null");
    assert(collection.name, "Collection name should exist");
    assert.equal(collection.collection, slug, "Collection slug should match.");
    assert.equal(
      collection.safelistStatus,
      SafelistStatus.VERIFIED,
      "Collection should be verified.",
    );
  });

  test("Get Collection Stats", async () => {
    const slug = "cool-cats-nft";
    const stats = await sdk.api.getCollectionStats(slug);

    assert(stats, "Stats should not be null");
    assert(stats.total.volume, "Volume should not be null");
    assert(stats.total.sales, "Sales should not be null");
    assert(stats.intervals, "Intervals should exist");
  });
});
