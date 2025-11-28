import { ItemType } from "@opensea/seaport-js/lib/constants";
import { OrderWithCounter } from "@opensea/seaport-js/lib/types";
import { expect } from "chai";
import { ZeroAddress } from "ethers";
import { suite, test } from "mocha";
import {
  computePrivateListingValue,
  constructPrivateListingCounterOrder,
} from "../../src/orders/privateListings";

const SELLER_ADDRESS = "0x1111111111111111111111111111111111111111";
const TAKER_ADDRESS = "0x2222222222222222222222222222222222222222";
const FEE_RECIPIENT = "0x3333333333333333333333333333333333333333";
const NFT_CONTRACT = "0x4444444444444444444444444444444444444444";
const WETH_ADDRESS = "0x5555555555555555555555555555555555555555";

const createMockOrder = (
  consideration: OrderWithCounter["parameters"]["consideration"],
): OrderWithCounter => ({
  parameters: {
    offerer: SELLER_ADDRESS,
    zone: ZeroAddress,
    offer: [
      {
        itemType: ItemType.ERC721,
        token: NFT_CONTRACT,
        identifierOrCriteria: "1",
        startAmount: "1",
        endAmount: "1",
      },
    ],
    consideration,
    orderType: 0,
    startTime: "0",
    endTime: "0",
    zoneHash:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    salt: "0",
    conduitKey:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    totalOriginalConsiderationItems: consideration.length,
    counter: "0",
  },
  signature: "0x",
});

