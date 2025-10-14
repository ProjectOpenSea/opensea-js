import {
  getPostCollectionOfferPath,
  getBuildOfferPath,
  getCollectionOffersPath,
  getBestOfferAPIPath,
  getAllOffersAPIPath,
  getTraitOffersPath,
} from "./apiPaths";
import {
  BuildOfferResponse,
  ListCollectionOffersResponse,
  GetBestOfferResponse,
  GetOffersResponse,
  CollectionOffer,
} from "./types";
import { ProtocolData } from "../orders/types";
import {
  getBuildCollectionOfferPayload,
  getPostCollectionOfferPayload,
} from "../orders/utils";

/**
 * Offer-related API operations
 */
export class OffersAPI {
  constructor(
    private get: <T>(apiPath: string, query?: object) => Promise<T>,
    private post: <T>(apiPath: string, body?: object, opts?: object) => Promise<T>,
  ) {}

  /**
   * Gets all offers for a given collection.
   */
  async getAllOffers(
    collectionSlug: string,
    limit?: number,
    next?: string,
  ): Promise<GetOffersResponse> {
    const response = await this.get<GetOffersResponse>(
      getAllOffersAPIPath(collectionSlug),
      {
        limit,
        next,
      },
    );
    return response;
  }

  /**
   * Gets trait offers for a given collection.
   */
  async getTraitOffers(
    collectionSlug: string,
    type: string,
    value: string,
    limit?: number,
    next?: string,
    floatValue?: number,
    intValue?: number,
  ): Promise<GetOffersResponse> {
    const response = await this.get<GetOffersResponse>(
      getTraitOffersPath(collectionSlug),
      {
        type,
        value,
        limit,
        next,
        float_value: floatValue,
        int_value: intValue,
      },
    );
    return response;
  }

  /**
   * Gets the best offer for a given token.
   */
  async getBestOffer(
    collectionSlug: string,
    tokenId: string | number,
  ): Promise<GetBestOfferResponse> {
    const response = await this.get<GetBestOfferResponse>(
      getBestOfferAPIPath(collectionSlug, tokenId),
    );
    return response;
  }

  /**
   * Build a OpenSea collection offer.
   */
  async buildOffer(
    offererAddress: string,
    quantity: number,
    collectionSlug: string,
    offerProtectionEnabled = true,
    traitType?: string,
    traitValue?: string,
  ): Promise<BuildOfferResponse> {
    if (traitType || traitValue) {
      if (!traitType || !traitValue) {
        throw new Error(
          "Both traitType and traitValue must be defined if one is defined.",
        );
      }
    }
    const payload = getBuildCollectionOfferPayload(
      offererAddress,
      quantity,
      collectionSlug,
      offerProtectionEnabled,
      traitType,
      traitValue,
    );
    const response = await this.post<BuildOfferResponse>(
      getBuildOfferPath(),
      payload,
    );
    return response;
  }

  /**
   * Get a list collection offers for a given slug.
   */
  async getCollectionOffers(
    slug: string,
  ): Promise<ListCollectionOffersResponse | null> {
    return await this.get<ListCollectionOffersResponse>(
      getCollectionOffersPath(slug),
    );
  }

  /**
   * Post a collection offer to OpenSea.
   */
  async postCollectionOffer(
    order: ProtocolData,
    slug: string,
    traitType?: string,
    traitValue?: string,
  ): Promise<CollectionOffer | null> {
    const payload = getPostCollectionOfferPayload(
      slug,
      order,
      traitType,
      traitValue,
    );
    return await this.post<CollectionOffer>(
      getPostCollectionOfferPath(),
      payload,
    );
  }
}
