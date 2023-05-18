import { expect } from "chai";
import { suite, test } from "mocha";
import {
  LISTING_AMOUNT,
  TOKEN_ADDRESS,
  TOKEN_ID,
  sdk,
  walletAddress,
} from "./init";
import { WETH_ADDRESS, OFFER_AMOUNT } from "../__tests__/constants";
import { expectValidOrder } from "../__tests__/utils";

suite("SDK: order posting", () => {
  test("Post Buy Order", async () => {
    const buyOrder = {
      accountAddress: walletAddress,
      startAmount: OFFER_AMOUNT ?? "0.004",
      asset: {
        tokenAddress: "0x1a92f7381b9f03921564a437210bb9396471050c",
        tokenId: "2288",
      },
    };

    const order = await sdk.createBuyOrder(buyOrder);

    expectValidOrder(order);
  });

  test("Post Sell Order", async () => {
    const sellOrder = {
      accountAddress: walletAddress,
      startAmount: LISTING_AMOUNT ?? "40",
      asset: {
        tokenAddress: TOKEN_ADDRESS ?? "",
        tokenId: TOKEN_ID ?? "",
      },
    };

    const order = await sdk.createSellOrder(sellOrder);

    expectValidOrder(order);
  });

  test("Post collection offer", async () => {
    const collection = await sdk.api.getCollection("cool-cats-nft");

    const postOrderRequest = {
      collectionSlug: collection.slug,
      accountAddress: walletAddress,
      amount: OFFER_AMOUNT ?? "0.004",
      quantity: 1,
      paymentTokenAddress: WETH_ADDRESS,
    };

    const offerResponse = await sdk.createCollectionOffer(postOrderRequest);

    expect(offerResponse).to.exist;
    expect(offerResponse).to.exist.and.to.have.property("protocol_data");
  });
});
