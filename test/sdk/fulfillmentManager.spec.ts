import { expect } from "chai";
import { suite, test } from "mocha";
import * as sinon from "sinon";
import { FulfillmentManager } from "../../src/sdk/fulfillment";
import { EventType } from "../../src/types";
import {
  mockOrderV2,
  mockOrderComponents,
  mockOfferOrderV2,
  mockPrivateListingOrderV2,
} from "../fixtures/orders";

suite("SDK: FulfillmentManager", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockOrdersManager: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAPI: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSeaport: any;
  let mockDispatch: sinon.SinonStub;
  let mockConfirmTransaction: sinon.SinonStub;
  let mockRequireAccountIsAvailable: sinon.SinonStub;
  let fulfillmentManager: FulfillmentManager;

  const mockTransaction = {
    hash: "0xTxHash",
    wait: sinon.stub().resolves({ hash: "0xTxHash" }),
  };

  beforeEach(() => {
    // Mock OrdersManager
    mockOrdersManager = {
      buildListingOrderComponents: sinon.stub().resolves(mockOrderComponents),
      buildOfferOrderComponents: sinon.stub().resolves(mockOrderComponents),
    };

    // Mock OpenSeaAPI
    mockAPI = {
      generateFulfillmentData: sinon.stub().resolves({
        fulfillment_data: {
          transaction: {
            input_data: {},
          },
          orders: [{ signature: "0xNewSignature" }],
        },
      }),
    };

    // Mock Seaport
    mockSeaport = {
      fulfillOrder: sinon.stub().returns({
        executeAllActions: sinon.stub().resolves("0xFulfillTxHash"),
      }),
      matchOrders: sinon.stub().returns({
        transact: sinon.stub().resolves(mockTransaction),
      }),
      validate: sinon.stub().returns({
        staticCall: sinon.stub().resolves(true),
        transact: sinon.stub().resolves(mockTransaction),
      }),
    };

    // Mock callback functions
    mockDispatch = sinon.stub();
    mockConfirmTransaction = sinon.stub().resolves();
    mockRequireAccountIsAvailable = sinon.stub().resolves();

    // Create FulfillmentManager instance
    fulfillmentManager = new FulfillmentManager(
      mockOrdersManager,
      mockAPI,
      mockSeaport,
      mockDispatch,
      mockConfirmTransaction,
      mockRequireAccountIsAvailable,
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  suite("fulfillOrder", () => {
    test("fulfills a listing order successfully", async () => {
      const result = await fulfillmentManager.fulfillOrder({
        order: mockOrderV2,
        accountAddress: "0xBuyer",
      });

      expect(mockRequireAccountIsAvailable.calledOnce).to.be.true;
      expect(mockAPI.generateFulfillmentData.calledOnce).to.be.true;
      expect(mockSeaport.fulfillOrder.calledOnce).to.be.true;
      expect(mockConfirmTransaction.calledOnce).to.be.true;
      expect(result).to.equal("0xFulfillTxHash");
    });

    test("fulfills an offer order successfully", async () => {
      const result = await fulfillmentManager.fulfillOrder({
        order: mockOfferOrderV2,
        accountAddress: "0xSeller",
      });

      expect(mockSeaport.fulfillOrder.calledOnce).to.be.true;
      expect(result).to.equal("0xFulfillTxHash");
    });

    test("fulfills order with recipient address", async () => {
      await fulfillmentManager.fulfillOrder({
        order: mockOrderV2,
        accountAddress: "0xBuyer",
        recipientAddress: "0xRecipient",
      });

      const fulfillCall = mockSeaport.fulfillOrder.firstCall.args[0];
      expect(fulfillCall.recipientAddress).to.equal("0xRecipient");
    });

    test("fulfills order with unitsToFill", async () => {
      await fulfillmentManager.fulfillOrder({
        order: mockOrderV2,
        accountAddress: "0xBuyer",
        unitsToFill: 5,
      });

      const fulfillCall = mockSeaport.fulfillOrder.firstCall.args[0];
      expect(fulfillCall.unitsToFill).to.equal(5);
    });

    test("fulfills order with domain", async () => {
      await fulfillmentManager.fulfillOrder({
        order: mockOrderV2,
        accountAddress: "0xBuyer",
        domain: "opensea.io",
      });

      const fulfillCall = mockSeaport.fulfillOrder.firstCall.args[0];
      expect(fulfillCall.domain).to.equal("opensea.io");
    });

    test("fulfills criteria order with contract and tokenId", async () => {
      await fulfillmentManager.fulfillOrder({
        order: mockOrderV2,
        accountAddress: "0xBuyer",
        assetContractAddress: "0xNFT",
        tokenId: "123",
      });

      expect(mockAPI.generateFulfillmentData.calledOnce).to.be.true;
      const apiCall = mockAPI.generateFulfillmentData.firstCall.args;
      expect(apiCall[4]).to.equal("0xNFT");
      expect(apiCall[5]).to.equal("123");
    });

    test("includes extraData when order has offer protection", async () => {
      mockAPI.generateFulfillmentData.resolves({
        fulfillment_data: {
          transaction: {
            input_data: {
              orders: [{ extraData: "0xExtraData" }],
            },
          },
          orders: [{ signature: "0xNewSignature" }],
        },
      });

      await fulfillmentManager.fulfillOrder({
        order: mockOrderV2,
        accountAddress: "0xBuyer",
      });

      const fulfillCall = mockSeaport.fulfillOrder.firstCall.args[0];
      expect(fulfillCall.extraData).to.equal("0xExtraData");
    });

    test("fulfills private listing successfully", async () => {
      const result = await fulfillmentManager.fulfillOrder({
        order: mockPrivateListingOrderV2,
        accountAddress: "0xPrivateBuyer",
      });

      expect(mockSeaport.matchOrders.calledOnce).to.be.true;
      expect(mockSeaport.fulfillOrder.called).to.be.false;
      expect(result).to.equal("0xTxHash");
    });

    test("throws error for private listing with recipient address", async () => {
      try {
        await fulfillmentManager.fulfillOrder({
          order: mockPrivateListingOrderV2,
          accountAddress: "0xPrivateBuyer",
          recipientAddress: "0xRecipient",
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include(
          "Private listings cannot be fulfilled with a recipient address",
        );
      }
    });

    test("throws when account is not available", async () => {
      mockRequireAccountIsAvailable.rejects(new Error("Account not available"));

      try {
        await fulfillmentManager.fulfillOrder({
          order: mockOrderV2,
          accountAddress: "0xBuyer",
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Account not available");
      }
    });

    test("throws when protocol is invalid", async () => {
      const invalidOrder = {
        ...mockOrderV2,
        protocolAddress: "0xInvalidProtocol",
      };

      try {
        await fulfillmentManager.fulfillOrder({
          order: invalidOrder,
          accountAddress: "0xBuyer",
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Unsupported protocol");
      }
    });

    test("handles transaction response as ContractTransactionResponse", async () => {
      mockSeaport.fulfillOrder.returns({
        executeAllActions: sinon.stub().resolves({ hash: "0xContractTxHash" }),
      });

      const result = await fulfillmentManager.fulfillOrder({
        order: mockOrderV2,
        accountAddress: "0xBuyer",
      });

      expect(result).to.equal("0xContractTxHash");
    });
  });

  suite("isOrderFulfillable", () => {
    test("returns true when order is fulfillable", async () => {
      const result = await fulfillmentManager.isOrderFulfillable({
        order: mockOrderV2,
        accountAddress: "0xBuyer",
      });

      expect(mockSeaport.validate.calledOnce).to.be.true;
      expect(result).to.be.true;
    });

    test("returns false when order is not fulfillable", async () => {
      mockSeaport.validate.returns({
        staticCall: sinon.stub().resolves(false),
      });

      const result = await fulfillmentManager.isOrderFulfillable({
        order: mockOrderV2,
        accountAddress: "0xBuyer",
      });

      expect(result).to.be.false;
    });

    test("returns false on CALL_EXCEPTION error", async () => {
      const error = new Error("CALL_EXCEPTION") as unknown as {
        code: string;
        message: string;
      };
      error.code = "CALL_EXCEPTION";

      mockSeaport.validate.returns({
        staticCall: sinon.stub().rejects(error),
      });

      const result = await fulfillmentManager.isOrderFulfillable({
        order: mockOrderV2,
        accountAddress: "0xBuyer",
      });

      expect(result).to.be.false;
    });

    test("throws other errors", async () => {
      mockSeaport.validate.returns({
        staticCall: sinon.stub().rejects(new Error("Unknown error")),
      });

      try {
        await fulfillmentManager.isOrderFulfillable({
          order: mockOrderV2,
          accountAddress: "0xBuyer",
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Unknown error");
      }
    });

    test("throws when protocol is invalid", async () => {
      const invalidOrder = {
        ...mockOrderV2,
        protocolAddress: "0xInvalidProtocol",
      };

      try {
        await fulfillmentManager.isOrderFulfillable({
          order: invalidOrder,
          accountAddress: "0xBuyer",
        });
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Unsupported protocol");
      }
    });
  });

  suite("approveOrder", () => {
    test("approves an order successfully", async () => {
      const result = await fulfillmentManager.approveOrder(mockOrderV2);

      expect(mockRequireAccountIsAvailable.calledOnce).to.be.true;
      expect(mockDispatch.calledOnce).to.be.true;
      expect(mockDispatch.firstCall.args[0]).to.equal(EventType.ApproveOrder);
      expect(mockSeaport.validate.calledOnce).to.be.true;
      expect(mockConfirmTransaction.calledOnce).to.be.true;
      expect(result).to.equal("0xTxHash");
    });

    test("approves order with domain", async () => {
      await fulfillmentManager.approveOrder(mockOrderV2, "opensea.io");

      const validateCall = mockSeaport.validate.firstCall.args;
      expect(validateCall[2]).to.equal("opensea.io");
    });

    test("dispatches ApproveOrder event", async () => {
      await fulfillmentManager.approveOrder(mockOrderV2);

      expect(mockDispatch.calledOnce).to.be.true;
      const eventData = mockDispatch.firstCall.args[1];
      expect(eventData.orderV2).to.equal(mockOrderV2);
      expect(eventData.accountAddress).to.equal("0xMaker");
    });

    test("throws when account is not available", async () => {
      mockRequireAccountIsAvailable.rejects(new Error("Account not available"));

      try {
        await fulfillmentManager.approveOrder(mockOrderV2);
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Account not available");
      }
    });

    test("throws when protocol is invalid", async () => {
      const invalidOrder = {
        ...mockOrderV2,
        protocolAddress: "0xInvalidProtocol",
      };

      try {
        await fulfillmentManager.approveOrder(invalidOrder);
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Unsupported protocol");
      }
    });
  });

  suite("validateOrderOnchain", () => {
    test("validates order components onchain successfully", async () => {
      const result = await fulfillmentManager.validateOrderOnchain(
        mockOrderComponents,
        "0xValidator",
      );

      expect(mockRequireAccountIsAvailable.calledOnce).to.be.true;
      expect(mockDispatch.calledOnce).to.be.true;
      expect(mockDispatch.firstCall.args[0]).to.equal(EventType.ApproveOrder);
      expect(mockSeaport.validate.calledOnce).to.be.true;
      expect(mockConfirmTransaction.calledOnce).to.be.true;
      expect(result).to.equal("0xTxHash");
    });

    test("dispatches ApproveOrder event with order components", async () => {
      await fulfillmentManager.validateOrderOnchain(
        mockOrderComponents,
        "0xValidator",
      );

      const eventData = mockDispatch.firstCall.args[1];
      expect(eventData.orderV2.protocolData).to.equal(mockOrderComponents);
      expect(eventData.accountAddress).to.equal("0xValidator");
    });

    test("calls validate with correct parameters", async () => {
      await fulfillmentManager.validateOrderOnchain(
        mockOrderComponents,
        "0xValidator",
      );

      const validateCall = mockSeaport.validate.firstCall.args;
      expect(validateCall[0][0].parameters).to.equal(mockOrderComponents);
      expect(validateCall[0][0].signature).to.equal("0x");
      expect(validateCall[1]).to.equal("0xValidator");
    });

    test("throws when account is not available", async () => {
      mockRequireAccountIsAvailable.rejects(new Error("Account not available"));

      try {
        await fulfillmentManager.validateOrderOnchain(
          mockOrderComponents,
          "0xValidator",
        );
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("Account not available");
      }
    });
  });

  suite("createListingAndValidateOnchain", () => {
    test("creates and validates a listing successfully", async () => {
      const result = await fulfillmentManager.createListingAndValidateOnchain({
        asset: { tokenAddress: "0xNFT", tokenId: "123" },
        accountAddress: "0xSeller",
        startAmount: "1000000000000000000",
      });

      expect(mockOrdersManager.buildListingOrderComponents.calledOnce).to.be
        .true;
      expect(mockSeaport.validate.calledOnce).to.be.true;
      expect(result).to.equal("0xTxHash");
    });

    test("forwards all listing parameters", async () => {
      await fulfillmentManager.createListingAndValidateOnchain({
        asset: { tokenAddress: "0xNFT", tokenId: "123" },
        accountAddress: "0xSeller",
        startAmount: "2000000000000000000",
        endAmount: "1000000000000000000",
        quantity: 5,
        domain: "opensea.io",
        salt: "12345",
        listingTime: 1000000,
        expirationTime: 2000000,
        paymentTokenAddress: "0xUSDC",
        buyerAddress: "0xBuyer",
        includeOptionalCreatorFees: true,
        zone: "0xZone",
      });

      const buildCall =
        mockOrdersManager.buildListingOrderComponents.firstCall.args[0];
      expect(buildCall.asset.tokenAddress).to.equal("0xNFT");
      expect(buildCall.startAmount).to.equal("2000000000000000000");
      expect(buildCall.endAmount).to.equal("1000000000000000000");
      expect(buildCall.quantity).to.equal(5);
      expect(buildCall.domain).to.equal("opensea.io");
      expect(buildCall.buyerAddress).to.equal("0xBuyer");
    });
  });

  suite("createOfferAndValidateOnchain", () => {
    test("creates and validates an offer successfully", async () => {
      const result = await fulfillmentManager.createOfferAndValidateOnchain({
        asset: { tokenAddress: "0xNFT", tokenId: "123" },
        accountAddress: "0xBuyer",
        startAmount: "1000000000000000000",
      });

      expect(mockOrdersManager.buildOfferOrderComponents.calledOnce).to.be.true;
      expect(mockSeaport.validate.calledOnce).to.be.true;
      expect(result).to.equal("0xTxHash");
    });

    test("forwards all offer parameters", async () => {
      await fulfillmentManager.createOfferAndValidateOnchain({
        asset: { tokenAddress: "0xNFT", tokenId: "123" },
        accountAddress: "0xBuyer",
        startAmount: "1500000000000000000",
        quantity: 3,
        domain: "test.io",
        salt: "67890",
        expirationTime: 3000000,
        paymentTokenAddress: "0xWETH",
        zone: "0xSignedZone",
      });

      const buildCall =
        mockOrdersManager.buildOfferOrderComponents.firstCall.args[0];
      expect(buildCall.asset.tokenAddress).to.equal("0xNFT");
      expect(buildCall.startAmount).to.equal("1500000000000000000");
      expect(buildCall.quantity).to.equal(3);
      expect(buildCall.domain).to.equal("test.io");
      expect(buildCall.paymentTokenAddress).to.equal("0xWETH");
    });
  });

  suite("Constructor", () => {
    test("initializes with all required dependencies", () => {
      const manager = new FulfillmentManager(
        mockOrdersManager,
        mockAPI,
        mockSeaport,
        mockDispatch,
        mockConfirmTransaction,
        mockRequireAccountIsAvailable,
      );

      expect(manager).to.be.instanceOf(FulfillmentManager);
    });
  });
});
