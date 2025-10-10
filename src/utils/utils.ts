import {
  CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
  ItemType,
} from "@opensea/seaport-js/lib/constants";
import { ethers, FixedNumber } from "ethers";
import {
  FIXED_NUMBER_100,
  GUNZILLA_CONDUIT_KEY,
  GUNZILLA_FEE_RECIPIENT,
  GUNZILLA_SEAPORT_1_6_ADDRESS,
  GUNZILLA_SIGNED_ZONE_V2_ADDRESS,
  MAX_EXPIRATION_MONTHS,
  OPENSEA_CONDUIT_KEY,
  OPENSEA_CONDUIT_KEY_2,
  OPENSEA_FEE_RECIPIENT,
  SHARED_STOREFRONT_ADDRESSES,
  SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
  SIGNED_ZONE,
} from "../constants";
import {
  Chain,
  Fee,
  OpenSeaAccount,
  OpenSeaCollection,
  OpenSeaPaymentToken,
  RarityStrategy,
  TokenStandard,
} from "../types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const collectionFromJSON = (collection: any): OpenSeaCollection => {
  return {
    name: collection.name,
    collection: collection.collection,
    description: collection.description,
    imageUrl: collection.image_url,
    bannerImageUrl: collection.banner_image_url,
    owner: collection.owner,
    safelistStatus: collection.safelist_status,
    category: collection.category,
    isDisabled: collection.is_disabled,
    isNSFW: collection.is_nsfw,
    traitOffersEnabled: collection.trait_offers_enabled,
    collectionOffersEnabled: collection.collection_offers_enabled,
    openseaUrl: collection.opensea_url,
    projectUrl: collection.project_url,
    wikiUrl: collection.wiki_url,
    discordUrl: collection.discord_url,
    telegramUrl: collection.telegram_url,
    twitterUsername: collection.twitter_username,
    instagramUsername: collection.instagram_username,
    contracts: (collection.contracts ?? []).map((contract: any) => ({
      address: contract.address,
      chain: contract.chain,
    })),
    editors: collection.editors,
    fees: (collection.fees ?? []).map(feeFromJSON),
    rarity: rarityFromJSON(collection.rarity),
    paymentTokens: (collection.payment_tokens ?? []).map(paymentTokenFromJSON),
    totalSupply: collection.total_supply,
    createdDate: collection.created_date,
    requiredZone: collection.required_zone,
  };
};

export const rarityFromJSON = (rarity: any): RarityStrategy | null => {
  if (!rarity) {
    return null;
  }
  const fromJSON: RarityStrategy = {
    strategyId: rarity.strategy_id,
    strategyVersion: rarity.strategy_version,
    calculatedAt: rarity.calculated_at,
    maxRank: rarity.max_rank,
    tokensScored: rarity.tokens_scored,
  };
  return fromJSON;
};

export const paymentTokenFromJSON = (token: any): OpenSeaPaymentToken => {
  const fromJSON: OpenSeaPaymentToken = {
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    address: token.address,
    chain: token.chain,
    imageUrl: token.image,
    ethPrice: token.eth_price,
    usdPrice: token.usd_price,
  };
  return fromJSON;
};

export const accountFromJSON = (account: any): OpenSeaAccount => {
  return {
    address: account.address,
    username: account.username,
    profileImageUrl: account.profile_image_url,
    bannerImageUrl: account.banner_image_url,
    website: account.website,
    socialMediaAccounts: (account.social_media_accounts ?? []).map(
      (acct: any) => ({
        platform: acct.platform,
        username: acct.username,
      }),
    ),
    bio: account.bio,
    joinedDate: account.joined_date,
  };
};

export const feeFromJSON = (fee: any): Fee => {
  const fromJSON: Fee = {
    fee: fee.fee,
    recipient: fee.recipient,
    required: fee.required,
  };
  return fromJSON;
};

/**
 * Estimate gas usage for a transaction.
 * @param provider The Provider
 * @param from Address sending transaction
 * @param to Destination contract address
 * @param data Data to send to contract
 * @param value Value in ETH to send with data
 */
export async function estimateGas(
  provider: ethers.Provider,
  { from, to, data, value = 0n }: ethers.Transaction,
) {
  return await provider.estimateGas({
    from,
    to,
    value: value.toString(),
    data,
  });
}

/**
 * The longest time that an order is valid for is one month from the current date
 * @returns unix timestamp
 */
export const getMaxOrderExpirationTimestamp = () => {
  const maxExpirationDate = new Date();

  maxExpirationDate.setMonth(
    maxExpirationDate.getMonth() + MAX_EXPIRATION_MONTHS,
  );
  maxExpirationDate.setDate(maxExpirationDate.getDate() - 1);

  return Math.round(maxExpirationDate.getTime() / 1000);
};

interface ErrorWithCode extends Error {
  code: string;
}

export const hasErrorCode = (error: unknown): error is ErrorWithCode => {
  const untypedError = error as Partial<ErrorWithCode>;
  return !!untypedError.code;
};

export const getAssetItemType = (tokenStandard: TokenStandard) => {
  switch (tokenStandard) {
    case "ERC20":
      return ItemType.ERC20;
    case "ERC721":
      return ItemType.ERC721;
    case "ERC1155":
      return ItemType.ERC1155;
    default:
      throw new Error(`Unknown schema name: ${tokenStandard}`);
  }
};

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
    default:
      throw new Error(`Unknown chainId for ${chain}`);
  }
};

