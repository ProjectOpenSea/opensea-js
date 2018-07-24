"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Network;
(function (Network) {
    Network["Main"] = "main";
    Network["Rinkeby"] = "rinkeby";
})(Network = exports.Network || (exports.Network = {}));
var OrderSide;
(function (OrderSide) {
    OrderSide[OrderSide["Buy"] = 0] = "Buy";
    OrderSide[OrderSide["Sell"] = 1] = "Sell";
})(OrderSide = exports.OrderSide || (exports.OrderSide = {}));
var SaleKind;
(function (SaleKind) {
    SaleKind[SaleKind["FixedPrice"] = 0] = "FixedPrice";
    SaleKind[SaleKind["EnglishAuction"] = 1] = "EnglishAuction";
    SaleKind[SaleKind["DutchAuction"] = 2] = "DutchAuction";
})(SaleKind = exports.SaleKind || (exports.SaleKind = {}));
var HowToCall;
(function (HowToCall) {
    HowToCall[HowToCall["Call"] = 0] = "Call";
    HowToCall[HowToCall["DelegateCall"] = 1] = "DelegateCall";
    HowToCall[HowToCall["StaticCall"] = 2] = "StaticCall";
    HowToCall[HowToCall["Create"] = 3] = "Create";
})(HowToCall = exports.HowToCall || (exports.HowToCall = {}));
var FeeMethod;
(function (FeeMethod) {
    FeeMethod[FeeMethod["ProtocolFee"] = 0] = "ProtocolFee";
    FeeMethod[FeeMethod["SplitFee"] = 1] = "SplitFee";
})(FeeMethod = exports.FeeMethod || (exports.FeeMethod = {}));
//# sourceMappingURL=types.js.map