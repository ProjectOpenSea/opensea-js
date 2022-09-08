/* eslint-disable import/no-unused-modules */
import BigNumber from "bignumber.js";
import { AbiItem } from "web3-utils";
import {
  ECSignature,
  HowToCall,
  Network,
  Order as WyvernOrder,
  WyvernProtocolConfig,
} from "wyvern-js/lib/types";
import type { Token } from "wyvern-schemas/dist/types";
import type { OrderV2 } from "./orders/types";

export { HowToCall, Network };
export type { ECSignature };

/**
 * Events emitted by the SDK. There are five types:
 * 1. Transaction events, which tell you when a new transaction was
 *    created, confirmed, denied, or failed.
 * 2. pre-transaction events, which are named (like "WrapEth") and indicate
 *    that Web3 is asking for a signature on a transaction that needs to occur before
 *    an order is made or fulfilled. This includes approval events and account
 *    initialization.
 * 3. Basic actions: matching, cancelling, and creating orders.
 *    The "CreateOrder" event fires when a signature is being prompted
 *    to create an off-chain order. The "OrderDenied" event fires when a signature
 *    request is denied by the user.
 * 4. The "TransferAll" event, which fires when a user is about to directly
 *    transfer one or more assets to another account
 */
export enum EventType {
  // Transactions and signature requests
  TransactionCreated = "TransactionCreated",
  TransactionConfirmed = "TransactionConfirmed",
  TransactionDenied = "TransactionDenied",
  TransactionFailed = "TransactionFailed",

  // Pre-transaction events
  InitializeAccount = "InitializeAccount",
  WrapEth = "WrapEth",
  UnwrapWeth = "UnwrapWeth",
  ApproveCurrency = "ApproveCurrency",
  ApproveAsset = "ApproveAsset",
  ApproveAllAssets = "ApproveAllAssets",
  UnapproveCurrency = "UnapproveCurrency",

  // Basic actions: matching orders, creating orders, and cancelling orders
  MatchOrders = "MatchOrders",
  CancelOrder = "CancelOrder",
  BulkCancelExistingOrders = "BulkCancelExistingOrders",
  ApproveOrder = "ApproveOrder",
  CreateOrder = "CreateOrder",
  // When the signature request for an order is denied
  OrderDenied = "OrderDenied",

  // When transferring one or more assets
  TransferAll = "TransferAll",
  TransferOne = "TransferOne",

  // When wrapping or unwrapping NFTs
  WrapAssets = "WrapAssets",
  UnwrapAssets = "UnwrapAssets",
  LiquidateAssets = "LiquidateAssets",
  PurchaseAssets = "PurchaseAssets",
}

/**
 * Data that gets sent with each EventType
 */
export interface EventData {
  accountAddress?: string;
  toAddress?: string;
  proxyAddress?: string;
  amount?: BigNumber;
  contractAddress?: string;
  assets?: WyvernAsset[];
  asset?: WyvernAsset;

  transactionHash?: string;
  event?: EventType;
  error?: unknown;

  order?: Order | UnsignedOrder;
  orderV2?: OrderV2;
  buy?: Order;
  sell?: Order;
  matchMetadata?: string;
}

/**
 * OpenSea API configuration object
 * @param apiKey Optional key to use for API
 * @param networkName `Network` type to use. Defaults to `Network.Main` (mainnet)
 * @param gasPrice Default gas price to send to the Wyvern Protocol
 * @param apiBaseUrl Optional base URL to use for the API
 */
export interface OpenSeaAPIConfig {
  networkName?: Network;
  apiKey?: string;
  apiBaseUrl?: string;
  useReadOnlyProvider?: boolean;
  // Sent to WyvernJS
  gasPrice?: BigNumber;

  wyvernConfig?: WyvernConfig;
}

export type WyvernConfig = WyvernProtocolConfig & {
  wyvernTokenTransferProxyContractAddress?: string;
};

/**
 * Wyvern order side: buy or sell.
 */
export enum OrderSide {
  Buy = 0,
  Sell = 1,
}

/**
 * Wyvern fee method
 * ProtocolFee: Charge maker fee to seller and charge taker fee to buyer.
 * SplitFee: Maker fees are deducted from the token amount that the maker receives. Taker fees are extra tokens that must be paid by the taker.
 */
export enum FeeMethod {
  ProtocolFee = 0,
  SplitFee = 1,
}

