import * as Web3 from 'web3';
import { OpenSeaAPI } from './api';
import { OpenSeaAPIConfig, Order, UnsignedOrder, PartialReadonlyContractAbi, EventType, EventData } from './types';
import { BigNumber } from 'bignumber.js';
import { EventSubscription } from 'fbemitter';
export declare class OpenSeaPort {
    web3: Web3;
    logger: (arg: string) => void;
    readonly api: OpenSeaAPI;
    private networkName;
    private wyvernProtocol;
    private emitter;
    /**
     * Your very own seaport.
     * Create a new instance of OpenSeaJS.
     * @param provider Web3 Provider to use for transactions. For example:
     *  `const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')`
     * @param apiConfig configuration options, including `networkName`
     * @param logger logger, optional, a function that will be called with debugging
     *  information
     */
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
     * Emits the `WrapEth` event when the transaction is prompted.
     * @param param0 __namedParameters Object
     * @param amountInEth How much ether to wrap
     * @param accountAddress Address of the user's wallet containing the ether
     */
    wrapEth({ amountInEth, accountAddress }: {
        amountInEth: number;
        accountAddress: string;
    }): Promise<void>;
    /**
     * Unwrap W-ETH into ETH.
     * Emits the `UnwrapWeth` event when the transaction is prompted.
     * @param param0 __namedParameters Object
     * @param amountInEth How much W-ETH to unwrap
     * @param accountAddress Address of the user's wallet containing the W-ETH
     */
    unwrapWeth({ amountInEth, accountAddress }: {
        amountInEth: number;
        accountAddress: string;
    }): Promise<void>;
    /**
     * Create a buy order to make an offer on an asset.
     * Will throw an 'Insufficient balance' error if the maker doesn't have enough W-ETH to make the offer.
     * If the user hasn't approved W-ETH access yet, this will emit `ApproveCurrency` before asking for approval.
     * @param param0 __namedParameters Object
     * @param tokenId Token ID
     * @param tokenAddress Address of the token's contract
     * @param accountAddress Address of the maker's wallet
     * @param amountInEth Ether value of the offer
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
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
     * If the user hasn't approved access to the token yet, this will emit `ApproveAllAssets` (or `ApproveAsset` if the contract doesn't support approve-all) before asking for approval.
     * @param param0 __namedParameters Object
     * @param tokenId Token ID
     * @param tokenAddress Address of the token's contract
     * @param accountAddress Address of the maker's wallet
     * @param startAmountInEth Price of the asset at the start of the auction
     * @param endAmountInEth Optional price of the asset at the end of its expiration time
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
     */
    createSellOrder({ tokenId, tokenAddress, accountAddress, startAmountInEth, endAmountInEth, expirationTime }: {
        tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        startAmountInEth: number;
        endAmountInEth?: number;
        expirationTime?: number;
    }): Promise<Order>;
    /**
     * Fullfill or "take" an order for an asset, either a buy or sell order
     * @param param0 __namedParamaters Object
     * @param order The order to fulfill, a.k.a. "take"
     * @param accountAddress The taker's wallet address
     */
    fulfillOrder({ order, accountAddress }: {
        order: Order;
        accountAddress: string;
    }): Promise<void>;
    /**
     * Cancel an order on-chain, preventing it from ever being fulfilled.
     * @param param0 __namedParameters Object
     * @param order The order to cancel
     * @param accountAddress The order maker's wallet address
     */
    cancelOrder({ order, accountAddress }: {
        order: Order;
        accountAddress: string;
    }): Promise<void>;
    /**
     * Approve a non-fungible token for use in trades.
     * Called internally, but exposed for dev flexibility.
     * @param param0 __namedParamters Object
     * @param tokenId Token id to approve, but only used if approve-all isn't
     *  supported by the token contract
     * @param tokenAddress The contract address of the token being approved
     * @param accountAddress The user's wallet address
     * @param proxyAddress Address of the user's proxy contract. If not provided,
     *  will attempt to fetch it from Wyvern.
     * @param tokenAbi ABI of the token's contract. Defaults to a flexible ERC-721
     *  contract.
     */
    approveNonFungibleToken({ tokenId, tokenAddress, accountAddress, proxyAddress, tokenAbi }: {
        tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        proxyAddress: string | null;
        tokenAbi?: PartialReadonlyContractAbi;
    }): Promise<void>;
    /**
     * Approve a fungible token (e.g. W-ETH) for use in trades.
     * Called internally, but exposed for dev flexibility.
     * @param param0 __namedParamters Object
     * @param accountAddress The user's wallet address
     * @param tokenAddress The contract address of the token being approved
     */
    approveFungibleToken({ accountAddress, tokenAddress }: {
        accountAddress: string;
        tokenAddress: string;
    }): Promise<void>;
    /**
     * Gets the price for the order using the contract
     * @param order The order to calculate the price for
     */
    getCurrentPrice(order: Order): Promise<BigNumber>;
    /**
     * Get the proxy address for a user's wallet.
     * Internal method exposed for dev flexibility.
     * @param accountAddress The user's wallet address
     */
    _getProxy(accountAddress: string): Promise<string | null>;
    /**
     * Initialize the proxy for a user's wallet.
     * Proxies are used to make trades on behalf of the order's maker so that
     *  trades can happen when the maker isn't online.
     * Internal method exposed for dev flexibility.
     * @param accountAddress The user's wallet address
     */
    _initializeProxy(accountAddress: string): Promise<string>;
    /**
     * Get the balance of a fungible token.
     * Internal method exposed for dev flexibility.
     * @param param0 __namedParameters Object
     * @param accountAddress User's account address
     * @param tokenAddress Optional address of the token's contract.
     *  Defaults to W-ETH
     * @param tokenAbi ABI for the token's contract
     */
    _getTokenBalance({ accountAddress, tokenAddress, tokenAbi }: {
        accountAddress: string;
        tokenAddress?: string;
        tokenAbi?: PartialReadonlyContractAbi;
    }): Promise<BigNumber>;
    /**
     * For a fungible token to use in trades (like W-ETH), get the amount
     *  approved for use by the Wyvern transfer proxy.
     * Internal method exposed for dev flexibility.
     * @param param0 __namedParamters Object
     * @param accountAddress Address for the user's wallet
     * @param tokenAddress Address for the token's contract
     */
    _getApprovedTokenCount({ accountAddress, tokenAddress }: {
        accountAddress: string;
        tokenAddress?: string;
    }): Promise<BigNumber>;
    _makeMatchingOrder({ order, accountAddress }: {
        order: Order;
        accountAddress: string;
    }): UnsignedOrder;
    /**
     * Validate against Wyvern that a buy and sell order can match
     * @param param0 __namedParamters Object
     * @param buy The buy order to validate
     * @param sell The sell order to validate
     * @param accountAddress Address for the user's wallet
     */
    _validateMatch({ buy, sell, accountAddress }: {
        buy: Order;
        sell: Order;
        accountAddress: string;
    }): Promise<boolean>;
    /**
     * Private helper methods
     */
    private _atomicMatch;
    private _validateSellOrderParameters;
    private _validateBuyOrderParameters;
    private _validateAndPostOrder;
    private _signOrder;
    private _getSchema;
    private _dispatch;
    private _confirmTransaction;
}
