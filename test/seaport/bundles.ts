import {
  assert,
} from 'chai'

import { before } from 'mocha'

import {
  suite,
  test,
} from 'mocha-typescript'

import { OpenSeaPort } from '../../src/index'
import * as Web3 from 'web3'
import { Network, WyvernSchemaName, UnhashedOrder } from '../../src/types'
import { ALEX_ADDRESS, DIGITAL_ART_CHAIN_ADDRESS, DIGITAL_ART_CHAIN_TOKEN_ID, MYTHEREUM_TOKEN_ID, MYTHEREUM_ADDRESS, MAINNET_API_KEY, DISSOLUTION_TOKEN_ID, GODS_UNCHAINED_CHEST_ADDRESS, CRYPTOVOXELS_WEARABLE_ID, CRYPTOVOXELS_WEARABLE_ADDRESS, AGE_OF_RUST_TOKEN_ID, ALEX_ADDRESS_2, BENZENE_ADDRESS, CRYPTOVOXELS_WEARABLE_2_ID, WETH_ADDRESS } from '../constants'
import { testFeesMakerOrder } from './fees'
import { testMatchingNewOrder } from './orders' 
import {
  MAINNET_PROVIDER_URL,
  NULL_ADDRESS,
  ENJIN_ADDRESS,
} from '../../src/constants'

const provider = new Web3.providers.HttpProvider(MAINNET_PROVIDER_URL)

const client = new OpenSeaPort(provider, {
  networkName: Network.Main,
  apiKey: MAINNET_API_KEY
}, line => console.info(`MAINNET: ${line}`))

const assetsForBundleOrder = [
  { tokenId: MYTHEREUM_TOKEN_ID.toString(), tokenAddress: MYTHEREUM_ADDRESS, quantity: 1 },
  { tokenId: DIGITAL_ART_CHAIN_TOKEN_ID.toString(), tokenAddress: DIGITAL_ART_CHAIN_ADDRESS, quantity: 1 },
]

const fungibleAssetsForBundleOrder = [
  { tokenAddress: BENZENE_ADDRESS, tokenId: null, schemaName: WyvernSchemaName.ERC20, quantity: 20 },
  { tokenAddress: GODS_UNCHAINED_CHEST_ADDRESS, tokenId: null, schemaName: WyvernSchemaName.ERC20, quantity: 1 },
]

const heterogenousSemiFungibleAssetsForBundleOrder = [
  { tokenId: DISSOLUTION_TOKEN_ID, tokenAddress: ENJIN_ADDRESS, schemaName: WyvernSchemaName.ERC1155, quantity: 2 },
  { tokenId: AGE_OF_RUST_TOKEN_ID, tokenAddress: ENJIN_ADDRESS, schemaName: WyvernSchemaName.ERC1155, quantity: 1 },
  { tokenId: CRYPTOVOXELS_WEARABLE_ID, tokenAddress: CRYPTOVOXELS_WEARABLE_ADDRESS, schemaName: WyvernSchemaName.ERC1155, quantity: 1 },
]

const homogenousSemiFungibleAssetsForBundleOrder = [
  { tokenId: CRYPTOVOXELS_WEARABLE_ID, tokenAddress: CRYPTOVOXELS_WEARABLE_ADDRESS, schemaName: WyvernSchemaName.ERC1155, quantity: 1 },
  { tokenId: CRYPTOVOXELS_WEARABLE_2_ID, tokenAddress: CRYPTOVOXELS_WEARABLE_ADDRESS, schemaName: WyvernSchemaName.ERC1155, quantity: 2 },
]

let manaAddress: string

