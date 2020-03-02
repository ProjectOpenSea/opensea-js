import { HowToCall } from 'wyvern-js/lib/types';
import { WyvernAtomicizerContract } from 'wyvern-js/lib/abi_gen/wyvern_atomicizer';
import { AnnotatedFunctionABI, FunctionInputKind, Schema } from 'wyvern-schemas/dist/types';
export { AbiType } from 'wyvern-schemas';
import { WyvernAsset } from '../types';
export interface LimitedCallSpec {
    target: string;
    calldata: string;
}
export interface CallSpec {
    target: string;
    calldata: string;
    replacementPattern: string;
}
export declare const encodeReplacementPattern: import("../../../../../../../../../Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types").ReplacementEncoder;
export declare type SellEncoder<T> = (schema: Schema<T>, asset: T, address: string) => CallSpec;
export declare const encodeCall: (abi: AnnotatedFunctionABI, parameters: any[]) => string;
export declare const encodeSell: SellEncoder<any>;
export declare type AtomicizedSellEncoder<T> = (schema: Schema<T>, assets: T[], address: string, atomicizer: WyvernAtomicizerContract) => Partial<CallSpec>;
export declare const encodeAtomicizedSell: AtomicizedSellEncoder<any>;
export declare type AtomicizedBuyEncoder<T> = (schema: Schema<T>, assets: T[], address: string, atomicizer: WyvernAtomicizerContract) => Partial<CallSpec>;
export declare const encodeAtomicizedBuy: AtomicizedBuyEncoder<any>;
export declare type BuyEncoder<T> = (schema: Schema<T>, asset: T, address: string) => CallSpec;
export declare const encodeBuy: BuyEncoder<any>;
export declare type DefaultCallEncoder = (abi: AnnotatedFunctionABI, address: string) => string;
export declare const encodeDefaultCall: DefaultCallEncoder;
export declare type ReplacementEncoder = (abi: AnnotatedFunctionABI, kind?: FunctionInputKind) => string;
/**
 * Encode the atomicized transfer of many assets
 * @param schema Wyvern Schema for the assets
 * @param assets List of assets to transfer
 * @param from Current address owning the assets
 * @param to Destination address
 * @param atomicizer Wyvern Atomicizer instance
 */
export declare function encodeAtomicizedTransfer(schema: Schema<any>, assets: WyvernAsset[], from: string, to: string, atomicizer: WyvernAtomicizerContract): {
    calldata: string;
};
/**
 * Encode a transfer call for a Wyvern schema function
 * @param transferAbi Annotated Wyvern ABI
 * @param from From address
 * @param to To address
 */
export declare function encodeTransferCall(transferAbi: AnnotatedFunctionABI, from: string, to: string): string;
/**
 * Encode a call to a user's proxy contract
 * @param address The address for the proxy to call
 * @param howToCall How to call the addres
 * @param calldata The data to use in the call
 * @param shouldAssert Whether to assert success in the proxy call
 */
export declare function encodeProxyCall(address: string, howToCall: HowToCall, calldata: string, shouldAssert?: boolean): string;
