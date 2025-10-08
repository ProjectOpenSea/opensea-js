import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import { ethers } from "ethers";
import { OPENSEA_API_KEY, WALLET_PRIV_KEY } from "./env";
import {
  RPC_PROVIDER_MAINNET,
  RPC_PROVIDER_OPTIMISM,
  RPC_PROVIDER_POLYGON,
} from "./providers";
import { OpenSeaSDK } from "../../src/sdk";
import { Chain } from "../../src/types";

chai.should();
chai.use(chaiAsPromised);

for (const envVar of ["WALLET_PRIV_KEY"]) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} must be set for integration tests`);
  }
}

export const TOKEN_ADDRESS_MAINNET = process.env
  .SELL_ORDER_CONTRACT_ADDRESS as string;
export const TOKEN_ID_MAINNET = process.env.SELL_ORDER_TOKEN_ID as string;
export const TOKEN_ADDRESS_POLYGON =
  process.env.SELL_ORDER_CONTRACT_ADDRESS_POLYGON;
export const TOKEN_ID_POLYGON = process.env.SELL_ORDER_TOKEN_ID_POLYGON;
export const LISTING_AMOUNT = process.env.LISTING_AMOUNT ?? "40";
export const ETH_TO_WRAP = process.env.ETH_TO_WRAP;

const normalizeChain = (chain?: string): Chain | undefined => {
  if (!chain) {
    return undefined;
  }
  const lowerCaseChain = chain.toLowerCase();
  return Object.values(Chain).find((value) => value === lowerCaseChain) as
    | Chain
    | undefined;
};

export const BUY_LISTING_CHAIN = normalizeChain(process.env.BUY_LISTING_CHAIN);
export const BUY_LISTING_CONTRACT_ADDRESS =
  process.env.BUY_LISTING_CONTRACT_ADDRESS;
export const BUY_LISTING_TOKEN_ID = process.env.BUY_LISTING_TOKEN_ID;
const BUY_LISTING_RPC_URL = process.env.BUY_LISTING_RPC_URL;

const walletMainnet = new ethers.Wallet(
  WALLET_PRIV_KEY as string,
  RPC_PROVIDER_MAINNET,
);
const walletPolygon = new ethers.Wallet(
  WALLET_PRIV_KEY as string,
  RPC_PROVIDER_POLYGON,
);
export const walletAddress = walletMainnet.address;

export const sdk = new OpenSeaSDK(
  walletMainnet,
  {
    chain: Chain.Mainnet,
    apiKey: OPENSEA_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`),
);

export const sdkPolygon = new OpenSeaSDK(
  walletPolygon,
  {
    chain: Chain.Polygon,
    apiKey: OPENSEA_API_KEY,
  },
  (line) => console.info(`POLYGON: ${line}`),
);

const buyListingProvider = BUY_LISTING_CHAIN
  ? BUY_LISTING_RPC_URL
    ? new ethers.JsonRpcProvider(BUY_LISTING_RPC_URL)
    : BUY_LISTING_CHAIN === Chain.Optimism
      ? RPC_PROVIDER_OPTIMISM
      : undefined
  : undefined;
const walletBuyListing = buyListingProvider
  ? new ethers.Wallet(WALLET_PRIV_KEY as string, buyListingProvider)
  : undefined;

export const sdkBuyListing = walletBuyListing
  ? new OpenSeaSDK(
      walletBuyListing,
      {
        chain: BUY_LISTING_CHAIN ?? Chain.Mainnet,
        apiKey: OPENSEA_API_KEY,
      },
      (line) => console.info(`BUY_LISTING (${BUY_LISTING_CHAIN}): ${line}`),
    )
  : undefined;

// getRandomExpiration and getRandomSalt moved to test/utils/utils.ts
