import type {
  BuildOfferResponse as ApiBuildOfferResponse,
  CancelResponse as ApiCancelResponse,
  Listing as ApiListing,
  Nft as ApiNft,
  Offer as ApiOffer,
  Order as ApiOrder,
  OrderAsset as ApiOrderAsset,
  Payment as ApiPayment,
  Price as ApiPrice,
  SwapExecuteRequest as ApiSwapExecuteRequest,
  SwapExecuteResponse as ApiSwapExecuteResponse,
  SwapQuoteResponse as ApiSwapQuoteResponse,
  SweepCollectionRequest as ApiSweepCollectionRequest,
  SweepCollectionResponse as ApiSweepCollectionResponse,
  Trait as ApiTrait,
  TransactionReceiptRequest as ApiTransactionReceiptRequest,
  TransactionReceiptResponse as ApiTransactionReceiptResponse,
  AssetMetadataResponse,
  ChainResponse,
  DropDetailedResponse,
  DropResponse,
  DropStageResponse,
  InstantApiKeyResponse,
  ListingsResponse,
  NftDetailed,
  NftListResponse,
  NftResponse,
  OffersResponse,
  TokenBalanceResponse,
  TokenGroupPaginatedResponse,
  TokenGroupResponse,
} from "@opensea/api-types"
import type { OrderType, ProtocolData } from "../orders/types"
import type { OpenSeaCollection } from "../types"
import type { Camelize } from "../utils/case"

// The Order family. Sourced from @opensea/api-types and camelized for the
// SDK consumer view (the fetcher camelizes responses at the boundary; see
// utils/case.ts). Narrowing intersections preserve `OrderType`/`OrderStatus`
// enums and the seaport-js `OrderWithCounter` shape on `protocolData`.
export type OrderAsset = Camelize<ApiOrderAsset>
export type Price = Camelize<ApiPrice>

/**
 * A single trait filter used by collection-scoped read endpoints (NFTs by
 * collection, best listings by collection, events by collection). Multiple
 * filters in the same query are AND-combined: returned items must match every
 * specified trait.
 *
 * Distinct from {@link TraitCriteria} (`{type, value}`) which is the offer-
 * creation shape — the wire format differs across endpoints.
 *
 * @category API Query Args
 */
export interface TraitFilter {
  /** The trait name (e.g. "Background"). */
  traitType: string
  /** The trait value to match (e.g. "Red"). */
  value: string
}

/**
 * Encode a {@link TraitFilter} array as the JSON-string form the API expects
 * on the `traits` query parameter, or `undefined` if the array is empty.
 * Callers spread the result into a query object; query encoders skip
 * undefined keys.
 */
export function encodeTraitsParam(
  traits: TraitFilter[] | undefined,
): string | undefined {
  return traits && traits.length > 0 ? JSON.stringify(traits) : undefined
}

/**
 * Response from OpenSea API for building an offer. Camelized from api-types
 * `BuildOfferResponse` (the spec already ships camelCase keys here, so the
 * camelize at the fetcher is a no-op).
 * @category API Response Types
 */
export type BuildOfferResponse = Camelize<ApiBuildOfferResponse>

/**
 * Criteria returned by the build offer endpoint. Subset of the wire-format
 * criteria — only collection and trait fields.
 * @category API Response Types
 */
