import { getChainsPath } from "./apiPaths"
import type { Fetcher } from "./fetcher"
import type { GetChainsResponse } from "./types"

/**
 * Chain-related API operations
 */
export class ChainsAPI {
  constructor(private fetcher: Fetcher) {}

  /**
   * Gets the list of supported chains.
   */
  async getChains(): Promise<GetChainsResponse> {
    const response = await this.fetcher.get<GetChainsResponse>(getChainsPath())
    return response
  }
}
