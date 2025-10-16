import { OPENSEA_API_KEY, WALLET_PRIV_KEY } from "./env";
import { normalizeChain, getWalletForChain } from "./runtime";
import { OpenSeaSDK } from "../../src/sdk";
import { Chain } from "../../src/types";

export function requireIntegrationEnv(): void {
  if (!WALLET_PRIV_KEY) {
    throw new Error("WALLET_PRIV_KEY must be set for integration tests");
  }
}

export const CREATE_LISTING_CONTRACT_ADDRESS = process.env
  .CREATE_LISTING_CONTRACT_ADDRESS as string;
export const CREATE_LISTING_TOKEN_ID = process.env
  .CREATE_LISTING_TOKEN_ID as string;
export const CREATE_LISTING_2_CONTRACT_ADDRESS =
  process.env.CREATE_LISTING_2_CONTRACT_ADDRESS;
export const CREATE_LISTING_2_TOKEN_ID = process.env.CREATE_LISTING_2_TOKEN_ID;
export const CREATE_LISTING_3_CONTRACT_ADDRESS =
  process.env.CREATE_LISTING_3_CONTRACT_ADDRESS;
export const CREATE_LISTING_3_TOKEN_ID = process.env.CREATE_LISTING_3_TOKEN_ID;
export const LISTING_AMOUNT = process.env.LISTING_AMOUNT ?? "40";
export const ETH_TO_WRAP = process.env.ETH_TO_WRAP;

export const CREATE_LISTING_CHAIN = normalizeChain(
  process.env.CREATE_LISTING_CHAIN ?? Chain.Mainnet,
);
export const CREATE_LISTING_2_CHAIN = normalizeChain(
  process.env.CREATE_LISTING_2_CHAIN ?? Chain.Polygon,
);
export const CREATE_LISTING_3_CHAIN = normalizeChain(
  process.env.CREATE_LISTING_3_CHAIN ?? Chain.Mainnet,
);

export const BUY_LISTING_CHAIN = normalizeChain(
  process.env.BUY_LISTING_CHAIN ?? Chain.Optimism,
);
export const BUY_LISTING_CONTRACT_ADDRESS =
  process.env.BUY_LISTING_CONTRACT_ADDRESS;
export const BUY_LISTING_TOKEN_ID = process.env.BUY_LISTING_TOKEN_ID;

const walletForMainnet = getWalletForChain(
  WALLET_PRIV_KEY as string,
  Chain.Mainnet,
);
export const walletAddress = walletForMainnet.address;

const sdkCache = new Map<Chain, OpenSeaSDK>();

export const getSdkForChain = (chain: Chain): OpenSeaSDK => {
  if (sdkCache.has(chain)) {
    return sdkCache.get(chain)!;
  }

  const wallet = getWalletForChain(WALLET_PRIV_KEY as string, chain);
  const sdk = new OpenSeaSDK(
    wallet,
    {
      chain,
      apiKey: OPENSEA_API_KEY,
    },
    (line) => console.info(`${chain.toUpperCase()}: ${line}`),
  );

  sdkCache.set(chain, sdk);
  return sdk;
};
