export default class OpenSeaAPI {
    constructor({ apiKey, networkName }: {
        apiKey: any;
        networkName: any;
    });
    postOrder(order: any): Promise<any>;
    /**
     * Send JSON data to API, sending auth token in headers
     * @param {string} apiPath Path to URL endpoint under API
     * @param {object} opts RequestInit opts, similar to Fetch API, but
     * body can be an object and will get JSON-stringified. Like with
     * `fetch`, it can't be present when the method is "GET"
     */
    post(apiPath: any, body: any, opts?: {}): Promise<any>;
    /**
     * Get from an API Endpoint, sending auth token in headers
     * @param {string} apiPath Path to URL endpoint under API
     * @param {object} opts RequestInit opts, similar to Fetch API
     */
    _fetch(apiPath: any, opts?: {}): Promise<any>;
}
