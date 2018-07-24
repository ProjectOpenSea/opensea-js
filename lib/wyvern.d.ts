import BigNumber from 'bignumber.js';
export declare const orderSide: {
    BUY: number;
    SELL: number;
};
export declare const saleKind: {
    FIXED_PRICE: number;
    DUTCH_AUCTION: number;
};
export declare const howToCall: {
    CALL: number;
    DELEGATE_CALL: number;
};
export declare const feeMethod: {
    PROTOCOL_FEE: number;
    SPLIT_FEE: number;
};
export declare const NULL_BLOCK_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
export declare const feeRecipient = "0x5b3256965e7C3cF26E11FCAf296DfC8807C01073";
export declare const encodeCall: any;
export declare const promisify: (inner: any) => Promise<{}>;
export declare const confirmTransaction: (web3: any, { txHash, onConfirmation }: {
    txHash: any;
    onConfirmation: any;
}) => Promise<void>;
export declare const orderFromJSON: (order: any) => {
    hash: any;
    cancelledOrFinalized: any;
    markedInvalid: any;
    metadata: any;
    exchange: any;
    maker: any;
    taker: any;
    makerRelayerFee: BigNumber;
    takerRelayerFee: BigNumber;
    makerProtocolFee: BigNumber;
    takerProtocolFee: BigNumber;
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
    basePrice: BigNumber;
    extra: BigNumber;
    listingTime: BigNumber;
    expirationTime: BigNumber;
    salt: BigNumber;
    v: number;
    r: any;
    s: any;
};
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
export declare const findAsset: (account: any, proxy: any, wyAsset: any, schema: any) => Promise<"unknown" | "proxy" | "account" | "other">;
export declare function personalSignAsync(web3: any, { message, signerAddress }: {
    message: any;
    signerAddress: any;
}): Promise<{
    v: any;
    r: any;
    s: any;
}>;
export declare function makeBigNumber(number: any): BigNumber;
export declare function sendRawTransaction(web3: any, { fromAddress, toAddress, data, value, awaitConfirmation }: {
    fromAddress: any;
    toAddress: any;
    data: any;
    value?: number;
    awaitConfirmation?: boolean;
}): Promise<{}>;
/**
 * Gets the price for the API data or cached order passed in
 * @param {object} orderData API data about order
 * @param {object} cachedOrder Store order object
 */
export declare function computeCurrentPrice(order: any): any;
