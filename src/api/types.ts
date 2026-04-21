import type {
  AssetMetadataResponse,
  InstantApiKeyResponse,
  TokenGroupPaginatedResponse,
  TokenGroupResponse,
} from "@opensea/api-types"
import type { ConsiderationItem } from "@opensea/seaport-js/lib/types"
import type {
  OrderType,
  OrderV2,
  ProtocolData,
  QueryCursors,
} from "../orders/types"
import type { OpenSeaCollection } from "../types"

/**
 * Response from OpenSea API for building an offer.
 * @category API Response Types
 */
export type BuildOfferResponse = {
  /** A portion of the parameters needed to submit a criteria offer, i.e. collection offer. */
  partialParameters: PartialParameters
  /** Criteria echoed back from the build request. Includes collection and trait info. */
  criteria: BuildOfferCriteria
}

/**
 * Criteria returned by the build offer endpoint.
 * Subset of {@link Criteria} — only collection and trait fields.
 * @category API Response Types
 */
export type BuildOfferCriteria = {
  collection: CollectionCriteria
  traits?: TraitCriteria[]
  numericTraits?: NumericTraitCriteria[]
}

type PartialParameters = {
  consideration: ConsiderationItem[]
  zone: string
  zoneHash: string
}

/**
 * Criteria for collection or trait offers.
 * @category API Response Types
 */
type Criteria = {
  /** The collection for the criteria */
  collection: CollectionCriteria
  /** The contract for the criteria */
  contract: ContractCriteria
  /** Represents a list of token ids which can be used to fulfill the criteria offer. */
  encoded_token_ids?: string
  /** The trait for the criteria (single trait) */
  trait?: TraitCriteria
  /** Multiple traits for the criteria (multi-trait offers) */
  traits?: TraitCriteria[]
  /** Numeric traits for the criteria (numeric trait offers) */
  numericTraits?: NumericTraitCriteria[]
}

/**
 * Criteria for trait offers.
 * @category API Response Types
 */
type TraitCriteria = {
  type: string
  value: string
}

/**
 * Criteria for numeric trait offers.
 * At least one of min or max must be defined.
 * @category API Response Types
 */
type NumericTraitCriteria = {
  type: string
  min?: number
  max?: number
}

type CollectionCriteria = {
  slug: string
}

type ContractCriteria = {
  address: string
}

/**
 * Query args for Get Collections
 * @category API Query Args
 */
export interface GetCollectionsArgs {
  order_by?: string
  limit?: number
  next?: string
  chain?: string
  creator_username?: string
  include_hidden?: boolean
}

/**
 * Response from OpenSea API for fetching a single collection.
 * @category API Response Types
 */
export type GetCollectionResponse = {
  /** Collection object. See {@link OpenSeaCollection} */
  collection: OpenSeaCollection
}

/**
 * Response from OpenSea API for fetching a list of collections.
 * @category API Response Types
 */
export type GetCollectionsResponse = QueryCursorsV2 & {
  /** List of collections. See {@link OpenSeaCollection} */
  collections: OpenSeaCollection[]
}

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
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  FULFILLED = "FULFILLED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

/**
 * Base Order type shared between Listings and Offers.
 * @category API Models
 */
export type Order = {
  /** Offer Identifier */
  order_hash: string
  /** Chain the offer exists on */
  chain: string
  /** The protocol data for the order. Only 'seaport' is currently supported. */
  protocol_data: ProtocolData
  /** The contract address of the protocol. */
  protocol_address: string
  /** The price of the order. */
  price: Price
}

/**
 * Offer type.
 * @category API Models
 */
export type Offer = Order & {
  /** The criteria for the offer if it is a collection or trait offer. */
  criteria?: Criteria
  /** The status of the offer. */
  status: OrderStatus
}

/**
 * Collection Offer type.
 * @category API Models
 */
export type CollectionOffer = Required<Pick<Offer, "criteria">> & Offer

/**
 * Price response.
 * @category API Models
 */
export type Price = {
  currency: string
  decimals: number
  value: string
}

/**
 * Listing order type.
 * @category API Models
 */
