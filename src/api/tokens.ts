import {
  getSwapQuotePath,
  getTokenGroupPath,
  getTokenGroupsPath,
  getTokenPath,
  getTopTokensPath,
  getTrendingTokensPath,
} from "./apiPaths"
import type { Fetcher } from "./fetcher"
import type {
  GetSwapQuoteArgs,
  GetSwapQuoteResponse,
  GetTokenGroupResponse,
  GetTokenGroupsArgs,
  GetTokenGroupsResponse,
  GetTokenResponse,
  GetTokensArgs,
  GetTopTokensResponse,
  GetTrendingTokensResponse,
} from "./types"

/**
 * Token-related API operations
 */
export class TokensAPI {
  constructor(private fetcher: Fetcher) {}

  /**
   * Gets a list of trending tokens.
   */
  async getTrendingTokens(
    args?: GetTokensArgs,
  ): Promise<GetTrendingTokensResponse> {
    const response = await this.fetcher.get<GetTrendingTokensResponse>(
      getTrendingTokensPath(),
      args,
    )
    return response
  }

  /**
   * Gets a list of top tokens.
   */
  async getTopTokens(args?: GetTokensArgs): Promise<GetTopTokensResponse> {
    const response = await this.fetcher.get<GetTopTokensResponse>(
      getTopTokensPath(),
      args,
    )
    return response
  }

  /**
   * Gets a swap quote.
   */
  async getSwapQuote(args: GetSwapQuoteArgs): Promise<GetSwapQuoteResponse> {
    const response = await this.fetcher.get<GetSwapQuoteResponse>(
      getSwapQuotePath(),
      args,
    )
    return response
  }

  /**
   * Gets details for a specific token.
   */
  async getToken(chain: string, address: string): Promise<GetTokenResponse> {
    const response = await this.fetcher.get<GetTokenResponse>(
      getTokenPath(chain, address),
    )
    return response
  }

  /**
   * Gets a paginated list of token groups (equivalent currencies across chains).
   */
  async getTokenGroups(
    args?: GetTokenGroupsArgs,
  ): Promise<GetTokenGroupsResponse> {
    return this.fetcher.get<GetTokenGroupsResponse>(getTokenGroupsPath(), args)
  }

  /**
   * Gets a single token group by its slug.
   */
  async getTokenGroup(slug: string): Promise<GetTokenGroupResponse> {
    return this.fetcher.get<GetTokenGroupResponse>(getTokenGroupPath(slug))
  }
}
