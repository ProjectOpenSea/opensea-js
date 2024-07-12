import { FixedNumber } from "ethers";

export const FIXED_NUMBER_100 = FixedNumber.fromValue(100);
export const INVERSE_BASIS_POINT = 10_000n; // 100 basis points per 1%
export const MAX_EXPIRATION_MONTHS = 1;

export const API_BASE_MAINNET = "https://api.opensea.io";
export const API_BASE_TESTNET = "https://testnets-api.opensea.io";

// eslint-disable-next-line import/no-unused-modules
export const SIGNED_ZONE = "0x000056f7000000ece9003ca63978907a00ffd100";

export const ENGLISH_AUCTION_ZONE_MAINNETS =
  "0x110b2b128a9ed1be5ef3232d8e4e41640df5c2cd";
export const ENGLISH_AUCTION_ZONE_TESTNETS =
  "0x9B814233894Cd227f561B78Cc65891AA55C62Ad2";

const SHARED_STOREFRONT_ADDRESS_MAINNET =
  "0x495f947276749ce646f68ac8c248420045cb7b5e";
const SHARED_STOREFRONT_ADDRESS_POLYGON =
  "0x2953399124f0cbb46d2cbacd8a89cf0599974963";
const SHARED_STOREFRONT_ADDRESS_KLAYTN =
  "0x5bc519d852f7ca2c8cf2d095299d5bb2d13f02c9";
export const SHARED_STOREFRONT_ADDRESSES = [
  SHARED_STOREFRONT_ADDRESS_MAINNET,
  SHARED_STOREFRONT_ADDRESS_POLYGON,
  SHARED_STOREFRONT_ADDRESS_KLAYTN,
].map((address) => address.toLowerCase());
export const SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS =
  "0xa604060890923ff400e8c6f5290461a83aedacec";
