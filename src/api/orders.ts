import type { FulfillmentDataResponse, ProtocolData } from "../orders/types"
import {
  getFulfillListingPayload,
  getFulfillmentDataPath,
  getFulfillOfferPayload,
} from "../orders/utils"
import { type Chain, OrderSide } from "../types"
import {
  getCancelOrderPath,
  getOrderByHashPath,
  getPostListingPath,
  getPostOfferPath,
} from "./apiPaths"
import type { Fetcher } from "./fetcher"
import type {
  CancelOrderResponse,
  GetOrderByHashResponse,
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
    const payload =
      side === OrderSide.LISTING
        ? getFulfillListingPayload(
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
        : getFulfillOfferPayload(
            fulfillerAddress,
            orderHash,
            protocolAddress,
            this.chain,
            assetContractAddress,
            tokenId,
            unitsToFill,
            includeOptionalCreatorFees,
          )
    return this.fetcher.post<FulfillmentDataResponse>(
      getFulfillmentDataPath(side),
      payload,
    )
  }

  /**
   * Post a listing to OpenSea.
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

    return this.fetcher.post<Listing>(
      getPostListingPath(this.chain, "seaport"),
      {
        ...order,
        protocol_address: protocolAddress,
      },
    )
  }

  /**
   * Post an offer to OpenSea.
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

    return this.fetcher.post<Offer>(getPostOfferPath(this.chain, "seaport"), {
      ...order,
      protocol_address: protocolAddress,
    })
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
    return this.fetcher.post<CancelOrderResponse>(
      getCancelOrderPath(chain, protocolAddress, orderHash),
      { offererSignature },
    )
  }
}
