import {
  assert,
} from 'chai'

import {
  suite,
  test,
} from 'mocha-typescript'

import { OpenSeaPort } from '../../src/index'
import * as Web3 from 'web3'
import { Network } from '../../src/types'
import { MAX_UINT_256, getCurrentGasPrice, getNonCompliantApprovalAddress, CK_ADDRESS } from '../../src/utils'
import { ALEX_ADDRESS, MAINNET_API_KEY, CK_TOKEN_ID, ALEX_ADDRESS_2} from '../constants'
import { ERC721 } from '../../src/contracts'

const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')

const client = new OpenSeaPort(provider, {
  networkName: Network.Main,
  apiKey: MAINNET_API_KEY
}, line => console.info(`MAINNET: ${line}`))

suite('seaport: misc', () => {

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

  test('Single-approval tokens are approved for tester address', async () => {
    const accountAddress = ALEX_ADDRESS_2
    const proxyAddress = await client._getProxy(accountAddress)
    const tokenId = CK_TOKEN_ID.toString()
    const tokenAddress = CK_ADDRESS
    const erc721 = await client.web3.eth.contract(ERC721 as any).at(tokenAddress)
    const approvedAddress = await getNonCompliantApprovalAddress(erc721, tokenId, accountAddress)
    assert.equal(approvedAddress, proxyAddress)
  })

})
