import { assert } from "chai";
import { suite, test } from "mocha";
import { CollectionOrderByOption } from "../../src/api/types";
import { Chain, SafelistStatus } from "../../src/types";
import { getSdkForChain } from "../utils/setupIntegration";
import { processInBatches } from "../utils/utils";

suite("SDK: getCollection", () => {
  test("Get Verified Collection", async () => {
    const slug = "cool-cats-nft";
    const collection = await getSdkForChain(Chain.Mainnet).api.getCollection(
      slug,
    );

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
    const response = await getSdkForChain(Chain.Mainnet).api.getCollections();
    const { collections, next } = response;
    assert(collections[0], "Collection should not be null");
    assert(collections[0].name, "Collection name should exist");
    assert(next, "Next cursor should be included");

    const response2 = await getSdkForChain(Chain.Mainnet).api.getCollections(
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
    const response = await getSdkForChain(Chain.Mainnet).api.getCollections(
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
    const stats = await getSdkForChain(Chain.Mainnet).api.getCollectionStats(
      slug,
    );

    assert(stats, "Stats should not be null");
    assert(stats.total.volume, "Volume should not be null");
    assert(stats.total.sales, "Sales should not be null");
    assert(stats.intervals, "Intervals should exist");
  });

  test("Get Collections for all chains", async () => {
    // Excluding Abstract, ApeChain, Blast, Zora (Internal Server Error) and Solana (no NFT collections)
    const chains = Object.values(Chain).filter(
      (chain) =>
        chain !== Chain.Abstract &&
        chain !== Chain.ApeChain &&
        chain !== Chain.Blast &&
        chain !== Chain.Zora &&
        chain !== Chain.Solana,
    );
    console.log(
      "Skipping Abstract, ApeChain, Blast, Zora due to internal server errors - skipping should be removed when resolved",
    );

    const sdk = getSdkForChain(Chain.Mainnet);

    await processInBatches(chains, 3, async (chain) => {
      try {
        const response = await sdk.api.getCollections(
          CollectionOrderByOption.CREATED_DATE,
          chain,
          undefined,
          false,
          3, // Limit to returning 3 collections per chain to keep test fast
        );

        const { collections } = response;
        assert(
          Array.isArray(collections),
          `Collections should be an array for ${chain}`,
        );
        assert(
          collections.length > 0,
          `Chain ${chain} should have at least one collection`,
        );
        assert(
          collections[0].name,
          `Collection name should exist for ${chain}`,
        );
        assert(
          collections[0].collection,
          `Collection slug should exist for ${chain}`,
        );
      } catch (error) {
        throw new Error(
          `Failed to get collections for chain "${chain}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });
  });
});
