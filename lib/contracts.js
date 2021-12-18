"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapExchange = exports.UniswapFactory = exports.WrappedNFTLiquidationProxy = exports.WrappedNFTFactory = exports.WrappedNFT = exports.CanonicalWETH = exports.DecentralandEstates = exports.CheezeWizardsBasicTournament = exports.StaticCheckDecentralandEstates = exports.StaticCheckCheezeWizards = exports.StaticCheckTxOrigin = exports.ERC1155 = exports.ERC721 = exports.ERC20 = exports.getMethod = void 0;
var getMethod = function (abi, name) {
    var methodAbi = abi.find(function (x) { return x.type == "function" && x.name == name; });
    if (!methodAbi) {
        throw new Error("ABI ".concat(name, " not found"));
    }
    // Have to cast since there's a bug in
    // web3 types on the 'type' field
    return methodAbi;
};
exports.getMethod = getMethod;
var ERC20_1 = require("./abi/ERC20");
Object.defineProperty(exports, "ERC20", { enumerable: true, get: function () { return ERC20_1.ERC20; } });
var ERC721v3_1 = require("./abi/ERC721v3");
Object.defineProperty(exports, "ERC721", { enumerable: true, get: function () { return ERC721v3_1.ERC721; } });
var ERC1155_1 = require("./abi/ERC1155");
Object.defineProperty(exports, "ERC1155", { enumerable: true, get: function () { return ERC1155_1.ERC1155; } });
var StaticCheckTxOrigin_1 = require("./abi/StaticCheckTxOrigin");
Object.defineProperty(exports, "StaticCheckTxOrigin", { enumerable: true, get: function () { return StaticCheckTxOrigin_1.StaticCheckTxOrigin; } });
var StaticCheckCheezeWizards_1 = require("./abi/StaticCheckCheezeWizards");
Object.defineProperty(exports, "StaticCheckCheezeWizards", { enumerable: true, get: function () { return StaticCheckCheezeWizards_1.StaticCheckCheezeWizards; } });
var StaticCheckDecentralandEstates_1 = require("./abi/StaticCheckDecentralandEstates");
Object.defineProperty(exports, "StaticCheckDecentralandEstates", { enumerable: true, get: function () { return StaticCheckDecentralandEstates_1.StaticCheckDecentralandEstates; } });
var CheezeWizardsBasicTournament_1 = require("./abi/CheezeWizardsBasicTournament");
Object.defineProperty(exports, "CheezeWizardsBasicTournament", { enumerable: true, get: function () { return CheezeWizardsBasicTournament_1.CheezeWizardsBasicTournament; } });
var DecentralandEstates_1 = require("./abi/DecentralandEstates");
Object.defineProperty(exports, "DecentralandEstates", { enumerable: true, get: function () { return DecentralandEstates_1.DecentralandEstates; } });
var CanonicalWETH_1 = require("./abi/CanonicalWETH");
Object.defineProperty(exports, "CanonicalWETH", { enumerable: true, get: function () { return CanonicalWETH_1.CanonicalWETH; } });
var WrappedNFT_1 = require("./abi/WrappedNFT");
Object.defineProperty(exports, "WrappedNFT", { enumerable: true, get: function () { return WrappedNFT_1.WrappedNFT; } });
var WrappedNFTFactory_1 = require("./abi/WrappedNFTFactory");
Object.defineProperty(exports, "WrappedNFTFactory", { enumerable: true, get: function () { return WrappedNFTFactory_1.WrappedNFTFactory; } });
var WrappedNFTLiquidationProxy_1 = require("./abi/WrappedNFTLiquidationProxy");
Object.defineProperty(exports, "WrappedNFTLiquidationProxy", { enumerable: true, get: function () { return WrappedNFTLiquidationProxy_1.WrappedNFTLiquidationProxy; } });
var UniswapFactory_1 = require("./abi/UniswapFactory");
Object.defineProperty(exports, "UniswapFactory", { enumerable: true, get: function () { return UniswapFactory_1.UniswapFactory; } });
var UniswapExchange_1 = require("./abi/UniswapExchange");
Object.defineProperty(exports, "UniswapExchange", { enumerable: true, get: function () { return UniswapExchange_1.UniswapExchange; } });
//# sourceMappingURL=contracts.js.map