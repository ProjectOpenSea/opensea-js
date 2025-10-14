import { assert, expect } from "chai";
import { ethers } from "ethers";
import { suite, test } from "mocha";
import {
  SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
  SHARED_STOREFRONT_ADDRESSES,
} from "../../src/constants";
import {
  decodeTokenIds,
  getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress,
} from "../../src/utils/utils";
import { BAYC_CONTRACT_ADDRESS } from "../utils/constants";
import { sdk } from "../utils/sdk";

suite("SDK: misc", () => {
  test("Instance has public methods", () => {
    assert.equal(typeof sdk.wrapEth, "function");
  });

  test("Instance exposes API methods", () => {
    assert.equal(typeof sdk.api.getOrder, "function");
    assert.equal(typeof sdk.api.getOrders, "function");
  });

  test("Checks that a non-shared storefront address is not remapped", async () => {
    const address = BAYC_CONTRACT_ADDRESS;
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
      await sdk.wrapEth({ amountInEth: "0.1", accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }

    try {
      await sdk.unwrapWeth({ amountInEth: "0.1", accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }

    const asset = {} as any;

    try {
      await sdk.createOffer({ asset, startAmount: 1, accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }

    try {
      await sdk.createListing({ asset, startAmount: 1, accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }

    try {
      await sdk.createCollectionOffer({
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
      await sdk.fulfillOrder({ order, accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }

    try {
      await sdk.cancelOrder({ order, accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }

    try {
      await sdk.approveOrder({
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

    it("should return [] when given empty string as input", () => {
      expect(decodeTokenIds("")).to.deep.equal([]);
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

  describe("offchainCancelOrders", () => {
    test("Should throw an error when no order hashes are provided", async () => {
      try {
        await sdk.offchainCancelOrders({
          orderHashes: [],
        });
        throw new Error("should have thrown");
      } catch (e: any) {
        expect(e.message).to.include("At least one order hash must be provided");
      }
    });

    test("Should throw an error when offererSignatures length doesn't match orderHashes length", async () => {
      try {
        await sdk.offchainCancelOrders({
          orderHashes: ["0x123", "0x456"],
          offererSignatures: ["0xabc"],
        });
        throw new Error("should have thrown");
      } catch (e: any) {
        expect(e.message).to.include(
          "offererSignatures array must have the same length as orderHashes array",
        );
      }
    });
  });

  describe("bulkTransfer", () => {
    const wallet = ethers.Wallet.createRandom();
    const accountAddress = wallet.address;
    const recipientAddress = ethers.Wallet.createRandom().address;

    test("Should throw an error when using bulkTransfer without wallet", async () => {
      const expectedErrorMessage = `Specified accountAddress is not available through wallet or provider: ${accountAddress}`;

      try {
        await sdk.bulkTransfer({
          assets: [
            {
              asset: {
                tokenAddress: BAYC_CONTRACT_ADDRESS,
                tokenId: "1",
                tokenStandard: "erc721",
              },
              toAddress: recipientAddress,
            },
          ],
          fromAddress: accountAddress,
        });
        throw new Error("should have thrown");
      } catch (e: any) {
        expect(e.message).to.include(expectedErrorMessage);
      }
    });

    test("Should throw an error when assets array is empty", async () => {
      try {
        await sdk.bulkTransfer({
          assets: [],
          fromAddress: accountAddress,
        });
        throw new Error("should have thrown");
      } catch (e: any) {
        expect(e.message).to.include("At least one asset must be provided");
      }
    });

    test("Should throw an error when ERC20 amount is missing", async () => {
      try {
        await sdk.bulkTransfer({
          assets: [
            {
              asset: {
                tokenAddress: "0x0f5d2fb29fb7d3cfee444a200298f468908cc942", // MANA
                tokenStandard: "erc20",
              },
              toAddress: recipientAddress,
            },
          ],
          fromAddress: accountAddress,
        });
        throw new Error("should have thrown");
      } catch (e: any) {
        expect(e.message).to.include("Missing ERC20 amount for bulk transfer");
      }
    });

    test("Should throw an error when ERC721 tokenId is missing", async () => {
      try {
        await sdk.bulkTransfer({
          assets: [
            {
              asset: {
                tokenAddress: BAYC_CONTRACT_ADDRESS,
                tokenStandard: "erc721",
              },
              toAddress: recipientAddress,
            },
          ],
          fromAddress: accountAddress,
        });
        throw new Error("should have thrown");
      } catch (e: any) {
        expect(e.message).to.include("Missing ERC721 tokenId for bulk transfer");
      }
    });

    test("Should throw an error when ERC1155 tokenId is missing", async () => {
      try {
        await sdk.bulkTransfer({
          assets: [
            {
              asset: {
                tokenAddress: "0x495f947276749ce646f68ac8c248420045cb7b5e",
                tokenStandard: "erc1155",
              },
              toAddress: recipientAddress,
              amount: "1",
            },
          ],
          fromAddress: accountAddress,
        });
        throw new Error("should have thrown");
      } catch (e: any) {
        expect(e.message).to.include(
          "Missing ERC1155 tokenId for bulk transfer",
        );
      }
    });

    test("Should throw an error when ERC1155 amount is missing", async () => {
      try {
        await sdk.bulkTransfer({
          assets: [
            {
              asset: {
                tokenAddress: "0x495f947276749ce646f68ac8c248420045cb7b5e",
                tokenId: "1",
                tokenStandard: "erc1155",
              },
              toAddress: recipientAddress,
            },
          ],
          fromAddress: accountAddress,
        });
        throw new Error("should have thrown");
      } catch (e: any) {
        expect(e.message).to.include(
          "Missing ERC1155 amount for bulk transfer",
        );
      }
    });
  });
});
