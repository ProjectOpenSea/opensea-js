"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../src/api");
var types_1 = require("../src/types");
var utils_1 = require("../src/utils");
exports.CK_RINKEBY_ADDRESS = utils_1.CK_RINKEBY_ADDRESS;
exports.CK_ADDRESS = utils_1.CK_ADDRESS;
exports.MAINNET_API_KEY = "testKeyMainnet";
exports.RINKEBY_API_KEY = "testKeyRinkeby";
exports.mainApi = new api_1.OpenSeaAPI({
    apiKey: exports.MAINNET_API_KEY,
    networkName: types_1.Network.Main
}, console.info);
exports.rinkebyApi = new api_1.OpenSeaAPI({
    apiKey: exports.RINKEBY_API_KEY,
    networkName: types_1.Network.Rinkeby
}, console.info);
exports.apiToTest = exports.rinkebyApi;
exports.GODS_UNCHAINED_ADDRESS = '0x6ebeaf8e8e946f0716e6533a6f2cefc83f60e8ab';
exports.CRYPTO_CRYSTAL_ADDRESS = '0xcfbc9103362aec4ce3089f155c2da2eea1cb7602';
exports.DIGITAL_ART_CHAIN_ADDRESS = '0x323a3e1693e7a0959f65972f3bf2dfcb93239dfe';
exports.MYTHEREUM_ADDRESS = '0xc70be5b7c19529ef642d16c10dfe91c58b5c3bf0';
exports.DIGITAL_ART_CHAIN_TOKEN_ID = 189;
exports.GODS_UNCHAINED_TOKEN_ID = 76719;
exports.MYTHEREUM_TOKEN_ID = 4367;
exports.CK_RINKEBY_BUNDLE_SLUG = 'puff-kitty';
exports.CK_RINKEBY_TOKEN_ID = 505;
exports.CK_TOKEN_ID = 637488;
exports.CRYPTOPUNKS_ID = 7858;
exports.CK_RINKEBY_SELLER_FEE = 125;
// Toasta Gun, NFT
exports.CATS_IN_MECHS_ID = '11081664790290028159747096595969945056246807881612483124155840544084353614722';
// Bounty, FT
exports.AGE_OF_RUST_TOKEN_ID = '54277541829991970138807176245523726845769750577935206659121857736960710279168';
exports.CRYPTOFLOWERS_CONTRACT_ADDRESS_WITH_BUYER_FEE = '0x8bc67d00253fd60b1afcce88b78820413139f4c6';
exports.CRYPTOPUNKS_ADDRESS = '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb';
exports.ALEX_ADDRESS = '0xe96a1b303a1eb8d04fb973eb2b291b8d591c8f72';
exports.RANDOM_ADDRESS = '0x196a1b303a1eb8d04fb973eb2b291b8d591c8f72';
exports.ALEX_ADDRESS_2 = '0x431e44389a003f0ec6e83b3578db5075a44ac523';
exports.DEVIN_ADDRESS = '0x0239769a1adf4def9f07da824b80b9c4fcb59593';
exports.DAN_ADDRESS = '0x530cf036ed4fa58f7301a9c788c9806624cefd19';
//# sourceMappingURL=constants.js.map