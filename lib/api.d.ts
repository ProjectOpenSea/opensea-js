import "isomorphic-unfetch";
import { BuildOfferResponse, FulfillmentDataResponse, OrderAPIOptions, OrderSide, OrdersQueryOptions, OrderV2, PostOfferResponse, ProtocolData, QueryCursors } from "./orders/types";
import { OpenSeaAPIConfig, OpenSeaAsset, OpenSeaAssetBundle, OpenSeaAssetBundleQuery, OpenSeaAssetQuery, OpenSeaCollection, OpenSeaFungibleToken, OpenSeaFungibleTokenQuery } from "./types";
export declare class OpenSeaAPI {
    /**
     * Base url for the API
     */
    readonly apiBaseUrl: string;
    /**
     * Page size to use for fetching orders
     */
    pageSize: number;
    /**
     * Logger function to use when debugging
     */
    logger: (arg: string) => void;
    private apiKey;
    private networkName;
    private retryDelay;
    /**
     * Create an instance of the OpenSea API
     * @param config OpenSeaAPIConfig for setting up the API, including an optional API key, network name, and base URL
     * @param logger Optional function for logging debug strings before and after requests are made
     */
    constructor(config: OpenSeaAPIConfig, logger?: (arg: string) => void);
    /**
     * Gets an order from API based on query options. Throws when no order is found.
     */
    getOrder({ side, protocol, orderDirection, orderBy, ...restOptions }: Omit<OrdersQueryOptions, "limit">): Promise<OrderV2>;
    /**
     * Gets a list of orders from API based on query options and returns orders
     * with next and previous cursors.
     */
    getOrders({ side, protocol, orderDirection, orderBy, ...restOptions }: Omit<OrdersQueryOptions, "limit">): Promise<QueryCursors & {
        orders: OrderV2[];
    }>;
    /**
     * Generate the data needed to fulfill a listing or an offer
     */
    generateFulfillmentData(fulfillerAddress: string, orderHash: string, protocolAddress: string, side: OrderSide): Promise<FulfillmentDataResponse>;
    /**
     * Send an order to be posted. Throws when the order is invalid.
     */
    postOrder(order: ProtocolData, apiOptions: OrderAPIOptions, { retries }?: {
        retries?: number;
    }): Promise<OrderV2>;
    /**
     * Build an offer
     */
    buildOffer(offererAddress: string, quantity: number, collectionSlug: string): Promise<BuildOfferResponse>;
    /**
     * Post collection offer
     */
    postCollectionOffer(order: ProtocolData, slug: string, retries?: number): Promise<PostOfferResponse | null>;
    /**
     * Create a whitelist entry for an asset to prevent others from buying.
     * Buyers will have to have verified at least one of the emails
     * on an asset in order to buy.
     * This will throw a 403 if the given API key isn't allowed to create whitelist entries for this contract or asset.
     * @param tokenAddress Address of the asset's contract
     * @param tokenId The asset's token ID
     * @param email The email allowed to buy.
     */
    postAssetWhitelist(tokenAddress: string, tokenId: string | number, email: string): Promise<boolean>;
    /**
     * Fetch an asset from the API, throwing if none is found
     * @param tokenAddress Address of the asset's contract
     * @param tokenId The asset's token ID, or null if ERC-20
     * @param retries Number of times to retry if the service is unavailable for any reason
     */
    getAsset({ tokenAddress, tokenId, }: {
        tokenAddress: string;
        tokenId: string | number | null;
    }, retries?: number): Promise<OpenSeaAsset>;
    /**
     * Fetch list of assets from the API, returning the page of assets and the count of total assets
     * @param query Query to use for getting orders. A subset of parameters on the `OpenSeaAssetJSON` type is supported
     */
    getAssets(query?: OpenSeaAssetQuery): Promise<{
        assets: OpenSeaAsset[];
        estimatedCount: number;
        next: string | undefined;
        previous: string | undefined;
    }>;
    /**
     * Fetch a collection through the API
     */
    getCollection(slug: string): Promise<OpenSeaCollection>;
    /**
     * Fetch list of fungible tokens from the API matching parameters
     * @param query Query to use for getting orders. A subset of parameters on the `OpenSeaAssetJSON` type is supported
     * @param page Page number, defaults to 1. Can be overridden by
     * `limit` and `offset` attributes from OpenSeaFungibleTokenQuery
     * @param retries Number of times to retry if the service is unavailable for any reason
     */
    getPaymentTokens(query?: OpenSeaFungibleTokenQuery, page?: number, retries?: number): Promise<{
        tokens: OpenSeaFungibleToken[];
    }>;
    /**
     * Fetch a bundle from the API, return null if it isn't found
     * @param slug The bundle's identifier
     */
    getBundle({ slug, }: {
        slug: string;
    }): Promise<OpenSeaAssetBundle | null>;
    /**
     * Fetch list of bundles from the API, returning the page of bundles and the count of total bundles
     * @param query Query to use for getting orders. A subset of parameters on the `OpenSeaAssetBundleJSON` type is supported
     * @param page Page number, defaults to 1. Can be overridden by
     * `limit` and `offset` attributes from OpenSeaAssetBundleQuery
     */
    getBundles(query?: OpenSeaAssetBundleQuery, page?: number): Promise<{
        bundles: OpenSeaAssetBundle[];
        estimatedCount: number;
    }>;
    /**
     * Get JSON data from API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param query Data to send. Will be stringified using QueryString
     */
    get<T>(apiPath: string, query?: object): Promise<T>;
    /**
     * POST JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send. Will be JSON.stringified
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    post<T>(apiPath: string, body?: object, opts?: RequestInit): Promise<T>;
    /**
     * PUT JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    put(apiPath: string, body: object, opts?: RequestInit): Promise<unknown>;
    /**
     * Get from an API Endpoint, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param opts RequestInit opts, similar to Fetch API
     */
    private _fetch;
    private _handleApiResponse;
}
