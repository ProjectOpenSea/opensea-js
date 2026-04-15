import { SeaportABI } from "@opensea/seaport-js/lib/abi/Seaport"
import type { OrderComponents } from "@opensea/seaport-js/lib/types"
import type { Listing, Offer, Order } from "../api/types"
import {
  computePrivateListingValue,
  constructPrivateListingCounterOrder,
  getPrivateListingFulfillments,
} from "../orders/privateListings"
import { OrderType, type OrderV2 } from "../orders/types"
import { DEFAULT_SEAPORT_CONTRACT_ADDRESS } from "../orders/utils"
import {
  type Amount,
  type AssetWithTokenId,
  EventType,
  OrderSide,
} from "../types"
import {
  getSeaportInstance,
  hasErrorCode,
  requireValidProtocol,
} from "../utils/utils"
import type { SDKContext } from "./context"
import type { OrdersManager } from "./orders"

const FULFILL_BASIC_ORDER_ALIAS = "fulfillBasicOrder_efficient_6GL6yc"

/**
 * Manager for order fulfillment and validation operations.
 * Handles fulfilling orders, validating orders onchain, and approving orders.
 */
export class FulfillmentManager {
  constructor(
    private context: SDKContext,
    private ordersManager: OrdersManager,
  ) {}

  /**
   * Fulfill a private order for a designated address.
   * The order must have a taker address set (i.e., it is a private listing).
   */
  async fulfillPrivateOrder({
    order,
    accountAddress,
    domain,
    overrides,
  }: {
    order: OrderV2
    accountAddress: string
    domain?: string
    overrides?: Record<string, unknown>
  }): Promise<string> {
    await this.context.requireAccountIsAvailable(accountAddress)
    if (!order.taker?.address) {
      throw new Error(
        "Order is not a private listing - must have a taker address",
      )
    }
    const counterOrder = constructPrivateListingCounterOrder(
      order.protocolData,
      order.taker.address,
    )
    const fulfillments = getPrivateListingFulfillments(order.protocolData)

    const value = computePrivateListingValue(
      order.protocolData,
      order.taker.address,
    )

    const seaport = getSeaportInstance(
      order.protocolAddress,
      this.context.seaport,
    )
    const transaction = await seaport
      .matchOrders({
        orders: [order.protocolData, counterOrder],
        fulfillments,
        overrides: {
          ...overrides,
          value,
        },
        accountAddress,
        domain,
      })
      .transact()
    const transactionReceipt = await transaction.wait()
    if (!transactionReceipt) {
      throw new Error("Missing transaction receipt")
    }

    await this.context.confirmTransaction(
      transactionReceipt.hash,
      EventType.MatchOrders,
      "Fulfilling order",
    )
    return transactionReceipt.hash
  }

