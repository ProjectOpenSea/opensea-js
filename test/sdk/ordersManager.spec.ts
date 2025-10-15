import { expect } from "chai";
import { ZeroAddress } from "ethers";
import { suite, test } from "mocha";
import * as sinon from "sinon";
import { OrdersManager } from "../../src/sdk/orders";
import { Chain } from "../../src/types";
import {
  getCurrentUnixTimestamp,
  getUnixTimestampInSeconds,
  TimeInSeconds,
} from "../../src/utils";
import { createMockContext } from "../fixtures/context";

suite("SDK: OrdersManager", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSeaport: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAPI: any;
  let mockRequireAccountIsAvailable: sinon.SinonStub;
  let mockGetPriceParameters: sinon.SinonStub;
  let ordersManager: OrdersManager;

  const mockNFT = {
    identifier: "1234",
    collection: "test-collection",
    contract: "0xNFTContract",
    token_standard: "erc721",
    name: "Test NFT",
  };

  const mockCollection = {
    collection: "test-collection",
    name: "Test Collection",
    fees: [
      { recipient: "0xCreator", fee: 250, required: true }, // 2.5%
    ],
    requiredZone: undefined,
  };

  const mockOrder = {
    parameters: {
      offerer: "0xOfferer",
      offer: [],
      consideration: [],
      orderType: 0,
      startTime: "0",
      endTime: "1000000000000",
      zone: ZeroAddress,
      zoneHash: "0x",
      salt: "0",
      conduitKey: "0x",
      totalOriginalConsiderationItems: 0,
    },
    signature: "0xSignature",
  };

  beforeEach(() => {
    // Mock Seaport
    mockSeaport = {
      contract: {
        target: "0xSeaportAddress",
      },
      createOrder: sinon.stub().resolves({
        executeAllActions: sinon.stub().resolves(mockOrder),
      }),
    };

    // Mock API
    mockAPI = {
      getNFT: sinon.stub().resolves({ nft: mockNFT }),
      getCollection: sinon.stub().resolves(mockCollection),
      postOrder: sinon.stub().resolves({
        orderHash: "0xOrderHash",
        protocolData: mockOrder,
        protocolAddress: "0xProtocol",
      }),
      buildOffer: sinon.stub().resolves({
        partialParameters: {
          consideration: [
            {
              itemType: 2,
              token: "0xNFTContract",
              identifierOrCriteria: "0",
              startAmount: "1",
              endAmount: "1",
            },
          ],
          zone: "0xSignedZone",
        },
      }),
      postCollectionOffer: sinon.stub().resolves({
        protocol_data: mockOrder,
        protocol_address: "0xProtocol",
      }),
    };

    // Mock callback functions
    mockRequireAccountIsAvailable = sinon.stub().resolves();
    mockGetPriceParameters = sinon.stub().resolves({
      basePrice: BigInt("1000000000000000000"), // 1 ETH
    });

    // Create SDKContext mock using fixture
    const mockContext = createMockContext({
      chain: Chain.Mainnet,
      api: mockAPI,
      seaport: mockSeaport,
      requireAccountIsAvailable: mockRequireAccountIsAvailable,
    });

    // Create OrdersManager instance with new signature
    ordersManager = new OrdersManager(mockContext, mockGetPriceParameters);
  });

  afterEach(() => {
    sinon.restore();
  });

  suite("createOffer", () => {
    test("creates an offer successfully", async () => {
      const result = await ordersManager.createOffer({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xBuyer",
        startAmount: "1000000000000000000",
      });

      expect(mockRequireAccountIsAvailable.calledOnce).to.be.true;
      expect(mockRequireAccountIsAvailable.firstCall.args[0]).to.equal(
        "0xBuyer",
      );
      expect(mockAPI.getNFT.calledOnce).to.be.true;
      expect(mockAPI.getCollection.calledOnce).to.be.true;
      expect(mockSeaport.createOrder.calledOnce).to.be.true;
      expect(mockAPI.postOrder.calledOnce).to.be.true;
      expect(result.orderHash).to.equal("0xOrderHash");
    });

    test("creates offer with custom payment token", async () => {
      await ordersManager.createOffer({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xBuyer",
        startAmount: "1000000000000000000",
        paymentTokenAddress: "0xCustomToken",
      });

      const createOrderCall = mockSeaport.createOrder.firstCall.args[0];
      expect(createOrderCall.offer[0].token).to.equal("0xCustomToken");
    });

    test("creates offer with custom quantity", async () => {
      await ordersManager.createOffer({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xBuyer",
        startAmount: "1000000000000000000",
        quantity: 5,
      });

      expect(mockSeaport.createOrder.calledOnce).to.be.true;
    });

    test("creates offer with expiration time", async () => {
      const expirationTime = getUnixTimestampInSeconds(TimeInSeconds.DAY);

      await ordersManager.createOffer({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xBuyer",
        startAmount: "1000000000000000000",
        expirationTime,
      });

      const createOrderCall = mockSeaport.createOrder.firstCall.args[0];
      expect(createOrderCall.endTime).to.equal(
        BigInt(expirationTime).toString(),
      );
    });

    test("creates offer with custom zone", async () => {
      await ordersManager.createOffer({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xBuyer",
        startAmount: "1000000000000000000",
        zone: "0xCustomZone",
      });

      const createOrderCall = mockSeaport.createOrder.firstCall.args[0];
      expect(createOrderCall.zone).to.equal("0xCustomZone");
    });

    test("creates offer with domain and salt", async () => {
      await ordersManager.createOffer({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xBuyer",
        startAmount: "1000000000000000000",
        domain: "opensea.io",
        salt: "12345",
      });

      const createOrderCall = mockSeaport.createOrder.firstCall.args[0];
      expect(createOrderCall.domain).to.equal("opensea.io");
      expect(createOrderCall.salt).to.equal("12345");
    });

    test("throws when account is not available", async () => {
      mockRequireAccountIsAvailable.rejects(new Error("Account not available"));

      try {
        await ordersManager.createOffer({
          asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
          accountAddress: "0xBuyer",
          startAmount: "1000000000000000000",
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Account not available");
      }
    });

    test("uses collection's required zone when specified", async () => {
      mockAPI.getCollection.resolves({
        ...mockCollection,
        requiredZone: "0xRequiredZone",
      });

      await ordersManager.createOffer({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xBuyer",
        startAmount: "1000000000000000000",
      });

      const createOrderCall = mockSeaport.createOrder.firstCall.args[0];
      expect(createOrderCall.zone).to.equal("0xRequiredZone");
    });
  });

  suite("createListing", () => {
    test("creates a listing successfully", async () => {
      const result = await ordersManager.createListing({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xSeller",
        startAmount: "1000000000000000000",
      });

      expect(mockRequireAccountIsAvailable.calledOnce).to.be.true;
      expect(mockAPI.getNFT.calledOnce).to.be.true;
      expect(mockAPI.getCollection.calledOnce).to.be.true;
      expect(mockSeaport.createOrder.calledOnce).to.be.true;
      expect(mockAPI.postOrder.calledOnce).to.be.true;
      expect(result.orderHash).to.equal("0xOrderHash");
    });

    test("creates listing with custom payment token", async () => {
      await ordersManager.createListing({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xSeller",
        startAmount: "1000000000000000000",
        paymentTokenAddress: "0xUSDC",
      });

      const createOrderCall = mockSeaport.createOrder.firstCall.args[0];
      expect(createOrderCall.consideration[0].token).to.equal("0xUSDC");
    });

    test("creates listing with buyer address (private listing)", async () => {
      await ordersManager.createListing({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xSeller",
        startAmount: "1000000000000000000",
        buyerAddress: "0xPrivateBuyer",
      });

      expect(mockSeaport.createOrder.calledOnce).to.be.true;
    });

    test("creates listing with listing time and expiration", async () => {
      const listingTime = getCurrentUnixTimestamp();
      const expirationTime = getUnixTimestampInSeconds(TimeInSeconds.DAY);

      await ordersManager.createListing({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xSeller",
        startAmount: "1000000000000000000",
        listingTime,
        expirationTime,
      });

      const createOrderCall = mockSeaport.createOrder.firstCall.args[0];
      expect(createOrderCall.startTime).to.equal(listingTime.toString());
      expect(createOrderCall.endTime).to.equal(expirationTime.toString());
    });

    test("creates listing with optional creator fees", async () => {
      mockAPI.getCollection.resolves({
        ...mockCollection,
        fees: [
          { recipient: "0xCreator", fee: 250, required: true },
          { recipient: "0xCreator2", fee: 100, required: false },
        ],
      });

      await ordersManager.createListing({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xSeller",
        startAmount: "1000000000000000000",
        includeOptionalCreatorFees: true,
      });

      expect(mockSeaport.createOrder.calledOnce).to.be.true;
    });

    test("creates listing with custom zone", async () => {
      await ordersManager.createListing({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xSeller",
        startAmount: "1000000000000000000",
        zone: "0xCustomZone",
      });

      const createOrderCall = mockSeaport.createOrder.firstCall.args[0];
      expect(createOrderCall.zone).to.equal("0xCustomZone");
    });

    test("uses collection's required zone when specified", async () => {
      mockAPI.getCollection.resolves({
        ...mockCollection,
        requiredZone: "0xRequiredZone",
      });

      await ordersManager.createListing({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xSeller",
        startAmount: "1000000000000000000",
      });

      const createOrderCall = mockSeaport.createOrder.firstCall.args[0];
      expect(createOrderCall.zone).to.equal("0xRequiredZone");
    });

    test("creates listing with quantity for semi-fungible tokens", async () => {
      await ordersManager.createListing({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xSeller",
        startAmount: "1000000000000000000",
        quantity: 10,
      });

      expect(mockSeaport.createOrder.calledOnce).to.be.true;
    });
  });

  suite("createCollectionOffer", () => {
    test("creates a collection offer successfully", async () => {
      const result = await ordersManager.createCollectionOffer({
        collectionSlug: "test-collection",
        accountAddress: "0xBuyer",
        amount: "1000000000000000000",
        quantity: 1,
        paymentTokenAddress: "0xWETH",
      });

      expect(mockRequireAccountIsAvailable.calledOnce).to.be.true;
      expect(mockAPI.getCollection.calledOnce).to.be.true;
      expect(mockAPI.buildOffer.calledOnce).to.be.true;
      expect(mockSeaport.createOrder.calledOnce).to.be.true;
      expect(mockAPI.postCollectionOffer.calledOnce).to.be.true;
      expect(result).to.not.be.null;
    });

    test("creates collection offer with offer protection enabled", async () => {
      await ordersManager.createCollectionOffer({
        collectionSlug: "test-collection",
        accountAddress: "0xBuyer",
        amount: "1000000000000000000",
        quantity: 1,
        paymentTokenAddress: "0xWETH",
        offerProtectionEnabled: true,
      });

      expect(mockAPI.buildOffer.calledOnce).to.be.true;
      const buildOfferArgs = mockAPI.buildOffer.firstCall.args;
      expect(buildOfferArgs[3]).to.be.true; // offerProtectionEnabled
    });

    test("creates collection offer with offer protection disabled", async () => {
      await ordersManager.createCollectionOffer({
        collectionSlug: "test-collection",
        accountAddress: "0xBuyer",
        amount: "1000000000000000000",
        quantity: 1,
        paymentTokenAddress: "0xWETH",
        offerProtectionEnabled: false,
      });

      const buildOfferArgs = mockAPI.buildOffer.firstCall.args;
      expect(buildOfferArgs[3]).to.be.false;
    });

    test("creates collection offer with trait type and value", async () => {
      await ordersManager.createCollectionOffer({
        collectionSlug: "test-collection",
        accountAddress: "0xBuyer",
        amount: "1000000000000000000",
        quantity: 1,
        paymentTokenAddress: "0xWETH",
        traitType: "Background",
        traitValue: "Blue",
      });

      const buildOfferArgs = mockAPI.buildOffer.firstCall.args;
      expect(buildOfferArgs[4]).to.equal("Background");
      expect(buildOfferArgs[5]).to.equal("Blue");

      const postOfferArgs = mockAPI.postCollectionOffer.firstCall.args;
      expect(postOfferArgs[2]).to.equal("Background");
      expect(postOfferArgs[3]).to.equal("Blue");
    });

    test("creates collection offer with expiration time", async () => {
      const expirationTime = getUnixTimestampInSeconds(TimeInSeconds.DAY);

      await ordersManager.createCollectionOffer({
        collectionSlug: "test-collection",
        accountAddress: "0xBuyer",
        amount: "1000000000000000000",
        quantity: 1,
        paymentTokenAddress: "0xWETH",
        expirationTime,
      });

      const createOrderCall = mockSeaport.createOrder.firstCall.args[0];
      expect(createOrderCall.endTime).to.equal(expirationTime.toString());
    });

    test("creates collection offer with domain and salt", async () => {
      await ordersManager.createCollectionOffer({
        collectionSlug: "test-collection",
        accountAddress: "0xBuyer",
        amount: "1000000000000000000",
        quantity: 1,
        paymentTokenAddress: "0xWETH",
        domain: "opensea.io",
        salt: "67890",
      });

      const createOrderCall = mockSeaport.createOrder.firstCall.args[0];
      expect(createOrderCall.domain).to.equal("opensea.io");
      expect(createOrderCall.salt).to.equal("67890");
    });

    test("creates collection offer with multiple quantity", async () => {
      await ordersManager.createCollectionOffer({
        collectionSlug: "test-collection",
        accountAddress: "0xBuyer",
        amount: "1000000000000000000",
        quantity: 5,
        paymentTokenAddress: "0xWETH",
      });

      const buildOfferArgs = mockAPI.buildOffer.firstCall.args;
      expect(buildOfferArgs[1]).to.equal(5);
    });

    test("throws when account is not available", async () => {
      mockRequireAccountIsAvailable.rejects(new Error("Account not available"));

      try {
        await ordersManager.createCollectionOffer({
          collectionSlug: "test-collection",
          accountAddress: "0xBuyer",
          amount: "1000000000000000000",
          quantity: 1,
          paymentTokenAddress: "0xWETH",
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Account not available");
      }
    });
  });

  suite("buildOfferOrderComponents", () => {
    test("builds offer order components successfully", async () => {
      const result = await ordersManager.buildOfferOrderComponents({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xBuyer",
        startAmount: "1000000000000000000",
      });

      expect(mockRequireAccountIsAvailable.calledOnce).to.be.true;
      expect(mockAPI.getNFT.calledOnce).to.be.true;
      expect(mockAPI.getCollection.calledOnce).to.be.true;
      expect(mockSeaport.createOrder.calledOnce).to.be.true;
      expect(result).to.deep.equal(mockOrder.parameters);
    });

    test("builds offer components with custom parameters", async () => {
      const result = await ordersManager.buildOfferOrderComponents({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xBuyer",
        startAmount: "1000000000000000000",
        quantity: 3,
        domain: "test.io",
        salt: "999",
        expirationTime: 1000000,
        paymentTokenAddress: "0xToken",
        zone: "0xZone",
      });

      expect(result).to.deep.equal(mockOrder.parameters);
      expect(mockSeaport.createOrder.calledOnce).to.be.true;
    });

    test("does not post to API", async () => {
      await ordersManager.buildOfferOrderComponents({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xBuyer",
        startAmount: "1000000000000000000",
      });

      expect(mockAPI.postOrder.called).to.be.false;
    });
  });

  suite("buildListingOrderComponents", () => {
    test("builds listing order components successfully", async () => {
      const result = await ordersManager.buildListingOrderComponents({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xSeller",
        startAmount: "1000000000000000000",
      });

      expect(mockRequireAccountIsAvailable.calledOnce).to.be.true;
      expect(mockAPI.getNFT.calledOnce).to.be.true;
      expect(mockAPI.getCollection.calledOnce).to.be.true;
      expect(mockSeaport.createOrder.calledOnce).to.be.true;
      expect(result).to.deep.equal(mockOrder.parameters);
    });

    test("builds listing components with all parameters", async () => {
      const listingTime = getCurrentUnixTimestamp();
      const expirationTime = getUnixTimestampInSeconds(TimeInSeconds.DAY);

      const result = await ordersManager.buildListingOrderComponents({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xSeller",
        startAmount: "2000000000000000000",
        quantity: 5,
        domain: "opensea.io",
        salt: "12345",
        listingTime,
        expirationTime,
        paymentTokenAddress: "0xUSDC",
        buyerAddress: "0xBuyer",
        includeOptionalCreatorFees: true,
        zone: "0xZone",
      });

      expect(result).to.deep.equal(mockOrder.parameters);
      expect(mockSeaport.createOrder.calledOnce).to.be.true;
    });

    test("does not post to API", async () => {
      await ordersManager.buildListingOrderComponents({
        asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
        accountAddress: "0xSeller",
        startAmount: "1000000000000000000",
      });

      expect(mockAPI.postOrder.called).to.be.false;
    });
  });

  suite("createBulkListings", () => {
    test("creates multiple listings successfully with bulk signature", async () => {
      const mockBulkOrders = [
        {
          parameters: mockOrder.parameters,
          signature: "0xBulkSignature1",
        },
        {
          parameters: {
            ...mockOrder.parameters,
            salt: "1",
          },
          signature: "0xBulkSignature2",
        },
      ];

      mockSeaport.createBulkOrders = sinon.stub().resolves({
        executeAllActions: sinon.stub().resolves(mockBulkOrders),
      });

      const result = await ordersManager.createBulkListings({
        listings: [
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
            startAmount: "1000000000000000000",
          },
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "5678" },
            startAmount: "2000000000000000000",
          },
        ],
        accountAddress: "0xSeller",
      });

      expect(mockRequireAccountIsAvailable.calledOnce).to.be.true;
      expect(mockAPI.getNFT.calledTwice).to.be.true;
      expect(mockAPI.getCollection.calledTwice).to.be.true;
      expect(mockSeaport.createBulkOrders.calledOnce).to.be.true;
      expect(mockAPI.postOrder.calledTwice).to.be.true;
      expect(result).to.have.lengthOf(2);
    });

    test("creates single listing with normal signature (not bulk)", async () => {
      const result = await ordersManager.createBulkListings({
        listings: [
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
            startAmount: "1000000000000000000",
          },
        ],
        accountAddress: "0xSeller",
      });

      // Should use createListing, not createBulkOrders
      expect(mockSeaport.createOrder.calledOnce).to.be.true;
      expect(mockSeaport.createBulkOrders?.called).to.be.undefined;
      expect(mockAPI.postOrder.calledOnce).to.be.true;
      expect(result).to.have.lengthOf(1);
    });

    test("throws error for empty listings array", async () => {
      try {
        await ordersManager.createBulkListings({
          listings: [],
          accountAddress: "0xSeller",
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include(
          "Listings array cannot be empty",
        );
      }
    });

    test("creates bulk listings with different prices", async () => {
      const mockBulkOrders = [
        {
          parameters: mockOrder.parameters,
          signature: "0xBulkSignature1",
        },
        {
          parameters: {
            ...mockOrder.parameters,
            salt: "1",
          },
          signature: "0xBulkSignature2",
        },
        {
          parameters: {
            ...mockOrder.parameters,
            salt: "2",
          },
          signature: "0xBulkSignature3",
        },
      ];

      mockSeaport.createBulkOrders = sinon.stub().resolves({
        executeAllActions: sinon.stub().resolves(mockBulkOrders),
      });

      const result = await ordersManager.createBulkListings({
        listings: [
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "1" },
            startAmount: "1000000000000000000",
          },
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "2" },
            startAmount: "2000000000000000000",
          },
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "3" },
            startAmount: "3000000000000000000",
          },
        ],
        accountAddress: "0xSeller",
      });

      expect(result).to.have.lengthOf(3);
      expect(mockSeaport.createBulkOrders.calledOnce).to.be.true;
      expect(mockAPI.postOrder.calledThrice).to.be.true;
    });

    test("creates bulk listings with different parameters", async () => {
      const mockBulkOrders = [
        {
          parameters: mockOrder.parameters,
          signature: "0xBulkSignature1",
        },
        {
          parameters: {
            ...mockOrder.parameters,
            salt: "1",
          },
          signature: "0xBulkSignature2",
        },
      ];

      mockSeaport.createBulkOrders = sinon.stub().resolves({
        executeAllActions: sinon.stub().resolves(mockBulkOrders),
      });

      const expirationTime = getUnixTimestampInSeconds(TimeInSeconds.DAY);

      await ordersManager.createBulkListings({
        listings: [
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "1" },
            startAmount: "1000000000000000000",
            domain: "opensea.io",
            expirationTime,
          },
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "2" },
            startAmount: "2000000000000000000",
            quantity: 5,
            includeOptionalCreatorFees: true,
          },
        ],
        accountAddress: "0xSeller",
      });

      expect(mockSeaport.createBulkOrders.calledOnce).to.be.true;
    });

    test("creates bulk listings with custom payment token", async () => {
      const mockBulkOrders = [
        {
          parameters: mockOrder.parameters,
          signature: "0xBulkSignature1",
        },
        {
          parameters: {
            ...mockOrder.parameters,
            salt: "1",
          },
          signature: "0xBulkSignature2",
        },
      ];

      mockSeaport.createBulkOrders = sinon.stub().resolves({
        executeAllActions: sinon.stub().resolves(mockBulkOrders),
      });

      await ordersManager.createBulkListings({
        listings: [
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "1" },
            startAmount: "1000000000000000000",
            paymentTokenAddress: "0xUSDC",
          },
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "2" },
            startAmount: "2000000000000000000",
            paymentTokenAddress: "0xUSDC",
          },
        ],
        accountAddress: "0xSeller",
      });

      expect(mockSeaport.createBulkOrders.calledOnce).to.be.true;
    });

    test("throws when account is not available", async () => {
      mockRequireAccountIsAvailable.rejects(new Error("Account not available"));

      try {
        await ordersManager.createBulkListings({
          listings: [
            {
              asset: { tokenAddress: "0xNFTContract", tokenId: "1" },
              startAmount: "1000000000000000000",
            },
            {
              asset: { tokenAddress: "0xNFTContract", tokenId: "2" },
              startAmount: "2000000000000000000",
            },
          ],
          accountAddress: "0xSeller",
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Account not available");
      }
    });

    test("creates bulk listings with private buyers", async () => {
      const mockBulkOrders = [
        {
          parameters: mockOrder.parameters,
          signature: "0xBulkSignature1",
        },
        {
          parameters: {
            ...mockOrder.parameters,
            salt: "1",
          },
          signature: "0xBulkSignature2",
        },
      ];

      mockSeaport.createBulkOrders = sinon.stub().resolves({
        executeAllActions: sinon.stub().resolves(mockBulkOrders),
      });

      await ordersManager.createBulkListings({
        listings: [
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "1" },
            startAmount: "1000000000000000000",
            buyerAddress: "0xBuyer1",
          },
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "2" },
            startAmount: "2000000000000000000",
            buyerAddress: "0xBuyer2",
          },
        ],
        accountAddress: "0xSeller",
      });

      expect(mockSeaport.createBulkOrders.calledOnce).to.be.true;
    });
  });

  suite("createBulkOffers", () => {
    test("creates multiple offers successfully with bulk signature", async () => {
      const mockBulkOrders = [
        {
          parameters: mockOrder.parameters,
          signature: "0xBulkSignature1",
        },
        {
          parameters: {
            ...mockOrder.parameters,
            salt: "1",
          },
          signature: "0xBulkSignature2",
        },
      ];

      mockSeaport.createBulkOrders = sinon.stub().resolves({
        executeAllActions: sinon.stub().resolves(mockBulkOrders),
      });

      const result = await ordersManager.createBulkOffers({
        offers: [
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
            startAmount: "1000000000000000000",
          },
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "5678" },
            startAmount: "2000000000000000000",
          },
        ],
        accountAddress: "0xBuyer",
      });

      expect(mockRequireAccountIsAvailable.calledOnce).to.be.true;
      expect(mockAPI.getNFT.calledTwice).to.be.true;
      expect(mockAPI.getCollection.calledTwice).to.be.true;
      expect(mockSeaport.createBulkOrders.calledOnce).to.be.true;
      expect(mockAPI.postOrder.calledTwice).to.be.true;
      expect(result).to.have.lengthOf(2);
    });

    test("creates single offer with normal signature (not bulk)", async () => {
      const result = await ordersManager.createBulkOffers({
        offers: [
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "1234" },
            startAmount: "1000000000000000000",
          },
        ],
        accountAddress: "0xBuyer",
      });

      // Should use createOffer, not createBulkOrders
      expect(mockSeaport.createOrder.calledOnce).to.be.true;
      expect(mockSeaport.createBulkOrders?.called).to.be.undefined;
      expect(mockAPI.postOrder.calledOnce).to.be.true;
      expect(result).to.have.lengthOf(1);
    });

    test("throws error for empty offers array", async () => {
      try {
        await ordersManager.createBulkOffers({
          offers: [],
          accountAddress: "0xBuyer",
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include(
          "Offers array cannot be empty",
        );
      }
    });

    test("creates bulk offers with different prices", async () => {
      const mockBulkOrders = [
        {
          parameters: mockOrder.parameters,
          signature: "0xBulkSignature1",
        },
        {
          parameters: {
            ...mockOrder.parameters,
            salt: "1",
          },
          signature: "0xBulkSignature2",
        },
        {
          parameters: {
            ...mockOrder.parameters,
            salt: "2",
          },
          signature: "0xBulkSignature3",
        },
      ];

      mockSeaport.createBulkOrders = sinon.stub().resolves({
        executeAllActions: sinon.stub().resolves(mockBulkOrders),
      });

      const result = await ordersManager.createBulkOffers({
        offers: [
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "1" },
            startAmount: "1000000000000000000",
          },
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "2" },
            startAmount: "2000000000000000000",
          },
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "3" },
            startAmount: "3000000000000000000",
          },
        ],
        accountAddress: "0xBuyer",
      });

      expect(result).to.have.lengthOf(3);
      expect(mockSeaport.createBulkOrders.calledOnce).to.be.true;
      expect(mockAPI.postOrder.calledThrice).to.be.true;
    });

    test("creates bulk offers with different parameters", async () => {
      const mockBulkOrders = [
        {
          parameters: mockOrder.parameters,
          signature: "0xBulkSignature1",
        },
        {
          parameters: {
            ...mockOrder.parameters,
            salt: "1",
          },
          signature: "0xBulkSignature2",
        },
      ];

      mockSeaport.createBulkOrders = sinon.stub().resolves({
        executeAllActions: sinon.stub().resolves(mockBulkOrders),
      });

      const expirationTime = getUnixTimestampInSeconds(TimeInSeconds.DAY);

      await ordersManager.createBulkOffers({
        offers: [
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "1" },
            startAmount: "1000000000000000000",
            domain: "opensea.io",
            expirationTime,
          },
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "2" },
            startAmount: "2000000000000000000",
            quantity: 5,
          },
        ],
        accountAddress: "0xBuyer",
      });

      expect(mockSeaport.createBulkOrders.calledOnce).to.be.true;
    });

    test("creates bulk offers with custom payment token", async () => {
      const mockBulkOrders = [
        {
          parameters: mockOrder.parameters,
          signature: "0xBulkSignature1",
        },
        {
          parameters: {
            ...mockOrder.parameters,
            salt: "1",
          },
          signature: "0xBulkSignature2",
        },
      ];

      mockSeaport.createBulkOrders = sinon.stub().resolves({
        executeAllActions: sinon.stub().resolves(mockBulkOrders),
      });

      await ordersManager.createBulkOffers({
        offers: [
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "1" },
            startAmount: "1000000000000000000",
            paymentTokenAddress: "0xWETH",
          },
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "2" },
            startAmount: "2000000000000000000",
            paymentTokenAddress: "0xWETH",
          },
        ],
        accountAddress: "0xBuyer",
      });

      expect(mockSeaport.createBulkOrders.calledOnce).to.be.true;
    });

    test("throws when account is not available", async () => {
      mockRequireAccountIsAvailable.rejects(new Error("Account not available"));

      try {
        await ordersManager.createBulkOffers({
          offers: [
            {
              asset: { tokenAddress: "0xNFTContract", tokenId: "1" },
              startAmount: "1000000000000000000",
            },
            {
              asset: { tokenAddress: "0xNFTContract", tokenId: "2" },
              startAmount: "2000000000000000000",
            },
          ],
          accountAddress: "0xBuyer",
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Account not available");
      }
    });

    test("creates bulk offers with custom zones", async () => {
      const mockBulkOrders = [
        {
          parameters: mockOrder.parameters,
          signature: "0xBulkSignature1",
        },
        {
          parameters: {
            ...mockOrder.parameters,
            salt: "1",
          },
          signature: "0xBulkSignature2",
        },
      ];

      mockSeaport.createBulkOrders = sinon.stub().resolves({
        executeAllActions: sinon.stub().resolves(mockBulkOrders),
      });

      await ordersManager.createBulkOffers({
        offers: [
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "1" },
            startAmount: "1000000000000000000",
            zone: "0xCustomZone1",
          },
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "2" },
            startAmount: "2000000000000000000",
            zone: "0xCustomZone2",
          },
        ],
        accountAddress: "0xBuyer",
      });

      expect(mockSeaport.createBulkOrders.calledOnce).to.be.true;
    });

    test("uses collection's required zone when specified", async () => {
      mockAPI.getCollection.resolves({
        ...mockCollection,
        requiredZone: "0xRequiredZone",
      });

      const mockBulkOrders = [
        {
          parameters: mockOrder.parameters,
          signature: "0xBulkSignature1",
        },
        {
          parameters: {
            ...mockOrder.parameters,
            salt: "1",
          },
          signature: "0xBulkSignature2",
        },
      ];

      mockSeaport.createBulkOrders = sinon.stub().resolves({
        executeAllActions: sinon.stub().resolves(mockBulkOrders),
      });

      await ordersManager.createBulkOffers({
        offers: [
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "1" },
            startAmount: "1000000000000000000",
          },
          {
            asset: { tokenAddress: "0xNFTContract", tokenId: "2" },
            startAmount: "2000000000000000000",
          },
        ],
        accountAddress: "0xBuyer",
      });

      expect(mockSeaport.createBulkOrders.calledOnce).to.be.true;
    });
  });

  suite("Constructor", () => {
    test("initializes with all required dependencies", () => {
      const mockContextPolygon = createMockContext({
        chain: Chain.Polygon,
        api: mockAPI,
        seaport: mockSeaport,
        requireAccountIsAvailable: mockRequireAccountIsAvailable,
      });

      const manager = new OrdersManager(
        mockContextPolygon,
        mockGetPriceParameters,
      );

      expect(manager).to.be.instanceOf(OrdersManager);
    });
  });
});
