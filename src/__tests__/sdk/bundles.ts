import { assert } from "chai";
import { before, suite, test } from "mocha";
import Web3 from "web3";
import {
  ENJIN_ADDRESS,
  MAINNET_PROVIDER_URL,
  NULL_ADDRESS,
} from "../../constants";
import { OpenSeaSDK } from "../../index";
import { Network, UnhashedOrder, WyvernSchemaName } from "../../types";
import { getMaxOrderExpirationTimestamp } from "../../utils";
import {
  AGE_OF_RUST_TOKEN_ID,
  ALEX_ADDRESS,
  ALEX_ADDRESS_2,
  BENZENE_ADDRESS,
  CRYPTOVOXELS_WEARABLE_2_ID,
  CRYPTOVOXELS_WEARABLE_ADDRESS,
  CRYPTOVOXELS_WEARABLE_ID,
  DIGITAL_ART_CHAIN_ADDRESS,
  DIGITAL_ART_CHAIN_TOKEN_ID,
  DISSOLUTION_TOKEN_ID,
  GODS_UNCHAINED_CHEST_ADDRESS,
  MAINNET_API_KEY,
  MYTHEREUM_ADDRESS,
  MYTHEREUM_SLUG,
  MYTHEREUM_TOKEN_ID,
  WETH_ADDRESS,
} from "../constants";
import { areTimestampsNearlyEqual } from "../utils";
import { testFeesMakerOrder } from "./fees";
import { testMatchingNewOrder } from "./orders";

const provider = new Web3.providers.HttpProvider(MAINNET_PROVIDER_URL);

