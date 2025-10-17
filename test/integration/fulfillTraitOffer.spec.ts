import { expect } from "chai";
import { suite, test } from "mocha";
import { Chain, EventData, EventType } from "../../src/types";
import { getOfferPaymentToken } from "../../src/utils";
import { OFFER_AMOUNT } from "../utils/env";
import {
  getSdkForChain,
  walletAddress,
  requireIntegrationEnv,
} from "../utils/setupIntegration";
import { getRandomExpiration } from "../utils/utils";

suite("SDK: fulfill trait offer", () => {
  beforeEach(() => {
    requireIntegrationEnv();
  });

  test("Create and fulfill Pudgy Penguins trait offer (Body -> Gold Medal)", async function () {
    this.timeout(120000); // 2 minute timeout for this test

    const chain = Chain.Mainnet;
    const sdk = getSdkForChain(chain);

    // Pudgy Penguins collection
    const collectionSlug = "pudgypenguins";
    const traitType = "Body";
    const traitValue = "Gold Medal";

    // NFT that has the Gold Medal body trait
    // Token #6873 has Body: Gold Medal trait
    const contractAddress = "0xbd3531da5cf5857e7cfaa92426877b022e612cf8";
    const tokenId = "6873";

    const collection = await sdk.api.getCollection(collectionSlug);
    expect(collection).to.exist;

    const paymentTokenAddress = getOfferPaymentToken(sdk.chain);
    const expirationTime = getRandomExpiration();

    // Create a trait offer for Pudgy Penguins with Body -> Gold Medal trait
    const postOrderRequest = {
      collectionSlug: collection.collection,
      accountAddress: walletAddress,
      amount: OFFER_AMOUNT,
      quantity: 1,
      paymentTokenAddress,
      traitType,
      traitValue,
      expirationTime,
    };

    const offerResponse = await sdk.createCollectionOffer(postOrderRequest);
    expect(offerResponse).to.exist.and.to.have.property("protocol_address");
    expect(offerResponse).to.exist.and.to.have.property("protocol_data");
    expect(offerResponse).to.exist.and.to.have.property("order_hash");
    expect(offerResponse?.criteria.trait).to.deep.equal({
      type: traitType,
      value: traitValue,
    });

    if (!offerResponse) {
      throw new Error("Failed to create trait offer");
    }

    // Wait to ensure the order is indexed
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Set up event listeners
    const observedEvents: { type: EventType; data: EventData }[] = [];
    const listeners = [
      EventType.TransactionCreated,
      EventType.TransactionConfirmed,
      EventType.TransactionFailed,
    ].map((eventType) => {
      const handler = (eventData: EventData) => {
        observedEvents.push({ type: eventType, data: eventData });
      };
      sdk.addListener(eventType, handler);
      return { eventType, handler };
    });

    try {
      // Fulfill the trait offer with a specific NFT that has the trait
      const txHash = await sdk.fulfillOrder({
        order: offerResponse,
        accountAddress: walletAddress,
        assetContractAddress: contractAddress,
        tokenId,
      });

      expect(txHash).to.match(/^0x[0-9a-fA-F]{64}$/);

      const confirmedEvent = observedEvents.find(
        (event) => event.type === EventType.TransactionConfirmed,
      );
      expect(confirmedEvent, "Expected TransactionConfirmed event").to.exist;
      expect(confirmedEvent?.data.transactionHash).to.equal(txHash);

      const failedEvent = observedEvents.find(
        (event) => event.type === EventType.TransactionFailed,
      );
      expect(failedEvent, "TransactionFailed event should not be emitted").to.be
        .undefined;
    } finally {
      // Clean up event listeners
      for (const { eventType, handler } of listeners) {
        sdk.removeListener(eventType, handler);
      }
    }
  });
});
