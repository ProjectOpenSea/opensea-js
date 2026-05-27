import type { ProtocolData } from "../orders/types"
import {
  getBuildCollectionOfferPayload,
  getPostCollectionOfferPayload,
} from "../orders/utils"
import type { Chain } from "../types"
import {
  getAllOffersAPIPath,
  getBestOfferAPIPath,
  getBuildOfferPath,
  getCollectionOffersPath,
  getOffersByNFTPath,
  getPostCollectionOfferPath,
  getTraitOffersPath,
} from "./apiPaths"
import type { Fetcher } from "./fetcher"
import type {
  BuildOfferResponse,
  CollectionOffer,
  GetBestOfferResponse,
  GetOffersResponse,
} from "./types"

/**
 * Validates trait parameters for collection offers.
 * Used by both buildOffer and postCollectionOffer.
 */
function validateTraitParams(
  traitType?: string,
  traitValue?: string,
  traits?: Array<{ type: string; value: string }>,
  numericTraits?: Array<{ type: string; min?: number; max?: number }>,
) {
  if (traits && traits.length > 0 && (traitType || traitValue)) {
    throw new Error(
      "Cannot use both 'traits' array and individual 'traitType'/'traitValue' parameters. Please use only one approach.",
    )
  }
  if (traitType || traitValue) {
    if (!traitType || !traitValue) {
      throw new Error(
        "Both traitType and traitValue must be defined if one is defined.",
      )
    }
  }
  if (traits && traits.length > 0) {
    for (const trait of traits) {
      if (!trait.type || !trait.value) {
        throw new Error(
          "Each trait must have both 'type' and 'value' properties.",
        )
      }
    }
  }
  if (numericTraits && numericTraits.length > 0) {
    for (const trait of numericTraits) {
      if (!trait.type) {
        throw new Error("Each numeric trait must have a 'type' property.")
      }
      if (trait.min === undefined && trait.max === undefined) {
        throw new Error(
          `Numeric trait '${trait.type}' must have at least one of 'min' or 'max'.`,
        )
      }
      if (
        trait.min !== undefined &&
        trait.max !== undefined &&
        trait.min > trait.max
      ) {
        throw new Error(
          `Numeric trait '${trait.type}': 'min' (${trait.min}) must be <= 'max' (${trait.max}).`,
        )
      }
    }
  }
}

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
    )
    return response
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
    return this.fetcher.get<GetOffersResponse>(
      getTraitOffersPath(collectionSlug),
      { type, value, limit, next, floatValue, intValue },
    )
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
    )
    return response
  }

  /**
   * Build a OpenSea collection offer.
   *
   * The body uses mixed casing per the OpenSea OpenAPI spec: the outer
   * envelope (`protocol_address`, `offer_protection_enabled`) is snake_case,
   * but `criteria.numericTraits` keeps its camelCase key on the wire per
   * the {@link CriteriaObject} schema. Opt out of automatic snakeize and
   * emit the body in exact wire shape.
   */
  async buildOffer(
    offererAddress: string,
    quantity: number,
    collectionSlug: string,
    offerProtectionEnabled = true,
    traitType?: string,
    traitValue?: string,
    traits?: Array<{ type: string; value: string }>,
    numericTraits?: Array<{ type: string; min?: number; max?: number }>,
  ): Promise<BuildOfferResponse> {
    validateTraitParams(traitType, traitValue, traits, numericTraits)
    const payload = getBuildCollectionOfferPayload(
      offererAddress,
      quantity,
      collectionSlug,
      offerProtectionEnabled,
      this.chain,
      traitType,
      traitValue,
      traits,
      numericTraits,
    )
    const response = await this.fetcher.post<BuildOfferResponse>(
      getBuildOfferPath(),
      payload,
      undefined,
      { snakeizeBody: false },
    )
    return response
  }

  /**
   * Get a list of collection offers for a given slug.
   */
  async getCollectionOffers(
    slug: string,
    limit?: number,
    next?: string,
  ): Promise<GetOffersResponse> {
    return await this.fetcher.get<GetOffersResponse>(
      getCollectionOffersPath(slug),
      {
        limit,
        next,
      },
    )
  }

  /**
   * Post a collection offer to OpenSea.
   *
   * Mixed-casing body: outer `protocol_address`, `protocol_data` are
   * snake_case, but `protocol_data.parameters` (Seaport struct) and
   * `criteria.numericTraits` keep their camelCase keys on the wire. Opt out
   * of automatic snakeize and emit the body in exact wire shape.
   */
  async postCollectionOffer(
    order: ProtocolData,
    slug: string,
    traitType?: string,
    traitValue?: string,
    traits?: Array<{ type: string; value: string }>,
    numericTraits?: Array<{ type: string; min?: number; max?: number }>,
  ): Promise<CollectionOffer | null> {
    validateTraitParams(traitType, traitValue, traits, numericTraits)
    const payload = getPostCollectionOfferPayload(
      slug,
      order,
      this.chain,
      traitType,
      traitValue,
      traits,
      numericTraits,
    )
    return await this.fetcher.post<CollectionOffer>(
      getPostCollectionOfferPath(),
      payload,
      undefined,
      { snakeizeBody: false },
    )
  }

  /**
   * Gets all active offers for a specific NFT.
   */
  async getOffersByNFT(
    collectionSlug: string,
    identifier: string | number,
    limit?: number,
    next?: string,
  ): Promise<GetOffersResponse> {
    return this.fetcher.get<GetOffersResponse>(
      getOffersByNFTPath(collectionSlug, identifier),
      { limit, next },
    )
  }
}
