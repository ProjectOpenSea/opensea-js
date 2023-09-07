import { expect } from "chai";
import { suite, test } from "mocha";
import {
  LISTING_AMOUNT,
  TOKEN_ADDRESS_MAINNET,
  TOKEN_ADDRESS_POLYGON,
  TOKEN_ID_MAINNET,
  TOKEN_ID_POLYGON,
  sdk,
  sdkPolygon,
  walletAddress,
} from "./setup";
import { ENGLISH_AUCTION_ZONE } from "../../src/constants";
import { getWETHAddress } from "../../src/utils";
import { OFFER_AMOUNT } from "../utils/constants";
import { expectValidOrder } from "../utils/utils";

suite("SDK: order posting", () => {
  test("Post Buy Order - Mainnet", async () => {
    const buyOrder = {
      accountAddress: walletAddress,
      startAmount: +OFFER_AMOUNT,
      asset: {
        tokenAddress: "0x1a92f7381b9f03921564a437210bb9396471050c",
        tokenId: "2288",
      },
    };
    const order = await sdk.createBuyOrder(buyOrder);
    expectValidOrder(order);
  });

  test("Post Buy Order - Polygon", async () => {
    const buyOrder = {
      accountAddress: walletAddress,
      startAmount: +OFFER_AMOUNT,
      asset: {
        tokenAddress: "0x1a92f7381b9f03921564a437210bb9396471050c",
        tokenId: "2288",
      },
    };
    const order = await sdk.createBuyOrder(buyOrder);
    expectValidOrder(order);
  });

  test("Post Sell Order - Mainnet", async function () {
    if (!TOKEN_ADDRESS_MAINNET || !TOKEN_ID_MAINNET) {
      this.skip();
    }
    const sellOrder = {
      accountAddress: walletAddress,
      startAmount: LISTING_AMOUNT,
      asset: {
        tokenAddress: TOKEN_ADDRESS_MAINNET as string,
        tokenId: TOKEN_ID_MAINNET as string,
      },
    };
    const order = await sdk.createSellOrder(sellOrder);
    expectValidOrder(order);
  });

  test("Post Auction Sell Order - Mainnet", async function () {
    if (!TOKEN_ADDRESS_MAINNET || !TOKEN_ID_MAINNET) {
      this.skip();
    }
    const sellOrder = {
      accountAddress: walletAddress,
      startAmount: LISTING_AMOUNT,
      asset: {
        tokenAddress: TOKEN_ADDRESS_MAINNET as string,
        tokenId: TOKEN_ID_MAINNET as string,
      },
      englishAuction: true,
    };
    try {
      const order = await sdk.createSellOrder(sellOrder);
      expectValidOrder(order);
      expect(order.protocolData.parameters.zone.toLowerCase()).to.equal(
        ENGLISH_AUCTION_ZONE,
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

  test("Post Sell Order - Polygon", async function () {
    if (!TOKEN_ADDRESS_POLYGON || !TOKEN_ID_POLYGON) {
      this.skip();
    }
    const sellOrder = {
      accountAddress: walletAddress,
      startAmount: +LISTING_AMOUNT * 1_000_000,
      asset: {
        tokenAddress: TOKEN_ADDRESS_POLYGON,
        tokenId: TOKEN_ID_POLYGON,
      },
    };
    const order = await sdkPolygon.createSellOrder(sellOrder);
    expectValidOrder(order);
  });

  test("Post Collection Offer - Mainnet", async () => {
    const collection = await sdk.api.getCollection("cool-cats-nft");
    const paymentTokenAddress = getWETHAddress(sdk.chain);
    const postOrderRequest = {
      collectionSlug: collection.slug,
      accountAddress: walletAddress,
      amount: OFFER_AMOUNT,
      quantity: 1,
      paymentTokenAddress,
    };
    const offerResponse = await sdk.createCollectionOffer(postOrderRequest);
    expect(offerResponse).to.exist.and.to.have.property("protocol_data");
  });

  test("Post Collection Offer - Polygon", async () => {
    const collection = await sdkPolygon.api.getCollection("arttoken-1155-4");
    const paymentTokenAddress = getWETHAddress(sdkPolygon.chain);
    const postOrderRequest = {
      collectionSlug: collection.slug,
      accountAddress: walletAddress,
      amount: OFFER_AMOUNT,
      quantity: 1,
      paymentTokenAddress,
    };
    const offerResponse =
      await sdkPolygon.createCollectionOffer(postOrderRequest);
    expect(offerResponse).to.exist.and.to.have.property("protocol_data");
  });
});
