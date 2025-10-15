import {
  ConsiderationInputItem,
  CreateInputItem,
  OrderComponents,
} from "@opensea/seaport-js/lib/types";
import { BigNumberish, ZeroAddress } from "ethers";
import { CollectionOffer, NFT } from "../api/types";
import { INVERSE_BASIS_POINT } from "../constants";
import { SDKContext } from "./context";
import { OrderV2, ProtocolData } from "../orders/types";
import {
  Fee,
  OpenSeaCollection,
  OrderSide,
  TokenStandard,
  AssetWithTokenId,
} from "../types";
import { pluralize } from "../utils/stringHelper";
import {
  getMaxOrderExpirationTimestamp,
  getAssetItemType,
  getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress,
  basisPointsForFee,
  totalBasisPointsForFees,
  getFeeRecipient,
  getOfferPaymentToken,
  getListingPaymentToken,
  getSignedZone,
} from "../utils/utils";

/**
 * Result type for bulk operations that may partially succeed.
 * Contains successfully submitted orders and any failures with error information.
 * This is exported for future error recovery feature - not currently used.
 */
// eslint-disable-next-line import/no-unused-modules
export interface BulkOrderResult {
  /** Successfully submitted orders */
  successful: OrderV2[];
  /** Failed order submissions with error information */
  failed: Array<{
    /** Index of the failed order in the original input array */
    index: number;
    /** The signed order that failed to submit */
    order: ProtocolData;
    /** The error that occurred during submission */
    error: Error;
  }>;
}

/**
 * Manager for order building and creation operations.
 * Handles listing creation, offer creation, and collection offers.
 */
export class OrdersManager {
  constructor(
    private context: SDKContext,
    private getPriceParametersCallback: (
      orderSide: OrderSide,
      tokenAddress: string,
      startAmount: BigNumberish,
    ) => Promise<{ basePrice: bigint }>,
  ) {}

  private getAmountWithBasisPointsApplied(
    amount: bigint,
    basisPoints: bigint,
  ): string {
    return ((amount * basisPoints) / INVERSE_BASIS_POINT).toString();
  }

  private isNotMarketplaceFee(fee: Fee): boolean {
    return (
      fee.recipient.toLowerCase() !==
      getFeeRecipient(this.context.chain).toLowerCase()
    );
  }

  private getNFTItems(
    nfts: NFT[],
    quantities: bigint[] = [],
  ): CreateInputItem[] {
    return nfts.map((nft, index) => ({
      itemType: getAssetItemType(
        nft.token_standard.toUpperCase() as TokenStandard,
      ),
      token:
        getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress(
          nft.contract,
        ),
      identifier: nft.identifier ?? undefined,
      amount: quantities[index].toString() ?? "1",
    }));
  }

  private async getFees({
    collection,
    seller,
    paymentTokenAddress,
    startAmount,
    includeOptionalCreatorFees = false,
    isPrivateListing = false,
  }: {
    collection: OpenSeaCollection;
    seller?: string;
    paymentTokenAddress: string;
    startAmount: bigint;
    includeOptionalCreatorFees?: boolean;
    isPrivateListing?: boolean;
  }): Promise<ConsiderationInputItem[]> {
    let collectionFees = includeOptionalCreatorFees
      ? collection.fees
      : collection.fees.filter((fee) => fee.required);
    if (isPrivateListing) {
      collectionFees = collectionFees.filter((fee) =>
        this.isNotMarketplaceFee(fee),
      );
    }
    const collectionFeesBasisPoints = totalBasisPointsForFees(collectionFees);
    const sellerBasisPoints = INVERSE_BASIS_POINT - collectionFeesBasisPoints;

    const getConsiderationItem = (basisPoints: bigint, recipient?: string) => {
      return {
        token: paymentTokenAddress,
        amount: this.getAmountWithBasisPointsApplied(startAmount, basisPoints),
        recipient,
      };
    };

    const considerationItems: ConsiderationInputItem[] = [];

    if (seller) {
      considerationItems.push(getConsiderationItem(sellerBasisPoints, seller));
    }
    if (collectionFeesBasisPoints > 0) {
      for (const fee of collectionFees) {
        considerationItems.push(
          getConsiderationItem(basisPointsForFee(fee), fee.recipient),
        );
      }
    }
    return considerationItems;
  }

