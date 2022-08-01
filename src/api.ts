import "isomorphic-unfetch";
import _ from "lodash";
import * as QueryString from "query-string";
import {
  API_BASE_MAINNET,
  API_BASE_RINKEBY,
  API_PATH,
  ORDERBOOK_PATH,
  SITE_HOST_MAINNET,
  SITE_HOST_RINKEBY,
} from "./constants";
import {
  OrderAPIOptions,
  OrdersPostQueryResponse,
  OrdersQueryOptions,
  OrdersQueryResponse,
  OrderV2,
  ProtocolData,
  QueryCursors,
} from "./orders/types";
import {
  serializeOrdersQueryOptions,
  getOrdersAPIPath,
  deserializeOrder,
} from "./orders/utils";
import {
  Network,
  OpenSeaAPIConfig,
  OpenSeaAsset,
  OpenSeaAssetBundle,
  OpenSeaAssetBundleQuery,
  OpenSeaAssetQuery,
  OpenSeaFungibleToken,
  OpenSeaFungibleTokenQuery,
} from "./types";
import {
  assetBundleFromJSON,
  assetFromJSON,
  delay,
  tokenFromJSON,
} from "./utils/utils";

export class OpenSeaAPI {
  /**
   * Host url for OpenSea
   */
  public readonly hostUrl: string;
  /**
   * Base url for the API
   */
  public readonly apiBaseUrl: string;
  /**
   * Page size to use for fetching orders
   */
  public pageSize = 20;
  /**
   * Logger function to use when debugging
   */
  public logger: (arg: string) => void;

  private apiKey: string | undefined;
  private networkName: Network;
  private retryDelay = 3000;

  /**
   * Create an instance of the OpenSea API
   * @param config OpenSeaAPIConfig for setting up the API, including an optional API key, network name, and base URL
   * @param logger Optional function for logging debug strings before and after requests are made
   */
  constructor(config: OpenSeaAPIConfig, logger?: (arg: string) => void) {
    this.apiKey = config.apiKey;
    this.networkName = config.networkName ?? Network.Main;

    switch (config.networkName) {
      case Network.Rinkeby:
        this.apiBaseUrl = config.apiBaseUrl || API_BASE_RINKEBY;
        this.hostUrl = SITE_HOST_RINKEBY;
        break;
      case Network.Main:
      default:
        this.apiBaseUrl = config.apiBaseUrl || API_BASE_MAINNET;
        this.hostUrl = SITE_HOST_MAINNET;
        break;
    }

    // Debugging: default to nothing
    this.logger = logger || ((arg: string) => arg);
  }

  /**
   * Gets an order from API based on query options. Throws when no order is found.
   */
  public async getOrder({
    side,
    protocol = "seaport",
    orderDirection = "desc",
    orderBy = "created_date",
    ...restOptions
  }: Omit<OrdersQueryOptions, "limit">): Promise<OrderV2> {
    const { orders } = await this.get<OrdersQueryResponse>(
      getOrdersAPIPath(this.networkName, protocol, side),
      serializeOrdersQueryOptions({
        limit: 1,
        orderBy,
        orderDirection,
        ...restOptions,
      })
    );
    if (orders.length === 0) {
      throw new Error("Not found: no matching order found");
    }
    return deserializeOrder(orders[0]);
  }

  /**
   * Gets a list of orders from API based on query options and returns orders
   * with next and previous cursors.
   */
  public async getOrders({
    side,
    protocol = "seaport",
    orderDirection = "desc",
    orderBy = "created_date",
    ...restOptions
  }: Omit<OrdersQueryOptions, "limit">): Promise<
    QueryCursors & {
      orders: OrderV2[];
    }
  > {
    const response = await this.get<OrdersQueryResponse>(
      getOrdersAPIPath(this.networkName, protocol, side),
      serializeOrdersQueryOptions({
        limit: this.pageSize,
        orderBy,
        orderDirection,
        ...restOptions,
      })
    );
    return {
      ...response,
      orders: response.orders.map(deserializeOrder),
    };
  }

  /**
   * Send an order to be posted. Throws when the order is invalid.
   */
  public async postOrder(
    order: ProtocolData,
    apiOptions: OrderAPIOptions,
    { retries = 2 }: { retries?: number } = {}
  ): Promise<OrderV2> {
    let response: OrdersPostQueryResponse;
    // TODO: Validate apiOptions. Avoid API calls that will definitely fail
    const { protocol = "seaport", side } = apiOptions;
    try {
      response = await this.post<OrdersPostQueryResponse>(
        getOrdersAPIPath(this.networkName, protocol, side),
        order
      );
    } catch (error) {
      _throwOrContinue(error, retries);
      await delay(this.retryDelay);
      return this.postOrder(order, apiOptions, { retries: retries - 1 });
    }
    return deserializeOrder(response.order);
  }

