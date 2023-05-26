import { assert } from "chai";
import { suite, test } from "mocha";
import {
  SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
  SHARED_STOREFRONT_ADDRESS_MAINNET,
  SHARED_STOREFRONT_ADDRESS_GOERLI,
} from "../../src/constants";
import { OpenSeaSDK } from "../../src/index";
import { Network } from "../../src/types";
import { getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress } from "../../src/utils/utils";
import {
  DAPPER_ADDRESS,
  MAINNET_API_KEY,
  RPC_PROVIDER,
} from "../utils/constants";

const client = new OpenSeaSDK(
  RPC_PROVIDER,
  {
    networkName: Network.Main,
    apiKey: MAINNET_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`)
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
        address
      ),
      address
    );
  });

  test("Checks that shared storefront addresses are remapped to lazy mint adapter address", async () => {
    assert.equal(
      getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress(
        SHARED_STOREFRONT_ADDRESS_GOERLI
      ),
      SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS
    );
    assert.equal(
      getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress(
        SHARED_STOREFRONT_ADDRESS_MAINNET
      ),
      SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS
    );
  });

  test("Checks that upper case shared storefront addresses are remapped to lazy mint adapter address", async () => {
    assert.equal(
      getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress(
        SHARED_STOREFRONT_ADDRESS_GOERLI.toUpperCase()
      ),
      SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS
    );
    assert.equal(
      getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress(
        SHARED_STOREFRONT_ADDRESS_MAINNET.toUpperCase()
      ),
      SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS
    );
  });
});
