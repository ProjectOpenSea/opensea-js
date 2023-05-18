import { assert } from "chai";
import { ethers } from "ethers";
import { suite, test } from "mocha";
import Web3 from "web3";
import { Network } from "wyvern-js/lib/types";
import {
  ALCHEMY_API_KEY,
  MAINNET_API_KEY,
  WALLET_PRIV_KEY,
} from "../__tests__/constants";
import { OpenSeaSDK } from "../sdk";
import { SafelistStatus } from "../types";

const webProvider = new Web3.providers.HttpProvider(
  `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
);

const rpcProvider = new ethers.providers.JsonRpcProvider(
  `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
);

const wallet = new ethers.Wallet(WALLET_PRIV_KEY ?? "", rpcProvider);

const sdk = new OpenSeaSDK(
  webProvider,
  {
    networkName: Network.Main,
    apiKey: MAINNET_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`),
  wallet
);

suite("SDK: getCollection", () => {
  test("Get Verified Collection", async () => {
    const slug = "cool-cats-nft";
    const collection = await sdk.api.getCollection(slug);

    assert(collection, "Collection should not be null");
    assert(collection.name, "Collection name should exist");
    assert(collection.slug === slug, "Collection slug should match.");
    assert(
      collection.safelistRequestStatus === SafelistStatus.VERIFIED,
      "Collection should be verified."
    );
  });
});
