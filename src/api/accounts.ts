import type { Chain, OpenSeaAccount, OpenSeaPaymentToken } from "../types"
import {
  getAccountPath,
  getAccountTokensPath,
  getPaymentTokenPath,
  getPortfolioHistoryPath,
  getPortfolioStatsPath,
  getProfileCollectionsPath,
  getProfileFavoritesPath,
  getProfileListingsPath,
  getProfileOffersPath,
  getProfileOffersReceivedPath,
  getResolveAccountPath,
} from "./apiPaths"
import type { Fetcher } from "./fetcher"
import type {
  GetAccountTokensArgs,
  GetAccountTokensResponse,
  PortfolioArgs,
  PortfolioHistoryResponse,
  PortfolioStatsResponse,
  ProfileCollectionsArgs,
  ProfileCollectionsResponse,
  ProfileFavoritesArgs,
  ProfileFavoritesResponse,
  ProfileListingsResponse,
  ProfileOffersResponse,
  ProfileOrdersArgs,
  ResolveAccountResponse,
} from "./types"

function joinArray(value: string[] | undefined): string | undefined {
  return value && value.length > 0 ? value.join(",") : undefined
}

/**
 * Account and payment token related API operations
 */
export class AccountsAPI {
  constructor(
    private fetcher: Fetcher,
    private chain: Chain,
  ) {}

  /**
   * Fetch a payment token.
   */
  async getPaymentToken(
    address: string,
    chain = this.chain,
  ): Promise<OpenSeaPaymentToken> {
    return this.fetcher.get<OpenSeaPaymentToken>(
      getPaymentTokenPath(chain, address),
    )
  }

  /**
   * Fetch account for an address.
   */
  async getAccount(address: string): Promise<OpenSeaAccount> {
    const response = await this.fetcher.get<OpenSeaAccount>(
      getAccountPath(address),
    )
    // The api-types schema marks `social_media_accounts` as a required
    // non-nullable array, but the live API returns `null` for accounts that
    // haven't linked any socials. Normalize to `[]` so callers can safely map.
    return {
      ...response,
      socialMediaAccounts: response.socialMediaAccounts ?? [],
    }
  }

  /**
   * Fetch token balances for an account.
   */
  async getAccountTokens(
    address: string,
    args?: GetAccountTokensArgs,
  ): Promise<GetAccountTokensResponse> {
    const response = await this.fetcher.get<GetAccountTokensResponse>(
      getAccountTokensPath(address),
      args,
    )
    return response
  }

  /**
   * Resolve an ENS name, OpenSea username, or wallet address to canonical account info.
   */
  async resolveAccount(identifier: string): Promise<ResolveAccountResponse> {
    const response = await this.fetcher.get<ResolveAccountResponse>(
      getResolveAccountPath(identifier),
    )
    return response
  }

  /**
   * Get portfolio stats (net worth, P&L) for an account.
   */
  async getPortfolioStats(
    address: string,
    args?: PortfolioArgs,
  ): Promise<PortfolioStatsResponse> {
    return this.fetcher.get<PortfolioStatsResponse>(
      getPortfolioStatsPath(address),
      args,
    )
  }

  /**
   * Get portfolio net-worth history for an account.
   */
  async getPortfolioHistory(
    address: string,
    args?: PortfolioArgs,
  ): Promise<PortfolioHistoryResponse> {
    return this.fetcher.get<PortfolioHistoryResponse>(
      getPortfolioHistoryPath(address),
      args,
    )
  }

  /**
   * Get offers received by an account, scoped by collection/chain.
   */
  async getProfileOffersReceived(
    address: string,
    args?: ProfileOrdersArgs,
  ): Promise<ProfileOffersResponse> {
    return this.fetcher.get<ProfileOffersResponse>(
      getProfileOffersReceivedPath(address),
      {
        ...args,
        collectionSlugs: joinArray(args?.collectionSlugs),
        chains: joinArray(args?.chains),
      },
    )
  }

  /**
   * Get active offers made by an account.
   */
  async getProfileOffers(
    address: string,
    args?: ProfileOrdersArgs,
  ): Promise<ProfileOffersResponse> {
    return this.fetcher.get<ProfileOffersResponse>(
      getProfileOffersPath(address),
      {
        ...args,
        collectionSlugs: joinArray(args?.collectionSlugs),
        chains: joinArray(args?.chains),
      },
    )
  }

  /**
   * Get active listings for an account.
   */
  async getProfileListings(
    address: string,
    args?: ProfileOrdersArgs,
  ): Promise<ProfileListingsResponse> {
    return this.fetcher.get<ProfileListingsResponse>(
      getProfileListingsPath(address),
      {
        ...args,
        collectionSlugs: joinArray(args?.collectionSlugs),
        chains: joinArray(args?.chains),
      },
    )
  }

  /**
   * Get items favorited by an account.
   */
  async getProfileFavorites(
    address: string,
    args?: ProfileFavoritesArgs,
  ): Promise<ProfileFavoritesResponse> {
    return this.fetcher.get<ProfileFavoritesResponse>(
      getProfileFavoritesPath(address),
      {
        ...args,
        chains: joinArray(args?.chains),
      },
    )
  }

  /**
   * Get collections owned by an account.
   */
  async getProfileCollections(
    address: string,
    args?: ProfileCollectionsArgs,
  ): Promise<ProfileCollectionsResponse> {
    return this.fetcher.get<ProfileCollectionsResponse>(
      getProfileCollectionsPath(address),
      {
        ...args,
        chains: joinArray(args?.chains),
      },
    )
  }
}
