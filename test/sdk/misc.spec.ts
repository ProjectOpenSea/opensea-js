import { assert, expect } from "chai";
import { ethers } from "ethers";
import { suite, test } from "mocha";
import { sdk } from "../utils/sdk";

// Note: remapSharedStorefrontAddress and decodeTokenIds tests are in test/utils/protocol.spec.ts

suite("SDK: misc", () => {
  test("Instance has public methods", () => {
    assert.equal(typeof sdk.wrapEth, "function");
  });

  test("Instance exposes API methods", () => {
    assert.equal(typeof sdk.api.getOrder, "function");
    assert.equal(typeof sdk.api.getOrders, "function");
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
      await sdk.createOffer({ asset, amount: 1, accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }

    try {
      await sdk.createListing({ asset, amount: 1, accountAddress });
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
});
