import {
  assert,
} from 'chai'

import { before } from 'mocha'

import {
  suite,
  test,
  skip,
} from 'mocha-typescript'

import { OpenSeaPort } from '../../src/index'
import * as Web3 from 'web3'
import { Network, OrderJSON, OrderSide, Order, SaleKind, UnhashedOrder, UnsignedOrder, Asset, OpenSeaAssetContract, WyvernSchemaName, WyvernNFTAsset, WyvernFTAsset } from '../../src/types'
import { orderFromJSON, getOrderHash, MAX_UINT_256, getCurrentGasPrice, estimateCurrentPrice, assignOrdersToSides, NULL_ADDRESS, DEFAULT_SELLER_FEE_BASIS_POINTS, OPENSEA_SELLER_BOUNTY_BASIS_POINTS, DEFAULT_BUYER_FEE_BASIS_POINTS, DEFAULT_MAX_BOUNTY, makeBigNumber, OPENSEA_FEE_RECIPIENT, ENJIN_COIN_ADDRESS, ENJIN_ADDRESS, INVERSE_BASIS_POINT, ENJIN_LEGACY_ADDRESS } from '../../src/utils'
import { BigNumber } from 'bignumber.js'
import { ALEX_ADDRESS, CRYPTO_CRYSTAL_ADDRESS, DIGITAL_ART_CHAIN_ADDRESS, DIGITAL_ART_CHAIN_TOKEN_ID, MYTHEREUM_TOKEN_ID, MYTHEREUM_ADDRESS, GODS_UNCHAINED_ADDRESS, CK_ADDRESS, DEVIN_ADDRESS, ALEX_ADDRESS_2, GODS_UNCHAINED_TOKEN_ID, CK_TOKEN_ID, MAINNET_API_KEY, RINKEBY_API_KEY, CK_RINKEBY_ADDRESS, CK_RINKEBY_TOKEN_ID, CATS_IN_MECHS_ID, CRYPTOFLOWERS_CONTRACT_ADDRESS_WITH_BUYER_FEE, RANDOM_ADDRESS, AGE_OF_RUST_TOKEN_ID, SANDBOX_RINKEBY_ID, SANDBOX_RINKEBY_ADDRESS, ENS_HELLO_NAME, ENS_HELLO_TOKEN_ID, ENS_RINKEBY_TOKEN_ADDRESS, ENS_RINKEBY_SHORT_NAME_OWNER } from '../constants'

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

