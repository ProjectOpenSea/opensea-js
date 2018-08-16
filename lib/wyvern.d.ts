import BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import { ECSignature, Order, Web3Callback, OrderJSON, UnhashedOrder, OpenSeaAsset } from './types';
export declare const NULL_BLOCK_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
export declare const feeRecipient = "0x5b3256965e7c3cf26e11fcaf296dfc8807c01073";
/**
 * Promisify a callback-syntax web3 function
 * @param inner callback function that accepts a Web3 callback function and passes
 * it to the Web3 function
 */
export declare function promisify<T>(inner: (fn: Web3Callback<T>) => void): Promise<T>;
export declare const confirmTransaction: (web3: Web3, txHash: string) => Promise<{}>;
export declare const orderFromJSONv0: (order: any) => Order;
export declare const assetFromJSON: (asset: any) => OpenSeaAsset;
export declare const orderFromJSON: (order: any) => Order;
export declare const orderToJSON: (order: Order | UnhashedOrder) => OrderJSON;
export declare const findAsset: (web3: Web3, { account, proxy, wyAsset, schema }: {
    account: string;
    proxy: string;
    wyAsset: any;
    schema: any;
}) => Promise<"unknown" | "proxy" | "account" | "other">;
/**
 * Sign messages using web3 personal signatures
 * @param web3 Web3 instance
 * @param message message to sign
 * @param signerAddress web3 address signing the message
 */
export declare function personalSignAsync(web3: Web3, message: string, signerAddress: string): Promise<ECSignature>;
/**
 * Special fixes for making BigNumbers using web3 results
 * @param arg An arg or the result of a web3 call to turn into a BigNumber
 */
export declare function makeBigNumber(arg: number | string): BigNumber;
/**
 * Send a transaction to the blockchain and optionally confirm it
 * @param web3 Web3 instance
 * @param fromAddress address sending transaction
 * @param toAddress destination contract address
 * @param data data to send to contract
 * @param value value in ETH to send with data
 * @param awaitConfirmation whether we should wait for blockchain to confirm
 */
export declare function sendRawTransaction(web3: Web3, { fromAddress, toAddress, data, value, awaitConfirmation }: {
    fromAddress: string;
    toAddress: string;
    data: any;
    value?: number | BigNumber;
    awaitConfirmation?: boolean;
}): Promise<{}>;
/**
 * Estimates the price of an order
 * @param order The order to estimate price on
 * @param secondsToBacktrack The number of seconds to subtract on current time,
 *  to fix race conditions
 * @param shouldRoundUp Whether to round up fractional wei
 */
export declare function estimateCurrentPrice(order: Order, secondsToBacktrack?: number, shouldRoundUp?: boolean): BigNumber;
/**
 * Get the Wyvern representation of an asset
 * @param schema The WyvernSchema needed to access this asset
 * @param tokenId The token's id
 * @param tokenAddress The address of the token's contract
 */
export declare function getWyvernAsset(schema: any, tokenId: string, tokenAddress: string): any;
