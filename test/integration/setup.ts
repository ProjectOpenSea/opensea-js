import { ethers } from "ethers";
import { OpenSeaSDK } from "../../src/sdk";
import { Chain } from "../../src/types";
import {
  MAINNET_API_KEY,
  RPC_PROVIDER_MAINNET,
  RPC_PROVIDER_POLYGON,
  WALLET_PRIV_KEY,
} from "../utils/constants";

for (const envVar of ["WALLET_PRIV_KEY"]) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} must be set for integration tests`);
  }
}

export const TOKEN_ADDRESS_MAINNET = process.env.SELL_ORDER_CONTRACT_ADDRESS;
export const TOKEN_ID_MAINNET = process.env.SELL_ORDER_TOKEN_ID;
export const TOKEN_ADDRESS_POLYGON =
  process.env.SELL_ORDER_CONTRACT_ADDRESS_POLYGON;
export const TOKEN_ID_POLYGON = process.env.SELL_ORDER_TOKEN_ID_POLYGON;
export const LISTING_AMOUNT = process.env.LISTING_AMOUNT ?? "40";
export const ETH_TO_WRAP = process.env.ETH_TO_WRAP;

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
    apiKey: MAINNET_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`),
);

export const sdkPolygon = new OpenSeaSDK(
  walletPolygon,
  {
    chain: Chain.Polygon,
    apiKey: MAINNET_API_KEY,
  },
  (line) => console.info(`POLYGON: ${line}`),
);
