"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMethod = function (abi, name) {
    var methodAbi = abi.find(function (x) { return x.type == 'function' && x.name == name; });
    if (!methodAbi) {
        throw new Error("ABI " + name + " not found");
    }
    // Have to cast since there's a bug in
    // web3 types on the 'type' field
    return methodAbi;
};
exports.event = function (abi, name) {
    var eventAbi = abi.find(function (x) { return x.type == 'event' && x.name == name; });
    if (!eventAbi) {
        throw new Error("ABI " + name + " not found");
    }
    // Have to cast since there's a bug in
    // web3 types on the 'type' field
    return eventAbi;
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
var StaticCheckTxOrigin_1 = require("./abi/StaticCheckTxOrigin");
exports.StaticCheckTxOrigin = StaticCheckTxOrigin_1.StaticCheckTxOrigin;
var StaticCheckCheezeWizards_1 = require("./abi/StaticCheckCheezeWizards");
exports.StaticCheckCheezeWizards = StaticCheckCheezeWizards_1.StaticCheckCheezeWizards;
var StaticCheckDecentralandEstates_1 = require("./abi/StaticCheckDecentralandEstates");
exports.StaticCheckDecentralandEstates = StaticCheckDecentralandEstates_1.StaticCheckDecentralandEstates;
var CheezeWizardsBasicTournament_1 = require("./abi/CheezeWizardsBasicTournament");
exports.CheezeWizardsBasicTournament = CheezeWizardsBasicTournament_1.CheezeWizardsBasicTournament;
var DecentralandEstates_1 = require("./abi/DecentralandEstates");
exports.DecentralandEstates = DecentralandEstates_1.DecentralandEstates;
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