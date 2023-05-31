import { tokens as goerliTokens } from "./goerli";
import { tokens as mainTokens } from "./main";
import { Chain } from "../../types";

interface Token {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
}

export interface NetworkTokens {
  canonicalWrappedEther: Token;
  otherTokens: Token[];
}

export const getCanonicalWrappedEther = function (chain: Chain): Token {
  switch (chain) {
    case Chain.Mainnet:
      return tokens.main.canonicalWrappedEther;
    case Chain.Goerli:
      return tokens.goerli.canonicalWrappedEther;
  }
};

const tokens = {
  goerli: goerliTokens,
  main: mainTokens,
};
