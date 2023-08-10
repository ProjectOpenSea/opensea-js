/* eslint-disable import/no-unused-modules */
import { BigNumber, BigNumberish } from "ethers";
import type { OrderV2 } from "./orders/types";

/**
 * Events emitted by the SDK which can be used by frontends applications
 * to update state or show useful messages to users.
 * @category Events
 */
export enum EventType {
  /**
   * Emitted when the transaction is sent to the network and the application
   * is waiting for the transaction to be mined.
   */
  TransactionCreated = "TransactionCreated",
  /**
   * Emitted when the transaction has succeeded is mined and confirmed.
   */
  TransactionConfirmed = "TransactionConfirmed",
  /**
   * Emitted when the transaction has failed to be submitted.
   */
  TransactionDenied = "TransactionDenied",
  /**
   * Emitted when the transaction has failed to be mined.
   */
  TransactionFailed = "TransactionFailed",
  /**
   * Emitted when the {@link OpenSeaSDK.wrapEth} method is called.
   */
  WrapEth = "WrapEth",
  /**
   * Emitted when the {@link OpenSeaSDK.unwrapWeth} method is called.
   */
  UnwrapWeth = "UnwrapWeth",
  /**
   * Emitted when fulfilling a public or private order.
   */
  MatchOrders = "MatchOrders",
  /**
   * Emitted when the {@link OpenSeaSDK.cancelOrder} method is called.
   */
  CancelOrder = "CancelOrder",
  /**
   * Emitted when the {@link OpenSeaSDK.approveOrder} method is called.
   */
  ApproveOrder = "ApproveOrder",
}

/**
 * Data that gets sent with each {@link EventType}
 * @category Events
 */
export interface EventData {
  /**
   * Wallet address of the user who initiated the event.
   */
  accountAddress?: string;
  /**
   * Amount of ETH sent when wrapping or unwrapping.
   */
  amount?: BigNumberish;

  /**
   * The transaction hash of the event.
   */
  transactionHash?: string;
  /**
   * The {@link EventType} of the event.
   */
  event?: EventType;
  /**
   * Error which occured when transaction was denied or failed.
   */
  error?: unknown;

  /**
   * The {@link OrderV2} object.
   */
  orderV2?: OrderV2;
}

/**
 * OpenSea API configuration object
 * @param apiKey Optional key to use for API
 * @param chain `Chain` type to use. Defaults to `Chain.Mainnet` (mainnet)
 * @param apiBaseUrl Optional base URL to use for the API
 */
export interface OpenSeaAPIConfig {
  chain?: Chain;
  apiKey?: string;
  apiBaseUrl?: string;
}

/**
 * Each of the possible chains that OpenSea supports.
 */
export enum Chain {
  // Mainnet Chains
  /** Ethereum */
  Mainnet = "ethereum",
  /** Polygon */
  Polygon = "matic",
  /** Klaytn */
  Klaytn = "klaytn",
  /** Base L2 */
  Base = "base",
  /** Binance Smart Chain */
  BNB = "bsc",
  /** Arbitrum */
  Arbitrum = "arbitrum",
  /** Arbitrum Nova */
  ArbitrumNova = "arbitrum_nova",
  /** Avalanche */
  Avalanche = "avalanche",
  /** Optimism */
  Optimism = "optimism",
  /** Solana */
  Solana = "solana",
  /** Zora */
  Zora = "zora",

  // Testnet Chains
  // ⚠️NOTE: When adding to this list, also add to the util function `isTestChain`
  /** Goerli */
  Goerli = "goerli",
  /** Sepolia */
  Sepolia = "sepolia",
  /** Polygon Testchain Mumbai */
  Mumbai = "mumbai",
  /** Klaytn Baobab */
  Baobab = "baobab",
  /** Base L2 Testnet */
  BaseGoerli = "base_goerli",
  /** Binance Smart Chain Testnet */
  BNBTestnet = "bsctestnet",
  /** Arbitrum Testnet */
  ArbitrumGoerli = "arbitrum_goerli",
  /** Avalanche Fuji Testnet */
  Fuji = "avalanche_fuji",
  /** Optimism Goerli Testnet */
  OptimismGoerli = "optimism_goerli",
  /** Solana Devnet */
  SolanaDevnet = "soldev",
  /** Zora Testnet */
  ZoraTestnet = "zora_testnet",
}

