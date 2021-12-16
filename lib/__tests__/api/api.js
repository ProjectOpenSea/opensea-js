"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var chai_1 = require("chai");
var mocha_1 = require("mocha");
var Web3 = __importStar(require("web3"));
var wyvern_js_1 = require("wyvern-js");
var constants_1 = require("../../constants");
var index_1 = require("../../index");
var types_1 = require("../../types");
var utils_1 = require("../../utils/utils");
var constants_2 = require("../constants");
var provider = new Web3.providers.HttpProvider(constants_1.MAINNET_PROVIDER_URL);
var client = new index_1.OpenSeaPort(provider, {
    networkName: types_1.Network.Main,
    apiKey: constants_2.MAINNET_API_KEY,
}, function (line) { return console.info("MAINNET: ".concat(line)); });
(0, mocha_1.suite)("api", function () {
    (0, mocha_1.test)("API has correct base url", function () {
        chai_1.assert.equal(constants_2.mainApi.apiBaseUrl, "https://api.opensea.io");
        chai_1.assert.equal(constants_2.rinkebyApi.apiBaseUrl, "https://testnets-api.opensea.io");
    });
    (0, mocha_1.test)("API fetches bundles and prefetches sell orders", function () { return __awaiter(void 0, void 0, void 0, function () {
        var bundles, bundle;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, constants_2.apiToTest.getBundles({
                        asset_contract_address: constants_2.CK_RINKEBY_ADDRESS,
                    })];
                case 1:
                    bundles = (_a.sent()).bundles;
                    chai_1.assert.isArray(bundles);
                    bundle = bundles[0];
                    chai_1.assert.isNotNull(bundle);
                    if (!bundle) {
                        return [2 /*return*/];
                    }
                    chai_1.assert.include(bundle.assets.map(function (a) { return a.assetContract.name; }), "CryptoKittiesRinkeby");
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Includes API key in token request", function () { return __awaiter(void 0, void 0, void 0, function () {
        var oldLogger, logPromise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    oldLogger = constants_2.rinkebyApi.logger;
                    logPromise = new Promise(function (resolve, reject) {
                        constants_2.rinkebyApi.logger = function (log) {
                            try {
                                chai_1.assert.include(log, "\"X-API-KEY\":\"".concat(constants_2.RINKEBY_API_KEY, "\""));
                                resolve();
                            }
                            catch (e) {
                                reject(e);
                            }
                            finally {
                                constants_2.rinkebyApi.logger = oldLogger;
                            }
                        };
                        constants_2.rinkebyApi.getPaymentTokens({ symbol: "WETH" });
                    });
                    return [4 /*yield*/, logPromise];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("An API asset's order has correct hash", function () { return __awaiter(void 0, void 0, void 0, function () {
        var asset, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, constants_2.mainApi.getAsset({
                        tokenAddress: constants_2.CK_ADDRESS,
                        tokenId: 1,
                    })];
                case 1:
                    asset = _a.sent();
                    chai_1.assert.isNotNull(asset.orders);
                    if (!asset.orders) {
                        return [2 /*return*/];
                    }
                    order = asset.orders[0];
                    chai_1.assert.isNotNull(order);
                    if (!order) {
                        return [2 /*return*/];
                    }
                    chai_1.assert.equal(order.hash, (0, utils_1.getOrderHash)(order));
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("orderToJSON is correct", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, quantity, amountInToken, paymentTokenAddress, extraBountyBasisPoints, expirationTime, englishAuctionReservePrice, tokenId, tokenAddress, order, hashedOrder, orderData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_2.ALEX_ADDRESS;
                    quantity = 1;
                    amountInToken = 1.2;
                    paymentTokenAddress = constants_2.WETH_ADDRESS;
                    extraBountyBasisPoints = 0;
                    expirationTime = Math.round(Date.now() / 1000 + 60);
                    englishAuctionReservePrice = 2;
                    tokenId = constants_2.MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = constants_2.MYTHEREUM_ADDRESS;
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: quantity,
                            accountAddress: accountAddress,
                            startAmount: amountInToken,
                            paymentTokenAddress: paymentTokenAddress,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            expirationTime: expirationTime,
                            waitForHighestBid: true,
                            englishAuctionReservePrice: englishAuctionReservePrice,
                        })];
                case 1:
                    order = _a.sent();
                    hashedOrder = __assign(__assign({}, order), { hash: (0, utils_1.getOrderHash)(order) });
                    orderData = (0, index_1.orderToJSON)(hashedOrder);
                    chai_1.assert.equal(orderData.quantity, quantity.toString());
                    chai_1.assert.equal(orderData.maker, accountAddress);
                    chai_1.assert.equal(orderData.taker, constants_1.NULL_ADDRESS);
                    chai_1.assert.equal(orderData.basePrice, wyvern_js_1.WyvernProtocol.toBaseUnitAmount((0, utils_1.makeBigNumber)(amountInToken), 18).toString());
                    chai_1.assert.equal(orderData.paymentToken, paymentTokenAddress);
                    chai_1.assert.equal(orderData.extra, extraBountyBasisPoints.toString());
                    chai_1.assert.equal(orderData.expirationTime, expirationTime + constants_1.ORDER_MATCHING_LATENCY_SECONDS);
                    chai_1.assert.equal(orderData.englishAuctionReservePrice, wyvern_js_1.WyvernProtocol.toBaseUnitAmount((0, utils_1.makeBigNumber)(englishAuctionReservePrice), 18).toString());
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("API fetches tokens", function () { return __awaiter(void 0, void 0, void 0, function () {
        var tokens;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, constants_2.apiToTest.getPaymentTokens({ symbol: "MANA" })];
                case 1:
                    tokens = (_a.sent()).tokens;
                    chai_1.assert.isArray(tokens);
                    chai_1.assert.equal(tokens.length, 1);
                    chai_1.assert.equal(tokens[0].name, "Decentraland MANA");
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Rinkeby API orders have correct OpenSea url", function () { return __awaiter(void 0, void 0, void 0, function () {
        var order, url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, constants_2.rinkebyApi.getOrder({})];
                case 1:
                    order = _a.sent();
                    if (!order.asset) {
                        return [2 /*return*/];
                    }
                    url = "https://testnets.opensea.io/assets/".concat(order.asset.assetContract.address, "/").concat(order.asset.tokenId);
                    chai_1.assert.equal(order.asset.openseaLink, url);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Mainnet API orders have correct OpenSea url", function () { return __awaiter(void 0, void 0, void 0, function () {
        var order, url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, constants_2.mainApi.getOrder({})];
                case 1:
                    order = _a.sent();
                    if (!order.asset) {
                        return [2 /*return*/];
                    }
                    url = "https://opensea.io/assets/".concat(order.asset.assetContract.address, "/").concat(order.asset.tokenId);
                    chai_1.assert.equal(order.asset.openseaLink, url);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("API fetches orderbook", function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, orders, count;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, constants_2.apiToTest.getOrders()];
                case 1:
                    _a = _b.sent(), orders = _a.orders, count = _a.count;
                    chai_1.assert.isArray(orders);
                    chai_1.assert.isNumber(count);
                    chai_1.assert.equal(orders.length, constants_2.apiToTest.pageSize);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("API can change page size", function () { return __awaiter(void 0, void 0, void 0, function () {
        var defaultPageSize, orders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    defaultPageSize = constants_2.apiToTest.pageSize;
                    constants_2.apiToTest.pageSize = 7;
                    return [4 /*yield*/, constants_2.apiToTest.getOrders()];
                case 1:
                    orders = (_a.sent()).orders;
                    chai_1.assert.equal(orders.length, 7);
                    constants_2.apiToTest.pageSize = defaultPageSize;
                    return [2 /*return*/];
            }
        });
    }); });
    if (constants_1.ORDERBOOK_VERSION > 0) {
        (0, mocha_1.test)("API orderbook paginates", function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, orders, count, pagination;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, constants_2.apiToTest.getOrders()];
                    case 1:
                        _a = _b.sent(), orders = _a.orders, count = _a.count;
                        return [4 /*yield*/, constants_2.apiToTest.getOrders({}, 2)];
                    case 2:
                        pagination = _b.sent();
                        chai_1.assert.equal(pagination.orders.length, constants_2.apiToTest.pageSize);
                        chai_1.assert.notDeepEqual(pagination.orders[0], orders[0]);
                        chai_1.assert.equal(pagination.count, count);
                        return [2 /*return*/];
                }
            });
        }); });
    }
    (0, mocha_1.test)("API fetches orders for asset", function () { return __awaiter(void 0, void 0, void 0, function () {
        var forKitty;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, constants_2.apiToTest.getOrders({
                        asset_contract_address: constants_2.CK_RINKEBY_ADDRESS,
                        token_id: constants_2.CK_RINKEBY_TOKEN_ID,
                    })];
                case 1:
                    forKitty = _a.sent();
                    chai_1.assert.isArray(forKitty.orders);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("API fetches orders for asset owner", function () { return __awaiter(void 0, void 0, void 0, function () {
        var forOwner, owners;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, constants_2.apiToTest.getOrders({ owner: constants_2.ALEX_ADDRESS })];
                case 1:
                    forOwner = _a.sent();
                    chai_1.assert.isAbove(forOwner.orders.length, 0);
                    chai_1.assert.isAbove(forOwner.count, 0);
                    owners = forOwner.orders.map(function (o) { return o.asset && o.asset.owner && o.asset.owner.address; });
                    owners.forEach(function (owner) {
                        chai_1.assert.include([constants_2.ALEX_ADDRESS, constants_1.NULL_ADDRESS], owner);
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("API fetches buy orders for maker", function () { return __awaiter(void 0, void 0, void 0, function () {
        var forMaker;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, constants_2.apiToTest.getOrders({
                        maker: "0x5a237d6ce6d1fa3766fc15256cbfb8bdcf5a5b8a",
                        side: types_1.OrderSide.Buy,
                    })];
                case 1:
                    forMaker = _a.sent();
                    chai_1.assert.isAbove(forMaker.orders.length, 0);
                    chai_1.assert.isAbove(forMaker.count, 0);
                    forMaker.orders.forEach(function (order) {
                        chai_1.assert.equal("0x5a237d6ce6d1fa3766fc15256cbfb8bdcf5a5b8a", order.maker);
                        chai_1.assert.equal(types_1.OrderSide.Buy, order.side);
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("API excludes cancelledOrFinalized and markedInvalid orders", function () { return __awaiter(void 0, void 0, void 0, function () {
        var orders, finishedOrders, invalidOrders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, constants_2.apiToTest.getOrders({ limit: 50 })];
                case 1:
                    orders = (_a.sent()).orders;
                    finishedOrders = orders.filter(function (o) { return o.cancelledOrFinalized; });
                    chai_1.assert.isEmpty(finishedOrders);
                    invalidOrders = orders.filter(function (o) { return o.markedInvalid; });
                    chai_1.assert.isEmpty(invalidOrders);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("API fetches fees for an asset", function () { return __awaiter(void 0, void 0, void 0, function () {
        var asset;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, constants_2.apiToTest.getAsset({
                        tokenAddress: constants_2.CK_RINKEBY_ADDRESS,
                        tokenId: constants_2.CK_RINKEBY_TOKEN_ID,
                    })];
                case 1:
                    asset = _a.sent();
                    chai_1.assert.equal(asset.tokenId, constants_2.CK_RINKEBY_TOKEN_ID.toString());
                    chai_1.assert.equal(asset.assetContract.name, "CryptoKittiesRinkeby");
                    chai_1.assert.equal(asset.assetContract.sellerFeeBasisPoints, constants_2.CK_RINKEBY_SELLER_FEE);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("API fetches assets", function () { return __awaiter(void 0, void 0, void 0, function () {
        var assets, asset;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, constants_2.apiToTest.getAssets({
                        asset_contract_address: constants_2.CK_RINKEBY_ADDRESS,
                        order_by: "sale_date",
                    })];
                case 1:
                    assets = (_a.sent()).assets;
                    chai_1.assert.isArray(assets);
                    chai_1.assert.equal(assets.length, constants_2.apiToTest.pageSize);
                    asset = assets[0];
                    chai_1.assert.equal(asset.assetContract.name, "CryptoKittiesRinkeby");
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("API handles errors", function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1, error_2, res, order, newOrder, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, constants_2.apiToTest.get("/user")];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    chai_1.assert.include(error_1.message, "Unauthorized");
                    return [3 /*break*/, 3];
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, constants_2.apiToTest.get("/asset/".concat(constants_2.CK_RINKEBY_ADDRESS, "/0"))];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    chai_1.assert.include(error_2.message, "Not found");
                    return [3 /*break*/, 6];
                case 6: return [4 /*yield*/, constants_2.apiToTest.getOrders({
                        // Get an old order to make sure listing time is too early
                        listed_before: Math.round(Date.now() / 1000 - 3600),
                    })];
                case 7:
                    res = _a.sent();
                    order = res.orders[0];
                    chai_1.assert.isNotNull(order);
                    _a.label = 8;
                case 8:
                    _a.trys.push([8, 10, , 11]);
                    newOrder = __assign(__assign({}, (0, index_1.orderToJSON)(order)), { v: 1, r: "", s: "" });
                    return [4 /*yield*/, constants_2.apiToTest.postOrder(newOrder)];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 10:
                    error_3 = _a.sent();
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=api.js.map