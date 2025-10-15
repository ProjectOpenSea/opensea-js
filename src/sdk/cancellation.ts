import { Seaport } from "@opensea/seaport-js";
import { OrderComponents } from "@opensea/seaport-js/lib/types";
import { Overrides, Signer, JsonRpcProvider } from "ethers";
import { OpenSeaAPI } from "../api/api";
import { OrderV2 } from "../orders/types";
import { DEFAULT_SEAPORT_CONTRACT_ADDRESS } from "../orders/utils";
import { EventData, EventType, Chain } from "../types";
import {
  requireValidProtocol,
  getChainId,
  getSeaportVersion,
} from "../utils/utils";

/**
 * Order cancellation operations
 */
export class CancellationManager {
  constructor(
    private api: OpenSeaAPI,
    private chain: Chain,
    private signerOrProvider: Signer | JsonRpcProvider,
    private dispatch: (event: EventType, data: EventData) => void,
    private confirmTransaction: (
      hash: string,
      event: EventType,
      description: string,
    ) => Promise<void>,
    private getSeaportFn: (protocolAddress: string) => Seaport,
  ) {}

  /**
   * Cancel an order onchain, preventing it from ever being fulfilled.
   * This method accepts either a full OrderV2 object or an order hash with protocol address.
   *
   * @param options
   * @param options.order The order to cancel (OrderV2 object)
   * @param options.orderHash Optional order hash to cancel. Must provide protocolAddress if using this.
   * @param options.accountAddress The account address that will be cancelling the order.
   * @param options.protocolAddress Required when using orderHash. The Seaport protocol address for the order.
   * @param options.domain An optional domain to be hashed and included at the end of fulfillment calldata.  This can be used for on-chain order attribution to assist with analytics.
   *
   * @throws Error if neither order nor orderHash is provided.
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the order's protocol address is not supported by OpenSea. See {@link isValidProtocol}.
   */
  async cancelOrder({
    order,
    orderHash,
    accountAddress,
    protocolAddress = DEFAULT_SEAPORT_CONTRACT_ADDRESS,
    domain,
  }: {
    order?: OrderV2;
    orderHash?: string;
    accountAddress: string;
    protocolAddress?: string;
    domain?: string;
  }) {
    // Validate input
    if (!order && !orderHash) {
      throw new Error(
        "Either order or orderHash must be provided to cancel order",
      );
    }

    let orderToCancel: OrderV2;

    if (order) {
      // Using OrderV2 object directly
      requireValidProtocol(order.protocolAddress);
      orderToCancel = order;
    } else if (orderHash) {
      // Fetch order from API using order hash
      requireValidProtocol(protocolAddress);
      orderToCancel = await this.api.getOrderByHash(
        orderHash,
        protocolAddress,
        this.chain,
      );
      requireValidProtocol(orderToCancel.protocolAddress);
    } else {
      // Should never reach here due to earlier validation
      throw new Error("Invalid input");
    }

    this.dispatch(EventType.CancelOrder, {
      orderV2: orderToCancel,
      accountAddress,
    });

    // Transact and get the transaction hash
    const transactionHash = await this.cancelSeaportOrders({
      orders: [orderToCancel.protocolData.parameters],
      accountAddress,
      domain,
      protocolAddress: orderToCancel.protocolAddress,
    });

    // Await transaction confirmation
    await this.confirmTransaction(
      transactionHash,
      EventType.CancelOrder,
      "Cancelling order",
    );
  }

