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
import { before, suite, test } from "mocha";
import * as Web3 from "web3";
import { ENJIN_ADDRESS, ENJIN_LEGACY_ADDRESS, MAINNET_PROVIDER_URL, MAX_UINT_256, RINKEBY_PROVIDER_URL, } from "../../constants";
import { OpenSeaPort } from "../../index";
import { Network, WyvernSchemaName, } from "../../types";
import { ALEX_ADDRESS, DIGITAL_ART_CHAIN_ADDRESS, DIGITAL_ART_CHAIN_TOKEN_ID, MYTHEREUM_TOKEN_ID, MYTHEREUM_ADDRESS, GODS_UNCHAINED_ADDRESS, CK_ADDRESS, DEVIN_ADDRESS, ALEX_ADDRESS_2, GODS_UNCHAINED_TOKEN_ID, CK_TOKEN_ID, MAINNET_API_KEY, RINKEBY_API_KEY, CK_RINKEBY_ADDRESS, CK_RINKEBY_TOKEN_ID, CATS_IN_MECHS_ID, RANDOM_ADDRESS, DISSOLUTION_TOKEN_ID, SANDBOX_RINKEBY_ID, SANDBOX_RINKEBY_ADDRESS, AGE_OF_RUST_TOKEN_ID, WETH_ADDRESS, } from "../constants";
var provider = new Web3.providers.HttpProvider(MAINNET_PROVIDER_URL);
var rinkebyProvider = new Web3.providers.HttpProvider(RINKEBY_PROVIDER_URL);
var client = new OpenSeaPort(provider, {
    networkName: Network.Main,
    apiKey: MAINNET_API_KEY,
}, function (line) { return console.info("MAINNET: ".concat(line)); });
var rinkebyClient = new OpenSeaPort(rinkebyProvider, {
    networkName: Network.Rinkeby,
    apiKey: RINKEBY_API_KEY,
}, function (line) { return console.info("RINKEBY: ".concat(line)); });
var manaAddress;
suite("seaport: owners and transfers", function () {
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
    test("On-chain ownership throws for invalid assets", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, schemaName, wyAssetRinkeby, _isOwner, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    schemaName = WyvernSchemaName.ERC721;
                    wyAssetRinkeby = {
                        id: CK_RINKEBY_TOKEN_ID.toString(),
                        address: CK_RINKEBY_ADDRESS,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client._ownsAssetOnChain({
                            accountAddress: accountAddress,
                            wyAsset: wyAssetRinkeby,
                            schemaName: schemaName,
                        })];
                case 2:
                    _isOwner = _a.sent();
                    assert.fail();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    assert.include(error_1.message, "Unable to get current owner");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    test("On-chain ownership correctly pulled for ERC721s", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, schemaName, wyAsset, isOwner, isOwner2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    schemaName = WyvernSchemaName.ERC721;
                    wyAsset = {
                        id: MYTHEREUM_TOKEN_ID.toString(),
                        address: MYTHEREUM_ADDRESS,
                    };
                    return [4 /*yield*/, client._ownsAssetOnChain({
                            accountAddress: accountAddress,
                            wyAsset: wyAsset,
                            schemaName: schemaName,
                        })];
                case 1:
                    isOwner = _a.sent();
                    assert.isTrue(isOwner);
                    return [4 /*yield*/, client._ownsAssetOnChain({
                            accountAddress: ALEX_ADDRESS_2,
                            wyAsset: wyAsset,
                            schemaName: schemaName,
                        })];
                case 2:
                    isOwner2 = _a.sent();
                    assert.isFalse(isOwner2);
                    return [2 /*return*/];
            }
        });
    }); });
    test("On-chain ownership correctly pulled for ERC20s", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, schemaName, wyAsset, isOwner, isOwner2, isOwner3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    schemaName = WyvernSchemaName.ERC20;
                    wyAsset = {
                        address: manaAddress,
                        quantity: "1",
                    };
                    return [4 /*yield*/, client._ownsAssetOnChain({
                            accountAddress: accountAddress,
                            wyAsset: wyAsset,
                            schemaName: schemaName,
                        })];
                case 1:
                    isOwner = _a.sent();
                    assert.isTrue(isOwner);
                    return [4 /*yield*/, client._ownsAssetOnChain({
                            accountAddress: accountAddress,
                            wyAsset: __assign(__assign({}, wyAsset), { quantity: MAX_UINT_256.toString() }),
                            schemaName: schemaName,
                        })];
                case 2:
                    isOwner2 = _a.sent();
                    assert.isFalse(isOwner2);
                    return [4 /*yield*/, client._ownsAssetOnChain({
                            accountAddress: RANDOM_ADDRESS,
                            wyAsset: wyAsset,
                            schemaName: schemaName,
                        })];
                case 3:
                    isOwner3 = _a.sent();
                    assert.isFalse(isOwner3);
                    return [2 /*return*/];
            }
        });
    }); });
    test("On-chain ownership correctly pulled for ERC1155s", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, schemaName, wyAssetNFT, isOwner, isOwner2, wyAssetFT, isOwner3, isOwner5, isOwner4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    schemaName = WyvernSchemaName.ERC1155;
                    wyAssetNFT = {
                        id: AGE_OF_RUST_TOKEN_ID,
                        address: ENJIN_ADDRESS,
                    };
                    return [4 /*yield*/, client._ownsAssetOnChain({
                            accountAddress: accountAddress,
                            wyAsset: wyAssetNFT,
                            schemaName: schemaName,
                        })];
                case 1:
                    isOwner = _a.sent();
                    assert.isTrue(isOwner);
                    return [4 /*yield*/, client._ownsAssetOnChain({
                            accountAddress: RANDOM_ADDRESS,
                            wyAsset: wyAssetNFT,
                            schemaName: schemaName,
                        })];
                case 2:
                    isOwner2 = _a.sent();
                    assert.isFalse(isOwner2);
                    wyAssetFT = {
                        id: DISSOLUTION_TOKEN_ID,
                        address: ENJIN_ADDRESS,
                        quantity: "1",
                    };
                    return [4 /*yield*/, client._ownsAssetOnChain({
                            accountAddress: accountAddress,
                            wyAsset: wyAssetFT,
                            schemaName: schemaName,
                        })];
                case 3:
                    isOwner3 = _a.sent();
                    assert.isTrue(isOwner3);
                    return [4 /*yield*/, client._ownsAssetOnChain({
                            accountAddress: accountAddress,
                            wyAsset: __assign(__assign({}, wyAssetFT), { quantity: MAX_UINT_256.toString() }),
                            schemaName: schemaName,
                        })];
                case 4:
                    isOwner5 = _a.sent();
                    assert.isFalse(isOwner5);
                    return [4 /*yield*/, client._ownsAssetOnChain({
                            accountAddress: RANDOM_ADDRESS,
                            wyAsset: wyAssetFT,
                            schemaName: schemaName,
                        })];
                case 5:
                    isOwner4 = _a.sent();
                    assert.isFalse(isOwner4);
                    return [2 /*return*/];
            }
        });
    }); });
    test("ERC-721v2 asset locked in contract is not transferrable", function () { return __awaiter(void 0, void 0, void 0, function () {
        var isTransferrable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.isAssetTransferrable({
                        asset: {
                            tokenId: GODS_UNCHAINED_TOKEN_ID.toString(),
                            tokenAddress: GODS_UNCHAINED_ADDRESS,
                        },
                        fromAddress: ALEX_ADDRESS,
                        toAddress: ALEX_ADDRESS_2,
                    })];
                case 1:
                    isTransferrable = _a.sent();
                    assert.isNotTrue(isTransferrable);
                    return [2 /*return*/];
            }
        });
    }); });
    test("ERC-721v3 asset locked in contract is not transferrable", function () { return __awaiter(void 0, void 0, void 0, function () {
        var isTransferrable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.isAssetTransferrable({
                        asset: {
                            tokenId: GODS_UNCHAINED_TOKEN_ID.toString(),
                            tokenAddress: GODS_UNCHAINED_ADDRESS,
                            schemaName: WyvernSchemaName.ERC721v3,
                        },
                        fromAddress: ALEX_ADDRESS,
                        toAddress: ALEX_ADDRESS_2,
                    })];
                case 1:
                    isTransferrable = _a.sent();
                    assert.isNotTrue(isTransferrable);
                    return [2 /*return*/];
            }
        });
    }); });
    test("ERC-721 v3 asset not owned by fromAddress is not transferrable", function () { return __awaiter(void 0, void 0, void 0, function () {
        var isTransferrable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.isAssetTransferrable({
                        asset: {
                            tokenId: "1",
                            tokenAddress: DIGITAL_ART_CHAIN_ADDRESS,
                            schemaName: WyvernSchemaName.ERC721v3,
                        },
                        fromAddress: ALEX_ADDRESS,
                        toAddress: ALEX_ADDRESS_2,
                    })];
                case 1:
                    isTransferrable = _a.sent();
                    assert.isNotTrue(isTransferrable);
                    return [2 /*return*/];
            }
        });
    }); });
    test("ERC-721 v3 asset owned by fromAddress is transferrable", function () { return __awaiter(void 0, void 0, void 0, function () {
        var isTransferrable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.isAssetTransferrable({
                        asset: {
                            tokenId: DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
                            tokenAddress: DIGITAL_ART_CHAIN_ADDRESS,
                            schemaName: WyvernSchemaName.ERC721v3,
                        },
                        fromAddress: ALEX_ADDRESS,
                        toAddress: ALEX_ADDRESS_2,
                    })];
                case 1:
                    isTransferrable = _a.sent();
                    assert.isTrue(isTransferrable);
                    return [2 /*return*/];
            }
        });
    }); });
    test("ERC-721 v2 asset owned by fromAddress is transferrable", function () { return __awaiter(void 0, void 0, void 0, function () {
        var isTransferrable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.isAssetTransferrable({
                        asset: {
                            tokenId: DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
                            tokenAddress: DIGITAL_ART_CHAIN_ADDRESS,
                        },
                        fromAddress: ALEX_ADDRESS,
                        toAddress: ALEX_ADDRESS_2,
                    })];
                case 1:
                    isTransferrable = _a.sent();
                    assert.isTrue(isTransferrable);
                    return [2 /*return*/];
            }
        });
    }); });
    test("ERC-721 v1 asset owned by fromAddress is transferrable", function () { return __awaiter(void 0, void 0, void 0, function () {
        var isTransferrable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.isAssetTransferrable({
                        asset: {
                            tokenId: CK_TOKEN_ID.toString(),
                            tokenAddress: CK_ADDRESS,
                        },
                        fromAddress: ALEX_ADDRESS_2,
                        toAddress: ALEX_ADDRESS,
                        useProxy: true,
                    })];
                case 1:
                    isTransferrable = _a.sent();
                    assert.isTrue(isTransferrable);
                    return [2 /*return*/];
            }
        });
    }); });
    test("ERC-20 asset not owned by fromAddress is not transferrable", function () { return __awaiter(void 0, void 0, void 0, function () {
        var isTransferrable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.isAssetTransferrable({
                        asset: {
                            tokenId: null,
                            tokenAddress: WETH_ADDRESS,
                            schemaName: WyvernSchemaName.ERC20,
                        },
                        fromAddress: RANDOM_ADDRESS,
                        toAddress: ALEX_ADDRESS_2,
                    })];
                case 1:
                    isTransferrable = _a.sent();
                    assert.isNotTrue(isTransferrable);
                    return [2 /*return*/];
            }
        });
    }); });
    test("ERC-20 asset owned by fromAddress is transferrable", function () { return __awaiter(void 0, void 0, void 0, function () {
        var isTransferrable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.isAssetTransferrable({
                        asset: {
                            tokenId: null,
                            tokenAddress: WETH_ADDRESS,
                            schemaName: WyvernSchemaName.ERC20,
                        },
                        quantity: Math.pow(10, 18) * 0.001,
                        fromAddress: ALEX_ADDRESS,
                        toAddress: ALEX_ADDRESS_2,
                    })];
                case 1:
                    isTransferrable = _a.sent();
                    assert.isTrue(isTransferrable);
                    return [2 /*return*/];
            }
        });
    }); });
    test("ERC-1155 asset locked in contract is not transferrable", function () { return __awaiter(void 0, void 0, void 0, function () {
        var isTransferrable2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.isAssetTransferrable({
                        asset: {
                            tokenId: ENJIN_LEGACY_ADDRESS.toString(),
                            tokenAddress: CATS_IN_MECHS_ID,
                            schemaName: WyvernSchemaName.ERC1155,
                        },
                        fromAddress: ALEX_ADDRESS,
                        toAddress: ALEX_ADDRESS_2,
                    })];
                case 1:
                    isTransferrable2 = _a.sent();
                    assert.isNotTrue(isTransferrable2);
                    return [2 /*return*/];
            }
        });
    }); });
    test("ERC-1155 asset not owned by fromAddress is not transferrable", function () { return __awaiter(void 0, void 0, void 0, function () {
        var isTransferrable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.isAssetTransferrable({
                        asset: {
                            tokenId: CATS_IN_MECHS_ID,
                            tokenAddress: ENJIN_ADDRESS,
                            schemaName: WyvernSchemaName.ERC1155,
                        },
                        fromAddress: DEVIN_ADDRESS,
                        toAddress: ALEX_ADDRESS_2,
                    })];
                case 1:
                    isTransferrable = _a.sent();
                    assert.isNotTrue(isTransferrable);
                    return [2 /*return*/];
            }
        });
    }); });
    test("Rinkeby ERC-1155 asset owned by fromAddress is transferrable", function () { return __awaiter(void 0, void 0, void 0, function () {
        var isTransferrable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, rinkebyClient.isAssetTransferrable({
                        asset: {
                            tokenAddress: SANDBOX_RINKEBY_ADDRESS,
                            tokenId: SANDBOX_RINKEBY_ID,
                            schemaName: WyvernSchemaName.ERC1155,
                        },
                        fromAddress: "0x61c461ecc993aadeb7e4b47e96d1b8cc37314b20",
                        toAddress: ALEX_ADDRESS,
                    })];
                case 1:
                    isTransferrable = _a.sent();
                    assert.isTrue(isTransferrable);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=ownersAndTransfers.js.map