import { BigNumber } from "bignumber.js";
import * as ethABI from "ethereumjs-abi";
import { WyvernProtocol } from "wyvern-js";
import { WyvernAtomicizerContract } from "wyvern-js/lib/abi_gen/wyvern_atomicizer";
import { HowToCall, Network, ReplacementEncoder } from "wyvern-js/lib/types";
import {
  AnnotatedFunctionABI,
  FunctionInputKind,
  Schema,
} from "wyvern-schemas/dist/types";
import { proxyABI, proxyAssertABI } from "../abi/Proxy";
import { OrderSide, WyvernAsset } from "../types";
export { AbiType } from "wyvern-schemas";

export interface LimitedCallSpec {
  target: string;
  calldata: string;
}

export interface CallSpec {
  target: string;
  calldata: string;
  replacementPattern: string;
}

export const encodeReplacementPattern: ReplacementEncoder =
  WyvernProtocol.encodeReplacementPattern;

export type Encoder = (
  schema: Schema<WyvernAsset>,
  asset: WyvernAsset,
  address: string,
  validatorAddress?: string
) => CallSpec;

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

export const encodeSell: Encoder = (
  schema,
  asset,
  address,
  validatorAddress?: string
) => {
  const transfer =
    validatorAddress && schema.functions.checkAndTransfer
      ? schema.functions.checkAndTransfer(asset, validatorAddress)
      : schema.functions.transfer(asset);
  return {
    target: transfer.target,
    calldata: encodeDefaultCall(transfer, address),
    replacementPattern: encodeReplacementPattern(transfer),
  };
};

export type AtomicizedSellEncoder = (
  schemas: Array<Schema<WyvernAsset>>,
  assets: WyvernAsset[],
  address: string,
  wyvernProtocol: WyvernProtocol,
  networkName: Network
) => CallSpec;

export const encodeAtomicizedSell: AtomicizedSellEncoder = (
  schemas,
  assets,
  address,
  wyvernProtocol,
  networkName
) => {
  const atomicizer = wyvernProtocol.wyvernAtomicizer;

  const { atomicizedCalldata, atomicizedReplacementPattern } =
    encodeAtomicizedCalldata(
      atomicizer,
      schemas,
      assets,
      address,
      OrderSide.Sell
    );

  return {
    calldata: atomicizedCalldata,
    replacementPattern: atomicizedReplacementPattern,
    target: WyvernProtocol.getAtomicizerContractAddress(networkName),
  };
};

export type AtomicizedBuyEncoder = (
  schemas: Array<Schema<WyvernAsset>>,
  assets: WyvernAsset[],
  address: string,
  wyvernProtocol: WyvernProtocol,
  networkName: Network
) => CallSpec;

export const encodeAtomicizedBuy: AtomicizedBuyEncoder = (
  schemas,
  assets,
  address,
  wyvernProtocol,
  networkName
) => {
  const atomicizer = wyvernProtocol.wyvernAtomicizer;

  const { atomicizedCalldata, atomicizedReplacementPattern } =
    encodeAtomicizedCalldata(
      atomicizer,
      schemas,
      assets,
      address,
      OrderSide.Buy
    );

  return {
    calldata: atomicizedCalldata,
    replacementPattern: atomicizedReplacementPattern,
    target: WyvernProtocol.getAtomicizerContractAddress(networkName),
  };
};

export const encodeBuy: Encoder = (
  schema,
  asset,
  address,
  validatorAddress?: string
) => {
  const transfer =
    validatorAddress && schema.functions.checkAndTransfer
      ? schema.functions.checkAndTransfer(asset, validatorAddress)
      : schema.functions.transfer(asset);
  const replaceables = transfer.inputs.filter(
    (i) => i.kind === FunctionInputKind.Replaceable
  );
  const ownerInputs = transfer.inputs.filter(
    (i) => i.kind === FunctionInputKind.Owner
  );

  // Validate
  if (replaceables.length !== 1) {
    throw new Error(
      "Only 1 input can match transfer destination, but instead " +
        replaceables.length +
        " did"
    );
  }

  // Compute calldata
  const parameters = transfer.inputs.map((input) => {
    switch (input.kind) {
      case FunctionInputKind.Replaceable:
        return address;
      case FunctionInputKind.Owner:
        return WyvernProtocol.generateDefaultValue(input.type);
      default:
        try {
          return input.value.toString();
        } catch (e) {
          console.error(schema);
          console.error(asset);
          throw e;
        }
    }
  });
  const calldata = encodeCall(transfer, parameters);

  // Compute replacement pattern
  let replacementPattern = "0x";
  if (ownerInputs.length > 0) {
    replacementPattern = encodeReplacementPattern(
      transfer,
      FunctionInputKind.Owner
    );
  }

  return {
    target: transfer.target,
    calldata,
    replacementPattern,
  };
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

// Helpers for atomicizer

function encodeAtomicizedCalldata(
  atomicizer: WyvernAtomicizerContract,
  schemas: Array<Schema<WyvernAsset>>,
  assets: WyvernAsset[],
  address: string,
  side: OrderSide
) {
  const encoder = side === OrderSide.Sell ? encodeSell : encodeBuy;

  try {
    const transactions = assets.map((asset, i) => {
      const schema = schemas[i];
      const { target, calldata } = encoder(schema, asset, address);
      return {
        calldata,
        abi: schema.functions.transfer(asset),
        address: target,
        value: new BigNumber(0),
      };
    });

    const atomicizedCalldata = atomicizer
      .atomicize(
        transactions.map((t) => t.address),
        transactions.map((t) => t.value),
        transactions.map((t) => new BigNumber((t.calldata.length - 2) / 2)), // subtract 2 for '0x', divide by 2 for hex
        transactions.map((t) => t.calldata).reduce((x, y) => x + y.slice(2)) // cut off the '0x'
      )
      .getABIEncodedTransactionData();

    const kind = side === OrderSide.Buy ? FunctionInputKind.Owner : undefined;

    const atomicizedReplacementPattern =
      WyvernProtocol.encodeAtomicizedReplacementPattern(
        transactions.map((t) => t.abi),
        kind
      );

    if (!atomicizedCalldata || !atomicizedReplacementPattern) {
      throw new Error(
        `Invalid calldata: ${atomicizedCalldata}, ${atomicizedReplacementPattern}`
      );
    }
    return {
      atomicizedCalldata,
      atomicizedReplacementPattern,
    };
  } catch (error) {
    console.error({ schemas, assets, address, side });
    throw new Error(
      `Failed to construct your order: likely something strange about this type of item. OpenSea has been notified. Please contact us in Discord! Original error: ${error}`
    );
  }
}
