import { ethers } from "ethers";
import Web3 from "web3";
import { Network } from "wyvern-js/lib/types";
import {
  ALCHEMY_API_KEY,
  MAINNET_API_KEY,
  WALLET_PRIV_KEY,
} from "../__tests__/constants";
import { OpenSeaSDK } from "../sdk";

export const TOKEN_ADDRESS = process.env.SELL_ORDER_CONTRACT_ADDRESS;
export const TOKEN_ID = process.env.SELL_ORDER_TOKEN_ID;
export const LISTING_AMOUNT = process.env.LISTING_AMOUNT;

const webProvider = new Web3.providers.HttpProvider(
  `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
);

const rpcProvider = new ethers.providers.JsonRpcProvider(
  `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
);

const wallet = new ethers.Wallet(WALLET_PRIV_KEY ?? "", rpcProvider);

export const walletAddress = wallet.address;

export const sdk = new OpenSeaSDK(
  webProvider,
  {
    networkName: Network.Main,
    apiKey: MAINNET_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`),
  wallet
);
