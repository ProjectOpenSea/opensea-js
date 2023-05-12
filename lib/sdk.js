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
exports.OpenSeaSDK = void 0;
var seaport_js_1 = require("@opensea/seaport-js");
var bignumber_js_1 = require("bignumber.js");
var ethers_1 = require("ethers");
var fbemitter_1 = require("fbemitter");
var web3_1 = __importDefault(require("web3"));
var wyvern_js_1 = require("wyvern-js");
var api_1 = require("./api");
var constants_1 = require("./constants");
var contracts_1 = require("./contracts");
var privateListings_1 = require("./orders/privateListings");
var utils_1 = require("./orders/utils");
var types_1 = require("./types");
var schema_1 = require("./utils/schemas/schema");
var tokens_1 = require("./utils/tokens");
var utils_2 = require("./utils/utils");
var OpenSeaSDK = /** @class */ (function () {
    /**
     * Your very own seaport.
     * Create a new instance of OpenSeaJS.
     * @param provider Web3 Provider to use for transactions. For example:
     *  `const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')`
     * @param apiConfig configuration options, including `networkName`
     * @param logger logger, optional, a function that will be called with debugging
     * @param wallet optional, if you'd like to use an ethers wallet for order posting
     *  information
     */
    function OpenSeaSDK(provider, apiConfig, logger, wallet) {
        if (apiConfig === void 0) { apiConfig = {}; }
        var _a;
        // Extra gwei to add to the mean gas price when making transactions
        this.gasPriceAddition = new bignumber_js_1.BigNumber(3);
        // Multiply gas estimate by this factor when making transactions
        this.gasIncreaseFactor = constants_1.DEFAULT_GAS_INCREASE_FACTOR;
        this.getAmountWithBasisPointsApplied = function (amount, basisPoints) {
            return amount
                .multipliedBy(basisPoints)
                .dividedBy(constants_1.INVERSE_BASIS_POINT)
                .toString();
        };
        // API config
        apiConfig.networkName = apiConfig.networkName || types_1.Network.Main;
        this.api = new api_1.OpenSeaAPI(apiConfig);
        this._networkName = apiConfig.networkName;
        var readonlyProvider = new web3_1.default.providers.HttpProvider("".concat(this.api.apiBaseUrl, "/").concat(constants_1.RPC_URL_PATH));
        var useReadOnlyProvider = (_a = apiConfig.useReadOnlyProvider) !== null && _a !== void 0 ? _a : true;
        // Web3 Config
        this.web3 = new web3_1.default(provider);
        this.web3ReadOnly = useReadOnlyProvider
            ? new web3_1.default(readonlyProvider)
            : this.web3;
        // Ethers Config
        this.ethersProvider = new ethers_1.providers.Web3Provider(provider);
        var providerOrSinger = wallet ? wallet : this.ethersProvider;
        this.seaport_v1_4 = new seaport_js_1.Seaport(providerOrSinger, {
            conduitKeyToConduit: constants_1.CONDUIT_KEYS_TO_CONDUIT,
            overrides: {
                defaultConduitKey: constants_1.CROSS_CHAIN_DEFAULT_CONDUIT_KEY,
            },
            seaportVersion: "1.4",
        });
        this.seaport_v1_5 = new seaport_js_1.Seaport(providerOrSinger, {
            conduitKeyToConduit: constants_1.CONDUIT_KEYS_TO_CONDUIT,
            overrides: {
                defaultConduitKey: constants_1.CROSS_CHAIN_DEFAULT_CONDUIT_KEY,
            },
            seaportVersion: "1.5",
        });
        var networkForWyvernConfig = this._networkName;
        if (this._networkName == types_1.Network.Goerli) {
            networkForWyvernConfig = types_1.Network.Rinkeby;
        }
        // WyvernJS config
        this._wyvernProtocol = new wyvern_js_1.WyvernProtocol(provider, __assign({ network: networkForWyvernConfig }, apiConfig.wyvernConfig));
        // WyvernJS config for readonly (optimization for infura calls)
        this._wyvernProtocolReadOnly = useReadOnlyProvider
            ? new wyvern_js_1.WyvernProtocol(readonlyProvider, __assign({ network: networkForWyvernConfig }, apiConfig.wyvernConfig))
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
    OpenSeaSDK.prototype.addListener = function (event, listener, once) {
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
    OpenSeaSDK.prototype.removeListener = function (subscription) {
        subscription.remove();
    };
    /**
     * Remove all event listeners. Good idea to call this when you're unmounting
     * a component that listens to events to make UI updates
     * @param event Optional EventType to remove listeners for
     */
    OpenSeaSDK.prototype.removeAllListeners = function (event) {
        this._emitter.removeAllListeners(event);
    };
    /**
     * Wraps an arbitrary group of NFTs into their corresponding WrappedNFT ERC20 tokens.
     * Emits the `WrapAssets` event when the transaction is prompted.
     * @param param0 __namedParameters Object
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to bundle together.
     * @param accountAddress Address of the user's wallet
     */
    OpenSeaSDK.prototype.wrapAssets = function (_a) {
        var assets = _a.assets, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAssets, tokenIds, tokenAddresses, isMixedBatchOfAssets, txHash;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        schema = this._getSchema(types_1.WyvernSchemaName.ERC721);
                        wyAssets = assets.map(function (a) { return (0, utils_2.getWyvernAsset)(schema, a); });
                        tokenIds = wyAssets.map(function (a) { return a.id; });
                        tokenAddresses = wyAssets.map(function (a) { return a.address; });
                        isMixedBatchOfAssets = !tokenAddresses.every(function (val, _i, arr) { return val === arr[0]; });
                        this._dispatch(types_1.EventType.WrapAssets, { assets: wyAssets, accountAddress: accountAddress });
                        return [4 /*yield*/, (0, utils_2.sendRawTransaction)(this.web3, {
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
                        txHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.WrapAssets, "Wrapping Assets")];
                    case 2:
                        _b.sent();
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
    OpenSeaSDK.prototype.unwrapAssets = function (_a) {
        var assets = _a.assets, destinationAddresses = _a.destinationAddresses, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAssets, tokenIds, tokenAddresses, isMixedBatchOfAssets, txHash;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!assets ||
                            !destinationAddresses ||
                            assets.length != destinationAddresses.length) {
                            throw new Error("The 'assets' and 'destinationAddresses' arrays must exist and have the same length.");
                        }
                        schema = this._getSchema(types_1.WyvernSchemaName.ERC721);
                        wyAssets = assets.map(function (a) { return (0, utils_2.getWyvernAsset)(schema, a); });
                        tokenIds = wyAssets.map(function (a) { return a.id; });
                        tokenAddresses = wyAssets.map(function (a) { return a.address; });
                        isMixedBatchOfAssets = !tokenAddresses.every(function (val, _i, arr) { return val === arr[0]; });
                        this._dispatch(types_1.EventType.UnwrapAssets, {
                            assets: wyAssets,
                            accountAddress: accountAddress,
                        });
                        return [4 /*yield*/, (0, utils_2.sendRawTransaction)(this.web3, {
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
                        txHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.UnwrapAssets, "Unwrapping Assets")];
                    case 2:
                        _b.sent();
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
    OpenSeaSDK.prototype.liquidateAssets = function (_a) {
        var assets = _a.assets, accountAddress = _a.accountAddress, uniswapSlippageAllowedInBasisPoints = _a.uniswapSlippageAllowedInBasisPoints;
        return __awaiter(this, void 0, void 0, function () {
            var uniswapSlippage, schema, wyAssets, tokenIds, tokenAddresses, isMixedBatchOfAssets, txHash;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        uniswapSlippage = uniswapSlippageAllowedInBasisPoints === 0
                            ? constants_1.DEFAULT_WRAPPED_NFT_LIQUIDATION_UNISWAP_SLIPPAGE_IN_BASIS_POINTS
                            : uniswapSlippageAllowedInBasisPoints;
                        schema = this._getSchema(types_1.WyvernSchemaName.ERC721);
                        wyAssets = assets.map(function (a) { return (0, utils_2.getWyvernAsset)(schema, a); });
                        tokenIds = wyAssets.map(function (a) { return a.id; });
                        tokenAddresses = wyAssets.map(function (a) { return a.address; });
                        isMixedBatchOfAssets = !tokenAddresses.every(function (val, _i, arr) { return val === arr[0]; });
                        this._dispatch(types_1.EventType.LiquidateAssets, {
                            assets: wyAssets,
                            accountAddress: accountAddress,
                        });
                        return [4 /*yield*/, (0, utils_2.sendRawTransaction)(this.web3, {
                                from: accountAddress,
                                to: this._wrappedNFTLiquidationProxyAddress,
                                value: 0,
                                data: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.WrappedNFTLiquidationProxy, "liquidateNFTs"), [tokenIds, tokenAddresses, isMixedBatchOfAssets, uniswapSlippage]),
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 1:
                        txHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.LiquidateAssets, "Liquidating Assets")];
                    case 2:
                        _b.sent();
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
    OpenSeaSDK.prototype.purchaseAssets = function (_a) {
        var numTokensToBuy = _a.numTokensToBuy, amount = _a.amount, contractAddress = _a.contractAddress, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var txHash;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._dispatch(types_1.EventType.PurchaseAssets, {
                            amount: amount,
                            contractAddress: contractAddress,
                            accountAddress: accountAddress,
                        });
                        return [4 /*yield*/, (0, utils_2.sendRawTransaction)(this.web3, {
                                from: accountAddress,
                                to: this._wrappedNFTLiquidationProxyAddress,
                                value: amount,
                                data: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.WrappedNFTLiquidationProxy, "purchaseNFTs"), [numTokensToBuy, contractAddress]),
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 1:
                        txHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.PurchaseAssets, "Purchasing Assets")];
                    case 2:
                        _b.sent();
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
    OpenSeaSDK.prototype.getQuoteFromUniswap = function (_a) {
        var numTokens = _a.numTokens, isBuying = _a.isBuying, contractAddress = _a.contractAddress;
        return __awaiter(this, void 0, void 0, function () {
            var wrappedNFTFactory, wrappedNFTAddress, wrappedNFT, uniswapFactory, uniswapExchangeAddress, uniswapExchange, amount, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        wrappedNFTFactory = new this.web3.eth.Contract(contracts_1.WrappedNFTFactory, this._wrappedNFTFactoryAddress);
                        return [4 /*yield*/, wrappedNFTFactory.methods
                                .nftContractToWrapperContract(contractAddress)
                                .call()];
                    case 1:
                        wrappedNFTAddress = _d.sent();
                        wrappedNFT = new this.web3.eth.Contract(contracts_1.WrappedNFT, wrappedNFTAddress);
                        uniswapFactory = new this.web3.eth.Contract(contracts_1.UniswapFactory, this._uniswapFactoryAddress);
                        return [4 /*yield*/, uniswapFactory.methods
                                .getExchange(wrappedNFTAddress)
                                .call()];
                    case 2:
                        uniswapExchangeAddress = _d.sent();
                        uniswapExchange = new this.web3.eth.Contract(contracts_1.UniswapExchange, uniswapExchangeAddress);
                        amount = (0, utils_2.toBaseUnitAmount)((0, utils_2.makeBigNumber)(numTokens), Number(wrappedNFT.methods.decimals().call()));
                        if (!isBuying) return [3 /*break*/, 4];
                        _b = parseInt;
                        return [4 /*yield*/, uniswapExchange.methods
                                .getEthToTokenOutputPrice(amount.toString())
                                .call()];
                    case 3: return [2 /*return*/, _b.apply(void 0, [_d.sent()])];
                    case 4:
                        _c = parseInt;
                        return [4 /*yield*/, uniswapExchange.methods
                                .getTokenToEthInputPrice(amount.toString())
                                .call()];
                    case 5: return [2 /*return*/, _c.apply(void 0, [_d.sent()])];
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
    OpenSeaSDK.prototype.wrapEth = function (_a) {
        var amountInEth = _a.amountInEth, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var token, amount, txHash;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        token = (0, tokens_1.getCanonicalWrappedEther)(this._networkName);
                        amount = (0, utils_2.toBaseUnitAmount)((0, utils_2.makeBigNumber)(amountInEth), token.decimals);
                        this._dispatch(types_1.EventType.WrapEth, { accountAddress: accountAddress, amount: amount });
                        return [4 /*yield*/, (0, utils_2.sendRawTransaction)(this.web3, {
                                from: accountAddress,
                                to: token.address,
                                value: amount,
                                data: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.CanonicalWETH, "deposit"), []),
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 1:
                        txHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.WrapEth, "Wrapping ETH")];
                    case 2:
                        _b.sent();
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
    OpenSeaSDK.prototype.unwrapWeth = function (_a) {
        var amountInEth = _a.amountInEth, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var token, amount, txHash;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        token = (0, tokens_1.getCanonicalWrappedEther)(this._networkName);
                        amount = (0, utils_2.toBaseUnitAmount)((0, utils_2.makeBigNumber)(amountInEth), token.decimals);
                        this._dispatch(types_1.EventType.UnwrapWeth, { accountAddress: accountAddress, amount: amount });
                        return [4 /*yield*/, (0, utils_2.sendRawTransaction)(this.web3, {
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
                        txHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.UnwrapWeth, "Unwrapping W-ETH")];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OpenSeaSDK.prototype.getFees = function (_a) {
        var _b, _c;
        var collection = _a.collection, paymentTokenAddress = _a.paymentTokenAddress, startAmount = _a.startAmount, endAmount = _a.endAmount;
        return __awaiter(this, void 0, void 0, function () {
            var osFees, creatorFees, openseaSellerFeeBasisPoints, collectionSellerFeeBasisPoints, sellerBasisPoints, getConsiderationItem, getConsiderationItemsFromFeeCategory;
            var _this = this;
            return __generator(this, function (_d) {
                osFees = (_b = collection.fees) === null || _b === void 0 ? void 0 : _b.openseaFees;
                creatorFees = (_c = collection.fees) === null || _c === void 0 ? void 0 : _c.sellerFees;
                openseaSellerFeeBasisPoints = (0, utils_2.feesToBasisPoints)(osFees);
                collectionSellerFeeBasisPoints = (0, utils_2.feesToBasisPoints)(creatorFees);
                sellerBasisPoints = constants_1.INVERSE_BASIS_POINT -
                    openseaSellerFeeBasisPoints -
                    collectionSellerFeeBasisPoints;
                getConsiderationItem = function (basisPoints, recipient) {
                    return {
                        token: paymentTokenAddress,
                        amount: _this.getAmountWithBasisPointsApplied(startAmount, basisPoints),
                        endAmount: _this.getAmountWithBasisPointsApplied(endAmount !== null && endAmount !== void 0 ? endAmount : startAmount, basisPoints),
                        recipient: recipient,
                    };
                };
                getConsiderationItemsFromFeeCategory = function (feeCategory) {
                    return Array.from(feeCategory.entries()).map(function (_a) {
                        var recipient = _a[0], basisPoints = _a[1];
                        return getConsiderationItem(basisPoints, recipient);
                    });
                };
                return [2 /*return*/, {
                        sellerFee: getConsiderationItem(sellerBasisPoints),
                        openseaSellerFees: openseaSellerFeeBasisPoints > 0 && collection.fees
                            ? getConsiderationItemsFromFeeCategory(osFees)
                            : [],
                        collectionSellerFees: collectionSellerFeeBasisPoints > 0 && collection.fees
                            ? getConsiderationItemsFromFeeCategory(creatorFees)
                            : [],
                    }];
            });
        });
    };
    OpenSeaSDK.prototype.getAssetItems = function (assets, quantities, fallbackSchema) {
        var _this = this;
        if (quantities === void 0) { quantities = []; }
        return assets.map(function (asset, index) {
            var _a, _b, _c;
            return ({
                itemType: (0, utils_2.getAssetItemType)((_a = _this._getSchemaName(asset)) !== null && _a !== void 0 ? _a : fallbackSchema),
                token: (0, utils_2.getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress)(asset.tokenAddress),
                identifier: (_b = asset.tokenId) !== null && _b !== void 0 ? _b : undefined,
                amount: (_c = quantities[index].toString()) !== null && _c !== void 0 ? _c : "1",
            });
        });
    };
    /**
     * Create a buy order to make an offer on an asset.
     * @param options Options for creating the buy order
     * @param options.asset The asset to trade
     * @param options.accountAddress Address of the maker's wallet
     * @param options.startAmount Value of the offer, in units of the payment token (or wrapped ETH if no payment token address specified)
     * @param options.quantity The number of assets to bid for (if fungible or semi-fungible). Defaults to 1. In units, not base units, e.g. not wei
     * @param options.domain An optional domain to be hashed and included in the first four bytes of the random salt.
     * @param options.salt Arbitrary salt. If not passed in, a random salt will be generated with the first four bytes being the domain hash or empty.
     * @param options.expirationTime Expiration time for the order, in seconds
     * @param options.paymentTokenAddress Optional address for using an ERC-20 token in the order. If unspecified, defaults to WETH
     */
    OpenSeaSDK.prototype.createBuyOrder = function (_a) {
        var _b;
        var asset = _a.asset, accountAddress = _a.accountAddress, startAmount = _a.startAmount, _c = _a.quantity, quantity = _c === void 0 ? 1 : _c, domain = _a.domain, salt = _a.salt, expirationTime = _a.expirationTime, paymentTokenAddress = _a.paymentTokenAddress;
        return __awaiter(this, void 0, void 0, function () {
            var openseaAsset, considerationAssetItems, basePrice, _d, openseaSellerFees, collectionSellerFees, considerationFeeItems, executeAllActions, order;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!asset.tokenId) {
                            throw new Error("Asset must have a tokenId");
                        }
                        paymentTokenAddress =
                            paymentTokenAddress !== null && paymentTokenAddress !== void 0 ? paymentTokenAddress : constants_1.WETH_ADDRESS_BY_NETWORK[this._networkName];
                        return [4 /*yield*/, this.api.getAsset(asset)];
                    case 1:
                        openseaAsset = _e.sent();
                        considerationAssetItems = this.getAssetItems([openseaAsset], [(0, utils_2.makeBigNumber)(quantity)]);
                        return [4 /*yield*/, this._getPriceParameters(types_1.OrderSide.Buy, paymentTokenAddress, (0, utils_2.makeBigNumber)(expirationTime !== null && expirationTime !== void 0 ? expirationTime : (0, utils_2.getMaxOrderExpirationTimestamp)()), (0, utils_2.makeBigNumber)(startAmount))];
                    case 2:
                        basePrice = (_e.sent()).basePrice;
                        return [4 /*yield*/, this.getFees({
                                collection: openseaAsset.collection,
                                paymentTokenAddress: paymentTokenAddress,
                                startAmount: basePrice,
                            })];
                    case 3:
                        _d = _e.sent(), openseaSellerFees = _d.openseaSellerFees, collectionSellerFees = _d.collectionSellerFees;
                        considerationFeeItems = __spreadArray(__spreadArray([], openseaSellerFees, true), collectionSellerFees, true);
                        return [4 /*yield*/, this.seaport_v1_5.createOrder({
                                offer: [
                                    {
                                        token: paymentTokenAddress,
                                        amount: basePrice.toString(),
                                    },
                                ],
                                consideration: __spreadArray(__spreadArray([], considerationAssetItems, true), considerationFeeItems, true),
                                endTime: (_b = expirationTime === null || expirationTime === void 0 ? void 0 : expirationTime.toString()) !== null && _b !== void 0 ? _b : (0, utils_2.getMaxOrderExpirationTimestamp)().toString(),
                                zone: constants_1.DEFAULT_ZONE_BY_NETWORK[this._networkName],
                                domain: domain,
                                salt: salt,
                                restrictedByZone: false,
                                allowPartialFills: true,
                            }, accountAddress)];
                    case 4:
                        executeAllActions = (_e.sent()).executeAllActions;
                        return [4 /*yield*/, executeAllActions()];
                    case 5:
                        order = _e.sent();
                        return [2 /*return*/, this.api.postOrder(order, {
                                protocol: "seaport",
                                protocolAddress: utils_1.DEFAULT_SEAPORT_CONTRACT_ADDRESS,
                                side: "bid",
                            })];
                }
            });
        });
    };
    /**
     * Create a sell order to auction an asset.
     * @param options Options for creating the sell order
     * @param options.asset The asset to trade
     * @param options.accountAddress Address of the maker's wallet
     * @param options.startAmount Price of the asset at the start of the auction. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param options.endAmount Optional price of the asset at the end of its expiration time. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param options.quantity The number of assets to sell (if fungible or semi-fungible). Defaults to 1. In units, not base units, e.g. not wei.
     * @param options.domain An optional domain to be hashed and included in the first four bytes of the random salt.
     * @param options.salt Arbitrary salt. If not passed in, a random salt will be generated with the first four bytes being the domain hash or empty.
     * @param options.listingTime Optional time when the order will become fulfillable, in UTC seconds. Undefined means it will start now.
     * @param options.expirationTime Expiration time for the order, in UTC seconds.
     * @param options.paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
     * @param options.buyerAddress Optional address that's allowed to purchase this item. If specified, no other address will be able to take the order, unless its value is the null address.
     */
    OpenSeaSDK.prototype.createSellOrder = function (_a) {
        var _b;
        var asset = _a.asset, accountAddress = _a.accountAddress, startAmount = _a.startAmount, endAmount = _a.endAmount, _c = _a.quantity, quantity = _c === void 0 ? 1 : _c, domain = _a.domain, salt = _a.salt, listingTime = _a.listingTime, expirationTime = _a.expirationTime, _d = _a.paymentTokenAddress, paymentTokenAddress = _d === void 0 ? constants_1.NULL_ADDRESS : _d, buyerAddress = _a.buyerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var openseaAsset, offerAssetItems, _e, basePrice, endPrice, _f, sellerFee, openseaSellerFees, collectionSellerFees, considerationFeeItems, executeAllActions, order;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!asset.tokenId) {
                            throw new Error("Asset must have a tokenId");
                        }
                        return [4 /*yield*/, this.api.getAsset(asset)];
                    case 1:
                        openseaAsset = _g.sent();
                        offerAssetItems = this.getAssetItems([openseaAsset], [(0, utils_2.makeBigNumber)(quantity)]);
                        return [4 /*yield*/, this._getPriceParameters(types_1.OrderSide.Sell, paymentTokenAddress, (0, utils_2.makeBigNumber)(expirationTime !== null && expirationTime !== void 0 ? expirationTime : (0, utils_2.getMaxOrderExpirationTimestamp)()), (0, utils_2.makeBigNumber)(startAmount), endAmount !== undefined ? (0, utils_2.makeBigNumber)(endAmount) : undefined)];
                    case 2:
                        _e = _g.sent(), basePrice = _e.basePrice, endPrice = _e.endPrice;
                        return [4 /*yield*/, this.getFees({
                                collection: openseaAsset.collection,
                                paymentTokenAddress: paymentTokenAddress,
                                startAmount: basePrice,
                                endAmount: endPrice,
                            })];
                    case 3:
                        _f = _g.sent(), sellerFee = _f.sellerFee, openseaSellerFees = _f.openseaSellerFees, collectionSellerFees = _f.collectionSellerFees;
                        considerationFeeItems = __spreadArray(__spreadArray([
                            sellerFee
                        ], openseaSellerFees, true), collectionSellerFees, true);
                        if (buyerAddress) {
                            considerationFeeItems.push.apply(considerationFeeItems, (0, privateListings_1.getPrivateListingConsiderations)(offerAssetItems, buyerAddress));
                        }
                        return [4 /*yield*/, this.seaport_v1_5.createOrder({
                                offer: offerAssetItems,
                                consideration: considerationFeeItems,
                                startTime: listingTime,
                                endTime: (_b = expirationTime === null || expirationTime === void 0 ? void 0 : expirationTime.toString()) !== null && _b !== void 0 ? _b : (0, utils_2.getMaxOrderExpirationTimestamp)().toString(),
                                zone: constants_1.DEFAULT_ZONE_BY_NETWORK[this._networkName],
                                domain: domain,
                                salt: salt,
                                restrictedByZone: false,
                                allowPartialFills: true,
                            }, accountAddress)];
                    case 4:
                        executeAllActions = (_g.sent()).executeAllActions;
                        return [4 /*yield*/, executeAllActions()];
                    case 5:
                        order = _g.sent();
                        return [2 /*return*/, this.api.postOrder(order, {
                                protocol: "seaport",
                                protocolAddress: utils_1.DEFAULT_SEAPORT_CONTRACT_ADDRESS,
                                side: "ask",
                            })];
                }
            });
        });
    };
    /**
     * Create a collection offer
     */
    OpenSeaSDK.prototype.createCollectionOffer = function (_a) {
        var _b;
        var collectionSlug = _a.collectionSlug, accountAddress = _a.accountAddress, amount = _a.amount, quantity = _a.quantity, domain = _a.domain, salt = _a.salt, expirationTime = _a.expirationTime, paymentTokenAddress = _a.paymentTokenAddress;
        return __awaiter(this, void 0, void 0, function () {
            var collection, buildOfferResult, item, convertedConsiderationItem, basePrice, _c, openseaSellerFees, collectionSellerFees, considerationItems, payload, executeAllActions, order;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.api.getCollection(collectionSlug)];
                    case 1:
                        collection = _d.sent();
                        return [4 /*yield*/, this.api.buildOffer(accountAddress, quantity, collectionSlug)];
                    case 2:
                        buildOfferResult = _d.sent();
                        item = buildOfferResult.partialParameters.consideration[0];
                        convertedConsiderationItem = {
                            itemType: item.itemType,
                            token: item.token,
                            identifier: item.identifierOrCriteria,
                            amount: item.startAmount,
                        };
                        return [4 /*yield*/, this._getPriceParameters(types_1.OrderSide.Buy, paymentTokenAddress, (0, utils_2.makeBigNumber)(expirationTime !== null && expirationTime !== void 0 ? expirationTime : (0, utils_2.getMaxOrderExpirationTimestamp)()), (0, utils_2.makeBigNumber)(amount))];
                    case 3:
                        basePrice = (_d.sent()).basePrice;
                        return [4 /*yield*/, this.getFees({
                                collection: collection,
                                paymentTokenAddress: paymentTokenAddress,
                                startAmount: basePrice,
                                endAmount: basePrice,
                            })];
                    case 4:
                        _c = _d.sent(), openseaSellerFees = _c.openseaSellerFees, collectionSellerFees = _c.collectionSellerFees;
                        considerationItems = __spreadArray(__spreadArray([
                            convertedConsiderationItem
                        ], openseaSellerFees, true), collectionSellerFees, true);
                        payload = {
                            offerer: accountAddress,
                            offer: [
                                {
                                    token: paymentTokenAddress,
                                    amount: basePrice.toString(),
                                },
                            ],
                            consideration: considerationItems,
                            endTime: (_b = expirationTime === null || expirationTime === void 0 ? void 0 : expirationTime.toString()) !== null && _b !== void 0 ? _b : (0, utils_2.getMaxOrderExpirationTimestamp)().toString(),
                            zone: constants_1.DEFAULT_ZONE_BY_NETWORK[this._networkName],
                            domain: domain,
                            salt: salt,
                            restrictedByZone: false,
                            allowPartialFills: true,
                        };
                        return [4 /*yield*/, this.seaport_v1_5.createOrder(payload, accountAddress)];
                    case 5:
                        executeAllActions = (_d.sent()).executeAllActions;
                        return [4 /*yield*/, executeAllActions()];
                    case 6:
                        order = _d.sent();
                        return [2 /*return*/, this.api.postCollectionOffer(order, collectionSlug)];
                }
            });
        });
    };
    OpenSeaSDK.prototype.fulfillPrivateOrder = function (_a) {
        var _b;
        var order = _a.order, accountAddress = _a.accountAddress, domain = _a.domain;
        return __awaiter(this, void 0, void 0, function () {
            var counterOrder, fulfillments, transaction, transactionReceipt;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(0, utils_2.isValidProtocol)(order.protocolAddress)) {
                            throw new Error("Unsupported protocol");
                        }
                        if (!((_b = order.taker) === null || _b === void 0 ? void 0 : _b.address)) {
                            throw new Error("Order is not a private listing must have a taker address");
                        }
                        counterOrder = (0, privateListings_1.constructPrivateListingCounterOrder)(order.protocolData, order.taker.address);
                        fulfillments = (0, privateListings_1.getPrivateListingFulfillments)(order.protocolData);
                        return [4 /*yield*/, this.seaport_v1_5
                                .matchOrders({
                                orders: [order.protocolData, counterOrder],
                                fulfillments: fulfillments,
                                overrides: {
                                    value: counterOrder.parameters.offer[0].startAmount,
                                },
                                accountAddress: accountAddress,
                                domain: domain,
                            })
                                .transact()];
                    case 1:
                        transaction = _c.sent();
                        return [4 /*yield*/, transaction.wait()];
                    case 2:
                        transactionReceipt = _c.sent();
                        return [4 /*yield*/, this._confirmTransaction(transactionReceipt.transactionHash, types_1.EventType.MatchOrders, "Fulfilling order")];
                    case 3:
                        _c.sent();
                        return [2 /*return*/, transactionReceipt.transactionHash];
                }
            });
        });
    };
    /**
     * Fullfill or "take" an order for an asset, either a buy or sell order
     * @param options fullfillment options
     * @param options.order The order to fulfill, a.k.a. "take"
     * @param options.accountAddress The taker's wallet address
     * @param options.recipientAddress The optional address to receive the order's item(s) or curriencies. If not specified, defaults to accountAddress
     * @param options.domain An optional domain to be hashed and included at the end of fulfillment calldata
     * @returns Transaction hash for fulfilling the order
     */
    OpenSeaSDK.prototype.fulfillOrder = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress, recipientAddress = _a.recipientAddress, domain = _a.domain;
        return __awaiter(this, void 0, void 0, function () {
            var result, signature, isPrivateListing, executeAllActions, transaction;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(0, utils_2.isValidProtocol)(order.protocolAddress)) {
                            throw new Error("Unsupported protocol");
                        }
                        if (!order.orderHash) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.api.generateFulfillmentData(accountAddress, order.orderHash, order.protocolAddress, order.side)];
                    case 1:
                        result = _b.sent();
                        signature = result.fulfillment_data.orders[0].signature;
                        order.clientSignature = signature;
                        order.protocolData.signature = signature;
                        _b.label = 2;
                    case 2:
                        isPrivateListing = !!order.taker;
                        if (isPrivateListing) {
                            if (recipientAddress) {
                                throw new Error("Private listings cannot be fulfilled with a recipient address");
                            }
                            return [2 /*return*/, this.fulfillPrivateOrder({
                                    order: order,
                                    accountAddress: accountAddress,
                                    domain: domain,
                                })];
                        }
                        return [4 /*yield*/, this.seaport_v1_5.fulfillOrder({
                                order: order.protocolData,
                                accountAddress: accountAddress,
                                recipientAddress: recipientAddress,
                                domain: domain,
                            })];
                    case 3:
                        executeAllActions = (_b.sent()).executeAllActions;
                        return [4 /*yield*/, executeAllActions()];
                    case 4:
                        transaction = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(transaction.hash, types_1.EventType.MatchOrders, "Fulfilling order")];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, transaction.hash];
                }
            });
        });
    };
    OpenSeaSDK.prototype.cancelSeaportOrders = function (_a) {
        var orders = _a.orders, accountAddress = _a.accountAddress, domain = _a.domain, protocolAddress = _a.protocolAddress;
        return __awaiter(this, void 0, void 0, function () {
            var transaction;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!protocolAddress) {
                            protocolAddress = utils_1.DEFAULT_SEAPORT_CONTRACT_ADDRESS;
                        }
                        return [4 /*yield*/, this.seaport_v1_5
                                .cancelOrders(orders, accountAddress, domain)
                                .transact()];
                    case 1:
                        transaction = _b.sent();
                        return [2 /*return*/, transaction.hash];
                }
            });
        });
    };
    /**
     * Cancel an order on-chain, preventing it from ever being fulfilled.
     * @param param0 __namedParameters Object
     * @param order The order to cancel
     * @param accountAddress The order maker's wallet address
     * @param domain An optional domain to be hashed and included at the end of fulfillment calldata
     */
    OpenSeaSDK.prototype.cancelOrder = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress, domain = _a.domain;
        return __awaiter(this, void 0, void 0, function () {
            var transactionHash;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(0, utils_2.isValidProtocol)(order.protocolAddress)) {
                            throw new Error("Unsupported protocol");
                        }
                        this._dispatch(types_1.EventType.CancelOrder, { orderV2: order, accountAddress: accountAddress });
                        return [4 /*yield*/, this.cancelSeaportOrders({
                                orders: [order.protocolData.parameters],
                                accountAddress: accountAddress,
                                domain: domain,
                                protocolAddress: order.protocolAddress,
                            })];
                    case 1:
                        transactionHash = _b.sent();
                        // Await transaction confirmation
                        return [4 /*yield*/, this._confirmTransaction(transactionHash, types_1.EventType.CancelOrder, "Cancelling order")];
                    case 2:
                        // Await transaction confirmation
                        _b.sent();
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
    OpenSeaSDK.prototype.approveSemiOrNonFungibleToken = function (_a) {
        var tokenId = _a.tokenId, tokenAddress = _a.tokenAddress, accountAddress = _a.accountAddress, proxyAddress = _a.proxyAddress, _b = _a.tokenAbi, tokenAbi = _b === void 0 ? contracts_1.ERC721 : _b, _c = _a.skipApproveAllIfTokenAddressIn, skipApproveAllIfTokenAddressIn = _c === void 0 ? new Set() : _c, _d = _a.schemaName, schemaName = _d === void 0 ? types_1.WyvernSchemaName.ERC721 : _d;
        return __awaiter(this, void 0, void 0, function () {
            var schema, tokenContract, approvalAllCheck, isApprovedForAll, txHash, error_1, approvalOneCheck, isApprovedForOne, txHash, error_2;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        schema = this._getSchema(schemaName);
                        tokenContract = new this.web3.eth.Contract(tokenAbi, tokenAddress);
                        if (!!proxyAddress) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._getProxy(accountAddress)];
                    case 1:
                        proxyAddress = (_e.sent()) || undefined;
                        if (!proxyAddress) {
                            throw new Error("Uninitialized account");
                        }
                        _e.label = 2;
                    case 2:
                        approvalAllCheck = function () { return __awaiter(_this, void 0, void 0, function () {
                            var isApprovedForAllRaw;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, utils_2.rawCall)(this.web3ReadOnly, {
                                            from: accountAddress,
                                            to: tokenContract.options.address,
                                            data: tokenContract.methods
                                                .isApprovedForAll(accountAddress, proxyAddress)
                                                .encodeABI(),
                                        })];
                                    case 1:
                                        isApprovedForAllRaw = _a.sent();
                                        return [2 /*return*/, parseInt(isApprovedForAllRaw)];
                                }
                            });
                        }); };
                        return [4 /*yield*/, approvalAllCheck()];
                    case 3:
                        isApprovedForAll = _e.sent();
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
                        _e.label = 4;
                    case 4:
                        _e.trys.push([4, 7, , 8]);
                        this._dispatch(types_1.EventType.ApproveAllAssets, {
                            accountAddress: accountAddress,
                            proxyAddress: proxyAddress,
                            contractAddress: tokenAddress,
                        });
                        return [4 /*yield*/, (0, utils_2.sendRawTransaction)(this.web3, {
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
                        txHash = _e.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.ApproveAllAssets, "Approving all tokens of this type for trading", function () { return __awaiter(_this, void 0, void 0, function () {
                                var result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, approvalAllCheck()];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result == 1];
                                    }
                                });
                            }); })];
                    case 6:
                        _e.sent();
                        return [2 /*return*/, txHash];
                    case 7:
                        error_1 = _e.sent();
                        console.error(error_1);
                        throw new Error("Couldn't get permission to approve these tokens for trading. Their contract might not be implemented correctly. Please contact the developer!");
                    case 8:
                        // Does not support ApproveAll (ERC721 v1 or v2)
                        this.logger("Contract does not support Approve All");
                        approvalOneCheck = function () { return __awaiter(_this, void 0, void 0, function () {
                            var approvedAddr, error_3;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, tokenContract.methods
                                                .getApproved(tokenId)
                                                .call()];
                                    case 1:
                                        approvedAddr = _a.sent();
                                        if (typeof approvedAddr === "string" && approvedAddr == "0x") {
                                            // Geth compatibility
                                            approvedAddr = undefined;
                                        }
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_3 = _a.sent();
                                        console.error(error_3);
                                        return [3 /*break*/, 3];
                                    case 3:
                                        if (approvedAddr == proxyAddress) {
                                            this.logger("Already approved proxy for this token");
                                            return [2 /*return*/, true];
                                        }
                                        this.logger("Approve response: ".concat(approvedAddr));
                                        if (!!approvedAddr) return [3 /*break*/, 5];
                                        return [4 /*yield*/, (0, utils_2.getNonCompliantApprovalAddress)(
                                            // @ts-expect-error This is an actual contract instance
                                            tokenContract, tokenId, accountAddress)];
                                    case 4:
                                        approvedAddr = _a.sent();
                                        if (approvedAddr == proxyAddress) {
                                            this.logger("Already approved proxy for this item");
                                            return [2 /*return*/, true];
                                        }
                                        this.logger("Special-case approve response: ".concat(approvedAddr));
                                        _a.label = 5;
                                    case 5: return [2 /*return*/, false];
                                }
                            });
                        }); };
                        return [4 /*yield*/, approvalOneCheck()];
                    case 9:
                        isApprovedForOne = _e.sent();
                        if (isApprovedForOne) {
                            return [2 /*return*/, null];
                        }
                        _e.label = 10;
                    case 10:
                        _e.trys.push([10, 13, , 14]);
                        this._dispatch(types_1.EventType.ApproveAsset, {
                            accountAddress: accountAddress,
                            proxyAddress: proxyAddress,
                            asset: (0, utils_2.getWyvernAsset)(schema, { tokenId: tokenId, tokenAddress: tokenAddress }),
                        });
                        return [4 /*yield*/, (0, utils_2.sendRawTransaction)(this.web3, {
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
                        txHash = _e.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.ApproveAsset, "Approving single token for trading", approvalOneCheck)];
                    case 12:
                        _e.sent();
                        return [2 /*return*/, txHash];
                    case 13:
                        error_2 = _e.sent();
                        console.error(error_2);
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
    OpenSeaSDK.prototype.approveFungibleToken = function (_a) {
        var _b;
        var accountAddress = _a.accountAddress, tokenAddress = _a.tokenAddress, proxyAddress = _a.proxyAddress, _c = _a.minimumAmount, minimumAmount = _c === void 0 ? constants_1.MAX_UINT_256 : _c;
        return __awaiter(this, void 0, void 0, function () {
            var approvedAmount, hasOldApproveMethod, txHash;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        proxyAddress =
                            proxyAddress ||
                                ((_b = this._wyvernConfigOverride) === null || _b === void 0 ? void 0 : _b.wyvernTokenTransferProxyContractAddress) ||
                                wyvern_js_1.WyvernProtocol.getTokenTransferProxyAddress(this._networkName);
                        return [4 /*yield*/, this._getApprovedTokenCount({
                                accountAddress: accountAddress,
                                tokenAddress: tokenAddress,
                                proxyAddress: proxyAddress,
                            })];
                    case 1:
                        approvedAmount = _d.sent();
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
                        _d.sent();
                        _d.label = 3;
                    case 3: return [4 /*yield*/, (0, utils_2.sendRawTransaction)(this.web3, {
                            from: accountAddress,
                            to: tokenAddress,
                            data: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.ERC20, "approve"), 
                            // Always approve maximum amount, to prevent the need for followup
                            // transactions (and because old ERC20s like MANA/ENJ are non-compliant)
                            [proxyAddress, constants_1.MAX_UINT_256.toString()]),
                        }, function (error) {
                            _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                        })];
                    case 4:
                        txHash = _d.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.ApproveCurrency, "Approving currency for trading", function () { return __awaiter(_this, void 0, void 0, function () {
                                var newlyApprovedAmount;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._getApprovedTokenCount({
                                                accountAddress: accountAddress,
                                                tokenAddress: tokenAddress,
                                                proxyAddress: proxyAddress,
                                            })];
                                        case 1:
                                            newlyApprovedAmount = _a.sent();
                                            return [2 /*return*/, newlyApprovedAmount.isGreaterThanOrEqualTo(minimumAmount)];
                                    }
                                });
                            }); })];
                    case 5:
                        _d.sent();
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
    OpenSeaSDK.prototype.unapproveFungibleToken = function (_a) {
        var _b;
        var accountAddress = _a.accountAddress, tokenAddress = _a.tokenAddress, proxyAddress = _a.proxyAddress;
        return __awaiter(this, void 0, void 0, function () {
            var txHash;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        proxyAddress =
                            proxyAddress ||
                                ((_b = this._wyvernConfigOverride) === null || _b === void 0 ? void 0 : _b.wyvernTokenTransferProxyContractAddress) ||
                                wyvern_js_1.WyvernProtocol.getTokenTransferProxyAddress(this._networkName);
                        return [4 /*yield*/, (0, utils_2.sendRawTransaction)(this.web3, {
                                from: accountAddress,
                                to: tokenAddress,
                                data: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.ERC20, "approve"), [proxyAddress, 0]),
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 1:
                        txHash = _c.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.UnapproveCurrency, "Resetting Currency Approval", function () { return __awaiter(_this, void 0, void 0, function () {
                                var newlyApprovedAmount;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._getApprovedTokenCount({
                                                accountAddress: accountAddress,
                                                tokenAddress: tokenAddress,
                                                proxyAddress: proxyAddress,
                                            })];
                                        case 1:
                                            newlyApprovedAmount = _a.sent();
                                            return [2 /*return*/, newlyApprovedAmount.isZero()];
                                    }
                                });
                            }); })];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, txHash];
                }
            });
        });
    };
    /**
     * Register a domain on the Domain Registry contract.
     * @param domain The string domain to be hashed and registered on the Registry.
     * @returns Transaction hash
     */
    OpenSeaSDK.prototype.setDomain = function (domain) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.seaport_v1_5.setDomain(domain).transact()];
                    case 1:
                        transaction = _a.sent();
                        return [4 /*yield*/, transaction.wait()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, transaction.hash];
                }
            });
        });
    };
    /**
     * Get the domain for a specific tag at a given index.
     * @param tag The tag to look up.
     * @param index The index of the domain to return.
     * @returns Domain
     */
    OpenSeaSDK.prototype.getDomain = function (tag, index) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.seaport_v1_5.getDomain(tag, index)];
            });
        });
    };
    /**
     * Get the full array of domains for a specific tag.
     * @param tag The tag to look up.
     * @returns Array of domains
     */
    OpenSeaSDK.prototype.getDomains = function (tag) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.seaport_v1_5.getDomains(tag)];
            });
        });
    };
    /**
     * Get the number of registered domains for a specific tag.
     * @param tag The tag to look up.
     * @returns Number of registered domains for input tag.
     */
    OpenSeaSDK.prototype.getNumberOfDomains = function (tag) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new bignumber_js_1.BigNumber(this.seaport_v1_5.getNumberOfDomains(tag).toString())];
            });
        });
    };
    /**
     * Gets the current price for the order.
     */
    OpenSeaSDK.prototype.getCurrentPrice = function (_a) {
        var order = _a.order;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, new bignumber_js_1.BigNumber(order.currentPrice)];
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
    OpenSeaSDK.prototype.isOrderFulfillable = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var isValid, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(0, utils_2.isValidProtocol)(order.protocolAddress)) {
                            throw new Error("Unsupported protocol");
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.seaport_v1_5
                                .validate([order.protocolData], accountAddress)
                                .callStatic()];
                    case 2:
                        isValid = _b.sent();
                        return [2 /*return*/, !!isValid];
                    case 3:
                        error_4 = _b.sent();
                        if ((0, utils_2.hasErrorCode)(error_4) && error_4.code === "CALL_EXCEPTION") {
                            return [2 /*return*/, false];
                        }
                        throw error_4;
                    case 4: return [2 /*return*/];
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
    OpenSeaSDK.prototype.isAssetTransferrable = function (_a, retries) {
        var asset = _a.asset, fromAddress = _a.fromAddress, toAddress = _a.toAddress, quantity = _a.quantity, _b = _a.useProxy, useProxy = _b === void 0 ? false : _b;
        if (retries === void 0) { retries = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var schema, quantityBN, wyAsset, abi, from, proxyAddress, data, gas, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        schema = this._getSchema(this._getSchemaName(asset));
                        quantityBN = quantity
                            ? (0, utils_2.toBaseUnitAmount)((0, utils_2.makeBigNumber)(quantity), asset.decimals || 0)
                            : (0, utils_2.makeBigNumber)(1);
                        wyAsset = (0, utils_2.getWyvernAsset)(schema, asset, quantityBN);
                        abi = schema.functions.transfer(wyAsset);
                        from = fromAddress;
                        if (!useProxy) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._getProxy(fromAddress)];
                    case 1:
                        proxyAddress = _c.sent();
                        if (!proxyAddress) {
                            console.error("This asset's owner (".concat(fromAddress, ") does not have a proxy!"));
                            return [2 /*return*/, false];
                        }
                        from = proxyAddress;
                        _c.label = 2;
                    case 2:
                        data = (0, schema_1.encodeTransferCall)(abi, fromAddress, toAddress);
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 8]);
                        return [4 /*yield*/, (0, utils_2.estimateGas)(this._getClientsForRead({ retries: retries }).web3, {
                                from: from,
                                to: abi.target,
                                data: data,
                            })];
                    case 4:
                        gas = _c.sent();
                        return [2 /*return*/, gas > 0];
                    case 5:
                        error_5 = _c.sent();
                        if (retries <= 0) {
                            console.error(error_5);
                            console.error(from, abi.target, data);
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, (0, utils_2.delay)(500)];
                    case 6:
                        _c.sent();
                        return [4 /*yield*/, this.isAssetTransferrable({ asset: asset, fromAddress: fromAddress, toAddress: toAddress, quantity: quantity, useProxy: useProxy }, retries - 1)];
                    case 7: return [2 /*return*/, _c.sent()];
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
    OpenSeaSDK.prototype.transfer = function (_a) {
        var fromAddress = _a.fromAddress, toAddress = _a.toAddress, asset = _a.asset, _b = _a.quantity, quantity = _b === void 0 ? 1 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var schema, quantityBN, wyAsset, isCryptoKitties, isOldNFT, abi, data, txHash;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        schema = this._getSchema(this._getSchemaName(asset));
                        quantityBN = (0, utils_2.toBaseUnitAmount)((0, utils_2.makeBigNumber)(quantity), asset.decimals || 0);
                        wyAsset = (0, utils_2.getWyvernAsset)(schema, asset, quantityBN);
                        isCryptoKitties = [constants_1.CK_ADDRESS].includes(wyAsset.address);
                        isOldNFT = isCryptoKitties ||
                            (!!asset.version &&
                                [types_1.TokenStandardVersion.ERC721v1, types_1.TokenStandardVersion.ERC721v2].includes(asset.version));
                        abi = this._getSchemaName(asset) === types_1.WyvernSchemaName.ERC20
                            ? (0, utils_2.annotateERC20TransferABI)(wyAsset)
                            : isOldNFT
                                ? (0, utils_2.annotateERC721TransferABI)(wyAsset)
                                : schema.functions.transfer(wyAsset);
                        this._dispatch(types_1.EventType.TransferOne, {
                            accountAddress: fromAddress,
                            toAddress: toAddress,
                            asset: wyAsset,
                        });
                        data = (0, schema_1.encodeTransferCall)(abi, fromAddress, toAddress);
                        return [4 /*yield*/, (0, utils_2.sendRawTransaction)(this.web3, {
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
                        txHash = _c.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.TransferOne, "Transferring asset")];
                    case 2:
                        _c.sent();
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
    OpenSeaSDK.prototype.transferAll = function (_a) {
        var assets = _a.assets, fromAddress = _a.fromAddress, toAddress = _a.toAddress, _b = _a.schemaName, schemaName = _b === void 0 ? types_1.WyvernSchemaName.ERC721 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var schemaNames, wyAssets, _c, calldata, target, proxyAddress, txHash;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        toAddress = (0, utils_2.validateAndFormatWalletAddress)(this.web3, toAddress);
                        schemaNames = assets.map(function (asset) { return _this._getSchemaName(asset) || schemaName; });
                        wyAssets = assets.map(function (asset) {
                            return (0, utils_2.getWyvernAsset)(_this._getSchema(_this._getSchemaName(asset)), asset);
                        });
                        _c = (0, schema_1.encodeAtomicizedTransfer)(schemaNames.map(function (name) { return _this._getSchema(name); }), wyAssets, fromAddress, toAddress, this._wyvernProtocol, this._networkName), calldata = _c.calldata, target = _c.target;
                        return [4 /*yield*/, this._getProxy(fromAddress)];
                    case 1:
                        proxyAddress = _d.sent();
                        if (!!proxyAddress) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._initializeProxy(fromAddress)];
                    case 2:
                        proxyAddress = _d.sent();
                        _d.label = 3;
                    case 3: return [4 /*yield*/, this._approveAll({
                            schemaNames: schemaNames,
                            wyAssets: wyAssets,
                            accountAddress: fromAddress,
                            proxyAddress: proxyAddress,
                        })];
                    case 4:
                        _d.sent();
                        this._dispatch(types_1.EventType.TransferAll, {
                            accountAddress: fromAddress,
                            toAddress: toAddress,
                            assets: wyAssets,
                        });
                        return [4 /*yield*/, (0, utils_2.sendRawTransaction)(this.web3, {
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
                        txHash = _d.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.TransferAll, "Transferring ".concat(assets.length, " asset").concat(assets.length == 1 ? "" : "s"))];
                    case 6:
                        _d.sent();
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
    OpenSeaSDK.prototype.getFungibleTokens = function (_a) {
        var _b = _a === void 0 ? {} : _a, symbol = _b.symbol, address = _b.address, name = _b.name;
        return __awaiter(this, void 0, void 0, function () {
            var tokenSettings, tokens, offlineTokens;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        (0, utils_2.onDeprecated)("Use `api.getPaymentTokens` instead");
                        tokenSettings = (0, tokens_1.getTokens)(this._networkName);
                        return [4 /*yield*/, this.api.getPaymentTokens({
                                symbol: symbol,
                                address: address,
                                name: name,
                            })];
                    case 1:
                        tokens = (_c.sent()).tokens;
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
    OpenSeaSDK.prototype.getAssetBalance = function (_a, retries) {
        var accountAddress = _a.accountAddress, asset = _a.asset;
        if (retries === void 0) { retries = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAsset, abi, contract, inputValues, count, abi, contract, inputValues, owner, _b;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        schema = this._getSchema(this._getSchemaName(asset));
                        wyAsset = (0, utils_2.getWyvernAsset)(schema, asset);
                        if (!schema.functions.countOf) return [3 /*break*/, 2];
                        abi = schema.functions.countOf(wyAsset);
                        contract = new (this._getClientsForRead({
                            retries: retries,
                        }).web3.eth.Contract)([abi], abi.target);
                        inputValues = abi.inputs
                            .filter(function (x) { return x.value !== undefined; })
                            .map(function (x) { return x.value; });
                        return [4 /*yield*/, (_c = contract.methods)[abi.name].apply(_c, __spreadArray([accountAddress], inputValues, false)).call()];
                    case 1:
                        count = _e.sent();
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
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, (_d = contract.methods)[abi.name].apply(_d, inputValues).call()];
                    case 4:
                        owner = _e.sent();
                        if (owner) {
                            return [2 /*return*/, owner.toLowerCase() == accountAddress.toLowerCase()
                                    ? new bignumber_js_1.BigNumber(1)
                                    : new bignumber_js_1.BigNumber(0)];
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        _b = _e.sent();
                        return [3 /*break*/, 6];
                    case 6: return [3 /*break*/, 8];
                    case 7: 
                    // Missing ownership call - skip check to allow listings
                    // by default
                    throw new Error("Missing ownership schema for this asset type");
                    case 8:
                        if (!(retries <= 0)) return [3 /*break*/, 9];
                        throw new Error("Unable to get current owner from smart contract");
                    case 9: return [4 /*yield*/, (0, utils_2.delay)(500)];
                    case 10:
                        _e.sent();
                        return [4 /*yield*/, this.getAssetBalance({ accountAddress: accountAddress, asset: asset }, retries - 1)];
                    case 11: 
                    // Recursively check owner again
                    return [2 /*return*/, _e.sent()];
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
    OpenSeaSDK.prototype.getTokenBalance = function (_a, retries) {
        var accountAddress = _a.accountAddress, tokenAddress = _a.tokenAddress, _b = _a.schemaName, schemaName = _b === void 0 ? types_1.WyvernSchemaName.ERC20 : _b;
        if (retries === void 0) { retries = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var asset;
            return __generator(this, function (_c) {
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
     */
    OpenSeaSDK.prototype.computeFees = function (_a) {
        var asset = _a.asset;
        return __awaiter(this, void 0, void 0, function () {
            var openseaBuyerFeeBasisPoints, openseaSellerFeeBasisPoints, devBuyerFeeBasisPoints, devSellerFeeBasisPoints, fees;
            return __generator(this, function (_b) {
                openseaBuyerFeeBasisPoints = 0;
                openseaSellerFeeBasisPoints = 0;
                devBuyerFeeBasisPoints = 0;
                devSellerFeeBasisPoints = 0;
                if (asset) {
                    fees = asset.collection.fees;
                    openseaSellerFeeBasisPoints = +(0, utils_2.feesToBasisPoints)(fees === null || fees === void 0 ? void 0 : fees.openseaFees);
                    devSellerFeeBasisPoints = +(0, utils_2.feesToBasisPoints)(fees === null || fees === void 0 ? void 0 : fees.sellerFees);
                }
                return [2 /*return*/, {
                        totalBuyerFeeBasisPoints: openseaBuyerFeeBasisPoints + devBuyerFeeBasisPoints,
                        totalSellerFeeBasisPoints: openseaSellerFeeBasisPoints + devSellerFeeBasisPoints,
                        openseaBuyerFeeBasisPoints: openseaBuyerFeeBasisPoints,
                        openseaSellerFeeBasisPoints: openseaSellerFeeBasisPoints,
                        devBuyerFeeBasisPoints: devBuyerFeeBasisPoints,
                        devSellerFeeBasisPoints: devSellerFeeBasisPoints,
                    }];
            });
        });
    };
    /**
     * DEPRECATED: ERC-1559
     * https://eips.ethereum.org/EIPS/eip-1559
     * Compute the gas price for sending a txn, in wei
     * Will be slightly above the mean to make it faster
     */
    OpenSeaSDK.prototype._computeGasPrice = function () {
        return __awaiter(this, void 0, void 0, function () {
            var meanGas, weiToAdd;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, utils_2.getCurrentGasPrice)(this.web3)];
                    case 1:
                        meanGas = _a.sent();
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
    OpenSeaSDK.prototype._correctGasAmount = function (estimation) {
        return Math.ceil(estimation * this.gasIncreaseFactor);
    };
    /**
     * Get the proxy address for a user's wallet.
     * Internal method exposed for dev flexibility.
     * @param accountAddress The user's wallet address
     * @param retries Optional number of retries to do
     * @param wyvernProtocol optional wyvern protocol override
     */
    OpenSeaSDK.prototype._getProxy = function (accountAddress, retries) {
        if (retries === void 0) { retries = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var proxyAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._wyvernProtocolReadOnly.wyvernProxyRegistry
                            .proxies(accountAddress)
                            .callAsync()];
                    case 1:
                        proxyAddress = _a.sent();
                        if (proxyAddress == "0x") {
                            throw new Error("Couldn't retrieve your account from the blockchain - make sure you're on the correct Ethereum network!");
                        }
                        if (!(!proxyAddress || proxyAddress == constants_1.NULL_ADDRESS)) return [3 /*break*/, 5];
                        if (!(retries > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, utils_2.delay)(1000)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._getProxy(accountAddress, retries - 1)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        proxyAddress = null;
                        _a.label = 5;
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
    OpenSeaSDK.prototype._initializeProxy = function (accountAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var txnData, gasEstimate, transactionHash, proxyAddress;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._dispatch(types_1.EventType.InitializeAccount, { accountAddress: accountAddress });
                        this.logger("Initializing proxy for account: ".concat(accountAddress));
                        txnData = { from: accountAddress };
                        return [4 /*yield*/, this._wyvernProtocol.wyvernProxyRegistry
                                .registerProxy()
                                .estimateGasAsync(txnData)];
                    case 1:
                        gasEstimate = _a.sent();
                        return [4 /*yield*/, this._wyvernProtocol.wyvernProxyRegistry
                                .registerProxy()
                                .sendTransactionAsync(__assign(__assign({}, txnData), { gas: this._correctGasAmount(gasEstimate) }))];
                    case 2:
                        transactionHash = _a.sent();
                        return [4 /*yield*/, this._confirmTransaction(transactionHash, types_1.EventType.InitializeAccount, "Initializing proxy for account", function () { return __awaiter(_this, void 0, void 0, function () {
                                var polledProxy;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._getProxy(accountAddress, 0)];
                                        case 1:
                                            polledProxy = _a.sent();
                                            return [2 /*return*/, !!polledProxy];
                                    }
                                });
                            }); })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this._getProxy(accountAddress, 10)];
                    case 4:
                        proxyAddress = _a.sent();
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
    OpenSeaSDK.prototype._getApprovedTokenCount = function (_a) {
        var _b;
        var accountAddress = _a.accountAddress, tokenAddress = _a.tokenAddress, proxyAddress = _a.proxyAddress;
        return __awaiter(this, void 0, void 0, function () {
            var addressToApprove, approved;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!tokenAddress) {
                            tokenAddress = (0, tokens_1.getCanonicalWrappedEther)(this._networkName).address;
                        }
                        addressToApprove = proxyAddress ||
                            ((_b = this._wyvernConfigOverride) === null || _b === void 0 ? void 0 : _b.wyvernTokenTransferProxyContractAddress) ||
                            wyvern_js_1.WyvernProtocol.getTokenTransferProxyAddress(this._networkName);
                        return [4 /*yield*/, (0, utils_2.rawCall)(this.web3, {
                                from: accountAddress,
                                to: tokenAddress,
                                data: (0, schema_1.encodeCall)((0, contracts_1.getMethod)(contracts_1.ERC20, "allowance"), [
                                    accountAddress,
                                    addressToApprove,
                                ]),
                            })];
                    case 1:
                        approved = _c.sent();
                        return [2 /*return*/, (0, utils_2.makeBigNumber)(approved)];
                }
            });
        });
    };
    // For creating email whitelists on order takers
    OpenSeaSDK.prototype._createEmailWhitelistEntry = function (_a) {
        var order = _a.order, buyerEmail = _a.buyerEmail;
        return __awaiter(this, void 0, void 0, function () {
            var asset;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        asset = "asset" in order.metadata ? order.metadata.asset : undefined;
                        if (!asset || !asset.id) {
                            throw new Error("Whitelisting only available for non-fungible assets.");
                        }
                        return [4 /*yield*/, this.api.postAssetWhitelist(asset.address, asset.id, buyerEmail)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Instead of signing an off-chain order, you can approve an order
     * with on on-chain transaction using this method
     * @param order Order to approve
     * @param domain An optional domain to be hashed and included at the end of fulfillment calldata
     * @returns Transaction hash of the approval transaction
     */
    OpenSeaSDK.prototype.approveOrder = function (order, domain) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(0, utils_2.isValidProtocol)(order.protocolAddress)) {
                            throw new Error("Unsupported protocol");
                        }
                        this._dispatch(types_1.EventType.ApproveOrder, {
                            orderV2: order,
                            accountAddress: order.maker.address,
                        });
                        return [4 /*yield*/, this.seaport_v1_5
                                .validate([order.protocolData], order.maker.address, domain)
                                .transact()];
                    case 1:
                        transaction = _a.sent();
                        return [4 /*yield*/, this._confirmTransaction(transaction.hash, types_1.EventType.ApproveOrder, "Approving order")];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, transaction.hash];
                }
            });
        });
    };
    OpenSeaSDK.prototype._approveAll = function (_a) {
        var schemaNames = _a.schemaNames, wyAssets = _a.wyAssets, accountAddress = _a.accountAddress, proxyAddress = _a.proxyAddress;
        return __awaiter(this, void 0, void 0, function () {
            var _b, contractsWithApproveAll;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = proxyAddress;
                        if (_b) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._getProxy(accountAddress, 0)];
                    case 1:
                        _b = (_c.sent());
                        _c.label = 2;
                    case 2:
                        proxyAddress =
                            _b || undefined;
                        if (!!proxyAddress) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._initializeProxy(accountAddress)];
                    case 3:
                        proxyAddress = _c.sent();
                        _c.label = 4;
                    case 4:
                        contractsWithApproveAll = new Set();
                        return [2 /*return*/, Promise.all(wyAssets.map(function (wyAsset, i) { return __awaiter(_this, void 0, void 0, function () {
                                var schemaName, isOwner, error_6, minAmount, _a, wyNFTAsset, wyFTAsset;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            schemaName = schemaNames[i];
                                            _b.label = 1;
                                        case 1:
                                            _b.trys.push([1, 3, , 4]);
                                            return [4 /*yield*/, this._ownsAssetOnChain({
                                                    accountAddress: accountAddress,
                                                    proxyAddress: proxyAddress,
                                                    wyAsset: wyAsset,
                                                    schemaName: schemaName,
                                                })];
                                        case 2:
                                            isOwner = _b.sent();
                                            return [3 /*break*/, 4];
                                        case 3:
                                            error_6 = _b.sent();
                                            // let it through for assets we don't support yet
                                            isOwner = true;
                                            return [3 /*break*/, 4];
                                        case 4:
                                            if (!isOwner) {
                                                minAmount = "quantity" in wyAsset ? wyAsset.quantity : 1;
                                                console.error("Failed on-chain ownership check: ".concat(accountAddress, " on ").concat(schemaName, ":"), wyAsset);
                                                throw new Error("You don't own enough to do that (".concat(minAmount, " base units of ").concat(wyAsset.address).concat(wyAsset.id ? " token " + wyAsset.id : "", ")"));
                                            }
                                            _a = schemaName;
                                            switch (_a) {
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
                                        case 6: return [2 /*return*/, _b.sent()];
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
                                        case 8: return [2 /*return*/, _b.sent()];
                                        case 9: return [2 /*return*/];
                                    }
                                });
                            }); }))];
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
    OpenSeaSDK.prototype._ownsAssetOnChain = function (_a) {
        var accountAddress = _a.accountAddress, proxyAddress = _a.proxyAddress, wyAsset = _a.wyAsset, schemaName = _a.schemaName;
        return __awaiter(this, void 0, void 0, function () {
            var asset, minAmount, accountBalance, _b, proxyBalance;
            return __generator(this, function (_c) {
                switch (_c.label) {
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
                        accountBalance = _c.sent();
                        if (accountBalance.isGreaterThanOrEqualTo(minAmount)) {
                            return [2 /*return*/, true];
                        }
                        _b = proxyAddress;
                        if (_b) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._getProxy(accountAddress)];
                    case 2:
                        _b = (_c.sent());
                        _c.label = 3;
                    case 3:
                        proxyAddress = _b;
                        if (!proxyAddress) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getAssetBalance({
                                accountAddress: proxyAddress,
                                asset: asset,
                            })];
                    case 4:
                        proxyBalance = _c.sent();
                        if (proxyBalance.isGreaterThanOrEqualTo(minAmount)) {
                            return [2 /*return*/, true];
                        }
                        _c.label = 5;
                    case 5: return [2 /*return*/, false];
                }
            });
        });
    };
    OpenSeaSDK.prototype._getBuyFeeParameters = function (totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, sellOrder) {
        this._validateFees(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints);
        var makerRelayerFee;
        var takerRelayerFee;
        if (sellOrder) {
            // Use the sell order's fees to ensure compatiblity and force the order
            // to only be acceptable by the sell order maker.
            // Swap maker/taker depending on whether it's an English auction (taker)
            // TODO add extraBountyBasisPoints when making bidder bounties
            makerRelayerFee = sellOrder.waitingForBestCounterOrder
                ? (0, utils_2.makeBigNumber)(sellOrder.makerRelayerFee)
                : (0, utils_2.makeBigNumber)(sellOrder.takerRelayerFee);
            takerRelayerFee = sellOrder.waitingForBestCounterOrder
                ? (0, utils_2.makeBigNumber)(sellOrder.takerRelayerFee)
                : (0, utils_2.makeBigNumber)(sellOrder.makerRelayerFee);
        }
        else {
            makerRelayerFee = (0, utils_2.makeBigNumber)(totalBuyerFeeBasisPoints);
            takerRelayerFee = (0, utils_2.makeBigNumber)(totalSellerFeeBasisPoints);
        }
        return {
            makerRelayerFee: makerRelayerFee,
            takerRelayerFee: takerRelayerFee,
            makerProtocolFee: (0, utils_2.makeBigNumber)(0),
            takerProtocolFee: (0, utils_2.makeBigNumber)(0),
            makerReferrerFee: (0, utils_2.makeBigNumber)(0),
            feeRecipient: constants_1.OPENSEA_LEGACY_FEE_RECIPIENT,
            feeMethod: types_1.FeeMethod.SplitFee,
        };
    };
    /**
     * Validate fee parameters
     * @param totalBuyerFeeBasisPoints Total buyer fees
     * @param totalSellerFeeBasisPoints Total seller fees
     */
    OpenSeaSDK.prototype._validateFees = function (totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints) {
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
    OpenSeaSDK.prototype._getTimeParameters = function (_a) {
        var _b = _a.expirationTimestamp, expirationTimestamp = _b === void 0 ? (0, utils_2.getMaxOrderExpirationTimestamp)() : _b, listingTimestamp = _a.listingTimestamp, _c = _a.waitingForBestCounterOrder, waitingForBestCounterOrder = _c === void 0 ? false : _c, _d = _a.isMatchingOrder, isMatchingOrder = _d === void 0 ? false : _d;
        var maxExpirationTimeStamp = (0, utils_2.getMaxOrderExpirationTimestamp)();
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
            listingTime: (0, utils_2.makeBigNumber)(listingTimestamp),
            expirationTime: (0, utils_2.makeBigNumber)(expirationTimestamp),
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
    OpenSeaSDK.prototype._getPriceParameters = function (orderSide, tokenAddress, expirationTime, startAmount, endAmount, waitingForBestCounterOrder, englishAuctionReservePrice) {
        if (waitingForBestCounterOrder === void 0) { waitingForBestCounterOrder = false; }
        return __awaiter(this, void 0, void 0, function () {
            var priceDiff, paymentToken, isEther, tokens, token, basePrice, endPrice, extra, reservePrice;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        priceDiff = endAmount != null ? startAmount.minus(endAmount) : new bignumber_js_1.BigNumber(0);
                        paymentToken = tokenAddress.toLowerCase();
                        isEther = tokenAddress == constants_1.NULL_ADDRESS;
                        return [4 /*yield*/, this.api.getPaymentTokens({
                                address: paymentToken,
                            })];
                    case 1:
                        tokens = (_a.sent()).tokens;
                        token = tokens[0];
                        // Validation
                        if (startAmount.isNaN() || startAmount == null || startAmount.lt(0)) {
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
                        if (priceDiff.lt(0)) {
                            throw new Error("End price must be less than or equal to the start price.");
                        }
                        if (priceDiff.gt(0) && expirationTime.eq(0)) {
                            throw new Error("Expiration time must be set if order will change in price.");
                        }
                        if (englishAuctionReservePrice &&
                            !englishAuctionReservePrice.isZero() &&
                            !waitingForBestCounterOrder) {
                            throw new Error("Reserve prices may only be set on English auctions.");
                        }
                        if (englishAuctionReservePrice &&
                            !englishAuctionReservePrice.isZero() &&
                            englishAuctionReservePrice < startAmount) {
                            throw new Error("Reserve price must be greater than or equal to the start amount.");
                        }
                        basePrice = isEther
                            ? (0, utils_2.makeBigNumber)(this.web3.utils.toWei(startAmount.toString(), "ether")).integerValue()
                            : (0, utils_2.toBaseUnitAmount)(startAmount, token.decimals);
                        endPrice = endAmount
                            ? isEther
                                ? (0, utils_2.makeBigNumber)(this.web3.utils.toWei(endAmount.toString(), "ether")).integerValue()
                                : (0, utils_2.toBaseUnitAmount)(endAmount, token.decimals)
                            : undefined;
                        extra = isEther
                            ? (0, utils_2.makeBigNumber)(this.web3.utils.toWei(priceDiff.toString(), "ether")).integerValue()
                            : (0, utils_2.toBaseUnitAmount)(priceDiff, token.decimals);
                        reservePrice = englishAuctionReservePrice
                            ? isEther
                                ? (0, utils_2.makeBigNumber)(this.web3.utils.toWei(englishAuctionReservePrice.toString(), "ether")).integerValue()
                                : (0, utils_2.toBaseUnitAmount)(englishAuctionReservePrice, token.decimals)
                            : undefined;
                        return [2 /*return*/, { basePrice: basePrice, extra: extra, paymentToken: paymentToken, reservePrice: reservePrice, endPrice: endPrice }];
                }
            });
        });
    };
    OpenSeaSDK.prototype._getSchemaName = function (asset) {
        if (asset.schemaName) {
            return asset.schemaName;
        }
        else if ("assetContract" in asset) {
            return asset.assetContract.schemaName;
        }
        return undefined;
    };
    OpenSeaSDK.prototype._getSchema = function (schemaName) {
        var schemaName_ = schemaName || types_1.WyvernSchemaName.ERC721;
        var schema = schema_1.schemas[this._networkName].filter(function (s) { return s.name == schemaName_; })[0];
        if (!schema) {
            throw new Error("Trading for this asset (".concat(schemaName_, ") is not yet supported. Please contact us or check back later!"));
        }
        return schema;
    };
    OpenSeaSDK.prototype._dispatch = function (event, data) {
        this._emitter.emit(event, data);
    };
    /**
     * Get the clients to use for a read call
     * @param retries current retry value
     * @param wyvernProtocol optional wyvern protocol to use, has default
     * @param wyvernProtocol optional readonly wyvern protocol to use, has default
     */
    OpenSeaSDK.prototype._getClientsForRead = function (_a) {
        var retries = _a.retries;
        if (retries > 0) {
            // Use injected provider by default
            return {
                web3: this.web3,
            };
        }
        else {
            // Use provided provider as fallback
            return {
                web3: this.web3ReadOnly,
            };
        }
    };
    OpenSeaSDK.prototype._confirmTransaction = function (transactionHash, event, description, testForSuccess) {
        return __awaiter(this, void 0, void 0, function () {
            var transactionEventData, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transactionEventData = { transactionHash: transactionHash, event: event };
                        this.logger("Transaction started: ".concat(description));
                        if (!(transactionHash == constants_1.NULL_BLOCK_HASH)) return [3 /*break*/, 4];
                        // This was a smart contract wallet that doesn't know the transaction
                        this._dispatch(types_1.EventType.TransactionCreated, { event: event });
                        if (!!testForSuccess) return [3 /*break*/, 2];
                        // Wait if test not implemented
                        this.logger("Unknown action, waiting 1 minute: ".concat(description));
                        return [4 /*yield*/, (0, utils_2.delay)(60 * 1000)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, this._pollCallbackForConfirmation(event, description, testForSuccess)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        this._dispatch(types_1.EventType.TransactionCreated, transactionEventData);
                        return [4 /*yield*/, (0, utils_2.confirmTransaction)(this.web3, transactionHash)];
                    case 5:
                        _a.sent();
                        this.logger("Transaction succeeded: ".concat(description));
                        this._dispatch(types_1.EventType.TransactionConfirmed, transactionEventData);
                        return [3 /*break*/, 7];
                    case 6:
                        error_7 = _a.sent();
                        this.logger("Transaction failed: ".concat(description));
                        this._dispatch(types_1.EventType.TransactionFailed, __assign(__assign({}, transactionEventData), { error: error_7 }));
                        throw error_7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    OpenSeaSDK.prototype._pollCallbackForConfirmation = function (event, description, testForSuccess) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var initialRetries = 60;
                        var testResolve = function (retries) { return __awaiter(_this, void 0, void 0, function () {
                            var wasSuccessful;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, testForSuccess()];
                                    case 1:
                                        wasSuccessful = _a.sent();
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
                                        return [4 /*yield*/, (0, utils_2.delay)(5000)];
                                    case 2:
                                        _a.sent();
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
    OpenSeaSDK.prototype.isAuthenticatedProxyRevoked = function (accountAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var proxy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._wyvernProtocol.getAuthenticatedProxy(accountAddress)];
                    case 1:
                        proxy = _a.sent();
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
    OpenSeaSDK.prototype.revokeAuthenticatedProxyAccess = function (accountAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var proxy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._wyvernProtocol.getAuthenticatedProxy(accountAddress)];
                    case 1:
                        proxy = _a.sent();
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
    OpenSeaSDK.prototype.unrevokeAuthenticatedProxyAccess = function (accountAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var proxy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._wyvernProtocol.getAuthenticatedProxy(accountAddress)];
                    case 1:
                        proxy = _a.sent();
                        return [2 /*return*/, proxy.setRevoke(false).sendTransactionAsync({
                                from: accountAddress,
                            })];
                }
            });
        });
    };
    return OpenSeaSDK;
}());
exports.OpenSeaSDK = OpenSeaSDK;
//# sourceMappingURL=sdk.js.map