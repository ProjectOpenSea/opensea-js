"use strict";
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
exports.testFeesMakerOrder = void 0;
var chai_1 = require("chai");
var mocha_1 = require("mocha");
var Web3 = __importStar(require("web3"));
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
var asset;
var expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24); // one day from now
(0, mocha_1.suite)("seaport: fees", function () {
    (0, mocha_1.before)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var tokenId, tokenAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tokenId = constants_2.MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = constants_2.MYTHEREUM_ADDRESS;
                    return [4 /*yield*/, client.api.getAsset({ tokenAddress: tokenAddress, tokenId: tokenId })];
                case 1:
                    asset = _a.sent();
                    chai_1.assert.isNotNull(asset);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Computes fees correctly for non-zero-fee asset", function () { return __awaiter(void 0, void 0, void 0, function () {
        var bountyPercent, extraBountyBasisPoints, collection, buyerFeeBasisPoints, sellerFeeBasisPoints, buyerFees, sellerFees, heterogenousBundleSellerFees;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    bountyPercent = 1.5;
                    extraBountyBasisPoints = bountyPercent * 100;
                    collection = asset.collection;
                    buyerFeeBasisPoints = collection.openseaBuyerFeeBasisPoints + collection.devBuyerFeeBasisPoints;
                    sellerFeeBasisPoints = collection.openseaSellerFeeBasisPoints +
                        collection.devSellerFeeBasisPoints;
                    return [4 /*yield*/, client.computeFees({
                            asset: asset,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            side: types_1.OrderSide.Buy,
                        })];
                case 1:
                    buyerFees = _a.sent();
                    chai_1.assert.equal(buyerFees.totalBuyerFeeBasisPoints, buyerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.totalSellerFeeBasisPoints, sellerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.devBuyerFeeBasisPoints, collection.devBuyerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.devSellerFeeBasisPoints, collection.devSellerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.openseaBuyerFeeBasisPoints, collection.openseaBuyerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.openseaSellerFeeBasisPoints, collection.openseaSellerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.sellerBountyBasisPoints, 0);
                    return [4 /*yield*/, client.computeFees({
                            asset: asset,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            side: types_1.OrderSide.Sell,
                        })];
                case 2:
                    sellerFees = _a.sent();
                    chai_1.assert.equal(sellerFees.totalBuyerFeeBasisPoints, buyerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.totalSellerFeeBasisPoints, sellerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.devBuyerFeeBasisPoints, collection.devBuyerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.devSellerFeeBasisPoints, collection.devSellerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.openseaBuyerFeeBasisPoints, collection.openseaBuyerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.openseaSellerFeeBasisPoints, collection.openseaSellerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.sellerBountyBasisPoints, extraBountyBasisPoints);
                    return [4 /*yield*/, client.computeFees({
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            side: types_1.OrderSide.Sell,
                        })];
                case 3:
                    heterogenousBundleSellerFees = _a.sent();
                    chai_1.assert.equal(heterogenousBundleSellerFees.totalBuyerFeeBasisPoints, constants_1.DEFAULT_BUYER_FEE_BASIS_POINTS);
                    chai_1.assert.equal(heterogenousBundleSellerFees.totalSellerFeeBasisPoints, constants_1.DEFAULT_SELLER_FEE_BASIS_POINTS);
                    chai_1.assert.equal(heterogenousBundleSellerFees.devBuyerFeeBasisPoints, 0);
                    chai_1.assert.equal(heterogenousBundleSellerFees.devSellerFeeBasisPoints, 0);
                    chai_1.assert.equal(heterogenousBundleSellerFees.openseaBuyerFeeBasisPoints, constants_1.DEFAULT_BUYER_FEE_BASIS_POINTS);
                    chai_1.assert.equal(heterogenousBundleSellerFees.openseaSellerFeeBasisPoints, constants_1.DEFAULT_SELLER_FEE_BASIS_POINTS);
                    chai_1.assert.equal(heterogenousBundleSellerFees.sellerBountyBasisPoints, extraBountyBasisPoints);
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_1.test.skip("Computes fees correctly for zero-fee asset", function () { return __awaiter(void 0, void 0, void 0, function () {
        var asset, bountyPercent, buyerFees, sellerFees;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getAsset({
                        tokenAddress: constants_2.DECENTRALAND_ADDRESS,
                        tokenId: constants_2.DECENTRALAND_ID,
                    })];
                case 1:
                    asset = _a.sent();
                    bountyPercent = 0;
                    return [4 /*yield*/, client.computeFees({
                            asset: asset,
                            extraBountyBasisPoints: bountyPercent * 100,
                            side: types_1.OrderSide.Buy,
                        })];
                case 2:
                    buyerFees = _a.sent();
                    chai_1.assert.equal(buyerFees.totalBuyerFeeBasisPoints, 0);
                    chai_1.assert.equal(buyerFees.totalSellerFeeBasisPoints, 0);
                    chai_1.assert.equal(buyerFees.devBuyerFeeBasisPoints, 0);
                    chai_1.assert.equal(buyerFees.devSellerFeeBasisPoints, 0);
                    chai_1.assert.equal(buyerFees.openseaBuyerFeeBasisPoints, 0);
                    chai_1.assert.equal(buyerFees.openseaSellerFeeBasisPoints, 0);
                    chai_1.assert.equal(buyerFees.sellerBountyBasisPoints, 0);
                    return [4 /*yield*/, client.computeFees({
                            asset: asset,
                            extraBountyBasisPoints: bountyPercent * 100,
                            side: types_1.OrderSide.Sell,
                        })];
                case 3:
                    sellerFees = _a.sent();
                    chai_1.assert.equal(sellerFees.totalBuyerFeeBasisPoints, 0);
                    chai_1.assert.equal(sellerFees.totalSellerFeeBasisPoints, 0);
                    chai_1.assert.equal(sellerFees.devBuyerFeeBasisPoints, 0);
                    chai_1.assert.equal(sellerFees.devSellerFeeBasisPoints, 0);
                    chai_1.assert.equal(sellerFees.openseaBuyerFeeBasisPoints, 0);
                    chai_1.assert.equal(sellerFees.openseaSellerFeeBasisPoints, 0);
                    chai_1.assert.equal(sellerFees.sellerBountyBasisPoints, bountyPercent * 100);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Errors for computing fees correctly", function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_1, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, client.computeFees({
                            asset: asset,
                            extraBountyBasisPoints: 200,
                            side: types_1.OrderSide.Sell,
                        })];
                case 1:
                    _a.sent();
                    chai_1.assert.fail();
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    error = err_1;
                    if (!error.message.includes("bounty exceeds the maximum") ||
                        !error.message.includes("OpenSea will add")) {
                        chai_1.assert.fail(error.message);
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("First page of orders have valid hashes and fees", function () { return __awaiter(void 0, void 0, void 0, function () {
        var orders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getOrders()];
                case 1:
                    orders = (_a.sent()).orders;
                    chai_1.assert.isNotEmpty(orders);
                    orders.forEach(function (order) {
                        if (order.asset) {
                            chai_1.assert.isNotEmpty(order.asset.assetContract);
                            chai_1.assert.isNotEmpty(order.asset.tokenId);
                            testFeesMakerOrder(order, order.asset.collection);
                        }
                        chai_1.assert.isNotEmpty(order.paymentTokenContract);
                        var accountAddress = constants_2.ALEX_ADDRESS;
                        var matchingOrder = client._makeMatchingOrder({
                            order: order,
                            accountAddress: accountAddress,
                            recipientAddress: accountAddress,
                        });
                        var matchingOrderHash = matchingOrder.hash;
                        var orderHash = (0, utils_1.getOrderHash)(matchingOrder);
                        chai_1.assert.equal(orderHash, matchingOrderHash);
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("Computes per-transfer fees correctly, Enjin and CK", function () { return __awaiter(void 0, void 0, void 0, function () {
        var asset, zeroTransferFeeAsset, sellerFees, sellerZeroFees;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getAsset({
                        tokenAddress: constants_1.ENJIN_ADDRESS,
                        tokenId: constants_2.CATS_IN_MECHS_ID,
                    })];
                case 1:
                    asset = _a.sent();
                    return [4 /*yield*/, client.api.getAsset({
                            tokenAddress: constants_2.CK_ADDRESS,
                            tokenId: constants_2.CK_TOKEN_ID,
                        })];
                case 2:
                    zeroTransferFeeAsset = _a.sent();
                    return [4 /*yield*/, client.computeFees({
                            asset: asset,
                            side: types_1.OrderSide.Sell,
                        })];
                case 3:
                    sellerFees = _a.sent();
                    return [4 /*yield*/, client.computeFees({
                            asset: zeroTransferFeeAsset,
                            side: types_1.OrderSide.Sell,
                        })];
                case 4:
                    sellerZeroFees = _a.sent();
                    chai_1.assert.equal(sellerZeroFees.transferFee.toString(), "0");
                    chai_1.assert.isNull(sellerZeroFees.transferFeeTokenAddress);
                    chai_1.assert.equal(sellerFees.transferFee.toString(), "1000000000000000000");
                    chai_1.assert.equal(sellerFees.transferFeeTokenAddress, constants_1.ENJIN_COIN_ADDRESS);
                    return [2 /*return*/];
            }
        });
    }); });
    // NOTE: Enjin platform limitation:
    // the transfer fee isn't showing as whitelisted (skipped) by Enjin's method
    mocha_1.test.skip("Computes whitelisted Enjin per-transfer fees correctly", function () { return __awaiter(void 0, void 0, void 0, function () {
        var whitelistedAsset, sellerZeroFees;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getAsset({
                        tokenAddress: constants_1.ENJIN_ADDRESS,
                        tokenId: constants_2.SPIRIT_CLASH_TOKEN_ID,
                    })];
                case 1:
                    whitelistedAsset = _a.sent();
                    return [4 /*yield*/, client.computeFees({
                            asset: whitelistedAsset,
                            side: types_1.OrderSide.Sell,
                            accountAddress: constants_2.SPIRIT_CLASH_OWNER,
                        })];
                case 2:
                    sellerZeroFees = _a.sent();
                    chai_1.assert.equal(sellerZeroFees.transferFee.toString(), "0");
                    chai_1.assert.equal(sellerZeroFees.transferFeeTokenAddress, constants_1.ENJIN_COIN_ADDRESS);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("_getBuyFeeParameters works for assets", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, extraBountyBasisPoints, sellOrder, _a, totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, _b, makerRelayerFee, takerRelayerFee, makerProtocolFee, takerProtocolFee, makerReferrerFee, feeRecipient, feeMethod;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    accountAddress = constants_2.ALEX_ADDRESS;
                    extraBountyBasisPoints = 0;
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: asset,
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: 1,
                            paymentTokenAddress: constants_1.NULL_ADDRESS,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            expirationTime: 0,
                            waitForHighestBid: false,
                        })];
                case 1:
                    sellOrder = _c.sent();
                    return [4 /*yield*/, client.computeFees({
                            asset: asset,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            side: types_1.OrderSide.Buy,
                        })];
                case 2:
                    _a = _c.sent(), totalBuyerFeeBasisPoints = _a.totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints = _a.totalSellerFeeBasisPoints;
                    _b = client._getBuyFeeParameters(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, sellOrder), makerRelayerFee = _b.makerRelayerFee, takerRelayerFee = _b.takerRelayerFee, makerProtocolFee = _b.makerProtocolFee, takerProtocolFee = _b.takerProtocolFee, makerReferrerFee = _b.makerReferrerFee, feeRecipient = _b.feeRecipient, feeMethod = _b.feeMethod;
                    chai_1.assert.isAbove(totalSellerFeeBasisPoints, 0);
                    unitTestFeesBuyOrder({
                        makerRelayerFee: makerRelayerFee,
                        takerRelayerFee: takerRelayerFee,
                        makerProtocolFee: makerProtocolFee,
                        takerProtocolFee: takerProtocolFee,
                        makerReferrerFee: makerReferrerFee,
                        feeRecipient: feeRecipient,
                        feeMethod: feeMethod,
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, mocha_1.test)("_getBuyFeeParameters works for English auction assets", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, extraBountyBasisPoints, sellOrder, _a, totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, _b, makerRelayerFee, takerRelayerFee, makerProtocolFee, takerProtocolFee, makerReferrerFee, feeRecipient, feeMethod;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    accountAddress = constants_2.ALEX_ADDRESS;
                    extraBountyBasisPoints = 0;
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: asset,
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: 1,
                            paymentTokenAddress: constants_2.WETH_ADDRESS,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            buyerAddress: constants_1.NULL_ADDRESS,
                            expirationTime: expirationTime,
                            waitForHighestBid: true,
                        })];
                case 1:
                    sellOrder = _c.sent();
                    return [4 /*yield*/, client.computeFees({
                            asset: asset,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            side: types_1.OrderSide.Buy,
                        })];
                case 2:
                    _a = _c.sent(), totalBuyerFeeBasisPoints = _a.totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints = _a.totalSellerFeeBasisPoints;
                    _b = client._getBuyFeeParameters(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, sellOrder), makerRelayerFee = _b.makerRelayerFee, takerRelayerFee = _b.takerRelayerFee, makerProtocolFee = _b.makerProtocolFee, takerProtocolFee = _b.takerProtocolFee, makerReferrerFee = _b.makerReferrerFee, feeRecipient = _b.feeRecipient, feeMethod = _b.feeMethod;
                    chai_1.assert.isAbove(totalSellerFeeBasisPoints, 0);
                    unitTestFeesBuyOrder({
                        makerRelayerFee: makerRelayerFee,
                        takerRelayerFee: takerRelayerFee,
                        makerProtocolFee: makerProtocolFee,
                        takerProtocolFee: takerProtocolFee,
                        makerReferrerFee: makerReferrerFee,
                        feeRecipient: feeRecipient,
                        feeMethod: feeMethod,
                    });
                    return [2 /*return*/];
            }
        });
    }); });
});
function unitTestFeesBuyOrder(_a) {
    var makerRelayerFee = _a.makerRelayerFee, takerRelayerFee = _a.takerRelayerFee, makerProtocolFee = _a.makerProtocolFee, takerProtocolFee = _a.takerProtocolFee, makerReferrerFee = _a.makerReferrerFee, feeRecipient = _a.feeRecipient, feeMethod = _a.feeMethod;
    chai_1.assert.equal(+makerRelayerFee, asset.collection.openseaBuyerFeeBasisPoints +
        asset.collection.devBuyerFeeBasisPoints);
    chai_1.assert.equal(+takerRelayerFee, asset.collection.openseaSellerFeeBasisPoints +
        asset.collection.devSellerFeeBasisPoints);
    chai_1.assert.equal(+makerProtocolFee, 0);
    chai_1.assert.equal(+takerProtocolFee, 0);
    chai_1.assert.equal(+makerReferrerFee, 0);
    chai_1.assert.equal(feeRecipient, constants_1.OPENSEA_FEE_RECIPIENT);
    chai_1.assert.equal(feeMethod, types_1.FeeMethod.SplitFee);
}
function testFeesMakerOrder(order, collection, makerBountyBPS) {
    chai_1.assert.equal(order.makerProtocolFee.toNumber(), 0);
    chai_1.assert.equal(order.takerProtocolFee.toNumber(), 0);
    if (order.waitingForBestCounterOrder) {
        chai_1.assert.equal(order.feeRecipient, constants_1.NULL_ADDRESS);
    }
    else {
        chai_1.assert.equal(order.feeRecipient, constants_1.OPENSEA_FEE_RECIPIENT);
    }
    // Public order
    if (makerBountyBPS != null) {
        chai_1.assert.equal(order.makerReferrerFee.toNumber(), makerBountyBPS);
    }
    if (collection) {
        var totalSellerFee = collection.devSellerFeeBasisPoints +
            collection.openseaSellerFeeBasisPoints;
        var totalBuyerFeeBasisPoints = collection.devBuyerFeeBasisPoints + collection.openseaBuyerFeeBasisPoints;
        // Homogenous sale
        if (order.side == types_1.OrderSide.Sell && order.waitingForBestCounterOrder) {
            // Fees may not match the contract's fees, which are changeable.
        }
        else if (order.side == types_1.OrderSide.Sell) {
            chai_1.assert.equal(order.makerRelayerFee.toNumber(), totalSellerFee);
            chai_1.assert.equal(order.takerRelayerFee.toNumber(), totalBuyerFeeBasisPoints);
            chai_1.assert.equal(order.makerRelayerFee.toNumber(), collection.devSellerFeeBasisPoints +
                collection.openseaSellerFeeBasisPoints);
            // Check bounty
            if (collection.openseaSellerFeeBasisPoints >=
                constants_1.OPENSEA_SELLER_BOUNTY_BASIS_POINTS) {
                chai_1.assert.isAtMost(constants_1.OPENSEA_SELLER_BOUNTY_BASIS_POINTS +
                    order.makerReferrerFee.toNumber(), collection.openseaSellerFeeBasisPoints);
            }
            else {
                // No extra bounty allowed if < 1%
                chai_1.assert.equal(order.makerReferrerFee.toNumber(), 0);
            }
        }
        else {
            chai_1.assert.equal(order.makerRelayerFee.toNumber(), totalBuyerFeeBasisPoints);
            chai_1.assert.equal(order.takerRelayerFee.toNumber(), totalSellerFee);
            chai_1.assert.equal(order.makerRelayerFee.toNumber(), collection.devBuyerFeeBasisPoints +
                collection.openseaBuyerFeeBasisPoints);
        }
    }
    else {
        // Heterogenous
        if (order.side == types_1.OrderSide.Sell) {
            chai_1.assert.equal(order.makerRelayerFee.toNumber(), constants_1.DEFAULT_SELLER_FEE_BASIS_POINTS);
            chai_1.assert.equal(order.takerRelayerFee.toNumber(), constants_1.DEFAULT_BUYER_FEE_BASIS_POINTS);
            chai_1.assert.isAtMost(constants_1.OPENSEA_SELLER_BOUNTY_BASIS_POINTS + order.makerReferrerFee.toNumber(), constants_1.DEFAULT_MAX_BOUNTY);
        }
        else {
            chai_1.assert.equal(order.makerRelayerFee.toNumber(), constants_1.DEFAULT_BUYER_FEE_BASIS_POINTS);
            chai_1.assert.equal(order.takerRelayerFee.toNumber(), constants_1.DEFAULT_SELLER_FEE_BASIS_POINTS);
        }
    }
}
exports.testFeesMakerOrder = testFeesMakerOrder;
//# sourceMappingURL=fees.js.map