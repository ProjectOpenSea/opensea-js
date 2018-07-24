import fetch from 'isomorphic-unfetch';
import { Order } from './types';

export default class OpenSeaAPI {

  public apiKey: string | undefined;

  private apiBaseUrl: string;
  private orderbookPath: string;

  constructor(apiKey?: string, networkName?: string) {
    this.apiKey = apiKey;

    switch (networkName) {
      case 'rinkeby':
        this.apiBaseUrl = 'https://rinkeby-api.opensea.io';
        break;
      case 'main':
      default:
        this.apiBaseUrl = 'https://api.opensea.io';
        break;
    }

    this.orderbookPath = `/wyvern/v0`;
  }

  public async postOrder(order : Order) {
    return this.post(
      `${this.orderbookPath}/orders/post`,
      order,
    );
  }

  /**
   * Send JSON data to API, sending auth token in headers
   * @param {string} apiPath Path to URL endpoint under API
   * @param {object} opts RequestInit opts, similar to Fetch API, but
   * body can be an object and will get JSON-stringified. Like with
   * `fetch`, it can't be present when the method is "GET"
   */
  public async post(apiPath, body, opts = {}) {

    const fetchOpts = {
      method: 'POST', ...opts,
      body: JSON.stringify(body || opts.body),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }};

    return this._fetch(apiPath, fetchOpts);
  }

  /**
   * Get from an API Endpoint, sending auth token in headers
   * @param {string} apiPath Path to URL endpoint under API
   * @param {object} opts RequestInit opts, similar to Fetch API
   */
  public async _fetch(apiPath, opts = {}) {

    const apiBase = this.apiBaseUrl;
    const apiKey = this.apiKey;
    return fetch(apiBase + apiPath, {
      ...opts,
      headers: {
        ...(apiKey ? { 'X-API-KEY': apiKey } : {}),
        ...(opts.headers || {}),
      },
    }).then(throwOnUnauth);
  }
}

function throwOnUnauth(response) {
  if (!response.ok && response.status == 401) {
    throw new Error('Unauthorized');
  }
  return response;
}
