import type {
  FulfillmentDataResponse,
  ListingPostQueryResponse,
  OfferPostQueryResponse,
  OrderAPIOptions,
  OrdersPostQueryResponse,
  OrdersQueryOptions,
  OrdersQueryResponse,
  OrderV2,
  ProtocolData,
} from "../orders/types"
import {
  deserializeOrder,
  getFulfillListingPayload,
  getFulfillmentDataPath,
  getFulfillOfferPayload,
  serializeOrdersQueryOptions,
} from "../orders/utils"
import { type Chain, OrderSide } from "../types"
import {
  getCancelOrderPath,
  getOrderByHashPath,
  getOrdersAPIPath,
} from "./apiPaths"
import type { Fetcher } from "./fetcher"
import type {
  CancelOrderResponse,
  GetOrderByHashResponse,
  GetOrdersResponse,
  Listing,
  Offer,
} from "./types"

/**
 * Order-related API operations
 */
export class OrdersAPI {
  constructor(
    private fetcher: Fetcher,
    private chain: Chain,
  ) {}

  /**
   * Gets an order from API based on query options.
   * @deprecated Use collection-based endpoints instead: getAllOffers, getAllListings, getBestOffer, getBestListing.
   */
  async getOrder({
    side,
    protocol = "seaport",
    orderDirection = "desc",
    orderBy = "created_date",
    ...restOptions
  }: Omit<OrdersQueryOptions, "limit">): Promise<OrderV2> {
    // Validate eth_price orderBy requires additional parameters
    if (orderBy === "eth_price") {
      const hasTokenId =
        (restOptions.tokenIds?.length ?? 0) > 0 ||
        restOptions.tokenId !== undefined
      if (!restOptions.assetContractAddress || !hasTokenId) {
        throw new Error(
          'When using orderBy: "eth_price", you must provide both assetContractAddress and tokenIds (or tokenId) parameters',
        )
      }
    }

    const { orders } = await this.fetcher.get<OrdersQueryResponse>(
      getOrdersAPIPath(this.chain, protocol, side),
      serializeOrdersQueryOptions({
        limit: 1,
        orderBy,
        orderDirection,
        ...restOptions,
      }),
    )
    if (orders.length === 0) {
      throw new Error("Not found: no matching order found")
    }
    return deserializeOrder(orders[0])
  }

  /**
   * Gets a single order by its order hash.
   * Returns the raw API response which can be either an Offer or Listing.
   */
  async getOrderByHash(
    orderHash: string,
    protocolAddress: string,
    chain: Chain = this.chain,
  ): Promise<GetOrderByHashResponse> {
    const response = await this.fetcher.get<{
      order: GetOrderByHashResponse
    }>(getOrderByHashPath(chain, protocolAddress, orderHash))
    return response.order
  }

  /**
   * Gets a list of orders from API based on query options.
   * @deprecated Use collection-based endpoints instead: getAllOffers, getAllListings, getBestOffer, getBestListing.
   */
  async getOrders({
    side,
    protocol = "seaport",
    orderDirection = "desc",
    orderBy = "created_date",
    pageSize = 20,
    ...restOptions
  }: Omit<OrdersQueryOptions, "limit"> & {
    pageSize?: number
  }): Promise<GetOrdersResponse> {
    // Validate eth_price orderBy requires additional parameters
    if (orderBy === "eth_price") {
      const hasTokenId =
        (restOptions.tokenIds?.length ?? 0) > 0 ||
        restOptions.tokenId !== undefined
      if (!restOptions.assetContractAddress || !hasTokenId) {
        throw new Error(
          'When using orderBy: "eth_price", you must provide both assetContractAddress and tokenIds (or tokenId) parameters',
        )
      }
    }

    const response = await this.fetcher.get<OrdersQueryResponse>(
      getOrdersAPIPath(this.chain, protocol, side),
      serializeOrdersQueryOptions({
        limit: pageSize,
        orderBy,
        orderDirection,
        ...restOptions,
      }),
    )
    return {
      ...response,
      orders: response.orders.map(deserializeOrder),
    }
  }

