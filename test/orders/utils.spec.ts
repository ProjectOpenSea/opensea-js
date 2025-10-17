import { expect } from "chai";
import { suite, test } from "mocha";
import { OrderType, ProtocolData } from "../../src/orders/types";
import {
  serializeOrdersQueryOptions,
  deserializeOrder,
  getFulfillmentDataPath,
  getPostCollectionOfferPayload,
  getBuildCollectionOfferPayload,
  getFulfillListingPayload,
  getFulfillOfferPayload,
  DEFAULT_SEAPORT_CONTRACT_ADDRESS,
} from "../../src/orders/utils";
import { Chain, OrderSide } from "../../src/types";

suite("Orders: utils", () => {
  suite("serializeOrdersQueryOptions", () => {
    test("should omit token_ids when neither tokenId nor tokenIds is provided", () => {
      const result = serializeOrdersQueryOptions({});
      expect(result.token_ids).to.be.undefined;
    });

    test("should wrap single tokenId in array", () => {
      const result = serializeOrdersQueryOptions({ tokenId: "123" });
      expect(result.token_ids).to.deep.equal(["123"]);
    });

    test("should use tokenIds array directly when provided", () => {
      const result = serializeOrdersQueryOptions({
        tokenIds: ["1", "2", "3"],
      });
      expect(result.token_ids).to.deep.equal(["1", "2", "3"]);
    });

    test("should prefer tokenIds over tokenId when both are provided", () => {
      const result = serializeOrdersQueryOptions({
        tokenId: "123",
        tokenIds: ["1", "2", "3"],
      });
      expect(result.token_ids).to.deep.equal(["1", "2", "3"]);
    });

    test("should serialize all query options correctly", () => {
      const result = serializeOrdersQueryOptions({
        limit: 10,
        cursor: "cursor123",
        paymentTokenAddress: "0xPaymentToken",
        maker: "0xMaker",
        taker: "0xTaker",
        owner: "0xOwner",
        listedAfter: 1234567890,
        listedBefore: 9876543210,
        tokenId: "1",
        assetContractAddress: "0xContract",
        orderBy: "created_date",
        orderDirection: "desc",
        onlyEnglish: true,
      });

      expect(result).to.deep.equal({
        limit: 10,
        cursor: "cursor123",
        payment_token_address: "0xPaymentToken",
        maker: "0xMaker",
        taker: "0xTaker",
        owner: "0xOwner",
        listed_after: 1234567890,
        listed_before: 9876543210,
        token_ids: ["1"],
        asset_contract_address: "0xContract",
        order_by: "created_date",
        order_direction: "desc",
        only_english: true,
      });
    });

    test("should use cursor over next when both are provided", () => {
      const result = serializeOrdersQueryOptions({
        cursor: "cursor123",
        next: "next456",
      });
      expect(result.cursor).to.equal("cursor123");
    });

    test("should use next when cursor is not provided", () => {
      const result = serializeOrdersQueryOptions({
        next: "next456",
      });
      expect(result.cursor).to.equal("next456");
    });

    test("should handle empty tokenIds array", () => {
      const result = serializeOrdersQueryOptions({
        tokenIds: [],
      });
      expect(result.token_ids).to.deep.equal([]);
    });
  });

  suite("getFulfillmentDataPath", () => {
    test("should return listings path for LISTING side", () => {
      const result = getFulfillmentDataPath(OrderSide.LISTING);
      expect(result).to.equal("/v2/listings/fulfillment_data");
    });

    test("should return offers path for OFFER side", () => {
      const result = getFulfillmentDataPath(OrderSide.OFFER);
      expect(result).to.equal("/v2/offers/fulfillment_data");
    });
  });

  suite("getPostCollectionOfferPayload", () => {
    test("should create basic collection offer payload without traits", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const protocolData = { parameters: {} } as any as ProtocolData;
      const result = getPostCollectionOfferPayload(
        "boredapeyachtclub",
        protocolData,
      );

      expect(result).to.deep.equal({
        criteria: {
          collection: { slug: "boredapeyachtclub" },
        },
        protocol_data: protocolData,
        protocol_address: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
      });
    });

    test("should add trait criteria when both traitType and traitValue are provided", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const protocolData = { parameters: {} } as any as ProtocolData;
      const result = getPostCollectionOfferPayload(
        "boredapeyachtclub",
        protocolData,
        "Background",
        "Blue",
      );

      expect(result.criteria).to.have.property("trait");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result.criteria as any).trait).to.deep.equal({
        type: "Background",
        value: "Blue",
      });
    });

    test("should not add trait criteria when only traitType is provided", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const protocolData = { parameters: {} } as any as ProtocolData;
      const result = getPostCollectionOfferPayload(
        "boredapeyachtclub",
        protocolData,
        "Background",
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result.criteria as any).trait).to.be.undefined;
    });

    test("should not add trait criteria when only traitValue is provided", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const protocolData = { parameters: {} } as any as ProtocolData;
      const result = getPostCollectionOfferPayload(
        "boredapeyachtclub",
        protocolData,
        undefined,
        "Blue",
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result.criteria as any).trait).to.be.undefined;
    });
  });

  suite("getBuildCollectionOfferPayload", () => {
    test("should create basic build collection offer payload without traits", () => {
      const result = getBuildCollectionOfferPayload(
        "0xOfferer",
        5,
        "boredapeyachtclub",
        true,
      );

      expect(result).to.deep.equal({
        offerer: "0xOfferer",
        quantity: 5,
        criteria: {
          collection: {
            slug: "boredapeyachtclub",
          },
        },
        protocol_address: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
        offer_protection_enabled: true,
      });
    });

    test("should add trait criteria when both traitType and traitValue are provided", () => {
      const result = getBuildCollectionOfferPayload(
        "0xOfferer",
        3,
        "boredapeyachtclub",
        false,
        "Hat",
        "Crown",
      );

      expect(result.criteria).to.have.property("trait");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result.criteria as any).trait).to.deep.equal({
        type: "Hat",
        value: "Crown",
      });
      expect(result.offer_protection_enabled).to.be.false;
    });
  });

  suite("getFulfillListingPayload", () => {
    test("should create basic listing fulfillment payload without consideration", () => {
      const result = getFulfillListingPayload(
        "0xFulfiller",
        "0xOrderHash",
        "0xProtocol",
        Chain.Mainnet,
      );

      expect(result).to.deep.equal({
        listing: {
          hash: "0xOrderHash",
          chain: Chain.Mainnet,
          protocol_address: "0xProtocol",
        },
        fulfiller: {
          address: "0xFulfiller",
        },
      });
      expect(result.consideration).to.be.undefined;
    });

    test("should add consideration for criteria listings", () => {
      const result = getFulfillListingPayload(
        "0xFulfiller",
        "0xOrderHash",
        "0xProtocol",
        Chain.Mainnet,
        "0xAssetContract",
        "123",
      );

      expect(result.consideration).to.deep.equal({
        asset_contract_address: "0xAssetContract",
        token_id: "123",
      });
    });

    test("should not add consideration when only assetContractAddress is provided", () => {
      const result = getFulfillListingPayload(
        "0xFulfiller",
        "0xOrderHash",
        "0xProtocol",
        Chain.Mainnet,
        "0xAssetContract",
      );

      expect(result.consideration).to.be.undefined;
    });

    test("should not add consideration when only tokenId is provided", () => {
      const result = getFulfillListingPayload(
        "0xFulfiller",
        "0xOrderHash",
        "0xProtocol",
        Chain.Mainnet,
        undefined,
        "123",
      );

      expect(result.consideration).to.be.undefined;
    });
  });

  suite("getFulfillOfferPayload", () => {
    test("should create basic offer fulfillment payload without consideration", () => {
      const result = getFulfillOfferPayload(
        "0xFulfiller",
        "0xOrderHash",
        "0xProtocol",
        Chain.Polygon,
      );

      expect(result).to.deep.equal({
        offer: {
          hash: "0xOrderHash",
          chain: Chain.Polygon,
          protocol_address: "0xProtocol",
        },
        fulfiller: {
          address: "0xFulfiller",
        },
      });
      expect(result.consideration).to.be.undefined;
    });

    test("should add consideration for criteria offers", () => {
      const result = getFulfillOfferPayload(
        "0xFulfiller",
        "0xOrderHash",
        "0xProtocol",
        Chain.Polygon,
        "0xAssetContract",
        "456",
      );

      expect(result.consideration).to.deep.equal({
        asset_contract_address: "0xAssetContract",
        token_id: "456",
      });
    });
  });

  suite("deserializeOrder", () => {
    test("should deserialize order with all fields", () => {
      const serializedOrder = {
        created_date: "2024-01-01T00:00:00Z",
        closing_date: "2024-12-31T23:59:59Z",
        listing_time: 1704067200,
        expiration_time: 1735689599,
        order_hash: "0xOrderHash",
        maker: {
          address: "0xMaker",
        },
        taker: {
          address: "0xTaker",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        protocol_data: { parameters: {} } as any as ProtocolData,
        protocol_address: "0xProtocol",
        current_price: "1000000000000000000",
        maker_fees: [
          {
            account: { address: "0xMakerFeeAccount" },
            basis_points: "250",
          },
        ],
        taker_fees: [
          {
            account: { address: "0xTakerFeeAccount" },
            basis_points: "500",
          },
        ],
        side: OrderSide.LISTING,
        order_type: OrderType.BASIC,
        cancelled: false,
        finalized: true,
        marked_invalid: false,
        client_signature: "0xSignature",
        remaining_quantity: 1,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const result = deserializeOrder(serializedOrder);

      expect(result.createdDate).to.equal("2024-01-01T00:00:00Z");
      expect(result.closingDate).to.equal("2024-12-31T23:59:59Z");
      expect(result.listingTime).to.equal(1704067200);
      expect(result.expirationTime).to.equal(1735689599);
      expect(result.orderHash).to.equal("0xOrderHash");
      expect(result.maker.address).to.equal("0xMaker");
      expect(result.taker?.address).to.equal("0xTaker");
      expect(result.protocolAddress).to.equal("0xProtocol");
      expect(result.currentPrice).to.equal(BigInt("1000000000000000000"));
      expect(result.side).to.equal(OrderSide.LISTING);
      expect(result.orderType).to.equal(OrderType.BASIC);
      expect(result.cancelled).to.be.false;
      expect(result.finalized).to.be.true;
      expect(result.markedInvalid).to.be.false;
      expect(result.clientSignature).to.equal("0xSignature");
      expect(result.remainingQuantity).to.equal(1);
    });

    test("should handle null taker", () => {
      const serializedOrder = {
        created_date: "2024-01-01T00:00:00Z",
        closing_date: null,
        listing_time: 1704067200,
        expiration_time: 1735689599,
        order_hash: "0xOrderHash",
        maker: {
          address: "0xMaker",
        },
        taker: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        protocol_data: { parameters: {} } as any as ProtocolData,
        protocol_address: "0xProtocol",
        current_price: "1000000000000000000",
        maker_fees: [],
        taker_fees: [],
        side: OrderSide.OFFER,
        order_type: OrderType.ENGLISH,
        cancelled: false,
        finalized: false,
        marked_invalid: false,
        client_signature: null,
        remaining_quantity: 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const result = deserializeOrder(serializedOrder);

      expect(result.taker).to.be.null;
      expect(result.closingDate).to.be.null;
      expect(result.clientSignature).to.be.null;
    });

    test("should deserialize maker and taker fees correctly", () => {
      const serializedOrder = {
        created_date: "2024-01-01T00:00:00Z",
        closing_date: null,
        listing_time: 1704067200,
        expiration_time: 1735689599,
        order_hash: "0xOrderHash",
        maker: {
          address: "0xMaker",
        },
        taker: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        protocol_data: { parameters: {} } as any as ProtocolData,
        protocol_address: "0xProtocol",
        current_price: "1000000000000000000",
        maker_fees: [
          {
            account: { address: "0xFee1" },
            basis_points: "100",
          },
          {
            account: { address: "0xFee2" },
            basis_points: "200",
          },
        ],
        taker_fees: [
          {
            account: { address: "0xFee3" },
            basis_points: "300",
          },
        ],
        side: OrderSide.LISTING,
        order_type: OrderType.CRITERIA,
        cancelled: false,
        finalized: false,
        marked_invalid: false,
        client_signature: null,
        remaining_quantity: 10,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const result = deserializeOrder(serializedOrder);

      expect(result.makerFees).to.have.length(2);
      expect(result.makerFees[0].account.address).to.equal("0xFee1");
      expect(result.makerFees[0].basisPoints).to.equal("100");
      expect(result.makerFees[1].account.address).to.equal("0xFee2");
      expect(result.makerFees[1].basisPoints).to.equal("200");

      expect(result.takerFees).to.have.length(1);
      expect(result.takerFees[0].account.address).to.equal("0xFee3");
      expect(result.takerFees[0].basisPoints).to.equal("300");
    });
  });
});