  /**
   * Cancel multiple orders onchain, preventing them from being fulfilled.
   * This method accepts either full OrderV2 objects, OrderComponents, or order hashes with protocol address.
   *
   * **Event Behavior**: For backwards compatibility with the singular `cancelOrder` method,
   * this method dispatches a `CancelOrder` event for the first order only, and only when
   * an OrderV2 object is available (either provided directly or fetched via orderHashes).
   * No event is dispatched when using OrderComponents directly, as they lack the full order data.
   *
   * @param options
   * @param options.orders Array of orders to cancel. Can be OrderV2 objects or OrderComponents.
   * @param options.orderHashes Optional array of order hashes to cancel. Must provide protocolAddress if using this.
   * @param options.accountAddress The account address cancelling the orders.
   * @param options.protocolAddress Required when using orderHashes. The Seaport protocol address for the orders.
   * @param options.domain An optional domain to be hashed and included at the end of fulfillment calldata.
   * @param options.overrides Transaction overrides, ignored if not set.
   * @returns Transaction hash of the cancellation.
   *
   * @throws Error if orderHashes is provided without protocolAddress.
   * @throws Error if neither orders nor orderHashes is provided.
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the order's protocol address is not supported by OpenSea. See {@link isValidProtocol}.
   */
  async cancelOrders({
    orders,
    orderHashes,
    accountAddress,
    protocolAddress = DEFAULT_SEAPORT_CONTRACT_ADDRESS,
    domain,
    overrides,
  }: {
    orders?: Array<OrderV2 | OrderComponents>;
    orderHashes?: string[];
    accountAddress: string;
    protocolAddress?: string;
    domain?: string;
    overrides?: Overrides;
  }): Promise<string> {
    // Validate input before making any external calls
    if (!orders && !orderHashes) {
      throw new Error(
        "Either orders or orderHashes must be provided to cancel orders",
      );
    }

    if (orders && orders.length === 0) {
      throw new Error("At least one order must be provided");
    }

    if (orderHashes && orderHashes.length === 0) {
      throw new Error("At least one order hash must be provided");
    }

    requireValidProtocol(protocolAddress);

    let orderComponents: OrderComponents[];
    let effectiveProtocolAddress = protocolAddress;
    let firstOrderV2: OrderV2 | undefined;

    if (orders) {
      // Extract OrderComponents from either OrderV2 objects or use OrderComponents directly
      orderComponents = orders.map((order) => {
        if ("protocolData" in order) {
          // It's an OrderV2 object
          const orderV2 = order as OrderV2;
          requireValidProtocol(orderV2.protocolAddress);
          effectiveProtocolAddress = orderV2.protocolAddress;
          // Save the first OrderV2 for event dispatching
          if (!firstOrderV2) {
            firstOrderV2 = orderV2;
          }
          return orderV2.protocolData.parameters;
        } else {
          // It's already OrderComponents
          return order as OrderComponents;
        }
      });
    } else if (orderHashes) {
      // Fetch orders from the API using order hashes
      const fetchedOrders: OrderV2[] = [];
      for (const orderHash of orderHashes) {
        const order = await this.api.getOrderByHash(
          orderHash,
          protocolAddress,
          this.chain,
        );
        fetchedOrders.push(order);
      }

      // Extract OrderComponents from the fetched orders
      orderComponents = fetchedOrders.map((order) => {
        requireValidProtocol(order.protocolAddress);
        effectiveProtocolAddress = order.protocolAddress;
        return order.protocolData.parameters;
      });

      // Save the first order for event dispatching
      firstOrderV2 = fetchedOrders[0];
    } else {
      // Should never reach here due to earlier validation
      throw new Error("Invalid input");
    }

    // Dispatch event for the first order if available (for backwards compatibility with cancelOrder)
    if (firstOrderV2) {
      this.dispatch(EventType.CancelOrder, {
        orderV2: firstOrderV2,
        accountAddress,
      });
    }

    // Transact and get the transaction hash
    const transactionHash = await this.cancelSeaportOrders({
      orders: orderComponents,
      accountAddress,
      domain,
      protocolAddress: effectiveProtocolAddress,
      overrides,
    });

    // Await transaction confirmation
    await this.confirmTransaction(
      transactionHash,
      EventType.CancelOrder,
      `Cancelling ${orderComponents.length} order(s)`,
    );

    return transactionHash;
  }

  /**
   * Cancel orders onchain, preventing them from being fulfilled.
   * @param options
   * @param options.orders The orders to cancel
   * @param options.accountAddress The account address cancelling the orders.
   * @param options.domain An optional domain to be hashed and included at the end of fulfillment calldata.
   *                       This can be used for on-chain order attribution to assist with analytics.
   * @param options.overrides Transaction overrides, ignored if not set.
   * @returns Transaction hash of the order.
   */
  private async cancelSeaportOrders({
    orders,
    accountAddress,
    domain,
    protocolAddress = DEFAULT_SEAPORT_CONTRACT_ADDRESS,
    overrides,
  }: {
    orders: OrderComponents[];
    accountAddress: string;
    domain?: string;
    protocolAddress?: string;
    overrides?: Overrides;
  }): Promise<string> {
    const seaport = this.getSeaportFn(protocolAddress);

    const transaction = await seaport
      .cancelOrders(orders, accountAddress, domain, overrides)
      .transact();

    return transaction.hash;
  }

  /**
   * Get the offerer signature for canceling an order offchain.
   * The signature will only be valid if the signer address is the address of the order's offerer.
   */
  async getOffererSignature(
    protocolAddress: string,
    orderHash: string,
    chain: Chain,
  ) {
    const chainId = getChainId(chain);
    const name = "Seaport";
    const version = getSeaportVersion(protocolAddress);

    if (typeof (this.signerOrProvider as Signer).signTypedData == "undefined") {
      throw new Error(
        "Please pass an ethers Signer into this sdk to derive an offerer signature",
      );
    }

    return (this.signerOrProvider as Signer).signTypedData(
      { chainId, name, version, verifyingContract: protocolAddress },
      { OrderHash: [{ name: "orderHash", type: "bytes32" }] },
      { orderHash },
    );
  }

  /**
   * Offchain cancel an order, offer or listing, by its order hash when protected by the SignedZone.
   * Protocol and Chain are required to prevent hash collisions.
   * Please note cancellation is only assured if a fulfillment signature was not vended prior to cancellation.
   * @param protocolAddress The Seaport address for the order.
   * @param orderHash The order hash, or external identifier, of the order.
   * @param chain The chain where the order is located.
   * @param offererSignature An EIP-712 signature from the offerer of the order.
   *                         If this is not provided, the API key used to initialize the SDK must belong to the order's offerer.
   *                         The signature must be a EIP-712 signature consisting of the order's Seaport contract's
   *                         name, version, address, and chain. The struct to sign is `OrderHash` containing a
   *                         single bytes32 field.
   * @param useSignerToDeriveOffererSignature Derive the offererSignature from the Ethers signer passed into this sdk.
   * @returns The response from the API.
   */
  async offchainCancelOrder(
    protocolAddress: string,
    orderHash: string,
    chain: Chain = this.chain,
    offererSignature?: string,
    useSignerToDeriveOffererSignature?: boolean,
  ) {
    if (useSignerToDeriveOffererSignature) {
      offererSignature = await this.getOffererSignature(
        protocolAddress,
        orderHash,
        chain,
      );
    }
    return this.api.offchainCancelOrder(
      protocolAddress,
      orderHash,
      chain,
      offererSignature,
    );
  }
}
