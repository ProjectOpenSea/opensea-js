import * as Web3 from 'web3';
import { Schema } from 'wyvern-schemas/dist-tsc/types';
import { OpenSeaAPI } from './api';
import { OpenSeaAPIConfig, OrderSide, UnhashedOrder, Order, UnsignedOrder, PartialReadonlyContractAbi, EventType, EventData, WyvernSchemaName, OpenSeaFungibleToken, WyvernAsset, OpenSeaFees, Asset, OpenSeaAssetContract, FungibleAsset } from './types';
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
    private _wyvernProtocolReadOnly;
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
     * Create a buy order to make an offer on a bundle or group of assets.
     * Will throw an 'Insufficient balance' error if the maker doesn't have enough W-ETH to make the offer.
     * If the user hasn't approved W-ETH access yet, this will emit `ApproveCurrency` before asking for approval.
     * @param param0 __namedParameters Object
     * @param tokenIds DEPRECATED: Token IDs of the assets. Use `assets` instead.
     * @param tokenAddresses DEPRECATED: Addresses of the tokens' contracts. Use `assets` instead.
     * @param assets Array of Asset objects to bid on
     * @param accountAddress Address of the maker's wallet
     * @param startAmount Value of the offer, in units of the payment token (or wrapped ETH if no payment token address specified)
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire"
     * @param paymentTokenAddress Optional address for using an ERC-20 token in the order. If unspecified, defaults to W-ETH
     * @param sellOrder Optional sell order (like an English auction) to ensure fee compatibility
     * @param schemaName The Wyvern schema name corresponding to the asset type
     */
    createBundleBuyOrder({ tokenIds, tokenAddresses, assets, accountAddress, startAmount, expirationTime, paymentTokenAddress, sellOrder, schemaName }: {
        tokenIds: string[];
        tokenAddresses: string[];
        assets: Asset[];
        accountAddress: string;
        startAmount: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
        sellOrder?: Order;
        schemaName?: WyvernSchemaName;
    }): Promise<Order>;
    /**
     * Create a buy order to make an offer on an asset.
     * Will throw an 'Insufficient balance' error if the maker doesn't have enough W-ETH to make the offer.
     * If the user hasn't approved W-ETH access yet, this will emit `ApproveCurrency` before asking for approval.
     * @param param0 __namedParameters Object
     * @param tokenId DEPRECATED: Token ID. Use `asset` instead.
     * @param tokenAddress DEPRECATED: Address of the token's contract. Use `asset` instead.
     * @param asset The NFT ("Asset") or fungible token ("FungibleAsset") to trade
     * @param accountAddress Address of the maker's wallet
     * @param startAmount Value of the offer, in units of the payment token (or wrapped ETH if no payment token address specified)
     * @param quantity The number of assets to bid for (if fungible or semi-fungible). Defaults to 1.
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire"
     * @param paymentTokenAddress Optional address for using an ERC-20 token in the order. If unspecified, defaults to W-ETH
     * @param sellOrder Optional sell order (like an English auction) to ensure fee compatibility
     * @param schemaName The Wyvern schema name corresponding to the asset type
     */
    createBuyOrder({ tokenId, tokenAddress, asset, accountAddress, startAmount, quantity, expirationTime, paymentTokenAddress, sellOrder, schemaName }: {
        tokenId: string;
        tokenAddress: string;
        asset: Asset | FungibleAsset;
        accountAddress: string;
        startAmount: number;
        quantity?: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
        sellOrder?: Order;
        schemaName?: WyvernSchemaName;
    }): Promise<Order>;
    /**
     * Create a sell order to auction an asset.
     * Will throw a 'You do not own this asset' error if the maker doesn't have the asset.
     * If the user hasn't approved access to the token yet, this will emit `ApproveAllAssets` (or `ApproveAsset` if the contract doesn't support approve-all) before asking for approval.
     * @param param0 __namedParameters Object
     * @param tokenId DEPRECATED: Token ID. Use `asset` instead.
     * @param tokenAddress DEPRECATED: Address of the token's contract. Use `asset` instead.
     * @param asset The NFT ("Asset") or fungible token ("FungibleAsset") to trade
     * @param accountAddress Address of the maker's wallet
     * @param startAmount Price of the asset at the start of the auction. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param endAmount Optional price of the asset at the end of its expiration time. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param quantity The number of assets to sell (if fungible or semi-fungible). Defaults to 1.
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
     * @param waitForHighestBid If set to true, this becomes an English auction that increases in price for every bid. The highest bid wins when the auction expires, as long as it's at least `startAmount`. `expirationTime` must be > 0.
     * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
     * @param extraBountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of this order
     * @param buyerAddress Optional address that's allowed to purchase this item. If specified, no other address will be able to take the order, unless its value is the null address.
     * @param buyerEmail Optional email of the user that's allowed to purchase this item. If specified, a user will have to verify this email before being able to take the order.
     * @param schemaName The Wyvern schema name corresponding to the asset type
     */
    createSellOrder({ tokenId, tokenAddress, asset, accountAddress, startAmount, endAmount, quantity, expirationTime, waitForHighestBid, paymentTokenAddress, extraBountyBasisPoints, buyerAddress, buyerEmail, schemaName }: {
        tokenId?: string;
        tokenAddress?: string;
        asset: Asset | FungibleAsset;
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
     * @param assetId Identifier for the asset, if you just want to post orders for one asset.
     * @param assetIds Identifiers for the assets, if you want to post orders for many assets at once.
     * @param factoryAddress Address of the factory contract
     * @param accountAddress Address of the factory owner's wallet
     * @param startAmount Price of the asset at the start of the auction, or minimum acceptable bid if it's an English auction. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param endAmount Optional price of the asset at the end of its expiration time. If not specified, will be set to `startAmount`. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
     * @param waitForHighestBid If set to true, this becomes an English auction that increases in price for every bid. The highest bid wins when the auction expires, as long as it's at least `startAmount`. `expirationTime` must be > 0.
     * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
     * @param extraBountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of each order
     * @param buyerAddress Optional address that's allowed to purchase each item. If specified, no other address will be able to take each order.
     * @param buyerEmail Optional email of the user that's allowed to purchase each item. If specified, a user will have to verify this email before being able to take each order.
     * @param numberOfOrders Number of times to repeat creating the same order for each asset. If greater than 5, creates them in batches of 5. Requires an `apiKey` to be set during seaport initialization in order to not be throttled by the API.
     */
    createFactorySellOrders({ assetId, assetIds, factoryAddress, accountAddress, startAmount, endAmount, expirationTime, waitForHighestBid, paymentTokenAddress, extraBountyBasisPoints, buyerAddress, buyerEmail, numberOfOrders, schemaName }: {
        assetId?: string;
        assetIds?: string[];
        factoryAddress: string;
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        expirationTime?: number;
        waitForHighestBid?: boolean;
        paymentTokenAddress?: string;
        extraBountyBasisPoints?: number;
        buyerAddress?: string;
        buyerEmail?: string;
        numberOfOrders?: number;
        schemaName?: WyvernSchemaName;
    }): Promise<Order[]>;
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
     * @param startAmount Price of the asset at the start of the auction, or minimum acceptable bid if it's an English auction.
     * @param endAmount Optional price of the asset at the end of its expiration time. If not specified, will be set to `startAmount`.
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
     * @param waitForHighestBid If set to true, this becomes an English auction that increases in price for every bid. The highest bid wins when the auction expires, as long as it's at least `startAmount`. `expirationTime` must be > 0.
     * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
     * @param extraBountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of this order
     * @param buyerAddress Optional address that's allowed to purchase this bundle. If specified, no other address will be able to take the order, unless it's the null address.
     * @param schemaName The Wyvern schema name corresponding to the asset type
     */
    createBundleSellOrder({ bundleName, bundleDescription, bundleExternalLink, assets, accountAddress, startAmount, endAmount, expirationTime, waitForHighestBid, paymentTokenAddress, extraBountyBasisPoints, buyerAddress, schemaName }: {
        bundleName: string;
        bundleDescription?: string;
        bundleExternalLink?: string;
        assets: Asset[];
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        expirationTime?: number;
        waitForHighestBid?: boolean;
        paymentTokenAddress?: string;
        extraBountyBasisPoints?: number;
        buyerAddress?: string;
        schemaName?: WyvernSchemaName;
    }): Promise<Order>;
    /**
     * Fullfill or "take" an order for an asset, either a buy or sell order
     * @param param0 __namedParamaters Object
     * @param order The order to fulfill, a.k.a. "take"
     * @param accountAddress The taker's wallet address
     * @param recipientAddress The optional address to receive the order's item(s) or curriencies. If not specified, defaults to accountAddress.
     * @param referrerAddress The optional address that referred the order
     */
    fulfillOrder({ order, accountAddress, recipientAddress, referrerAddress }: {
        order: Order;
        accountAddress: string;
        recipientAddress?: string;
        referrerAddress?: string;
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
     * @param schemaName The Wyvern schema name corresponding to the asset type
     * @returns Transaction hash if a new transaction was created, otherwise null
     */
    approveNonFungibleToken({ tokenId, tokenAddress, accountAddress, proxyAddress, tokenAbi, skipApproveAllIfTokenAddressIn, schemaName }: {
        tokenId: string;
        tokenAddress: string;
        accountAddress: string;
        proxyAddress: string | null;
        tokenAbi?: PartialReadonlyContractAbi;
        skipApproveAllIfTokenAddressIn?: string[];
        schemaName?: WyvernSchemaName;
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
     * @param recipientAddress The optional address to receive the order's item(s) or curriencies. If not specified, defaults to accountAddress.
     * @param referrerAddress The optional address that referred the order
     * @param retries How many times to retry if false
     */
    isOrderFulfillable({ order, accountAddress, recipientAddress, referrerAddress }: {
        order: Order;
        accountAddress: string;
        recipientAddress?: string;
        referrerAddress?: string;
    }, retries?: number): Promise<boolean>;
    /**
     * Returns whether an asset is transferrable.
     * An asset may not be transferrable if its transfer function
     * is locked for some reason, e.g. an item is being rented within a game
     * or trading has been locked for an item type.
     * @param param0 __namedParamters Object
     * @param tokenId DEPRECATED: Token ID. Use `asset` instead.
     * @param tokenAddress DEPRECATED: Address of the token's contract. Use `asset` instead.
     * @param asset The NFT ("Asset") or fungible token ("FungibleAsset") to trade
     * @param fromAddress The account address that currently owns the asset
     * @param toAddress The account address that will be acquiring the asset
     * @param didOwnerApprove If the owner and fromAddress has already approved the asset for sale. Required if checking an ERC-721 v1 asset (like CryptoKitties) that doesn't check if the transferFrom caller is the owner of the asset (only allowing it if it's an approved address).
     * @param schemaName The Wyvern schema name corresponding to the asset type
     * @param retries How many times to retry if false
     */
    isAssetTransferrable({ tokenId, tokenAddress, asset, fromAddress, toAddress, quantity, didOwnerApprove, schemaName }: {
        tokenId?: string;
        tokenAddress?: string;
        asset: Asset | FungibleAsset;
        fromAddress: string;
        toAddress: string;
        quantity?: number;
        didOwnerApprove?: boolean;
        schemaName?: WyvernSchemaName;
    }, retries?: number): Promise<boolean>;
    /**
     * DEPRECATED: use `transfer` instead, which works for
     * more types of assets (including fungibles and old
     * non-fungibles).
     * Transfer an NFT asset to another address
     * @param param0 __namedParamaters Object
     * @param asset The asset to transfer
     * @param fromAddress The owner's wallet address
     * @param toAddress The recipient's wallet address
     * @param isWyvernAsset Whether the passed asset is a generic WyvernAsset, for backwards compatibility
     * @param schemaName The Wyvern schema name corresponding to the asset type
     * @returns Transaction hash
     */
    transferOne({ asset, fromAddress, toAddress, isWyvernAsset, schemaName }: {
        asset: Asset | WyvernAsset;
        fromAddress: string;
        toAddress: string;
        isWyvernAsset?: boolean;
        schemaName?: WyvernSchemaName;
    }): Promise<string>;
    /**
     * Transfer a fungible or non-fungible asset to another address
     * @param param0 __namedParamaters Object
     * @param fromAddress The owner's wallet address
     * @param toAddress The recipient's wallet address
     * @param asset The fungible or non-fungible asset to transfer
     * @param quantity The amount of the asset to transfer, if it's fungible (optional)
     * @param schemaName The Wyvern schema name corresponding to the asset type.
     * Defaults to "ERC721" (non-fungible) assets, but can be ERC1155, ERC20, and others.
     * @returns Transaction hash
     */
    transfer({ fromAddress, toAddress, asset, quantity, schemaName }: {
        fromAddress: string;
        toAddress: string;
        asset: Asset | FungibleAsset;
        quantity?: number;
        schemaName?: WyvernSchemaName;
    }): Promise<string>;
    /**
     * Transfer one or more assets to another address.
     * ERC-721 and ERC-1155 assets are supported
     * @param param0 __namedParamaters Object
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to transfer.
     * @param fromAddress The owner's wallet address
     * @param toAddress The recipient's wallet address
     * @param schemaName The Wyvern schema name corresponding to the asset type
     * @returns Transaction hash
     */
    transferAll({ assets, fromAddress, toAddress, schemaName }: {
        assets: Asset[];
        fromAddress: string;
        toAddress: string;
        schemaName?: WyvernSchemaName;
    }): Promise<string>;
    /**
     * Get known fungible tokens (ERC-20) that match your filters.
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
     * Get the balance of a fungible token.
     * @param param0 __namedParameters Object
     * @param accountAddress User's account address
     * @param tokenAddress Optional address of the token's contract.
     *  Defaults to W-ETH
     * @param tokenAbi ABI for the token's contract. Defaults to ERC20
     */
    getTokenBalance({ accountAddress, tokenAddress, tokenAbi }: {
        accountAddress: string;
        tokenAddress?: string;
        tokenAbi?: PartialReadonlyContractAbi;
    }): Promise<BigNumber>;
    /**
     * Compute the fees for an order
     * @param param0 __namedParameters
     * @param assets Array of addresses and ids that will be in the order
     * @param assetContract Optional prefetched asset contract (including fees) to use instead of assets
     * @param side The side of the order (buy or sell)
     * @param isPrivate Whether the order is private or not (known taker)
     * @param extraBountyBasisPoints The basis points to add for the bounty. Will throw if it exceeds the assets' contract's OpenSea fee.
     */
    computeFees({ assets, assetContract, side, isPrivate, extraBountyBasisPoints }: {
        assets?: Array<Asset | FungibleAsset>;
        assetContract?: OpenSeaAssetContract;
        side: OrderSide;
        isPrivate?: boolean;
        extraBountyBasisPoints?: number;
    }): Promise<OpenSeaFees>;
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
     * Estimate the gas needed to match two orders
     * @param param0 __namedParamaters Object
     * @param buy The buy order to match
     * @param sell The sell order to match
     * @param accountAddress The taker's wallet address
     * @param metadata Metadata bytes32 to send with the match
     */
    _estimateGasForMatch({ buy, sell, accountAddress, metadata }: {
        buy: Order;
        sell: Order;
        accountAddress: string;
        metadata?: string;
    }): Promise<number>;
    /**
     * Estimate the gas needed to transfer assets in bulk
     * Used for tests
     * @param param0 __namedParamaters Object
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to transfer.
     * @param fromAddress The owner's wallet address
     * @param toAddress The recipient's wallet address
     * @param schemaName The Wyvern schema name corresponding to the asset type
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
     */
    _getApprovedTokenCount({ accountAddress, tokenAddress }: {
        accountAddress: string;
        tokenAddress?: string;
    }): Promise<BigNumber>;
    _makeBuyOrder({ asset, quantity, accountAddress, startAmount, expirationTime, paymentTokenAddress, extraBountyBasisPoints, sellOrder, schemaName }: {
        asset: Asset | FungibleAsset;
        quantity: number;
        accountAddress: string;
        startAmount: number;
        expirationTime: number;
        paymentTokenAddress: string;
        extraBountyBasisPoints: number;
        sellOrder?: UnhashedOrder;
        schemaName: WyvernSchemaName;
    }): Promise<UnhashedOrder>;
    _makeSellOrder({ asset, quantity, accountAddress, startAmount, endAmount, expirationTime, waitForHighestBid, paymentTokenAddress, extraBountyBasisPoints, buyerAddress, schemaName }: {
        asset: Asset | FungibleAsset;
        quantity: number;
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        waitForHighestBid: boolean;
        expirationTime: number;
        paymentTokenAddress: string;
        extraBountyBasisPoints: number;
        buyerAddress: string;
        schemaName: WyvernSchemaName;
    }): Promise<UnhashedOrder>;
    _makeBundleBuyOrder({ assets, accountAddress, startAmount, expirationTime, paymentTokenAddress, extraBountyBasisPoints, sellOrder, schemaName }: {
        assets: Asset[];
        accountAddress: string;
        startAmount: number;
        expirationTime: number;
        paymentTokenAddress: string;
        extraBountyBasisPoints: number;
        sellOrder?: UnhashedOrder;
        schemaName: WyvernSchemaName;
    }): Promise<UnhashedOrder>;
    _makeBundleSellOrder({ bundleName, bundleDescription, bundleExternalLink, assets, accountAddress, startAmount, endAmount, expirationTime, waitForHighestBid, paymentTokenAddress, extraBountyBasisPoints, buyerAddress, schemaName }: {
        bundleName: string;
        bundleDescription?: string;
        bundleExternalLink?: string;
        assets: Asset[];
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        expirationTime: number;
        waitForHighestBid: boolean;
        paymentTokenAddress: string;
        extraBountyBasisPoints: number;
        buyerAddress: string;
        schemaName: WyvernSchemaName;
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
    _approveAll({ schema, wyAssets, accountAddress, proxyAddress }: {
        schema: Schema<any>;
        wyAssets: WyvernAsset[];
        accountAddress: string;
        proxyAddress?: string | null;
    }): Promise<(string | null)[]>;
    _buyOrderValidationAndApprovals({ order, counterOrder, accountAddress }: {
        order: UnhashedOrder;
        counterOrder?: Order;
        accountAddress: string;
    }): Promise<void>;
    /**
     * Get the listing and expiration time paramters for a new order
     * @param expirationTimestamp Timestamp to expire the order, or 0 for non-expiring
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
     * @param waitingForBestCounterOrder If true, this is an English auction order that should increase in price with every counter order until `expirationTime`.
     */
    private _getPriceParameters;
    private _getMetadata;
    private _atomicMatch;
    private _getRequiredAmountForTakingSellOrder;
    private _authorizeOrder;
    private _getSchema;
    private _dispatch;
    private _confirmTransaction;
    private _pollCallbackForConfirmation;
}
