/* eslint-disable import/no-unused-modules */
import { OpenSeaAPI } from "./api";
import { OpenSeaSDK } from "./sdk";
import { Network, EventData, EventType } from "./types";
export { orderToJSON, orderFromJSON } from "./utils/utils";

/**
 * Example setup:
 *
 * import { ethers } from 'ethers'
 * import { OpenSeaPort, Network } from 'opensea-js'
 * const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io')
 * const client = new OpenSeaPort(provider, {
 *   networkName: Network.Main
 * })
 */

export {
  // Main SDK export:
  OpenSeaSDK,
  // Legacy SDK export:
  OpenSeaSDK as OpenSeaPort,
  // So the API could be used separately:
  OpenSeaAPI,
  // Useful for serializing and deserializing orders:
  // Types to help initialize SDK and listen to events.
  EventType,
  Network,
};

export type { EventData };
