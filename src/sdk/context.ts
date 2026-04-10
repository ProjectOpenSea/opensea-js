import type { Seaport } from "@opensea/seaport-js"
import type { OpenSeaAPI } from "../api/api"
import type { ContractCaller, OpenSeaWallet } from "../provider/types"
import type { Chain, EventData, EventType } from "../types"

/**
 * Shared context passed to all SDK managers.
 * Contains common dependencies and utilities needed across managers.
 */
export interface SDKContext {
  /** The blockchain chain being used */
  chain: Chain
  /** Abstract wallet (signer + provider) */
  wallet: OpenSeaWallet
  /** Contract read/write caller */
  contractCaller: ContractCaller
  /** OpenSea API client */
  api: OpenSeaAPI
  /** Seaport client instance */
  seaport: Seaport
  /** Logger function for debugging */
  logger: (msg: string) => void
  /** Event dispatcher */
  dispatch: (event: EventType, data: EventData) => void
  /** Transaction confirmation helper */
  confirmTransaction: (
    hash: string,
    event: EventType,
    description: string,
  ) => Promise<void>
  /** Account availability checker */
  requireAccountIsAvailable: (address: string) => Promise<void>
}
