import * as Web3 from 'web3';
import { OpenSeaAPI } from './api';
import { FeeMethod, OpenSeaAPIConfig, OrderSide, UnhashedOrder, Order, UnsignedOrder, PartialReadonlyContractAbi, EventType, EventData, OpenSeaAsset, WyvernSchemaName, OpenSeaFungibleToken, WyvernAsset, ComputedFees, Asset } from './types';
import { BigNumber } from 'bignumber.js';
import { EventSubscription } from 'fbemitter';
export declare class OpenSeaPort {
    web3: Web3;
    web3ReadOnly: Web3;
    logger: (arg: string) => void;
    readonly api: OpenSeaAPI;
    gasPriceAddition: BigNumber;
    gasIncreaseFactor: number;
    private _networkName;
    private _wyvernProtocol;
    private _wyvernProtocolReadOnly;
    private _emitter;
    private _wrappedNFTFactoryAddress;
    private _wrappedNFTLiquidationProxyAddress;
    private _uniswapFactoryAddress;
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
     * Wraps an arbirary group of NFTs into their corresponding WrappedNFT ERC20 tokens.
     * Emits the `WrapAssets` event when the transaction is prompted.
     * @param param0 __namedParameters Object
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to bundle together.
     * @param accountAddress Address of the user's wallet
     */
    wrapAssets({ assets, accountAddress }: {
        assets: Asset[];
        accountAddress: string;
    }): Promise<void>;
    /**
     * Unwraps an arbirary group of NFTs from their corresponding WrappedNFT ERC20 tokens back into ERC721 tokens.
     * Emits the `UnwrapAssets` event when the transaction is prompted.
     * @param param0 __namedParameters Object
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to bundle together.
     * @param destinationAddresses Addresses that each resulting ERC721 token will be sent to. Must be the same length as `tokenIds`. Each address corresponds with its respective token ID in the `tokenIds` array.
     * @param accountAddress Address of the user's wallet
     */
    unwrapAssets({ assets, destinationAddresses, accountAddress }: {
        assets: Asset[];
        destinationAddresses: string[];
        accountAddress: string;
    }): Promise<void>;
    /**
     * Liquidates an arbirary group of NFTs by atomically wrapping them into their
     * corresponding WrappedNFT ERC20 tokens, and then immediately selling those
     * ERC20 tokens on their corresponding Uniswap exchange.
     * Emits the `LiquidateAssets` event when the transaction is prompted.
     * @param param0 __namedParameters Object
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to bundle together.
     * @param accountAddress Address of the user's wallet
     * @param uniswapSlippageAllowedInBasisPoints The amount of slippage that a user will tolerate in their Uniswap trade; if Uniswap cannot fulfill the order without more slippage, the whole function will revert.
     */
    liquidateAssets({ assets, accountAddress, uniswapSlippageAllowedInBasisPoints }: {
        assets: Asset[];
        accountAddress: string;
        uniswapSlippageAllowedInBasisPoints: number;
    }): Promise<void>;
    /**
     * Purchases a bundle of WrappedNFT tokens from Uniswap and then unwraps them into ERC721 tokens.
     * Emits the `PurchaseAssets` event when the transaction is prompted.
     * @param param0 __namedParameters Object
     * @param numTokensToBuy The number of WrappedNFT tokens to purchase and unwrap
     * @param amount The estimated cost in wei for tokens (probably some ratio above the minimum amount to avoid the transaction failing due to frontrunning, minimum amount is found by calling UniswapExchange(uniswapAddress).getEthToTokenOutputPrice(numTokensToBuy.mul(10**18));
     * @param contractAddress Address of the corresponding NFT core contract for these NFTs.
     * @param accountAddress Address of the user's wallet
     */
    purchaseAssets({ numTokensToBuy, amount, contractAddress, accountAddress }: {
        numTokensToBuy: number;
        amount: BigNumber;
        contractAddress: string;
        accountAddress: string;
    }): Promise<void>;
    /**
     * Gets the estimated cost or payout of either buying or selling NFTs to Uniswap using either purchaseAssts() or liquidateAssets()
     * @param param0 __namedParameters Object
     * @param numTokens The number of WrappedNFT tokens to either purchase or sell
     * @param isBuying A bool for whether the user is buying or selling
     * @param contractAddress Address of the corresponding NFT core contract for these NFTs.
     */
    getQuoteFromUniswap({ numTokens, isBuying, contractAddress }: {
        numTokens: number;
        isBuying: boolean;
        contractAddress: string;
    }): Promise<number>;
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
     * Create a buy order to make an offer on a bundle or group of assets.
     * Will throw an 'Insufficient balance' error if the maker doesn't have enough W-ETH to make the offer.
     * If the user hasn't approved W-ETH access yet, this will emit `ApproveCurrency` before asking for approval.
     * @param param0 __namedParameters Object
     * @param assets Array of Asset objects to bid on
     * @param collection Optional collection for computing fees, required only if all assets belong to the same collection
     * @param quantities The quantity of each asset to sell. Defaults to 1 for each.
     * @param accountAddress Address of the maker's wallet
     * @param startAmount Value of the offer, in units of the payment token (or wrapped ETH if no payment token address specified)
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire"
     * @param paymentTokenAddress Optional address for using an ERC-20 token in the order. If unspecified, defaults to W-ETH
     * @param sellOrder Optional sell order (like an English auction) to ensure fee and schema compatibility
     * @param referrerAddress The optional address that referred the order
     */
    createBundleBuyOrder({ assets, collection, quantities, accountAddress, startAmount, expirationTime, paymentTokenAddress, sellOrder, referrerAddress }: {
        assets: Asset[];
        collection?: {
            slug: string;
        };
        quantities?: number[];
        accountAddress: string;
        startAmount: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
        sellOrder?: Order;
        referrerAddress?: string;
    }): Promise<Order>;
    /**
     * Create a buy order to make an offer on an asset.
     * Will throw an 'Insufficient balance' error if the maker doesn't have enough W-ETH to make the offer.
     * If the user hasn't approved W-ETH access yet, this will emit `ApproveCurrency` before asking for approval.
     * @param param0 __namedParameters Object
     * @param asset The asset to trade
     * @param accountAddress Address of the maker's wallet
     * @param startAmount Value of the offer, in units of the payment token (or wrapped ETH if no payment token address specified)
     * @param quantity The number of assets to bid for (if fungible or semi-fungible). Defaults to 1. In units, not base units, e.g. not wei.
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire"
     * @param paymentTokenAddress Optional address for using an ERC-20 token in the order. If unspecified, defaults to W-ETH
     * @param sellOrder Optional sell order (like an English auction) to ensure fee and schema compatibility
     * @param referrerAddress The optional address that referred the order
     */
    createBuyOrder({ asset, accountAddress, startAmount, quantity, expirationTime, paymentTokenAddress, sellOrder, referrerAddress }: {
        asset: Asset;
        accountAddress: string;
        startAmount: number;
        quantity?: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
        sellOrder?: Order;
        referrerAddress?: string;
    }): Promise<Order>;
    /**
     * Create a sell order to auction an asset.
     * Will throw a 'You do not own enough of this asset' error if the maker doesn't have the asset or not enough of it to sell the specific `quantity`.
     * If the user hasn't approved access to the token yet, this will emit `ApproveAllAssets` (or `ApproveAsset` if the contract doesn't support approve-all) before asking for approval.
     * @param param0 __namedParameters Object
     * @param tokenId DEPRECATED: Token ID. Use `asset` instead.
     * @param tokenAddress DEPRECATED: Address of the token's contract. Use `asset` instead.
     * @param asset The asset to trade
     * @param accountAddress Address of the maker's wallet
     * @param startAmount Price of the asset at the start of the auction. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param endAmount Optional price of the asset at the end of its expiration time. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param quantity The number of assets to sell (if fungible or semi-fungible). Defaults to 1. In units, not base units, e.g. not wei.
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
     * @param waitForHighestBid If set to true, this becomes an English auction that increases in price for every bid. The highest bid wins when the auction expires, as long as it's at least `startAmount`. `expirationTime` must be > 0.
     * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
     * @param extraBountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of this order
     * @param buyerAddress Optional address that's allowed to purchase this item. If specified, no other address will be able to take the order, unless its value is the null address.
     * @param buyerEmail Optional email of the user that's allowed to purchase this item. If specified, a user will have to verify this email before being able to take the order.
     */
    createSellOrder({ asset, accountAddress, startAmount, endAmount, quantity, expirationTime, waitForHighestBid, paymentTokenAddress, extraBountyBasisPoints, buyerAddress, buyerEmail }: {
        asset: Asset;
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        quantity?: number;
        expirationTime?: number;
        waitForHighestBid?: boolean;
        paymentTokenAddress?: string;
        extraBountyBasisPoints?: number;
        buyerAddress?: string;
        buyerEmail?: string;
        schemaName?: WyvernSchemaName;
    }): Promise<Order>;
    /**
     * Create multiple sell orders in bulk to auction assets out of an asset factory.
     * Will throw a 'You do not own this asset' error if the maker doesn't own the factory.
     * Items will mint to users' wallets only when they buy them. See https://docs.opensea.io/docs/opensea-initial-item-sale-tutorial for more info.
     * If the user hasn't approved access to the token yet, this will emit `ApproveAllAssets` (or `ApproveAsset` if the contract doesn't support approve-all) before asking for approval.
     * @param param0 __namedParameters Object
     * @param assets Which assets you want to post orders for. Use the tokenAddress of your factory contract
     * @param accountAddress Address of the factory owner's wallet
     * @param startAmount Price of the asset at the start of the auction, or minimum acceptable bid if it's an English auction. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param endAmount Optional price of the asset at the end of its expiration time. If not specified, will be set to `startAmount`. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param quantity The number of assets to sell at one time (if fungible or semi-fungible). Defaults to 1. In units, not base units, e.g. not wei.
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
     * @param waitForHighestBid If set to true, this becomes an English auction that increases in price for every bid. The highest bid wins when the auction expires, as long as it's at least `startAmount`. `expirationTime` must be > 0.
     * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
     * @param extraBountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of each order
     * @param buyerAddress Optional address that's allowed to purchase each item. If specified, no other address will be able to take each order.
     * @param buyerEmail Optional email of the user that's allowed to purchase each item. If specified, a user will have to verify this email before being able to take each order.
     * @param numberOfOrders Number of times to repeat creating the same order for each asset. If greater than 5, creates them in batches of 5. Requires an `apiKey` to be set during seaport initialization in order to not be throttled by the API.
     * @returns The number of orders created in total
     */
    createFactorySellOrders({ assets, accountAddress, startAmount, endAmount, quantity, expirationTime, waitForHighestBid, paymentTokenAddress, extraBountyBasisPoints, buyerAddress, buyerEmail, numberOfOrders }: {
        assets: Asset[];
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        quantity?: number;
        expirationTime?: number;
        waitForHighestBid?: boolean;
        paymentTokenAddress?: string;
        extraBountyBasisPoints?: number;
        buyerAddress?: string;
        buyerEmail?: string;
        numberOfOrders?: number;
    }): Promise<number>;
    /**
     * Create a sell order to auction a bundle of assets.
     * Will throw a 'You do not own this asset' error if the maker doesn't have one of the assets.
     * If the user hasn't approved access to any of the assets yet, this will emit `ApproveAllAssets` (or `ApproveAsset` if the contract doesn't support approve-all) before asking for approval for each asset.
     * @param param0 __namedParameters Object
     * @param bundleName Name of the bundle
     * @param bundleDescription Optional description of the bundle. Markdown is allowed.
     * @param bundleExternalLink Optional link to a page that adds context to the bundle.
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to bundle together.
     * @param collection Optional collection for computing fees, required only if all assets belong to the same collection
     * @param quantities The quantity of each asset to sell. Defaults to 1 for each.
     * @param accountAddress The address of the maker of the bundle and the owner of all the assets.
     * @param startAmount Price of the asset at the start of the auction, or minimum acceptable bid if it's an English auction.
     * @param endAmount Optional price of the asset at the end of its expiration time. If not specified, will be set to `startAmount`.
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
     * @param waitForHighestBid If set to true, this becomes an English auction that increases in price for every bid. The highest bid wins when the auction expires, as long as it's at least `startAmount`. `expirationTime` must be > 0.
     * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
     * @param extraBountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of this order
     * @param buyerAddress Optional address that's allowed to purchase this bundle. If specified, no other address will be able to take the order, unless it's the null address.
     */
    createBundleSellOrder({ bundleName, bundleDescription, bundleExternalLink, assets, collection, quantities, accountAddress, startAmount, endAmount, expirationTime, waitForHighestBid, paymentTokenAddress, extraBountyBasisPoints, buyerAddress }: {
        bundleName: string;
        bundleDescription?: string;
        bundleExternalLink?: string;
        assets: Asset[];
        collection?: {
            slug: string;
        };
        quantities?: number[];
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        expirationTime?: number;
        waitForHighestBid?: boolean;
        paymentTokenAddress?: string;
        extraBountyBasisPoints?: number;
        buyerAddress?: string;
    }): Promise<Order>;
    /**
     * Fullfill or "take" an order for an asset, either a buy or sell order
     * @param param0 __namedParamaters Object
     * @param order The order to fulfill, a.k.a. "take"
     * @param accountAddress The taker's wallet address
     * @param recipientAddress The optional address to receive the order's item(s) or curriencies. If not specified, defaults to accountAddress.
     * @param referrerAddress The optional address that referred the order
     * @returns Transaction hash for fulfilling the order
     */
    fulfillOrder({ order, accountAddress, recipientAddress, referrerAddress }: {
        order: Order;
        accountAddress: string;
        recipientAddress?: string;
        referrerAddress?: string;
    }): Promise<string>;
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
     * @param schemaName The Wyvern schema name corresponding to the asset type
     * @returns Transaction hash if a new transaction was created, otherwise null
     */
    approveSemiOrNonFungibleToken({ tokenId, tokenAddress, accountAddress, proxyAddress, tokenAbi, skipApproveAllIfTokenAddressIn, schemaName }: {
        tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        proxyAddress?: string;
        tokenAbi?: PartialReadonlyContractAbi;
        skipApproveAllIfTokenAddressIn?: Set<string>;
        schemaName?: WyvernSchemaName;
    }): Promise<string | null>;
    /**
     * Approve a fungible token (e.g. W-ETH) for use in trades.
     * Called internally, but exposed for dev flexibility.
     * Checks to see if the minimum amount is already approved, first.
     * @param param0 __namedParamters Object
     * @param accountAddress The user's wallet address
     * @param tokenAddress The contract address of the token being approved
     * @param proxyAddress The user's proxy address. If unspecified, uses the Wyvern token transfer proxy address.
     * @param minimumAmount The minimum amount needed to skip a transaction. Defaults to the max-integer.
     * @returns Transaction hash if a new transaction occurred, otherwise null
     */
    approveFungibleToken({ accountAddress, tokenAddress, proxyAddress, minimumAmount }: {
        accountAddress: string;
        tokenAddress: string;
        proxyAddress?: string;
        minimumAmount?: BigNumber;
    }): Promise<string | null>;
    /**
     * Un-approve a fungible token (e.g. W-ETH) for use in trades.
     * Called internally, but exposed for dev flexibility.
     * Useful for old ERC20s that require a 0 approval count before
     * changing the count
     * @param param0 __namedParamters Object
     * @param accountAddress The user's wallet address
     * @param tokenAddress The contract address of the token being approved
     * @param proxyAddress The user's proxy address. If unspecified, uses the Wyvern token transfer proxy address.
     * @returns Transaction hash
     */
    unapproveFungibleToken({ accountAddress, tokenAddress, proxyAddress }: {
        accountAddress: string;
        tokenAddress: string;
        proxyAddress?: string;
    }): Promise<string>;
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
     * @param recipientAddress The optional address to receive the order's item(s) or curriencies. If not specified, defaults to accountAddress.
     * @param referrerAddress The optional address that referred the order
     */
    isOrderFulfillable({ order, accountAddress, recipientAddress, referrerAddress }: {
        order: Order;
        accountAddress: string;
        recipientAddress?: string;
        referrerAddress?: string;
    }): Promise<boolean>;
    /**
     * Returns whether an asset is transferrable.
     * An asset may not be transferrable if its transfer function
     * is locked for some reason, e.g. an item is being rented within a game
     * or trading has been locked for an item type.
     * @param param0 __namedParamters Object
     * @param tokenId DEPRECATED: Token ID. Use `asset` instead.
     * @param tokenAddress DEPRECATED: Address of the token's contract. Use `asset` instead.
     * @param asset The asset to trade
     * @param fromAddress The account address that currently owns the asset
     * @param toAddress The account address that will be acquiring the asset
     * @param quantity The amount of the asset to transfer, if it's fungible (optional). In units (not base units), e.g. not wei.
     * @param useProxy Use the `fromAddress`'s proxy contract only if the `fromAddress` has already approved the asset for sale. Required if checking an ERC-721 v1 asset (like CryptoKitties) that doesn't check if the transferFrom caller is the owner of the asset (only allowing it if it's an approved address).
     * @param retries How many times to retry if false
     */
    isAssetTransferrable({ asset, fromAddress, toAddress, quantity, useProxy }: {
        asset: Asset;
        fromAddress: string;
        toAddress: string;
        quantity?: number | BigNumber;
        useProxy?: boolean;
    }, retries?: number): Promise<boolean>;
    /**
     * Transfer a fungible or non-fungible asset to another address
     * @param param0 __namedParamaters Object
     * @param fromAddress The owner's wallet address
     * @param toAddress The recipient's wallet address
     * @param asset The fungible or non-fungible asset to transfer
     * @param quantity The amount of the asset to transfer, if it's fungible (optional). In units (not base units), e.g. not wei.
     * @returns Transaction hash
     */
    transfer({ fromAddress, toAddress, asset, quantity }: {
        fromAddress: string;
        toAddress: string;
        asset: Asset;
        quantity?: number | BigNumber;
    }): Promise<string>;
    /**
     * Transfer one or more assets to another address.
     * ERC-721 and ERC-1155 assets are supported
     * @param param0 __namedParamaters Object
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to transfer.
     * @param fromAddress The owner's wallet address
     * @param toAddress The recipient's wallet address
     * @param schemaName The Wyvern schema name corresponding to the asset type, if not in each Asset definition
     * @returns Transaction hash
     */
    transferAll({ assets, fromAddress, toAddress, schemaName }: {
        assets: Asset[];
        fromAddress: string;
        toAddress: string;
        schemaName?: WyvernSchemaName;
    }): Promise<string>;
    /**
     * Get known payment tokens (ERC-20) that match your filters.
     * @param param0 __namedParamters Object
     * @param symbol Filter by the ERC-20 symbol for the token,
     *    e.g. "DAI" for Dai stablecoin
     * @param address Filter by the ERC-20 contract address for the token,
     *    e.g. "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359" for Dai
     * @param name Filter by the name of the ERC-20 contract.
     *    Not guaranteed to exist or be unique for each token type.
     *    e.g. '' for Dai and 'Decentraland' for MANA
     * FUTURE: officiallySupported: Filter for tokens that are
     *    officially supported and shown on opensea.io
     */
    getFungibleTokens({ symbol, address, name }?: {
        symbol?: string;
        address?: string;
        name?: string;
    }): Promise<OpenSeaFungibleToken[]>;
    /**
     * Get an account's balance of any Asset.
     * @param param0 __namedParameters Object
     * @param accountAddress Account address to check
     * @param asset The Asset to check balance for
     * @param retries How many times to retry if balance is 0
     */
    getAssetBalance({ accountAddress, asset }: {
        accountAddress: string;
        asset: Asset;
    }, retries?: number): Promise<BigNumber>;
    /**
     * Get the balance of a fungible token.
     * Convenience method for getAssetBalance for fungibles
     * @param param0 __namedParameters Object
     * @param accountAddress Account address to check
     * @param tokenAddress The address of the token to check balance for
     * @param schemaName Optional schema name for the fungible token
     * @param retries Number of times to retry if balance is undefined
     */
    getTokenBalance({ accountAddress, tokenAddress, schemaName }: {
        accountAddress: string;
        tokenAddress: string;
        schemaName?: WyvernSchemaName;
    }, retries?: number): Promise<BigNumber>;
    /**
     * Compute the fees for an order
     * @param param0 __namedParameters
     * @param asset Asset to use for fees. May be blank ONLY for multi-collection bundles.
     * @param side The side of the order (buy or sell)
     * @param accountAddress The account to check fees for (useful if fees differ by account, like transfer fees)
     * @param isPrivate Whether the order is private or not (known taker)
     * @param extraBountyBasisPoints The basis points to add for the bounty. Will throw if it exceeds the assets' contract's OpenSea fee.
     */
    computeFees({ asset, side, accountAddress, isPrivate, extraBountyBasisPoints }: {
        asset?: OpenSeaAsset;
        side: OrderSide;
        accountAddress?: string;
        isPrivate?: boolean;
        extraBountyBasisPoints?: number;
    }): Promise<ComputedFees>;
    /**
     * Validate and post an order to the OpenSea orderbook.
     * @param order The order to post. Can either be signed by the maker or pre-approved on the Wyvern contract using approveOrder. See https://github.com/ProjectWyvern/wyvern-ethereum/blob/master/contracts/exchange/Exchange.sol#L178
     * @returns The order as stored by the orderbook
     */
    validateAndPostOrder(order: Order): Promise<Order>;
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
     * Estimate the gas needed to match two orders. Returns undefined if tx errors
     * @param param0 __namedParamaters Object
     * @param buy The buy order to match
     * @param sell The sell order to match
     * @param accountAddress The taker's wallet address
     * @param metadata Metadata bytes32 to send with the match
     * @param retries Number of times to retry if false
     */
    _estimateGasForMatch({ buy, sell, accountAddress, metadata }: {
        buy: Order;
        sell: Order;
        accountAddress: string;
        metadata?: string;
    }, retries?: number): Promise<number | undefined>;
    /**
     * Estimate the gas needed to transfer assets in bulk
     * Used for tests
     * @param param0 __namedParamaters Object
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to transfer.
     * @param fromAddress The owner's wallet address
     * @param toAddress The recipient's wallet address
     * @param schemaName The Wyvern schema name corresponding to the asset type, if not in each asset
     */
    _estimateGasForTransfer({ assets, fromAddress, toAddress, schemaName }: {
        assets: Asset[];
        fromAddress: string;
        toAddress: string;
        schemaName?: WyvernSchemaName;
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
    /**
     * For a fungible token to use in trades (like W-ETH), get the amount
     *  approved for use by the Wyvern transfer proxy.
     * Internal method exposed for dev flexibility.
     * @param param0 __namedParamters Object
     * @param accountAddress Address for the user's wallet
     * @param tokenAddress Address for the token's contract
     * @param proxyAddress User's proxy address. If undefined, uses the token transfer proxy address
     */
    _getApprovedTokenCount({ accountAddress, tokenAddress, proxyAddress }: {
        accountAddress: string;
        tokenAddress?: string;
        proxyAddress?: string;
    }): Promise<BigNumber>;
    _makeBuyOrder({ asset, quantity, accountAddress, startAmount, expirationTime, paymentTokenAddress, extraBountyBasisPoints, sellOrder, referrerAddress }: {
        asset: Asset;
        quantity: number;
        accountAddress: string;
        startAmount: number;
        expirationTime: number;
        paymentTokenAddress: string;
        extraBountyBasisPoints: number;
        sellOrder?: UnhashedOrder;
        referrerAddress?: string;
    }): Promise<UnhashedOrder>;
    _makeSellOrder({ asset, quantity, accountAddress, startAmount, endAmount, expirationTime, waitForHighestBid, paymentTokenAddress, extraBountyBasisPoints, buyerAddress }: {
        asset: Asset;
        quantity: number;
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        waitForHighestBid: boolean;
        expirationTime: number;
        paymentTokenAddress: string;
        extraBountyBasisPoints: number;
        buyerAddress: string;
    }): Promise<UnhashedOrder>;
    _getStaticCallTargetAndExtraData({ asset, useTxnOriginStaticCall }: {
        asset: OpenSeaAsset;
        useTxnOriginStaticCall: boolean;
    }): Promise<{
        staticTarget: string;
        staticExtradata: string;
    }>;
    _makeBundleBuyOrder({ assets, collection, quantities, accountAddress, startAmount, expirationTime, paymentTokenAddress, extraBountyBasisPoints, sellOrder, referrerAddress }: {
        assets: Asset[];
        collection?: {
            slug: string;
        };
        quantities: number[];
        accountAddress: string;
        startAmount: number;
        expirationTime: number;
        paymentTokenAddress: string;
        extraBountyBasisPoints: number;
        sellOrder?: UnhashedOrder;
        referrerAddress?: string;
    }): Promise<UnhashedOrder>;
    _makeBundleSellOrder({ bundleName, bundleDescription, bundleExternalLink, assets, collection, quantities, accountAddress, startAmount, endAmount, expirationTime, waitForHighestBid, paymentTokenAddress, extraBountyBasisPoints, buyerAddress }: {
        bundleName: string;
        bundleDescription?: string;
        bundleExternalLink?: string;
        assets: Asset[];
        collection?: {
            slug: string;
        };
        quantities: number[];
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        expirationTime: number;
        waitForHighestBid: boolean;
        paymentTokenAddress: string;
        extraBountyBasisPoints: number;
        buyerAddress: string;
    }): Promise<UnhashedOrder>;
    _makeMatchingOrder({ order, accountAddress, recipientAddress }: {
        order: UnsignedOrder;
        accountAddress: string;
        recipientAddress: string;
    }): UnsignedOrder;
    /**
     * Validate against Wyvern that a buy and sell order can match
     * @param param0 __namedParamters Object
     * @param buy The buy order to validate
     * @param sell The sell order to validate
     * @param accountAddress Address for the user's wallet
     * @param shouldValidateBuy Whether to validate the buy order individually.
     * @param shouldValidateSell Whether to validate the sell order individually.
     * @param retries How many times to retry if validation fails
     */
    _validateMatch({ buy, sell, accountAddress, shouldValidateBuy, shouldValidateSell }: {
        buy: Order;
        sell: Order;
        accountAddress: string;
        shouldValidateBuy?: boolean;
        shouldValidateSell?: boolean;
    }, retries?: number): Promise<boolean>;
    _createEmailWhitelistEntry({ order, buyerEmail }: {
        order: UnhashedOrder;
        buyerEmail: string;
    }): Promise<void>;
    _sellOrderValidationAndApprovals({ order, accountAddress }: {
        order: UnhashedOrder;
        accountAddress: string;
    }): Promise<void>;
    /**
     * Instead of signing an off-chain order, you can approve an order
     * with on on-chain transaction using this method
     * @param order Order to approve
     * @returns Transaction hash of the approval transaction
     */
    _approveOrder(order: UnsignedOrder): Promise<string>;
    _validateOrder(order: Order): Promise<boolean>;
    _approveAll({ schemaNames, wyAssets, accountAddress, proxyAddress }: {
        schemaNames: WyvernSchemaName[];
        wyAssets: WyvernAsset[];
        accountAddress: string;
        proxyAddress?: string;
    }): Promise<(string | null)[]>;
    _buyOrderValidationAndApprovals({ order, counterOrder, accountAddress }: {
        order: UnhashedOrder;
        counterOrder?: Order;
        accountAddress: string;
    }): Promise<void>;
    /**
     * Check if an account, or its proxy, owns an asset on-chain
     * @param accountAddress Account address for the wallet
     * @param proxyAddress Proxy address for the account
     * @param wyAsset asset to check. If fungible, the `quantity` attribute will be the minimum amount to own
     * @param schemaName WyvernSchemaName for the asset
     */
    _ownsAssetOnChain({ accountAddress, proxyAddress, wyAsset, schemaName }: {
        accountAddress: string;
        proxyAddress?: string | null;
        wyAsset: WyvernAsset;
        schemaName: WyvernSchemaName;
    }): Promise<boolean>;
    _getBuyFeeParameters(totalBuyerFeeBasisPoints: number, totalSellerFeeBasisPoints: number, sellOrder?: UnhashedOrder): {
        makerRelayerFee: BigNumber;
        takerRelayerFee: BigNumber;
        makerProtocolFee: BigNumber;
        takerProtocolFee: BigNumber;
        makerReferrerFee: BigNumber;
        feeRecipient: string;
        feeMethod: FeeMethod;
    };
    _getSellFeeParameters(totalBuyerFeeBasisPoints: number, totalSellerFeeBasisPoints: number, waitForHighestBid: boolean, sellerBountyBasisPoints?: number): {
        makerRelayerFee: BigNumber;
        takerRelayerFee: BigNumber;
        makerProtocolFee: BigNumber;
        takerProtocolFee: BigNumber;
        makerReferrerFee: BigNumber;
        feeRecipient: string;
        feeMethod: FeeMethod;
    };
    /**
     * Validate fee parameters
     * @param totalBuyerFeeBasisPoints Total buyer fees
     * @param totalSellerFeeBasisPoints Total seller fees
     */
    private _validateFees;
    /**
     * Get the listing and expiration time paramters for a new order
     * @param expirationTimestamp Timestamp to expire the order (in seconds), or 0 for non-expiring
     * @param waitingForBestCounterOrder Whether this order should be hidden until the best match is found
     */
    private _getTimeParameters;
    /**
     * Compute the `basePrice` and `extra` parameters to be used to price an order.
     * Also validates the expiration time and auction type.
     * @param tokenAddress Address of the ERC-20 token to use for trading.
     * Use the null address for ETH
     * @param expirationTime When the auction expires, or 0 if never.
     * @param startAmount The base value for the order, in the token's main units (e.g. ETH instead of wei)
     * @param endAmount The end value for the order, in the token's main units (e.g. ETH instead of wei). If unspecified, the order's `extra` attribute will be 0
     */
    private _getPriceParameters;
    private _getMetadata;
    private _atomicMatch;
    private _getRequiredAmountForTakingSellOrder;
    private _authorizeOrder;
    private _getSchema;
    private _dispatch;
    /**
     * Get the clients to use for a read call
     * @param retries current retry value
     */
    private _getClientsForRead;
    private _confirmTransaction;
    private _pollCallbackForConfirmation;
}
