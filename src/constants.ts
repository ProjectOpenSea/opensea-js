import { ethers } from "ethers";

export const INVERSE_BASIS_POINT = 10_000; // 100 basis points per 1%
export const MAX_EXPIRATION_MONTHS = 1;

const API_VERSION = 1;
export const API_BASE_MAINNET = "https://api.opensea.io";
export const API_BASE_TESTNET = "https://testnets-api.opensea.io";
export const API_PATH = `/api/v${API_VERSION}`;

export const DEFAULT_ZONE = ethers.constants.AddressZero;

export const SHARED_STOREFRONT_ADDRESS_MAINNET =
  "0x495f947276749ce646f68ac8c248420045cb7b5e";
export const SHARED_STOREFRONT_ADDRESS_GOERLI =
  "0x804159144aefb1dc17b171afcefa5b33746c722f";
export const SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS =
  "0xa604060890923ff400e8c6f5290461a83aedacec";
