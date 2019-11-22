import {
  assert,
} from 'chai'

import {
  suite,
  test,
} from 'mocha-typescript'

import { OpenSeaPort } from '../../src/index'
import * as Web3 from 'web3'
import { Network, OrderSide, OpenSeaAssetContract, UnhashedOrder, Order } from '../../src/types'
import { DEFAULT_SELLER_FEE_BASIS_POINTS,  DEFAULT_BUYER_FEE_BASIS_POINTS, getOrderHash, NULL_ADDRESS, OPENSEA_FEE_RECIPIENT, OPENSEA_SELLER_BOUNTY_BASIS_POINTS, DEFAULT_MAX_BOUNTY, ENJIN_ADDRESS, ENJIN_COIN_ADDRESS } from '../../src/utils'
import {
  MYTHEREUM_TOKEN_ID, MYTHEREUM_ADDRESS,
  CK_ADDRESS, CK_TOKEN_ID,
  MAINNET_API_KEY, ALEX_ADDRESS,
  CATS_IN_MECHS_ID,
  SPIRIT_CLASH_TOKEN_ID,
  SPIRIT_CLASH_OWNER
 } from '../constants'

const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')

const client = new OpenSeaPort(provider, {
  networkName: Network.Main,
  apiKey: MAINNET_API_KEY
}, line => console.info(`MAINNET: ${line}`))

suite('seaport: fees', () => {
  test("Computes fees correctly for non-zero-fee asset", async () => {
    const tokenId = MYTHEREUM_TOKEN_ID.toString()
    const tokenAddress = MYTHEREUM_ADDRESS
    const bountyPercent = 1.5
    const extraBountyBasisPoints = bountyPercent * 100

    const asset = await client.api.getAsset(tokenAddress, tokenId)

    const contract = asset.assetContract

    const buyerFees = await client.computeFees({
      asset,
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
      asset: null,
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
      asset: null,
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
      asset,
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
      asset,
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
    const asset = await client.api.getAsset(CK_ADDRESS, CK_TOKEN_ID.toString())
    const bountyPercent = 0

    const contract = asset.assetContract

    const buyerFees = await client.computeFees({
      asset: null,
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
      asset: null,
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

    try {
      await client.computeFees({
        asset,
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
  })

  test('First page of orders have valid hashes and fees', async () => {
    const { orders } = await client.api.getOrders()
    assert.isNotEmpty(orders)

    orders.forEach(order => {
      if (order.asset) {
        assert.isNotEmpty(order.asset.assetContract)
        assert.isNotEmpty(order.asset.tokenId)
        testFeesMakerOrder(order, order.asset.assetContract)
      }
      assert.isNotEmpty(order.paymentTokenContract)

      const accountAddress = ALEX_ADDRESS
      const matchingOrder = client._makeMatchingOrder({
        order,
        accountAddress,
        recipientAddress: accountAddress
      })
      const matchingOrderHash = matchingOrder.hash
      delete matchingOrder.hash
      assert.isUndefined(matchingOrder.hash)

      const orderHash = getOrderHash(matchingOrder)
      assert.equal(orderHash, matchingOrderHash)
    })
  })

  test("Computes per-transfer fees correctly, Enjin and CK", async () => {

    const asset = await client.api.getAsset(ENJIN_ADDRESS, CATS_IN_MECHS_ID)

    const zeroTransferFeeAsset = await client.api.getAsset(CK_ADDRESS, CK_TOKEN_ID)

    const sellerFees = await client.computeFees({
      asset,
      side: OrderSide.Sell
    })

    const sellerZeroFees = await client.computeFees({
      asset: zeroTransferFeeAsset,
      side: OrderSide.Sell
    })

    assert.equal(sellerZeroFees.transferFee.toString(), "0")
    assert.isNull(sellerZeroFees.transferFeeTokenAddress)

    assert.equal(sellerFees.transferFee.toString(), "1000000000000000000")
    assert.equal(sellerFees.transferFeeTokenAddress, ENJIN_COIN_ADDRESS)
  })

  // TODO the transfer fee isn't showing as whitelisted by Enjin's method
  test.skip("Computes whitelisted Enjin per-transfer fees correctly", async () => {

    const whitelistedAsset = await client.api.getAsset(ENJIN_ADDRESS, SPIRIT_CLASH_TOKEN_ID)

    const sellerZeroFees = await client.computeFees({
      asset: whitelistedAsset,
      side: OrderSide.Sell,
      accountAddress: SPIRIT_CLASH_OWNER
    })

    assert.equal(sellerZeroFees.transferFee.toString(), "0")
    assert.equal(sellerZeroFees.transferFeeTokenAddress, ENJIN_COIN_ADDRESS)
  })
})

export function testFeesMakerOrder(order: Order | UnhashedOrder, assetContract?: OpenSeaAssetContract, makerBountyBPS?: number) {
  assert.equal(order.makerProtocolFee.toNumber(), 0)
  assert.equal(order.takerProtocolFee.toNumber(), 0)
  if (order.waitingForBestCounterOrder) {
    assert.equal(order.feeRecipient, NULL_ADDRESS)
  } else {
    assert.equal(order.feeRecipient, OPENSEA_FEE_RECIPIENT)
  }
  if (order.taker != NULL_ADDRESS && order.side == OrderSide.Sell) {
    // Private sell order
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
