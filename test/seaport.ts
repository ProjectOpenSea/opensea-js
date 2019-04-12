import {
  assert,
} from 'chai'

import { before } from 'mocha'

import {
  suite,
  test,
  skip,
} from 'mocha-typescript'

import { OpenSeaPort } from '../src/index'
import * as Web3 from 'web3'
import { Network, OrderJSON, OrderSide, Order, SaleKind, UnhashedOrder, UnsignedOrder, Asset, OpenSeaAssetContract, WyvernSchemaName } from '../src/types'
import { orderFromJSON, getOrderHash, orderToJSON, MAX_UINT_256, getCurrentGasPrice, estimateCurrentPrice, assignOrdersToSides, NULL_ADDRESS, DEFAULT_SELLER_FEE_BASIS_POINTS, OPENSEA_SELLER_BOUNTY_BASIS_POINTS, DEFAULT_BUYER_FEE_BASIS_POINTS, DEFAULT_MAX_BOUNTY, makeBigNumber, OPENSEA_FEE_RECIPIENT } from '../src/utils'
import ordersJSONFixture = require('./fixtures/orders.json')
import { BigNumber } from 'bignumber.js'
import { ALEX_ADDRESS, CRYPTO_CRYSTAL_ADDRESS, DIGITAL_ART_CHAIN_ADDRESS, DIGITAL_ART_CHAIN_TOKEN_ID, MYTHEREUM_TOKEN_ID, MYTHEREUM_ADDRESS, GODS_UNCHAINED_ADDRESS, CK_ADDRESS, DEVIN_ADDRESS, ALEX_ADDRESS_2, GODS_UNCHAINED_TOKEN_ID, CK_TOKEN_ID, MAINNET_API_KEY, RINKEBY_API_KEY, CK_RINKEBY_ADDRESS, CK_RINKEBY_TOKEN_ID, ENJIN_COIN_ADDRESS, ENJIN_ADDRESS, CATS_IN_MECHS_ID } from './constants'

const ordersJSON = ordersJSONFixture as any
const englishSellOrderJSON = ordersJSON[0] as OrderJSON

const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')
const rinkebyProvider = new Web3.providers.HttpProvider('https://rinkeby.infura.io')

const client = new OpenSeaPort(provider, {
  networkName: Network.Main,
  apiKey: MAINNET_API_KEY
}, line => console.info(`MAINNET: ${line}`))

const rinkebyClient = new OpenSeaPort(rinkebyProvider, {
  networkName: Network.Rinkeby,
  apiKey: RINKEBY_API_KEY
}, line => console.info(`RINKEBY: ${line}`))

const assetsForBundleOrder = [
  { tokenId: MYTHEREUM_TOKEN_ID.toString(), tokenAddress: MYTHEREUM_ADDRESS },
  { tokenId: DIGITAL_ART_CHAIN_TOKEN_ID.toString(), tokenAddress: DIGITAL_ART_CHAIN_ADDRESS },
]

const assetsForBulkTransfer = assetsForBundleOrder

let wethAddress: string
let manaAddress: string

