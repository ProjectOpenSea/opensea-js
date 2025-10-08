import { expect } from "chai";
import { suite, test } from "mocha";
import { ENGLISH_AUCTION_ZONE_MAINNETS } from "../../src/constants";
import { getOfferPaymentToken } from "../../src/utils";
import { OFFER_AMOUNT } from "../utils/constants";
import {
  LISTING_AMOUNT,
  TOKEN_ADDRESS_MAINNET,
  TOKEN_ADDRESS_POLYGON,
  TOKEN_ID_MAINNET,
  TOKEN_ID_POLYGON,
  sdk,
  sdkPolygon,
  walletAddress,
} from "../utils/setup";
import { requireIntegrationEnv } from "../utils/setupIntegration";
// Use integration setup for integration tests
import * as _integrationSetup from "../utils/setupIntegration";
import { getRandomExpiration, expectValidOrder } from "../utils/utils";

suite("SDK: order posting", () => {
  test("Post Offer - Mainnet", async () => {
    requireIntegrationEnv();
    const expirationTime = getRandomExpiration();
    const offer = {
      accountAddress: walletAddress,
      startAmount: +OFFER_AMOUNT,
      asset: {
        tokenAddress: "0x1a92f7381b9f03921564a437210bb9396471050c",
        tokenId: "2288",
      },
      expirationTime,
    };
    const order = await sdk.createOffer(offer);
    expectValidOrder(order);
    expect(order.expirationTime).to.equal(expirationTime);
    expect(order.protocolData.parameters.endTime).to.equal(
      expirationTime.toString(),
    );
    expect(order.currentPrice).to.equal(
      BigInt(parseFloat(OFFER_AMOUNT) * 10 ** 18),
    );
  });

  test("Post Offer - Polygon", async () => {
    requireIntegrationEnv();
    const expirationTime = getRandomExpiration();
    const offer = {
      accountAddress: walletAddress,
      startAmount: +OFFER_AMOUNT,
      asset: {
        tokenAddress: "0x1a92f7381b9f03921564a437210bb9396471050c",
        tokenId: "2288",
      },
      expirationTime,
    };
    const order = await sdk.createOffer(offer);
    expectValidOrder(order);
  });

  test("Post Listing - Mainnet", async function () {
    requireIntegrationEnv();
    if (!TOKEN_ADDRESS_MAINNET || !TOKEN_ID_MAINNET) {
      this.skip();
    }
    const expirationTime = getRandomExpiration();
    const listing = {
      accountAddress: walletAddress,
      startAmount: LISTING_AMOUNT,
      asset: {
        tokenAddress: TOKEN_ADDRESS_MAINNET,
        tokenId: TOKEN_ID_MAINNET,
      },
      expirationTime,
    };
    const order = await sdk.createListing(listing);
    expectValidOrder(order);
  });

  test("Post English Auction Listing - Mainnet", async function () {
    requireIntegrationEnv();
    // English auctions are no longer supported on OpenSea
    this.skip();

    if (!TOKEN_ADDRESS_MAINNET || !TOKEN_ID_MAINNET) {
      this.skip();
    }
    const expirationTime = getRandomExpiration();
    const listing = {
      accountAddress: walletAddress,
      startAmount: LISTING_AMOUNT,
      asset: {
        tokenAddress: TOKEN_ADDRESS_MAINNET,
        tokenId: TOKEN_ID_MAINNET,
      },
      englishAuction: true,
      expirationTime,
    };
    try {
      const order = await sdk.createListing(listing);
      expectValidOrder(order);
      expect(order.protocolData.parameters.zone.toLowerCase()).to.equal(
        ENGLISH_AUCTION_ZONE_MAINNETS,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      expect(
        error.message.includes(
          "There is already a live auction for this item. You can only have one auction live at any time.",
        ),
      );
    }
  });

  test("Post Listing - Polygon", async () => {
    requireIntegrationEnv();
    const expirationTime = getRandomExpiration();
    const listing = {
      accountAddress: walletAddress,
      paymentTokenAddress: getOfferPaymentToken(sdkPolygon.chain),
      startAmount: +LISTING_AMOUNT * 1_000_000,
      asset: {
        tokenAddress: TOKEN_ADDRESS_POLYGON as string,
        tokenId: TOKEN_ID_POLYGON as string,
      },
      expirationTime,
    };
    const order = await sdkPolygon.createListing(listing);
    expectValidOrder(order);
  });

  test("Post Listing with Optional Creator Fees - Mainnet", async function () {
    requireIntegrationEnv();
    if (!TOKEN_ADDRESS_MAINNET || !TOKEN_ID_MAINNET) {
      this.skip();
    }
    const expirationTime = getRandomExpiration();

    // Get the NFT to retrieve its collection
    const { nft } = await sdk.api.getNFT(
      TOKEN_ADDRESS_MAINNET,
      TOKEN_ID_MAINNET,
    );
    const collection = await sdk.api.getCollection(nft.collection);

    const listing = {
      accountAddress: walletAddress,
      startAmount: LISTING_AMOUNT,
      asset: {
        tokenAddress: TOKEN_ADDRESS_MAINNET,
        tokenId: TOKEN_ID_MAINNET,
      },
      includeOptionalCreatorFees: true,
      expirationTime,
    };
    const order = await sdk.createListing(listing);
    expectValidOrder(order);

    // Verify that optional creator fees are included
    const hasOptionalFees = collection.fees.some((fee) => !fee.required);
    if (hasOptionalFees) {
      // Check that the order has more consideration items than just seller + required fees
      const requiredFeesCount = collection.fees.filter(
        (fee) => fee.required,
      ).length;
      expect(
        order.protocolData.parameters.consideration.length,
      ).to.be.greaterThan(1 + requiredFeesCount);
    }
  });

  test.skip("Post Collection Offer - Mainnet", async () => {
    const collection = await sdk.api.getCollection("cool-cats-nft");
    const paymentTokenAddress = getOfferPaymentToken(sdk.chain);
    const expirationTime = getRandomExpiration();
    const postOrderRequest = {
      collectionSlug: collection.collection,
      accountAddress: walletAddress,
      amount: OFFER_AMOUNT,
      quantity: 1,
      paymentTokenAddress,
      expirationTime,
    };
    const offerResponse = await sdk.createCollectionOffer(postOrderRequest);
    expect(offerResponse).to.exist.and.to.have.property("protocol_address");
    expect(offerResponse).to.exist.and.to.have.property("protocol_data");
    expect(offerResponse).to.exist.and.to.have.property("order_hash");

    // Cancel the order using self serve API key tied to the offerer
    const { protocol_address, order_hash } = offerResponse!;
    const cancelResponse = await sdk.offchainCancelOrder(
      protocol_address,
      order_hash,
    );
    expect(cancelResponse).to.exist.and.to.have.property(
      "last_signature_issued_valid_until",
    );
  });

  test.skip("Post Collection Offer - Polygon", async () => {
    const collection = await sdkPolygon.api.getCollection("arttoken-1155-4");
    const paymentTokenAddress = getOfferPaymentToken(sdkPolygon.chain);
    const expirationTime = getRandomExpiration();
    const postOrderRequest = {
      collectionSlug: collection.collection,
      accountAddress: walletAddress,
      amount: 0.0001,
      quantity: 1,
      paymentTokenAddress,
      expirationTime,
    };
    const offerResponse =
      await sdkPolygon.createCollectionOffer(postOrderRequest);
    expect(offerResponse).to.exist.and.to.have.property("protocol_address");
    expect(offerResponse).to.exist.and.to.have.property("protocol_data");
    expect(offerResponse).to.exist.and.to.have.property("order_hash");

    // Cancel the order using the offerer signature, deriving it from the ethers signer
    const { protocol_address, order_hash } = offerResponse!;
    const cancelResponse = await sdkPolygon.offchainCancelOrder(
      protocol_address,
      order_hash,
      undefined,
      undefined,
      true,
    );
    expect(cancelResponse).to.exist.and.to.have.property(
      "last_signature_issued_valid_until",
    );
  });

  test("Post Trait Offer - Ethereum", async () => {
    const collection = await sdk.api.getCollection("cool-cats-nft");
    const paymentTokenAddress = getOfferPaymentToken(sdk.chain);
    const expirationTime = getRandomExpiration();
    const postOrderRequest = {
      collectionSlug: collection.collection,
      accountAddress: walletAddress,
      amount: OFFER_AMOUNT,
      quantity: 1,
      paymentTokenAddress,
      traitType: "face",
      traitValue: "tvface bobross",
      expirationTime,
    };
    const offerResponse = await sdk.createCollectionOffer(postOrderRequest);
    expect(offerResponse).to.exist.and.to.have.property("protocol_data");
    expect(offerResponse?.criteria.trait).to.deep.equal({
      type: "face",
      value: "tvface bobross",
    });
  });
});
