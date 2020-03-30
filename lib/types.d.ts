import BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import { Network, HowToCall, ECSignature, Order as WyvernOrder } from 'wyvern-js/lib/types';
import { Token } from 'wyvern-schemas/dist/types';
export { Network, HowToCall, ECSignature };
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
export declare enum EventType {
    TransactionCreated = "TransactionCreated",
    TransactionConfirmed = "TransactionConfirmed",
    TransactionDenied = "TransactionDenied",
    TransactionFailed = "TransactionFailed",
    InitializeAccount = "InitializeAccount",
    WrapEth = "WrapEth",
    UnwrapWeth = "UnwrapWeth",
    ApproveCurrency = "ApproveCurrency",
    ApproveAsset = "ApproveAsset",
    ApproveAllAssets = "ApproveAllAssets",
    UnapproveCurrency = "UnapproveCurrency",
    MatchOrders = "MatchOrders",
    CancelOrder = "CancelOrder",
    ApproveOrder = "ApproveOrder",
    CreateOrder = "CreateOrder",
    OrderDenied = "OrderDenied",
    TransferAll = "TransferAll",
    TransferOne = "TransferOne",
    WrapAssets = "WrapAssets",
    UnwrapAssets = "UnwrapAssets",
    LiquidateAssets = "LiquidateAssets",
    PurchaseAssets = "PurchaseAssets"
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
    error?: Error;
    order?: Order | UnsignedOrder;
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
    gasPrice?: BigNumber;
}
/**
 * Wyvern order side: buy or sell.
 */
export declare enum OrderSide {
    Buy = 0,
    Sell = 1
}
/**
 * Wyvern fee method
 * ProtocolFee: Charge maker fee to seller and charge taker fee to buyer.
 * SplitFee: Maker fees are deducted from the token amount that the maker receives. Taker fees are extra tokens that must be paid by the taker.
 */
export declare enum FeeMethod {
    ProtocolFee = 0,
    SplitFee = 1
}
/**
 * Wyvern: type of sale. Fixed or Dutch auction
 * Note: not imported from wyvern.js because it uses
 * EnglishAuction as 1 and DutchAuction as 2
 */
export declare enum SaleKind {
    FixedPrice = 0,
    DutchAuction = 1
}
/**
 * Types of asset contracts
 * Given by the asset_contract_type in the OpenSea API
 */
