import { ethers } from "ethers";
import { OpenSeaSDK } from "../../src";
import { OpenSeaAPI } from "../../src/api";
import { Chain } from "../../src/types";

require("dotenv").config();

export const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;
export const WALLET_PRIV_KEY = process.env.WALLET_PRIV_KEY;

const ALCHEMY_API_KEY_MAINNET = process.env.ALCHEMY_API_KEY;
const ALCHEMY_API_KEY_POLYGON = process.env.ALCHEMY_API_KEY_POLYGON;

export const RPC_PROVIDER_MAINNET = new ethers.JsonRpcProvider(
  `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY_MAINNET}`,
);
export const RPC_PROVIDER_POLYGON = new ethers.JsonRpcProvider(
  `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY_POLYGON}`,
);

export const client = new OpenSeaSDK(
  RPC_PROVIDER_MAINNET,
  {
    chain: Chain.Mainnet,
    apiKey: OPENSEA_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`),
);

export const api = new OpenSeaAPI(
  {
    apiKey: OPENSEA_API_KEY,
    chain: Chain.Mainnet,
  },
  process.env.DEBUG ? console.log : undefined,
);

export const OFFER_AMOUNT = process.env.OFFER_AMOUNT ?? "0.004";

export const BAYC_CONTRACT_ADDRESS =
  "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
export const BAYC_TOKEN_IDS = [
  "9703",
  "4049",
  "5340",
  "7354",
  "2352",
  "7112",
  "3255",
  "5532",
  "4610",
];