suite('seaport: owners and transfers', () => {

  before(async () => {
    wethAddress = (await client.api.getPaymentTokens({ symbol: 'WETH'})).tokens[0].address
    manaAddress = (await client.api.getPaymentTokens({ symbol: 'MANA'})).tokens[0].address
  })

  test("On-chain ownership throws for invalid assets", async () => {
    const accountAddress = ALEX_ADDRESS
    const schemaName = WyvernSchemaName.ERC721
    const wyAssetRinkeby: WyvernNFTAsset = {
      id: CK_RINKEBY_TOKEN_ID.toString(),
      address: CK_RINKEBY_ADDRESS
    }
    try {
      // Use mainnet client with rinkeby asset
      const isOwner = await client._ownsAssetOnChain({ accountAddress, wyAsset: wyAssetRinkeby, schemaName })
      assert.fail()
    } catch (error) {
      assert.include(error.message, 'Unable to get current owner')
    }
  })

  test("On-chain ownership correctly pulled for ERC721s", async () => {
    const accountAddress = ALEX_ADDRESS
    const schemaName = WyvernSchemaName.ERC721

    // Ownership
    const wyAsset: WyvernNFTAsset = {
      id: MYTHEREUM_TOKEN_ID.toString(),
      address: MYTHEREUM_ADDRESS
    }
    const isOwner = await client._ownsAssetOnChain({ accountAddress, wyAsset, schemaName })
    assert.isTrue(isOwner)

    // Non-ownership
    const isOwner2 = await client._ownsAssetOnChain({ accountAddress: ALEX_ADDRESS_2, wyAsset, schemaName })
    assert.isFalse(isOwner2)
  })

  test("On-chain ownership correctly pulled for ERC20s", async () => {
    const accountAddress = ALEX_ADDRESS
    const schemaName = WyvernSchemaName.ERC20

    // Ownership
    const wyAsset: WyvernFTAsset = {
      address: ENJIN_COIN_ADDRESS,
      quantity: "1"
    }
    const isOwner = await client._ownsAssetOnChain({ accountAddress, wyAsset, schemaName })
    assert.isTrue(isOwner)

    // Not enough ownership
    const isOwner2 = await client._ownsAssetOnChain({ accountAddress, wyAsset: { ...wyAsset, quantity: MAX_UINT_256.toString() }, schemaName })
    assert.isFalse(isOwner2)

    // Non-ownership
    const isOwner3 = await client._ownsAssetOnChain({ accountAddress: RANDOM_ADDRESS, wyAsset, schemaName })
    assert.isFalse(isOwner3)
  })

  test("On-chain ownership correctly pulled for ERC1155s", async () => {
    const accountAddress = ALEX_ADDRESS
    const schemaName = WyvernSchemaName.ERC1155

    // Ownership of NFT
    const wyAssetNFT: WyvernNFTAsset = {
      id: CATS_IN_MECHS_ID,
      address: ENJIN_ADDRESS
    }
    const isOwner = await client._ownsAssetOnChain({ accountAddress, wyAsset: wyAssetNFT, schemaName })
    assert.isTrue(isOwner)

    // Non-ownership
    const isOwner2 = await client._ownsAssetOnChain({ accountAddress: RANDOM_ADDRESS, wyAsset: wyAssetNFT, schemaName })
    assert.isFalse(isOwner2)

    // Ownership of FT
    const wyAssetFT: WyvernFTAsset = {
      id: AGE_OF_RUST_TOKEN_ID,
      address: ENJIN_ADDRESS,
      quantity: "1"
    }
    const isOwner3 = await client._ownsAssetOnChain({ accountAddress, wyAsset: wyAssetFT, schemaName })
    assert.isTrue(isOwner3)

    // Not enough ownership
    const isOwner5 = await client._ownsAssetOnChain({ accountAddress, wyAsset: { ...wyAssetFT, quantity: MAX_UINT_256.toString() }, schemaName })
    assert.isFalse(isOwner5)

    // Non-ownership
    const isOwner4 = await client._ownsAssetOnChain({ accountAddress: RANDOM_ADDRESS, wyAsset: wyAssetFT, schemaName })
    assert.isFalse(isOwner4)
  })

  test('ERC-721v3 asset locked in contract is not transferrable', async () => {
    const isTransferrable = await client.isAssetTransferrable({
      asset: {
        tokenId: GODS_UNCHAINED_TOKEN_ID.toString(),
        tokenAddress: GODS_UNCHAINED_ADDRESS,
      },
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2
    })
    assert.isNotTrue(isTransferrable)
  })

  test('ERC-721 v3 asset not owned by fromAddress is not transferrable', async () => {
    const isTransferrable = await client.isAssetTransferrable({
      asset: {
        tokenId: "1",
        tokenAddress: DIGITAL_ART_CHAIN_ADDRESS,
      },
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2
    })
    assert.isNotTrue(isTransferrable)
  })

  test('ERC-721 v3 asset owned by fromAddress is transferrable', async () => {
    const isTransferrable = await client.isAssetTransferrable({
      asset: {
        tokenId: DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
        tokenAddress: DIGITAL_ART_CHAIN_ADDRESS,
      },
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2
    })
    assert.isTrue(isTransferrable)
  })

  test('ERC-721 v1 asset owned by fromAddress is transferrable', async () => {
    const isTransferrable = await client.isAssetTransferrable({
      asset: {
        tokenId: CK_TOKEN_ID.toString(),
        tokenAddress: CK_ADDRESS,
      },
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2,
      useProxy: true
    })
    assert.isTrue(isTransferrable)
  })

  test('ERC-20 asset not owned by fromAddress is not transferrable', async () => {
    const isTransferrable = await client.isAssetTransferrable({
      asset: {
        tokenId: null,
        tokenAddress: wethAddress,
      },
      fromAddress: RANDOM_ADDRESS,
      toAddress: ALEX_ADDRESS_2,
      schemaName: WyvernSchemaName.ERC20
    })
    assert.isNotTrue(isTransferrable)
  })

  test('ERC-20 asset owned by fromAddress is transferrable', async () => {
    const isTransferrable = await client.isAssetTransferrable({
      asset: {
        tokenId: null,
        tokenAddress: wethAddress
      },
      quantity: Math.pow(10, 18) * 0.001,
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2,
      schemaName: WyvernSchemaName.ERC20
    })
    assert.isTrue(isTransferrable)
  })

  test('ERC-1155 asset locked in contract is not transferrable', async () => {
    const isTransferrable2 = await client.isAssetTransferrable({
      asset: {
        tokenId: ENJIN_LEGACY_ADDRESS.toString(),
        tokenAddress: CATS_IN_MECHS_ID,
      },
      fromAddress: ALEX_ADDRESS,
      toAddress: ALEX_ADDRESS_2,
      schemaName: WyvernSchemaName.ERC1155
    })
    assert.isNotTrue(isTransferrable2)
  })

  test('ERC-1155 asset not owned by fromAddress is not transferrable', async () => {
    const isTransferrable = await client.isAssetTransferrable({
      asset: {
        tokenId: CATS_IN_MECHS_ID,
        tokenAddress: ENJIN_ADDRESS,
      },
      fromAddress: DEVIN_ADDRESS,
      toAddress: ALEX_ADDRESS_2,
      schemaName: WyvernSchemaName.ERC1155
    })
    assert.isNotTrue(isTransferrable)
  })

  test('Rinkeby ERC-1155 asset owned by fromAddress is transferrable', async () => {
    const isTransferrable = await rinkebyClient.isAssetTransferrable({
      asset: {
        tokenAddress: SANDBOX_RINKEBY_ADDRESS,
        tokenId: SANDBOX_RINKEBY_ID
      },
      fromAddress: "0x61c461ecc993aadeb7e4b47e96d1b8cc37314b20",
      toAddress: ALEX_ADDRESS,
      schemaName: WyvernSchemaName.ERC1155
    })
    assert.isTrue(isTransferrable)
  })

  test("Computes per-transfer fees correctly, Enjin and CK", async () => {

    const asset = await client.api.getAsset(ENJIN_ADDRESS, CATS_IN_MECHS_ID)

    const zeroTransferFeeAsset = await client.api.getAsset(CK_ADDRESS, CK_TOKEN_ID)

    const sellerFees = await client.computeFees({
      assets: [asset],
      side: OrderSide.Sell
    })

    const sellerZeroFees = await client.computeFees({
      assets: [zeroTransferFeeAsset],
      side: OrderSide.Sell
    })

    assert.equal(sellerZeroFees.transferFee.toString(), "0")
    assert.isNull(sellerZeroFees.transferFeeTokenAddress)

    assert.equal(sellerFees.transferFee.toString(), "1000000000000000000")
    assert.equal(sellerFees.transferFeeTokenAddress, ENJIN_COIN_ADDRESS)
  })
})
