import { assert } from "chai";
import { suite, test } from "mocha";
import Web3 from "web3";
import {
  CK_ADDRESS,
  MAINNET_PROVIDER_URL,
  MAX_UINT_256,
  SHARED_STOREFRONT_LAZY_MINT_ADAPTER_ADDRESS,
  SHARED_STORE_FRONT_ADDRESS_MAINNET,
  SHARED_STORE_FRONT_ADDRESS_RINKEBY,
} from "../../constants";
import { ERC721 } from "../../contracts";
import { OpenSeaSDK } from "../../index";
import { Network } from "../../types";
import {
  getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress,
  getNonCompliantApprovalAddress,
  isContractAddress,
} from "../../utils/utils";
import {
  ALEX_ADDRESS,
  ALEX_ADDRESS_2,
  CK_TOKEN_ID,
  DAN_ADDRESS,
  DAN_DAPPER_ADDRESS,
  MAINNET_API_KEY,
  WETH_ADDRESS,
} from "../constants";

const provider = new Web3.providers.HttpProvider(MAINNET_PROVIDER_URL);

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
    assert.equal(typeof client.getCurrentPriceLegacyWyvern, "function");
    assert.equal(typeof client.wrapEth, "function");
  });

  test("Instance exposes API methods", () => {
    assert.equal(typeof client.api.getOrder, "function");
    assert.equal(typeof client.api.getOrders, "function");
  });

  test("Instance exposes some underscored methods", () => {
    assert.equal(typeof client._initializeProxy, "function");
    assert.equal(typeof client._getProxy, "function");
  });

  test("Fetches proxy for an account", async () => {
    const accountAddress = ALEX_ADDRESS;
    const proxy = await client._getProxy(accountAddress);
    assert.isNotNull(proxy);
  });

  test("Fetches positive token balance for an account", async () => {
    const accountAddress = ALEX_ADDRESS;
    const balance = await client.getTokenBalance({
      accountAddress,
      tokenAddress: WETH_ADDRESS,
    });
    assert.isAbove(balance.toNumber(), 0);
  });

  test("Accounts have maximum token balance approved", async () => {
    const accountAddress = ALEX_ADDRESS;
    const approved = await client._getApprovedTokenCount({ accountAddress });
    assert.equal(approved.toString(), MAX_UINT_256.toString());
  });

  test("Single-approval tokens are approved for tester address", async () => {
    const accountAddress = ALEX_ADDRESS_2;
    const _proxyAddress = await client._getProxy(accountAddress);
    const tokenId = CK_TOKEN_ID.toString();
    const tokenAddress = CK_ADDRESS;
    const erc721 = new client.web3.eth.Contract(ERC721, tokenAddress);
    const _approvedAddress = await getNonCompliantApprovalAddress(
      erc721,
      tokenId,
      accountAddress
    );
    // assert.equal(approvedAddress, proxyAddress)
  });

  test("Checks whether an address is a contract addrress", async () => {
    const smartContractWalletAddress = DAN_DAPPER_ADDRESS;
    const acccountOneIsContractAddress = await isContractAddress(
      client.web3,
      smartContractWalletAddress
    );
    const nonSmartContractWalletAddress = DAN_ADDRESS;
    const acccountTwoIsContractAddress = await isContractAddress(
      client.web3,
      nonSmartContractWalletAddress
    );
    assert.equal(acccountOneIsContractAddress, true);
    assert.equal(acccountTwoIsContractAddress, false);
  });

  test("Checks that a non-shared storefront address is not remapped", async () => {
    const address = DAN_DAPPER_ADDRESS;
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
