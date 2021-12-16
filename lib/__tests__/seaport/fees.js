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
import { before, suite, test } from "mocha";
import * as Web3 from "web3";
import { DEFAULT_BUYER_FEE_BASIS_POINTS, DEFAULT_MAX_BOUNTY, DEFAULT_SELLER_FEE_BASIS_POINTS, ENJIN_ADDRESS, ENJIN_COIN_ADDRESS, MAINNET_PROVIDER_URL, NULL_ADDRESS, OPENSEA_SELLER_BOUNTY_BASIS_POINTS, } from "../../constants";
import { OpenSeaPort } from "../../index";
import { FeeMethod, Network, OrderSide, } from "../../types";
import { getOrderHash, getFeeWrapperAddress } from "../../utils/utils";
import { ALEX_ADDRESS, CATS_IN_MECHS_ID, CK_ADDRESS, CK_TOKEN_ID, DECENTRALAND_ADDRESS, DECENTRALAND_ID, MAINNET_API_KEY, MYTHEREUM_ADDRESS, MYTHEREUM_TOKEN_ID, SPIRIT_CLASH_OWNER, SPIRIT_CLASH_TOKEN_ID, WETH_ADDRESS, } from "../constants";
var provider = new Web3.providers.HttpProvider(MAINNET_PROVIDER_URL);
var client = new OpenSeaPort(provider, {
    networkName: Network.Main,
    apiKey: MAINNET_API_KEY,
}, function (line) { return console.info("MAINNET: ".concat(line)); });
var asset;
var expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24); // one day from now
suite("seaport: fees", function () {
    before(function () { return __awaiter(void 0, void 0, void 0, function () {
        var tokenId, tokenAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tokenId = MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = MYTHEREUM_ADDRESS;
                    return [4 /*yield*/, client.api.getAsset({ tokenAddress: tokenAddress, tokenId: tokenId })];
                case 1:
                    asset = _a.sent();
                    assert.isNotNull(asset);
                    return [2 /*return*/];
            }
        });
    }); });
    test("Computes fees correctly for non-zero-fee asset", function () { return __awaiter(void 0, void 0, void 0, function () {
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
                            side: OrderSide.Buy,
                        })];
                case 1:
                    buyerFees = _a.sent();
                    assert.equal(buyerFees.totalBuyerFeeBasisPoints, buyerFeeBasisPoints);
                    assert.equal(buyerFees.totalSellerFeeBasisPoints, sellerFeeBasisPoints);
                    assert.equal(buyerFees.devBuyerFeeBasisPoints, collection.devBuyerFeeBasisPoints);
                    assert.equal(buyerFees.devSellerFeeBasisPoints, collection.devSellerFeeBasisPoints);
                    assert.equal(buyerFees.openseaBuyerFeeBasisPoints, collection.openseaBuyerFeeBasisPoints);
                    assert.equal(buyerFees.openseaSellerFeeBasisPoints, collection.openseaSellerFeeBasisPoints);
                    assert.equal(buyerFees.sellerBountyBasisPoints, 0);
                    return [4 /*yield*/, client.computeFees({
                            asset: asset,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            side: OrderSide.Sell,
                        })];
                case 2:
                    sellerFees = _a.sent();
                    assert.equal(sellerFees.totalBuyerFeeBasisPoints, buyerFeeBasisPoints);
                    assert.equal(sellerFees.totalSellerFeeBasisPoints, sellerFeeBasisPoints);
                    assert.equal(sellerFees.devBuyerFeeBasisPoints, collection.devBuyerFeeBasisPoints);
                    assert.equal(sellerFees.devSellerFeeBasisPoints, collection.devSellerFeeBasisPoints);
                    assert.equal(sellerFees.openseaBuyerFeeBasisPoints, collection.openseaBuyerFeeBasisPoints);
                    assert.equal(sellerFees.openseaSellerFeeBasisPoints, collection.openseaSellerFeeBasisPoints);
                    assert.equal(sellerFees.sellerBountyBasisPoints, extraBountyBasisPoints);
                    return [4 /*yield*/, client.computeFees({
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            side: OrderSide.Sell,
                        })];
                case 3:
                    heterogenousBundleSellerFees = _a.sent();
                    assert.equal(heterogenousBundleSellerFees.totalBuyerFeeBasisPoints, DEFAULT_BUYER_FEE_BASIS_POINTS);
                    assert.equal(heterogenousBundleSellerFees.totalSellerFeeBasisPoints, DEFAULT_SELLER_FEE_BASIS_POINTS);
                    assert.equal(heterogenousBundleSellerFees.devBuyerFeeBasisPoints, 0);
                    assert.equal(heterogenousBundleSellerFees.devSellerFeeBasisPoints, 0);
                    assert.equal(heterogenousBundleSellerFees.openseaBuyerFeeBasisPoints, DEFAULT_BUYER_FEE_BASIS_POINTS);
                    assert.equal(heterogenousBundleSellerFees.openseaSellerFeeBasisPoints, DEFAULT_SELLER_FEE_BASIS_POINTS);
                    assert.equal(heterogenousBundleSellerFees.sellerBountyBasisPoints, extraBountyBasisPoints);
                    return [2 /*return*/];
            }
        });
    }); });
    test.skip("Computes fees correctly for zero-fee asset", function () { return __awaiter(void 0, void 0, void 0, function () {
        var asset, bountyPercent, buyerFees, sellerFees;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getAsset({
                        tokenAddress: DECENTRALAND_ADDRESS,
                        tokenId: DECENTRALAND_ID,
                    })];
                case 1:
                    asset = _a.sent();
                    bountyPercent = 0;
                    return [4 /*yield*/, client.computeFees({
                            asset: asset,
                            extraBountyBasisPoints: bountyPercent * 100,
                            side: OrderSide.Buy,
                        })];
                case 2:
                    buyerFees = _a.sent();
                    assert.equal(buyerFees.totalBuyerFeeBasisPoints, 0);
                    assert.equal(buyerFees.totalSellerFeeBasisPoints, 0);
                    assert.equal(buyerFees.devBuyerFeeBasisPoints, 0);
                    assert.equal(buyerFees.devSellerFeeBasisPoints, 0);
                    assert.equal(buyerFees.openseaBuyerFeeBasisPoints, 0);
                    assert.equal(buyerFees.openseaSellerFeeBasisPoints, 0);
                    assert.equal(buyerFees.sellerBountyBasisPoints, 0);
                    return [4 /*yield*/, client.computeFees({
                            asset: asset,
                            extraBountyBasisPoints: bountyPercent * 100,
                            side: OrderSide.Sell,
                        })];
                case 3:
                    sellerFees = _a.sent();
                    assert.equal(sellerFees.totalBuyerFeeBasisPoints, 0);
                    assert.equal(sellerFees.totalSellerFeeBasisPoints, 0);
                    assert.equal(sellerFees.devBuyerFeeBasisPoints, 0);
                    assert.equal(sellerFees.devSellerFeeBasisPoints, 0);
                    assert.equal(sellerFees.openseaBuyerFeeBasisPoints, 0);
                    assert.equal(sellerFees.openseaSellerFeeBasisPoints, 0);
                    assert.equal(sellerFees.sellerBountyBasisPoints, bountyPercent * 100);
                    return [2 /*return*/];
            }
        });
    }); });
    test("Errors for computing fees correctly", function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_1, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, client.computeFees({
                            asset: asset,
                            extraBountyBasisPoints: 200,
                            side: OrderSide.Sell,
                        })];
                case 1:
                    _a.sent();
                    assert.fail();
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    error = err_1;
                    if (!error.message.includes("bounty exceeds the maximum") ||
                        !error.message.includes("OpenSea will add")) {
                        assert.fail(error.message);
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    test("First page of orders have valid hashes and fees", function () { return __awaiter(void 0, void 0, void 0, function () {
        var orders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getOrders()];
                case 1:
                    orders = (_a.sent()).orders;
                    assert.isNotEmpty(orders);
                    orders.forEach(function (order) {
                        if (order.asset) {
                            assert.isNotEmpty(order.asset.assetContract);
                            assert.isNotEmpty(order.asset.tokenId);
                            testFeesMakerOrder(order, order.asset.collection);
                        }
                        assert.isNotEmpty(order.paymentTokenContract);
                        var accountAddress = ALEX_ADDRESS;
                        var matchingOrder = client._makeMatchingOrder({
                            order: order,
                            accountAddress: accountAddress,
                            recipientAddress: accountAddress,
                        });
                        var matchingOrderHash = matchingOrder.hash;
                        var orderHash = getOrderHash(matchingOrder);
                        assert.equal(orderHash, matchingOrderHash);
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    test("Computes per-transfer fees correctly, Enjin and CK", function () { return __awaiter(void 0, void 0, void 0, function () {
        var asset, zeroTransferFeeAsset, sellerFees, sellerZeroFees;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getAsset({
                        tokenAddress: ENJIN_ADDRESS,
                        tokenId: CATS_IN_MECHS_ID,
                    })];
                case 1:
                    asset = _a.sent();
                    return [4 /*yield*/, client.api.getAsset({
                            tokenAddress: CK_ADDRESS,
                            tokenId: CK_TOKEN_ID,
                        })];
                case 2:
                    zeroTransferFeeAsset = _a.sent();
                    return [4 /*yield*/, client.computeFees({
                            asset: asset,
                            side: OrderSide.Sell,
                        })];
                case 3:
                    sellerFees = _a.sent();
                    return [4 /*yield*/, client.computeFees({
                            asset: zeroTransferFeeAsset,
                            side: OrderSide.Sell,
                        })];
                case 4:
                    sellerZeroFees = _a.sent();
                    assert.equal(sellerZeroFees.transferFee.toString(), "0");
                    assert.isNull(sellerZeroFees.transferFeeTokenAddress);
                    assert.equal(sellerFees.transferFee.toString(), "1000000000000000000");
                    assert.equal(sellerFees.transferFeeTokenAddress, ENJIN_COIN_ADDRESS);
                    return [2 /*return*/];
            }
        });
    }); });
    // NOTE: Enjin platform limitation:
    // the transfer fee isn't showing as whitelisted (skipped) by Enjin's method
    test.skip("Computes whitelisted Enjin per-transfer fees correctly", function () { return __awaiter(void 0, void 0, void 0, function () {
        var whitelistedAsset, sellerZeroFees;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getAsset({
                        tokenAddress: ENJIN_ADDRESS,
                        tokenId: SPIRIT_CLASH_TOKEN_ID,
                    })];
                case 1:
                    whitelistedAsset = _a.sent();
                    return [4 /*yield*/, client.computeFees({
                            asset: whitelistedAsset,
                            side: OrderSide.Sell,
                            accountAddress: SPIRIT_CLASH_OWNER,
                        })];
                case 2:
                    sellerZeroFees = _a.sent();
                    assert.equal(sellerZeroFees.transferFee.toString(), "0");
                    assert.equal(sellerZeroFees.transferFeeTokenAddress, ENJIN_COIN_ADDRESS);
                    return [2 /*return*/];
            }
        });
    }); });
    test("_getBuyFeeParameters works for assets", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, extraBountyBasisPoints, sellOrder, _a, totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, _b, makerRelayerFee, takerRelayerFee, makerProtocolFee, takerProtocolFee, makerReferrerFee, feeRecipient, feeMethod;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    extraBountyBasisPoints = 0;
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: asset,
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: 1,
                            paymentTokenAddress: NULL_ADDRESS,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            buyerAddress: NULL_ADDRESS,
                            expirationTime: 0,
                            waitForHighestBid: false,
                        })];
                case 1:
                    sellOrder = _c.sent();
                    return [4 /*yield*/, client.computeFees({
                            asset: asset,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            side: OrderSide.Buy,
                        })];
                case 2:
                    _a = _c.sent(), totalBuyerFeeBasisPoints = _a.totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints = _a.totalSellerFeeBasisPoints;
                    _b = client._getBuyFeeParameters(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, sellOrder), makerRelayerFee = _b.makerRelayerFee, takerRelayerFee = _b.takerRelayerFee, makerProtocolFee = _b.makerProtocolFee, takerProtocolFee = _b.takerProtocolFee, makerReferrerFee = _b.makerReferrerFee, feeRecipient = _b.feeRecipient, feeMethod = _b.feeMethod;
                    assert.isAbove(totalSellerFeeBasisPoints, 0);
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
    test("_getBuyFeeParameters works for English auction assets", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, extraBountyBasisPoints, sellOrder, _a, totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, _b, makerRelayerFee, takerRelayerFee, makerProtocolFee, takerProtocolFee, makerReferrerFee, feeRecipient, feeMethod;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    extraBountyBasisPoints = 0;
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: asset,
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: 1,
                            paymentTokenAddress: WETH_ADDRESS,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            buyerAddress: NULL_ADDRESS,
                            expirationTime: expirationTime,
                            waitForHighestBid: true,
                        })];
                case 1:
                    sellOrder = _c.sent();
                    return [4 /*yield*/, client.computeFees({
                            asset: asset,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            side: OrderSide.Buy,
                        })];
                case 2:
                    _a = _c.sent(), totalBuyerFeeBasisPoints = _a.totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints = _a.totalSellerFeeBasisPoints;
                    _b = client._getBuyFeeParameters(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, sellOrder), makerRelayerFee = _b.makerRelayerFee, takerRelayerFee = _b.takerRelayerFee, makerProtocolFee = _b.makerProtocolFee, takerProtocolFee = _b.takerProtocolFee, makerReferrerFee = _b.makerReferrerFee, feeRecipient = _b.feeRecipient, feeMethod = _b.feeMethod;
                    assert.isAbove(totalSellerFeeBasisPoints, 0);
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
    assert.equal(+makerRelayerFee, asset.collection.openseaBuyerFeeBasisPoints +
        asset.collection.devBuyerFeeBasisPoints);
    assert.equal(+takerRelayerFee, asset.collection.openseaSellerFeeBasisPoints +
        asset.collection.devSellerFeeBasisPoints);
    assert.equal(+makerProtocolFee, 0);
    assert.equal(+takerProtocolFee, 0);
    assert.equal(+makerReferrerFee, 0);
    assert.equal(feeRecipient, getFeeWrapperAddress(Network.Main));
    assert.equal(feeMethod, FeeMethod.SplitFee);
}
export function testFeesMakerOrder(order, collection, makerBountyBPS) {
    assert.equal(order.makerProtocolFee.toNumber(), 0);
    assert.equal(order.takerProtocolFee.toNumber(), 0);
    if (order.waitingForBestCounterOrder) {
        assert.equal(order.feeRecipient, NULL_ADDRESS);
    }
    else {
        assert.equal(order.feeRecipient, getFeeWrapperAddress(Network.Main));
    }
    // Public order
    if (makerBountyBPS != null) {
        assert.equal(order.makerReferrerFee.toNumber(), makerBountyBPS);
    }
    if (collection) {
        var totalSellerFee = collection.devSellerFeeBasisPoints +
            collection.openseaSellerFeeBasisPoints;
        var totalBuyerFeeBasisPoints = collection.devBuyerFeeBasisPoints + collection.openseaBuyerFeeBasisPoints;
        // Homogenous sale
        if (order.side == OrderSide.Sell && order.waitingForBestCounterOrder) {
            // Fees may not match the contract's fees, which are changeable.
        }
        else if (order.side == OrderSide.Sell) {
            assert.equal(order.makerRelayerFee.toNumber(), totalSellerFee);
            assert.equal(order.takerRelayerFee.toNumber(), totalBuyerFeeBasisPoints);
            assert.equal(order.makerRelayerFee.toNumber(), collection.devSellerFeeBasisPoints +
                collection.openseaSellerFeeBasisPoints);
            // Check bounty
            if (collection.openseaSellerFeeBasisPoints >=
                OPENSEA_SELLER_BOUNTY_BASIS_POINTS) {
                assert.isAtMost(OPENSEA_SELLER_BOUNTY_BASIS_POINTS +
                    order.makerReferrerFee.toNumber(), collection.openseaSellerFeeBasisPoints);
            }
            else {
                // No extra bounty allowed if < 1%
                assert.equal(order.makerReferrerFee.toNumber(), 0);
            }
        }
        else {
            assert.equal(order.makerRelayerFee.toNumber(), totalBuyerFeeBasisPoints);
            assert.equal(order.takerRelayerFee.toNumber(), totalSellerFee);
            assert.equal(order.makerRelayerFee.toNumber(), collection.devBuyerFeeBasisPoints +
                collection.openseaBuyerFeeBasisPoints);
        }
    }
    else {
        // Heterogenous
        if (order.side == OrderSide.Sell) {
            assert.equal(order.makerRelayerFee.toNumber(), DEFAULT_SELLER_FEE_BASIS_POINTS);
            assert.equal(order.takerRelayerFee.toNumber(), DEFAULT_BUYER_FEE_BASIS_POINTS);
            assert.isAtMost(OPENSEA_SELLER_BOUNTY_BASIS_POINTS + order.makerReferrerFee.toNumber(), DEFAULT_MAX_BOUNTY);
        }
        else {
            assert.equal(order.makerRelayerFee.toNumber(), DEFAULT_BUYER_FEE_BASIS_POINTS);
            assert.equal(order.takerRelayerFee.toNumber(), DEFAULT_SELLER_FEE_BASIS_POINTS);
        }
    }
}
//# sourceMappingURL=fees.js.map