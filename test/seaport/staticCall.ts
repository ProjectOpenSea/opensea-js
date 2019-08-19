import * as WyvernSchemas from 'wyvern-schemas'
import {
  assert,
} from 'chai'

import { before } from 'mocha'

import {
  suite,
  test,
} from 'mocha-typescript'

import { OpenSeaPort } from '../../src/index'
import * as Web3 from 'web3'
import { Network, WyvernSchemaName } from '../../src/types'
import { NULL_ADDRESS, STATIC_CALL_TX_ORIGIN_ADDRESS } from '../../src/utils'
import { ALEX_ADDRESS, MYTHEREUM_TOKEN_ID, MYTHEREUM_ADDRESS, DEVIN_ADDRESS, ALEX_ADDRESS_2, MAINNET_API_KEY, RINKEBY_API_KEY } from '../constants'
import { testFeesMakerOrder } from './fees'
import { getMethod, StaticCheckTxOrigin } from '../../src/contracts'
import { testMatchingNewOrder } from './orders'

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

suite.only('seaport: static calls', () => {

  test("Mainnet StaticCall Tx.Origin", async () => {
    const accountAddress = ALEX_ADDRESS
    const takerAddress = ALEX_ADDRESS_2
    const amountInToken = 2
    const bountyPercent = 0

    const tokenId = MYTHEREUM_TOKEN_ID.toString()
    const tokenAddress = MYTHEREUM_ADDRESS

    const asset = await client.api.getAsset(tokenAddress, tokenId)

    const order = await client._makeSellOrder({
      asset: { tokenAddress, tokenId },
      accountAddress,
      quantity: 1,
      startAmount: amountInToken,
      extraBountyBasisPoints: bountyPercent * 100,
      buyerAddress: NULL_ADDRESS,
      expirationTime: 0,
      paymentTokenAddress: NULL_ADDRESS,
      waitForHighestBid: false,
      schemaName: WyvernSchemaName.ERC721
    })

    order.staticTarget = STATIC_CALL_TX_ORIGIN_ADDRESS
    order.staticExtradata = WyvernSchemas.encodeCall(getMethod(StaticCheckTxOrigin, 'succeedIfTxOriginMatchesSpecifiedAddress'), [takerAddress])

    assert.equal(order.paymentToken, NULL_ADDRESS)
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken)
    assert.equal(order.extra.toNumber(), 0)
    assert.equal(order.expirationTime.toNumber(), 0)
    testFeesMakerOrder(order, asset.assetContract, bountyPercent * 100)

    await client._sellOrderValidationAndApprovals({ order, accountAddress })
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

  test("Mainnet StaticCall Decentraland", async () => {
    // Mainnet Decentraland
    const accountAddress = '0xf293dfe0ac79c2536b9426957ac8898d6c743717' // Mainnet Decentraland Estate owner
    const takerAddress = ALEX_ADDRESS_2
    const amountInToken = 2
    const bountyPercent = 0

     // Mainnet Decentraland
    const tokenId = '2898' // Mainnet DecentralandEstate TokenID
    const tokenAddress = '0x959e104e1a4db6317fa58f8295f586e1a978c297' // Mainnet DecentralandEstates Contract

    const asset = await client.api.getAsset(tokenAddress, tokenId)

    const order = await client._makeSellOrder({
      asset: { tokenAddress, tokenId },
      accountAddress,
      quantity: 1,
      startAmount: amountInToken,
      extraBountyBasisPoints: bountyPercent * 100,
      buyerAddress: NULL_ADDRESS,
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

    await client._sellOrderValidationAndApprovals({ order, accountAddress })
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

  test("Testnet StaticCall CheezeWizards", async () => {
    // Testnet Cheezewizards
    const accountAddress = ALEX_ADDRESS // Testnet CheezeWizards token owner
    const takerAddress = ALEX_ADDRESS_2
    const amountInToken = 2
    const bountyPercent = 0

     // Testnet Cheezewizards
    const tokenId = '3' // Testnet CheezeWizards TokenID
    const tokenAddress = '0x095731b672b76b00A0b5cb9D8258CD3F6E976cB2' // Testnet CheezeWizards Guild address

    const asset = await rinkebyClient.api.getAsset(tokenAddress, tokenId)

    const order = await rinkebyClient._makeSellOrder({
      asset: { tokenAddress, tokenId },
      accountAddress,
      quantity: 1,
      startAmount: amountInToken,
      extraBountyBasisPoints: bountyPercent * 100,
      buyerAddress: NULL_ADDRESS,
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

    await rinkebyClient._sellOrderValidationAndApprovals({ order, accountAddress })
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
})
