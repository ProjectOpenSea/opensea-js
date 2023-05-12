"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WETH_ADDRESS = exports.BAYC_TOKEN_IDS = exports.BAYC_TOKEN_ID = exports.BAYC_CONTRACT_ADDRESS = exports.DAPPER_ADDRESS = exports.testnetApi = exports.mainApi = exports.ALCHEMY_API_KEY = exports.WALLET_PRIV_KEY = exports.WALLET_ADDRESS = exports.MAINNET_API_KEY = void 0;
var api_1 = require("../api");
var types_1 = require("../types");
exports.MAINNET_API_KEY = process.env.API_KEY;
exports.WALLET_ADDRESS = process.env.WALLET_ADDRESS;
exports.WALLET_PRIV_KEY = process.env.WALLET_PRIV_KEY;
exports.ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
exports.mainApi = new api_1.OpenSeaAPI({
    apiKey: exports.MAINNET_API_KEY,
    networkName: types_1.Network.Main,
}, console.info);
exports.testnetApi = new api_1.OpenSeaAPI({
    networkName: types_1.Network.Goerli,
}, console.info);
exports.DAPPER_ADDRESS = "0x4819352bd7fadcCFAA8A2cDA4b2825a9ec51417c";
exports.BAYC_CONTRACT_ADDRESS = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
exports.BAYC_TOKEN_ID = "1";
exports.BAYC_TOKEN_IDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
exports.WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
//# sourceMappingURL=constants.js.map