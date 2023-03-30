import { BigNumber } from "bignumber.js";
import * as ethABI from "ethereumjs-abi";
import { WyvernProtocol } from "wyvern-js";
import { goerliSchemas } from "./goerli/index";
import { mainSchemas } from "./main/index";
import { rinkebySchemas } from "./rinkeby/index";
import { EventInputKind } from "./types";
import { proxyABI, proxyAssertABI } from "../../abi/Proxy";
import {
  AbiType,
  AnnotatedFunctionABI,
  FunctionInputKind,
  HowToCall,
  Network,
  WyvernAsset,
} from "../../types";

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
  assetFromOutputs: (outputs: any) => T; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface SchemaFunctions<T> {
  transfer: (asset: T) => AnnotatedFunctionABI;
  checkAndTransfer?: (
    asset: T,
    validatorAddress: string,
    proof?: MerkleProof
  ) => AnnotatedFunctionABI;
  ownerOf?: (asset: T) => AnnotatedFunctionABI;
  countOf?: (asset: T) => AnnotatedFunctionABIReturning<number>;
  assetsOfOwnerByIndex: Array<AnnotatedFunctionABIReturning<T | null>>;
  initializeProxy?: (owner: string) => AnnotatedFunctionABI;
}

export interface SchemaField {
  name: string;
  type: string;
  description: string;
  values?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
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
  assetFromInputs: (inputs: any, web3: any) => Promise<T>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface SchemaEvents<T> {
  transfer: Array<AnnotatedEventABI<T>>;
}

export interface Property {
  key: string;
  kind: string;
  value: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface FormatInfo {
  thumbnail: string;
  title: string;
  description: string;
  url: string;
  properties: Property[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
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
/* eslint-enable @typescript-eslint/no-explicit-any */

export const encodeCall = (
  abi: AnnotatedFunctionABI,
  parameters: unknown[]
): string => {
  const inputTypes = abi.inputs.map((i) => i.type);
  return (
    "0x" +
    Buffer.concat([
      ethABI.methodID(abi.name, inputTypes),
      ethABI.rawEncode(inputTypes, parameters),
    ]).toString("hex")
  );
};

export type DefaultCallEncoder = (
  abi: AnnotatedFunctionABI,
  address: string
) => string;

export const encodeDefaultCall: DefaultCallEncoder = (abi, address) => {
  const parameters = abi.inputs.map((input) => {
    switch (input.kind) {
      case FunctionInputKind.Replaceable:
        return WyvernProtocol.generateDefaultValue(input.type);
      case FunctionInputKind.Owner:
        return address;
      case FunctionInputKind.Asset:
      default:
        return input.value;
    }
  });
  return encodeCall(abi, parameters);
};

/**
 * Encode the atomicized transfer of many assets
 * @param schema Wyvern Schema for the assets
 * @param assets List of assets to transfer
 * @param from Current address owning the assets
 * @param to Destination address
 * @param atomicizer Wyvern Atomicizer instance
 */
export function encodeAtomicizedTransfer(
  schemas: Array<Schema<WyvernAsset>>,
  assets: WyvernAsset[],
  from: string,
  to: string,
  wyvernProtocol: WyvernProtocol,
  networkName: Network
): LimitedCallSpec {
  const atomicizer = wyvernProtocol.wyvernAtomicizer;

  const transactions = assets.map((asset: WyvernAsset, i) => {
    const schema = schemas[i];
    const transfer = schema.functions.transfer(asset);
    const calldata = encodeTransferCall(transfer, from, to);
    return {
      calldata,
      address: transfer.target,
      value: new BigNumber(0),
    };
  });

  const atomicizedCalldata = atomicizer
    .atomicize(
      transactions.map((t) => t.address),
      transactions.map((t) => t.value),
      transactions.map((t) => new BigNumber((t.calldata.length - 2) / 2)), // subtract 2 for '0x', divide by 2 for hex
      transactions
        .map((t) => t.calldata)
        .reduce((x: string, current: string) => x + current.slice(2), "0x") // cut off the '0x'
    )
    .getABIEncodedTransactionData();

  return {
    calldata: atomicizedCalldata,
    target: WyvernProtocol.getAtomicizerContractAddress(networkName),
  };
}

/**
 * Encode a transfer call for a Wyvern schema function
 * @param transferAbi Annotated Wyvern ABI
 * @param from From address
 * @param to To address
 */
export function encodeTransferCall(
  transferAbi: AnnotatedFunctionABI,
  from: string,
  to: string
) {
  const parameters = transferAbi.inputs.map((input) => {
    switch (input.kind) {
      case FunctionInputKind.Replaceable:
        return to;
      case FunctionInputKind.Owner:
        return from;
      case FunctionInputKind.Asset:
      default:
        if (input.value == null) {
          throw new Error(`Unsupported function input kind: ${input.kind}`);
        }
        return input.value;
    }
  });
  return encodeCall(transferAbi, parameters);
}

/**
 * Encode a call to a user's proxy contract
 * @param address The address for the proxy to call
 * @param howToCall How to call the addres
 * @param calldata The data to use in the call
 * @param shouldAssert Whether to assert success in the proxy call
 */
export function encodeProxyCall(
  address: string,
  howToCall: HowToCall,
  calldata: string,
  shouldAssert = true
) {
  const abi = shouldAssert ? proxyAssertABI : proxyABI;
  return encodeCall(abi as AnnotatedFunctionABI, [
    address,
    howToCall,
    Buffer.from(calldata.slice(2), "hex"),
  ]);
}

export const schemas = {
  goerli: goerliSchemas,
  rinkeby: rinkebySchemas,
  main: mainSchemas,
};
