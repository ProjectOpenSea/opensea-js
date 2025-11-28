import {
  getBestListingAPIPath,
  getAllListingsAPIPath,
  getBestListingsAPIPath,
  getOrdersAPIPath,
} from "./apiPaths";
import { Fetcher } from "./fetcher";
import { GetBestListingResponse, GetListingsResponse } from "./types";
import { serializeOrdersQueryOptions } from "../orders/utils";
import { Chain, OrderSide } from "../types";

/**
 * Listing-related API operations
 */
export class ListingsAPI {
  constructor(
    private fetcher: Fetcher,
    private chain: Chain,
  ) {}

  /**
   * Gets all listings for a given collection.
   * @param collectionSlug The collection slug
   * @param limit The number of listings to return
   * @param next The cursor for pagination
   * @param includePrivateListings Whether to include private listings (default: false)
   */
  async getAllListings(
    collectionSlug: string,
    limit?: number,
    next?: string,
    includePrivateListings?: boolean,
  ): Promise<GetListingsResponse> {
    const response = await this.fetcher.get<GetListingsResponse>(
      getAllListingsAPIPath(collectionSlug),
      {
        limit,
        next,
        ...(includePrivateListings !== undefined && {
          include_private_listings: includePrivateListings,
        }),
      },
    );
    return response;
  }

  /**
   * Gets the best listing for a given token.
   * @param collectionSlug The collection slug
   * @param tokenId The token ID
   * @param includePrivateListings Whether to include private listings (default: false)
   */
  async getBestListing(
    collectionSlug: string,
    tokenId: string | number,
    includePrivateListings?: boolean,
  ): Promise<GetBestListingResponse> {
    const response = await this.fetcher.get<GetBestListingResponse>(
      getBestListingAPIPath(collectionSlug, tokenId),
      includePrivateListings !== undefined
        ? { include_private_listings: includePrivateListings }
        : undefined,
    );
    return response;
  }

  /**
   * Gets the best listings for a given collection.
   * @param collectionSlug The collection slug
   * @param limit The number of listings to return
   * @param next The cursor for pagination
   * @param includePrivateListings Whether to include private listings (default: false)
   */
  async getBestListings(
    collectionSlug: string,
    limit?: number,
    next?: string,
    includePrivateListings?: boolean,
  ): Promise<GetListingsResponse> {
    const response = await this.fetcher.get<GetListingsResponse>(
      getBestListingsAPIPath(collectionSlug),
      {
        limit,
        next,
        ...(includePrivateListings !== undefined && {
          include_private_listings: includePrivateListings,
        }),
      },
    );
    return response;
  }

  /**
   * Gets all active listings for a specific NFT.
   * @param assetContractAddress The NFT contract address
   * @param tokenId The token ID
   * @param limit The number of listings to return
   * @param next The cursor for pagination
   * @param chain The blockchain chain
   * @param includePrivateListings Whether to include private listings (default: false)
   */
  async getNFTListings(
    assetContractAddress: string,
    tokenId: string,
    limit?: number,
    next?: string,
    chain: Chain = this.chain,
    includePrivateListings?: boolean,
  ): Promise<GetListingsResponse> {
    const response = await this.fetcher.get<GetListingsResponse>(
      getOrdersAPIPath(chain, "seaport", OrderSide.LISTING),
      {
        ...serializeOrdersQueryOptions({
          assetContractAddress,
          tokenIds: [tokenId],
          limit,
          next,
        }),
        ...(includePrivateListings !== undefined && {
          include_private_listings: includePrivateListings,
        }),
      },
    );
    return response;
  }
}
