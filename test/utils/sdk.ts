import { OPENSEA_API_KEY } from "./env";
import { alchemyProvider } from "./providers";
import { OpenSeaSDK } from "../../src";
import { OpenSeaAPI } from "../../src/api";
import { Chain } from "../../src/types";

export const client = new OpenSeaSDK(
  alchemyProvider(Chain.Mainnet),
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
