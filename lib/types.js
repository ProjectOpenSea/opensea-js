"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("wyvern-js/lib/types");
exports.Network = types_1.Network;
exports.HowToCall = types_1.HowToCall;
exports.SaleKind = types_1.SaleKind;
var OrderSide;
(function (OrderSide) {
    OrderSide[OrderSide["Buy"] = 0] = "Buy";
    OrderSide[OrderSide["Sell"] = 1] = "Sell";
})(OrderSide = exports.OrderSide || (exports.OrderSide = {}));
var FeeMethod;
(function (FeeMethod) {
    FeeMethod[FeeMethod["ProtocolFee"] = 0] = "ProtocolFee";
    FeeMethod[FeeMethod["SplitFee"] = 1] = "SplitFee";
})(FeeMethod = exports.FeeMethod || (exports.FeeMethod = {}));
var EventType;
(function (EventType) {
    EventType["ApproveAsset"] = "ApproveAsset";
    EventType["ApproveAssetComplete"] = "ApproveAssetComplete";
    EventType["ApproveAllAssets"] = "ApproveAllAssets";
    EventType["ApproveAllAssetsComplete"] = "ApproveAllAssetsComplete";
    EventType["InitializeAccount"] = "InitializeAccount";
    EventType["InitializeAccountComplete"] = "InitializeAccountComplete";
})(EventType = exports.EventType || (exports.EventType = {}));
//# sourceMappingURL=types.js.map