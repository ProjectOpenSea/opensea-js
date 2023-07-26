import { assert } from "chai";
import { suite, test } from "mocha";
import { sdk } from "./setup";
import { decodeTokenIds } from "../../src/utils/utils";

suite("SDK: getCollectionOffers", () => {
  test("Get Collection Offers", async () => {
    const slug = "cool-cats-nft";
    const response = await sdk.api.getCollectionOffers(slug);

    assert(response, "Response should not be null");
    assert(response.offers, "Collection offers should not be null");
    assert(response.offers.length > 0, "Collection offers should not be empty");
    const offer = response.offers[0];
    assert(offer.order_hash, "Order hash should not be null");
    const tokens = offer.criteria.encoded_token_ids;
    assert(tokens, "Criteria should not be null");

    const encodedTokends = offer.criteria.encoded_token_ids;
    assert(encodedTokends, "Encoded tokens should not be null");

    const decodedTokenIds = decodeTokenIds(encodedTokends);
    assert(decodedTokenIds[0], "Decoded tokens should not be null");
  });
});
