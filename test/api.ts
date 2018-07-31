import {
  assert,
} from 'chai'

import {
  suite,
  test,
} from 'mocha-typescript'

import { OpenSeaAPI } from '../src/api'
import { Network, Order, OrderbookResponse } from '../src/types'

const mainApi = new OpenSeaAPI({
  networkName: Network.Main
})

const rinkebyApi = new OpenSeaAPI({
  networkName: Network.Rinkeby
})

suite('api', () => {

  test('API has correct base url', () => {
    assert.equal(mainApi.apiBaseUrl, 'https://api.opensea.io')
    assert.equal(rinkebyApi.apiBaseUrl, 'https://rinkeby-api.opensea.io')
  })

  test('API fetches orderbook and paginates', async () => {
    const {orders, count} = await mainApi.getOrders()
    assert.isArray(orders)
    assert.isNumber(count)
    assert.equal(orders.length, mainApi.pageSize)
    assert.isAbove(count, orders.length)

    const pagination = await mainApi.getOrders({}, 2)
    assert.equal(pagination.orders.length, mainApi.pageSize)
    assert.notDeepEqual(pagination.orders[0], orders[0])
    assert.equal(pagination.count, count)
  })

  test('API fetches orders for asset', async () => {
    const {orders, count} = await mainApi.getOrders({tokenAddress: "0x"})
    assert.isAbove(orders.length, 0)
  })

  test('API doesn\'t fetch nonexistent order', async () => {
    const order: Order | null = await mainApi.getOrder({hash: 'DNE'})
    assert.isNull(order)
  })

  test('API fetches existing order', async () => {
    const hash = "kdjfsdf"
    const order: Order | null = await mainApi.getOrder({hash})
    assert.isNotNull(order)
    if (!order) {
      return
    }
    assert.equal(order.hash, hash)
  })

})