  /**
   * Fulfill an order for an asset. The order can be either a listing or an offer.
   * Uses the OpenSea API to generate fulfillment transaction data and executes it directly.
   * @param options
   * @param options.order The order to fulfill, a.k.a. "take"
   * @param options.accountAddress Address of the wallet taking the offer.
   * @param options.assetContractAddress Optional address of the NFT contract for criteria offers (e.g., collection offers). Required when fulfilling collection offers.
   * @param options.tokenId Optional token ID for criteria offers (e.g., collection offers). Required when fulfilling collection offers.
   * @param options.unitsToFill Optional number of units to fill. Defaults to 1 for both listings and offers.
   * @param options.recipientAddress Optional recipient address for the NFT when fulfilling a listing. Not applicable for offers.
   * @param options.includeOptionalCreatorFees Whether to include optional creator fees in the fulfillment. If creator fees are already required, this is a no-op. Defaults to false.
   * @param options.overrides Transaction overrides, ignored if not set.
   * @returns Transaction hash of the order.
   *
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the order's protocol address is not supported by OpenSea. See {@link isValidProtocol}.
   * @throws Error if a signer is not provided (read-only providers cannot fulfill orders).
   * @throws Error if the order hash is not available.
   */
  async fulfillOrder({
    order,
    accountAddress,
    assetContractAddress,
    tokenId,
    unitsToFill,
    recipientAddress,
    includeOptionalCreatorFees = false,
    overrides,
  }: {
    order: OrderV2 | Order | Listing | Offer
    accountAddress: string
    assetContractAddress?: string
    tokenId?: string
    unitsToFill?: Amount
    recipientAddress?: string
    includeOptionalCreatorFees?: boolean
    overrides?: Record<string, unknown>
  }): Promise<string> {
    await this.context.requireAccountIsAvailable(accountAddress)

    const protocolAddress =
      (order as OrderV2).protocolAddress ?? (order as Order).protocol_address
    requireValidProtocol(protocolAddress)

    const orderHash =
      (order as OrderV2).orderHash ?? (order as Order).order_hash

    const side =
      (order as OrderV2).side ??
      ("type" in order &&
      [OrderType.BASIC, OrderType.ENGLISH].includes(order.type as OrderType)
        ? OrderSide.LISTING
        : OrderSide.OFFER)

    const isPrivateListing = "taker" in order ? !!order.taker : false
    if (isPrivateListing) {
      return this.fulfillPrivateOrder({
        order: order as OrderV2,
        accountAddress,
        overrides,
      })
    }

    // Get fulfillment data from the API
    if (!orderHash) {
      throw new Error("Order hash is required to fulfill an order")
    }

    // Convert unitsToFill to string, defaulting to "1" if not provided
    const unitsToFillStr =
      unitsToFill !== undefined ? unitsToFill.toString() : "1"

    const fulfillmentData = await this.context.api.generateFulfillmentData(
      accountAddress,
      orderHash,
      protocolAddress,
      side,
      assetContractAddress,
      tokenId,
      unitsToFillStr,
      recipientAddress,
      includeOptionalCreatorFees,
    )

    // Use the transaction data returned by the API
    const transaction = fulfillmentData.fulfillment_data.transaction
    const inputData = transaction.input_data

    // Extract function name and build parameters array in correct order
    const rawFunctionName = transaction.function.split("(")[0]
    const functionName =
      rawFunctionName === FULFILL_BASIC_ORDER_ALIAS
        ? "fulfillBasicOrder"
        : rawFunctionName
    let params: unknown[]

    // Order parameters based on the function being called
    if (
      functionName === "fulfillAdvancedOrder" &&
      "advancedOrder" in inputData
    ) {
      params = [
        inputData.advancedOrder,
        inputData.criteriaResolvers || [],
        inputData.fulfillerConduitKey ||
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        inputData.recipient,
      ]
    } else if (
      (functionName === "fulfillBasicOrder" ||
        rawFunctionName === FULFILL_BASIC_ORDER_ALIAS) &&
      "basicOrderParameters" in inputData
    ) {
      params = [inputData.basicOrderParameters]
    } else if (functionName === "fulfillOrder" && "order" in inputData) {
      params = [
        inputData.order,
        inputData.fulfillerConduitKey ||
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      ]
    } else {
      // Fallback: try to use values in object order
      params = Object.values(inputData)
    }

    const encodedData = this.context.contractCaller.encodeFunctionData({
      abi: SeaportABI,
      functionName,
      args: params,
    })

    // Send the transaction using the signer from wallet
    const wallet = this.context.wallet
    if (!("signer" in wallet)) {
      throw new Error("A signer is required to fulfill orders")
    }
    const tx = await wallet.signer.sendTransaction({
      to: transaction.to,
      value: BigInt(transaction.value),
      data: encodedData,
      overrides: overrides as Record<string, unknown>,
    })

    await this.context.confirmTransaction(
      tx.hash,
      EventType.MatchOrders,
      "Fulfilling order",
    )
    return tx.hash
  }

  /**
   * Returns whether an order is fulfillable.
   * An order may not be fulfillable if a target item's transfer function
   * is locked for some reason, e.g. an item is being rented within a game
   * or trading has been locked for an item type.
   * @param options
   * @param options.order Order to check
   * @param options.accountAddress The account address that will be fulfilling the order
   * @returns True if the order is fulfillable, else False.
   *
   * @throws Error if the order's protocol address is not supported by OpenSea. See {@link isValidProtocol}.
   */
  async isOrderFulfillable({
    order,
    accountAddress,
  }: {
    order: OrderV2
    accountAddress: string
  }): Promise<boolean> {
    requireValidProtocol(order.protocolAddress)

    const seaport = getSeaportInstance(
      order.protocolAddress,
      this.context.seaport,
    )

    try {
      const isValid = await seaport
        .validate([order.protocolData], accountAddress)
        .staticCall()
      return !!isValid
    } catch (error) {
      if (hasErrorCode(error) && error.code === "CALL_EXCEPTION") {
        return false
      }
      throw error
    }
  }