/**
 * Seaport order side: buy or sell.
 */
export enum OrderSide {
  Buy = 0,
  Sell = 1,
}

/**
 * Fee method
 * ProtocolFee: Charge maker fee to seller and charge taker fee to buyer.
 * SplitFee: Maker fees are deducted from the token amount that the maker receives. Taker fees are extra tokens that must be paid by the taker.
 */
export enum FeeMethod {
  ProtocolFee = 0,
  SplitFee = 1,
}

/**
 * Type of sale.
 */
export enum SaleKind {
  FixedPrice = 0,
  DutchAuction = 1,
}

/**
 * Types of asset contracts
 * Given by the asset_contract_type in the OpenSea API
 */
export enum AssetContractType {
  Fungible = "fungible",
  SemiFungible = "semi-fungible",
  NonFungible = "non-fungible",
  Unknown = "unknown",
}

/**
 * Token standards
 */
export enum TokenStandard {
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
}

/**
 * The collection's approval status within OpenSea.
 * Can be not_requested (brand new collections)
 * requested (collections that requested safelisting on our site)
 * approved (collections that are approved on our site and can be found in search results)
 * verified (verified collections)
 */

export enum SafelistStatus {
  NOT_REQUESTED = "not_requested",
  REQUESTED = "requested",
  APPROVED = "approved",
  VERIFIED = "verified",
  DISABLED_TOP_TRENDING = "disabled_top_trending",
}

// Collection fees mapping recipient address to basis points
export interface Fees {
  openseaFees: Map<string, number>;
  sellerFees: Map<string, number>;
}

export interface NFTAsset {
  id: string;
  address: string;
}
export interface FungibleAsset {
  id?: string;
  address: string;
  quantity: string;
}
export type AssetType = NFTAsset | FungibleAsset;

// Abstractions over assets for bundles
export interface Bundle {
  assets: AssetType[];
  standards: TokenStandard[];
  name?: string;
  description?: string;
  external_link?: string;
}

/**
 * The OpenSea account object appended to orders, providing extra metadata, profile images and usernames
 */
export interface OpenSeaAccount {
  // Wallet address for this account
  address: string;
  // Public configuration info, including "affiliate" for users who are in the OpenSea affiliate program
  config: string;

  // This account's profile image - by default, randomly generated by the server
  profileImgUrl: string;

  // More information explicitly set by this account's owner on OpenSea
  user: OpenSeaUser | null;
}

export interface OpenSeaUser {
  // Username for this user
  username?: string;
}

/**
 * Generic Blockchain Asset.
 * @category API Models
 */
export interface Asset {
  /** The asset's token ID, or null if ERC-20 */
  tokenId: string | null;
  /** The asset's contract address */
  tokenAddress: string;
  /** The token standard (e.g. "ERC721") for this asset */
  tokenStandard?: TokenStandard;
  /** Optional for ENS names */
  name?: string;
  /** Optional for fungible items */
  decimals?: number;
}

/**
 * Annotated asset contract with OpenSea metadata
 */
export interface OpenSeaAssetContract extends OpenSeaFees {
  // Name of the asset's contract
  name: string;
  // Address of this contract
  address: string;
  // Type of token (fungible/NFT)
  type: AssetContractType;
  // Token Standard for this contract
  tokenStandard: TokenStandard;

  // Total fee levied on sellers by this contract, in basis points
  sellerFeeBasisPoints: number;
  // Total fee levied on buyers by this contract, in basis points
  buyerFeeBasisPoints: number;

  // Description of the contract
  description: string;
  // Contract's Etherscan / OpenSea symbol
  tokenSymbol: string;
  // Image for the contract
  imageUrl: string;
  // Object with stats about the contract
  stats?: object;
  // Array of trait types for the contract
  traits?: object[];
  // Link to the contract's main website
  externalLink?: string;
  // Link to the contract's wiki, if available
  wikiLink?: string;
}

interface NumericalTraitStats {
  min: number;
  max: number;
}

interface StringTraitStats {
  [key: string]: number;
}
/**
 * Annotated collection stats with OpenSea
 */
export interface OpenSeaCollectionStats {
  // One Minute
  one_minute_volume: number;
  one_minute_change: number;
  one_minute_difference: number;
  one_minute_sales: number;
  one_minute_sales_change: number;
  one_minute_average_price: number;

