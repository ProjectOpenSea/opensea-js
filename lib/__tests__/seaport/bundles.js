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
import { ENJIN_ADDRESS, MAINNET_PROVIDER_URL, NULL_ADDRESS, } from "../../constants";
import { OpenSeaPort } from "../../index";
import { Network, WyvernSchemaName } from "../../types";
import { AGE_OF_RUST_TOKEN_ID, ALEX_ADDRESS, ALEX_ADDRESS_2, BENZENE_ADDRESS, CRYPTOVOXELS_WEARABLE_2_ID, CRYPTOVOXELS_WEARABLE_ADDRESS, CRYPTOVOXELS_WEARABLE_ID, DIGITAL_ART_CHAIN_ADDRESS, DIGITAL_ART_CHAIN_TOKEN_ID, DISSOLUTION_TOKEN_ID, GODS_UNCHAINED_CHEST_ADDRESS, MAINNET_API_KEY, MYTHEREUM_ADDRESS, MYTHEREUM_SLUG, MYTHEREUM_TOKEN_ID, WETH_ADDRESS, } from "../constants";
import { testFeesMakerOrder } from "./fees";
import { testMatchingNewOrder } from "./orders";
var provider = new Web3.providers.HttpProvider(MAINNET_PROVIDER_URL);
var client = new OpenSeaPort(provider, {
    networkName: Network.Main,
    apiKey: MAINNET_API_KEY,
}, function (line) { return console.info("MAINNET: ".concat(line)); });
var assetsForBundleOrder = [
    {
        tokenId: MYTHEREUM_TOKEN_ID.toString(),
        tokenAddress: MYTHEREUM_ADDRESS,
        quantity: 1,
    },
    {
        tokenId: DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
        tokenAddress: DIGITAL_ART_CHAIN_ADDRESS,
        quantity: 1,
    },
];
var assetsForBundleOrderERC721v3 = [
    {
        tokenId: MYTHEREUM_TOKEN_ID.toString(),
        tokenAddress: MYTHEREUM_ADDRESS,
        quantity: 1,
        schemaName: WyvernSchemaName.ERC721v3,
    },
    {
        tokenId: DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
        tokenAddress: DIGITAL_ART_CHAIN_ADDRESS,
        quantity: 1,
        schemaName: WyvernSchemaName.ERC721v3,
    },
];
var fungibleAssetsForBundleOrder = [
    {
        tokenAddress: BENZENE_ADDRESS,
        tokenId: null,
        schemaName: WyvernSchemaName.ERC20,
        quantity: 20,
    },
    {
        tokenAddress: GODS_UNCHAINED_CHEST_ADDRESS,
        tokenId: null,
        schemaName: WyvernSchemaName.ERC20,
        quantity: 1,
    },
];
var heterogenousSemiFungibleAssetsForBundleOrder = [
    {
        tokenId: DISSOLUTION_TOKEN_ID,
        tokenAddress: ENJIN_ADDRESS,
        schemaName: WyvernSchemaName.ERC1155,
        quantity: 2,
    },
    {
        tokenId: AGE_OF_RUST_TOKEN_ID,
        tokenAddress: ENJIN_ADDRESS,
        schemaName: WyvernSchemaName.ERC1155,
        quantity: 1,
    },
    {
        tokenId: CRYPTOVOXELS_WEARABLE_ID,
        tokenAddress: CRYPTOVOXELS_WEARABLE_ADDRESS,
        schemaName: WyvernSchemaName.ERC1155,
        quantity: 1,
    },
];
var homogenousSemiFungibleAssetsForBundleOrder = [
    {
        tokenId: CRYPTOVOXELS_WEARABLE_ID,
        tokenAddress: CRYPTOVOXELS_WEARABLE_ADDRESS,
        schemaName: WyvernSchemaName.ERC1155,
        quantity: 1,
    },
    {
        tokenId: CRYPTOVOXELS_WEARABLE_2_ID,
        tokenAddress: CRYPTOVOXELS_WEARABLE_ADDRESS,
        schemaName: WyvernSchemaName.ERC1155,
        quantity: 2,
    },
];
var manaAddress;
suite("seaport: bundles", function () {
    before(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.api.getPaymentTokens({ symbol: "MANA" })];
                case 1:
                    manaAddress = (_a.sent())
                        .tokens[0].address;
                    return [2 /*return*/];
            }
        });
    }); });
    test("Matches heterogenous bundle buy order", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInEth, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    takerAddress = ALEX_ADDRESS;
                    amountInEth = 0.01;
                    return [4 /*yield*/, client._makeBundleBuyOrder({
                            assets: assetsForBundleOrder,
                            quantities: [1, 1],
                            accountAddress: accountAddress,
                            startAmount: amountInEth,
                            extraBountyBasisPoints: 0,
                            expirationTime: 0,
                            paymentTokenAddress: WETH_ADDRESS,
                        })];
                case 1:
                    order = _a.sent();
                    assert.equal(order.paymentToken, WETH_ADDRESS);
                    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
                    assert.equal(order.extra.toNumber(), 0);
                    assert.equal(order.expirationTime.toNumber(), 0);
                    testBundleMetadata(order, WyvernSchemaName.ERC721);
                    testFeesMakerOrder(order, undefined);
                    return [4 /*yield*/, client._buyOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })];
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
    test("Matches homogenous bundle buy order", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInToken, assets, order, asset;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    takerAddress = ALEX_ADDRESS;
                    amountInToken = 10;
                    assets = [
                        {
                            tokenId: MYTHEREUM_TOKEN_ID.toString(),
                            tokenAddress: MYTHEREUM_ADDRESS,
                        },
                    ];
                    return [4 /*yield*/, client._makeBundleBuyOrder({
                            assets: assets,
                            collection: { slug: MYTHEREUM_SLUG },
                            quantities: [1],
                            accountAddress: accountAddress,
                            startAmount: amountInToken,
                            extraBountyBasisPoints: 0,
                            expirationTime: 0,
                            paymentTokenAddress: manaAddress,
                        })];
                case 1:
                    order = _a.sent();
                    return [4 /*yield*/, client.api.getAsset(assets[0])];
                case 2:
                    asset = _a.sent();
                    assert.equal(order.paymentToken, manaAddress);
                    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken);
                    assert.equal(order.extra.toNumber(), 0);
                    assert.equal(order.expirationTime.toNumber(), 0);
                    testBundleMetadata(order, WyvernSchemaName.ERC721);
                    testFeesMakerOrder(order, asset.collection);
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
    test("Matches fixed heterogenous bountied bundle sell order", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInEth, bountyPercent, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    takerAddress = ALEX_ADDRESS;
                    amountInEth = 1;
                    bountyPercent = 1.5;
                    return [4 /*yield*/, client._makeBundleSellOrder({
                            bundleName: "Test Bundle",
                            bundleDescription: "This is a test with different types of assets",
                            assets: assetsForBundleOrder,
                            quantities: [1, 1],
                            accountAddress: accountAddress,
                            startAmount: amountInEth,
                            extraBountyBasisPoints: bountyPercent * 100,
                            expirationTime: 0,
                            paymentTokenAddress: NULL_ADDRESS,
                            waitForHighestBid: false,
                            buyerAddress: NULL_ADDRESS,
                        })];
                case 1:
                    order = _a.sent();
                    assert.equal(order.paymentToken, NULL_ADDRESS);
                    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
                    assert.equal(order.extra.toNumber(), 0);
                    assert.equal(order.expirationTime.toNumber(), 0);
                    testBundleMetadata(order, WyvernSchemaName.ERC721);
                    testFeesMakerOrder(order, undefined, bountyPercent * 100);
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
    test("Matches fixed heterogenous bountied bundle sell order ERC721v3", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInEth, bountyPercent, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    takerAddress = ALEX_ADDRESS;
                    amountInEth = 1;
                    bountyPercent = 1.5;
                    return [4 /*yield*/, client._makeBundleSellOrder({
                            bundleName: "Test Bundle",
                            bundleDescription: "This is a test with different types of assets",
                            assets: assetsForBundleOrderERC721v3,
                            quantities: [1, 1],
                            accountAddress: accountAddress,
                            startAmount: amountInEth,
                            extraBountyBasisPoints: bountyPercent * 100,
                            expirationTime: 0,
                            paymentTokenAddress: NULL_ADDRESS,
                            waitForHighestBid: false,
                            buyerAddress: NULL_ADDRESS,
                        })];
                case 1:
                    order = _a.sent();
                    assert.equal(order.paymentToken, NULL_ADDRESS);
                    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
                    assert.equal(order.extra.toNumber(), 0);
                    assert.equal(order.expirationTime.toNumber(), 0);
                    testBundleMetadata(order, WyvernSchemaName.ERC721v3);
                    testFeesMakerOrder(order, undefined, bountyPercent * 100);
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
    test("Matches homogenous, bountied bundle sell order", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInEth, bountyPercent, assets, order, asset;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    takerAddress = ALEX_ADDRESS;
                    amountInEth = 1;
                    bountyPercent = 0.8;
                    assets = [
                        {
                            tokenId: MYTHEREUM_TOKEN_ID.toString(),
                            tokenAddress: MYTHEREUM_ADDRESS,
                        },
                    ];
                    return [4 /*yield*/, client._makeBundleSellOrder({
                            bundleName: "Test Homogenous Bundle",
                            bundleDescription: "This is a test with one type of asset",
                            assets: assets,
                            collection: { slug: MYTHEREUM_SLUG },
                            quantities: [1],
                            accountAddress: accountAddress,
                            startAmount: amountInEth,
                            extraBountyBasisPoints: bountyPercent * 100,
                            expirationTime: 0,
                            paymentTokenAddress: NULL_ADDRESS,
                            waitForHighestBid: false,
                            buyerAddress: NULL_ADDRESS,
                        })];
                case 1:
                    order = _a.sent();
                    return [4 /*yield*/, client.api.getAsset(assets[0])];
                case 2:
                    asset = _a.sent();
                    assert.equal(order.paymentToken, NULL_ADDRESS);
                    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
                    assert.equal(order.extra.toNumber(), 0);
                    assert.equal(order.expirationTime.toNumber(), 0);
                    testBundleMetadata(order, WyvernSchemaName.ERC721);
                    testFeesMakerOrder(order, asset.collection, bountyPercent * 100);
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
    test("Matches a new bundle sell order for an ERC-20 token (MANA)", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, token, amountInToken, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    takerAddress = ALEX_ADDRESS;
                    return [4 /*yield*/, client.api.getPaymentTokens({ symbol: "MANA" })];
                case 1:
                    token = (_a.sent())
                        .tokens[0];
                    amountInToken = 2.422;
                    return [4 /*yield*/, client._makeBundleSellOrder({
                            bundleName: "Test Bundle",
                            bundleDescription: "This is a test with different types of assets",
                            assets: assetsForBundleOrder,
                            quantities: [1, 1],
                            accountAddress: accountAddress,
                            startAmount: amountInToken,
                            paymentTokenAddress: token.address,
                            extraBountyBasisPoints: 0,
                            expirationTime: 0,
                            waitForHighestBid: false,
                            buyerAddress: NULL_ADDRESS,
                        })];
                case 2:
                    order = _a.sent();
                    assert.equal(order.paymentToken, token.address);
                    assert.equal(order.basePrice.toNumber(), Math.pow(10, token.decimals) * amountInToken);
                    assert.equal(order.extra.toNumber(), 0);
                    testBundleMetadata(order, WyvernSchemaName.ERC721);
                    assert.equal(order.expirationTime.toNumber(), 0);
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
    test("Matches Dutch bundle order for different approve-all assets", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, expirationTime, amountInEth, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    takerAddress = ALEX_ADDRESS;
                    expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24);
                    amountInEth = 1;
                    return [4 /*yield*/, client._makeBundleSellOrder({
                            bundleName: "Test Bundle",
                            bundleDescription: "This is a test with different types of assets",
                            assets: assetsForBundleOrder,
                            quantities: [1, 1],
                            accountAddress: accountAddress,
                            startAmount: amountInEth,
                            endAmount: 0,
                            expirationTime: expirationTime,
                            extraBountyBasisPoints: 0,
                            waitForHighestBid: false,
                            buyerAddress: NULL_ADDRESS,
                            paymentTokenAddress: NULL_ADDRESS,
                        })];
                case 1:
                    order = _a.sent();
                    assert.equal(order.paymentToken, NULL_ADDRESS);
                    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
                    assert.equal(order.extra.toNumber(), Math.pow(10, 18) * amountInEth);
                    assert.equal(order.expirationTime.toNumber(), expirationTime);
                    testBundleMetadata(order, WyvernSchemaName.ERC721);
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
    test("Can bundle multiple fungible tokens together", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInEth, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    takerAddress = ALEX_ADDRESS;
                    amountInEth = 1;
                    return [4 /*yield*/, client._makeBundleSellOrder({
                            bundleName: "Test Bundle",
                            bundleDescription: "This is a test with fungible assets",
                            assets: fungibleAssetsForBundleOrder,
                            quantities: fungibleAssetsForBundleOrder.map(function (a) { return a.quantity; }),
                            accountAddress: accountAddress,
                            startAmount: amountInEth,
                            expirationTime: 0,
                            extraBountyBasisPoints: 0,
                            waitForHighestBid: false,
                            buyerAddress: NULL_ADDRESS,
                            paymentTokenAddress: NULL_ADDRESS,
                        })];
                case 1:
                    order = _a.sent();
                    assert.equal(order.paymentToken, NULL_ADDRESS);
                    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
                    testBundleMetadata(order, WyvernSchemaName.ERC20);
                    testFeesMakerOrder(order, undefined);
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
    test("Can bundle multiple SFTs together", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInEth, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    takerAddress = ALEX_ADDRESS;
                    amountInEth = 1;
                    return [4 /*yield*/, client._makeBundleSellOrder({
                            bundleName: "Test Bundle",
                            bundleDescription: "This is a test with SFT assets",
                            assets: heterogenousSemiFungibleAssetsForBundleOrder,
                            quantities: heterogenousSemiFungibleAssetsForBundleOrder.map(function (a) { return a.quantity; }),
                            accountAddress: accountAddress,
                            startAmount: amountInEth,
                            expirationTime: 0,
                            extraBountyBasisPoints: 0,
                            waitForHighestBid: false,
                            buyerAddress: NULL_ADDRESS,
                            paymentTokenAddress: NULL_ADDRESS,
                        })];
                case 1:
                    order = _a.sent();
                    assert.equal(order.paymentToken, NULL_ADDRESS);
                    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
                    testBundleMetadata(order, WyvernSchemaName.ERC1155);
                    testFeesMakerOrder(order, undefined);
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
    test("Can bundle multiple homogenous semifungibles", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInEth, asset, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    takerAddress = ALEX_ADDRESS;
                    amountInEth = 1;
                    return [4 /*yield*/, client.api.getAsset(homogenousSemiFungibleAssetsForBundleOrder[0])];
                case 1:
                    asset = _a.sent();
                    return [4 /*yield*/, client._makeBundleSellOrder({
                            bundleName: "Test Bundle",
                            bundleDescription: "This is a test with homogenous SFT assets",
                            assets: homogenousSemiFungibleAssetsForBundleOrder,
                            collection: asset.collection,
                            quantities: homogenousSemiFungibleAssetsForBundleOrder.map(function (a) { return a.quantity; }),
                            accountAddress: accountAddress,
                            startAmount: amountInEth,
                            expirationTime: 0,
                            extraBountyBasisPoints: 0,
                            waitForHighestBid: false,
                            buyerAddress: NULL_ADDRESS,
                            paymentTokenAddress: NULL_ADDRESS,
                        })];
                case 2:
                    order = _a.sent();
                    assert.equal(order.paymentToken, NULL_ADDRESS);
                    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
                    testBundleMetadata(order, WyvernSchemaName.ERC1155);
                    testFeesMakerOrder(order, asset.collection);
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
    test("Matches bundle sell order for misordered assets with different schemas", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInEth, assets, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    takerAddress = ALEX_ADDRESS_2;
                    amountInEth = 1;
                    assets = [
                        assetsForBundleOrder[0],
                        fungibleAssetsForBundleOrder[0],
                        heterogenousSemiFungibleAssetsForBundleOrder[0],
                    ];
                    return [4 /*yield*/, client._makeBundleSellOrder({
                            bundleName: "Test Bundle",
                            bundleDescription: "This is a test with different schemas of assets",
                            assets: assets,
                            quantities: assets.map(function (a) { return a.quantity; }),
                            accountAddress: accountAddress,
                            startAmount: amountInEth,
                            expirationTime: 0,
                            extraBountyBasisPoints: 0,
                            waitForHighestBid: false,
                            buyerAddress: NULL_ADDRESS,
                            paymentTokenAddress: NULL_ADDRESS,
                        })];
                case 1:
                    order = _a.sent();
                    assert.equal(order.paymentToken, NULL_ADDRESS);
                    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
                    testFeesMakerOrder(order, undefined);
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
    test("Matches bundle buy order for misordered assets with different schemas", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInEth, assets, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS_2;
                    takerAddress = ALEX_ADDRESS;
                    amountInEth = 0.01;
                    assets = [
                        assetsForBundleOrder[0],
                        fungibleAssetsForBundleOrder[0],
                        heterogenousSemiFungibleAssetsForBundleOrder[0],
                    ];
                    return [4 /*yield*/, client._makeBundleBuyOrder({
                            assets: assets,
                            quantities: assets.map(function (a) { return a.quantity; }),
                            accountAddress: accountAddress,
                            startAmount: amountInEth,
                            expirationTime: 0,
                            extraBountyBasisPoints: 0,
                            paymentTokenAddress: WETH_ADDRESS,
                        })];
                case 1:
                    order = _a.sent();
                    assert.equal(order.paymentToken, WETH_ADDRESS);
                    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
                    assert.equal(order.extra.toNumber(), 0);
                    assert.equal(order.expirationTime.toNumber(), 0);
                    testFeesMakerOrder(order, undefined);
                    return [4 /*yield*/, client._buyOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })];
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
});
function testBundleMetadata(order, schemaName) {
    assert.containsAllKeys(order.metadata, ["bundle"]);
    if (!("bundle" in order.metadata)) {
        return;
    }
    assert.isNotEmpty(order.metadata.bundle.assets);
    var expectedSchemas = order.metadata.bundle.assets.map(function () { return schemaName; });
    assert.deepEqual(order.metadata.bundle.schemas, expectedSchemas);
}
//# sourceMappingURL=bundles.js.map