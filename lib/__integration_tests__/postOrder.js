"use strict";
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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var ethers_1 = require("ethers");
var mocha_1 = require("mocha");
var web3_1 = __importDefault(require("web3"));
var constants_1 = require("../__tests__/constants");
var index_1 = require("../index");
var types_1 = require("../types");
var webProvider = new web3_1.default.providers.HttpProvider("https://eth-mainnet.g.alchemy.com/v2/".concat(constants_1.ALCHEMY_API_KEY));
var rpcProvider = new ethers_1.ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/".concat(constants_1.ALCHEMY_API_KEY));
var wallet = new ethers_1.ethers.Wallet(constants_1.WALLET_PRIV_KEY ? constants_1.WALLET_PRIV_KEY : "", rpcProvider);
var sdk = new index_1.OpenSeaSDK(webProvider, {
    networkName: types_1.Network.Main,
    apiKey: constants_1.MAINNET_API_KEY,
}, function (line) { return console.info("MAINNET: ".concat(line)); }, wallet);
(0, mocha_1.suite)("SDK: order posting", function () {
    (0, mocha_1.test)("Post collection offer", function () { return __awaiter(void 0, void 0, void 0, function () {
        var collection, postOrderRequest;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sdk.api.getCollection("cool-cats-nft")];
                case 1:
                    collection = _a.sent();
                    postOrderRequest = {
                        collectionSlug: collection.slug,
                        accountAddress: constants_1.WALLET_ADDRESS ? constants_1.WALLET_ADDRESS : "",
                        amount: "0.004",
                        quantity: 1,
                        paymentTokenAddress: constants_1.WETH_ADDRESS,
                    };
                    return [4 /*yield*/, sdk.createCollectionOffer(postOrderRequest)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=postOrder.js.map