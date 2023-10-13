import { assert, expect } from "chai";
import { ethers } from "ethers";
import { suite, test } from "mocha";
import {
  SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
  SHARED_STOREFRONT_ADDRESSES,
} from "../../src/constants";
import { OpenSeaSDK } from "../../src/index";
import { Chain } from "../../src/types";
import {
  decodeTokenIds,
  getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress,
} from "../../src/utils/utils";
import {
  DAPPER_ADDRESS,
  MAINNET_API_KEY,
  RPC_PROVIDER_MAINNET,
} from "../utils/constants";

const client = new OpenSeaSDK(
  RPC_PROVIDER_MAINNET,
  {
    chain: Chain.Mainnet,
    apiKey: MAINNET_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`),
);

suite("SDK: misc", () => {
  test("Instance has public methods", () => {
    assert.equal(typeof client.wrapEth, "function");
  });

  test("Instance exposes API methods", () => {
    assert.equal(typeof client.api.getOrder, "function");
    assert.equal(typeof client.api.getOrders, "function");
  });

  test("Checks that a non-shared storefront address is not remapped", async () => {
    const address = DAPPER_ADDRESS;
    assert.equal(
      getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress(
        address,
      ),
      address,
    );
  });

  test("Checks that shared storefront addresses are remapped to lazy mint adapter address", async () => {
    for (const address of SHARED_STOREFRONT_ADDRESSES) {
      assert.equal(
        getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress(
          address,
        ),
        SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
      );
    }
  });

  test("Checks that upper case shared storefront addresses are remapped to lazy mint adapter address", async () => {
    for (const address of SHARED_STOREFRONT_ADDRESSES) {
      assert.equal(
        getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress(
          address.toUpperCase(),
        ),
        SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
      );
    }
  });

  test("Should throw an error when using methods that need a provider or wallet with the accountAddress", async () => {
    const wallet = ethers.Wallet.createRandom();
    const accountAddress = wallet.address;
    const expectedErrorMessage = `Specified accountAddress is not available through wallet or provider: ${accountAddress}`;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    try {
      await client.wrapEth({ amountInEth: "0.1", accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }

    try {
      await client.unwrapWeth({ amountInEth: "0.1", accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }

    const asset = {} as any;

    try {
      await client.createOffer({ asset, startAmount: 1, accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }

    try {
      await client.createListing({ asset, startAmount: 1, accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }

    try {
      await client.createCollectionOffer({
        collectionSlug: "",
        amount: 1,
        quantity: 1,
        paymentTokenAddress: "",
        accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }

    const order = {} as any;

    try {
      await client.fulfillOrder({ order, accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }

    try {
      await client.cancelOrder({ order, accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }

    try {
      await client.approveOrder({
        ...order,
        maker: { address: accountAddress },
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  describe("decodeTokenIds", () => {
    it('should return ["*"] when given "*" as input', () => {
      expect(decodeTokenIds("*")).to.deep.equal(["*"]);
    });

    it("should correctly decode a single number", () => {
      expect(decodeTokenIds("123")).to.deep.equal(["123"]);
    });

    it("should correctly decode multiple comma-separated numbers", () => {
      expect(decodeTokenIds("1,2,3,4")).to.deep.equal(["1", "2", "3", "4"]);
    });

    it("should correctly decode a single number", () => {
      expect(decodeTokenIds("10:10")).to.deep.equal(["10"]);
    });

    it("should correctly decode a range of numbers", () => {
      expect(decodeTokenIds("5:8")).to.deep.equal(["5", "6", "7", "8"]);
    });

    it("should correctly decode multiple ranges of numbers", () => {
      expect(decodeTokenIds("1:3,7:9")).to.deep.equal([
        "1",
        "2",
        "3",
        "7",
        "8",
        "9",
      ]);
    });

    it("should correctly decode a mix of single numbers and ranges", () => {
      expect(decodeTokenIds("1,3:5,8")).to.deep.equal([
        "1",
        "3",
        "4",
        "5",
        "8",
      ]);
    });

    it("should throw an error for invalid input format", () => {
      expect(() => decodeTokenIds("1:3:5,8")).to.throw(
        "Invalid input format. Expected a valid comma-separated list of numbers and ranges.",
      );
      expect(() => decodeTokenIds("1;3:5,8")).to.throw(
        "Invalid input format. Expected a valid comma-separated list of numbers and ranges.",
      );
    });

    it("should throw an error for invalid range format", () => {
      expect(() => decodeTokenIds("5:2")).throws(
        "Invalid range. End value: 2 must be greater than or equal to the start value: 5.",
      );
    });

    it("should handle very large input numbers", () => {
      const encoded = "10000000000000000000000000:10000000000000000000000002";
      expect(decodeTokenIds(encoded)).deep.equal([
        "10000000000000000000000000",
        "10000000000000000000000001",
        "10000000000000000000000002",
      ]);
    });
  });
});