export type Listing = Omit<Order, "price"> & {
  /** The order type of the listing. */
  type: OrderType
  /** The price of the listing with current price nested. */
  price: {
    current: Price
  }
  /** The remaining quantity available for the listing. This is important for partially filled orders. */
  remaining_quantity: number
  /** The status of the listing. */
  status: OrderStatus
}

/**
 * Response from OpenSea API for fetching a list of collection offers.
 * @category API Response Types
 */
export type ListCollectionOffersResponse = {
  /** List of {@link Offer} */
  offers: CollectionOffer[]
}

/**
 * Response from OpenSea API for fetching a list of NFTs.
 * @category API Response Types
 */
export type ListNFTsResponse = {
  /** List of {@link NFT} */
  nfts: NFT[]
  /** Cursor for next page of results. */
  next: string
}

/**
 * Response from OpenSea API for fetching a single NFT.
 * @category API Response Types
 */
export type GetNFTResponse = {
  /** See {@link NFT} */
  nft: NFT
}

/**
 * Response from OpenSea API for fetching Orders.
 * @category API Response Types
 */
export type GetOrdersResponse = QueryCursors & {
  /** List of {@link OrderV2} */
  orders: OrderV2[]
}

/**
 * Base query cursors response from OpenSea API.
 * @category API Response Types
 */
export type QueryCursorsV2 = {
  next?: string
}

/**
 * Response from OpenSea API for fetching offers.
 * @category API Response Types
 */
export type GetOffersResponse = QueryCursorsV2 & {
  offers: Offer[]
}

/**
 * Response from OpenSea API for fetching listings.
 * @category API Response Types
 */
export type GetListingsResponse = QueryCursorsV2 & {
  listings: Listing[]
}

/**
 * Response from OpenSea API for fetching a best offer.
 * @category API Response Types
 */
export type GetBestOfferResponse = Offer | CollectionOffer

/**
 * Response from OpenSea API for fetching a best listing.
 * @category API Response Types
 */
export type GetBestListingResponse = Listing

/**
 * Response from OpenSea API for fetching an order by hash.
 * Can be either an Offer or a Listing.
 * @category API Response Types
 */
export type GetOrderByHashResponse = Offer | Listing

/**
 * Response from OpenSea API for offchain canceling an order.
 * @category API Response Types
 */
export type CancelOrderResponse = {
  last_signature_issued_valid_until: string | null
}

/**
 * NFT type returned by OpenSea API.
 * @category API Models
 */
export type NFT = {
  /** NFT Identifier (also commonly referred to as tokenId) */
  identifier: string
  /** Slug identifier of collection */
  collection: string
  /** Address of contract */
  contract: string
  /** Token standard, i.e. ERC721, ERC1155, etc. */
  token_standard: string
  /** Name of NFT */
  name: string
  /** Description of NFT */
  description: string
  /** URL of image */
  image_url: string
  /** URL of metadata */
  metadata_url: string
  /** URL on OpenSea */
  opensea_url: string
  /** Date of latest NFT update */
  updated_at: string
  /** Whether NFT is disabled for trading on OpenSea */
  is_disabled: boolean
  /** Whether NFT is NSFW (Not Safe For Work) */
  is_nsfw: boolean
  /** Traits for the NFT, returns null if the NFT has than 50 traits */
  traits: Trait[] | null
  /** Creator of the NFT */
  creator: string
  /** Owners of the NFT */
  owners: {
    address: string
    quantity: number
  }[]
  /** Rarity of the NFT */
  rarity: null | {
    strategy_id: string | null
    strategy_version: string | null
    rank: number | null
    score: number | null
    calculated_at: string
    max_rank: number | null
    tokens_scored: number | null
    ranking_features: null | {
      unique_attribute_count: number
    }
  }
}

/**
 * Trait type returned by OpenSea API.
 * @category API Models
 */
