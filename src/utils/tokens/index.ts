import { tokens as goerliTokens } from "./goerli";
import { tokens as mainTokens } from "./main";
import { Network } from "../../types";

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

export const getCanonicalWrappedEther = function (network: Network): Token {
  switch (network) {
    case Network.Main:
      return tokens.main.canonicalWrappedEther;
    case Network.Goerli:
      return tokens.goerli.canonicalWrappedEther;
  }
};

const tokens = {
  goerli: goerliTokens,
  main: mainTokens,
};
