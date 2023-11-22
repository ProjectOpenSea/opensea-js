import { ethers } from "ethers";
import {
  BuildOfferResponse,
  GetCollectionResponse,
  ListNFTsResponse,
  GetNFTResponse,
  ListCollectionOffersResponse,
  GetAssetsResponse,
  GetOrdersResponse,
  GetPaymentTokensResponse,
  GetBundlesResponse,
  GetBestOfferResponse,
  GetBestListingResponse,
  GetOffersResponse,
  GetListingsResponse,
  CollectionOffer,
} from "./types";
import { API_BASE_MAINNET, API_BASE_TESTNET, API_V1_PATH } from "../constants";
import {
  FulfillmentDataResponse,
  OrderAPIOptions,
  OrderSide,
  OrdersPostQueryResponse,
  OrdersQueryOptions,
  OrdersQueryResponse,
  OrderV2,
  ProtocolData,
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
  getCollectionOffersPath,
  getListNFTsByAccountPath,
  getBestOfferAPIPath,
  getBestListingAPIPath,
  getAllOffersAPIPath,
  getAllListingsAPIPath,
} from "../orders/utils";
import {
  Chain,
  OpenSeaAPIConfig,
  OpenSeaAsset,
  OpenSeaAssetBundle,
  OpenSeaAssetBundleQuery,
  OpenSeaAssetQuery,
  OpenSeaCollection,
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

/**
 * The API class for the OpenSea SDK.
 * @category Main Classes
 */
export class OpenSeaAPI {
  /**
   * Base url for the API
   */
  public readonly apiBaseUrl: string;
  /**
   * Default size to use for fetching orders
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
   * Gets an order from API based on query options.
   * @param options
   * @param options.side The side of the order (buy or sell
   * @param options.protocol The protocol, typically seaport, to query orders for
   * @param options.orderDirection The direction to sort the orders
   * @param options.orderBy The field to sort the orders by
   * @param options.limit The number of orders to retrieve
   * @param options.maker Filter by the wallet address of the order maker
   * @param options.taker Filter by  wallet address of the order taker
   * @param options.asset_contract_address Address of the NFT's contract
   * @param options.token_ids String array of token IDs to filter by.
   * @param options.listed_after Filter by orders listed after the Unix epoch timestamp in seconds
   * @param options.listed_before Filter by orders listed before the Unix epoch timestamp in seconds
   * @returns The first {@link OrderV2} returned by the API
   *
   * @throws An error if there are no matching orders.
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
   * Gets a list of orders from API based on query options.
   * @param options
   * @param options.side The side of the order (buy or sell)
   * @param options.protocol The protocol, typically seaport, to query orders for
   * @param options.orderDirection The direction to sort the orders
   * @param options.orderBy The field to sort the orders by
   * @param options.limit The number of orders to retrieve
   * @param options.maker Filter by the wallet address of the order maker
   * @param options.taker Filter by  wallet address of the order taker
   * @param options.asset_contract_address Address of the NFT's contract
   * @param options.token_ids String array of token IDs to filter by.
   * @param options.listed_after Filter by orders listed after the Unix epoch timestamp in seconds
   * @param options.listed_before Filter by orders listed before the Unix epoch timestamp in seconds
   * @returns The {@link GetOrdersResponse} returned by the API.
   */
  public async getOrders({
    side,
    protocol = "seaport",
    orderDirection = "desc",
    orderBy = "created_date",
    ...restOptions
  }: Omit<OrdersQueryOptions, "limit">): Promise<GetOrdersResponse> {
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
   * Gets all offers for a given collection.
   * @param collectionSlug The slug of the collection.
   * @param limit The number of offers to return. Must be between 1 and 100. Default: 100
   * @param next The cursor for the next page of results. This is returned from a previous request.
   * @returns The {@link GetOrderResponse} returned by the API.
   */
  public async getAllOffers(
    collectionSlug: string,
    limit?: number,
    next?: string,
  ): Promise<GetOffersResponse> {
    const response = await this.get<GetOffersResponse>(
      getAllOffersAPIPath(collectionSlug),
      serializeOrdersQueryOptions({
        limit,
        next,
      }),
    );
    return response;
  }

  /**
   * Gets all listings for a given collection.
   * @param collectionSlug The slug of the collection.
   * @param limit The number of listings to return. Must be between 1 and 100. Default: 100
   * @param next The cursor for the next page of results. This is returned from a previous request.
   * @returns The {@link GetOrderResponse} returned by the API.
   */
  public async getAllListings(
    collectionSlug: string,
    limit?: number,
    next?: string,
  ): Promise<GetListingsResponse> {
    const response = await this.get<GetListingsResponse>(
      getAllListingsAPIPath(collectionSlug),
      serializeOrdersQueryOptions({
        limit,
        next,
      }),
    );
    return response;
  }

  /**
   * Gets the best offer for a given token.
   * @param collectionSlug The slug of the collection.
   * @param tokenId The token identifier.
   * @returns The {@link GetOrderResponse} returned by the API.
   */
  public async getBestOffer(
    collectionSlug: string,
    tokenId: string | number,
  ): Promise<GetBestOfferResponse> {
    const response = await this.get<GetBestOfferResponse>(
      getBestOfferAPIPath(collectionSlug, tokenId),
    );
    return response;
  }

  /**
   * Gets the best listing for a given token.
   * @param collectionSlug The slug of the collection.
   * @param tokenId The token identifier.
   * @returns The {@link GetOrderResponse} returned by the API.
   */
  public async getBestListing(
    collectionSlug: string,
    tokenId: string | number,
  ): Promise<GetBestListingResponse> {
    const response = await this.get<GetBestListingResponse>(
      getBestListingAPIPath(collectionSlug, tokenId),
    );
    return response;
  }

  /**
   * Generate the data needed to fulfill a listing or an offer onchain.
   * @param fulfillerAddress The wallet address which will be used to fulfill the order
   * @param orderHash The hash of the order to fulfill
   * @param protocolAddress The address of the seaport contract
   * @side The side of the order (buy or sell)
   * @returns The {@link FulfillmentDataResponse}
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
   * Post an order to OpenSea.
   * @param order The order to post
   * @param apiOptions
   * @param apiOptions.protocol The protocol, typically seaport, to post the order to.
   * @param apiOptions.side The side of the order (buy or sell).
   * @param apiOptions.protocolAddress The address of the seaport contract.
   * @param options
   * @param options.retries Number of times to retry if the service is unavailable for any reason.
   * @returns The {@link OrderV2} posted to the API.
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
   * Build a OpenSea collection offer.
   * @param offererAddress The wallet address which is creating the offer.
   * @param quantity The number of NFTs requested in the offer.
   * @param collectionSlug The slug (identifier) of the collection to build the offer for.
   * @returns The {@link BuildOfferResponse} returned by the API.
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
   * Get a list collection offers for a given slug.
   * @param slug The slug (identifier) of the collection to list offers for
   * @param retries Number of times to retry if the service is unavailable for any reason.
   * @returns The {@link ListCollectionOffersResponse} returned by the API.
   */
  public async getCollectionOffers(
    slug: string,
    retries = 0,
  ): Promise<ListCollectionOffersResponse | null> {
    try {
      return await this.get<ListCollectionOffersResponse>(
        getCollectionOffersPath(slug),
      );
    } catch (error) {
      _throwOrContinue(error, retries);
      await delay(1000);
      return this.getCollectionOffers(slug, retries - 1);
    }
  }

  /**
   * Post a collection offer to OpenSea.
   * @param order The collection offer to post.
   * @param slug The slug (identifier) of the collection to post the offer for.
   * @param retries Number of times to retry if the service is unavailable for any reason.
   * @returns The {@link Offer} returned to the API.
   */
  public async postCollectionOffer(
    order: ProtocolData,
    slug: string,
    retries = 0,
  ): Promise<CollectionOffer | null> {
    const payload = getPostCollectionOfferPayload(slug, order);
    try {
      return await this.post<CollectionOffer>(
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
   * Fetch an asset.
   * @deprecated Use {@link getNFT} for multichain capabilities.
   * @param options
   * @param options.tokenAddress The asset's contract address.
   * @param options.tokenId The asset's token ID, or null if ERC-20
   * @param retries Number of times to retry if the service is unavailable for any reason
   * @returns The {@link OpenSeaAsset} returned by the API.
   * @throws An error if the function is called on an unsupported chain.
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
    if (![Chain.Mainnet, Chain.Sepolia].includes(this.chain)) {
      throw new Error("Please use `getNFT()` for multichain capabilities.");
    }

    let json;
    try {
      json = await this.get(
        `${API_V1_PATH}/asset/${tokenAddress}/${tokenId ?? 0}/`,
      );
    } catch (error) {
      _throwOrContinue(error, retries);
      await delay(1000);
      return this.getAsset({ tokenAddress, tokenId }, retries - 1);
    }

    return assetFromJSON(json);
  }

  /**
   * Fetch multiple NFTs for a collection.
   * @param slug The slug (identifier) of the collection
   * @param limit The number of NFTs to retrieve. Must be greater than 0 and less than 51.
   * @param next Cursor to retrieve the next page of NFTs
   * @param retries Number of times to retry if the service is unavailable for any reason.
   * @returns The {@link ListNFTsResponse} returned by the API.
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
   * Fetch multiple NFTs for a contract.
   * @param chain The NFT's chain.
   * @param address The NFT's contract address.
   * @param limit The number of NFTs to retrieve. Must be greater than 0 and less than 51.
   * @param next Cursor to retrieve the next page of NFTs.
   * @param retries Number of times to retry if the service is unavailable for any reason.
   * @returns The {@link ListNFTsResponse} returned by the API.
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
   * Fetch NFTs owned by an account.
   * @param address The address of the account
   * @param limit The number of NFTs to retrieve. Must be greater than 0 and less than 51.
   * @param next Cursor to retrieve the next page of NFTs
   * @param retries Number of times to retry if the service is unavailable for any reason.
   * @param chain The chain to query. Defaults to the chain set in the constructor.
   * @returns The {@link ListNFTsResponse} returned by the API.
   */
  public async getNFTsByAccount(
    address: string,
    limit: number | undefined = undefined,
    next: string | undefined = undefined,
    retries = 1,
    chain = this.chain,
  ): Promise<ListNFTsResponse> {
    let response;
    try {
      response = await this.get<ListNFTsResponse>(
        getListNFTsByAccountPath(chain, address),
        {
          limit,
          next,
        },
      );
    } catch (error) {
      _throwOrContinue(error, retries);
      await delay(1000);
      return this.getNFTsByAccount(address, limit, next, retries - 1, chain);
    }

    return response;
  }

  /**
   * Fetch metadata, traits, ownership information, and rarity for a single NFT.
   * @param chain The NFT's chain.
   * @param address The NFT's contract address.
   * @param identifier the identifier of the NFT (i.e. Token ID)
   * @param retries Number of times to retry if the service is unavailable for any reason
   * @returns The {@link GetNFTResponse} returned by the API.
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
   * Fetch a list of assets.
   * @deprecated Use {@link getNFTsByContract} or {@link getNFTsByCollection} for multichain capabilities.
   * @param query Options to filter the list returned.
   * @param query.owner The wallet address of the owner of the assets.
   * @param query.asset_contract_address The Asset's contract address.
   * @param query.token_ids String array of token IDs to filter by.
   * @param query.order_by The field to order the list by.
   * @param query.order_direction The direction to order the list.
   * @param query.limit The number of assets to retrieve. Must be greater than 0 and less than 201.
   * @param query.cursor Cursor to retrieve the next page of assets.
   * @throws An error if the function is called on an unsupported chain.
   * @returns The {@link GetAssetsResponse} returned by the API.
   */
  public async getAssets(
    query: OpenSeaAssetQuery = {},
  ): Promise<GetAssetsResponse> {
    if (![Chain.Mainnet, Chain.Sepolia].includes(this.chain)) {
      throw new Error(
        "Please use `getNFTsByContract()` or `getNFTsByCollection()` for multichain capabilities.",
      );
    }

    const json = await this.get<{
      estimated_count: number;
      assets: unknown[];
      next: string | undefined;
      previous: string | undefined;
    }>(`${API_V1_PATH}/assets/`, {
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
   * Fetch an OpenSea collection.
   * @param slug The slug (identifier) of the collection.
   * @returns The {@link OpenSeaCollection} returned by the API.
   */
  public async getCollection(slug: string): Promise<OpenSeaCollection> {
    const path = getCollectionPath(slug);
    const response = await this.get<GetCollectionResponse>(path);
    return collectionFromJSON(response.collection);
  }

  /**
   * Fetch list of fungible tokens.
   * @param query Query to use for getting tokens. See {@link OpenSeaFungibleTokenQuery}.
   * @param page Page number to fetch. Defaults to 1.
   * @param retries Number of times to retry if the service is unavailable for any reason.
   * @throws An error if the function is called on an unsupported chain.
   * @returns The {@link GetPaymentTokensResponse} returned by the API.
   */
  public async getPaymentTokens(
    query: OpenSeaFungibleTokenQuery = {},
    page = 1,
    retries = 1,
  ): Promise<GetPaymentTokensResponse> {
    if (![Chain.Mainnet, Chain.Sepolia].includes(this.chain)) {
      throw new Error(
        "This method does not work outside of Mainnet and Sepolia chains as it uses the v1 API.",
      );
    }

    let json;
    try {
      json = await this.get<unknown[]>(`${API_V1_PATH}/tokens/`, {
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
   * Fetch a bundle from the API.
   * @param options
   * @param options.slug The bundle's identifier
   * @returns The {@link OpenSeaAssetBundle} returned by the API. If not found, returns null.
   */
  public async getBundle({
    slug,
  }: {
    slug: string;
  }): Promise<OpenSeaAssetBundle | null> {
    const json = await this.get(`${API_V1_PATH}/bundle/${slug}/`);

    return json ? assetBundleFromJSON(json) : null;
  }

  /**
   * Fetch list of bundles from the API.
   * @param query Query to use for getting bundles. See {@link OpenSeaAssetBundleQuery}.
   * @param page Page number to fetch. Defaults to 1.
   * @returns The {@link GetBundlesResponse} returned by the API.
   */
  public async getBundles(
    query: OpenSeaAssetBundleQuery = {},
    page = 1,
  ): Promise<GetBundlesResponse> {
    const json = await this.get<{
      estimated_count: number;
      bundles: unknown[];
    }>(`${API_V1_PATH}/bundles/`, {
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
   * Force refresh the metadata for an NFT.
   * @param chain The chain where the NFT is located.
   * @param address The address of the NFT's contract.
   * @param identifier The identifier of the NFT.
   * @param retries Number of times to retry if the service is unavailable for any reason.
   * @returns The response from the API.
   */
  public async refreshNFTMetadata(
    chain: Chain,
    address: string,
    identifier: string,
    retries = 1,
  ): Promise<Response> {
    let response;
    try {
      response = await this.post<Response>(
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
   * Generic fetch method for any API endpoint
   * @param apiPath Path to URL endpoint under API
   * @param query URL query params. Will be used to create a URLSearchParams object.
   * @returns @typeParam T The response from the API.
   */
  public async get<T>(apiPath: string, query: object = {}): Promise<T> {
    const qs = this.objectToSearchParams(query);
    const url = `${this.apiBaseUrl}${apiPath}?${qs}`;
    return await this._fetch({ url });
  }

  /**
   * Generic post method for any API endpoint.
   * @param apiPath Path to URL endpoint under API
   * @param body Data to send.
   * @param opts ethers ConnectionInfo, similar to Fetch API.
   * @returns @typeParam T The response from the API.
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