  /**
   * Instead of signing an off-chain order, this method allows you to approve an order
   * with an onchain transaction.
   * @param order Order to approve
   * @param domain An optional domain to be hashed and included at the end of fulfillment calldata.  This can be used for onchain order attribution to assist with analytics.
   * @returns Transaction hash of the approval transaction
   *
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the order's protocol address is not supported by OpenSea. See {@link isValidProtocol}.
   */
  async approveOrder(order: OrderV2, domain?: string) {
    await this.context.requireAccountIsAvailable(order.maker.address)
    requireValidProtocol(order.protocolAddress)

    this.context.dispatch(EventType.ApproveOrder, {
      orderV2: order,
      accountAddress: order.maker.address,
    })

    const seaport = getSeaportInstance(
      order.protocolAddress,
      this.context.seaport,
    )
    const transaction = await seaport
      .validate([order.protocolData], order.maker.address, domain)
      .transact()

    await this.context.confirmTransaction(
      transaction.hash,
      EventType.ApproveOrder,
      "Approving order",
    )

    return transaction.hash
  }

  /**
   * Validates an order onchain using Seaport's validate() method.
   */
  async validateOrderOnchain(
    orderComponents: OrderComponents,
    accountAddress: string,
  ) {
    await this.context.requireAccountIsAvailable(accountAddress)

    this.context.dispatch(EventType.ApproveOrder, {
      orderV2: { protocolData: orderComponents } as unknown as OrderV2,
      accountAddress,
    })

    const seaport = getSeaportInstance(
      DEFAULT_SEAPORT_CONTRACT_ADDRESS,
      this.context.seaport,
    )
    const transaction = await seaport
      .validate(
        [{ parameters: orderComponents, signature: "0x" }],
        accountAddress,
      )
      .transact()

    await this.context.confirmTransaction(
      transaction.hash,
      EventType.ApproveOrder,
      "Validating order onchain",
    )

    return transaction.hash
  }

  /**
   * Create and validate a listing onchain.
   */
  async createListingAndValidateOnchain({
    asset,
    accountAddress,
    amount,
    quantity = 1,
    domain,
    salt,
    listingTime,
    expirationTime,
    buyerAddress,
    includeOptionalCreatorFees = false,
    zone,
  }: {
    asset: AssetWithTokenId
    accountAddress: string
    amount: Amount
    quantity?: Amount
    domain?: string
    salt?: Amount
    listingTime?: number
    expirationTime?: number
    buyerAddress?: string
    includeOptionalCreatorFees?: boolean
    zone?: string
  }): Promise<string> {
    const orderComponents =
      await this.ordersManager.buildListingOrderComponents({
        asset,
        accountAddress,
        amount,
        quantity,
        domain,
        salt,
        listingTime,
        expirationTime,
        buyerAddress,
        includeOptionalCreatorFees,
        zone,
      })

    return this.validateOrderOnchain(orderComponents, accountAddress)
  }

  /**
   * Create and validate an offer onchain.
   */
  async createOfferAndValidateOnchain({
    asset,
    accountAddress,
    amount,
    quantity = 1,
    domain,
    salt,
    expirationTime,
    zone,
  }: {
    asset: AssetWithTokenId
    accountAddress: string
    amount: Amount
    quantity?: Amount
    domain?: string
    salt?: Amount
    expirationTime?: Amount
    zone?: string
  }): Promise<string> {
    const orderComponents = await this.ordersManager.buildOfferOrderComponents({
      asset,
      accountAddress,
      amount,
      quantity,
      domain,
      salt,
      expirationTime,
      zone,
    })

    return this.validateOrderOnchain(orderComponents, accountAddress)
  }
}
