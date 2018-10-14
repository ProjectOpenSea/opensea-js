import {
  assert,
} from 'chai'

import {
  suite,
  test,
  skip,
} from 'mocha-typescript'

import { OpenSeaPort } from '../src/index'
import * as Web3 from 'web3'
import { Network, OrderJSON, OrderSide, Order, SaleKind, UnhashedOrder, UnsignedOrder } from '../src/types'
import { orderFromJSON, getOrderHash, orderToJSON, MAX_UINT_256, getCurrentGasPrice, estimateCurrentPrice, assignOrdersToSides, NULL_ADDRESS } from '../src/utils'
import ordersJSONFixture = require('./fixtures/orders.json')
import { BigNumber } from 'bignumber.js'
import { ALEX_ADDRESS, CRYPTO_CRYSTAL_ADDRESS, DIGITAL_ART_CHAIN_ADDRESS, DIGITAL_ART_CHAIN_TOKEN_ID, MYTHEREUM_TOKEN_ID, MYTHEREUM_ADDRESS, GODS_UNCHAINED_ADDRESS, CK_ADDRESS, ALEX_ADDRESS_2, GODS_UNCHAINED_TOKEN_ID, CK_TOKEN_ID, CK_RINKEBY_ADDRESS } from './constants'

const ordersJSON = ordersJSONFixture as any

const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')

const networkName = Network.Main
const client = new OpenSeaPort(provider, { networkName }, line => console.info(line))
const rinkebyClient = new OpenSeaPort(provider, { networkName: Network.Rinkeby }, line => console.info(line))

const assetsForBundleOrder = [
  { tokenId: MYTHEREUM_TOKEN_ID.toString(), tokenAddress: MYTHEREUM_ADDRESS },
  { tokenId: DIGITAL_ART_CHAIN_TOKEN_ID.toString(), tokenAddress: DIGITAL_ART_CHAIN_ADDRESS },
]

const assetsForBulkTransfer = [
  { tokenId: "504", tokenAddress: GODS_UNCHAINED_ADDRESS },
  { tokenId: "505", tokenAddress: CK_RINKEBY_ADDRESS },
  { tokenId: "509", tokenAddress: CK_RINKEBY_ADDRESS },
  { tokenId: "513", tokenAddress: CK_RINKEBY_ADDRESS },
  { tokenId: "0", tokenAddress: CK_RINKEBY_ADDRESS }
]

