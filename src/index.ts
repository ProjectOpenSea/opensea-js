import { OpenSeaSDK } from "./sdk";

/**
 * @example
 * ```ts
 * import { ethers } from 'ethers'
 * import { OpenSeaSDK, Chain } from 'opensea-js'
 * const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io')
 * const client = new OpenSeaSDK(provider, {
 *   chain: Chain.Mainnet
 * })
 * ```
 */

// Export main SDK
export { OpenSeaSDK };

// Export types
export * from "./types";
export * from "./api/types";
export type { OrderType, ProtocolData } from "./orders/types";
