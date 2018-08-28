import {
  assert,
} from 'chai'

import {
  suite,
  test,
} from 'mocha-typescript'

import { OpenSeaPort } from '../src/index'
import * as Web3 from 'web3'
import { Network, OrderJSON, OrderSide, Order } from '../src/types'
import { orderFromJSON, getOrderHash, orderToJSON, MAX_UINT_256 } from '../src/wyvern'
import ordersJSONFixture = require('./fixtures/orders.json')
import { BigNumber } from 'bignumber.js'
import { ALEX_ADDRESS, CRYPTO_CRYSTAL_ADDRESS, canSettleOrder } from './constants'

const ordersJSON = ordersJSONFixture as any

const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')
const client = new OpenSeaPort(provider, {
  networkName: Network.Main
})

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

  test('API order has correct hash', async () => {
    const order = await client.api.getOrder({})
    assert.isNotNull(order)
    if (!order) {
      return
    }
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

  test('orderToJSON hashes if necessary', async () => {
    const order = await client.api.getOrder({})
    assert.isNotNull(order)
    if (!order) {
      return
    }
    const accountAddress = ALEX_ADDRESS
    const matchingOrder = client._makeMatchingOrder({order, accountAddress})
    const matchingOrderHash = matchingOrder.hash
    delete matchingOrder.hash
    assert.isUndefined(matchingOrder.hash)

    const orderJSON = orderToJSON(matchingOrder)
    assert.equal(orderJSON.hash, matchingOrderHash)
    assert.equal(orderJSON.hash, getOrderHash(matchingOrder))
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

  test('Matches first order in book', async () => {
    const order = await client.api.getOrder({})
    assert.isNotNull(order)
    if (!order) {
      return
    }
    const accountAddress = ALEX_ADDRESS
    await testMatch(order, accountAddress)
  })

  test('Checkes proxy for settlement and matches order, via sell_orders and getAssets', async () => {
    const accountAddress = ALEX_ADDRESS
    const { assets } = await client.api.getAssets({asset_contract_address: CRYPTO_CRYSTAL_ADDRESS, order_by: "current_price", order_direction: "asc", limit: 5 })

    const asset = assets[0]
    assert.isNotNull(asset)
    assert.isNotNull(asset.sellOrders)
    if (!asset || !asset.sellOrders) {
      return
    }
    const order = asset.sellOrders[0]
    assert.isNotNull(order)
    if (!order) {
      return
    }

    const settleable = await canSettleOrder(client, order, accountAddress)
    // console.log(orderToJSON(order))
    assert.isTrue(settleable)

    // Make sure match is valid
    await testMatch(order, accountAddress)
  })
})

async function testMatch(order: Order, accountAddress: string) {
  const matchingOrder = client._makeMatchingOrder({order, accountAddress})
  assert.equal(matchingOrder.hash, getOrderHash(matchingOrder))

  let buy: Order
  let sell: Order
  if (order.side == OrderSide.Buy) {
    buy = order
    sell = {
      ...matchingOrder,
      v: buy.v,
      r: buy.r,
      s: buy.s
    }
  } else {
    sell = order
    buy = {
      ...matchingOrder,
      v: sell.v,
      r: sell.r,
      s: sell.s
    }
  }
  const isValid = await client._validateMatch({ buy, sell, accountAddress })
  assert.isTrue(isValid)
}