  /**
   * Build listing order without submitting to API
   * @param options Listing parameters
   * @returns OrderWithCounter ready for API submission or onchain validation
   */
  private async _buildListingOrder({
    asset,
    accountAddress,
    startAmount,
    quantity = 1,
    domain,
    salt,
    listingTime,
    expirationTime,
    paymentTokenAddress = getListingPaymentToken(this.context.chain),
    buyerAddress,
    includeOptionalCreatorFees = false,
    zone = ZeroAddress,
  }: {
    asset: AssetWithTokenId;
    accountAddress: string;
    startAmount: BigNumberish;
    quantity?: BigNumberish;
    domain?: string;
    salt?: BigNumberish;
    listingTime?: number;
    expirationTime?: number;
    paymentTokenAddress?: string;
    buyerAddress?: string;
    includeOptionalCreatorFees?: boolean;
    zone?: string;
  }) {
    await this.context.requireAccountIsAvailable(accountAddress);

    const { nft } = await this.context.api.getNFT(
      asset.tokenAddress,
      asset.tokenId,
    );
    const offerAssetItems = this.getNFTItems([nft], [BigInt(quantity ?? 1)]);

    const { basePrice } = await this.getPriceParametersCallback(
      OrderSide.LISTING,
      paymentTokenAddress,
      startAmount,
    );

    const collection = await this.context.api.getCollection(nft.collection);

    const considerationFeeItems = await this.getFees({
      collection,
      seller: accountAddress,
      paymentTokenAddress,
      startAmount: basePrice,
      includeOptionalCreatorFees,
      isPrivateListing: !!buyerAddress,
    });

    if (buyerAddress) {
      const { getPrivateListingConsiderations } = await import(
        "../orders/privateListings"
      );
      considerationFeeItems.push(
        ...getPrivateListingConsiderations(offerAssetItems, buyerAddress),
      );
    }

    if (collection.requiredZone) {
      zone = collection.requiredZone;
    }

    const { executeAllActions } = await this.context.seaport.createOrder(
      {
        offer: offerAssetItems,
        consideration: considerationFeeItems,
        startTime: listingTime?.toString(),
        endTime:
          expirationTime?.toString() ??
          getMaxOrderExpirationTimestamp().toString(),
        zone,
        domain,
        salt: BigInt(salt ?? 0).toString(),
        restrictedByZone: zone !== ZeroAddress,
        allowPartialFills: true,
      },
      accountAddress,
    );

    return executeAllActions();
  }

