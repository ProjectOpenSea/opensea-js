"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("wyvern-js/lib/types");
exports.Network = types_1.Network;
exports.HowToCall = types_1.HowToCall;
exports.SaleKind = types_1.SaleKind;
var EventType;
(function (EventType) {
    EventType["InitializeAccount"] = "InitializeAccount";
    EventType["InitializeAccountComplete"] = "InitializeAccountComplete";
    EventType["WrapEth"] = "WrapEth";
    EventType["WrapEthComplete"] = "WrapEthComplete";
    EventType["UnwrapWeth"] = "UnwrapWeth";
    EventType["UnwrapWethComplete"] = "UnwrapWethComplete";
    EventType["ApproveAsset"] = "ApproveAsset";
    EventType["ApproveAssetComplete"] = "ApproveAssetComplete";
    EventType["ApproveCurrency"] = "ApproveCurrency";
    EventType["ApproveCurrencyComplete"] = "ApproveCurrencyComplete";
    EventType["ApproveAllAssets"] = "ApproveAllAssets";
    EventType["ApproveAllAssetsComplete"] = "ApproveAllAssetsComplete";
    EventType["MatchOrders"] = "MatchOrders";
    EventType["MatchOrdersComplete"] = "MatchOrdersComplete";
    EventType["CancelOrder"] = "CancelOrder";
    EventType["CancelOrderComplete"] = "CancelOrderComplete";
})(EventType = exports.EventType || (exports.EventType = {}));
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
//# sourceMappingURL=types.js.map