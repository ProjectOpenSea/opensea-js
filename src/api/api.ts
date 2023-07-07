import { ethers } from "ethers";
import {
  BuildOfferResponse,
  PostOfferResponse,
  GetCollectionResponse,
  ListNFTsResponse,
  GetNFTResponse,
} from "./types";
import { API_BASE_MAINNET, API_BASE_TESTNET, API_PATH } from "../constants";
import {
  FulfillmentDataResponse,
  OrderAPIOptions,
  OrderSide,
  OrdersPostQueryResponse,
  OrdersQueryOptions,
  OrdersQueryResponse,
  OrderV2,
  ProtocolData,
  QueryCursors,
} from "../orders/types";
import {
  serializeOrdersQueryOptions,
  getOrdersAPIPath,
  deserializeOrder,
  getFulfillmentDataPath,
  getFulfillListingPayload,
  getFulfillOfferPayload,
  getBuildOfferPath,
  getBuildCollectionOfferPayload,
  getCollectionPath,
  getPostCollectionOfferPath,
  getPostCollectionOfferPayload,
  getListNFTsByCollectionPath,
  getListNFTsByContractPath,
  getNFTPath,
  getRefreshMetadataPath,
} from "../orders/utils";
import {
  Chain,
  OpenSeaAPIConfig,
  OpenSeaAsset,
  OpenSeaAssetBundle,
  OpenSeaAssetBundleQuery,
  OpenSeaAssetQuery,
  OpenSeaCollection,
  OpenSeaFungibleToken,
  OpenSeaFungibleTokenQuery,
} from "../types";
import {
  assetBundleFromJSON,
  assetFromJSON,
  delay,
  tokenFromJSON,
  collectionFromJSON,
  isTestChain,
} from "../utils/utils";

export class OpenSeaAPI {
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
  private chain: Chain;
  private retryDelay = 3000;