suite('seaport', () => {

  before(async () => {
    wethAddress = (await client.getFungibleTokens({ symbol: 'WETH'}))[0].address
    manaAddress = (await client.getFungibleTokens({ symbol: 'MANA'}))[0].address
  })

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

  test('Includes API key in token request', async () => {
    const oldLogger = client.api.logger

    return new Promise((resolve, reject) => {

      client.api.logger = log => {
        try {
          assert.include(log, `"X-API-KEY":"${MAINNET_API_KEY}"`)
          resolve()
        } catch (e) {
          reject(e)
        } finally {
          client.api.logger = oldLogger
        }
      }
      client.api.getTokens({ symbol: "MANA" })
    })
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

  test("Correctly errors for invalid price parameters", async () => {
    const accountAddress = ALEX_ADDRESS
    const expirationTime = (Date.now() / 1000 + 60) // one minute from now
    const paymentTokenAddress = manaAddress
    const tokenId = MYTHEREUM_TOKEN_ID.toString()
    const tokenAddress = MYTHEREUM_ADDRESS

    try {
      await client._makeSellOrder({
        asset: { tokenAddress, tokenId },
        accountAddress,
        startAmount: 2,
        extraBountyBasisPoints: 0,
        buyerAddress: NULL_ADDRESS,
        expirationTime: 0,
        paymentTokenAddress,
        waitForHighestBid: true,
        schemaName: WyvernSchemaName.ERC721
      })
      assert.fail()
    } catch (error) {
      assert.include(error.message, 'English auctions must have an expiration time')
    }

    try {
      await client._makeSellOrder({
        asset: { tokenAddress, tokenId },
        accountAddress,
        startAmount: 2,
        endAmount: 1, // Allow declining minimum bid
        extraBountyBasisPoints: 0,
        buyerAddress: NULL_ADDRESS,
        expirationTime,
        paymentTokenAddress: NULL_ADDRESS,
        waitForHighestBid: true,
        schemaName: WyvernSchemaName.ERC721
      })
      assert.fail()
    } catch (error) {
      assert.include(error.message, 'English auctions must use wrapped ETH')
    }

    try {
      await client._makeSellOrder({
        asset: { tokenAddress, tokenId },
        accountAddress,
        startAmount: 2,
        endAmount: 3,
        extraBountyBasisPoints: 0,
        buyerAddress: NULL_ADDRESS,
        expirationTime,
        paymentTokenAddress: NULL_ADDRESS,
        waitForHighestBid: false,
        schemaName: WyvernSchemaName.ERC721
      })
      assert.fail()
    } catch (error) {
      assert.include(error.message, 'End price must be less than or equal to the start price')
    }

    try {
      await client._makeSellOrder({
        asset: { tokenAddress, tokenId },
        accountAddress,
        startAmount: 2,
        endAmount: 1,
        extraBountyBasisPoints: 0,
        buyerAddress: NULL_ADDRESS,
        expirationTime: 0,
        paymentTokenAddress: NULL_ADDRESS,
        waitForHighestBid: false,
        schemaName: WyvernSchemaName.ERC721
      })
      assert.fail()
    } catch (error) {
      assert.include(error.message, 'Expiration time must be set if order will change in price')
    }
  })

  test('Matches heterogenous bundle buy order', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const amountInEth = 0.01

    const order = await client._makeBundleBuyOrder({
      assets: assetsForBundleOrder,
      accountAddress,
      startAmount: amountInEth,
      extraBountyBasisPoints: 0,
      expirationTime: 0,
      paymentTokenAddress: wethAddress,
      schemaName: WyvernSchemaName.ERC721
    })

    assert.equal(order.paymentToken, wethAddress)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth)
    assert.equal(order.extra.toNumber(), 0)
    assert.equal(order.expirationTime.toNumber(), 0)
    testFeesMakerOrder(order, undefined)

    await client._validateBuyOrderParameters({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Matches homogenous bundle buy order', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const amountInToken = 10

    const order = await client._makeBundleBuyOrder({
      assets: [{ tokenId: MYTHEREUM_TOKEN_ID.toString(), tokenAddress: MYTHEREUM_ADDRESS }],
      accountAddress,
      startAmount: amountInToken,
      extraBountyBasisPoints: 0,
      expirationTime: 0,
      paymentTokenAddress: manaAddress,
      schemaName: WyvernSchemaName.ERC721
    })

    const asset = await client.api.getAsset(MYTHEREUM_ADDRESS, MYTHEREUM_TOKEN_ID.toString())
    assert.isNotNull(asset)
    if (!asset) {
      return
    }

    assert.equal(order.paymentToken, manaAddress)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken)
    assert.equal(order.extra.toNumber(), 0)
    assert.equal(order.expirationTime.toNumber(), 0)
    testFeesMakerOrder(order, asset.assetContract)

    await client._validateBuyOrderParameters({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Cannot yet match a new English auction sell order, bountied', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS_2
    const amountInToken = 1.2
    const paymentTokenAddress = (await client.getFungibleTokens({ symbol: 'WETH'}))[0].address
    const expirationTime = (Date.now() / 1000 + 60) // one minute from now
    const bountyPercent = 1.1

    const tokenId = MYTHEREUM_TOKEN_ID.toString()
    const tokenAddress = MYTHEREUM_ADDRESS

    const asset = await client.api.getAsset(tokenAddress, tokenId)
    assert.isNotNull(asset)
    if (!asset) {
      return
    }

    const order = await client._makeSellOrder({
      asset: { tokenAddress, tokenId },
      accountAddress,
      startAmount: amountInToken,
      paymentTokenAddress,
      extraBountyBasisPoints: bountyPercent * 100,
      buyerAddress: NULL_ADDRESS,
      expirationTime,
      waitForHighestBid: true,
      schemaName: WyvernSchemaName.ERC721
    })

    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken)
    assert.equal(order.extra.toNumber(), 0)
    // Make sure there's gap time to expire it
    assert.isAbove(order.expirationTime.toNumber(), expirationTime)
    // Make sure it's listed in the future
    assert.equal(order.listingTime.toNumber(), expirationTime)

    await client._validateSellOrderParameters({ order, accountAddress })
    // Make sure match is impossible
    try {
      await testMatchingNewOrder(order, takerAddress, expirationTime + 100)
      assert.fail()
    } catch (error) {
      assert.include(error.message, "Unable to match offer with auction.")
    }
  })

  test.skip('Can match a finished English auction sell order', async () => {
    const makerAddress = ALEX_ADDRESS_2
    const takerAddress = ALEX_ADDRESS
    const matcherAddress = DEVIN_ADDRESS
    const now = Date.now() / 1000
    // Get bid from server
    const paymentTokenAddress = (await rinkebyClient.getFungibleTokens({ symbol: 'WETH'}))[0].address
    const { orders } = await rinkebyClient.api.getOrders({
      side: OrderSide.Buy,
      asset_contract_address: CK_RINKEBY_ADDRESS,
      token_id: CK_RINKEBY_TOKEN_ID,
      payment_token_address: paymentTokenAddress,
      maker: makerAddress
    })
    const buy = orders[0]
    assert.isDefined(buy)
    assert.isDefined(buy.asset)
    if (!buy || !buy.asset) {
      return
    }
    // Make sure it's listed in the past
    assert.isBelow(buy.listingTime.toNumber(), now)
    testFeesMakerOrder(buy, buy.asset.assetContract)

    const sell = orderFromJSON(englishSellOrderJSON)
    assert.equal(sell.feeRecipient, NULL_ADDRESS)
    assert.equal(sell.paymentToken, paymentTokenAddress)

    /* Requirements in Wyvern contract for funds transfer. */
    assert.isAtMost(buy.takerRelayerFee.toNumber(), sell.takerRelayerFee.toNumber())
    assert.isAtMost(buy.takerProtocolFee.toNumber(), sell.takerProtocolFee.toNumber())
    const sellPrice = await rinkebyClient.getCurrentPrice(sell)
    const buyPrice = await rinkebyClient.getCurrentPrice(buy)
    assert.isAtLeast(buyPrice.toNumber(), sellPrice.toNumber())
    console.info(`Matching two orders that differ in price by ${buyPrice.toNumber() - sellPrice.toNumber()}`)

    await rinkebyClient._validateBuyOrderParameters({ order: buy, accountAddress: makerAddress })
    await rinkebyClient._validateSellOrderParameters({ order: sell, accountAddress: takerAddress })

    const gas = await rinkebyClient._estimateGasForMatch({ buy, sell, accountAddress: matcherAddress })
    assert.isAbove(gas, 0)
    console.info(`Match gas cost: ${gas}`)
  })

  test('Ensures buy order compatibility with an English sell order', async () => {
    const accountAddress = ALEX_ADDRESS_2
    const takerAddress = ALEX_ADDRESS
    const paymentTokenAddress = (await client.getFungibleTokens({ symbol: 'WETH'}))[0].address
    const amountInToken = 0.01
    const expirationTime = (Date.now() / 1000 + 60 * 60 * 24) // one day from now
    const extraBountyBasisPoints = 1.1 * 100

    const tokenId = MYTHEREUM_TOKEN_ID.toString()
    const tokenAddress = MYTHEREUM_ADDRESS

    const asset = await client.api.getAsset(tokenAddress, tokenId)
    assert.isNotNull(asset)
    if (!asset) {
      return
    }

    const sellOrder = await client._makeSellOrder({
      asset: { tokenAddress, tokenId },
      accountAddress: takerAddress,
      startAmount: amountInToken,
      paymentTokenAddress,
      expirationTime,
      extraBountyBasisPoints,
      buyerAddress: NULL_ADDRESS,
      waitForHighestBid: true,
      schemaName: WyvernSchemaName.ERC721
    })

    const buyOrder = await client._makeBuyOrder({
      asset: { tokenAddress, tokenId },
      accountAddress,
      paymentTokenAddress,
      startAmount: amountInToken,
      expirationTime: 0,
      extraBountyBasisPoints: 0,
      sellOrder,
      schemaName: WyvernSchemaName.ERC721
    })

    testFeesMakerOrder(buyOrder, asset.assetContract)
    assert.equal(buyOrder.makerRelayerFee.toNumber(), sellOrder.makerRelayerFee.toNumber())
    assert.equal(buyOrder.takerRelayerFee.toNumber(), sellOrder.takerRelayerFee.toNumber())
    assert.equal(buyOrder.makerProtocolFee.toNumber(), sellOrder.makerProtocolFee.toNumber())
    assert.equal(buyOrder.takerProtocolFee.toNumber(), sellOrder.takerProtocolFee.toNumber())

    await client._validateBuyOrderParameters({ order: buyOrder, accountAddress })
    await client._validateSellOrderParameters({ order: sellOrder, accountAddress: takerAddress })
  })

  test("Computes fees correctly for non-zero-fee asset", async () => {
    const tokenId = MYTHEREUM_TOKEN_ID.toString()
    const tokenAddress = MYTHEREUM_ADDRESS
    const bountyPercent = 1.5
    const extraBountyBasisPoints = bountyPercent * 100

    const asset = await client.api.getAsset(tokenAddress, tokenId)
    assert.isNotNull(asset)
    if (!asset) {
      return
    }

    const contract = asset.assetContract

    const buyerFees = await client.computeFees({
      assets: [{ tokenAddress, tokenId }],
      extraBountyBasisPoints,
      side: OrderSide.Buy
    })
    assert.equal(buyerFees.totalBuyerFeeBPS, contract.buyerFeeBasisPoints)
    assert.equal(buyerFees.totalSellerFeeBPS, contract.sellerFeeBasisPoints)
    assert.equal(buyerFees.devBuyerFeeBPS, contract.devBuyerFeeBasisPoints)
    assert.equal(buyerFees.devSellerFeeBPS, contract.devSellerFeeBasisPoints)
    assert.equal(buyerFees.openseaBuyerFeeBPS, contract.openseaBuyerFeeBasisPoints)
    assert.equal(buyerFees.openseaSellerFeeBPS, contract.openseaSellerFeeBasisPoints)
    assert.equal(buyerFees.sellerBountyBPS, 0)

    const sellerFees = await client.computeFees({
      assetContract: asset.assetContract, // alternate fee param
      extraBountyBasisPoints,
      side: OrderSide.Sell
    })
    assert.equal(sellerFees.totalBuyerFeeBPS, contract.buyerFeeBasisPoints)
    assert.equal(sellerFees.totalSellerFeeBPS, contract.sellerFeeBasisPoints)
    assert.equal(sellerFees.devBuyerFeeBPS, contract.devBuyerFeeBasisPoints)
    assert.equal(sellerFees.devSellerFeeBPS, contract.devSellerFeeBasisPoints)
    assert.equal(sellerFees.openseaBuyerFeeBPS, contract.openseaBuyerFeeBasisPoints)
    assert.equal(sellerFees.openseaSellerFeeBPS, contract.openseaSellerFeeBasisPoints)
    assert.equal(sellerFees.sellerBountyBPS, extraBountyBasisPoints)

    const heterogenousBundleSellerFees = await client.computeFees({
      assets: [],
      extraBountyBasisPoints,
      side: OrderSide.Sell
    })
    assert.equal(heterogenousBundleSellerFees.totalBuyerFeeBPS, DEFAULT_BUYER_FEE_BASIS_POINTS)
    assert.equal(heterogenousBundleSellerFees.totalSellerFeeBPS, DEFAULT_SELLER_FEE_BASIS_POINTS)
    assert.equal(heterogenousBundleSellerFees.devBuyerFeeBPS, 0)
    assert.equal(heterogenousBundleSellerFees.devSellerFeeBPS, 0)
    assert.equal(heterogenousBundleSellerFees.openseaBuyerFeeBPS, DEFAULT_BUYER_FEE_BASIS_POINTS)
    assert.equal(heterogenousBundleSellerFees.openseaSellerFeeBPS, DEFAULT_SELLER_FEE_BASIS_POINTS)
    assert.equal(heterogenousBundleSellerFees.sellerBountyBPS, extraBountyBasisPoints)

    const privateSellerFees = await client.computeFees({
      assets: [{ tokenAddress, tokenId }],
      extraBountyBasisPoints,
      side: OrderSide.Sell,
      isPrivate: true
    })
    assert.equal(privateSellerFees.totalBuyerFeeBPS, 0)
    assert.equal(privateSellerFees.totalSellerFeeBPS, 0)
    assert.equal(privateSellerFees.devBuyerFeeBPS, 0)
    assert.equal(privateSellerFees.devSellerFeeBPS, 0)
    assert.equal(privateSellerFees.openseaBuyerFeeBPS, 0)
    assert.equal(privateSellerFees.openseaSellerFeeBPS, 0)
    assert.equal(privateSellerFees.sellerBountyBPS, 0)

    const privateBuyerFees = await client.computeFees({
      assets: [{ tokenAddress, tokenId }],
      extraBountyBasisPoints,
      side: OrderSide.Buy,
      isPrivate: true
    })
    assert.equal(privateBuyerFees.totalBuyerFeeBPS, 0)
    assert.equal(privateBuyerFees.totalSellerFeeBPS, 0)
    assert.equal(privateBuyerFees.devBuyerFeeBPS, 0)
    assert.equal(privateBuyerFees.devSellerFeeBPS, 0)
    assert.equal(privateBuyerFees.openseaBuyerFeeBPS, 0)
    assert.equal(privateBuyerFees.openseaSellerFeeBPS, 0)
    assert.equal(privateBuyerFees.sellerBountyBPS, 0)
  })

  test("Computes fees correctly for zero-fee asset", async () => {
    const zeroFeeAsset = await client.api.getAsset(CK_ADDRESS, CK_TOKEN_ID.toString())
    assert.isNotNull(zeroFeeAsset)
    if (!zeroFeeAsset) {
      return
    }
    const bountyPercent = 0

    const contract = zeroFeeAsset.assetContract

    const buyerFees = await client.computeFees({
      assetContract: contract,
      extraBountyBasisPoints: bountyPercent * 100,
      side: OrderSide.Buy
    })
    assert.equal(buyerFees.totalBuyerFeeBPS, contract.buyerFeeBasisPoints)
    assert.equal(buyerFees.totalSellerFeeBPS, contract.sellerFeeBasisPoints)
    assert.equal(buyerFees.devBuyerFeeBPS, contract.devBuyerFeeBasisPoints)
    assert.equal(buyerFees.devSellerFeeBPS, contract.devSellerFeeBasisPoints)
    assert.equal(buyerFees.openseaBuyerFeeBPS, contract.openseaBuyerFeeBasisPoints)
    assert.equal(buyerFees.openseaSellerFeeBPS, contract.openseaSellerFeeBasisPoints)
    assert.equal(buyerFees.sellerBountyBPS, 0)

    const sellerFees = await client.computeFees({
      assetContract: contract,
      extraBountyBasisPoints: bountyPercent * 100,
      side: OrderSide.Sell
    })
    assert.equal(sellerFees.totalBuyerFeeBPS, contract.buyerFeeBasisPoints)
    assert.equal(sellerFees.totalSellerFeeBPS, contract.sellerFeeBasisPoints)
    assert.equal(sellerFees.devBuyerFeeBPS, contract.devBuyerFeeBasisPoints)
    assert.equal(sellerFees.devSellerFeeBPS, contract.devSellerFeeBasisPoints)
    assert.equal(sellerFees.openseaBuyerFeeBPS, contract.openseaBuyerFeeBasisPoints)
    assert.equal(sellerFees.openseaSellerFeeBPS, contract.openseaSellerFeeBasisPoints)
    assert.equal(sellerFees.sellerBountyBPS, bountyPercent * 100)

  })

  test("Errors for computing fees correctly", async () => {
    const tokenId = MYTHEREUM_TOKEN_ID.toString()
    const tokenAddress = MYTHEREUM_ADDRESS

    const asset = await client.api.getAsset(tokenAddress, tokenId)
    assert.isNotNull(asset)
    if (!asset) {
      return
    }

    const zeroFeeAsset = await client.api.getAsset(CK_ADDRESS, CK_TOKEN_ID.toString())
    assert.isNotNull(zeroFeeAsset)
    if (!zeroFeeAsset) {
      return
    }

    try {
      await client.computeFees({
        assets: [asset],
        extraBountyBasisPoints: 200,
        side: OrderSide.Sell
      })
      assert.fail()
    } catch (error) {
      if (!error.message.includes('bounty exceeds the maximum') ||
          !error.message.includes('OpenSea will add')) {
        assert.fail(error.message)
      }
    }

    try {
      await client.computeFees({
        assetContract: zeroFeeAsset.assetContract,
        extraBountyBasisPoints: 100,
        side: OrderSide.Sell
      })
      assert.fail()
    } catch (error) {
      if (!error.message.includes('bounty exceeds the maximum') ||
          error.message.includes('OpenSea will add')) {
        // OpenSea won't add a bounty for this type
        assert.fail(error.message)
      }
    }
  })

  test("Computes per-transfer fees correctly", async () => {

    const asset = await client.api.getAsset(ENJIN_ADDRESS, CATS_IN_MECHS_ID)
    assert.isNotNull(asset)
    if (!asset) {
      return
    }

    const zeroFeeAsset = await client.api.getAsset(CK_ADDRESS, CK_TOKEN_ID)
    assert.isNotNull(zeroFeeAsset)
    if (!zeroFeeAsset) {
      return
    }

    const sellerFees = await client.computeFees({
      assets: [asset],
      side: OrderSide.Sell
    })

    const sellerZeroFees = await client.computeFees({
      assets: [zeroFeeAsset],
      side: OrderSide.Sell
    })

    assert.equal(sellerZeroFees.transferFee.toString(), "0")
    assert.isNull(sellerZeroFees.transferFeeTokenAddress)

    // assert.notEqual(sellerFees.transferFee.toString(), "0")
    // assert.equal(sellerFees.transferFeeTokenAddress, ENJIN_COIN_ADDRESS)
  })

  test("Matches a private sell order, doesn't for wrong taker", async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS_2
    const amountInToken = 2
    const bountyPercent = 0

    const tokenId = MYTHEREUM_TOKEN_ID.toString()
    const tokenAddress = MYTHEREUM_ADDRESS

    const asset = await client.api.getAsset(tokenAddress, tokenId)
    assert.isNotNull(asset)
    if (!asset) {
      return
    }

    const order = await client._makeSellOrder({
      asset: { tokenAddress, tokenId },
      accountAddress,
      startAmount: amountInToken,
      extraBountyBasisPoints: bountyPercent * 100,
      buyerAddress: takerAddress,
      expirationTime: 0,
      paymentTokenAddress: NULL_ADDRESS,
      waitForHighestBid: false,
      schemaName: WyvernSchemaName.ERC721
    })

    assert.equal(order.paymentToken, NULL_ADDRESS)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken)
    assert.equal(order.extra.toNumber(), 0)
    assert.equal(order.expirationTime.toNumber(), 0)
    testFeesMakerOrder(order, asset.assetContract, bountyPercent * 100)

    await client._validateSellOrderParameters({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
    // Make sure no one else can take it
    try {
      await testMatchingNewOrder(order, DEVIN_ADDRESS)
    } catch (e) {
      // It works!
      return
    }
    assert.fail()
  })

  test('Matches a new bountied sell order for an ERC-20 token (MANA)', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS_2
    const paymentToken = (await client.getFungibleTokens({ symbol: 'MANA'}))[0]
    const amountInToken = 4000
    const bountyPercent = 1

    const tokenId = MYTHEREUM_TOKEN_ID.toString()
    const tokenAddress = MYTHEREUM_ADDRESS

    const asset = await client.api.getAsset(tokenAddress, tokenId)
    assert.isNotNull(asset)
    if (!asset) {
      return
    }

    const order = await client._makeSellOrder({
      asset: { tokenAddress, tokenId },
      accountAddress,
      startAmount: amountInToken,
      paymentTokenAddress: paymentToken.address,
      extraBountyBasisPoints: bountyPercent * 100,
      buyerAddress: NULL_ADDRESS, // Check that null doesn't trigger private orders
      expirationTime: 0,
      waitForHighestBid: false,
      schemaName: WyvernSchemaName.ERC721
    })

    assert.equal(order.paymentToken, paymentToken.address)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, paymentToken.decimals) * amountInToken)
    assert.equal(order.extra.toNumber(), 0)
    assert.equal(order.expirationTime.toNumber(), 0)
    testFeesMakerOrder(order, asset.assetContract, bountyPercent * 100)

    await client._validateSellOrderParameters({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Matches a buy order with an ERC-20 token (DAI)', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const paymentToken = (await client.getFungibleTokens({ symbol: 'DAI'}))[0]
    const amountInToken = 3

    const tokenId = CK_TOKEN_ID.toString()
    const tokenAddress = CK_ADDRESS

    const asset = await client.api.getAsset(tokenAddress, tokenId)
    assert.isNotNull(asset)
    if (!asset) {
      return
    }

    const order = await client._makeBuyOrder({
      asset: { tokenAddress, tokenId },
      accountAddress,
      startAmount: amountInToken,
      paymentTokenAddress: paymentToken.address,
      expirationTime: 0,
      extraBountyBasisPoints: 0,
      schemaName: WyvernSchemaName.ERC721
    })

    assert.equal(order.paymentToken, paymentToken.address)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, paymentToken.decimals) * amountInToken)
    assert.equal(order.extra.toNumber(), 0)
    assert.equal(order.expirationTime.toNumber(), 0)
    testFeesMakerOrder(order, asset.assetContract)

    await client._validateBuyOrderParameters({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Matches fixed heterogenous bountied bundle sell order', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const amountInEth = 1
    const bountyPercent = 1.5

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with different types of assets",
      assets: assetsForBundleOrder,
      accountAddress,
      startAmount: amountInEth,
      extraBountyBasisPoints: bountyPercent * 100,
      expirationTime: 0,
      paymentTokenAddress: NULL_ADDRESS,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS,
      schemaName: WyvernSchemaName.ERC721
    })

    assert.equal(order.paymentToken, NULL_ADDRESS)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth)
    assert.equal(order.extra.toNumber(), 0)
    assert.equal(order.expirationTime.toNumber(), 0)
    testFeesMakerOrder(order, undefined, bountyPercent * 100)

    await client._validateSellOrderParameters({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Matches homogenous, bountied bundle sell order', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const amountInEth = 1
    const bountyPercent = 0.8

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Homogenous Bundle",
      bundleDescription: "This is a test with one type of asset",
      assets: [{ tokenId: MYTHEREUM_TOKEN_ID.toString(), tokenAddress: MYTHEREUM_ADDRESS }],
      accountAddress,
      startAmount: amountInEth,
      extraBountyBasisPoints: bountyPercent * 100,
      expirationTime: 0,
      paymentTokenAddress: NULL_ADDRESS,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS,
      schemaName: WyvernSchemaName.ERC721
    })

    const asset = await client.api.getAsset(MYTHEREUM_ADDRESS, MYTHEREUM_TOKEN_ID.toString())
    assert.isNotNull(asset)
    if (!asset) {
      return
    }

    assert.equal(order.paymentToken, NULL_ADDRESS)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth)
    assert.equal(order.extra.toNumber(), 0)
    assert.equal(order.expirationTime.toNumber(), 0)
    testFeesMakerOrder(order, asset.assetContract, bountyPercent * 100)

    await client._validateSellOrderParameters({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('Serializes payment token and matches most recent ERC-20 sell order', async () => {
    const takerAddress = ALEX_ADDRESS

    const token = (await client.getFungibleTokens({ symbol: 'MANA'}))[0]

    const order = await client.api.getOrder({
      side: OrderSide.Sell,
      payment_token_address: token.address
    })

    assert.isNotNull(order)
    if (!order) {
      return
    }

    assert.isNotNull(order.paymentTokenContract)
    if (!order.paymentTokenContract) {
      return
    }
    assert.equal(order.paymentTokenContract.address, token.address)
    assert.equal(order.paymentToken, token.address)
    // TODO why can't we test atomicMatch?
    await testMatchingOrder(order, takerAddress, false)
  })

  test('Bulk transfer', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS_2

    const gas = await client._estimateGasForTransfer({
      assets: assetsForBulkTransfer,
      fromAddress: accountAddress,
      toAddress: takerAddress
    })

    assert.isAbove(gas, 0)
  })

  test('Fungible tokens filter', async () => {
    const manaTokens = (await client.getFungibleTokens({ symbol: "MANA" }))
    // API returns another version of MANA,
    // and one version is offline (in sdk)
    assert.equal(manaTokens.length, 2)
    const mana = manaTokens[0]
    assert.isNotNull(mana)
    assert.equal(mana.name, "Decentraland")
    assert.equal(mana.address, "0x0f5d2fb29fb7d3cfee444a200298f468908cc942")
    assert.equal(mana.decimals, 18)

    const dai = (await client.getFungibleTokens({ symbol: "DAI" }))[0]
    assert.isNotNull(dai)
    assert.equal(dai.name, "")

    const all = await client.getFungibleTokens()
    assert.isNotEmpty(all)
  })

  test('Asset locked in contract is not transferrable', async () => {
    const isTransferrable = await client.isAssetTransferrable({
      tokenId: GODS_UNCHAINED_TOKEN_ID.toString(),
      tokenAddress: GODS_UNCHAINED_ADDRESS,
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2,
      didOwnerApprove: true
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
      toAddress: ALEX_ADDRESS_2,
      didOwnerApprove: true
    })
    assert.isTrue(isTransferrable)
  })

  test('Matches a new bundle sell order for an ERC-20 token (MANA)', async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS
    const token = (await client.getFungibleTokens({ symbol: 'MANA'}))[0]
    const amountInToken = 2.422

    const order = await client._makeBundleSellOrder({
      bundleName: "Test Bundle",
      bundleDescription: "This is a test with different types of assets",
      assets: assetsForBundleOrder,
      accountAddress,
      startAmount: amountInToken,
      paymentTokenAddress: token.address,
      extraBountyBasisPoints: 0,
      expirationTime: 0,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS,
      schemaName: WyvernSchemaName.ERC721
    })

    assert.equal(order.paymentToken, token.address)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, token.decimals) * amountInToken)
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
      expirationTime,
      extraBountyBasisPoints: 0,
      waitForHighestBid: false,
      buyerAddress: NULL_ADDRESS,
      paymentTokenAddress: NULL_ADDRESS,
      schemaName: WyvernSchemaName.ERC721
    })

    assert.equal(order.paymentToken, NULL_ADDRESS)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth)
    assert.equal(order.extra.toNumber(), Math.pow(10, 18) * amountInEth)
    assert.equal(order.expirationTime.toNumber(), expirationTime)

    await client._validateSellOrderParameters({ order, accountAddress })
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress)
  })

  test('An API asset\'s order has correct hash', async () => {
    const asset = await client.api.getAsset(CK_ADDRESS, 1)
    assert.isNotNull(asset)
    if (!asset) {
      return
    }
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

  test('orderToJSON computes correct current price for Dutch auctions', async () => {
    const { orders } = await client.api.getOrders({ sale_kind: SaleKind.DutchAuction })
    assert.equal(orders.length, client.api.pageSize)
    orders.map(order => {
      assert.isNotNull(order.currentPrice)
      if (!order.currentPrice) {
        return
      }
      // Possible race condition
      assert.equal(order.currentPrice.toPrecision(3), estimateCurrentPrice(order).toPrecision(3))
      assert.isAtLeast(order.basePrice.toNumber(), order.currentPrice.toNumber())
    })
  })

  test('First page of orders have valid hashes and fees', async () => {
    const { orders, count } = await client.api.getOrders()
    assert.isNotEmpty(orders)
    assert.isAbove(count, orders.length)

    orders.forEach(order => {
      if (order.asset) {
        assert.isNotEmpty(order.asset.assetContract)
        assert.isNotEmpty(order.asset.tokenId)
        testFeesMakerOrder(order, order.asset.assetContract)
      }
      assert.isNotEmpty(order.paymentTokenContract)

      const accountAddress = ALEX_ADDRESS
      const matchingOrder = client._makeMatchingOrder({order, accountAddress})
      const matchingOrderHash = matchingOrder.hash
      delete matchingOrder.hash
      assert.isUndefined(matchingOrder.hash)

      const orderHash = getOrderHash(matchingOrder)
      assert.equal(orderHash, matchingOrderHash)
    })
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
    const balance = await client.getTokenBalance({ accountAddress })
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

  test('Matches a referred order via sell_orders and getAssets', async () => {
    const { assets } = await client.api.getAssets({asset_contract_address: CRYPTO_CRYSTAL_ADDRESS, order_by: "current_price", order_direction: "desc" })

    const asset = assets.filter(a => !!a.sellOrders)[0]
    assert.isNotNull(asset)
    if (!asset || !asset.sellOrders) {
      return
    }

    const order = asset.sellOrders[0]
    assert.isNotNull(order)
    if (!order) {
      return
    }
    // Make sure match is valid
    const takerAddress = ALEX_ADDRESS
    const referrerAddress = ALEX_ADDRESS_2
    await testMatchingOrder(order, takerAddress, true, referrerAddress)
  })
})

async function testMatchingOrder(order: Order, accountAddress: string, testAtomicMatch = false, referrerAddress?: string) {
  // TODO test mode for matching order to use 0x11111 in calldata
  const matchingOrder = client._makeMatchingOrder({order, accountAddress})
  assert.equal(matchingOrder.hash, getOrderHash(matchingOrder))

  const { buy, sell } = assignOrdersToSides(order, matchingOrder)

  if (!order.waitingForBestCounterOrder) {
    const isValid = await client._validateMatch({ buy, sell, accountAddress })
    assert.isTrue(isValid)
  } else {
    console.info(`English Auction detected, skipping validation`)
  }

  if (testAtomicMatch && !order.waitingForBestCounterOrder) {
    const isFulfillable = await client.isOrderFulfillable({ order, accountAddress, referrerAddress })
    assert.isTrue(isFulfillable)
    const gasPrice = await client._computeGasPrice()
    console.info(`Gas price to use: ${client.web3.fromWei(gasPrice, 'gwei')} gwei`)
  }
}

async function testMatchingNewOrder(unhashedOrder: UnhashedOrder, accountAddress: string, counterOrderListingTime?: number) {
  const order = {
    ...unhashedOrder,
    hash: getOrderHash(unhashedOrder)
  }

  const matchingOrder = client._makeMatchingOrder({ order, accountAddress })
  if (counterOrderListingTime != null) {
    matchingOrder.listingTime = makeBigNumber(counterOrderListingTime)
    matchingOrder.hash = getOrderHash(matchingOrder)
  }
  assert.equal(matchingOrder.hash, getOrderHash(matchingOrder))

  // Test fees
  assert.equal(matchingOrder.makerProtocolFee.toNumber(), 0)
  assert.equal(matchingOrder.takerProtocolFee.toNumber(), 0)
  if (order.waitingForBestCounterOrder) {
    assert.equal(matchingOrder.feeRecipient, OPENSEA_FEE_RECIPIENT)
  } else {
    assert.equal(matchingOrder.feeRecipient, NULL_ADDRESS)
  }
  assert.equal(matchingOrder.makerRelayerFee.toNumber(), order.makerRelayerFee.toNumber())
  assert.equal(matchingOrder.takerRelayerFee.toNumber(), order.takerRelayerFee.toNumber())
  assert.equal(matchingOrder.makerReferrerFee.toNumber(), order.makerReferrerFee.toNumber())

  const v = 27
  const r = ''
  const s = ''

  let buy: Order
  let sell: Order
  if (order.side == OrderSide.Buy) {
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
      toAddress: buy.maker,
      didOwnerApprove: true
    })
    assert.isTrue(isTransferrable)
  }))
}

