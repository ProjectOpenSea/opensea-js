import { WyvernProtocol } from "wyvern-js";
import { HowToCall, ReplacementEncoder, Network } from "wyvern-js/lib/types";
import { AnnotatedFunctionABI, Schema } from "wyvern-schemas/dist/types";
export { AbiType } from "wyvern-schemas";
import { WyvernAsset } from "../types";
export interface LimitedCallSpec {
    target: string;
    calldata: string;
}
export interface CallSpec {
    target: string;
    calldata: string;
    replacementPattern: string;
}
export declare const encodeReplacementPattern: ReplacementEncoder;
export declare type Encoder = (schema: Schema<WyvernAsset>, asset: WyvernAsset, address: string) => CallSpec;
export declare const encodeCall: (abi: AnnotatedFunctionABI, parameters: unknown[]) => string;
export declare const encodeSell: Encoder;
export declare type AtomicizedSellEncoder = (schemas: Array<Schema<WyvernAsset>>, assets: WyvernAsset[], address: string, wyvernProtocol: WyvernProtocol, networkName: Network) => CallSpec;
export declare const encodeAtomicizedSell: AtomicizedSellEncoder;
export declare type AtomicizedBuyEncoder = (schemas: Array<Schema<WyvernAsset>>, assets: WyvernAsset[], address: string, wyvernProtocol: WyvernProtocol, networkName: Network) => CallSpec;
export declare const encodeAtomicizedBuy: AtomicizedBuyEncoder;
export declare const encodeBuy: Encoder;
export declare type DefaultCallEncoder = (abi: AnnotatedFunctionABI, address: string) => string;
export declare const encodeDefaultCall: DefaultCallEncoder;
/**
 * Encode the atomicized transfer of many assets
 * @param schema Wyvern Schema for the assets
 * @param assets List of assets to transfer
 * @param from Current address owning the assets
 * @param to Destination address
 * @param atomicizer Wyvern Atomicizer instance
 */
export declare function encodeAtomicizedTransfer(schemas: Array<Schema<WyvernAsset>>, assets: WyvernAsset[], from: string, to: string, wyvernProtocol: WyvernProtocol, networkName: Network): LimitedCallSpec;
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