  // Five Minute
  five_minute_volume: number;
  five_minute_change: number;
  five_minute_difference: number;
  five_minute_sales: number;
  five_minute_sales_change: number;
  five_minute_average_price: number;

  // Fifteen Minute
  fifteen_minute_volume: number;
  fifteen_minute_change: number;
  fifteen_minute_difference: number;
  fifteen_minute_sales: number;
  fifteen_minute_sales_change: number;
  fifteen_minute_average_price: number;

  // Thirty Minute
  thirty_minute_volume: number;
  thirty_minute_change: number;
  thirty_minute_difference: number;
  thirty_minute_sales: number;
  thirty_minute_sales_change: number;
  thirty_minute_average_price: number;

  // One Hour
  one_hour_volume: number;
  one_hour_change: number;
  one_hour_sales: number;
  one_hour_sales_change: number;
  one_hour_average_price: number;
  one_hour_difference: number;

  // Six Hour
  six_hour_volume: number;
  six_hour_change: number;
  six_hour_sales: number;
  six_hour_sales_change: number;
  six_hour_average_price: number;
  six_hour_difference: number;

  // One Day
  one_day_volume: number;
  one_day_change: number;
  one_day_sales: number;
  one_day_sales_change: number;
  one_day_average_price: number;
  one_day_difference: number;

  // Seven Day
  seven_day_volume: number;
  seven_day_change: number;
  seven_day_sales: number;
  seven_day_average_price: number;
  seven_day_difference: number;

  // Thirty Day
  thirty_day_volume: number;
  thirty_day_change: number;
  thirty_day_sales: number;
  thirty_day_average_price: number;
  thirty_day_difference: number;

  // Total
  total_volume: number;
  total_sales: number;
  total_supply: number;
  count: number;
  num_owners: number;
  average_price: number;
  num_reports: number;
  market_cap: number;
  floor_price: number;
}

/**
 * Annotated collection with OpenSea metadata.
 * @category  API Models
 */
export interface OpenSeaCollection extends OpenSeaFees {
  /** Name of the collection */
  name: string;
  /** The identifier of the collection. */
  slug: string;
  /** Accounts allowed to edit this collection */
  editors: string[];
  /** Whether this collection is hidden from the homepage */
  hidden: boolean;
  /** Whether this collection is featured */
  featured: boolean;
  /** Date collection was created */
  createdDate: Date;

  /** Description of the collection */
  description: string;
  /** Image for the collection */
  imageUrl: string;
  /** Image for the collection, large */
  largeImageUrl: string;
  /** Image for the collection when featured */
  featuredImageUrl: string;
  /** Object with stats about the collection */
  stats: OpenSeaCollectionStats;
  /** Data about displaying cards */
  displayData: object;
  /** The collection's approval status */
  safelistRequestStatus: SafelistStatus;
  /** Tokens allowed for this collection */
  paymentTokens: OpenSeaFungibleToken[];
  /** Address for dev fee payouts */
  payoutAddress?: string;
  /** Array of trait types for the collection */
  traitStats: OpenSeaTraitStats;
  /** Link to the collection's main website */
  externalLink?: string;
  /** Link to the collection's wiki, if available */
  wikiLink?: string;
  /** Map of collection fees holding OpenSea and seller fees */
  fees: Fees;
}

export interface OpenSeaTraitStats {
  [traitName: string]: NumericalTraitStats | StringTraitStats;
}

/**
 * Annotated asset spec with OpenSea metadata
 * @category API Models
 */
export interface OpenSeaAsset extends Asset {
  /** The Asset's Contract */
  assetContract: OpenSeaAssetContract;
  /** Collection the asset belongs to */
  collection: OpenSeaCollection;
  /** The asset's given name */
  name: string;
  /** Description of the asset */
  description: string;
  /** Owner of the asset */
  owner: OpenSeaAccount;

