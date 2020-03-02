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
Object.defineProperty(exports, "__esModule", { value: true });
var Web3 = require("web3");
var wyvern_js_1 = require("wyvern-js");
var WyvernSchemas = require("wyvern-schemas");
var _ = require("lodash");
var api_1 = require("./api");
var contracts_1 = require("./contracts");
var types_1 = require("./types");
var utils_1 = require("./utils/utils");
var schema_1 = require("./utils/schema");
var debugging_1 = require("./debugging");
var bignumber_js_1 = require("bignumber.js");
var fbemitter_1 = require("fbemitter");
var ethereumjs_util_1 = require("ethereumjs-util");
var constants_1 = require("./constants");
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
        // Extra gwei to add to the mean gas price when making transactions
        this.gasPriceAddition = new bignumber_js_1.BigNumber(3);
        // Multiply gas estimate by this factor when making transactions
        this.gasIncreaseFactor = constants_1.DEFAULT_GAS_INCREASE_FACTOR;
        // API config
        apiConfig.networkName = apiConfig.networkName || types_1.Network.Main;
        apiConfig.gasPrice = apiConfig.gasPrice || utils_1.makeBigNumber(300000);
        this.api = new api_1.OpenSeaAPI(apiConfig);
        this._networkName = apiConfig.networkName;
        var readonlyProvider = new Web3.providers.HttpProvider(this._networkName == types_1.Network.Main ? constants_1.MAINNET_PROVIDER_URL : constants_1.RINKEBY_PROVIDER_URL);
        // Web3 Config
        this.web3 = new Web3(provider);
        this.web3ReadOnly = new Web3(readonlyProvider);
        // WyvernJS config
        this._wyvernProtocol = new wyvern_js_1.WyvernProtocol(provider, {
            network: this._networkName,
            gasPrice: apiConfig.gasPrice,
        });
        // WyvernJS config for readonly (optimization for infura calls)
        this._wyvernProtocolReadOnly = new wyvern_js_1.WyvernProtocol(readonlyProvider, {
            network: this._networkName,
            gasPrice: apiConfig.gasPrice,
        });
        // WrappedNFTLiquidationProxy Config
        this._wrappedNFTFactoryAddress = this._networkName == types_1.Network.Main ? constants_1.WRAPPED_NFT_FACTORY_ADDRESS_MAINNET : constants_1.WRAPPED_NFT_FACTORY_ADDRESS_RINKEBY;
        this._wrappedNFTLiquidationProxyAddress = this._networkName == types_1.Network.Main ? constants_1.WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_MAINNET : constants_1.WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_RINKEBY;
        this._uniswapFactoryAddress = this._networkName == types_1.Network.Main ? constants_1.UNISWAP_FACTORY_ADDRESS_MAINNET : constants_1.UNISWAP_FACTORY_ADDRESS_RINKEBY;
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
     * Wraps an arbirary group of NFTs into their corresponding WrappedNFT ERC20 tokens.
     * Emits the `WrapAssets` event when the transaction is prompted.
     * @param param0 __namedParameters Object
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to bundle together.
     * @param accountAddress Address of the user's wallet
     */
    OpenSeaPort.prototype.wrapAssets = function (_a) {
        var assets = _a.assets, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAssets, tokenIds, tokenAddresses, isMixedBatchOfAssets, gasPrice, txHash;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        schema = this._getSchema(types_1.WyvernSchemaName.ERC721);
                        wyAssets = assets.map(function (a) { return utils_1.getWyvernAsset(schema, a); });
                        tokenIds = wyAssets.map(function (a) { return a.id; });
                        tokenAddresses = wyAssets.map(function (a) { return a.address; });
                        isMixedBatchOfAssets = !tokenAddresses.every(function (val, i, arr) { return val === arr[0]; });
                        this._dispatch(types_1.EventType.WrapAssets, { assets: wyAssets, accountAddress: accountAddress });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _b.sent();
                        return [4 /*yield*/, utils_1.sendRawTransaction(this.web3, {
                                from: accountAddress,
                                to: this._wrappedNFTLiquidationProxyAddress,
                                value: 0,
                                data: schema_1.encodeCall(contracts_1.getMethod(contracts_1.WrappedNFTLiquidationProxy, 'wrapNFTs'), [tokenIds, tokenAddresses, isMixedBatchOfAssets]),
                                gasPrice: gasPrice
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 2:
                        txHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.WrapAssets, "Wrapping Assets")];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Unwraps an arbirary group of NFTs from their corresponding WrappedNFT ERC20 tokens back into ERC721 tokens.
     * Emits the `UnwrapAssets` event when the transaction is prompted.
     * @param param0 __namedParameters Object
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to bundle together.
     * @param destinationAddresses Addresses that each resulting ERC721 token will be sent to. Must be the same length as `tokenIds`. Each address corresponds with its respective token ID in the `tokenIds` array.
     * @param accountAddress Address of the user's wallet
     */
    OpenSeaPort.prototype.unwrapAssets = function (_a) {
        var assets = _a.assets, destinationAddresses = _a.destinationAddresses, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAssets, tokenIds, tokenAddresses, isMixedBatchOfAssets, gasPrice, txHash;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!assets || !destinationAddresses || assets.length != destinationAddresses.length) {
                            throw new Error("The 'assets' and 'destinationAddresses' arrays must exist and have the same length.");
                        }
                        schema = this._getSchema(types_1.WyvernSchemaName.ERC721);
                        wyAssets = assets.map(function (a) { return utils_1.getWyvernAsset(schema, a); });
                        tokenIds = wyAssets.map(function (a) { return a.id; });
                        tokenAddresses = wyAssets.map(function (a) { return a.address; });
                        isMixedBatchOfAssets = !tokenAddresses.every(function (val, i, arr) { return val === arr[0]; });
                        this._dispatch(types_1.EventType.UnwrapAssets, { assets: wyAssets, accountAddress: accountAddress });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _b.sent();
                        return [4 /*yield*/, utils_1.sendRawTransaction(this.web3, {
                                from: accountAddress,
                                to: this._wrappedNFTLiquidationProxyAddress,
                                value: 0,
                                data: schema_1.encodeCall(contracts_1.getMethod(contracts_1.WrappedNFTLiquidationProxy, 'unwrapNFTs'), [tokenIds, tokenAddresses, destinationAddresses, isMixedBatchOfAssets]),
                                gasPrice: gasPrice
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 2:
                        txHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.UnwrapAssets, "Unwrapping Assets")];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Liquidates an arbirary group of NFTs by atomically wrapping them into their
     * corresponding WrappedNFT ERC20 tokens, and then immediately selling those
     * ERC20 tokens on their corresponding Uniswap exchange.
     * Emits the `LiquidateAssets` event when the transaction is prompted.
     * @param param0 __namedParameters Object
     * @param assets An array of objects with the tokenId and tokenAddress of each of the assets to bundle together.
     * @param accountAddress Address of the user's wallet
     * @param uniswapSlippageAllowedInBasisPoints The amount of slippage that a user will tolerate in their Uniswap trade; if Uniswap cannot fulfill the order without more slippage, the whole function will revert.
     */
    OpenSeaPort.prototype.liquidateAssets = function (_a) {
        var assets = _a.assets, accountAddress = _a.accountAddress, uniswapSlippageAllowedInBasisPoints = _a.uniswapSlippageAllowedInBasisPoints;
        return __awaiter(this, void 0, void 0, function () {
            var uniswapSlippage, schema, wyAssets, tokenIds, tokenAddresses, isMixedBatchOfAssets, gasPrice, txHash;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        uniswapSlippage = uniswapSlippageAllowedInBasisPoints === 0 ? constants_1.DEFAULT_WRAPPED_NFT_LIQUIDATION_UNISWAP_SLIPPAGE_IN_BASIS_POINTS : uniswapSlippageAllowedInBasisPoints;
                        schema = this._getSchema(types_1.WyvernSchemaName.ERC721);
                        wyAssets = assets.map(function (a) { return utils_1.getWyvernAsset(schema, a); });
                        tokenIds = wyAssets.map(function (a) { return a.id; });
                        tokenAddresses = wyAssets.map(function (a) { return a.address; });
                        isMixedBatchOfAssets = !tokenAddresses.every(function (val, i, arr) { return val === arr[0]; });
                        this._dispatch(types_1.EventType.LiquidateAssets, { assets: wyAssets, accountAddress: accountAddress });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _b.sent();
                        return [4 /*yield*/, utils_1.sendRawTransaction(this.web3, {
                                from: accountAddress,
                                to: this._wrappedNFTLiquidationProxyAddress,
                                value: 0,
                                data: schema_1.encodeCall(contracts_1.getMethod(contracts_1.WrappedNFTLiquidationProxy, 'liquidateNFTs'), [tokenIds, tokenAddresses, isMixedBatchOfAssets, uniswapSlippage]),
                                gasPrice: gasPrice
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 2:
                        txHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.LiquidateAssets, "Liquidating Assets")];
                    case 3:
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
    OpenSeaPort.prototype.purchaseAssets = function (_a) {
        var numTokensToBuy = _a.numTokensToBuy, amount = _a.amount, contractAddress = _a.contractAddress, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var token, gasPrice, txHash;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        token = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther;
                        this._dispatch(types_1.EventType.PurchaseAssets, { amount: amount, contractAddress: contractAddress, accountAddress: accountAddress });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _b.sent();
                        return [4 /*yield*/, utils_1.sendRawTransaction(this.web3, {
                                from: accountAddress,
                                to: this._wrappedNFTLiquidationProxyAddress,
                                value: amount,
                                data: schema_1.encodeCall(contracts_1.getMethod(contracts_1.WrappedNFTLiquidationProxy, 'purchaseNFTs'), [numTokensToBuy, contractAddress]),
                                gasPrice: gasPrice
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 2:
                        txHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.PurchaseAssets, "Purchasing Assets")];
                    case 3:
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
    OpenSeaPort.prototype.getQuoteFromUniswap = function (_a) {
        var numTokens = _a.numTokens, isBuying = _a.isBuying, contractAddress = _a.contractAddress;
        return __awaiter(this, void 0, void 0, function () {
            var wrappedNFTFactoryContract, wrappedNFTFactory, wrappedNFTAddress, wrappedNFTContract, wrappedNFT, uniswapFactoryContract, uniswapFactory, uniswapExchangeAddress, uniswapExchangeContract, uniswapExchange, amount, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        wrappedNFTFactoryContract = this.web3ReadOnly.eth.contract(contracts_1.WrappedNFTFactory);
                        return [4 /*yield*/, wrappedNFTFactoryContract.at(this._wrappedNFTFactoryAddress)];
                    case 1:
                        wrappedNFTFactory = _d.sent();
                        return [4 /*yield*/, wrappedNFTFactory.nftContractToWrapperContract(contractAddress)];
                    case 2:
                        wrappedNFTAddress = _d.sent();
                        wrappedNFTContract = this.web3ReadOnly.eth.contract(contracts_1.WrappedNFT);
                        return [4 /*yield*/, wrappedNFTContract.at(wrappedNFTAddress)];
                    case 3:
                        wrappedNFT = _d.sent();
                        uniswapFactoryContract = this.web3ReadOnly.eth.contract(contracts_1.UniswapFactory);
                        return [4 /*yield*/, uniswapFactoryContract.at(this._uniswapFactoryAddress)];
                    case 4:
                        uniswapFactory = _d.sent();
                        return [4 /*yield*/, uniswapFactory.getExchange(wrappedNFTAddress)];
                    case 5:
                        uniswapExchangeAddress = _d.sent();
                        uniswapExchangeContract = this.web3ReadOnly.eth.contract(contracts_1.UniswapExchange);
                        return [4 /*yield*/, uniswapExchangeContract.at(uniswapExchangeAddress)
                            // Convert desired WNFT to wei
                        ];
                    case 6:
                        uniswapExchange = _d.sent();
                        amount = wyvern_js_1.WyvernProtocol.toBaseUnitAmount(utils_1.makeBigNumber(numTokens), wrappedNFT.decimals());
                        if (!isBuying) return [3 /*break*/, 8];
                        _b = parseInt;
                        return [4 /*yield*/, uniswapExchange.getEthToTokenOutputPrice(amount)];
                    case 7: return [2 /*return*/, _b.apply(void 0, [_d.sent()])];
                    case 8:
                        _c = parseInt;
                        return [4 /*yield*/, uniswapExchange.getTokenToEthInputPrice(amount)];
                    case 9: return [2 /*return*/, _c.apply(void 0, [_d.sent()])];
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
    OpenSeaPort.prototype.wrapEth = function (_a) {
        var amountInEth = _a.amountInEth, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var token, amount, gasPrice, txHash;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        token = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther;
                        amount = wyvern_js_1.WyvernProtocol.toBaseUnitAmount(utils_1.makeBigNumber(amountInEth), token.decimals);
                        this._dispatch(types_1.EventType.WrapEth, { accountAddress: accountAddress, amount: amount });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _b.sent();
                        return [4 /*yield*/, utils_1.sendRawTransaction(this.web3, {
                                from: accountAddress,
                                to: token.address,
                                value: amount,
                                data: schema_1.encodeCall(contracts_1.getMethod(contracts_1.CanonicalWETH, 'deposit'), []),
                                gasPrice: gasPrice
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 2:
                        txHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.WrapEth, "Wrapping ETH")];
                    case 3:
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
    OpenSeaPort.prototype.unwrapWeth = function (_a) {
        var amountInEth = _a.amountInEth, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var token, amount, gasPrice, txHash;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        token = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther;
                        amount = wyvern_js_1.WyvernProtocol.toBaseUnitAmount(utils_1.makeBigNumber(amountInEth), token.decimals);
                        this._dispatch(types_1.EventType.UnwrapWeth, { accountAddress: accountAddress, amount: amount });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _b.sent();
                        return [4 /*yield*/, utils_1.sendRawTransaction(this.web3, {
                                from: accountAddress,
                                to: token.address,
                                value: 0,
                                data: schema_1.encodeCall(contracts_1.getMethod(contracts_1.CanonicalWETH, 'withdraw'), [amount.toString()]),
                                gasPrice: gasPrice
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 2:
                        txHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.UnwrapWeth, "Unwrapping W-ETH")];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a buy order to make an offer on a bundle or group of assets.
     * Will throw an 'Insufficient balance' error if the maker doesn't have enough W-ETH to make the offer.
     * If the user hasn't approved W-ETH access yet, this will emit `ApproveCurrency` before asking for approval.
     * @param param0 __namedParameters Object
     * @param tokenIds DEPRECATED: Token IDs of the assets. Use `assets` instead.
     * @param tokenAddresses DEPRECATED: Addresses of the tokens' contracts. Use `assets` instead.
     * @param assets Array of Asset objects to bid on
     * @param accountAddress Address of the maker's wallet
     * @param startAmount Value of the offer, in units of the payment token (or wrapped ETH if no payment token address specified)
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire"
     * @param paymentTokenAddress Optional address for using an ERC-20 token in the order. If unspecified, defaults to W-ETH
     * @param sellOrder Optional sell order (like an English auction) to ensure fee and schema compatibility
     * @param schemaName The Wyvern schema name corresponding to the asset type. Defaults to "ERC721"
     * @param referrerAddress The optional address that referred the order
     */
    OpenSeaPort.prototype.createBundleBuyOrder = function (_a) {
        var assets = _a.assets, quantities = _a.quantities, accountAddress = _a.accountAddress, startAmount = _a.startAmount, _b = _a.expirationTime, expirationTime = _b === void 0 ? 0 : _b, paymentTokenAddress = _a.paymentTokenAddress, sellOrder = _a.sellOrder, referrerAddress = _a.referrerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var order, hashedOrder, signature, error_1, orderWithSignature;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        quantities = quantities || assets.map(function (a) { return 1; });
                        paymentTokenAddress = paymentTokenAddress || WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address;
                        return [4 /*yield*/, this._makeBundleBuyOrder({
                                assets: assets,
                                quantities: quantities,
                                accountAddress: accountAddress,
                                startAmount: startAmount,
                                expirationTime: expirationTime,
                                paymentTokenAddress: paymentTokenAddress,
                                extraBountyBasisPoints: 0,
                                sellOrder: sellOrder,
                                referrerAddress: referrerAddress
                            })
                            // NOTE not in Wyvern exchange code:
                            // frontend checks to make sure
                            // token is approved and sufficiently available
                        ];
                    case 1:
                        order = _c.sent();
                        // NOTE not in Wyvern exchange code:
                        // frontend checks to make sure
                        // token is approved and sufficiently available
                        return [4 /*yield*/, this._buyOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })];
                    case 2:
                        // NOTE not in Wyvern exchange code:
                        // frontend checks to make sure
                        // token is approved and sufficiently available
                        _c.sent();
                        hashedOrder = __assign({}, order, { hash: utils_1.getOrderHash(order) });
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this._authorizeOrder(hashedOrder)];
                    case 4:
                        signature = _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _c.sent();
                        console.error(error_1);
                        throw new Error("You declined to authorize your offer");
                    case 6:
                        orderWithSignature = __assign({}, hashedOrder, signature);
                        return [2 /*return*/, this.validateAndPostOrder(orderWithSignature)];
                }
            });
        });
    };
    /**
     * Create a buy order to make an offer on an asset.
     * Will throw an 'Insufficient balance' error if the maker doesn't have enough W-ETH to make the offer.
     * If the user hasn't approved W-ETH access yet, this will emit `ApproveCurrency` before asking for approval.
     * @param param0 __namedParameters Object
     * @param asset The asset to trade
     * @param accountAddress Address of the maker's wallet
     * @param startAmount Value of the offer, in units of the payment token (or wrapped ETH if no payment token address specified)
     * @param quantity The number of assets to bid for (if fungible or semi-fungible). Defaults to 1. In units, not base units, e.g. not wei.
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire"
     * @param paymentTokenAddress Optional address for using an ERC-20 token in the order. If unspecified, defaults to W-ETH
     * @param sellOrder Optional sell order (like an English auction) to ensure fee and schema compatibility
     * @param schemaName The Wyvern schema name corresponding to the asset type. Defaults to "ERC721"
     * @param referrerAddress The optional address that referred the order
     */
    OpenSeaPort.prototype.createBuyOrder = function (_a) {
        var asset = _a.asset, accountAddress = _a.accountAddress, startAmount = _a.startAmount, _b = _a.quantity, quantity = _b === void 0 ? 1 : _b, _c = _a.expirationTime, expirationTime = _c === void 0 ? 0 : _c, paymentTokenAddress = _a.paymentTokenAddress, sellOrder = _a.sellOrder, schemaName = _a.schemaName, referrerAddress = _a.referrerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var order, hashedOrder, signature, error_2, orderWithSignature;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        paymentTokenAddress = paymentTokenAddress || WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address;
                        schemaName = schemaName ||
                            (sellOrder && sellOrder.metadata.schema) ||
                            types_1.WyvernSchemaName.ERC721;
                        return [4 /*yield*/, this._makeBuyOrder({
                                asset: asset,
                                quantity: quantity,
                                accountAddress: accountAddress,
                                startAmount: startAmount,
                                expirationTime: expirationTime,
                                paymentTokenAddress: paymentTokenAddress,
                                extraBountyBasisPoints: 0,
                                sellOrder: sellOrder,
                                schemaName: schemaName,
                                referrerAddress: referrerAddress
                            })
                            // NOTE not in Wyvern exchange code:
                            // frontend checks to make sure
                            // token is approved and sufficiently available
                        ];
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
                        hashedOrder = __assign({}, order, { hash: utils_1.getOrderHash(order) });
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this._authorizeOrder(hashedOrder)];
                    case 4:
                        signature = _d.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _d.sent();
                        console.error(error_2);
                        throw new Error("You declined to authorize your offer");
                    case 6:
                        orderWithSignature = __assign({}, hashedOrder, signature);
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
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
     * @param waitForHighestBid If set to true, this becomes an English auction that increases in price for every bid. The highest bid wins when the auction expires, as long as it's at least `startAmount`. `expirationTime` must be > 0.
     * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
     * @param extraBountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of this order
     * @param buyerAddress Optional address that's allowed to purchase this item. If specified, no other address will be able to take the order, unless its value is the null address.
     * @param buyerEmail Optional email of the user that's allowed to purchase this item. If specified, a user will have to verify this email before being able to take the order.
     * @param schemaName The Wyvern schema name corresponding to the asset type
     */
    OpenSeaPort.prototype.createSellOrder = function (_a) {
        var asset = _a.asset, accountAddress = _a.accountAddress, startAmount = _a.startAmount, endAmount = _a.endAmount, _b = _a.quantity, quantity = _b === void 0 ? 1 : _b, _c = _a.expirationTime, expirationTime = _c === void 0 ? 0 : _c, _d = _a.waitForHighestBid, waitForHighestBid = _d === void 0 ? false : _d, paymentTokenAddress = _a.paymentTokenAddress, _e = _a.extraBountyBasisPoints, extraBountyBasisPoints = _e === void 0 ? 0 : _e, buyerAddress = _a.buyerAddress, buyerEmail = _a.buyerEmail, _f = _a.schemaName, schemaName = _f === void 0 ? types_1.WyvernSchemaName.ERC721 : _f;
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
                            expirationTime: expirationTime,
                            waitForHighestBid: waitForHighestBid,
                            paymentTokenAddress: paymentTokenAddress || constants_1.NULL_ADDRESS,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            buyerAddress: buyerAddress || constants_1.NULL_ADDRESS,
                            schemaName: schemaName
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
                        hashedOrder = __assign({}, order, { hash: utils_1.getOrderHash(order) });
                        _g.label = 5;
                    case 5:
                        _g.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this._authorizeOrder(hashedOrder)];
                    case 6:
                        signature = _g.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_3 = _g.sent();
                        console.error(error_3);
                        throw new Error("You declined to authorize your auction");
                    case 8:
                        orderWithSignature = __assign({}, hashedOrder, signature);
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
     * @param assetId Identifier for the asset, if you just want to post orders for one asset.
     * @param assetIds Identifiers for the assets, if you want to post orders for many assets at once.
     * @param factoryAddress Address of the factory contract
     * @param accountAddress Address of the factory owner's wallet
     * @param startAmount Price of the asset at the start of the auction, or minimum acceptable bid if it's an English auction. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param endAmount Optional price of the asset at the end of its expiration time. If not specified, will be set to `startAmount`. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param quantity The number of assets to sell at one time (if fungible or semi-fungible). Defaults to 1. In units, not base units, e.g. not wei.
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
     * @param waitForHighestBid If set to true, this becomes an English auction that increases in price for every bid. The highest bid wins when the auction expires, as long as it's at least `startAmount`. `expirationTime` must be > 0.
     * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
     * @param extraBountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of each order
     * @param buyerAddress Optional address that's allowed to purchase each item. If specified, no other address will be able to take each order.
     * @param buyerEmail Optional email of the user that's allowed to purchase each item. If specified, a user will have to verify this email before being able to take each order.
     * @param numberOfOrders Number of times to repeat creating the same order for each asset. If greater than 5, creates them in batches of 5. Requires an `apiKey` to be set during seaport initialization in order to not be throttled by the API.
     * @returns The number of orders created in total
     */
    OpenSeaPort.prototype.createFactorySellOrders = function (_a) {
        var assetId = _a.assetId, assetIds = _a.assetIds, factoryAddress = _a.factoryAddress, accountAddress = _a.accountAddress, startAmount = _a.startAmount, endAmount = _a.endAmount, _b = _a.quantity, quantity = _b === void 0 ? 1 : _b, _c = _a.expirationTime, expirationTime = _c === void 0 ? 0 : _c, _d = _a.waitForHighestBid, waitForHighestBid = _d === void 0 ? false : _d, paymentTokenAddress = _a.paymentTokenAddress, _e = _a.extraBountyBasisPoints, extraBountyBasisPoints = _e === void 0 ? 0 : _e, buyerAddress = _a.buyerAddress, buyerEmail = _a.buyerEmail, _f = _a.numberOfOrders, numberOfOrders = _f === void 0 ? 1 : _f, _g = _a.schemaName, schemaName = _g === void 0 ? types_1.WyvernSchemaName.ERC721 : _g;
        return __awaiter(this, void 0, void 0, function () {
            var factoryIds, assets, dummyOrder, _makeAndPostOneSellOrder, range, batches, numOrdersCreated, _i, batches_1, subRange, batchOrdersCreated;
            var _this = this;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (numberOfOrders < 1) {
                            throw new Error('Need to make at least one sell order');
                        }
                        factoryIds = assetIds || (assetId ? [assetId] : []);
                        if (!factoryIds.length) {
                            throw new Error('Need either one assetId or an array of assetIds');
                        }
                        assets = factoryIds.map(function (tokenId) { return ({ tokenAddress: factoryAddress, tokenId: tokenId }); });
                        return [4 /*yield*/, this._makeSellOrder({
                                asset: assets[0],
                                quantity: quantity,
                                accountAddress: accountAddress,
                                startAmount: startAmount,
                                endAmount: endAmount,
                                expirationTime: expirationTime,
                                waitForHighestBid: waitForHighestBid,
                                paymentTokenAddress: paymentTokenAddress || constants_1.NULL_ADDRESS,
                                extraBountyBasisPoints: extraBountyBasisPoints,
                                buyerAddress: buyerAddress || constants_1.NULL_ADDRESS,
                                schemaName: schemaName
                            })];
                    case 1:
                        dummyOrder = _h.sent();
                        return [4 /*yield*/, this._sellOrderValidationAndApprovals({ order: dummyOrder, accountAddress: accountAddress })];
                    case 2:
                        _h.sent();
                        _makeAndPostOneSellOrder = function (asset) { return __awaiter(_this, void 0, void 0, function () {
                            var order, hashedOrder, signature, error_4, orderWithSignature;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this._makeSellOrder({
                                            asset: asset,
                                            quantity: quantity,
                                            accountAddress: accountAddress,
                                            startAmount: startAmount,
                                            endAmount: endAmount,
                                            expirationTime: expirationTime,
                                            waitForHighestBid: waitForHighestBid,
                                            paymentTokenAddress: paymentTokenAddress || constants_1.NULL_ADDRESS,
                                            extraBountyBasisPoints: extraBountyBasisPoints,
                                            buyerAddress: buyerAddress || constants_1.NULL_ADDRESS,
                                            schemaName: schemaName
                                        })];
                                    case 1:
                                        order = _a.sent();
                                        if (!buyerEmail) return [3 /*break*/, 3];
                                        return [4 /*yield*/, this._createEmailWhitelistEntry({ order: order, buyerEmail: buyerEmail })];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3:
                                        hashedOrder = __assign({}, order, { hash: utils_1.getOrderHash(order) });
                                        _a.label = 4;
                                    case 4:
                                        _a.trys.push([4, 6, , 7]);
                                        return [4 /*yield*/, this._authorizeOrder(hashedOrder)];
                                    case 5:
                                        signature = _a.sent();
                                        return [3 /*break*/, 7];
                                    case 6:
                                        error_4 = _a.sent();
                                        console.error(error_4);
                                        throw new Error("You declined to authorize your auction, or your web3 provider can't sign using personal_sign. Try 'web3-provider-engine' and make sure a mnemonic is set. Just a reminder: there's no gas needed anymore to mint tokens!");
                                    case 7:
                                        orderWithSignature = __assign({}, hashedOrder, signature);
                                        return [2 /*return*/, this.validateAndPostOrder(orderWithSignature)];
                                }
                            });
                        }); };
                        range = _.range(numberOfOrders * assets.length);
                        batches = _.chunk(range, constants_1.SELL_ORDER_BATCH_SIZE);
                        numOrdersCreated = 0;
                        _i = 0, batches_1 = batches;
                        _h.label = 3;
                    case 3:
                        if (!(_i < batches_1.length)) return [3 /*break*/, 7];
                        subRange = batches_1[_i];
                        return [4 /*yield*/, Promise.all(subRange.map(function (assetOrderIndex) { return __awaiter(_this, void 0, void 0, function () {
                                var assetIndex;
                                return __generator(this, function (_a) {
                                    assetIndex = Math.floor(assetOrderIndex / numberOfOrders);
                                    return [2 /*return*/, _makeAndPostOneSellOrder(assets[assetIndex])];
                                });
                            }); }))];
                    case 4:
                        batchOrdersCreated = _h.sent();
                        this.logger("Created and posted a batch of " + batchOrdersCreated.length + " orders in parallel.");
                        numOrdersCreated += batchOrdersCreated.length;
                        // Don't overwhelm router
                        return [4 /*yield*/, utils_1.delay(1000)];
                    case 5:
                        // Don't overwhelm router
                        _h.sent();
                        _h.label = 6;
                    case 6:
                        _i++;
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
     * @param accountAddress The address of the maker of the bundle and the owner of all the assets.
     * @param startAmount Price of the asset at the start of the auction, or minimum acceptable bid if it's an English auction.
     * @param endAmount Optional price of the asset at the end of its expiration time. If not specified, will be set to `startAmount`.
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
     * @param waitForHighestBid If set to true, this becomes an English auction that increases in price for every bid. The highest bid wins when the auction expires, as long as it's at least `startAmount`. `expirationTime` must be > 0.
     * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
     * @param extraBountyBasisPoints Optional basis points (1/100th of a percent) to reward someone for referring the fulfillment of this order
     * @param buyerAddress Optional address that's allowed to purchase this bundle. If specified, no other address will be able to take the order, unless it's the null address.
     * @param schemaName The Wyvern schema name corresponding to the asset type
     */
    OpenSeaPort.prototype.createBundleSellOrder = function (_a) {
        var bundleName = _a.bundleName, bundleDescription = _a.bundleDescription, bundleExternalLink = _a.bundleExternalLink, assets = _a.assets, quantities = _a.quantities, accountAddress = _a.accountAddress, startAmount = _a.startAmount, endAmount = _a.endAmount, _b = _a.expirationTime, expirationTime = _b === void 0 ? 0 : _b, _c = _a.waitForHighestBid, waitForHighestBid = _c === void 0 ? false : _c, paymentTokenAddress = _a.paymentTokenAddress, _d = _a.extraBountyBasisPoints, extraBountyBasisPoints = _d === void 0 ? 0 : _d, buyerAddress = _a.buyerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var order, hashedOrder, signature, error_5, orderWithSignature;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        quantities = quantities || assets.map(function (a) { return 1; });
                        return [4 /*yield*/, this._makeBundleSellOrder({
                                bundleName: bundleName,
                                bundleDescription: bundleDescription,
                                bundleExternalLink: bundleExternalLink,
                                assets: assets,
                                quantities: quantities,
                                accountAddress: accountAddress,
                                startAmount: startAmount,
                                endAmount: endAmount,
                                expirationTime: expirationTime,
                                waitForHighestBid: waitForHighestBid,
                                paymentTokenAddress: paymentTokenAddress || constants_1.NULL_ADDRESS,
                                extraBountyBasisPoints: extraBountyBasisPoints,
                                buyerAddress: buyerAddress || constants_1.NULL_ADDRESS,
                            })];
                    case 1:
                        order = _e.sent();
                        return [4 /*yield*/, this._sellOrderValidationAndApprovals({ order: order, accountAddress: accountAddress })];
                    case 2:
                        _e.sent();
                        hashedOrder = __assign({}, order, { hash: utils_1.getOrderHash(order) });
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this._authorizeOrder(hashedOrder)];
                    case 4:
                        signature = _e.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_5 = _e.sent();
                        console.error(error_5);
                        throw new Error("You declined to authorize your auction");
                    case 6:
                        orderWithSignature = __assign({}, hashedOrder, signature);
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
     */
    OpenSeaPort.prototype.fulfillOrder = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress, recipientAddress = _a.recipientAddress, referrerAddress = _a.referrerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var matchingOrder, _b, buy, sell, metadata, transactionHash;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        matchingOrder = this._makeMatchingOrder({
                            order: order,
                            accountAddress: accountAddress,
                            recipientAddress: recipientAddress || accountAddress
                        });
                        _b = utils_1.assignOrdersToSides(order, matchingOrder), buy = _b.buy, sell = _b.sell;
                        metadata = this._getMetadata(order, referrerAddress);
                        return [4 /*yield*/, this._atomicMatch({ buy: buy, sell: sell, accountAddress: accountAddress, metadata: metadata })];
                    case 1:
                        transactionHash = _c.sent();
                        return [4 /*yield*/, this._confirmTransaction(transactionHash.toString(), types_1.EventType.MatchOrders, "Fulfilling order", function () { return __awaiter(_this, void 0, void 0, function () {
                                var isOpen;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._validateOrder(order)];
                                        case 1:
                                            isOpen = _a.sent();
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
     * Cancel an order on-chain, preventing it from ever being fulfilled.
     * @param param0 __namedParameters Object
     * @param order The order to cancel
     * @param accountAddress The order maker's wallet address
     */
    OpenSeaPort.prototype.cancelOrder = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var gasPrice, transactionHash;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._dispatch(types_1.EventType.CancelOrder, { order: order, accountAddress: accountAddress });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _b.sent();
                        return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.cancelOrder_.sendTransactionAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, order.v || 0, order.r || constants_1.NULL_BLOCK_HASH, order.s || constants_1.NULL_BLOCK_HASH, { from: accountAddress, gasPrice: gasPrice })];
                    case 2:
                        transactionHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(transactionHash.toString(), types_1.EventType.CancelOrder, "Cancelling order", function () { return __awaiter(_this, void 0, void 0, function () {
                                var isOpen;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._validateOrder(order)];
                                        case 1:
                                            isOpen = _a.sent();
                                            return [2 /*return*/, !isOpen];
                                    }
                                });
                            }); })];
                    case 3:
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
     * @param param0 __namedParamters Object
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
    OpenSeaPort.prototype.approveNonFungibleToken = function (_a) {
        var tokenId = _a.tokenId, tokenAddress = _a.tokenAddress, accountAddress = _a.accountAddress, proxyAddress = _a.proxyAddress, _b = _a.tokenAbi, tokenAbi = _b === void 0 ? contracts_1.ERC721 : _b, _c = _a.skipApproveAllIfTokenAddressIn, skipApproveAllIfTokenAddressIn = _c === void 0 ? [] : _c, _d = _a.schemaName, schemaName = _d === void 0 ? types_1.WyvernSchemaName.ERC721 : _d;
        return __awaiter(this, void 0, void 0, function () {
            var schema, tokenContract, erc721, approvalAllCheck, isApprovedForAll, gasPrice, txHash, error_6, approvalOneCheck, isApprovedForOne, gasPrice, txHash, error_7;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        schema = this._getSchema(schemaName);
                        tokenContract = this.web3.eth.contract(tokenAbi);
                        return [4 /*yield*/, tokenContract.at(tokenAddress)];
                    case 1:
                        erc721 = _e.sent();
                        if (!!proxyAddress) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._getProxy(accountAddress)];
                    case 2:
                        proxyAddress = (_e.sent()) || undefined;
                        if (!proxyAddress) {
                            throw new Error('Uninitialized account');
                        }
                        _e.label = 3;
                    case 3:
                        approvalAllCheck = function () { return __awaiter(_this, void 0, void 0, function () {
                            var isApprovedForAllRaw;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, utils_1.rawCall(this.web3ReadOnly, {
                                            from: accountAddress,
                                            to: erc721.address,
                                            data: erc721.isApprovedForAll.getData(accountAddress, proxyAddress)
                                        })];
                                    case 1:
                                        isApprovedForAllRaw = _a.sent();
                                        return [2 /*return*/, parseInt(isApprovedForAllRaw)];
                                }
                            });
                        }); };
                        return [4 /*yield*/, approvalAllCheck()];
                    case 4:
                        isApprovedForAll = _e.sent();
                        if (isApprovedForAll == 1) {
                            // Supports ApproveAll
                            this.logger('Already approved proxy for all tokens');
                            return [2 /*return*/, null];
                        }
                        if (!(isApprovedForAll == 0)) return [3 /*break*/, 10];
                        // Supports ApproveAll
                        //  not approved for all yet
                        if (skipApproveAllIfTokenAddressIn.includes(tokenAddress)) {
                            this.logger('Already approving proxy for all tokens in another transaction');
                            return [2 /*return*/, null];
                        }
                        skipApproveAllIfTokenAddressIn.push(tokenAddress);
                        _e.label = 5;
                    case 5:
                        _e.trys.push([5, 9, , 10]);
                        this._dispatch(types_1.EventType.ApproveAllAssets, {
                            accountAddress: accountAddress,
                            proxyAddress: proxyAddress,
                            contractAddress: tokenAddress
                        });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 6:
                        gasPrice = _e.sent();
                        return [4 /*yield*/, utils_1.sendRawTransaction(this.web3, {
                                from: accountAddress,
                                to: erc721.address,
                                data: erc721.setApprovalForAll.getData(proxyAddress, true),
                                gasPrice: gasPrice
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 7:
                        txHash = _e.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.ApproveAllAssets, 'Approving all tokens of this type for trading', function () { return __awaiter(_this, void 0, void 0, function () {
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
                    case 8:
                        _e.sent();
                        return [2 /*return*/, txHash];
                    case 9:
                        error_6 = _e.sent();
                        console.error(error_6);
                        throw new Error("Couldn't get permission to approve these tokens for trading. Their contract might not be implemented correctly. Please contact the developer!");
                    case 10:
                        // Does not support ApproveAll (ERC721 v1 or v2)
                        this.logger('Contract does not support Approve All');
                        approvalOneCheck = function () { return __awaiter(_this, void 0, void 0, function () {
                            var approvedAddr;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, utils_1.promisifyCall(function (c) { return erc721.getApproved.call(tokenId, c); })];
                                    case 1:
                                        approvedAddr = _a.sent();
                                        if (approvedAddr == proxyAddress) {
                                            this.logger('Already approved proxy for this token');
                                            return [2 /*return*/, true];
                                        }
                                        this.logger("Approve response: " + approvedAddr);
                                        if (!!approvedAddr) return [3 /*break*/, 3];
                                        return [4 /*yield*/, utils_1.getNonCompliantApprovalAddress(erc721, tokenId, accountAddress)];
                                    case 2:
                                        approvedAddr = _a.sent();
                                        if (approvedAddr == proxyAddress) {
                                            this.logger('Already approved proxy for this item');
                                            return [2 /*return*/, true];
                                        }
                                        this.logger("Special-case approve response: " + approvedAddr);
                                        _a.label = 3;
                                    case 3: return [2 /*return*/, false];
                                }
                            });
                        }); };
                        return [4 /*yield*/, approvalOneCheck()];
                    case 11:
                        isApprovedForOne = _e.sent();
                        if (isApprovedForOne) {
                            return [2 /*return*/, null];
                        }
                        _e.label = 12;
                    case 12:
                        _e.trys.push([12, 16, , 17]);
                        this._dispatch(types_1.EventType.ApproveAsset, {
                            accountAddress: accountAddress,
                            proxyAddress: proxyAddress,
                            asset: utils_1.getWyvernAsset(schema, { tokenId: tokenId, tokenAddress: tokenAddress })
                        });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 13:
                        gasPrice = _e.sent();
                        return [4 /*yield*/, utils_1.sendRawTransaction(this.web3, {
                                from: accountAddress,
                                to: erc721.address,
                                data: erc721.approve.getData(proxyAddress, tokenId),
                                gasPrice: gasPrice
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 14:
                        txHash = _e.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.ApproveAsset, "Approving single token for trading", approvalOneCheck)];
                    case 15:
                        _e.sent();
                        return [2 /*return*/, txHash];
                    case 16:
                        error_7 = _e.sent();
                        console.error(error_7);
                        throw new Error("Couldn't get permission to approve this token for trading. Its contract might not be implemented correctly. Please contact the developer!");
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Approve a fungible token (e.g. W-ETH) for use in trades.
     * Called internally, but exposed for dev flexibility.
     * Checks to see if the minimum amount is already approved, first.
     * @param param0 __namedParamters Object
     * @param accountAddress The user's wallet address
     * @param tokenAddress The contract address of the token being approved
     * @param proxyAddress The user's proxy address. If unspecified, uses the Wyvern token transfer proxy address.
     * @param minimumAmount The minimum amount needed to skip a transaction. Defaults to the max-integer.
     * @returns Transaction hash if a new transaction occurred, otherwise null
     */
    OpenSeaPort.prototype.approveFungibleToken = function (_a) {
        var accountAddress = _a.accountAddress, tokenAddress = _a.tokenAddress, proxyAddress = _a.proxyAddress, _b = _a.minimumAmount, minimumAmount = _b === void 0 ? wyvern_js_1.WyvernProtocol.MAX_UINT_256 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var approvedAmount, gasPrice, txHash;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        proxyAddress = proxyAddress || wyvern_js_1.WyvernProtocol.getTokenTransferProxyAddress(this._networkName);
                        return [4 /*yield*/, this._getApprovedTokenCount({
                                accountAddress: accountAddress,
                                tokenAddress: tokenAddress,
                                proxyAddress: proxyAddress
                            })];
                    case 1:
                        approvedAmount = _c.sent();
                        if (approvedAmount.toNumber() >= minimumAmount.toNumber()) {
                            this.logger('Already approved enough currency for trading');
                            return [2 /*return*/, null];
                        }
                        this.logger("Not enough token approved for trade: " + approvedAmount);
                        this._dispatch(types_1.EventType.ApproveCurrency, {
                            accountAddress: accountAddress,
                            contractAddress: tokenAddress,
                            proxyAddress: proxyAddress
                        });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 2:
                        gasPrice = _c.sent();
                        return [4 /*yield*/, utils_1.sendRawTransaction(this.web3, {
                                from: accountAddress,
                                to: tokenAddress,
                                data: schema_1.encodeCall(contracts_1.getMethod(contracts_1.ERC20, 'approve'), [proxyAddress, wyvern_js_1.WyvernProtocol.MAX_UINT_256.toString()]),
                                gasPrice: gasPrice
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: accountAddress });
                            })];
                    case 3:
                        txHash = _c.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.ApproveCurrency, "Approving currency for trading")];
                    case 4:
                        _c.sent();
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
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._wyvernProtocolReadOnly.wyvernExchange.calculateCurrentPrice_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata)];
                    case 1:
                        currentPrice = _a.sent();
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
     * @param param0 __namedParamters Object
     * @param order Order to check
     * @param accountAddress The account address that will be fulfilling the order
     * @param recipientAddress The optional address to receive the order's item(s) or curriencies. If not specified, defaults to accountAddress.
     * @param referrerAddress The optional address that referred the order
     */
    OpenSeaPort.prototype.isOrderFulfillable = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress, recipientAddress = _a.recipientAddress, referrerAddress = _a.referrerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var matchingOrder, _b, buy, sell, metadata, gas;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        matchingOrder = this._makeMatchingOrder({
                            order: order,
                            accountAddress: accountAddress,
                            recipientAddress: recipientAddress || accountAddress
                        });
                        _b = utils_1.assignOrdersToSides(order, matchingOrder), buy = _b.buy, sell = _b.sell;
                        metadata = this._getMetadata(order, referrerAddress);
                        return [4 /*yield*/, this._estimateGasForMatch({ buy: buy, sell: sell, accountAddress: accountAddress, metadata: metadata })];
                    case 1:
                        gas = _c.sent();
                        this.logger("Gas estimate for " + (order.side == types_1.OrderSide.Sell ? "sell" : "buy") + " order: " + gas);
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
     * @param param0 __namedParamters Object
     * @param tokenId DEPRECATED: Token ID. Use `asset` instead.
     * @param tokenAddress DEPRECATED: Address of the token's contract. Use `asset` instead.
     * @param asset The asset to trade
     * @param fromAddress The account address that currently owns the asset
     * @param toAddress The account address that will be acquiring the asset
     * @param quantity The amount of the asset to transfer, if it's fungible (optional). In units (not base units), e.g. not wei.
     * @param useProxy Use the `fromAddress`'s proxy contract only if the `fromAddress` has already approved the asset for sale. Required if checking an ERC-721 v1 asset (like CryptoKitties) that doesn't check if the transferFrom caller is the owner of the asset (only allowing it if it's an approved address).
     * @param schemaName The Wyvern schema name corresponding to the asset type
     * @param retries How many times to retry if false
     */
    OpenSeaPort.prototype.isAssetTransferrable = function (_a, retries) {
        var asset = _a.asset, fromAddress = _a.fromAddress, toAddress = _a.toAddress, quantity = _a.quantity, _b = _a.useProxy, useProxy = _b === void 0 ? false : _b;
        if (retries === void 0) { retries = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var schema, quantityBN, wyAsset, abi, from, proxyAddress, data, gas, error_8;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        schema = this._getSchema(asset.schemaName);
                        quantityBN = quantity
                            ? wyvern_js_1.WyvernProtocol.toBaseUnitAmount(utils_1.makeBigNumber(quantity), asset.decimals || 0)
                            : utils_1.makeBigNumber(1);
                        wyAsset = utils_1.getWyvernAsset(schema, asset, quantityBN);
                        abi = asset.schemaName === types_1.WyvernSchemaName.ERC20
                            ? utils_1.annotateERC20TransferABI(wyAsset)
                            : schema.functions.transfer(wyAsset);
                        from = fromAddress;
                        if (!useProxy) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._getProxy(fromAddress)];
                    case 1:
                        proxyAddress = _c.sent();
                        if (!proxyAddress) {
                            console.error("This asset's owner (" + fromAddress + ") does not have a proxy!");
                            return [2 /*return*/, false];
                        }
                        from = proxyAddress;
                        _c.label = 2;
                    case 2:
                        data = schema_1.encodeTransferCall(abi, fromAddress, toAddress);
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 8]);
                        return [4 /*yield*/, utils_1.estimateGas(this._getClientsForRead(retries).web3, {
                                from: from,
                                to: abi.target,
                                data: data
                            })];
                    case 4:
                        gas = _c.sent();
                        return [2 /*return*/, gas > 0];
                    case 5:
                        error_8 = _c.sent();
                        if (retries <= 0) {
                            console.error(error_8);
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, utils_1.delay(500)];
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
     * @param schemaName The Wyvern schema name corresponding to the asset type.
     * Defaults to "ERC721" (non-fungible) assets, but can be ERC1155, ERC20, and others.
     * @returns Transaction hash
     */
    OpenSeaPort.prototype.transfer = function (_a) {
        var fromAddress = _a.fromAddress, toAddress = _a.toAddress, asset = _a.asset, _b = _a.quantity, quantity = _b === void 0 ? 1 : _b, _c = _a.schemaName, schemaName = _c === void 0 ? types_1.WyvernSchemaName.ERC721 : _c;
        return __awaiter(this, void 0, void 0, function () {
            var schema, quantityBN, wyAsset, isCryptoKitties, isOldNFT, abi, gasPrice, data, txHash;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        schema = this._getSchema(schemaName);
                        quantityBN = wyvern_js_1.WyvernProtocol.toBaseUnitAmount(utils_1.makeBigNumber(quantity), asset.decimals || 0);
                        wyAsset = utils_1.getWyvernAsset(schema, asset, quantityBN);
                        isCryptoKitties = [constants_1.CK_ADDRESS, constants_1.CK_RINKEBY_ADDRESS].includes(wyAsset.address);
                        isOldNFT = isCryptoKitties || !!asset.version && [
                            types_1.TokenStandardVersion.ERC721v1, types_1.TokenStandardVersion.ERC721v2
                        ].includes(asset.version);
                        abi = schemaName === types_1.WyvernSchemaName.ERC20
                            ? utils_1.annotateERC20TransferABI(wyAsset)
                            : isOldNFT
                                ? utils_1.annotateERC721TransferABI(wyAsset)
                                : schema.functions.transfer(wyAsset);
                        this._dispatch(types_1.EventType.TransferOne, { accountAddress: fromAddress, toAddress: toAddress, asset: wyAsset });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _d.sent();
                        data = schema_1.encodeTransferCall(abi, fromAddress, toAddress);
                        return [4 /*yield*/, utils_1.sendRawTransaction(this.web3, {
                                from: fromAddress,
                                to: abi.target,
                                data: data,
                                gasPrice: gasPrice
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: fromAddress });
                            })];
                    case 2:
                        txHash = _d.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.TransferOne, "Transferring asset")];
                    case 3:
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
     * @param schemaName The Wyvern schema name corresponding to the asset type
     * @returns Transaction hash
     */
    OpenSeaPort.prototype.transferAll = function (_a) {
        var assets = _a.assets, fromAddress = _a.fromAddress, toAddress = _a.toAddress, _b = _a.schemaName, schemaName = _b === void 0 ? types_1.WyvernSchemaName.ERC721 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAssets, calldata, proxyAddress, gasPrice, txHash;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        toAddress = utils_1.validateAndFormatWalletAddress(this.web3ReadOnly, toAddress);
                        schema = this._getSchema(schemaName);
                        wyAssets = assets.map(function (asset) { return utils_1.getWyvernAsset(schema, asset); });
                        calldata = schema_1.encodeAtomicizedTransfer(schema, wyAssets, fromAddress, toAddress, this._wyvernProtocol.wyvernAtomicizer).calldata;
                        return [4 /*yield*/, this._getProxy(fromAddress)];
                    case 1:
                        proxyAddress = _c.sent();
                        if (!!proxyAddress) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._initializeProxy(fromAddress)];
                    case 2:
                        proxyAddress = _c.sent();
                        _c.label = 3;
                    case 3: return [4 /*yield*/, this._approveAll({ schema: schema, wyAssets: wyAssets, accountAddress: fromAddress, proxyAddress: proxyAddress })];
                    case 4:
                        _c.sent();
                        this._dispatch(types_1.EventType.TransferAll, { accountAddress: fromAddress, toAddress: toAddress, assets: wyAssets });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 5:
                        gasPrice = _c.sent();
                        return [4 /*yield*/, utils_1.sendRawTransaction(this.web3, {
                                from: fromAddress,
                                to: proxyAddress,
                                data: schema_1.encodeProxyCall(wyvern_js_1.WyvernProtocol.getAtomicizerContractAddress(this._networkName), types_1.HowToCall.DelegateCall, calldata),
                                gasPrice: gasPrice
                            }, function (error) {
                                _this._dispatch(types_1.EventType.TransactionDenied, { error: error, accountAddress: fromAddress });
                            })];
                    case 6:
                        txHash = _c.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.TransferAll, "Transferring " + assets.length + " asset" + (assets.length == 1 ? '' : 's'))];
                    case 7:
                        _c.sent();
                        return [2 /*return*/, txHash];
                }
            });
        });
    };
    /**
     * Get known payment tokens (ERC-20) that match your filters.
     * @param param0 __namedParamters Object
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
    OpenSeaPort.prototype.getFungibleTokens = function (_a) {
        var _b = _a === void 0 ? {} : _a, symbol = _b.symbol, address = _b.address, name = _b.name;
        return __awaiter(this, void 0, void 0, function () {
            var tokenSettings, tokens, offlineTokens;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        utils_1.onDeprecated("Use `api.getPaymentTokens` instead");
                        tokenSettings = WyvernSchemas.tokens[this._networkName];
                        return [4 /*yield*/, this.api.getPaymentTokens({ symbol: symbol, address: address, name: name })];
                    case 1:
                        tokens = (_c.sent()).tokens;
                        offlineTokens = [
                            tokenSettings.canonicalWrappedEther
                        ].concat(tokenSettings.otherTokens).filter(function (t) {
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
                        return [2 /*return*/, offlineTokens.concat(tokens)];
                }
            });
        });
    };
    /**
     * Get the balance of a fungible token.
     * @param param0 __namedParameters Object
     * @param accountAddress User's account address
     * @param tokenAddress Optional address of the token's contract.
     *  Defaults to W-ETH
     * @param tokenAbi ABI for the token's contract. Defaults to ERC20
     */
    OpenSeaPort.prototype.getTokenBalance = function (_a) {
        var accountAddress = _a.accountAddress, tokenAddress = _a.tokenAddress, _b = _a.tokenAbi, tokenAbi = _b === void 0 ? contracts_1.ERC20 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var amount;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!tokenAddress) {
                            tokenAddress = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address;
                        }
                        return [4 /*yield*/, utils_1.rawCall(this.web3ReadOnly, {
                                from: accountAddress,
                                to: tokenAddress,
                                data: schema_1.encodeCall(contracts_1.getMethod(tokenAbi, 'balanceOf'), [accountAddress]),
                            })];
                    case 1:
                        amount = _c.sent();
                        return [2 /*return*/, utils_1.makeBigNumber(amount.toString())];
                }
            });
        });
    };
    /**
     * Compute the fees for an order
     * @param param0 __namedParameters
     * @param asset Addresses and id of asset (null if a bundle, unless all assets are from the same contract, then the first asset)
     * @param assetContract Optional prefetched asset contract (including fees) to use instead of assets
     * @param side The side of the order (buy or sell)
     * @param accountAddress The account to check fees for (useful if fees differ by account, like transfer fees)
     * @param isPrivate Whether the order is private or not (known taker)
     * @param extraBountyBasisPoints The basis points to add for the bounty. Will throw if it exceeds the assets' contract's OpenSea fee.
     */
    OpenSeaPort.prototype.computeFees = function (_a) {
        var asset = _a.asset, assetContract = _a.assetContract, side = _a.side, accountAddress = _a.accountAddress, _b = _a.isPrivate, isPrivate = _b === void 0 ? false : _b, _c = _a.extraBountyBasisPoints, extraBountyBasisPoints = _c === void 0 ? 0 : _c;
        return __awaiter(this, void 0, void 0, function () {
            var totalBuyerFeeBPS, totalSellerFeeBPS, openseaBuyerFeeBPS, openseaSellerFeeBPS, devBuyerFeeBPS, devSellerFeeBPS, transferFee, transferFeeTokenAddress, maxTotalBountyBPS, result, error_9, sellerBountyBPS, bountyTooLarge, errorMessage;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        totalBuyerFeeBPS = constants_1.DEFAULT_BUYER_FEE_BASIS_POINTS;
                        totalSellerFeeBPS = constants_1.DEFAULT_SELLER_FEE_BASIS_POINTS;
                        openseaBuyerFeeBPS = totalBuyerFeeBPS;
                        openseaSellerFeeBPS = totalSellerFeeBPS;
                        devBuyerFeeBPS = 0;
                        devSellerFeeBPS = 0;
                        transferFee = utils_1.makeBigNumber(0);
                        transferFeeTokenAddress = null;
                        maxTotalBountyBPS = constants_1.DEFAULT_MAX_BOUNTY;
                        if (asset != null) {
                            assetContract = asset.assetContract;
                        }
                        if (assetContract) {
                            totalBuyerFeeBPS = assetContract.buyerFeeBasisPoints;
                            totalSellerFeeBPS = assetContract.sellerFeeBasisPoints;
                            openseaBuyerFeeBPS = assetContract.openseaBuyerFeeBasisPoints;
                            openseaSellerFeeBPS = assetContract.openseaSellerFeeBasisPoints;
                            devBuyerFeeBPS = assetContract.devBuyerFeeBasisPoints;
                            devSellerFeeBPS = assetContract.devSellerFeeBasisPoints;
                            maxTotalBountyBPS = openseaSellerFeeBPS;
                        }
                        if (!(side == types_1.OrderSide.Sell && asset)) return [3 /*break*/, 4];
                        // Server-side knowledge
                        transferFee = asset.transferFee
                            ? utils_1.makeBigNumber(asset.transferFee)
                            : transferFee;
                        transferFeeTokenAddress = asset.transferFeePaymentToken
                            ? asset.transferFeePaymentToken.address
                            : transferFeeTokenAddress;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, utils_1.getTransferFeeSettings(this.web3ReadOnly, { asset: asset, accountAddress: accountAddress })];
                    case 2:
                        result = _d.sent();
                        transferFee = result.transferFee != null ? result.transferFee : transferFee;
                        transferFeeTokenAddress = result.transferFeeTokenAddress || transferFeeTokenAddress;
                        return [3 /*break*/, 4];
                    case 3:
                        error_9 = _d.sent();
                        // Use server defaults
                        console.error(error_9);
                        return [3 /*break*/, 4];
                    case 4:
                        sellerBountyBPS = side == types_1.OrderSide.Sell
                            ? extraBountyBasisPoints
                            : 0;
                        bountyTooLarge = sellerBountyBPS + constants_1.OPENSEA_SELLER_BOUNTY_BASIS_POINTS > maxTotalBountyBPS;
                        if (sellerBountyBPS > 0 && bountyTooLarge) {
                            errorMessage = "Total bounty exceeds the maximum for this asset type (" + maxTotalBountyBPS / 100 + "%).";
                            if (maxTotalBountyBPS >= constants_1.OPENSEA_SELLER_BOUNTY_BASIS_POINTS) {
                                errorMessage += " Remember that OpenSea will add " + constants_1.OPENSEA_SELLER_BOUNTY_BASIS_POINTS / 100 + "% for referrers with OpenSea accounts!";
                            }
                            throw new Error(errorMessage);
                        }
                        // Remove fees for private orders
                        if (isPrivate) {
                            totalBuyerFeeBPS = 0;
                            totalSellerFeeBPS = 0;
                            openseaBuyerFeeBPS = 0;
                            openseaSellerFeeBPS = 0;
                            devBuyerFeeBPS = 0;
                            devSellerFeeBPS = 0;
                            sellerBountyBPS = 0;
                        }
                        return [2 /*return*/, {
                                totalBuyerFeeBPS: totalBuyerFeeBPS,
                                totalSellerFeeBPS: totalSellerFeeBPS,
                                openseaBuyerFeeBPS: openseaBuyerFeeBPS,
                                openseaSellerFeeBPS: openseaSellerFeeBPS,
                                devBuyerFeeBPS: devBuyerFeeBPS,
                                devSellerFeeBPS: devSellerFeeBPS,
                                sellerBountyBPS: sellerBountyBPS,
                                transferFee: transferFee,
                                transferFeeTokenAddress: transferFeeTokenAddress,
                            }];
                }
            });
        });
    };
    /**
     * Validate and post an order to the OpenSea orderbook.
     * @param order The order to post. Can either be signed by the maker or pre-approved on the Wyvern contract using approveOrder. See https://github.com/ProjectWyvern/wyvern-ethereum/blob/master/contracts/exchange/Exchange.sol#L178
     * @returns The order as stored by the orderbook
     */
    OpenSeaPort.prototype.validateAndPostOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, confirmedOrder;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._wyvernProtocolReadOnly.wyvernExchange.hashOrder_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata)];
                    case 1:
                        hash = _a.sent();
                        if (hash !== order.hash) {
                            console.error(order);
                            throw new Error("Order couldn't be validated by the exchange due to a hash mismatch. Make sure your wallet is on the right network!");
                        }
                        this.logger('Order hashes match');
                        return [4 /*yield*/, this.api.postOrder(utils_1.orderToJSON(order))];
                    case 2:
                        confirmedOrder = _a.sent();
                        return [2 /*return*/, confirmedOrder];
                }
            });
        });
    };
    /**
     * Compute the gas price for sending a txn, in wei
     * Will be slightly above the mean to make it faster
     */
    OpenSeaPort.prototype._computeGasPrice = function () {
        return __awaiter(this, void 0, void 0, function () {
            var meanGas, weiToAdd;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.getCurrentGasPrice(this.web3)];
                    case 1:
                        meanGas = _a.sent();
                        weiToAdd = this.web3.toWei(this.gasPriceAddition, 'gwei');
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
    OpenSeaPort.prototype._estimateGasForMatch = function (_a, retries) {
        var buy = _a.buy, sell = _a.sell, accountAddress = _a.accountAddress, _b = _a.metadata, metadata = _b === void 0 ? constants_1.NULL_BLOCK_HASH : _b;
        if (retries === void 0) { retries = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var value, error_10;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(buy.maker.toLowerCase() == accountAddress.toLowerCase() && buy.paymentToken == constants_1.NULL_ADDRESS)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._getRequiredAmountForTakingSellOrder(sell)];
                    case 1:
                        value = _c.sent();
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 7]);
                        return [4 /*yield*/, this._getClientsForRead(retries).wyvernProtocol.wyvernExchange.atomicMatch_.estimateGasAsync([buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken], [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt], [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall], buy.calldata, sell.calldata, buy.replacementPattern, sell.replacementPattern, buy.staticExtradata, sell.staticExtradata, [
                                buy.v || 0,
                                sell.v || 0
                            ], [
                                buy.r || constants_1.NULL_BLOCK_HASH,
                                buy.s || constants_1.NULL_BLOCK_HASH,
                                sell.r || constants_1.NULL_BLOCK_HASH,
                                sell.s || constants_1.NULL_BLOCK_HASH,
                                metadata
                            ], 
                            // Typescript error in estimate gas method, so use any
                            { from: accountAddress, value: value })];
                    case 3: return [2 /*return*/, _c.sent()];
                    case 4:
                        error_10 = _c.sent();
                        if (retries <= 0) {
                            console.error(error_10);
                            return [2 /*return*/, undefined];
                        }
                        return [4 /*yield*/, utils_1.delay(200)];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, this._estimateGasForMatch({ buy: buy, sell: sell, accountAddress: accountAddress, metadata: metadata }, retries - 1)];
                    case 6: return [2 /*return*/, _c.sent()];
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
     * @param schemaName The Wyvern schema name corresponding to the asset type
     */
    OpenSeaPort.prototype._estimateGasForTransfer = function (_a) {
        var assets = _a.assets, fromAddress = _a.fromAddress, toAddress = _a.toAddress, _b = _a.schemaName, schemaName = _b === void 0 ? types_1.WyvernSchemaName.ERC721 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAssets, proxyAddress, calldata;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        schema = this._getSchema(schemaName);
                        wyAssets = assets.map(function (asset) { return utils_1.getWyvernAsset(schema, asset); });
                        return [4 /*yield*/, this._getProxy(fromAddress)];
                    case 1:
                        proxyAddress = _c.sent();
                        if (!proxyAddress) {
                            throw new Error('Uninitialized proxy address');
                        }
                        return [4 /*yield*/, this._approveAll({ schema: schema, wyAssets: wyAssets, accountAddress: fromAddress, proxyAddress: proxyAddress })];
                    case 2:
                        _c.sent();
                        calldata = schema_1.encodeAtomicizedTransfer(schema, wyAssets, fromAddress, toAddress, this._wyvernProtocol.wyvernAtomicizer).calldata;
                        return [2 /*return*/, utils_1.estimateGas(this.web3, {
                                from: fromAddress,
                                to: proxyAddress,
                                data: schema_1.encodeProxyCall(wyvern_js_1.WyvernProtocol.getAtomicizerContractAddress(this._networkName), types_1.HowToCall.DelegateCall, calldata)
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
     */
    OpenSeaPort.prototype._getProxy = function (accountAddress, retries) {
        if (retries === void 0) { retries = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var proxyAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._wyvernProtocolReadOnly.wyvernProxyRegistry.proxies.callAsync(accountAddress)];
                    case 1:
                        proxyAddress = _a.sent();
                        if (proxyAddress == '0x') {
                            throw new Error("Couldn't retrieve your account from the blockchain - make sure you're on the correct Ethereum network!");
                        }
                        if (!(!proxyAddress || proxyAddress == constants_1.NULL_ADDRESS)) return [3 /*break*/, 5];
                        if (!(retries > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, utils_1.delay(1000)];
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
     */
    OpenSeaPort.prototype._initializeProxy = function (accountAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var gasPrice, txnData, gasEstimate, transactionHash, proxyAddress;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._dispatch(types_1.EventType.InitializeAccount, { accountAddress: accountAddress });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _a.sent();
                        txnData = { from: accountAddress, gasPrice: gasPrice };
                        return [4 /*yield*/, this._wyvernProtocolReadOnly.wyvernProxyRegistry.registerProxy.estimateGasAsync(txnData)];
                    case 2:
                        gasEstimate = _a.sent();
                        return [4 /*yield*/, this._wyvernProtocol.wyvernProxyRegistry.registerProxy.sendTransactionAsync(__assign({}, txnData, { gas: this._correctGasAmount(gasEstimate) }))];
                    case 3:
                        transactionHash = _a.sent();
                        return [4 /*yield*/, this._confirmTransaction(transactionHash, types_1.EventType.InitializeAccount, "Initializing proxy for account", function () { return __awaiter(_this, void 0, void 0, function () {
                                var polledProxy;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._getProxy(accountAddress)];
                                        case 1:
                                            polledProxy = _a.sent();
                                            return [2 /*return*/, !!polledProxy];
                                    }
                                });
                            }); })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this._getProxy(accountAddress, 2)];
                    case 5:
                        proxyAddress = _a.sent();
                        if (!proxyAddress) {
                            throw new Error('Failed to initialize your account :( Please restart your wallet/browser and try again!');
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
     * @param param0 __namedParamters Object
     * @param accountAddress Address for the user's wallet
     * @param tokenAddress Address for the token's contract
     * @param proxyAddress User's proxy address. If undefined, uses the token transfer proxy address
     */
    OpenSeaPort.prototype._getApprovedTokenCount = function (_a) {
        var accountAddress = _a.accountAddress, tokenAddress = _a.tokenAddress, proxyAddress = _a.proxyAddress;
        return __awaiter(this, void 0, void 0, function () {
            var addressToApprove, approved;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!tokenAddress) {
                            tokenAddress = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address;
                        }
                        addressToApprove = proxyAddress || wyvern_js_1.WyvernProtocol.getTokenTransferProxyAddress(this._networkName);
                        return [4 /*yield*/, utils_1.rawCall(this.web3ReadOnly, {
                                from: accountAddress,
                                to: tokenAddress,
                                data: schema_1.encodeCall(contracts_1.getMethod(contracts_1.ERC20, 'allowance'), [accountAddress, addressToApprove]),
                            })];
                    case 1:
                        approved = _b.sent();
                        return [2 /*return*/, utils_1.makeBigNumber(approved)];
                }
            });
        });
    };
    OpenSeaPort.prototype._makeBuyOrder = function (_a) {
        var asset = _a.asset, quantity = _a.quantity, accountAddress = _a.accountAddress, startAmount = _a.startAmount, _b = _a.expirationTime, expirationTime = _b === void 0 ? 0 : _b, paymentTokenAddress = _a.paymentTokenAddress, _c = _a.extraBountyBasisPoints, extraBountyBasisPoints = _c === void 0 ? 0 : _c, sellOrder = _a.sellOrder, schemaName = _a.schemaName, referrerAddress = _a.referrerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var schema, quantityBN, wyAsset, makerRelayerFee, takerRelayerFee, taker, openSeaAsset, _d, totalBuyerFeeBPS, totalSellerFeeBPS, _e, target, calldata, replacementPattern, _f, basePrice, extra, paymentToken, times, _g, staticTarget, staticExtradata;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        accountAddress = utils_1.validateAndFormatWalletAddress(this.web3ReadOnly, accountAddress);
                        schema = this._getSchema(schemaName);
                        quantityBN = wyvern_js_1.WyvernProtocol.toBaseUnitAmount(utils_1.makeBigNumber(quantity), asset.decimals || 0);
                        wyAsset = utils_1.getWyvernAsset(schema, asset, quantityBN);
                        return [4 /*yield*/, this.api.getAsset(asset.tokenAddress, asset.tokenId)];
                    case 1:
                        openSeaAsset = _h.sent();
                        if (!sellOrder) return [3 /*break*/, 2];
                        // Use the sell order's fees to ensure compatiblity and force the order
                        // to only be acceptable by the sell order maker.
                        // Swap maker/taker depending on whether it's an English auction (taker)
                        // TODO add extraBountyBasisPoints when making bidder bounties
                        makerRelayerFee = sellOrder.waitingForBestCounterOrder
                            ? utils_1.makeBigNumber(sellOrder.makerRelayerFee)
                            : utils_1.makeBigNumber(sellOrder.takerRelayerFee);
                        takerRelayerFee = sellOrder.waitingForBestCounterOrder
                            ? utils_1.makeBigNumber(sellOrder.takerRelayerFee)
                            : utils_1.makeBigNumber(sellOrder.makerRelayerFee);
                        taker = sellOrder.maker;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.computeFees({ asset: openSeaAsset, extraBountyBasisPoints: extraBountyBasisPoints, side: types_1.OrderSide.Buy })];
                    case 3:
                        _d = _h.sent(), totalBuyerFeeBPS = _d.totalBuyerFeeBPS, totalSellerFeeBPS = _d.totalSellerFeeBPS;
                        makerRelayerFee = utils_1.makeBigNumber(totalBuyerFeeBPS);
                        takerRelayerFee = utils_1.makeBigNumber(totalSellerFeeBPS);
                        taker = constants_1.NULL_ADDRESS;
                        _h.label = 4;
                    case 4:
                        _e = schema_1.encodeBuy(schema, wyAsset, accountAddress), target = _e.target, calldata = _e.calldata, replacementPattern = _e.replacementPattern;
                        return [4 /*yield*/, this._getPriceParameters(types_1.OrderSide.Buy, paymentTokenAddress, expirationTime, startAmount)];
                    case 5:
                        _f = _h.sent(), basePrice = _f.basePrice, extra = _f.extra, paymentToken = _f.paymentToken;
                        times = this._getTimeParameters(expirationTime);
                        return [4 /*yield*/, this._getStaticCallTargetAndExtraData({ asset: openSeaAsset, useTxnOriginStaticCall: false })];
                    case 6:
                        _g = _h.sent(), staticTarget = _g.staticTarget, staticExtradata = _g.staticExtradata;
                        return [2 /*return*/, {
                                exchange: wyvern_js_1.WyvernProtocol.getExchangeContractAddress(this._networkName),
                                maker: accountAddress,
                                taker: taker,
                                quantity: quantityBN,
                                makerRelayerFee: makerRelayerFee,
                                takerRelayerFee: takerRelayerFee,
                                makerProtocolFee: utils_1.makeBigNumber(0),
                                takerProtocolFee: utils_1.makeBigNumber(0),
                                makerReferrerFee: utils_1.makeBigNumber(0),
                                waitingForBestCounterOrder: false,
                                feeMethod: types_1.FeeMethod.SplitFee,
                                feeRecipient: constants_1.OPENSEA_FEE_RECIPIENT,
                                side: types_1.OrderSide.Buy,
                                saleKind: types_1.SaleKind.FixedPrice,
                                target: target,
                                howToCall: types_1.HowToCall.Call,
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
                                    referrerAddress: referrerAddress
                                }
                            }];
                }
            });
        });
    };
    OpenSeaPort.prototype._makeSellOrder = function (_a) {
        var asset = _a.asset, quantity = _a.quantity, accountAddress = _a.accountAddress, startAmount = _a.startAmount, endAmount = _a.endAmount, expirationTime = _a.expirationTime, waitForHighestBid = _a.waitForHighestBid, paymentTokenAddress = _a.paymentTokenAddress, extraBountyBasisPoints = _a.extraBountyBasisPoints, buyerAddress = _a.buyerAddress, schemaName = _a.schemaName;
        return __awaiter(this, void 0, void 0, function () {
            var schema, quantityBN, wyAsset, isPrivate, openSeaAsset, _b, totalSellerFeeBPS, totalBuyerFeeBPS, sellerBountyBPS, _c, target, calldata, replacementPattern, orderSaleKind, _d, basePrice, extra, paymentToken, times, feeRecipient, makerRelayerFee, takerRelayerFee, _e, staticTarget, staticExtradata;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        accountAddress = utils_1.validateAndFormatWalletAddress(this.web3ReadOnly, accountAddress);
                        schema = this._getSchema(schemaName);
                        quantityBN = wyvern_js_1.WyvernProtocol.toBaseUnitAmount(utils_1.makeBigNumber(quantity), asset.decimals || 0);
                        wyAsset = utils_1.getWyvernAsset(schema, asset, quantityBN);
                        isPrivate = buyerAddress != constants_1.NULL_ADDRESS;
                        return [4 /*yield*/, this.api.getAsset(asset.tokenAddress, asset.tokenId)];
                    case 1:
                        openSeaAsset = _f.sent();
                        return [4 /*yield*/, this.computeFees({ asset: openSeaAsset, side: types_1.OrderSide.Sell, isPrivate: isPrivate, extraBountyBasisPoints: extraBountyBasisPoints })];
                    case 2:
                        _b = _f.sent(), totalSellerFeeBPS = _b.totalSellerFeeBPS, totalBuyerFeeBPS = _b.totalBuyerFeeBPS, sellerBountyBPS = _b.sellerBountyBPS;
                        _c = schema_1.encodeSell(schema, wyAsset, accountAddress), target = _c.target, calldata = _c.calldata, replacementPattern = _c.replacementPattern;
                        orderSaleKind = endAmount != null && endAmount !== startAmount
                            ? types_1.SaleKind.DutchAuction
                            : types_1.SaleKind.FixedPrice;
                        return [4 /*yield*/, this._getPriceParameters(types_1.OrderSide.Sell, paymentTokenAddress, expirationTime, startAmount, endAmount, waitForHighestBid)];
                    case 3:
                        _d = _f.sent(), basePrice = _d.basePrice, extra = _d.extra, paymentToken = _d.paymentToken;
                        times = this._getTimeParameters(expirationTime, waitForHighestBid);
                        feeRecipient = waitForHighestBid
                            ? constants_1.NULL_ADDRESS
                            : constants_1.OPENSEA_FEE_RECIPIENT;
                        makerRelayerFee = waitForHighestBid
                            ? utils_1.makeBigNumber(totalBuyerFeeBPS)
                            : utils_1.makeBigNumber(totalSellerFeeBPS);
                        takerRelayerFee = waitForHighestBid
                            ? utils_1.makeBigNumber(totalSellerFeeBPS)
                            : utils_1.makeBigNumber(totalBuyerFeeBPS);
                        return [4 /*yield*/, this._getStaticCallTargetAndExtraData({ asset: openSeaAsset, useTxnOriginStaticCall: waitForHighestBid })];
                    case 4:
                        _e = _f.sent(), staticTarget = _e.staticTarget, staticExtradata = _e.staticExtradata;
                        return [2 /*return*/, {
                                exchange: wyvern_js_1.WyvernProtocol.getExchangeContractAddress(this._networkName),
                                maker: accountAddress,
                                taker: buyerAddress,
                                quantity: quantityBN,
                                makerRelayerFee: makerRelayerFee,
                                takerRelayerFee: takerRelayerFee,
                                makerProtocolFee: utils_1.makeBigNumber(0),
                                takerProtocolFee: utils_1.makeBigNumber(0),
                                makerReferrerFee: utils_1.makeBigNumber(sellerBountyBPS),
                                waitingForBestCounterOrder: waitForHighestBid,
                                feeMethod: types_1.FeeMethod.SplitFee,
                                feeRecipient: feeRecipient,
                                side: types_1.OrderSide.Sell,
                                saleKind: orderSaleKind,
                                target: target,
                                howToCall: types_1.HowToCall.Call,
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
                                }
                            }];
                }
            });
        });
    };
    OpenSeaPort.prototype._getStaticCallTargetAndExtraData = function (_a) {
        var asset = _a.asset, useTxnOriginStaticCall = _a.useTxnOriginStaticCall;
        return __awaiter(this, void 0, void 0, function () {
            var isCheezeWizards, isDecentralandEstate, isMainnet, cheezeWizardsBasicTournamentAddress, cheezeWizardsBasicTournamentABI, cheezeWizardsBasicTournmentInstance, wizardFingerprint, decentralandEstateAddress, decentralandEstateABI, decentralandEstateInstance, estateFingerprint;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        isCheezeWizards = [
                            constants_1.CHEEZE_WIZARDS_GUILD_ADDRESS.toLowerCase(),
                            constants_1.CHEEZE_WIZARDS_GUILD_RINKEBY_ADDRESS.toLowerCase()
                        ].includes(asset.tokenAddress.toLowerCase());
                        isDecentralandEstate = asset.tokenAddress.toLowerCase() == constants_1.DECENTRALAND_ESTATE_ADDRESS.toLowerCase();
                        isMainnet = this._networkName == types_1.Network.Main;
                        if (isMainnet && !useTxnOriginStaticCall) {
                            // While testing, we will use dummy values for mainnet. We will remove this if-statement once we have pushed the PR once and tested on Rinkeby
                            return [2 /*return*/, {
                                    staticTarget: constants_1.NULL_ADDRESS,
                                    staticExtradata: '0x',
                                }];
                        }
                        if (!isCheezeWizards) return [3 /*break*/, 3];
                        cheezeWizardsBasicTournamentAddress = isMainnet ? constants_1.CHEEZE_WIZARDS_BASIC_TOURNAMENT_ADDRESS : constants_1.CHEEZE_WIZARDS_BASIC_TOURNAMENT_RINKEBY_ADDRESS;
                        cheezeWizardsBasicTournamentABI = this.web3ReadOnly.eth.contract(contracts_1.CheezeWizardsBasicTournament);
                        return [4 /*yield*/, cheezeWizardsBasicTournamentABI.at(cheezeWizardsBasicTournamentAddress)];
                    case 1:
                        cheezeWizardsBasicTournmentInstance = _b.sent();
                        return [4 /*yield*/, utils_1.rawCall(this.web3ReadOnly, {
                                to: cheezeWizardsBasicTournmentInstance.address,
                                data: cheezeWizardsBasicTournmentInstance.wizardFingerprint.getData(asset.tokenId)
                            })];
                    case 2:
                        wizardFingerprint = _b.sent();
                        return [2 /*return*/, {
                                staticTarget: isMainnet
                                    ? constants_1.STATIC_CALL_CHEEZE_WIZARDS_ADDRESS
                                    : constants_1.STATIC_CALL_CHEEZE_WIZARDS_RINKEBY_ADDRESS,
                                staticExtradata: schema_1.encodeCall(contracts_1.getMethod(contracts_1.StaticCheckCheezeWizards, 'succeedIfCurrentWizardFingerprintMatchesProvidedWizardFingerprint'), [asset.tokenId, wizardFingerprint, useTxnOriginStaticCall]),
                            }];
                    case 3:
                        if (!(isDecentralandEstate && isMainnet)) return [3 /*break*/, 6];
                        decentralandEstateAddress = constants_1.DECENTRALAND_ESTATE_ADDRESS;
                        decentralandEstateABI = this.web3ReadOnly.eth.contract(contracts_1.DecentralandEstates);
                        return [4 /*yield*/, decentralandEstateABI.at(decentralandEstateAddress)];
                    case 4:
                        decentralandEstateInstance = _b.sent();
                        return [4 /*yield*/, utils_1.rawCall(this.web3ReadOnly, {
                                to: decentralandEstateInstance.address,
                                data: decentralandEstateInstance.getFingerprint.getData(asset.tokenId)
                            })];
                    case 5:
                        estateFingerprint = _b.sent();
                        return [2 /*return*/, {
                                staticTarget: constants_1.STATIC_CALL_DECENTRALAND_ESTATES_ADDRESS,
                                staticExtradata: schema_1.encodeCall(contracts_1.getMethod(contracts_1.StaticCheckDecentralandEstates, 'succeedIfCurrentEstateFingerprintMatchesProvidedEstateFingerprint'), [asset.tokenId, estateFingerprint, useTxnOriginStaticCall]),
                            }];
                    case 6:
                        if (useTxnOriginStaticCall) {
                            return [2 /*return*/, {
                                    staticTarget: isMainnet
                                        ? constants_1.STATIC_CALL_TX_ORIGIN_ADDRESS
                                        : constants_1.STATIC_CALL_TX_ORIGIN_RINKEBY_ADDRESS,
                                    staticExtradata: schema_1.encodeCall(contracts_1.getMethod(contracts_1.StaticCheckTxOrigin, 'succeedIfTxOriginMatchesHardcodedAddress'), []),
                                }];
                        }
                        else {
                            // Noop - no checks
                            return [2 /*return*/, {
                                    staticTarget: constants_1.NULL_ADDRESS,
                                    staticExtradata: '0x',
                                }];
                        }
                        _b.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    OpenSeaPort.prototype._makeBundleBuyOrder = function (_a) {
        var assets = _a.assets, quantities = _a.quantities, accountAddress = _a.accountAddress, startAmount = _a.startAmount, _b = _a.expirationTime, expirationTime = _b === void 0 ? 0 : _b, paymentTokenAddress = _a.paymentTokenAddress, _c = _a.extraBountyBasisPoints, extraBountyBasisPoints = _c === void 0 ? 0 : _c, sellOrder = _a.sellOrder, referrerAddress = _a.referrerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var quantityBNs, schemas, bundle, makerRelayerFee, takerRelayerFee, taker, asset, _d, tokenAddress, tokenId, _e, totalBuyerFeeBPS, totalSellerFeeBPS, _f, calldata, replacementPattern, _g, basePrice, extra, paymentToken, times;
            var _this = this;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        accountAddress = utils_1.validateAndFormatWalletAddress(this.web3ReadOnly, accountAddress);
                        quantityBNs = quantities.map(function (quantity, i) { return wyvern_js_1.WyvernProtocol.toBaseUnitAmount(utils_1.makeBigNumber(quantity), assets[i].decimals || 0); });
                        schemas = assets.map(function (a) { return _this._getSchema(a.schemaName); });
                        bundle = utils_1.getWyvernBundle(assets, schemas, quantityBNs);
                        if (!sellOrder) return [3 /*break*/, 1];
                        // Use the sell order's fees to ensure compatiblity
                        // Swap maker/taker depending on whether it's an English auction (taker)
                        // TODO add extraBountyBasisPoints when making bidder bounties
                        makerRelayerFee = sellOrder.waitingForBestCounterOrder
                            ? utils_1.makeBigNumber(sellOrder.makerRelayerFee)
                            : utils_1.makeBigNumber(sellOrder.takerRelayerFee);
                        takerRelayerFee = sellOrder.waitingForBestCounterOrder
                            ? utils_1.makeBigNumber(sellOrder.takerRelayerFee)
                            : utils_1.makeBigNumber(sellOrder.makerRelayerFee);
                        taker = sellOrder.maker;
                        return [3 /*break*/, 5];
                    case 1:
                        asset = null;
                        if (!(assets && _.uniqBy(assets, function (a) { return a.tokenAddress; }).length == 1)) return [3 /*break*/, 3];
                        _d = assets[0], tokenAddress = _d.tokenAddress, tokenId = _d.tokenId;
                        return [4 /*yield*/, this.api.getAsset(tokenAddress, tokenId)];
                    case 2:
                        asset = _h.sent();
                        _h.label = 3;
                    case 3: return [4 /*yield*/, this.computeFees({ asset: asset, extraBountyBasisPoints: extraBountyBasisPoints, side: types_1.OrderSide.Buy })];
                    case 4:
                        _e = _h.sent(), totalBuyerFeeBPS = _e.totalBuyerFeeBPS, totalSellerFeeBPS = _e.totalSellerFeeBPS;
                        makerRelayerFee = utils_1.makeBigNumber(totalBuyerFeeBPS);
                        takerRelayerFee = utils_1.makeBigNumber(totalSellerFeeBPS);
                        taker = constants_1.NULL_ADDRESS;
                        _h.label = 5;
                    case 5:
                        _f = schema_1.encodeAtomicizedBuy(schemas, bundle.assets, accountAddress, this._wyvernProtocol.wyvernAtomicizer), calldata = _f.calldata, replacementPattern = _f.replacementPattern;
                        if (!calldata || !replacementPattern) {
                            throw new Error("Failed to encode");
                        }
                        return [4 /*yield*/, this._getPriceParameters(types_1.OrderSide.Buy, paymentTokenAddress, expirationTime, startAmount)];
                    case 6:
                        _g = _h.sent(), basePrice = _g.basePrice, extra = _g.extra, paymentToken = _g.paymentToken;
                        times = this._getTimeParameters(expirationTime);
                        return [2 /*return*/, {
                                exchange: wyvern_js_1.WyvernProtocol.getExchangeContractAddress(this._networkName),
                                maker: accountAddress,
                                taker: taker,
                                quantity: utils_1.makeBigNumber(1),
                                makerRelayerFee: makerRelayerFee,
                                takerRelayerFee: takerRelayerFee,
                                makerProtocolFee: utils_1.makeBigNumber(0),
                                takerProtocolFee: utils_1.makeBigNumber(0),
                                makerReferrerFee: utils_1.makeBigNumber(0),
                                waitingForBestCounterOrder: false,
                                feeMethod: types_1.FeeMethod.SplitFee,
                                feeRecipient: constants_1.OPENSEA_FEE_RECIPIENT,
                                side: types_1.OrderSide.Buy,
                                saleKind: types_1.SaleKind.FixedPrice,
                                target: wyvern_js_1.WyvernProtocol.getAtomicizerContractAddress(this._networkName),
                                howToCall: types_1.HowToCall.DelegateCall,
                                calldata: calldata,
                                replacementPattern: replacementPattern,
                                staticTarget: constants_1.NULL_ADDRESS,
                                staticExtradata: '0x',
                                paymentToken: paymentToken,
                                basePrice: basePrice,
                                extra: extra,
                                listingTime: times.listingTime,
                                expirationTime: times.expirationTime,
                                salt: wyvern_js_1.WyvernProtocol.generatePseudoRandomSalt(),
                                metadata: {
                                    bundle: bundle,
                                    referrerAddress: referrerAddress,
                                    // TODO deprecate
                                    schema: schemas[0].name
                                }
                            }];
                }
            });
        });
    };
    OpenSeaPort.prototype._makeBundleSellOrder = function (_a) {
        var bundleName = _a.bundleName, bundleDescription = _a.bundleDescription, bundleExternalLink = _a.bundleExternalLink, assets = _a.assets, quantities = _a.quantities, accountAddress = _a.accountAddress, startAmount = _a.startAmount, endAmount = _a.endAmount, expirationTime = _a.expirationTime, waitForHighestBid = _a.waitForHighestBid, paymentTokenAddress = _a.paymentTokenAddress, extraBountyBasisPoints = _a.extraBountyBasisPoints, buyerAddress = _a.buyerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var quantityBNs, bundle, isPrivate, asset, _b, tokenAddress, tokenId, _c, totalSellerFeeBPS, totalBuyerFeeBPS, sellerBountyBPS, schemas, _d, calldata, replacementPattern, _e, basePrice, extra, paymentToken, times, orderSaleKind, feeRecipient;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        accountAddress = utils_1.validateAndFormatWalletAddress(this.web3ReadOnly, accountAddress);
                        quantityBNs = quantities.map(function (quantity, i) { return wyvern_js_1.WyvernProtocol.toBaseUnitAmount(utils_1.makeBigNumber(quantity), assets[i].decimals || 0); });
                        bundle = utils_1.getWyvernBundle(assets, assets.map(function (a) { return _this._getSchema(a.schemaName); }), quantityBNs);
                        bundle.name = bundleName;
                        bundle.description = bundleDescription;
                        bundle.external_link = bundleExternalLink;
                        isPrivate = buyerAddress != constants_1.NULL_ADDRESS;
                        asset = null;
                        if (!(assets && _.uniqBy(assets, function (a) { return a.tokenAddress; }).length == 1)) return [3 /*break*/, 2];
                        _b = assets[0], tokenAddress = _b.tokenAddress, tokenId = _b.tokenId;
                        return [4 /*yield*/, this.api.getAsset(tokenAddress, tokenId)];
                    case 1:
                        asset = _f.sent();
                        _f.label = 2;
                    case 2: return [4 /*yield*/, this.computeFees({ asset: asset, side: types_1.OrderSide.Sell, isPrivate: isPrivate, extraBountyBasisPoints: extraBountyBasisPoints })];
                    case 3:
                        _c = _f.sent(), totalSellerFeeBPS = _c.totalSellerFeeBPS, totalBuyerFeeBPS = _c.totalBuyerFeeBPS, sellerBountyBPS = _c.sellerBountyBPS;
                        schemas = bundle.schemas.map(function (name) { return _this._getSchema(name); });
                        _d = schema_1.encodeAtomicizedSell(schemas, bundle.assets, accountAddress, this._wyvernProtocol.wyvernAtomicizer), calldata = _d.calldata, replacementPattern = _d.replacementPattern;
                        if (!calldata || !replacementPattern) {
                            throw new Error("Failed to encode");
                        }
                        return [4 /*yield*/, this._getPriceParameters(types_1.OrderSide.Sell, paymentTokenAddress, expirationTime, startAmount, endAmount, waitForHighestBid)];
                    case 4:
                        _e = _f.sent(), basePrice = _e.basePrice, extra = _e.extra, paymentToken = _e.paymentToken;
                        times = this._getTimeParameters(expirationTime, waitForHighestBid);
                        orderSaleKind = endAmount != null && endAmount !== startAmount
                            ? types_1.SaleKind.DutchAuction
                            : types_1.SaleKind.FixedPrice;
                        feeRecipient = waitForHighestBid
                            ? constants_1.NULL_ADDRESS
                            : constants_1.OPENSEA_FEE_RECIPIENT;
                        return [2 /*return*/, {
                                exchange: wyvern_js_1.WyvernProtocol.getExchangeContractAddress(this._networkName),
                                maker: accountAddress,
                                taker: buyerAddress,
                                quantity: utils_1.makeBigNumber(1),
                                makerRelayerFee: utils_1.makeBigNumber(totalSellerFeeBPS),
                                takerRelayerFee: utils_1.makeBigNumber(totalBuyerFeeBPS),
                                makerProtocolFee: utils_1.makeBigNumber(0),
                                takerProtocolFee: utils_1.makeBigNumber(0),
                                makerReferrerFee: utils_1.makeBigNumber(sellerBountyBPS),
                                waitingForBestCounterOrder: waitForHighestBid,
                                feeMethod: types_1.FeeMethod.SplitFee,
                                feeRecipient: feeRecipient,
                                side: types_1.OrderSide.Sell,
                                saleKind: orderSaleKind,
                                target: wyvern_js_1.WyvernProtocol.getAtomicizerContractAddress(this._networkName),
                                howToCall: types_1.HowToCall.DelegateCall,
                                calldata: calldata,
                                replacementPattern: replacementPattern,
                                staticTarget: constants_1.NULL_ADDRESS,
                                staticExtradata: '0x',
                                paymentToken: paymentToken,
                                basePrice: basePrice,
                                extra: extra,
                                listingTime: times.listingTime,
                                expirationTime: times.expirationTime,
                                salt: wyvern_js_1.WyvernProtocol.generatePseudoRandomSalt(),
                                metadata: {
                                    bundle: bundle,
                                    // TODO deprecate
                                    schema: schemas[0].name
                                }
                            }];
                }
            });
        });
    };
    OpenSeaPort.prototype._makeMatchingOrder = function (_a) {
        var _this = this;
        var order = _a.order, accountAddress = _a.accountAddress, recipientAddress = _a.recipientAddress;
        accountAddress = utils_1.validateAndFormatWalletAddress(this.web3ReadOnly, accountAddress);
        recipientAddress = utils_1.validateAndFormatWalletAddress(this.web3ReadOnly, recipientAddress);
        var computeOrderParams = function () {
            if ('asset' in order.metadata) {
                var schema = _this._getSchema(order.metadata.schema);
                return order.side == types_1.OrderSide.Buy
                    ? schema_1.encodeSell(schema, order.metadata.asset, recipientAddress)
                    : schema_1.encodeBuy(schema, order.metadata.asset, recipientAddress);
            }
            else if ('bundle' in order.metadata) {
                // We're matching a bundle order
                var bundle = order.metadata.bundle;
                var schemas = bundle.schemas
                    ? bundle.schemas.map(function (schemaName) { return _this._getSchema(schemaName); })
                    // Backwards compat:
                    : bundle.assets.map(function (asset, i) { return _this._getSchema(order.metadata.schema); });
                var atomicized = order.side == types_1.OrderSide.Buy
                    ? schema_1.encodeAtomicizedSell(schemas, order.metadata.bundle.assets, recipientAddress, _this._wyvernProtocol.wyvernAtomicizer)
                    : schema_1.encodeAtomicizedBuy(schemas, order.metadata.bundle.assets, recipientAddress, _this._wyvernProtocol.wyvernAtomicizer);
                return {
                    target: wyvern_js_1.WyvernProtocol.getAtomicizerContractAddress(_this._networkName),
                    calldata: atomicized.calldata,
                    replacementPattern: atomicized.replacementPattern
                };
            }
            else {
                throw new Error('Invalid order metadata');
            }
        };
        var _b = computeOrderParams(), target = _b.target, calldata = _b.calldata, replacementPattern = _b.replacementPattern;
        if (!calldata || !replacementPattern) {
            throw new Error("Failed to encode");
        }
        var times = this._getTimeParameters(0);
        // Compat for matching buy orders that have fee recipient still on them
        var feeRecipient = order.feeRecipient == constants_1.NULL_ADDRESS
            ? constants_1.OPENSEA_FEE_RECIPIENT
            : constants_1.NULL_ADDRESS;
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
            staticExtradata: '0x',
            paymentToken: order.paymentToken,
            basePrice: order.basePrice,
            extra: utils_1.makeBigNumber(0),
            listingTime: times.listingTime,
            expirationTime: times.expirationTime,
            salt: wyvern_js_1.WyvernProtocol.generatePseudoRandomSalt(),
            metadata: order.metadata,
        };
        return __assign({}, matchingOrder, { hash: utils_1.getOrderHash(matchingOrder) });
    };
    /**
     * Validate against Wyvern that a buy and sell order can match
     * @param param0 __namedParamters Object
     * @param buy The buy order to validate
     * @param sell The sell order to validate
     * @param accountAddress Address for the user's wallet
     * @param shouldValidateBuy Whether to validate the buy order individually.
     * @param shouldValidateSell Whether to validate the sell order individually.
     * @param retries How many times to retry if validation fails
     */
    OpenSeaPort.prototype._validateMatch = function (_a, retries) {
        var buy = _a.buy, sell = _a.sell, accountAddress = _a.accountAddress, _b = _a.shouldValidateBuy, shouldValidateBuy = _b === void 0 ? false : _b, _c = _a.shouldValidateSell, shouldValidateSell = _c === void 0 ? false : _c;
        if (retries === void 0) { retries = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var buyValid, sellValid, canMatch, calldataCanMatch, error_11;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 7, , 10]);
                        if (!shouldValidateBuy) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._validateOrder(buy)];
                    case 1:
                        buyValid = _d.sent();
                        this.logger("Buy order is valid: " + buyValid);
                        if (!buyValid) {
                            throw new Error('Invalid buy order. It may have recently been removed. Please refresh the page and try again!');
                        }
                        _d.label = 2;
                    case 2:
                        if (!shouldValidateSell) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._validateOrder(sell)];
                    case 3:
                        sellValid = _d.sent();
                        this.logger("Sell order is valid: " + sellValid);
                        if (!sellValid) {
                            throw new Error('Invalid sell order. It may have recently been removed. Please refresh the page and try again!');
                        }
                        _d.label = 4;
                    case 4: return [4 /*yield*/, debugging_1.requireOrdersCanMatch(this._getClientsForRead(retries).wyvernProtocol, { buy: buy, sell: sell, accountAddress: accountAddress })];
                    case 5:
                        canMatch = _d.sent();
                        this.logger("Orders matching: " + canMatch);
                        return [4 /*yield*/, debugging_1.requireOrderCalldataCanMatch(this._getClientsForRead(retries).wyvernProtocol, { buy: buy, sell: sell })];
                    case 6:
                        calldataCanMatch = _d.sent();
                        this.logger("Order calldata matching: " + calldataCanMatch);
                        return [2 /*return*/, true];
                    case 7:
                        error_11 = _d.sent();
                        if (retries <= 0) {
                            throw new Error("Error matching this listing: " + error_11.message + ". Please contact the maker or try again later!");
                        }
                        return [4 /*yield*/, utils_1.delay(500)];
                    case 8:
                        _d.sent();
                        return [4 /*yield*/, this._validateMatch({ buy: buy, sell: sell, accountAddress: accountAddress, shouldValidateBuy: shouldValidateBuy, shouldValidateSell: shouldValidateSell }, retries - 1)];
                    case 9: return [2 /*return*/, _d.sent()];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    // For creating email whitelists on order takers
    OpenSeaPort.prototype._createEmailWhitelistEntry = function (_a) {
        var order = _a.order, buyerEmail = _a.buyerEmail;
        return __awaiter(this, void 0, void 0, function () {
            var asset;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        asset = 'asset' in order.metadata
                            ? order.metadata.asset
                            : undefined;
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
    // Throws
    OpenSeaPort.prototype._sellOrderValidationAndApprovals = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAssets, tokenAddress, minimumAmount, sellValid;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        schema = this._getSchema(order.metadata.schema);
                        wyAssets = 'bundle' in order.metadata
                            ? order.metadata.bundle.assets
                            : order.metadata.asset
                                ? [order.metadata.asset]
                                : [];
                        tokenAddress = order.paymentToken;
                        return [4 /*yield*/, this._approveAll({ schema: schema, wyAssets: wyAssets, accountAddress: accountAddress })
                            // For fulfilling bids,
                            // need to approve access to fungible token because of the way fees are paid
                            // This can be done at a higher level to show UI
                        ];
                    case 1:
                        _b.sent();
                        if (!(tokenAddress != constants_1.NULL_ADDRESS)) return [3 /*break*/, 3];
                        minimumAmount = utils_1.makeBigNumber(order.basePrice);
                        return [4 /*yield*/, this.approveFungibleToken({ accountAddress: accountAddress, tokenAddress: tokenAddress, minimumAmount: minimumAmount })];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [4 /*yield*/, this._wyvernProtocolReadOnly.wyvernExchange.validateOrderParameters_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, { from: accountAddress })];
                    case 4:
                        sellValid = _b.sent();
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
    OpenSeaPort.prototype._approveOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var accountAddress, gasPrice, includeInOrderBook, transactionHash;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accountAddress = order.maker;
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _a.sent();
                        includeInOrderBook = true;
                        this._dispatch(types_1.EventType.ApproveOrder, { order: order, accountAddress: accountAddress });
                        return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.approveOrder_.sendTransactionAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, includeInOrderBook, { from: accountAddress, gasPrice: gasPrice })];
                    case 2:
                        transactionHash = _a.sent();
                        return [4 /*yield*/, this._confirmTransaction(transactionHash.toString(), types_1.EventType.ApproveOrder, "Approving order", function () { return __awaiter(_this, void 0, void 0, function () {
                                var isApproved;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._validateOrder(order)];
                                        case 1:
                                            isApproved = _a.sent();
                                            return [2 /*return*/, isApproved];
                                    }
                                });
                            }); })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, transactionHash];
                }
            });
        });
    };
    OpenSeaPort.prototype._validateOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var isValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._wyvernProtocolReadOnly.wyvernExchange.validateOrder_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, order.v || 0, order.r || constants_1.NULL_BLOCK_HASH, order.s || constants_1.NULL_BLOCK_HASH)];
                    case 1:
                        isValid = _a.sent();
                        return [2 /*return*/, isValid];
                }
            });
        });
    };
    OpenSeaPort.prototype._approveAll = function (_a) {
        var schema = _a.schema, wyAssets = _a.wyAssets, accountAddress = _a.accountAddress, proxyAddress = _a.proxyAddress;
        return __awaiter(this, void 0, void 0, function () {
            var schemaName, _b, contractsWithApproveAll;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        schemaName = schema.name;
                        _b = proxyAddress;
                        if (_b) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._getProxy(accountAddress)];
                    case 1:
                        _b = (_c.sent());
                        _c.label = 2;
                    case 2:
                        proxyAddress = _b || undefined;
                        if (!!proxyAddress) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._initializeProxy(accountAddress)];
                    case 3:
                        proxyAddress = _c.sent();
                        _c.label = 4;
                    case 4:
                        contractsWithApproveAll = [];
                        return [2 /*return*/, Promise.all(wyAssets.map(function (wyAsset) { return __awaiter(_this, void 0, void 0, function () {
                                var isOwner, error_12, _a, wyNFTAsset, wyFTAsset;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _b.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, this._ownsAssetOnChain({
                                                    accountAddress: accountAddress,
                                                    proxyAddress: proxyAddress,
                                                    wyAsset: wyAsset,
                                                    schemaName: schemaName
                                                })];
                                        case 1:
                                            isOwner = _b.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            error_12 = _b.sent();
                                            // let it through for assets we don't support yet
                                            isOwner = true;
                                            return [3 /*break*/, 3];
                                        case 3:
                                            if (!isOwner) {
                                                throw new Error('You do not own enough of this asset.');
                                            }
                                            _a = schemaName;
                                            switch (_a) {
                                                case types_1.WyvernSchemaName.ERC721: return [3 /*break*/, 4];
                                                case types_1.WyvernSchemaName.ERC1155: return [3 /*break*/, 4];
                                                case types_1.WyvernSchemaName.LegacyEnjin: return [3 /*break*/, 4];
                                                case types_1.WyvernSchemaName.ENSShortNameAuction: return [3 /*break*/, 4];
                                                case types_1.WyvernSchemaName.ERC20: return [3 /*break*/, 6];
                                            }
                                            return [3 /*break*/, 8];
                                        case 4:
                                            wyNFTAsset = wyAsset;
                                            return [4 /*yield*/, this.approveNonFungibleToken({
                                                    tokenId: wyNFTAsset.id.toString(),
                                                    tokenAddress: wyNFTAsset.address,
                                                    accountAddress: accountAddress,
                                                    proxyAddress: proxyAddress,
                                                    skipApproveAllIfTokenAddressIn: contractsWithApproveAll
                                                })];
                                        case 5: return [2 /*return*/, _b.sent()];
                                        case 6:
                                            wyFTAsset = wyAsset;
                                            return [4 /*yield*/, this.approveFungibleToken({
                                                    tokenAddress: wyFTAsset.address,
                                                    accountAddress: accountAddress,
                                                    proxyAddress: proxyAddress
                                                })
                                                // For other assets, including contracts:
                                                // Send them to the user's proxy
                                                // if (where != WyvernAssetLocation.Proxy) {
                                                //   return this.transferOne({
                                                //     schemaName: schema.name,
                                                //     asset: wyAsset,
                                                //     isWyvernAsset: true,
                                                //     fromAddress: accountAddress,
                                                //     toAddress: proxy
                                                //   })
                                                // }
                                                // return true
                                            ];
                                        case 7: return [2 /*return*/, _b.sent()
                                            // For other assets, including contracts:
                                            // Send them to the user's proxy
                                            // if (where != WyvernAssetLocation.Proxy) {
                                            //   return this.transferOne({
                                            //     schemaName: schema.name,
                                            //     asset: wyAsset,
                                            //     isWyvernAsset: true,
                                            //     fromAddress: accountAddress,
                                            //     toAddress: proxy
                                            //   })
                                            // }
                                            // return true
                                        ];
                                        case 8: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                }
            });
        });
    };
    // Throws
    OpenSeaPort.prototype._buyOrderValidationAndApprovals = function (_a) {
        var order = _a.order, counterOrder = _a.counterOrder, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var tokenAddress, balance, minimumAmount, buyValid;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tokenAddress = order.paymentToken;
                        if (!(tokenAddress != constants_1.NULL_ADDRESS)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getTokenBalance({ accountAddress: accountAddress, tokenAddress: tokenAddress })
                            /* NOTE: no buy-side auctions for now, so sell.saleKind === 0 */
                        ];
                    case 1:
                        balance = _b.sent();
                        minimumAmount = utils_1.makeBigNumber(order.basePrice);
                        if (!counterOrder) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._getRequiredAmountForTakingSellOrder(counterOrder)];
                    case 2:
                        minimumAmount = _b.sent();
                        _b.label = 3;
                    case 3:
                        // Check WETH balance
                        if (balance.toNumber() < minimumAmount.toNumber()) {
                            if (tokenAddress == WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address) {
                                throw new Error('Insufficient balance. You may need to wrap Ether.');
                            }
                            else {
                                throw new Error('Insufficient balance.');
                            }
                        }
                        // Check token approval
                        // This can be done at a higher level to show UI
                        return [4 /*yield*/, this.approveFungibleToken({ accountAddress: accountAddress, tokenAddress: tokenAddress, minimumAmount: minimumAmount })];
                    case 4:
                        // Check token approval
                        // This can be done at a higher level to show UI
                        _b.sent();
                        _b.label = 5;
                    case 5: return [4 /*yield*/, this._wyvernProtocolReadOnly.wyvernExchange.validateOrderParameters_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, { from: accountAddress })];
                    case 6:
                        buyValid = _b.sent();
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
     * Check if an account owns an asset on-chain
     * @param accountAddress Account address for the wallet
     * @param proxyAddress Proxy address for the account
     * @param wyAsset Asset to check. If fungible, the `quantity` attribute will be the minimum amount to own
     * @param schemaName WyvernSchemaName for the asset
     */
    OpenSeaPort.prototype._ownsAssetOnChain = function (_a, retries) {
        var accountAddress = _a.accountAddress, proxyAddress = _a.proxyAddress, wyAsset = _a.wyAsset, schemaName = _a.schemaName;
        if (retries === void 0) { retries = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var schema, _b, minAmount, abi_1, contract_1, inputValues_1, count, proxyCount, abi_2, contract_2, inputValues_2, owner;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        schema = this._getSchema(schemaName);
                        _b = proxyAddress;
                        if (_b) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._getProxy(accountAddress)];
                    case 1:
                        _b = (_c.sent());
                        _c.label = 2;
                    case 2:
                        proxyAddress = _b;
                        if (!schema.functions.countOf) return [3 /*break*/, 6];
                        minAmount = new bignumber_js_1.BigNumber('quantity' in wyAsset
                            ? wyAsset.quantity
                            : 1);
                        abi_1 = schema.functions.countOf(wyAsset);
                        contract_1 = this._getClientsForRead(retries).web3.eth.contract([abi_1]).at(abi_1.target);
                        inputValues_1 = abi_1.inputs.filter(function (x) { return x.value !== undefined; }).map(function (x) { return x.value; });
                        return [4 /*yield*/, utils_1.promisifyCall(function (c) {
                                var _a;
                                return (_a = contract_1[abi_1.name]).call.apply(_a, [accountAddress].concat(inputValues_1, [c]));
                            })];
                    case 3:
                        count = _c.sent();
                        if (count === undefined) {
                            throw new Error("Incorrect schema for this asset");
                        }
                        if (!(count.lessThan(minAmount) && proxyAddress)) return [3 /*break*/, 5];
                        return [4 /*yield*/, utils_1.promisifyCall(function (c) {
                                var _a;
                                return (_a = contract_1[abi_1.name]).call.apply(_a, [proxyAddress].concat(inputValues_1, [c]));
                            })];
                    case 4:
                        proxyCount = _c.sent();
                        count = count.add(proxyCount || 0);
                        _c.label = 5;
                    case 5: return [2 /*return*/, count.greaterThanOrEqualTo(minAmount)];
                    case 6:
                        if (!schema.functions.ownerOf) return [3 /*break*/, 10];
                        abi_2 = schema.functions.ownerOf(wyAsset);
                        contract_2 = this._getClientsForRead(retries).web3.eth.contract([abi_2]).at(abi_2.target);
                        if (abi_2.inputs.filter(function (x) { return x.value === undefined; })[0]) {
                            throw new Error("Missing an argument for finding the owner of this asset");
                        }
                        inputValues_2 = abi_2.inputs.map(function (i) { return i.value.toString(); });
                        return [4 /*yield*/, utils_1.promisifyCall(function (c) {
                                var _a;
                                return (_a = contract_2[abi_2.name]).call.apply(_a, inputValues_2.concat([c]));
                            })];
                    case 7:
                        owner = _c.sent();
                        if (owner) {
                            return [2 /*return*/, owner.toLowerCase() == accountAddress.toLowerCase() || (!!proxyAddress &&
                                    owner.toLowerCase() == proxyAddress.toLowerCase())];
                        }
                        if (retries <= 0) {
                            throw new Error('Unable to get current owner from smart contract');
                        }
                        return [4 /*yield*/, utils_1.delay(500)
                            // Recursively check owner again
                        ];
                    case 8:
                        _c.sent();
                        return [4 /*yield*/, this._ownsAssetOnChain({ accountAddress: accountAddress, proxyAddress: proxyAddress, wyAsset: wyAsset, schemaName: schemaName }, retries - 1)];
                    case 9: 
                    // Recursively check owner again
                    return [2 /*return*/, _c.sent()];
                    case 10: 
                    // Missing ownership call - skip check to allow listings
                    // by default
                    throw new Error('Missing ownership schema for this asset type');
                }
            });
        });
    };
    /**
     * Get the listing and expiration time paramters for a new order
     * @param expirationTimestamp Timestamp to expire the order (in seconds), or 0 for non-expiring
     * @param waitingForBestCounterOrder Whether this order should be hidden until the best match is found
     */
    OpenSeaPort.prototype._getTimeParameters = function (expirationTimestamp, waitingForBestCounterOrder) {
        if (waitingForBestCounterOrder === void 0) { waitingForBestCounterOrder = false; }
        // Validation
        var minExpirationTimestamp = Math.round(Date.now() / 1000 + constants_1.MIN_EXPIRATION_SECONDS);
        if (expirationTimestamp != 0 && expirationTimestamp < minExpirationTimestamp) {
            throw new Error("Expiration time must be at least " + constants_1.MIN_EXPIRATION_SECONDS + " seconds from now, or zero (non-expiring).");
        }
        if (waitingForBestCounterOrder && expirationTimestamp == 0) {
            throw new Error('English auctions must have an expiration time.');
        }
        if (parseInt(expirationTimestamp.toString()) != expirationTimestamp) {
            throw new Error("Expiration timestamp must be a whole number of seconds");
        }
        var listingTimestamp;
        if (waitingForBestCounterOrder) {
            listingTimestamp = expirationTimestamp;
            // Expire one week from now, to ensure server can match it
            // Later, this will expire closer to the listingTime
            expirationTimestamp = expirationTimestamp + constants_1.ORDER_MATCHING_LATENCY_SECONDS;
        }
        else {
            // Small offset to account for latency
            listingTimestamp = Math.round(Date.now() / 1000 - 100);
        }
        return {
            listingTime: utils_1.makeBigNumber(listingTimestamp),
            expirationTime: utils_1.makeBigNumber(expirationTimestamp),
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
    OpenSeaPort.prototype._getPriceParameters = function (orderSide, tokenAddress, expirationTime, startAmount, endAmount, waitingForBestCounterOrder) {
        if (waitingForBestCounterOrder === void 0) { waitingForBestCounterOrder = false; }
        return __awaiter(this, void 0, void 0, function () {
            var priceDiff, paymentToken, isEther, tokens, token, basePrice, extra;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        priceDiff = endAmount != null
                            ? startAmount - endAmount
                            : 0;
                        paymentToken = tokenAddress.toLowerCase();
                        isEther = tokenAddress == constants_1.NULL_ADDRESS;
                        return [4 /*yield*/, this.api.getPaymentTokens({ address: paymentToken })];
                    case 1:
                        tokens = (_a.sent()).tokens;
                        token = tokens[0];
                        // Validation
                        if (isNaN(startAmount) || startAmount == null || startAmount < 0) {
                            throw new Error("Starting price must be a number >= 0");
                        }
                        if (!isEther && !token) {
                            throw new Error("No ERC-20 token found for '" + paymentToken + "'");
                        }
                        if (isEther && waitingForBestCounterOrder) {
                            throw new Error("English auctions must use wrapped ETH or an ERC-20 token.");
                        }
                        if (isEther && orderSide === types_1.OrderSide.Buy) {
                            throw new Error("Offers must use wrapped ETH or an ERC-20 token.");
                        }
                        if (priceDiff < 0) {
                            throw new Error('End price must be less than or equal to the start price.');
                        }
                        if (priceDiff > 0 && expirationTime == 0) {
                            throw new Error('Expiration time must be set if order will change in price.');
                        }
                        basePrice = isEther
                            ? utils_1.makeBigNumber(this.web3ReadOnly.toWei(startAmount, 'ether')).round()
                            : wyvern_js_1.WyvernProtocol.toBaseUnitAmount(utils_1.makeBigNumber(startAmount), token.decimals);
                        extra = isEther
                            ? utils_1.makeBigNumber(this.web3ReadOnly.toWei(priceDiff, 'ether')).round()
                            : wyvern_js_1.WyvernProtocol.toBaseUnitAmount(utils_1.makeBigNumber(priceDiff), token.decimals);
                        return [2 /*return*/, { basePrice: basePrice, extra: extra, paymentToken: paymentToken }];
                }
            });
        });
    };
    OpenSeaPort.prototype._getMetadata = function (order, referrerAddress) {
        var referrer = referrerAddress || order.metadata.referrerAddress;
        if (referrer && ethereumjs_util_1.isValidAddress(referrer)) {
            return referrer;
        }
        return undefined;
    };
    OpenSeaPort.prototype._atomicMatch = function (_a) {
        var buy = _a.buy, sell = _a.sell, accountAddress = _a.accountAddress, _b = _a.metadata, metadata = _b === void 0 ? constants_1.NULL_BLOCK_HASH : _b;
        return __awaiter(this, void 0, void 0, function () {
            var value, shouldValidateBuy, shouldValidateSell, txHash, gasPrice, txnData, args, gasEstimate, error_13, error_14;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        shouldValidateBuy = true;
                        shouldValidateSell = true;
                        if (!(sell.maker.toLowerCase() == accountAddress.toLowerCase())) return [3 /*break*/, 2];
                        // USER IS THE SELLER, only validate the buy order
                        return [4 /*yield*/, this._sellOrderValidationAndApprovals({ order: sell, accountAddress: accountAddress })];
                    case 1:
                        // USER IS THE SELLER, only validate the buy order
                        _c.sent();
                        shouldValidateSell = false;
                        return [3 /*break*/, 6];
                    case 2:
                        if (!(buy.maker.toLowerCase() == accountAddress.toLowerCase())) return [3 /*break*/, 6];
                        // USER IS THE BUYER, only validate the sell order
                        return [4 /*yield*/, this._buyOrderValidationAndApprovals({ order: buy, counterOrder: sell, accountAddress: accountAddress })];
                    case 3:
                        // USER IS THE BUYER, only validate the sell order
                        _c.sent();
                        shouldValidateBuy = false;
                        if (!(buy.paymentToken == constants_1.NULL_ADDRESS)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._getRequiredAmountForTakingSellOrder(sell)];
                    case 4:
                        value = _c.sent();
                        _c.label = 5;
                    case 5: return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, this._validateMatch({ buy: buy, sell: sell, accountAddress: accountAddress, shouldValidateBuy: shouldValidateBuy, shouldValidateSell: shouldValidateSell })];
                    case 7:
                        _c.sent();
                        this._dispatch(types_1.EventType.MatchOrders, { buy: buy, sell: sell, accountAddress: accountAddress, matchMetadata: metadata });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 8:
                        gasPrice = _c.sent();
                        txnData = { from: accountAddress, value: value, gasPrice: gasPrice };
                        args = [
                            [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target,
                                buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken],
                            [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt],
                            [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall],
                            buy.calldata,
                            sell.calldata,
                            buy.replacementPattern,
                            sell.replacementPattern,
                            buy.staticExtradata,
                            sell.staticExtradata,
                            [
                                buy.v || 0,
                                sell.v || 0
                            ],
                            [
                                buy.r || constants_1.NULL_BLOCK_HASH,
                                buy.s || constants_1.NULL_BLOCK_HASH,
                                sell.r || constants_1.NULL_BLOCK_HASH,
                                sell.s || constants_1.NULL_BLOCK_HASH,
                                metadata
                            ]
                        ];
                        _c.label = 9;
                    case 9:
                        _c.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, this._wyvernProtocolReadOnly.wyvernExchange.atomicMatch_.estimateGasAsync(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], txnData)];
                    case 10:
                        gasEstimate = _c.sent();
                        txnData.gas = this._correctGasAmount(gasEstimate);
                        return [3 /*break*/, 12];
                    case 11:
                        error_13 = _c.sent();
                        console.error("Failed atomic match with args: ", args, error_13);
                        throw new Error("Oops, the Ethereum network rejected this transaction :( The OpenSea devs have been alerted, but this problem is typically due an item being locked or untransferrable. The exact error was \"" + error_13.message.substr(0, debugging_1.MAX_ERROR_LENGTH) + "...\"");
                    case 12:
                        _c.trys.push([12, 14, , 15]);
                        this.logger("Fulfilling order with gas set to " + txnData.gas);
                        return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.atomicMatch_.sendTransactionAsync(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], txnData)];
                    case 13:
                        txHash = _c.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        error_14 = _c.sent();
                        console.error(error_14);
                        this._dispatch(types_1.EventType.TransactionDenied, { error: error_14, buy: buy, sell: sell, accountAddress: accountAddress, matchMetadata: metadata });
                        throw new Error("Failed to authorize transaction: \"" + (error_14.message
                            ? error_14.message
                            : 'user denied') + "...\"");
                    case 15: return [2 /*return*/, txHash];
                }
            });
        });
    };
    OpenSeaPort.prototype._getRequiredAmountForTakingSellOrder = function (sell) {
        return __awaiter(this, void 0, void 0, function () {
            var currentPrice, estimatedPrice, maxPrice, feePercentage, fee;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentPrice(sell)];
                    case 1:
                        currentPrice = _a.sent();
                        estimatedPrice = utils_1.estimateCurrentPrice(sell);
                        maxPrice = bignumber_js_1.BigNumber.max(currentPrice, estimatedPrice);
                        // TODO Why is this not always a big number?
                        sell.takerRelayerFee = utils_1.makeBigNumber(sell.takerRelayerFee);
                        feePercentage = sell.takerRelayerFee.div(constants_1.INVERSE_BASIS_POINT);
                        fee = feePercentage.times(maxPrice);
                        return [2 /*return*/, fee.plus(maxPrice).ceil()];
                }
            });
        });
    };
    OpenSeaPort.prototype._authorizeOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var message, signerAddress, signature, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        message = order.hash;
                        signerAddress = order.maker;
                        this._dispatch(types_1.EventType.CreateOrder, { order: order, accountAddress: order.maker });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, utils_1.personalSignAsync(this.web3, message, signerAddress)];
                    case 2:
                        signature = _a.sent();
                        if (!signature) return [3 /*break*/, 3];
                        return [2 /*return*/, signature];
                    case 3: 
                    // The web3 provider is probably a smart contract wallet
                    // Fallback to on-chain approval
                    return [4 /*yield*/, this._approveOrder(order)
                        // and return an empty signature
                    ];
                    case 4:
                        // The web3 provider is probably a smart contract wallet
                        // Fallback to on-chain approval
                        _a.sent();
                        // and return an empty signature
                        return [2 /*return*/, {}];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_15 = _a.sent();
                        this._dispatch(types_1.EventType.OrderDenied, { order: order, accountAddress: signerAddress });
                        throw error_15;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    OpenSeaPort.prototype._getSchema = function (schemaName) {
        if (schemaName === void 0) { schemaName = types_1.WyvernSchemaName.ERC721; }
        var schema = WyvernSchemas.schemas[this._networkName].filter(function (s) { return s.name == schemaName; })[0];
        if (!schema) {
            throw new Error("Trading for this asset (" + schemaName + ") is not yet supported. Please contact us or check back later!");
        }
        return schema;
    };
    OpenSeaPort.prototype._dispatch = function (event, data) {
        this._emitter.emit(event, data);
    };
    /**
     * Get the clients to use for a read call
     * @param retries current retry value
     */
    OpenSeaPort.prototype._getClientsForRead = function (retries) {
        if (retries === void 0) { retries = 1; }
        if (retries > 0) {
            // Use injected provider by default
            return {
                'web3': this.web3,
                'wyvernProtocol': this._wyvernProtocol
            };
        }
        else {
            // Use provided provider as fallback
            return {
                'web3': this.web3ReadOnly,
                'wyvernProtocol': this._wyvernProtocolReadOnly
            };
        }
    };
    OpenSeaPort.prototype._confirmTransaction = function (transactionHash, event, description, testForSuccess) {
        return __awaiter(this, void 0, void 0, function () {
            var transactionEventData, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transactionEventData = { transactionHash: transactionHash, event: event };
                        this.logger("Transaction started: " + description);
                        if (!(transactionHash == constants_1.NULL_BLOCK_HASH)) return [3 /*break*/, 4];
                        // This was a smart contract wallet that doesn't know the transaction
                        this._dispatch(types_1.EventType.TransactionCreated, { event: event });
                        if (!!testForSuccess) return [3 /*break*/, 2];
                        // Wait if test not implemented
                        this.logger("Unknown action, waiting 1 minute: " + description);
                        return [4 /*yield*/, utils_1.delay(60 * 1000)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, this._pollCallbackForConfirmation(event, description, testForSuccess)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        this._dispatch(types_1.EventType.TransactionCreated, transactionEventData);
                        return [4 /*yield*/, utils_1.confirmTransaction(this.web3, transactionHash)];
                    case 5:
                        _a.sent();
                        this.logger("Transaction succeeded: " + description);
                        this._dispatch(types_1.EventType.TransactionConfirmed, transactionEventData);
                        return [3 /*break*/, 7];
                    case 6:
                        error_16 = _a.sent();
                        this.logger("Transaction failed: " + description);
                        this._dispatch(types_1.EventType.TransactionFailed, __assign({}, transactionEventData, { error: error_16 }));
                        throw error_16;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    OpenSeaPort.prototype._pollCallbackForConfirmation = function (event, description, testForSuccess) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var initialRetries, testResolve;
                        var _this = this;
                        return __generator(this, function (_a) {
                            initialRetries = 60;
                            testResolve = function (retries) { return __awaiter(_this, void 0, void 0, function () {
                                var wasSuccessful;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, testForSuccess()];
                                        case 1:
                                            wasSuccessful = _a.sent();
                                            if (wasSuccessful) {
                                                this.logger("Transaction succeeded: " + description);
                                                this._dispatch(types_1.EventType.TransactionConfirmed, { event: event });
                                                return [2 /*return*/, resolve()];
                                            }
                                            else if (retries <= 0) {
                                                return [2 /*return*/, reject()];
                                            }
                                            if (retries % 10 == 0) {
                                                this.logger("Tested transaction " + (initialRetries - retries + 1) + " times: " + description);
                                            }
                                            return [4 /*yield*/, utils_1.delay(5000)];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/, testResolve(retries - 1)];
                                    }
                                });
                            }); };
                            return [2 /*return*/, testResolve(initialRetries)];
                        });
                    }); })];
            });
        });
    };
    return OpenSeaPort;
}());
exports.OpenSeaPort = OpenSeaPort;
//# sourceMappingURL=seaport.js.map