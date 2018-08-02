import * as Web3 from 'web3';
import { OpenSeaAPI } from './api';
import { OpenSeaAPIConfig, Order, PartialReadonlyContractAbi, EventType, EventData } from './types';
import { BigNumber } from 'bignumber.js';
import { EventSubscription } from 'fbemitter';
export declare class OpenSeaPort {
    web3: Web3;
    logger: (arg: string) => void;
    readonly api: OpenSeaAPI;
    private networkName;
    private wyvernProtocol;
    private emitter;
    constructor(provider: Web3.Provider, apiConfig?: OpenSeaAPIConfig, logger?: (arg: string) => void);
    /**
     * Add a listener to a marketplace event
     * @param event An event to listen for
     * @param listener A callback that will accept an object with event data
     * @param once Whether the listener should only be called once
     */
    addListener(event: EventType, listener: (data: EventData) => void, once?: boolean): EventSubscription;
    /**
     * Remove an event listener, included here for completeness.
     * Simply calls `.remove()` on a subscription
     * @param subscription The event subscription returned from `addListener`
     */
    removeListener(subscription: EventSubscription): void;
    /**
     * Remove all event listeners. Good idea to call this when you're unmounting
     * a component that listens to events to make UI updates
     * @param event Optional EventType to remove listeners for
     */
    removeAllListeners(event?: EventType): void;
    /**
     * Wrap ETH into W-ETH.
     * W-ETH is needed for placing buy orders (making offers).
     * Emits the `WrapEth` event when the transaction is ready, and the `WrapEthComplete` event when the blockchain confirms it.
     * @param param0 Object containing the amount in ETH to wrap and the user's account address
     */
    wrapEth({ amountInEth, accountAddress }: {
        amountInEth: number;
        accountAddress: string;
    }): Promise<void>;
    /**
     * Unwrap W-ETH into ETH.
     * Emits the `UnrapWeth` event when the transaction is ready, and the `UnwrapWethComplete` event when the blockchain confirms it.
     * @param param0 Object containing the amount in W-ETH to unwrap and the user's account address
     */
    unwrapWeth({ amountInEth, accountAddress }: {
        amountInEth: number;
        accountAddress: string;
    }): Promise<void>;
    /**
     * Create a buy order to make an offer on an asset.
     * Will throw an 'Insufficient balance' error if the maker doesn't have enough W-ETH to make the offer.
     * If the user hasn't approved W-ETH access yet, this will emit `ApproveCurrency` and `ApproveCurrencyComplete` events before and after asking for approval.
     * @param param0 Object containing the token id, token address, user account address, amount to offer, and expiration time for the order. An expiration time of 0 means "never expire."
     */
    createBuyOrder({ tokenId, tokenAddress, accountAddress, amountInEth, expirationTime }: {
        tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        amountInEth: number;
        expirationTime?: number;
    }): Promise<Order>;
    /**
     * Create a sell order to auction an asset.
     * Will throw a 'You do not own this asset' error if the maker doesn't have the asset.
     * If the user hasn't approved access to the token yet, this will emit `ApproveAllAssets` and `ApproveAllAssetsComplete` events (or ApproveAsset and ApproveAssetComplete if the contract doesn't support approve-all) before and after asking for approval.
     * @param param0 Object containing the token id, token address, user account address, start amount of auction, end amount (optional), and expiration time for the order. An expiration time of 0 means "never expire."
     */
    createSellOrder({ tokenId, tokenAddress, accountAddress, startAmountInEth, endAmountInEth, expirationTime }: {
        tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        startAmountInEth: number;
        endAmountInEth?: number;
        expirationTime?: number;
    }): Promise<Order>;
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
    }): Promise<void>;
    /**
     * Gets the price for the order using the contract
     */
    getCurrentPrice(order: Order): Promise<BigNumber>;
    _getProxy(accountAddress: string): Promise<string | null>;
    _initializeProxy(accountAddress: string): Promise<string>;
    _getTokenBalance({ accountAddress, tokenAddress, tokenAbi }: {
        accountAddress: string;
        tokenAddress: string;
        tokenAbi?: PartialReadonlyContractAbi;
    }): Promise<BigNumber>;
    /**
     * Helper methods
     */
    private _atomicMatch;
    private _validateSellOrderParameters;
    private _validateBuyOrderParameters;
    private _validateAndPostOrder;
    private _signOrder;
    /**
     * Private methods
     */
    private _makeMatchingOrder;
    private _getSchema;
    private _dispatch;
    private _confirmTransaction;
}
