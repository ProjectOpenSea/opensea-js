import {
  assert,
} from 'chai';

import {
  suite,
  test,
} from 'mocha-typescript'

import { OpenSea } from '../src/index'
import * as Web3 from 'web3'
import { Network } from '../src/types';
const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')

const ordersAndHashes: object[] = require('./ordersAndHashes.json')

const client = new OpenSea(provider, {
  networkName: Network.Main
})

suite('basic', () => {

  test('Constructor is correct', () => {

    assert.equal(OpenSea.NULL_ADDRESS, '0x0000000000000000000000000000000000000000')
  })

  test('Max uint256 is correct', () => {
    assert.equal(OpenSea.MAX_UINT_256.toString(), '115792089237316195423570985008687907853269984665640564039457584007913129639935')
  })

  ordersAndHashes.map((orderAndHash: any, index: number) => {
    test('Order #' + index + ' hash is correct', () => {
      const hash = OpenSea.getOrderHashHex(orderAndHash.order)
      assert.equal(hash, orderAndHash.hash)
    })
  })

})
