import { WyvernProtocol } from "wyvern-js";
import { EventInputKind } from "./types";
import { AbiType, AnnotatedFunctionABI, HowToCall, Network, WyvernAsset } from "../../types";
export interface LimitedCallSpec {
    target: string;
    calldata: string;
}
export interface CallSpec {
    target: string;
    calldata: string;
    replacementPattern: string;
}
export interface MerkleProof {
    root: string;
    proof: string[];
}
export interface AnnotatedFunctionABIReturning<T> extends AnnotatedFunctionABI {
    assetFromOutputs: (outputs: any) => T;
}
export interface SchemaFunctions<T> {
    transfer: (asset: T) => AnnotatedFunctionABI;
    checkAndTransfer?: (asset: T, validatorAddress: string, proof?: MerkleProof) => AnnotatedFunctionABI;
    ownerOf?: (asset: T) => AnnotatedFunctionABI;
    countOf?: (asset: T) => AnnotatedFunctionABIReturning<number>;
    assetsOfOwnerByIndex: Array<AnnotatedFunctionABIReturning<T | null>>;
    initializeProxy?: (owner: string) => AnnotatedFunctionABI;
}
export interface SchemaField {
    name: string;
    type: string;
    description: string;
    values?: any[];
    readOnly?: boolean;
}
export interface AnnotatedEventInput {
    name: string;
    type: string;
    indexed: boolean;
    kind: EventInputKind;
}
export interface AnnotatedEventABI<T> {
    type: AbiType.Event;
    name: string;
    target: string;
    anonymous: boolean;
    inputs: AnnotatedEventInput[];
    assetFromInputs: (inputs: any, web3: any) => Promise<T>;
}
export interface SchemaEvents<T> {
    transfer: Array<AnnotatedEventABI<T>>;
}
export interface Property {
    key: string;
    kind: string;
    value: any;
}
export interface FormatInfo {
    thumbnail: string;
    title: string;
    description: string;
    url: string;
    properties: Property[];
}
export interface Schema<T> {
    version: number;
    deploymentBlock: number;
    name: string;
    description: string;
    thumbnail: string;
    website: string;
    fields: SchemaField[];
    checkAsset?: (asset: T) => boolean;
    assetFromFields: (fields: any) => T;
    assetToFields?: (asset: T) => any;
    allAssets?: (web3: any) => Promise<T[]>;
    functions: SchemaFunctions<T>;
    events: SchemaEvents<T>;
    formatter: (obj: T, web3: any) => Promise<FormatInfo>;
    hash: (obj: T) => any;
}
export declare const encodeCall: (abi: AnnotatedFunctionABI, parameters: unknown[]) => string;
export type DefaultCallEncoder = (abi: AnnotatedFunctionABI, address: string) => string;
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
export declare const schemas: {
    goerli: Schema<any>[];
    rinkeby: Schema<any>[];
    main: Schema<any>[];
};
