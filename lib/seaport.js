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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSeaPort = void 0;
var bignumber_js_1 = require("bignumber.js");
var ethereumjs_util_1 = require("ethereumjs-util");
var fbemitter_1 = require("fbemitter");
var _ = __importStar(require("lodash"));
var web3_1 = __importDefault(require("web3"));
var wyvern_js_1 = require("wyvern-js");
var WyvernSchemas = __importStar(require("wyvern-schemas"));
var api_1 = require("./api");
var constants_1 = require("./constants");
var contracts_1 = require("./contracts");
var debugging_1 = require("./debugging");
var types_1 = require("./types");
var schema_1 = require("./utils/schema");
var utils_1 = require("./utils/utils");
var OpenSeaPort = /** @class */ (function () {
    /**
     * Your very own seaport.
     * Create a new instance of OpenSeaJS.
     * @param provider Web3 Provider to use for transactions. For example:
     *  `const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')`
     * @param apiConfig configuration options, including `networkName`
     * @param logger logger, optional, a function that will be called with debugging
     *  information
     */
    function OpenSeaPort(provider, apiConfig, logger) {
        if (apiConfig === void 0) { apiConfig = {}; }
        var _b;
        // Extra gwei to add to the mean gas price when making transactions
        this.gasPriceAddition = new bignumber_js_1.BigNumber(3);
        // Multiply gas estimate by this factor when making transactions
        this.gasIncreaseFactor = constants_1.DEFAULT_GAS_INCREASE_FACTOR;
        // API config
        apiConfig.networkName = apiConfig.networkName || types_1.Network.Main;
        this.api = new api_1.OpenSeaAPI(apiConfig);
        this._wyvernConfigOverride = apiConfig.wyvernConfig;
        this._networkName = apiConfig.networkName;
        var readonlyProvider = new web3_1.default.providers.HttpProvider("".concat(this.api.apiBaseUrl, "/").concat(constants_1.RPC_URL_PATH));
        var useReadOnlyProvider = (_b = apiConfig.useReadOnlyProvider) !== null && _b !== void 0 ? _b : true;
        // Web3 Config
        this.web3 = new web3_1.default(provider);
        this.web3ReadOnly = useReadOnlyProvider
            ? new web3_1.default(readonlyProvider)
            : this.web3;
        // WyvernJS config
        this._wyvernProtocol = new wyvern_js_1.WyvernProtocol(provider, __assign({ network: this._networkName }, apiConfig.wyvernConfig));
        // WyvernJS config for readonly (optimization for infura calls)
        this._wyvernProtocolReadOnly = useReadOnlyProvider
            ? new wyvern_js_1.WyvernProtocol(readonlyProvider, __assign({ network: this._networkName }, apiConfig.wyvernConfig))
            : this._wyvernProtocol;
        // WrappedNFTLiquidationProxy Config
        this._wrappedNFTFactoryAddress =
            this._networkName == types_1.Network.Main
                ? constants_1.WRAPPED_NFT_FACTORY_ADDRESS_MAINNET
                : constants_1.WRAPPED_NFT_FACTORY_ADDRESS_RINKEBY;
        this._wrappedNFTLiquidationProxyAddress =
            this._networkName == types_1.Network.Main
                ? constants_1.WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_MAINNET
                : constants_1.WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_RINKEBY;
        this._uniswapFactoryAddress =
            this._networkName == types_1.Network.Main
                ? constants_1.UNISWAP_FACTORY_ADDRESS_MAINNET
                : constants_1.UNISWAP_FACTORY_ADDRESS_RINKEBY;
        // Emit events
        this._emitter = new fbemitter_1.EventEmitter();
        // Debugging: default to nothing
        this.logger = logger || (function (arg) { return arg; });
    }
    /**
     * Add a listener to a marketplace event
     * @param event An event to listen for
     * @param listener A callback that will accept an object with event data
     * @param once Whether the listener should only be called once
     */
    OpenSeaPort.prototype.addListener = function (event, listener, once) {
        if (once === void 0) { once = false; }
        var subscription = once
            ? this._emitter.once(event, listener)
            : this._emitter.addListener(event, listener);
        return subscription;
    };
    /**
     * Remove an event listener, included here for completeness.
     * Simply calls `.remove()` on a subscription
     * @param subscription The event subscription returned from `addListener`
     */
    OpenSeaPort.prototype.removeListener = function (subscription) {
        subscription.remove();
    };
    /**
     * Remove all event listeners. Good idea to call this when you're unmounting
     * a component that listens to events to make UI updates
     * @param event Optional EventType to remove listeners for
     */
    OpenSeaPort.prototype.removeAllListeners = function (event) {
        this._emitter.removeAllListeners(event);
    };
    /**
     * Wraps an arbitrary group of NFTs into their corresponding WrappedNFT ERC20 tokens.
     * Emits the `WrapAssets` event when the transaction is prompted.
     * @param param0 __namedParameters Object
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to bundle together.
     * @param accountAddress Address of the user's wallet
     */
    OpenSeaPort.prototype.wrapAssets = function (_b) {
        var assets = _b.assets, accountAddress = _b.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAssets, tokenIds, tokenAddresses, isMixedBatchOfAssets, txHash;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        schema = this._getSchema(types_1.WyvernSchemaName.ERC721);
                        wyAssets = assets.map(function (a) { return (0, utils_1.getWyvernAsset)(schema, a); });
                        tokenIds = wyAssets.map(function (a) { return a.id; });
                        tokenAddresses = wyAssets.map(function (a) { return a.address; });
                        isMixedBatchOfAssets = !tokenAddresses.every(function (val, _i, arr) { return val === arr[0]; });
                        this._dispatch(types_1.EventType.WrapAssets, { assets: wyAssets, accountAddress: accountAddress });
                        return [4 /*yield*/, (0, utils_1.sendRawTransaction)(this.web3, {
                                from: accountAddress,
                                to: this._wrappedNFTLiquidationProxyAddress,
                                value: 0,
                                data: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.WrappedNFTLiquidationProxy, "wrapNFTs"), [
                                    tokenIds,
                                    tokenAddresses,
                                    isMixedBatchOfAssets,
                                ]),
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 1:
                        txHash = _c.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.WrapAssets, "Wrapping Assets")];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Unwraps an arbitrary group of NFTs from their corresponding WrappedNFT ERC20 tokens back into ERC721 tokens.
     * Emits the `UnwrapAssets` event when the transaction is prompted.
     * @param param0 __namedParameters Object
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to bundle together.
     * @param destinationAddresses Addresses that each resulting ERC721 token will be sent to. Must be the same length as `tokenIds`. Each address corresponds with its respective token ID in the `tokenIds` array.
     * @param accountAddress Address of the user's wallet
     */
    OpenSeaPort.prototype.unwrapAssets = function (_b) {
        var assets = _b.assets, destinationAddresses = _b.destinationAddresses, accountAddress = _b.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAssets, tokenIds, tokenAddresses, isMixedBatchOfAssets, txHash;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!assets ||
                            !destinationAddresses ||
                            assets.length != destinationAddresses.length) {
                            throw new Error("The 'assets' and 'destinationAddresses' arrays must exist and have the same length.");
                        }
                        schema = this._getSchema(types_1.WyvernSchemaName.ERC721);
                        wyAssets = assets.map(function (a) { return (0, utils_1.getWyvernAsset)(schema, a); });
                        tokenIds = wyAssets.map(function (a) { return a.id; });
                        tokenAddresses = wyAssets.map(function (a) { return a.address; });
                        isMixedBatchOfAssets = !tokenAddresses.every(function (val, _i, arr) { return val === arr[0]; });
                        this._dispatch(types_1.EventType.UnwrapAssets, {
                            assets: wyAssets,
                            accountAddress: accountAddress,
                        });
                        return [4 /*yield*/, (0, utils_1.sendRawTransaction)(this.web3, {
                                from: accountAddress,
                                to: this._wrappedNFTLiquidationProxyAddress,
                                value: 0,
                                data: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.WrappedNFTLiquidationProxy, "unwrapNFTs"), [
                                    tokenIds,
                                    tokenAddresses,
                                    destinationAddresses,
                                    isMixedBatchOfAssets,
                                ]),
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 1:
                        txHash = _c.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.UnwrapAssets, "Unwrapping Assets")];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Liquidates an arbitrary group of NFTs by atomically wrapping them into their
     * corresponding WrappedNFT ERC20 tokens, and then immediately selling those
     * ERC20 tokens on their corresponding Uniswap exchange.
     * Emits the `LiquidateAssets` event when the transaction is prompted.
     * @param param0 __namedParameters Object
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to bundle together.
     * @param accountAddress Address of the user's wallet
     * @param uniswapSlippageAllowedInBasisPoints The amount of slippage that a user will tolerate in their Uniswap trade; if Uniswap cannot fulfill the order without more slippage, the whole function will revert.
     */
    OpenSeaPort.prototype.liquidateAssets = function (_b) {
        var assets = _b.assets, accountAddress = _b.accountAddress, uniswapSlippageAllowedInBasisPoints = _b.uniswapSlippageAllowedInBasisPoints;
        return __awaiter(this, void 0, void 0, function () {
            var uniswapSlippage, schema, wyAssets, tokenIds, tokenAddresses, isMixedBatchOfAssets, txHash;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        uniswapSlippage = uniswapSlippageAllowedInBasisPoints === 0
                            ? constants_1.DEFAULT_WRAPPED_NFT_LIQUIDATION_UNISWAP_SLIPPAGE_IN_BASIS_POINTS
                            : uniswapSlippageAllowedInBasisPoints;
                        schema = this._getSchema(types_1.WyvernSchemaName.ERC721);
                        wyAssets = assets.map(function (a) { return (0, utils_1.getWyvernAsset)(schema, a); });
                        tokenIds = wyAssets.map(function (a) { return a.id; });
                        tokenAddresses = wyAssets.map(function (a) { return a.address; });
                        isMixedBatchOfAssets = !tokenAddresses.every(function (val, _i, arr) { return val === arr[0]; });
                        this._dispatch(types_1.EventType.LiquidateAssets, {
                            assets: wyAssets,
                            accountAddress: accountAddress,
                        });
                        return [4 /*yield*/, (0, utils_1.sendRawTransaction)(this.web3, {
                                from: accountAddress,
                                to: this._wrappedNFTLiquidationProxyAddress,
                                value: 0,
                                data: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.WrappedNFTLiquidationProxy, "liquidateNFTs"), [tokenIds, tokenAddresses, isMixedBatchOfAssets, uniswapSlippage]),
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 1:
                        txHash = _c.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.LiquidateAssets, "Liquidating Assets")];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Purchases a bundle of WrappedNFT tokens from Uniswap and then unwraps them into ERC721 tokens.
     * Emits the `PurchaseAssets` event when the transaction is prompted.
     * @param param0 __namedParameters Object
     * @param numTokensToBuy The number of WrappedNFT tokens to purchase and unwrap
     * @param amount The estimated cost in wei for tokens (probably some ratio above the minimum amount to avoid the transaction failing due to frontrunning, minimum amount is found by calling UniswapExchange(uniswapAddress).getEthToTokenOutputPrice(numTokensToBuy.mul(10**18));
     * @param contractAddress Address of the corresponding NFT core contract for these NFTs.
     * @param accountAddress Address of the user's wallet
     */
    OpenSeaPort.prototype.purchaseAssets = function (_b) {
        var numTokensToBuy = _b.numTokensToBuy, amount = _b.amount, contractAddress = _b.contractAddress, accountAddress = _b.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var txHash;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this._dispatch(types_1.EventType.PurchaseAssets, {
                            amount: amount,
                            contractAddress: contractAddress,
                            accountAddress: accountAddress,
                        });
                        return [4 /*yield*/, (0, utils_1.sendRawTransaction)(this.web3, {
                                from: accountAddress,
                                to: this._wrappedNFTLiquidationProxyAddress,
                                value: amount,
                                data: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.WrappedNFTLiquidationProxy, "purchaseNFTs"), [numTokensToBuy, contractAddress]),
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 1:
                        txHash = _c.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.PurchaseAssets, "Purchasing Assets")];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets the estimated cost or payout of either buying or selling NFTs to Uniswap using either purchaseAssts() or liquidateAssets()
     * @param param0 __namedParameters Object
     * @param numTokens The number of WrappedNFT tokens to either purchase or sell
     * @param isBuying A bool for whether the user is buying or selling
     * @param contractAddress Address of the corresponding NFT core contract for these NFTs.
     */
    OpenSeaPort.prototype.getQuoteFromUniswap = function (_b) {
        var numTokens = _b.numTokens, isBuying = _b.isBuying, contractAddress = _b.contractAddress;
        return __awaiter(this, void 0, void 0, function () {
            var wrappedNFTFactory, wrappedNFTAddress, wrappedNFT, uniswapFactory, uniswapExchangeAddress, uniswapExchange, amount, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        wrappedNFTFactory = new this.web3.eth.Contract(contracts_1.WrappedNFTFactory, this._wrappedNFTFactoryAddress);
                        return [4 /*yield*/, wrappedNFTFactory.methods
                                .nftContractToWrapperContract(contractAddress)
                                .call()];
                    case 1:
                        wrappedNFTAddress = _e.sent();
                        wrappedNFT = new this.web3.eth.Contract(contracts_1.WrappedNFT, wrappedNFTAddress);
                        uniswapFactory = new this.web3.eth.Contract(contracts_1.UniswapFactory, this._uniswapFactoryAddress);
                        return [4 /*yield*/, uniswapFactory.methods
                                .getExchange(wrappedNFTAddress)
                                .call()];
                    case 2:
                        uniswapExchangeAddress = _e.sent();
                        uniswapExchange = new this.web3.eth.Contract(contracts_1.UniswapExchange, uniswapExchangeAddress);
                        amount = wyvern_js_1.WyvernProtocol.toBaseUnitAmount((0, utils_1.makeBigNumber)(numTokens), Number(wrappedNFT.methods.decimals().call()));
                        if (!isBuying) return [3 /*break*/, 4];
                        _c = parseInt;
                        return [4 /*yield*/, uniswapExchange.methods
                                .getEthToTokenOutputPrice(amount.toString())
                                .call()];
                    case 3: return [2 /*return*/, _c.apply(void 0, [_e.sent()])];
                    case 4:
                        _d = parseInt;
                        return [4 /*yield*/, uniswapExchange.methods
                                .getTokenToEthInputPrice(amount.toString())
                                .call()];
                    case 5: return [2 /*return*/, _d.apply(void 0, [_e.sent()])];
                }
            });
        });
    };
    /**
     * Wrap ETH into W-ETH.
     * W-ETH is needed for placing buy orders (making offers).
     * Emits the `WrapEth` event when the transaction is prompted.
     * @param param0 __namedParameters Object
     * @param amountInEth How much ether to wrap
     * @param accountAddress Address of the user's wallet containing the ether
     */
    OpenSeaPort.prototype.wrapEth = function (_b) {
        var amountInEth = _b.amountInEth, accountAddress = _b.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var token, amount, txHash;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        token = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther;
                        amount = wyvern_js_1.WyvernProtocol.toBaseUnitAmount((0, utils_1.makeBigNumber)(amountInEth), token.decimals);
                        this._dispatch(types_1.EventType.WrapEth, { accountAddress: accountAddress, amount: amount });
                        return [4 /*yield*/, (0, utils_1.sendRawTransaction)(this.web3, {
                                from: accountAddress,
                                to: token.address,
                                value: amount,
                                data: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.CanonicalWETH, "deposit"), []),
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 1:
                        txHash = _c.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.WrapEth, "Wrapping ETH")];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Unwrap W-ETH into ETH.
     * Emits the `UnwrapWeth` event when the transaction is prompted.
     * @param param0 __namedParameters Object
     * @param amountInEth How much W-ETH to unwrap
     * @param accountAddress Address of the user's wallet containing the W-ETH
     */
    OpenSeaPort.prototype.unwrapWeth = function (_b) {
        var amountInEth = _b.amountInEth, accountAddress = _b.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var token, amount, txHash;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        token = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther;
                        amount = wyvern_js_1.WyvernProtocol.toBaseUnitAmount((0, utils_1.makeBigNumber)(amountInEth), token.decimals);
                        this._dispatch(types_1.EventType.UnwrapWeth, { accountAddress: accountAddress, amount: amount });
                        return [4 /*yield*/, (0, utils_1.sendRawTransaction)(this.web3, {
                                from: accountAddress,
                                to: token.address,
                                value: 0,
                                data: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.CanonicalWETH, "withdraw"), [
                                    amount.toString(),
                                ]),
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 1:
                        txHash = _c.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.UnwrapWeth, "Unwrapping W-ETH")];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a buy order to make an offer on a bundle or group of assets.
     * If the user hasn't approved W-ETH access yet, this will emit `ApproveCurrency` before asking for approval.
     * @param param0 __namedParameters Object
     * @param assets Array of Asset objects to bid on
     * @param collection Optional collection for computing fees, required only if all assets belong to the same collection
     * @param quantities The quantity of each asset to sell. Defaults to 1 for each.
     * @param accountAddress Address of the maker's wallet
     * @param startAmount Value of the offer, in units of the payment token (or wrapped ETH if no payment token address specified)
     * @param expirationTime Expiration time for the order, in seconds.
     * @param paymentTokenAddress Optional address for using an ERC-20 token in the order. If unspecified, defaults to W-ETH
     * @param sellOrder Optional sell order (like an English auction) to ensure fee and schema compatibility
     * @param referrerAddress The optional address that referred the order
     */
    OpenSeaPort.prototype.createBundleBuyOrder = function (_b) {
        var assets = _b.assets, collection = _b.collection, quantities = _b.quantities, accountAddress = _b.accountAddress, startAmount = _b.startAmount, _c = _b.expirationTime, expirationTime = _c === void 0 ? (0, utils_1.getMaxOrderExpirationTimestamp)() : _c, paymentTokenAddress = _b.paymentTokenAddress, sellOrder = _b.sellOrder, referrerAddress = _b.referrerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var order, hashedOrder, signature, error_1, orderWithSignature;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        // Default to 1 of each asset
                        quantities = quantities || assets.map(function (_a) { return 1; });
                        paymentTokenAddress =
                            paymentTokenAddress ||
                                WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address;
                        if (!paymentTokenAddress) {
                            throw new Error("Payment token required");
                        }
                        return [4 /*yield*/, this._makeBundleBuyOrder({
                                assets: assets,
                                collection: collection,
                                quantities: quantities,
                                accountAddress: accountAddress,
                                startAmount: startAmount,
                                expirationTime: expirationTime,
                                paymentTokenAddress: paymentTokenAddress,
                                extraBountyBasisPoints: 0,
                                sellOrder: sellOrder,
                                referrerAddress: referrerAddress,
                            })];
                    case 1:
                        order = _d.sent();
                        // NOTE not in Wyvern exchange code:
                        // frontend checks to make sure
                        // token is approved and sufficiently available
                        return [4 /*yield*/, this._buyOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })];
                    case 2:
                        // NOTE not in Wyvern exchange code:
                        // frontend checks to make sure
                        // token is approved and sufficiently available
                        _d.sent();
                        hashedOrder = __assign(__assign({}, order), { hash: (0, utils_1.getOrderHash)(order) });
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.authorizeOrder(hashedOrder)];
                    case 4:
                        signature = _d.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _d.sent();
                        console.error(error_1);
                        throw new Error("You declined to authorize your offer");
                    case 6:
                        orderWithSignature = __assign(__assign({}, hashedOrder), signature);
                        return [2 /*return*/, this.validateAndPostOrder(orderWithSignature)];
                }
            });
        });
    };
    /**
     * Create a buy order to make an offer on an asset.
     * If the user hasn't approved W-ETH access yet, this will emit `ApproveCurrency` before asking for approval.
     * @param param0 __namedParameters Object
     * @param asset The asset to trade
     * @param accountAddress Address of the maker's wallet
     * @param startAmount Value of the offer, in units of the payment token (or wrapped ETH if no payment token address specified)
     * @param quantity The number of assets to bid for (if fungible or semi-fungible). Defaults to 1. In units, not base units, e.g. not wei.
     * @param expirationTime Expiration time for the order, in seconds.
     * @param paymentTokenAddress Optional address for using an ERC-20 token in the order. If unspecified, defaults to W-ETH
     * @param sellOrder Optional sell order (like an English auction) to ensure fee and schema compatibility
     * @param referrerAddress The optional address that referred the order
     */
    OpenSeaPort.prototype.createBuyOrder = function (_b) {
        var asset = _b.asset, accountAddress = _b.accountAddress, startAmount = _b.startAmount, _c = _b.quantity, quantity = _c === void 0 ? 1 : _c, _d = _b.expirationTime, expirationTime = _d === void 0 ? (0, utils_1.getMaxOrderExpirationTimestamp)() : _d, paymentTokenAddress = _b.paymentTokenAddress, sellOrder = _b.sellOrder, referrerAddress = _b.referrerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var order, hashedOrder, signature, error_2, orderWithSignature;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        paymentTokenAddress =
                            paymentTokenAddress ||
                                WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address;
                        if (!paymentTokenAddress) {
                            throw new Error("Payment token required");
                        }
                        return [4 /*yield*/, this._makeBuyOrder({
                                asset: asset,
                                quantity: quantity,
                                accountAddress: accountAddress,
                                startAmount: startAmount,
                                expirationTime: expirationTime,
                                paymentTokenAddress: paymentTokenAddress,
                                extraBountyBasisPoints: 0,
                                sellOrder: sellOrder,
                                referrerAddress: referrerAddress,
                            })];
                    case 1:
                        order = _e.sent();
                        // NOTE not in Wyvern exchange code:
                        // frontend checks to make sure
                        // token is approved and sufficiently available
                        return [4 /*yield*/, this._buyOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })];
                    case 2:
                        // NOTE not in Wyvern exchange code:
                        // frontend checks to make sure
                        // token is approved and sufficiently available
                        _e.sent();
                        hashedOrder = __assign(__assign({}, order), { hash: (0, utils_1.getOrderHash)(order) });
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.authorizeOrder(hashedOrder)];
                    case 4:
                        signature = _e.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _e.sent();
                        console.error(error_2);
                        throw new Error("You declined to authorize your offer");
                    case 6:
                        orderWithSignature = __assign(__assign({}, hashedOrder), signature);
                        return [2 /*return*/, this.validateAndPostOrder(orderWithSignature)];
                }
            });
        });
    };
    /**
     * Create a sell order to auction an asset.
     * Will throw a 'You do not own enough of this asset' error if the maker doesn't have the asset or not enough of it to sell the specific `quantity`.
     * If the user hasn't approved access to the token yet, this will emit `ApproveAllAssets` (or `ApproveAsset` if the contract doesn't support approve-all) before asking for approval.
     * @param param0 __namedParameters Object
     * @param tokenId DEPRECATED: Token ID. Use `asset` instead.
     * @param tokenAddress DEPRECATED: Address of the token's contract. Use `asset` instead.
     * @param asset The asset to trade
     * @param accountAddress Address of the maker's wallet
     * @param startAmount Price of the asset at the start of the auction. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param endAmount Optional price of the asset at the end of its expiration time. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param quantity The number of assets to sell (if fungible or semi-fungible). Defaults to 1. In units, not base units, e.g. not wei.
     * @param listingTime Optional time when the order will become fulfillable, in UTC seconds. Undefined means it will start now.
     * @param expirationTime Expiration time for the order, in UTC seconds.
     * @param waitForHighestBid If set to true, this becomes an English auction that increases in price for every bid. The highest bid wins when the auction expires, as long as it's at least `startAmount`. `expirationTime` must be > 0.
     * @param englishAuctionReservePrice Optional price level, below which orders may be placed but will not be matched.  Orders below the reserve can be manually accepted but will not be automatically matched.
     * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
     * @param extraBountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of this order
     * @param buyerAddress Optional address that's allowed to purchase this item. If specified, no other address will be able to take the order, unless its value is the null address.
     * @param buyerEmail Optional email of the user that's allowed to purchase this item. If specified, a user will have to verify this email before being able to take the order.
     */
    OpenSeaPort.prototype.createSellOrder = function (_b) {
        var asset = _b.asset, accountAddress = _b.accountAddress, startAmount = _b.startAmount, endAmount = _b.endAmount, _c = _b.quantity, quantity = _c === void 0 ? 1 : _c, listingTime = _b.listingTime, _d = _b.expirationTime, expirationTime = _d === void 0 ? (0, utils_1.getMaxOrderExpirationTimestamp)() : _d, _e = _b.waitForHighestBid, waitForHighestBid = _e === void 0 ? false : _e, englishAuctionReservePrice = _b.englishAuctionReservePrice, paymentTokenAddress = _b.paymentTokenAddress, _f = _b.extraBountyBasisPoints, extraBountyBasisPoints = _f === void 0 ? 0 : _f, buyerAddress = _b.buyerAddress, buyerEmail = _b.buyerEmail;
        return __awaiter(this, void 0, void 0, function () {
            var order, hashedOrder, signature, error_3, orderWithSignature;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, this._makeSellOrder({
                            asset: asset,
                            quantity: quantity,
                            accountAddress: accountAddress,
                            startAmount: startAmount,
                            endAmount: endAmount,
                            listingTime: listingTime,
                            expirationTime: expirationTime,
                            waitForHighestBid: waitForHighestBid,
                            englishAuctionReservePrice: englishAuctionReservePrice,
                            paymentTokenAddress: paymentTokenAddress || constants_1.NULL_ADDRESS,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            buyerAddress: buyerAddress || constants_1.NULL_ADDRESS,
                        })];
                    case 1:
                        order = _g.sent();
                        return [4 /*yield*/, this._sellOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })];
                    case 2:
                        _g.sent();
                        if (!buyerEmail) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._createEmailWhitelistEntry({ order: order, buyerEmail: buyerEmail })];
                    case 3:
                        _g.sent();
                        _g.label = 4;
                    case 4:
                        hashedOrder = __assign(__assign({}, order), { hash: (0, utils_1.getOrderHash)(order) });
                        _g.label = 5;
                    case 5:
                        _g.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.authorizeOrder(hashedOrder)];
                    case 6:
                        signature = _g.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_3 = _g.sent();
                        console.error(error_3);
                        throw new Error("You declined to authorize your auction");
                    case 8:
                        orderWithSignature = __assign(__assign({}, hashedOrder), signature);
                        return [2 /*return*/, this.validateAndPostOrder(orderWithSignature)];
                }
            });
        });
    };
    /**
     * Create multiple sell orders in bulk to auction assets out of an asset factory.
     * Will throw a 'You do not own this asset' error if the maker doesn't own the factory.
     * Items will mint to users' wallets only when they buy them. See https://docs.opensea.io/docs/opensea-initial-item-sale-tutorial for more info.
     * If the user hasn't approved access to the token yet, this will emit `ApproveAllAssets` (or `ApproveAsset` if the contract doesn't support approve-all) before asking for approval.
     * @param param0 __namedParameters Object
     * @param assets Which assets you want to post orders for. Use the tokenAddress of your factory contract
     * @param accountAddress Address of the factory owner's wallet
     * @param startAmount Price of the asset at the start of the auction, or minimum acceptable bid if it's an English auction. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param endAmount Optional price of the asset at the end of its expiration time. If not specified, will be set to `startAmount`. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param quantity The number of assets to sell at one time (if fungible or semi-fungible). Defaults to 1. In units, not base units, e.g. not wei.
     * @param listingTime Optional time when the order will become fulfillable, in UTC seconds. Undefined means it will start now.
     * @param expirationTime Expiration time for the order, in seconds.
     * @param waitForHighestBid If set to true, this becomes an English auction that increases in price for every bid. The highest bid wins when the auction expires, as long as it's at least `startAmount`. `expirationTime` must be > 0.
     * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
     * @param extraBountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of each order
     * @param buyerAddress Optional address that's allowed to purchase each item. If specified, no other address will be able to take each order.
     * @param buyerEmail Optional email of the user that's allowed to purchase each item. If specified, a user will have to verify this email before being able to take each order.
     * @param numberOfOrders Number of times to repeat creating the same order for each asset. If greater than 5, creates them in batches of 5. Requires an `apiKey` to be set during seaport initialization in order to not be throttled by the API.
     * @returns The number of orders created in total
     */
    OpenSeaPort.prototype.createFactorySellOrders = function (_b) {
        var assets = _b.assets, accountAddress = _b.accountAddress, startAmount = _b.startAmount, endAmount = _b.endAmount, _c = _b.quantity, quantity = _c === void 0 ? 1 : _c, listingTime = _b.listingTime, _d = _b.expirationTime, expirationTime = _d === void 0 ? (0, utils_1.getMaxOrderExpirationTimestamp)() : _d, _e = _b.waitForHighestBid, waitForHighestBid = _e === void 0 ? false : _e, paymentTokenAddress = _b.paymentTokenAddress, _f = _b.extraBountyBasisPoints, extraBountyBasisPoints = _f === void 0 ? 0 : _f, buyerAddress = _b.buyerAddress, buyerEmail = _b.buyerEmail, _g = _b.numberOfOrders, numberOfOrders = _g === void 0 ? 1 : _g;
        return __awaiter(this, void 0, void 0, function () {
            var dummyOrder, _makeAndPostOneSellOrder, range, batches, numOrdersCreated, _h, batches_1, subRange, batchOrdersCreated;
            var _this = this;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (numberOfOrders < 1) {
                            throw new Error("Need to make at least one sell order");
                        }
                        if (!assets || !assets.length) {
                            throw new Error("Need at least one asset to create orders for");
                        }
                        if (_.uniqBy(assets, function (a) { return a.tokenAddress; }).length !== 1) {
                            throw new Error("All assets must be on the same factory contract address");
                        }
                        return [4 /*yield*/, this._makeSellOrder({
                                asset: assets[0],
                                quantity: quantity,
                                accountAddress: accountAddress,
                                startAmount: startAmount,
                                endAmount: endAmount,
                                listingTime: listingTime,
                                expirationTime: expirationTime,
                                waitForHighestBid: waitForHighestBid,
                                paymentTokenAddress: paymentTokenAddress || constants_1.NULL_ADDRESS,
                                extraBountyBasisPoints: extraBountyBasisPoints,
                                buyerAddress: buyerAddress || constants_1.NULL_ADDRESS,
                            })];
                    case 1:
                        dummyOrder = _j.sent();
                        return [4 /*yield*/, this._sellOrderValidationAndApprovals({
                                order: dummyOrder,
                                accountAddress: accountAddress,
                            })];
                    case 2:
                        _j.sent();
                        _makeAndPostOneSellOrder = function (asset) { return __awaiter(_this, void 0, void 0, function () {
                            var order, hashedOrder, signature, error_4, orderWithSignature;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, this._makeSellOrder({
                                            asset: asset,
                                            quantity: quantity,
                                            accountAddress: accountAddress,
                                            startAmount: startAmount,
                                            endAmount: endAmount,
                                            listingTime: listingTime,
                                            expirationTime: expirationTime,
                                            waitForHighestBid: waitForHighestBid,
                                            paymentTokenAddress: paymentTokenAddress || constants_1.NULL_ADDRESS,
                                            extraBountyBasisPoints: extraBountyBasisPoints,
                                            buyerAddress: buyerAddress || constants_1.NULL_ADDRESS,
                                        })];
                                    case 1:
                                        order = _b.sent();
                                        if (!buyerEmail) return [3 /*break*/, 3];
                                        return [4 /*yield*/, this._createEmailWhitelistEntry({ order: order, buyerEmail: buyerEmail })];
                                    case 2:
                                        _b.sent();
                                        _b.label = 3;
                                    case 3:
                                        hashedOrder = __assign(__assign({}, order), { hash: (0, utils_1.getOrderHash)(order) });
                                        _b.label = 4;
                                    case 4:
                                        _b.trys.push([4, 6, , 7]);
                                        return [4 /*yield*/, this.authorizeOrder(hashedOrder)];
                                    case 5:
                                        signature = _b.sent();
                                        return [3 /*break*/, 7];
                                    case 6:
                                        error_4 = _b.sent();
                                        console.error(error_4);
                                        throw new Error("You declined to authorize your auction, or your web3 provider can't sign using personal_sign. Try 'web3-provider-engine' and make sure a mnemonic is set. Just a reminder: there's no gas needed anymore to mint tokens!");
                                    case 7:
                                        orderWithSignature = __assign(__assign({}, hashedOrder), signature);
                                        return [2 /*return*/, this.validateAndPostOrder(orderWithSignature)];
                                }
                            });
                        }); };
                        range = _.range(numberOfOrders * assets.length);
                        batches = _.chunk(range, constants_1.SELL_ORDER_BATCH_SIZE);
                        numOrdersCreated = 0;
                        _h = 0, batches_1 = batches;
                        _j.label = 3;
                    case 3:
                        if (!(_h < batches_1.length)) return [3 /*break*/, 7];
                        subRange = batches_1[_h];
                        return [4 /*yield*/, Promise.all(subRange.map(function (assetOrderIndex) { return __awaiter(_this, void 0, void 0, function () {
                                var assetIndex;
                                return __generator(this, function (_b) {
                                    assetIndex = Math.floor(assetOrderIndex / numberOfOrders);
                                    return [2 /*return*/, _makeAndPostOneSellOrder(assets[assetIndex])];
                                });
                            }); }))];
                    case 4:
                        batchOrdersCreated = _j.sent();
                        this.logger("Created and posted a batch of ".concat(batchOrdersCreated.length, " orders in parallel."));
                        numOrdersCreated += batchOrdersCreated.length;
                        // Don't overwhelm router
                        return [4 /*yield*/, (0, utils_1.delay)(500)];
                    case 5:
                        // Don't overwhelm router
                        _j.sent();
                        _j.label = 6;
                    case 6:
                        _h++;
                        return [3 /*break*/, 3];
                    case 7: return [2 /*return*/, numOrdersCreated];
                }
            });
        });
    };
    /**
     * Create a sell order to auction a bundle of assets.
     * Will throw a 'You do not own this asset' error if the maker doesn't have one of the assets.
     * If the user hasn't approved access to any of the assets yet, this will emit `ApproveAllAssets` (or `ApproveAsset` if the contract doesn't support approve-all) before asking for approval for each asset.
     * @param param0 __namedParameters Object
     * @param bundleName Name of the bundle
     * @param bundleDescription Optional description of the bundle. Markdown is allowed.
     * @param bundleExternalLink Optional link to a page that adds context to the bundle.
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to bundle together.
     * @param collection Optional collection for computing fees, required only if all assets belong to the same collection
     * @param quantities The quantity of each asset to sell. Defaults to 1 for each.
     * @param accountAddress The address of the maker of the bundle and the owner of all the assets.
     * @param startAmount Price of the asset at the start of the auction, or minimum acceptable bid if it's an English auction.
     * @param endAmount Optional price of the asset at the end of its expiration time. If not specified, will be set to `startAmount`.
     * @param listingTime Optional time when the order will become fulfillable, in UTC seconds. Undefined means it will start now.
     * @param expirationTime Expiration time for the order, in seconds.
     * @param waitForHighestBid If set to true, this becomes an English auction that increases in price for every bid. The highest bid wins when the auction expires, as long as it's at least `startAmount`. `expirationTime` must be > 0.
     * @param englishAuctionReservePrice Optional price level, below which orders may be placed but will not be matched.  Orders below the reserve can be manually accepted but will not be automatically matched.
     * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
     * @param extraBountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of this order
     * @param buyerAddress Optional address that's allowed to purchase this bundle. If specified, no other address will be able to take the order, unless it's the null address.
     */
    OpenSeaPort.prototype.createBundleSellOrder = function (_b) {
        var bundleName = _b.bundleName, bundleDescription = _b.bundleDescription, bundleExternalLink = _b.bundleExternalLink, assets = _b.assets, collection = _b.collection, quantities = _b.quantities, accountAddress = _b.accountAddress, startAmount = _b.startAmount, endAmount = _b.endAmount, _c = _b.expirationTime, expirationTime = _c === void 0 ? (0, utils_1.getMaxOrderExpirationTimestamp)() : _c, listingTime = _b.listingTime, _d = _b.waitForHighestBid, waitForHighestBid = _d === void 0 ? false : _d, englishAuctionReservePrice = _b.englishAuctionReservePrice, paymentTokenAddress = _b.paymentTokenAddress, _e = _b.extraBountyBasisPoints, extraBountyBasisPoints = _e === void 0 ? 0 : _e, buyerAddress = _b.buyerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var order, hashedOrder, signature, error_5, orderWithSignature;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        // Default to one of each asset
                        quantities = quantities || assets.map(function (_a) { return 1; });
                        return [4 /*yield*/, this._makeBundleSellOrder({
                                bundleName: bundleName,
                                bundleDescription: bundleDescription,
                                bundleExternalLink: bundleExternalLink,
                                assets: assets,
                                collection: collection,
                                quantities: quantities,
                                accountAddress: accountAddress,
                                startAmount: startAmount,
                                endAmount: endAmount,
                                listingTime: listingTime,
                                expirationTime: expirationTime,
                                waitForHighestBid: waitForHighestBid,
                                englishAuctionReservePrice: englishAuctionReservePrice,
                                paymentTokenAddress: paymentTokenAddress || constants_1.NULL_ADDRESS,
                                extraBountyBasisPoints: extraBountyBasisPoints,
                                buyerAddress: buyerAddress || constants_1.NULL_ADDRESS,
                            })];
                    case 1:
                        order = _f.sent();
                        return [4 /*yield*/, this._sellOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })];
                    case 2:
                        _f.sent();
                        hashedOrder = __assign(__assign({}, order), { hash: (0, utils_1.getOrderHash)(order) });
                        _f.label = 3;
                    case 3:
                        _f.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.authorizeOrder(hashedOrder)];
                    case 4:
                        signature = _f.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_5 = _f.sent();
                        console.error(error_5);
                        throw new Error("You declined to authorize your auction");
                    case 6:
                        orderWithSignature = __assign(__assign({}, hashedOrder), signature);
                        return [2 /*return*/, this.validateAndPostOrder(orderWithSignature)];
                }
            });
        });
    };
    /**
     * Fullfill or "take" an order for an asset, either a buy or sell order
     * @param param0 __namedParamaters Object
     * @param order The order to fulfill, a.k.a. "take"
     * @param accountAddress The taker's wallet address
     * @param recipientAddress The optional address to receive the order's item(s) or curriencies. If not specified, defaults to accountAddress.
     * @param referrerAddress The optional address that referred the order
     * @returns Transaction hash for fulfilling the order
     */
    OpenSeaPort.prototype.fulfillOrder = function (_b) {
        var order = _b.order, accountAddress = _b.accountAddress, recipientAddress = _b.recipientAddress, referrerAddress = _b.referrerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var matchingOrder, _c, buy, sell, metadata, transactionHash;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        matchingOrder = this._makeMatchingOrder({
                            order: order,
                            accountAddress: accountAddress,
                            recipientAddress: recipientAddress || accountAddress,
                        });
                        _c = (0, utils_1.assignOrdersToSides)(order, matchingOrder), buy = _c.buy, sell = _c.sell;
                        metadata = this._getMetadata(order, referrerAddress);
                        return [4 /*yield*/, this._atomicMatch({
                                buy: buy,
                                sell: sell,
                                accountAddress: accountAddress,
                                metadata: metadata,
                            })];
                    case 1:
                        transactionHash = _d.sent();
                        return [4 /*yield*/, this._confirmTransaction(transactionHash, types_1.EventType.MatchOrders, "Fulfilling order", function () { return __awaiter(_this, void 0, void 0, function () {
                                var isOpen;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, this._validateOrder(order)];
                                        case 1:
                                            isOpen = _b.sent();
                                            return [2 /*return*/, !isOpen];
                                    }
                                });
                            }); })];
                    case 2:
                        _d.sent();
                        return [2 /*return*/, transactionHash];
                }
            });
        });
    };
    /**
     * Cancel an order on-chain, preventing it from ever being fulfilled.
     * @param param0 __namedParameters Object
     * @param order The order to cancel
     * @param accountAddress The order maker's wallet address
     */
    OpenSeaPort.prototype.cancelOrder = function (_b) {
        var order = _b.order, accountAddress = _b.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var transactionHash;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this._dispatch(types_1.EventType.CancelOrder, { order: order, accountAddress: accountAddress });
                        return [4 /*yield*/, this._wyvernProtocol.wyvernExchange
                                .cancelOrder_([
                                order.exchange,
                                order.maker,
                                order.taker,
                                order.feeRecipient,
                                order.target,
                                order.staticTarget,
                                order.paymentToken,
                            ], [
                                order.makerRelayerFee,
                                order.takerRelayerFee,
                                order.makerProtocolFee,
                                order.takerProtocolFee,
                                order.basePrice,
                                order.extra,
                                order.listingTime,
                                order.expirationTime,
                                order.salt,
                            ], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, order.v || 0, order.r || constants_1.NULL_BLOCK_HASH, order.s || constants_1.NULL_BLOCK_HASH)
                                .sendTransactionAsync({ from: accountAddress })];
                    case 1:
                        transactionHash = _c.sent();
                        return [4 /*yield*/, this._confirmTransaction(transactionHash, types_1.EventType.CancelOrder, "Cancelling order", function () { return __awaiter(_this, void 0, void 0, function () {
                                var isOpen;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, this._validateOrder(order)];
                                        case 1:
                                            isOpen = _b.sent();
                                            return [2 /*return*/, !isOpen];
                                    }
                                });
                            }); })];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cancel all existing orders with a lower nonce on-chain, preventing them from ever being fulfilled.
     * @param param0 __namedParameters Object
     * @param accountAddress The order maker's wallet address
     */
    OpenSeaPort.prototype.bulkCancelExistingOrders = function (_b) {
        var accountAddress = _b.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var transactionHash;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this._dispatch(types_1.EventType.BulkCancelExistingOrders, { accountAddress: accountAddress });
                        return [4 /*yield*/, this._wyvernProtocol.wyvernExchange
                                .incrementNonce()
                                .sendTransactionAsync({ from: accountAddress })];
                    case 1:
                        transactionHash = _c.sent();
                        return [4 /*yield*/, this._confirmTransaction(transactionHash.toString(), types_1.EventType.BulkCancelExistingOrders, "Bulk cancelling existing orders")];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Approve a non-fungible token for use in trades.
     * Requires an account to be initialized first.
     * Called internally, but exposed for dev flexibility.
     * Checks to see if already approved, first. Then tries different approval methods from best to worst.
     * @param param0 __namedParameters Object
     * @param tokenId Token id to approve, but only used if approve-all isn't
     *  supported by the token contract
     * @param tokenAddress The contract address of the token being approved
     * @param accountAddress The user's wallet address
     * @param proxyAddress Address of the user's proxy contract. If not provided,
     *  will attempt to fetch it from Wyvern.
     * @param tokenAbi ABI of the token's contract. Defaults to a flexible ERC-721
     *  contract.
     * @param skipApproveAllIfTokenAddressIn an optional list of token addresses that, if a token is approve-all type, will skip approval
     * @param schemaName The Wyvern schema name corresponding to the asset type
     * @returns Transaction hash if a new transaction was created, otherwise null
     */
    OpenSeaPort.prototype.approveSemiOrNonFungibleToken = function (_b) {
        var tokenId = _b.tokenId, tokenAddress = _b.tokenAddress, accountAddress = _b.accountAddress, proxyAddress = _b.proxyAddress, _c = _b.tokenAbi, tokenAbi = _c === void 0 ? contracts_1.ERC721 : _c, _d = _b.skipApproveAllIfTokenAddressIn, skipApproveAllIfTokenAddressIn = _d === void 0 ? new Set() : _d, _e = _b.schemaName, schemaName = _e === void 0 ? types_1.WyvernSchemaName.ERC721 : _e;
        return __awaiter(this, void 0, void 0, function () {
            var schema, tokenContract, approvalAllCheck, isApprovedForAll, txHash, error_6, approvalOneCheck, isApprovedForOne, txHash, error_7;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        schema = this._getSchema(schemaName);
                        tokenContract = new this.web3.eth.Contract(tokenAbi, tokenAddress);
                        if (!!proxyAddress) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._getProxy(accountAddress)];
                    case 1:
                        proxyAddress = (_f.sent()) || undefined;
                        if (!proxyAddress) {
                            throw new Error("Uninitialized account");
                        }
                        _f.label = 2;
                    case 2:
                        approvalAllCheck = function () { return __awaiter(_this, void 0, void 0, function () {
                            var isApprovedForAllRaw;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, (0, utils_1.rawCall)(this.web3ReadOnly, {
                                            from: accountAddress,
                                            to: tokenContract.options.address,
                                            data: tokenContract.methods
                                                .isApprovedForAll(accountAddress, proxyAddress)
                                                .encodeABI(),
                                        })];
                                    case 1:
                                        isApprovedForAllRaw = _b.sent();
                                        return [2 /*return*/, parseInt(isApprovedForAllRaw)];
                                }
                            });
                        }); };
                        return [4 /*yield*/, approvalAllCheck()];
                    case 3:
                        isApprovedForAll = _f.sent();
                        if (isApprovedForAll == 1) {
                            // Supports ApproveAll
                            this.logger("Already approved proxy for all tokens");
                            return [2 /*return*/, null];
                        }
                        if (!(isApprovedForAll == 0)) return [3 /*break*/, 8];
                        // Supports ApproveAll
                        //  not approved for all yet
                        if (skipApproveAllIfTokenAddressIn.has(tokenAddress)) {
                            this.logger("Already approving proxy for all tokens in another transaction");
                            return [2 /*return*/, null];
                        }
                        skipApproveAllIfTokenAddressIn.add(tokenAddress);
                        _f.label = 4;
                    case 4:
                        _f.trys.push([4, 7, , 8]);
                        this._dispatch(types_1.EventType.ApproveAllAssets, {
                            accountAddress: accountAddress,
                            proxyAddress: proxyAddress,
                            contractAddress: tokenAddress,
                        });
                        return [4 /*yield*/, (0, utils_1.sendRawTransaction)(this.web3, {
                                from: accountAddress,
                                to: tokenContract.options.address,
                                data: tokenContract.methods
                                    .setApprovalForAll(proxyAddress, true)
                                    .encodeABI(),
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, {
                                    error: error,
                                    accountAddress: accountAddress,
                                });
                            })];
                    case 5:
                        txHash = _f.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.ApproveAllAssets, "Approving all tokens of this type for trading", function () { return __awaiter(_this, void 0, void 0, function () {
                                var result;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, approvalAllCheck()];
                                        case 1:
                                            result = _b.sent();
                                            return [2 /*return*/, result == 1];
                                    }
                                });
                            }); })];
                    case 6:
                        _f.sent();
                        return [2 /*return*/, txHash];
                    case 7:
                        error_6 = _f.sent();
                        console.error(error_6);
                        throw new Error("Couldn't get permission to approve these tokens for trading. Their contract might not be implemented correctly. Please contact the developer!");
                    case 8:
                        // Does not support ApproveAll (ERC721 v1 or v2)
                        this.logger("Contract does not support Approve All");
                        approvalOneCheck = function () { return __awaiter(_this, void 0, void 0, function () {
                            var approvedAddr, error_8;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, tokenContract.methods
                                                .getApproved(tokenId)
                                                .call()];
                                    case 1:
                                        approvedAddr = _b.sent();
                                        if (typeof approvedAddr === "string" && approvedAddr == "0x") {
                                            // Geth compatibility
                                            approvedAddr = undefined;
                                        }
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_8 = _b.sent();
                                        console.error(error_8);
                                        return [3 /*break*/, 3];
                                    case 3:
                                        if (approvedAddr == proxyAddress) {
                                            this.logger("Already approved proxy for this token");
                                            return [2 /*return*/, true];
                                        }
                                        this.logger("Approve response: ".concat(approvedAddr));
                                        if (!!approvedAddr) return [3 /*break*/, 5];
                                        return [4 /*yield*/, (0, utils_1.getNonCompliantApprovalAddress)(
                                            // @ts-expect-error This is an actual contract instance
                                            tokenContract, tokenId, accountAddress)];
                                    case 4:
                                        approvedAddr = _b.sent();
                                        if (approvedAddr == proxyAddress) {
                                            this.logger("Already approved proxy for this item");
                                            return [2 /*return*/, true];
                                        }
                                        this.logger("Special-case approve response: ".concat(approvedAddr));
                                        _b.label = 5;
                                    case 5: return [2 /*return*/, false];
                                }
                            });
                        }); };
                        return [4 /*yield*/, approvalOneCheck()];
                    case 9:
                        isApprovedForOne = _f.sent();
                        if (isApprovedForOne) {
                            return [2 /*return*/, null];
                        }
                        _f.label = 10;
                    case 10:
                        _f.trys.push([10, 13, , 14]);
                        this._dispatch(types_1.EventType.ApproveAsset, {
                            accountAddress: accountAddress,
                            proxyAddress: proxyAddress,
                            asset: (0, utils_1.getWyvernAsset)(schema, { tokenId: tokenId, tokenAddress: tokenAddress }),
                        });
                        return [4 /*yield*/, (0, utils_1.sendRawTransaction)(this.web3, {
                                from: accountAddress,
                                to: tokenContract.options.address,
                                data: tokenContract.methods
                                    .approve(proxyAddress, tokenId)
                                    .encodeABI(),
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, {
                                    error: error,
                                    accountAddress: accountAddress,
                                });
                            })];
                    case 11:
                        txHash = _f.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.ApproveAsset, "Approving single token for trading", approvalOneCheck)];
                    case 12:
                        _f.sent();
                        return [2 /*return*/, txHash];
                    case 13:
                        error_7 = _f.sent();
                        console.error(error_7);
                        throw new Error("Couldn't get permission to approve this token for trading. Its contract might not be implemented correctly. Please contact the developer!");
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Approve a fungible token (e.g. W-ETH) for use in trades.
     * Called internally, but exposed for dev flexibility.
     * Checks to see if the minimum amount is already approved, first.
     * @param param0 __namedParameters Object
     * @param accountAddress The user's wallet address
     * @param tokenAddress The contract address of the token being approved
     * @param proxyAddress The user's proxy address. If unspecified, uses the Wyvern token transfer proxy address.
     * @param minimumAmount The minimum amount needed to skip a transaction. Defaults to the max-integer.
     * @returns Transaction hash if a new transaction occurred, otherwise null
     */
    OpenSeaPort.prototype.approveFungibleToken = function (_b) {
        var _c;
        var accountAddress = _b.accountAddress, tokenAddress = _b.tokenAddress, proxyAddress = _b.proxyAddress, _d = _b.minimumAmount, minimumAmount = _d === void 0 ? wyvern_js_1.WyvernProtocol.MAX_UINT_256 : _d;
        return __awaiter(this, void 0, void 0, function () {
            var approvedAmount, hasOldApproveMethod, txHash;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        proxyAddress =
                            proxyAddress ||
                                ((_c = this._wyvernConfigOverride) === null || _c === void 0 ? void 0 : _c.wyvernTokenTransferProxyContractAddress) ||
                                wyvern_js_1.WyvernProtocol.getTokenTransferProxyAddress(this._networkName);
                        return [4 /*yield*/, this._getApprovedTokenCount({
                                accountAddress: accountAddress,
                                tokenAddress: tokenAddress,
                                proxyAddress: proxyAddress,
                            })];
                    case 1:
                        approvedAmount = _e.sent();
                        if (approvedAmount.isGreaterThanOrEqualTo(minimumAmount)) {
                            this.logger("Already approved enough currency for trading");
                            return [2 /*return*/, null];
                        }
                        this.logger("Not enough token approved for trade: ".concat(approvedAmount, " approved to transfer ").concat(tokenAddress));
                        this._dispatch(types_1.EventType.ApproveCurrency, {
                            accountAddress: accountAddress,
                            contractAddress: tokenAddress,
                            proxyAddress: proxyAddress,
                        });
                        hasOldApproveMethod = [constants_1.ENJIN_COIN_ADDRESS, constants_1.MANA_ADDRESS].includes(tokenAddress.toLowerCase());
                        if (!(minimumAmount.isGreaterThan(0) && hasOldApproveMethod)) return [3 /*break*/, 3];
                        // Older erc20s require initial approval to be 0
                        return [4 /*yield*/, this.unapproveFungibleToken({
                                accountAddress: accountAddress,
                                tokenAddress: tokenAddress,
                                proxyAddress: proxyAddress,
                            })];
                    case 2:
                        // Older erc20s require initial approval to be 0
                        _e.sent();
                        _e.label = 3;
                    case 3: return [4 /*yield*/, (0, utils_1.sendRawTransaction)(this.web3, {
                            from: accountAddress,
                            to: tokenAddress,
                            data: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.ERC20, "approve"), 
                            // Always approve maximum amount, to prevent the need for followup
                            // transactions (and because old ERC20s like MANA/ENJ are non-compliant)
                            [proxyAddress, wyvern_js_1.WyvernProtocol.MAX_UINT_256.toString()]),
                        }, function (error) {
                            _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                        })];
                    case 4:
                        txHash = _e.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.ApproveCurrency, "Approving currency for trading", function () { return __awaiter(_this, void 0, void 0, function () {
                                var newlyApprovedAmount;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, this._getApprovedTokenCount({
                                                accountAddress: accountAddress,
                                                tokenAddress: tokenAddress,
                                                proxyAddress: proxyAddress,
                                            })];
                                        case 1:
                                            newlyApprovedAmount = _b.sent();
                                            return [2 /*return*/, newlyApprovedAmount.isGreaterThanOrEqualTo(minimumAmount)];
                                    }
                                });
                            }); })];
                    case 5:
                        _e.sent();
                        return [2 /*return*/, txHash];
                }
            });
        });
    };
    /**
     * Un-approve a fungible token (e.g. W-ETH) for use in trades.
     * Called internally, but exposed for dev flexibility.
     * Useful for old ERC20s that require a 0 approval count before
     * changing the count
     * @param param0 __namedParameters Object
     * @param accountAddress The user's wallet address
     * @param tokenAddress The contract address of the token being approved
     * @param proxyAddress The user's proxy address. If unspecified, uses the Wyvern token transfer proxy address.
     * @returns Transaction hash
     */
    OpenSeaPort.prototype.unapproveFungibleToken = function (_b) {
        var _c;
        var accountAddress = _b.accountAddress, tokenAddress = _b.tokenAddress, proxyAddress = _b.proxyAddress;
        return __awaiter(this, void 0, void 0, function () {
            var txHash;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        proxyAddress =
                            proxyAddress ||
                                ((_c = this._wyvernConfigOverride) === null || _c === void 0 ? void 0 : _c.wyvernTokenTransferProxyContractAddress) ||
                                wyvern_js_1.WyvernProtocol.getTokenTransferProxyAddress(this._networkName);
                        return [4 /*yield*/, (0, utils_1.sendRawTransaction)(this.web3, {
                                from: accountAddress,
                                to: tokenAddress,
                                data: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.ERC20, "approve"), [proxyAddress, 0]),
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 1:
                        txHash = _d.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.UnapproveCurrency, "Resetting Currency Approval", function () { return __awaiter(_this, void 0, void 0, function () {
                                var newlyApprovedAmount;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, this._getApprovedTokenCount({
                                                accountAddress: accountAddress,
                                                tokenAddress: tokenAddress,
                                                proxyAddress: proxyAddress,
                                            })];
                                        case 1:
                                            newlyApprovedAmount = _b.sent();
                                            return [2 /*return*/, newlyApprovedAmount.isZero()];
                                    }
                                });
                            }); })];
                    case 2:
                        _d.sent();
                        return [2 /*return*/, txHash];
                }
            });
        });
    };
    /**
     * Gets the price for the order using the contract
     * @param order The order to calculate the price for
     */
    OpenSeaPort.prototype.getCurrentPrice = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var currentPrice;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._wyvernProtocolReadOnly.wyvernExchange
                            .calculateCurrentPrice_([
                            order.exchange,
                            order.maker,
                            order.taker,
                            order.feeRecipient,
                            order.target,
                            order.staticTarget,
                            order.paymentToken,
                        ], [
                            order.makerRelayerFee,
                            order.takerRelayerFee,
                            order.makerProtocolFee,
                            order.takerProtocolFee,
                            order.basePrice,
                            order.extra,
                            order.listingTime,
                            order.expirationTime,
                            order.salt,
                        ], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata)
                            .callAsync()];
                    case 1:
                        currentPrice = _b.sent();
                        return [2 /*return*/, currentPrice];
                }
            });
        });
    };
    /**
     * Returns whether an order is fulfillable.
     * An order may not be fulfillable if a target item's transfer function
     * is locked for some reason, e.g. an item is being rented within a game
     * or trading has been locked for an item type.
     * @param param0 __namedParameters Object
     * @param order Order to check
     * @param accountAddress The account address that will be fulfilling the order
     * @param recipientAddress The optional address to receive the order's item(s) or curriencies. If not specified, defaults to accountAddress.
     * @param referrerAddress The optional address that referred the order
     */
    OpenSeaPort.prototype.isOrderFulfillable = function (_b) {
        var order = _b.order, accountAddress = _b.accountAddress, recipientAddress = _b.recipientAddress, referrerAddress = _b.referrerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var matchingOrder, _c, buy, sell, metadata, gas;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        matchingOrder = this._makeMatchingOrder({
                            order: order,
                            accountAddress: accountAddress,
                            recipientAddress: recipientAddress || accountAddress,
                        });
                        _c = (0, utils_1.assignOrdersToSides)(order, matchingOrder), buy = _c.buy, sell = _c.sell;
                        metadata = this._getMetadata(order, referrerAddress);
                        return [4 /*yield*/, this._estimateGasForMatch({
                                buy: buy,
                                sell: sell,
                                accountAddress: accountAddress,
                                metadata: metadata,
                            })];
                    case 1:
                        gas = _d.sent();
                        this.logger("Gas estimate for ".concat(order.side == types_1.OrderSide.Sell ? "sell" : "buy", " order: ").concat(gas));
                        return [2 /*return*/, gas != null && gas > 0];
                }
            });
        });
    };
    /**
     * Returns whether an asset is transferrable.
     * An asset may not be transferrable if its transfer function
     * is locked for some reason, e.g. an item is being rented within a game
     * or trading has been locked for an item type.
     * @param param0 __namedParameters Object
     * @param tokenId DEPRECATED: Token ID. Use `asset` instead.
     * @param tokenAddress DEPRECATED: Address of the token's contract. Use `asset` instead.
     * @param asset The asset to trade
     * @param fromAddress The account address that currently owns the asset
     * @param toAddress The account address that will be acquiring the asset
     * @param quantity The amount of the asset to transfer, if it's fungible (optional). In units (not base units), e.g. not wei.
     * @param useProxy Use the `fromAddress`'s proxy contract only if the `fromAddress` has already approved the asset for sale. Required if checking an ERC-721 v1 asset (like CryptoKitties) that doesn't check if the transferFrom caller is the owner of the asset (only allowing it if it's an approved address).
     * @param retries How many times to retry if false
     */
    OpenSeaPort.prototype.isAssetTransferrable = function (_b, retries) {
        var asset = _b.asset, fromAddress = _b.fromAddress, toAddress = _b.toAddress, quantity = _b.quantity, _c = _b.useProxy, useProxy = _c === void 0 ? false : _c;
        if (retries === void 0) { retries = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var schema, quantityBN, wyAsset, abi, from, proxyAddress, data, gas, error_9;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        schema = this._getSchema(this._getSchemaName(asset));
                        quantityBN = quantity
                            ? wyvern_js_1.WyvernProtocol.toBaseUnitAmount((0, utils_1.makeBigNumber)(quantity), asset.decimals || 0)
                            : (0, utils_1.makeBigNumber)(1);
                        wyAsset = (0, utils_1.getWyvernAsset)(schema, asset, quantityBN);
                        abi = schema.functions.transfer(wyAsset);
                        from = fromAddress;
                        if (!useProxy) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._getProxy(fromAddress)];
                    case 1:
                        proxyAddress = _d.sent();
                        if (!proxyAddress) {
                            console.error("This asset's owner (".concat(fromAddress, ") does not have a proxy!"));
                            return [2 /*return*/, false];
                        }
                        from = proxyAddress;
                        _d.label = 2;
                    case 2:
                        data = (0, schema_1.encodeTransferCall)(abi, fromAddress, toAddress);
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 8]);
                        return [4 /*yield*/, (0, utils_1.estimateGas)(this._getClientsForRead({ retries: retries }).web3, {
                                from: from,
                                to: abi.target,
                                data: data,
                            })];
                    case 4:
                        gas = _d.sent();
                        return [2 /*return*/, gas > 0];
                    case 5:
                        error_9 = _d.sent();
                        if (retries <= 0) {
                            console.error(error_9);
                            console.error(from, abi.target, data);
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, (0, utils_1.delay)(500)];
                    case 6:
                        _d.sent();
                        return [4 /*yield*/, this.isAssetTransferrable({ asset: asset, fromAddress: fromAddress, toAddress: toAddress, quantity: quantity, useProxy: useProxy }, retries - 1)];
                    case 7: return [2 /*return*/, _d.sent()];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Transfer a fungible or non-fungible asset to another address
     * @param param0 __namedParamaters Object
     * @param fromAddress The owner's wallet address
     * @param toAddress The recipient's wallet address
     * @param asset The fungible or non-fungible asset to transfer
     * @param quantity The amount of the asset to transfer, if it's fungible (optional). In units (not base units), e.g. not wei.
     * @returns Transaction hash
     */
    OpenSeaPort.prototype.transfer = function (_b) {
        var fromAddress = _b.fromAddress, toAddress = _b.toAddress, asset = _b.asset, _c = _b.quantity, quantity = _c === void 0 ? 1 : _c;
        return __awaiter(this, void 0, void 0, function () {
            var schema, quantityBN, wyAsset, isCryptoKitties, isOldNFT, abi, data, txHash;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        schema = this._getSchema(this._getSchemaName(asset));
                        quantityBN = wyvern_js_1.WyvernProtocol.toBaseUnitAmount((0, utils_1.makeBigNumber)(quantity), asset.decimals || 0);
                        wyAsset = (0, utils_1.getWyvernAsset)(schema, asset, quantityBN);
                        isCryptoKitties = [constants_1.CK_ADDRESS, constants_1.CK_RINKEBY_ADDRESS].includes(wyAsset.address);
                        isOldNFT = isCryptoKitties ||
                            (!!asset.version &&
                                [types_1.TokenStandardVersion.ERC721v1, types_1.TokenStandardVersion.ERC721v2].includes(asset.version));
                        abi = this._getSchemaName(asset) === types_1.WyvernSchemaName.ERC20
                            ? (0, utils_1.annotateERC20TransferABI)(wyAsset)
                            : isOldNFT
                                ? (0, utils_1.annotateERC721TransferABI)(wyAsset)
                                : schema.functions.transfer(wyAsset);
                        this._dispatch(types_1.EventType.TransferOne, {
                            accountAddress: fromAddress,
                            toAddress: toAddress,
                            asset: wyAsset,
                        });
                        data = (0, schema_1.encodeTransferCall)(abi, fromAddress, toAddress);
                        return [4 /*yield*/, (0, utils_1.sendRawTransaction)(this.web3, {
                                from: fromAddress,
                                to: abi.target,
                                data: data,
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, {
                                    error: error,
                                    accountAddress: fromAddress,
                                });
                            })];
                    case 1:
                        txHash = _d.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.TransferOne, "Transferring asset")];
                    case 2:
                        _d.sent();
                        return [2 /*return*/, txHash];
                }
            });
        });
    };
    /**
     * Transfer one or more assets to another address.
     * ERC-721 and ERC-1155 assets are supported
     * @param param0 __namedParamaters Object
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to transfer.
     * @param fromAddress The owner's wallet address
     * @param toAddress The recipient's wallet address
     * @param schemaName The Wyvern schema name corresponding to the asset type, if not in each Asset definition
     * @returns Transaction hash
     */
    OpenSeaPort.prototype.transferAll = function (_b) {
        var assets = _b.assets, fromAddress = _b.fromAddress, toAddress = _b.toAddress, _c = _b.schemaName, schemaName = _c === void 0 ? types_1.WyvernSchemaName.ERC721 : _c;
        return __awaiter(this, void 0, void 0, function () {
            var schemaNames, wyAssets, _d, calldata, target, proxyAddress, txHash;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        toAddress = (0, utils_1.validateAndFormatWalletAddress)(this.web3, toAddress);
                        schemaNames = assets.map(function (asset) { return _this._getSchemaName(asset) || schemaName; });
                        wyAssets = assets.map(function (asset) {
                            return (0, utils_1.getWyvernAsset)(_this._getSchema(_this._getSchemaName(asset)), asset);
                        });
                        _d = (0, schema_1.encodeAtomicizedTransfer)(schemaNames.map(function (name) { return _this._getSchema(name); }), wyAssets, fromAddress, toAddress, this._wyvernProtocol, this._networkName), calldata = _d.calldata, target = _d.target;
                        return [4 /*yield*/, this._getProxy(fromAddress)];
                    case 1:
                        proxyAddress = _e.sent();
                        if (!!proxyAddress) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._initializeProxy(fromAddress)];
                    case 2:
                        proxyAddress = _e.sent();
                        _e.label = 3;
                    case 3: return [4 /*yield*/, this._approveAll({
                            schemaNames: schemaNames,
                            wyAssets: wyAssets,
                            accountAddress: fromAddress,
                            proxyAddress: proxyAddress,
                        })];
                    case 4:
                        _e.sent();
                        this._dispatch(types_1.EventType.TransferAll, {
                            accountAddress: fromAddress,
                            toAddress: toAddress,
                            assets: wyAssets,
                        });
                        return [4 /*yield*/, (0, utils_1.sendRawTransaction)(this.web3, {
                                from: fromAddress,
                                to: proxyAddress,
                                data: (0, schema_1.encodeProxyCall)(target, types_1.HowToCall.DelegateCall, calldata),
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, {
                                    error: error,
                                    accountAddress: fromAddress,
                                });
                            })];
                    case 5:
                        txHash = _e.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.TransferAll, "Transferring ".concat(assets.length, " asset").concat(assets.length == 1 ? "" : "s"))];
                    case 6:
                        _e.sent();
                        return [2 /*return*/, txHash];
                }
            });
        });
    };
    /**
     * Get known payment tokens (ERC-20) that match your filters.
     * @param param0 __namedParameters Object
     * @param symbol Filter by the ERC-20 symbol for the token,
     *    e.g. "DAI" for Dai stablecoin
     * @param address Filter by the ERC-20 contract address for the token,
     *    e.g. "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359" for Dai
     * @param name Filter by the name of the ERC-20 contract.
     *    Not guaranteed to exist or be unique for each token type.
     *    e.g. '' for Dai and 'Decentraland' for MANA
     * FUTURE: officiallySupported: Filter for tokens that are
     *    officially supported and shown on opensea.io
     */
    OpenSeaPort.prototype.getFungibleTokens = function (_b) {
        var _c = _b === void 0 ? {} : _b, symbol = _c.symbol, address = _c.address, name = _c.name;
        return __awaiter(this, void 0, void 0, function () {
            var tokenSettings, tokens, offlineTokens;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        (0, utils_1.onDeprecated)("Use `api.getPaymentTokens` instead");
                        tokenSettings = WyvernSchemas.tokens[this._networkName];
                        return [4 /*yield*/, this.api.getPaymentTokens({
                                symbol: symbol,
                                address: address,
                                name: name,
                            })];
                    case 1:
                        tokens = (_d.sent()).tokens;
                        offlineTokens = __spreadArray([
                            tokenSettings.canonicalWrappedEther
                        ], tokenSettings.otherTokens, true).filter(function (t) {
                            if (symbol != null && t.symbol.toLowerCase() != symbol.toLowerCase()) {
                                return false;
                            }
                            if (address != null && t.address.toLowerCase() != address.toLowerCase()) {
                                return false;
                            }
                            if (name != null && t.name != name) {
                                return false;
                            }
                            return true;
                        });
                        return [2 /*return*/, __spreadArray(__spreadArray([], offlineTokens, true), tokens, true)];
                }
            });
        });
    };
    /**
     * Get an account's balance of any Asset.
     * @param param0 __namedParameters Object
     * @param accountAddress Account address to check
     * @param asset The Asset to check balance for
     * @param retries How many times to retry if balance is 0
     */
    OpenSeaPort.prototype.getAssetBalance = function (_b, retries) {
        var accountAddress = _b.accountAddress, asset = _b.asset;
        if (retries === void 0) { retries = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAsset, abi, contract, inputValues, count, abi, contract, inputValues, owner, _c;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        schema = this._getSchema(this._getSchemaName(asset));
                        wyAsset = (0, utils_1.getWyvernAsset)(schema, asset);
                        if (!schema.functions.countOf) return [3 /*break*/, 2];
                        abi = schema.functions.countOf(wyAsset);
                        contract = new (this._getClientsForRead({
                            retries: retries,
                        }).web3.eth.Contract)([abi], abi.target);
                        inputValues = abi.inputs
                            .filter(function (x) { return x.value !== undefined; })
                            .map(function (x) { return x.value; });
                        return [4 /*yield*/, (_d = contract.methods)[abi.name].apply(_d, __spreadArray([accountAddress], inputValues, false)).call()];
                    case 1:
                        count = _f.sent();
                        if (count !== undefined) {
                            return [2 /*return*/, new bignumber_js_1.BigNumber(count)];
                        }
                        return [3 /*break*/, 8];
                    case 2:
                        if (!schema.functions.ownerOf) return [3 /*break*/, 7];
                        abi = schema.functions.ownerOf(wyAsset);
                        contract = new (this._getClientsForRead({
                            retries: retries,
                        }).web3.eth.Contract)([abi], abi.target);
                        if (abi.inputs.filter(function (x) { return x.value === undefined; })[0]) {
                            throw new Error("Missing an argument for finding the owner of this asset");
                        }
                        inputValues = abi.inputs.map(function (i) { return i.value.toString(); });
                        _f.label = 3;
                    case 3:
                        _f.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, (_e = contract.methods)[abi.name].apply(_e, inputValues).call()];
                    case 4:
                        owner = _f.sent();
                        if (owner) {
                            return [2 /*return*/, owner.toLowerCase() == accountAddress.toLowerCase()
                                    ? new bignumber_js_1.BigNumber(1)
                                    : new bignumber_js_1.BigNumber(0)];
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        _c = _f.sent();
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 8];
                    case 7: 
                    // Missing ownership call - skip check to allow listings
                    // by default
                    throw new Error("Missing ownership schema for this asset type");
                    case 8:
                        if (!(retries <= 0)) return [3 /*break*/, 9];
                        throw new Error("Unable to get current owner from smart contract");
                    case 9: return [4 /*yield*/, (0, utils_1.delay)(500)];
                    case 10:
                        _f.sent();
                        return [4 /*yield*/, this.getAssetBalance({ accountAddress: accountAddress, asset: asset }, retries - 1)];
                    case 11: 
                    // Recursively check owner again
                    return [2 /*return*/, _f.sent()];
                }
            });
        });
    };
    /**
     * Get the balance of a fungible token.
     * Convenience method for getAssetBalance for fungibles
     * @param param0 __namedParameters Object
     * @param accountAddress Account address to check
     * @param tokenAddress The address of the token to check balance for
     * @param schemaName Optional schema name for the fungible token
     * @param retries Number of times to retry if balance is undefined
     */
    OpenSeaPort.prototype.getTokenBalance = function (_b, retries) {
        var accountAddress = _b.accountAddress, tokenAddress = _b.tokenAddress, _c = _b.schemaName, schemaName = _c === void 0 ? types_1.WyvernSchemaName.ERC20 : _c;
        if (retries === void 0) { retries = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var asset;
            return __generator(this, function (_d) {
                asset = {
                    tokenId: null,
                    tokenAddress: tokenAddress,
                    schemaName: schemaName,
                };
                return [2 /*return*/, this.getAssetBalance({ accountAddress: accountAddress, asset: asset }, retries)];
            });
        });
    };
    /**
     * Compute the fees for an order
     * @param param0 __namedParameters
     * @param asset Asset to use for fees. May be blank ONLY for multi-collection bundles.
     * @param side The side of the order (buy or sell)
     * @param accountAddress The account to check fees for (useful if fees differ by account, like transfer fees)
     * @param extraBountyBasisPoints The basis points to add for the bounty. Will throw if it exceeds the assets' contract's OpenSea fee.
     */
    OpenSeaPort.prototype.computeFees = function (_b) {
        var asset = _b.asset, side = _b.side, accountAddress = _b.accountAddress, _c = _b.extraBountyBasisPoints, extraBountyBasisPoints = _c === void 0 ? 0 : _c;
        return __awaiter(this, void 0, void 0, function () {
            var openseaBuyerFeeBasisPoints, openseaSellerFeeBasisPoints, devBuyerFeeBasisPoints, devSellerFeeBasisPoints, transferFee, transferFeeTokenAddress, maxTotalBountyBPS, result, error_10, sellerBountyBasisPoints, bountyTooLarge, errorMessage;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        openseaBuyerFeeBasisPoints = constants_1.DEFAULT_BUYER_FEE_BASIS_POINTS;
                        openseaSellerFeeBasisPoints = constants_1.DEFAULT_SELLER_FEE_BASIS_POINTS;
                        devBuyerFeeBasisPoints = 0;
                        devSellerFeeBasisPoints = 0;
                        transferFee = (0, utils_1.makeBigNumber)(0);
                        transferFeeTokenAddress = null;
                        maxTotalBountyBPS = constants_1.DEFAULT_MAX_BOUNTY;
                        if (asset) {
                            openseaBuyerFeeBasisPoints = +asset.collection.openseaBuyerFeeBasisPoints;
                            openseaSellerFeeBasisPoints =
                                +asset.collection.openseaSellerFeeBasisPoints;
                            devBuyerFeeBasisPoints = +asset.collection.devBuyerFeeBasisPoints;
                            devSellerFeeBasisPoints = +asset.collection.devSellerFeeBasisPoints;
                            maxTotalBountyBPS = openseaSellerFeeBasisPoints;
                        }
                        if (!(side == types_1.OrderSide.Sell && asset)) return [3 /*break*/, 4];
                        // Server-side knowledge
                        transferFee = asset.transferFee
                            ? (0, utils_1.makeBigNumber)(asset.transferFee)
                            : transferFee;
                        transferFeeTokenAddress = asset.transferFeePaymentToken
                            ? asset.transferFeePaymentToken.address
                            : transferFeeTokenAddress;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, utils_1.getTransferFeeSettings)(this.web3, {
                                asset: asset,
                                accountAddress: accountAddress,
                            })];
                    case 2:
                        result = _d.sent();
                        transferFee =
                            result.transferFee != null ? result.transferFee : transferFee;
                        transferFeeTokenAddress =
                            result.transferFeeTokenAddress || transferFeeTokenAddress;
                        return [3 /*break*/, 4];
                    case 3:
                        error_10 = _d.sent();
                        // Use server defaults
                        console.error(error_10);
                        return [3 /*break*/, 4];
                    case 4:
                        sellerBountyBasisPoints = side == types_1.OrderSide.Sell ? extraBountyBasisPoints : 0;
                        bountyTooLarge = sellerBountyBasisPoints + constants_1.OPENSEA_SELLER_BOUNTY_BASIS_POINTS >
                            maxTotalBountyBPS;
                        if (sellerBountyBasisPoints > 0 && bountyTooLarge) {
                            errorMessage = "Total bounty exceeds the maximum for this asset type (".concat(maxTotalBountyBPS / 100, "%).");
                            if (maxTotalBountyBPS >= constants_1.OPENSEA_SELLER_BOUNTY_BASIS_POINTS) {
                                errorMessage += " Remember that OpenSea will add ".concat(constants_1.OPENSEA_SELLER_BOUNTY_BASIS_POINTS / 100, "% for referrers with OpenSea accounts!");
                            }
                            throw new Error(errorMessage);
                        }
                        return [2 /*return*/, {
                                totalBuyerFeeBasisPoints: openseaBuyerFeeBasisPoints + devBuyerFeeBasisPoints,
                                totalSellerFeeBasisPoints: openseaSellerFeeBasisPoints + devSellerFeeBasisPoints,
                                openseaBuyerFeeBasisPoints: openseaBuyerFeeBasisPoints,
                                openseaSellerFeeBasisPoints: openseaSellerFeeBasisPoints,
                                devBuyerFeeBasisPoints: devBuyerFeeBasisPoints,
                                devSellerFeeBasisPoints: devSellerFeeBasisPoints,
                                sellerBountyBasisPoints: sellerBountyBasisPoints,
                                transferFee: transferFee,
                                transferFeeTokenAddress: transferFeeTokenAddress,
                            }];
                }
            });
        });
    };
    /**
     * Post an order to the OpenSea orderbook.
     * @param order The order to post. Can either be signed by the maker or pre-approved on the Wyvern contract using approveOrder. See https://github.com/ProjectWyvern/wyvern-ethereum/blob/master/contracts/exchange/Exchange.sol#L178
     * @returns The order as stored by the orderbook
     */
    OpenSeaPort.prototype.validateAndPostOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                // Validation is called server-side
                return [2 /*return*/, (0, utils_1.orderToJSON)(order)];
            });
        });
    };
    /**
     * DEPRECATED: ERC-1559
     * https://eips.ethereum.org/EIPS/eip-1559
     * Compute the gas price for sending a txn, in wei
     * Will be slightly above the mean to make it faster
     */
    OpenSeaPort.prototype._computeGasPrice = function () {
        return __awaiter(this, void 0, void 0, function () {
            var meanGas, weiToAdd;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, utils_1.getCurrentGasPrice)(this.web3)];
                    case 1:
                        meanGas = _b.sent();
                        weiToAdd = this.web3.utils.toWei(this.gasPriceAddition.toString(), "gwei");
                        return [2 /*return*/, meanGas.plus(weiToAdd)];
                }
            });
        });
    };
    /**
     * Compute the gas amount for sending a txn
     * Will be slightly above the result of estimateGas to make it more reliable
     * @param estimation The result of estimateGas for a transaction
     */
    OpenSeaPort.prototype._correctGasAmount = function (estimation) {
        return Math.ceil(estimation * this.gasIncreaseFactor);
    };
    /**
     * Estimate the gas needed to match two orders. Returns undefined if tx errors
     * @param param0 __namedParamaters Object
     * @param buy The buy order to match
     * @param sell The sell order to match
     * @param accountAddress The taker's wallet address
     * @param metadata Metadata bytes32 to send with the match
     * @param retries Number of times to retry if false
     */
    OpenSeaPort.prototype._estimateGasForMatch = function (_b, retries) {
        var buy = _b.buy, sell = _b.sell, accountAddress = _b.accountAddress, _c = _b.metadata, metadata = _c === void 0 ? constants_1.NULL_BLOCK_HASH : _c;
        if (retries === void 0) { retries = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var value, error_11;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!(buy.maker.toLowerCase() == accountAddress.toLowerCase() &&
                            buy.paymentToken == constants_1.NULL_ADDRESS)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._getRequiredAmountForTakingSellOrder(sell)];
                    case 1:
                        value = _d.sent();
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 7]);
                        return [4 /*yield*/, this._getClientsForRead({
                                retries: retries,
                            })
                                .wyvernProtocol.wyvernExchange.atomicMatch_([
                                buy.exchange,
                                buy.maker,
                                buy.taker,
                                buy.feeRecipient,
                                buy.target,
                                buy.staticTarget,
                                buy.paymentToken,
                                sell.exchange,
                                sell.maker,
                                sell.taker,
                                sell.feeRecipient,
                                sell.target,
                                sell.staticTarget,
                                sell.paymentToken,
                            ], [
                                buy.makerRelayerFee,
                                buy.takerRelayerFee,
                                buy.makerProtocolFee,
                                buy.takerProtocolFee,
                                buy.basePrice,
                                buy.extra,
                                buy.listingTime,
                                buy.expirationTime,
                                buy.salt,
                                sell.makerRelayerFee,
                                sell.takerRelayerFee,
                                sell.makerProtocolFee,
                                sell.takerProtocolFee,
                                sell.basePrice,
                                sell.extra,
                                sell.listingTime,
                                sell.expirationTime,
                                sell.salt,
                            ], [
                                buy.feeMethod,
                                buy.side,
                                buy.saleKind,
                                buy.howToCall,
                                sell.feeMethod,
                                sell.side,
                                sell.saleKind,
                                sell.howToCall,
                            ], buy.calldata, sell.calldata, buy.replacementPattern, sell.replacementPattern, buy.staticExtradata, sell.staticExtradata, [buy.v || 0, sell.v || 0], [
                                buy.r || constants_1.NULL_BLOCK_HASH,
                                buy.s || constants_1.NULL_BLOCK_HASH,
                                sell.r || constants_1.NULL_BLOCK_HASH,
                                sell.s || constants_1.NULL_BLOCK_HASH,
                                metadata,
                            ])
                                .estimateGasAsync({ from: accountAddress, value: value })];
                    case 3: return [2 /*return*/, _d.sent()];
                    case 4:
                        error_11 = _d.sent();
                        if (retries <= 0) {
                            console.error(error_11);
                            return [2 /*return*/, undefined];
                        }
                        return [4 /*yield*/, (0, utils_1.delay)(200)];
                    case 5:
                        _d.sent();
                        return [4 /*yield*/, this._estimateGasForMatch({ buy: buy, sell: sell, accountAddress: accountAddress, metadata: metadata }, retries - 1)];
                    case 6: return [2 /*return*/, _d.sent()];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Estimate the gas needed to transfer assets in bulk
     * Used for tests
     * @param param0 __namedParamaters Object
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to transfer.
     * @param fromAddress The owner's wallet address
     * @param toAddress The recipient's wallet address
     * @param schemaName The Wyvern schema name corresponding to the asset type, if not in each asset
     */
    OpenSeaPort.prototype._estimateGasForTransfer = function (_b) {
        var assets = _b.assets, fromAddress = _b.fromAddress, toAddress = _b.toAddress, _c = _b.schemaName, schemaName = _c === void 0 ? types_1.WyvernSchemaName.ERC721 : _c;
        return __awaiter(this, void 0, void 0, function () {
            var schemaNames, wyAssets, proxyAddress, _d, calldata, target;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        schemaNames = assets.map(function (asset) { return _this._getSchemaName(asset) || schemaName; });
                        wyAssets = assets.map(function (asset) {
                            return (0, utils_1.getWyvernAsset)(_this._getSchema(_this._getSchemaName(asset)), asset);
                        });
                        return [4 /*yield*/, this._getProxy(fromAddress)];
                    case 1:
                        proxyAddress = _e.sent();
                        if (!proxyAddress) {
                            throw new Error("Uninitialized proxy address");
                        }
                        return [4 /*yield*/, this._approveAll({
                                schemaNames: schemaNames,
                                wyAssets: wyAssets,
                                accountAddress: fromAddress,
                                proxyAddress: proxyAddress,
                            })];
                    case 2:
                        _e.sent();
                        _d = (0, schema_1.encodeAtomicizedTransfer)(schemaNames.map(function (name) { return _this._getSchema(name); }), wyAssets, fromAddress, toAddress, this._wyvernProtocol, this._networkName), calldata = _d.calldata, target = _d.target;
                        return [2 /*return*/, (0, utils_1.estimateGas)(this.web3, {
                                from: fromAddress,
                                to: proxyAddress,
                                data: (0, schema_1.encodeProxyCall)(target, types_1.HowToCall.DelegateCall, calldata),
                            })];
                }
            });
        });
    };
    /**
     * Get the proxy address for a user's wallet.
     * Internal method exposed for dev flexibility.
     * @param accountAddress The user's wallet address
     * @param retries Optional number of retries to do
     * @param wyvernProtocol optional wyvern protocol override
     */
    OpenSeaPort.prototype._getProxy = function (accountAddress, retries) {
        if (retries === void 0) { retries = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var proxyAddress;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._wyvernProtocolReadOnly.wyvernProxyRegistry
                            .proxies(accountAddress)
                            .callAsync()];
                    case 1:
                        proxyAddress = _b.sent();
                        if (proxyAddress == "0x") {
                            throw new Error("Couldn't retrieve your account from the blockchain - make sure you're on the correct Ethereum network!");
                        }
                        if (!(!proxyAddress || proxyAddress == constants_1.NULL_ADDRESS)) return [3 /*break*/, 5];
                        if (!(retries > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, utils_1.delay)(1000)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this._getProxy(accountAddress, retries - 1)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        proxyAddress = null;
                        _b.label = 5;
                    case 5: return [2 /*return*/, proxyAddress];
                }
            });
        });
    };
    /**
     * Initialize the proxy for a user's wallet.
     * Proxies are used to make trades on behalf of the order's maker so that
     *  trades can happen when the maker isn't online.
     * Internal method exposed for dev flexibility.
     * @param accountAddress The user's wallet address
     * @param wyvernProtocol optional wyvern protocol override
     */
    OpenSeaPort.prototype._initializeProxy = function (accountAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var txnData, gasEstimate, transactionHash, proxyAddress;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._dispatch(types_1.EventType.InitializeAccount, { accountAddress: accountAddress });
                        this.logger("Initializing proxy for account: ".concat(accountAddress));
                        txnData = { from: accountAddress };
                        return [4 /*yield*/, this._wyvernProtocol.wyvernProxyRegistry
                                .registerProxy()
                                .estimateGasAsync(txnData)];
                    case 1:
                        gasEstimate = _b.sent();
                        return [4 /*yield*/, this._wyvernProtocol.wyvernProxyRegistry
                                .registerProxy()
                                .sendTransactionAsync(__assign(__assign({}, txnData), { gas: this._correctGasAmount(gasEstimate) }))];
                    case 2:
                        transactionHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(transactionHash, types_1.EventType.InitializeAccount, "Initializing proxy for account", function () { return __awaiter(_this, void 0, void 0, function () {
                                var polledProxy;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, this._getProxy(accountAddress, 0)];
                                        case 1:
                                            polledProxy = _b.sent();
                                            return [2 /*return*/, !!polledProxy];
                                    }
                                });
                            }); })];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, this._getProxy(accountAddress, 10)];
                    case 4:
                        proxyAddress = _b.sent();
                        if (!proxyAddress) {
                            throw new Error("Failed to initialize your account :( Please restart your wallet/browser and try again!");
                        }
                        return [2 /*return*/, proxyAddress];
                }
            });
        });
    };
    /**
     * For a fungible token to use in trades (like W-ETH), get the amount
     *  approved for use by the Wyvern transfer proxy.
     * Internal method exposed for dev flexibility.
     * @param param0 __namedParameters Object
     * @param accountAddress Address for the user's wallet
     * @param tokenAddress Address for the token's contract
     * @param proxyAddress User's proxy address. If undefined, uses the token transfer proxy address
     */
    OpenSeaPort.prototype._getApprovedTokenCount = function (_b) {
        var _c;
        var accountAddress = _b.accountAddress, tokenAddress = _b.tokenAddress, proxyAddress = _b.proxyAddress;
        return __awaiter(this, void 0, void 0, function () {
            var addressToApprove, approved;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!tokenAddress) {
                            tokenAddress =
                                WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address;
                        }
                        addressToApprove = proxyAddress ||
                            ((_c = this._wyvernConfigOverride) === null || _c === void 0 ? void 0 : _c.wyvernTokenTransferProxyContractAddress) ||
                            wyvern_js_1.WyvernProtocol.getTokenTransferProxyAddress(this._networkName);
                        return [4 /*yield*/, (0, utils_1.rawCall)(this.web3, {
                                from: accountAddress,
                                to: tokenAddress,
                                data: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.ERC20, "allowance"), [
                                    accountAddress,
                                    addressToApprove,
                                ]),
                            })];
                    case 1:
                        approved = _d.sent();
                        return [2 /*return*/, (0, utils_1.makeBigNumber)(approved)];
                }
            });
        });
    };
    OpenSeaPort.prototype._makeBuyOrder = function (_b) {
        var _c;
        var asset = _b.asset, quantity = _b.quantity, accountAddress = _b.accountAddress, startAmount = _b.startAmount, _d = _b.expirationTime, expirationTime = _d === void 0 ? (0, utils_1.getMaxOrderExpirationTimestamp)() : _d, paymentTokenAddress = _b.paymentTokenAddress, _e = _b.extraBountyBasisPoints, extraBountyBasisPoints = _e === void 0 ? 0 : _e, sellOrder = _b.sellOrder, referrerAddress = _b.referrerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var schema, quantityBN, wyAsset, openSeaAsset, taker, _f, totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, _g, makerRelayerFee, takerRelayerFee, makerProtocolFee, takerProtocolFee, makerReferrerFee, feeRecipient, feeMethod, _h, target, calldata, replacementPattern, _j, basePrice, extra, paymentToken, times, _k, staticTarget, staticExtradata;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        accountAddress = (0, utils_1.validateAndFormatWalletAddress)(this.web3, accountAddress);
                        schema = this._getSchema(this._getSchemaName(asset));
                        quantityBN = wyvern_js_1.WyvernProtocol.toBaseUnitAmount((0, utils_1.makeBigNumber)(quantity), asset.decimals || 0);
                        wyAsset = (0, utils_1.getWyvernAsset)(schema, asset, quantityBN);
                        return [4 /*yield*/, this.api.getAsset(asset)];
                    case 1:
                        openSeaAsset = _l.sent();
                        taker = sellOrder ? sellOrder.maker : constants_1.NULL_ADDRESS;
                        return [4 /*yield*/, this.computeFees({
                                asset: openSeaAsset,
                                extraBountyBasisPoints: extraBountyBasisPoints,
                                side: types_1.OrderSide.Buy,
                            })];
                    case 2:
                        _f = _l.sent(), totalBuyerFeeBasisPoints = _f.totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints = _f.totalSellerFeeBasisPoints;
                        _g = this._getBuyFeeParameters(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, sellOrder), makerRelayerFee = _g.makerRelayerFee, takerRelayerFee = _g.takerRelayerFee, makerProtocolFee = _g.makerProtocolFee, takerProtocolFee = _g.takerProtocolFee, makerReferrerFee = _g.makerReferrerFee, feeRecipient = _g.feeRecipient, feeMethod = _g.feeMethod;
                        _h = (0, schema_1.encodeBuy)(schema, wyAsset, accountAddress, (sellOrder === null || sellOrder === void 0 ? void 0 : sellOrder.waitingForBestCounterOrder)
                            ? undefined
                            : utils_1.merkleValidatorByNetwork[this._networkName]), target = _h.target, calldata = _h.calldata, replacementPattern = _h.replacementPattern;
                        return [4 /*yield*/, this._getPriceParameters(types_1.OrderSide.Buy, paymentTokenAddress, expirationTime, startAmount)];
                    case 3:
                        _j = _l.sent(), basePrice = _j.basePrice, extra = _j.extra, paymentToken = _j.paymentToken;
                        times = this._getTimeParameters({
                            expirationTimestamp: expirationTime,
                        });
                        return [4 /*yield*/, this._getStaticCallTargetAndExtraData({
                                asset: openSeaAsset,
                                useTxnOriginStaticCall: false,
                            })];
                    case 4:
                        _k = _l.sent(), staticTarget = _k.staticTarget, staticExtradata = _k.staticExtradata;
                        return [2 /*return*/, {
                                exchange: ((_c = this._wyvernConfigOverride) === null || _c === void 0 ? void 0 : _c.wyvernExchangeContractAddress) ||
                                    wyvern_js_1.WyvernProtocol.getExchangeContractAddress(this._networkName),
                                maker: accountAddress,
                                taker: taker,
                                quantity: quantityBN,
                                makerRelayerFee: makerRelayerFee,
                                takerRelayerFee: takerRelayerFee,
                                makerProtocolFee: makerProtocolFee,
                                takerProtocolFee: takerProtocolFee,
                                makerReferrerFee: makerReferrerFee,
                                waitingForBestCounterOrder: false,
                                feeMethod: feeMethod,
                                feeRecipient: feeRecipient,
                                side: types_1.OrderSide.Buy,
                                saleKind: types_1.SaleKind.FixedPrice,
                                target: target,
                                howToCall: target === utils_1.merkleValidatorByNetwork[this._networkName]
                                    ? types_1.HowToCall.DelegateCall
                                    : types_1.HowToCall.Call,
                                calldata: calldata,
                                replacementPattern: replacementPattern,
                                staticTarget: staticTarget,
                                staticExtradata: staticExtradata,
                                paymentToken: paymentToken,
                                basePrice: basePrice,
                                extra: extra,
                                listingTime: times.listingTime,
                                expirationTime: times.expirationTime,
                                salt: wyvern_js_1.WyvernProtocol.generatePseudoRandomSalt(),
                                metadata: {
                                    asset: wyAsset,
                                    schema: schema.name,
                                    referrerAddress: referrerAddress,
                                },
                            }];
                }
            });
        });
    };
    OpenSeaPort.prototype._makeSellOrder = function (_b) {
        var _c;
        var asset = _b.asset, quantity = _b.quantity, accountAddress = _b.accountAddress, startAmount = _b.startAmount, endAmount = _b.endAmount, listingTime = _b.listingTime, _d = _b.expirationTime, expirationTime = _d === void 0 ? (0, utils_1.getMaxOrderExpirationTimestamp)() : _d, waitForHighestBid = _b.waitForHighestBid, _e = _b.englishAuctionReservePrice, englishAuctionReservePrice = _e === void 0 ? 0 : _e, paymentTokenAddress = _b.paymentTokenAddress, extraBountyBasisPoints = _b.extraBountyBasisPoints, buyerAddress = _b.buyerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var schema, quantityBN, wyAsset, openSeaAsset, _f, totalSellerFeeBasisPoints, totalBuyerFeeBasisPoints, sellerBountyBasisPoints, _g, target, calldata, replacementPattern, orderSaleKind, _h, basePrice, extra, paymentToken, reservePrice, times, _j, makerRelayerFee, takerRelayerFee, makerProtocolFee, takerProtocolFee, makerReferrerFee, feeRecipient, feeMethod, _k, staticTarget, staticExtradata;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        accountAddress = (0, utils_1.validateAndFormatWalletAddress)(this.web3, accountAddress);
                        schema = this._getSchema(this._getSchemaName(asset));
                        quantityBN = wyvern_js_1.WyvernProtocol.toBaseUnitAmount((0, utils_1.makeBigNumber)(quantity), asset.decimals || 0);
                        wyAsset = (0, utils_1.getWyvernAsset)(schema, asset, quantityBN);
                        return [4 /*yield*/, this.api.getAsset(asset)];
                    case 1:
                        openSeaAsset = _l.sent();
                        return [4 /*yield*/, this.computeFees({
                                asset: openSeaAsset,
                                side: types_1.OrderSide.Sell,
                                extraBountyBasisPoints: extraBountyBasisPoints,
                            })];
                    case 2:
                        _f = _l.sent(), totalSellerFeeBasisPoints = _f.totalSellerFeeBasisPoints, totalBuyerFeeBasisPoints = _f.totalBuyerFeeBasisPoints, sellerBountyBasisPoints = _f.sellerBountyBasisPoints;
                        _g = (0, schema_1.encodeSell)(schema, wyAsset, accountAddress, waitForHighestBid
                            ? undefined
                            : utils_1.merkleValidatorByNetwork[this._networkName]), target = _g.target, calldata = _g.calldata, replacementPattern = _g.replacementPattern;
                        orderSaleKind = endAmount != null && endAmount !== startAmount
                            ? types_1.SaleKind.DutchAuction
                            : types_1.SaleKind.FixedPrice;
                        return [4 /*yield*/, this._getPriceParameters(types_1.OrderSide.Sell, paymentTokenAddress, expirationTime, startAmount, endAmount, waitForHighestBid, englishAuctionReservePrice)];
                    case 3:
                        _h = _l.sent(), basePrice = _h.basePrice, extra = _h.extra, paymentToken = _h.paymentToken, reservePrice = _h.reservePrice;
                        times = this._getTimeParameters({
                            expirationTimestamp: expirationTime,
                            listingTimestamp: listingTime,
                            waitingForBestCounterOrder: waitForHighestBid,
                        });
                        _j = this._getSellFeeParameters(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, waitForHighestBid, sellerBountyBasisPoints), makerRelayerFee = _j.makerRelayerFee, takerRelayerFee = _j.takerRelayerFee, makerProtocolFee = _j.makerProtocolFee, takerProtocolFee = _j.takerProtocolFee, makerReferrerFee = _j.makerReferrerFee, feeRecipient = _j.feeRecipient, feeMethod = _j.feeMethod;
                        return [4 /*yield*/, this._getStaticCallTargetAndExtraData({
                                asset: openSeaAsset,
                                useTxnOriginStaticCall: waitForHighestBid,
                            })];
                    case 4:
                        _k = _l.sent(), staticTarget = _k.staticTarget, staticExtradata = _k.staticExtradata;
                        return [2 /*return*/, {
                                exchange: ((_c = this._wyvernConfigOverride) === null || _c === void 0 ? void 0 : _c.wyvernExchangeContractAddress) ||
                                    wyvern_js_1.WyvernProtocol.getExchangeContractAddress(this._networkName),
                                maker: accountAddress,
                                taker: buyerAddress,
                                quantity: quantityBN,
                                makerRelayerFee: makerRelayerFee,
                                takerRelayerFee: takerRelayerFee,
                                makerProtocolFee: makerProtocolFee,
                                takerProtocolFee: takerProtocolFee,
                                makerReferrerFee: makerReferrerFee,
                                waitingForBestCounterOrder: waitForHighestBid,
                                englishAuctionReservePrice: reservePrice
                                    ? (0, utils_1.makeBigNumber)(reservePrice)
                                    : undefined,
                                feeMethod: feeMethod,
                                feeRecipient: feeRecipient,
                                side: types_1.OrderSide.Sell,
                                saleKind: orderSaleKind,
                                target: target,
                                howToCall: target === utils_1.merkleValidatorByNetwork[this._networkName]
                                    ? types_1.HowToCall.DelegateCall
                                    : types_1.HowToCall.Call,
                                calldata: calldata,
                                replacementPattern: replacementPattern,
                                staticTarget: staticTarget,
                                staticExtradata: staticExtradata,
                                paymentToken: paymentToken,
                                basePrice: basePrice,
                                extra: extra,
                                listingTime: times.listingTime,
                                expirationTime: times.expirationTime,
                                salt: wyvern_js_1.WyvernProtocol.generatePseudoRandomSalt(),
                                metadata: {
                                    asset: wyAsset,
                                    schema: schema.name,
                                },
                            }];
                }
            });
        });
    };
    OpenSeaPort.prototype._getStaticCallTargetAndExtraData = function (_b) {
        var asset = _b.asset, useTxnOriginStaticCall = _b.useTxnOriginStaticCall;
        return __awaiter(this, void 0, void 0, function () {
            var isCheezeWizards, isDecentralandEstate, isMainnet, cheezeWizardsBasicTournamentAddress, cheezeWizardsBasicTournamentInstance, wizardFingerprint, decentralandEstateAddress, decentralandEstateInstance, estateFingerprint;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        isCheezeWizards = [
                            constants_1.CHEEZE_WIZARDS_GUILD_ADDRESS.toLowerCase(),
                            constants_1.CHEEZE_WIZARDS_GUILD_RINKEBY_ADDRESS.toLowerCase(),
                        ].includes(asset.tokenAddress.toLowerCase());
                        isDecentralandEstate = asset.tokenAddress.toLowerCase() ==
                            constants_1.DECENTRALAND_ESTATE_ADDRESS.toLowerCase();
                        isMainnet = this._networkName == types_1.Network.Main;
                        if (isMainnet && !useTxnOriginStaticCall) {
                            // While testing, we will use dummy values for mainnet. We will remove this if-statement once we have pushed the PR once and tested on Rinkeby
                            return [2 /*return*/, {
                                    staticTarget: constants_1.NULL_ADDRESS,
                                    staticExtradata: "0x",
                                }];
                        }
                        if (!isCheezeWizards) return [3 /*break*/, 2];
                        cheezeWizardsBasicTournamentAddress = isMainnet
                            ? constants_1.CHEEZE_WIZARDS_BASIC_TOURNAMENT_ADDRESS
                            : constants_1.CHEEZE_WIZARDS_BASIC_TOURNAMENT_RINKEBY_ADDRESS;
                        cheezeWizardsBasicTournamentInstance = new this.web3.eth.Contract(contracts_1.CheezeWizardsBasicTournament, cheezeWizardsBasicTournamentAddress);
                        return [4 /*yield*/, (0, utils_1.rawCall)(this.web3, {
                                to: cheezeWizardsBasicTournamentInstance.options.address,
                                data: cheezeWizardsBasicTournamentInstance.methods
                                    .wizardFingerprint(asset.tokenId)
                                    .encodeABI(),
                            })];
                    case 1:
                        wizardFingerprint = _c.sent();
                        return [2 /*return*/, {
                                staticTarget: isMainnet
                                    ? constants_1.STATIC_CALL_CHEEZE_WIZARDS_ADDRESS
                                    : constants_1.STATIC_CALL_CHEEZE_WIZARDS_RINKEBY_ADDRESS,
                                staticExtradata: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.StaticCheckCheezeWizards, "succeedIfCurrentWizardFingerprintMatchesProvidedWizardFingerprint"), [asset.tokenId, wizardFingerprint, useTxnOriginStaticCall]),
                            }];
                    case 2:
                        if (!(isDecentralandEstate && isMainnet)) return [3 /*break*/, 4];
                        decentralandEstateAddress = constants_1.DECENTRALAND_ESTATE_ADDRESS;
                        decentralandEstateInstance = new this.web3.eth.Contract(contracts_1.DecentralandEstates, decentralandEstateAddress);
                        return [4 /*yield*/, (0, utils_1.rawCall)(this.web3, {
                                to: decentralandEstateInstance.options.address,
                                data: decentralandEstateInstance.methods
                                    .getFingerprint(asset.tokenId)
                                    .encodeABI(),
                            })];
                    case 3:
                        estateFingerprint = _c.sent();
                        return [2 /*return*/, {
                                staticTarget: constants_1.STATIC_CALL_DECENTRALAND_ESTATES_ADDRESS,
                                staticExtradata: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.StaticCheckDecentralandEstates, "succeedIfCurrentEstateFingerprintMatchesProvidedEstateFingerprint"), [asset.tokenId, estateFingerprint, useTxnOriginStaticCall]),
                            }];
                    case 4:
                        if (useTxnOriginStaticCall) {
                            return [2 /*return*/, {
                                    staticTarget: isMainnet
                                        ? constants_1.STATIC_CALL_TX_ORIGIN_ADDRESS
                                        : constants_1.STATIC_CALL_TX_ORIGIN_RINKEBY_ADDRESS,
                                    staticExtradata: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.StaticCheckTxOrigin, "succeedIfTxOriginMatchesHardcodedAddress"), []),
                                }];
                        }
                        else {
                            // Noop - no checks
                            return [2 /*return*/, {
                                    staticTarget: constants_1.NULL_ADDRESS,
                                    staticExtradata: "0x",
                                }];
                        }
                        _c.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    OpenSeaPort.prototype._makeBundleBuyOrder = function (_b) {
        var _c;
        var assets = _b.assets, collection = _b.collection, quantities = _b.quantities, accountAddress = _b.accountAddress, startAmount = _b.startAmount, _d = _b.expirationTime, expirationTime = _d === void 0 ? (0, utils_1.getMaxOrderExpirationTimestamp)() : _d, paymentTokenAddress = _b.paymentTokenAddress, _e = _b.extraBountyBasisPoints, extraBountyBasisPoints = _e === void 0 ? 0 : _e, sellOrder = _b.sellOrder, referrerAddress = _b.referrerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var quantityBNs, bundle, orderedSchemas, taker, asset, _f, _g, totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, _h, makerRelayerFee, takerRelayerFee, makerProtocolFee, takerProtocolFee, makerReferrerFee, feeRecipient, feeMethod, _j, calldata, replacementPattern, _k, basePrice, extra, paymentToken, times;
            var _this = this;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        accountAddress = (0, utils_1.validateAndFormatWalletAddress)(this.web3, accountAddress);
                        quantityBNs = quantities.map(function (quantity, i) {
                            return wyvern_js_1.WyvernProtocol.toBaseUnitAmount((0, utils_1.makeBigNumber)(quantity), assets[i].decimals || 0);
                        });
                        bundle = (0, utils_1.getWyvernBundle)(assets, assets.map(function (a) { return _this._getSchema(a.schemaName); }), quantityBNs);
                        orderedSchemas = bundle.schemas.map(function (name) { return _this._getSchema(name); });
                        taker = sellOrder ? sellOrder.maker : constants_1.NULL_ADDRESS;
                        if (!collection) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.api.getAsset(assets[0])];
                    case 1:
                        _f = _l.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _f = undefined;
                        _l.label = 3;
                    case 3:
                        asset = _f;
                        return [4 /*yield*/, this.computeFees({
                                asset: asset,
                                extraBountyBasisPoints: extraBountyBasisPoints,
                                side: types_1.OrderSide.Buy,
                            })];
                    case 4:
                        _g = _l.sent(), totalBuyerFeeBasisPoints = _g.totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints = _g.totalSellerFeeBasisPoints;
                        _h = this._getBuyFeeParameters(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, sellOrder), makerRelayerFee = _h.makerRelayerFee, takerRelayerFee = _h.takerRelayerFee, makerProtocolFee = _h.makerProtocolFee, takerProtocolFee = _h.takerProtocolFee, makerReferrerFee = _h.makerReferrerFee, feeRecipient = _h.feeRecipient, feeMethod = _h.feeMethod;
                        _j = (0, schema_1.encodeAtomicizedBuy)(orderedSchemas, bundle.assets, accountAddress, this._wyvernProtocol, this._networkName), calldata = _j.calldata, replacementPattern = _j.replacementPattern;
                        return [4 /*yield*/, this._getPriceParameters(types_1.OrderSide.Buy, paymentTokenAddress, expirationTime, startAmount)];
                    case 5:
                        _k = _l.sent(), basePrice = _k.basePrice, extra = _k.extra, paymentToken = _k.paymentToken;
                        times = this._getTimeParameters({
                            expirationTimestamp: expirationTime,
                        });
                        return [2 /*return*/, {
                                exchange: ((_c = this._wyvernConfigOverride) === null || _c === void 0 ? void 0 : _c.wyvernExchangeContractAddress) ||
                                    wyvern_js_1.WyvernProtocol.getExchangeContractAddress(this._networkName),
                                maker: accountAddress,
                                taker: taker,
                                quantity: (0, utils_1.makeBigNumber)(1),
                                makerRelayerFee: makerRelayerFee,
                                takerRelayerFee: takerRelayerFee,
                                makerProtocolFee: makerProtocolFee,
                                takerProtocolFee: takerProtocolFee,
                                makerReferrerFee: makerReferrerFee,
                                waitingForBestCounterOrder: false,
                                feeMethod: feeMethod,
                                feeRecipient: feeRecipient,
                                side: types_1.OrderSide.Buy,
                                saleKind: types_1.SaleKind.FixedPrice,
                                target: wyvern_js_1.WyvernProtocol.getAtomicizerContractAddress(this._networkName),
                                howToCall: types_1.HowToCall.DelegateCall,
                                calldata: calldata,
                                replacementPattern: replacementPattern,
                                staticTarget: constants_1.NULL_ADDRESS,
                                staticExtradata: "0x",
                                paymentToken: paymentToken,
                                basePrice: basePrice,
                                extra: extra,
                                listingTime: times.listingTime,
                                expirationTime: times.expirationTime,
                                salt: wyvern_js_1.WyvernProtocol.generatePseudoRandomSalt(),
                                metadata: {
                                    bundle: bundle,
                                    referrerAddress: referrerAddress,
                                },
                            }];
                }
            });
        });
    };
    OpenSeaPort.prototype._makeBundleSellOrder = function (_b) {
        var _c;
        var bundleName = _b.bundleName, bundleDescription = _b.bundleDescription, bundleExternalLink = _b.bundleExternalLink, assets = _b.assets, collection = _b.collection, quantities = _b.quantities, accountAddress = _b.accountAddress, startAmount = _b.startAmount, endAmount = _b.endAmount, listingTime = _b.listingTime, _d = _b.expirationTime, expirationTime = _d === void 0 ? (0, utils_1.getMaxOrderExpirationTimestamp)() : _d, waitForHighestBid = _b.waitForHighestBid, _e = _b.englishAuctionReservePrice, englishAuctionReservePrice = _e === void 0 ? 0 : _e, paymentTokenAddress = _b.paymentTokenAddress, extraBountyBasisPoints = _b.extraBountyBasisPoints, buyerAddress = _b.buyerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var quantityBNs, bundle, orderedSchemas, asset, _f, _g, totalSellerFeeBasisPoints, totalBuyerFeeBasisPoints, sellerBountyBasisPoints, _h, calldata, replacementPattern, _j, basePrice, extra, paymentToken, reservePrice, times, orderSaleKind, _k, makerRelayerFee, takerRelayerFee, makerProtocolFee, takerProtocolFee, makerReferrerFee, feeRecipient;
            var _this = this;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        accountAddress = (0, utils_1.validateAndFormatWalletAddress)(this.web3, accountAddress);
                        quantityBNs = quantities.map(function (quantity, i) {
                            return wyvern_js_1.WyvernProtocol.toBaseUnitAmount((0, utils_1.makeBigNumber)(quantity), assets[i].decimals || 0);
                        });
                        bundle = (0, utils_1.getWyvernBundle)(assets, assets.map(function (a) { return _this._getSchema(a.schemaName); }), quantityBNs);
                        orderedSchemas = bundle.schemas.map(function (name) { return _this._getSchema(name); });
                        bundle.name = bundleName;
                        bundle.description = bundleDescription;
                        bundle.external_link = bundleExternalLink;
                        if (!collection) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.api.getAsset(assets[0])];
                    case 1:
                        _f = _l.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _f = undefined;
                        _l.label = 3;
                    case 3:
                        asset = _f;
                        return [4 /*yield*/, this.computeFees({
                                asset: asset,
                                side: types_1.OrderSide.Sell,
                                extraBountyBasisPoints: extraBountyBasisPoints,
                            })];
                    case 4:
                        _g = _l.sent(), totalSellerFeeBasisPoints = _g.totalSellerFeeBasisPoints, totalBuyerFeeBasisPoints = _g.totalBuyerFeeBasisPoints, sellerBountyBasisPoints = _g.sellerBountyBasisPoints;
                        _h = (0, schema_1.encodeAtomicizedSell)(orderedSchemas, bundle.assets, accountAddress, this._wyvernProtocol, this._networkName), calldata = _h.calldata, replacementPattern = _h.replacementPattern;
                        return [4 /*yield*/, this._getPriceParameters(types_1.OrderSide.Sell, paymentTokenAddress, expirationTime, startAmount, endAmount, waitForHighestBid, englishAuctionReservePrice)];
                    case 5:
                        _j = _l.sent(), basePrice = _j.basePrice, extra = _j.extra, paymentToken = _j.paymentToken, reservePrice = _j.reservePrice;
                        times = this._getTimeParameters({
                            expirationTimestamp: expirationTime,
                            listingTimestamp: listingTime,
                            waitingForBestCounterOrder: waitForHighestBid,
                        });
                        orderSaleKind = endAmount != null && endAmount !== startAmount
                            ? types_1.SaleKind.DutchAuction
                            : types_1.SaleKind.FixedPrice;
                        _k = this._getSellFeeParameters(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, waitForHighestBid, sellerBountyBasisPoints), makerRelayerFee = _k.makerRelayerFee, takerRelayerFee = _k.takerRelayerFee, makerProtocolFee = _k.makerProtocolFee, takerProtocolFee = _k.takerProtocolFee, makerReferrerFee = _k.makerReferrerFee, feeRecipient = _k.feeRecipient;
                        return [2 /*return*/, {
                                exchange: ((_c = this._wyvernConfigOverride) === null || _c === void 0 ? void 0 : _c.wyvernExchangeContractAddress) ||
                                    wyvern_js_1.WyvernProtocol.getExchangeContractAddress(this._networkName),
                                maker: accountAddress,
                                taker: buyerAddress,
                                quantity: (0, utils_1.makeBigNumber)(1),
                                makerRelayerFee: makerRelayerFee,
                                takerRelayerFee: takerRelayerFee,
                                makerProtocolFee: makerProtocolFee,
                                takerProtocolFee: takerProtocolFee,
                                makerReferrerFee: makerReferrerFee,
                                waitingForBestCounterOrder: waitForHighestBid,
                                englishAuctionReservePrice: reservePrice
                                    ? (0, utils_1.makeBigNumber)(reservePrice)
                                    : undefined,
                                feeMethod: types_1.FeeMethod.SplitFee,
                                feeRecipient: feeRecipient,
                                side: types_1.OrderSide.Sell,
                                saleKind: orderSaleKind,
                                target: wyvern_js_1.WyvernProtocol.getAtomicizerContractAddress(this._networkName),
                                howToCall: types_1.HowToCall.DelegateCall,
                                calldata: calldata,
                                replacementPattern: replacementPattern,
                                staticTarget: constants_1.NULL_ADDRESS,
                                staticExtradata: "0x",
                                paymentToken: paymentToken,
                                basePrice: basePrice,
                                extra: extra,
                                listingTime: times.listingTime,
                                expirationTime: times.expirationTime,
                                salt: wyvern_js_1.WyvernProtocol.generatePseudoRandomSalt(),
                                metadata: {
                                    bundle: bundle,
                                },
                            }];
                }
            });
        });
    };
    OpenSeaPort.prototype._makeMatchingOrder = function (_b) {
        var _this = this;
        var order = _b.order, accountAddress = _b.accountAddress, recipientAddress = _b.recipientAddress;
        accountAddress = (0, utils_1.validateAndFormatWalletAddress)(this.web3, accountAddress);
        recipientAddress = (0, utils_1.validateAndFormatWalletAddress)(this.web3, recipientAddress);
        var computeOrderParams = function () {
            var shouldValidate = order.target === utils_1.merkleValidatorByNetwork[_this._networkName];
            if ("asset" in order.metadata) {
                var schema = _this._getSchema(order.metadata.schema);
                return order.side == types_1.OrderSide.Buy
                    ? (0, schema_1.encodeSell)(schema, order.metadata.asset, recipientAddress, shouldValidate ? order.target : undefined)
                    : (0, schema_1.encodeBuy)(schema, order.metadata.asset, recipientAddress, shouldValidate ? order.target : undefined);
            }
            else if ("bundle" in order.metadata) {
                // We're matching a bundle order
                var bundle = order.metadata.bundle;
                var orderedSchemas = bundle.schemas
                    ? bundle.schemas.map(function (schemaName) { return _this._getSchema(schemaName); })
                    : // Backwards compat:
                        bundle.assets.map(function () {
                            return _this._getSchema("schema" in order.metadata ? order.metadata.schema : undefined);
                        });
                var atomicized = order.side == types_1.OrderSide.Buy
                    ? (0, schema_1.encodeAtomicizedSell)(orderedSchemas, order.metadata.bundle.assets, recipientAddress, _this._wyvernProtocol, _this._networkName)
                    : (0, schema_1.encodeAtomicizedBuy)(orderedSchemas, order.metadata.bundle.assets, recipientAddress, _this._wyvernProtocol, _this._networkName);
                return {
                    target: wyvern_js_1.WyvernProtocol.getAtomicizerContractAddress(_this._networkName),
                    calldata: atomicized.calldata,
                    replacementPattern: atomicized.replacementPattern,
                };
            }
            else {
                throw new Error("Invalid order metadata");
            }
        };
        var _c = computeOrderParams(), target = _c.target, calldata = _c.calldata, replacementPattern = _c.replacementPattern;
        var times = this._getTimeParameters({
            expirationTimestamp: 0,
            isMatchingOrder: true,
        });
        // Compat for matching buy orders that have fee recipient still on them
        var feeRecipient = order.feeRecipient == constants_1.NULL_ADDRESS ? constants_1.OPENSEA_FEE_RECIPIENT : constants_1.NULL_ADDRESS;
        var matchingOrder = {
            exchange: order.exchange,
            maker: accountAddress,
            taker: order.maker,
            quantity: order.quantity,
            makerRelayerFee: order.makerRelayerFee,
            takerRelayerFee: order.takerRelayerFee,
            makerProtocolFee: order.makerProtocolFee,
            takerProtocolFee: order.takerProtocolFee,
            makerReferrerFee: order.makerReferrerFee,
            waitingForBestCounterOrder: false,
            feeMethod: order.feeMethod,
            feeRecipient: feeRecipient,
            side: (order.side + 1) % 2,
            saleKind: types_1.SaleKind.FixedPrice,
            target: target,
            howToCall: order.howToCall,
            calldata: calldata,
            replacementPattern: replacementPattern,
            staticTarget: constants_1.NULL_ADDRESS,
            staticExtradata: "0x",
            paymentToken: order.paymentToken,
            basePrice: order.basePrice,
            extra: (0, utils_1.makeBigNumber)(0),
            listingTime: times.listingTime,
            expirationTime: times.expirationTime,
            salt: wyvern_js_1.WyvernProtocol.generatePseudoRandomSalt(),
            metadata: order.metadata,
        };
        return matchingOrder;
    };
    /**
     * Validate against Wyvern that a buy and sell order can match
     * @param param0 __namedParameters Object
     * @param buy The buy order to validate
     * @param sell The sell order to validate
     * @param accountAddress Address for the user's wallet
     * @param shouldValidateBuy Whether to validate the buy order individually.
     * @param shouldValidateSell Whether to validate the sell order individually.
     * @param retries How many times to retry if validation fails
     */
    OpenSeaPort.prototype._validateMatch = function (_b, retries) {
        var buy = _b.buy, sell = _b.sell, accountAddress = _b.accountAddress, _c = _b.shouldValidateBuy, shouldValidateBuy = _c === void 0 ? false : _c, _d = _b.shouldValidateSell, shouldValidateSell = _d === void 0 ? false : _d;
        if (retries === void 0) { retries = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var buyValid, sellValid, canMatch, calldataCanMatch, error_12;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 7, , 10]);
                        if (!shouldValidateBuy) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._validateOrder(buy)];
                    case 1:
                        buyValid = _e.sent();
                        this.logger("Buy order is valid: ".concat(buyValid));
                        if (!buyValid) {
                            throw new Error("Invalid buy order. It may have recently been removed. Please refresh the page and try again!");
                        }
                        _e.label = 2;
                    case 2:
                        if (!shouldValidateSell) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._validateOrder(sell)];
                    case 3:
                        sellValid = _e.sent();
                        this.logger("Sell order is valid: ".concat(sellValid));
                        if (!sellValid) {
                            throw new Error("Invalid sell order. It may have recently been removed. Please refresh the page and try again!");
                        }
                        _e.label = 4;
                    case 4: return [4 /*yield*/, (0, debugging_1.requireOrdersCanMatch)(this._getClientsForRead({
                            retries: retries,
                        }).wyvernProtocol, { buy: buy, sell: sell, accountAddress: accountAddress })];
                    case 5:
                        canMatch = _e.sent();
                        this.logger("Orders matching: ".concat(canMatch));
                        return [4 /*yield*/, (0, debugging_1.requireOrderCalldataCanMatch)(this._getClientsForRead({
                                retries: retries,
                            }).wyvernProtocol, { buy: buy, sell: sell })];
                    case 6:
                        calldataCanMatch = _e.sent();
                        this.logger("Order calldata matching: ".concat(calldataCanMatch));
                        return [2 /*return*/, true];
                    case 7:
                        error_12 = _e.sent();
                        if (retries <= 0) {
                            throw new Error("Error matching this listing: ".concat(error_12 instanceof Error ? error_12.message : "", ". Please contact the maker or try again later!"));
                        }
                        return [4 /*yield*/, (0, utils_1.delay)(500)];
                    case 8:
                        _e.sent();
                        return [4 /*yield*/, this._validateMatch({ buy: buy, sell: sell, accountAddress: accountAddress, shouldValidateBuy: shouldValidateBuy, shouldValidateSell: shouldValidateSell }, retries - 1)];
                    case 9: return [2 /*return*/, _e.sent()];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    // For creating email whitelists on order takers
    OpenSeaPort.prototype._createEmailWhitelistEntry = function (_b) {
        var order = _b.order, buyerEmail = _b.buyerEmail;
        return __awaiter(this, void 0, void 0, function () {
            var asset;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        asset = "asset" in order.metadata ? order.metadata.asset : undefined;
                        if (!asset || !asset.id) {
                            throw new Error("Whitelisting only available for non-fungible assets.");
                        }
                        return [4 /*yield*/, this.api.postAssetWhitelist(asset.address, asset.id, buyerEmail)];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Throws
    OpenSeaPort.prototype._sellOrderValidationAndApprovals = function (_b) {
        var _c;
        var order = _b.order, accountAddress = _b.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var wyAssets, schemaNames, tokenAddress, minimumAmount, tokenTransferProxyAddress, sellValid;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        wyAssets = "bundle" in order.metadata
                            ? order.metadata.bundle.assets
                            : order.metadata.asset
                                ? [order.metadata.asset]
                                : [];
                        schemaNames = "bundle" in order.metadata && "schemas" in order.metadata.bundle
                            ? order.metadata.bundle.schemas
                            : "schema" in order.metadata
                                ? [order.metadata.schema]
                                : [];
                        tokenAddress = order.paymentToken;
                        return [4 /*yield*/, this._approveAll({
                                schemaNames: schemaNames,
                                wyAssets: wyAssets,
                                accountAddress: accountAddress,
                            })];
                    case 1:
                        _d.sent();
                        if (!(tokenAddress != constants_1.NULL_ADDRESS)) return [3 /*break*/, 3];
                        minimumAmount = (0, utils_1.makeBigNumber)(order.basePrice);
                        tokenTransferProxyAddress = ((_c = this._wyvernConfigOverride) === null || _c === void 0 ? void 0 : _c.wyvernTokenTransferProxyContractAddress) ||
                            wyvern_js_1.WyvernProtocol.getTokenTransferProxyAddress(this._networkName);
                        return [4 /*yield*/, this.approveFungibleToken({
                                accountAddress: accountAddress,
                                tokenAddress: tokenAddress,
                                minimumAmount: minimumAmount,
                                proxyAddress: tokenTransferProxyAddress,
                            })];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3: return [4 /*yield*/, this._wyvernProtocol.wyvernExchange
                            .validateOrderParameters_([
                            order.exchange,
                            order.maker,
                            order.taker,
                            order.feeRecipient,
                            order.target,
                            order.staticTarget,
                            order.paymentToken,
                        ], [
                            order.makerRelayerFee,
                            order.takerRelayerFee,
                            order.makerProtocolFee,
                            order.takerProtocolFee,
                            order.basePrice,
                            order.extra,
                            order.listingTime,
                            order.expirationTime,
                            order.salt,
                        ], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata)
                            .callAsync({ from: accountAddress })];
                    case 4:
                        sellValid = _d.sent();
                        if (!sellValid) {
                            console.error(order);
                            throw new Error("Failed to validate sell order parameters. Make sure you're on the right network!");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Instead of signing an off-chain order, you can approve an order
     * with on on-chain transaction using this method
     * @param order Order to approve
     * @returns Transaction hash of the approval transaction
     */
    OpenSeaPort.prototype.approveOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var accountAddress, includeInOrderBook, transactionHash;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        accountAddress = order.maker;
                        includeInOrderBook = true;
                        this._dispatch(types_1.EventType.ApproveOrder, { order: order, accountAddress: accountAddress });
                        return [4 /*yield*/, this._wyvernProtocol.wyvernExchange
                                .approveOrder_([
                                order.exchange,
                                order.maker,
                                order.taker,
                                order.feeRecipient,
                                order.target,
                                order.staticTarget,
                                order.paymentToken,
                            ], [
                                order.makerRelayerFee,
                                order.takerRelayerFee,
                                order.makerProtocolFee,
                                order.takerProtocolFee,
                                order.basePrice,
                                order.extra,
                                order.listingTime,
                                order.expirationTime,
                                order.salt,
                            ], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, includeInOrderBook)
                                .sendTransactionAsync({ from: accountAddress })];
                    case 1:
                        transactionHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(transactionHash.toString(), types_1.EventType.ApproveOrder, "Approving order", function () { return __awaiter(_this, void 0, void 0, function () {
                                var isApproved;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, this._validateOrder(order)];
                                        case 1:
                                            isApproved = _b.sent();
                                            return [2 /*return*/, isApproved];
                                    }
                                });
                            }); })];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, transactionHash];
                }
            });
        });
    };
    OpenSeaPort.prototype._validateOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var isValid;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._wyvernProtocolReadOnly.wyvernExchange
                            .validateOrder_([
                            order.exchange,
                            order.maker,
                            order.taker,
                            order.feeRecipient,
                            order.target,
                            order.staticTarget,
                            order.paymentToken,
                        ], [
                            order.makerRelayerFee,
                            order.takerRelayerFee,
                            order.makerProtocolFee,
                            order.takerProtocolFee,
                            order.basePrice,
                            order.extra,
                            order.listingTime,
                            order.expirationTime,
                            order.salt,
                        ], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, order.v || 0, order.r || constants_1.NULL_BLOCK_HASH, order.s || constants_1.NULL_BLOCK_HASH)
                            .callAsync()];
                    case 1:
                        isValid = _b.sent();
                        return [2 /*return*/, isValid];
                }
            });
        });
    };
    OpenSeaPort.prototype._approveAll = function (_b) {
        var schemaNames = _b.schemaNames, wyAssets = _b.wyAssets, accountAddress = _b.accountAddress, proxyAddress = _b.proxyAddress;
        return __awaiter(this, void 0, void 0, function () {
            var _c, contractsWithApproveAll;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _c = proxyAddress;
                        if (_c) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._getProxy(accountAddress, 0)];
                    case 1:
                        _c = (_d.sent());
                        _d.label = 2;
                    case 2:
                        proxyAddress =
                            _c || undefined;
                        if (!!proxyAddress) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._initializeProxy(accountAddress)];
                    case 3:
                        proxyAddress = _d.sent();
                        _d.label = 4;
                    case 4:
                        contractsWithApproveAll = new Set();
                        return [2 /*return*/, Promise.all(wyAssets.map(function (wyAsset, i) { return __awaiter(_this, void 0, void 0, function () {
                                var schemaName, isOwner, error_13, minAmount, _b, wyNFTAsset, wyFTAsset;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            schemaName = schemaNames[i];
                                            _c.label = 1;
                                        case 1:
                                            _c.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, this._ownsAssetOnChain({
                                                    accountAddress: accountAddress,
                                                    proxyAddress: proxyAddress,
                                                    wyAsset: wyAsset,
                                                    schemaName: schemaName,
                                                })];
                                        case 2:
                                            isOwner = _c.sent();
                                            return [3 /*break*/, 4];
                                        case 3:
                                            error_13 = _c.sent();
                                            // let it through for assets we don't support yet
                                            isOwner = true;
                                            return [3 /*break*/, 4];
                                        case 4:
                                            if (!isOwner) {
                                                minAmount = "quantity" in wyAsset ? wyAsset.quantity : 1;
                                                console.error("Failed on-chain ownership check: ".concat(accountAddress, " on ").concat(schemaName, ":"), wyAsset);
                                                throw new Error("You don't own enough to do that (".concat(minAmount, " base units of ").concat(wyAsset.address).concat(wyAsset.id ? " token " + wyAsset.id : "", ")"));
                                            }
                                            _b = schemaName;
                                            switch (_b) {
                                                case types_1.WyvernSchemaName.ERC721: return [3 /*break*/, 5];
                                                case types_1.WyvernSchemaName.ERC721v3: return [3 /*break*/, 5];
                                                case types_1.WyvernSchemaName.ERC1155: return [3 /*break*/, 5];
                                                case types_1.WyvernSchemaName.LegacyEnjin: return [3 /*break*/, 5];
                                                case types_1.WyvernSchemaName.ENSShortNameAuction: return [3 /*break*/, 5];
                                                case types_1.WyvernSchemaName.ERC20: return [3 /*break*/, 7];
                                            }
                                            return [3 /*break*/, 9];
                                        case 5:
                                            wyNFTAsset = wyAsset;
                                            return [4 /*yield*/, this.approveSemiOrNonFungibleToken({
                                                    tokenId: wyNFTAsset.id.toString(),
                                                    tokenAddress: wyNFTAsset.address,
                                                    accountAddress: accountAddress,
                                                    proxyAddress: proxyAddress,
                                                    schemaName: schemaName,
                                                    skipApproveAllIfTokenAddressIn: contractsWithApproveAll,
                                                })];
                                        case 6: return [2 /*return*/, _c.sent()];
                                        case 7:
                                            wyFTAsset = wyAsset;
                                            if (contractsWithApproveAll.has(wyFTAsset.address)) {
                                                // Return null to indicate no tx occurred
                                                return [2 /*return*/, null];
                                            }
                                            contractsWithApproveAll.add(wyFTAsset.address);
                                            return [4 /*yield*/, this.approveFungibleToken({
                                                    tokenAddress: wyFTAsset.address,
                                                    accountAddress: accountAddress,
                                                    proxyAddress: proxyAddress,
                                                })];
                                        case 8: return [2 /*return*/, _c.sent()];
                                        case 9: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                }
            });
        });
    };
    // Throws
    OpenSeaPort.prototype._buyOrderValidationAndApprovals = function (_b) {
        var _c;
        var order = _b.order, counterOrder = _b.counterOrder, accountAddress = _b.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var tokenAddress, minimumAmount, buyValid;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        tokenAddress = order.paymentToken;
                        if (!(tokenAddress != constants_1.NULL_ADDRESS)) return [3 /*break*/, 4];
                        minimumAmount = (0, utils_1.makeBigNumber)(order.basePrice);
                        if (!counterOrder) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._getRequiredAmountForTakingSellOrder(counterOrder)];
                    case 1:
                        minimumAmount = _d.sent();
                        _d.label = 2;
                    case 2: 
                    // Check token approval
                    // This can be done at a higher level to show UI
                    return [4 /*yield*/, this.approveFungibleToken({
                            accountAddress: accountAddress,
                            tokenAddress: tokenAddress,
                            minimumAmount: minimumAmount,
                            proxyAddress: ((_c = this._wyvernConfigOverride) === null || _c === void 0 ? void 0 : _c.wyvernTokenTransferProxyContractAddress) ||
                                wyvern_js_1.WyvernProtocol.getTokenTransferProxyAddress(this._networkName),
                        })];
                    case 3:
                        // Check token approval
                        // This can be done at a higher level to show UI
                        _d.sent();
                        _d.label = 4;
                    case 4: return [4 /*yield*/, this._wyvernProtocolReadOnly.wyvernExchange
                            .validateOrderParameters_([
                            order.exchange,
                            order.maker,
                            order.taker,
                            order.feeRecipient,
                            order.target,
                            order.staticTarget,
                            order.paymentToken,
                        ], [
                            order.makerRelayerFee,
                            order.takerRelayerFee,
                            order.makerProtocolFee,
                            order.takerProtocolFee,
                            order.basePrice,
                            order.extra,
                            order.listingTime,
                            order.expirationTime,
                            order.salt,
                        ], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata)
                            .callAsync({ from: accountAddress })];
                    case 5:
                        buyValid = _d.sent();
                        if (!buyValid) {
                            console.error(order);
                            throw new Error("Failed to validate buy order parameters. Make sure you're on the right network!");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if an account, or its proxy, owns an asset on-chain
     * @param accountAddress Account address for the wallet
     * @param proxyAddress Proxy address for the account
     * @param wyAsset asset to check. If fungible, the `quantity` attribute will be the minimum amount to own
     * @param schemaName WyvernSchemaName for the asset
     */
    OpenSeaPort.prototype._ownsAssetOnChain = function (_b) {
        var accountAddress = _b.accountAddress, proxyAddress = _b.proxyAddress, wyAsset = _b.wyAsset, schemaName = _b.schemaName;
        return __awaiter(this, void 0, void 0, function () {
            var asset, minAmount, accountBalance, _c, proxyBalance;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        asset = {
                            tokenId: wyAsset.id || null,
                            tokenAddress: wyAsset.address,
                            schemaName: schemaName,
                        };
                        minAmount = new bignumber_js_1.BigNumber("quantity" in wyAsset ? wyAsset.quantity : 1);
                        return [4 /*yield*/, this.getAssetBalance({
                                accountAddress: accountAddress,
                                asset: asset,
                            })];
                    case 1:
                        accountBalance = _d.sent();
                        if (accountBalance.isGreaterThanOrEqualTo(minAmount)) {
                            return [2 /*return*/, true];
                        }
                        _c = proxyAddress;
                        if (_c) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._getProxy(accountAddress)];
                    case 2:
                        _c = (_d.sent());
                        _d.label = 3;
                    case 3:
                        proxyAddress = _c;
                        if (!proxyAddress) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getAssetBalance({
                                accountAddress: proxyAddress,
                                asset: asset,
                            })];
                    case 4:
                        proxyBalance = _d.sent();
                        if (proxyBalance.isGreaterThanOrEqualTo(minAmount)) {
                            return [2 /*return*/, true];
                        }
                        _d.label = 5;
                    case 5: return [2 /*return*/, false];
                }
            });
        });
    };
    OpenSeaPort.prototype._getBuyFeeParameters = function (totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, sellOrder) {
        this._validateFees(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints);
        var makerRelayerFee;
        var takerRelayerFee;
        if (sellOrder) {
            // Use the sell order's fees to ensure compatiblity and force the order
            // to only be acceptable by the sell order maker.
            // Swap maker/taker depending on whether it's an English auction (taker)
            // TODO add extraBountyBasisPoints when making bidder bounties
            makerRelayerFee = sellOrder.waitingForBestCounterOrder
                ? (0, utils_1.makeBigNumber)(sellOrder.makerRelayerFee)
                : (0, utils_1.makeBigNumber)(sellOrder.takerRelayerFee);
            takerRelayerFee = sellOrder.waitingForBestCounterOrder
                ? (0, utils_1.makeBigNumber)(sellOrder.takerRelayerFee)
                : (0, utils_1.makeBigNumber)(sellOrder.makerRelayerFee);
        }
        else {
            makerRelayerFee = (0, utils_1.makeBigNumber)(totalBuyerFeeBasisPoints);
            takerRelayerFee = (0, utils_1.makeBigNumber)(totalSellerFeeBasisPoints);
        }
        return {
            makerRelayerFee: makerRelayerFee,
            takerRelayerFee: takerRelayerFee,
            makerProtocolFee: (0, utils_1.makeBigNumber)(0),
            takerProtocolFee: (0, utils_1.makeBigNumber)(0),
            makerReferrerFee: (0, utils_1.makeBigNumber)(0),
            feeRecipient: constants_1.OPENSEA_FEE_RECIPIENT,
            feeMethod: types_1.FeeMethod.SplitFee,
        };
    };
    OpenSeaPort.prototype._getSellFeeParameters = function (totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, waitForHighestBid, sellerBountyBasisPoints) {
        if (sellerBountyBasisPoints === void 0) { sellerBountyBasisPoints = 0; }
        this._validateFees(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints);
        // Use buyer as the maker when it's an English auction, so Wyvern sets prices correctly
        var feeRecipient = waitForHighestBid
            ? constants_1.NULL_ADDRESS
            : constants_1.OPENSEA_FEE_RECIPIENT;
        // Swap maker/taker fees when it's an English auction,
        // since these sell orders are takers not makers
        var makerRelayerFee = waitForHighestBid
            ? (0, utils_1.makeBigNumber)(totalBuyerFeeBasisPoints)
            : (0, utils_1.makeBigNumber)(totalSellerFeeBasisPoints);
        var takerRelayerFee = waitForHighestBid
            ? (0, utils_1.makeBigNumber)(totalSellerFeeBasisPoints)
            : (0, utils_1.makeBigNumber)(totalBuyerFeeBasisPoints);
        return {
            makerRelayerFee: makerRelayerFee,
            takerRelayerFee: takerRelayerFee,
            makerProtocolFee: (0, utils_1.makeBigNumber)(0),
            takerProtocolFee: (0, utils_1.makeBigNumber)(0),
            makerReferrerFee: (0, utils_1.makeBigNumber)(sellerBountyBasisPoints),
            feeRecipient: feeRecipient,
            feeMethod: types_1.FeeMethod.SplitFee,
        };
    };
    /**
     * Validate fee parameters
     * @param totalBuyerFeeBasisPoints Total buyer fees
     * @param totalSellerFeeBasisPoints Total seller fees
     */
    OpenSeaPort.prototype._validateFees = function (totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints) {
        var maxFeePercent = constants_1.INVERSE_BASIS_POINT / 100;
        if (totalBuyerFeeBasisPoints > constants_1.INVERSE_BASIS_POINT ||
            totalSellerFeeBasisPoints > constants_1.INVERSE_BASIS_POINT) {
            throw new Error("Invalid buyer/seller fees: must be less than ".concat(maxFeePercent, "%"));
        }
        if (totalBuyerFeeBasisPoints < 0 || totalSellerFeeBasisPoints < 0) {
            throw new Error("Invalid buyer/seller fees: must be at least 0%");
        }
    };
    /**
     * Get the listing and expiration time parameters for a new order
     * @param expirationTimestamp Timestamp to expire the order (in seconds), or 0 for non-expiring
     * @param listingTimestamp Timestamp to start the order (in seconds), or undefined to start it now
     * @param waitingForBestCounterOrder Whether this order should be hidden until the best match is found
     */
    OpenSeaPort.prototype._getTimeParameters = function (_b) {
        var _c = _b.expirationTimestamp, expirationTimestamp = _c === void 0 ? (0, utils_1.getMaxOrderExpirationTimestamp)() : _c, listingTimestamp = _b.listingTimestamp, _d = _b.waitingForBestCounterOrder, waitingForBestCounterOrder = _d === void 0 ? false : _d, _e = _b.isMatchingOrder, isMatchingOrder = _e === void 0 ? false : _e;
        var maxExpirationDate = new Date();
        maxExpirationDate.setMonth(maxExpirationDate.getMonth() + constants_1.MAX_EXPIRATION_MONTHS);
        var maxExpirationTimeStamp = Math.round(maxExpirationDate.getTime() / 1000);
        var minListingTimestamp = Math.round(Date.now() / 1000);
        if (!isMatchingOrder && expirationTimestamp === 0) {
            throw new Error("Expiration time cannot be 0");
        }
        if (listingTimestamp && listingTimestamp < minListingTimestamp) {
            throw new Error("Listing time cannot be in the past.");
        }
        if (listingTimestamp && listingTimestamp >= expirationTimestamp) {
            throw new Error("Listing time must be before the expiration time.");
        }
        if (waitingForBestCounterOrder && listingTimestamp) {
            throw new Error("Cannot schedule an English auction for the future.");
        }
        if (parseInt(expirationTimestamp.toString()) != expirationTimestamp) {
            throw new Error("Expiration timestamp must be a whole number of seconds");
        }
        if (expirationTimestamp > maxExpirationTimeStamp) {
            throw new Error("Expiration time must not exceed six months from now");
        }
        if (waitingForBestCounterOrder) {
            listingTimestamp = expirationTimestamp;
            // Expire one week from now, to ensure server can match it
            // Later, this will expire closer to the listingTime
            expirationTimestamp =
                expirationTimestamp + constants_1.ORDER_MATCHING_LATENCY_SECONDS;
            // The minimum expiration time has to be at least fifteen minutes from now
            var minEnglishAuctionListingTimestamp = minListingTimestamp + constants_1.MIN_EXPIRATION_MINUTES * 60;
            if (!isMatchingOrder &&
                listingTimestamp < minEnglishAuctionListingTimestamp) {
                throw new Error("Expiration time must be at least ".concat(constants_1.MIN_EXPIRATION_MINUTES, " minutes from now"));
            }
        }
        else {
            // Small offset to account for latency
            listingTimestamp =
                listingTimestamp || Math.round(Date.now() / 1000 - 100);
            // The minimum expiration time has to be at least fifteen minutes from now
            var minExpirationTimestamp = listingTimestamp + constants_1.MIN_EXPIRATION_MINUTES * 60;
            if (!isMatchingOrder && expirationTimestamp < minExpirationTimestamp) {
                throw new Error("Expiration time must be at least ".concat(constants_1.MIN_EXPIRATION_MINUTES, " minutes from the listing date"));
            }
        }
        return {
            listingTime: (0, utils_1.makeBigNumber)(listingTimestamp),
            expirationTime: (0, utils_1.makeBigNumber)(expirationTimestamp),
        };
    };
    /**
     * Compute the `basePrice` and `extra` parameters to be used to price an order.
     * Also validates the expiration time and auction type.
     * @param tokenAddress Address of the ERC-20 token to use for trading.
     * Use the null address for ETH
     * @param expirationTime When the auction expires, or 0 if never.
     * @param startAmount The base value for the order, in the token's main units (e.g. ETH instead of wei)
     * @param endAmount The end value for the order, in the token's main units (e.g. ETH instead of wei). If unspecified, the order's `extra` attribute will be 0
     */
    OpenSeaPort.prototype._getPriceParameters = function (orderSide, tokenAddress, expirationTime, startAmount, endAmount, waitingForBestCounterOrder, englishAuctionReservePrice) {
        if (waitingForBestCounterOrder === void 0) { waitingForBestCounterOrder = false; }
        return __awaiter(this, void 0, void 0, function () {
            var priceDiff, paymentToken, isEther, tokens, token, basePrice, extra, reservePrice;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        priceDiff = endAmount != null ? startAmount - endAmount : 0;
                        paymentToken = tokenAddress.toLowerCase();
                        isEther = tokenAddress == constants_1.NULL_ADDRESS;
                        return [4 /*yield*/, this.api.getPaymentTokens({
                                address: paymentToken,
                            })];
                    case 1:
                        tokens = (_b.sent()).tokens;
                        token = tokens[0];
                        // Validation
                        if (isNaN(startAmount) || startAmount == null || startAmount < 0) {
                            throw new Error("Starting price must be a number >= 0");
                        }
                        if (!isEther && !token) {
                            throw new Error("No ERC-20 token found for '".concat(paymentToken, "'"));
                        }
                        if (isEther && waitingForBestCounterOrder) {
                            throw new Error("English auctions must use wrapped ETH or an ERC-20 token.");
                        }
                        if (isEther && orderSide === types_1.OrderSide.Buy) {
                            throw new Error("Offers must use wrapped ETH or an ERC-20 token.");
                        }
                        if (priceDiff < 0) {
                            throw new Error("End price must be less than or equal to the start price.");
                        }
                        if (priceDiff > 0 && expirationTime == 0) {
                            throw new Error("Expiration time must be set if order will change in price.");
                        }
                        if (englishAuctionReservePrice && !waitingForBestCounterOrder) {
                            throw new Error("Reserve prices may only be set on English auctions.");
                        }
                        if (englishAuctionReservePrice &&
                            englishAuctionReservePrice < startAmount) {
                            throw new Error("Reserve price must be greater than or equal to the start amount.");
                        }
                        basePrice = isEther
                            ? (0, utils_1.makeBigNumber)(this.web3.utils.toWei(startAmount.toString(), "ether")).integerValue()
                            : wyvern_js_1.WyvernProtocol.toBaseUnitAmount((0, utils_1.makeBigNumber)(startAmount), token.decimals);
                        extra = isEther
                            ? (0, utils_1.makeBigNumber)(this.web3.utils.toWei(priceDiff.toString(), "ether")).integerValue()
                            : wyvern_js_1.WyvernProtocol.toBaseUnitAmount((0, utils_1.makeBigNumber)(priceDiff), token.decimals);
                        reservePrice = englishAuctionReservePrice
                            ? isEther
                                ? (0, utils_1.makeBigNumber)(this.web3.utils.toWei(englishAuctionReservePrice.toString(), "ether")).integerValue()
                                : wyvern_js_1.WyvernProtocol.toBaseUnitAmount((0, utils_1.makeBigNumber)(englishAuctionReservePrice), token.decimals)
                            : undefined;
                        return [2 /*return*/, { basePrice: basePrice, extra: extra, paymentToken: paymentToken, reservePrice: reservePrice }];
                }
            });
        });
    };
    OpenSeaPort.prototype._getMetadata = function (order, referrerAddress) {
        var referrer = referrerAddress || order.metadata.referrerAddress;
        if (referrer && (0, ethereumjs_util_1.isValidAddress)(referrer)) {
            return referrer;
        }
        return undefined;
    };
    OpenSeaPort.prototype._atomicMatch = function (_b) {
        var buy = _b.buy, sell = _b.sell, accountAddress = _b.accountAddress, _c = _b.metadata, metadata = _c === void 0 ? constants_1.NULL_BLOCK_HASH : _c;
        return __awaiter(this, void 0, void 0, function () {
            var value, shouldValidateBuy, shouldValidateSell, txHash, txnData, args, gasEstimate, error_14, error_15;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        shouldValidateBuy = true;
                        shouldValidateSell = true;
                        if (!(sell.maker.toLowerCase() == accountAddress.toLowerCase())) return [3 /*break*/, 2];
                        // USER IS THE SELLER, only validate the buy order
                        return [4 /*yield*/, this._sellOrderValidationAndApprovals({
                                order: sell,
                                accountAddress: accountAddress,
                            })];
                    case 1:
                        // USER IS THE SELLER, only validate the buy order
                        _d.sent();
                        shouldValidateSell = false;
                        return [3 /*break*/, 6];
                    case 2:
                        if (!(buy.maker.toLowerCase() == accountAddress.toLowerCase())) return [3 /*break*/, 6];
                        // USER IS THE BUYER, only validate the sell order
                        return [4 /*yield*/, this._buyOrderValidationAndApprovals({
                                order: buy,
                                counterOrder: sell,
                                accountAddress: accountAddress,
                            })];
                    case 3:
                        // USER IS THE BUYER, only validate the sell order
                        _d.sent();
                        shouldValidateBuy = false;
                        if (!(buy.paymentToken == constants_1.NULL_ADDRESS)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._getRequiredAmountForTakingSellOrder(sell)];
                    case 4:
                        value = _d.sent();
                        _d.label = 5;
                    case 5: return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, this._validateMatch({
                            buy: buy,
                            sell: sell,
                            accountAddress: accountAddress,
                            shouldValidateBuy: shouldValidateBuy,
                            shouldValidateSell: shouldValidateSell,
                        })];
                    case 7:
                        _d.sent();
                        this._dispatch(types_1.EventType.MatchOrders, {
                            buy: buy,
                            sell: sell,
                            accountAddress: accountAddress,
                            matchMetadata: metadata,
                        });
                        txnData = { from: accountAddress, value: value };
                        args = [
                            [
                                buy.exchange,
                                buy.maker,
                                buy.taker,
                                buy.feeRecipient,
                                buy.target,
                                buy.staticTarget,
                                buy.paymentToken,
                                sell.exchange,
                                sell.maker,
                                sell.taker,
                                sell.feeRecipient,
                                sell.target,
                                sell.staticTarget,
                                sell.paymentToken,
                            ],
                            [
                                buy.makerRelayerFee,
                                buy.takerRelayerFee,
                                buy.makerProtocolFee,
                                buy.takerProtocolFee,
                                buy.basePrice,
                                buy.extra,
                                buy.listingTime,
                                buy.expirationTime,
                                buy.salt,
                                sell.makerRelayerFee,
                                sell.takerRelayerFee,
                                sell.makerProtocolFee,
                                sell.takerProtocolFee,
                                sell.basePrice,
                                sell.extra,
                                sell.listingTime,
                                sell.expirationTime,
                                sell.salt,
                            ],
                            [
                                buy.feeMethod,
                                buy.side,
                                buy.saleKind,
                                buy.howToCall,
                                sell.feeMethod,
                                sell.side,
                                sell.saleKind,
                                sell.howToCall,
                            ],
                            buy.calldata,
                            sell.calldata,
                            buy.replacementPattern,
                            sell.replacementPattern,
                            buy.staticExtradata,
                            sell.staticExtradata,
                            [buy.v || 0, sell.v || 0],
                            [
                                buy.r || constants_1.NULL_BLOCK_HASH,
                                buy.s || constants_1.NULL_BLOCK_HASH,
                                sell.r || constants_1.NULL_BLOCK_HASH,
                                sell.s || constants_1.NULL_BLOCK_HASH,
                                metadata,
                            ],
                        ];
                        _d.label = 8;
                    case 8:
                        _d.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this._wyvernProtocolReadOnly.wyvernExchange
                                .atomicMatch_(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10])
                                .estimateGasAsync(txnData)];
                    case 9:
                        gasEstimate = _d.sent();
                        txnData.gas = this._correctGasAmount(gasEstimate);
                        return [3 /*break*/, 11];
                    case 10:
                        error_14 = _d.sent();
                        console.error("Failed atomic match with args: ", args, error_14);
                        throw new Error("Oops, the Ethereum network rejected this transaction :( The OpenSea devs have been alerted, but this problem is typically due an item being locked or untransferrable. The exact error was \"".concat(error_14 instanceof Error
                            ? error_14.message.substr(0, debugging_1.MAX_ERROR_LENGTH)
                            : "unknown", "...\""));
                    case 11:
                        _d.trys.push([11, 13, , 14]);
                        this.logger("Fulfilling order with gas set to ".concat(txnData.gas));
                        return [4 /*yield*/, this._wyvernProtocol.wyvernExchange
                                .atomicMatch_(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10])
                                .sendTransactionAsync(txnData)];
                    case 12:
                        txHash = _d.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        error_15 = _d.sent();
                        console.error(error_15);
                        this._dispatch(types_1.EventType.TransactionDenied, {
                            error: error_15,
                            buy: buy,
                            sell: sell,
                            accountAddress: accountAddress,
                            matchMetadata: metadata,
                        });
                        throw new Error("Failed to authorize transaction: \"".concat(error_15 instanceof Error && error_15.message
                            ? error_15.message
                            : "user denied", "...\""));
                    case 14: return [2 /*return*/, txHash];
                }
            });
        });
    };
    OpenSeaPort.prototype._getRequiredAmountForTakingSellOrder = function (sell) {
        return __awaiter(this, void 0, void 0, function () {
            var currentPrice, estimatedPrice, maxPrice, feePercentage, fee;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCurrentPrice(sell)];
                    case 1:
                        currentPrice = _b.sent();
                        estimatedPrice = (0, utils_1.estimateCurrentPrice)(sell);
                        maxPrice = bignumber_js_1.BigNumber.max(currentPrice, estimatedPrice);
                        // TODO Why is this not always a big number?
                        sell.takerRelayerFee = (0, utils_1.makeBigNumber)(sell.takerRelayerFee);
                        feePercentage = sell.takerRelayerFee.div(constants_1.INVERSE_BASIS_POINT);
                        fee = feePercentage.times(maxPrice);
                        return [2 /*return*/, fee.plus(maxPrice).integerValue(bignumber_js_1.BigNumber.ROUND_CEIL)];
                }
            });
        });
    };
    /**
     * Gets the current order nonce for an account
     * @param accountAddress account to check the nonce for
     * @returns nonce
     */
    OpenSeaPort.prototype.getNonce = function (accountAddress) {
        return this._wyvernProtocol.wyvernExchange
            .nonces(accountAddress)
            .callAsync();
    };
    /**
     * Generate the signature for authorizing an order
     * @param order Unsigned wyvern order
     * @returns order signature in the form of v, r, s, also an optional nonce
     */
    OpenSeaPort.prototype.authorizeOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var signerAddress, signerOrderNonce, orderForSigning, message, ecSignature, error_16;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        signerAddress = order.maker;
                        this._dispatch(types_1.EventType.CreateOrder, {
                            order: order,
                            accountAddress: order.maker,
                        });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.getNonce(signerAddress)];
                    case 2:
                        signerOrderNonce = _b.sent();
                        orderForSigning = {
                            maker: order.maker,
                            exchange: order.exchange,
                            taker: order.taker,
                            makerRelayerFee: order.makerRelayerFee.toString(),
                            takerRelayerFee: order.takerRelayerFee.toString(),
                            makerProtocolFee: order.makerProtocolFee.toString(),
                            takerProtocolFee: order.takerProtocolFee.toString(),
                            feeRecipient: order.feeRecipient,
                            feeMethod: order.feeMethod,
                            side: order.side,
                            saleKind: order.saleKind,
                            target: order.target,
                            howToCall: order.howToCall,
                            calldata: order.calldata,
                            replacementPattern: order.replacementPattern,
                            staticTarget: order.staticTarget,
                            staticExtradata: order.staticExtradata,
                            paymentToken: order.paymentToken,
                            basePrice: order.basePrice.toString(),
                            extra: order.extra.toString(),
                            listingTime: order.listingTime.toString(),
                            expirationTime: order.expirationTime.toString(),
                            salt: order.salt.toString(),
                        };
                        message = {
                            types: constants_1.EIP_712_ORDER_TYPES,
                            domain: {
                                name: constants_1.EIP_712_WYVERN_DOMAIN_NAME,
                                version: constants_1.EIP_712_WYVERN_DOMAIN_VERSION,
                                chainId: this._networkName == types_1.Network.Main ? 1 : 4,
                                verifyingContract: order.exchange,
                            },
                            primaryType: "Order",
                            message: __assign(__assign({}, orderForSigning), { nonce: signerOrderNonce.toNumber() }),
                        };
                        return [4 /*yield*/, (0, utils_1.signTypedDataAsync)(this.web3, message, signerAddress)];
                    case 3:
                        ecSignature = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, ecSignature), { nonce: signerOrderNonce.toNumber() })];
                    case 4:
                        error_16 = _b.sent();
                        this._dispatch(types_1.EventType.OrderDenied, {
                            order: order,
                            accountAddress: signerAddress,
                        });
                        throw error_16;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    OpenSeaPort.prototype._getSchemaName = function (asset) {
        if (asset.schemaName) {
            return asset.schemaName;
        }
        else if ("assetContract" in asset) {
            return asset.assetContract.schemaName;
        }
        return undefined;
    };
    OpenSeaPort.prototype._getSchema = function (schemaName) {
        var schemaName_ = schemaName || types_1.WyvernSchemaName.ERC721;
        var schema = WyvernSchemas.schemas[this._networkName].filter(function (s) { return s.name == schemaName_; })[0];
        if (!schema) {
            throw new Error("Trading for this asset (".concat(schemaName_, ") is not yet supported. Please contact us or check back later!"));
        }
        return schema;
    };
    OpenSeaPort.prototype._dispatch = function (event, data) {
        this._emitter.emit(event, data);
    };
    /**
     * Get the clients to use for a read call
     * @param retries current retry value
     * @param wyvernProtocol optional wyvern protocol to use, has default
     * @param wyvernProtocol optional readonly wyvern protocol to use, has default
     */
    OpenSeaPort.prototype._getClientsForRead = function (_b) {
        var retries = _b.retries;
        if (retries > 0) {
            // Use injected provider by default
            return {
                web3: this.web3,
                wyvernProtocol: this._wyvernProtocol,
            };
        }
        else {
            // Use provided provider as fallback
            return {
                web3: this.web3ReadOnly,
                wyvernProtocol: this._wyvernProtocolReadOnly,
            };
        }
    };
    OpenSeaPort.prototype._confirmTransaction = function (transactionHash, event, description, testForSuccess) {
        return __awaiter(this, void 0, void 0, function () {
            var transactionEventData, error_17;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transactionEventData = { transactionHash: transactionHash, event: event };
                        this.logger("Transaction started: ".concat(description));
                        if (!(transactionHash == constants_1.NULL_BLOCK_HASH)) return [3 /*break*/, 4];
                        // This was a smart contract wallet that doesn't know the transaction
                        this._dispatch(types_1.EventType.TransactionCreated, { event: event });
                        if (!!testForSuccess) return [3 /*break*/, 2];
                        // Wait if test not implemented
                        this.logger("Unknown action, waiting 1 minute: ".concat(description));
                        return [4 /*yield*/, (0, utils_1.delay)(60 * 1000)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, this._pollCallbackForConfirmation(event, description, testForSuccess)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        this._dispatch(types_1.EventType.TransactionCreated, transactionEventData);
                        return [4 /*yield*/, (0, utils_1.confirmTransaction)(this.web3, transactionHash)];
                    case 5:
                        _b.sent();
                        this.logger("Transaction succeeded: ".concat(description));
                        this._dispatch(types_1.EventType.TransactionConfirmed, transactionEventData);
                        return [3 /*break*/, 7];
                    case 6:
                        error_17 = _b.sent();
                        this.logger("Transaction failed: ".concat(description));
                        this._dispatch(types_1.EventType.TransactionFailed, __assign(__assign({}, transactionEventData), { error: error_17 }));
                        throw error_17;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    OpenSeaPort.prototype._pollCallbackForConfirmation = function (event, description, testForSuccess) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var initialRetries = 60;
                        var testResolve = function (retries) { return __awaiter(_this, void 0, void 0, function () {
                            var wasSuccessful;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, testForSuccess()];
                                    case 1:
                                        wasSuccessful = _b.sent();
                                        if (wasSuccessful) {
                                            this.logger("Transaction succeeded: ".concat(description));
                                            this._dispatch(types_1.EventType.TransactionConfirmed, { event: event });
                                            return [2 /*return*/, resolve()];
                                        }
                                        else if (retries <= 0) {
                                            return [2 /*return*/, reject()];
                                        }
                                        if (retries % 10 == 0) {
                                            this.logger("Tested transaction ".concat(initialRetries - retries + 1, " times: ").concat(description));
                                        }
                                        return [4 /*yield*/, (0, utils_1.delay)(5000)];
                                    case 2:
                                        _b.sent();
                                        return [2 /*return*/, testResolve(retries - 1)];
                                }
                            });
                        }); };
                        return testResolve(initialRetries);
                    })];
            });
        });
    };
    /**
     * Returns whether or not an authenticated proxy is revoked for a specific account address
     * @param accountAddress
     * @returns
     */
    OpenSeaPort.prototype.isAuthenticatedProxyRevoked = function (accountAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var proxy;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._wyvernProtocol.getAuthenticatedProxy(accountAddress)];
                    case 1:
                        proxy = _b.sent();
                        return [2 /*return*/, proxy.revoked().callAsync()];
                }
            });
        });
    };
    /**
     * Revokes an authenticated proxy's access i.e. for freezing listings
     * @param accountAddress
     * @returns transaction hash
     */
    OpenSeaPort.prototype.revokeAuthenticatedProxyAccess = function (accountAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var proxy;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._wyvernProtocol.getAuthenticatedProxy(accountAddress)];
                    case 1:
                        proxy = _b.sent();
                        return [2 /*return*/, proxy.setRevoke(true).sendTransactionAsync({ from: accountAddress })];
                }
            });
        });
    };
    /**
     * Unrevokes an authenticated proxy's access i.e. for unfreezing listings
     * @param accountAddress
     * @returns transaction hash
     */
    OpenSeaPort.prototype.unrevokeAuthenticatedProxyAccess = function (accountAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var proxy;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._wyvernProtocol.getAuthenticatedProxy(accountAddress)];
                    case 1:
                        proxy = _b.sent();
                        return [2 /*return*/, proxy.setRevoke(false).sendTransactionAsync({
                                from: accountAddress,
                            })];
                }
            });
        });
    };
    return OpenSeaPort;
}());
exports.OpenSeaPort = OpenSeaPort;
//# sourceMappingURL=seaport.js.map