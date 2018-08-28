import { OpenSeaAPI } from '../src/api'
import { Network, Order, OrderSide, OpenSeaAsset } from '../src/types'
import { OpenSeaPort } from '../src'
import { promisify } from '../src/wyvern'

export const mainApi = new OpenSeaAPI({
  networkName: Network.Main
})

export const rinkebyApi = new OpenSeaAPI({
  networkName: Network.Rinkeby
})

export const apiToTest = rinkebyApi

export const CK_ADDRESS = '0x06012c8cf97bead5deae237070f9587f8e7a266d'
export const CRYPTO_CRYSTAL_ADDRESS = '0xcfbc9103362aec4ce3089f155c2da2eea1cb7602'
export const CK_RINKEBY_ADDRESS = '0x16baf0de678e52367adc69fd067e5edd1d33e3bf'
export const CK_RINKEBY_TOKEN_ID = 111
export const CK_RINKEBY_SELLER_FEE = 125
export const ALEX_ADDRESS = '0xe96a1b303a1eb8d04fb973eb2b291b8d591c8f72'

const proxyABI: any = {'constant': false, 'inputs': [{'name': 'dest', 'type': 'address'}, {'name': 'howToCall', 'type': 'uint8'}, {'name': 'calldata', 'type': 'bytes'}], 'name': 'proxy', 'outputs': [{'name': 'success', 'type': 'bool'}], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}

export async function canSettleOrder(client: OpenSeaPort, order: Order, matchingOrder: Order): Promise<boolean> {

  // TODO fix this calldata for buy orders
  // HACK to change null address to 0x1111111... for replacing calldata
  const calldata = order.calldata.slice(0, 98) + "1111111111111111111111111111111111111111" + order.calldata.slice(138)

  const seller = order.side == OrderSide.Buy ? matchingOrder.maker : order.maker
  const proxy = await client._getProxy(seller)
  if (!proxy) {
    console.warn(`No proxy found for seller ${seller}`)
    return false
  }
  const contract = (client.web3.eth.contract([proxyABI])).at(proxy)
  return promisify<boolean>(c =>
    contract.proxy.call(
      order.target,
      order.howToCall,
      calldata,
      {from: seller},
    c)
  )
}
