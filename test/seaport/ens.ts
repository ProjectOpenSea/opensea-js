import {
  assert,
} from 'chai'

import { before } from 'mocha'

import {
  suite,
  test,
} from 'mocha-typescript'

import { OpenSeaPort, orderToJSON } from '../../src/index'
import { Network, Order, WyvernSchemaName, OpenSeaAsset } from '../../src/types'
import { RINKEBY_API_KEY } from '../constants'
import { MnemonicWalletSubprovider } from '@0x/subproviders'
import * as _ from 'lodash'
import * as RPCSubprovider from 'web3-provider-engine/subproviders/rpc'
import * as Web3ProviderEngine from 'web3-provider-engine'

const MNEMONIC = process.env.MNEMONIC || ""
const ADDRESS = process.env.ADDRESS || ""
const BASE_DERIVATION_PATH = `44'/60'/0'/0`

const mnemonicWalletSubprovider = new MnemonicWalletSubprovider({ mnemonic: MNEMONIC, baseDerivationPath: BASE_DERIVATION_PATH})
const infuraRpcSubprovider = new RPCSubprovider({
  rpcUrl: 'https://rinkeby.infura.io/'
})

const providerEngine = new Web3ProviderEngine()
providerEngine.addProvider(mnemonicWalletSubprovider)
providerEngine.addProvider(infuraRpcSubprovider)
providerEngine.start()

const rinkebyClient = new OpenSeaPort(providerEngine, {
  networkName: Network.Rinkeby,
  apiKey: RINKEBY_API_KEY
}, line => console.info(`RINKEBY: ${line}`))

const ENS_ADDRESS = "0x53ceb15b76023fbec5bb39450214926f6aa77d2e"
const NAMES = [ "123.eth" ]
// , "1234.eth", "12345.eth", "123456.eth" ]

let wethAddress: string
let manaAddress: string
let accountAddress: string
let auctions: Order[] = []
let startAmount: number

suite.only('seaport: ENS names', () => {

  before(async () => {
    if (!MNEMONIC || !ADDRESS) {
      console.warn("Skipping ENS suite due to no mnemonic or address set.")
      this.skip()
    }
    const now =  new Date().getTime() / 1000
    accountAddress = ADDRESS
    wethAddress = (await rinkebyClient.api.getPaymentTokens({ symbol: 'WETH'})).tokens[0].address
    manaAddress = (await rinkebyClient.api.getPaymentTokens({ symbol: 'MANA'})).tokens[0].address

    // Iterate through NAMES to find auctions
    for (const name of NAMES) {
      const res = await rinkebyClient.api.get(`/api/v1/misc/ens_short_name_asset/${name}/`)
      const data = await res.json()
      const tokenId = data.data.asset.token_id
      const asset = await rinkebyClient.api.getAsset(ENS_ADDRESS, tokenId)
      if (!asset.sellOrders || !asset.sellOrders.length) {
        continue
      }

      const sellOrder = asset.sellOrders[0]
      assert.isAbove(+sellOrder.listingTime, now)
      sellOrder.asset = asset
      auctions.push(sellOrder)
    }

    // Make sure auctions exist
    assert.isNotEmpty(auctions)
    if (!auctions.length) {
      return
    }

    auctions = _.orderBy(auctions, a => a.currentPrice && +a.currentPrice)

    const auction = auctions[0]
    assert.isNotNull(auction.currentPrice)
    if (!auction.currentPrice) {
      return
    }
    startAmount = +auction.currentPrice.dividedBy(1e18)
    console.warn(`Bid amount is ${startAmount}`)
    console.warn(`Current time is ${now}`)
    console.warn(`Payment token is ${wethAddress}`)
  })

  test.skip("Auctions should accept new bids via the SDK", async () => {
    const auction = auctions[0]
    const asset = auction.asset as OpenSeaAsset
    await rinkebyClient.createBuyOrder({
      asset,
      accountAddress,
      startAmount,
      sellOrder: auction
    })

    // Same price is allowed, but using schemaName if no sellOrder set
    await rinkebyClient.createBuyOrder({
      asset,
      accountAddress,
      startAmount,
      schemaName: WyvernSchemaName.ENSShortNameAuction
    })
  })

  test("Auctions should NOT get erc721 bids", async () => {
    const auction = auctions[0]
    const asset = auction.asset as OpenSeaAsset
    try {
      await rinkebyClient.createBuyOrder({
        asset: {
          tokenId: asset.tokenId,
          tokenAddress: asset.tokenAddress
        },
        accountAddress,
        startAmount
      })
      assert.fail()
    } catch (error) {
      console.error(error)
    }
  })

  test("Auctions should NOT allow bids with wrong target", async () => {
    const auction = auctions[0]
    const asset = auction.asset as OpenSeaAsset
    try {
      const order = await rinkebyClient._makeBuyOrder({
        asset,
        quantity: 1,
        accountAddress,
        startAmount,
        expirationTime: 0,
        paymentTokenAddress: wethAddress,
        extraBountyBasisPoints: 0,
        schemaName: WyvernSchemaName.ENSShortNameAuction
      })
      order.target = ENS_ADDRESS
      const orderWithSignature = await rinkebyClient._hashAndSignOrder(order)
      await rinkebyClient.api.postOrder(orderToJSON(orderWithSignature))
      assert.fail()
    } catch (error) {
      console.error(error)
    }
  })

  test("Auctions should NOT allow bids with wrong calldata", async () => {
    const auction = auctions[0]
    const asset = auction.asset as OpenSeaAsset
    try {
      const order = await rinkebyClient._makeBuyOrder({
        asset,
        quantity: 1,
        accountAddress,
        startAmount,
        expirationTime: 0,
        paymentTokenAddress: wethAddress,
        extraBountyBasisPoints: 0,
        schemaName: WyvernSchemaName.ENSShortNameAuction
      })
      order.calldata += "0"
      const orderWithSignature = await rinkebyClient._hashAndSignOrder(order)
      await rinkebyClient.api.postOrder(orderToJSON(orderWithSignature))
      assert.fail()
    } catch (error) {
      console.error(error)
    }
  })

  test("Auctions should NOT allow bids with wrong payment token", async () => {
    const auction = auctions[0]
    const asset = auction.asset as OpenSeaAsset
    try {
      await rinkebyClient.createBuyOrder({
        asset: {
          tokenId: asset.tokenId,
          tokenAddress: asset.tokenAddress
        },
        accountAddress,
        startAmount,
        paymentTokenAddress: manaAddress
      })
      assert.fail()
    } catch (error) {
      console.error(error)
    }
  })

  test("Auctions should NOT allow bids with below min-bid prices", async () => {
    const auction = auctions[0]
    const asset = auction.asset as OpenSeaAsset
    try {
      await rinkebyClient.createBuyOrder({
        asset: {
          tokenId: asset.tokenId,
          tokenAddress: asset.tokenAddress
        },
        accountAddress,
        startAmount: 0.01
      })
      assert.fail()
    } catch (error) {
      console.error(error)
    }
  })

  test("Auctions should NOT allow bids with below min-increment prices", async () => {
    const auction = auctions[0]
    const asset = auction.asset as OpenSeaAsset
    try {
      await rinkebyClient.createBuyOrder({
        asset: {
          tokenId: asset.tokenId,
          tokenAddress: asset.tokenAddress
        },
        accountAddress,
        startAmount: startAmount + 0.0001
      })
      assert.fail()
    } catch (error) {
      console.error(error)
    }
  })
})
