import { ethers } from "ethers";
import { OpenSeaSDK } from "../../src/sdk";
import { Network } from "../../src/types";
import {
  ALCHEMY_API_KEY,
  MAINNET_API_KEY,
  WALLET_PRIV_KEY,
} from "../utils/constants";

for (const envVar of [
  "WALLET_PRIV_KEY",
  "SELL_ORDER_CONTRACT_ADDRESS",
  "SELL_ORDER_TOKEN_ID",
]) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} must be set for integration tests`);
  }
}

export const TOKEN_ADDRESS = process.env.SELL_ORDER_CONTRACT_ADDRESS;
export const TOKEN_ID = process.env.SELL_ORDER_TOKEN_ID;
export const LISTING_AMOUNT = process.env.LISTING_AMOUNT;
export const ETH_TO_WRAP = process.env.ETH_TO_WRAP;

const rpcProvider = new ethers.providers.JsonRpcProvider(
  `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
);

const wallet = new ethers.Wallet(WALLET_PRIV_KEY as string, rpcProvider);
export const walletAddress = wallet.address;

export const sdk = new OpenSeaSDK(
  rpcProvider,
  {
    networkName: Network.Main,
    apiKey: MAINNET_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`),
  wallet
);
