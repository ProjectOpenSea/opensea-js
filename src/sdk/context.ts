import { Seaport } from "@opensea/seaport-js";
// Ethers v6'da 'ethers' paketinden veya Ethers v5'te ayrı paketlerden import yapılabilir.
// Standart Ethers v6 tiplerini varsayarak düzenlenmiştir.
import { Signer, JsonRpcProvider } from "ethers"; 
import { OpenSeaAPI } from "../api/api";
import { EventData, EventType, Chain } from "../types";

/**
 * Interface for the parameters required to confirm a blockchain transaction.
 */
export interface TransactionConfirmationParams {
  /** The transaction hash to wait for. */
  hash: string;
  /** The specific event type to dispatch upon confirmation or failure. */
  event: EventType;
  /** A human-readable description of the transaction for logging/UI purposes. */
  description: string;
}

/**
 * Shared context passed to all SDK managers.
 * Contains common dependencies and utilities needed across managers for blockchain and API interactions.
 */
export interface SDKContext {
  /** The blockchain chain being used (e.g., Ethereum, Polygon). */
  chain: Chain;
  
  /** * The active Signer (for write operations) or Provider (for read-only operations). 
   */
  signerOrProvider: Signer | JsonRpcProvider;

  /** * Dedicated JSON-RPC provider for read operations. 
   * This is explicitly defined to ensure read operations are consistent, 
   * even if a Signer (which extends Provider) is present in `signerOrProvider`. 
   */
  provider: JsonRpcProvider;

  /** OpenSea API client for off-chain data and metadata. */
  api: OpenSeaAPI;

  /** Seaport client instance for executing on-chain orders. */
  seaport: Seaport;

  /** * Logger function for debugging and tracing.
   * NOTE: Consider a more robust logger interface (e.g., { log, warn, error }) 
   * for production SDKs.
   */
  logger: (msg: string) => void;

  /** Event dispatcher to notify consumers of SDK activity. */
  dispatch: (event: EventType, data: EventData) => void;

  /** * Helper function to wait for transaction confirmation.
   * Uses a configuration object for cleaner parameter passing.
   */
  confirmTransaction: (params: TransactionConfirmationParams) => Promise<void>;

  /** * Utility to check if a Signer is available for the given address 
   * before attempting a state-changing transaction.
   * * @param address - The address expected to be the signer.
   */
  requireAccountIsAvailable: (address: string) => Promise<void>;
}