  /**
   * Create a whitelist entry for an asset to prevent others from buying.
   * Buyers will have to have verified at least one of the emails
   * on an asset in order to buy.
   * This will throw a 403 if the given API key isn't allowed to create whitelist entries for this contract or asset.
   * @param tokenAddress Address of the asset's contract
   * @param tokenId The asset's token ID
   * @param email The email allowed to buy.
   */
  public async postAssetWhitelist(
    tokenAddress: string,
    tokenId: string | number,
    email: string
  ): Promise<boolean> {
    const json = await this.post<{ success: boolean }>(
      `${API_PATH}/asset/${tokenAddress}/${tokenId}/whitelist/`,
      {
        email,
      }
    );

    return !!json.success;
  }

  /**
   * Get which version of Wyvern exchange to use to create orders
   * Simply return null in case API doesn't give us a good response
   */
  public async getOrderCreateWyvernExchangeAddress(): Promise<string | null> {
    try {
      const result = await this.get(`${ORDERBOOK_PATH}/exchange/`);
      return result as string;
    } catch (error) {
      this.logger(
        "Couldn't retrieve Wyvern exchange address for order creation"
      );
      return null;
    }
  }

  /**
   * Fetch an asset from the API, throwing if none is found
   * @param tokenAddress Address of the asset's contract
   * @param tokenId The asset's token ID, or null if ERC-20
   * @param retries Number of times to retry if the service is unavailable for any reason
   */
  public async getAsset(
    {
      tokenAddress,
      tokenId,
    }: {
      tokenAddress: string;
      tokenId: string | number | null;
    },
    retries = 1
  ): Promise<OpenSeaAsset> {
    let json;
    try {
      json = await this.get(
        `${API_PATH}/asset/${tokenAddress}/${tokenId || 0}/`
      );
    } catch (error) {
      _throwOrContinue(error, retries);
      await delay(1000);
      return this.getAsset({ tokenAddress, tokenId }, retries - 1);
    }

    return assetFromJSON(json);
  }

  /**
   * Fetch list of assets from the API, returning the page of assets and the count of total assets
   * @param query Query to use for getting orders. A subset of parameters on the `OpenSeaAssetJSON` type is supported
   */
  public async getAssets(query: OpenSeaAssetQuery = {}): Promise<{
    assets: OpenSeaAsset[];
    estimatedCount: number;
    next: string | undefined;
    previous: string | undefined;
  }> {
    const json = await this.get<{
      estimated_count: number;
      assets: unknown[];
      next: string | undefined;
      previous: string | undefined;
    }>(`${API_PATH}/assets/`, {
      limit: this.pageSize,
      ...query,
    });

    return {
      assets: json.assets.map((j) => assetFromJSON(j)),
      next: json.next,
      previous: json.previous,
      estimatedCount: json.estimated_count,
    };
  }

  /**
   * Fetch list of fungible tokens from the API matching parameters
   * @param query Query to use for getting orders. A subset of parameters on the `OpenSeaAssetJSON` type is supported
   * @param page Page number, defaults to 1. Can be overridden by
   * `limit` and `offset` attributes from OpenSeaFungibleTokenQuery
   * @param retries Number of times to retry if the service is unavailable for any reason
   */
  public async getPaymentTokens(
    query: OpenSeaFungibleTokenQuery = {},
    page = 1,
    retries = 1
  ): Promise<{ tokens: OpenSeaFungibleToken[] }> {
    let json;
    try {
      json = await this.get<unknown[]>(`${API_PATH}/tokens/`, {
        ...query,
        limit: this.pageSize,
        offset: (page - 1) * this.pageSize,
      });
    } catch (error) {
      _throwOrContinue(error, retries);
      await delay(1000);
      return this.getPaymentTokens(query, page, retries - 1);
    }

    return {
      tokens: json.map((t) => tokenFromJSON(t)),
    };
  }

  /**
   * Fetch a bundle from the API, return null if it isn't found
   * @param slug The bundle's identifier
   */
  public async getBundle({
    slug,
  }: {
    slug: string;
  }): Promise<OpenSeaAssetBundle | null> {
    const json = await this.get(`${API_PATH}/bundle/${slug}/`);

    return json ? assetBundleFromJSON(json) : null;
  }

