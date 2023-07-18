import { assert, expect } from "chai";
import { ethers } from "ethers";
import { suite, test } from "mocha";
import {
  SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
  SHARED_STOREFRONT_ADDRESS_MAINNET,
  SHARED_STOREFRONT_ADDRESS_GOERLI,
} from "../../src/constants";
import { OpenSeaSDK } from "../../src/index";
import { Chain } from "../../src/types";
import { getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress } from "../../src/utils/utils";
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
    assert.equal(
      getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress(
        SHARED_STOREFRONT_ADDRESS_GOERLI,
      ),
      SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
    );
    assert.equal(
      getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress(
        SHARED_STOREFRONT_ADDRESS_MAINNET,
      ),
      SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
    );
  });

  test("Checks that upper case shared storefront addresses are remapped to lazy mint adapter address", async () => {
    assert.equal(
      getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress(
        SHARED_STOREFRONT_ADDRESS_GOERLI.toUpperCase(),
      ),
      SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
    );
    assert.equal(
      getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress(
        SHARED_STOREFRONT_ADDRESS_MAINNET.toUpperCase(),
      ),
      SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
    );
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
      expect(e.message).to.equal(expectedErrorMessage);
    }

    try {
      await client.unwrapWeth({ amountInEth: "0.1", accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.equal(expectedErrorMessage);
    }

    const asset = {} as any;

    try {
      await client.createBuyOrder({ asset, startAmount: 1, accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.equal(expectedErrorMessage);
    }

    try {
      await client.createSellOrder({ asset, startAmount: 1, accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.equal(expectedErrorMessage);
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
      expect(e.message).to.equal(expectedErrorMessage);
    }

    const order = {} as any;

    try {
      await client.fulfillOrder({ order, accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.equal(expectedErrorMessage);
    }

    try {
      await client.cancelOrder({ order, accountAddress });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.equal(expectedErrorMessage);
    }

    try {
      await client.approveOrder({
        ...order,
        maker: { address: accountAddress },
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.equal(expectedErrorMessage);
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });
});