  /**
   * Generate the data needed to fulfill a listing or an offer onchain.
   */
  async generateFulfillmentData(
    fulfillerAddress: string,
    orderHash: string,
    protocolAddress: string,
    side: OrderSide,
    assetContractAddress?: string,
    tokenId?: string,
    unitsToFill?: string,
    recipientAddress?: string,
    includeOptionalCreatorFees: boolean = false,
  ): Promise<FulfillmentDataResponse> {
    let payload: object | null = null
    if (side === OrderSide.LISTING) {
      payload = getFulfillListingPayload(
        fulfillerAddress,
        orderHash,
        protocolAddress,
        this.chain,
        assetContractAddress,
        tokenId,
        unitsToFill,
        recipientAddress,
        includeOptionalCreatorFees,
      )
    } else {
      payload = getFulfillOfferPayload(
        fulfillerAddress,
        orderHash,
        protocolAddress,
        this.chain,
        assetContractAddress,
        tokenId,
        unitsToFill,
        includeOptionalCreatorFees,
      )
    }
    const response = await this.fetcher.post<FulfillmentDataResponse>(
      getFulfillmentDataPath(side),
      payload,
    )
    return response
  }

  /**
   * Post an order to OpenSea.
   * @deprecated Use postListing or postOffer instead.
   */
  async postOrder(
    order: ProtocolData,
    apiOptions: OrderAPIOptions,
  ): Promise<OrderV2> {
    const { protocol = "seaport", side, protocolAddress } = apiOptions

    // Validate required fields
    if (!side) {
      throw new Error("apiOptions.side is required")
    }
    if (!protocolAddress) {
      throw new Error("apiOptions.protocolAddress is required")
    }
    if (!order) {
      throw new Error("order data is required")
    }

    // Validate protocol value
    if (protocol !== "seaport") {
      throw new Error("Currently only 'seaport' protocol is supported")
    }

    // Validate side value
    if (side !== "ask" && side !== "bid") {
      throw new Error("side must be either 'ask' or 'bid'")
    }

    // Validate protocolAddress format
    if (!/^0x[a-fA-F0-9]{40}$/.test(protocolAddress)) {
      throw new Error("Invalid protocol address format")
    }

    const response = await this.fetcher.post<OrdersPostQueryResponse>(
      getOrdersAPIPath(this.chain, protocol, side),
      { ...order, protocol_address: protocolAddress },
    )
    return deserializeOrder(response.order)
  }

  /**
   * Post a listing to OpenSea. Returns the new Listing response format.
   */
  async postListing(
    order: ProtocolData,
    protocolAddress: string,
  ): Promise<Listing> {
    if (!order) {
      throw new Error("order data is required")
    }
    if (!protocolAddress || !/^0x[a-fA-F0-9]{40}$/.test(protocolAddress)) {
      throw new Error("Invalid protocol address format")
    }

    const response = await this.fetcher.post<ListingPostQueryResponse>(
      getOrdersAPIPath(this.chain, "seaport", OrderSide.LISTING),
      { ...order, protocol_address: protocolAddress },
    )
    return response.listing
  }

  /**
   * Post an offer to OpenSea. Returns the new Offer response format.
   */
  async postOffer(
    order: ProtocolData,
    protocolAddress: string,
  ): Promise<Offer> {
    if (!order) {
      throw new Error("order data is required")
    }
    if (!protocolAddress || !/^0x[a-fA-F0-9]{40}$/.test(protocolAddress)) {
      throw new Error("Invalid protocol address format")
    }

    const response = await this.fetcher.post<OfferPostQueryResponse>(
      getOrdersAPIPath(this.chain, "seaport", OrderSide.OFFER),
      { ...order, protocol_address: protocolAddress },
    )
    return response.offer
  }

  /**
   * Offchain cancel an order, offer or listing, by its order hash when protected by the SignedZone.
   */
  async offchainCancelOrder(
    protocolAddress: string,
    orderHash: string,
    chain: Chain = this.chain,
    offererSignature?: string,
  ): Promise<CancelOrderResponse> {
    const response = await this.fetcher.post<CancelOrderResponse>(
      getCancelOrderPath(chain, protocolAddress, orderHash),
      { offererSignature },
    )
    return response
  }
}