export type Trait = {
  /** The name of the trait category (e.g. 'Background') */
  trait_type: string
  /** A field indicating how to display. None is used for string traits. */
  display_type: TraitDisplayType
  /** Ceiling for possible numeric trait values */
  max_value: string
  /** The value of the trait (e.g. 'Red') */
  value: string | number | Date
}

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
  ORDER = "order",
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
  quantity: string
  /** Address of the payment token (0x0...0 for ETH) */
  token_address: string
  /** Decimals of the payment token */
  decimals: number
  /** Symbol of the payment token */
  symbol: string
}

/**
 * Asset information in an event.
 * @category API Models
 */
export type EventAsset = {
  identifier: string
  collection: string
  contract: string
  token_standard: string
  name: string
  description: string
  image_url: string
  display_image_url: string
  display_animation_url: string | null
  metadata_url: string
  opensea_url: string
  updated_at: string
  is_disabled: boolean
  is_nsfw: boolean
}

/**
 * Base event type.
 * @category API Models
 */
type BaseEvent = {
  /** Type of the event */
  event_type: AssetEventType | string
  /** Timestamp of the event */
  event_timestamp: number
  /** Chain the event occurred on */
  chain: string
  /** Quantity involved in the event */
  quantity: number
}

/**
 * Listing event type.
 * @category API Models
 */
export type ListingEvent = BaseEvent & {
  event_type: AssetEventType.LISTING | "listing"
  /** Payment information */
  payment: EventPayment
  /** Start date of the listing */
  start_date: number | null
  /** Expiration date of the listing */
  expiration_date: number
  /** Asset involved in the listing */
  asset: EventAsset
  /** Maker of the listing */
  maker: string
  /** Taker of the listing */
  taker: string
  /** Whether the listing is private */
  is_private_listing: boolean
  /** Order hash (optional) */
  order_hash?: string
  /** Protocol address (optional) */
  protocol_address?: string
}

/**
 * Offer event type.
 * @category API Models
 */
export type OfferEvent = BaseEvent & {
  event_type: AssetEventType.OFFER | "offer"
  /** Payment information */
  payment: EventPayment
  /** Start date of the offer */
  start_date: number | null
  /** Expiration date of the offer */
  expiration_date: number
  /** Asset involved in the offer */
  asset: EventAsset
  /** Maker of the offer */
  maker: string
  /** Taker of the offer */
  taker: string
  /** Order hash (optional) */
  order_hash?: string
  /** Protocol address (optional) */
  protocol_address?: string
}

/**
 * Trait offer event type.
 * @category API Models
 */
export type TraitOfferEvent = BaseEvent & {
  event_type: AssetEventType.TRAIT_OFFER | "trait_offer"
  /** Payment information */
  payment: EventPayment
  /** Start date of the offer */
  start_date: number | null
  /** Expiration date of the offer */
  expiration_date: number
  /** Criteria for trait offers */
  criteria: Record<string, unknown>
  /** Maker of the offer */
  maker: string
  /** Taker of the offer */
  taker: string
  /** Order hash (optional) */
  order_hash?: string
  /** Protocol address (optional) */
  protocol_address?: string
}

/**
 * Collection offer event type.
 * @category API Models
 */
export type CollectionOfferEvent = BaseEvent & {
  event_type: AssetEventType.COLLECTION_OFFER | "collection_offer"
  /** Payment information */
  payment: EventPayment
  /** Start date of the offer */
  start_date: number | null
  /** Expiration date of the offer */
  expiration_date: number
  /** Criteria for collection offers */
  criteria: Record<string, unknown>
  /** Maker of the offer */
  maker: string
  /** Taker of the offer */
  taker: string
  /** Order hash (optional) */
  order_hash?: string
  /** Protocol address (optional) */
  protocol_address?: string
}

/**
 * Order event type returned by the API for order-related activities
 * (listings, offers, trait offers, collection offers).
 * @category API Models
 */
