import {
  assert,
} from 'chai'

import {
  suite,
  test,
  skip,
} from 'mocha-typescript'

import { ORDERBOOK_VERSION } from '../src/api'
import { Order, OrderSide } from '../src/types'
import { orderToJSON } from '../src'
import { mainApi, rinkebyApi, apiToTest, ALEX_ADDRESS, CK_RINKEBY_TOKEN_ID, CK_RINKEBY_ADDRESS, CK_RINKEBY_SELLER_FEE } from './constants'

suite('api', () => {

  test('API has correct base url', () => {
    assert.equal(mainApi.apiBaseUrl, 'https://api.opensea.io')
    assert.equal(rinkebyApi.apiBaseUrl, 'https://rinkeby-api.opensea.io')
  })

  // Skip these tests, since many are redundant with other tests
  skip(() => {

    test('Rinkeby API orders have correct OpenSea url', async () => {
      const order = await rinkebyApi.getOrder({})
      assert.isNotNull(order)
      if (!order || !order.asset) {
        return
      }
      const url = `https://rinkeby.opensea.io/assets/${order.asset.assetContract.address}/${order.asset.tokenId}`
      assert.equal(order.asset.openseaLink, url)
    })

    test('Mainnet API orders have correct OpenSea url', async () => {
      const order = await mainApi.getOrder({})
      assert.isNotNull(order)
      if (!order || !order.asset) {
        return
      }
      const url = `https://opensea.io/assets/${order.asset.assetContract.address}/${order.asset.tokenId}`
      assert.equal(order.asset.openseaLink, url)
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
      const {orders} = await apiToTest.getOrders()
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

    test('API fetches assets and prefetches sellOrders', async () => {
      const { assets, estimatedCount } = await apiToTest.getAssets({asset_contract_address: CK_RINKEBY_ADDRESS, order_by: "current_price"})
      assert.isArray(assets)
      assert.isNumber(estimatedCount)
      assert.equal(assets.length, apiToTest.pageSize)
      assert.isAtLeast(estimatedCount, assets.length)

      const asset = assets[0]
      assert.isNotNull(asset)
      if (!asset) {
        return
      }
      assert.equal(asset.assetContract.name, "CryptoKittiesRinkeby")
      assert.isNotEmpty(asset.sellOrders)
    })
  })

  test('API fetches bundles and prefetches sell orders', async () => {
    const { bundles, estimatedCount } = await apiToTest.getBundles({asset_contract_address: CK_RINKEBY_ADDRESS, on_sale: true})
    assert.isArray(bundles)
    assert.isNumber(estimatedCount)
    assert.isAtLeast(estimatedCount, bundles.length)

    const bundle = bundles[0]
    assert.isNotNull(bundle)
    if (!bundle) {
      return
    }
    assert.include(bundle.assets.map(a => a.assetContract.name), "CryptoKittiesRinkeby")
    assert.isNotEmpty(bundle.sellOrders)
  })

  test('API handles errors', async () => {
    try {
      await apiToTest.get('/user')
    } catch (error) {
      assert.include(error.message, "Unauthorized")
    }

    // Get an old order to make sure listing time is too early
    const res = await apiToTest.getOrders({
      listed_before: Math.round(Date.now() / 1000 - 3600)
    })
    const order = res.orders[0]
    assert.isNotNull(order)

    try {
      const newOrder = {
        ...orderToJSON(order),
        v: 1,
        r: "",
        s: ""
      }
      await apiToTest.postOrder(newOrder)
    } catch (error) {
      assert.include(error.message, "Expected the listing time to be at or past the current time")
    }
  })

})
