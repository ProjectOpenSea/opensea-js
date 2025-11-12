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

/**
 * Criteria for collection or trait offers.
 * @category API Response Types
 */
type Criteria = {
  /** The collection for the criteria */
  collection: CollectionCriteria;
  /** The contract for the criteria */
  contract: ContractCriteria;
  /** Represents a list of token ids which can be used to fulfill the criteria offer. */
  encoded_token_ids?: string;
  /** The trait for the criteria (single trait) */
  trait?: TraitCriteria;
  /** Multiple traits for the criteria (multi-trait offers) */
  traits?: TraitCriteria[];
};

/**
 * Criteria for trait offers.
 * @category API Response Types
 */
type TraitCriteria = {
  type: string;
  value: string;
};

type CollectionCriteria = {
  slug: string;
};

type ContractCriteria = {
  address: string;
};

/**
 * Query args for Get Collections
 * @category API Query Args
 */
export interface GetCollectionsArgs {
  order_by?: string;
  limit?: number;
  next?: string;
  chain?: string;
  creator_username?: string;
  include_hidden?: boolean;
}

/**
 * Response from OpenSea API for fetching a single collection.
 * @category API Response Types
 */
export type GetCollectionResponse = {
  /** Collection object. See {@link OpenSeaCollection} */
  collection: OpenSeaCollection;
};

/**
 * Response from OpenSea API for fetching a list of collections.
 * @category API Response Types
 */
export type GetCollectionsResponse = QueryCursorsV2 & {
  /** List of collections. See {@link OpenSeaCollection} */
  collections: OpenSeaCollection[];
};

export enum CollectionOrderByOption {
  CREATED_DATE = "created_date",
  ONE_DAY_CHANGE = "one_day_change",
  SEVEN_DAY_VOLUME = "seven_day_volume",
  SEVEN_DAY_CHANGE = "seven_day_change",
  NUM_OWNERS = "num_owners",
  MARKET_CAP = "market_cap",
}

/**
 * Order status enum.
 * @category API Models
 */
export enum OrderStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  FULFILLED = "fulfilled",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}

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
export type Offer = Order & {
  /** The criteria for the offer if it is a collection or trait offer. */
  criteria?: Criteria;
  /** The status of the offer. */
  status: OrderStatus;
};

/**
 * Collection Offer type.
 * @category API Models
 */
export type CollectionOffer = Required<Pick<Offer, "criteria">> & Offer;

/**
 * Price response.
 * @category API Models
 */
export type Price = {
  currency: string;
  decimals: number;
  value: string;
};

/**
 * Listing order type.
 * @category API Models
 */
