import { Network } from "./types";

export const INVERSE_BASIS_POINT = 10_000; // 100 basis points per 1%
export const MAX_EXPIRATION_MONTHS = 1;

const API_VERSION = 1;
export const API_BASE_MAINNET = "https://api.opensea.io";
export const API_BASE_TESTNET = "https://testnets-api.opensea.io";
export const API_PATH = `/api/v${API_VERSION}`;

export const MERKLE_VALIDATOR_MAINNET =
  "0xbaf2127b49fc93cbca6269fade0f7f31df4c88a7";

export const WETH_ADDRESS_BY_NETWORK = {
  [Network.Main]: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  [Network.Goerli]: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
} as const;

export const DEFAULT_ZONE_BY_NETWORK = {
  [Network.Main]: "0x0000000000000000000000000000000000000000",
  [Network.Goerli]: "0x0000000000000000000000000000000000000000",
} as const;

export const SHARED_STOREFRONT_ADDRESS_MAINNET =
  "0x495f947276749ce646f68ac8c248420045cb7b5e";
export const SHARED_STOREFRONT_ADDRESS_GOERLI =
  "0x804159144aefb1dc17b171afcefa5b33746c722f";
export const SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS =
  "0xa604060890923ff400e8c6f5290461a83aedacec";
