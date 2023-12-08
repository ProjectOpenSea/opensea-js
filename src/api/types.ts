import { ConsiderationItem } from "@opensea/seaport-js/lib/types";
import {
  OrderType,
  OrderV2,
  ProtocolData,
  QueryCursors,
} from "../orders/types";
import { OpenSeaCollection } from "../types";

/**
 * Response from OpenSea API for building an offer.
 * @category API Response Types
 */
export type BuildOfferResponse = {
  /** A portion of the parameters needed to submit a criteria offer, i.e. collection offer. */
  partialParameters: PartialParameters;
};

type PartialParameters = {
  consideration: ConsiderationItem[];
  zone: string;
  zoneHash: string;
};

type Criteria = {
  collection: CollectionCriteria;
  contract?: ContractCriteria;
  encoded_token_ids?: string;
};

type CollectionCriteria = {
  slug: string;
};

type ContractCriteria = {
  address: string;
};

/**
 * Response from OpenSea API for fetching a single collection.
 * @category API Response Types
 */
export type GetCollectionResponse = {
  /** Collection object. See {@link OpenSeaCollection} */
  collection: OpenSeaCollection;
};

/**
 * Base Order type shared between Listings and Offers.
 * @category API Models
 */
export type Order = {
  /** Offer Identifier */
  order_hash: string;
  /** Chain the offer exists on */
  chain: string;
  /** The protocol data for the order. Only 'seaport' is currently supported. */
  protocol_data: ProtocolData;
  /** The contract address of the protocol. */
  protocol_address: string;
  /** The price of the order. */
  price: Price;
};

/**
 * Offer type.
 * @category API Models
 */
export type Offer = Order;

/**
 * Collection Offer type.
 * @category API Models
 */
export type CollectionOffer = Offer & {
  /** Defines which NFTs meet the criteria to fulfill the offer. */
  criteria: Criteria;
};

/**
 * Price response.
 * @category API Models
 */
export type Price = {
  current: {
    currency: string;
    decimals: number;
    value: string;
  };
};

/**
 * Listing order type.
 * @category API Models
 */
export type Listing = Order & {
  /** The order type of the listing. */
  type: OrderType;
};

/**
 * Response from OpenSea API for fetching a list of collection offers.
 * @category API Response Types
 */
export type ListCollectionOffersResponse = {
  /** List of {@link Offer} */
  offers: CollectionOffer[];
};

/**
 * Response from OpenSea API for fetching a list of NFTs.
 * @category API Response Types
 */
export type ListNFTsResponse = {
  /** List of {@link NFT} */
  nfts: NFT[];
  /** Cursor for next page of results. */
  next: string;
};

/**
 * Response from OpenSea API for fetching a single NFT.
 * @category API Response Types
 */
export type GetNFTResponse = {
  /** See {@link NFT} */
  nft: NFT;
};

/**
 * Response from OpenSea API for fetching Orders.
 * @category API Response Types
 */
export type GetOrdersResponse = QueryCursors & {
  /** List of {@link OrderV2} */
  orders: OrderV2[];
};

/**
 * Base query cursors response from OpenSea API.
 * @category API Response Types
 */
export type QueryCursorsV2 = {
  next?: string;
};

/**
 * Response from OpenSea API for fetching offers.
 * @category API Response Types
 */
export type GetOffersResponse = QueryCursorsV2 & {
  offers: Offer[];
};

/**
 * Response from OpenSea API for fetching listings.
 * @category API Response Types
 */
export type GetListingsResponse = QueryCursorsV2 & {
  listings: Listing[];
};

/**
 * Response from OpenSea API for fetching a best offer.
 * @category API Response Types
 */
export type GetBestOfferResponse = Offer | CollectionOffer;

/**
 * Response from OpenSea API for fetching a best listing.
 * @category API Response Types
 */
export type GetBestListingResponse = Listing;

/**
 * NFT type returned by OpenSea API.
 * @category API Models
 */
export type NFT = {
  /** NFT Identifier (also commonly referred to as Token Id) */
  identifier: string;
  /** Slug identifier of collection */
  collection: string;
  /** Address of contract */
  contract: string;
  /** Token standard, i.e. ERC721, ERC1155, etc. */
  token_standard: string;
  /** Name of NFT */
  name: string;
  /** Description of NFT */
  description: string;
  /** URL of image */
  image_url: string;
  /** URL of metadata */
  metadata_url: string;
  /** Date of NFT creation */
  created_at: string;
  /** Date of latest NFT update */
  updated_at: string;
  /** Whether NFT is disabled for trading on OpenSea */
  is_disabled: boolean;
  /** Whether NFT is NSFW (Not Safe For Work) */
  is_nsfw: boolean;
};