export type Listing = Omit<Order, "price"> & {
  /** The order type of the listing. */
  type: OrderType;
  /** The price of the listing with current price nested. */
  price: {
    current: Price;
  };
  /** The remaining quantity available for the listing. This is important for partially filled orders. */
  remaining_quantity: number;
  /** The status of the listing. */
  status: OrderStatus;
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
 * Response from OpenSea API for offchain canceling an order.
 * @category API Response Types
 */
export type CancelOrderResponse = {
  last_signature_issued_valid_until: string | null;
};

/**
 * NFT type returned by OpenSea API.
 * @category API Models
 */
export type NFT = {
  /** NFT Identifier (also commonly referred to as tokenId) */
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
  /** URL on OpenSea */
  opensea_url: string;
  /** Date of latest NFT update */
  updated_at: string;
  /** Whether NFT is disabled for trading on OpenSea */
  is_disabled: boolean;
  /** Whether NFT is NSFW (Not Safe For Work) */
  is_nsfw: boolean;
  /** Traits for the NFT, returns null if the NFT has than 50 traits */
  traits: Trait[] | null;
  /** Creator of the NFT */
  creator: string;
  /** Owners of the NFT */
  owners: {
    address: string;
    quantity: number;
  }[];
  /** Rarity of the NFT */
  rarity: null | {
    strategy_id: string | null;
    strategy_version: string | null;
    rank: number | null;
    score: number | null;
    calculated_at: string;
    max_rank: number | null;
    tokens_scored: number | null;
    ranking_features: null | {
      unique_attribute_count: number;
    };
  };
};

/**
 * Trait type returned by OpenSea API.
 * @category API Models
 */
export type Trait = {
  /** The name of the trait category (e.g. 'Background') */
  trait_type: string;
  /** A field indicating how to display. None is used for string traits. */
  display_type: TraitDisplayType;
  /** Ceiling for possible numeric trait values */
  max_value: string;
  /** The value of the trait (e.g. 'Red') */
  value: string | number | Date;
};

/**
 * Trait display type returned by OpenSea API.
 * @category API Models
 */
export enum TraitDisplayType {
  NUMBER = "number",
  BOOST_PERCENTAGE = "boost_percentage",
  BOOST_NUMBER = "boost_number",
  AUTHOR = "author",
  DATE = "date",
  /** "None" is used for string traits */
  NONE = "None",
}

/**
 * Asset event type returned by OpenSea API.
 * @category API Models
 */
export enum AssetEventType {
  SALE = "sale",
  TRANSFER = "transfer",
  MINT = "mint",
  LISTING = "listing",
  OFFER = "offer",
  TRAIT_OFFER = "trait_offer",
  COLLECTION_OFFER = "collection_offer",
}

/**
 * Order type for order events.
 * @category API Models
 */
export enum OrderEventType {
  LISTING = "listing",
  ITEM_OFFER = "item_offer",
  COLLECTION_OFFER = "collection_offer",
  TRAIT_OFFER = "trait_offer",
}

/**
 * Payment information for an event.
 * @category API Models
 */
export type EventPayment = {
  /** Quantity of the payment token */
  quantity: string;
  /** Address of the payment token (0x0...0 for ETH) */
  token_address: string;
  /** Decimals of the payment token */
  decimals: number;
  /** Symbol of the payment token */
  symbol: string;
};

/**
 * Asset information in an event.
 * @category API Models
 */
export type EventAsset = {
  identifier: string;
  collection: string;
  contract: string;
  token_standard: string;
  name: string;
  description: string;
  image_url: string;
  display_image_url: string;
  display_animation_url: string | null;
  metadata_url: string;
  opensea_url: string;
  updated_at: string;
  is_disabled: boolean;
  is_nsfw: boolean;
};

/**
 * Base event type.
 * @category API Models
 */
type BaseEvent = {
  /** Type of the event */
  event_type: AssetEventType | string;
  /** Timestamp of the event */
  event_timestamp: number;
  /** Chain the event occurred on */
  chain: string;
  /** Quantity involved in the event */
  quantity: number;
};

/**
 * Listing event type.
 * @category API Models
 */
export type ListingEvent = BaseEvent & {
  event_type: AssetEventType.LISTING | "listing";
  /** Payment information */
  payment: EventPayment;
  /** Start date of the listing */
  start_date: number | null;
  /** Expiration date of the listing */
  expiration_date: number;
  /** Asset involved in the listing */
  asset: EventAsset;
  /** Maker of the listing */
  maker: string;
  /** Taker of the listing */
  taker: string;
  /** Whether the listing is private */
  is_private_listing: boolean;
  /** Order hash (optional) */
  order_hash?: string;
  /** Protocol address (optional) */
  protocol_address?: string;
};

/**
 * Offer event type.
 * @category API Models
 */
export type OfferEvent = BaseEvent & {
  event_type: AssetEventType.OFFER | "offer";
  /** Payment information */
  payment: EventPayment;
  /** Start date of the offer */
  start_date: number | null;
  /** Expiration date of the offer */
  expiration_date: number;
  /** Asset involved in the offer */
  asset: EventAsset;
  /** Maker of the offer */
  maker: string;
  /** Taker of the offer */
  taker: string;
  /** Order hash (optional) */
  order_hash?: string;
  /** Protocol address (optional) */
  protocol_address?: string;
};

/**
 * Trait offer event type.
 * @category API Models
 */
export type TraitOfferEvent = BaseEvent & {
  event_type: AssetEventType.TRAIT_OFFER | "trait_offer";
  /** Payment information */
  payment: EventPayment;
  /** Start date of the offer */
  start_date: number | null;
  /** Expiration date of the offer */
  expiration_date: number;
  /** Criteria for trait offers */
  criteria: Record<string, unknown>;
  /** Maker of the offer */
  maker: string;
  /** Taker of the offer */
  taker: string;
  /** Order hash (optional) */
  order_hash?: string;
  /** Protocol address (optional) */
  protocol_address?: string;
};

/**
 * Collection offer event type.
 * @category API Models
 */
export type CollectionOfferEvent = BaseEvent & {
  event_type: AssetEventType.COLLECTION_OFFER | "collection_offer";
  /** Payment information */
  payment: EventPayment;
  /** Start date of the offer */
  start_date: number | null;
  /** Expiration date of the offer */
  expiration_date: number;
  /** Criteria for collection offers */
  criteria: Record<string, unknown>;
  /** Maker of the offer */
  maker: string;
  /** Taker of the offer */
  taker: string;
  /** Order hash (optional) */
  order_hash?: string;
  /** Protocol address (optional) */
  protocol_address?: string;
};

/**
 * Mint event type.
 * @category API Models
 */
export type MintEvent = BaseEvent & {
  event_type: AssetEventType.MINT | "mint";
  /** Transaction hash */
  transaction: string;
  /** Address the NFT was minted to */
  to_address: string;
  /** NFT that was minted */
  nft: EventAsset;
};

/**
 * Sale event type.
 * @category API Models
 */
export type SaleEvent = BaseEvent & {
  event_type: AssetEventType.SALE | "sale";
  /** Transaction hash */
  transaction: string;
  /** Order hash */
  order_hash: string;
  /** Protocol address */
  protocol_address: string;
  /** Payment information */
  payment: EventPayment;
  /** Closing date of the sale */
  closing_date: number;
  /** Seller address */
  seller: string;
  /** Buyer address */
  buyer: string;
  /** NFT involved in the sale */
  nft: EventAsset;
};

/**
 * Transfer event type.
 * @category API Models
 */
export type TransferEvent = BaseEvent & {
  event_type: AssetEventType.TRANSFER | "transfer";
  /** Transaction hash */
  transaction: string;
  /** Address the NFT was transferred from */
  from_address: string;
  /** Address the NFT was transferred to */
  to_address: string;
  /** NFT involved in the transfer */
  nft: EventAsset;
};

/**
 * Generic event type that can be any event type.
 * @category API Models
 */
export type AssetEvent =
  | ListingEvent
  | OfferEvent
  | TraitOfferEvent
  | CollectionOfferEvent
  | SaleEvent
  | TransferEvent
  | MintEvent;

/**
 * Query args for Get Events endpoints.
 * @category API Query Args
 */
export interface GetEventsArgs {
  /** Type of event to filter by */
  event_type?: AssetEventType | string;
  /** Filter events after this timestamp */
  after?: number;
  /** Filter events before this timestamp */
  before?: number;
  /** Limit the number of results */
  limit?: number;
  /** Cursor for pagination */
  next?: string;
  /** Chain to filter by */
  chain?: string;
}

/**
 * Response from OpenSea API for fetching events.
 * @category API Response Types
 */
export type GetEventsResponse = QueryCursorsV2 & {
  /** List of {@link AssetEvent} */
  asset_events: AssetEvent[];
};

/**
 * Contract information returned by OpenSea API.
 * @category API Models
 */
export type Contract = {
  /** Contract address */
  address: string;
  /** Chain the contract is deployed on */
  chain: string;
  /** Associated collection slug (if any) */
  collection: string | null;
  /** Contract name */
  name: string;
  /** Contract standard (e.g., erc721, erc1155) */
  contract_standard: string;
};

/**
 * Response from OpenSea API for fetching a contract.
 * @category API Response Types
 */
export type GetContractResponse = Contract;

/**
 * Trait counts for a specific trait type.
 * @category API Models
 */
export type TraitCounts = {
  [traitValue: string]: number;
};

/**
 * Trait categories in a collection.
 * @category API Models
 */
export type TraitCategories = {
  [traitType: string]: "string" | "number" | "date";
};

/**
 * Response from OpenSea API for fetching collection traits.
 * @category API Response Types
 */
export type GetTraitsResponse = {
  /** Trait categories with their data types */
  categories: TraitCategories;
  /** Trait counts for each category */
  counts: {
    [traitType: string]: TraitCounts;
  };
};
