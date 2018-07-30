import * as fetch from 'isomorphic-unfetch';
import { OpenSeaAPIConfig, OrderJSON } from './types';
export declare class OpenSeaAPI {
    apiBaseUrl: string;
    private apiKey;
    constructor({ apiKey, networkName }: OpenSeaAPIConfig);
    postOrder(order: OrderJSON): Promise<fetch.IsomorphicResponse>;
    /**
     * Send JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param opts RequestInit opts, similar to Fetch API, but
     * body can be an object and will get JSON-stringified. Like with
     * `fetch`, it can't be present when the method is "GET"
     */
    post(apiPath: string, body: object, opts?: {
        body?: object;
    }): Promise<fetch.IsomorphicResponse>;
    /**
     * Get from an API Endpoint, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param opts RequestInit opts, similar to Fetch API
     */
    _fetch(apiPath: string, opts?: {
        headers?: object;
    }): Promise<fetch.IsomorphicResponse>;
}
