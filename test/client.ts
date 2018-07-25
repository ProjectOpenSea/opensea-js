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

const client = new OpenSea(provider, {
  networkName: Network.Main
})

suite('client', () => {

  test('Constructor has public methods', () => {
    assert.equal(typeof client.getCurrentPrice, 'function')
    assert.equal(typeof client.wrapEth, 'function')
  })

  test('Constructor exposes underscored methods', () => {
    assert.equal(typeof client._atomicMatch, 'function')
    assert.equal(typeof client._getSchema, 'function')
  })

})
