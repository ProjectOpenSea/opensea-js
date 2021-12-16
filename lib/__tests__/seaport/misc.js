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
import { CK_ADDRESS, MAINNET_PROVIDER_URL, MAX_UINT_256, } from "../../constants";
import { ERC721 } from "../../contracts";
import { OpenSeaPort } from "../../index";
import { Network } from "../../types";
import { getNonCompliantApprovalAddress, isContractAddress, } from "../../utils/utils";
import { ALEX_ADDRESS, ALEX_ADDRESS_2, CK_TOKEN_ID, DAN_ADDRESS, DAN_DAPPER_ADDRESS, MAINNET_API_KEY, WETH_ADDRESS, } from "../constants";
var provider = new Web3.providers.HttpProvider(MAINNET_PROVIDER_URL);
var client = new OpenSeaPort(provider, {
    networkName: Network.Main,
    apiKey: MAINNET_API_KEY,
}, function (line) { return console.info("MAINNET: ".concat(line)); });
suite("seaport: misc", function () {
    test("Instance has public methods", function () {
        assert.equal(typeof client.getCurrentPrice, "function");
        assert.equal(typeof client.wrapEth, "function");
    });
    test("Instance exposes API methods", function () {
        assert.equal(typeof client.api.getOrder, "function");
        assert.equal(typeof client.api.getOrders, "function");
        assert.equal(typeof client.api.postOrder, "function");
    });
    test("Instance exposes some underscored methods", function () {
        assert.equal(typeof client._initializeProxy, "function");
        assert.equal(typeof client._getProxy, "function");
    });
    test("Fetches proxy for an account", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, proxy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    return [4 /*yield*/, client._getProxy(accountAddress)];
                case 1:
                    proxy = _a.sent();
                    assert.isNotNull(proxy);
                    return [2 /*return*/];
            }
        });
    }); });
    test("Fetches positive token balance for an account", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, balance;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    return [4 /*yield*/, client.getTokenBalance({
                            accountAddress: accountAddress,
                            tokenAddress: WETH_ADDRESS,
                        })];
                case 1:
                    balance = _a.sent();
                    assert.isAbove(balance.toNumber(), 0);
                    return [2 /*return*/];
            }
        });
    }); });
    test("Accounts have maximum token balance approved", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, approved;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS;
                    return [4 /*yield*/, client._getApprovedTokenCount({ accountAddress: accountAddress })];
                case 1:
                    approved = _a.sent();
                    assert.equal(approved.toString(), MAX_UINT_256.toString());
                    return [2 /*return*/];
            }
        });
    }); });
    test("Single-approval tokens are approved for tester address", function () { return __awaiter(void 0, void 0, void 0, function () {
        var accountAddress, _proxyAddress, tokenId, tokenAddress, erc721, _approvedAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountAddress = ALEX_ADDRESS_2;
                    return [4 /*yield*/, client._getProxy(accountAddress)];
                case 1:
                    _proxyAddress = _a.sent();
                    tokenId = CK_TOKEN_ID.toString();
                    tokenAddress = CK_ADDRESS;
                    return [4 /*yield*/, client.web3.eth
                            .contract(ERC721)
                            .at(tokenAddress)];
                case 2:
                    erc721 = _a.sent();
                    return [4 /*yield*/, getNonCompliantApprovalAddress(erc721, tokenId, accountAddress)];
                case 3:
                    _approvedAddress = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test("Checks whether an address is a contract addrress", function () { return __awaiter(void 0, void 0, void 0, function () {
        var smartContractWalletAddress, acccountOneIsContractAddress, nonSmartContractWalletAddress, acccountTwoIsContractAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    smartContractWalletAddress = DAN_DAPPER_ADDRESS;
                    return [4 /*yield*/, isContractAddress(client.web3, smartContractWalletAddress)];
                case 1:
                    acccountOneIsContractAddress = _a.sent();
                    nonSmartContractWalletAddress = DAN_ADDRESS;
                    return [4 /*yield*/, isContractAddress(client.web3, nonSmartContractWalletAddress)];
                case 2:
                    acccountTwoIsContractAddress = _a.sent();
                    assert.equal(acccountOneIsContractAddress, true);
                    assert.equal(acccountTwoIsContractAddress, false);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=misc.js.map