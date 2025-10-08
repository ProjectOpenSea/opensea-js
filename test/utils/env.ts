import "dotenv/config";

export const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY as
  | string
  | undefined;
export const WALLET_PRIV_KEY = process.env.WALLET_PRIV_KEY as
  | string
  | undefined;
export const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY as
  | string
  | undefined;

export const OFFER_AMOUNT = process.env.OFFER_AMOUNT ?? "0.004";