suite('seaport', () => {

  test('Instance has public methods', () => {
    assert.equal(typeof client.getCurrentPrice, 'function')
    assert.equal(typeof client.wrapEth, 'function')
  })

  test('Instance exposes API methods', () => {
    assert.equal(typeof client.api.getOrder, 'function')
    assert.equal(typeof client.api.getOrders, 'function')
    assert.equal(typeof client.api.postOrder, 'function')
  })

  test('Instance exposes some underscored methods', () => {
    assert.equal(typeof client._initializeProxy, 'function')
    assert.equal(typeof client._getProxy, 'function')
  })

  test('Bulk transfer of 2 batches of 40 cats', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS_2

    const gas = await rinkebyClient._estimateGasForTransfer({
      assets: assetsForBulkTransfer,
      fromAddress: accountAddress,
      toAddress: takerAddress
    })

    console.warn(gas)

    assert.isAbove(gas, 0)
  })

  test('Fungible tokens filter', () => {
    const mana = client.getFungibleTokens({ symbol: "MANA" })[0]
    assert.isNotNull(mana)
    assert.equal(mana.name, "Decentraland")
    assert.equal(mana.address, "0x0f5d2fb29fb7d3cfee444a200298f468908cc942")
    assert.equal(mana.decimals, 18)

    const dai = client.getFungibleTokens({ symbol: "DAI" })[0]
    assert.isNotNull(dai)
    assert.equal(dai.name, "")

    const all = client.getFungibleTokens()
    assert.isNotEmpty(all)
  })

  test('Asset locked in contract is not transferrable', async () => {
    const isTransferrable = await client.isAssetTransferrable({
      tokenId: GODS_UNCHAINED_TOKEN_ID.toString(),
      tokenAddress: GODS_UNCHAINED_ADDRESS,
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2
    })
    assert.isNotTrue(isTransferrable)
  })

  test('ERC-721 v3 asset not owned by fromAddress is not transferrable', async () => {
    const isTransferrable = await client.isAssetTransferrable({
      tokenId: "1",
      tokenAddress: DIGITAL_ART_CHAIN_ADDRESS,
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2
    })
    assert.isNotTrue(isTransferrable)
  })

  test('ERC-721 v3 asset owned by fromAddress is transferrable', async () => {
    const isTransferrable = await client.isAssetTransferrable({
      tokenId: DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
      tokenAddress: DIGITAL_ART_CHAIN_ADDRESS,
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2
    })
    assert.isTrue(isTransferrable)
  })

  test('ERC-721 v1 asset owned by fromAddress is transferrable', async () => {
    const isTransferrable = await client.isAssetTransferrable({
      tokenId: CK_TOKEN_ID.toString(),
      tokenAddress: CK_ADDRESS,
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2
    })
    assert.isTrue(isTransferrable)
  })

  ordersJSON.map((orderJSON: OrderJSON, index: number) => {
    test('Order #' + index + ' has correct types', () => {
      const order = orderFromJSON(orderJSON)
      assert.instanceOf(order.basePrice, BigNumber)
      assert.typeOf(order.hash, "string")
      assert.typeOf(order.maker, "string")
      // client._validateBuyOrderParameters({order, accountAddress: order.maker})
    })
  })

  ordersJSON.map((orderJSON: OrderJSON, index: number) => {
    test('Order #' + index + ' has correct hash', () => {
      const order = orderFromJSON(orderJSON)
      assert.equal(order.hash, getOrderHash(order))
    })
  })

  test('Matches a bundle sell order for an ERC-20 token (MANA)', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const token = client.getFungibleTokens({ symbol: 'MANA'})[0]
    const amountInToken = 2.422

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with different types of assets",
      assets: assetsForBundleOrder,
      accountAddress,
      startAmount: amountInToken,
      paymentTokenAddress: token.address
    })

    assert.equal(order.paymentToken, token.address)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, token.decimals) * amountInToken)
    assert.equal(order.extra.toNumber(), 0)
    assert.equal(order.expirationTime.toNumber(), 0)

    await client._validateSellOrderParameters({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Matches a buy order with an ERC-20 token (DAI)', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const token = client.getFungibleTokens({ symbol: 'DAI'})[0]
    const amountInToken = 3

    const order = await client._makeBuyOrder({
      tokenId: CK_TOKEN_ID.toString(),
      tokenAddress: CK_ADDRESS,
      accountAddress,
      startAmount: amountInToken,
      paymentTokenAddress: token.address
    })

    assert.equal(order.paymentToken, token.address)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, token.decimals) * amountInToken)
    assert.equal(order.extra.toNumber(), 0)
    assert.equal(order.expirationTime.toNumber(), 0)

    await client._validateBuyOrderParameters({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Matches fixed bundle sell order', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const amountInEth = 1

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with different types of assets",
      assets: assetsForBundleOrder,
      accountAddress,
      startAmount: amountInEth
    })

    assert.equal(order.paymentToken, NULL_ADDRESS)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth)
    assert.equal(order.extra.toNumber(), 0)
    assert.equal(order.expirationTime.toNumber(), 0)

    await client._validateSellOrderParameters({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Matches Dutch bundle order for different approve-all assets', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const expirationTime = (Date.now() / 1000 + 60 * 60 * 24) // one day from now
    const amountInEth = 1

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with different types of assets",
      assets: assetsForBundleOrder,
      accountAddress,
      startAmount: amountInEth,
      endAmount: 0,
      expirationTime
    })

    assert.equal(order.paymentToken, NULL_ADDRESS)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth)
    assert.equal(order.extra.toNumber(), Math.pow(10, 18) * amountInEth)
    assert.equal(order.expirationTime.toNumber(), expirationTime)

    await client._validateSellOrderParameters({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('API order has asset and correct hash', async () => {
    const order = await client.api.getOrder({})
    assert.isNotNull(order)
    if (!order) {
      return
    }
    assert.isNotNull(order.asset)
    assert.equal(order.hash, getOrderHash(order))
  })

  test('API asset\'s order has correct hash', async () => {
    const asset = await client.api.getAsset("0x06012c8cf97bead5deae237070f9587f8e7a266d", 1)
    assert.isNotNull(asset)
    if (!asset || !asset.orders) {
      return
    }
    const order = asset.orders[0]
    assert.isNotNull(order)
    if (!order) {
      return
    }
    assert.equal(order.hash, getOrderHash(order))
  })

  test('orderToJSON computes correct current price for Dutch auctions', async () => {
    const { orders, count } = await client.api.getOrders({ sale_kind: SaleKind.DutchAuction })
    assert.equal(orders.length, client.api.pageSize)
    orders.map(order => {
      assert.isNotNull(order.currentPrice)
      if (!order.currentPrice) {
        return
      }
      // Possible race condition
      assert.equal(order.currentPrice.toPrecision(3), estimateCurrentPrice(order).toPrecision(3))
      assert.isAbove(order.basePrice.toNumber(), order.currentPrice.toNumber())
    })
  })

  test('orderToJSON deserializes asset and hashes if necessary', async () => {
    const order = await client.api.getOrder({})
    assert.isNotNull(order)
    if (!order || !order.asset) {
      return
    }
    assert.isNotEmpty(order.asset.assetContract)
    assert.isNotEmpty(order.asset.tokenId)

    const accountAddress = ALEX_ADDRESS
    const matchingOrder = client._makeMatchingOrder({order, accountAddress})
    const matchingOrderHash = matchingOrder.hash
    delete matchingOrder.hash
    assert.isUndefined(matchingOrder.hash)

    const orderJSON = orderToJSON(matchingOrder)
    assert.equal(orderJSON.hash, matchingOrderHash)
    assert.equal(orderJSON.hash, getOrderHash(matchingOrder))
  })

  test('Uses a gas price above the mean', async () => {
    const gasPrice = await client._computeGasPrice()
    const meanGasPrice = await getCurrentGasPrice(client.web3)
    assert.isAbove(meanGasPrice.toNumber(), 0)
    assert.isAbove(gasPrice.toNumber(), meanGasPrice.toNumber())
  })

  test('Fetches proxy for an account', async () => {
    const accountAddress = ALEX_ADDRESS
    const proxy = await client._getProxy(accountAddress)
    assert.isNotNull(proxy)
  })

  test('Fetches positive token balance for an account', async () => {
    const accountAddress = ALEX_ADDRESS
    const balance = await client._getTokenBalance({ accountAddress })
    assert.isAbove(balance.toNumber(), 0)
  })

  test('Accounts have maximum token balance approved', async () => {
    const accountAddress = ALEX_ADDRESS
    const approved = await client._getApprovedTokenCount({ accountAddress })
    assert.equal(approved.toString(), MAX_UINT_256.toString())
  })

  test('Matches first buy order in book', async () => {
    const order = await client.api.getOrder({side: OrderSide.Buy})
    assert.isNotNull(order)
    if (!order) {
      return
    }
    assert.isNotNull(order.asset)
    if (!order.asset) {
      return
    }
    const takerAddress = order.asset.owner.address
    // Taker might not have all approval permissions so only test match
    await testMatchingOrder(order, takerAddress, false)
  })

  test('Matches a buy order and estimates gas on fulfillment', async () => {
    // Need to use a taker who has created a proxy and approved W-ETH already
    const takerAddress = ALEX_ADDRESS

    const order = await client.api.getOrder({
      side: OrderSide.Buy,
      owner: takerAddress,
      // Use a token that has already been approved via approve-all
      asset_contract_address: DIGITAL_ART_CHAIN_ADDRESS
    })
    assert.isNotNull(order)
    if (!order) {
      return
    }
    assert.isNotNull(order.asset)
    if (!order.asset) {
      return
    }
    await testMatchingOrder(order, takerAddress, true)
  })

  test('Matches order via sell_orders and getAssets', async () => {
    const { assets } = await client.api.getAssets({asset_contract_address: CRYPTO_CRYSTAL_ADDRESS, order_by: "current_price", order_direction: "asc", limit: 5 })

    const asset = assets[0]
    assert.isNotNull(asset)
    assert.isNotEmpty(asset.sellOrders)
    if (!asset || !asset.sellOrders) {
      return
    }
    const order = asset.sellOrders[0]
    // Make sure match is valid
    const takerAddress = ALEX_ADDRESS
    await testMatchingOrder(order, takerAddress, true)
  })
})

