import { assert } from "chai";
import { JsonRpcProvider } from "ethers";
import { suite, test } from "mocha";
import { OpenSeaSDK } from "../../src/sdk";
import { Chain } from "../../src/types";
import { OPENSEA_API_KEY } from "../utils/env";

// Create SDK without wallet - only needs API key for read-only operations
const provider = new JsonRpcProvider("https://cloudflare-eth.com");
const sdk = new OpenSeaSDK(provider, {
  chain: Chain.Mainnet,
  apiKey: OPENSEA_API_KEY,
});

suite("SDK: getOrderByHash", () => {
  test("Get Order By Hash - Offer", async () => {
    const slug = "boredapeyachtclub";

    // First get an offer to get its hash and protocol address
    const offersResponse = await sdk.api.getAllOffers(slug);
    assert(offersResponse.offers.length > 0, "Should have at least one offer");

    const offer = offersResponse.offers[0];
    const orderHash = offer.order_hash;
    const protocolAddress = offer.protocol_address;

    // Now fetch the same order by hash
    const response = await sdk.api.getOrderByHash(orderHash, protocolAddress);

    assert(response, "Response should not be null");
    assert.equal(
      response.order_hash,
      orderHash,
      "Order hash should match the requested hash",
    );
    assert.equal(
      response.protocol_address,
      protocolAddress,
      "Protocol address should match",
    );
    assert(response.protocol_data, "Protocol data should not be null");
    assert(
      response.protocol_data.parameters,
      "Protocol data parameters should not be null",
    );
    assert(
      response.protocol_data.parameters.offerer,
      "Offerer should not be null",
    );
  });

  test("Get Order By Hash - Listing", async () => {
    const slug = "boredapeyachtclub";

    // First get a listing to get its hash and protocol address
    const listingsResponse = await sdk.api.getAllListings(slug);
    assert(
      listingsResponse.listings.length > 0,
      "Should have at least one listing",
    );

    const listing = listingsResponse.listings[0];
    const orderHash = listing.order_hash;
    const protocolAddress = listing.protocol_address;

    // Now fetch the same order by hash
    const response = await sdk.api.getOrderByHash(orderHash, protocolAddress);

    assert(response, "Response should not be null");
    assert.equal(
      response.order_hash,
      orderHash,
      "Order hash should match the requested hash",
    );
    assert.equal(
      response.protocol_address,
      protocolAddress,
      "Protocol address should match",
    );
    assert(response.protocol_data, "Protocol data should not be null");
    assert(
      response.protocol_data.parameters,
      "Protocol data parameters should not be null",
    );
  });

  test("Get Order By Hash returns data usable for cancellation", async () => {
    const slug = "boredapeyachtclub";

    // Get an offer
    const offersResponse = await sdk.api.getAllOffers(slug);
    assert(offersResponse.offers.length > 0, "Should have at least one offer");

    const offer = offersResponse.offers[0];

    // Fetch by hash
    const response = await sdk.api.getOrderByHash(
      offer.order_hash,
      offer.protocol_address,
    );

    // Verify the response has fields needed for cancellation
    assert(
      response.protocol_address,
      "protocol_address is required for cancel",
    );
    assert(response.protocol_data, "protocol_data is required for cancel");
    assert(
      response.protocol_data.parameters,
      "protocol_data.parameters is required for cancel",
    );
    assert(
      response.protocol_data.parameters.offerer,
      "offerer is required for cancel",
    );
    assert(
      Array.isArray(response.protocol_data.parameters.offer),
      "offer array is required for cancel",
    );
    assert(
      Array.isArray(response.protocol_data.parameters.consideration),
      "consideration array is required for cancel",
    );
  });
});
