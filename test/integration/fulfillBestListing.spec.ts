import { expect } from "chai";
import { suite, test } from "mocha";
import { EventData, EventType } from "../../src/types";
import { ensureVarsOrSkip } from "../utils/runtime";
// import order adjusted above
import {
  BUY_LISTING_CHAIN,
  BUY_LISTING_CONTRACT_ADDRESS,
  BUY_LISTING_TOKEN_ID,
  getSdkForChain,
  walletAddress,
  requireIntegrationEnv,
} from "../utils/setupIntegration";

suite("SDK: fulfill best listing", () => {
  beforeEach(() => {
    requireIntegrationEnv();
  });

  test("Get best listing and fulfill without errors", async function () {
    if (
      !ensureVarsOrSkip(this, {
        BUY_LISTING_CHAIN,
        BUY_LISTING_CONTRACT_ADDRESS,
        BUY_LISTING_TOKEN_ID,
      })
    ) {
      return;
    }

    const sdkClient = getSdkForChain(BUY_LISTING_CHAIN);
    const chain = BUY_LISTING_CHAIN;
    const contractAddress = BUY_LISTING_CONTRACT_ADDRESS!;
    const tokenId = BUY_LISTING_TOKEN_ID!;

    const { nft } = await sdkClient.api.getNFT(contractAddress, tokenId, chain);
    expect(nft).to.exist;
    expect(nft.collection).to.be.a("string");
    const slug = nft.collection;

    const listing = await sdkClient.api.getBestListing(slug, tokenId, true);
    expect(listing).to.exist;
    expect(listing.chain).to.equal(chain);
    expect(listing.order_hash).to.be.a("string");
    expect(listing.protocol_address).to.be.a("string");

    const observedEvents: { type: EventType; data: EventData }[] = [];
    const listeners = [
      EventType.TransactionCreated,
      EventType.TransactionConfirmed,
      EventType.TransactionFailed,
    ].map((eventType) => {
      const handler = (eventData: EventData) => {
        observedEvents.push({ type: eventType, data: eventData });
      };
      sdkClient.addListener(eventType, handler);
      return { eventType, handler };
    });

    try {
      const txHash = await sdkClient.fulfillOrder({
        order: listing,
        accountAddress: walletAddress,
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
      for (const { eventType, handler } of listeners) {
        sdkClient.removeListener(eventType, handler);
      }
    }
  });
});
