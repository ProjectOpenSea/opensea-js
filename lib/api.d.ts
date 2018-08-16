import 'isomorphic-unfetch';
import { OpenSeaAPIConfig, OrderJSON, Order, OpenSeaAsset } from './types';
export declare const ORDERBOOK_VERSION: number;
export declare const API_VERSION: number;
export declare class OpenSeaAPI {
    /**
     * Base url for the API
     */
    readonly apiBaseUrl: string;
    /**
     * Page size to use for fetching orders
     */
    pageSize: number;
    private apiKey;
    /**
     * Create an instance of the OpenSea API
     * @param param0 __namedParamters Object
     * @param apiKey Optional key to use for API
     * @param networkName `Network` type to use. Defaults to `Network.Main` (mainnet)
     */
    constructor({ apiKey, networkName }: OpenSeaAPIConfig);
    /**
     * Send an order to the orderbook.
     * Throws when the order is invalid.
     * @param order Order to post to the orderbook
     */
    postOrder(order: OrderJSON): Promise<Order>;
    /**
     * Get an order from the orderbook, returning `null` if none are found.
     * @param query Query to use for getting orders. A subset of parameters
     *  on the `OrderJSON` type is supported
     */
    getOrder(query: Partial<OrderJSON>): Promise<Order | null>;
    /**
     * Get a list of orders from the orderbook, returning the page of orders
     *  and the count of total orders found.
     * @param query Query to use for getting orders. A subset of parameters
     *  on the `OrderJSON` type is supported
     * @param page Page number, defaults to 1
     */
    getOrders(query?: Partial<OrderJSON>, page?: number): Promise<{
        orders: Order[];
        count: number;
    }>;
    /**
     * Fetch an asset from the API, return null if it isn't found
     * @param tokenAddress Address of the asset's contract
     * @param tokenId The asset's token ID
     */
    getAsset(tokenAddress: string, tokenId: string | number): Promise<OpenSeaAsset | null>;
    /**
     * Get JSON data from API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param query Data to send. Will be stringified using QueryString
     */
    get(apiPath: string, query?: object): Promise<Response>;
    /**
     * POST JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send. Will be JSON.stringified
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    post(apiPath: string, body?: object, opts?: RequestInit): Promise<Response>;
    /**
     * PUT JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    put(apiPath: string, body: object, opts?: RequestInit): Promise<Response>;
    /**
     * Get from an API Endpoint, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param opts RequestInit opts, similar to Fetch API
     */
    private _fetch;
}
