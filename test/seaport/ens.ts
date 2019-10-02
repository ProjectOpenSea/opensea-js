import {
  assert,
} from 'chai'

import { before } from 'mocha'

import {
  suite,
  test,
} from 'mocha-typescript'

import { OpenSeaPort, orderToJSON } from '../../src/index'
import * as Web3 from 'web3'
import { Network, Order, WyvernSchemaName, OpenSeaAsset } from '../../src/types'
import { RINKEBY_API_KEY } from '../constants'
import { MnemonicWalletSubprovider } from '@0x/subproviders'
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
const NAMES = [ "123.eth", "1234.eth", "12345.eth", "123456.eth" ] // "111st.eth"

let wethAddress: string
let accountAddress: string
const tokenIdsForNames: string[] = []
const auctions: Order[] = []
let startAmount: number

suite.only('seaport: ENS names', () => {

  before(async () => {
    if (!MNEMONIC || !ADDRESS) {
      console.warn("Skipping ENS suite due to no mnemonic or address set.")
      this.skip()
    }
    accountAddress = ADDRESS
    wethAddress = (await rinkebyClient.api.getPaymentTokens({ symbol: 'WETH'})).tokens[0].address
    for (const name of NAMES) {
      const res = await rinkebyClient.api.get(`/api/v1/misc/ens_short_name_asset/${name}/`)
      const data = await res.json()
      tokenIdsForNames.push(data.data.asset.token_id)
    }
  })

  test("Short names should all exist and have some open auctions", async () => {
    const now =  new Date().getTime() / 1000
    console.warn(`Current time is ${now}`)
    for (const tokenId of tokenIdsForNames) {
      const asset = await rinkebyClient.api.getAsset(ENS_ADDRESS, tokenId)
      if (!asset.sellOrders || !asset.sellOrders.length) {
        continue
      }
      const sellOrder = asset.sellOrders[0]
      assert.isAbove(+sellOrder.listingTime, now)
      sellOrder.asset = asset
      auctions.push(sellOrder)
    }
    assert.isNotEmpty(auctions)
    const auction = auctions[0]
    if (!auction || !auction.currentPrice) {
      return
    }
    startAmount = +auction.currentPrice.dividedBy(1e18)
  })

  test("Auctions should accept new bids via the SDK", async () => {
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
      // pass
    }
  })

  test("Auctions should NOT get bids with wrong target", async () => {
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
      const orderWithSignature = await rinkebyClient._hashAndSignOrder(order)
      await rinkebyClient.api.postOrder(orderToJSON(orderWithSignature))
      assert.fail()
    } catch (error) {
      // pass
    }
  })
})
