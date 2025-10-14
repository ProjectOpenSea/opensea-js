import {
  getCollectionPath,
  getCollectionsPath,
  getCollectionStatsPath,
} from "./apiPaths";
import {
  GetCollectionResponse,
  GetCollectionsResponse,
  CollectionOrderByOption,
  GetCollectionsArgs,
} from "./types";
import {
  Chain,
  OpenSeaCollection,
  OpenSeaCollectionStats,
} from "../types";
import { collectionFromJSON } from "../utils/converters";

/**
 * Collection-related API operations
 */
export class CollectionsAPI {
  constructor(
    private get: <T>(apiPath: string, query?: object) => Promise<T>,
  ) {}

  /**
   * Fetch an OpenSea collection.
   */
  async getCollection(slug: string): Promise<OpenSeaCollection> {
    const path = getCollectionPath(slug);
    const response = await this.get<GetCollectionResponse>(path);
    return collectionFromJSON(response);
  }

  /**
   * Fetch a list of OpenSea collections.
   */
  async getCollections(
    orderBy: CollectionOrderByOption = CollectionOrderByOption.CREATED_DATE,
    chain?: Chain,
    creatorUsername?: string,
    includeHidden: boolean = false,
    limit?: number,
    next?: string,
  ): Promise<GetCollectionsResponse> {
    const path = getCollectionsPath();
    const args: GetCollectionsArgs = {
      order_by: orderBy,
      chain,
      creator_username: creatorUsername,
      include_hidden: includeHidden,
      limit,
      next,
    };
    const response = await this.get<GetCollectionsResponse>(path, args);
    response.collections = response.collections.map((collection) =>
      collectionFromJSON(collection),
    );
    return response;
  }

  /**
   * Fetch stats for an OpenSea collection.
   */
  async getCollectionStats(
    slug: string,
  ): Promise<OpenSeaCollectionStats> {
    const path = getCollectionStatsPath(slug);
    const response = await this.get<OpenSeaCollectionStats>(path);
    return response as OpenSeaCollectionStats;
  }
}
