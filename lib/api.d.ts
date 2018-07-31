import 'isomorphic-unfetch';
import { OpenSeaAPIConfig, OrderJSON, Order } from './types';
export declare class OpenSeaAPI {
    readonly apiBaseUrl: string;
    pageSize: number;
    private apiKey;
    constructor({ apiKey, networkName }: OpenSeaAPIConfig);
    postOrder(order: OrderJSON): Promise<Order>;
    getOrder(query: Partial<OrderJSON>): Promise<Order | null>;
    getOrders(query?: Partial<OrderJSON>, page?: number): Promise<{
        orders: Order[];
        count: number;
    }>;
    /**
     * Get JSON data from API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param query Data to send. Will be stringified using QueryString
     */
    private get;
    /**
     * POST JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send. Will be JSON.stringified
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    private post;
    /**
     * PUT JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    private put;
    /**
     * Get from an API Endpoint, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param opts RequestInit opts, similar to Fetch API
     */
    private _fetch;
}
