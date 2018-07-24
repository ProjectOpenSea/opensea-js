import { OpenSeaAPIConfig, Order } from './types';
export declare class OpenSeaAPI {
    private apiKey;
    private apiBaseUrl;
    private orderbookPath;
    constructor({ apiKey, networkName }: OpenSeaAPIConfig);
    postOrder(order: Order): Promise<any>;
    /**
     * Send JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param opts RequestInit opts, similar to Fetch API, but
     * body can be an object and will get JSON-stringified. Like with
     * `fetch`, it can't be present when the method is "GET"
     */
    post(apiPath: string, body: any, opts?: {}): Promise<any>;
    /**
     * Get from an API Endpoint, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param opts RequestInit opts, similar to Fetch API
     */
    _fetch(apiPath: any, opts?: {}): Promise<any>;
}
