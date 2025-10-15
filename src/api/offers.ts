import {
  getPostCollectionOfferPath,
  getBuildOfferPath,
  getCollectionOffersPath,
  getBestOfferAPIPath,
  getAllOffersAPIPath,
  getTraitOffersPath,
  getOrdersAPIPath,
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
  serializeOrdersQueryOptions,
} from "../orders/utils";
import { Chain, OrderSide } from "../types";
import { Fetcher } from "./fetcher";

/**
 * Offer-related API operations
 */
export class OffersAPI {
  constructor(
    private fetcher: Fetcher,
    private chain: Chain,
  ) {}

  /**
   * Gets all offers for a given collection.
   */
  async getAllOffers(
    collectionSlug: string,
    limit?: number,
    next?: string,
  ): Promise<GetOffersResponse> {
    const response = await this.fetcher.get<GetOffersResponse>(
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
    const response = await this.fetcher.get<GetOffersResponse>(
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
    const response = await this.fetcher.get<GetBestOfferResponse>(
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
    const response = await this.fetcher.post<BuildOfferResponse>(
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
    return await this.fetcher.get<ListCollectionOffersResponse>(
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
    return await this.fetcher.post<CollectionOffer>(
      getPostCollectionOfferPath(),
      payload,
    );
  }

  /**
   * Gets all active offers for a specific NFT.
   */
  async getNFTOffers(
    assetContractAddress: string,
    tokenId: string,
    limit?: number,
    next?: string,
    chain: Chain = this.chain,
  ): Promise<GetOffersResponse> {
    const response = await this.fetcher.get<GetOffersResponse>(
      getOrdersAPIPath(chain, "seaport", OrderSide.OFFER),
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
