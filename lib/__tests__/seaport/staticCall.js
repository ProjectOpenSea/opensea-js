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
import { MAINNET_PROVIDER_URL, NULL_ADDRESS, RINKEBY_PROVIDER_URL, STATIC_CALL_TX_ORIGIN_ADDRESS, } from "../../constants";
import { getMethod, StaticCheckTxOrigin } from "../../contracts";
import { OpenSeaPort } from "../../index";
import { Network } from "../../types";
import { encodeCall } from "../../utils/schema";
import { ALEX_ADDRESS, MYTHEREUM_TOKEN_ID, MYTHEREUM_ADDRESS, ALEX_ADDRESS_2, MAINNET_API_KEY, RINKEBY_API_KEY, } from "../constants";
import { testFeesMakerOrder } from "./fees";
import { testMatchingNewOrder } from "./orders";
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
suite("seaport: static calls", function () {
    test("Mainnet staticCall tx.origin can be applied to arbitrary order", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInToken, tokenId, tokenAddress, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    takerAddress = ALEX_ADDRESS_2;
                    amountInToken = 2;
                    tokenId = MYTHEREUM_TOKEN_ID.toString();
                    tokenAddress = MYTHEREUM_ADDRESS;
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            accountAddress: accountAddress,
                            startAmount: amountInToken,
                            extraBountyBasisPoints: 0,
                            buyerAddress: NULL_ADDRESS,
                            expirationTime: 0,
                            quantity: 1,
                            paymentTokenAddress: NULL_ADDRESS,
                            waitForHighestBid: false,
                        })];
                case 1:
                    order = _a.sent();
                    order.staticTarget = STATIC_CALL_TX_ORIGIN_ADDRESS;
                    order.staticExtradata = encodeCall(getMethod(StaticCheckTxOrigin, "succeedIfTxOriginMatchesSpecifiedAddress"), [takerAddress]);
                    assert.equal(order.paymentToken, NULL_ADDRESS);
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
    test.skip("Mainnet StaticCall Decentraland", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInToken, tokenId, tokenAddress, asset, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = "0xf293dfe0ac79c2536b9426957ac8898d6c743717";
                    takerAddress = ALEX_ADDRESS_2;
                    amountInToken = 2;
                    tokenId = "2898";
                    tokenAddress = "0x959e104e1a4db6317fa58f8295f586e1a978c297";
                    return [4 /*yield*/, client.api.getAsset({ tokenAddress: tokenAddress, tokenId: tokenId })];
                case 1:
                    asset = _a.sent();
                    return [4 /*yield*/, client._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            accountAddress: accountAddress,
                            startAmount: amountInToken,
                            extraBountyBasisPoints: 0,
                            buyerAddress: NULL_ADDRESS,
                            expirationTime: 0,
                            quantity: 1,
                            paymentTokenAddress: NULL_ADDRESS,
                            waitForHighestBid: false,
                        })];
                case 2:
                    order = _a.sent();
                    assert.equal(order.paymentToken, NULL_ADDRESS);
                    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken);
                    assert.equal(order.extra.toNumber(), 0);
                    assert.equal(order.expirationTime.toNumber(), 0);
                    testFeesMakerOrder(order, asset.collection, 0);
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
    test.skip("Testnet StaticCall CheezeWizards", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, takerAddress, amountInToken, tokenId, tokenAddress, asset, order;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    takerAddress = ALEX_ADDRESS_2;
                    amountInToken = 2;
                    tokenId = "3";
                    tokenAddress = "0x095731b672b76b00A0b5cb9D8258CD3F6E976cB2";
                    return [4 /*yield*/, rinkebyClient.api.getAsset({ tokenAddress: tokenAddress, tokenId: tokenId })];
                case 1:
                    asset = _a.sent();
                    return [4 /*yield*/, rinkebyClient._makeSellOrder({
                            asset: { tokenAddress: tokenAddress, tokenId: tokenId },
                            accountAddress: accountAddress,
                            startAmount: amountInToken,
                            extraBountyBasisPoints: 0,
                            buyerAddress: NULL_ADDRESS,
                            expirationTime: 0,
                            quantity: 1,
                            paymentTokenAddress: NULL_ADDRESS,
                            waitForHighestBid: false,
                        })];
                case 2:
                    order = _a.sent();
                    assert.equal(order.paymentToken, NULL_ADDRESS);
                    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken);
                    assert.equal(order.extra.toNumber(), 0);
                    assert.equal(order.expirationTime.toNumber(), 0);
                    testFeesMakerOrder(order, asset.collection, 0);
                    return [4 /*yield*/, rinkebyClient._sellOrderValidationAndApprovals({
                            order: order,
                            accountAddress: accountAddress,
                        })];
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
});
//# sourceMappingURL=staticCall.js.map