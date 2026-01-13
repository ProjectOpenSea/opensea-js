import { Seaport } from "@opensea/seaport-js";
import {
  CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
  ItemType,
} from "@opensea/seaport-js/lib/constants";
import { ethers } from "ethers";
import {
  GUNZILLA_SEAPORT_1_6_ADDRESS,
  SHARED_STOREFRONT_ADDRESSES,
  SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
} from "../constants";
import { TokenStandard } from "../types";

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
 * Returns if a protocol address is valid.
 * @param protocolAddress The protocol address
 */
export const isValidProtocol = (protocolAddress: string): boolean => {
  try {
    const checkSumAddress = ethers.getAddress(protocolAddress);
    const validProtocolAddresses = [
      CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
      GUNZILLA_SEAPORT_1_6_ADDRESS,
    ].map((address) => ethers.getAddress(address));
    return validProtocolAddresses.includes(checkSumAddress);
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
  try {
    const checksummedProtocolAddress = ethers.getAddress(protocolAddress);

    const crossChainSeaportAddress = ethers.getAddress(
      CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
    );
    const gunzillaSeaportAddress = ethers.getAddress(GUNZILLA_SEAPORT_1_6_ADDRESS);

    switch (checksummedProtocolAddress) {
      case crossChainSeaportAddress:
      case gunzillaSeaportAddress:
        return seaport;
      default:
        throw new Error(`Unsupported protocol address: ${protocolAddress}`);
    }
  } catch (error) {
    // If ethers.getAddress fails, it's an invalid address format
    if (
      error instanceof Error &&
      error.message.includes("Unsupported protocol")
    ) {
      throw error;
    }
    throw new Error(`Unsupported protocol address: ${protocolAddress}`);
  }
};

/**
 * Get the Seaport version string for a given protocol address.
 * @param protocolAddress The protocol address
 * @returns The version string (e.g., "1.6")
 * @throws Error if the protocol address is not supported
 */
export const getSeaportVersion = (protocolAddress: string): string => {
  try {
    const protocolAddressChecksummed = ethers.getAddress(protocolAddress);

    const crossChainSeaportAddress = ethers.getAddress(
      CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
    );
    const gunzillaSeaportAddress = ethers.getAddress(GUNZILLA_SEAPORT_1_6_ADDRESS);

    switch (protocolAddressChecksummed) {
      case crossChainSeaportAddress:
      case gunzillaSeaportAddress:
        return "1.6";
      default:
        throw new Error(
          `Unknown or unsupported protocol address: ${protocolAddress}`,
        );
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unknown or unsupported protocol")
    ) {
      throw error;
    }
    throw new Error(
      `Unknown or unsupported protocol address: ${protocolAddress}`,
    );
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
