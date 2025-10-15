import {
  getBestListingAPIPath,
  getAllListingsAPIPath,
  getBestListingsAPIPath,
  getOrdersAPIPath,
} from "./apiPaths";
import { GetBestListingResponse, GetListingsResponse } from "./types";
import { serializeOrdersQueryOptions } from "../orders/utils";
import { Chain, OrderSide } from "../types";
import { Fetcher } from "./fetcher";

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
   */
  async getAllListings(
    collectionSlug: string,
    limit?: number,
    next?: string,
  ): Promise<GetListingsResponse> {
    const response = await this.fetcher.get<GetListingsResponse>(
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
    const response = await this.fetcher.get<GetBestListingResponse>(
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
    const response = await this.fetcher.get<GetListingsResponse>(
      getBestListingsAPIPath(collectionSlug),
      {
        limit,
        next,
      },
    );
    return response;
  }

  /**
   * Gets all active listings for a specific NFT.
   */
  async getNFTListings(
    assetContractAddress: string,
    tokenId: string,
    limit?: number,
    next?: string,
    chain: Chain = this.chain,
  ): Promise<GetListingsResponse> {
    const response = await this.fetcher.get<GetListingsResponse>(
      getOrdersAPIPath(chain, "seaport", OrderSide.LISTING),
      serializeOrdersQueryOptions({
        assetContractAddress,
        tokenIds: [tokenId],
        limit,
        next,
      }),
    );
    return response;
  }
}
