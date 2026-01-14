import { Seaport } from "@opensea/seaport-js";
import {
  CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
  ItemType,
} from "@opensea/seaport-js/lib/constants";
import { ethers } from "ethers";
import {
  ALTERNATE_SEAPORT_V1_6_ADDRESS,
  SHARED_STOREFRONT_ADDRESSES,
  SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
} from "../constants";
import { TokenStandard } from "../types";

// Pre-compute checksummed protocol addresses for consistent comparisons
const VALID_PROTOCOL_ADDRESSES = new Set([
  ethers.getAddress(CROSS_CHAIN_SEAPORT_V1_6_ADDRESS),
  ethers.getAddress(ALTERNATE_SEAPORT_V1_6_ADDRESS),
]);

/**
 * Gets the appropriate ItemType for a given token standard.
 * @param tokenStandard The token standard (ERC20, ERC721, ERC1155)
 * @returns The corresponding ItemType from Seaport
 */
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

/**
 * Remaps shared storefront token addresses to the lazy mint adapter address.
 *
 * OpenSea's shared storefront contracts require special handling - when a token
 * is from a shared storefront address, it must be remapped to the lazy mint
 * adapter address for proper Seaport order creation.
 *
 * @param tokenAddress The token contract address to check
 * @returns The lazy mint adapter address if the input is a shared storefront address,
 *          otherwise returns the original address unchanged
 */
export const remapSharedStorefrontAddress = (tokenAddress: string): string => {
  try {
    const lowercased = tokenAddress.toLowerCase();
    if (SHARED_STOREFRONT_ADDRESSES.has(lowercased)) {
      return ethers.getAddress(
        SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
      );
    }
    return ethers.getAddress(tokenAddress);
  } catch {
    return tokenAddress;
  }
};

/**
 * Returns if a protocol address is valid.
 * @param protocolAddress The protocol address
 */
export const isValidProtocol = (protocolAddress: string): boolean => {
  try {
    return VALID_PROTOCOL_ADDRESSES.has(ethers.getAddress(protocolAddress));
  } catch {
    return false;
  }
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
 * Get the Seaport instance for a given protocol address.
 * This is a shared utility to avoid duplicating the logic across multiple SDK manager classes.
 * @param protocolAddress The protocol address
 * @param seaport The Seaport instance
 * @returns The Seaport instance for the given protocol address
 * @throws Error if the protocol address is not supported
 */
export const getSeaportInstance = (
  protocolAddress: string,
  seaport: Seaport,
): Seaport => {
  requireValidProtocol(protocolAddress);
  return seaport;
};

/**
 * Get the Seaport version string for a given protocol address.
 * @param protocolAddress The protocol address
 * @returns The version string (e.g., "1.6")
 * @throws Error if the protocol address is not supported
 */
export const getSeaportVersion = (protocolAddress: string): string => {
  requireValidProtocol(protocolAddress);
  return "1.6";
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

  // Check for whitespace and provide helpful error message
  if (/\s/.test(encodedTokenIds)) {
    throw new Error(
      "Invalid input format: whitespace is not allowed. Expected format: '1,2,3' or '1:5' or '1,3:5,8' (no spaces).",
    );
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
