"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var web3_1 = require("web3");
exports.getMethod = function (abi, name) {
    // Have to cast since there's a bug in
    // web3 types on the 'type' field
    return abi.filter(function (x) { return x.type == web3_1.AbiType.Function && x.name == name; })[0];
};
exports.event = function (abi, name) {
    // Have to cast since there's a bug in
    // web3 types on the 'type' field
    return abi.filter(function (x) { return x.type == web3_1.AbiType.Event && x.name == name; })[0];
};
exports.DECENTRALAND_AUCTION_CONFIG = {
    '1': '0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d',
};
var ERC20_1 = require("./abi/ERC20");
exports.ERC20 = ERC20_1.ERC20;
var ERC721v3_1 = require("./abi/ERC721v3");
exports.ERC721 = ERC721v3_1.ERC721;
var ERC1155_1 = require("./abi/ERC1155");
exports.ERC1155 = ERC1155_1.ERC1155;
var CanonicalWETH_1 = require("./abi/CanonicalWETH");
exports.CanonicalWETH = CanonicalWETH_1.CanonicalWETH;
var WrappedNFT_1 = require("./abi/WrappedNFT");
exports.WrappedNFT = WrappedNFT_1.WrappedNFT;
var WrappedNFTFactory_1 = require("./abi/WrappedNFTFactory");
exports.WrappedNFTFactory = WrappedNFTFactory_1.WrappedNFTFactory;
var WrappedNFTLiquidationProxy_1 = require("./abi/WrappedNFTLiquidationProxy");
exports.WrappedNFTLiquidationProxy = WrappedNFTLiquidationProxy_1.WrappedNFTLiquidationProxy;
var UniswapFactory_1 = require("./abi/UniswapFactory");
exports.UniswapFactory = UniswapFactory_1.UniswapFactory;
var UniswapExchange_1 = require("./abi/UniswapExchange");
exports.UniswapExchange = UniswapExchange_1.UniswapExchange;
//# sourceMappingURL=contracts.js.map