  /**
   * Create an instance of the OpenSea API
   * @param config OpenSeaAPIConfig for setting up the API, including an optional API key, Chain name, and base URL
   * @param logger Optional function for logging debug strings before and after requests are made
   */
  constructor(config: OpenSeaAPIConfig, logger?: (arg: string) => void) {
    this.apiKey = config.apiKey;
    this.chain = config.chain ?? Chain.Mainnet;

    this.apiBaseUrl = isTestChain(this.chain)
      ? API_BASE_TESTNET
      : API_BASE_MAINNET;

    // Debugging: default to nothing
    this.logger = logger ?? ((arg: string) => arg);
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
      getOrdersAPIPath(this.chain, protocol, side),
      serializeOrdersQueryOptions({
        limit: 1,
        orderBy,
        orderDirection,
        ...restOptions,
      }),
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
      getOrdersAPIPath(this.chain, protocol, side),
      serializeOrdersQueryOptions({
        limit: this.pageSize,
        orderBy,
        orderDirection,
        ...restOptions,
      }),
    );
    return {
      ...response,
      orders: response.orders.map(deserializeOrder),
    };
  }

  /**
   * Generate the data needed to fulfill a listing or an offer
   */
  public async generateFulfillmentData(
    fulfillerAddress: string,
    orderHash: string,
    protocolAddress: string,
    side: OrderSide,
  ): Promise<FulfillmentDataResponse> {
    let payload: object | null = null;
    if (side === "ask") {
      payload = getFulfillListingPayload(
        fulfillerAddress,
        orderHash,
        protocolAddress,
        this.chain,
      );
    } else {
      payload = getFulfillOfferPayload(
        fulfillerAddress,
        orderHash,
        protocolAddress,
        this.chain,
      );
    }
    const response = await this.post<FulfillmentDataResponse>(
      getFulfillmentDataPath(side),
      payload,
    );
    return response;
  }

  /**
   * Send an order to be posted. Throws when the order is invalid.
   */
  public async postOrder(
    order: ProtocolData,
    apiOptions: OrderAPIOptions,
    { retries = 2 }: { retries?: number } = {},
  ): Promise<OrderV2> {
    let response: OrdersPostQueryResponse;
    // TODO: Validate apiOptions. Avoid API calls that will definitely fail
    const { protocol = "seaport", side, protocolAddress } = apiOptions;
    try {
      response = await this.post<OrdersPostQueryResponse>(
        getOrdersAPIPath(this.chain, protocol, side),
        { ...order, protocol_address: protocolAddress },
      );
    } catch (error) {
      _throwOrContinue(error, retries);
      await delay(this.retryDelay);
      return this.postOrder(order, apiOptions, { retries: retries - 1 });
    }
    return deserializeOrder(response.order);
  }

  /**
   * Build an offer
   */
  public async buildOffer(
    offererAddress: string,
    quantity: number,
    collectionSlug: string,
  ): Promise<BuildOfferResponse> {
    const payload = getBuildCollectionOfferPayload(
      offererAddress,
      quantity,
      collectionSlug,
    );
    const response = await this.post<BuildOfferResponse>(
      getBuildOfferPath(),
      payload,
    );
    return response;
  }

  /**
   * Post collection offer
   */
  public async postCollectionOffer(
    order: ProtocolData,
    slug: string,
    retries = 0,
  ): Promise<PostOfferResponse | null> {
    const payload = getPostCollectionOfferPayload(slug, order);
    try {
      return await this.post<PostOfferResponse>(
        getPostCollectionOfferPath(),
        payload,
      );
    } catch (error) {
      _throwOrContinue(error, retries);
      await delay(1000);
      return this.postCollectionOffer(order, slug, retries - 1);
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
    retries = 1,
  ): Promise<OpenSeaAsset> {
    let json;
    try {
      json = await this.get(
        `${API_PATH}/asset/${tokenAddress}/${tokenId ?? 0}/`,
      );
    } catch (error) {
      _throwOrContinue(error, retries);
      await delay(1000);
      return this.getAsset({ tokenAddress, tokenId }, retries - 1);
    }

    return assetFromJSON(json);
  }

  /**
   * Fetch multiple NFTs for a collection from the API
   * @param slug The collection you would like to list NFTs for
   * @param limit The number of NFTs to retrieve. Must be greater than 0 and less than 51.
   * @param next Cursor to retrieve the next page of NFTs
   * @param retries Number of times to retry if the service is unavailable for any reason
   */
  public async getNFTsByCollection(
    slug: string,
    limit: number | undefined = undefined,
    next: string | undefined = undefined,
    retries = 1,
  ): Promise<ListNFTsResponse> {
    let response;
    try {
      response = await this.get<ListNFTsResponse>(
        getListNFTsByCollectionPath(slug),
        {
          limit,
          next,
        },
      );
    } catch (error) {
      _throwOrContinue(error, retries);
      await delay(1000);
      return this.getNFTsByCollection(slug, limit, next, retries - 1);
    }

    return response;
  }

  /**
   * Fetch multiple NFTs for a contract from the API
   * @param chain chain the contract is deployed to
   * @param address address of the smart contract
   * @param limit The number of NFTs to retrieve. Must be greater than 0 and less than 51.
   * @param next Cursor to retrieve the next page of NFTs
   * @param retries Number of times to retry if the service is unavailable for any reason
   */
  public async getNFTsByContract(
    chain: Chain,
    address: string,
    limit: number | undefined = undefined,
    next: string | undefined = undefined,
    retries = 1,
  ): Promise<ListNFTsResponse> {
    let response;
    try {
      response = await this.get<ListNFTsResponse>(
        getListNFTsByContractPath(chain, address),
        {
          limit,
          next,
        },
      );
    } catch (error) {
      _throwOrContinue(error, retries);
      await delay(1000);
      return this.getNFTsByContract(chain, address, limit, next, retries - 1);
    }

    return response;
  }

  /**
   * Fetch metadata, traits, ownership information, and rarity for an NFT from the API
   * @param chain chain the contract is deployed to
   * @param address address of the smart contract
   * @param identifierthe identifier of the NFT (i.e. token_id)
   * @param retries Number of times to retry if the service is unavailable for any reason
   */
  public async getNFT(
    chain: Chain,
    address: string,
    identifier: string,
    retries = 1,
  ): Promise<GetNFTResponse> {
    let response;
    try {
      response = await this.get<GetNFTResponse>(
        getNFTPath(chain, address, identifier),
      );
    } catch (error) {
      _throwOrContinue(error, retries);
      await delay(1000);
      return this.getNFT(chain, address, identifier, retries - 1);
    }

    return response;
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
   * Fetch a collection through the API
   */
  public async getCollection(slug: string): Promise<OpenSeaCollection> {
    const path = getCollectionPath(slug);
    const response = await this.get<GetCollectionResponse>(path);
    return collectionFromJSON(response.collection);
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
    retries = 1,
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
    page = 1,
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
   * Used to force refresh the metadata for an NFT from the API
   * @param chain chain the contract is deployed to
   * @param address address of the smart contract
   * @param identifierthe identifier of the NFT (i.e. token_id)
   * @param retries Number of times to retry if the service is unavailable for any reason
   */
  public async refreshNFTMetadata(
    chain: Chain,
    address: string,
    identifier: string,
    retries = 1,
  ): Promise<unknown> {
    let response;
    try {
      response = await this.post(
        getRefreshMetadataPath(chain, address, identifier),
        {},
      );
    } catch (error) {
      _throwOrContinue(error, retries);
      await delay(1000);
      return this.refreshNFTMetadata(chain, address, identifier, retries - 1);
    }

    return response;
  }

  /**
   * Get JSON data from API, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param query Data to send. Will be stringified using QueryString
   */
  public async get<T>(apiPath: string, query: object = {}): Promise<T> {
    const qs = this.objectToSearchParams(query);
    const url = `${this.apiBaseUrl}${apiPath}?${qs}`;
    return await this._fetch({ url });
  }

  /**
   * POST JSON data to API, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param body Data to send. Will be JSON.stringified
   * @param opts ethers ConnectionInfo, similar to Fetch API.
   */
  public async post<T>(
    apiPath: string,
    body?: object,
    opts?: ethers.utils.ConnectionInfo,
  ): Promise<T> {
    const options = {
      url: `${this.apiBaseUrl}${apiPath}`,
      ...opts,
    };

    return await this._fetch(options, body);
  }

  private objectToSearchParams(params: object = {}) {
    const urlSearchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value && Array.isArray(value)) {
        value.forEach((item) => item && urlSearchParams.append(key, item));
      } else if (value) {
        urlSearchParams.append(key, value);
      }
    });

    return urlSearchParams.toString();
  }

  /**
   * Get from an API Endpoint, sending auth token in headers
   * @param opts ethers ConnectionInfo, similar to Fetch API
   * @param body Optional body to send. If set, will POST, otherwise GET
   */
  private async _fetch(opts: ethers.utils.ConnectionInfo, body?: object) {
    const headers = {
      "x-app-id": "opensea-js",
      ...(this.apiKey ? { "X-API-KEY": this.apiKey } : {}),
      ...opts.headers,
    };
    const req = {
      ...opts,
      headers,
    };

    this.logger(
      `Sending request: ${opts.url} ${JSON.stringify(req).slice(0, 200)}...`,
    );

    return await ethers.utils.fetchJson(
      req,
      body ? JSON.stringify(body) : undefined,
    );
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
