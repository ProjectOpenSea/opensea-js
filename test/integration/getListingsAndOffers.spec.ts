import { assert } from "chai";
import { suite, test } from "mocha";
import { Chain } from "../../src/types";
import { getSdkForChain } from "../utils/setupIntegration";

suite("SDK: getAllOffers", () => {
  test("Get All Offers", async () => {
    const slug = "cool-cats-nft";
    const response = await getSdkForChain(Chain.Mainnet).api.getAllOffers(slug);

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
    const response = await getSdkForChain(Chain.Mainnet).api.getAllListings(
      slug,
    );

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
    // Verify listing has nested price.current structure
    assert.isObject(response.listings[0].price, "Price should be an object");
    assert.isObject(
      response.listings[0].price.current,
      "Price.current should be an object",
    );
    assert.isString(
      response.listings[0].price.current.currency,
      "Currency should be a string",
    );
    assert.isNumber(
      response.listings[0].price.current.decimals,
      "Decimals should be a number",
    );
    assert.isString(
      response.listings[0].price.current.value,
      "Price value should be a string",
    );
    assert(response.next, "Cursor for next page should not be null");

    // Should get the next page of listings
    const responsePage2 = await getSdkForChain(
      Chain.Mainnet,
    ).api.getAllListings(slug, undefined, response.next);
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
    const response = await getSdkForChain(Chain.Mainnet).api.getBestOffer(
      slug,
      tokenId,
    );

    assert.isString(response.price.currency, "Currency should be a string");
    assert.isNumber(response.price.decimals, "Decimals should be a number");
    assert.isString(response.price.value, "Price value should be a string");

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
    const { listings } = await getSdkForChain(Chain.Mainnet).api.getAllListings(
      slug,
    );
    const listing = listings[0];
    const tokenId =
      listing.protocol_data.parameters.offer[0].identifierOrCriteria;
    const response = await getSdkForChain(Chain.Mainnet).api.getBestListing(
      slug,
      tokenId,
    );

    assert(response, "Response should not be null");
    assert(response.order_hash, "Order hash should not be null");
    assert(response.chain, "Chain should not be null");
    assert(response.protocol_address, "Protocol address should not be null");
    assert(response.protocol_data, "Protocol data should not be null");
    // Verify listing has nested price.current structure
    assert.isObject(response.price, "Price should be an object");
    assert.isObject(
      response.price.current,
      "Price.current should be an object",
    );
    assert.isString(
      response.price.current.currency,
      "Currency should be a string",
    );
    assert.isNumber(
      response.price.current.decimals,
      "Decimals should be a number",
    );
    assert.isString(
      response.price.current.value,
      "Price value should be a string",
    );
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
    const response = await getSdkForChain(Chain.Mainnet).api.getBestListings(
      slug,
    );

    assert(response, "Response should not be null");
    assert(response.listings, "Listings should not be null");
  });
});

suite("SDK: getTraitOffers", () => {
  test("Get Trait Offers", async () => {
    const slug = "boredapeyachtclub";
    const type = "Fur";
    const value = "Solid Gold";
    const response = await getSdkForChain(Chain.Mainnet).api.getTraitOffers(
      slug,
      type,
      value,
    );

    assert(response, "Response should not be null");
    assert(response.offers, "Offers should not be null");
    assert(Array.isArray(response.offers), "Offers should be an array");

    if (response.offers.length > 0) {
      const offer = response.offers[0];
      assert(offer.order_hash, "Order hash should not be null");
      assert(offer.chain, "Chain should not be null");
      assert(offer.protocol_address, "Protocol address should not be null");
      assert(offer.protocol_data, "Protocol data should not be null");
      assert(offer.criteria, "Criteria should not be null for trait offers");
      assert(offer.criteria.trait, "Trait criteria should not be null");
      assert.equal(offer.criteria.trait.type, type, "Trait type should match");
      assert.equal(
        offer.criteria.trait.value,
        value,
        "Trait value should match",
      );
    }
  });

  test("Get Trait Offers with pagination", async () => {
    const slug = "boredapeyachtclub";
    const type = "Fur";
    const value = "Solid Gold";
    const response = await getSdkForChain(Chain.Mainnet).api.getTraitOffers(
      slug,
      type,
      value,
      5,
    );

    assert(response, "Response should not be null");
    assert(response.offers, "Offers should not be null");
    assert(response.offers.length <= 5, "Should respect limit parameter");
  });
});
