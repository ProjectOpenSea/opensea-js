import { Seaport } from "@opensea/seaport-js";
import {
  ConsiderationInputItem,
  CreateInputItem,
  OrderComponents,
} from "@opensea/seaport-js/lib/types";
import { BigNumberish, ZeroAddress, ethers } from "ethers";
import { OpenSeaAPI } from "../api/api";
import { CollectionOffer, NFT } from "../api/types";
import {
  ENGLISH_AUCTION_ZONE_MAINNETS,
  INVERSE_BASIS_POINT,
} from "../constants";
import { DEFAULT_SEAPORT_CONTRACT_ADDRESS } from "../orders/utils";
import { OrderV2 } from "../orders/types";
import {
  Chain,
  Fee,
  OpenSeaCollection,
  OrderSide,
  TokenStandard,
  AssetWithTokenId,
} from "../types";
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
 * Manager for order building and creation operations.
 * Handles listing creation, offer creation, and collection offers.
 */
export class OrdersManager {
  constructor(
    private seaport: Seaport,
    private api: OpenSeaAPI,
    private chain: Chain,
    private requireAccountIsAvailable: (address: string) => Promise<void>,
    private getPriceParametersCallback: (
      orderSide: OrderSide,
      tokenAddress: string,
      expirationTime: BigNumberish,
      startAmount: BigNumberish,
      endAmount?: BigNumberish,
    ) => Promise<{ basePrice: bigint; endPrice: bigint | undefined }>,
  ) {}

  private getAmountWithBasisPointsApplied(
    amount: bigint,
    basisPoints: bigint,
  ): string {
    return ((amount * basisPoints) / INVERSE_BASIS_POINT).toString();
  }

