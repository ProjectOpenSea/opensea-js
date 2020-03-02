import { BigNumber } from 'bignumber.js'
import * as ethABI from 'ethereumjs-abi'
import * as Web3 from 'web3'
import { WyvernProtocol } from 'wyvern-js'
import { HowToCall } from 'wyvern-js/lib/types'
import { WyvernAtomicizerContract } from 'wyvern-js/lib/abi_gen/wyvern_atomicizer'

import {
  AnnotatedFunctionABI,
  FunctionInputKind,
  Schema,
} from 'wyvern-schemas/dist/types'
export { AbiType } from 'wyvern-schemas'
import { WyvernAsset } from '../types'
import { proxyAssertABI, proxyABI } from '../abi/Proxy'

export interface LimitedCallSpec {
  target: string
  calldata: string
}

export interface CallSpec {
  target: string
  calldata: string
  replacementPattern: string
}

const failWith = (msg: string): any => {
  throw new Error(msg)
}

export const encodeReplacementPattern = WyvernProtocol.encodeReplacementPattern

export type SellEncoder<T> = (schema: Schema<T>, asset: T, address: string) => CallSpec

export const encodeCall = (abi: AnnotatedFunctionABI, parameters: any[]): string => {
  const inputTypes = abi.inputs.map(i => i.type)
  return '0x' + Buffer.concat([
    ethABI.methodID(abi.name, inputTypes),
    ethABI.rawEncode(inputTypes, parameters),
  ]).toString('hex')
}

export const encodeSell: SellEncoder<any> = (schema, asset, address) => {
  const transfer = schema.functions.transfer(asset)
  return {
    target: transfer.target,
    calldata: encodeDefaultCall(transfer, address),
    replacementPattern: encodeReplacementPattern(transfer),
  }
}

export type AtomicizedSellEncoder<T> = (schema: Schema<T>, assets: T[], address: string, atomicizer: WyvernAtomicizerContract) => Partial<CallSpec>

export const encodeAtomicizedSell: AtomicizedSellEncoder<any> = (schema, assets, address, atomicizer) => {
  const transactions = assets.map(asset => {
    const { target, calldata } = encodeSell(schema, asset, address)
    return {
      calldata,
      abi: schema.functions.transfer(asset),
      address: target,
      value: new BigNumber(0),
    }
  })

  const atomicizedCalldata = atomicizer.atomicize.getABIEncodedTransactionData(
    transactions.map(t => t.address),
    transactions.map(t => t.value),
    transactions.map(t => new BigNumber((t.calldata.length - 2) / 2)), // subtract 2 for '0x', divide by 2 for hex
    transactions.map(t => t.calldata).reduce((x, y) => x + y.slice(2)), // cut off the '0x'
  )

  const atomicizedReplacementPattern = WyvernProtocol.encodeAtomicizedReplacementPattern(transactions.map(t => t.abi))

  return {
    calldata: atomicizedCalldata,
    replacementPattern: atomicizedReplacementPattern,
  }
}

export type AtomicizedBuyEncoder<T> = (schema: Schema<T>, assets: T[], address: string, atomicizer: WyvernAtomicizerContract) => Partial<CallSpec>

export const encodeAtomicizedBuy: AtomicizedBuyEncoder<any> = (schema, assets, address, atomicizer) => {
  const transactions = assets.map(asset => {
    const { target, calldata } = encodeBuy(schema, asset, address)
    return {
      calldata,
      abi: schema.functions.transfer(asset),
      address: target,
      value: new BigNumber(0),
    }
  })

  const atomicizedCalldata = atomicizer.atomicize.getABIEncodedTransactionData(
    transactions.map(t => t.address),
    transactions.map(t => t.value),
    transactions.map(t => new BigNumber((t.calldata.length - 2) / 2)), // subtract 2 for '0x', divide by 2 for hex
    transactions.map(t => t.calldata).reduce((x, y) => x + y.slice(2)), // cut off the '0x'
  )

  const atomicizedReplacementPattern = WyvernProtocol.encodeAtomicizedReplacementPattern(transactions.map(t => t.abi), FunctionInputKind.Owner)

  return {
    calldata: atomicizedCalldata,
    replacementPattern: atomicizedReplacementPattern,
  }
}

export type BuyEncoder<T> = (schema: Schema<T>, asset: T, address: string) => CallSpec