export type OrderEvent = BaseEvent & {
  event_type: AssetEventType.ORDER | "order"
  /** Payment information */
  payment: EventPayment
  /** Start date of the order */
  start_date: number | null
  /** Expiration date of the order */
  expiration_date: number
  /** Asset involved in the order (optional, not present for collection/trait offers) */
  asset?: EventAsset
  /** Criteria for collection/trait offers (optional) */
  criteria?: Record<string, unknown>
  /** Maker of the order */
  maker: string
  /** Taker of the order */
  taker: string
  /** Order hash (optional) */
  order_hash?: string
  /** Protocol address (optional) */
  protocol_address?: string
  /** Order type providing more detail */
  order_type?: OrderEventType
}

/**
 * Mint event type.
 * @category API Models
 */
export type MintEvent = BaseEvent & {
  event_type: AssetEventType.MINT | "mint"
  /** Transaction hash */
  transaction: string
  /** Address the NFT was minted to */
  to_address: string
  /** NFT that was minted */
  nft: EventAsset
}

/**
 * Sale event type.
 * @category API Models
 */
export type SaleEvent = BaseEvent & {
  event_type: AssetEventType.SALE | "sale"
  /** Transaction hash */
  transaction: string
  /** Order hash */
  order_hash: string
  /** Protocol address */
  protocol_address: string
  /** Payment information */
  payment: EventPayment
  /** Closing date of the sale */
  closing_date: number
  /** Seller address */
  seller: string
  /** Buyer address */
  buyer: string
  /** NFT involved in the sale */
  nft: EventAsset
}

/**
 * Transfer event type.
 * @category API Models
 */
export type TransferEvent = BaseEvent & {
  event_type: AssetEventType.TRANSFER | "transfer"
  /** Transaction hash */
  transaction: string
  /** Address the NFT was transferred from */
  from_address: string
  /** Address the NFT was transferred to */
  to_address: string
  /** NFT involved in the transfer */
  nft: EventAsset
}

/**
 * Generic event type that can be any event type.
 * @category API Models
 */
export type AssetEvent =
  | ListingEvent
  | OfferEvent
  | TraitOfferEvent
  | CollectionOfferEvent
  | OrderEvent
  | SaleEvent
  | TransferEvent
  | MintEvent

/**
 * Query args for Get Events endpoints.
 * @category API Query Args
 */
export interface GetEventsArgs {
  /** Type of event to filter by */
  event_type?: AssetEventType | string
  /** Filter events after this timestamp */
  after?: number
  /** Filter events before this timestamp */
  before?: number
  /** Limit the number of results */
  limit?: number
  /** Cursor for pagination */
  next?: string
  /** Chain to filter by */
  chain?: string
}

/**
 * Response from OpenSea API for fetching events.
 * @category API Response Types
 */
export type GetEventsResponse = QueryCursorsV2 & {
  /** List of {@link AssetEvent} */
  asset_events: AssetEvent[]
}

/**
 * Contract information returned by OpenSea API.
 * @category API Models
 */
export type Contract = {
  /** Contract address */
  address: string
  /** Chain the contract is deployed on */
  chain: string
  /** Associated collection slug (if any) */
  collection: string | null
  /** Contract name */
  name: string
  /** Contract standard (e.g., erc721, erc1155) */
  contract_standard: string
}

/**
 * Response from OpenSea API for fetching a contract.
 * @category API Response Types
 */
export type GetContractResponse = Contract

/**
 * Trait counts for a specific trait type.
 * @category API Models
 */
export type TraitCounts = {
  [traitValue: string]: number
}

/**
 * Trait categories in a collection.
 * @category API Models
 */
export type TraitCategories = {
  [traitType: string]: "string" | "number" | "date"
}

/**
 * Response from OpenSea API for fetching collection traits.
 * @category API Response Types
 */
export type GetTraitsResponse = {
  /** Trait categories with their data types */
  categories: TraitCategories
  /** Trait counts for each category */
  counts: {
    [traitType: string]: TraitCounts
  }
}

/**
 * Token model returned by OpenSea API.
 * @category API Models
 */
export type Token = {
  /** Token contract address */
  address: string
  /** Chain the token is on */
  chain: string
  /** Token name */
  name: string
  /** Token symbol */
  symbol: string
  /** Number of decimals */
  decimals: number
  /** URL of the token image */
  image_url: string | null
  /** URL on OpenSea */
  opensea_url: string
}

