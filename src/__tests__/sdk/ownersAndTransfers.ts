import { assert } from "chai";
import { before, suite, test } from "mocha";
import Web3 from "web3";
import {
  ENJIN_ADDRESS,
  ENJIN_LEGACY_ADDRESS,
  MAINNET_PROVIDER_URL,
  MAX_UINT_256,
} from "../../constants";
import { OpenSeaSDK } from "../../index";
import {
  Network,
  WyvernSchemaName,
  WyvernNFTAsset,
  WyvernFTAsset,
} from "../../types";
import {
  ALEX_ADDRESS,
  DIGITAL_ART_CHAIN_ADDRESS,
  DIGITAL_ART_CHAIN_TOKEN_ID,
  MYTHEREUM_TOKEN_ID,
  MYTHEREUM_ADDRESS,
  GODS_UNCHAINED_ADDRESS,
  CK_ADDRESS,
  DEVIN_ADDRESS,
  ALEX_ADDRESS_2,
  GODS_UNCHAINED_TOKEN_ID,
  CK_TOKEN_ID,
  MAINNET_API_KEY,
  CATS_IN_MECHS_ID,
  RANDOM_ADDRESS,
  DISSOLUTION_TOKEN_ID,
  AGE_OF_RUST_TOKEN_ID,
  WETH_ADDRESS,
  TESTNET_ASSET_ADDRESS,
  TESTNET_TOKEN_ID,
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

let manaAddress: string;

suite("SDK: owners and transfers", () => {
  before(async () => {
    manaAddress = (await client.api.getPaymentTokens({ symbol: "MANA" }))
      .tokens[0].address;
  });

  test("On-chain ownership throws for invalid assets", async () => {
    const accountAddress = ALEX_ADDRESS;
    const schemaName = WyvernSchemaName.ERC721;
    const wyAssetRinkeby: WyvernNFTAsset = {
      id: TESTNET_TOKEN_ID.toString(),
      address: TESTNET_ASSET_ADDRESS,
    };
    try {
      // Use mainnet client with testnet asset
      const _isOwner = await client._ownsAssetOnChain({
        accountAddress,
        wyAsset: wyAssetRinkeby,
        schemaName,
      });
      assert.fail();
    } catch (error) {
      assert.include((error as Error).message, "Unable to get current owner");
    }
  });

  test("On-chain ownership correctly pulled for ERC721s", async () => {
    const accountAddress = ALEX_ADDRESS;
    const schemaName = WyvernSchemaName.ERC721;

    // Ownership
    const wyAsset: WyvernNFTAsset = {
      id: MYTHEREUM_TOKEN_ID.toString(),
      address: MYTHEREUM_ADDRESS,
    };
    const isOwner = await client._ownsAssetOnChain({
      accountAddress,
      wyAsset,
      schemaName,
    });
    assert.isTrue(isOwner);

    // Non-ownership
    const isOwner2 = await client._ownsAssetOnChain({
      accountAddress: ALEX_ADDRESS_2,
      wyAsset,
      schemaName,
    });
    assert.isFalse(isOwner2);
  });

  test("On-chain ownership correctly pulled for ERC20s", async () => {
    const accountAddress = ALEX_ADDRESS;
    const schemaName = WyvernSchemaName.ERC20;

    // Ownership
    const wyAsset: WyvernFTAsset = {
      address: manaAddress,
      quantity: "1",
    };
    const isOwner = await client._ownsAssetOnChain({
      accountAddress,
      wyAsset,
      schemaName,
    });
    assert.isTrue(isOwner);

    // Not enough ownership
    const isOwner2 = await client._ownsAssetOnChain({
      accountAddress,
      wyAsset: { ...wyAsset, quantity: MAX_UINT_256.toString() },
      schemaName,
    });
    assert.isFalse(isOwner2);

    // Non-ownership
    const isOwner3 = await client._ownsAssetOnChain({
      accountAddress: RANDOM_ADDRESS,
      wyAsset,
      schemaName,
    });
    assert.isFalse(isOwner3);
  });

  test("On-chain ownership correctly pulled for ERC1155s", async () => {
    const accountAddress = ALEX_ADDRESS;
    const schemaName = WyvernSchemaName.ERC1155;

    // Ownership of NFT
    const wyAssetNFT: WyvernNFTAsset = {
      id: AGE_OF_RUST_TOKEN_ID,
      address: ENJIN_ADDRESS,
    };
    const isOwner = await client._ownsAssetOnChain({
      accountAddress,
      wyAsset: wyAssetNFT,
      schemaName,
    });
    assert.isTrue(isOwner);

    // Non-ownership
    const isOwner2 = await client._ownsAssetOnChain({
      accountAddress: RANDOM_ADDRESS,
      wyAsset: wyAssetNFT,
      schemaName,
    });
    assert.isFalse(isOwner2);

    // Ownership of FT
    const wyAssetFT: WyvernFTAsset = {
      id: DISSOLUTION_TOKEN_ID,
      address: ENJIN_ADDRESS,
      quantity: "1",
    };
    const isOwner3 = await client._ownsAssetOnChain({
      accountAddress,
      wyAsset: wyAssetFT,
      schemaName,
    });
    assert.isTrue(isOwner3);

    // Not enough ownership
    const isOwner5 = await client._ownsAssetOnChain({
      accountAddress,
      wyAsset: { ...wyAssetFT, quantity: MAX_UINT_256.toString() },
      schemaName,
    });
    assert.isFalse(isOwner5);

    // Non-ownership
    const isOwner4 = await client._ownsAssetOnChain({
      accountAddress: RANDOM_ADDRESS,
      wyAsset: wyAssetFT,
      schemaName,
    });
    assert.isFalse(isOwner4);
  });

  test("ERC-721v2 asset locked in contract is not transferrable", async () => {
    const isTransferrable = await client.isAssetTransferrable({
      asset: {
        tokenId: GODS_UNCHAINED_TOKEN_ID.toString(),
        tokenAddress: GODS_UNCHAINED_ADDRESS,
      },
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2,
    });
    assert.isNotTrue(isTransferrable);
  });

  test("ERC-721v3 asset locked in contract is not transferrable", async () => {
    const isTransferrable = await client.isAssetTransferrable({
      asset: {
        tokenId: GODS_UNCHAINED_TOKEN_ID.toString(),
        tokenAddress: GODS_UNCHAINED_ADDRESS,
        schemaName: WyvernSchemaName.ERC721v3,
      },
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2,
    });
    assert.isNotTrue(isTransferrable);
  });

  test("ERC-721 v3 asset not owned by fromAddress is not transferrable", async () => {
    const isTransferrable = await client.isAssetTransferrable({
      asset: {
        tokenId: "1",
        tokenAddress: DIGITAL_ART_CHAIN_ADDRESS,
        schemaName: WyvernSchemaName.ERC721v3,
      },
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2,
    });
    assert.isNotTrue(isTransferrable);
  });

  test("ERC-721 v3 asset owned by fromAddress is transferrable", async () => {
    const isTransferrable = await client.isAssetTransferrable({
      asset: {
        tokenId: DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
        tokenAddress: DIGITAL_ART_CHAIN_ADDRESS,
        schemaName: WyvernSchemaName.ERC721v3,
      },
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2,
    });
    assert.isTrue(isTransferrable);
  });

  test("ERC-721 v2 asset owned by fromAddress is transferrable", async () => {
    const isTransferrable = await client.isAssetTransferrable({
      asset: {
        tokenId: DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
        tokenAddress: DIGITAL_ART_CHAIN_ADDRESS,
      },
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2,
    });
    assert.isTrue(isTransferrable);
  });

  test("ERC-721 v1 asset owned by fromAddress is transferrable", async () => {
    const isTransferrable = await client.isAssetTransferrable({
      asset: {
        tokenId: CK_TOKEN_ID.toString(),
        tokenAddress: CK_ADDRESS,
      },
      fromAddress: ALEX_ADDRESS_2,
      toAddress: ALEX_ADDRESS,
      useProxy: true,
    });
    assert.isTrue(isTransferrable);
  });

  test("ERC-20 asset not owned by fromAddress is not transferrable", async () => {
    const isTransferrable = await client.isAssetTransferrable({
      asset: {
        tokenId: null,
        tokenAddress: WETH_ADDRESS,
        schemaName: WyvernSchemaName.ERC20,
      },
      fromAddress: RANDOM_ADDRESS,
      toAddress: ALEX_ADDRESS_2,
    });
    assert.isNotTrue(isTransferrable);
  });

  test("ERC-20 asset owned by fromAddress is transferrable", async () => {
    const isTransferrable = await client.isAssetTransferrable({
      asset: {
        tokenId: null,
        tokenAddress: WETH_ADDRESS,
        schemaName: WyvernSchemaName.ERC20,
      },
      quantity: Math.pow(10, 18) * 0.001,
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2,
    });
    assert.isTrue(isTransferrable);
  });

  test("ERC-1155 asset locked in contract is not transferrable", async () => {
    const isTransferrable2 = await client.isAssetTransferrable({
      asset: {
        tokenId: ENJIN_LEGACY_ADDRESS.toString(),
        tokenAddress: CATS_IN_MECHS_ID,
        schemaName: WyvernSchemaName.ERC1155,
      },
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2,
    });
    assert.isNotTrue(isTransferrable2);
  });

  test("ERC-1155 asset not owned by fromAddress is not transferrable", async () => {
    const isTransferrable = await client.isAssetTransferrable({
      asset: {
        tokenId: CATS_IN_MECHS_ID,
        tokenAddress: ENJIN_ADDRESS,
        schemaName: WyvernSchemaName.ERC1155,
      },
      fromAddress: DEVIN_ADDRESS,
      toAddress: ALEX_ADDRESS_2,
    });
    assert.isNotTrue(isTransferrable);
  });
});
