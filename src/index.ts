/* eslint-disable import/no-unused-modules */
import { OpenSeaSDK } from "./sdk";
import { Asset, Chain, EventData, EventType, OpenSeaCollection } from "./types";

/**
 * @example
 * // Example Setup
 * ```ts
 * import { ethers } from 'ethers'
 * import { OpenSeaSDK, Chain } from 'opensea-js'
 * const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io')
 * const client = new OpenSeaSDK(provider, {
 *   chain: Chain.Mainnet
 * })
 * ```
 */

export {
  // Main SDK export
  OpenSeaSDK,
  // Types to help initialize SDK and listen to events
  EventType,
  Chain,
};

export type { EventData, OpenSeaCollection, Asset };
export * from "./api/types";
