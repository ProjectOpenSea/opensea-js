import BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import { ECSignature, Order, Web3Callback, OrderJSON } from './types';
export declare const NULL_BLOCK_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
export declare const feeRecipient = "0x5b3256965e7C3cF26E11FCAf296DfC8807C01073";
/**
 * Promisify a callback-syntax web3 function
 * @param inner callback function that accepts a Web3 callback function and passes
 * it to the Web3 function
 */
export declare function promisify<T>(inner: (fn: Web3Callback<T>) => void): Promise<T>;
export declare const confirmTransaction: (web3: Web3, txHash: string) => Promise<{}>;
export declare const orderFromJSON: (order: any) => Order;
export declare const orderToJSON: (order: Order) => OrderJSON;
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
 * Estimates the price 30 seconds ago
 */
export declare function estimateCurrentPrice(order: Order, shouldRoundUp?: boolean): BigNumber;
