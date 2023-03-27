import { tokens as goerliTokens } from "./goerli";
import { tokens as mainTokens } from "./main";
import { tokens as rinkebyTokens } from "./rinkeby";
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
    case Network.Rinkeby:
      return tokens.rinkeby.canonicalWrappedEther;
  }
};

export const getTokens = function (network: Network): NetworkTokens {
  switch (network) {
    case Network.Main:
      return tokens.main;
    case Network.Goerli:
      return tokens.goerli;
    case Network.Rinkeby:
      return tokens.rinkeby;
  }
};

const tokens = {
  goerli: goerliTokens,
  rinkeby: rinkebyTokens,
  main: mainTokens,
};