async function testMatchingOrder(order: Order, accountAddress: string, testAtomicMatch: boolean) {
  // TODO test mode for matching order to use 0x11111 in calldata
  const matchingOrder = client._makeMatchingOrder({order, accountAddress})
  assert.equal(matchingOrder.hash, getOrderHash(matchingOrder))

  const { buy, sell } = assignOrdersToSides(order, matchingOrder)

  const isValid = await client._validateMatch({ buy, sell, accountAddress })
  assert.isTrue(isValid)

  if (testAtomicMatch) {
    const isFulfillable = await client.isOrderFulfillable({ order, accountAddress })
    assert.isTrue(isFulfillable)
    const gasPrice = await client._computeGasPrice()
    console.info(`Gas price to use: ${client.web3.fromWei(gasPrice, 'gwei')} gwei`)
  }
}

async function testMatchingNewOrder(unhashedOrder: UnhashedOrder, accountAddress: string) {
  const order = {
    ...unhashedOrder,
    hash: getOrderHash(unhashedOrder)
  }

  const matchingOrder = client._makeMatchingOrder({order, accountAddress})
  assert.equal(matchingOrder.hash, getOrderHash(matchingOrder))

  const isSellOrder = order.side == OrderSide.Sell

  const v = 27
  const r = ''
  const s = ''

  let buy: Order
  let sell: Order
  if (!isSellOrder) {
    buy = {
      ...order,
      v, r, s
    }
    sell = {
      ...matchingOrder,
      v, r, s
    }
  } else {
    sell = {
      ...order,
      v, r, s
    }
    buy = {
      ...matchingOrder,
      v, r, s
    }
  }

  const isValid = await client._validateMatch({ buy, sell, accountAddress })
  assert.isTrue(isValid)

  // Make sure assets are transferrable
  await Promise.all(getAssets(order).map(async ({ tokenAddress, tokenId }, i) => {
    const isTransferrable = await client.isAssetTransferrable({
      tokenId, tokenAddress,
      fromAddress: sell.maker,
      toAddress: buy.maker
    })
    assert.isTrue(isTransferrable)
  }))
}

function getAssets(
    order: Order | UnsignedOrder | UnhashedOrder
  ): Array<{tokenAddress: string; tokenId: string }> {

  const wyAssets = order.metadata.bundle
    ? order.metadata.bundle.assets
    : order.metadata.asset
      ? [ order.metadata.asset ]
      : []

  assert.isNotEmpty(wyAssets)

  return wyAssets.map(({ id, address }) => ({
    tokenId: id,
    tokenAddress: address
  }))
}