function testFeesMakerOrder(order: Order | UnhashedOrder, assetContract?: OpenSeaAssetContract, makerBountyBPS?: number) {
  assert.equal(order.makerProtocolFee.toNumber(), 0)
  assert.equal(order.takerProtocolFee.toNumber(), 0)
  if (order.waitingForBestCounterOrder) {
    assert.equal(order.feeRecipient, NULL_ADDRESS)
  } else {
    assert.equal(order.feeRecipient, OPENSEA_FEE_RECIPIENT)
  }
  if (order.taker != NULL_ADDRESS) {
    // Private order
    assert.equal(order.makerReferrerFee.toNumber(), 0)
    assert.equal(order.takerRelayerFee.toNumber(), 0)
    assert.equal(order.makerRelayerFee.toNumber(), 0)
    return
  }
  // Public order
  if (makerBountyBPS != null) {
    assert.equal(order.makerReferrerFee.toNumber(), makerBountyBPS)
  }
  if (assetContract) {
    // Homogenous sale
    if (order.side == OrderSide.Sell && order.waitingForBestCounterOrder) {
      // Fees may not match the contract's fees, which are changeable.
    } else if (order.side == OrderSide.Sell) {

      assert.equal(order.makerRelayerFee.toNumber(), assetContract.sellerFeeBasisPoints)
      assert.equal(order.takerRelayerFee.toNumber(), assetContract.buyerFeeBasisPoints)

      assert.equal(order.makerRelayerFee.toNumber(), assetContract.devSellerFeeBasisPoints + assetContract.openseaSellerFeeBasisPoints)
      // Check bounty
      if (assetContract.openseaSellerFeeBasisPoints >= OPENSEA_SELLER_BOUNTY_BASIS_POINTS) {
        assert.isAtMost(OPENSEA_SELLER_BOUNTY_BASIS_POINTS + order.makerReferrerFee.toNumber(), assetContract.openseaSellerFeeBasisPoints)
      } else {
        // No extra bounty allowed if < 1%
        assert.equal(order.makerReferrerFee.toNumber(), 0)
      }
    } else {

      assert.equal(order.makerRelayerFee.toNumber(), assetContract.buyerFeeBasisPoints)
      assert.equal(order.takerRelayerFee.toNumber(), assetContract.sellerFeeBasisPoints)

      assert.equal(order.makerRelayerFee.toNumber(), assetContract.devBuyerFeeBasisPoints + assetContract.openseaBuyerFeeBasisPoints)
    }
  } else {
    // Heterogenous
    if (order.side == OrderSide.Sell) {
      assert.equal(order.makerRelayerFee.toNumber(), DEFAULT_SELLER_FEE_BASIS_POINTS)
      assert.equal(order.takerRelayerFee.toNumber(), DEFAULT_BUYER_FEE_BASIS_POINTS)
      assert.isAtMost(OPENSEA_SELLER_BOUNTY_BASIS_POINTS + order.makerReferrerFee.toNumber(), DEFAULT_MAX_BOUNTY)
    } else {
      assert.equal(order.makerRelayerFee.toNumber(), DEFAULT_BUYER_FEE_BASIS_POINTS)
      assert.equal(order.takerRelayerFee.toNumber(), DEFAULT_SELLER_FEE_BASIS_POINTS)
    }
  }
}

function getAssets(
    order: Order | UnsignedOrder | UnhashedOrder
  ): Asset[] {

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
