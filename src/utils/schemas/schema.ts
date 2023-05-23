import * as ethABI from "ethereumjs-abi";
import { goerliSchemas } from "./goerli/index";
import { mainSchemas } from "./main/index";
import { EventInputKind } from "./types";
import { AbiType, AnnotatedFunctionABI } from "../../types";

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

export const schemas = {
  goerli: goerliSchemas,
  main: mainSchemas,
};
