import { Seaport } from "@opensea/seaport-js";
import { AdvancedOrder, OrderComponents } from "@opensea/seaport-js/lib/types";
import { BigNumberish, ContractTransactionResponse, Overrides } from "ethers";
import { OrdersManager } from "./orders";
import { OpenSeaAPI } from "../api/api";
import { Listing, Offer, Order } from "../api/types";
import {
  constructPrivateListingCounterOrder,
  getPrivateListingFulfillments,
} from "../orders/privateListings";
import { OrderType, OrderV2 } from "../orders/types";
import { DEFAULT_SEAPORT_CONTRACT_ADDRESS } from "../orders/utils";
import { EventData, EventType, OrderSide, AssetWithTokenId } from "../types";
import {
  hasErrorCode,
  requireValidProtocol,
  getSeaportInstance,
} from "../utils/utils";

/**
 * Manager for order fulfillment and validation operations.
 * Handles fulfilling orders, validating orders onchain, and approving orders.
 */
export class FulfillmentManager {
  constructor(
    private ordersManager: OrdersManager,
    private api: OpenSeaAPI,
    private seaport_v1_6: Seaport,
    private dispatch: (event: EventType, data: EventData) => void,
    private confirmTransaction: (
      hash: string,
      event: EventType,
      description: string,
    ) => Promise<void>,
    private requireAccountIsAvailable: (address: string) => Promise<void>,
  ) {}

  /**
   * Fulfill a private order for a designated address.
   * @param options
   * @param options.order The order to fulfill
   * @param options.accountAddress Address of the wallet taking the order.
   * @param options.domain An optional domain to be hashed and included at the end of fulfillment calldata.
   *                       This can be used for on-chain order attribution to assist with analytics.
   * @param options.overrides Transaction overrides, ignored if not set.
   * @returns Transaction hash of the order.
   */
  private async fulfillPrivateOrder({
    order,
    accountAddress,
    domain,
    overrides,
  }: {
    order: OrderV2;
    accountAddress: string;
    domain?: string;
    overrides?: Overrides;
  }): Promise<string> {
    if (!order.taker?.address) {
      throw new Error(
        "Order is not a private listing - must have a taker address",
      );
    }
    const counterOrder = constructPrivateListingCounterOrder(
      order.protocolData,
      order.taker.address,
    );
    const fulfillments = getPrivateListingFulfillments(order.protocolData);
    const seaport = getSeaportInstance(
      order.protocolAddress,
      this.seaport_v1_6,
    );
    const transaction = await seaport
      .matchOrders({
        orders: [order.protocolData, counterOrder],
        fulfillments,
        overrides: {
          ...overrides,
          value: counterOrder.parameters.offer[0].startAmount,
        },
        accountAddress,
        domain,
      })
      .transact();
    const transactionReceipt = await transaction.wait();
    if (!transactionReceipt) {
      throw new Error("Missing transaction receipt");
    }

    await this.confirmTransaction(
      transactionReceipt.hash,
      EventType.MatchOrders,
      "Fulfilling order",
    );
    return transactionReceipt.hash;
  }

