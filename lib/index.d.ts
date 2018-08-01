import * as Web3 from 'web3';
import { ECSignature, OpenSeaAPIConfig, UnhashedOrder, Order, UnsignedOrder, PartialReadonlyContractAbi, EventType } from './types';
import { orderToJSON, orderFromJSON } from './wyvern';
import { BigNumber } from 'bignumber.js';
import { EventSubscription } from 'fbemitter';
export { orderToJSON, orderFromJSON };
export declare class OpenSea {
    private web3;
    private networkName;
    private wyvernProtocol;
    private api;
    private emitter;
    constructor(provider: Web3.Provider, apiConfig?: OpenSeaAPIConfig);
    addListener(event: EventType, listener: (...args: any[]) => void, once?: boolean): EventSubscription;
    removeAllListeners(event?: EventType): void;
    wrapEth({ amountInEth, accountAddress }: {
        amountInEth: number;
        accountAddress: string;
        awaitConfirmation?: boolean;
    }): Promise<void>;
    unwrapWeth({ amountInEth, accountAddress }: {
        amountInEth: number;
        accountAddress: string;
        awaitConfirmation?: boolean;
    }): Promise<void>;
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
    }): Promise<void>;
    cancelOrder({ order, accountAddress }: {
        order: Order;
        accountAddress: string;
    }): Promise<void>;
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
    }): Promise<void>;
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
    _dispatch(event: EventType, data?: {}): void;
}