  /** Whether the asset is on a pre-sale (so token ids aren't real) */
  isPresale: boolean;
  /** The cached and size-optimized image url for this token */
  imageUrl: string;
  /** The image preview url for this token.
   * Note: Loses gif animation and may have issues with SVGs
   */
  imagePreviewUrl: string;
  /** The original image url for this token */
  imageUrlOriginal: string;
  /** Thumbnail url for this token */
  imageUrlThumbnail: string;
  /** The animation url for this token, if it exists */
  animationUrl: string | null;
  /** The original animation url for this token, if it exists */
  animationUrlOriginal: string | null;
  /** Link to token on OpenSea */
  openseaLink: string;
  /** Link to token on dapp's site */
  externalLink: string;
  /** Array of traits on this token */
  traits: object[];
  /** Number of times this token has been traded (sold) */
  numSales: number;
  /** Data about the last time this token was sold */
  lastSale: AssetEvent | null;
  /** The suggested background color for the image url */
  backgroundColor: string | null;
}

/**
 * Defines a AssetEvent type which contains details about an event that occurred
 */
export interface AssetEvent {
  // The type of event
  eventType: AssetEventType;

  // The timestamp of the transaction (if on-chain) or when the off-chain occurred
  eventTimestamp: Date;

  // The auction type
  auctionType: AuctionType;

  // The total price of the sale in the payment
  totalPrice: string;

  // The transaction associated with the token sale
  transaction: Transaction | null;

  // Details about the token used in the payment for this asset
  paymentToken: OpenSeaFungibleToken | null;
}

/**
 * Defines set of possible auctions types
 */
enum AuctionType {
  Dutch = "dutch",
  English = "english",
  MinPrice = "min_price",
}

/**
 * Defines the possible types of asset events that can take place
 */
enum AssetEventType {
  AuctionCreated = "created",
  AuctionSuccessful = "successful",
  AuctionCancelled = "cancelled",
  OfferEntered = "offer_entered",
  BidEntered = "bid_entered",
  BidWithdraw = "bid_withdraw",
  AssetTransfer = "transfer",
  AssetApprove = "approve",
  CompositionCreated = "composition_created",
  Custom = "custom",
  Payout = "payout",
}

/**
 * Defines a Transaction type.
 */
export interface Transaction {
  // The details about the account that sent the transaction
  fromAccount: OpenSeaAccount;

  // The details about the account that received the transaction
  toAccount: OpenSeaAccount;

  // Date when the transaction was created
  createdDate: Date;

  // Date when the transaction was modified
  modifiedDate: Date;

  // The transaction hash
  transactionHash: string;

  // The index of the transaction within the block
  transactionIndex: string;

  // The number of the block in which this transaction resides
  blockNumber: string;

  // The hash of the block in which this transaction resides
  blockHash: string;

  // The timestamp of the transaction
  timestamp: Date;
}

/**
 * Full annotated Fungible Token spec with OpenSea metadata
 */
export interface OpenSeaFungibleToken {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  imageUrl?: string;
  ethPrice?: string;
  usdPrice?: string;
}

/**
 * Bundles of assets, grouped together into one OpenSea order
 * URLs for bundles are auto-generated from the name.
 * @category API Models
 */
export interface OpenSeaAssetBundle {
  /** The maker of the order. */
  maker: OpenSeaAccount;
  /** List of {@link OpenSeaAsset} included in the bundle. */
  assets: OpenSeaAsset[];
  /** Name of the bundle. */
  name: string;
  /** Slug identifier of the bundle. */
  slug: string;
  /** Permanent Link to the bundle. */
  permalink: string;
  /** Annotated asset contract with OpenSea metadata */
  assetContract?: OpenSeaAssetContract;
  /** Description of the bundle */
  description?: string;
  /** Outbound Link to the bundle. */
  externalLink?: string;
}

interface OpenSeaAssetBundleJSON {
  assets: OpenSeaAsset[];
  name: string;
  description?: string;
  external_link?: string;

  // From API only
  maker?: OpenSeaAccount;
}

/**
 * Query interface for Bundles
 */
export interface OpenSeaAssetBundleQuery
  extends Partial<OpenSeaAssetBundleJSON> {
  asset_contract_address?: string;
  token_ids?: Array<number | string>;
  on_sale?: boolean;
  owner?: string;
  offset?: number;
  limit?: number;
}

/**
 * The basis point values of each type of fee
 */
interface OpenSeaFees {
  /** Fee for OpenSea levied on sellers */
  openseaSellerFeeBasisPoints: number;
  /** Fee for OpenSea levied on buyers */
  openseaBuyerFeeBasisPoints: number;
  /** Fee for the collection owner levied on sellers */
  devSellerFeeBasisPoints: number;
  /** Fee for the collection owner levied on buyers */
  devBuyerFeeBasisPoints: number;
}

