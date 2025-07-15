import { expect } from "chai";
import { suite, test } from "mocha";
import {
  LISTING_AMOUNT,
  TOKEN_ADDRESS_MAINNET,
  TOKEN_ID_MAINNET,
  sdk,
  walletAddress,
} from "../integration/setup";
import { expectValidOrder } from "../utils/utils";

const ONE_HOUR = Math.floor(Date.now() / 1000) + 3600;
const expirationTime = ONE_HOUR;

suite("SDK: Private Listings Integration", () => {
  test("Post Private Listing - Mainnet", async function () {
    if (!TOKEN_ADDRESS_MAINNET || !TOKEN_ID_MAINNET) {
      this.skip();
    }

    const buyerAddress = "0x0000000000000000000000000000000000000001";

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

    const marketplaceFeeRecipient =
      "0x0000a26b00c1F0DF003000390027140000fAa719";
    const hasMarketplaceFee = order.protocolData.parameters.consideration.some(
      (item: { recipient?: string }) =>
        item.recipient?.toLowerCase() === marketplaceFeeRecipient.toLowerCase(),
    );

    expect(hasMarketplaceFee).to.be.false;
  });

  test("Post Regular Listing - Mainnet (for comparison)", async function () {
    if (!TOKEN_ADDRESS_MAINNET || !TOKEN_ID_MAINNET) {
      this.skip();
    }

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
