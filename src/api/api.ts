import { ethers } from "ethers";
import {
  getCollectionPath,
  getOrdersAPIPath,
  getPostCollectionOfferPath,
  getBuildOfferPath,
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
  getPaymentTokensPath,
  getAccountPath,
  getCollectionStatsPath,
  getBestListingsAPIPath,
} from "./apiPaths";
import {
  BuildOfferResponse,
  GetCollectionResponse,
  ListNFTsResponse,
  GetNFTResponse,
  ListCollectionOffersResponse,
  GetOrdersResponse,
  GetPaymentTokensResponse,
  GetBestOfferResponse,
  GetBestListingResponse,
  GetOffersResponse,
  GetListingsResponse,
  CollectionOffer,
} from "./types";
import { API_BASE_MAINNET, API_BASE_TESTNET } from "../constants";
import {
  FulfillmentDataResponse,
  OrderAPIOptions,
  OrdersPostQueryResponse,
  OrdersQueryOptions,
  OrdersQueryResponse,
  OrderV2,
  ProtocolData,
} from "../orders/types";
import {
  serializeOrdersQueryOptions,
  deserializeOrder,
  getFulfillmentDataPath,
  getFulfillListingPayload,
  getFulfillOfferPayload,
  getBuildCollectionOfferPayload,
  getPostCollectionOfferPayload,
} from "../orders/utils";
import {
  Chain,
  OpenSeaAPIConfig,
  OpenSeaAccount,
  OpenSeaCollection,
  OpenSeaCollectionStats,
  OpenSeaPaymentTokensQuery,
  OrderSide,
} from "../types";
import {
  paymentTokenFromJSON,
  collectionFromJSON,
  isTestChain,
  accountFromJSON,
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

  /**
   * Create an instance of the OpenSeaAPI
   * @param config OpenSeaAPIConfig for setting up the API, including an optional API key, Chain name, and base URL
   * @param logger Optional function for logging debug strings before and after requests are made. Defaults to no logging
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
   * @returns The {@link GetOffersResponse} returned by the API.
   */
  public async getAllOffers(
    collectionSlug: string,
    limit?: number,
    next?: string,
  ): Promise<GetOffersResponse> {
    const response = await this.get<GetOffersResponse>(
      getAllOffersAPIPath(collectionSlug),
      {
        limit,
        next,
      },
    );
    return response;
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
    const response = await this.get<GetListingsResponse>(
      getAllListingsAPIPath(collectionSlug),
      {
        limit,
        next,
      },
    );
    return response;
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
    const response = await this.get<GetBestOfferResponse>(
      getBestOfferAPIPath(collectionSlug, tokenId),
    );
    return response;
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
    const response = await this.get<GetBestListingResponse>(
      getBestListingAPIPath(collectionSlug, tokenId),
    );
    return response;
  }

  /**
   * Gets the best listing for a given collection.
   * @param collectionSlug The slug of the collection.
   * @returns The {@link GetListingsResponse} returned by the API.
   */
  public async getBestListings(
    collectionSlug: string,
  ): Promise<GetListingsResponse> {
    const response = await this.get<GetListingsResponse>(
      getBestListingsAPIPath(collectionSlug),
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
    if (side === OrderSide.ASK) {
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
   * @returns The {@link OrderV2} posted to the API.
   */
  public async postOrder(
    order: ProtocolData,
    apiOptions: OrderAPIOptions,
  ): Promise<OrderV2> {
    // TODO: Validate apiOptions. Avoid API calls that will definitely fail
    const { protocol = "seaport", side, protocolAddress } = apiOptions;
    const response = await this.post<OrdersPostQueryResponse>(
      getOrdersAPIPath(this.chain, protocol, side),
      { ...order, protocol_address: protocolAddress },
    );
    return deserializeOrder(response.order);
  }

  /**
   * Build a OpenSea collection offer.
   * @param offererAddress The wallet address which is creating the offer.
   * @param quantity The number of NFTs requested in the offer.
   * @param collectionSlug The slug (identifier) of the collection to build the offer for.
   * @param offerProtectionEnabled Build the offer on OpenSea's signed zone to provide offer protections from receiving an item which is disabled from trading.
   * @returns The {@link BuildOfferResponse} returned by the API.
   */
  public async buildOffer(
    offererAddress: string,
    quantity: number,
    collectionSlug: string,
    offerProtectionEnabled = true,
  ): Promise<BuildOfferResponse> {
    const payload = getBuildCollectionOfferPayload(
      offererAddress,
      quantity,
      collectionSlug,
      offerProtectionEnabled,
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
   * @returns The {@link ListCollectionOffersResponse} returned by the API.
   */
  public async getCollectionOffers(
    slug: string,
  ): Promise<ListCollectionOffersResponse | null> {
    return await this.get<ListCollectionOffersResponse>(
      getCollectionOffersPath(slug),
    );
  }

  /**
   * Post a collection offer to OpenSea.
   * @param order The collection offer to post.
   * @param slug The slug (identifier) of the collection to post the offer for.
   * @returns The {@link Offer} returned to the API.
   */
  public async postCollectionOffer(
    order: ProtocolData,
    slug: string,
  ): Promise<CollectionOffer | null> {
    const payload = getPostCollectionOfferPayload(slug, order);
    return await this.post<CollectionOffer>(
      getPostCollectionOfferPath(),
      payload,
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
    const response = await this.get<ListNFTsResponse>(
      getListNFTsByCollectionPath(slug),
      {
        limit,
        next,
      },
    );
    return response;
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
    const response = await this.get<ListNFTsResponse>(
      getListNFTsByContractPath(chain, address),
      {
        limit,
        next,
      },
    );
    return response;
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
    const response = await this.get<ListNFTsResponse>(
      getListNFTsByAccountPath(chain, address),
      {
        limit,
        next,
      },
    );

    return response;
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
    const response = await this.get<GetNFTResponse>(
      getNFTPath(chain, address, identifier),
    );
    return response;
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
   * Fetch stats for an OpenSea collection.
   * @param slug The slug (identifier) of the collection.
   * @returns The {@link OpenSeaCollection} returned by the API.
   */
  public async getCollectionStats(
    slug: string,
  ): Promise<OpenSeaCollectionStats> {
    const path = getCollectionStatsPath(slug);
    const response = await this.get<OpenSeaCollectionStats>(path);
    return response as OpenSeaCollectionStats;
  }

  /**
   * Fetch list of fungible tokens.
   * @param query Query to use for getting tokens. See {@link OpenSeaPaymentTokenQuery}.
   * @param next The cursor for the next page of results. This is returned from a previous request.
   * @returns The {@link GetPaymentTokensResponse} returned by the API.
   */
  public async getPaymentTokens(
    query: OpenSeaPaymentTokensQuery = {},
    next?: string,
  ): Promise<GetPaymentTokensResponse> {
    const json = await this.get<GetPaymentTokensResponse>(
      getPaymentTokensPath(),
      {
        ...query,
        limit: this.pageSize,
        next,
      },
    );
    return {
      tokens: json.tokens.map((t) => paymentTokenFromJSON(t)),
    };
  }

  /**
   * Fetch account for an address.
   * @param query Query to use for getting tokens. See {@link OpenSeaPaymentTokenQuery}.
   * @param next The cursor for the next page of results. This is returned from a previous request.
   * @returns The {@link GetAccountResponse} returned by the API.
   */
  public async getAccount(address: string): Promise<OpenSeaAccount> {
    const json = await this.get<OpenSeaAccount>(getAccountPath(address));

    return accountFromJSON(json);
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
    const response = await this.post<Response>(
      getRefreshMetadataPath(chain, address, identifier),
      {},
    );

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