export declare enum AssetContractType {
    Fungible = "fungible",
    SemiFungible = "semi-fungible",
    NonFungible = "non-fungible",
    Unknown = "unknown"
}
export declare enum WyvernSchemaName {
    ERC20 = "ERC20",
    ERC721 = "ERC721",
    ERC1155 = "ERC1155",
    LegacyEnjin = "Enjin",
    ENSShortNameAuction = "ENSShortNameAuction"
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
export declare enum TokenStandardVersion {
    Unsupported = "unsupported",
    Locked = "locked",
    Enjin = "1155-1.0",
    ERC721v1 = "1.0",
    ERC721v2 = "2.0",
    ERC721v3 = "3.0"
}
export declare enum WyvernAssetLocation {
    Account = "account",
    Proxy = "proxy",
    Other = "other"
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
export declare type WyvernAsset = WyvernNFTAsset | WyvernFTAsset;
export interface WyvernBundle {
    assets: WyvernAsset[];
    schemas: WyvernSchemaName[];
    name?: string;
    description?: string;
    external_link?: string;
}
export declare type WyvernAtomicMatchParameters = [string[], BigNumber[], Array<(number | BigNumber)>, string, string, string, string, string, string, Array<(number | BigNumber)>, string[]];
/**
 * The OpenSea account object appended to orders, providing extra metadata, profile images and usernames
 */
export interface OpenSeaAccount {
    address: string;
    config: string;
    profileImgUrl: string;
    user: OpenSeaUser | null;
}
export interface OpenSeaUser {
    username: string;
}
/**
 * Simple, unannotated asset spec
 */
export interface Asset {
    tokenId: string | null;
    tokenAddress: string;
    schemaName?: WyvernSchemaName;
    version?: TokenStandardVersion;
    name?: string;
    decimals?: number;
}
/**
 * Annotated asset contract with OpenSea metadata
 */
export interface OpenSeaAssetContract extends OpenSeaFees {
    name: string;
    address: string;
    type: AssetContractType;
    schemaName: WyvernSchemaName;
    sellerFeeBasisPoints: number;
    buyerFeeBasisPoints: number;
    description: string;
    tokenSymbol: string;
    imageUrl: string;
    stats?: object;
    traits?: object[];
    externalLink?: string;
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
    name: string;
    slug: string;
    editors: string[];
    hidden: boolean;
    featured: boolean;
    createdDate: Date;
    description: string;
    imageUrl: string;
    largeImageUrl: string;
    featuredImageUrl: string;
    stats: object;
    displayData: object;
    paymentTokens: OpenSeaFungibleToken[];
    payoutAddress?: string;
    traitStats: OpenSeaTraitStats;
    externalLink?: string;
    wikiLink?: string;
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
    name: string;
    description: string;
    owner: OpenSeaAccount;
    orders: Order[] | null;
    buyOrders: Order[] | null;
    sellOrders: Order[] | null;
    isPresale: boolean;
    imageUrl: string;
    imagePreviewUrl: string;
    imageUrlOriginal: string;
    imageUrlThumbnail: string;
    openseaLink: string;
    externalLink: string;
    traits: object[];
    numSales: number;
    lastSale: AssetEvent | null;
    backgroundColor: string | null;
    transferFee: BigNumber | string | null;
    transferFeePaymentToken: OpenSeaFungibleToken | null;
}
/**
 * Defines a AssetEvent type which contains details about an event that occurred
 */
export interface AssetEvent {
    eventType: AssetEventType;
    eventTimestamp: Date;
    auctionType: AuctionType;
    totalPrice: string;
    transaction: Transaction | null;
    paymentToken: OpenSeaFungibleToken | null;
}
/**
 * Defines set of possible auctions types
 */
export declare enum AuctionType {
    Dutch = "dutch",
    English = "english",
    MinPrice = "min_price"
}
/**
 * Defines the possible types of asset events that can take place
 */
export declare enum AssetEventType {
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
    Payout = "payout"
}
/**
 * Defines a Transaction type.
 */
export interface Transaction {
    fromAccount: OpenSeaAccount;
    toAccount: OpenSeaAccount;
    createdDate: Date;
    modifiedDate: Date;
    transactionHash: string;
    transactionIndex: string;
    blockNumber: string;
    blockHash: string;
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
export declare type FungibleToken = OpenSeaFungibleToken;
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
    sellOrders: Order[] | null;
    assetContract?: OpenSeaAssetContract;
    description?: string;
    externalLink?: string;
}
export interface OpenSeaAssetBundleJSON {
    assets: OpenSeaAsset[];
    name: string;
    description?: string;
    external_link?: string;
    maker?: OpenSeaAccount;
}
/**
 * Query interface for Bundles
 */
export interface OpenSeaAssetBundleQuery extends Partial<OpenSeaAssetBundleJSON> {
    asset_contract_address?: string;
    token_ids?: Array<number | string>;
    on_sale?: boolean;
    owner?: string;
    offset?: number;
    limit?: number;
    search?: string;
}
/**
 * The basis point values of each type of fee
 */
export interface OpenSeaFees {
    openseaSellerFeeBasisPoints: number;
    openseaBuyerFeeBasisPoints: number;
    devSellerFeeBasisPoints: number;
    devBuyerFeeBasisPoints: number;
}
/**
 * Fully computed fees including bounties and transfer fees
 */
export interface ComputedFees extends OpenSeaFees {
    totalBuyerFeeBasisPoints: number;
    totalSellerFeeBasisPoints: number;
    transferFee: BigNumber;
    transferFeeTokenAddress: string | null;
    sellerBountyBasisPoints: number;
}
export interface ExchangeMetadataForAsset {
    asset: WyvernAsset;
    schema: WyvernSchemaName;
    referrerAddress?: string;
}
export interface ExchangeMetadataForBundle {
    bundle: WyvernBundle;
    referrerAddress?: string;
}
export declare type ExchangeMetadata = ExchangeMetadataForAsset | ExchangeMetadataForBundle;
export interface UnhashedOrder extends WyvernOrder {
    feeMethod: FeeMethod;
    side: OrderSide;
    saleKind: SaleKind;
    howToCall: HowToCall;
    quantity: BigNumber;
    makerReferrerFee: BigNumber;
    waitingForBestCounterOrder: boolean;
    metadata: ExchangeMetadata;
}
export interface UnsignedOrder extends UnhashedOrder {
    hash: string;
}
/**
 * Orders don't need to be signed if they're pre-approved
 * with a transaction on the contract to approveOrder_
 */
export interface Order extends UnsignedOrder, Partial<ECSignature> {
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
}
/**
 * Order attributes, including orderbook-specific query options
 * See https://docs.opensea.io/reference#retrieving-orders for the full
 * list of API query parameters and documentation.
 */
export interface OrderJSON extends Partial<ECSignature> {
    exchange: string;
    maker: string;
    taker: string;
    makerRelayerFee: string;
    takerRelayerFee: string;
    makerProtocolFee: string;
    takerProtocolFee: string;
    makerReferrerFee: string;
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
    quantity: string;
    basePrice: string;
    extra: string;
    createdTime?: number | string;
    listingTime: number | string;
    expirationTime: number | string;
    salt: string;
    metadata: ExchangeMetadata;
    hash: string;
}
/**
 * Query interface for Orders
 * Includes `maker`, `taker` and `side` from above
 * See https://docs.opensea.io/reference#retrieving-orders for
 * full docs.
 */
export interface OrderQuery extends Partial<OrderJSON> {
    owner?: string;
    sale_kind?: SaleKind;
    asset_contract_address?: string;
    payment_token_address?: string;
    is_english?: boolean;
    is_expired?: boolean;
    bundled?: boolean;
    include_invalid?: boolean;
    token_id?: number | string;
    token_ids?: Array<number | string>;
    listed_after?: number | string;
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
    search?: string;
    order_by?: string;
    order_direction?: string;
    limit?: number;
    offset?: number;
}
/**
 * Query interface for Fungible Assets
 */
export interface OpenSeaFungibleTokenQuery extends Partial<OpenSeaFungibleToken> {
    limit?: number;
    offset?: number;
    symbol?: string;
}
export declare type FungibleTokenQuery = OpenSeaFungibleTokenQuery;
export interface OrderbookResponse {
    orders: OrderJSON[];
    count: number;
}
export declare type Web3Callback<T> = (err: Error | null, result: T) => void;
export declare type Web3RPCCallback = Web3Callback<Web3.JSONRPCResponsePayload>;
export declare type TxnCallback = (result: boolean) => void;
/**
 * To simplify typifying ABIs
 */
export interface PartialAbiDefinition {
    type: Web3.AbiType | string;
    name?: string;
    inputs?: object[];
    outputs?: object[];
    payable?: boolean;
    constant?: boolean;
    anonymous?: boolean;
    stateMutability?: Web3.ConstructorStateMutability | string;
}
export declare type PartialReadonlyContractAbi = Array<Readonly<PartialAbiDefinition>>;
