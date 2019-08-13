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

export const ENS_RINKEBY_TOKEN_ADDRESS = '0x53ceb15b76023fbec5bb39450214926f6aa77d2e'
export const ENS_RINKEBY_SHORT_NAME_OWNER = '0xe0ee13cd5a45e7fa140409edfc9ce17c7b11e6d2'
export const ENS_HELLO_TOKEN_ID = '12910348618308260923200348219926901280687058984330794534952861439530514639560'
export const ENS_HELLO_NAME = 'hello'

export const CK_RINKEBY_TOKEN_ID = 505
export const CK_TOKEN_ID = 637488
export const CRYPTOPUNKS_ID = 7858
export const CK_RINKEBY_SELLER_FEE = 125

// Toasta Gun, NFT
export const CATS_IN_MECHS_ID = '11081664790290028159747096595969945056246807881612483124155840544084353614722'
// Bounty, FT
export const AGE_OF_RUST_TOKEN_ID = '54277541829991970138807176245523726845769750577935206659121857736960710279168'
export const CRYPTOFLOWERS_CONTRACT_ADDRESS_WITH_BUYER_FEE = '0x8bc67d00253fd60b1afcce88b78820413139f4c6'
export const CRYPTOPUNKS_ADDRESS = '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb'

export const ALEX_ADDRESS = '0xe96a1b303a1eb8d04fb973eb2b291b8d591c8f72'
export const RANDOM_ADDRESS = '0x196a1b303a1eb8d04fb973eb2b291b8d591c8f72'
export const ALEX_ADDRESS_2 = '0x431e44389a003f0ec6e83b3578db5075a44ac523'
export const DEVIN_ADDRESS = '0x0239769a1adf4def9f07da824b80b9c4fcb59593'
export const DAN_ADDRESS = '0x530cf036ed4fa58f7301a9c788c9806624cefd19'
