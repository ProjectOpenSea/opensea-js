import fetch from 'isomorphic-unfetch'

export default class OpenSeaAPI {
  
  constructor({ apiKey, networkName }) {
    this.apiKey = apiKey
    
    switch(networkName) {
      case "rinkeby":
        this.apiBaseUrl = "https://rinkeby-api.opensea.io"
        break
      case "main":
      default:
        this.apiBaseUrl = "https://api.opensea.io"
        break
    }
    
    this.orderbookPath = `/wyvern/v0`
  }

  async postOrder(order) {
    return await this.post(
      `${this.orderbookPath}/orders/post`,
      order
    )
  }

  /**
   * Send JSON data to API, sending auth token in headers
   * @param {string} apiPath Path to URL endpoint under API
   * @param {object} opts RequestInit opts, similar to Fetch API, but
   * body can be an object and will get JSON-stringified. Like with
   * `fetch`, it can't be present when the method is "GET"
   */
  async post(apiPath, body, opts = {}) {

    const fetchOpts = Object.assign({
      method: "POST"
    }, opts, {
      body: JSON.stringify(body || opts.body),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })

    return await this._fetch(apiPath, fetchOpts)
  }

  /**
   * Get from an API Endpoint, sending auth token in headers
   * @param {string} apiPath Path to URL endpoint under API
   * @param {object} opts RequestInit opts, similar to Fetch API
   */
  async _fetch(apiPath, opts = {}) {

    const apiBase = this.apiBaseUrl
    const apiKey = this.apiKey
    return fetch(apiBase + apiPath, {
      ...opts,
      headers: {
        ...(apiKey ? { 'X-API-KEY': apiKey } : {}),
        ...(opts.headers || {})
      }
    }).then(throwOnUnauth)
  }
}

function throwOnUnauth(response) {
  if (!response.ok && response.status == 401) {
    throw new Error("Unauthorized")
  }
  return response
}