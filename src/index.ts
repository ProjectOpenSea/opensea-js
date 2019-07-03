import { OpenSeaPort } from './seaport'
import { OpenSeaAPI } from './api'
import { Network, EventData, EventType } from './types'
import { orderToJSON, orderFromJSON } from './utils'
import { encodeCall } from 'wyvern-schemas/dist-tsc'

/**
 * Example setup:
 *
 * import * as Web3 from 'web3'
 * import { OpenSeaPort, Network } from 'opensea-js'
 * const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')
 * const client = new OpenSeaPort(provider, {
 *   networkName: Network.Main
 * })
 */

export {
  // Main SDK export:
  OpenSeaPort,
  // So the API could be used separately:
  OpenSeaAPI,
  // Useful for serializing and deserializing orders:
  orderToJSON, orderFromJSON,
  // Types to help initialize SDK and listen to events.
  // Can also be imported using e.g.
  //   import { EventType } from 'opensea-js/lib/types'
  EventData, EventType, Network,
  // To help with encoding arbitrary calls
  encodeCall
}
