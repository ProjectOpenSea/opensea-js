"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("wyvern-js/lib/types");
exports.Network = types_1.Network;
exports.HowToCall = types_1.HowToCall;
exports.SaleKind = types_1.SaleKind;
var EventType;
(function (EventType) {
    EventType["TransactionCreated"] = "TransactionCreated";
    EventType["TransactionConfirmed"] = "TransactionConfirmed";
    EventType["InitializeAccount"] = "InitializeAccount";
    EventType["WrapEth"] = "WrapEth";
    EventType["UnwrapWeth"] = "UnwrapWeth";
    EventType["ApproveCurrency"] = "ApproveCurrency";
    EventType["ApproveAsset"] = "ApproveAsset";
    EventType["ApproveAllAssets"] = "ApproveAllAssets";
    EventType["MatchOrders"] = "MatchOrders";
    EventType["CancelOrder"] = "CancelOrder";
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