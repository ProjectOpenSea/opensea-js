import { getSearchPath } from "./apiPaths";
import { Fetcher } from "./fetcher";
import { SearchArgs, SearchResponse } from "./types";

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
    );
    return response;
  }
}