/** Returns the default currency for offers on the given chain. */
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
    default:
      throw new Error(`Unknown offer currency for ${chain}`);
  }
};

/** Returns the default currency for listings on the given chain. */
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

/** @deprecated Use getOfferPaymentToken instead. Backward compatibility alias. */
export const getWETHAddress = getOfferPaymentToken;

/**
 * Checks if the token address is the shared storefront address and if so replaces
 * that address with the lazy mint adapter address. Otherwise, returns the input token address
 * @param tokenAddress token address
 * @returns input token address or lazy mint adapter address
 */
export const getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress =
  (tokenAddress: string): string => {
    return SHARED_STOREFRONT_ADDRESSES.includes(tokenAddress.toLowerCase())
      ? SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS
      : tokenAddress;
  };

/**
 * Sums up the basis points for fees.
 * @param fees The fees to sum up
 * @returns sum of basis points
 */
export const totalBasisPointsForFees = (fees: Fee[]): bigint => {
  const feeBasisPoints = fees.map((fee) => basisPointsForFee(fee));
  const totalBasisPoints = feeBasisPoints.reduce(
    (sum, basisPoints) => basisPoints + sum,
    0n,
  );
  return totalBasisPoints;
};

/**
 * Converts a fee to its basis points representation.
 * @param fee The fee to convert
 * @returns the basis points
 */
export const basisPointsForFee = (fee: Fee): bigint => {
  return BigInt(
    FixedNumber.fromString(fee.fee.toString())
      .mul(FIXED_NUMBER_100)
      .toFormat(0) // format to 0 decimal places to convert to bigint
      .toString(),
  );
};

/**
 * Returns if a protocol address is valid.
 * @param protocolAddress The protocol address
 */
export const isValidProtocol = (protocolAddress: string): boolean => {
  const checkSumAddress = ethers.getAddress(protocolAddress);
  const validProtocolAddresses = [
    CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
    GUNZILLA_SEAPORT_1_6_ADDRESS,
  ].map((address) => ethers.getAddress(address));
  return validProtocolAddresses.includes(checkSumAddress);
};

/**
 * Throws an error if the protocol address is not valid.
 * @param protocolAddress The protocol address
 */
export const requireValidProtocol = (protocolAddress: string) => {
  if (!isValidProtocol(protocolAddress)) {
    throw new Error(`Unsupported protocol address: ${protocolAddress}`);
  }
};

/**
 * Get the default conduit key for a given chain.
 * @param chain The chain to get the conduit key for
 * @returns The conduit key for the chain
 */
export const getDefaultConduitKey = (chain: Chain): string => {
  switch (chain) {
    case Chain.Abstract:
      return OPENSEA_CONDUIT_KEY_2;
    case Chain.Gunzilla:
      return GUNZILLA_CONDUIT_KEY;
    case Chain.HyperEVM:
      return OPENSEA_CONDUIT_KEY_2;
    case Chain.Somnia:
      return GUNZILLA_CONDUIT_KEY;
    default:
      return OPENSEA_CONDUIT_KEY;
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
    default:
      return OPENSEA_FEE_RECIPIENT;
  }
};

/**
 * Decodes an encoded string of token IDs into an array of individual token IDs using bigint for precise calculations.
 *
 * The encoded token IDs can be in the following formats:
 * 1. Single numbers: '123' => ['123']
 * 2. Comma-separated numbers: '1,2,3,4' => ['1', '2', '3', '4']
 * 3. Ranges of numbers: '5:8' => ['5', '6', '7', '8']
 * 4. Combinations of single numbers and ranges: '1,3:5,8' => ['1', '3', '4', '5', '8']
 * 5. Wildcard '*' (matches all token IDs): '*' => ['*']
 *
 * @param encodedTokenIds - The encoded string of token IDs to be decoded.
 * @returns An array of individual token IDs after decoding the input.
 *
 * @throws {Error} If the input is not correctly formatted or if bigint operations fail.
 *
 * @example
 * const encoded = '1,3:5,8';
 * const decoded = decodeTokenIds(encoded); // Output: ['1', '3', '4', '5', '8']
 *
 * @example
 * const encodedWildcard = '*';
 * const decodedWildcard = decodeTokenIds(encodedWildcard); // Output: ['*']
 *
 * @example
 * const emptyEncoded = '';
 * const decodedEmpty = decodeTokenIds(emptyEncoded); // Output: []
 */
export const decodeTokenIds = (encodedTokenIds: string): string[] => {
  if (encodedTokenIds === "*") {
    return ["*"];
  }

  if (encodedTokenIds === "") {
    return [];
  }

  const validFormatRegex = /^(\d+(:\d+)?)(,\d+(:\d+)?)*$/;

  if (!validFormatRegex.test(encodedTokenIds)) {
    throw new Error(
      "Invalid input format. Expected a valid comma-separated list of numbers and ranges.",
    );
  }

  const ranges = encodedTokenIds.split(",");
  const tokenIds: string[] = [];

  for (const range of ranges) {
    if (range.includes(":")) {
      const [startStr, endStr] = range.split(":");
      const start = BigInt(startStr);
      const end = BigInt(endStr);
      const diff = end - start + 1n;

      if (diff <= 0) {
        throw new Error(
          `Invalid range. End value: ${end} must be greater than or equal to the start value: ${start}.`,
        );
      }

      for (let i = 0n; i < diff; i += 1n) {
        tokenIds.push((start + i).toString());
      }
    } else {
      const tokenId = BigInt(range);
      tokenIds.push(tokenId.toString());
    }
  }

  return tokenIds;
};
