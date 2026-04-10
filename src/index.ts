import { OpenSeaSDK } from "./sdk"

export * from "./api/types"
export * from "./constants"
export * from "./orders/types"
export type {
  ContractCaller,
  OpenSeaProvider,
  OpenSeaSigner,
  OpenSeaWallet,
  TransactionResponse,
} from "./provider/types"
export * from "./types"
export * from "./utils"
/**
 * @example
 * // Example Setup
 * ```ts
 * import { ethers } from 'ethers'
 * import { OpenSeaSDK, Chain } from 'opensea-js'
 * const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io')
 * const client = new OpenSeaSDK(provider, {
 *   chain: Chain.Mainnet
 * })
 * ```
 */
export {
  // Main SDK export
  OpenSeaSDK,
}
