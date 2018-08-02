import {
  assert,
} from 'chai'

import {
  suite,
  test,
} from 'mocha-typescript'

import { OpenSeaAPI, ORDERBOOK_VERSION } from '../src/api'
import { Network, Order } from '../src/types'

const mainApi = new OpenSeaAPI({
  networkName: Network.Main
})

const rinkebyApi = new OpenSeaAPI({
  networkName: Network.Rinkeby
})

const CK_ADDRESS = '0x06012c8cf97bead5deae237070f9587f8e7a266d'
const CK_GENESIS_OWNER_ADDRESS = '0x79bd592415ff6c91cfe69a7f9cd091354fc65a18'
const ALEX_ADDRESS = '0xe96a1b303a1eb8d04fb973eb2b291b8d591c8f72'

suite('api', () => {

  test('API has correct base url', () => {
    assert.equal(mainApi.apiBaseUrl, 'https://api.opensea.io')
    assert.equal(rinkebyApi.apiBaseUrl, 'https://rinkeby-api.opensea.io')
  })

  test('API fetches orderbook', async () => {
    const {orders, count} = await mainApi.getOrders()
    assert.isArray(orders)
    assert.isNumber(count)
    assert.equal(orders.length, mainApi.pageSize)
    assert.isAtLeast(count, orders.length)
  })

  if (ORDERBOOK_VERSION > 0) {
    test('API orderbook paginates', async () => {
      const {orders, count} = await mainApi.getOrders()
      const pagination = await mainApi.getOrders({}, 2)
      assert.equal(pagination.orders.length, mainApi.pageSize)
      assert.notDeepEqual(pagination.orders[0], orders[0])
      assert.equal(pagination.count, count)
    })
  }

  test('API fetches orders for asset contract and asset', async () => {
    const forKitties = await mainApi.getOrders({tokenAddress: CK_ADDRESS})
    assert.isAbove(forKitties.orders.length, 0)
    assert.isAbove(forKitties.count, 0)

    const forKitty = await mainApi.getOrders({tokenAddress: CK_ADDRESS, tokenId: 1})
    assert.isAbove(forKitty.orders.length, 0)
    assert.isAbove(forKitty.count, 0)
    assert.isAtLeast(forKitties.orders.length, forKitty.orders.length)
  })

  // TODO after v1 migration
  // test('API fetches orders for asset owner', async () => {
  //   const forOwner = await mainApi.getOrders({owner: CK_GENESIS_OWNER_ADDRESS})
  //   assert.isAbove(forOwner.orders.length, 0)
  //   assert.isAbove(forOwner.count, 0)
  //   const owners = forOwner.orders.map(o => o.asset.owner)
  //   owners.forEach(owner => {
  //     assert.equal(CK_GENESIS_OWNER_ADDRESS, owner)
  //   })
  // })

  test('API fetches orders for asset maker', async () => {
    const forMaker = await mainApi.getOrders({maker: ALEX_ADDRESS})
    assert.isAbove(forMaker.orders.length, 0)
    assert.isAbove(forMaker.count, 0)
    const makers = forMaker.orders.map(o => o.maker)
    makers.forEach(maker => {
      assert.equal(ALEX_ADDRESS, maker)
    })
  })

  test('API doesn\'t fetch impossible orders', async () => {
    const order: Order | null = await mainApi.getOrder({maker: ALEX_ADDRESS, taker: ALEX_ADDRESS})
    assert.isNull(order)
  })

  test('API excludes cancelledOrFinalized and markedInvalid orders', async () => {
    const {orders} = await mainApi.getOrders()
    const finishedOrders = orders.filter(o => o.cancelledOrFinalized)
    assert.isEmpty(finishedOrders)
    const invalidOrders = orders.filter(o => o.markedInvalid)
    assert.isEmpty(invalidOrders)
  })

})