/**
 * Wyvern: type of sale. Fixed or Dutch auction
 * Note: not imported from wyvern.js because it uses
 * EnglishAuction as 1 and DutchAuction as 2
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

// Wyvern Schemas (see https://github.com/ProjectOpenSea/wyvern-schemas)
export enum WyvernSchemaName {
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC721v3 = "ERC721v3",
  ERC1155 = "ERC1155",
  LegacyEnjin = "Enjin",
  ENSShortNameAuction = "ENSShortNameAuction",
  // CryptoPunks = 'CryptoPunks'
}

/**
 * The NFT version that this contract uses.
 * ERC721 versions are:
 * 1.0: CryptoKitties and early 721s, which lack approve-all and
 *      have problems calling `transferFrom` from the owner's account.
 * 2.0: CryptoSaga and others that lack `transferFrom` and have
 *      `takeOwnership` instead
 * 3.0: The current OpenZeppelin standard:
 *      https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC721/ERC721.sol
 * Special cases:
 * locked: When the transfer function has been locked by the dev
 */
export enum TokenStandardVersion {
  Unsupported = "unsupported",
  Locked = "locked",
  Enjin = "1155-1.0",
  ERC721v1 = "1.0",
  ERC721v2 = "2.0",
  ERC721v3 = "3.0",
}

// Collection fees mapping recipient address to basis points
export interface Fees {
  openseaFees: Map<string, number>;
  sellerFees: Map<string, number>;
}

export interface WyvernNFTAsset {
  id: string;
  address: string;
}
export interface WyvernFTAsset {
  id?: string;
  address: string;
  quantity: string;
}
export type WyvernAsset = WyvernNFTAsset | WyvernFTAsset;

// Abstractions over Wyvern assets for bundles
export interface WyvernBundle {
  assets: WyvernAsset[];
  schemas: WyvernSchemaName[];
  name?: string;
  description?: string;
  external_link?: string;
}

export type WyvernAtomicMatchParameters = [
  string[],
  BigNumber[],
  Array<number | BigNumber>,
  string,
  string,
  string,
  string,
  string,
  string,
  Array<number | BigNumber>,
  string[]
];

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
 * Simple, unannotated asset spec
 */
export interface Asset {
  // The asset's token ID, or null if ERC-20
  tokenId: string | null;
  // The asset's contract address
  tokenAddress: string;
  // The Wyvern schema name (e.g. "ERC721") for this asset
  schemaName?: WyvernSchemaName;
  // The token standard version of this asset
  version?: TokenStandardVersion;
  // Optional for ENS names
  name?: string;
  // Optional for fungible items
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
  // Wyvern Schema Name for this contract
  schemaName: WyvernSchemaName;

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
 * Annotated collection with OpenSea metadata
 */
export interface OpenSeaCollection extends OpenSeaFees {
  // Name of the collection
  name: string;
  // Slug, used in URL
  slug: string;
  // Accounts allowed to edit this collection
  editors: string[];
  // Whether this collection is hidden from the homepage
  hidden: boolean;
  // Whether this collection is featured
  featured: boolean;
  // Date collection was created
  createdDate: Date;

  // Description of the collection
  description: string;
  // Image for the collection
  imageUrl: string;
  // Image for the collection, large
  largeImageUrl: string;
  // Image for the collection when featured
  featuredImageUrl: string;
  // Object with stats about the collection
  stats: object;
  // Data about displaying cards
  displayData: object;
  // Tokens allowed for this collection
  paymentTokens: OpenSeaFungibleToken[];
  // Address for dev fee payouts
  payoutAddress?: string;
  // Array of trait types for the collection
  traitStats: OpenSeaTraitStats;
  // Link to the collection's main website
  externalLink?: string;
  // Link to the collection's wiki, if available
  wikiLink?: string;
  // Map of collection fees holding OpenSea and seller fees
  fees?: Fees | null;
}

export interface OpenSeaTraitStats {
  [traitName: string]: NumericalTraitStats | StringTraitStats;
}

/**
 * Annotated asset spec with OpenSea metadata
 */
export interface OpenSeaAsset extends Asset {
  assetContract: OpenSeaAssetContract;
  collection: OpenSeaCollection;
  // The asset's given name
  name: string;
  // Description of the asset
  description: string;
  // Owner of the asset
  owner: OpenSeaAccount;
  // Orders on the asset. Null if asset was fetched in a list
  orders: Order[] | null;
  // Buy orders (offers) on the asset. Null if asset in a list and didn't prefetch buy orders
  buyOrders: Order[] | null;
  // Sell orders (auctions) on the asset. Null if asset in a list and didn't prefetch sell orders
  sellOrders: Order[] | null;

