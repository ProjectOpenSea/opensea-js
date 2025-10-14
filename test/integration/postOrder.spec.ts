import { expect } from "chai";
import { suite, test } from "mocha";
import { Chain } from "../../src/types";
import { getOfferPaymentToken } from "../../src/utils";
import { OFFER_AMOUNT } from "../utils/env";
import { ensureVarsOrSkip } from "../utils/runtime";
import {
  LISTING_AMOUNT,
  CREATE_LISTING_CHAIN,
  CREATE_LISTING_CONTRACT_ADDRESS,
  CREATE_LISTING_TOKEN_ID,
  CREATE_LISTING_2_CHAIN,
  CREATE_LISTING_2_CONTRACT_ADDRESS,
  CREATE_LISTING_2_TOKEN_ID,
  getSdkForChain,
  walletAddress,
  requireIntegrationEnv,
} from "../utils/setupIntegration";
import { getRandomExpiration, expectValidOrder } from "../utils/utils";

suite("SDK: order posting", () => {
  beforeEach(() => {
    requireIntegrationEnv();
  });

  test("Post Offer - Mainnet", async () => {
    const chain = Chain.Mainnet;
    const sdk = getSdkForChain(chain);

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
    const chain2 = Chain.Polygon;
    const sdk2 = getSdkForChain(chain2);

    const expirationTime = getRandomExpiration();
    const offer = {
      accountAddress: walletAddress,
      startAmount: +OFFER_AMOUNT,
      asset: {
        tokenAddress: "0x251be3a17af4892035c37ebf5890f4a4d889dcad",
        tokenId:
          "5157722665851654661253630736650528917481758416718625695136396853508305538271",
      },
      expirationTime,
    };
    const order = await sdk2.createOffer(offer);
    expectValidOrder(order);
  });

  test(`Post Listing - ${CREATE_LISTING_CHAIN}`, async function () {
    if (
      !ensureVarsOrSkip(this, {
        CREATE_LISTING_CONTRACT_ADDRESS,
        CREATE_LISTING_TOKEN_ID,
      })
    ) {
      return;
    }

    const chain = CREATE_LISTING_CHAIN;
    const sdk = getSdkForChain(chain);
    const expirationTime = getRandomExpiration();
    const listing = {
      accountAddress: walletAddress,
      startAmount: LISTING_AMOUNT,
      asset: {
        tokenAddress: CREATE_LISTING_CONTRACT_ADDRESS,
        tokenId: CREATE_LISTING_TOKEN_ID,
      },
      expirationTime,
    };
    const order = await sdk.createListing(listing);
    expectValidOrder(order);
  });

  test(`Post Listing - ${CREATE_LISTING_2_CHAIN}`, async function () {
    if (
      !ensureVarsOrSkip(this, {
        CREATE_LISTING_2_CONTRACT_ADDRESS,
        CREATE_LISTING_2_TOKEN_ID,
      })
    ) {
      return;
    }

    const chain2 = CREATE_LISTING_2_CHAIN;
    const sdk2 = getSdkForChain(chain2);
    const expirationTime = getRandomExpiration();
    const listing = {
      accountAddress: walletAddress,
      paymentTokenAddress: getOfferPaymentToken(sdk2.chain),
      startAmount: +LISTING_AMOUNT * 1_000_000,
      asset: {
        tokenAddress: CREATE_LISTING_2_CONTRACT_ADDRESS as string,
        tokenId: CREATE_LISTING_2_TOKEN_ID as string,
      },
      expirationTime,
    };
    const order = await sdk2.createListing(listing);
    expectValidOrder(order);
  });

  test("Post Listing with Optional Creator Fees - Chain A", async function () {
    if (
      !ensureVarsOrSkip(this, {
        CREATE_LISTING_CONTRACT_ADDRESS,
        CREATE_LISTING_TOKEN_ID,
      })
    ) {
      return;
    }

    const chain = CREATE_LISTING_CHAIN;
    const sdk = getSdkForChain(chain);
    const expirationTime = getRandomExpiration();

    // Get the NFT to retrieve its collection
    const { nft } = await sdk.api.getNFT(
      CREATE_LISTING_CONTRACT_ADDRESS,
      CREATE_LISTING_TOKEN_ID,
    );
    const collection = await sdk.api.getCollection(nft.collection);

    const listing = {
      accountAddress: walletAddress,
      startAmount: LISTING_AMOUNT,
      asset: {
        tokenAddress: CREATE_LISTING_CONTRACT_ADDRESS,
        tokenId: CREATE_LISTING_TOKEN_ID,
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

  test("Post Collection Offer - Mainnet", async () => {
    const chain = Chain.Mainnet;
    const sdk = getSdkForChain(chain);
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

  test("Post Collection Offer - Polygon", async () => {
    const chain = Chain.Polygon;
    const sdk = getSdkForChain(chain);
    const collection = await sdk.api.getCollection("arttoken-1155-4");
    const paymentTokenAddress = getOfferPaymentToken(sdk.chain);
    const expirationTime = getRandomExpiration();
    const postOrderRequest = {
      collectionSlug: collection.collection,
      accountAddress: walletAddress,
      amount: 0.0001,
      quantity: 1,
      paymentTokenAddress,
      expirationTime,
    };
    const offerResponse = await sdk.createCollectionOffer(postOrderRequest);
    expect(offerResponse).to.exist.and.to.have.property("protocol_address");
    expect(offerResponse).to.exist.and.to.have.property("protocol_data");
    expect(offerResponse).to.exist.and.to.have.property("order_hash");

    // Cancel the order using the offerer signature, deriving it from the ethers signer
    const { protocol_address, order_hash } = offerResponse!;
    const cancelResponse = await sdk.offchainCancelOrder(
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
    const chain = Chain.Mainnet;
    const sdk = getSdkForChain(chain);
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
