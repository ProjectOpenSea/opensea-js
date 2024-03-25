import { ethers } from "ethers";
import { OpenSeaAPI } from "../../src/api";
import { Chain } from "../../src/types";

export const MAINNET_API_KEY = process.env.OPENSEA_API_KEY;
export const WALLET_PRIV_KEY = process.env.WALLET_PRIV_KEY;

const ALCHEMY_API_KEY_MAINNET = process.env.ALCHEMY_API_KEY;
const ALCHEMY_API_KEY_POLYGON = process.env.ALCHEMY_API_KEY_POLYGON;

export const RPC_PROVIDER_MAINNET = new ethers.JsonRpcProvider(
  `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY_MAINNET}`,
);
export const RPC_PROVIDER_POLYGON = new ethers.JsonRpcProvider(
  `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY_POLYGON}`,
);

export const OFFER_AMOUNT = process.env.OFFER_AMOUNT ?? "0.004";
export const DAPPER_ADDRESS = "0x4819352bd7fadcCFAA8A2cDA4b2825a9ec51417c";
export const BAYC_CONTRACT_ADDRESS =
  "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
export const BAYC_TOKEN_IDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export const mainAPI = new OpenSeaAPI(
  {
    apiKey: MAINNET_API_KEY,
    chain: Chain.Mainnet,
  },
  process.env.DEBUG ? console.log : undefined,
);

export const testnetAPI = new OpenSeaAPI(
  {
    chain: Chain.Sepolia,
  },
  process.env.DEBUG ? console.log : undefined,
);
