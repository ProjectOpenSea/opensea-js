import { assert } from "chai";
import { suite, test } from "mocha";
import { sdk } from "./setup";
import { CollectionOrderByOption } from "../../src/api/types";
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

  test("Get Collections", async () => {
    const response = await sdk.api.getCollections();
    const { collections, next } = response;
    assert(collections[0], "Collection should not be null");
    assert(collections[0].name, "Collection name should exist");
    assert(next, "Next cursor should be included");

    const response2 = await sdk.api.getCollections(
      CollectionOrderByOption.MARKET_CAP,
    );
    const { collections: collectionsByMarketCap, next: nextByMarketCap } =
      response2;
    assert(collectionsByMarketCap[0], "Collection should not be null");
    assert(collectionsByMarketCap[0].name, "Collection name should exist");
    assert(nextByMarketCap, "Next cursor should be included");

    assert(
      collectionsByMarketCap[0].name != collections[0].name,
      "Collection order should differ",
    );
  });

  test("Get Collections by creator", async () => {
    const response = await sdk.api.getCollections(
      CollectionOrderByOption.CREATED_DATE,
      undefined,
      "cryptoexpert123",
    );
    const { collections } = response;
    assert(collections.length == 2, "Collection should not be null");
    assert(collections[0].collection, "test-7836");
    assert(collections[0].collection, "test-7290");
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
