"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var mocha_1 = require("mocha");
var mocha_typescript_1 = require("mocha-typescript");
var index_1 = require("../src/index");
var Web3 = require("web3");
var types_1 = require("../src/types");
var utils_1 = require("../src/utils");
var ordersJSONFixture = require("./fixtures/orders.json");
var bignumber_js_1 = require("bignumber.js");
var constants_1 = require("./constants");
var ordersJSON = ordersJSONFixture;
var englishSellOrderJSON = ordersJSON[0];
var provider = new Web3.providers.HttpProvider('https://mainnet.infura.io');
var rinkebyProvider = new Web3.providers.HttpProvider('https://rinkeby.infura.io');
var client = new index_1.OpenSeaPort(provider, {
    networkName: types_1.Network.Main,
    apiKey: constants_1.MAINNET_API_KEY
}, function (line) { return console.info("MAINNET: " + line); });
var rinkebyClient = new index_1.OpenSeaPort(rinkebyProvider, {
    networkName: types_1.Network.Rinkeby,
    apiKey: constants_1.RINKEBY_API_KEY
}, function (line) { return console.info("RINKEBY: " + line); });
var assetsForBundleOrder = [
    { tokenId: constants_1.MYTHEREUM_TOKEN_ID.toString(), tokenAddress: constants_1.MYTHEREUM_ADDRESS },
    { tokenId: constants_1.DIGITAL_ART_CHAIN_TOKEN_ID.toString(), tokenAddress: constants_1.DIGITAL_ART_CHAIN_ADDRESS },
];
var assetsForBulkTransfer = assetsForBundleOrder;
var wethAddress;
var manaAddress;
mocha_typescript_1.suite('seaport', function () {
    mocha_1.before(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.getFungibleTokens({ symbol: 'WETH' })];
                case 1:
                    wethAddress = (_a.sent())[0].address;
                    return [4 /*yield*/, client.getFungibleTokens({ symbol: 'MANA' })];
                case 2:
                    manaAddress = (_a.sent())[0].address;
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('Instance has public methods', function () {
        chai_1.assert.equal(typeof client.getCurrentPrice, 'function');
        chai_1.assert.equal(typeof client.wrapEth, 'function');
    });
    mocha_typescript_1.test('Instance exposes API methods', function () {
        chai_1.assert.equal(typeof client.api.getOrder, 'function');
        chai_1.assert.equal(typeof client.api.getOrders, 'function');
        chai_1.assert.equal(typeof client.api.postOrder, 'function');
    });
    mocha_typescript_1.test('Instance exposes some underscored methods', function () {
        chai_1.assert.equal(typeof client._initializeProxy, 'function');
        chai_1.assert.equal(typeof client._getProxy, 'function');
    });
    mocha_typescript_1.test('Includes API key in token request', function () { return __awaiter(_this, void 0, void 0, function () {
        var oldLogger;
        return __generator(this, function (_a) {
            oldLogger = client.api.logger;
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    client.api.logger = function (log) {
                        try {
                            chai_1.assert.include(log, "\"X-API-KEY\":\"" + constants_1.MAINNET_API_KEY + "\"");
                            resolve();
                        }
                        catch (e) {
                            reject(e);
                        }
                        finally {
                            client.api.logger = oldLogger;
                        }
                    };
                    client.api.getTokens({ symbol: "MANA" });
                })];
        });
    }); });
    ordersJSON.map(function (orderJSON, index) {
        mocha_typescript_1.test('Order #' + index + ' has correct types', function () {
            var order = utils_1.orderFromJSON(orderJSON);
            chai_1.assert.instanceOf(order.basePrice, bignumber_js_1.BigNumber);
            chai_1.assert.typeOf(order.hash, "string");
            chai_1.assert.typeOf(order.maker, "string");
            // client._buyOrderValidationAndApprovals({order, accountAddress: order.maker})
        });
    });
    ordersJSON.map(function (orderJSON, index) {
        mocha_typescript_1.test('Order #' + index + ' has correct hash', function () {
            var order = utils_1.orderFromJSON(orderJSON);
            chai_1.assert.equal(order.hash, utils_1.getOrderHash(order));
        });
    });
    mocha_typescript_1.test("On-chain ownership correctly pulled for ERC721s", function () { return __awaiter(_this, void 0, void 0, function () {
        var accountAddress, wyAsset, schemaName, isOwner;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_1.ALEX_ADDRESS;
                    wyAsset = {
                        id: constants_1.MYTHEREUM_TOKEN_ID.toString(),
                        address: constants_1.MYTHEREUM_ADDRESS
                    };
                    schemaName = types_1.WyvernSchemaName.ERC721;
                    return [4 /*yield*/, client._ownsAssetOnChain({ accountAddress: accountAddress, wyAsset: wyAsset, schemaName: schemaName })];
                case 1:
                    isOwner = _a.sent();
                    chai_1.assert.isTrue(isOwner);
                    return [2 /*return*/];
            }
        });
    }); });
    // test("On-chain ownership correctly pulled for ERC20s", async () => {
    //   const accountAddress = ALEX_ADDRESS
    //   const wyAsset: WyvernNFTAsset = {
    //     id:
    //     address: 
    //   }
    //   const schema = 
    //   const isOwner = await ownsAssetOnChain(client.web3, { accountAddress, wyAsset, schema })
    //   assert.isTrue(isOwner)
    // })
    // test("On-chain ownership correctly pulled for ERC1155s", async () => {
    //   const accountAddress = ALEX_ADDRESS
    //   const wyAsset: WyvernNFTAsset = {
    //     id:
    //     address: 
    //   }
    //   const schema = 
    //   const isOwner = await ownsAssetOnChain(client.web3, { accountAddress, wyAsset, schema })
    //   assert.isTrue(isOwner)
    // })
    mocha_typescript_1.test("Correctly errors for invalid price parameters", function () { return __awaiter(_this, void 0, void 0, function () {
        var accountAddress, expirationTime, paymentTokenAddress, tokenId, tokenAddress, error_1, error_2, error_3, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_1.ALEX_ADDRESS;
                    expirationTime = (Date.now() / 1000 + 60) // one minute from now
                    ;
                    paymentTokenAddress = manaAddress;
                    tokenId = constants_1.MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = constants_1.MYTHEREUM_ADDRESS;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: 2,
                            extraBountyBasisPoints: 0,
                            buyerAddress: utils_1.NULL_ADDRESS,
                            expirationTime: 0,
                            paymentTokenAddress: paymentTokenAddress,
                            waitForHighestBid: true,
                            schemaName: types_1.WyvernSchemaName.ERC721
                        })];
                case 2:
                    _a.sent();
                    chai_1.assert.fail();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    chai_1.assert.include(error_1.message, 'English auctions must have an expiration time');
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
                            buyerAddress: utils_1.NULL_ADDRESS,
                            expirationTime: expirationTime,
                            paymentTokenAddress: utils_1.NULL_ADDRESS,
                            waitForHighestBid: true,
                            schemaName: types_1.WyvernSchemaName.ERC721
                        })];
                case 5:
                    _a.sent();
                    chai_1.assert.fail();
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    chai_1.assert.include(error_2.message, 'English auctions must use wrapped ETH');
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
                            buyerAddress: utils_1.NULL_ADDRESS,
                            expirationTime: expirationTime,
                            paymentTokenAddress: utils_1.NULL_ADDRESS,
                            waitForHighestBid: false,
                            schemaName: types_1.WyvernSchemaName.ERC721
                        })];
                case 8:
                    _a.sent();
                    chai_1.assert.fail();
                    return [3 /*break*/, 10];
                case 9:
                    error_3 = _a.sent();
                    chai_1.assert.include(error_3.message, 'End price must be less than or equal to the start price');
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
                            buyerAddress: utils_1.NULL_ADDRESS,
                            expirationTime: 0,
                            paymentTokenAddress: utils_1.NULL_ADDRESS,
                            waitForHighestBid: false,
                            schemaName: types_1.WyvernSchemaName.ERC721
                        })];
                case 11:
                    _a.sent();
                    chai_1.assert.fail();
                    return [3 /*break*/, 13];
                case 12:
                    error_4 = _a.sent();
                    chai_1.assert.include(error_4.message, 'Expiration time must be set if order will change in price');
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('Matches heterogenous bundle buy order', function () { return __awaiter(_this, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInEth, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_1.ALEX_ADDRESS;
                    takerAddress = constants_1.ALEX_ADDRESS;
                    amountInEth = 0.01;
                    return [4 /*yield*/, client._makeBundleBuyOrder({
                            assets: assetsForBundleOrder,
                            accountAddress: accountAddress,
                            startAmount: amountInEth,
                            extraBountyBasisPoints: 0,
                            expirationTime: 0,
                            paymentTokenAddress: wethAddress,
                            schemaName: types_1.WyvernSchemaName.ERC721
                        })];
                case 1:
                    order = _a.sent();
                    chai_1.assert.equal(order.paymentToken, wethAddress);
                    chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
                    chai_1.assert.equal(order.extra.toNumber(), 0);
                    chai_1.assert.equal(order.expirationTime.toNumber(), 0);
                    testFeesMakerOrder(order, undefined);
                    return [4 /*yield*/, client._buyOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })
                        // Make sure match is valid
                    ];
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
    mocha_typescript_1.test('Matches homogenous bundle buy order', function () { return __awaiter(_this, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInToken, order, asset;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_1.ALEX_ADDRESS;
                    takerAddress = constants_1.ALEX_ADDRESS;
                    amountInToken = 10;
                    return [4 /*yield*/, client._makeBundleBuyOrder({
                            assets: [{ tokenId: constants_1.MYTHEREUM_TOKEN_ID.toString(), tokenAddress: constants_1.MYTHEREUM_ADDRESS }],
                            accountAddress: accountAddress,
                            startAmount: amountInToken,
                            extraBountyBasisPoints: 0,
                            expirationTime: 0,
                            paymentTokenAddress: manaAddress,
                            schemaName: types_1.WyvernSchemaName.ERC721
                        })];
                case 1:
                    order = _a.sent();
                    return [4 /*yield*/, client.api.getAsset(constants_1.MYTHEREUM_ADDRESS, constants_1.MYTHEREUM_TOKEN_ID.toString())];
                case 2:
                    asset = _a.sent();
                    chai_1.assert.equal(order.paymentToken, manaAddress);
                    chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken);
                    chai_1.assert.equal(order.extra.toNumber(), 0);
                    chai_1.assert.equal(order.expirationTime.toNumber(), 0);
                    testFeesMakerOrder(order, asset.assetContract);
                    return [4 /*yield*/, client._buyOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })
                        // Make sure match is valid
                    ];
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
    mocha_typescript_1.test('Cannot yet match a new English auction sell order, bountied', function () { return __awaiter(_this, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInToken, paymentTokenAddress, expirationTime, bountyPercent, tokenId, tokenAddress, asset, order, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_1.ALEX_ADDRESS;
                    takerAddress = constants_1.ALEX_ADDRESS_2;
                    amountInToken = 1.2;
                    return [4 /*yield*/, client.getFungibleTokens({ symbol: 'WETH' })];
                case 1:
                    paymentTokenAddress = (_a.sent())[0].address;
                    expirationTime = (Date.now() / 1000 + 60) // one minute from now
                    ;
                    bountyPercent = 1.1;
                    tokenId = constants_1.MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = constants_1.MYTHEREUM_ADDRESS;
                    return [4 /*yield*/, client.api.getAsset(tokenAddress, tokenId)];
                case 2:
                    asset = _a.sent();
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: amountInToken,
                            paymentTokenAddress: paymentTokenAddress,
                            extraBountyBasisPoints: bountyPercent * 100,
                            buyerAddress: utils_1.NULL_ADDRESS,
                            expirationTime: expirationTime,
                            waitForHighestBid: true,
                            schemaName: types_1.WyvernSchemaName.ERC721
                        })];
                case 3:
                    order = _a.sent();
                    chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken);
                    chai_1.assert.equal(order.extra.toNumber(), 0);
                    // Make sure there's gap time to expire it
                    chai_1.assert.isAbove(order.expirationTime.toNumber(), expirationTime);
                    // Make sure it's listed in the future
                    chai_1.assert.equal(order.listingTime.toNumber(), expirationTime);
                    return [4 /*yield*/, client._sellOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })
                        // Make sure match is impossible
                    ];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, testMatchingNewOrder(order, takerAddress, expirationTime + 100)];
                case 6:
                    _a.sent();
                    chai_1.assert.fail();
                    return [3 /*break*/, 8];
                case 7:
                    error_5 = _a.sent();
                    chai_1.assert.include(error_5.message, "Unable to match offer with auction.");
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test.skip('Can match a finished English auction sell order', function () { return __awaiter(_this, void 0, void 0, function () {
        var makerAddress, takerAddress, matcherAddress, now, paymentTokenAddress, orders, buy, sell, sellPrice, buyPrice, gas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    makerAddress = constants_1.ALEX_ADDRESS_2;
                    takerAddress = constants_1.ALEX_ADDRESS;
                    matcherAddress = constants_1.DEVIN_ADDRESS;
                    now = Date.now() / 1000;
                    return [4 /*yield*/, rinkebyClient.getFungibleTokens({ symbol: 'WETH' })];
                case 1:
                    paymentTokenAddress = (_a.sent())[0].address;
                    return [4 /*yield*/, rinkebyClient.api.getOrders({
                            side: types_1.OrderSide.Buy,
                            asset_contract_address: constants_1.CK_RINKEBY_ADDRESS,
                            token_id: constants_1.CK_RINKEBY_TOKEN_ID,
                            payment_token_address: paymentTokenAddress,
                            maker: makerAddress
                        })];
                case 2:
                    orders = (_a.sent()).orders;
                    buy = orders[0];
                    chai_1.assert.isDefined(buy);
                    chai_1.assert.isDefined(buy.asset);
                    if (!buy || !buy.asset) {
                        return [2 /*return*/];
                    }
                    // Make sure it's listed in the past
                    chai_1.assert.isBelow(buy.listingTime.toNumber(), now);
                    testFeesMakerOrder(buy, buy.asset.assetContract);
                    sell = utils_1.orderFromJSON(englishSellOrderJSON);
                    chai_1.assert.equal(sell.feeRecipient, utils_1.NULL_ADDRESS);
                    chai_1.assert.equal(sell.paymentToken, paymentTokenAddress);
                    /* Requirements in Wyvern contract for funds transfer. */
                    chai_1.assert.isAtMost(buy.takerRelayerFee.toNumber(), sell.takerRelayerFee.toNumber());
                    chai_1.assert.isAtMost(buy.takerProtocolFee.toNumber(), sell.takerProtocolFee.toNumber());
                    return [4 /*yield*/, rinkebyClient.getCurrentPrice(sell)];
                case 3:
                    sellPrice = _a.sent();
                    return [4 /*yield*/, rinkebyClient.getCurrentPrice(buy)];
                case 4:
                    buyPrice = _a.sent();
                    chai_1.assert.isAtLeast(buyPrice.toNumber(), sellPrice.toNumber());
                    console.info("Matching two orders that differ in price by " + (buyPrice.toNumber() - sellPrice.toNumber()));
                    return [4 /*yield*/, rinkebyClient._buyOrderValidationAndApprovals({ order: buy, accountAddress: makerAddress })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, rinkebyClient._sellOrderValidationAndApprovals({ order: sell, accountAddress: takerAddress })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, rinkebyClient._estimateGasForMatch({ buy: buy, sell: sell, accountAddress: matcherAddress })];
                case 7:
                    gas = _a.sent();
                    chai_1.assert.isAbove(gas, 0);
                    console.info("Match gas cost: " + gas);
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('Ensures buy order compatibility with an English sell order', function () { return __awaiter(_this, void 0, void 0, function () {
        var accountAddress, takerAddress, paymentTokenAddress, amountInToken, expirationTime, extraBountyBasisPoints, tokenId, tokenAddress, asset, sellOrder, buyOrder;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_1.ALEX_ADDRESS_2;
                    takerAddress = constants_1.ALEX_ADDRESS;
                    return [4 /*yield*/, client.getFungibleTokens({ symbol: 'WETH' })];
                case 1:
                    paymentTokenAddress = (_a.sent())[0].address;
                    amountInToken = 0.01;
                    expirationTime = (Date.now() / 1000 + 60 * 60 * 24) // one day from now
                    ;
                    extraBountyBasisPoints = 1.1 * 100;
                    tokenId = constants_1.MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = constants_1.MYTHEREUM_ADDRESS;
                    return [4 /*yield*/, client.api.getAsset(tokenAddress, tokenId)];
                case 2:
                    asset = _a.sent();
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: takerAddress,
                            startAmount: amountInToken,
                            paymentTokenAddress: paymentTokenAddress,
                            expirationTime: expirationTime,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            buyerAddress: utils_1.NULL_ADDRESS,
                            waitForHighestBid: true,
                            schemaName: types_1.WyvernSchemaName.ERC721
                        })];
                case 3:
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
                            schemaName: types_1.WyvernSchemaName.ERC721
                        })];
                case 4:
                    buyOrder = _a.sent();
                    testFeesMakerOrder(buyOrder, asset.assetContract);
                    chai_1.assert.equal(buyOrder.makerRelayerFee.toNumber(), sellOrder.makerRelayerFee.toNumber());
                    chai_1.assert.equal(buyOrder.takerRelayerFee.toNumber(), sellOrder.takerRelayerFee.toNumber());
                    chai_1.assert.equal(buyOrder.makerProtocolFee.toNumber(), sellOrder.makerProtocolFee.toNumber());
                    chai_1.assert.equal(buyOrder.takerProtocolFee.toNumber(), sellOrder.takerProtocolFee.toNumber());
                    return [4 /*yield*/, client._buyOrderValidationAndApprovals({ order: buyOrder, accountAddress: accountAddress })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, client._sellOrderValidationAndApprovals({ order: sellOrder, accountAddress: takerAddress })];
                case 6:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test("Computes fees correctly for non-zero-fee asset", function () { return __awaiter(_this, void 0, void 0, function () {
        var tokenId, tokenAddress, bountyPercent, extraBountyBasisPoints, asset, contract, buyerFees, sellerFees, heterogenousBundleSellerFees, privateSellerFees, privateBuyerFees;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tokenId = constants_1.MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = constants_1.MYTHEREUM_ADDRESS;
                    bountyPercent = 1.5;
                    extraBountyBasisPoints = bountyPercent * 100;
                    return [4 /*yield*/, client.api.getAsset(tokenAddress, tokenId)];
                case 1:
                    asset = _a.sent();
                    contract = asset.assetContract;
                    return [4 /*yield*/, client.computeFees({
                            assets: [{ tokenAddress: tokenAddress, tokenId: tokenId }],
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            side: types_1.OrderSide.Buy
                        })];
                case 2:
                    buyerFees = _a.sent();
                    chai_1.assert.equal(buyerFees.totalBuyerFeeBPS, contract.buyerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.totalSellerFeeBPS, contract.sellerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.devBuyerFeeBPS, contract.devBuyerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.devSellerFeeBPS, contract.devSellerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.openseaBuyerFeeBPS, contract.openseaBuyerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.openseaSellerFeeBPS, contract.openseaSellerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.sellerBountyBPS, 0);
                    return [4 /*yield*/, client.computeFees({
                            assetContract: asset.assetContract,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            side: types_1.OrderSide.Sell
                        })];
                case 3:
                    sellerFees = _a.sent();
                    chai_1.assert.equal(sellerFees.totalBuyerFeeBPS, contract.buyerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.totalSellerFeeBPS, contract.sellerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.devBuyerFeeBPS, contract.devBuyerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.devSellerFeeBPS, contract.devSellerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.openseaBuyerFeeBPS, contract.openseaBuyerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.openseaSellerFeeBPS, contract.openseaSellerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.sellerBountyBPS, extraBountyBasisPoints);
                    return [4 /*yield*/, client.computeFees({
                            assets: [],
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            side: types_1.OrderSide.Sell
                        })];
                case 4:
                    heterogenousBundleSellerFees = _a.sent();
                    chai_1.assert.equal(heterogenousBundleSellerFees.totalBuyerFeeBPS, utils_1.DEFAULT_BUYER_FEE_BASIS_POINTS);
                    chai_1.assert.equal(heterogenousBundleSellerFees.totalSellerFeeBPS, utils_1.DEFAULT_SELLER_FEE_BASIS_POINTS);
                    chai_1.assert.equal(heterogenousBundleSellerFees.devBuyerFeeBPS, 0);
                    chai_1.assert.equal(heterogenousBundleSellerFees.devSellerFeeBPS, 0);
                    chai_1.assert.equal(heterogenousBundleSellerFees.openseaBuyerFeeBPS, utils_1.DEFAULT_BUYER_FEE_BASIS_POINTS);
                    chai_1.assert.equal(heterogenousBundleSellerFees.openseaSellerFeeBPS, utils_1.DEFAULT_SELLER_FEE_BASIS_POINTS);
                    chai_1.assert.equal(heterogenousBundleSellerFees.sellerBountyBPS, extraBountyBasisPoints);
                    return [4 /*yield*/, client.computeFees({
                            assets: [{ tokenAddress: tokenAddress, tokenId: tokenId }],
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            side: types_1.OrderSide.Sell,
                            isPrivate: true
                        })];
                case 5:
                    privateSellerFees = _a.sent();
                    chai_1.assert.equal(privateSellerFees.totalBuyerFeeBPS, 0);
                    chai_1.assert.equal(privateSellerFees.totalSellerFeeBPS, 0);
                    chai_1.assert.equal(privateSellerFees.devBuyerFeeBPS, 0);
                    chai_1.assert.equal(privateSellerFees.devSellerFeeBPS, 0);
                    chai_1.assert.equal(privateSellerFees.openseaBuyerFeeBPS, 0);
                    chai_1.assert.equal(privateSellerFees.openseaSellerFeeBPS, 0);
                    chai_1.assert.equal(privateSellerFees.sellerBountyBPS, 0);
                    return [4 /*yield*/, client.computeFees({
                            assets: [{ tokenAddress: tokenAddress, tokenId: tokenId }],
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            side: types_1.OrderSide.Buy,
                            isPrivate: true
                        })];
                case 6:
                    privateBuyerFees = _a.sent();
                    chai_1.assert.equal(privateBuyerFees.totalBuyerFeeBPS, 0);
                    chai_1.assert.equal(privateBuyerFees.totalSellerFeeBPS, 0);
                    chai_1.assert.equal(privateBuyerFees.devBuyerFeeBPS, 0);
                    chai_1.assert.equal(privateBuyerFees.devSellerFeeBPS, 0);
                    chai_1.assert.equal(privateBuyerFees.openseaBuyerFeeBPS, 0);
                    chai_1.assert.equal(privateBuyerFees.openseaSellerFeeBPS, 0);
                    chai_1.assert.equal(privateBuyerFees.sellerBountyBPS, 0);
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test("Computes fees correctly for zero-fee asset", function () { return __awaiter(_this, void 0, void 0, function () {
        var asset, bountyPercent, contract, buyerFees, sellerFees;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getAsset(constants_1.CK_ADDRESS, constants_1.CK_TOKEN_ID.toString())];
                case 1:
                    asset = _a.sent();
                    bountyPercent = 0;
                    contract = asset.assetContract;
                    return [4 /*yield*/, client.computeFees({
                            assetContract: contract,
                            extraBountyBasisPoints: bountyPercent * 100,
                            side: types_1.OrderSide.Buy
                        })];
                case 2:
                    buyerFees = _a.sent();
                    chai_1.assert.equal(buyerFees.totalBuyerFeeBPS, contract.buyerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.totalSellerFeeBPS, contract.sellerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.devBuyerFeeBPS, contract.devBuyerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.devSellerFeeBPS, contract.devSellerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.openseaBuyerFeeBPS, contract.openseaBuyerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.openseaSellerFeeBPS, contract.openseaSellerFeeBasisPoints);
                    chai_1.assert.equal(buyerFees.sellerBountyBPS, 0);
                    return [4 /*yield*/, client.computeFees({
                            assetContract: contract,
                            extraBountyBasisPoints: bountyPercent * 100,
                            side: types_1.OrderSide.Sell
                        })];
                case 3:
                    sellerFees = _a.sent();
                    chai_1.assert.equal(sellerFees.totalBuyerFeeBPS, contract.buyerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.totalSellerFeeBPS, contract.sellerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.devBuyerFeeBPS, contract.devBuyerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.devSellerFeeBPS, contract.devSellerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.openseaBuyerFeeBPS, contract.openseaBuyerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.openseaSellerFeeBPS, contract.openseaSellerFeeBasisPoints);
                    chai_1.assert.equal(sellerFees.sellerBountyBPS, bountyPercent * 100);
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test("Errors for computing fees correctly", function () { return __awaiter(_this, void 0, void 0, function () {
        var tokenId, tokenAddress, asset, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tokenId = constants_1.MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = constants_1.MYTHEREUM_ADDRESS;
                    return [4 /*yield*/, client.api.getAsset(tokenAddress, tokenId)];
                case 1:
                    asset = _a.sent();
                    chai_1.assert.isNotNull(asset);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, client.computeFees({
                            assets: [asset],
                            extraBountyBasisPoints: 200,
                            side: types_1.OrderSide.Sell
                        })];
                case 3:
                    _a.sent();
                    chai_1.assert.fail();
                    return [3 /*break*/, 5];
                case 4:
                    error_6 = _a.sent();
                    if (!error_6.message.includes('bounty exceeds the maximum') ||
                        !error_6.message.includes('OpenSea will add')) {
                        chai_1.assert.fail(error_6.message);
                    }
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test("Computes per-transfer fees correctly", function () { return __awaiter(_this, void 0, void 0, function () {
        var asset, zeroTransferFeeAsset, sellerFees, sellerZeroFees;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getAsset(utils_1.ENJIN_ADDRESS, constants_1.CATS_IN_MECHS_ID)];
                case 1:
                    asset = _a.sent();
                    return [4 /*yield*/, client.api.getAsset(constants_1.CK_ADDRESS, constants_1.CK_TOKEN_ID)];
                case 2:
                    zeroTransferFeeAsset = _a.sent();
                    return [4 /*yield*/, client.computeFees({
                            assets: [asset],
                            side: types_1.OrderSide.Sell
                        })];
                case 3:
                    sellerFees = _a.sent();
                    return [4 /*yield*/, client.computeFees({
                            assets: [zeroTransferFeeAsset],
                            side: types_1.OrderSide.Sell
                        })];
                case 4:
                    sellerZeroFees = _a.sent();
                    chai_1.assert.equal(sellerZeroFees.transferFee.toString(), "0");
                    chai_1.assert.isNull(sellerZeroFees.transferFeeTokenAddress);
                    chai_1.assert.equal(sellerFees.transferFee.toString(), "1000000000000000000");
                    chai_1.assert.equal(sellerFees.transferFeeTokenAddress, utils_1.ENJIN_COIN_ADDRESS);
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test("Matches a private sell order, doesn't for wrong taker", function () { return __awaiter(_this, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInToken, bountyPercent, tokenId, tokenAddress, asset, order, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_1.ALEX_ADDRESS;
                    takerAddress = constants_1.ALEX_ADDRESS_2;
                    amountInToken = 2;
                    bountyPercent = 0;
                    tokenId = constants_1.MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = constants_1.MYTHEREUM_ADDRESS;
                    return [4 /*yield*/, client.api.getAsset(tokenAddress, tokenId)];
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
                            paymentTokenAddress: utils_1.NULL_ADDRESS,
                            waitForHighestBid: false,
                            schemaName: types_1.WyvernSchemaName.ERC721
                        })];
                case 2:
                    order = _a.sent();
                    chai_1.assert.equal(order.paymentToken, utils_1.NULL_ADDRESS);
                    chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken);
                    chai_1.assert.equal(order.extra.toNumber(), 0);
                    chai_1.assert.equal(order.expirationTime.toNumber(), 0);
                    testFeesMakerOrder(order, asset.assetContract, bountyPercent * 100);
                    return [4 /*yield*/, client._sellOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })
                        // Make sure match is valid
                    ];
                case 3:
                    _a.sent();
                    // Make sure match is valid
                    return [4 /*yield*/, testMatchingNewOrder(order, takerAddress)
                        // Make sure no one else can take it
                    ];
                case 4:
                    // Make sure match is valid
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, testMatchingNewOrder(order, constants_1.DEVIN_ADDRESS)];
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
    mocha_typescript_1.test('Matches a new bountied sell order for an ERC-20 token (MANA)', function () { return __awaiter(_this, void 0, void 0, function () {
        var accountAddress, takerAddress, paymentToken, amountInToken, bountyPercent, tokenId, tokenAddress, asset, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_1.ALEX_ADDRESS;
                    takerAddress = constants_1.ALEX_ADDRESS_2;
                    return [4 /*yield*/, client.getFungibleTokens({ symbol: 'MANA' })];
                case 1:
                    paymentToken = (_a.sent())[0];
                    amountInToken = 4000;
                    bountyPercent = 1;
                    tokenId = constants_1.MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = constants_1.MYTHEREUM_ADDRESS;
                    return [4 /*yield*/, client.api.getAsset(tokenAddress, tokenId)];
                case 2:
                    asset = _a.sent();
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            quantity: 1,
                            accountAddress: accountAddress,
                            startAmount: amountInToken,
                            paymentTokenAddress: paymentToken.address,
                            extraBountyBasisPoints: bountyPercent * 100,
                            buyerAddress: utils_1.NULL_ADDRESS,
                            expirationTime: 0,
                            waitForHighestBid: false,
                            schemaName: types_1.WyvernSchemaName.ERC721
                        })];
                case 3:
                    order = _a.sent();
                    chai_1.assert.equal(order.paymentToken, paymentToken.address);
                    chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, paymentToken.decimals) * amountInToken);
                    chai_1.assert.equal(order.extra.toNumber(), 0);
                    chai_1.assert.equal(order.expirationTime.toNumber(), 0);
                    testFeesMakerOrder(order, asset.assetContract, bountyPercent * 100);
                    return [4 /*yield*/, client._sellOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })
                        // Make sure match is valid
                    ];
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
    mocha_typescript_1.test('Matches a buy order with an ERC-20 token (DAI)', function () { return __awaiter(_this, void 0, void 0, function () {
        var accountAddress, takerAddress, paymentToken, amountInToken, tokenId, tokenAddress, asset, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_1.ALEX_ADDRESS;
                    takerAddress = constants_1.ALEX_ADDRESS;
                    return [4 /*yield*/, client.getFungibleTokens({ symbol: 'DAI' })];
                case 1:
                    paymentToken = (_a.sent())[0];
                    amountInToken = 3;
                    tokenId = constants_1.CK_TOKEN_ID.toString();
                    tokenAddress = constants_1.CK_ADDRESS;
                    return [4 /*yield*/, client.api.getAsset(tokenAddress, tokenId)];
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
                            schemaName: types_1.WyvernSchemaName.ERC721
                        })];
                case 3:
                    order = _a.sent();
                    chai_1.assert.equal(order.paymentToken, paymentToken.address);
                    chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, paymentToken.decimals) * amountInToken);
                    chai_1.assert.equal(order.extra.toNumber(), 0);
                    chai_1.assert.equal(order.expirationTime.toNumber(), 0);
                    testFeesMakerOrder(order, asset.assetContract);
                    return [4 /*yield*/, client._buyOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })
                        // Make sure match is valid
                    ];
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
    mocha_typescript_1.test('Matches fixed heterogenous bountied bundle sell order', function () { return __awaiter(_this, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInEth, bountyPercent, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_1.ALEX_ADDRESS;
                    takerAddress = constants_1.ALEX_ADDRESS;
                    amountInEth = 1;
                    bountyPercent = 1.5;
                    return [4 /*yield*/, client._makeBundleSellOrder({
                            bundleName: "Test Bundle",
                            bundleDescription: "This is a test with different types of assets",
                            assets: assetsForBundleOrder,
                            accountAddress: accountAddress,
                            startAmount: amountInEth,
                            extraBountyBasisPoints: bountyPercent * 100,
                            expirationTime: 0,
                            paymentTokenAddress: utils_1.NULL_ADDRESS,
                            waitForHighestBid: false,
                            buyerAddress: utils_1.NULL_ADDRESS,
                            schemaName: types_1.WyvernSchemaName.ERC721
                        })];
                case 1:
                    order = _a.sent();
                    chai_1.assert.equal(order.paymentToken, utils_1.NULL_ADDRESS);
                    chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
                    chai_1.assert.equal(order.extra.toNumber(), 0);
                    chai_1.assert.equal(order.expirationTime.toNumber(), 0);
                    testFeesMakerOrder(order, undefined, bountyPercent * 100);
                    return [4 /*yield*/, client._sellOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })
                        // Make sure match is valid
                    ];
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
    mocha_typescript_1.test('Matches homogenous, bountied bundle sell order', function () { return __awaiter(_this, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInEth, bountyPercent, order, asset;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_1.ALEX_ADDRESS;
                    takerAddress = constants_1.ALEX_ADDRESS;
                    amountInEth = 1;
                    bountyPercent = 0.8;
                    return [4 /*yield*/, client._makeBundleSellOrder({
                            bundleName: "Test Homogenous Bundle",
                            bundleDescription: "This is a test with one type of asset",
                            assets: [{ tokenId: constants_1.MYTHEREUM_TOKEN_ID.toString(), tokenAddress: constants_1.MYTHEREUM_ADDRESS }],
                            accountAddress: accountAddress,
                            startAmount: amountInEth,
                            extraBountyBasisPoints: bountyPercent * 100,
                            expirationTime: 0,
                            paymentTokenAddress: utils_1.NULL_ADDRESS,
                            waitForHighestBid: false,
                            buyerAddress: utils_1.NULL_ADDRESS,
                            schemaName: types_1.WyvernSchemaName.ERC721
                        })];
                case 1:
                    order = _a.sent();
                    return [4 /*yield*/, client.api.getAsset(constants_1.MYTHEREUM_ADDRESS, constants_1.MYTHEREUM_TOKEN_ID.toString())];
                case 2:
                    asset = _a.sent();
                    chai_1.assert.equal(order.paymentToken, utils_1.NULL_ADDRESS);
                    chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
                    chai_1.assert.equal(order.extra.toNumber(), 0);
                    chai_1.assert.equal(order.expirationTime.toNumber(), 0);
                    testFeesMakerOrder(order, asset.assetContract, bountyPercent * 100);
                    return [4 /*yield*/, client._sellOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })
                        // Make sure match is valid
                    ];
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
    mocha_typescript_1.test('Serializes payment token and matches most recent ERC-20 sell order', function () { return __awaiter(_this, void 0, void 0, function () {
        var takerAddress, token, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    takerAddress = constants_1.ALEX_ADDRESS;
                    return [4 /*yield*/, client.getFungibleTokens({ symbol: 'MANA' })];
                case 1:
                    token = (_a.sent())[0];
                    return [4 /*yield*/, client.api.getOrder({
                            side: types_1.OrderSide.Sell,
                            payment_token_address: token.address
                        })];
                case 2:
                    order = _a.sent();
                    chai_1.assert.isNotNull(order.paymentTokenContract);
                    if (!order.paymentTokenContract) {
                        return [2 /*return*/];
                    }
                    chai_1.assert.equal(order.paymentTokenContract.address, token.address);
                    chai_1.assert.equal(order.paymentToken, token.address);
                    // TODO why can't we test atomicMatch?
                    return [4 /*yield*/, testMatchingOrder(order, takerAddress, false)];
                case 3:
                    // TODO why can't we test atomicMatch?
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('Bulk transfer', function () { return __awaiter(_this, void 0, void 0, function () {
        var accountAddress, takerAddress, gas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_1.ALEX_ADDRESS;
                    takerAddress = constants_1.ALEX_ADDRESS_2;
                    return [4 /*yield*/, client._estimateGasForTransfer({
                            assets: assetsForBulkTransfer,
                            fromAddress: accountAddress,
                            toAddress: takerAddress
                        })];
                case 1:
                    gas = _a.sent();
                    chai_1.assert.isAbove(gas, 0);
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('Fungible tokens filter', function () { return __awaiter(_this, void 0, void 0, function () {
        var manaTokens, mana, dai, all;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.getFungibleTokens({ symbol: "MANA" })];
                case 1:
                    manaTokens = (_a.sent());
                    // API returns another version of MANA,
                    // and one version is offline (in sdk)
                    chai_1.assert.equal(manaTokens.length, 2);
                    mana = manaTokens[0];
                    chai_1.assert.isNotNull(mana);
                    chai_1.assert.equal(mana.name, "Decentraland");
                    chai_1.assert.equal(mana.address, "0x0f5d2fb29fb7d3cfee444a200298f468908cc942");
                    chai_1.assert.equal(mana.decimals, 18);
                    return [4 /*yield*/, client.getFungibleTokens({ symbol: "DAI" })];
                case 2:
                    dai = (_a.sent())[0];
                    chai_1.assert.isNotNull(dai);
                    chai_1.assert.equal(dai.name, "");
                    return [4 /*yield*/, client.getFungibleTokens()];
                case 3:
                    all = _a.sent();
                    chai_1.assert.isNotEmpty(all);
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('Asset locked in contract is not transferrable', function () { return __awaiter(_this, void 0, void 0, function () {
        var isTransferrable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.isAssetTransferrable({
                        asset: {
                            tokenId: constants_1.GODS_UNCHAINED_TOKEN_ID.toString(),
                            tokenAddress: constants_1.GODS_UNCHAINED_ADDRESS,
                        },
                        fromAddress: constants_1.ALEX_ADDRESS,
                        toAddress: constants_1.ALEX_ADDRESS_2,
                        didOwnerApprove: true
                    })];
                case 1:
                    isTransferrable = _a.sent();
                    chai_1.assert.isNotTrue(isTransferrable);
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('ERC-721 v3 asset not owned by fromAddress is not transferrable', function () { return __awaiter(_this, void 0, void 0, function () {
        var isTransferrable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.isAssetTransferrable({
                        asset: {
                            tokenId: "1",
                            tokenAddress: constants_1.DIGITAL_ART_CHAIN_ADDRESS,
                        },
                        fromAddress: constants_1.ALEX_ADDRESS,
                        toAddress: constants_1.ALEX_ADDRESS_2
                    })];
                case 1:
                    isTransferrable = _a.sent();
                    chai_1.assert.isNotTrue(isTransferrable);
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('ERC-721 v3 asset owned by fromAddress is transferrable', function () { return __awaiter(_this, void 0, void 0, function () {
        var isTransferrable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.isAssetTransferrable({
                        asset: {
                            tokenId: constants_1.DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
                            tokenAddress: constants_1.DIGITAL_ART_CHAIN_ADDRESS,
                        },
                        fromAddress: constants_1.ALEX_ADDRESS,
                        toAddress: constants_1.ALEX_ADDRESS_2
                    })];
                case 1:
                    isTransferrable = _a.sent();
                    chai_1.assert.isTrue(isTransferrable);
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('ERC-721 v1 asset owned by fromAddress is transferrable', function () { return __awaiter(_this, void 0, void 0, function () {
        var isTransferrable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.isAssetTransferrable({
                        asset: {
                            tokenId: constants_1.CK_TOKEN_ID.toString(),
                            tokenAddress: constants_1.CK_ADDRESS,
                        },
                        fromAddress: constants_1.ALEX_ADDRESS,
                        toAddress: constants_1.ALEX_ADDRESS_2,
                        didOwnerApprove: true
                    })];
                case 1:
                    isTransferrable = _a.sent();
                    chai_1.assert.isTrue(isTransferrable);
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('Matches a new bundle sell order for an ERC-20 token (MANA)', function () { return __awaiter(_this, void 0, void 0, function () {
        var accountAddress, takerAddress, token, amountInToken, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_1.ALEX_ADDRESS;
                    takerAddress = constants_1.ALEX_ADDRESS;
                    return [4 /*yield*/, client.getFungibleTokens({ symbol: 'MANA' })];
                case 1:
                    token = (_a.sent())[0];
                    amountInToken = 2.422;
                    return [4 /*yield*/, client._makeBundleSellOrder({
                            bundleName: "Test Bundle",
                            bundleDescription: "This is a test with different types of assets",
                            assets: assetsForBundleOrder,
                            accountAddress: accountAddress,
                            startAmount: amountInToken,
                            paymentTokenAddress: token.address,
                            extraBountyBasisPoints: 0,
                            expirationTime: 0,
                            waitForHighestBid: false,
                            buyerAddress: utils_1.NULL_ADDRESS,
                            schemaName: types_1.WyvernSchemaName.ERC721
                        })];
                case 2:
                    order = _a.sent();
                    chai_1.assert.equal(order.paymentToken, token.address);
                    chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, token.decimals) * amountInToken);
                    chai_1.assert.equal(order.extra.toNumber(), 0);
                    chai_1.assert.equal(order.expirationTime.toNumber(), 0);
                    return [4 /*yield*/, client._sellOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })
                        // Make sure match is valid
                    ];
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
    mocha_typescript_1.test('Matches Dutch bundle order for different approve-all assets', function () { return __awaiter(_this, void 0, void 0, function () {
        var accountAddress, takerAddress, expirationTime, amountInEth, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_1.ALEX_ADDRESS;
                    takerAddress = constants_1.ALEX_ADDRESS;
                    expirationTime = (Date.now() / 1000 + 60 * 60 * 24) // one day from now
                    ;
                    amountInEth = 1;
                    return [4 /*yield*/, client._makeBundleSellOrder({
                            bundleName: "Test Bundle",
                            bundleDescription: "This is a test with different types of assets",
                            assets: assetsForBundleOrder,
                            accountAddress: accountAddress,
                            startAmount: amountInEth,
                            endAmount: 0,
                            expirationTime: expirationTime,
                            extraBountyBasisPoints: 0,
                            waitForHighestBid: false,
                            buyerAddress: utils_1.NULL_ADDRESS,
                            paymentTokenAddress: utils_1.NULL_ADDRESS,
                            schemaName: types_1.WyvernSchemaName.ERC721
                        })];
                case 1:
                    order = _a.sent();
                    chai_1.assert.equal(order.paymentToken, utils_1.NULL_ADDRESS);
                    chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
                    chai_1.assert.equal(order.extra.toNumber(), Math.pow(10, 18) * amountInEth);
                    chai_1.assert.equal(order.expirationTime.toNumber(), expirationTime);
                    return [4 /*yield*/, client._sellOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })
                        // Make sure match is valid
                    ];
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
    mocha_typescript_1.test('An API asset\'s order has correct hash', function () { return __awaiter(_this, void 0, void 0, function () {
        var asset, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getAsset(constants_1.CK_ADDRESS, 1)];
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
                    chai_1.assert.equal(order.hash, utils_1.getOrderHash(order));
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('orderToJSON computes correct current price for Dutch auctions', function () { return __awaiter(_this, void 0, void 0, function () {
        var orders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getOrders({ sale_kind: types_1.SaleKind.DutchAuction })];
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
                            ? +order.takerRelayerFee / utils_1.INVERSE_BASIS_POINT + 1
                            : 1;
                        // Possible race condition
                        chai_1.assert.equal(order.currentPrice.toPrecision(3), utils_1.estimateCurrentPrice(order).toPrecision(3));
                        chai_1.assert.isAtLeast(order.basePrice.times(multiple).toNumber(), order.currentPrice.toNumber());
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('orderToJSON current price includes buyer fee', function () { return __awaiter(_this, void 0, void 0, function () {
        var orders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getOrders({
                        sale_kind: types_1.SaleKind.FixedPrice,
                        asset_contract_address: constants_1.CRYPTOFLOWERS_CONTRACT_ADDRESS_WITH_BUYER_FEE,
                        bundled: false
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
                        var buyerFeeBPS = order.waitingForBestCounterOrder
                            ? order.makerRelayerFee
                            : order.takerRelayerFee;
                        var multiple = order.side == types_1.OrderSide.Sell
                            ? +buyerFeeBPS / utils_1.INVERSE_BASIS_POINT + 1
                            : 1;
                        chai_1.assert.equal(order.basePrice.times(multiple).toNumber(), utils_1.estimateCurrentPrice(order).toNumber());
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('First page of orders have valid hashes and fees', function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, orders, count;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, client.api.getOrders()];
                case 1:
                    _a = _b.sent(), orders = _a.orders, count = _a.count;
                    chai_1.assert.isNotEmpty(orders);
                    chai_1.assert.isAbove(count, orders.length);
                    orders.forEach(function (order) {
                        if (order.asset) {
                            chai_1.assert.isNotEmpty(order.asset.assetContract);
                            chai_1.assert.isNotEmpty(order.asset.tokenId);
                            testFeesMakerOrder(order, order.asset.assetContract);
                        }
                        chai_1.assert.isNotEmpty(order.paymentTokenContract);
                        var accountAddress = constants_1.ALEX_ADDRESS;
                        var matchingOrder = client._makeMatchingOrder({
                            order: order,
                            accountAddress: accountAddress,
                            recipientAddress: accountAddress
                        });
                        var matchingOrderHash = matchingOrder.hash;
                        delete matchingOrder.hash;
                        chai_1.assert.isUndefined(matchingOrder.hash);
                        var orderHash = utils_1.getOrderHash(matchingOrder);
                        chai_1.assert.equal(orderHash, matchingOrderHash);
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('Uses a gas price above the mean', function () { return __awaiter(_this, void 0, void 0, function () {
        var gasPrice, meanGasPrice;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client._computeGasPrice()];
                case 1:
                    gasPrice = _a.sent();
                    return [4 /*yield*/, utils_1.getCurrentGasPrice(client.web3)];
                case 2:
                    meanGasPrice = _a.sent();
                    chai_1.assert.isAbove(meanGasPrice.toNumber(), 0);
                    chai_1.assert.isAbove(gasPrice.toNumber(), meanGasPrice.toNumber());
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('Fetches proxy for an account', function () { return __awaiter(_this, void 0, void 0, function () {
        var accountAddress, proxy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_1.ALEX_ADDRESS;
                    return [4 /*yield*/, client._getProxy(accountAddress)];
                case 1:
                    proxy = _a.sent();
                    chai_1.assert.isNotNull(proxy);
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('Fetches positive token balance for an account', function () { return __awaiter(_this, void 0, void 0, function () {
        var accountAddress, balance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_1.ALEX_ADDRESS;
                    return [4 /*yield*/, client.getTokenBalance({ accountAddress: accountAddress })];
                case 1:
                    balance = _a.sent();
                    chai_1.assert.isAbove(balance.toNumber(), 0);
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('Accounts have maximum token balance approved', function () { return __awaiter(_this, void 0, void 0, function () {
        var accountAddress, approved;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = constants_1.ALEX_ADDRESS;
                    return [4 /*yield*/, client._getApprovedTokenCount({ accountAddress: accountAddress })];
                case 1:
                    approved = _a.sent();
                    chai_1.assert.equal(approved.toString(), utils_1.MAX_UINT_256.toString());
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('Matches first buy order in book', function () { return __awaiter(_this, void 0, void 0, function () {
        var order, takerAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getOrder({ side: types_1.OrderSide.Buy })];
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
                    takerAddress = order.asset.owner.address;
                    // Taker might not have all approval permissions so only test match
                    return [4 /*yield*/, testMatchingOrder(order, takerAddress, false)];
                case 2:
                    // Taker might not have all approval permissions so only test match
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    mocha_typescript_1.test('Matches a buy order and estimates gas on fulfillment', function () { return __awaiter(_this, void 0, void 0, function () {
        var takerAddress, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    takerAddress = constants_1.ALEX_ADDRESS;
                    return [4 /*yield*/, client.api.getOrder({
                            side: types_1.OrderSide.Buy,
                            owner: takerAddress,
                            // Use a token that has already been approved via approve-all
                            asset_contract_address: constants_1.DIGITAL_ART_CHAIN_ADDRESS
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
    mocha_typescript_1.test('Matches a referred order via sell_orders and getAssets', function () { return __awaiter(_this, void 0, void 0, function () {
        var assets, asset, order, takerAddress, referrerAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getAssets({ asset_contract_address: constants_1.CRYPTO_CRYSTAL_ADDRESS, order_by: "current_price", order_direction: "desc" })];
                case 1:
                    assets = (_a.sent()).assets;
                    asset = assets.filter(function (a) { return !!a.sellOrders; })[0];
                    chai_1.assert.isNotNull(asset);
                    if (!asset || !asset.sellOrders) {
                        return [2 /*return*/];
                    }
                    order = asset.sellOrders[0];
                    chai_1.assert.isNotNull(order);
                    if (!order) {
                        return [2 /*return*/];
                    }
                    takerAddress = constants_1.ALEX_ADDRESS;
                    referrerAddress = constants_1.ALEX_ADDRESS_2;
                    return [4 /*yield*/, testMatchingOrder(order, takerAddress, true, referrerAddress)];
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
        var recipientAddress, matchingOrder, _a, buy, sell, isValid, isValid, isFulfillable, gasPrice;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    recipientAddress = constants_1.ALEX_ADDRESS_2 // Test a separate recipient
                    ;
                    matchingOrder = client._makeMatchingOrder({
                        order: order,
                        accountAddress: accountAddress,
                        recipientAddress: recipientAddress
                    });
                    chai_1.assert.equal(matchingOrder.hash, utils_1.getOrderHash(matchingOrder));
                    _a = utils_1.assignOrdersToSides(order, matchingOrder), buy = _a.buy, sell = _a.sell;
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
                    if (!(testAtomicMatch && !order.waitingForBestCounterOrder)) return [3 /*break*/, 7];
                    return [4 /*yield*/, client._validateOrder(order)];
                case 4:
                    isValid = _b.sent();
                    chai_1.assert.isTrue(isValid);
                    return [4 /*yield*/, client.isOrderFulfillable({
                            order: order,
                            accountAddress: accountAddress,
                            recipientAddress: recipientAddress,
                            referrerAddress: referrerAddress
                        })];
                case 5:
                    isFulfillable = _b.sent();
                    chai_1.assert.isTrue(isFulfillable);
                    return [4 /*yield*/, client._computeGasPrice()];
                case 6:
                    gasPrice = _b.sent();
                    console.info("Gas price to use: " + client.web3.fromWei(gasPrice, 'gwei') + " gwei");
                    _b.label = 7;
                case 7: return [2 /*return*/];
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
                    order = __assign({}, unhashedOrder, { hash: utils_1.getOrderHash(unhashedOrder) });
                    matchingOrder = client._makeMatchingOrder({
                        order: order,
                        accountAddress: accountAddress,
                        recipientAddress: accountAddress
                    });
                    if (counterOrderListingTime != null) {
                        matchingOrder.listingTime = utils_1.makeBigNumber(counterOrderListingTime);
                        matchingOrder.hash = utils_1.getOrderHash(matchingOrder);
                    }
                    chai_1.assert.equal(matchingOrder.hash, utils_1.getOrderHash(matchingOrder));
                    // Test fees
                    chai_1.assert.equal(matchingOrder.makerProtocolFee.toNumber(), 0);
                    chai_1.assert.equal(matchingOrder.takerProtocolFee.toNumber(), 0);
                    if (order.waitingForBestCounterOrder) {
                        chai_1.assert.equal(matchingOrder.feeRecipient, utils_1.OPENSEA_FEE_RECIPIENT);
                    }
                    else {
                        chai_1.assert.equal(matchingOrder.feeRecipient, utils_1.NULL_ADDRESS);
                    }
                    chai_1.assert.equal(matchingOrder.makerRelayerFee.toNumber(), order.makerRelayerFee.toNumber());
                    chai_1.assert.equal(matchingOrder.takerRelayerFee.toNumber(), order.takerRelayerFee.toNumber());
                    chai_1.assert.equal(matchingOrder.makerReferrerFee.toNumber(), order.makerReferrerFee.toNumber());
                    v = 27;
                    r = '';
                    s = '';
                    if (order.side == types_1.OrderSide.Buy) {
                        buy = __assign({}, order, { v: v, r: r, s: s });
                        sell = __assign({}, matchingOrder, { v: v, r: r, s: s });
                    }
                    else {
                        sell = __assign({}, order, { v: v, r: r, s: s });
                        buy = __assign({}, matchingOrder, { v: v, r: r, s: s });
                    }
                    return [4 /*yield*/, client._validateMatch({ buy: buy, sell: sell, accountAddress: accountAddress })];
                case 1:
                    isValid = _a.sent();
                    chai_1.assert.isTrue(isValid);
                    // Make sure assets are transferrable
                    return [4 /*yield*/, Promise.all(getAssetsAndQuantities(order).map(function (_a) {
                            var asset = _a.asset, quantity = _a.quantity;
                            return __awaiter(_this, void 0, void 0, function () {
                                var isTransferrable;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, client.isAssetTransferrable({
                                                asset: asset,
                                                quantity: quantity,
                                                fromAddress: sell.maker,
                                                toAddress: buy.maker,
                                                didOwnerApprove: true
                                            })];
                                        case 1:
                                            isTransferrable = _b.sent();
                                            chai_1.assert.isTrue(isTransferrable);
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
function testFeesMakerOrder(order, assetContract, makerBountyBPS) {
    chai_1.assert.equal(order.makerProtocolFee.toNumber(), 0);
    chai_1.assert.equal(order.takerProtocolFee.toNumber(), 0);
    if (order.waitingForBestCounterOrder) {
        chai_1.assert.equal(order.feeRecipient, utils_1.NULL_ADDRESS);
    }
    else {
        chai_1.assert.equal(order.feeRecipient, utils_1.OPENSEA_FEE_RECIPIENT);
    }
    if (order.taker != utils_1.NULL_ADDRESS) {
        // Private order
        chai_1.assert.equal(order.makerReferrerFee.toNumber(), 0);
        chai_1.assert.equal(order.takerRelayerFee.toNumber(), 0);
        chai_1.assert.equal(order.makerRelayerFee.toNumber(), 0);
        return;
    }
    // Public order
    if (makerBountyBPS != null) {
        chai_1.assert.equal(order.makerReferrerFee.toNumber(), makerBountyBPS);
    }
    if (assetContract) {
        // Homogenous sale
        if (order.side == types_1.OrderSide.Sell && order.waitingForBestCounterOrder) {
            // Fees may not match the contract's fees, which are changeable.
        }
        else if (order.side == types_1.OrderSide.Sell) {
            chai_1.assert.equal(order.makerRelayerFee.toNumber(), assetContract.sellerFeeBasisPoints);
            chai_1.assert.equal(order.takerRelayerFee.toNumber(), assetContract.buyerFeeBasisPoints);
            chai_1.assert.equal(order.makerRelayerFee.toNumber(), assetContract.devSellerFeeBasisPoints + assetContract.openseaSellerFeeBasisPoints);
            // Check bounty
            if (assetContract.openseaSellerFeeBasisPoints >= utils_1.OPENSEA_SELLER_BOUNTY_BASIS_POINTS) {
                chai_1.assert.isAtMost(utils_1.OPENSEA_SELLER_BOUNTY_BASIS_POINTS + order.makerReferrerFee.toNumber(), assetContract.openseaSellerFeeBasisPoints);
            }
            else {
                // No extra bounty allowed if < 1%
                chai_1.assert.equal(order.makerReferrerFee.toNumber(), 0);
            }
        }
        else {
            chai_1.assert.equal(order.makerRelayerFee.toNumber(), assetContract.buyerFeeBasisPoints);
            chai_1.assert.equal(order.takerRelayerFee.toNumber(), assetContract.sellerFeeBasisPoints);
            chai_1.assert.equal(order.makerRelayerFee.toNumber(), assetContract.devBuyerFeeBasisPoints + assetContract.openseaBuyerFeeBasisPoints);
        }
    }
    else {
        // Heterogenous
        if (order.side == types_1.OrderSide.Sell) {
            chai_1.assert.equal(order.makerRelayerFee.toNumber(), utils_1.DEFAULT_SELLER_FEE_BASIS_POINTS);
            chai_1.assert.equal(order.takerRelayerFee.toNumber(), utils_1.DEFAULT_BUYER_FEE_BASIS_POINTS);
            chai_1.assert.isAtMost(utils_1.OPENSEA_SELLER_BOUNTY_BASIS_POINTS + order.makerReferrerFee.toNumber(), utils_1.DEFAULT_MAX_BOUNTY);
        }
        else {
            chai_1.assert.equal(order.makerRelayerFee.toNumber(), utils_1.DEFAULT_BUYER_FEE_BASIS_POINTS);
            chai_1.assert.equal(order.takerRelayerFee.toNumber(), utils_1.DEFAULT_SELLER_FEE_BASIS_POINTS);
        }
    }
}
function getAssetsAndQuantities(order) {
    var wyAssets = order.metadata.bundle
        ? order.metadata.bundle.assets
        : order.metadata.asset
            ? [order.metadata.asset]
            : [];
    chai_1.assert.isNotEmpty(wyAssets);
    return wyAssets.map(function (wyAsset) {
        var asset = {
            tokenId: 'id' in wyAsset && wyAsset.id != null ? wyAsset.id : null,
            tokenAddress: wyAsset.address
        };
        if ('quantity' in wyAsset) {
            return { asset: asset, quantity: wyAsset.quantity };
        }
        else {
            return { asset: asset, quantity: 1 };
        }
    });
}
//# sourceMappingURL=seaport.js.map