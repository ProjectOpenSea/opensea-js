import BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import { Network, HowToCall, SaleKind, Order as WyvernOrder } from '../node_modules/wyvern-js/lib/types';
export { Network, HowToCall, SaleKind, };
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
export interface ECSignature {
    v: number;
    r: string;
    s: string;
}
export interface WyvernAsset {
    id: string;
    address: string;
}
export interface Order extends WyvernOrder {
    feeMethod: FeeMethod;
    side: OrderSide;
    saleKind: SaleKind;
    howToCall: HowToCall;
    hash: string;
    metadata: {
        asset: WyvernAsset;
        schema: string;
    };
    v: number;
    r: string;
    s: string;
    cancelledOrFinalized?: boolean;
    markedInvalid?: boolean;
    currentPrice?: BigNumber;
}
export declare type UnsignedOrder = Pick<Order, Exclude<keyof Order, keyof ECSignature>>;
export declare type UnhashedOrder = Pick<UnsignedOrder, Exclude<keyof UnsignedOrder, "hash">>;
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
    hash: string;
    metadata: {
        asset: WyvernAsset;
        schema: string;
    };
    v: number;
    r: string;
    s: string;
}
