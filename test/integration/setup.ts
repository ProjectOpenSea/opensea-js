import { ethers } from "ethers";
import { OpenSeaSDK } from "../../src/sdk";
import { Chain } from "../../src/types";
import {
  MAINNET_API_KEY,
  RPC_PROVIDER,
  WALLET_PRIV_KEY,
} from "../utils/constants";

for (const envVar of ["WALLET_PRIV_KEY"]) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} must be set for integration tests`);
  }
}

export const TOKEN_ADDRESS = process.env.SELL_ORDER_CONTRACT_ADDRESS;
export const TOKEN_ID = process.env.SELL_ORDER_TOKEN_ID;
export const LISTING_AMOUNT = process.env.LISTING_AMOUNT ?? "40";
export const ETH_TO_WRAP = process.env.ETH_TO_WRAP;

const wallet = new ethers.Wallet(WALLET_PRIV_KEY as string, RPC_PROVIDER);
export const walletAddress = wallet.address;

export const sdk = new OpenSeaSDK(
  RPC_PROVIDER,
  {
    chain: Chain.Mainnet,
    apiKey: MAINNET_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`),
  wallet
);
