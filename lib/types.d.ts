import BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import { Network, HowToCall, SaleKind, ECSignature, Order as WyvernOrder } from 'wyvern-js/lib/types';
export { Network, HowToCall, SaleKind, ECSignature };
/**
 * Events emitted by the SDK. There are two types:
 * 1. transaction events, which tell you when a new transaction was
 *    created, confirmed, or failed
 * 2. pre-transaction events, which are named (like "WrapEth") and indicate
 *    that Web3 is asking for a signature on a transaction
 */
export declare enum EventType {
    TransactionCreated = "TransactionCreated",
    TransactionConfirmed = "TransactionConfirmed",
    TransactionFailed = "TransactionFailed",
    InitializeAccount = "InitializeAccount",
    WrapEth = "WrapEth",
    UnwrapWeth = "UnwrapWeth",
    ApproveCurrency = "ApproveCurrency",
    ApproveAsset = "ApproveAsset",
    ApproveAllAssets = "ApproveAllAssets",
    MatchOrders = "MatchOrders",
    CancelOrder = "CancelOrder"
}
/**
 * Data that gets sent with each EventType
 */
export interface EventData {
    accountAddress?: string;
    proxyAddress?: string;
    amount?: BigNumber;
    tokenAddress?: string;
    tokenId?: string;
    transactionHash?: string;
    event?: EventType;
    error?: Error;
    order?: Order;
    buy?: Order;
    sell?: Order;
}
export interface OpenSeaAPIConfig {
    networkName?: Network;
    apiKey?: string;
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
 */
export declare enum FeeMethod {
    ProtocolFee = 0,
    SplitFee = 1
}
export declare enum WyvernSchemaName {
    ERC721 = "ERC721"
}
export interface WyvernAsset {
    id: string;
    address: string;
}
/**
 * The OpenSea account object appended to orders, providing extra metadata, profile images and usernames
 */
export interface OpenSeaAccount {
    address: string;
    config: string;
    profile_img_url: string;
    user: null | {
        username: string;
    };
}
/**
 * The OpenSea asset fetched by the API
 */
export interface OpenSeaAsset {
    assetContract: {
        name: string;
        address: OpenSeaAccount;
        sellerFeeBasisPoints: number;
        buyerFeeBasisPoints: number;
    };
    name: string;
    tokenId: string;
    owner: OpenSeaAccount;
    orders: Order[] | null;
    buyOrders: Order[] | null;
    sellOrders: Order[] | null;
}
export interface UnhashedOrder extends WyvernOrder {
    feeMethod: FeeMethod;
    side: OrderSide;
    saleKind: SaleKind;
    howToCall: HowToCall;
    metadata: {
        asset: WyvernAsset;
        schema: WyvernSchemaName;
    };
}
export interface UnsignedOrder extends UnhashedOrder {
    hash: string;
}
export interface Order extends UnsignedOrder, ECSignature {
    makerAccount?: OpenSeaAccount;
    takerAccount?: OpenSeaAccount;
    feeRecipientAccount?: OpenSeaAccount;
    cancelledOrFinalized?: boolean;
    markedInvalid?: boolean;
    currentPrice?: BigNumber;
    asset?: OpenSeaAsset;
}
export interface OrderJSON {
    exchange: string;
    maker: string;
    taker: string;
    makerRelayerFee: string;
    takerRelayerFee: string;
    makerProtocolFee: string;
    takerProtocolFee: string;
    feeRecipient: string;
    feeMethod: FeeMethod;
    side: OrderSide;
    saleKind: SaleKind;
    target: string;
    howToCall: HowToCall;
    calldata: string;
    replacementPattern: string;
    staticTarget: string;
    staticExtradata: string;
    paymentToken: string;
    basePrice: string;
    extra: string;
    listingTime: string;
    expirationTime: string;
    salt: string;
    metadata: {
        asset: WyvernAsset;
        schema: WyvernSchemaName;
    };
    hash: string;
    v: number;
    r: string;
    s: string;
    owner?: string;
    asset_contract_address?: string;
    token_id?: number | string;
    limit?: number;
    offset?: number;
}
export interface OpenSeaAssetJSON {
    owner?: string;
    asset_contract_address?: string;
    order_by?: string;
    order_direction?: string;
    limit?: number;
    offset?: number;
}
export interface OrderbookResponse {
    orders: OrderJSON[];
    count: number;
}
/**
 * Types related to Web3
 */
export declare type Web3Callback<T> = (err: Error | null, result: T) => void;
export declare type Web3RPCCallback = Web3Callback<Web3.JSONRPCResponsePayload>;
export declare type TxnCallback = (result: boolean) => void;
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
