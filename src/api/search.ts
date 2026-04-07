import { getSearchPath } from "./apiPaths"
import type { Fetcher } from "./fetcher"
import type { SearchArgs, SearchResponse } from "./types"

/**
 * Search-related API operations
 */
export class SearchAPI {
  constructor(private fetcher: Fetcher) {}

  /**
   * Search across collections, tokens, NFTs, and accounts.
   */
  async search(args: SearchArgs): Promise<SearchResponse> {
    const response = await this.fetcher.get<SearchResponse>(
      getSearchPath(),
      args,
    )
    return response
  }
}
