import { OpenSeaAPI } from "./api";
import { OpenSeaSDK } from "./sdk";
import { Network, EventData, EventType } from "./types";
export { orderToJSON, orderFromJSON } from "./utils/utils";
export { encodeDefaultCall } from "./utils/schemas/schema";
/**
 * Example setup:
 *
 * import * as Web3 from 'web3'
 * import { OpenSeaPort, Network } from 'opensea-js'
 * const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')
 * const client = new OpenSeaPort(provider, {
 *   networkName: Network.Main
 * })
 */
export { OpenSeaSDK, OpenSeaSDK as OpenSeaPort, OpenSeaAPI, EventType, Network, };
export type { EventData };
