import { assert } from "chai";
import { suite, test } from "mocha";
import { decodeTokenIds } from "../../src/utils/utils";
import { sdk } from "../utils/setupIntegration";

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

    const encodedTokenIds = offer.criteria.encoded_token_ids;
    assert(encodedTokenIds, "Encoded tokens should not be null");

    const decodedTokenIds = decodeTokenIds(encodedTokenIds);
    assert(decodedTokenIds[0], "Decoded tokens should not be null");
  });
});
