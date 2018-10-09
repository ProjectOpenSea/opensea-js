import * as Web3 from 'web3';
import { OpenSeaAPI } from './api';
import { OpenSeaAPIConfig, UnhashedOrder, Order, UnsignedOrder, PartialReadonlyContractAbi, EventType, EventData } from './types';
import { BigNumber } from 'bignumber.js';
import { EventSubscription } from 'fbemitter';
export declare class OpenSeaPort {
    web3: Web3;
    logger: (arg: string) => void;
    readonly api: OpenSeaAPI;
    gasPriceAddition: BigNumber;
    gasIncreaseFactor: number;
    private _networkName;
    private _wyvernProtocol;
    private _emitter;
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
     * @param startAmount Value of the offer, in units of the payment token (or wrapped ETH if no payment token address specified)
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire"
     * @param paymentTokenAddress Optional address for using an ERC-20 token in the order. If unspecified, defaults to W-ETH
     */
    createBuyOrder({ tokenId, tokenAddress, accountAddress, startAmount, expirationTime, paymentTokenAddress }: {
        tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        startAmount: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
    }): Promise<Order>;
    /**
     * Create a sell order to auction an asset.
     * Will throw a 'You do not own this asset' error if the maker doesn't have the asset.
     * If the user hasn't approved access to the token yet, this will emit `ApproveAllAssets` (or `ApproveAsset` if the contract doesn't support approve-all) before asking for approval.
     * @param param0 __namedParameters Object
     * @param tokenId Token ID
     * @param tokenAddress Address of the token's contract
     * @param accountAddress Address of the maker's wallet
     * @param startAmount Price of the asset at the start of the auction. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param endAmount Optional price of the asset at the end of its expiration time. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
     * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
     */
    createSellOrder({ tokenId, tokenAddress, accountAddress, startAmount, endAmount, expirationTime, paymentTokenAddress }: {
        tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
    }): Promise<Order>;
    /**
     * Create a sell order to auction a bundle of assets.
     * Will throw a 'You do not own this asset' error if the maker doesn't have one of the assets.
     * If the user hasn't approved access to any of the assets yet, this will emit `ApproveAllAssets` (or `ApproveAsset` if the contract doesn't support approve-all) before asking for approval for each asset.
     * @param param0 __namedParameters Object
     * @param bundleName Name of the bundle
     * @param bundleDescription Optional description of the bundle. Markdown is allowed.
     * @param bundleExternalLink Optional link to a page that adds context to the bundle.
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to bundle together.
     * @param accountAddress The address of the maker of the bundle and the owner of all the assets.
     * @param startAmount Price of the asset at the start of the auction
     * @param endAmount Optional price of the asset at the end of its expiration time
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
     * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
     */
    createBundleSellOrder({ bundleName, bundleDescription, bundleExternalLink, assets, accountAddress, startAmount, endAmount, expirationTime, paymentTokenAddress }: {
        bundleName: string;
        bundleDescription?: string;
        bundleExternalLink?: string;
        assets: Array<{
            tokenId: string;
            tokenAddress: string;
        }>;
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
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
     * Requires an account to be initialized first.
     * Called internally, but exposed for dev flexibility.
     * Checks to see if already approved, first. Then tries different approval methods from best to worst.
     * @param param0 __namedParamters Object
     * @param tokenId Token id to approve, but only used if approve-all isn't
     *  supported by the token contract
     * @param tokenAddress The contract address of the token being approved
     * @param accountAddress The user's wallet address
     * @param proxyAddress Address of the user's proxy contract. If not provided,
     *  will attempt to fetch it from Wyvern.
     * @param tokenAbi ABI of the token's contract. Defaults to a flexible ERC-721
     *  contract.
     * @param skipApproveAllIfTokenAddressIn an optional list of token addresses that, if a token is approve-all type, will skip approval
     * @returns Transaction hash if a new transaction was created, otherwise null
     */
    approveNonFungibleToken({ tokenId, tokenAddress, accountAddress, proxyAddress, tokenAbi, skipApproveAllIfTokenAddressIn }: {
        tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        proxyAddress: string | null;
        tokenAbi?: PartialReadonlyContractAbi;
        skipApproveAllIfTokenAddressIn?: string[];
    }): Promise<string | null>;
    /**
     * Approve a fungible token (e.g. W-ETH) for use in trades.
     * Called internally, but exposed for dev flexibility.
     * Checks to see if the minimum amount is already approved, first.
     * @param param0 __namedParamters Object
     * @param accountAddress The user's wallet address
     * @param tokenAddress The contract address of the token being approved
     * @param minimumAmount The minimum amount needed to skip a transaction. Defaults to the max-integer.
     * @returns Transaction hash if a new transaction occurred, otherwise null
     */
    approveFungibleToken({ accountAddress, tokenAddress, minimumAmount }: {
        accountAddress: string;
        tokenAddress: string;
        minimumAmount?: BigNumber;
    }): Promise<string | null>;
    /**
     * Gets the price for the order using the contract
     * @param order The order to calculate the price for
     */
    getCurrentPrice(order: Order): Promise<BigNumber>;
    /**
     * Returns whether an order is fulfillable.
     * An order may not be fulfillable if a target item's transfer function
     * is locked for some reason, e.g. an item is being rented within a game
     * or trading has been locked for an item type.
     * @param param0 __namedParamters Object
     * @param order Order to check
     * @param accountAddress The account address that will be fulfilling the order
     */
    isOrderFulfillable({ order, accountAddress }: {
        order: Order;
        accountAddress: string;
    }): Promise<boolean>;
    /**
     * WIP Returns whether an asset is transferrable.
     * (Currently returns true too often, even when asset is locked by contract.)
     * An asset may not be transferrable if its transfer function
     * is locked for some reason, e.g. an item is being rented within a game
     * or trading has been locked for an item type.
     * @param param0 __namedParamters Object
     * @param tokenId ID of the token to check
     * @param tokenAddress Address of the token's contract
     * @param fromAddress The account address that currently owns the asset
     * @param toAddress The account address that will be acquiring the asset
     * @param tokenAbi ABI for the token contract. Defaults to ERC-721
     */
    isAssetTransferrable({ tokenId, tokenAddress, fromAddress, toAddress, tokenAbi }: {
        tokenId: string;
        tokenAddress: string;
        fromAddress: string;
        toAddress: string;
        tokenAbi?: PartialReadonlyContractAbi;
    }): Promise<boolean>;
    /**
     * Compute the gas price for sending a txn, in wei
     * Will be slightly above the mean to make it faster
     */
    _computeGasPrice(): Promise<BigNumber>;
    /**
     * Compute the gas amount for sending a txn
     * Will be slightly above the result of estimateGas to make it more reliable
     * @param estimation The result of estimateGas for a transaction
     */
    _correctGasAmount(estimation: number): number;
    /**
     * Estimate the gas needed to match two orders
     * @param param0 __namedParamaters Object
     * @param buy The buy order to match
     * @param sell The sell order to match
     * @param accountAddress The taker's wallet address
     */
    _estimateGasForMatch({ buy, sell, accountAddress }: {
        buy: Order;
        sell: Order;
        accountAddress: string;
    }): Promise<number>;
    /**
     * Get the proxy address for a user's wallet.
     * Internal method exposed for dev flexibility.
     * @param accountAddress The user's wallet address
     * @param retries Optional number of retries to do
     */
    _getProxy(accountAddress: string, retries?: number): Promise<string | null>;
    /**
     * Initialize the proxy for a user's wallet.
     * Proxies are used to make trades on behalf of the order's maker so that
     *  trades can happen when the maker isn't online.
     * Internal method exposed for dev flexibility.
     * @param accountAddress The user's wallet address
     */
    _initializeProxy(accountAddress: string): Promise<string>;
    _getPriceParameters(tokenAddress: string, startAmount: number, endAmount?: number): {
        basePrice: BigNumber;
        extra: BigNumber;
    };
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
    _makeBuyOrder({ tokenId, tokenAddress, accountAddress, startAmount, expirationTime, paymentTokenAddress }: {
        tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        startAmount: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
    }): Promise<UnhashedOrder>;
    _makeBundleSellOrder({ bundleName, bundleDescription, bundleExternalLink, assets, accountAddress, startAmount, endAmount, expirationTime, paymentTokenAddress }: {
        bundleName: string;
        bundleDescription?: string;
        bundleExternalLink?: string;
        assets: Array<{
            tokenId: string;
            tokenAddress: string;
        }>;
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
    }): Promise<UnhashedOrder>;
    _makeMatchingOrder({ order, accountAddress }: {
        order: UnsignedOrder;
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
    _validateSellOrderParameters({ order, accountAddress }: {
        order: UnhashedOrder;
        accountAddress: string;
    }): Promise<void>;
    _validateBuyOrderParameters({ order, accountAddress }: {
        order: UnhashedOrder;
        accountAddress: string;
    }): Promise<void>;
    /**
     * Private helper methods
     */
    private _atomicMatch;
    private _getEthValueForTakingSellOrder;
    private _validateAndPostOrder;
    private _signOrder;
    private _getSchema;
    private _dispatch;
    private _confirmTransaction;
}