  // Whether the asset is on a pre-sale (so token ids aren't real)
  isPresale: boolean;
  // The cached and size-optimized image url for this token
  imageUrl: string;
  // The image preview url for this token.
  // Note: Loses gif animation and may have issues with SVGs
  imagePreviewUrl: string;
  // The original image url for this token
  imageUrlOriginal: string;
  // Thumbnail url for this token
  imageUrlThumbnail: string;
  // Link to token on OpenSea
  openseaLink: string;
  // Link to token on dapp's site
  externalLink: string;
  // Array of traits on this token
  traits: object[];
  // Number of times this token has been traded (sold)
  numSales: number;
  // Data about the last time this token was sold
  lastSale: AssetEvent | null;
  // The suggested background color for the image url
  backgroundColor: string | null;
  // The per-transfer fee, in base units, for this asset in its transfer method
  transferFee: BigNumber | string | null;
  // The transfer fee token for this asset in its transfer method
  transferFeePaymentToken: OpenSeaFungibleToken | null;
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
export interface OpenSeaFungibleToken extends Token {
  imageUrl?: string;
  ethPrice?: string;
  usdPrice?: string;
}

/**
 * Bundles of assets, grouped together into one OpenSea order
 * URLs for bundles are auto-generated from the name
 */
export interface OpenSeaAssetBundle {
  maker: OpenSeaAccount;
  assets: OpenSeaAsset[];
  name: string;
  slug: string;
  permalink: string;

  // Sell orders (auctions) on the bundle. Null if bundle in a list and didn't prefetch sell orders
  sellOrders: Order[] | null;

  assetContract?: OpenSeaAssetContract;
  description?: string;
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
  // Fee for OpenSea levied on sellers
  openseaSellerFeeBasisPoints: number;
  // Fee for OpenSea levied on buyers
  openseaBuyerFeeBasisPoints: number;
  // Fee for the collection owner levied on sellers
  devSellerFeeBasisPoints: number;
  // Fee for the collection owner levied on buyers
  devBuyerFeeBasisPoints: number;
}

/**
 * Fully computed fees including bounties and transfer fees
 */
export interface ComputedFees extends OpenSeaFees {
  // Total fees. dev + opensea
  totalBuyerFeeBasisPoints: number;
  totalSellerFeeBasisPoints: number;

  // Fees that the item's creator takes on every transfer
  transferFee: BigNumber;
  transferFeeTokenAddress: string | null;

  // Fees that go to whoever refers the order to the taker.
  // Comes out of OpenSea fees
  sellerBountyBasisPoints: number;
}

interface ExchangeMetadataForAsset {
  asset: WyvernAsset;
  schema: WyvernSchemaName;
  referrerAddress?: string;
}

interface ExchangeMetadataForBundle {
  bundle: WyvernBundle;
  referrerAddress?: string;
}

export type ExchangeMetadata =
  | ExchangeMetadataForAsset
  | ExchangeMetadataForBundle;

export interface UnhashedOrder extends WyvernOrder {
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

export interface UnsignedOrder extends UnhashedOrder {
  hash?: string;
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
  // Base wyvern fields
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

export type RawWyvernOrderJSON = Omit<
  OrderJSON,
  | "makerReferrerFee"
  | "quantity"
  | "englishAuctionReservePrice"
  | "createdTime"
  | "metadata"
  | "hash"
  | "v"
  | "r"
  | "s"
>;

/**
 * Query interface for Orders
 * Includes `maker`, `taker` and `side` from above
 * See https://docs.opensea.io/reference#retrieving-orders for
 * full docs.
 */
export interface OrderQuery extends Partial<OrderJSON> {
  owner?: string;
  sale_kind?: SaleKind;
  side?: OrderSide;
  asset_contract_address?: string;
  payment_token_address?: string;
  is_english?: boolean;
  is_expired?: boolean;
  bundled?: boolean;
  include_invalid?: boolean;
  token_id?: number | string;
  token_ids?: Array<number | string>;
  // This means listing_time > value in seconds
  listed_after?: number | string;
  // This means listing_time <= value in seconds
  listed_before?: number | string;
  limit?: number;
  offset?: number;
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

export interface OrderbookResponse {
  orders: OrderJSON[];
  count: number;
}

// Types related to Web3
export type Web3Callback<T> = (err: Error | null, result: T) => void;
export type TxnCallback = (result: boolean) => void;

export type PartialReadonlyContractAbi = AbiItem[];
