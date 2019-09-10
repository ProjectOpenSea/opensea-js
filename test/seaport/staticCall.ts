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
import { OrderJSON, Network, UnhashedOrder, WyvernSchemaName } from '../../src/types'
import { orderFromJSON, getOrderHash, orderToJSON, NULL_ADDRESS, STATIC_CALL_TX_ORIGIN_ADDRESS, CK_RINKEBY_ADDRESS, STATIC_CALL_TX_ORIGIN_RINKEBY_ADDRESS } from '../../src/utils'
import { ALEX_ADDRESS, MYTHEREUM_TOKEN_ID, MYTHEREUM_ADDRESS, DEVIN_ADDRESS, ALEX_ADDRESS_2, MAINNET_API_KEY, RINKEBY_API_KEY, CK_RINKEBY_TOKEN_ID } from '../constants'
import { testFeesMakerOrder } from './fees'
import ordersJSONFixture = require('../fixtures/orders.json')
import { getMethod, StaticCheckTxOrigin } from '../../src/contracts'
import { testMatchingOrder, testMatchingNewOrder } from './orders'

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

suite('seaport: static calls', () => {

    test.skip("Rinkeby StaticCall Tx.Origin", async () => {
      const accountAddress = ALEX_ADDRESS
      const takerAddress = ALEX_ADDRESS_2
      const amountInToken = 2

      const order = orderFromJSON(englishSellOrderJSON)

      order.staticTarget = STATIC_CALL_TX_ORIGIN_ADDRESS
      order.staticExtradata = WyvernSchemas.encodeCall(getMethod(StaticCheckTxOrigin, 'succeedIfTxOriginMatchesSpecifiedAddress'), [takerAddress])
      //order.staticExtradata = WyvernSchemas.encodeCall(getMethod(StaticCheckTxOrigin, 'succeedIfTxOriginMatchesHardcodedAddress'), [])

      await rinkebyClient._sellOrderValidationAndApprovals({ order, accountAddress })
      // Make sure match is valid
      await testMatchingOrder(order, takerAddress, true, undefined, rinkebyClient);

      try {
        await testMatchingOrder(order, DEVIN_ADDRESS, true, undefined, rinkebyClient)
      } catch (e) {
        // It works!
        return
      }
      assert.fail()
    })
  /*
  test.skip("Mainnet StaticCall Decentraland", async () => {
    // Mainnet Decentraland Estate owner
    const accountAddress = '0xf293dfe0ac79c2536b9426957ac8898d6c743717'
    const takerAddress = ALEX_ADDRESS_2
    const amountInToken = 2
    const bountyPercent = 0

    // Mainnet DecentralandEstate TokenID
    const tokenId = '2898'
     // Mainnet DecentralandEstates Contract
    const tokenAddress = '0x959e104e1a4db6317fa58f8295f586e1a978c297'

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

  test.skip("Testnet StaticCall CheezeWizards", async () => {
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
    await testMatchingOrder(order, takerAddress)
    // Make sure no one else can take it

    // Screw with CheezeWizard fingerprint

    try {

      await testMatchingOrder(order, DEVIN_ADDRESS)
    } catch (e) {
      // It works!
      return
    }
    assert.fail()
  })
  */
})
