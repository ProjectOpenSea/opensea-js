import {
  assert,
} from 'chai'

import {
  suite,
  test,
} from 'mocha-typescript'

import { OpenSeaPort } from '../src/index'
import * as Web3 from 'web3'
import { Network, OrderJSON } from '../src/types'
import { orderFromJSON, orderToJSON } from '../src/wyvern'
import ordersJSONFixture = require('./fixtures/orders.json')
import { BigNumber } from 'bignumber.js'
import { WyvernProtocol } from 'wyvern-js/lib'

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
      assert.equal(order.hash, WyvernProtocol.getOrderHashHex(orderToJSON(order) as any))
    })
  })

  test('API order has correct hash', async () => {
    const order = await client.api.getOrder({})
    assert.isNotNull(order)
    if (!order) {
      return
    }
    // TS Bug with wyvern 0x schemas
    assert.equal(order.hash, WyvernProtocol.getOrderHashHex(orderToJSON(order) as any))
  })

  test('API asset\'s order has correct hash', async () => {
    const asset = await client.api.getAsset("0x06012c8cf97bead5deae237070f9587f8e7a266d", 1)
    assert.isNotNull(asset)
    if (!asset) {
      return
    }
    const order = asset.orders[0]
    assert.isNotNull(order)
    if (!order) {
      return
    }
    // TS Bug with wyvern 0x schemas
    assert.equal(order.hash, WyvernProtocol.getOrderHashHex(orderToJSON(order) as any))
  })
})
