import { randomBytes } from "crypto";
import { ethers } from "ethers";
import { OpenSeaSDK } from "../../src/sdk";
import { Chain } from "../../src/types";
import {
  OPENSEA_API_KEY,
  RPC_PROVIDER_MAINNET,
  RPC_PROVIDER_POLYGON,
  WALLET_PRIV_KEY,
} from "../utils/constants";

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

export const getRandomExpiration = (): number => {
  const now = Math.floor(Date.now() / 1000);
  const fifteenMinutes = 15 * 60;
  const oneHour = 60 * 60;
  const range = oneHour - fifteenMinutes + 1;

  const randomBuffer = randomBytes(4);
  const randomValue = randomBuffer.readUInt32BE(0);
  const randomSeconds = (randomValue % range) + fifteenMinutes;

  return now + randomSeconds;
};