export const encodeBuy: BuyEncoder<any> = (schema, asset, address) => {
  const transfer = schema.functions.transfer(asset)
  const replaceables = transfer.inputs.filter((i: any) => i.kind === FunctionInputKind.Replaceable)
  const ownerInputs = transfer.inputs.filter((i: any) => i.kind === FunctionInputKind.Owner)

  // Validate
  if (replaceables.length !== 1) {
    failWith('Only 1 input can match transfer destination, but instead ' + replaceables.length + ' did')
  }

  // Compute calldata
  const parameters = transfer.inputs.map((input: any) => {
    switch (input.kind) {
      case FunctionInputKind.Replaceable:
        return address
      case FunctionInputKind.Owner:
        return WyvernProtocol.generateDefaultValue(input.type)
      default:
        return input.value.toString()
    }
  })
  const calldata = encodeCall(transfer, parameters)

  // Compute replacement pattern
  let replacementPattern = '0x'
  if (ownerInputs.length > 0) {
    replacementPattern = encodeReplacementPattern(transfer, FunctionInputKind.Owner)
  }

  return {
    target: transfer.target,
    calldata,
    replacementPattern,
  }
}

export type DefaultCallEncoder = (abi: AnnotatedFunctionABI, address: string) => string

export const encodeDefaultCall: DefaultCallEncoder = (abi, address) => {
  const parameters = abi.inputs.map(input => {
    switch (input.kind) {
      case FunctionInputKind.Replaceable:
        return WyvernProtocol.generateDefaultValue(input.type)
      case FunctionInputKind.Owner:
        return address
      case FunctionInputKind.Asset:
      default:
        return input.value
    }
  })
  return encodeCall(abi, parameters)
}

export type ReplacementEncoder = (abi: AnnotatedFunctionABI, kind?: FunctionInputKind) => string

/**
 * Encode the atomicized transfer of many assets
 * @param schema Wyvern Schema for the assets
 * @param assets List of assets to transfer
 * @param from Current address owning the assets
 * @param to Destination address
 * @param atomicizer Wyvern Atomicizer instance
 */
export function encodeAtomicizedTransfer(schema: Schema<any>, assets: WyvernAsset[], from: string, to: string, atomicizer: WyvernAtomicizerContract) {

  const transactions = assets.map((asset: any) => {
    const transfer = schema.functions.transfer(asset)
    const calldata = encodeTransferCall(transfer, from, to)
    return {
      calldata,
      address: transfer.target,
      value: new BigNumber(0),
    }
  })

  const atomicizedCalldata = atomicizer.atomicize.getABIEncodedTransactionData(
    transactions.map((t: any) => t.address),
    transactions.map((t: any) => t.value),
    transactions.map((t: any) => new BigNumber((t.calldata.length - 2) / 2)), // subtract 2 for '0x', divide by 2 for hex
    transactions.map((t: any) => t.calldata).reduce((x: string, current: string) => x + current.slice(2), '0x'), // cut off the '0x'
  )

  return {
    calldata: atomicizedCalldata,
  }
}

/**
 * Encode a transfer call for a Wyvern schema function
 * @param transferAbi Annotated Wyvern ABI
 * @param from From address
 * @param to To address
 */
export function encodeTransferCall(transferAbi: AnnotatedFunctionABI, from: string, to: string) {
  const parameters = transferAbi.inputs.map(input => {
    switch (input.kind) {
      case FunctionInputKind.Replaceable:
        return to
      case FunctionInputKind.Owner:
        return from
      case FunctionInputKind.Asset:
      default:
        if (input.value == null) {
          throw new Error(`Unsupported function input kind: ${input.kind}`)
        }
        return input.value
    }
  })
  return encodeCall(transferAbi, parameters)
}

/**
 * Encode a call to a user's proxy contract
 * @param address The address for the proxy to call
 * @param howToCall How to call the addres
 * @param calldata The data to use in the call
 * @param shouldAssert Whether to assert success in the proxy call
 */
export function encodeProxyCall(address: string, howToCall: HowToCall, calldata: string, shouldAssert = true) {
  const abi = shouldAssert ? proxyAssertABI : proxyABI
  return encodeCall(abi, [address, howToCall, Buffer.from(calldata.slice(2), 'hex')])
}
