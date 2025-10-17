import { OrderComponents } from "@opensea/seaport-js/lib/types";
import { BigNumberish, Overrides, Signer, ethers } from "ethers";
import { SDKContext } from "./context";
import { OrdersManager } from "./orders";
import { Listing, Offer, Order } from "../api/types";
import {
  constructPrivateListingCounterOrder,
  getPrivateListingFulfillments,
} from "../orders/privateListings";
import { OrderType, OrderV2 } from "../orders/types";
import { DEFAULT_SEAPORT_CONTRACT_ADDRESS } from "../orders/utils";
import { EventType, OrderSide, AssetWithTokenId } from "../types";
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
    private context: SDKContext,
    private ordersManager: OrdersManager,
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
      this.context.seaport,
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

    await this.context.confirmTransaction(
      transactionReceipt.hash,
      EventType.MatchOrders,
      "Fulfilling order",
    );
    return transactionReceipt.hash;
  }

  /**
   * Fulfill an order for an asset. The order can be either a listing or an offer.
   * Uses the OpenSea API to generate fulfillment transaction data and executes it directly.
   * @param options
   * @param options.order The order to fulfill, a.k.a. "take"
   * @param options.accountAddress Address of the wallet taking the offer.
   * @param options.assetContractAddress Optional address of the NFT contract for criteria offers (e.g., collection offers). Required when fulfilling collection offers.
   * @param options.tokenId Optional token ID for criteria offers (e.g., collection offers). Required when fulfilling collection offers.
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
    overrides,
  }: {
    order: OrderV2 | Order | Listing | Offer;
    accountAddress: string;
    assetContractAddress?: string;
    tokenId?: string;
    overrides?: Overrides;
  }): Promise<string> {
    await this.context.requireAccountIsAvailable(accountAddress);

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

    const isPrivateListing = "taker" in order ? !!order.taker : false;
    if (isPrivateListing) {
      return this.fulfillPrivateOrder({
        order: order as OrderV2,
        accountAddress,
        overrides,
      });
    }

    // Get fulfillment data from the API
    if (!orderHash) {
      throw new Error("Order hash is required to fulfill an order");
    }

    const fulfillmentData = await this.context.api.generateFulfillmentData(
      accountAddress,
      orderHash,
      protocolAddress,
      side,
      assetContractAddress,
      tokenId,
    );

    // Use the transaction data returned by the API
    const transaction = fulfillmentData.fulfillment_data.transaction;
    const inputData = transaction.input_data;

    // Encode the transaction data using ethers Interface
    const seaportInterface = new ethers.Interface([
      `function ${transaction.function}`,
    ]);

    // Extract function name and encode the parameters
    const functionName = transaction.function.split("(")[0];
    const encodedData = seaportInterface.encodeFunctionData(
      functionName,
      Object.values(inputData),
    );

    // Send the transaction using the signer from context
    const signer = this.context.signerOrProvider as Signer;
    const tx = await signer.sendTransaction({
      to: transaction.to,
      value: transaction.value,
      data: encodedData,
      ...overrides,
    });

    await this.context.confirmTransaction(
      tx.hash,
      EventType.MatchOrders,
      "Fulfilling order",
    );
    return tx.hash;
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
      this.context.seaport,
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
    await this.context.requireAccountIsAvailable(order.maker.address);
    requireValidProtocol(order.protocolAddress);

    this.context.dispatch(EventType.ApproveOrder, {
      orderV2: order,
      accountAddress: order.maker.address,
    });

    const seaport = getSeaportInstance(
      order.protocolAddress,
      this.context.seaport,
    );
    const transaction = await seaport
      .validate([order.protocolData], order.maker.address, domain)
      .transact();

    await this.context.confirmTransaction(
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
    await this.context.requireAccountIsAvailable(accountAddress);

    this.context.dispatch(EventType.ApproveOrder, {
      orderV2: { protocolData: orderComponents } as unknown as OrderV2,
      accountAddress,
    });

    const seaport = getSeaportInstance(
      DEFAULT_SEAPORT_CONTRACT_ADDRESS,
      this.context.seaport,
    );
    const transaction = await seaport
      .validate(
        [{ parameters: orderComponents, signature: "0x" }],
        accountAddress,
      )
      .transact();

    await this.context.confirmTransaction(
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
    amount,
    quantity = 1,
    domain,
    salt,
    listingTime,
    expirationTime,
    paymentTokenAddress,
    buyerAddress,
    includeOptionalCreatorFees = false,
    zone,
  }: {
    asset: AssetWithTokenId;
    accountAddress: string;
    amount: BigNumberish;
    quantity?: BigNumberish;
    domain?: string;
    salt?: BigNumberish;
    listingTime?: number;
    expirationTime?: number;
    paymentTokenAddress?: string;
    buyerAddress?: string;
    includeOptionalCreatorFees?: boolean;
    zone?: string;
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
        paymentTokenAddress,
        buyerAddress,
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
    amount,
    quantity = 1,
    domain,
    salt,
    expirationTime,
    paymentTokenAddress,
    zone,
  }: {
    asset: AssetWithTokenId;
    accountAddress: string;
    amount: BigNumberish;
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
      amount,
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
