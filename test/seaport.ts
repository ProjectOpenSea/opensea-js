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
import { orderFromJSON } from '../src/wyvern'
import orderJSON = require('./fixtures/orders.json')
import { BigNumber } from 'bignumber.js'
import { WyvernProtocol } from 'wyvern-js/lib'

const ordersAndProperties = orderJSON as any

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

  ordersAndProperties.map((data: {order: OrderJSON}, index: number) => {
    test('Order #' + index + ' has correct types', () => {
      const order = orderFromJSON(data.order)
      assert.instanceOf(order.basePrice, BigNumber)
      assert.typeOf(order.hash, "string")
      assert.typeOf(order.maker, "string")
      // client._validateBuyOrderParameters({order, accountAddress: order.maker})
    })
  })

  ordersAndProperties.map((data: {order: OrderJSON}, index: number) => {
    test('Order #' + index + ' has correct hash', () => {
      const order = orderFromJSON(data.order)
      assert.equal(order.hash, WyvernProtocol.getOrderHashHex(order))
    })
  })
})
