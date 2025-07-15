import { expect } from "chai";
import { suite, test } from "mocha";
import { OPENSEA_FEE_RECIPIENT } from "../../src/constants";
import {
  LISTING_AMOUNT,
  TOKEN_ADDRESS_MAINNET,
  TOKEN_ID_MAINNET,
  sdk,
  walletAddress,
} from "../integration/setup";
import { expectValidOrder, getRandomExpiration } from "../utils/utils";

suite("SDK: Private Listings Integration", () => {
  test("Post Private Listing - Mainnet", async function () {
    if (!TOKEN_ADDRESS_MAINNET || !TOKEN_ID_MAINNET) {
      this.skip();
    }

    const buyerAddress = "0x0000000000000000000000000000000000000001";
    const expirationTime = getRandomExpiration();

    const privateListing = {
      accountAddress: walletAddress,
      startAmount: LISTING_AMOUNT,
      asset: {
        tokenAddress: TOKEN_ADDRESS_MAINNET,
        tokenId: TOKEN_ID_MAINNET,
      },
      buyerAddress,
      expirationTime,
    };

    const order = await sdk.createListing(privateListing);
    expectValidOrder(order);

    expect(order.protocolData.parameters.consideration).to.exist;

    const hasMarketplaceFee = order.protocolData.parameters.consideration.some(
      (item: { recipient?: string }) =>
        item.recipient?.toLowerCase() === OPENSEA_FEE_RECIPIENT.toLowerCase(),
    );

    expect(hasMarketplaceFee).to.be.false;
  });

  test("Post Regular Listing - Mainnet (for comparison)", async function () {
    if (!TOKEN_ADDRESS_MAINNET || !TOKEN_ID_MAINNET) {
      this.skip();
    }

    const expirationTime = getRandomExpiration();
    const regularListing = {
      accountAddress: walletAddress,
      startAmount: LISTING_AMOUNT,
      asset: {
        tokenAddress: TOKEN_ADDRESS_MAINNET,
        tokenId: TOKEN_ID_MAINNET,
      },
      expirationTime,
    };

    const order = await sdk.createListing(regularListing);
    expectValidOrder(order);

    expect(order.protocolData.parameters.consideration).to.exist;
    expect(
      order.protocolData.parameters.consideration.length,
    ).to.be.greaterThan(0);
  });
});
