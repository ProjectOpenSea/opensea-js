import {
  getEventsAPIPath,
  getEventsByAccountAPIPath,
  getEventsByCollectionAPIPath,
  getEventsByNFTAPIPath,
} from "./apiPaths";
import { GetEventsArgs, GetEventsResponse } from "./types";
import { Chain } from "../types";

/**
 * Events-related API operations
 */
export class EventsAPI {
  constructor(
    private get: <T>(apiPath: string, query?: object) => Promise<T>,
  ) {}

  /**
   * Gets a list of events based on query parameters.
   */
  async getEvents(args?: GetEventsArgs): Promise<GetEventsResponse> {
    const response = await this.get<GetEventsResponse>(
      getEventsAPIPath(),
      args,
    );
    return response;
  }

  /**
   * Gets a list of events for a specific account.
   */
  async getEventsByAccount(
    address: string,
    args?: GetEventsArgs,
  ): Promise<GetEventsResponse> {
    const response = await this.get<GetEventsResponse>(
      getEventsByAccountAPIPath(address),
      args,
    );
    return response;
  }

  /**
   * Gets a list of events for a specific collection.
   */
  async getEventsByCollection(
    collectionSlug: string,
    args?: GetEventsArgs,
  ): Promise<GetEventsResponse> {
    const response = await this.get<GetEventsResponse>(
      getEventsByCollectionAPIPath(collectionSlug),
      args,
    );
    return response;
  }

  /**
   * Gets a list of events for a specific NFT.
   */
  async getEventsByNFT(
    chain: Chain,
    address: string,
    identifier: string,
    args?: GetEventsArgs,
  ): Promise<GetEventsResponse> {
    const response = await this.get<GetEventsResponse>(
      getEventsByNFTAPIPath(chain, address, identifier),
      args,
    );
    return response;
  }
}
