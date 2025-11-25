import { CROSS_CHAIN_SEAPORT_V1_6_ADDRESS } from "@opensea/seaport-js/lib/constants";
import {
  GUNZILLA_CONDUIT_ADDRESS,
  GUNZILLA_CONDUIT_KEY,
  GUNZILLA_FEE_RECIPIENT,
  GUNZILLA_SEAPORT_1_6_ADDRESS,
  GUNZILLA_SIGNED_ZONE_V2_ADDRESS,
  OPENSEA_CONDUIT_ADDRESS,
  OPENSEA_CONDUIT_ADDRESS_2,
  OPENSEA_CONDUIT_KEY,
  OPENSEA_CONDUIT_KEY_2,
  OPENSEA_FEE_RECIPIENT,
  SIGNED_ZONE,
  SOMNIA_FEE_RECIPIENT,
  WPOL_ADDRESS,
} from "../constants";
import { Chain } from "../types";

/**
 * Gets the chain ID for a given chain.
 * @param chain The chain to get the ID for
 * @returns The chain ID as a string
 */
export const getChainId = (chain: Chain) => {
  switch (chain) {
    case Chain.Mainnet:
      return "1";
    case Chain.Polygon:
      return "137";
    case Chain.Avalanche:
      return "43114";
    case Chain.Arbitrum:
      return "42161";
    case Chain.Blast:
      return "238";
    case Chain.Base:
      return "8453";
    case Chain.Optimism:
      return "10";
    case Chain.Zora:
      return "7777777";
    case Chain.Sei:
      return "1329";
    case Chain.B3:
      return "8333";
    case Chain.BeraChain:
      return "80094";
    case Chain.Flow:
      return "747";
    case Chain.ApeChain:
      return "33139";
    case Chain.Ronin:
      return "2020";
    case Chain.Abstract:
      return "2741";
    case Chain.Shape:
      return "360";
    case Chain.Unichain:
      return "130";
    case Chain.Gunzilla:
      return "43419";
    case Chain.HyperEVM:
      return "999";
    case Chain.Somnia:
      return "5031";
    case Chain.Monad:
      return "143";
    default:
      throw new Error(`Unknown chainId for ${chain}`);
  }
};

/**
 * Returns the default currency for offers on the given chain.
 * @param chain The chain to get the offer payment token for
 * @returns The token address for offers
 */
export const getOfferPaymentToken = (chain: Chain) => {
  switch (chain) {
    case Chain.Mainnet:
      return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"; // WETH
    case Chain.Polygon:
      return "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"; // WETH
    case Chain.Avalanche:
      return "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"; // WAVAX
    case Chain.Arbitrum:
      return "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"; // WETH
    case Chain.Blast:
      return "0x4300000000000000000000000000000000000004"; // WETH
    // OP Chains have WETH at the same address
    case Chain.Base:
    case Chain.Optimism:
    case Chain.Zora:
    case Chain.B3:
    case Chain.Shape:
    case Chain.Unichain:
      return "0x4200000000000000000000000000000000000006"; // WETH
    case Chain.BeraChain:
      return "0x6969696969696969696969696969696969696969"; // WBERA
    case Chain.Sei:
      return "0xe30fedd158a2e3b13e9badaeabafc5516e95e8c7"; // WSEI
    case Chain.Flow:
      return "0xd3bf53dac106a0290b0483ecbc89d40fcc961f3e"; // WFLOW
    case Chain.ApeChain:
      return "0x48b62137edfa95a428d35c09e44256a739f6b557"; // WAPE
    case Chain.Ronin:
      return "0xe514d9deb7966c8be0ca922de8a064264ea6bcd4"; // WRON
    case Chain.Abstract:
      return "0x3439153eb7af838ad19d56e1571fbd09333c2809"; // WETH
    case Chain.Gunzilla:
      return "0x5aad7bba61d95c2c4e525a35f4062040264611f1"; // WGUN
    case Chain.HyperEVM:
      return "0x5555555555555555555555555555555555555555"; // WHYPE
    case Chain.Somnia:
      return "0x046ede9564a72571df6f5e44d0405360c0f4dcab"; // WSOMI
    case Chain.Monad:
      return "0x3bd359c1119da7da1d913d1c4d2b7c461115433a"; // WMON
    default:
      throw new Error(`Unknown offer currency for ${chain}`);
  }
};

