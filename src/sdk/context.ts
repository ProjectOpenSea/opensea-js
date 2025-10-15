import { Seaport } from "@opensea/seaport-js";
import { Signer, JsonRpcProvider } from "ethers";
import { OpenSeaAPI } from "../api/api";
import { EventData, EventType, Chain } from "../types";

/**
 * Shared context passed to all SDK managers.
 * Contains common dependencies and utilities needed across managers.
 */
export interface SDKContext {
  /** The blockchain chain being used */
  chain: Chain;
  /** Signer or provider for blockchain interactions */
  signerOrProvider: Signer | JsonRpcProvider;
  /** JSON-RPC provider for read operations */
  provider: JsonRpcProvider;
  /** OpenSea API client */
  api: OpenSeaAPI;
  /** Seaport client instance */
  seaport: Seaport;
  /** Logger function for debugging */
  logger: (msg: string) => void;
  /** Event dispatcher */
  dispatch: (event: EventType, data: EventData) => void;
  /** Transaction confirmation helper */
  confirmTransaction: (
    hash: string,
    event: EventType,
    description: string,
  ) => Promise<void>;
  /** Account availability checker */
  requireAccountIsAvailable: (address: string) => Promise<void>;
}