suite("Orders: privateListings", () => {
  suite("computePrivateListingValue", () => {
    test("should return 0 for zero-payment private listings", () => {
      const order = createMockOrder([
        // Only NFT going to taker, no payment items
        {
          itemType: ItemType.ERC721,
          token: NFT_CONTRACT,
          identifierOrCriteria: "1",
          startAmount: "1",
          endAmount: "1",
          recipient: TAKER_ADDRESS,
        },
      ]);

      const value = computePrivateListingValue(order, TAKER_ADDRESS);
      expect(value).to.equal(0n);
    });

    test("should sum native currency items not going to taker", () => {
      const order = createMockOrder([
        // NFT to taker
        {
          itemType: ItemType.ERC721,
          token: NFT_CONTRACT,
          identifierOrCriteria: "1",
          startAmount: "1",
          endAmount: "1",
          recipient: TAKER_ADDRESS,
        },
        // Payment to seller (1 ETH)
        {
          itemType: ItemType.NATIVE,
          token: ZeroAddress,
          identifierOrCriteria: "0",
          startAmount: "1000000000000000000",
          endAmount: "1000000000000000000",
          recipient: SELLER_ADDRESS,
        },
        // Fee to fee recipient (0.1 ETH)
        {
          itemType: ItemType.NATIVE,
          token: ZeroAddress,
          identifierOrCriteria: "0",
          startAmount: "100000000000000000",
          endAmount: "100000000000000000",
          recipient: FEE_RECIPIENT,
        },
      ]);

      const value = computePrivateListingValue(order, TAKER_ADDRESS);
      // 1 ETH + 0.1 ETH = 1.1 ETH
      expect(value).to.equal(1100000000000000000n);
    });

    test("should ignore ERC20 currency items", () => {
      const order = createMockOrder([
        // NFT to taker
        {
          itemType: ItemType.ERC721,
          token: NFT_CONTRACT,
          identifierOrCriteria: "1",
          startAmount: "1",
          endAmount: "1",
          recipient: TAKER_ADDRESS,
        },
        // WETH payment to seller (should be ignored)
        {
          itemType: ItemType.ERC20,
          token: WETH_ADDRESS,
          identifierOrCriteria: "0",
          startAmount: "1000000000000000000",
          endAmount: "1000000000000000000",
          recipient: SELLER_ADDRESS,
        },
      ]);

      const value = computePrivateListingValue(order, TAKER_ADDRESS);
      expect(value).to.equal(0n);
    });

    test("should handle mixed native and ERC20 payments", () => {
      const order = createMockOrder([
        // NFT to taker
        {
          itemType: ItemType.ERC721,
          token: NFT_CONTRACT,
          identifierOrCriteria: "1",
          startAmount: "1",
          endAmount: "1",
          recipient: TAKER_ADDRESS,
        },
        // Native payment to seller (0.5 ETH)
        {
          itemType: ItemType.NATIVE,
          token: ZeroAddress,
          identifierOrCriteria: "0",
          startAmount: "500000000000000000",
          endAmount: "500000000000000000",
          recipient: SELLER_ADDRESS,
        },
        // WETH payment (should be ignored)
        {
          itemType: ItemType.ERC20,
          token: WETH_ADDRESS,
          identifierOrCriteria: "0",
          startAmount: "500000000000000000",
          endAmount: "500000000000000000",
          recipient: SELLER_ADDRESS,
        },
      ]);

      const value = computePrivateListingValue(order, TAKER_ADDRESS);
      // Only native ETH counts
      expect(value).to.equal(500000000000000000n);
    });
  });

  suite("constructPrivateListingCounterOrder", () => {
    test("should return empty offer for zero-payment private listings", () => {
      const order = createMockOrder([
        // Only NFT going to taker
        {
          itemType: ItemType.ERC721,
          token: NFT_CONTRACT,
          identifierOrCriteria: "1",
          startAmount: "1",
          endAmount: "1",
          recipient: TAKER_ADDRESS,
        },
      ]);

      const counterOrder = constructPrivateListingCounterOrder(
        order,
        TAKER_ADDRESS,
      );

      expect(counterOrder.parameters.offer).to.deep.equal([]);
      expect(counterOrder.parameters.consideration).to.deep.equal([]);
      expect(counterOrder.parameters.offerer).to.equal(TAKER_ADDRESS);
    });

    test("should aggregate payment items into single offer", () => {
      const order = createMockOrder([
        // NFT to taker
        {
          itemType: ItemType.ERC721,
          token: NFT_CONTRACT,
          identifierOrCriteria: "1",
          startAmount: "1",
          endAmount: "1",
          recipient: TAKER_ADDRESS,
        },
        // Payment to seller
        {
          itemType: ItemType.NATIVE,
          token: ZeroAddress,
          identifierOrCriteria: "0",
          startAmount: "1000000000000000000",
          endAmount: "1000000000000000000",
          recipient: SELLER_ADDRESS,
        },
        // Fee to fee recipient
        {
          itemType: ItemType.NATIVE,
          token: ZeroAddress,
          identifierOrCriteria: "0",
          startAmount: "100000000000000000",
          endAmount: "100000000000000000",
          recipient: FEE_RECIPIENT,
        },
      ]);

      const counterOrder = constructPrivateListingCounterOrder(
        order,
        TAKER_ADDRESS,
      );

      expect(counterOrder.parameters.offer).to.have.length(1);
      expect(counterOrder.parameters.offer[0].itemType).to.equal(
        ItemType.NATIVE,
      );
      expect(counterOrder.parameters.offer[0].startAmount).to.equal(
        "1100000000000000000",
      );
      expect(counterOrder.parameters.offer[0].endAmount).to.equal(
        "1100000000000000000",
      );
    });

    test("should throw if payment items contain non-currency items", () => {
      const order = createMockOrder([
        // NFT to taker
        {
          itemType: ItemType.ERC721,
          token: NFT_CONTRACT,
          identifierOrCriteria: "1",
          startAmount: "1",
          endAmount: "1",
          recipient: TAKER_ADDRESS,
        },
        // Another NFT to seller (invalid)
        {
          itemType: ItemType.ERC721,
          token: NFT_CONTRACT,
          identifierOrCriteria: "2",
          startAmount: "1",
          endAmount: "1",
          recipient: SELLER_ADDRESS,
        },
      ]);

      expect(() =>
        constructPrivateListingCounterOrder(order, TAKER_ADDRESS),
      ).to.throw("did not contain only currency items");
    });

    test("should throw if payment items have mixed currency types", () => {
      const order = createMockOrder([
        // NFT to taker
        {
          itemType: ItemType.ERC721,
          token: NFT_CONTRACT,
          identifierOrCriteria: "1",
          startAmount: "1",
          endAmount: "1",
          recipient: TAKER_ADDRESS,
        },
        // ETH to seller
        {
          itemType: ItemType.NATIVE,
          token: ZeroAddress,
          identifierOrCriteria: "0",
          startAmount: "500000000000000000",
          endAmount: "500000000000000000",
          recipient: SELLER_ADDRESS,
        },
        // WETH to fee recipient (different currency type)
        {
          itemType: ItemType.ERC20,
          token: WETH_ADDRESS,
          identifierOrCriteria: "0",
          startAmount: "100000000000000000",
          endAmount: "100000000000000000",
          recipient: FEE_RECIPIENT,
        },
      ]);

      expect(() =>
        constructPrivateListingCounterOrder(order, TAKER_ADDRESS),
      ).to.throw("Not all currency items were the same");
    });
  });
});
