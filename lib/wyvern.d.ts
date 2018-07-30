import BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import { ECSignature, Order, NodeCallback } from './types';
export declare const NULL_BLOCK_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
export declare const feeRecipient = "0x5b3256965e7C3cF26E11FCAf296DfC8807C01073";
export declare const promisify: (inner: (fn: NodeCallback<any>) => void) => Promise<{}>;
export declare const confirmTransaction: (web3: Web3, txHash: string) => Promise<{}>;
export declare const orderFromJSON: (order: any) => Order;
export declare const orderToJSON: (order: Order) => any;
export declare const findAsset: (web3: Web3, { account, proxy, wyAsset, schema }: {
    account: string;
    proxy: string;
    wyAsset: any;
    schema: any;
}) => Promise<"unknown" | "proxy" | "account" | "other">;
export declare function personalSignAsync(web3: Web3, { message, signerAddress }: {
    message: string;
    signerAddress: string;
}): Promise<ECSignature>;
export declare function makeBigNumber(arg: number | string): BigNumber;
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
