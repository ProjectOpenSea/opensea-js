import * as Web3 from 'web3';
import { ECSignature, OpenSeaAPIConfig, UnhashedOrder, Order, UnsignedOrder, PartialReadonlyContractAbi } from './types';
import { orderToJSON, orderFromJSON } from './wyvern';
import { BigNumber } from 'bignumber.js';
export { orderToJSON, orderFromJSON };
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
    }): Promise<string>;
    cancelOrder({ order, accountAddress }: {
        order: Order;
        accountAddress: string;
    }): Promise<string>;
    getApprovedTokenCount({ accountAddress, tokenAddress }: {
        accountAddress: string;
        tokenAddress: string;
    }): Promise<BigNumber>;
    approveNonFungibleToken({ tokenId, tokenAddress, accountAddress, proxyAddress, tokenAbi }: {
        tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        proxyAddress: string | null;
        tokenAbi?: PartialReadonlyContractAbi;
    }): Promise<{} | undefined>;
    approveFungibleToken({ accountAddress, tokenAddress }: {
        accountAddress: string;
        tokenAddress: string;
    }): Promise<{}>;
    /**
     * Gets the price for the order using the contract
     */
    getCurrentPrice(order: Order): Promise<BigNumber>;
    /**
     * Helper methods
     */
    _atomicMatch({ buy, sell, accountAddress }: {
        buy: Order;
        sell: Order;
        accountAddress: string;
    }): Promise<string>;
    _makeMatchingOrder({ order, accountAddress }: {
        order: Order;
        accountAddress: string;
    }): UnsignedOrder;
    _getProxy(accountAddress: string): Promise<string | null>;
    _initializeProxy(accountAddress: string): Promise<string>;
    _validateSellOrderParameters({ order, accountAddress }: {
        order: UnhashedOrder;
        accountAddress: string;
    }): Promise<void>;
    _validateBuyOrderParameters({ order, accountAddress }: {
        order: UnhashedOrder;
        accountAddress: string;
    }): Promise<void>;
    _getTokenBalance({ accountAddress, tokenAddress, tokenAbi }: {
        accountAddress: string;
        tokenAddress: string;
        tokenAbi?: PartialReadonlyContractAbi;
    }): Promise<BigNumber>;
    _validateAndPostOrder(order: Order): Promise<void>;
    _signOrder(order: {
        hash: string;
        maker: string;
    }): Promise<ECSignature>;
    _getSchema(schemaName?: SchemaName): Schema;
}
