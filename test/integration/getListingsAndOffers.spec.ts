import { assert } from "chai";
import { suite, test } from "mocha";
import { sdk } from "./setup";

suite("SDK: getAllOffers", () => {
  test("Get All Offers", async () => {
    const slug = "cool-cats-nft";
    const response = await sdk.api.getAllOffers(slug);

    assert(response, "Response should not be null");
    assert(response.offers[0].order_hash, "Order hash should not be null");
    assert(response.offers[0].chain, "Chain should not be null");
    assert(
      response.offers[0].protocol_address,
      "Protocol address should not be null",
    );
    assert(
      response.offers[0].protocol_data,
      "Protocol data should not be null",
    );
  });
});

suite("SDK: getAllListings", () => {
  test("Get All Listings", async () => {
    const slug = "cool-cats-nft";
    const response = await sdk.api.getAllListings(slug);

    assert(response, "Response should not be null");
    assert(response.listings[0].order_hash, "Order hash should not be null");
    assert(response.listings[0].chain, "Chain should not be null");
    assert(
      response.listings[0].protocol_address,
      "Protocol address should not be null",
    );
    assert(
      response.listings[0].protocol_data,
      "Protocol data should not be null",
    );
    assert(response.next, "Cursor for next page should not be null");

    // Should get the next page of listings
    const responsePage2 = await sdk.api.getAllListings(
      slug,
      undefined,
      response.next,
    );
    assert(responsePage2, "Response should not be null");
    assert.notDeepEqual(
      response.listings,
      responsePage2.listings,
      "Response of second page should not equal the response of first page",
    );
    assert.notEqual(
      response.next,
      responsePage2.next,
      "Next cursor should change",
    );
  });
});

suite("SDK: getBestOffer", () => {
  test("Get Best Offer", async () => {
    const slug = "cool-cats-nft";
    const tokenId = 1;
    const response = await sdk.api.getBestOffer(slug, tokenId);

    assert(response, "Response should not be null");
    assert(response.order_hash, "Order hash should not be null");
    assert(response.chain, "Chain should not be null");
    assert(response.protocol_address, "Protocol address should not be null");
    assert(response.protocol_data, "Protocol data should not be null");
  });
});

suite("SDK: getBestListing", () => {
  test("Get Best Listing", async () => {
    const slug = "cool-cats-nft";
    const { listings } = await sdk.api.getAllListings(slug);
    const listing = listings[0];
    const tokenId =
      listing.protocol_data.parameters.offer[0].identifierOrCriteria;
    const response = await sdk.api.getBestListing(slug, tokenId);

    assert(response, "Response should not be null");
    assert(response.order_hash, "Order hash should not be null");
    assert(response.chain, "Chain should not be null");
    assert(response.protocol_address, "Protocol address should not be null");
    assert(response.protocol_data, "Protocol data should not be null");
    assert.equal(
      listing.order_hash,
      response.order_hash,
      "Order hashes should match",
    );
    assert.equal(
      listing.protocol_address,
      response.protocol_address,
      "Protocol addresses should match",
    );
  });
});

suite("SDK: getBestListings", () => {
  test("Get Best Listing", async () => {
    const slug = "cool-cats-nft";
    const response = await sdk.api.getBestListings(slug);

    assert(response, "Response should not be null");
    assert(response.listings, "Listings should not be null");
  });
});
