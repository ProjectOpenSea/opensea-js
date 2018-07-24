import BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import { ECSignature, Order } from './types';
export declare const NULL_BLOCK_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
export declare const feeRecipient = "0x5b3256965e7C3cF26E11FCAf296DfC8807C01073";
export declare const encodeCall: any;
export declare const promisify: (inner: any) => Promise<{}>;
export declare const confirmTransaction: (web3: Web3, { txHash }: {
    txHash: string;
}) => Promise<{}>;
export declare const orderFromJSON: (order: any) => Order;
export declare const orderToJSON: (order: any) => {
    exchange: any;
    maker: any;
    taker: any;
    makerRelayerFee: any;
    takerRelayerFee: any;
    makerProtocolFee: any;
    takerProtocolFee: any;
    feeMethod: any;
    feeRecipient: any;
    side: any;
    saleKind: any;
    target: any;
    howToCall: any;
    calldata: any;
    replacementPattern: any;
    staticTarget: any;
    staticExtradata: any;
    paymentToken: any;
    basePrice: any;
    extra: any;
    listingTime: any;
    expirationTime: any;
    salt: any;
};
export declare const findAsset: (web3: any, { account, proxy, wyAsset, schema }: {
    string: any;
    WyvernAsset: any;
    WyvernSchema: any;
}) => Promise<"unknown" | "proxy" | "account" | "other">;
export declare function personalSignAsync(web3: any, { message, signerAddress }: {
    message: any;
    signerAddress: any;
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
 * @param order API data about order
 */
export declare function computeCurrentPrice(order: Order): BigNumber;
