import { ethers } from "ethers";
import { API_BASE_MAINNET } from "../constants";
import { AccountsAPI } from "./accounts";
import { CollectionsAPI } from "./collections";
import { EventsAPI } from "./events";
import { ListingsAPI } from "./listings";
import { NFTsAPI } from "./nfts";
import { OffersAPI } from "./offers";
import {
  FulfillmentDataResponse,
  OrderAPIOptions,
  OrdersQueryOptions,
  OrderV2,
  ProtocolData,
} from "../orders/types";
import {
  Chain,
  OpenSeaAPIConfig,
  OpenSeaAccount,
  OpenSeaCollection,
  OpenSeaCollectionStats,
  OpenSeaPaymentToken,
  OpenSeaRateLimitError,
  OrderSide,
} from "../types";
import { OrdersAPI } from "./orders";
import {
  BuildOfferResponse,
  GetCollectionsResponse,
  ListNFTsResponse,
  GetNFTResponse,
  ListCollectionOffersResponse,
  GetOrdersResponse,
  GetBestOfferResponse,
  GetBestListingResponse,
  GetOffersResponse,
  GetListingsResponse,
  CollectionOffer,
  CollectionOrderByOption,
  CancelOrderResponse,
  GetEventsArgs,
  GetEventsResponse,
} from "./types";

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

  // Specialized API clients
  private ordersAPI: OrdersAPI;
  private offersAPI: OffersAPI;
  private listingsAPI: ListingsAPI;
  private collectionsAPI: CollectionsAPI;
  private nftsAPI: NFTsAPI;
  private accountsAPI: AccountsAPI;
  private eventsAPI: EventsAPI;

  /**
   * Create an instance of the OpenSeaAPI
   * @param config OpenSeaAPIConfig for setting up the API, including an optional API key, Chain name, and base URL
   * @param logger Optional function for logging debug strings before and after requests are made. Defaults to no logging
   */
  constructor(config: OpenSeaAPIConfig, logger?: (arg: string) => void) {
    this.apiKey = config.apiKey;
    this.chain = config.chain ?? Chain.Mainnet;

    if (config.apiBaseUrl) {
      this.apiBaseUrl = config.apiBaseUrl;
    } else {
      this.apiBaseUrl = API_BASE_MAINNET;
    }

    // Debugging: default to nothing
    this.logger = logger ?? ((arg: string) => arg);

    // Initialize specialized API clients
    this.ordersAPI = new OrdersAPI(
      this.get.bind(this),
      this.post.bind(this),
      this.chain,
    );
    this.offersAPI = new OffersAPI(this.get.bind(this), this.post.bind(this));
    this.listingsAPI = new ListingsAPI(this.get.bind(this));
    this.collectionsAPI = new CollectionsAPI(this.get.bind(this));
    this.nftsAPI = new NFTsAPI(
      this.get.bind(this),
      this.post.bind(this),
      this.chain,
    );
    this.accountsAPI = new AccountsAPI(this.get.bind(this), this.chain);
    this.eventsAPI = new EventsAPI(this.get.bind(this));
  }

  /**
   * Gets an order from API based on query options.
   * @param options Query options for fetching an order
   * @returns The first {@link OrderV2} returned by the API
   *
   * @throws An error if there are no matching orders.
   */
  public async getOrder(
    options: Omit<OrdersQueryOptions, "limit">,
  ): Promise<OrderV2> {
    return this.ordersAPI.getOrder(options);
  }

  /**
   * Gets a single order by its order hash.
   * @param orderHash The hash of the order to fetch
   * @param protocolAddress The address of the seaport contract
   * @param chain The chain where the order is located. Defaults to the chain set in the constructor.
   * @returns The {@link OrderV2} returned by the API
   * @throws An error if the order is not found
   */
  public async getOrderByHash(
    orderHash: string,
    protocolAddress: string,
    chain: Chain = this.chain,
  ): Promise<OrderV2> {
    return this.ordersAPI.getOrderByHash(orderHash, protocolAddress, chain);
  }

  /**
   * Gets a list of orders from API based on query options.
   * @param options Query options for fetching orders
   * @returns The {@link GetOrdersResponse} returned by the API.
   */
  public async getOrders(
    options: Omit<OrdersQueryOptions, "limit">,
  ): Promise<GetOrdersResponse> {
    return this.ordersAPI.getOrders({ ...options, pageSize: this.pageSize });
  }

  /**
   * Gets all offers for a given collection.
   * @param collectionSlug The slug of the collection.
   * @param limit The number of offers to return. Must be between 1 and 100. Default: 100
   * @param next The cursor for the next page of results. This is returned from a previous request.
   * @returns The {@link GetOffersResponse} returned by the API.
   */
  public async getAllOffers(
    collectionSlug: string,
    limit?: number,
    next?: string,
  ): Promise<GetOffersResponse> {
    return this.offersAPI.getAllOffers(collectionSlug, limit, next);
  }

  /**
   * Gets all listings for a given collection.
   * @param collectionSlug The slug of the collection.
   * @param limit The number of listings to return. Must be between 1 and 100. Default: 100
   * @param next The cursor for the next page of results. This is returned from a previous request.
   * @returns The {@link GetListingsResponse} returned by the API.
   */
  public async getAllListings(
    collectionSlug: string,
    limit?: number,
    next?: string,
  ): Promise<GetListingsResponse> {
    return this.listingsAPI.getAllListings(collectionSlug, limit, next);
  }

  /**
   * Gets trait offers for a given collection.
   * @param collectionSlug The slug of the collection.
   * @param type The name of the trait (e.g. 'Background').
   * @param value The value of the trait (e.g. 'Red').
   * @param limit The number of offers to return. Must be between 1 and 100. Default: 100
   * @param next The cursor for the next page of results. This is returned from a previous request.
   * @param floatValue The value of the trait for decimal-based numeric traits.
   * @param intValue The value of the trait for integer-based numeric traits.
   * @returns The {@link GetOffersResponse} returned by the API.
   */
  public async getTraitOffers(
    collectionSlug: string,
    type: string,
    value: string,
    limit?: number,
    next?: string,
    floatValue?: number,
    intValue?: number,
  ): Promise<GetOffersResponse> {
    return this.offersAPI.getTraitOffers(
      collectionSlug,
      type,
      value,
      limit,
      next,
      floatValue,
      intValue,
    );
  }

  /**
   * Gets the best offer for a given token.
   * @param collectionSlug The slug of the collection.
   * @param tokenId The token identifier.
   * @returns The {@link GetBestOfferResponse} returned by the API.
   */
  public async getBestOffer(
    collectionSlug: string,
    tokenId: string | number,
  ): Promise<GetBestOfferResponse> {
    return this.offersAPI.getBestOffer(collectionSlug, tokenId);
  }

  /**
   * Gets the best listing for a given token.
   * @param collectionSlug The slug of the collection.
   * @param tokenId The token identifier.
   * @returns The {@link GetBestListingResponse} returned by the API.
   */
  public async getBestListing(
    collectionSlug: string,
    tokenId: string | number,
  ): Promise<GetBestListingResponse> {
    return this.listingsAPI.getBestListing(collectionSlug, tokenId);
  }

  /**
   * Gets the best listings for a given collection.
   * @param collectionSlug The slug of the collection.
   * @param limit The number of listings to return. Must be between 1 and 100. Default: 100
   * @param next The cursor for the next page of results. This is returned from a previous request.
   * @returns The {@link GetListingsResponse} returned by the API.
   */
  public async getBestListings(
    collectionSlug: string,
    limit?: number,
    next?: string,
  ): Promise<GetListingsResponse> {
    return this.listingsAPI.getBestListings(collectionSlug, limit, next);
  }

  /**
   * Generate the data needed to fulfill a listing or an offer onchain.
   * @param fulfillerAddress The wallet address which will be used to fulfill the order
   * @param orderHash The hash of the order to fulfill
   * @param protocolAddress The address of the seaport contract
   * @side The side of the order (buy or sell)
   * @param assetContractAddress Optional address of the NFT contract for criteria offers (e.g., collection offers)
   * @param tokenId Optional token ID for criteria offers (e.g., collection offers)
   * @returns The {@link FulfillmentDataResponse}
   */
  public async generateFulfillmentData(
    fulfillerAddress: string,
    orderHash: string,
    protocolAddress: string,
    side: OrderSide,
    assetContractAddress?: string,
    tokenId?: string,
  ): Promise<FulfillmentDataResponse> {
    return this.ordersAPI.generateFulfillmentData(
      fulfillerAddress,
      orderHash,
      protocolAddress,
      side,
      assetContractAddress,
      tokenId,
    );
  }

  /**
   * Post an order to OpenSea.
   * @param order The order to post
   * @param apiOptions API options for the order
   * @returns The {@link OrderV2} posted to the API.
   */
  public async postOrder(
    order: ProtocolData,
    apiOptions: OrderAPIOptions,
  ): Promise<OrderV2> {
    return this.ordersAPI.postOrder(order, apiOptions);
  }

  /**
   * Build a OpenSea collection offer.
   * @param offererAddress The wallet address which is creating the offer.
   * @param quantity The number of NFTs requested in the offer.
   * @param collectionSlug The slug (identifier) of the collection to build the offer for.
   * @param offerProtectionEnabled Build the offer on OpenSea's signed zone to provide offer protections from receiving an item which is disabled from trading.
   * @param traitType If defined, the trait name to create the collection offer for.
   * @param traitValue If defined, the trait value to create the collection offer for.
   * @returns The {@link BuildOfferResponse} returned by the API.
   */
  public async buildOffer(
    offererAddress: string,
    quantity: number,
    collectionSlug: string,
    offerProtectionEnabled = true,
    traitType?: string,
    traitValue?: string,
  ): Promise<BuildOfferResponse> {
    return this.offersAPI.buildOffer(
      offererAddress,
      quantity,
      collectionSlug,
      offerProtectionEnabled,
      traitType,
      traitValue,
    );
  }

  /**
   * Get a list collection offers for a given slug.
   * @param slug The slug (identifier) of the collection to list offers for
   * @returns The {@link ListCollectionOffersResponse} returned by the API.
   */
  public async getCollectionOffers(
    slug: string,
  ): Promise<ListCollectionOffersResponse | null> {
    return this.offersAPI.getCollectionOffers(slug);
  }

  /**
   * Post a collection offer to OpenSea.
   * @param order The collection offer to post.
   * @param slug The slug (identifier) of the collection to post the offer for.
   * @param traitType If defined, the trait name to create the collection offer for.
   * @param traitValue If defined, the trait value to create the collection offer for.
   * @returns The {@link Offer} returned to the API.
   */
  public async postCollectionOffer(
    order: ProtocolData,
    slug: string,
    traitType?: string,
    traitValue?: string,
  ): Promise<CollectionOffer | null> {
    return this.offersAPI.postCollectionOffer(
      order,
      slug,
      traitType,
      traitValue,
    );
  }

  /**
   * Fetch multiple NFTs for a collection.
   * @param slug The slug (identifier) of the collection
   * @param limit The number of NFTs to retrieve. Must be greater than 0 and less than 51.
   * @param next Cursor to retrieve the next page of NFTs
   * @returns The {@link ListNFTsResponse} returned by the API.
   */
  public async getNFTsByCollection(
    slug: string,
    limit: number | undefined = undefined,
    next: string | undefined = undefined,
  ): Promise<ListNFTsResponse> {
    return this.nftsAPI.getNFTsByCollection(slug, limit, next);
  }

  /**
   * Fetch multiple NFTs for a contract.
   * @param address The NFT's contract address.
   * @param limit The number of NFTs to retrieve. Must be greater than 0 and less than 51.
   * @param next Cursor to retrieve the next page of NFTs.
   * @param chain The NFT's chain.
   * @returns The {@link ListNFTsResponse} returned by the API.
   */
  public async getNFTsByContract(
    address: string,
    limit: number | undefined = undefined,
    next: string | undefined = undefined,
    chain: Chain = this.chain,
  ): Promise<ListNFTsResponse> {
    return this.nftsAPI.getNFTsByContract(address, limit, next, chain);
  }

  /**
   * Fetch NFTs owned by an account.
   * @param address The address of the account
   * @param limit The number of NFTs to retrieve. Must be greater than 0 and less than 51.
   * @param next Cursor to retrieve the next page of NFTs
   * @param chain The chain to query. Defaults to the chain set in the constructor.
   * @returns The {@link ListNFTsResponse} returned by the API.
   */
  public async getNFTsByAccount(
    address: string,
    limit: number | undefined = undefined,
    next: string | undefined = undefined,
    chain = this.chain,
  ): Promise<ListNFTsResponse> {
    return this.nftsAPI.getNFTsByAccount(address, limit, next, chain);
  }

  /**
   * Fetch metadata, traits, ownership information, and rarity for a single NFT.
   * @param address The NFT's contract address.
   * @param identifier the identifier of the NFT (i.e. Token ID)
   * @param chain The NFT's chain.
   * @returns The {@link GetNFTResponse} returned by the API.
   */
  public async getNFT(
    address: string,
    identifier: string,
    chain = this.chain,
  ): Promise<GetNFTResponse> {
    return this.nftsAPI.getNFT(address, identifier, chain);
  }

  /**
   * Fetch an OpenSea collection.
   * @param slug The slug (identifier) of the collection.
   * @returns The {@link OpenSeaCollection} returned by the API.
   */
  public async getCollection(slug: string): Promise<OpenSeaCollection> {
    return this.collectionsAPI.getCollection(slug);
  }

  /**
   * Fetch a list of OpenSea collections.
   * @param orderBy The order to return the collections in. Default: CREATED_DATE
   * @param chain The chain to filter the collections on. Default: all chains
   * @param creatorUsername The creator's OpenSea username to filter the collections on.
   * @param includeHidden If hidden collections should be returned. Default: false
   * @param limit The limit of collections to return.
   * @param next The cursor for the next page of results. This is returned from a previous request.
   * @returns List of {@link OpenSeaCollection} returned by the API.
   */
  public async getCollections(
    orderBy: CollectionOrderByOption = CollectionOrderByOption.CREATED_DATE,
    chain?: Chain,
    creatorUsername?: string,
    includeHidden: boolean = false,
    limit?: number,
    next?: string,
  ): Promise<GetCollectionsResponse> {
    return this.collectionsAPI.getCollections(
      orderBy,
      chain,
      creatorUsername,
      includeHidden,
      limit,
      next,
    );
  }

  /**
   * Fetch stats for an OpenSea collection.
   * @param slug The slug (identifier) of the collection.
   * @returns The {@link OpenSeaCollection} returned by the API.
   */
  public async getCollectionStats(
    slug: string,
  ): Promise<OpenSeaCollectionStats> {
    return this.collectionsAPI.getCollectionStats(slug);
  }

  /**
   * Fetch a payment token.
   * @param address The address of the payment token
   * @param chain The chain of the payment token
   * @returns The {@link OpenSeaPaymentToken} returned by the API.
   */
  public async getPaymentToken(
    address: string,
    chain = this.chain,
  ): Promise<OpenSeaPaymentToken> {
    return this.accountsAPI.getPaymentToken(address, chain);
  }

  /**
   * Fetch account for an address.
   * @param address The address to fetch the account for
   * @returns The {@link OpenSeaAccount} returned by the API.
   */
  public async getAccount(address: string): Promise<OpenSeaAccount> {
    return this.accountsAPI.getAccount(address);
  }

  /**
   * Force refresh the metadata for an NFT.
   * @param address The address of the NFT's contract.
   * @param identifier The identifier of the NFT.
   * @param chain The chain where the NFT is located.
   * @returns The response from the API.
   */
  public async refreshNFTMetadata(
    address: string,
    identifier: string,
    chain: Chain = this.chain,
  ): Promise<Response> {
    return this.nftsAPI.refreshNFTMetadata(address, identifier, chain);
  }

  /**
   * Offchain cancel an order, offer or listing, by its order hash when protected by the SignedZone.
   * Protocol and Chain are required to prevent hash collisions.
   * Please note cancellation is only assured if a fulfillment signature was not vended prior to cancellation.
   * @param protocolAddress The Seaport address for the order.
   * @param orderHash The order hash, or external identifier, of the order.
   * @param chain The chain where the order is located.
   * @param offererSignature An EIP-712 signature from the offerer of the order.
   *                         If this is not provided, the user associated with the API Key will be checked instead.
   *                         The signature must be a EIP-712 signature consisting of the order's Seaport contract's
   *                         name, version, address, and chain. The struct to sign is `OrderHash` containing a
   *                         single bytes32 field.
   * @returns The response from the API.
   */
  public async offchainCancelOrder(
    protocolAddress: string,
    orderHash: string,
    chain: Chain = this.chain,
    offererSignature?: string,
  ): Promise<CancelOrderResponse> {
    return this.ordersAPI.offchainCancelOrder(
      protocolAddress,
      orderHash,
      chain,
      offererSignature,
    );
  }

  /**
   * Gets a list of events based on query parameters.
   * @param args Query parameters for filtering events.
   * @returns The {@link GetEventsResponse} returned by the API.
   */
  public async getEvents(args?: GetEventsArgs): Promise<GetEventsResponse> {
    return this.eventsAPI.getEvents(args);
  }

  /**
   * Gets a list of events for a specific account.
   * @param address The account address.
   * @param args Query parameters for filtering events.
   * @returns The {@link GetEventsResponse} returned by the API.
   */
  public async getEventsByAccount(
    address: string,
    args?: GetEventsArgs,
  ): Promise<GetEventsResponse> {
    return this.eventsAPI.getEventsByAccount(address, args);
  }

  /**
   * Gets a list of events for a specific collection.
   * @param collectionSlug The slug (identifier) of the collection.
   * @param args Query parameters for filtering events.
   * @returns The {@link GetEventsResponse} returned by the API.
   */
  public async getEventsByCollection(
    collectionSlug: string,
    args?: GetEventsArgs,
  ): Promise<GetEventsResponse> {
    return this.eventsAPI.getEventsByCollection(collectionSlug, args);
  }

  /**
   * Gets a list of events for a specific NFT.
   * @param chain The chain where the NFT is located.
   * @param address The contract address of the NFT.
   * @param identifier The token identifier.
   * @param args Query parameters for filtering events.
   * @returns The {@link GetEventsResponse} returned by the API.
   */
  public async getEventsByNFT(
    chain: Chain,
    address: string,
    identifier: string,
    args?: GetEventsArgs,
  ): Promise<GetEventsResponse> {
    return this.eventsAPI.getEventsByNFT(chain, address, identifier, args);
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
    return await this._fetch(url);
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
    opts?: object,
  ): Promise<T> {
    const url = `${this.apiBaseUrl}${apiPath}`;
    return await this._fetch(url, opts, body);
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
  private async _fetch(url: string, headers?: object, body?: object) {
    // Create the fetch request
    const req = new ethers.FetchRequest(url);

    // Set the headers
    headers = {
      "x-app-id": "opensea-js",
      ...(this.apiKey ? { "X-API-KEY": this.apiKey } : {}),
      ...headers,
    };
    for (const [key, value] of Object.entries(headers)) {
      req.setHeader(key, value);
    }

    // Set the body if provided
    if (body) {
      req.body = body;
    }

    // Set the throttle params
    req.setThrottleParams({ slotInterval: 1000 });

    this.logger(
      `Sending request: ${url} ${JSON.stringify({
        request: req,
        headers: req.headers,
      })}`,
    );

    const response = await req.send();
    if (!response.ok()) {
      // Handle rate limit errors (429 Too Many Requests and 599 custom rate limit)
      if (response.statusCode === 599 || response.statusCode === 429) {
        throw this._createRateLimitError(response);
      }
      // If an errors array is returned, throw with the error messages.
      const errors = response.bodyJson?.errors;
      if (errors?.length > 0) {
        let errorMessage = errors.join(", ");
        if (errorMessage === "[object Object]") {
          errorMessage = JSON.stringify(errors);
        }
        throw new Error(`Server Error: ${errorMessage}`);
      } else {
        // Otherwise, let ethers throw a SERVER_ERROR since it will include
        // more context about the request and response.
        response.assertOk();
      }
    }
    return response.bodyJson;
  }

  /**
   * Parses the retry-after header from the response with robust error handling.
   * @param response The HTTP response object from the API
   * @returns The retry-after value in seconds, or undefined if not present or invalid
   */
  private _parseRetryAfter(response: ethers.FetchResponse): number | undefined {
    const retryAfterHeader =
      response.headers["retry-after"] || response.headers["Retry-After"];
    if (retryAfterHeader) {
      const parsed = parseInt(retryAfterHeader, 10);
      return isNaN(parsed) || parsed <= 0 ? undefined : parsed;
    }
    return undefined;
  }

  /**
   * Creates a rate limit error with retry-after information for backwards compatibility.
   * @param response The HTTP response object from the API
   * @returns An enhanced Error object with retryAfter and responseBody properties
   */
  private _createRateLimitError(
    response: ethers.FetchResponse,
  ): OpenSeaRateLimitError {
    const retryAfter = this._parseRetryAfter(response);
    const error = new Error(
      `${response.statusCode} ${response.statusMessage}`,
    ) as OpenSeaRateLimitError;

    // Add retry-after information to the error object for backwards compatibility
    error.retryAfter = retryAfter;
    error.responseBody = response.bodyJson;
    return error;
  }
}