suite('seaport: bundles', () => {

  before(async () => {
    manaAddress = (await client.api.getPaymentTokens({ symbol: 'MANA'})).tokens[0].address
  })

  test('Matches heterogenous bundle buy order', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const amountInEth = 0.01

    const order = await client._makeBundleBuyOrder({
      assets: assetsForBundleOrder,
      quantities: [1, 1],
      accountAddress,
      startAmount: amountInEth,
      extraBountyBasisPoints: 0,
      expirationTime: 0,
      paymentTokenAddress: WETH_ADDRESS
    })

    assert.equal(order.paymentToken, WETH_ADDRESS)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth)
    assert.equal(order.extra.toNumber(), 0)
    assert.equal(order.expirationTime.toNumber(), 0)
    testBundleMetadata(order, WyvernSchemaName.ERC721)
    testFeesMakerOrder(order, undefined)

    await client._buyOrderValidationAndApprovals({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Matches homogenous bundle buy order', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const amountInToken = 10
    const assets = [{ tokenId: MYTHEREUM_TOKEN_ID.toString(), tokenAddress: MYTHEREUM_ADDRESS }]

    const order = await client._makeBundleBuyOrder({
      assets,
      quantities: [1],
      accountAddress,
      startAmount: amountInToken,
      extraBountyBasisPoints: 0,
      expirationTime: 0,
      paymentTokenAddress: manaAddress
    })

    const asset = await client.api.getAsset(assets[0])

    assert.equal(order.paymentToken, manaAddress)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken)
    assert.equal(order.extra.toNumber(), 0)
    assert.equal(order.expirationTime.toNumber(), 0)
    testBundleMetadata(order, WyvernSchemaName.ERC721)
    testFeesMakerOrder(order, asset.collection)

    await client._buyOrderValidationAndApprovals({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Matches fixed heterogenous bountied bundle sell order', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const amountInEth = 1
    const bountyPercent = 1.5

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with different types of assets",
      assets: assetsForBundleOrder,
      quantities: [1, 1],
      accountAddress,
      startAmount: amountInEth,
      extraBountyBasisPoints: bountyPercent * 100,
      expirationTime: 0,
      paymentTokenAddress: NULL_ADDRESS,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS
    })

    assert.equal(order.paymentToken, NULL_ADDRESS)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth)
    assert.equal(order.extra.toNumber(), 0)
    assert.equal(order.expirationTime.toNumber(), 0)
    testBundleMetadata(order, WyvernSchemaName.ERC721)
    testFeesMakerOrder(order, undefined, bountyPercent * 100)

    await client._sellOrderValidationAndApprovals({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Matches homogenous, bountied bundle sell order', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const amountInEth = 1
    const bountyPercent = 0.8

    const assets = [{ tokenId: MYTHEREUM_TOKEN_ID.toString(), tokenAddress: MYTHEREUM_ADDRESS }]

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Homogenous Bundle",
      bundleDescription: "This is a test with one type of asset",
      assets,
      quantities: [1],
      accountAddress,
      startAmount: amountInEth,
      extraBountyBasisPoints: bountyPercent * 100,
      expirationTime: 0,
      paymentTokenAddress: NULL_ADDRESS,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS
    })

    const asset = await client.api.getAsset(assets[0])

    assert.equal(order.paymentToken, NULL_ADDRESS)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth)
    assert.equal(order.extra.toNumber(), 0)
    assert.equal(order.expirationTime.toNumber(), 0)
    testBundleMetadata(order, WyvernSchemaName.ERC721)
    testFeesMakerOrder(order, asset.collection, bountyPercent * 100)

    await client._sellOrderValidationAndApprovals({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Matches a new bundle sell order for an ERC-20 token (MANA)', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const token = (await client.api.getPaymentTokens({ symbol: 'MANA'})).tokens[0]
    const amountInToken = 2.422

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with different types of assets",
      assets: assetsForBundleOrder,
      quantities: [1, 1],
      accountAddress,
      startAmount: amountInToken,
      paymentTokenAddress: token.address,
      extraBountyBasisPoints: 0,
      expirationTime: 0,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS
    })

    assert.equal(order.paymentToken, token.address)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, token.decimals) * amountInToken)
    assert.equal(order.extra.toNumber(), 0)
    testBundleMetadata(order, WyvernSchemaName.ERC721)
    assert.equal(order.expirationTime.toNumber(), 0)

    await client._sellOrderValidationAndApprovals({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Matches Dutch bundle order for different approve-all assets', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24) // one day from now
    const amountInEth = 1

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
      paymentTokenAddress: NULL_ADDRESS
    })

    assert.equal(order.paymentToken, NULL_ADDRESS)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth)
    assert.equal(order.extra.toNumber(), Math.pow(10, 18) * amountInEth)
    assert.equal(order.expirationTime.toNumber(), expirationTime)
    testBundleMetadata(order, WyvernSchemaName.ERC721)

    await client._sellOrderValidationAndApprovals({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Can bundle multiple fungible tokens together', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const amountInEth = 1

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with fungible assets",
      assets: fungibleAssetsForBundleOrder,
      quantities: fungibleAssetsForBundleOrder.map(a => a.quantity),
      accountAddress,
      startAmount: amountInEth,
      expirationTime: 0,
      extraBountyBasisPoints: 0,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS,
      paymentTokenAddress: NULL_ADDRESS
    })

    assert.equal(order.paymentToken, NULL_ADDRESS)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth)
    testBundleMetadata(order, WyvernSchemaName.ERC20)
    testFeesMakerOrder(order, undefined)

    await client._sellOrderValidationAndApprovals({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Can bundle multiple SFTs together', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const amountInEth = 1

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with SFT assets",
      assets: heterogenousSemiFungibleAssetsForBundleOrder,
      quantities: heterogenousSemiFungibleAssetsForBundleOrder.map(a => a.quantity),
      accountAddress,
      startAmount: amountInEth,
      expirationTime: 0,
      extraBountyBasisPoints: 0,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS,
      paymentTokenAddress: NULL_ADDRESS
    })

    assert.equal(order.paymentToken, NULL_ADDRESS)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth)
    testBundleMetadata(order, WyvernSchemaName.ERC1155)
    testFeesMakerOrder(order, undefined)

    await client._sellOrderValidationAndApprovals({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Can bundle multiple homogenous semifungibles', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const amountInEth = 1
    const asset = await client.api.getAsset(homogenousSemiFungibleAssetsForBundleOrder[0])

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with homogenous SFT assets",
      assets: homogenousSemiFungibleAssetsForBundleOrder,
      collection: asset.collection,
      quantities: homogenousSemiFungibleAssetsForBundleOrder.map(a => a.quantity),
      accountAddress,
      startAmount: amountInEth,
      expirationTime: 0,
      extraBountyBasisPoints: 0,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS,
      paymentTokenAddress: NULL_ADDRESS
    })

    assert.equal(order.paymentToken, NULL_ADDRESS)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth)
    testBundleMetadata(order, WyvernSchemaName.ERC1155)
    testFeesMakerOrder(order, asset.collection)

    await client._sellOrderValidationAndApprovals({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Matches bundle sell order for misordered assets with different schemas', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS_2
    const amountInEth = 1
    const assets = [
      assetsForBundleOrder[0],
      fungibleAssetsForBundleOrder[0],
      heterogenousSemiFungibleAssetsForBundleOrder[0]]

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with different schemas of assets",
      assets,
      quantities: assets.map(a => a.quantity),
      accountAddress,
      startAmount: amountInEth,
      expirationTime: 0,
      extraBountyBasisPoints: 0,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS,
      paymentTokenAddress: NULL_ADDRESS
    })

    assert.equal(order.paymentToken, NULL_ADDRESS)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth)
    testFeesMakerOrder(order, undefined)

    await client._sellOrderValidationAndApprovals({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })
  
  test('Matches bundle buy order for misordered assets with different schemas', async () => {
    const accountAddress = ALEX_ADDRESS_2
    const takerAddress = ALEX_ADDRESS
    const amountInEth = 0.01
    const assets = [
      assetsForBundleOrder[0],
      fungibleAssetsForBundleOrder[0],
      heterogenousSemiFungibleAssetsForBundleOrder[0]]

    const order = await client._makeBundleBuyOrder({
      assets,
      quantities: assets.map(a => a.quantity),
      accountAddress,
      startAmount: amountInEth,
      expirationTime: 0,
      extraBountyBasisPoints: 0,
      paymentTokenAddress: WETH_ADDRESS
    })

    assert.equal(order.paymentToken, WETH_ADDRESS)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth)
    assert.equal(order.extra.toNumber(), 0)
    assert.equal(order.expirationTime.toNumber(), 0)
    testFeesMakerOrder(order, undefined)

    await client._buyOrderValidationAndApprovals({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

})

function testBundleMetadata(order: UnhashedOrder, schemaName: WyvernSchemaName) {
  assert.containsAllKeys(order.metadata, ['bundle'])
  if (!('bundle' in order.metadata)) {
    return
  }
  assert.isNotEmpty(order.metadata.bundle.assets)
  const expectedSchemas = order.metadata.bundle.assets.map(a => schemaName)
  assert.deepEqual(order.metadata.bundle.schemas, expectedSchemas)
}
