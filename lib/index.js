/* eslint-disable import/no-unused-modules */
import { OpenSeaAPI } from "./api";
import { OpenSeaPort } from "./seaport";
import { Network, EventType } from "./types";
export { orderToJSON, orderFromJSON, WyvernProtocol } from "./utils/utils";
export { encodeCall, encodeSell, encodeAtomicizedBuy, encodeAtomicizedSell, encodeDefaultCall, encodeReplacementPattern, AbiType, } from "./utils/schema";
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
export { 
// Main SDK export:
OpenSeaPort, 
// So the API could be used separately:
OpenSeaAPI, 
// Useful for serializing and deserializing orders:
// Types to help initialize SDK and listen to events.
EventType, Network, };
//# sourceMappingURL=index.js.map