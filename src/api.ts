import 'isomorphic-unfetch'
import * as QueryString from 'query-string'
import { Network, OpenSeaAPIConfig, OrderJSON, Order, OrderbookResponse } from './types'
import { orderFromJSON } from './wyvern'

const ORDERBOOK_VERSION: string = `v1`

const API_BASE_MAINNET = 'https://api.opensea.io'
const API_BASE_RINKEBY = 'https://rinkeby-api.opensea.io'
const ORDERBOOK_PATH = `/wyvern/${ORDERBOOK_VERSION}`

export class OpenSeaAPI {

  public readonly apiBaseUrl: string
  public pageSize = 20

  private apiKey: string | undefined

  constructor({apiKey, networkName}: OpenSeaAPIConfig) {
    this.apiKey = apiKey

    switch (networkName) {
      case Network.Rinkeby:
        this.apiBaseUrl = API_BASE_RINKEBY
        break
      case Network.Main:
      default:
        this.apiBaseUrl = API_BASE_MAINNET
        break
    }
  }

  public async postOrder(order: OrderJSON): Promise<Order> {
    const response = await this.post(
      `${ORDERBOOK_PATH}/orders/post`,
      order,
    )
    const json: OrderJSON = await response.json()
    return orderFromJSON(json)
  }

  public async getOrder(query: Partial<OrderJSON>): Promise<Order | null> {
    const response = await this.get(
      `${ORDERBOOK_PATH}/orders`,
      query
    )
    if (ORDERBOOK_VERSION == 'v0') {
      const json: OrderJSON[] = await response.json()
      const orderJSON = json[0]
      return orderJSON ? orderFromJSON(orderJSON) : null
    } else {
      const json: OrderbookResponse = await response.json()
      const orderJSON = json.orders[0]
      return orderJSON ? orderFromJSON(orderJSON) : null
    }
  }

  public async getOrders(
      query: Partial<OrderJSON> = {},
      page = 1
    ): Promise<{orders: Order[]; count: number}> {

    const response = await this.get(
      `${ORDERBOOK_PATH}/orders`,
      {
        ...query,
        page
      }
    )
    if (ORDERBOOK_VERSION == 'v0') {
      const json: OrderJSON[] = await response.json()
      return {
        orders: json.map(orderFromJSON),
        count: json.length
      }
    } else {
      const json: OrderbookResponse = await response.json()
      return {
        orders: json.orders.map(orderFromJSON),
        count: json.count
      }
    }
  }

  /**
   * Get JSON data from API, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param query Data to send. Will be stringified using QueryString
   */
  private async get(apiPath: string, query: object = {}) {

    const qs = QueryString.stringify(query)
    const url = `${apiPath}?${qs}`

    return this._fetch(url)
  }

  /**
   * POST JSON data to API, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param body Data to send. Will be JSON.stringified
   * @param opts RequestInit opts, similar to Fetch API. If it contains
   *  a body, it won't be stringified.
   */
  private async post(apiPath: string, body?: object, opts: RequestInit = {}) {

    const fetchOpts = {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      ...opts
    }

    return this._fetch(apiPath, fetchOpts)
  }

  /**
   * PUT JSON data to API, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param body Data to send
   * @param opts RequestInit opts, similar to Fetch API. If it contains
   *  a body, it won't be stringified.
   */
  private async put(apiPath: string, body: object, opts: RequestInit = {}) {
    return this.post(apiPath, body, {
      method: 'PUT',
      ...opts
    })
  }

  /**
   * Get from an API Endpoint, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param opts RequestInit opts, similar to Fetch API
   */
  private async _fetch(apiPath: string, opts: RequestInit = {}) {

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

function throwOnUnauth(response: Response) {
  if (!response.ok && response.status == 401) {
    throw new Error('Unauthorized')
  }
  return response
}
