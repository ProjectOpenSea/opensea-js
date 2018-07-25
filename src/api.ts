import * as fetch from 'isomorphic-unfetch'

import { Network,  OpenSeaAPIConfig, Order } from './types'

const ORDERBOOK_PATH = `/wyvern/v0`

export class OpenSeaAPI {

  private apiKey: string | undefined
  private apiBaseUrl: string

  constructor({apiKey, networkName}: OpenSeaAPIConfig) {
    this.apiKey = apiKey

    switch (networkName) {
      case Network.Rinkeby:
        this.apiBaseUrl = 'https://rinkeby-api.opensea.io'
        break
      case Network.Main:
      default:
        this.apiBaseUrl = 'https://api.opensea.io'
        break
    }
  }

  public async postOrder(order: Order) {
    return this.post(
      `${ORDERBOOK_PATH}/orders/post`,
      order,
    )
  }

  /**
   * Send JSON data to API, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param opts RequestInit opts, similar to Fetch API, but
   * body can be an object and will get JSON-stringified. Like with
   * `fetch`, it can't be present when the method is "GET"
   */
  public async post(apiPath: string, body: any, opts = {}) {

    const fetchOpts = {
      method: 'POST', ...opts,
      body: JSON.stringify(body || opts.body),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }}

    return this._fetch(apiPath, fetchOpts)
  }

  /**
   * Get from an API Endpoint, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param opts RequestInit opts, similar to Fetch API
   */
  public async _fetch(apiPath, opts = {}) {

    const apiBase = this.apiBaseUrl
    const apiKey = this.apiKey
    return fetch(apiBase + apiPath, {
      ...opts,
      headers: {
        ...(apiKey ? { 'X-API-KEY': apiKey } : {}),
        ...(opts.headers || {}),
      },
    }).then(throwOnUnauth)
  }
}

function throwOnUnauth(response) {
  if (!response.ok && response.status === 401) {
    throw new Error('Unauthorized')
  }
  return response
}
