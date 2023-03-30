import { assert } from "chai";
import { suite, test } from "mocha";
import Web3 from "web3";
import {
  SHARED_STOREFRONT_LAZY_MINT_ADAPTER_ADDRESS,
  SHARED_STORE_FRONT_ADDRESS_MAINNET,
  SHARED_STORE_FRONT_ADDRESS_RINKEBY,
} from "../../constants";
import { OpenSeaSDK } from "../../index";
import { Network } from "../../types";
import { getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress } from "../../utils/utils";
import { DAPPER_ADDRESS, MAINNET_API_KEY } from "../constants";

const provider = new Web3.providers.HttpProvider("https://mainnet.infura.io");

const client = new OpenSeaSDK(
  provider,
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
        SHARED_STORE_FRONT_ADDRESS_RINKEBY
      ),
      SHARED_STOREFRONT_LAZY_MINT_ADAPTER_ADDRESS
    );
    assert.equal(
      getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress(
        SHARED_STORE_FRONT_ADDRESS_MAINNET
      ),
      SHARED_STOREFRONT_LAZY_MINT_ADAPTER_ADDRESS
    );
  });

  test("Checks that upper case shared storefront addresses are remapped to lazy mint adapter address", async () => {
    assert.equal(
      getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress(
        SHARED_STORE_FRONT_ADDRESS_RINKEBY.toUpperCase()
      ),
      SHARED_STOREFRONT_LAZY_MINT_ADAPTER_ADDRESS
    );
    assert.equal(
      getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress(
        SHARED_STORE_FRONT_ADDRESS_MAINNET.toUpperCase()
      ),
      SHARED_STOREFRONT_LAZY_MINT_ADAPTER_ADDRESS
    );
  });
});
