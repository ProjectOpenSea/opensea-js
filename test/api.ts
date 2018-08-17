import {
  assert,
} from 'chai'

import {
  suite,
  test,
} from 'mocha-typescript'

import { OpenSeaAPI, ORDERBOOK_VERSION } from '../src/api'
import { Network, Order, OrderJSON, OrderSide } from '../src/types'
import { orderToJSON } from '../src'

const mainApi = new OpenSeaAPI({
  networkName: Network.Main
})

const rinkebyApi = new OpenSeaAPI({
  networkName: Network.Rinkeby
})

const apiToTest = rinkebyApi

const CK_ADDRESS = '0x06012c8cf97bead5deae237070f9587f8e7a266d'
const CK_RINKEBY_ADDRESS = '0x16baf0de678e52367adc69fd067e5edd1d33e3bf'
const CK_RINKEBY_TOKEN_ID = 111
const CK_RINKEBY_SELLER_FEE = 125
const ALEX_ADDRESS = '0xe96a1b303a1eb8d04fb973eb2b291b8d591c8f72'

suite('api', () => {

  test('API has correct base url', () => {
    assert.equal(mainApi.apiBaseUrl, 'https://api.opensea.io')
    assert.equal(rinkebyApi.apiBaseUrl, 'https://rinkeby-api.opensea.io')
  })

  test('API fetches orderbook', async () => {
    const {orders, count} = await apiToTest.getOrders()
    assert.isArray(orders)
    assert.isNumber(count)
    assert.equal(orders.length, apiToTest.pageSize)
    assert.isAtLeast(count, orders.length)
  })

  test('API can change page size', async () => {
    const defaultPageSize = apiToTest.pageSize
    apiToTest.pageSize = 7
    const {orders, count} = await apiToTest.getOrders()
    assert.equal(orders.length, 7)
    apiToTest.pageSize = defaultPageSize
  })

  if (ORDERBOOK_VERSION > 0) {
    test('API orderbook paginates', async () => {
      const {orders, count} = await apiToTest.getOrders()
      const pagination = await apiToTest.getOrders({}, 2)
      assert.equal(pagination.orders.length, apiToTest.pageSize)
      assert.notDeepEqual(pagination.orders[0], orders[0])
      assert.equal(pagination.count, count)
    })
  }

  test('API fetches orders for asset contract and asset', async () => {
    const forKitties = await apiToTest.getOrders({asset_contract_address: CK_RINKEBY_ADDRESS})
    assert.isAbove(forKitties.orders.length, 0)
    assert.isAbove(forKitties.count, 0)

    const forKitty = await apiToTest.getOrders({asset_contract_address: CK_RINKEBY_ADDRESS, token_id: CK_RINKEBY_TOKEN_ID})
    assert.isAbove(forKitty.orders.length, 0)
    assert.isAbove(forKitty.count, 0)
    assert.isAtLeast(forKitties.orders.length, forKitty.orders.length)
  })

  test('API fetches orders for asset owner', async () => {
    const forOwner = await apiToTest.getOrders({owner: ALEX_ADDRESS})
    assert.isAbove(forOwner.orders.length, 0)
    assert.isAbove(forOwner.count, 0)
    const owners = forOwner.orders.map(o => o.asset && o.asset.owner && o.asset.owner.address)
    owners.forEach(owner => {
      assert.equal(ALEX_ADDRESS, owner)
    })
  })

  test('API fetches buy orders for maker', async () => {
    const forMaker = await apiToTest.getOrders({maker: ALEX_ADDRESS, side: OrderSide.Buy})
    assert.isAbove(forMaker.orders.length, 0)
    assert.isAbove(forMaker.count, 0)
    forMaker.orders.forEach(order => {
      assert.equal(ALEX_ADDRESS, order.maker)
      assert.equal(OrderSide.Buy, order.side)
    })
  })

  test('API doesn\'t fetch impossible orders', async () => {
    const order: Order | null = await apiToTest.getOrder({maker: ALEX_ADDRESS, taker: ALEX_ADDRESS})
    assert.isNull(order)
  })

  test('API excludes cancelledOrFinalized and markedInvalid orders', async () => {
    const {orders} = await apiToTest.getOrders({limit: 100})
    const finishedOrders = orders.filter(o => o.cancelledOrFinalized)
    assert.isEmpty(finishedOrders)
    const invalidOrders = orders.filter(o => o.markedInvalid)
    assert.isEmpty(invalidOrders)
  })

  test('API fetches fees for an asset', async () => {
    const asset = await apiToTest.getAsset(CK_RINKEBY_ADDRESS, CK_RINKEBY_TOKEN_ID)
    assert.isNotNull(asset)
    if (!asset) {
      return
    }
    assert.equal(asset.tokenId, CK_RINKEBY_TOKEN_ID.toString())
    assert.equal(asset.assetContract.name, "CryptoKittiesRinkeby")
    assert.equal(asset.assetContract.sellerFeeBasisPoints, CK_RINKEBY_SELLER_FEE)
  })

  test('API handles errors', async () => {
    const res = await apiToTest.getOrders()
    const order = res.orders[0]
    assert.isNotNull(order)

    try {
      await apiToTest.get('/user')
    } catch (error) {
      assert.include(error.message, "Unauthorized")
    }

    try {
      const newOrder = {
        ...orderToJSON(order),
        v: 1,
        r: "",
        s: ""
      }
      await apiToTest.postOrder(newOrder)
    } catch (error) {
      assert.include(error.message, "Expected listing_time to be at or past the current time")
    }
  })

})