export type BuildOfferCriteria = {
  collection: CollectionCriteria
  traits?: TraitCriteria[]
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

/**
 * Query args for Get Collections
 * @category API Query Args
 */
export interface GetCollectionsArgs {
  orderBy?: string
  limit?: number
  next?: string
  chain?: string
  creatorUsername?: string
  includeHidden?: boolean
}

/**
 * Response from OpenSea API for fetching a single collection.
 * Bare collection object (the response is not wrapped). See {@link OpenSeaCollection}.
 * @category API Response Types
 */
export type GetCollectionResponse = OpenSeaCollection

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
 * Base Order shape — camelized from `@opensea/api-types`, with `protocolData`
 * narrowed to the seaport-js `OrderWithCounter` type (a.k.a. {@link ProtocolData})
 * since SDK callers pass this directly to Seaport.
 * @category API Models
 */
export type Order = Camelize<Omit<ApiOrder, "protocol_data">> & {
  protocolData?: ProtocolData
}

/**
 * Offer type. Camelized from `@opensea/api-types`, with `protocolData` narrowed
 * to seaport-js {@link ProtocolData} and `status` narrowed to the
 * {@link OrderStatus} enum (the OpenAPI spec ships status as a string union).
 * @category API Models
 */
export type Offer = Camelize<Omit<ApiOffer, "protocol_data" | "status">> & {
  protocolData?: ProtocolData
  status: OrderStatus
}

/**
 * Collection Offer type — an {@link Offer} with `criteria` guaranteed present.
 * @category API Models
 */
export type CollectionOffer = Offer & {
  criteria: NonNullable<Offer["criteria"]>
}

/**
 * Listing order type. Camelized from `@opensea/api-types`, with `protocolData`
 * narrowed to seaport-js {@link ProtocolData}, `type` narrowed to the
 * {@link OrderType} enum, and `status` narrowed to the {@link OrderStatus}
 * enum (the OpenAPI spec ships type and status as plain strings).
 * @category API Models
 */
export type Listing = Camelize<
  Omit<ApiListing, "protocol_data" | "type" | "status">
> & {
  protocolData?: ProtocolData
  type: OrderType
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
 * Camelized from api-types `NftResponse`.
 * @category API Response Types
 */
export type GetNFTResponse = Camelize<NftResponse>

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
 * Camelized from api-types `CancelResponse`.
 * @category API Response Types
 */
export type CancelOrderResponse = Camelize<ApiCancelResponse>

/**
 * Request body for sweeping (bulk-buying) items from a collection.
 * @category API Query Args
 */
export type SweepCollectionRequest = Camelize<ApiSweepCollectionRequest>

/**
 * Response from sweeping a collection.
 * @category API Response Types
 */
export type SweepCollectionResponse = Camelize<ApiSweepCollectionResponse>

/**
 * Request body for executing a token swap.
 * @category API Query Args
 */
export type SwapExecuteRequest = Camelize<ApiSwapExecuteRequest>

/**
 * Response from executing a token swap.
 * @category API Response Types
 */
export type SwapExecuteResponse = Camelize<ApiSwapExecuteResponse>

/**
 * Request body for fetching a transaction receipt.
 * @category API Query Args
 */
export type TransactionReceiptRequest = Camelize<ApiTransactionReceiptRequest>

/**
 * Response from fetching a transaction receipt.
 * @category API Response Types
 */
export type TransactionReceiptResponse = Camelize<ApiTransactionReceiptResponse>

/**
 * NFT type returned by OpenSea API. Sourced from api-types `NftDetailed`.
 * @category API Models
 */
export type NFT = Camelize<NftDetailed>

/**
 * Trait type returned by OpenSea API. Sourced from api-types `Trait`.
 * For numeric traits, `value` arrives as a string — callers parse as needed.
 * @category API Models
 */
export type Trait = Camelize<ApiTrait>

/**
 * Trait display type returned by OpenSea API. Kept as an enum value for
 * convenience; api-types models the wire field as a plain string.
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
 * Payment information for an event. Camelized from api-types `Payment`.
 * @category API Models
 */
export type EventPayment = Camelize<ApiPayment>

/**
 * Asset information in an event. Camelized from api-types `Nft`.
 * @category API Models
 */
export type EventAsset = Camelize<ApiNft>

/**
 * Base event type.
 * @category API Models
 */
type BaseEvent = {
  /** Type of the event */
  eventType: AssetEventType | string
  /** Timestamp of the event */
  eventTimestamp: number
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
  eventType: AssetEventType.LISTING | "listing"
  /** Payment information */
  payment: EventPayment
  /** Start date of the listing */
  startDate: number | null
  /** Expiration date of the listing */
  expirationDate: number
  /** Asset involved in the listing */
  asset: EventAsset
  /** Maker of the listing */
  maker: string
  /** Taker of the listing */
  taker: string
  /** Whether the listing is private */
  isPrivateListing: boolean
  /** Order hash (optional) */
  orderHash?: string
  /** Protocol address (optional) */
  protocolAddress?: string
}

/**
 * Offer event type.
 * @category API Models
 */
export type OfferEvent = BaseEvent & {
  eventType: AssetEventType.OFFER | "offer"
  /** Payment information */
  payment: EventPayment
  /** Start date of the offer */
  startDate: number | null
  /** Expiration date of the offer */
  expirationDate: number
  /** Asset involved in the offer */
  asset: EventAsset
  /** Maker of the offer */
  maker: string
  /** Taker of the offer */
  taker: string
  /** Order hash (optional) */
  orderHash?: string
  /** Protocol address (optional) */
  protocolAddress?: string
}

/**
 * Trait offer event type.
 * @category API Models
 */
export type TraitOfferEvent = BaseEvent & {
  eventType: AssetEventType.TRAIT_OFFER | "trait_offer"
  /** Payment information */
  payment: EventPayment
  /** Start date of the offer */
  startDate: number | null
  /** Expiration date of the offer */
  expirationDate: number
  /** Criteria for trait offers */
  criteria: Record<string, unknown>
  /** Maker of the offer */
  maker: string
  /** Taker of the offer */
  taker: string
  /** Order hash (optional) */
  orderHash?: string
  /** Protocol address (optional) */
  protocolAddress?: string
}

/**
 * Collection offer event type.
 * @category API Models
 */
export type CollectionOfferEvent = BaseEvent & {
  eventType: AssetEventType.COLLECTION_OFFER | "collection_offer"
  /** Payment information */
  payment: EventPayment
  /** Start date of the offer */
  startDate: number | null
  /** Expiration date of the offer */
  expirationDate: number
  /** Criteria for collection offers */
  criteria: Record<string, unknown>
  /** Maker of the offer */
  maker: string
  /** Taker of the offer */
  taker: string
  /** Order hash (optional) */
  orderHash?: string
  /** Protocol address (optional) */
  protocolAddress?: string
}

/**
 * Order event type returned by the API for order-related activities
 * (listings, offers, trait offers, collection offers).
 * @category API Models
 */
export type OrderEvent = BaseEvent & {
  eventType: AssetEventType.ORDER | "order"
  /** Payment information */
  payment: EventPayment
  /** Start date of the order */
  startDate: number | null
  /** Expiration date of the order */
  expirationDate: number
  /** Asset involved in the order (optional, not present for collection/trait offers) */
  asset?: EventAsset
  /** Criteria for collection/trait offers (optional) */
  criteria?: Record<string, unknown>
  /** Maker of the order */
  maker: string
  /** Taker of the order */
  taker: string
  /** Order hash (optional) */
  orderHash?: string
  /** Protocol address (optional) */
  protocolAddress?: string
  /** Order type providing more detail */
  orderType?: OrderEventType
}

/**
 * Mint event type.
 * @category API Models
 */
export type MintEvent = BaseEvent & {
  eventType: AssetEventType.MINT | "mint"
  /** Transaction hash */
  transaction: string
  /** Address the NFT was minted to */
  toAddress: string
  /** NFT that was minted */
  nft: EventAsset
}

/**
 * Sale event type.
 * @category API Models
 */
export type SaleEvent = BaseEvent & {
  eventType: AssetEventType.SALE | "sale"
  /** Transaction hash */
  transaction: string
  /** Order hash */
  orderHash: string
  /** Protocol address */
  protocolAddress: string
  /** Payment information */
  payment: EventPayment
  /** Closing date of the sale */
  closingDate: number
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
  eventType: AssetEventType.TRANSFER | "transfer"
  /** Transaction hash */
  transaction: string
  /** Address the NFT was transferred from */
  fromAddress: string
  /** Address the NFT was transferred to */
  toAddress: string
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
 * Query args for the generic event endpoints (`getEvents`,
 * `getEventsByAccount`, `getEventsByNFT`). For the collection-scoped endpoint
 * see {@link GetEventsByCollectionArgs}, which adds server-side trait
 * filtering on top of these fields.
 *
 * @category API Query Args
 */
export interface GetEventsArgs {
  /** Type of event to filter by */
  eventType?: AssetEventType | string
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
 * Query args for {@link EventsAPI.getEventsByCollection}. Adds server-side
 * trait filtering on top of {@link GetEventsArgs}; multiple traits are
 * AND-combined.
 *
 * @category API Query Args
 */
export interface GetEventsByCollectionArgs extends GetEventsArgs {
  /** Trait filters; see {@link TraitFilter}. */
  traits?: TraitFilter[]
}

/**
 * Response from OpenSea API for fetching events.
 * @category API Response Types
 */
export type GetEventsResponse = QueryCursorsV2 & {
  /** List of {@link AssetEvent} */
  assetEvents: AssetEvent[]
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
  /**
   * Associated collection slug. `null` for contracts without an associated
   * collection on OpenSea. TODO(api-types): the OpenAPI spec marks this as
   * required non-null, but the live API returns null for standalone contracts —
   * swap to `Camelize<ContractResponse>` once the spec is updated.
   */
  collection: string | null
  /** Contract name */
  name: string
  /** Contract standard (e.g., erc721, erc1155) */
  contractStandard: string
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
 *
 * TODO(api-types): swap to `Camelize<TokenResponse>` once the OpenAPI spec
 * marks `image_url` as nullable (the live API returns `null` for tokens
 * without an image). Currently the spec models it as optional non-null.
 *
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
  /** URL of the token image (null when the token has no image) */
  imageUrl: string | null
  /** URL on OpenSea */
  openseaUrl: string
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
  /** Chain of the token to swap from */
  fromChain: string
  /** Contract address of the token to swap from */
  fromAddress: string
  /** Chain of the token to swap to */
  toChain: string
  /** Contract address of the token to swap to */
  toAddress: string
  /** Amount to swap in the smallest unit of the token (e.g. wei for ETH) */
  quantity: string
  /** Wallet address executing the swap */
  address: string
  /** Slippage tolerance, 0.0 to 0.5 (default 0.01) */
  slippage?: number
  /** Recipient address (defaults to the sender address) */
  recipient?: string
}

/**
 * Response from OpenSea API for fetching a swap quote.
 * Camelized from api-types `SwapQuoteResponse`.
 * @category API Response Types
 */
export type GetSwapQuoteResponse = Camelize<ApiSwapQuoteResponse>

/**
 * Response from OpenSea API for fetching token details.
 * @category API Response Types
 */
export type GetTokenResponse = Token

/**
 * Response from OpenSea API for fetching a token group by slug.
 * @category API Response Types
 */
export type GetTokenGroupResponse = Camelize<TokenGroupResponse>

/**
 * Response from OpenSea API for fetching a paginated list of token groups.
 * @category API Response Types
 */
export type GetTokenGroupsResponse = Camelize<TokenGroupPaginatedResponse>

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
export type RequestInstantApiKeyResponse = Camelize<InstantApiKeyResponse>

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
  assetTypes?: string[]
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
  imageUrl: string | null
  /** Whether trading is disabled for this collection */
  isDisabled: boolean
  /** Whether this collection is marked as NSFW */
  isNsfw: boolean
  /** URL to the collection on OpenSea */
  openseaUrl: string
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
  imageUrl: string | null
  /** Current USD price of the token */
  usdPrice: string
  /** Number of decimal places for the token */
  decimals: number
  /** URL to the token on OpenSea */
  openseaUrl: string
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
  imageUrl: string | null
  /** URL to the NFT on OpenSea */
  openseaUrl: string
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
  profileImageUrl: string | null
  /** URL to the account on OpenSea */
  openseaUrl: string
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
 * Information about a supported blockchain. Sourced from `@opensea/api-types`
 * (the SDK previously hand-rolled this with the same shape).
 * @category API Models
 */
export type ChainInfo = Camelize<ChainResponse>

/**
 * Response from OpenSea API for listing supported chains.
 * @category API Response Types
 */
export type GetChainsResponse = {
  /** List of supported chains */
  chains: ChainInfo[]
}

/**
 * Token balance for a wallet address. Sourced from `@opensea/api-types`
 * (`TokenBalanceResponse`). Gains optional `status`, `base_token_liquidity_usd`,
 * and `quote_token_liquidity_usd` fields the hand-rolled version didn't expose.
 * @category API Models
 */
export type TokenBalance = Camelize<TokenBalanceResponse>

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
  sortBy?: string
  /** Sort direction */
  sortDirection?: "asc" | "desc"
  /** Whether to disable spam filtering */
  disableSpamFiltering?: boolean
  /** Cursor for pagination */
  cursor?: string
}

/**
 * Response from OpenSea API for fetching account token balances.
 * @category API Response Types
 */
export type GetAccountTokensResponse = QueryCursorsV2 & {
  /** List of token balances */
  tokenBalances: TokenBalance[]
}

/**
 * Drop summary returned by OpenSea API. Sourced from api-types `DropResponse`.
 * @category API Models
 */
export type Drop = Camelize<DropResponse>

/**
 * Drop stage information. Sourced from api-types `DropStageResponse`.
 * @category API Models
 */
export type DropStage = Camelize<DropStageResponse>

/**
 * Detailed drop information including stages and supply.
 * Sourced from api-types `DropDetailedResponse`.
 * @category API Models
 */
export type DropDetailed = Camelize<DropDetailedResponse>

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
  sortBy?: string
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
  ensName?: string
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
export type GetNFTMetadataResponse = Camelize<AssetMetadataResponse>

// ─── Cross-chain fulfillment + new endpoint types ───────────────────────
// Sourced from @opensea/api-types. Response shapes are camelized for the
// consumer view (the fetcher camelizes responses; see utils/case.ts).
// Request shapes stay snake_case to match the API wire format — they're
// sent as POST bodies and need to hit the API in its native format.

import type {
  BatchCollectionsRequest as ApiBatchCollectionsRequest,
  BatchNftsRequest as ApiBatchNftsRequest,
  BatchTokensRequest as ApiBatchTokensRequest,
  ClosedPositionsResponse as ApiClosedPositionsResponse,
  CollectionBatchResponse as ApiCollectionBatchResponse,
  CollectionHoldersPaginatedResponse as ApiCollectionHoldersPaginatedResponse,
  CollectionOfferAggregatesPaginatedResponse as ApiCollectionOfferAggregatesPaginatedResponse,
  CreateListingActionsRequest as ApiCreateListingActionsRequest,
  CreateListingActionsResponse as ApiCreateListingActionsResponse,
  CrossChainFulfillmentRequest as ApiCrossChainFulfillmentRequest,
  CrossChainFulfillmentResponse as ApiCrossChainFulfillmentResponse,
  CrossChainPaymentToken as ApiCrossChainPaymentToken,
  DropDeployReceiptResponse as ApiDropDeployReceiptResponse,
  DropDeployRequest as ApiDropDeployRequest,
  DropDeployResponse as ApiDropDeployResponse,
  FloorPriceHistoryResponse as ApiFloorPriceHistoryResponse,
  FulfillerObject as ApiFulfillerObject,
  ListingObject as ApiListingObject,
  NftAnalyticsResponse as ApiNftAnalyticsResponse,
  NftBatchResponse as ApiNftBatchResponse,
  OhlcvResponse as ApiOhlcvResponse,
  OwnersPaginatedResponse as ApiOwnersPaginatedResponse,
  PortfolioHistoryResponse as ApiPortfolioHistoryResponse,
  PortfolioStatsResponse as ApiPortfolioStatsResponse,
  PositionTokenTransfersResponse as ApiPositionTokenTransfersResponse,
  PriceHistoryResponse as ApiPriceHistoryResponse,
  ProfileCollectionsResponse as ApiProfileCollectionsResponse,
  SwapTransactionResponse as ApiSwapTransactionResponse,
  TokenBatchResponse as ApiTokenBatchResponse,
  TokenHoldersResponse as ApiTokenHoldersResponse,
  TokenLiquidityPoolsResponse as ApiTokenLiquidityPoolsResponse,
  TokenSwapActivityPaginatedResponse as ApiTokenSwapActivityPaginatedResponse,
  TransferRequest as ApiTransferRequest,
  TransferResponse as ApiTransferResponse,
  WalletPnlResponse as ApiWalletPnlResponse,
} from "@opensea/api-types"

// Request types — camelized consumer view. The fetcher snakeizes the body on
// the way out (see `api.ts`), so passing camelCase here hits the API correctly.
export type BatchCollectionsRequest = Camelize<ApiBatchCollectionsRequest>
export type BatchNftsRequest = Camelize<ApiBatchNftsRequest>
export type BatchTokensRequest = Camelize<ApiBatchTokensRequest>
export type CreateListingActionsRequest =
  Camelize<ApiCreateListingActionsRequest>
export type CrossChainFulfillmentRequest =
  Camelize<ApiCrossChainFulfillmentRequest>
export type DropDeployRequest = Camelize<ApiDropDeployRequest>
export type FulfillerObject = Camelize<ApiFulfillerObject>
export type ListingObject = Camelize<ApiListingObject>
export type TransferRequest = Camelize<ApiTransferRequest>

// Response types — camelized for the consumer view.
export type CollectionBatchResponse = Camelize<ApiCollectionBatchResponse>
export type CollectionHoldersPaginatedResponse =
  Camelize<ApiCollectionHoldersPaginatedResponse>
export type CollectionOfferAggregatesPaginatedResponse =
  Camelize<ApiCollectionOfferAggregatesPaginatedResponse>
export type CreateListingActionsResponse =
  Camelize<ApiCreateListingActionsResponse>
export type CrossChainFulfillmentResponse =
  Camelize<ApiCrossChainFulfillmentResponse>
export type CrossChainPaymentToken = Camelize<ApiCrossChainPaymentToken>
export type DropDeployReceiptResponse = Camelize<ApiDropDeployReceiptResponse>
export type DropDeployResponse = Camelize<ApiDropDeployResponse>
export type FloorPriceHistoryResponse = Camelize<ApiFloorPriceHistoryResponse>
export type NftAnalyticsResponse = Camelize<ApiNftAnalyticsResponse>
export type NftBatchResponse = Camelize<ApiNftBatchResponse>
export type OhlcvResponse = Camelize<ApiOhlcvResponse>
export type OwnersPaginatedResponse = Camelize<ApiOwnersPaginatedResponse>
export type PortfolioHistoryResponse = Camelize<ApiPortfolioHistoryResponse>
export type PortfolioStatsResponse = Camelize<ApiPortfolioStatsResponse>
export type WalletPnlResponse = Camelize<ApiWalletPnlResponse>
export type ClosedPositionsResponse = Camelize<ApiClosedPositionsResponse>
export type PositionTokenTransfersResponse =
  Camelize<ApiPositionTokenTransfersResponse>
export type PriceHistoryResponse = Camelize<ApiPriceHistoryResponse>
export type ProfileCollectionsResponse = Camelize<ApiProfileCollectionsResponse>
export type SwapTransactionResponse = Camelize<ApiSwapTransactionResponse>
export type TokenBatchResponse = Camelize<ApiTokenBatchResponse>
export type TokenHoldersResponse = Camelize<ApiTokenHoldersResponse>
export type TokenLiquidityPoolsResponse =
  Camelize<ApiTokenLiquidityPoolsResponse>
export type TokenSwapActivityPaginatedResponse =
  Camelize<ApiTokenSwapActivityPaginatedResponse>
export type TransferResponse = Camelize<ApiTransferResponse>

/**
 * Query args for paginated collection-analytics endpoints (offer aggregates,
 * holders). All fields are optional; `cursor` paginates forward.
 * @category API Query Args
 */
export interface PaginatedAnalyticsArgs {
  limit?: number
  cursor?: string
  sortDirection?: "asc" | "desc"
}

/**
 * Query args for the collection holders endpoint — adds optional `owned_by`
 * filter on top of {@link PaginatedAnalyticsArgs}.
 * @category API Query Args
 */
export interface CollectionHoldersArgs extends PaginatedAnalyticsArgs {
  ownedBy?: string
}

/**
 * Query args for the collection floor-price history endpoint.
 * @category API Query Args
 */
export interface CollectionFloorPricesArgs {
  /** Time window: one_minute, five_minutes, fifteen_minutes, one_hour, one_day, seven_days, thirty_days, one_year, all_time */
  timeframe?: string
  /** Number of data points to return */
  resolution?: number
}

/**
 * Query args for token price-history and OHLCV endpoints.
 * @category API Query Args
 */
export interface TokenTimeSeriesArgs {
  /** Start time (ISO 8601, required by the API). */
  startTime: string
  /** End time (ISO 8601, defaults to now). */
  endTime?: string
  /** Candle bucket size: 1s, 1m, 5m, 15m, 1h, 4h, 1d. */
  bucketSize?: string
  /** Whether to fill empty time windows with zero-volume candles (OHLCV only). */
  fillTimeWindow?: boolean
}

/**
 * Query args for the token swap-activity endpoint.
 * @category API Query Args
 */
export interface TokenActivityArgs {
  limit?: number
  cursor?: string
}

/**
 * Query args for the token holders endpoint (paginated with `cursor`,
 * sortable by `QUANTITY`).
 * @category API Query Args
 */
export interface TokenHoldersArgs {
  limit?: number
  cursor?: string
  sortBy?: "QUANTITY"
  sortDirection?: "asc" | "desc"
}

/**
 * Query args for the token liquidity-pools endpoint.
 * @category API Query Args
 */
export interface TokenLiquidityPoolsArgs {
  limit?: number
}

/**
 * Query args for the NFT owners endpoint (paginated with `next` cursor).
 * @category API Query Args
 */
export interface NFTOwnersArgs {
  limit?: number
  next?: string
}

/**
 * Query args for the account portfolio and portfolio history endpoints.
 * @category API Query Args
 */
export interface PortfolioArgs {
  /** Timeframe for P&L / net-worth history calculation. */
  timeframe?: "HOUR" | "DAY" | "WEEK" | "MONTH"
}

/**
 * Query args shared by the account profile listing-and-offer endpoints
 * (offers, offers_received, listings).
 * @category API Query Args
 */
export interface ProfileOrdersArgs {
  after?: string
  limit?: number
  collectionSlugs?: string[]
  chains?: string[]
  sortBy?: string
  sortDirection?: "asc" | "desc"
}

/**
 * Query args for the account profile favorites endpoint.
 * @category API Query Args
 */
export interface ProfileFavoritesArgs {
  after?: string
  limit?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
  chains?: string[]
}

/**
 * Query args for the wallet closed-positions (realized P&L) endpoint.
 * @category API Query Args
 */
export interface WalletClosedPositionsArgs {
  /** Sort field for the returned positions. */
  sortBy?: string
  /** Max number of positions to return (default 20). */
  limit?: number
  /** Cursor for the next page of results. */
  next?: string
}

/**
 * Query args for the wallet position token-transfers endpoint. `contractAddress`
 * and `chain` identify the currency position to inspect and are required.
 * @category API Query Args
 */
export interface WalletTokenTransfersArgs {
  /** Contract address of the currency whose position transfers to fetch. */
  contractAddress: string
  /** Chain the currency lives on (e.g. `ethereum`, `base`). */
  chain: string
  /** Max number of transfers to return (default 20). */
  limit?: number
  /** Cursor for the next page of results. */
  next?: string
}

/**
 * Query args for the account profile collections endpoint.
 * @category API Query Args
 */
export interface ProfileCollectionsArgs {
  after?: string
  limit?: number
  chains?: string[]
}

/**
 * Response from the account favorites endpoint — favorited NFTs.
 * @category API Response Types
 */
export type ProfileFavoritesResponse = Camelize<NftListResponse>

/**
 * Response from the account profile listings endpoint.
 * @category API Response Types
 */
export type ProfileListingsResponse = Camelize<ListingsResponse>

/**
 * Response from the account profile offers / offers_received endpoints.
 * @category API Response Types
 */
export type ProfileOffersResponse = Camelize<OffersResponse>
