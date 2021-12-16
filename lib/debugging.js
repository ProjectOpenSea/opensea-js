"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOrderCalldataCanMatch = exports.requireOrdersCanMatch = exports.MAX_ERROR_LENGTH = void 0;
var constants_1 = require("./constants");
exports.MAX_ERROR_LENGTH = 120;
/**
 * This file reproduces Solidity methods to make debugging easier
 */
var Side;
(function (Side) {
    Side[Side["Buy"] = 0] = "Buy";
    Side[Side["Sell"] = 1] = "Sell";
})(Side || (Side = {}));
var SaleKind;
(function (SaleKind) {
    SaleKind[SaleKind["FixedPrice"] = 0] = "FixedPrice";
    SaleKind[SaleKind["DutchAuction"] = 1] = "DutchAuction";
})(SaleKind || (SaleKind = {}));
var SaleKindInterface = {
    Side: Side,
    SaleKind: SaleKind,
    validateParameters: function (saleKind, expirationTime) {
        return saleKind === SaleKind.FixedPrice || expirationTime > 0;
    },
    canSettleOrder: function (listingTime, expirationTime) {
        var now = Math.round(Date.now() / 1000);
        return listingTime < now && (expirationTime === 0 || now < expirationTime);
    },
};
/**
 * Debug the `ordersCanMatch` part of Wyvern
 * @param buy Buy order for debugging
 * @param sell Sell order for debugging
 */
function requireOrdersCanMatch(client, _a) {
    var buy = _a.buy, sell = _a.sell, accountAddress = _a.accountAddress;
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, client.wyvernExchange.ordersCanMatch_.callAsync([
                        buy.exchange,
                        buy.maker,
                        buy.taker,
                        buy.feeRecipient,
                        buy.target,
                        buy.staticTarget,
                        buy.paymentToken,
                        sell.exchange,
                        sell.maker,
                        sell.taker,
                        sell.feeRecipient,
                        sell.target,
                        sell.staticTarget,
                        sell.paymentToken,
                    ], [
                        buy.makerRelayerFee,
                        buy.takerRelayerFee,
                        buy.makerProtocolFee,
                        buy.takerProtocolFee,
                        buy.basePrice,
                        buy.extra,
                        buy.listingTime,
                        buy.expirationTime,
                        buy.salt,
                        sell.makerRelayerFee,
                        sell.takerRelayerFee,
                        sell.makerProtocolFee,
                        sell.takerProtocolFee,
                        sell.basePrice,
                        sell.extra,
                        sell.listingTime,
                        sell.expirationTime,
                        sell.salt,
                    ], [
                        buy.feeMethod,
                        buy.side,
                        buy.saleKind,
                        buy.howToCall,
                        sell.feeMethod,
                        sell.side,
                        sell.saleKind,
                        sell.howToCall,
                    ], buy.calldata, sell.calldata, buy.replacementPattern, sell.replacementPattern, buy.staticExtradata, sell.staticExtradata, { from: accountAddress })];
                case 1:
                    result = _b.sent();
                    if (result) {
                        return [2 /*return*/];
                    }
                    if (!(+buy.side == +SaleKindInterface.Side.Buy &&
                        +sell.side == +SaleKindInterface.Side.Sell)) {
                        throw new Error("Must be opposite-side");
                    }
                    if (!(buy.feeMethod == sell.feeMethod)) {
                        throw new Error("Must use same fee method");
                    }
                    if (!(buy.paymentToken == sell.paymentToken)) {
                        throw new Error("Must use same payment token");
                    }
                    if (!(sell.taker == constants_1.NULL_ADDRESS || sell.taker == buy.maker)) {
                        throw new Error("Sell taker must be null or matching buy maker");
                    }
                    if (!(buy.taker == constants_1.NULL_ADDRESS || buy.taker == sell.maker)) {
                        throw new Error("Buy taker must be null or matching sell maker");
                    }
                    if (!((sell.feeRecipient == constants_1.NULL_ADDRESS && buy.feeRecipient != constants_1.NULL_ADDRESS) ||
                        (sell.feeRecipient != constants_1.NULL_ADDRESS && buy.feeRecipient == constants_1.NULL_ADDRESS))) {
                        throw new Error("One order must be maker and the other must be taker");
                    }
                    if (!(buy.target == sell.target)) {
                        throw new Error("Must match target");
                    }
                    if (!(buy.howToCall == sell.howToCall)) {
                        throw new Error("Must match howToCall");
                    }
                    if (!SaleKindInterface.canSettleOrder(+buy.listingTime, +buy.expirationTime)) {
                        throw new Error("Buy-side order is set in the future or expired");
                    }
                    if (!SaleKindInterface.canSettleOrder(+sell.listingTime, +sell.expirationTime)) {
                        throw new Error("Sell-side order is set in the future or expired");
                    }
                    // Handle default, which is likely now() being diff than local time
                    throw new Error("Error creating your order. Check that your system clock is set to the current date and time before you try again.");
            }
        });
    });
}
exports.requireOrdersCanMatch = requireOrdersCanMatch;
/**
 * Debug the `orderCalldataCanMatch` part of Wyvern
 * @param buy Buy order for debugging
 * @param sell Sell Order for debugging
 */
function requireOrderCalldataCanMatch(client, _a) {
    var buy = _a.buy, sell = _a.sell;
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, client.wyvernExchange.orderCalldataCanMatch.callAsync(buy.calldata, buy.replacementPattern, sell.calldata, sell.replacementPattern)];
                case 1:
                    result = _b.sent();
                    if (result) {
                        return [2 /*return*/];
                    }
                    throw new Error("Unable to match offer data with auction data.");
            }
        });
    });
}
exports.requireOrderCalldataCanMatch = requireOrderCalldataCanMatch;
//# sourceMappingURL=debugging.js.map