  /**
   * Fetch list of bundles from the API, returning the page of bundles and the count of total bundles
   * @param query Query to use for getting orders. A subset of parameters on the `OpenSeaAssetBundleJSON` type is supported
   * @param page Page number, defaults to 1. Can be overridden by
   * `limit` and `offset` attributes from OpenSeaAssetBundleQuery
   */
  public async getBundles(
    query: OpenSeaAssetBundleQuery = {},
    page = 1
  ): Promise<{ bundles: OpenSeaAssetBundle[]; estimatedCount: number }> {
    const json = await this.get<{
      estimated_count: number;
      bundles: unknown[];
    }>(`${API_PATH}/bundles/`, {
      ...query,
      limit: this.pageSize,
      offset: (page - 1) * this.pageSize,
    });

    return {
      bundles: json.bundles.map((j) => assetBundleFromJSON(j)),
      estimatedCount: json.estimated_count,
    };
  }

  /**
   * Get JSON data from API, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param query Data to send. Will be stringified using QueryString
   */
  public async get<T>(apiPath: string, query: object = {}): Promise<T> {
    const qs = QueryString.stringify(query);
    const url = `${apiPath}?${qs}`;

    const response = await this._fetch(url);
    return response.json();
  }

  /**
   * POST JSON data to API, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param body Data to send. Will be JSON.stringified
   * @param opts RequestInit opts, similar to Fetch API. If it contains
   *  a body, it won't be stringified.
   */
  public async post<T>(
    apiPath: string,
    body?: object,
    opts: RequestInit = {}
  ): Promise<T> {
    const fetchOpts = {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      ...opts,
    };

    const response = await this._fetch(apiPath, fetchOpts);
    return response.json();
  }

  /**
   * PUT JSON data to API, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param body Data to send
   * @param opts RequestInit opts, similar to Fetch API. If it contains
   *  a body, it won't be stringified.
   */
  public async put(apiPath: string, body: object, opts: RequestInit = {}) {
    return this.post(apiPath, body, {
      method: "PUT",
      ...opts,
    });
  }

  /**
   * Get from an API Endpoint, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param opts RequestInit opts, similar to Fetch API
   */
  private async _fetch(apiPath: string, opts: RequestInit = {}) {
    const apiBase = this.apiBaseUrl;
    const apiKey = this.apiKey;
    const finalUrl = apiBase + apiPath;
    const finalOpts = {
      ...opts,
      headers: {
        ...(apiKey ? { "X-API-KEY": apiKey } : {}),
        ...(opts.headers || {}),
      },
    };

    this.logger(
      `Sending request: ${finalUrl} ${JSON.stringify(finalOpts).substr(
        0,
        100
      )}...`
    );

    return fetch(finalUrl, finalOpts).then(async (res) =>
      this._handleApiResponse(res)
    );
  }

  private async _handleApiResponse(response: Response) {
    if (response.ok) {
      this.logger(`Got success: ${response.status}`);
      return response;
    }

    let result;
    let errorMessage;
    try {
      result = await response.text();
      result = JSON.parse(result);
    } catch {
      // Result will be undefined or text
    }

    this.logger(`Got error ${response.status}: ${JSON.stringify(result)}`);

    switch (response.status) {
      case 400:
        errorMessage =
          result && result.errors
            ? result.errors.join(", ")
            : `Invalid request: ${JSON.stringify(result)}`;
        break;
      case 401:
      case 403:
        errorMessage = `Unauthorized. Full message was '${JSON.stringify(
          result
        )}'`;
        break;
      case 404:
        errorMessage = `Not found. Full message was '${JSON.stringify(
          result
        )}'`;
        break;
      case 500:
        errorMessage = `Internal server error. OpenSea has been alerted, but if the problem persists please contact us via Discord: https://discord.gg/ga8EJbv - full message was ${JSON.stringify(
          result
        )}`;
        break;
      case 503:
        errorMessage = `Service unavailable. Please try again in a few minutes. If the problem persists please contact us via Discord: https://discord.gg/ga8EJbv - full message was ${JSON.stringify(
          result
        )}`;
        break;
      default:
        errorMessage = `Message: ${JSON.stringify(result)}`;
        break;
    }

    throw new Error(`API Error ${response.status}: ${errorMessage}`);
  }
}

function _throwOrContinue(error: unknown, retries: number) {
  const isUnavailable =
    error instanceof Error &&
    !!error.message &&
    (error.message.includes("503") || error.message.includes("429"));

  if (retries <= 0 || !isUnavailable) {
    throw error;
  }
}
