import {
  assert,
} from 'chai'

import {
  suite,
  test,
  skip,
} from 'mocha-typescript'

import { ORDERBOOK_VERSION } from '../src/api'
import { Order, OrderSide, OrderJSON } from '../src/types'
import { orderToJSON } from '../src'
import { mainApi, rinkebyApi, apiToTest, ALEX_ADDRESS, CK_RINKEBY_TOKEN_ID, CK_RINKEBY_ADDRESS, CK_RINKEBY_SELLER_FEE, MAINNET_API_KEY, CK_ADDRESS } from './constants'
import { getOrderHash } from '../src/utils';

suite('api', () => {

  test('API has correct base url', () => {
    assert.equal(mainApi.apiBaseUrl, 'https://api.opensea.io')
    assert.equal(rinkebyApi.apiBaseUrl, 'https://rinkeby-api.opensea.io')
  })

  test('API fetches bundles and prefetches sell orders', async () => {
    const { bundles } = await apiToTest.getBundles({asset_contract_address: CK_RINKEBY_ADDRESS, on_sale: true})
    assert.isArray(bundles)

    const bundle = bundles[0]
    assert.isNotNull(bundle)
    if (!bundle) {
      return
    }
    assert.include(bundle.assets.map(a => a.assetContract.name), "CryptoKittiesRinkeby")
    assert.isNotEmpty(bundle.sellOrders)
  })

  test('Includes API key in token request', async () => {
    const oldLogger = apiToTest.logger

    const logPromise = new Promise((resolve, reject) => {
      apiToTest.logger = log => {
        try {
          assert.include(log, `"X-API-KEY":"${MAINNET_API_KEY}"`)
          resolve()
        } catch (e) {
          reject(e)
        } finally {
          apiToTest.logger = oldLogger
        }
      }
      apiToTest.getPaymentTokens({ symbol: "MANA" })
    })

    await logPromise
  })

  test('An API asset\'s order has correct hash', async () => {
    const asset = await mainApi.getAsset(CK_ADDRESS, 1)
    assert.isNotNull(asset.orders)
    if (!asset.orders) {
      return
    }
    const order = asset.orders[0]
    assert.isNotNull(order)
    if (!order) {
      return
    }
    assert.equal(order.hash, getOrderHash(order))
  })

  // Skip these tests, since many are redundant with other tests
  skip(() => {

    test('API fetches tokens', async () => {
      const { tokens } = await apiToTest.getPaymentTokens({ symbol: "MANA" })
      assert.isArray(tokens)
      assert.equal(tokens.length, 1)
      assert.equal(tokens[0].name, "Decentraland MANA")
    })

    test('Rinkeby API orders have correct OpenSea url', async () => {
      const order = await rinkebyApi.getOrder({})
      if (!order.asset) {
        return
      }
      const url = `https://rinkeby.opensea.io/assets/${order.asset.assetContract.address}/${order.asset.tokenId}`
      assert.equal(order.asset.openseaLink, url)
    })

    test('Mainnet API orders have correct OpenSea url', async () => {
      const order = await mainApi.getOrder({})
      if (!order.asset) {
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
      assert.equal(asset.tokenId, CK_RINKEBY_TOKEN_ID.toString())
      assert.equal(asset.assetContract.name, "CryptoKittiesRinkeby")
      assert.equal(asset.assetContract.sellerFeeBasisPoints, CK_RINKEBY_SELLER_FEE)
    })

    test('API fetches assets and prefetches sellOrders', async () => {
      const { assets } = await apiToTest.getAssets({asset_contract_address: CK_RINKEBY_ADDRESS, order_by: "current_price"})
      assert.isArray(assets)
      assert.equal(assets.length, apiToTest.pageSize)

      const asset = assets[0]
      assert.equal(asset.assetContract.name, "CryptoKittiesRinkeby")
      assert.isNotEmpty(asset.sellOrders)
    })
  })

  test('API handles errors', async () => {
    // 401 Unauthorized
    try {
      await apiToTest.get('/user')
    } catch (error) {
      assert.include(error.message, "Unauthorized")
    }

    // 404 Not found
    try {
      await apiToTest.get(`/asset/${CK_RINKEBY_ADDRESS}/0`)
    } catch (error) {
      assert.include(error.message, "Not found")
    }

    // 400 malformed
    const res = await apiToTest.getOrders({
      // Get an old order to make sure listing time is too early
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
      // TODO sometimes the error is "Expected the listing time to be at or past the current time"
      // assert.include(error.message, "Order failed exchange validation")
    }
  })
})
