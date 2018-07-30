import * as Web3 from 'web3';
import { ECSignature, OpenSeaAPIConfig, Order, SimpleContractAbi } from './types';
import BigNumber from 'bignumber.js';
export declare class OpenSea {
    private web3;
    private networkName;
    private wyvernProtocol;
    private api;
    constructor(provider: Web3.Provider, apiConfig?: OpenSeaAPIConfig);
    wrapEth({ amountInEth, accountAddress, awaitConfirmation }: {
        amountInEth: number;
        accountAddress: string;
        awaitConfirmation?: boolean;
    }): Promise<{}>;
    unwrapWeth({ amountInEth, accountAddress, awaitConfirmation }: {
        amountInEth: number;
        accountAddress: string;
        awaitConfirmation?: boolean;
    }): Promise<{}>;
    createBuyOrder({ tokenId, tokenAddress, accountAddress, amountInEth, expirationTime }: {
        tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        amountInEth: number;
        expirationTime?: number;
    }): Promise<void>;
    createSellOrder({ tokenId, tokenAddress, accountAddress, startAmountInEth, endAmountInEth, expirationTime }: {
        tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        startAmountInEth: number;
        endAmountInEth: number;
        expirationTime?: number;
    }): Promise<void>;
    fulfillOrder({ order, accountAddress }: {
        order: Order;
        accountAddress: string;
    }): Promise<any>;
    cancelOrder({ order, accountAddress }: {
        order: Order;
        accountAddress: string;
    }): Promise<any>;
    getApprovedTokenCount({ accountAddress, tokenAddress }: {
        accountAddress: any;
        tokenAddress: any;
    }): Promise<any>;
    approveNonFungibleToken({ tokenId, tokenAddress, accountAddress, proxyAddress, tokenAbi }: {
        tokenId: any;
        tokenAddress: any;
        accountAddress: any;
        proxyAddress: any;
        tokenAbi?: import("../../../../../../../../Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/src/types").SimpleAbiDefinition[];
    }): Promise<void>;
    approveFungibleToken({ accountAddress, tokenAddress }: {
        accountAddress: string;
        tokenAddress: string;
    }): Promise<{}>;
    /**
     * Gets the price for the order using the contract
     * @param {object} order Wyvern order object
     */
    getCurrentPrice(order: Order): Promise<BigNumber>;
    /**
     * Helper methods
     */
    _atomicMatch({ buy, sell, accountAddress }: {
        buy: Order;
        sell: Order;
        accountAddress: string;
    }): Promise<any>;
    _makeMatchingOrder({ order, accountAddress }: {
        order: Order;
        accountAddress: string;
    }): Order;
    _getProxy(accountAddress: string): string | null;
    _initializeProxy(accountAddress: any): Promise<string>;
    _validateSellOrderParameters({ order, accountAddress }: {
        order: Order;
        accountAddress: string;
    }): Promise<void>;
    _validateBuyOrderParameters({ order, accountAddress }: {
        order: Order;
        accountAddress: string;
    }): Promise<void>;
    _getTokenBalance({ accountAddress, tokenAddress, tokenAbi }: {
        accountAddress: string;
        tokenAddress: string;
        tokenAbi?: SimpleContractAbi;
    }): Promise<BigNumber>;
    _validateAndPostOrder(order: any): Promise<void>;
    _signOrder({ order }: {
        order: any;
    }): Promise<ECSignature>;
    _getSchema(schemaName?: string): any;
}
