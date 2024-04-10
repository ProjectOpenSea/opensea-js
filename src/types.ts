import { BigNumberish } from "ethers";
import type { OrderV2 } from "./orders/types";

/**
 * Events emitted by the SDK which can be used by frontend applications
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
  /**
   * Emitted when the {@link OpenSeaSDK.transfer} method is called.
   */
  Transfer = "Transfer",
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
   * Error which occurred when transaction was denied or failed.
   */
  error?: unknown;
  /**
   * The {@link OrderV2} object.
   */
  orderV2?: OrderV2;
}

/**
 * OpenSea API configuration object
 * @param chain `Chain` to use. Defaults to Ethereum Mainnet (`Chain.Mainnet`)
 * @param apiKey API key to use. Not required for testnets
 * @param apiBaseUrl Optional base URL to use for the API
 */
export interface OpenSeaAPIConfig {
  chain?: Chain;
  apiKey?: string;
  apiBaseUrl?: string;
}

/**
 * Each of the possible chains that OpenSea supports.
 * ⚠️NOTE: When adding to this list, also add to the util function `getWETHAddress`
 */
export enum Chain {
  // Mainnet Chains
  /** Ethereum */
  Mainnet = "ethereum",
  /** Polygon */
  Polygon = "matic",
  /** Klaytn */
  Klaytn = "klaytn",
  /** Base */
  Base = "base",
  /** Blast */
  Blast = "blast",
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
  /** Sepolia */
  Sepolia = "sepolia",
  /** Polygon Amoy */
  Amoy = "amoy",
  /** Klaytn Baobab */
  Baobab = "baobab",
  /** Base Testnet */
  BaseSepolia = "base_sepolia",
  /** Blast Testnet */
  BlastSepolia = "blast_sepolia",
  /** Binance Smart Chain Testnet */
  BNBTestnet = "bsctestnet",
  /** Arbitrum Sepolia */
  ArbitrumSepolia = "arbitrum_sepolia",
  /** Avalanche Fuji */
  Fuji = "avalanche_fuji",
  /** Optimism Sepolia */
  OptimismSepolia = "optimism_sepolia",
  /** Solana Devnet */
  SolanaDevnet = "soldev",
  /** Zora Sepolia */
  ZoraSepolia = "zora_sepolia",
}

/**
 * Order side: ask (sell, listing) or bid (buy, offer)
 */
export enum OrderSide {
  ASK = "ask",
  BID = "bid",
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
 * Can be one of:
 * - not_requested: brand new collections
 * - requested: collections that requested safelisting on our site
 * - approved: collections that are approved on our site and can be found in search results
 * - verified: verified collections
 */
export enum SafelistStatus {
  NOT_REQUESTED = "not_requested",
  REQUESTED = "requested",
  APPROVED = "approved",
  VERIFIED = "verified",
  DISABLED_TOP_TRENDING = "disabled_top_trending",
}

/**
 * Collection fees
 * @category API Models
 */
export interface Fee {
  fee: number;
  recipient: string;
  required: boolean;
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
 * Generic Blockchain Asset, with tokenId required.
 * @category API Models
 */
export interface AssetWithTokenId extends Asset {
  /** The asset's token ID */
  tokenId: string;
}

/**
 * Generic Blockchain Asset, with tokenStandard required.
 * @category API Models
 */
export interface AssetWithTokenStandard extends Asset {
  /** The token standard (e.g. "ERC721") for this asset */
  tokenStandard: TokenStandard;
}

interface OpenSeaCollectionStatsIntervalData {
  interval: "one_day" | "seven_day" | "thirty_day";
  volume: number;
  volume_diff: number;
  volume_change: number;
  sales: number;
  sales_diff: number;
  average_price: number;
}

/**
 * OpenSea Collection Stats
 * @category API Models
 */
export interface OpenSeaCollectionStats {
  total: {
    volume: number;
    sales: number;
    average_price: number;
    num_owners: number;
    market_cap: number;
    floor_price: number;
    floor_price_symbol: string;
  };
  intervals: OpenSeaCollectionStatsIntervalData[];
}

export interface RarityStrategy {
  strategyId: string;
  strategyVersion: string;
  calculatedAt: string;
  maxRank: number;
  tokensScored: number;
}

/**
 * OpenSea collection metadata.
 * @category API Models
 */
export interface OpenSeaCollection {
  /** Name of the collection */
  name: string;
  /** The identifier (slug) of the collection */
  collection: string;
  /** Description of the collection */
  description: string;
  /** Image for the collection */
  imageUrl: string;
  /** Banner image for the collection */
  bannerImageUrl: string;
  /** Owner address of the collection */
  owner: string;
  /** The collection's safelist status */
  safelistStatus: SafelistStatus;
  /** The category of the collection */
  category: string;
  /** If the collection is disabled */
  isDisabled: boolean;
  /** If the collection is NSFW (not safe for work) */
  isNSFW: boolean;
  /** If trait offers are enabled */
  traitOffersEnabled: boolean;
  /** If collection offers are enabled */
  collectionOffersEnabled: boolean;
  /** The OpenSea url for the collection */
  openseaUrl: string;
  /** The project url for the collection */
  projectUrl: string;
  /** The wiki url for the collection */
  wikiUrl: string;
  /** The discord url for the collection */
  discordUrl: string;
  /** The telegram url for the collection */
  telegramUrl: string;
  /** The twitter username for the collection */
  twitterUsername: string;
  /** The instagram username for the collection */
  instagramUsername: string;
  /** The contracts for the collection */
  contracts: { address: string; chain: Chain }[];
  /** Accounts allowed to edit this collection */
  editors: string[];
  /** The fees for the collection */
  fees: Fee[];
  /** The rarity strategy for the collection */
  rarity: RarityStrategy | null;
  /** Payment tokens allowed for orders for this collection */
  paymentTokens: OpenSeaPaymentToken[];
  /** The total supply of the collection (minted minus burned) */
  totalSupply: number;
  /** The created date of the collection */
  createdDate: string;
  /** When defined, the zone required for orders for the collection */
  requiredZone?: string;
}

/**
 * Full annotated Fungible Token spec with OpenSea metadata
 */
export interface OpenSeaPaymentToken {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  chain: Chain;
  imageUrl?: string;
  ethPrice?: string;
  usdPrice?: string;
}

/**
 * Query interface for payment tokens
 * @category API Models
 */
export interface OpenSeaPaymentTokensQuery {
  symbol?: string;
  address?: string;
  limit?: number;
  next?: string;
}

/**
 * OpenSea Account
 * @category API Models
 */
export interface OpenSeaAccount {
  address: string;
  username: string;
  profileImageUrl: string;
  bannerImageUrl: string;
  website: string;
  socialMediaAccounts: SocialMediaAccount[];
  bio: string;
  joinedDate: string;
}
/**
 * Social media account
 * @category API Models
 */
export interface SocialMediaAccount {
  platform: string;
  username: string;
}
