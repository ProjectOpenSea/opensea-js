import { expect } from "chai";
import { ethers } from "ethers";
import { suite, test } from "mocha";
import Web3 from "web3";
import {
  MAINNET_API_KEY,
  WALLET_ADDRESS,
  WALLET_PRIV_KEY,
  ALCHEMY_API_KEY,
  WETH_ADDRESS,
  OFFER_AMOUNT,
} from "../__tests__/constants";
import { expectValidOrder } from "../__tests__/utils";
import { OpenSeaSDK } from "../index";
import { Network } from "../types";

const TOKEN_ADDRESS = process.env.SELL_ORDER_CONTRACT_ADDRESS;
const TOKEN_ID = process.env.SELL_ORDER_TOKEN_ID;
const LISTING_AMOUNT = process.env.LISTING_AMOUNT;

const walletAddress: string = WALLET_ADDRESS ?? "";

const webProvider = new Web3.providers.HttpProvider(
  `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
);

const rpcProvider = new ethers.providers.JsonRpcProvider(
  `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
);

const wallet = new ethers.Wallet(
  WALLET_PRIV_KEY ? WALLET_PRIV_KEY : "",
  rpcProvider
);

const sdk = new OpenSeaSDK(
  webProvider,
  {
    networkName: Network.Main,
    apiKey: MAINNET_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`),
  wallet
);

suite("SDK: order posting", () => {
  test("Post Buy Order", async () => {
    const buyOrder = {
      accountAddress: walletAddress,
      startAmount: OFFER_AMOUNT ? OFFER_AMOUNT : "0.004",
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
