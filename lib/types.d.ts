import BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import { Network, HowToCall, SaleKind, ECSignature, Order as WyvernOrder } from 'wyvern-js/lib/types';
export { Network, HowToCall, SaleKind, ECSignature };
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
export declare enum OrderSide {
    Buy = 0,
    Sell = 1
}
export declare enum FeeMethod {
    ProtocolFee = 0,
    SplitFee = 1
}
export interface WyvernAsset {
    id: string;
    address: string;
}
export interface UnhashedOrder extends WyvernOrder {
    feeMethod: FeeMethod;
    side: OrderSide;
    saleKind: SaleKind;
    howToCall: HowToCall;
    metadata: {
        asset: WyvernAsset;
        schema: SchemaName;
    };
}
export interface UnsignedOrder extends UnhashedOrder {
    hash: string;
}
export interface Order extends UnsignedOrder, ECSignature {
    cancelledOrFinalized?: boolean;
    markedInvalid?: boolean;
    currentPrice?: BigNumber;
    asset?: {
        asset: WyvernAsset;
        owner: null | string;
        hash: string;
    };
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
    feeMethod: string;
    side: string;
    saleKind: string;
    target: string;
    howToCall: string;
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
        schema: SchemaName;
    };
    hash?: string;
    v?: number;
    r?: string;
    s?: string;
    owner?: string;
    tokenAddress?: string;
    tokenId?: number | string;
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
