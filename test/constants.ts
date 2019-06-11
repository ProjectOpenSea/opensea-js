import { OpenSeaAPI } from '../src/api'
import { Network } from '../src/types'
import { CK_RINKEBY_ADDRESS, CK_ADDRESS } from '../src/utils'

export const MAINNET_API_KEY = "testKeyMainnet"
export const RINKEBY_API_KEY = "testKeyRinkeby"

export const mainApi = new OpenSeaAPI({
  apiKey: MAINNET_API_KEY,
  networkName: Network.Main
}, console.info)

export const rinkebyApi = new OpenSeaAPI({
  apiKey: RINKEBY_API_KEY,
  networkName: Network.Rinkeby
}, console.info)

export const apiToTest = rinkebyApi

export {
  CK_ADDRESS,
  CK_RINKEBY_ADDRESS
}
export const GODS_UNCHAINED_ADDRESS = '0x6ebeaf8e8e946f0716e6533a6f2cefc83f60e8ab'
export const CRYPTO_CRYSTAL_ADDRESS = '0xcfbc9103362aec4ce3089f155c2da2eea1cb7602'
export const DIGITAL_ART_CHAIN_ADDRESS = '0x323a3e1693e7a0959f65972f3bf2dfcb93239dfe'
export const MYTHEREUM_ADDRESS = '0xc70be5b7c19529ef642d16c10dfe91c58b5c3bf0'
export const DIGITAL_ART_CHAIN_TOKEN_ID = 189
export const GODS_UNCHAINED_TOKEN_ID = 76719
export const MYTHEREUM_TOKEN_ID = 4367
export const CK_RINKEBY_BUNDLE_SLUG = 'puff-kitty'

export const CK_RINKEBY_TOKEN_ID = 505
export const CK_TOKEN_ID = 637488
export const CK_RINKEBY_SELLER_FEE = 125

export const CATS_IN_MECHS_ID = '11081664790290028178578401802129987347754176151235482372462906877476457152814'
export const WAR_OF_CRYPTO_TOKEN_ID = '226156424291636263689410684181987085726945887348956700691377936678332137473'
export const CRYPTOFLOWERS_CONTRACT_ADDRESS_WITH_BUYER_FEE = '0x8bc67d00253fd60b1afcce88b78820413139f4c6'

export const ALEX_ADDRESS = '0xe96a1b303a1eb8d04fb973eb2b291b8d591c8f72'
export const ALEX_ADDRESS_2 = '0x431e44389a003f0ec6e83b3578db5075a44ac523'
export const DEVIN_ADDRESS = '0x0239769a1adf4def9f07da824b80b9c4fcb59593'
