import * as Web3 from 'web3';
import { ECSignature, OpenSeaAPIConfig, SaleKind } from './types';
import BigNumber from 'bignumber.js';
export declare class OpenSea {
    private web3;
    private networkName;
    private wyvernProtocol;
    private api;
    constructor(provider: Web3.Provider, apiConfig?: OpenSeaAPIConfig);
    wrapEth({ amountInEth, accountAddress, awaitConfirmation }: {
        amountInEth: any;
        accountAddress: any;
        awaitConfirmation?: boolean;
    }): Promise<any>;
    unwrapWeth({ amountInEth, accountAddress, awaitConfirmation }: {
        amountInEth: any;
        accountAddress: any;
        awaitConfirmation?: boolean;
    }): Promise<{}>;
    createBuyOrder({ tokenId, tokenAddress, accountAddress, amountInEth, expirationTime }: {
        tokenId: any;
        tokenAddress: any;
        accountAddress: any;
        amountInEth: any;
        expirationTime?: number;
    }): Promise<void>;
    createSellOrder({ tokenId, tokenAddress, accountAddress, startAmountInEth, endAmountInEth, expirationTime }: {
        tokenId: any;
        tokenAddress: any;
        accountAddress: any;
        startAmountInEth: any;
        endAmountInEth: any;
        expirationTime?: number;
    }): Promise<void>;
    fulfillOrder({ order, accountAddress }: {
        order: any;
        accountAddress: any;
    }): Promise<any>;
    cancelOrder({ order, accountAddress }: {
        order: any;
        accountAddress: any;
    }): Promise<string>;
    getApprovedTokenCount({ accountAddress, tokenAddress }: {
        accountAddress: any;
        tokenAddress: any;
    }): Promise<BigNumber>;
    approveNonFungibleToken({ tokenId, tokenAddress, accountAddress, proxyAddress, tokenAbi }: {
        tokenId: any;
        tokenAddress: any;
        accountAddress: any;
        proxyAddress: any;
        tokenAbi?: {
            type: string;
            name?: string | undefined;
            inputs?: object[] | undefined;
            outputs?: object[] | undefined;
            payable?: boolean | undefined;
            constant?: boolean | undefined;
            anonymous?: boolean | undefined;
            stateMutability?: string | undefined;
        }[];
    }): Promise<void>;
    approveFungibleToken({ accountAddress, tokenAddress }: {
        accountAddress: any;
        tokenAddress: any;
    }): Promise<{}>;
    /**
     * Gets the price for the order using the contract
     * @param {object} order Wyvern order object
     */
    getCurrentPrice(order: any): Promise<BigNumber>;
    /**
     * Helper methods
     */
    _atomicMatch({ buy, sell, accountAddress }: {
        buy: any;
        sell: any;
        accountAddress: any;
    }): Promise<any>;
    _makeMatchingOrder({ order, accountAddress }: {
        order: any;
        accountAddress: any;
    }): Promise<{
        exchange: any;
        maker: any;
        taker: string;
        makerRelayerFee: BigNumber;
        takerRelayerFee: BigNumber;
        makerProtocolFee: BigNumber;
        takerProtocolFee: BigNumber;
        feeMethod: any;
        feeRecipient: string;
        side: number;
        saleKind: SaleKind;
        target: any;
        howToCall: any;
        calldata: any;
        replacementPattern: any;
        staticTarget: string;
        staticExtradata: string;
        paymentToken: any;
        basePrice: any;
        extra: number;
        listingTime: BigNumber;
        expirationTime: BigNumber;
        salt: BigNumber;
        metadata: any;
    }>;
    _getProxy(accountAddress: any): Promise<string>;
    _initializeProxy(accountAddress: any): Promise<string>;
    _validateSellOrderParameters({ order, accountAddress }: {
        Order: any;
        string: any;
    }): Promise<void>;
    _validateBuyOrderParameters({ order, accountAddress }: {
        Order: any;
        string: any;
    }): Promise<void>;
    _getTokenBalance({ accountAddress, tokenAddress, tokenAbi }: {
        accountAddress: any;
        tokenAddress: any;
        tokenAbi?: {
            type: string;
            name?: string | undefined;
            inputs?: object[] | undefined;
            outputs?: object[] | undefined;
            payable?: boolean | undefined;
            constant?: boolean | undefined;
            anonymous?: boolean | undefined;
            stateMutability?: string | undefined;
        }[];
    }): Promise<BigNumber>;
    _validateAndPostOrder(order: any): Promise<void>;
    _signOrder({ order }: {
        order: any;
    }): Promise<ECSignature>;
    _getSchema(schemaName?: string): any;
}
