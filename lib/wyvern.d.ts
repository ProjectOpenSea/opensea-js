import BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import { ECSignature, Order, NodeCallback } from './types';
export declare const NULL_BLOCK_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
export declare const feeRecipient = "0x5b3256965e7C3cF26E11FCAf296DfC8807C01073";
export declare const encodeCall: any;
export declare const promisify: (inner: (fn: NodeCallback<any>) => void) => Promise<{}>;
export declare const confirmTransaction: (web3: Web3, txHash: string) => Promise<{}>;
export declare const orderFromJSON: (order: any) => Order;
export declare const orderToJSON: (order: Order) => {
    exchange: string;
    maker: string;
    taker: string;
    makerRelayerFee: string;
    takerRelayerFee: string;
    makerProtocolFee: string;
    takerProtocolFee: string;
    feeMethod: string;
    feeRecipient: string;
    side: string;
    saleKind: string;
    target: string;
    howToCall: string;
    calldata: string;
    replacementPattern: string;
    staticTarget: string;
    staticExtradata: string;
    paymentToken: string;
    basePrice: string;
    extra: string;
    listingTime: string;
    expirationTime: string;
    salt: string;
};
export declare const findAsset: (web3: any, { account, proxy, wyAsset, schema }: {
    string: any;
    WyvernAsset: any;
    WyvernSchema: any;
}) => Promise<"unknown" | "proxy" | "account" | "other">;
export declare function personalSignAsync(web3: Web3, { message, signerAddress }: {
    message: string;
    signerAddress: string;
}): Promise<ECSignature>;
export declare function makeBigNumber(number: any): BigNumber;
export declare function sendRawTransaction(web3: Web3, { fromAddress, toAddress, data, value, awaitConfirmation }: {
    fromAddress: any;
    toAddress: any;
    data: any;
    value?: number;
    awaitConfirmation?: boolean;
}): Promise<{}>;
/**
 * Gets the price for the API data or cached order passed in
 */
export declare function computeCurrentPrice(order: Order): BigNumber;
