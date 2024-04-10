import {
  CROSS_CHAIN_SEAPORT_V1_5_ADDRESS,
  CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
  ItemType,
} from "@opensea/seaport-js/lib/constants";
import { ethers, FixedNumber } from "ethers";
import {
  MAX_EXPIRATION_MONTHS,
  SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
  SHARED_STOREFRONT_ADDRESSES,
  FIXED_NUMBER_100,
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

export const getWETHAddress = (chain: Chain) => {
  switch (chain) {
    case Chain.Mainnet:
      return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    case Chain.Polygon:
      return "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
    case Chain.Amoy:
      return "0x52eF3d68BaB452a294342DC3e5f464d7f610f72E";
    case Chain.Sepolia:
      return "0x7b79995e5f793a07bc00c21412e50ecae098e7f9";
    case Chain.Klaytn:
      return "0xfd844c2fca5e595004b17615f891620d1cb9bbb2";
    case Chain.Baobab:
      return "0x9330dd6713c8328a8d82b14e3f60a0f0b4cc7bfb";
    case Chain.Avalanche:
      return "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
    case Chain.Fuji:
      return "0xd00ae08403B9bbb9124bB305C09058E32C39A48c";
    case Chain.BNB:
      return "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    case Chain.BNBTestnet:
      return "0xae13d989dac2f0debff460ac112a837c89baa7cd";
    case Chain.Arbitrum:
      return "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";
    case Chain.ArbitrumNova:
      return "0x722e8bdd2ce80a4422e880164f2079488e115365";
    case Chain.ArbitrumSepolia:
      return "0x980b62da83eff3d4576c647993b0c1d7faf17c73";
    case Chain.Blast:
      return "0x4300000000000000000000000000000000000004";
    case Chain.BlastSepolia:
      return "0x4200000000000000000000000000000000000023";
    // OP Chains have WETH at the same address
    case Chain.Base:
    case Chain.BaseSepolia:
    case Chain.Optimism:
    case Chain.OptimismSepolia:
    case Chain.Zora:
    case Chain.ZoraSepolia:
      return "0x4200000000000000000000000000000000000006";
    default:
      throw new Error(`Unknown WETH address for ${chain}`);
  }
};

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
 * Checks whether the current chain is a test chain.
 * @param chain Chain to check.
 * @returns True if the chain is a test chain.
 */
export const isTestChain = (chain: Chain): boolean => {
  switch (chain) {
    case Chain.Sepolia:
    case Chain.Amoy:
    case Chain.Baobab:
    case Chain.BaseSepolia:
    case Chain.BlastSepolia:
    case Chain.BNBTestnet:
    case Chain.ArbitrumSepolia:
    case Chain.Fuji:
    case Chain.OptimismSepolia:
    case Chain.SolanaDevnet:
    case Chain.ZoraSepolia:
      return true;
    default:
      return false;
  }
};

/**
 * Returns if a protocol address is valid.
 * @param protocolAddress The protocol address
 */
export const isValidProtocol = (protocolAddress: string): boolean => {
  const checkSumAddress = ethers.getAddress(protocolAddress);
  const validProtocolAddresses = [
    CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
    CROSS_CHAIN_SEAPORT_V1_5_ADDRESS,
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