/**
 * Response from OpenSea API for fetching trending tokens.
 * @category API Response Types
 */
export type GetTrendingTokensResponse = QueryCursorsV2 & {
  /** List of {@link Token} */
  tokens: Token[]
}

/**
 * Response from OpenSea API for fetching top tokens.
 * @category API Response Types
 */
export type GetTopTokensResponse = QueryCursorsV2 & {
  /** List of {@link Token} */
  tokens: Token[]
}

/**
 * Query args for Get Trending/Top Tokens endpoints.
 * @category API Query Args
 */
export interface GetTokensArgs {
  /** Limit the number of results */
  limit?: number
  /** Cursor for pagination */
  next?: string
}

/**
 * Query args for Get Swap Quote endpoint.
 * @category API Query Args
 */
export interface GetSwapQuoteArgs {
  /** Address of the input token */
  token_in: string
  /** Address of the output token */
  token_out: string
  /** Amount of input token */
  amount: string
  /** Chain for the swap */
  chain: string
  /** Address of the taker */
  taker_address?: string
  /** Slippage tolerance */
  slippage?: number
}

/**
 * Response from OpenSea API for fetching a swap quote.
 * @category API Response Types
 */
export type GetSwapQuoteResponse = {
  [key: string]: unknown
}

/**
 * Response from OpenSea API for fetching token details.
 * @category API Response Types
 */
export type GetTokenResponse = Token

/**
 * Response from OpenSea API for fetching a token group by slug.
 * @category API Response Types
 */
export type GetTokenGroupResponse = TokenGroupResponse

/**
 * Response from OpenSea API for fetching a paginated list of token groups.
 * @category API Response Types
 */
export type GetTokenGroupsResponse = TokenGroupPaginatedResponse

/**
 * Query args for the Get Token Groups endpoint.
 * @category API Query Args
 */
export interface GetTokenGroupsArgs {
  /** Number of results to return (default: 50, max: 100) */
  limit?: number
  /** Cursor for pagination */
  cursor?: string
}

/**
 * Response from OpenSea API for requesting an instant API key.
 * @category API Response Types
 */
export type RequestInstantApiKeyResponse = InstantApiKeyResponse

/**
 * Query args for the Search endpoint.
 * @category API Query Args
 */
export interface SearchArgs {
  /** Search query text */
  query: string
  /** Filter by blockchain(s) */
  chains?: string[]
  /** Filter by asset type(s): collection, nft, token, account */
  asset_types?: string[]
  /** Number of results to return (default: 20, max: 50) */
  limit?: number
}

/**
 * Collection search result.
 * @category API Models
 */
export type CollectionSearchResult = {
  /** The collection slug */
  collection: string
  /** The collection name */
  name: string
  /** URL of the collection image */
  image_url: string | null
  /** Whether trading is disabled for this collection */
  is_disabled: boolean
  /** Whether this collection is marked as NSFW */
  is_nsfw: boolean
  /** URL to the collection on OpenSea */
  opensea_url: string
}

/**
 * Token (currency) search result.
 * @category API Models
 */
export type TokenSearchResult = {
  /** Contract address of the token */
  address: string
  /** Blockchain the token is on */
  chain: string
  /** Token name */
  name: string
  /** Token symbol */
  symbol: string
  /** URL of the token image */
  image_url: string | null
  /** Current USD price of the token */
  usd_price: string
  /** Number of decimal places for the token */
  decimals: number
  /** URL to the token on OpenSea */
  opensea_url: string
}

/**
 * NFT search result.
 * @category API Models
 */
export type NftSearchResult = {
  /** Token ID of the NFT */
  identifier: string
  /** Collection slug the NFT belongs to */
  collection: string
  /** Contract address of the NFT */
  contract: string
  /** Name of the NFT */
  name: string | null
  /** URL of the NFT image */
  image_url: string | null
  /** URL to the NFT on OpenSea */
  opensea_url: string
}

/**
 * Account search result.
 * @category API Models
 */