/**
 * Fully computed fees including bounties and transfer fees
 */
export interface ComputedFees extends OpenSeaFees {
  // Total fees. dev + opensea
  totalBuyerFeeBasisPoints: number;
  totalSellerFeeBasisPoints: number;
}

interface ExchangeMetadataForAsset {
  asset: AssetType;
  schema: TokenStandard;
  referrerAddress?: string;
}

interface ExchangeMetadataForBundle {
  bundle: Bundle;
  referrerAddress?: string;
}

export type ExchangeMetadata =
  | ExchangeMetadataForAsset
  | ExchangeMetadataForBundle;

export enum HowToCall {
  Call = 0,
  DelegateCall = 1,
  StaticCall = 2,
  Create = 3,
}

export interface UnsignedOrder {
  hash?: string;
  exchange: string;
  maker: string;
  taker: string;
  makerRelayerFee: BigNumber;
  takerRelayerFee: BigNumber;
  makerProtocolFee: BigNumber;
  takerProtocolFee: BigNumber;
  feeRecipient: string;
  target: string;
  calldata: string;
  replacementPattern: string;
  staticTarget: string;
  staticExtradata: string;
  paymentToken: string;
  basePrice: BigNumber;
  extra: BigNumber;
  listingTime: BigNumber;
  expirationTime: BigNumber;
  salt: BigNumber;

  feeMethod: FeeMethod;
  side: OrderSide;
  saleKind: SaleKind;
  howToCall: HowToCall;
  quantity: BigNumber;

  // OpenSea-specific
  makerReferrerFee: BigNumber;
  waitingForBestCounterOrder: boolean;
  englishAuctionReservePrice?: BigNumber;

  metadata: ExchangeMetadata;
}

export interface ECSignature {
  v: number;
  r: string;
  s: string;
}

/**
 * Orders don't need to be signed if they're pre-approved
 * with a transaction on the contract to approveOrder_
 */
export interface Order extends UnsignedOrder, Partial<ECSignature> {
  // Read-only server-side appends
  createdTime?: BigNumber;
  currentPrice?: BigNumber;
  currentBounty?: BigNumber;
  makerAccount?: OpenSeaAccount;
  takerAccount?: OpenSeaAccount;
  paymentTokenContract?: OpenSeaFungibleToken;
  feeRecipientAccount?: OpenSeaAccount;
  cancelledOrFinalized?: boolean;
  markedInvalid?: boolean;
  asset?: OpenSeaAsset;
  assetBundle?: OpenSeaAssetBundle;
  nonce?: number;
}

/**
 * Order attributes, including orderbook-specific query options
 * See https://docs.opensea.io/reference#retrieving-orders for the full
 * list of API query parameters and documentation.
 */
export interface OrderJSON extends Partial<ECSignature> {
  // Base fields
  exchange: string;
  maker: string;
  taker: string;
  makerRelayerFee: string;
  takerRelayerFee: string;
  makerProtocolFee: string;
  takerProtocolFee: string;
  feeRecipient: string;
  feeMethod: number;
  side: number;
  saleKind: number;
  target: string;
  howToCall: number;
  calldata: string;
  replacementPattern: string;
  staticTarget: string;
  staticExtradata: string;
  paymentToken: string;
  basePrice: string;
  extra: string;
  listingTime: number | string;
  expirationTime: number | string;
  salt: string;

  makerReferrerFee: string;
  quantity: string;
  englishAuctionReservePrice: string | undefined;

  // createdTime is undefined when order hasn't been posted yet
  createdTime?: number | string;
  metadata: ExchangeMetadata;

  nonce?: number;
}

/**
 * Query interface for Assets
 */
export interface OpenSeaAssetQuery {
  owner?: string;
  asset_contract_address?: string;
  token_ids?: Array<number | string>;
  order_by?: string;
  order_direction?: string;
  limit?: number;
  offset?: number;
  cursor?: string;
}

/**
 * Query interface for Fungible Assets
 */
export interface OpenSeaFungibleTokenQuery
  extends Partial<OpenSeaFungibleToken> {
  limit?: number;
  offset?: number;
  // Typescript bug requires this duplication
  symbol?: string;
}
