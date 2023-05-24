import { assert } from "chai";
import { suite, test } from "mocha";
import { sdk } from "./init";
import { SafelistStatus } from "../types";

suite("SDK: getCollection", () => {
  test("Get Verified Collection", async () => {
    const slug = "cool-cats-nft";
    const collection = await sdk.api.getCollection(slug);

    assert(collection, "Collection should not be null");
    assert(collection.name, "Collection name should exist");
    assert(collection.slug === slug, "Collection slug should match.");
    assert(
      collection.safelistRequestStatus === SafelistStatus.VERIFIED,
      "Collection should be verified."
    );
    assert(collection.stats, "Collection stats should not be null");
  });
});