const client = new OpenSeaSDK(
  provider,
  {
    networkName: Network.Main,
    apiKey: MAINNET_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`)
);

const assetsForBundleOrder = [
  {
    tokenId: MYTHEREUM_TOKEN_ID.toString(),
    tokenAddress: MYTHEREUM_ADDRESS,
    quantity: 1,
  },
  {
    tokenId: DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
    tokenAddress: DIGITAL_ART_CHAIN_ADDRESS,
    quantity: 1,
  },
];

const assetsForBundleOrderERC721v3 = [
  {
    tokenId: MYTHEREUM_TOKEN_ID.toString(),
    tokenAddress: MYTHEREUM_ADDRESS,
    quantity: 1,
    schemaName: WyvernSchemaName.ERC721v3,
  },
  {
    tokenId: DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
    tokenAddress: DIGITAL_ART_CHAIN_ADDRESS,
    quantity: 1,
    schemaName: WyvernSchemaName.ERC721v3,
  },
];

const fungibleAssetsForBundleOrder = [
  {
    tokenAddress: BENZENE_ADDRESS,
    tokenId: null,
    schemaName: WyvernSchemaName.ERC20,
    quantity: 20,
  },
  {
    tokenAddress: GODS_UNCHAINED_CHEST_ADDRESS,
    tokenId: null,
    schemaName: WyvernSchemaName.ERC20,
    quantity: 1,
  },
];

const heterogenousSemiFungibleAssetsForBundleOrder = [
  {
    tokenId: DISSOLUTION_TOKEN_ID,
    tokenAddress: ENJIN_ADDRESS,
    schemaName: WyvernSchemaName.ERC1155,
    quantity: 2,
  },
  {
    tokenId: AGE_OF_RUST_TOKEN_ID,
    tokenAddress: ENJIN_ADDRESS,
    schemaName: WyvernSchemaName.ERC1155,
    quantity: 1,
  },
  {
    tokenId: CRYPTOVOXELS_WEARABLE_ID,
    tokenAddress: CRYPTOVOXELS_WEARABLE_ADDRESS,
    schemaName: WyvernSchemaName.ERC1155,
    quantity: 1,
  },
];

const homogenousSemiFungibleAssetsForBundleOrder = [
  {
    tokenId: CRYPTOVOXELS_WEARABLE_ID,
    tokenAddress: CRYPTOVOXELS_WEARABLE_ADDRESS,
    schemaName: WyvernSchemaName.ERC1155,
    quantity: 1,
  },
  {
    tokenId: CRYPTOVOXELS_WEARABLE_2_ID,
    tokenAddress: CRYPTOVOXELS_WEARABLE_ADDRESS,
    schemaName: WyvernSchemaName.ERC1155,
    quantity: 2,
  },
];

let manaAddress: string;

suite("SDK: bundles", () => {
  before(async () => {
    manaAddress = (await client.api.getPaymentTokens({ symbol: "MANA" }))
      .tokens[0].address;
  });

  test("Matches heterogenous bundle buy order", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS;
    const amountInEth = 0.01;

    const order = await client._makeBundleBuyOrder({
      assets: assetsForBundleOrder,
      quantities: [1, 1],
      accountAddress,
      startAmount: amountInEth,
      extraBountyBasisPoints: 0,
      paymentTokenAddress: WETH_ADDRESS,
    });

    assert.equal(order.paymentToken, WETH_ADDRESS);
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
    assert.equal(order.extra.toNumber(), 0);
    assert.notEqual(order.expirationTime.toNumber(), 0);
    assert.isTrue(
      areTimestampsNearlyEqual(
        getMaxOrderExpirationTimestamp(),
        order.expirationTime.toNumber()
      )
    );
    testBundleMetadata(order, WyvernSchemaName.ERC721);
    testFeesMakerOrder(order, undefined);

    await client._buyOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test("Matches homogenous bundle buy order", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS;
    const amountInToken = 10;
    const assets = [
      {
        tokenId: MYTHEREUM_TOKEN_ID.toString(),
        tokenAddress: MYTHEREUM_ADDRESS,
      },
    ];

    const order = await client._makeBundleBuyOrder({
      assets,
      collection: { slug: MYTHEREUM_SLUG },
      quantities: [1],
      accountAddress,
      startAmount: amountInToken,
      extraBountyBasisPoints: 0,
      paymentTokenAddress: manaAddress,
    });

    const asset = await client.api.getAsset(assets[0]);

    assert.equal(order.paymentToken, manaAddress);
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken);
    assert.equal(order.extra.toNumber(), 0);
    assert.notEqual(order.expirationTime.toNumber(), 0);
    assert.isTrue(
      areTimestampsNearlyEqual(
        getMaxOrderExpirationTimestamp(),
        order.expirationTime.toNumber()
      )
    );
    testBundleMetadata(order, WyvernSchemaName.ERC721);
    testFeesMakerOrder(order, asset.collection);

    await client._buyOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test("Matches fixed heterogenous bountied bundle sell order", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS;
    const amountInEth = 1;
    const bountyPercent = 1.5;

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with different types of assets",
      assets: assetsForBundleOrder,
      quantities: [1, 1],
      accountAddress,
      startAmount: amountInEth,
      extraBountyBasisPoints: bountyPercent * 100,
      paymentTokenAddress: NULL_ADDRESS,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS,
    });

    assert.equal(order.paymentToken, NULL_ADDRESS);
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
    assert.equal(order.extra.toNumber(), 0);
    assert.notEqual(order.expirationTime.toNumber(), 0);
    assert.isTrue(
      areTimestampsNearlyEqual(
        getMaxOrderExpirationTimestamp(),
        order.expirationTime.toNumber()
      )
    );
    testBundleMetadata(order, WyvernSchemaName.ERC721);
    testFeesMakerOrder(order, undefined, bountyPercent * 100);

    await client._sellOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test("Matches fixed heterogenous bountied bundle sell order ERC721v3", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS;
    const amountInEth = 1;
    const bountyPercent = 1.5;

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with different types of assets",
      assets: assetsForBundleOrderERC721v3,
      quantities: [1, 1],
      accountAddress,
      startAmount: amountInEth,
      extraBountyBasisPoints: bountyPercent * 100,
      paymentTokenAddress: NULL_ADDRESS,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS,
    });

    assert.equal(order.paymentToken, NULL_ADDRESS);
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
    assert.equal(order.extra.toNumber(), 0);
    assert.notEqual(order.expirationTime.toNumber(), 0);
    assert.isTrue(
      areTimestampsNearlyEqual(
        getMaxOrderExpirationTimestamp(),
        order.expirationTime.toNumber()
      )
    );
    testBundleMetadata(order, WyvernSchemaName.ERC721v3);
    testFeesMakerOrder(order, undefined, bountyPercent * 100);

    await client._sellOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test("Matches homogenous, bountied bundle sell order", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS;
    const amountInEth = 1;
    const bountyPercent = 0.8;

    const assets = [
      {
        tokenId: MYTHEREUM_TOKEN_ID.toString(),
        tokenAddress: MYTHEREUM_ADDRESS,
      },
    ];

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Homogenous Bundle",
      bundleDescription: "This is a test with one type of asset",
      assets,
      collection: { slug: MYTHEREUM_SLUG },
      quantities: [1],
      accountAddress,
      startAmount: amountInEth,
      extraBountyBasisPoints: bountyPercent * 100,
      paymentTokenAddress: NULL_ADDRESS,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS,
    });

    const asset = await client.api.getAsset(assets[0]);

    assert.equal(order.paymentToken, NULL_ADDRESS);
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
    assert.equal(order.extra.toNumber(), 0);
    assert.notEqual(order.expirationTime.toNumber(), 0);
    assert.isTrue(
      areTimestampsNearlyEqual(
        getMaxOrderExpirationTimestamp(),
        order.expirationTime.toNumber()
      )
    );
    testBundleMetadata(order, WyvernSchemaName.ERC721);
    testFeesMakerOrder(order, asset.collection, bountyPercent * 100);

    await client._sellOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test("Matches a new bundle sell order for an ERC-20 token (MANA)", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS;
    const token = (await client.api.getPaymentTokens({ symbol: "MANA" }))
      .tokens[0];
    const amountInToken = 2.422;

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with different types of assets",
      assets: assetsForBundleOrder,
      quantities: [1, 1],
      accountAddress,
      startAmount: amountInToken,
      paymentTokenAddress: token.address,
      extraBountyBasisPoints: 0,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS,
    });

    assert.equal(order.paymentToken, token.address);
    assert.equal(
      order.basePrice.toNumber(),
      Math.pow(10, token.decimals) * amountInToken
    );
    assert.equal(order.extra.toNumber(), 0);
    testBundleMetadata(order, WyvernSchemaName.ERC721);
    assert.notEqual(order.expirationTime.toNumber(), 0);
    assert.isTrue(
      areTimestampsNearlyEqual(
        getMaxOrderExpirationTimestamp(),
        order.expirationTime.toNumber()
      )
    );

    await client._sellOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test("Matches Dutch bundle order for different approve-all assets", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS;
    const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24); // one day from now
    const amountInEth = 1;

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with different types of assets",
      assets: assetsForBundleOrder,
      quantities: [1, 1],
      accountAddress,
      startAmount: amountInEth,
      endAmount: 0,
      expirationTime,
      extraBountyBasisPoints: 0,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS,
      paymentTokenAddress: NULL_ADDRESS,
    });

    assert.equal(order.paymentToken, NULL_ADDRESS);
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
    assert.equal(order.extra.toNumber(), Math.pow(10, 18) * amountInEth);
    assert.equal(order.expirationTime.toNumber(), expirationTime);
    testBundleMetadata(order, WyvernSchemaName.ERC721);

    await client._sellOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test("Can bundle multiple fungible tokens together", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS;
    const amountInEth = 1;

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with fungible assets",
      assets: fungibleAssetsForBundleOrder,
      quantities: fungibleAssetsForBundleOrder.map((a) => a.quantity),
      accountAddress,
      startAmount: amountInEth,
      extraBountyBasisPoints: 0,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS,
      paymentTokenAddress: NULL_ADDRESS,
    });

    assert.equal(order.paymentToken, NULL_ADDRESS);
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
    testBundleMetadata(order, WyvernSchemaName.ERC20);
    testFeesMakerOrder(order, undefined);

    await client._sellOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test("Can bundle multiple SFTs together", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS;
    const amountInEth = 1;

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with SFT assets",
      assets: heterogenousSemiFungibleAssetsForBundleOrder,
      quantities: heterogenousSemiFungibleAssetsForBundleOrder.map(
        (a) => a.quantity
      ),
      accountAddress,
      startAmount: amountInEth,
      extraBountyBasisPoints: 0,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS,
      paymentTokenAddress: NULL_ADDRESS,
    });

    assert.equal(order.paymentToken, NULL_ADDRESS);
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
    testBundleMetadata(order, WyvernSchemaName.ERC1155);
    testFeesMakerOrder(order, undefined);

    await client._sellOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test("Can bundle multiple homogenous semifungibles", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS;
    const amountInEth = 1;
    const asset = await client.api.getAsset(
      homogenousSemiFungibleAssetsForBundleOrder[0]
    );

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with homogenous SFT assets",
      assets: homogenousSemiFungibleAssetsForBundleOrder,
      collection: asset.collection,
      quantities: homogenousSemiFungibleAssetsForBundleOrder.map(
        (a) => a.quantity
      ),
      accountAddress,
      startAmount: amountInEth,
      extraBountyBasisPoints: 0,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS,
      paymentTokenAddress: NULL_ADDRESS,
    });

    assert.equal(order.paymentToken, NULL_ADDRESS);
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
    testBundleMetadata(order, WyvernSchemaName.ERC1155);
    testFeesMakerOrder(order, asset.collection);

    await client._sellOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test("Matches bundle sell order for misordered assets with different schemas", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS_2;
    const amountInEth = 1;
    const assets = [
      assetsForBundleOrder[0],
      fungibleAssetsForBundleOrder[0],
      heterogenousSemiFungibleAssetsForBundleOrder[0],
    ];

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with different schemas of assets",
      assets,
      quantities: assets.map((a) => a.quantity),
      accountAddress,
      startAmount: amountInEth,
      extraBountyBasisPoints: 0,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS,
      paymentTokenAddress: NULL_ADDRESS,
    });

    assert.equal(order.paymentToken, NULL_ADDRESS);
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
    testFeesMakerOrder(order, undefined);

    await client._sellOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test("Matches bundle buy order for misordered assets with different schemas", async () => {
    const accountAddress = ALEX_ADDRESS_2;
    const takerAddress = ALEX_ADDRESS;
    const amountInEth = 0.01;
    const assets = [
      assetsForBundleOrder[0],
      fungibleAssetsForBundleOrder[0],
      heterogenousSemiFungibleAssetsForBundleOrder[0],
    ];

    const order = await client._makeBundleBuyOrder({
      assets,
      quantities: assets.map((a) => a.quantity),
      accountAddress,
      startAmount: amountInEth,
      extraBountyBasisPoints: 0,
      paymentTokenAddress: WETH_ADDRESS,
    });

    assert.equal(order.paymentToken, WETH_ADDRESS);
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
    assert.equal(order.extra.toNumber(), 0);
    assert.notEqual(order.expirationTime.toNumber(), 0);
    assert.isTrue(
      areTimestampsNearlyEqual(
        getMaxOrderExpirationTimestamp(),
        order.expirationTime.toNumber()
      )
    );
    testFeesMakerOrder(order, undefined);

    await client._buyOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  suite("Expiration times", () => {
    test("it fails when expiration time is 0", async () => {
      const accountAddress = ALEX_ADDRESS;
      const amountInEth = 1;
      const bountyPercent = 1.5;

      try {
        await client._makeBundleSellOrder({
          bundleName: "Test Bundle",
          bundleDescription: "This is a test with different types of assets",
          assets: assetsForBundleOrder,
          quantities: [1, 1],
          accountAddress,
          startAmount: amountInEth,
          extraBountyBasisPoints: bountyPercent * 100,
          paymentTokenAddress: NULL_ADDRESS,
          waitForHighestBid: false,
          buyerAddress: NULL_ADDRESS,
          expirationTime: 0,
        });
        assert.fail();
      } catch (error) {
        assert.include((error as Error).message, "Expiration time cannot be 0");
      }

      try {
        await client._makeBundleBuyOrder({
          assets: assetsForBundleOrder,
          quantities: [1, 1],
          accountAddress,
          startAmount: amountInEth,
          extraBountyBasisPoints: 0,
          paymentTokenAddress: WETH_ADDRESS,
          expirationTime: 0,
        });
        assert.fail();
      } catch (error) {
        assert.include((error as Error).message, "Expiration time cannot be 0");
      }
    });

    test("it fails when expiration time exceeds six months", async () => {
      const accountAddress = ALEX_ADDRESS;
      const amountInEth = 1;
      const bountyPercent = 1.5;

      const expirationDate = new Date();

      expirationDate.setMonth(expirationDate.getMonth() + 7);

      const expirationTime = Math.round(expirationDate.getTime() / 1000);

      try {
        await client._makeBundleSellOrder({
          bundleName: "Test Bundle",
          bundleDescription: "This is a test with different types of assets",
          assets: assetsForBundleOrder,
          quantities: [1, 1],
          accountAddress,
          startAmount: amountInEth,
          extraBountyBasisPoints: bountyPercent * 100,
          paymentTokenAddress: NULL_ADDRESS,
          waitForHighestBid: false,
          buyerAddress: NULL_ADDRESS,
          expirationTime,
        });
        assert.fail();
      } catch (error) {
        assert.include(
          (error as Error).message,
          "Expiration time must not exceed six months from now"
        );
      }

      try {
        await client._makeBundleBuyOrder({
          assets: assetsForBundleOrder,
          quantities: [1, 1],
          accountAddress,
          startAmount: amountInEth,
          extraBountyBasisPoints: 0,
          paymentTokenAddress: WETH_ADDRESS,
          expirationTime,
        });
        assert.fail();
      } catch (error) {
        assert.include(
          (error as Error).message,
          "Expiration time must not exceed six months from now"
        );
      }
    });

    test("it handles expiration time duration correctly", async () => {
      const accountAddress = ALEX_ADDRESS;
      const paymentTokenAddress = manaAddress;
      const tokenId = MYTHEREUM_TOKEN_ID.toString();
      const tokenAddress = MYTHEREUM_ADDRESS;

      // Added buffer
      const listingTime = Math.floor(new Date().getTime() / 1000) + 60;

      // 10 minutes after
      const expirationTime = listingTime + 600;

      try {
        await client._makeSellOrder({
          asset: { tokenAddress, tokenId },
          quantity: 1,
          accountAddress,
          startAmount: 2,
          extraBountyBasisPoints: 0,
          buyerAddress: NULL_ADDRESS,
          paymentTokenAddress,
          waitForHighestBid: false,
          listingTime,
          expirationTime,
        });
        assert.fail();
      } catch (error) {
        assert.include(
          (error as Error).message,
          `Expiration time must be at least 15 minutes from the listing date`
        );
      }

      try {
        await client._makeBuyOrder({
          asset: { tokenAddress, tokenId },
          quantity: 1,
          accountAddress,
          startAmount: 2,
          extraBountyBasisPoints: 0,
          paymentTokenAddress,
          expirationTime,
        });
        assert.fail();
      } catch (error) {
        assert.include(
          (error as Error).message,
          `Expiration time must be at least 15 minutes from the listing date`
        );
      }

      const twentyMinuteExpirationTime = expirationTime + 600;

      const sellOrder = await client._makeSellOrder({
        asset: { tokenAddress, tokenId },
        quantity: 1,
        accountAddress,
        startAmount: 2,
        extraBountyBasisPoints: 0,
        buyerAddress: NULL_ADDRESS,
        paymentTokenAddress,
        waitForHighestBid: false,
        listingTime,
        // 20 minutes after listing time
        expirationTime: twentyMinuteExpirationTime,
      });

      assert.equal(
        sellOrder["expirationTime"].toNumber(),
        twentyMinuteExpirationTime
      );

      const buyOrder = await client._makeBuyOrder({
        asset: { tokenAddress, tokenId },
        quantity: 1,
        accountAddress,
        startAmount: 2,
        extraBountyBasisPoints: 0,
        paymentTokenAddress,
        expirationTime: twentyMinuteExpirationTime,
      });

      assert.equal(
        buyOrder["expirationTime"].toNumber(),
        twentyMinuteExpirationTime
      );
    });
  });
});

function testBundleMetadata(
  order: UnhashedOrder,
  schemaName: WyvernSchemaName
) {
  assert.containsAllKeys(order.metadata, ["bundle"]);
  if (!("bundle" in order.metadata)) {
    return;
  }
  assert.isNotEmpty(order.metadata.bundle.assets);
  const expectedSchemas = order.metadata.bundle.assets.map(() => schemaName);
  assert.deepEqual(order.metadata.bundle.schemas, expectedSchemas);
}
