import { OpenSeaAPI } from '../src/api'
import { Network } from '../src/types'

export const mainApi = new OpenSeaAPI({
  networkName: Network.Main
})

export const rinkebyApi = new OpenSeaAPI({
  networkName: Network.Rinkeby
})

export const apiToTest = rinkebyApi

export const CK_ADDRESS = '0x06012c8cf97bead5deae237070f9587f8e7a266d'
export const CK_RINKEBY_ADDRESS = '0x16baf0de678e52367adc69fd067e5edd1d33e3bf'
export const CK_RINKEBY_TOKEN_ID = 111
export const CK_RINKEBY_SELLER_FEE = 125
export const ALEX_ADDRESS = '0xe96a1b303a1eb8d04fb973eb2b291b8d591c8f72'