  private isNotMarketplaceFee(fee: Fee): boolean {
    return (
      fee.recipient.toLowerCase() !== getFeeRecipient(this.chain).toLowerCase()
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
    endAmount,
    includeOptionalCreatorFees = false,
    isPrivateListing = false,
  }: {
    collection: OpenSeaCollection;
    seller?: string;
    paymentTokenAddress: string;
    startAmount: bigint;
    endAmount?: bigint;
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
        endAmount: this.getAmountWithBasisPointsApplied(
          endAmount ?? startAmount,
          basisPoints,
        ),
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
    endAmount,
    quantity = 1,
    domain,
    salt,
    listingTime,
    expirationTime,
    paymentTokenAddress = getListingPaymentToken(this.chain),
    buyerAddress,
    englishAuction,
    includeOptionalCreatorFees = false,
    zone = ZeroAddress,
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
  }) {
    await this.requireAccountIsAvailable(accountAddress);

    const { nft } = await this.api.getNFT(asset.tokenAddress, asset.tokenId);
    const offerAssetItems = this.getNFTItems([nft], [BigInt(quantity ?? 1)]);

    if (englishAuction) {
      throw new Error("English auctions are no longer supported on OpenSea");
    }
    if (englishAuction && paymentTokenAddress == ethers.ZeroAddress) {
      throw new Error(
        `English auctions must use wrapped ETH or an ERC-20 token.`,
      );
    }

    const { basePrice, endPrice } = await this.getPriceParametersCallback(
      OrderSide.LISTING,
      paymentTokenAddress,
      expirationTime ?? getMaxOrderExpirationTimestamp(),
      startAmount,
      endAmount ?? undefined,
    );

    const collection = await this.api.getCollection(nft.collection);

    const considerationFeeItems = await this.getFees({
      collection,
      seller: accountAddress,
      paymentTokenAddress,
      startAmount: basePrice,
      endAmount: endPrice,
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

    if (englishAuction) {
      zone = ENGLISH_AUCTION_ZONE_MAINNETS;
    } else if (collection.requiredZone) {
      zone = collection.requiredZone;
    }

    const { executeAllActions } = await this.seaport.createOrder(
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
        allowPartialFills: englishAuction ? false : true,
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
    endAmount,
    quantity = 1,
    domain,
    salt,
    listingTime,
    expirationTime,
    paymentTokenAddress = getListingPaymentToken(this.chain),
    buyerAddress,
    englishAuction,
    includeOptionalCreatorFees = false,
    zone = ZeroAddress,
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
  }): Promise<OrderComponents> {
    const order = await this._buildListingOrder({
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
    paymentTokenAddress = getOfferPaymentToken(this.chain),
    zone = getSignedZone(this.chain),
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
    await this.requireAccountIsAvailable(accountAddress);

    const { nft } = await this.api.getNFT(asset.tokenAddress, asset.tokenId);
    const considerationAssetItems = this.getNFTItems(
      [nft],
      [BigInt(quantity ?? 1)],
    );

    const { basePrice } = await this.getPriceParametersCallback(
      OrderSide.OFFER,
      paymentTokenAddress,
      expirationTime ?? getMaxOrderExpirationTimestamp(),
      startAmount,
    );

    const collection = await this.api.getCollection(nft.collection);

    const considerationFeeItems = await this.getFees({
      collection,
      paymentTokenAddress,
      startAmount: basePrice,
    });

    if (collection.requiredZone) {
      zone = collection.requiredZone;
    }

    const { executeAllActions } = await this.seaport.createOrder(
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
    paymentTokenAddress = getOfferPaymentToken(this.chain),
    zone = getSignedZone(this.chain),
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
    paymentTokenAddress = getOfferPaymentToken(this.chain),
    zone = getSignedZone(this.chain),
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

    return this.api.postOrder(order, {
      protocol: "seaport",
      protocolAddress: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
      side: OrderSide.OFFER,
    });
  }

  /**
   * Create and submit a listing for an asset.
   * @param options
   * @param options.asset The asset to trade. tokenAddress and tokenId must be defined.
   * @param options.accountAddress  Address of the wallet making the listing
   * @param options.startAmount Value of the listing at the start of the auction in units, not base units e.g. not wei, of the payment token (or WETH if no payment token address specified)
   * @param options.endAmount Value of the listing at the end of the auction. If specified, price will change linearly between startAmount and endAmount as time progresses.
   * @param options.quantity The number of assets to list (if fungible or semi-fungible). Defaults to 1.
   * @param options.domain An optional domain to be hashed and included in the first four bytes of the random salt. This can be used for on-chain order attribution to assist with analytics.
   * @param options.salt Arbitrary salt. If not passed in, a random salt will be generated with the first four bytes being the domain hash or empty.
   * @param options.listingTime Optional time when the order will become fulfillable, in UTC seconds. Undefined means it will start now.
   * @param options.expirationTime Expiration time for the order, in UTC seconds.
   * @param options.paymentTokenAddress ERC20 address for the payment token in the order. If unspecified, defaults to ETH
   * @param options.buyerAddress Optional address that's allowed to purchase this item. If specified, no other address will be able to take the order, unless its value is the null address.
   * @param options.englishAuction If true, the order will be listed as an English auction.
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
    endAmount,
    quantity = 1,
    domain,
    salt,
    listingTime,
    expirationTime,
    paymentTokenAddress = getListingPaymentToken(this.chain),
    buyerAddress,
    englishAuction,
    includeOptionalCreatorFees = false,
    zone = ZeroAddress,
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
  }): Promise<OrderV2> {
    const order = await this._buildListingOrder({
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

    return this.api.postOrder(order, {
      protocol: "seaport",
      protocolAddress: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
      side: OrderSide.LISTING,
    });
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
    paymentTokenAddress = getOfferPaymentToken(this.chain),
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
    await this.requireAccountIsAvailable(accountAddress);

    const collection = await this.api.getCollection(collectionSlug);
    const buildOfferResult = await this.api.buildOffer(
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
      expirationTime ?? getMaxOrderExpirationTimestamp(),
      amount,
    );
    const considerationFeeItems = await this.getFees({
      collection,
      paymentTokenAddress,
      startAmount: basePrice,
      endAmount: basePrice,
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

    const { executeAllActions } = await this.seaport.createOrder(
      payload,
      accountAddress,
    );
    const order = await executeAllActions();

    return this.api.postCollectionOffer(
      order,
      collectionSlug,
      traitType,
      traitValue,
    );
  }
}