export type AccountSearchResult = {
  /** Primary wallet address of the account */
  address: string
  /** Username of the account */
  username: string | null
  /** URL of the account's profile image */
  profile_image_url: string | null
  /** URL to the account on OpenSea */
  opensea_url: string
}

/**
 * A single search result with a type discriminator and the corresponding typed object.
 * @category API Models
 */
export type SearchResult = {
  /** The type of search result */
  type: string
  /** Collection details, present when type is 'collection' */
  collection?: CollectionSearchResult
  /** Token details, present when type is 'token' */
  token?: TokenSearchResult
  /** NFT details, present when type is 'nft' */
  nft?: NftSearchResult
  /** Account details, present when type is 'account' */
  account?: AccountSearchResult
}

/**
 * Response from OpenSea API for search.
 * @category API Response Types
 */
export type SearchResponse = {
  /** List of search results ranked by relevance */
  results: SearchResult[]
}

/**
 * Information about a supported blockchain.
 * @category API Models
 */
export type ChainInfo = {
  /** The chain identifier slug used in API paths */
  chain: string
  /** Human-readable chain name */
  name: string
  /** Native currency symbol */
  symbol: string
  /** Whether token swaps are supported on this chain */
  supports_swaps: boolean
  /** Block explorer name */
  block_explorer: string
  /** Block explorer base URL */
  block_explorer_url: string
}

/**
 * Response from OpenSea API for listing supported chains.
 * @category API Response Types
 */
export type GetChainsResponse = {
  /** List of supported chains */
  chains: ChainInfo[]
}

/**
 * Token balance for a wallet address.
 * @category API Models
 */
export type TokenBalance = {
  /** Token contract address */
  address: string
  /** Chain the token is on */
  chain: string
  /** Token name */
  name: string
  /** Token symbol */
  symbol: string
  /** URL of the token image */
  image_url?: string
  /** Current price in USD */
  usd_price: string
  /** Number of decimals */
  decimals: number
  /** Token balance in display units */
  quantity: string
  /** Total USD value of the balance */
  usd_value: string
  /** URL to the token page on OpenSea */
  opensea_url: string
}

/**
 * Query args for Get Account Tokens endpoint.
 * @category API Query Args
 */
export interface GetAccountTokensArgs {
  /** Limit the number of results */
  limit?: number
  /** Comma-separated chain identifiers to filter by */
  chains?: string[]
  /** Field to sort by */
  sort_by?: string
  /** Sort direction */
  sort_direction?: "asc" | "desc"
  /** Whether to disable spam filtering */
  disable_spam_filtering?: boolean
  /** Cursor for pagination */
  cursor?: string
}

/**
 * Response from OpenSea API for fetching account token balances.
 * @category API Response Types
 */
export type GetAccountTokensResponse = QueryCursorsV2 & {
  /** List of token balances */
  token_balances: TokenBalance[]
}

/**
 * Drop summary returned by OpenSea API.
 * @category API Models
 */
export type Drop = {
  /** Collection slug */
  collection_slug: string
  /** Collection name */
  collection_name?: string
  /** Blockchain the drop is on */
  chain: string
  /** Contract address */
  contract_address: string
  /** Drop type */
  drop_type: string
  /** Whether the drop is currently minting */
  is_minting: boolean
  /** Collection image URL */
  image_url?: string
  /** OpenSea URL for the drop */
  opensea_url: string
}

/**
 * Drop stage information.
 * @category API Models
 */
export type DropStage = {
  /** Stage UUID */
  uuid: string
  /** Stage type (e.g. public_sale) */
  stage_type: string
  /** Stage label/name */
  label?: string
  /** Mint price per token in wei */
  price?: string
  /** Currency contract address */
  price_currency_address: string
  /** Stage start time (ISO 8601) */
  start_time: string
  /** Stage end time (ISO 8601) */
  end_time: string
  /** Max tokens mintable per wallet in this stage */
  max_per_wallet: string
}

/**
 * Detailed drop information including stages and supply.
 * @category API Models
 */
export type DropDetailed = Drop & {
  /** Drop stages (public sale, presale, etc.) */
  stages: DropStage[]
  /** Total minted supply */
  total_supply?: string
  /** Maximum supply */
  max_supply?: string
}

