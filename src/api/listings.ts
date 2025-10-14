import {
  getBestListingAPIPath,
  getAllListingsAPIPath,
  getBestListingsAPIPath,
} from "./apiPaths";
import {
  GetBestListingResponse,
  GetListingsResponse,
} from "./types";

/**
 * Listing-related API operations
 */
export class ListingsAPI {
  constructor(
    private get: <T>(apiPath: string, query?: object) => Promise<T>,
  ) {}

  /**
   * Gets all listings for a given collection.
   */
  async getAllListings(
    collectionSlug: string,
    limit?: number,
    next?: string,
  ): Promise<GetListingsResponse> {
    const response = await this.get<GetListingsResponse>(
      getAllListingsAPIPath(collectionSlug),
      {
        limit,
        next,
      },
    );
    return response;
  }

  /**
   * Gets the best listing for a given token.
   */
  async getBestListing(
    collectionSlug: string,
    tokenId: string | number,
  ): Promise<GetBestListingResponse> {
    const response = await this.get<GetBestListingResponse>(
      getBestListingAPIPath(collectionSlug, tokenId),
    );
    return response;
  }

  /**
   * Gets the best listings for a given collection.
   */
  async getBestListings(
    collectionSlug: string,
    limit?: number,
    next?: string,
  ): Promise<GetListingsResponse> {
    const response = await this.get<GetListingsResponse>(
      getBestListingsAPIPath(collectionSlug),
      {
        limit,
        next,
      },
    );
    return response;
  }
}