  /**
   * Fulfill an order for an asset. The order can be either a listing or an offer.
   * @param options
   * @param options.order The order to fulfill, a.k.a. "take"
   * @param options.accountAddress Address of the wallet taking the offer.
   * @param options.recipientAddress The optional address to receive the order's item(s) or currencies. If not specified, defaults to accountAddress.
   * @param options.domain An optional domain to be hashed and included at the end of fulfillment calldata.  This can be used for on-chain order attribution to assist with analytics.
   * @param options.assetContractAddress Optional address of the NFT contract for criteria offers (e.g., collection offers). Required when fulfilling collection offers.
   * @param options.tokenId Optional token ID for criteria offers (e.g., collection offers). Required when fulfilling collection offers.
   * @param options.overrides Transaction overrides, ignored if not set.
   * @returns Transaction hash of the order.
   *
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the order's protocol address is not supported by OpenSea. See {@link isValidProtocol}.
   * @throws Error if attempting to fulfill the order with a recipient address which does not match a private listing.
   */
  async fulfillOrder({
    order,
    accountAddress,
    recipientAddress,
    unitsToFill,
    domain,
    assetContractAddress,
    tokenId,
    overrides,
  }: {
    order: OrderV2 | Order | Listing | Offer;
    accountAddress: string;
    recipientAddress?: string;
    unitsToFill?: BigNumberish;
    domain?: string;
    assetContractAddress?: string;
    tokenId?: string;
    overrides?: Overrides;
  }): Promise<string> {
    await this.requireAccountIsAvailable(accountAddress);

    const protocolAddress =
      (order as OrderV2).protocolAddress ?? (order as Order).protocol_address;
    requireValidProtocol(protocolAddress);

    const orderHash =
      (order as OrderV2).orderHash ?? (order as Order).order_hash;

    const side =
      (order as OrderV2).side ??
      ("type" in order &&
      [OrderType.BASIC, OrderType.ENGLISH].includes(order.type as OrderType)
        ? OrderSide.LISTING
        : OrderSide.OFFER);

    let extraData: string | undefined = undefined;

    const protocolData =
      (order as OrderV2).protocolData ?? (order as Order).protocol_data;

    if (orderHash) {
      const result = await this.api.generateFulfillmentData(
        accountAddress,
        orderHash,
        protocolAddress,
        side,
        assetContractAddress,
        tokenId,
      );

      // If the order is using offer protection, the extraData
      // must be included with the order to successfully fulfill.
      const inputData = result.fulfillment_data.transaction.input_data;
      if ("orders" in inputData && "extraData" in inputData.orders[0]) {
        extraData = (inputData.orders[0] as AdvancedOrder).extraData;
      }
      const signature = result.fulfillment_data.orders[0].signature;
      protocolData.signature = signature;
    }

    const isPrivateListing = "taker" in order ? !!order.taker : false;
    if (isPrivateListing) {
      if (recipientAddress) {
        throw new Error(
          "Private listings cannot be fulfilled with a recipient address",
        );
      }
      return this.fulfillPrivateOrder({
        order: order as OrderV2,
        accountAddress,
        domain,
        overrides,
      });
    }

    const seaport = getSeaportInstance(protocolAddress, this.seaport_v1_6);
    const { executeAllActions } = await seaport.fulfillOrder({
      order: protocolData,
      accountAddress,
      recipientAddress,
      unitsToFill,
      extraData,
      domain,
      overrides,
    });
    const result = (await executeAllActions()) as
      | ContractTransactionResponse
      | string;
    const transactionHash = typeof result === "string" ? result : result.hash;

    await this.confirmTransaction(
      transactionHash,
      EventType.MatchOrders,
      "Fulfilling order",
    );
    return transactionHash;
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
    order: OrderV2;
    accountAddress: string;
  }): Promise<boolean> {
    requireValidProtocol(order.protocolAddress);

    const seaport = getSeaportInstance(
      order.protocolAddress,
      this.seaport_v1_6,
    );

    try {
      const isValid = await seaport
        .validate([order.protocolData], accountAddress)
        .staticCall();
      return !!isValid;
    } catch (error) {
      if (hasErrorCode(error) && error.code === "CALL_EXCEPTION") {
        return false;
      }
      throw error;
    }
  }

  /**
   * Instead of signing an off-chain order, this methods allows you to approve an order
   * with an on-chain transaction.
   * @param order Order to approve
   * @param domain An optional domain to be hashed and included at the end of fulfillment calldata.  This can be used for on-chain order attribution to assist with analytics.
   * @returns Transaction hash of the approval transaction
   *
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the order's protocol address is not supported by OpenSea. See {@link isValidProtocol}.
   */
  async approveOrder(order: OrderV2, domain?: string) {
    await this.requireAccountIsAvailable(order.maker.address);
    requireValidProtocol(order.protocolAddress);

    this.dispatch(EventType.ApproveOrder, {
      orderV2: order,
      accountAddress: order.maker.address,
    });

    const seaport = getSeaportInstance(
      order.protocolAddress,
      this.seaport_v1_6,
    );
    const transaction = await seaport
      .validate([order.protocolData], order.maker.address, domain)
      .transact();

    await this.confirmTransaction(
      transaction.hash,
      EventType.ApproveOrder,
      "Approving order",
    );

    return transaction.hash;
  }

  /**
   * Validates an order onchain using Seaport's validate() method. This submits the order onchain
   * and pre-validates the order using Seaport, which makes it cheaper to fulfill since a signature
   * is not needed to be verified during fulfillment for the order, but is not strictly required
   * and the alternative is orders can be submitted to the API for free instead of sent onchain.
   * @param orderComponents Order components to validate onchain
   * @param accountAddress Address of the wallet that will pay the gas to validate the order
   * @returns Transaction hash of the validation transaction
   *
   * @throws Error if the accountAddress is not available through wallet or provider.
   */
  async validateOrderOnchain(
    orderComponents: OrderComponents,
    accountAddress: string,
  ) {
    await this.requireAccountIsAvailable(accountAddress);

    this.dispatch(EventType.ApproveOrder, {
      orderV2: { protocolData: orderComponents } as unknown as OrderV2,
      accountAddress,
    });

    const seaport = getSeaportInstance(
      DEFAULT_SEAPORT_CONTRACT_ADDRESS,
      this.seaport_v1_6,
    );
    const transaction = await seaport
      .validate(
        [{ parameters: orderComponents, signature: "0x" }],
        accountAddress,
      )
      .transact();

    await this.confirmTransaction(
      transaction.hash,
      EventType.ApproveOrder,
      "Validating order onchain",
    );

    return transaction.hash;
  }

  /**
   * Create and validate a listing onchain using Seaport's validate() method. This combines
   * order building with onchain validation in a single call.
   * @param options Listing parameters
   * @returns Transaction hash of the validation transaction
   */
  async createListingAndValidateOnchain({
    asset,
    accountAddress,
    startAmount,
    endAmount,
    quantity = 1,
    domain,
    salt,
    listingTime,
    expirationTime,
    paymentTokenAddress,
    buyerAddress,
    englishAuction,
    includeOptionalCreatorFees = false,
    zone,
  }: {
    asset: AssetWithTokenId;
    accountAddress: string;
    startAmount: BigNumberish;
    endAmount?: BigNumberish;
    quantity?: BigNumberish;
    domain?: string;
    salt?: BigNumberish;
    listingTime?: number;
    expirationTime?: number;
    paymentTokenAddress?: string;
    buyerAddress?: string;
    englishAuction?: boolean;
    includeOptionalCreatorFees?: boolean;
    zone?: string;
  }): Promise<string> {
    const orderComponents =
      await this.ordersManager.buildListingOrderComponents({
        asset,
        accountAddress,
        startAmount,
        endAmount,
        quantity,
        domain,
        salt,
        listingTime,
        expirationTime,
        paymentTokenAddress,
        buyerAddress,
        englishAuction,
        includeOptionalCreatorFees,
        zone,
      });

    return this.validateOrderOnchain(orderComponents, accountAddress);
  }

  /**
   * Create and validate an offer onchain using Seaport's validate() method. This combines
   * order building with onchain validation in a single call.
   * @param options Offer parameters
   * @returns Transaction hash of the validation transaction
   */
  async createOfferAndValidateOnchain({
    asset,
    accountAddress,
    startAmount,
    quantity = 1,
    domain,
    salt,
    expirationTime,
    paymentTokenAddress,
    zone,
  }: {
    asset: AssetWithTokenId;
    accountAddress: string;
    startAmount: BigNumberish;
    quantity?: BigNumberish;
    domain?: string;
    salt?: BigNumberish;
    expirationTime?: BigNumberish;
    paymentTokenAddress?: string;
    zone?: string;
  }): Promise<string> {
    const orderComponents = await this.ordersManager.buildOfferOrderComponents({
      asset,
      accountAddress,
      startAmount,
      quantity,
      domain,
      salt,
      expirationTime,
      paymentTokenAddress,
      zone,
    });

    return this.validateOrderOnchain(orderComponents, accountAddress);
  }
}