/**
 * Returns the default currency for listings on the given chain.
 * @param chain The chain to get the listing payment token for
 * @returns The token address for listings
 */
export const getListingPaymentToken = (chain: Chain) => {
  switch (chain) {
    case Chain.Mainnet:
    case Chain.Somnia:
    case Chain.HyperEVM:
    case Chain.Arbitrum:
    case Chain.Blast:
    case Chain.Base:
    case Chain.Optimism:
    case Chain.Zora:
    case Chain.B3:
    case Chain.Abstract:
    case Chain.Shape:
    case Chain.Unichain:
    case Chain.Monad:
      return "0x0000000000000000000000000000000000000000"; // ETH
    case Chain.Polygon:
      return "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"; // WETH
    case Chain.Avalanche:
      return "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"; // WETH
    case Chain.BeraChain:
      return "0x0000000000000000000000000000000000000000"; // BERA
    case Chain.Sei:
      return "0x0000000000000000000000000000000000000000"; // SEI
    case Chain.Flow:
      return "0xd3bf53dac106a0290b0483ecbc89d40fcc961f3e"; // WETH
    case Chain.ApeChain:
      return "0x0000000000000000000000000000000000000000"; // APE
    case Chain.Ronin:
      return "0xe514d9deb7966c8be0ca922de8a064264ea6bcd4"; // WETH
    case Chain.Gunzilla:
      return "0x0000000000000000000000000000000000000000"; // GUN
    default:
      throw new Error(`Unknown listing currency for ${chain}`);
  }
};

/**
 * Get the default conduit key and address for a given chain.
 * @param chain The chain to get the conduit for
 * @returns The conduit key and address for the chain
 */
export const getDefaultConduit = (
  chain: Chain,
): { key: string; address: string } => {
  switch (chain) {
    case Chain.Abstract:
    case Chain.HyperEVM:
    case Chain.Monad:
      return {
        key: OPENSEA_CONDUIT_KEY_2,
        address: OPENSEA_CONDUIT_ADDRESS_2,
      };
    case Chain.Gunzilla:
    case Chain.Somnia:
      return {
        key: GUNZILLA_CONDUIT_KEY,
        address: GUNZILLA_CONDUIT_ADDRESS,
      };
    default:
      return {
        key: OPENSEA_CONDUIT_KEY,
        address: OPENSEA_CONDUIT_ADDRESS,
      };
  }
};

/**
 * Get the Seaport 1.6 contract address for a given chain.
 * @param chain The chain to get the Seaport address for
 * @returns The Seaport 1.6 address for the chain
 */
export const getSeaportAddress = (chain: Chain): string => {
  switch (chain) {
    case Chain.Gunzilla:
    case Chain.Somnia:
      return GUNZILLA_SEAPORT_1_6_ADDRESS;
    default:
      return CROSS_CHAIN_SEAPORT_V1_6_ADDRESS;
  }
};

/**
 * Get the signed zone address for a given chain.
 * @param chain The chain to get the signed zone address for
 * @returns The signed zone address for the chain
 */
export const getSignedZone = (chain: Chain): string => {
  switch (chain) {
    case Chain.Gunzilla:
    case Chain.Somnia:
      return GUNZILLA_SIGNED_ZONE_V2_ADDRESS;
    default:
      return SIGNED_ZONE;
  }
};

/**
 * Get the fee recipient address for a given chain
 * @param chain The blockchain chain
 * @returns The fee recipient address for the chain
 */
export const getFeeRecipient = (chain: Chain): string => {
  switch (chain) {
    case Chain.Gunzilla:
      return GUNZILLA_FEE_RECIPIENT;
    case Chain.Somnia:
      return SOMNIA_FEE_RECIPIENT;
    default:
      return OPENSEA_FEE_RECIPIENT;
  }
};

/**
 * Get the appropriate token address for wrap/unwrap operations.
 * For Polygon, use WPOL. For other chains, use the wrapped native asset.
 * @param chain The chain to get the token address for
 * @returns The token address for wrap/unwrap operations
 */
export const getNativeWrapTokenAddress = (chain: Chain): string => {
  switch (chain) {
    case Chain.Polygon:
      return WPOL_ADDRESS;
    default:
      return getOfferPaymentToken(chain);
  }
};
