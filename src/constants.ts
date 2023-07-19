import { ethers } from "ethers";

export const INVERSE_BASIS_POINT = 10_000; // 100 basis points per 1%
export const MAX_EXPIRATION_MONTHS = 1;

const API_VERSION = 1;
export const API_BASE_MAINNET = "https://api.opensea.io";
export const API_BASE_TESTNET = "https://testnets-api.opensea.io";
export const API_PATH = `/api/v${API_VERSION}`;

export const DEFAULT_ZONE = ethers.constants.AddressZero;

// Ignore eslint no-unused-modules for below to keep backward compatibility
// in case a downstream user was already using these imports directly.
// These can be made non-exported in next major-versioned release.
// eslint-disable-next-line import/no-unused-modules
export const SHARED_STOREFRONT_ADDRESS_MAINNET =
  "0x495f947276749ce646f68ac8c248420045cb7b5e";
// eslint-disable-next-line import/no-unused-modules
export const SHARED_STOREFRONT_ADDRESS_GOERLI =
  "0x804159144aefb1dc17b171afcefa5b33746c722f";
const SHARED_STOREFRONT_ADDRESS_POLYGON =
  "0x2953399124f0cbb46d2cbacd8a89cf0599974963";
const SHARED_STOREFRONT_ADDRESS_KLAYTN =
  "0x5bc519d852f7ca2c8cf2d095299d5bb2d13f02c9";
export const SHARED_STOREFRONT_ADDRESSES = [
  SHARED_STOREFRONT_ADDRESS_MAINNET,
  SHARED_STOREFRONT_ADDRESS_GOERLI,
  SHARED_STOREFRONT_ADDRESS_POLYGON,
  SHARED_STOREFRONT_ADDRESS_KLAYTN,
].map((address) => address.toLowerCase());
export const SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS =
  "0xa604060890923ff400e8c6f5290461a83aedacec";
