import {
  assert,
} from 'chai'

import {
  suite,
  test,
} from 'mocha-typescript'

import { OpenSea } from '../src/index'
import * as Web3 from 'web3'
import { Network, OrderJSON } from '../src/types'
import { orderFromJSON } from '../src/wyvern'
import ordersJSON = require('./fixtures/orders.json')
import { BigNumber } from 'bignumber.js'
import { WyvernProtocol } from 'wyvern-js/lib'

const ordersAndProperties = ordersJSON as any
const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')
const client = new OpenSea(provider, {
  networkName: Network.Main
})

suite('client', () => {

  test('Constructor has public methods', () => {
    assert.equal(typeof client.getCurrentPrice, 'function')
    assert.equal(typeof client.wrapEth, 'function')
  })

  test('Constructor exposes underscored methods', () => {
    assert.equal(typeof client._atomicMatch, 'function')
    assert.equal(typeof client._getSchema, 'function')
  })

  ordersAndProperties.map((data: {order: OrderJSON}, index: number) => {
    test('Order #' + index + ' has correct types', () => {
      const order = orderFromJSON(data.order)
      assert.instanceOf(order.basePrice, BigNumber)
      assert.typeOf(order.hash, "string")
      // client._validateBuyOrderParameters({order, accountAddress: order.maker})
    })
  })

  ordersAndProperties.map((data: {order: OrderJSON}, index: number) => {
    test('Order #' + index + ' has correct hash', () => {
      const order = orderFromJSON(data.order)
      // TS Bug with wyvern 0x schemas
      assert.equal(order.hash, WyvernProtocol.getOrderHashHex(data.order as any))
    })
  })
})
