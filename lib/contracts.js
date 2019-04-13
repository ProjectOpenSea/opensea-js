"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMethod = function (abi, name) {
    return abi.filter(function (x) { return x.type == 'function' && x.name == name; })[0];
};
exports.event = function (abi, name) {
    return abi.filter(function (x) { return x.type == 'event' && x.name == name; })[0];
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
//# sourceMappingURL=contracts.js.map