  /**
   * Build listing order components without submitting to API
   * @param options Listing parameters
   * @returns OrderComponents ready for onchain validation
   */
  async buildListingOrderComponents({
    asset,
    accountAddress,
    startAmount,
    quantity = 1,
    domain,
    salt,
    listingTime,
    expirationTime,
    paymentTokenAddress = getListingPaymentToken(this.context.chain),
    buyerAddress,
    includeOptionalCreatorFees = false,
    zone = ZeroAddress,
  }: {
    asset: AssetWithTokenId;
    accountAddress: string;
    startAmount: BigNumberish;
    quantity?: BigNumberish;
    domain?: string;
    salt?: BigNumberish;
    listingTime?: number;
    expirationTime?: number;
    paymentTokenAddress?: string;
    buyerAddress?: string;
    includeOptionalCreatorFees?: boolean;
    zone?: string;
  }): Promise<OrderComponents> {
    const order = await this._buildListingOrder({
      asset,
      accountAddress,
      startAmount,
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
    return order.parameters;
  }

  /**
   * Build offer order without submitting to API
   * @param options Offer parameters
   * @returns OrderWithCounter ready for API submission or onchain validation
   */
  private async _buildOfferOrder({
    asset,
    accountAddress,
    startAmount,
    quantity = 1,
    domain,
    salt,
    expirationTime,
    paymentTokenAddress = getOfferPaymentToken(this.context.chain),
    zone = getSignedZone(this.context.chain),
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
  }) {
    await this.context.requireAccountIsAvailable(accountAddress);

    const { nft } = await this.context.api.getNFT(
      asset.tokenAddress,
      asset.tokenId,
    );
    const considerationAssetItems = this.getNFTItems(
      [nft],
      [BigInt(quantity ?? 1)],
    );

    const { basePrice } = await this.getPriceParametersCallback(
      OrderSide.OFFER,
      paymentTokenAddress,
      startAmount,
    );

    const collection = await this.context.api.getCollection(nft.collection);

    const considerationFeeItems = await this.getFees({
      collection,
      paymentTokenAddress,
      startAmount: basePrice,
    });

    if (collection.requiredZone) {
      zone = collection.requiredZone;
    }

    const { executeAllActions } = await this.context.seaport.createOrder(
      {
        offer: [
          {
            token: paymentTokenAddress,
            amount: basePrice.toString(),
          },
        ],
        consideration: [...considerationAssetItems, ...considerationFeeItems],
        endTime:
          expirationTime !== undefined
            ? BigInt(expirationTime).toString()
            : getMaxOrderExpirationTimestamp().toString(),
        zone,
        domain,
        salt: BigInt(salt ?? 0).toString(),
        restrictedByZone: zone !== ZeroAddress,
        allowPartialFills: true,
      },
      accountAddress,
    );

    return executeAllActions();
  }

  /**
   * Build offer order components without submitting to API
   * @param options Offer parameters
   * @returns OrderComponents ready for onchain validation
   */
  async buildOfferOrderComponents({
    asset,
    accountAddress,
    startAmount,
    quantity = 1,
    domain,
    salt,
    expirationTime,
    paymentTokenAddress = getOfferPaymentToken(this.context.chain),
    zone = getSignedZone(this.context.chain),
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
  }): Promise<OrderComponents> {
    const order = await this._buildOfferOrder({
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
    return order.parameters;
  }

  /**
   * Create and submit an offer on an asset.
   * @param options
   * @param options.asset The asset to trade. tokenAddress and tokenId must be defined.
   * @param options.accountAddress Address of the wallet making the offer.
   * @param options.startAmount Value of the offer in units, not base units e.g. not wei, of the payment token (or WETH if no payment token address specified)
   * @param options.quantity The number of assets to bid for (if fungible or semi-fungible). Defaults to 1.
   * @param options.domain An optional domain to be hashed and included in the first four bytes of the random salt.
   * @param options.salt Arbitrary salt. If not passed in, a random salt will be generated with the first four bytes being the domain hash or empty.
   * @param options.expirationTime Expiration time for the order, in UTC seconds
   * @param options.paymentTokenAddress ERC20 address for the payment token in the order. If unspecified, defaults to WETH
   * @param options.zone The zone to use for the order. If unspecified, defaults to the chain's signed zone for order protection.
   *
   * @returns The {@link OrderV2} that was created.
   *
   * @throws Error if the asset does not contain a token id.
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the startAmount is not greater than 0.
   * @throws Error if paymentTokenAddress is not WETH on anything other than Ethereum mainnet.
   */
  async createOffer({
    asset,
    accountAddress,
    startAmount,
    quantity = 1,
    domain,
    salt,
    expirationTime,
    paymentTokenAddress = getOfferPaymentToken(this.context.chain),
    zone = getSignedZone(this.context.chain),
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
  }): Promise<OrderV2> {
    const order = await this._buildOfferOrder({
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

    return this.context.api.postOrder(order, {
      protocol: "seaport",
      protocolAddress: this.context.seaport.contract.target as string,
      side: OrderSide.OFFER,
    });
  }

  /**
   * Create and submit a listing for an asset.
   * @param options
   * @param options.asset The asset to trade. tokenAddress and tokenId must be defined.
   * @param options.accountAddress  Address of the wallet making the listing
   * @param options.startAmount Value of the listing in units, not base units e.g. not wei, of the payment token (or WETH if no payment token address specified)
   * @param options.quantity The number of assets to list (if fungible or semi-fungible). Defaults to 1.
   * @param options.domain An optional domain to be hashed and included in the first four bytes of the random salt. This can be used for on-chain order attribution to assist with analytics.
   * @param options.salt Arbitrary salt. If not passed in, a random salt will be generated with the first four bytes being the domain hash or empty.
   * @param options.listingTime Optional time when the order will become fulfillable, in UTC seconds. Undefined means it will start now.
   * @param options.expirationTime Expiration time for the order, in UTC seconds.
   * @param options.paymentTokenAddress ERC20 address for the payment token in the order. If unspecified, defaults to ETH
   * @param options.buyerAddress Optional address that's allowed to purchase this item. If specified, no other address will be able to take the order, unless its value is the null address.
   * @param options.includeOptionalCreatorFees If true, optional creator fees will be included in the listing. Default: false.
   * @param options.zone The zone to use for the order. For order protection, pass SIGNED_ZONE. If unspecified, defaults to no zone.
   * @returns The {@link OrderV2} that was created.
   *
   * @throws Error if the asset does not contain a token id.
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if the startAmount is not greater than 0.
   * @throws Error if paymentTokenAddress is not WETH on anything other than Ethereum mainnet.
   */
  async createListing({
    asset,
    accountAddress,
    startAmount,
    quantity = 1,
    domain,
    salt,
    listingTime,
    expirationTime,
    paymentTokenAddress = getListingPaymentToken(this.context.chain),
    buyerAddress,
    includeOptionalCreatorFees = false,
    zone = ZeroAddress,
  }: {
    asset: AssetWithTokenId;
    accountAddress: string;
    startAmount: BigNumberish;
    quantity?: BigNumberish;
    domain?: string;
    salt?: BigNumberish;
    listingTime?: number;
    expirationTime?: number;
    paymentTokenAddress?: string;
    buyerAddress?: string;
    includeOptionalCreatorFees?: boolean;
    zone?: string;
  }): Promise<OrderV2> {
    const order = await this._buildListingOrder({
      asset,
      accountAddress,
      startAmount,
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

    return this.context.api.postOrder(order, {
      protocol: "seaport",
      protocolAddress: this.context.seaport.contract.target as string,
      side: OrderSide.LISTING,
    });
  }

  /**
   * Create and submit multiple listings using Seaport's bulk order creation.
   * This method uses a single signature for all listings and submits them individually to the OpenSea API with rate limit handling.
   * All listings must be from the same account address.
   *
   * Note: If only one listing is provided, this method will use a normal order signature instead of a bulk signature,
   * as bulk signatures are more expensive to decode on-chain due to the merkle proof verification.
   *
   * @param options
   * @param options.listings Array of listing parameters. Each listing requires asset, startAmount, and optionally other listing parameters.
   * @param options.accountAddress Address of the wallet making the listings
   * @returns Array of {@link OrderV2} objects that were created.
   *
   * @throws Error if listings array is empty
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if any asset does not contain a token id.
   */
  async createBulkListings({
    listings,
    accountAddress,
  }: {
    listings: Array<{
      asset: AssetWithTokenId;
      startAmount: BigNumberish;
      quantity?: BigNumberish;
      domain?: string;
      salt?: BigNumberish;
      listingTime?: number;
      expirationTime?: number;
      paymentTokenAddress?: string;
      buyerAddress?: string;
      includeOptionalCreatorFees?: boolean;
      zone?: string;
    }>;
    accountAddress: string;
  }): Promise<OrderV2[]> {
    if (listings.length === 0) {
      throw new Error("Listings array cannot be empty");
    }

    // If only one listing, use normal signature to avoid bulk signature overhead
    if (listings.length === 1) {
      const order = await this.createListing({
        ...listings[0],
        accountAddress,
      });
      return [order];
    }

    await this.context.requireAccountIsAvailable(accountAddress);

    // Build CreateOrderInput array for seaport.createBulkOrders
    const createOrderInputs: CreateInputItem[][] = [];
    const listingMetadata: Array<{
      nft: NFT;
      collection: OpenSeaCollection;
      paymentTokenAddress: string;
      zone: string;
      domain?: string;
      salt?: BigNumberish;
      listingTime?: number;
      expirationTime?: number;
    }> = [];

    // Build all order inputs
    for (const listing of listings) {
      const {
        asset,
        startAmount,
        quantity = 1,
        domain,
        salt,
        listingTime,
        expirationTime,
        paymentTokenAddress = getListingPaymentToken(this.context.chain),
        buyerAddress,
        includeOptionalCreatorFees = false,
        zone = ZeroAddress,
      } = listing;

      // Fetch NFT and collection data
      const { nft } = await this.context.api.getNFT(
        asset.tokenAddress,
        asset.tokenId,
      );
      const collection = await this.context.api.getCollection(nft.collection);

      const offerAssetItems = this.getNFTItems([nft], [BigInt(quantity ?? 1)]);

      const { basePrice } = await this.getPriceParametersCallback(
        OrderSide.LISTING,
        paymentTokenAddress,
        startAmount,
      );

      const considerationFeeItems = await this.getFees({
        collection,
        seller: accountAddress,
        paymentTokenAddress,
        startAmount: basePrice,
        includeOptionalCreatorFees,
        isPrivateListing: !!buyerAddress,
      });

      if (buyerAddress) {
        const { getPrivateListingConsiderations } = await import(
          "../orders/privateListings"
        );
        considerationFeeItems.push(
          ...getPrivateListingConsiderations(offerAssetItems, buyerAddress),
        );
      }

      let finalZone = zone;
      if (collection.requiredZone) {
        finalZone = collection.requiredZone;
      }

      createOrderInputs.push(offerAssetItems);
      listingMetadata.push({
        nft,
        collection,
        paymentTokenAddress,
        zone: finalZone,
        domain,
        salt,
        listingTime,
        expirationTime,
      });
    }

    // Create the bulk orders using seaport's createBulkOrders method
    const createOrderInputsForSeaport = listings.map((listing, index) => {
      const {
        startAmount,
        quantity = 1,
        listingTime,
        expirationTime,
        buyerAddress,
        includeOptionalCreatorFees = false,
      } = listing;

      const metadata = listingMetadata[index];
      const offerAssetItems = this.getNFTItems(
        [metadata.nft],
        [BigInt(quantity ?? 1)],
      );

      return this.getPriceParametersCallback(
        OrderSide.LISTING,
        metadata.paymentTokenAddress,
        startAmount,
      ).then(async ({ basePrice }) => {
        const considerationFeeItems = await this.getFees({
          collection: metadata.collection,
          seller: accountAddress,
          paymentTokenAddress: metadata.paymentTokenAddress,
          startAmount: basePrice,
          includeOptionalCreatorFees,
          isPrivateListing: !!buyerAddress,
        });

        if (buyerAddress) {
          const { getPrivateListingConsiderations } = await import(
            "../orders/privateListings"
          );
          considerationFeeItems.push(
            ...getPrivateListingConsiderations(offerAssetItems, buyerAddress),
          );
        }

        return {
          offer: offerAssetItems,
          consideration: considerationFeeItems,
          startTime: listingTime?.toString(),
          endTime:
            expirationTime?.toString() ??
            getMaxOrderExpirationTimestamp().toString(),
          zone: metadata.zone,
          domain: metadata.domain,
          salt: metadata.salt
            ? BigInt(metadata.salt ?? 0).toString()
            : undefined,
          restrictedByZone: metadata.zone !== ZeroAddress,
          allowPartialFills: true,
        };
      });
    });

    const resolvedInputs = await Promise.all(createOrderInputsForSeaport);

    const { executeAllActions } = await this.context.seaport.createBulkOrders(
      resolvedInputs,
      accountAddress,
    );

    const orders = await executeAllActions();

    // Submit each order individually to the OpenSea API
    // Rate limiting is handled automatically by the API client
    this.context.logger(
      `Starting submission of ${orders.length} bulk-signed ${pluralize(orders.length, "listing")} to OpenSea API...`,
    );

    const submittedOrders: OrderV2[] = [];
    for (let i = 0; i < orders.length; i++) {
      this.context.logger(`Submitting listing ${i + 1}/${orders.length}...`);
      const submittedOrder = await this.context.api.postOrder(orders[i], {
        protocol: "seaport",
        protocolAddress: this.context.seaport.contract.target as string,
        side: OrderSide.LISTING,
      });
      submittedOrders.push(submittedOrder);
      this.context.logger(`Completed listing ${i + 1}/${orders.length}`);
    }

    this.context.logger(
      `Successfully submitted all ${submittedOrders.length} ${pluralize(submittedOrders.length, "listing")}`,
    );

    return submittedOrders;
  }

  /**
   * Create and submit multiple offers using Seaport's bulk order creation.
   * This method uses a single signature for all offers and submits them individually to the OpenSea API with rate limit handling.
   * All offers must be from the same account address.
   *
   * Note: If only one offer is provided, this method will use a normal order signature instead of a bulk signature,
   * as bulk signatures are more expensive to decode on-chain due to the merkle proof verification.
   *
   * @param options
   * @param options.offers Array of offer parameters. Each offer requires asset, startAmount, and optionally other offer parameters.
   * @param options.accountAddress Address of the wallet making the offers
   * @returns Array of {@link OrderV2} objects that were created.
   *
   * @throws Error if offers array is empty
   * @throws Error if the accountAddress is not available through wallet or provider.
   * @throws Error if any asset does not contain a token id.
   */
  async createBulkOffers({
    offers,
    accountAddress,
  }: {
    offers: Array<{
      asset: AssetWithTokenId;
      startAmount: BigNumberish;
      quantity?: BigNumberish;
      domain?: string;
      salt?: BigNumberish;
      expirationTime?: BigNumberish;
      paymentTokenAddress?: string;
      zone?: string;
    }>;
    accountAddress: string;
  }): Promise<OrderV2[]> {
    if (offers.length === 0) {
      throw new Error("Offers array cannot be empty");
    }

    // If only one offer, use normal signature to avoid bulk signature overhead
    if (offers.length === 1) {
      const order = await this.createOffer({
        ...offers[0],
        accountAddress,
      });
      return [order];
    }

    await this.context.requireAccountIsAvailable(accountAddress);

    // Build CreateOrderInput array for seaport.createBulkOrders
    const createOrderInputs: CreateInputItem[][] = [];
    const offerMetadata: Array<{
      nft: NFT;
      collection: OpenSeaCollection;
      paymentTokenAddress: string;
      zone: string;
      domain?: string;
      salt?: BigNumberish;
      expirationTime?: BigNumberish;
    }> = [];

    // Build all order inputs
    for (const offer of offers) {
      const {
        asset,
        quantity = 1,
        domain,
        salt,
        expirationTime,
        paymentTokenAddress = getOfferPaymentToken(this.context.chain),
        zone = getSignedZone(this.context.chain),
      } = offer;

      // Fetch NFT and collection data
      const { nft } = await this.context.api.getNFT(
        asset.tokenAddress,
        asset.tokenId,
      );
      const collection = await this.context.api.getCollection(nft.collection);

      const considerationAssetItems = this.getNFTItems(
        [nft],
        [BigInt(quantity ?? 1)],
      );

      let finalZone = zone;
      if (collection.requiredZone) {
        finalZone = collection.requiredZone;
      }

      createOrderInputs.push(considerationAssetItems);
      offerMetadata.push({
        nft,
        collection,
        paymentTokenAddress,
        zone: finalZone,
        domain,
        salt,
        expirationTime,
      });
    }

    // Create the bulk orders using seaport's createBulkOrders method
    const createOrderInputsForSeaport = offers.map((offer, index) => {
      const { startAmount, quantity = 1 } = offer;

      const metadata = offerMetadata[index];
      const considerationAssetItems = this.getNFTItems(
        [metadata.nft],
        [BigInt(quantity ?? 1)],
      );

      return this.getPriceParametersCallback(
        OrderSide.OFFER,
        metadata.paymentTokenAddress,
        startAmount,
      ).then(async ({ basePrice }) => {
        const considerationFeeItems = await this.getFees({
          collection: metadata.collection,
          paymentTokenAddress: metadata.paymentTokenAddress,
          startAmount: basePrice,
        });

        return {
          offer: [
            {
              token: metadata.paymentTokenAddress,
              amount: basePrice.toString(),
            },
          ],
          consideration: [...considerationAssetItems, ...considerationFeeItems],
          endTime:
            metadata.expirationTime !== undefined
              ? BigInt(metadata.expirationTime).toString()
              : getMaxOrderExpirationTimestamp().toString(),
          zone: metadata.zone,
          domain: metadata.domain,
          salt: metadata.salt
            ? BigInt(metadata.salt ?? 0).toString()
            : undefined,
          restrictedByZone: metadata.zone !== ZeroAddress,
          allowPartialFills: true,
        };
      });
    });

    const resolvedInputs = await Promise.all(createOrderInputsForSeaport);

    const { executeAllActions } = await this.context.seaport.createBulkOrders(
      resolvedInputs,
      accountAddress,
    );

    const orders = await executeAllActions();

    // Submit each order individually to the OpenSea API
    // Rate limiting is handled automatically by the API client
    this.context.logger(
      `Starting submission of ${orders.length} bulk-signed ${pluralize(orders.length, "offer")} to OpenSea API...`,
    );

    const submittedOrders: OrderV2[] = [];
    for (let i = 0; i < orders.length; i++) {
      this.context.logger(`Submitting offer ${i + 1}/${orders.length}...`);
      const submittedOrder = await this.context.api.postOrder(orders[i], {
        protocol: "seaport",
        protocolAddress: this.context.seaport.contract.target as string,
        side: OrderSide.OFFER,
      });
      submittedOrders.push(submittedOrder);
      this.context.logger(`Completed offer ${i + 1}/${orders.length}`);
    }

    this.context.logger(
      `Successfully submitted all ${submittedOrders.length} ${pluralize(submittedOrders.length, "offer")}`,
    );

    return submittedOrders;
  }

  /**
   * Create and submit a collection offer.
   * @param options
   * @param options.collectionSlug Identifier for the collection.
   * @param options.accountAddress Address of the wallet making the offer.
   * @param options.amount Value of the offer in units, not base units e.g. not wei, of the payment token (or WETH if no payment token address specified).
   * @param options.quantity The number of assets to bid for (if fungible or semi-fungible).
   * @param options.domain An optional domain to be hashed and included in the first four bytes of the random salt. This can be used for on-chain order attribution to assist with analytics.
   * @param options.salt Arbitrary salt. If not passed in, a random salt will be generated with the first four bytes being the domain hash or empty.
   * @param options.expirationTime Expiration time for the order, in UTC seconds.
   * @param options.paymentTokenAddress ERC20 address for the payment token in the order. If unspecified, defaults to WETH.
   * @param options.offerProtectionEnabled Build the offer on OpenSea's signed zone to provide offer protections from receiving an item which is disabled from trading.
   * @param options.traitType If defined, the trait name to create the collection offer for.
   * @param options.traitValue If defined, the trait value to create the collection offer for.
   * @returns The {@link CollectionOffer} that was created.
   */
  async createCollectionOffer({
    collectionSlug,
    accountAddress,
    amount,
    quantity,
    domain,
    salt,
    expirationTime,
    paymentTokenAddress = getOfferPaymentToken(this.context.chain),
    offerProtectionEnabled = true,
    traitType,
    traitValue,
  }: {
    collectionSlug: string;
    accountAddress: string;
    amount: BigNumberish;
    quantity: number;
    domain?: string;
    salt?: BigNumberish;
    expirationTime?: number | string;
    paymentTokenAddress: string;
    offerProtectionEnabled?: boolean;
    traitType?: string;
    traitValue?: string;
  }): Promise<CollectionOffer | null> {
    await this.context.requireAccountIsAvailable(accountAddress);

    const collection = await this.context.api.getCollection(collectionSlug);
    const buildOfferResult = await this.context.api.buildOffer(
      accountAddress,
      quantity,
      collectionSlug,
      offerProtectionEnabled,
      traitType,
      traitValue,
    );
    const item = buildOfferResult.partialParameters.consideration[0];
    const convertedConsiderationItem = {
      itemType: item.itemType,
      token: item.token,
      identifier: item.identifierOrCriteria,
      amount: item.startAmount,
    };

    const { basePrice } = await this.getPriceParametersCallback(
      OrderSide.LISTING,
      paymentTokenAddress,
      amount,
    );
    const considerationFeeItems = await this.getFees({
      collection,
      paymentTokenAddress,
      startAmount: basePrice,
    });

    const considerationItems = [
      convertedConsiderationItem,
      ...considerationFeeItems,
    ];

    const payload = {
      offerer: accountAddress,
      offer: [
        {
          token: paymentTokenAddress,
          amount: basePrice.toString(),
        },
      ],
      consideration: considerationItems,
      endTime:
        expirationTime?.toString() ??
        getMaxOrderExpirationTimestamp().toString(),
      zone: buildOfferResult.partialParameters.zone,
      domain,
      salt: BigInt(salt ?? 0).toString(),
      restrictedByZone: true,
      allowPartialFills: true,
    };

    const { executeAllActions } = await this.context.seaport.createOrder(
      payload,
      accountAddress,
    );
    const order = await executeAllActions();

    return this.context.api.postCollectionOffer(
      order,
      collectionSlug,
      traitType,
      traitValue,
    );
  }
}