/**
 * Response from OpenSea API for fetching a list of drops.
 * @category API Response Types
 */
export type GetDropsResponse = QueryCursorsV2 & {
  /** List of {@link Drop} */
  drops: Drop[]
}

/**
 * Response from OpenSea API for fetching a single drop.
 * @category API Response Types
 */
export type GetDropResponse = DropDetailed

/**
 * Query args for Get Drops endpoint.
 * @category API Query Args
 */
export interface GetDropsArgs {
  /** Drop calendar type: featured, upcoming, or recently_minted */
  type?: string
  /** Limit the number of results */
  limit?: number
  /** Comma-separated chains to filter by */
  chains?: string[]
  /** Cursor for pagination */
  cursor?: string
}

/**
 * Request body for building a drop mint transaction.
 * @category API Request Types
 */
export type DropMintRequest = {
  /** Wallet address that will receive the minted tokens */
  minter: string
  /** Number of tokens to mint (1-100) */
  quantity: number
}

/**
 * Response from OpenSea API for building a drop mint transaction.
 * @category API Response Types
 */
export type DropMintResponse = {
  /** Transaction target contract address */
  to: string
  /** Encoded transaction data (hex) */
  data: string
  /** Transaction value in wei (hex) */
  value: string
  /** Chain identifier */
  chain: string
}

/**
 * Query args for Get Trending Collections endpoint.
 * @category API Query Args
 */
export interface GetTrendingCollectionsArgs {
  /** Time window: one_minute, five_minutes, fifteen_minutes, one_hour, one_day, seven_days, thirty_days, one_year, all_time */
  timeframe?: string
  /** Blockchain(s) to filter by */
  chains?: string[]
  /** Category to filter by (e.g. art, gaming, pfps) */
  category?: string
  /** Maximum number of collections to return (1-100) */
  limit?: number
  /** Cursor for pagination */
  cursor?: string
}

/**
 * Query args for Get Top Collections endpoint.
 * @category API Query Args
 */
export interface GetTopCollectionsArgs {
  /** Sort by: one_day_volume, seven_days_volume, thirty_days_volume, floor_price, one_day_sales, etc. */
  sort_by?: string
  /** Blockchain(s) to filter by */
  chains?: string[]
  /** Category to filter by (e.g. art, gaming, pfps) */
  category?: string
  /** Maximum number of collections to return (1-100) */
  limit?: number
  /** Cursor for pagination */
  cursor?: string
}

/**
 * Response from OpenSea API for trending/top collections.
 * @category API Response Types
 */
export type GetCollectionsPaginatedResponse = QueryCursorsV2 & {
  collections: OpenSeaCollection[]
}

/**
 * Response from OpenSea API for resolving an account identifier.
 * @category API Response Types
 */
export type ResolveAccountResponse = {
  /** The resolved wallet address */
  address: string
  /** OpenSea username, if available */
  username?: string
  /** Primary ENS name, if available */
  ens_name?: string
}

/**
 * Response from OpenSea API for validating NFT metadata.
 * @category API Response Types
 */
export type ValidateMetadataResponse = {
  /** The asset being validated */
  assetIdentifier: {
    chain: string
    contractAddress: string
    tokenId: string
  }
  /** The token URI */
  tokenUri?: string
  /** Parsed metadata details */
  metadata?: {
    name?: string
    description?: string
    originalImageUrl?: string
    processedImageUrl?: string
    originalAnimationUrl?: string
    processedAnimationUrl?: string
    externalUrl?: string
    backgroundColor?: string
    attributes: {
      traitType: string
      value: string
      displayType?: string
    }[]
  }
  /** Error encountered during metadata ingestion */
  error?: {
    errorType: string
    message: string
    url?: string
    statusCode?: number
  }
}

/**
 * Response from OpenSea API for fetching raw NFT metadata.
 * Derived from the generated OpenAPI spec type to stay in sync automatically.
 * @category API Response Types
 */
export type GetNFTMetadataResponse = AssetMetadataResponse
