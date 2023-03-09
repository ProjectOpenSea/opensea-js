import { NetworkTokens } from "./index";

export const tokens: NetworkTokens = {
  canonicalWrappedEther: {
    name: "Rinkeby Canonical Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    address: "0xc778417e063141139fce010982780140aa0cd5ab",
  },
  otherTokens: [
    {
      name: "Rinkeby Test Token",
      symbol: "TST",
      decimals: 18,
      address: "0xb7dDCF6B64C05D76Adc497AE78AD83ba3883A294",
    },
    {
      name: "Decentraland - Chainbreakers",
      symbol: "MANA",
      decimals: 18,
      address: "0x0f8528c53fecb54b7005525a3e797e261a51b88e",
    },
  ],
};
