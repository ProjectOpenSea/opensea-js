/* eslint-disable import/no-unused-modules */
import { OpenSeaAPI } from "./api";
import { OpenSeaSDK } from "./sdk";
import { Chain, EventData, EventType } from "./types";

/**
 * Example setup:
 *
 * import { ethers } from 'ethers'
 * import { OpenSeaPort, Chain } from 'opensea-js'
 * const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io')
 * const client = new OpenSeaPort(provider, {
 *   chain: Chain.Mainnet
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
  Chain,
};

export type { EventData };
