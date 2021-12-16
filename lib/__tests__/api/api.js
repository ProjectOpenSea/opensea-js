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
import { assert } from "chai";
import { suite, test } from "mocha";
import * as Web3 from "web3";
import { WyvernProtocol } from "wyvern-js";
import { MAINNET_PROVIDER_URL, NULL_ADDRESS, ORDERBOOK_VERSION, ORDER_MATCHING_LATENCY_SECONDS, } from "../../constants";
import { orderToJSON, OpenSeaPort } from "../../index";
import { Network, OrderSide } from "../../types";
import { getOrderHash, makeBigNumber } from "../../utils/utils";
import { ALEX_ADDRESS, apiToTest, CK_ADDRESS, CK_RINKEBY_ADDRESS, CK_RINKEBY_SELLER_FEE, CK_RINKEBY_TOKEN_ID, mainApi, MAINNET_API_KEY, MYTHEREUM_ADDRESS, MYTHEREUM_TOKEN_ID, rinkebyApi, RINKEBY_API_KEY, WETH_ADDRESS, } from "../constants";
var provider = new Web3.providers.HttpProvider(MAINNET_PROVIDER_URL);
var client = new OpenSeaPort(provider, {
    networkName: Network.Main,
    apiKey: MAINNET_API_KEY,
}, function (line) { return console.info("MAINNET: ".concat(line)); });
suite("api", function () {
    test("API has correct base url", function () {
        assert.equal(mainApi.apiBaseUrl, "https://api.opensea.io");
        assert.equal(rinkebyApi.apiBaseUrl, "https://testnets-api.opensea.io");
    });
    test("API fetches bundles and prefetches sell orders", function () { return __awaiter(void 0, void 0, void 0, function () {
        var bundles, bundle;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiToTest.getBundles({
                        asset_contract_address: CK_RINKEBY_ADDRESS,
                    })];
                case 1:
                    bundles = (_a.sent()).bundles;
                    assert.isArray(bundles);
                    bundle = bundles[0];
                    assert.isNotNull(bundle);
                    if (!bundle) {
                        return [2 /*return*/];
                    }
                    assert.include(bundle.assets.map(function (a) { return a.assetContract.name; }), "CryptoKittiesRinkeby");
                    return [2 /*return*/];
            }
        });
    }); });
    test("Includes API key in token request", function () { return __awaiter(void 0, void 0, void 0, function () {
        var oldLogger, logPromise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    oldLogger = rinkebyApi.logger;
                    logPromise = new Promise(function (resolve, reject) {
                        rinkebyApi.logger = function (log) {
                            try {
                                assert.include(log, "\"X-API-KEY\":\"".concat(RINKEBY_API_KEY, "\""));
                                resolve();
                            }
                            catch (e) {
                                reject(e);
                            }
                            finally {
                                rinkebyApi.logger = oldLogger;
                            }
                        };
                        rinkebyApi.getPaymentTokens({ symbol: "WETH" });
                    });
                    return [4 /*yield*/, logPromise];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test("An API asset's order has correct hash", function () { return __awaiter(void 0, void 0, void 0, function () {
        var asset, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mainApi.getAsset({
                        tokenAddress: CK_ADDRESS,
                        tokenId: 1,
                    })];
                case 1:
                    asset = _a.sent();
                    assert.isNotNull(asset.orders);
                    if (!asset.orders) {
                        return [2 /*return*/];
                    }
                    order = asset.orders[0];
                    assert.isNotNull(order);
                    if (!order) {
                        return [2 /*return*/];
                    }
                    assert.equal(order.hash, getOrderHash(order));
                    return [2 /*return*/];
            }
        });
    }); });
    test("orderToJSON is correct", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, quantity, amountInToken, paymentTokenAddress, extraBountyBasisPoints, expirationTime, englishAuctionReservePrice, tokenId, tokenAddress, order, hashedOrder, orderData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    quantity = 1;
                    amountInToken = 1.2;
                    paymentTokenAddress = WETH_ADDRESS;
                    extraBountyBasisPoints = 0;
                    expirationTime = Math.round(Date.now() / 1000 + 60);
                    englishAuctionReservePrice = 2;
                    tokenId = MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = MYTHEREUM_ADDRESS;
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: quantity,
                            accountAddress: accountAddress,
                            startAmount: amountInToken,
                            paymentTokenAddress: paymentTokenAddress,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            buyerAddress: NULL_ADDRESS,
                            expirationTime: expirationTime,
                            waitForHighestBid: true,
                            englishAuctionReservePrice: englishAuctionReservePrice,
                        })];
                case 1:
                    order = _a.sent();
                    hashedOrder = __assign(__assign({}, order), { hash: getOrderHash(order) });
                    orderData = orderToJSON(hashedOrder);
                    assert.equal(orderData.quantity, quantity.toString());
                    assert.equal(orderData.maker, accountAddress);
                    assert.equal(orderData.taker, NULL_ADDRESS);
                    assert.equal(orderData.basePrice, WyvernProtocol.toBaseUnitAmount(makeBigNumber(amountInToken), 18).toString());
                    assert.equal(orderData.paymentToken, paymentTokenAddress);
                    assert.equal(orderData.extra, extraBountyBasisPoints.toString());
                    assert.equal(orderData.expirationTime, expirationTime + ORDER_MATCHING_LATENCY_SECONDS);
                    assert.equal(orderData.englishAuctionReservePrice, WyvernProtocol.toBaseUnitAmount(makeBigNumber(englishAuctionReservePrice), 18).toString());
                    return [2 /*return*/];
            }
        });
    }); });
    test("API fetches tokens", function () { return __awaiter(void 0, void 0, void 0, function () {
        var tokens;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiToTest.getPaymentTokens({ symbol: "MANA" })];
                case 1:
                    tokens = (_a.sent()).tokens;
                    assert.isArray(tokens);
                    assert.equal(tokens.length, 1);
                    assert.equal(tokens[0].name, "Decentraland MANA");
                    return [2 /*return*/];
            }
        });
    }); });
    test("Rinkeby API orders have correct OpenSea url", function () { return __awaiter(void 0, void 0, void 0, function () {
        var order, url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, rinkebyApi.getOrder({})];
                case 1:
                    order = _a.sent();
                    if (!order.asset) {
                        return [2 /*return*/];
                    }
                    url = "https://testnets.opensea.io/assets/".concat(order.asset.assetContract.address, "/").concat(order.asset.tokenId);
                    assert.equal(order.asset.openseaLink, url);
                    return [2 /*return*/];
            }
        });
    }); });
    test("Mainnet API orders have correct OpenSea url", function () { return __awaiter(void 0, void 0, void 0, function () {
        var order, url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mainApi.getOrder({})];
                case 1:
                    order = _a.sent();
                    if (!order.asset) {
                        return [2 /*return*/];
                    }
                    url = "https://opensea.io/assets/".concat(order.asset.assetContract.address, "/").concat(order.asset.tokenId);
                    assert.equal(order.asset.openseaLink, url);
                    return [2 /*return*/];
            }
        });
    }); });
    test("API fetches orderbook", function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, orders, count;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, apiToTest.getOrders()];
                case 1:
                    _a = _b.sent(), orders = _a.orders, count = _a.count;
                    assert.isArray(orders);
                    assert.isNumber(count);
                    assert.equal(orders.length, apiToTest.pageSize);
                    return [2 /*return*/];
            }
        });
    }); });
    test("API can change page size", function () { return __awaiter(void 0, void 0, void 0, function () {
        var defaultPageSize, orders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    defaultPageSize = apiToTest.pageSize;
                    apiToTest.pageSize = 7;
                    return [4 /*yield*/, apiToTest.getOrders()];
                case 1:
                    orders = (_a.sent()).orders;
                    assert.equal(orders.length, 7);
                    apiToTest.pageSize = defaultPageSize;
                    return [2 /*return*/];
            }
        });
    }); });
    if (ORDERBOOK_VERSION > 0) {
        test("API orderbook paginates", function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, orders, count, pagination;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, apiToTest.getOrders()];
                    case 1:
                        _a = _b.sent(), orders = _a.orders, count = _a.count;
                        return [4 /*yield*/, apiToTest.getOrders({}, 2)];
                    case 2:
                        pagination = _b.sent();
                        assert.equal(pagination.orders.length, apiToTest.pageSize);
                        assert.notDeepEqual(pagination.orders[0], orders[0]);
                        assert.equal(pagination.count, count);
                        return [2 /*return*/];
                }
            });
        }); });
    }
    test("API fetches orders for asset", function () { return __awaiter(void 0, void 0, void 0, function () {
        var forKitty;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiToTest.getOrders({
                        asset_contract_address: CK_RINKEBY_ADDRESS,
                        token_id: CK_RINKEBY_TOKEN_ID,
                    })];
                case 1:
                    forKitty = _a.sent();
                    assert.isArray(forKitty.orders);
                    return [2 /*return*/];
            }
        });
    }); });
    test("API fetches orders for asset owner", function () { return __awaiter(void 0, void 0, void 0, function () {
        var forOwner, owners;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiToTest.getOrders({ owner: ALEX_ADDRESS })];
                case 1:
                    forOwner = _a.sent();
                    assert.isAbove(forOwner.orders.length, 0);
                    assert.isAbove(forOwner.count, 0);
                    owners = forOwner.orders.map(function (o) { return o.asset && o.asset.owner && o.asset.owner.address; });
                    owners.forEach(function (owner) {
                        assert.include([ALEX_ADDRESS, NULL_ADDRESS], owner);
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    test("API fetches buy orders for maker", function () { return __awaiter(void 0, void 0, void 0, function () {
        var forMaker;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiToTest.getOrders({
                        maker: "0x5a237d6ce6d1fa3766fc15256cbfb8bdcf5a5b8a",
                        side: OrderSide.Buy,
                    })];
                case 1:
                    forMaker = _a.sent();
                    assert.isAbove(forMaker.orders.length, 0);
                    assert.isAbove(forMaker.count, 0);
                    forMaker.orders.forEach(function (order) {
                        assert.equal("0x5a237d6ce6d1fa3766fc15256cbfb8bdcf5a5b8a", order.maker);
                        assert.equal(OrderSide.Buy, order.side);
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    test("API excludes cancelledOrFinalized and markedInvalid orders", function () { return __awaiter(void 0, void 0, void 0, function () {
        var orders, finishedOrders, invalidOrders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiToTest.getOrders({ limit: 50 })];
                case 1:
                    orders = (_a.sent()).orders;
                    finishedOrders = orders.filter(function (o) { return o.cancelledOrFinalized; });
                    assert.isEmpty(finishedOrders);
                    invalidOrders = orders.filter(function (o) { return o.markedInvalid; });
                    assert.isEmpty(invalidOrders);
                    return [2 /*return*/];
            }
        });
    }); });
    test("API fetches fees for an asset", function () { return __awaiter(void 0, void 0, void 0, function () {
        var asset;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiToTest.getAsset({
                        tokenAddress: CK_RINKEBY_ADDRESS,
                        tokenId: CK_RINKEBY_TOKEN_ID,
                    })];
                case 1:
                    asset = _a.sent();
                    assert.equal(asset.tokenId, CK_RINKEBY_TOKEN_ID.toString());
                    assert.equal(asset.assetContract.name, "CryptoKittiesRinkeby");
                    assert.equal(asset.assetContract.sellerFeeBasisPoints, CK_RINKEBY_SELLER_FEE);
                    return [2 /*return*/];
            }
        });
    }); });
    test("API fetches assets", function () { return __awaiter(void 0, void 0, void 0, function () {
        var assets, asset;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, apiToTest.getAssets({
                        asset_contract_address: CK_RINKEBY_ADDRESS,
                        order_by: "sale_date",
                    })];
                case 1:
                    assets = (_a.sent()).assets;
                    assert.isArray(assets);
                    assert.equal(assets.length, apiToTest.pageSize);
                    asset = assets[0];
                    assert.equal(asset.assetContract.name, "CryptoKittiesRinkeby");
                    return [2 /*return*/];
            }
        });
    }); });
    test("API handles errors", function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1, error_2, res, order, newOrder, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, apiToTest.get("/user")];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    assert.include(error_1.message, "Unauthorized");
                    return [3 /*break*/, 3];
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, apiToTest.get("/asset/".concat(CK_RINKEBY_ADDRESS, "/0"))];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    assert.include(error_2.message, "Not found");
                    return [3 /*break*/, 6];
                case 6: return [4 /*yield*/, apiToTest.getOrders({
                        // Get an old order to make sure listing time is too early
                        listed_before: Math.round(Date.now() / 1000 - 3600),
                    })];
                case 7:
                    res = _a.sent();
                    order = res.orders[0];
                    assert.isNotNull(order);
                    _a.label = 8;
                case 8:
                    _a.trys.push([8, 10, , 11]);
                    newOrder = __assign(__assign({}, orderToJSON(order)), { v: 1, r: "", s: "" });
                    return [4 /*yield*/, apiToTest.postOrder(newOrder)];
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