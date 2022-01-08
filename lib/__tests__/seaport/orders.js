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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testMatchingNewOrder = void 0;
var bignumber_js_1 = require("bignumber.js");
var chai_1 = require("chai");
var mocha_1 = require("mocha");
var Web3 = __importStar(require("web3"));
var constants_1 = require("../../constants");
var index_1 = require("../../index");
var types_1 = require("../../types");
var utils_1 = require("../../utils/utils");
var constants_2 = require("../constants");
var orders_json_1 = __importDefault(require("../fixtures/orders.json"));
var fees_1 = require("./fees");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var ordersJSON = orders_json_1.default;
var englishSellOrderJSON = ordersJSON[0];
var provider = new Web3.providers.HttpProvider(constants_1.MAINNET_PROVIDER_URL);
var rinkebyProvider = new Web3.providers.HttpProvider(constants_1.RINKEBY_PROVIDER_URL);
var client = new index_1.OpenSeaPort(provider, {
    networkName: types_1.Network.Main,
    apiKey: constants_2.MAINNET_API_KEY,
}, function (line) { return console.info("MAINNET: ".concat(line)); });
var rinkebyClient = new index_1.OpenSeaPort(rinkebyProvider, {
    networkName: types_1.Network.Rinkeby,
    apiKey: constants_2.RINKEBY_API_KEY,
}, function (line) { return console.info("RINKEBY: ".concat(line)); });
var assetsForBundleOrder = [
    { tokenId: constants_2.MYTHEREUM_TOKEN_ID.toString(), tokenAddress: constants_2.MYTHEREUM_ADDRESS },
    {
        tokenId: constants_2.DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
        tokenAddress: constants_2.DIGITAL_ART_CHAIN_ADDRESS,
    },
];
var assetsForBulkTransfer = assetsForBundleOrder;
var manaAddress;
var daiAddress;
(0, mocha_1.suite)("seaport: orders", function () {
    (0, mocha_1.before)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getPaymentTokens({ symbol: "DAI" })];
                case 1:
                    daiAddress = (_a.sent())
                        .tokens[0].address;
                    return [4 /*yield*/, client.api.getPaymentTokens({ symbol: "MANA" })];
                case 2:
                    manaAddress = (_a.sent())
                        .tokens[0].address;
                    return [2 /*return*/];
            }
        });
    }); });
    ordersJSON.map(function (orderJSON, index) {
        (0, mocha_1.test)("Order #" + index + " has correct types", function () {
            var order = (0, utils_1.orderFromJSON)(orderJSON);
            chai_1.assert.instanceOf(order.basePrice, bignumber_js_1.BigNumber);
            chai_1.assert.typeOf(order.hash, "string");
            chai_1.assert.typeOf(order.maker, "string");
            chai_1.assert.equal(+order.quantity, 1);
        });
    });
    ordersJSON.map(function (orderJSON, index) {
        (0, mocha_1.test)("Order #" + index + " has correct hash", function () {
            var order = (0, utils_1.orderFromJSON)(orderJSON);
            chai_1.assert.equal(order.hash, (0, utils_1.getOrderHash)(order));
        });
    });
    (0, mocha_1.test)("Correctly sets decimals on fungible order", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, tokenId, tokenAddress, quantity, decimals, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_2.ALEX_ADDRESS;
                    tokenId = constants_2.DISSOLUTION_TOKEN_ID.toString();
                    tokenAddress = constants_1.ENJIN_ADDRESS;
                    quantity = 1;
                    decimals = 2;
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: {
                                tokenAddress: tokenAddress,
                                tokenId: tokenId,
                                decimals: decimals,
                                schemaName: types_1.WyvernSchemaName.ERC1155,
                            },
                            quantity: quantity,
                            accountAddress: accountAddress,
                            startAmount: 2,
                            extraBountyBasisPoints: 0,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            expirationTime: 0,
                            paymentTokenAddress: constants_1.NULL_ADDRESS,
                            waitForHighestBid: false,
                        })];
                case 1:
                    order = _a.sent();
                    chai_1.assert.equal(order.quantity.toNumber(), quantity * Math.pow(10, decimals));
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Correctly errors for invalid sell order price parameters", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, expirationTime, paymentTokenAddress, tokenId, tokenAddress, error_1, error_2, error_3, error_4, error_5, error_6, error_7, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_2.ALEX_ADDRESS;
                    expirationTime = Math.round(Date.now() / 1000 + 60);
                    paymentTokenAddress = manaAddress;
                    tokenId = constants_2.MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = constants_2.MYTHEREUM_ADDRESS;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: 2,
                            extraBountyBasisPoints: 0,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            expirationTime: 0,
                            paymentTokenAddress: paymentTokenAddress,
                            waitForHighestBid: true,
                        })];
                case 2:
                    _a.sent();
                    chai_1.assert.fail();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    chai_1.assert.include(error_1.message, "English auctions must have an expiration time");
                    return [3 /*break*/, 4];
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: 2,
                            endAmount: 1,
                            extraBountyBasisPoints: 0,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            expirationTime: expirationTime,
                            paymentTokenAddress: constants_1.NULL_ADDRESS,
                            waitForHighestBid: true,
                        })];
                case 5:
                    _a.sent();
                    chai_1.assert.fail();
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    chai_1.assert.include(error_2.message, "English auctions must use wrapped ETH");
                    return [3 /*break*/, 7];
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: 2,
                            endAmount: 3,
                            extraBountyBasisPoints: 0,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            expirationTime: expirationTime,
                            paymentTokenAddress: constants_1.NULL_ADDRESS,
                            waitForHighestBid: false,
                        })];
                case 8:
                    _a.sent();
                    chai_1.assert.fail();
                    return [3 /*break*/, 10];
                case 9:
                    error_3 = _a.sent();
                    chai_1.assert.include(error_3.message, "End price must be less than or equal to the start price");
                    return [3 /*break*/, 10];
                case 10:
                    _a.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: 2,
                            endAmount: 1,
                            extraBountyBasisPoints: 0,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            expirationTime: 0,
                            paymentTokenAddress: constants_1.NULL_ADDRESS,
                            waitForHighestBid: false,
                        })];
                case 11:
                    _a.sent();
                    chai_1.assert.fail();
                    return [3 /*break*/, 13];
                case 12:
                    error_4 = _a.sent();
                    chai_1.assert.include(error_4.message, "Expiration time must be set if order will change in price");
                    return [3 /*break*/, 13];
                case 13:
                    _a.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: 2,
                            listingTime: Math.round(Date.now() / 1000 - 60),
                            extraBountyBasisPoints: 0,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            expirationTime: 0,
                            paymentTokenAddress: constants_1.NULL_ADDRESS,
                            waitForHighestBid: false,
                        })];
                case 14:
                    _a.sent();
                    chai_1.assert.fail();
                    return [3 /*break*/, 16];
                case 15:
                    error_5 = _a.sent();
                    chai_1.assert.include(error_5.message, "Listing time cannot be in the past");
                    return [3 /*break*/, 16];
                case 16:
                    _a.trys.push([16, 18, , 19]);
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: 2,
                            listingTime: Math.round(Date.now() / 1000 + 20),
                            extraBountyBasisPoints: 0,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            expirationTime: expirationTime,
                            paymentTokenAddress: paymentTokenAddress,
                            waitForHighestBid: true,
                        })];
                case 17:
                    _a.sent();
                    chai_1.assert.fail();
                    return [3 /*break*/, 19];
                case 18:
                    error_6 = _a.sent();
                    chai_1.assert.include(error_6.message, "Cannot schedule an English auction for the future");
                    return [3 /*break*/, 19];
                case 19:
                    _a.trys.push([19, 21, , 22]);
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: 2,
                            extraBountyBasisPoints: 0,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            expirationTime: expirationTime,
                            paymentTokenAddress: paymentTokenAddress,
                            waitForHighestBid: false,
                            englishAuctionReservePrice: 1,
                        })];
                case 20:
                    _a.sent();
                    chai_1.assert.fail();
                    return [3 /*break*/, 22];
                case 21:
                    error_7 = _a.sent();
                    chai_1.assert.include(error_7.message, "Reserve prices may only be set on English auctions");
                    return [3 /*break*/, 22];
                case 22:
                    _a.trys.push([22, 24, , 25]);
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: 2,
                            extraBountyBasisPoints: 0,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            expirationTime: expirationTime,
                            paymentTokenAddress: paymentTokenAddress,
                            waitForHighestBid: true,
                            englishAuctionReservePrice: 1,
                        })];
                case 23:
                    _a.sent();
                    chai_1.assert.fail();
                    return [3 /*break*/, 25];
                case 24:
                    error_8 = _a.sent();
                    chai_1.assert.include(error_8.message, "Reserve price must be greater than or equal to the start amount");
                    return [3 /*break*/, 25];
                case 25: return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Correctly errors for invalid buy order price parameters", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, expirationTime, tokenId, tokenAddress, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_2.ALEX_ADDRESS_2;
                    expirationTime = Math.round(Date.now() / 1000 + 60);
                    tokenId = constants_2.MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = constants_2.MYTHEREUM_ADDRESS;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client._makeBuyOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: 2,
                            extraBountyBasisPoints: 0,
                            expirationTime: expirationTime,
                            paymentTokenAddress: constants_1.NULL_ADDRESS,
                        })];
                case 2:
                    _a.sent();
                    chai_1.assert.fail();
                    return [3 /*break*/, 4];
                case 3:
                    error_9 = _a.sent();
                    chai_1.assert.include(error_9.message, "Offers must use wrapped ETH or an ERC-20 token");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Cannot yet match a new English auction sell order, bountied", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInToken, paymentTokenAddress, expirationTime, bountyPercent, tokenId, tokenAddress, _asset, order, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_2.ALEX_ADDRESS;
                    takerAddress = constants_2.ALEX_ADDRESS_2;
                    amountInToken = 1.2;
                    paymentTokenAddress = constants_2.WETH_ADDRESS;
                    expirationTime = Math.round(Date.now() / 1000 + 60);
                    bountyPercent = 1.1;
                    tokenId = constants_2.MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = constants_2.MYTHEREUM_ADDRESS;
                    return [4 /*yield*/, client.api.getAsset({ tokenAddress: tokenAddress, tokenId: tokenId })];
                case 1:
                    _asset = _a.sent();
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: amountInToken,
                            paymentTokenAddress: paymentTokenAddress,
                            extraBountyBasisPoints: bountyPercent * 100,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            expirationTime: expirationTime,
                            waitForHighestBid: true,
                        })];
                case 2:
                    order = _a.sent();
                    chai_1.assert.equal(order.taker, constants_1.NULL_ADDRESS);
                    chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken);
                    chai_1.assert.equal(order.extra.toNumber(), 0);
                    // Make sure there's gap time to expire it
                    chai_1.assert.isAbove(order.expirationTime.toNumber(), expirationTime);
                    // Make sure it's listed in the future
                    chai_1.assert.equal(order.listingTime.toNumber(), expirationTime);
                    return [4 /*yield*/, client._sellOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, testMatchingNewOrder(order, takerAddress, expirationTime + 100)];
                case 5:
                    _a.sent();
                    chai_1.assert.fail();
                    return [3 /*break*/, 7];
                case 6:
                    error_10 = _a.sent();
                    chai_1.assert.include(error_10.message, "Buy-side order is set in the future or expired");
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    mocha_1.test.skip("Can match a finished English auction sell order", function () { return __awaiter(void 0, void 0, void 0, function () {
        var makerAddress, takerAddress, matcherAddress, now, paymentTokenAddress, orders, buy, sell, sellPrice, buyPrice, gas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    makerAddress = constants_2.ALEX_ADDRESS_2;
                    takerAddress = constants_2.ALEX_ADDRESS;
                    matcherAddress = constants_2.DEVIN_ADDRESS;
                    now = Math.round(Date.now() / 1000);
                    paymentTokenAddress = constants_2.WETH_ADDRESS;
                    return [4 /*yield*/, rinkebyClient.api.getOrders({
                            side: types_1.OrderSide.Buy,
                            asset_contract_address: constants_2.CK_RINKEBY_ADDRESS,
                            token_id: constants_2.CK_RINKEBY_TOKEN_ID,
                            payment_token_address: paymentTokenAddress,
                            maker: makerAddress,
                        })];
                case 1:
                    orders = (_a.sent()).orders;
                    buy = orders[0];
                    chai_1.assert.isDefined(buy);
                    chai_1.assert.isDefined(buy.asset);
                    if (!buy || !buy.asset) {
                        return [2 /*return*/];
                    }
                    // Make sure it's listed in the past
                    chai_1.assert.isBelow(buy.listingTime.toNumber(), now);
                    (0, fees_1.testFeesMakerOrder)(buy, buy.asset.collection);
                    sell = (0, utils_1.orderFromJSON)(englishSellOrderJSON);
                    chai_1.assert.equal(+sell.quantity, 1);
                    chai_1.assert.equal(sell.feeRecipient, constants_1.NULL_ADDRESS);
                    chai_1.assert.equal(sell.paymentToken, paymentTokenAddress);
                    /* Requirements in Wyvern contract for funds transfer. */
                    chai_1.assert.isAtMost(buy.takerRelayerFee.toNumber(), sell.takerRelayerFee.toNumber());
                    chai_1.assert.isAtMost(buy.takerProtocolFee.toNumber(), sell.takerProtocolFee.toNumber());
                    return [4 /*yield*/, rinkebyClient.getCurrentPrice(sell)];
                case 2:
                    sellPrice = _a.sent();
                    return [4 /*yield*/, rinkebyClient.getCurrentPrice(buy)];
                case 3:
                    buyPrice = _a.sent();
                    chai_1.assert.isAtLeast(buyPrice.toNumber(), sellPrice.toNumber());
                    console.info("Matching two orders that differ in price by ".concat(buyPrice.toNumber() - sellPrice.toNumber()));
                    return [4 /*yield*/, rinkebyClient._buyOrderValidationAndApprovals({
                            order: buy,
                            accountAddress: makerAddress,
                        })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, rinkebyClient._sellOrderValidationAndApprovals({
                            order: sell,
                            accountAddress: takerAddress,
                        })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, rinkebyClient._estimateGasForMatch({
                            buy: buy,
                            sell: sell,
                            accountAddress: matcherAddress,
                        })];
                case 6:
                    gas = _a.sent();
                    chai_1.assert.isAbove(gas || 0, 0);
                    console.info("Match gas cost: ".concat(gas));
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Ensures buy order compatibility with an English sell order", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, paymentTokenAddress, amountInToken, expirationTime, extraBountyBasisPoints, tokenId, tokenAddress, asset, sellOrder, buyOrder;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_2.ALEX_ADDRESS_2;
                    takerAddress = constants_2.ALEX_ADDRESS;
                    paymentTokenAddress = constants_2.WETH_ADDRESS;
                    amountInToken = 0.01;
                    expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24);
                    extraBountyBasisPoints = 1.1 * 100;
                    tokenId = constants_2.MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = constants_2.MYTHEREUM_ADDRESS;
                    return [4 /*yield*/, client.api.getAsset({ tokenAddress: tokenAddress, tokenId: tokenId })];
                case 1:
                    asset = _a.sent();
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: takerAddress,
                            startAmount: amountInToken,
                            paymentTokenAddress: paymentTokenAddress,
                            expirationTime: expirationTime,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            waitForHighestBid: true,
                        })];
                case 2:
                    sellOrder = _a.sent();
                    return [4 /*yield*/, client._makeBuyOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId, schemaName: types_1.WyvernSchemaName.ERC721 },
                            quantity: 1,
                            accountAddress: accountAddress,
                            paymentTokenAddress: paymentTokenAddress,
                            startAmount: amountInToken,
                            expirationTime: 0,
                            extraBountyBasisPoints: 0,
                            sellOrder: sellOrder,
                        })];
                case 3:
                    buyOrder = _a.sent();
                    (0, fees_1.testFeesMakerOrder)(buyOrder, asset.collection);
                    chai_1.assert.equal(sellOrder.taker, constants_1.NULL_ADDRESS);
                    chai_1.assert.equal(buyOrder.taker, sellOrder.maker);
                    chai_1.assert.equal(buyOrder.makerRelayerFee.toNumber(), sellOrder.makerRelayerFee.toNumber());
                    chai_1.assert.equal(buyOrder.takerRelayerFee.toNumber(), sellOrder.takerRelayerFee.toNumber());
                    chai_1.assert.equal(buyOrder.makerProtocolFee.toNumber(), sellOrder.makerProtocolFee.toNumber());
                    chai_1.assert.equal(buyOrder.takerProtocolFee.toNumber(), sellOrder.takerProtocolFee.toNumber());
                    return [4 /*yield*/, client._buyOrderValidationAndApprovals({
                            order: buyOrder,
                            accountAddress: accountAddress,
                        })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, client._sellOrderValidationAndApprovals({
                            order: sellOrder,
                            accountAddress: takerAddress,
                        })];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Ensures ERC721v3 buy order compatibility with an English sell order", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, paymentTokenAddress, amountInToken, expirationTime, extraBountyBasisPoints, tokenId, tokenAddress, asset, sellOrder, buyOrder;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_2.ALEX_ADDRESS_2;
                    takerAddress = constants_2.ALEX_ADDRESS;
                    paymentTokenAddress = constants_2.WETH_ADDRESS;
                    amountInToken = 0.01;
                    expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24);
                    extraBountyBasisPoints = 1.1 * 100;
                    tokenId = constants_2.MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = constants_2.MYTHEREUM_ADDRESS;
                    return [4 /*yield*/, client.api.getAsset({ tokenAddress: tokenAddress, tokenId: tokenId })];
                case 1:
                    asset = _a.sent();
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: takerAddress,
                            startAmount: amountInToken,
                            paymentTokenAddress: paymentTokenAddress,
                            expirationTime: expirationTime,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            waitForHighestBid: true,
                        })];
                case 2:
                    sellOrder = _a.sent();
                    return [4 /*yield*/, client._makeBuyOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId, schemaName: types_1.WyvernSchemaName.ERC721v3 },
                            quantity: 1,
                            accountAddress: accountAddress,
                            paymentTokenAddress: paymentTokenAddress,
                            startAmount: amountInToken,
                            expirationTime: 0,
                            extraBountyBasisPoints: 0,
                            sellOrder: sellOrder,
                        })];
                case 3:
                    buyOrder = _a.sent();
                    (0, fees_1.testFeesMakerOrder)(buyOrder, asset.collection);
                    chai_1.assert.equal(sellOrder.taker, constants_1.NULL_ADDRESS);
                    chai_1.assert.equal(buyOrder.taker, sellOrder.maker);
                    chai_1.assert.equal(buyOrder.makerRelayerFee.toNumber(), sellOrder.makerRelayerFee.toNumber());
                    chai_1.assert.equal(buyOrder.takerRelayerFee.toNumber(), sellOrder.takerRelayerFee.toNumber());
                    chai_1.assert.equal(buyOrder.makerProtocolFee.toNumber(), sellOrder.makerProtocolFee.toNumber());
                    chai_1.assert.equal(buyOrder.takerProtocolFee.toNumber(), sellOrder.takerProtocolFee.toNumber());
                    return [4 /*yield*/, client._buyOrderValidationAndApprovals({
                            order: buyOrder,
                            accountAddress: accountAddress,
                        })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, client._sellOrderValidationAndApprovals({
                            order: sellOrder,
                            accountAddress: takerAddress,
                        })];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Ensures buy order compatibility with an ERC721v3 English sell order", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, paymentTokenAddress, amountInToken, expirationTime, extraBountyBasisPoints, tokenId, tokenAddress, asset, sellOrder, buyOrder;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_2.ALEX_ADDRESS_2;
                    takerAddress = constants_2.ALEX_ADDRESS;
                    paymentTokenAddress = constants_2.WETH_ADDRESS;
                    amountInToken = 0.01;
                    expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24);
                    extraBountyBasisPoints = 1.1 * 100;
                    tokenId = constants_2.MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = constants_2.MYTHEREUM_ADDRESS;
                    return [4 /*yield*/, client.api.getAsset({ tokenAddress: tokenAddress, tokenId: tokenId })];
                case 1:
                    asset = _a.sent();
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId, schemaName: types_1.WyvernSchemaName.ERC721v3 },
                            quantity: 1,
                            accountAddress: takerAddress,
                            startAmount: amountInToken,
                            paymentTokenAddress: paymentTokenAddress,
                            expirationTime: expirationTime,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            waitForHighestBid: true,
                        })];
                case 2:
                    sellOrder = _a.sent();
                    return [4 /*yield*/, client._makeBuyOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: accountAddress,
                            paymentTokenAddress: paymentTokenAddress,
                            startAmount: amountInToken,
                            expirationTime: 0,
                            extraBountyBasisPoints: 0,
                            sellOrder: sellOrder,
                        })];
                case 3:
                    buyOrder = _a.sent();
                    (0, fees_1.testFeesMakerOrder)(buyOrder, asset.collection);
                    chai_1.assert.equal(sellOrder.taker, constants_1.NULL_ADDRESS);
                    chai_1.assert.equal(buyOrder.taker, sellOrder.maker);
                    chai_1.assert.equal(buyOrder.makerRelayerFee.toNumber(), sellOrder.makerRelayerFee.toNumber());
                    chai_1.assert.equal(buyOrder.takerRelayerFee.toNumber(), sellOrder.takerRelayerFee.toNumber());
                    chai_1.assert.equal(buyOrder.makerProtocolFee.toNumber(), sellOrder.makerProtocolFee.toNumber());
                    chai_1.assert.equal(buyOrder.takerProtocolFee.toNumber(), sellOrder.takerProtocolFee.toNumber());
                    return [4 /*yield*/, client._buyOrderValidationAndApprovals({
                            order: buyOrder,
                            accountAddress: accountAddress,
                        })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, client._sellOrderValidationAndApprovals({
                            order: sellOrder,
                            accountAddress: takerAddress,
                        })];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_1.test.skip("Creates ENS name buy order", function () { return __awaiter(void 0, void 0, void 0, function () {
        var paymentTokenAddress, _buyOrder;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    paymentTokenAddress = constants_2.WETH_ADDRESS;
                    return [4 /*yield*/, rinkebyClient._makeBuyOrder({
                            asset: {
                                tokenId: constants_2.ENS_HELLO_TOKEN_ID,
                                tokenAddress: constants_2.ENS_RINKEBY_TOKEN_ADDRESS,
                                name: constants_2.ENS_HELLO_NAME,
                                schemaName: types_1.WyvernSchemaName.ENSShortNameAuction,
                            },
                            quantity: 1,
                            accountAddress: constants_2.ENS_RINKEBY_SHORT_NAME_OWNER,
                            paymentTokenAddress: paymentTokenAddress,
                            startAmount: 0.01,
                            expirationTime: Math.round(Date.now() / 1000 + 60 * 60 * 24),
                            extraBountyBasisPoints: 0,
                        })];
                case 1:
                    _buyOrder = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Matches a private sell order, doesn't for wrong taker", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInToken, bountyPercent, tokenId, tokenAddress, asset, order, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_2.ALEX_ADDRESS;
                    takerAddress = constants_2.ALEX_ADDRESS_2;
                    amountInToken = 2;
                    bountyPercent = 1;
                    tokenId = constants_2.MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = constants_2.MYTHEREUM_ADDRESS;
                    return [4 /*yield*/, client.api.getAsset({ tokenAddress: tokenAddress, tokenId: tokenId })];
                case 1:
                    asset = _a.sent();
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: amountInToken,
                            extraBountyBasisPoints: bountyPercent * 100,
                            buyerAddress: takerAddress,
                            expirationTime: 0,
                            paymentTokenAddress: constants_1.NULL_ADDRESS,
                            waitForHighestBid: false,
                        })];
                case 2:
                    order = _a.sent();
                    chai_1.assert.equal(order.paymentToken, constants_1.NULL_ADDRESS);
                    chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken);
                    chai_1.assert.equal(order.extra.toNumber(), 0);
                    chai_1.assert.equal(order.expirationTime.toNumber(), 0);
                    (0, fees_1.testFeesMakerOrder)(order, asset.collection, bountyPercent * 100);
                    return [4 /*yield*/, client._sellOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })];
                case 3:
                    _a.sent();
                    // Make sure match is valid
                    return [4 /*yield*/, testMatchingNewOrder(order, takerAddress)];
                case 4:
                    // Make sure match is valid
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, testMatchingNewOrder(order, constants_2.DEVIN_ADDRESS)];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    e_1 = _a.sent();
                    // It works!
                    return [2 /*return*/];
                case 8:
                    chai_1.assert.fail();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Matches a new dutch sell order of a small amount of ERC-20 item (DAI) for ETH", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInEth, tokenId, tokenAddress, expirationTime, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_2.ALEX_ADDRESS;
                    takerAddress = constants_2.ALEX_ADDRESS_2;
                    amountInEth = 0.012;
                    tokenId = null;
                    tokenAddress = daiAddress;
                    expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24);
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId, schemaName: types_1.WyvernSchemaName.ERC20 },
                            quantity: Math.pow(10, 18) * 0.01,
                            accountAddress: accountAddress,
                            startAmount: amountInEth,
                            endAmount: 0,
                            paymentTokenAddress: constants_1.NULL_ADDRESS,
                            extraBountyBasisPoints: 0,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            expirationTime: expirationTime,
                            waitForHighestBid: false,
                        })];
                case 1:
                    order = _a.sent();
                    chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
                    chai_1.assert.equal(order.extra.toNumber(), Math.pow(10, 18) * amountInEth);
                    chai_1.assert.equal(order.expirationTime.toNumber(), expirationTime);
                    return [4 /*yield*/, client._sellOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })];
                case 2:
                    _a.sent();
                    // Make sure match is valid
                    return [4 /*yield*/, testMatchingNewOrder(order, takerAddress)];
                case 3:
                    // Make sure match is valid
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Matches a new sell order of an 1155 item for ETH", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInEth, tokenId, tokenAddress, asset, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_2.ALEX_ADDRESS;
                    takerAddress = constants_2.ALEX_ADDRESS_2;
                    amountInEth = 2;
                    tokenId = constants_2.CATS_IN_MECHS_ID;
                    tokenAddress = constants_1.ENJIN_ADDRESS;
                    return [4 /*yield*/, client.api.getAsset({ tokenAddress: tokenAddress, tokenId: tokenId })];
                case 1:
                    asset = _a.sent();
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId, schemaName: types_1.WyvernSchemaName.ERC1155 },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: amountInEth,
                            paymentTokenAddress: constants_1.NULL_ADDRESS,
                            extraBountyBasisPoints: 0,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            expirationTime: 0,
                            waitForHighestBid: false,
                        })];
                case 2:
                    order = _a.sent();
                    chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
                    chai_1.assert.equal(order.extra.toNumber(), 0);
                    chai_1.assert.equal(order.expirationTime.toNumber(), 0);
                    (0, fees_1.testFeesMakerOrder)(order, asset.collection);
                    return [4 /*yield*/, client._sellOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })];
                case 3:
                    _a.sent();
                    // Make sure match is valid
                    return [4 /*yield*/, testMatchingNewOrder(order, takerAddress)];
                case 4:
                    // Make sure match is valid
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Matches a buy order of an 1155 item for W-ETH", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, paymentToken, amountInToken, tokenId, tokenAddress, asset, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_2.ALEX_ADDRESS_2;
                    takerAddress = constants_2.ALEX_ADDRESS;
                    paymentToken = constants_2.WETH_ADDRESS;
                    amountInToken = 0.01;
                    tokenId = constants_2.DISSOLUTION_TOKEN_ID;
                    tokenAddress = constants_1.ENJIN_ADDRESS;
                    return [4 /*yield*/, client.api.getAsset({ tokenAddress: tokenAddress, tokenId: tokenId })];
                case 1:
                    asset = _a.sent();
                    return [4 /*yield*/, client._makeBuyOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId, schemaName: types_1.WyvernSchemaName.ERC1155 },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: amountInToken,
                            paymentTokenAddress: paymentToken,
                            expirationTime: 0,
                            extraBountyBasisPoints: 0,
                        })];
                case 2:
                    order = _a.sent();
                    chai_1.assert.equal(order.taker, constants_1.NULL_ADDRESS);
                    chai_1.assert.equal(order.paymentToken, paymentToken);
                    chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken);
                    chai_1.assert.equal(order.extra.toNumber(), 0);
                    chai_1.assert.equal(order.expirationTime.toNumber(), 0);
                    (0, fees_1.testFeesMakerOrder)(order, asset.collection);
                    return [4 /*yield*/, client._buyOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })];
                case 3:
                    _a.sent();
                    // Make sure match is valid
                    return [4 /*yield*/, testMatchingNewOrder(order, takerAddress)];
                case 4:
                    // Make sure match is valid
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Matches a new bountied sell order for an ERC-20 token (MANA)", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, paymentToken, amountInToken, bountyPercent, tokenId, tokenAddress, asset, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_2.ALEX_ADDRESS;
                    takerAddress = constants_2.ALEX_ADDRESS_2;
                    return [4 /*yield*/, client.api.getPaymentTokens({ symbol: "MANA" })];
                case 1:
                    paymentToken = (_a.sent())
                        .tokens[0];
                    amountInToken = 5000;
                    bountyPercent = 1;
                    tokenId = constants_2.MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = constants_2.MYTHEREUM_ADDRESS;
                    return [4 /*yield*/, client.api.getAsset({ tokenAddress: tokenAddress, tokenId: tokenId })];
                case 2:
                    asset = _a.sent();
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: amountInToken,
                            paymentTokenAddress: paymentToken.address,
                            extraBountyBasisPoints: bountyPercent * 100,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            expirationTime: 0,
                            waitForHighestBid: false,
                        })];
                case 3:
                    order = _a.sent();
                    chai_1.assert.equal(order.paymentToken, paymentToken.address);
                    chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, paymentToken.decimals) * amountInToken);
                    chai_1.assert.equal(order.extra.toNumber(), 0);
                    chai_1.assert.equal(order.expirationTime.toNumber(), 0);
                    (0, fees_1.testFeesMakerOrder)(order, asset.collection, bountyPercent * 100);
                    return [4 /*yield*/, client._sellOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })];
                case 4:
                    _a.sent();
                    // Make sure match is valid
                    return [4 /*yield*/, testMatchingNewOrder(order, takerAddress)];
                case 5:
                    // Make sure match is valid
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Matches a buy order with an ERC-20 token (DAI)", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, paymentToken, amountInToken, tokenId, tokenAddress, asset, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_2.ALEX_ADDRESS;
                    takerAddress = constants_2.ALEX_ADDRESS_2;
                    return [4 /*yield*/, client.api.getPaymentTokens({ symbol: "DAI" })];
                case 1:
                    paymentToken = (_a.sent())
                        .tokens[0];
                    amountInToken = 3;
                    tokenId = constants_2.CK_TOKEN_ID.toString();
                    tokenAddress = constants_2.CK_ADDRESS;
                    return [4 /*yield*/, client.api.getAsset({ tokenAddress: tokenAddress, tokenId: tokenId })];
                case 2:
                    asset = _a.sent();
                    return [4 /*yield*/, client._makeBuyOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: amountInToken,
                            paymentTokenAddress: paymentToken.address,
                            expirationTime: 0,
                            extraBountyBasisPoints: 0,
                        })];
                case 3:
                    order = _a.sent();
                    chai_1.assert.equal(order.taker, constants_1.NULL_ADDRESS);
                    chai_1.assert.equal(order.paymentToken, paymentToken.address);
                    chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, paymentToken.decimals) * amountInToken);
                    chai_1.assert.equal(order.extra.toNumber(), 0);
                    chai_1.assert.equal(order.expirationTime.toNumber(), 0);
                    (0, fees_1.testFeesMakerOrder)(order, asset.collection);
                    return [4 /*yield*/, client._buyOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })];
                case 4:
                    _a.sent();
                    // Make sure match is valid
                    return [4 /*yield*/, testMatchingNewOrder(order, takerAddress)];
                case 5:
                    // Make sure match is valid
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Serializes payment token and matches most recent ERC-20 sell order", function () { return __awaiter(void 0, void 0, void 0, function () {
        var takerAddress, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    takerAddress = constants_2.ALEX_ADDRESS;
                    return [4 /*yield*/, client.api.getOrder({
                            side: types_1.OrderSide.Sell,
                            payment_token_address: manaAddress,
                        })];
                case 1:
                    order = _a.sent();
                    chai_1.assert.isNotNull(order.paymentTokenContract);
                    if (!order.paymentTokenContract) {
                        return [2 /*return*/];
                    }
                    chai_1.assert.equal(order.paymentTokenContract.address, manaAddress);
                    chai_1.assert.equal(order.paymentToken, manaAddress);
                    // TODO why can't we test atomicMatch?
                    return [4 /*yield*/, testMatchingOrder(order, takerAddress, false)];
                case 2:
                    // TODO why can't we test atomicMatch?
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Bulk transfer", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, gas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_2.ALEX_ADDRESS;
                    takerAddress = constants_2.ALEX_ADDRESS_2;
                    return [4 /*yield*/, client._estimateGasForTransfer({
                            assets: assetsForBulkTransfer,
                            fromAddress: accountAddress,
                            toAddress: takerAddress,
                        })];
                case 1:
                    gas = _a.sent();
                    chai_1.assert.isAbove(gas, 0);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Fungible tokens filter", function () { return __awaiter(void 0, void 0, void 0, function () {
        var manaTokens, mana, dai, all;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getPaymentTokens({ symbol: "MANA" })];
                case 1:
                    manaTokens = (_a.sent())
                        .tokens;
                    chai_1.assert.equal(manaTokens.length, 1);
                    mana = manaTokens[0];
                    chai_1.assert.isNotNull(mana);
                    chai_1.assert.equal(mana.name, "Decentraland MANA");
                    chai_1.assert.equal(mana.address, "0x0f5d2fb29fb7d3cfee444a200298f468908cc942");
                    chai_1.assert.equal(mana.decimals, 18);
                    return [4 /*yield*/, client.api.getPaymentTokens({ symbol: "DAI" })];
                case 2:
                    dai = (_a.sent())
                        .tokens[0];
                    chai_1.assert.isNotNull(dai);
                    chai_1.assert.equal(dai.name, "Dai Stablecoin");
                    chai_1.assert.equal(dai.decimals, 18);
                    return [4 /*yield*/, client.api.getPaymentTokens()];
                case 3:
                    all = _a.sent();
                    chai_1.assert.isNotEmpty(all);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("orderToJSON computes correct current price for Dutch auctions", function () { return __awaiter(void 0, void 0, void 0, function () {
        var orders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getOrders({
                        sale_kind: types_1.SaleKind.DutchAuction,
                    })];
                case 1:
                    orders = (_a.sent()).orders;
                    chai_1.assert.equal(orders.length, client.api.pageSize);
                    orders.map(function (order) {
                        chai_1.assert.isNotNull(order.currentPrice);
                        var buyerFeeBPS = order.asset
                            ? order.asset.assetContract.buyerFeeBasisPoints
                            : order.assetBundle && order.assetBundle.assetContract
                                ? order.assetBundle.assetContract.buyerFeeBasisPoints
                                : null;
                        if (!order.currentPrice || buyerFeeBPS) {
                            // Skip checks with buyer fees
                            return;
                        }
                        var multiple = order.side == types_1.OrderSide.Sell
                            ? +order.takerRelayerFee / constants_1.INVERSE_BASIS_POINT + 1
                            : 1;
                        // Possible race condition
                        chai_1.assert.equal(order.currentPrice.toPrecision(3), (0, utils_1.estimateCurrentPrice)(order).toPrecision(3));
                        chai_1.assert.isAtLeast(order.basePrice.times(multiple).toNumber(), order.currentPrice.toNumber());
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    // Skipping brittle test, due to token id dependency
    mocha_1.test.skip("orderToJSON current price includes buyer fee", function () { return __awaiter(void 0, void 0, void 0, function () {
        var orders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getOrders({
                        sale_kind: types_1.SaleKind.FixedPrice,
                        asset_contract_address: constants_2.CRYPTOFLOWERS_CONTRACT_ADDRESS_WITH_BUYER_FEE,
                        token_id: 8645,
                        bundled: false,
                        side: types_1.OrderSide.Sell,
                        is_english: false,
                    })];
                case 1:
                    orders = (_a.sent()).orders;
                    chai_1.assert.isNotEmpty(orders);
                    orders.map(function (order) {
                        chai_1.assert.isNotNull(order.currentPrice);
                        chai_1.assert.isNotNull(order.asset);
                        if (!order.currentPrice || !order.asset) {
                            return;
                        }
                        var buyerFeeBPS = order.takerRelayerFee;
                        var multiple = +buyerFeeBPS / constants_1.INVERSE_BASIS_POINT + 1;
                        chai_1.assert.equal(order.basePrice.times(multiple).toNumber(), (0, utils_1.estimateCurrentPrice)(order).toNumber());
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("orderToJSON current price does not include buyer fee for English auctions", function () { return __awaiter(void 0, void 0, void 0, function () {
        var orders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getOrders({
                        side: types_1.OrderSide.Sell,
                        is_english: true,
                    })];
                case 1:
                    orders = (_a.sent()).orders;
                    chai_1.assert.isNotEmpty(orders);
                    orders.map(function (order) {
                        chai_1.assert.isNotNull(order.currentPrice);
                        chai_1.assert.isNotNull(order.asset);
                        if (!order.currentPrice || !order.asset) {
                            return;
                        }
                        chai_1.assert.equal(order.basePrice.toNumber(), (0, utils_1.estimateCurrentPrice)(order).toNumber());
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_1.test.skip("Matches first buy order in book", function () { return __awaiter(void 0, void 0, void 0, function () {
        var order, assetOrBundle, takerAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getOrder({ side: types_1.OrderSide.Buy })];
                case 1:
                    order = _a.sent();
                    chai_1.assert.isNotNull(order);
                    if (!order) {
                        return [2 /*return*/];
                    }
                    assetOrBundle = order.asset || order.assetBundle;
                    chai_1.assert.isNotNull(assetOrBundle);
                    if (!assetOrBundle) {
                        return [2 /*return*/];
                    }
                    takerAddress = order.maker;
                    // Taker might not have all approval permissions so only test match
                    return [4 /*yield*/, testMatchingOrder(order, takerAddress, false)];
                case 2:
                    // Taker might not have all approval permissions so only test match
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_1.test.skip("Matches a buy order and estimates gas on fulfillment", function () { return __awaiter(void 0, void 0, void 0, function () {
        var takerAddress, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    takerAddress = constants_2.ALEX_ADDRESS;
                    return [4 /*yield*/, client.api.getOrder({
                            side: types_1.OrderSide.Buy,
                            owner: takerAddress,
                            // Use a token that has already been approved via approve-all
                            asset_contract_address: constants_2.DIGITAL_ART_CHAIN_ADDRESS,
                            token_id: constants_2.DIGITAL_ART_CHAIN_TOKEN_ID,
                        })];
                case 1:
                    order = _a.sent();
                    chai_1.assert.isNotNull(order);
                    if (!order) {
                        return [2 /*return*/];
                    }
                    chai_1.assert.isNotNull(order.asset);
                    if (!order.asset) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, testMatchingOrder(order, takerAddress, true)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
function testMatchingOrder(order, accountAddress, testAtomicMatch, referrerAddress) {
    if (testAtomicMatch === void 0) { testAtomicMatch = false; }
    return __awaiter(this, void 0, void 0, function () {
        var recipientAddress, matchingOrder, _a, buy, sell, isValid, isValid, isFulfillable;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    recipientAddress = order.side === types_1.OrderSide.Sell ? constants_2.ALEX_ADDRESS_2 : accountAddress;
                    matchingOrder = client._makeMatchingOrder({
                        order: order,
                        accountAddress: accountAddress,
                        recipientAddress: recipientAddress,
                    });
                    chai_1.assert.equal(matchingOrder.hash, (0, utils_1.getOrderHash)(matchingOrder));
                    _a = (0, utils_1.assignOrdersToSides)(order, matchingOrder), buy = _a.buy, sell = _a.sell;
                    if (!!order.waitingForBestCounterOrder) return [3 /*break*/, 2];
                    return [4 /*yield*/, client._validateMatch({ buy: buy, sell: sell, accountAddress: accountAddress })];
                case 1:
                    isValid = _b.sent();
                    chai_1.assert.isTrue(isValid);
                    return [3 /*break*/, 3];
                case 2:
                    console.info("English Auction detected, skipping validation");
                    _b.label = 3;
                case 3:
                    if (!(testAtomicMatch && !order.waitingForBestCounterOrder)) return [3 /*break*/, 6];
                    return [4 /*yield*/, client._validateOrder(order)];
                case 4:
                    isValid = _b.sent();
                    chai_1.assert.isTrue(isValid);
                    return [4 /*yield*/, client.isOrderFulfillable({
                            order: order,
                            accountAddress: accountAddress,
                            recipientAddress: recipientAddress,
                            referrerAddress: referrerAddress,
                        })];
                case 5:
                    isFulfillable = _b.sent();
                    chai_1.assert.isTrue(isFulfillable);
                    _b.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
function testMatchingNewOrder(unhashedOrder, accountAddress, counterOrderListingTime) {
    return __awaiter(this, void 0, void 0, function () {
        var order, matchingOrder, v, r, s, buy, sell, isValid;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    order = __assign(__assign({}, unhashedOrder), { hash: (0, utils_1.getOrderHash)(unhashedOrder) });
                    matchingOrder = client._makeMatchingOrder({
                        order: order,
                        accountAddress: accountAddress,
                        recipientAddress: accountAddress,
                    });
                    if (counterOrderListingTime != null) {
                        matchingOrder.listingTime = (0, utils_1.makeBigNumber)(counterOrderListingTime);
                        matchingOrder.hash = (0, utils_1.getOrderHash)(matchingOrder);
                    }
                    chai_1.assert.equal(matchingOrder.hash, (0, utils_1.getOrderHash)(matchingOrder));
                    // Test fees
                    chai_1.assert.equal(matchingOrder.makerProtocolFee.toNumber(), 0);
                    chai_1.assert.equal(matchingOrder.takerProtocolFee.toNumber(), 0);
                    if (order.waitingForBestCounterOrder) {
                        chai_1.assert.equal(matchingOrder.feeRecipient, constants_1.OPENSEA_FEE_RECIPIENT);
                    }
                    else {
                        chai_1.assert.equal(matchingOrder.feeRecipient, constants_1.NULL_ADDRESS);
                    }
                    chai_1.assert.equal(matchingOrder.makerRelayerFee.toNumber(), order.makerRelayerFee.toNumber());
                    chai_1.assert.equal(matchingOrder.takerRelayerFee.toNumber(), order.takerRelayerFee.toNumber());
                    chai_1.assert.equal(matchingOrder.makerReferrerFee.toNumber(), order.makerReferrerFee.toNumber());
                    v = 27;
                    r = "";
                    s = "";
                    if (order.side == types_1.OrderSide.Buy) {
                        buy = __assign(__assign({}, order), { v: v, r: r, s: s });
                        sell = __assign(__assign({}, matchingOrder), { v: v, r: r, s: s });
                    }
                    else {
                        sell = __assign(__assign({}, order), { v: v, r: r, s: s });
                        buy = __assign(__assign({}, matchingOrder), { v: v, r: r, s: s });
                    }
                    return [4 /*yield*/, client._validateMatch({ buy: buy, sell: sell, accountAddress: accountAddress })];
                case 1:
                    isValid = _a.sent();
                    chai_1.assert.isTrue(isValid);
                    // Make sure assets are transferrable
                    return [4 /*yield*/, Promise.all(getAssetsAndQuantities(order).map(function (_a) {
                            var asset = _a.asset, quantity = _a.quantity;
                            return __awaiter(_this, void 0, void 0, function () {
                                var fromAddress, toAddress, useProxy, isTransferrable;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            fromAddress = sell.maker;
                                            toAddress = buy.maker;
                                            useProxy = asset.tokenAddress === constants_2.CK_ADDRESS ||
                                                asset.schemaName === types_1.WyvernSchemaName.ERC20;
                                            return [4 /*yield*/, client.isAssetTransferrable({
                                                    asset: asset,
                                                    quantity: quantity,
                                                    fromAddress: fromAddress,
                                                    toAddress: toAddress,
                                                    useProxy: useProxy,
                                                })];
                                        case 1:
                                            isTransferrable = _b.sent();
                                            chai_1.assert.isTrue(isTransferrable, "Not transferrable: ".concat(asset.tokenAddress, " # ").concat(asset.tokenId, " schema ").concat(asset.schemaName, " quantity ").concat(quantity, " from ").concat(fromAddress, " to ").concat(toAddress, " using proxy: ").concat(useProxy));
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        }))];
                case 2:
                    // Make sure assets are transferrable
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.testMatchingNewOrder = testMatchingNewOrder;
function getAssetsAndQuantities(order) {
    var wyAssets = "bundle" in order.metadata
        ? order.metadata.bundle.assets
        : order.metadata.asset
            ? [order.metadata.asset]
            : [];
    var schemaNames = "bundle" in order.metadata && "schemas" in order.metadata.bundle
        ? order.metadata.bundle.schemas
        : "schema" in order.metadata
            ? [order.metadata.schema]
            : [];
    chai_1.assert.isNotEmpty(wyAssets);
    chai_1.assert.equal(wyAssets.length, schemaNames.length);
    return wyAssets.map(function (wyAsset, i) {
        var asset = {
            tokenId: "id" in wyAsset && wyAsset.id != null ? wyAsset.id : null,
            tokenAddress: wyAsset.address,
            schemaName: schemaNames[i],
        };
        if ("quantity" in wyAsset) {
            return { asset: asset, quantity: new bignumber_js_1.BigNumber(wyAsset.quantity) };
        }
        else {
            return { asset: asset, quantity: new bignumber_js_1.BigNumber(1) };
        }
    });
}
//# sourceMappingURL=orders.js.map