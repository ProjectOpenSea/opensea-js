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
var lib_1 = require("wyvern-js/lib");
var WyvernSchemas = require("wyvern-schemas");
var _ = require("lodash");
var api_1 = require("./api");
var contracts_1 = require("./contracts");
var types_1 = require("./types");
var utils_1 = require("./utils");
var bignumber_js_1 = require("bignumber.js");
var fbemitter_1 = require("fbemitter");
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
        this.gasIncreaseFactor = 1.2;
        apiConfig.networkName = apiConfig.networkName || types_1.Network.Main;
        apiConfig.gasPrice = apiConfig.gasPrice || utils_1.makeBigNumber(300000);
        // API config
        this.api = new api_1.OpenSeaAPI(apiConfig);
        // Web3 Config
        this.web3 = new Web3(provider);
        this._networkName = apiConfig.networkName;
        // WyvernJS config
        this._wyvernProtocol = new lib_1.WyvernProtocol(provider, {
            network: this._networkName,
            gasPrice: apiConfig.gasPrice,
        });
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
        // Kill tslint "no this used" warning
        if (!this._emitter) {
            return;
        }
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
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        token = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther;
                        amount = lib_1.WyvernProtocol.toBaseUnitAmount(utils_1.makeBigNumber(amountInEth), token.decimals);
                        this._dispatch(types_1.EventType.WrapEth, { accountAddress: accountAddress, amount: amount });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _b.sent();
                        return [4 /*yield*/, utils_1.sendRawTransaction(this.web3, {
                                from: accountAddress,
                                to: token.address,
                                value: amount,
                                data: WyvernSchemas.encodeCall(contracts_1.getMethod(contracts_1.CanonicalWETH, 'deposit'), []),
                                gasPrice: gasPrice
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
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        token = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther;
                        amount = lib_1.WyvernProtocol.toBaseUnitAmount(utils_1.makeBigNumber(amountInEth), token.decimals);
                        this._dispatch(types_1.EventType.UnwrapWeth, { accountAddress: accountAddress, amount: amount });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _b.sent();
                        return [4 /*yield*/, utils_1.sendRawTransaction(this.web3, {
                                from: accountAddress,
                                to: token.address,
                                value: 0,
                                data: WyvernSchemas.encodeCall(contracts_1.getMethod(contracts_1.CanonicalWETH, 'withdraw'), [amount.toString()]),
                                gasPrice: gasPrice
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
     * Create a buy order to make an offer on an asset.
     * Will throw an 'Insufficient balance' error if the maker doesn't have enough W-ETH to make the offer.
     * If the user hasn't approved W-ETH access yet, this will emit `ApproveCurrency` before asking for approval.
     * @param param0 __namedParameters Object
     * @param tokenId Token ID
     * @param tokenAddress Address of the token's contract
     * @param accountAddress Address of the maker's wallet
     * @param startAmount Value of the offer, in units of the payment token (or wrapped ETH if no payment token address specified)
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire"
     * @param paymentTokenAddress Optional address for using an ERC-20 token in the order. If unspecified, defaults to W-ETH
     */
    OpenSeaPort.prototype.createBuyOrder = function (_a) {
        var tokenId = _a.tokenId, tokenAddress = _a.tokenAddress, accountAddress = _a.accountAddress, startAmount = _a.startAmount, _b = _a.expirationTime, expirationTime = _b === void 0 ? 0 : _b, paymentTokenAddress = _a.paymentTokenAddress;
        return __awaiter(this, void 0, void 0, function () {
            var order, hashedOrder, signature, error_1, orderWithSignature;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this._makeBuyOrder({ tokenId: tokenId, tokenAddress: tokenAddress, accountAddress: accountAddress, startAmount: startAmount, expirationTime: expirationTime, paymentTokenAddress: paymentTokenAddress })
                        // NOTE not in Wyvern exchange code:
                        // frontend checks to make sure
                        // token is approved and sufficiently available
                    ];
                    case 1:
                        order = _c.sent();
                        // NOTE not in Wyvern exchange code:
                        // frontend checks to make sure
                        // token is approved and sufficiently available
                        return [4 /*yield*/, this._validateBuyOrderParameters({ order: order, accountAddress: accountAddress })];
                    case 2:
                        // NOTE not in Wyvern exchange code:
                        // frontend checks to make sure
                        // token is approved and sufficiently available
                        _c.sent();
                        hashedOrder = __assign({}, order, { hash: utils_1.getOrderHash(order) });
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this._signOrder(hashedOrder)];
                    case 4:
                        signature = _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _c.sent();
                        console.error(error_1);
                        throw new Error("You declined to sign your offer. Just a reminder: there's no gas needed anymore to create offers!");
                    case 6:
                        orderWithSignature = __assign({}, hashedOrder, signature);
                        return [2 /*return*/, this._validateAndPostOrder(orderWithSignature)];
                }
            });
        });
    };
    /**
     * Create a sell order to auction an asset.
     * Will throw a 'You do not own this asset' error if the maker doesn't have the asset.
     * If the user hasn't approved access to the token yet, this will emit `ApproveAllAssets` (or `ApproveAsset` if the contract doesn't support approve-all) before asking for approval.
     * @param param0 __namedParameters Object
     * @param tokenId Token ID
     * @param tokenAddress Address of the token's contract
     * @param accountAddress Address of the maker's wallet
     * @param startAmount Price of the asset at the start of the auction. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param endAmount Optional price of the asset at the end of its expiration time. Units are in the amount of a token above the token's decimal places (integer part). For example, for ether, expected units are in ETH, not wei.
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
     * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
     */
    OpenSeaPort.prototype.createSellOrder = function (_a) {
        var tokenId = _a.tokenId, tokenAddress = _a.tokenAddress, accountAddress = _a.accountAddress, startAmount = _a.startAmount, endAmount = _a.endAmount, _b = _a.expirationTime, expirationTime = _b === void 0 ? 0 : _b, paymentTokenAddress = _a.paymentTokenAddress;
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAsset, listingTime, asset, buyerFee, sellerFee, _c, target, calldata, replacementPattern, orderSaleKind, paymentToken, _d, basePrice, extra, order, hashedOrder, signature, error_2, orderWithSignature;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        schema = this._getSchema();
                        wyAsset = utils_1.getWyvernAsset(schema, tokenId, tokenAddress);
                        listingTime = Math.round(Date.now() / 1000 - 100);
                        return [4 /*yield*/, this.api.getAsset(tokenAddress, tokenId)];
                    case 1:
                        asset = _e.sent();
                        if (!asset) {
                            throw new Error('No asset found for this order');
                        }
                        buyerFee = asset.assetContract.buyerFeeBasisPoints;
                        sellerFee = asset.assetContract.sellerFeeBasisPoints;
                        _c = WyvernSchemas.encodeSell(schema, wyAsset, accountAddress), target = _c.target, calldata = _c.calldata, replacementPattern = _c.replacementPattern;
                        orderSaleKind = endAmount != null && endAmount !== startAmount
                            ? types_1.SaleKind.DutchAuction
                            : types_1.SaleKind.FixedPrice;
                        paymentToken = paymentTokenAddress || utils_1.NULL_ADDRESS;
                        _d = this._getPriceParameters(paymentToken, startAmount, endAmount), basePrice = _d.basePrice, extra = _d.extra;
                        order = {
                            exchange: lib_1.WyvernProtocol.getExchangeContractAddress(this._networkName),
                            maker: accountAddress,
                            taker: utils_1.NULL_ADDRESS,
                            makerRelayerFee: utils_1.makeBigNumber(sellerFee),
                            takerRelayerFee: utils_1.makeBigNumber(buyerFee),
                            makerProtocolFee: utils_1.makeBigNumber(0),
                            takerProtocolFee: utils_1.makeBigNumber(0),
                            feeMethod: types_1.FeeMethod.SplitFee,
                            feeRecipient: utils_1.feeRecipient,
                            side: types_1.OrderSide.Sell,
                            saleKind: orderSaleKind,
                            target: target,
                            howToCall: types_1.HowToCall.Call,
                            calldata: calldata,
                            replacementPattern: replacementPattern,
                            staticTarget: utils_1.NULL_ADDRESS,
                            staticExtradata: '0x',
                            paymentToken: paymentToken,
                            basePrice: basePrice,
                            extra: extra,
                            listingTime: utils_1.makeBigNumber(listingTime),
                            expirationTime: utils_1.makeBigNumber(expirationTime),
                            salt: lib_1.WyvernProtocol.generatePseudoRandomSalt(),
                            metadata: {
                                asset: wyAsset,
                                schema: schema.name,
                            },
                        };
                        return [4 /*yield*/, this._validateSellOrderParameters({ order: order, accountAddress: accountAddress })];
                    case 2:
                        _e.sent();
                        hashedOrder = __assign({}, order, { hash: utils_1.getOrderHash(order) });
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this._signOrder(hashedOrder)];
                    case 4:
                        signature = _e.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _e.sent();
                        console.error(error_2);
                        throw new Error("You declined to sign your auction. Just a reminder: there's no gas needed anymore to create auctions!");
                    case 6:
                        orderWithSignature = __assign({}, hashedOrder, signature);
                        return [2 /*return*/, this._validateAndPostOrder(orderWithSignature)];
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
     * @param startAmount Price of the asset at the start of the auction
     * @param endAmount Optional price of the asset at the end of its expiration time
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
     * @param paymentTokenAddress Address of the ERC-20 token to accept in return. If undefined or null, uses Ether.
     */
    OpenSeaPort.prototype.createBundleSellOrder = function (_a) {
        var bundleName = _a.bundleName, bundleDescription = _a.bundleDescription, bundleExternalLink = _a.bundleExternalLink, assets = _a.assets, accountAddress = _a.accountAddress, startAmount = _a.startAmount, endAmount = _a.endAmount, _b = _a.expirationTime, expirationTime = _b === void 0 ? 0 : _b, paymentTokenAddress = _a.paymentTokenAddress;
        return __awaiter(this, void 0, void 0, function () {
            var order, hashedOrder, signature, error_3, orderWithSignature;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this._makeBundleSellOrder({ bundleName: bundleName, bundleDescription: bundleDescription, bundleExternalLink: bundleExternalLink, assets: assets, accountAddress: accountAddress, startAmount: startAmount, endAmount: endAmount, expirationTime: expirationTime, paymentTokenAddress: paymentTokenAddress })];
                    case 1:
                        order = _c.sent();
                        return [4 /*yield*/, this._validateSellOrderParameters({ order: order, accountAddress: accountAddress })];
                    case 2:
                        _c.sent();
                        hashedOrder = __assign({}, order, { hash: utils_1.getOrderHash(order) });
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this._signOrder(hashedOrder)];
                    case 4:
                        signature = _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _c.sent();
                        console.error(error_3);
                        throw new Error("You declined to sign your auction. Just a reminder: there's no gas needed anymore to create auctions!");
                    case 6:
                        orderWithSignature = __assign({}, hashedOrder, signature);
                        return [2 /*return*/, this._validateAndPostOrder(orderWithSignature)];
                }
            });
        });
    };
    /**
     * Fullfill or "take" an order for an asset, either a buy or sell order
     * @param param0 __namedParamaters Object
     * @param order The order to fulfill, a.k.a. "take"
     * @param accountAddress The taker's wallet address
     */
    OpenSeaPort.prototype.fulfillOrder = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var matchingOrder, _b, buy, sell, transactionHash;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        matchingOrder = this._makeMatchingOrder({ order: order, accountAddress: accountAddress });
                        _b = utils_1.assignOrdersToSides(order, matchingOrder), buy = _b.buy, sell = _b.sell;
                        return [4 /*yield*/, this._atomicMatch({ buy: buy, sell: sell, accountAddress: accountAddress })];
                    case 1:
                        transactionHash = _c.sent();
                        return [4 /*yield*/, this._confirmTransaction(transactionHash.toString(), types_1.EventType.MatchOrders, "Fulfilling order")];
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
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._dispatch(types_1.EventType.CancelOrder, { order: order, accountAddress: accountAddress });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _b.sent();
                        return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.cancelOrder_.sendTransactionAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, order.v, order.r, order.s, { from: accountAddress, gasPrice: gasPrice })];
                    case 2:
                        transactionHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(transactionHash.toString(), types_1.EventType.CancelOrder, "Cancelling order")];
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
     * @returns Transaction hash if a new transaction was created, otherwise null
     */
    OpenSeaPort.prototype.approveNonFungibleToken = function (_a) {
        var tokenId = _a.tokenId, tokenAddress = _a.tokenAddress, accountAddress = _a.accountAddress, _b = _a.proxyAddress, proxyAddress = _b === void 0 ? null : _b, _c = _a.tokenAbi, tokenAbi = _c === void 0 ? contracts_1.ERC721 : _c, _d = _a.skipApproveAllIfTokenAddressIn, skipApproveAllIfTokenAddressIn = _d === void 0 ? [] : _d;
        return __awaiter(this, void 0, void 0, function () {
            var tokenContract, erc721, isApprovedCheckData, isApprovedForAllCallHash, isApprovedForAll, gasPrice, txHash, error_4, approvedAddr, gasPrice, txHash, error_5;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        tokenContract = this.web3.eth.contract(tokenAbi);
                        return [4 /*yield*/, tokenContract.at(tokenAddress)];
                    case 1:
                        erc721 = _e.sent();
                        if (!!proxyAddress) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._getProxy(accountAddress)];
                    case 2:
                        proxyAddress = _e.sent();
                        if (!proxyAddress) {
                            throw new Error('Uninitialized account');
                        }
                        _e.label = 3;
                    case 3:
                        isApprovedCheckData = erc721.isApprovedForAll.getData(accountAddress, proxyAddress);
                        // Decentraland reverses the arguments to isApprovedForAll, so we need to special case that. :(
                        if (erc721.address == contracts_1.DECENTRALAND_AUCTION_CONFIG['1']) {
                            isApprovedCheckData = erc721.isApprovedForAll.getData(proxyAddress, accountAddress);
                        }
                        return [4 /*yield*/, utils_1.promisify(function (c) { return _this.web3.eth.call({
                                from: accountAddress,
                                to: erc721.address,
                                data: isApprovedCheckData,
                            }, c); })];
                    case 4:
                        isApprovedForAllCallHash = _e.sent();
                        isApprovedForAll = parseInt(isApprovedForAllCallHash);
                        if (isApprovedForAll == 1) {
                            // Supports ApproveAll
                            // Result was NULL_BLOCK_HASH + 1
                            this.logger('Already approved proxy for all tokens');
                            return [2 /*return*/, null];
                        }
                        if (!(isApprovedForAll == 0)) return [3 /*break*/, 10];
                        // Supports ApproveAll
                        //  Result was NULL_BLOCK_HASH
                        //  not approved for all yet
                        if (skipApproveAllIfTokenAddressIn.includes(tokenAddress)) {
                            this.logger('Already approving proxy for all tokens in another transaction');
                            return [2 /*return*/, null];
                        }
                        skipApproveAllIfTokenAddressIn.push(tokenAddress);
                        _e.label = 5;
                    case 5:
                        _e.trys.push([5, 9, , 10]);
                        this._dispatch(types_1.EventType.ApproveAllAssets, { accountAddress: accountAddress, proxyAddress: proxyAddress, tokenAddress: tokenAddress });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 6:
                        gasPrice = _e.sent();
                        return [4 /*yield*/, utils_1.sendRawTransaction(this.web3, {
                                from: accountAddress,
                                to: erc721.address,
                                data: erc721.setApprovalForAll.getData(proxyAddress, true),
                                gasPrice: gasPrice
                            })];
                    case 7:
                        txHash = _e.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.ApproveAllAssets, 'Approving all tokens of this type for trading')];
                    case 8:
                        _e.sent();
                        return [2 /*return*/, txHash];
                    case 9:
                        error_4 = _e.sent();
                        console.error(error_4);
                        throw new Error("Couldn't get permission to trade these tokens. Remember, you only have to approve them once for this item type!");
                    case 10:
                        // Does not support ApproveAll (ERC721 v1 or v2)
                        this.logger('Contract does not support Approve All');
                        return [4 /*yield*/, utils_1.promisify(function (c) { return erc721.getApproved.call(tokenId, c); })];
                    case 11:
                        approvedAddr = _e.sent();
                        if (approvedAddr == proxyAddress) {
                            this.logger('Already approved proxy for this token');
                            return [2 /*return*/, null];
                        }
                        this.logger("Approve response: " + approvedAddr);
                        if (!(approvedAddr == '0x')) return [3 /*break*/, 13];
                        return [4 /*yield*/, utils_1.promisify(function (c) { return erc721.kittyIndexToApproved.call(tokenId, c); })];
                    case 12:
                        // CRYPTOKITTIES check
                        approvedAddr = _e.sent();
                        if (approvedAddr == proxyAddress) {
                            this.logger('Already approved proxy for this kitty');
                            return [2 /*return*/, null];
                        }
                        this.logger("CryptoKitties approve response: " + approvedAddr);
                        _e.label = 13;
                    case 13:
                        if (!(approvedAddr == '0x')) return [3 /*break*/, 15];
                        return [4 /*yield*/, utils_1.promisify(function (c) { return erc721.allowed.call(accountAddress, tokenId, c); })];
                    case 14:
                        // ETHEREMON check
                        approvedAddr = _e.sent();
                        if (approvedAddr == proxyAddress) {
                            this.logger('Already allowed proxy for this token');
                            return [2 /*return*/, null];
                        }
                        this.logger("\"allowed\" response: " + approvedAddr);
                        _e.label = 15;
                    case 15:
                        _e.trys.push([15, 19, , 20]);
                        this._dispatch(types_1.EventType.ApproveAsset, { accountAddress: accountAddress, proxyAddress: proxyAddress, tokenAddress: tokenAddress, tokenId: tokenId });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 16:
                        gasPrice = _e.sent();
                        return [4 /*yield*/, utils_1.sendRawTransaction(this.web3, {
                                from: accountAddress,
                                to: erc721.address,
                                data: erc721.approve.getData(proxyAddress, tokenId),
                                gasPrice: gasPrice
                            })];
                    case 17:
                        txHash = _e.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.ApproveAsset, "Approving single token for trading")];
                    case 18:
                        _e.sent();
                        return [2 /*return*/, txHash];
                    case 19:
                        error_5 = _e.sent();
                        console.error(error_5);
                        throw new Error("Couldn't get permission to trade this token.");
                    case 20: return [2 /*return*/];
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
     * @param minimumAmount The minimum amount needed to skip a transaction. Defaults to the max-integer.
     * @returns Transaction hash if a new transaction occurred, otherwise null
     */
    OpenSeaPort.prototype.approveFungibleToken = function (_a) {
        var accountAddress = _a.accountAddress, tokenAddress = _a.tokenAddress, _b = _a.minimumAmount, minimumAmount = _b === void 0 ? lib_1.WyvernProtocol.MAX_UINT_256 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var approvedAmount, contractAddress, gasPrice, txHash;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this._getApprovedTokenCount({ accountAddress: accountAddress, tokenAddress: tokenAddress })];
                    case 1:
                        approvedAmount = _c.sent();
                        if (approvedAmount.toNumber() >= minimumAmount.toNumber()) {
                            this.logger('Already approved enough currency for trading');
                            return [2 /*return*/, null];
                        }
                        this.logger("Not enough token approved for trade: " + approvedAmount);
                        contractAddress = lib_1.WyvernProtocol.getTokenTransferProxyAddress(this._networkName);
                        this._dispatch(types_1.EventType.ApproveCurrency, { accountAddress: accountAddress, tokenAddress: tokenAddress });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 2:
                        gasPrice = _c.sent();
                        return [4 /*yield*/, utils_1.sendRawTransaction(this.web3, {
                                from: accountAddress,
                                to: tokenAddress,
                                data: WyvernSchemas.encodeCall(contracts_1.getMethod(contracts_1.ERC20, 'approve'), [contractAddress, lib_1.WyvernProtocol.MAX_UINT_256.toString()]),
                                gasPrice: gasPrice
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
                    case 0: return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.calculateCurrentPrice_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata)];
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
     */
    OpenSeaPort.prototype.isOrderFulfillable = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var matchingOrder, _b, buy, sell, gas, error_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        matchingOrder = this._makeMatchingOrder({ order: order, accountAddress: accountAddress });
                        _b = utils_1.assignOrdersToSides(order, matchingOrder), buy = _b.buy, sell = _b.sell;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._estimateGasForMatch({ buy: buy, sell: sell, accountAddress: accountAddress })];
                    case 2:
                        gas = _c.sent();
                        this.logger("Gas estimate for " + (order.side == types_1.OrderSide.Sell ? "sell" : "buy") + " order: " + gas);
                        return [2 /*return*/, gas > 0];
                    case 3:
                        error_6 = _c.sent();
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * WIP Returns whether an asset is transferrable.
     * (Currently returns true too often, even when asset is locked by contract.)
     * An asset may not be transferrable if its transfer function
     * is locked for some reason, e.g. an item is being rented within a game
     * or trading has been locked for an item type.
     * @param param0 __namedParamters Object
     * @param tokenId ID of the token to check
     * @param tokenAddress Address of the token's contract
     * @param fromAddress The account address that currently owns the asset
     * @param toAddress The account address that will be acquiring the asset
     * @param tokenAbi ABI for the token contract. Defaults to ERC-721
     */
    OpenSeaPort.prototype.isAssetTransferrable = function (_a) {
        var tokenId = _a.tokenId, tokenAddress = _a.tokenAddress, fromAddress = _a.fromAddress, toAddress = _a.toAddress, _b = _a.tokenAbi, tokenAbi = _b === void 0 ? contracts_1.ERC721 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var tokenContract, erc721, proxy, data, gas, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        tokenContract = this.web3.eth.contract(tokenAbi);
                        return [4 /*yield*/, tokenContract.at(tokenAddress)];
                    case 1:
                        erc721 = _c.sent();
                        return [4 /*yield*/, this._getProxy(fromAddress)];
                    case 2:
                        proxy = _c.sent();
                        if (!proxy) {
                            console.error("This asset's owner (" + fromAddress + ") no longer has a proxy!");
                            return [2 /*return*/, false];
                        }
                        data = erc721.transferFrom.getData(fromAddress, toAddress, tokenId);
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, utils_1.estimateGas(this.web3, {
                                from: proxy,
                                to: tokenAddress,
                                data: data
                            })];
                    case 4:
                        gas = _c.sent();
                        return [2 /*return*/, gas > 0];
                    case 5:
                        error_7 = _c.sent();
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get known fungible tokens (ERC-20) that match your filters.
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
        var allTokens = [
            WyvernSchemas.tokens[this._networkName].canonicalWrappedEther
        ].concat(WyvernSchemas.tokens[this._networkName].otherTokens);
        return allTokens.filter(function (t) {
            if (symbol != null && t.symbol != symbol) {
                return false;
            }
            if (address != null && t.address != address) {
                return false;
            }
            if (name != null && t.name != name) {
                return false;
            }
            return true;
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
     * Estimate the gas needed to match two orders
     * @param param0 __namedParamaters Object
     * @param buy The buy order to match
     * @param sell The sell order to match
     * @param accountAddress The taker's wallet address
     */
    OpenSeaPort.prototype._estimateGasForMatch = function (_a) {
        var buy = _a.buy, sell = _a.sell, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var value;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(buy.maker == accountAddress && buy.paymentToken == utils_1.NULL_ADDRESS)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._getEthValueForTakingSellOrder(sell)];
                    case 1:
                        value = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this._wyvernProtocol.wyvernExchange.atomicMatch_.estimateGasAsync([buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken], [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt], [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall], buy.calldata, sell.calldata, buy.replacementPattern, sell.replacementPattern, buy.staticExtradata, sell.staticExtradata, [buy.v, sell.v], [buy.r, buy.s, sell.r, sell.s,
                            utils_1.NULL_ADDRESS], 
                        // Typescript error in estimate gas method, so use any
                        { from: accountAddress, value: value })];
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
                    case 0: return [4 /*yield*/, this._wyvernProtocol.wyvernProxyRegistry.proxies.callAsync(accountAddress)];
                    case 1:
                        proxyAddress = _a.sent();
                        if (proxyAddress == '0x') {
                            throw new Error("Couldn't retrieve your account from the blockchain - make sure you're on the correct Ethereum network!");
                        }
                        if (!proxyAddress || proxyAddress == utils_1.NULL_ADDRESS) {
                            if (retries > 0) {
                                return [2 /*return*/, this._getProxy(accountAddress, retries - 1)];
                            }
                            proxyAddress = null;
                        }
                        return [2 /*return*/, proxyAddress];
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
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._dispatch(types_1.EventType.InitializeAccount, { accountAddress: accountAddress });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _a.sent();
                        txnData = { from: accountAddress, gasPrice: gasPrice };
                        return [4 /*yield*/, this._wyvernProtocol.wyvernProxyRegistry.registerProxy.estimateGasAsync(txnData)];
                    case 2:
                        gasEstimate = _a.sent();
                        return [4 /*yield*/, this._wyvernProtocol.wyvernProxyRegistry.registerProxy.sendTransactionAsync(__assign({}, txnData, { gas: this._correctGasAmount(gasEstimate) }))];
                    case 3:
                        transactionHash = _a.sent();
                        return [4 /*yield*/, this._confirmTransaction(transactionHash, types_1.EventType.InitializeAccount, "Initializing proxy for account")
                            // Fix for Cipher and any other clients who get receipts too early
                        ];
                    case 4:
                        _a.sent();
                        // Fix for Cipher and any other clients who get receipts too early
                        return [4 /*yield*/, utils_1.delay(1000)];
                    case 5:
                        // Fix for Cipher and any other clients who get receipts too early
                        _a.sent();
                        return [4 /*yield*/, this._getProxy(accountAddress, 2)];
                    case 6:
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
     * Get the balance of a fungible token.
     * Internal method exposed for dev flexibility.
     * @param param0 __namedParameters Object
     * @param accountAddress User's account address
     * @param tokenAddress Optional address of the token's contract.
     *  Defaults to W-ETH
     * @param tokenAbi ABI for the token's contract
     */
    OpenSeaPort.prototype._getTokenBalance = function (_a) {
        var accountAddress = _a.accountAddress, tokenAddress = _a.tokenAddress, _b = _a.tokenAbi, tokenAbi = _b === void 0 ? contracts_1.ERC20 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var amount;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!tokenAddress) {
                            tokenAddress = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address;
                        }
                        return [4 /*yield*/, utils_1.promisify(function (c) { return _this.web3.eth.call({
                                from: accountAddress,
                                to: tokenAddress,
                                data: WyvernSchemas.encodeCall(contracts_1.getMethod(tokenAbi, 'balanceOf'), [accountAddress]),
                            }, c); })];
                    case 1:
                        amount = _c.sent();
                        return [2 /*return*/, utils_1.makeBigNumber(amount.toString())];
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
     */
    OpenSeaPort.prototype._getApprovedTokenCount = function (_a) {
        var accountAddress = _a.accountAddress, tokenAddress = _a.tokenAddress;
        return __awaiter(this, void 0, void 0, function () {
            var contractAddress, approved;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!tokenAddress) {
                            tokenAddress = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address;
                        }
                        contractAddress = lib_1.WyvernProtocol.getTokenTransferProxyAddress(this._networkName);
                        return [4 /*yield*/, utils_1.promisify(function (c) { return _this.web3.eth.call({
                                from: accountAddress,
                                to: tokenAddress,
                                data: WyvernSchemas.encodeCall(contracts_1.getMethod(contracts_1.ERC20, 'allowance'), [accountAddress, contractAddress]),
                            }, c); })];
                    case 1:
                        approved = _b.sent();
                        return [2 /*return*/, utils_1.makeBigNumber(approved)];
                }
            });
        });
    };
    OpenSeaPort.prototype._makeBuyOrder = function (_a) {
        var tokenId = _a.tokenId, tokenAddress = _a.tokenAddress, accountAddress = _a.accountAddress, startAmount = _a.startAmount, _b = _a.expirationTime, expirationTime = _b === void 0 ? 0 : _b, paymentTokenAddress = _a.paymentTokenAddress;
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAsset, metadata, listingTime, asset, buyerFee, sellerFee, _c, target, calldata, replacementPattern, paymentToken, _d, basePrice, extra;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        schema = this._getSchema();
                        wyAsset = utils_1.getWyvernAsset(schema, tokenId, tokenAddress);
                        metadata = {
                            asset: wyAsset,
                            schema: schema.name,
                        };
                        listingTime = Math.round(Date.now() / 1000 - 100);
                        return [4 /*yield*/, this.api.getAsset(tokenAddress, tokenId)];
                    case 1:
                        asset = _e.sent();
                        if (!asset) {
                            throw new Error('No asset found for this order');
                        }
                        buyerFee = asset.assetContract.buyerFeeBasisPoints;
                        sellerFee = asset.assetContract.sellerFeeBasisPoints;
                        _c = WyvernSchemas.encodeBuy(schema, wyAsset, accountAddress), target = _c.target, calldata = _c.calldata, replacementPattern = _c.replacementPattern;
                        paymentToken = paymentTokenAddress || WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address;
                        _d = this._getPriceParameters(paymentToken, startAmount), basePrice = _d.basePrice, extra = _d.extra;
                        return [2 /*return*/, {
                                exchange: lib_1.WyvernProtocol.getExchangeContractAddress(this._networkName),
                                maker: accountAddress,
                                taker: utils_1.NULL_ADDRESS,
                                makerRelayerFee: utils_1.makeBigNumber(buyerFee),
                                takerRelayerFee: utils_1.makeBigNumber(sellerFee),
                                makerProtocolFee: utils_1.makeBigNumber(0),
                                takerProtocolFee: utils_1.makeBigNumber(0),
                                feeMethod: types_1.FeeMethod.SplitFee,
                                feeRecipient: utils_1.feeRecipient,
                                side: types_1.OrderSide.Buy,
                                saleKind: types_1.SaleKind.FixedPrice,
                                target: target,
                                howToCall: types_1.HowToCall.Call,
                                calldata: calldata,
                                replacementPattern: replacementPattern,
                                staticTarget: utils_1.NULL_ADDRESS,
                                staticExtradata: '0x',
                                paymentToken: paymentToken,
                                basePrice: basePrice,
                                extra: extra,
                                listingTime: utils_1.makeBigNumber(listingTime),
                                expirationTime: utils_1.makeBigNumber(expirationTime),
                                salt: lib_1.WyvernProtocol.generatePseudoRandomSalt(),
                                metadata: metadata,
                            }];
                }
            });
        });
    };
    OpenSeaPort.prototype._makeBundleSellOrder = function (_a) {
        var bundleName = _a.bundleName, bundleDescription = _a.bundleDescription, bundleExternalLink = _a.bundleExternalLink, assets = _a.assets, accountAddress = _a.accountAddress, startAmount = _a.startAmount, endAmount = _a.endAmount, _b = _a.expirationTime, expirationTime = _b === void 0 ? 0 : _b, paymentTokenAddress = _a.paymentTokenAddress;
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAssets, bundle, buyerFee, sellerFee, _c, tokenAddress, tokenId, asset, _d, calldata, replacementPattern, paymentToken, _e, basePrice, extra, listingTime, orderSaleKind;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        schema = this._getSchema();
                        wyAssets = assets.map(function (asset) { return utils_1.getWyvernAsset(schema, asset.tokenId, asset.tokenAddress); });
                        bundle = {
                            assets: wyAssets,
                            name: bundleName,
                            description: bundleDescription,
                            external_link: bundleExternalLink
                        };
                        buyerFee = utils_1.DEFAULT_BUYER_FEE_BASIS_POINTS;
                        sellerFee = utils_1.DEFAULT_SELLER_FEE_BASIS_POINTS;
                        if (!(_.uniqBy(assets, 'tokenAddress').length == 1)) return [3 /*break*/, 2];
                        _c = assets[0], tokenAddress = _c.tokenAddress, tokenId = _c.tokenId;
                        return [4 /*yield*/, this.api.getAsset(tokenAddress, tokenId)];
                    case 1:
                        asset = _f.sent();
                        if (!asset) {
                            throw new Error('No asset found for this order');
                        }
                        buyerFee = asset.assetContract.buyerFeeBasisPoints;
                        sellerFee = asset.assetContract.sellerFeeBasisPoints;
                        _f.label = 2;
                    case 2:
                        _d = WyvernSchemas.encodeAtomicizedSell(schema, wyAssets, accountAddress, this._wyvernProtocol.wyvernAtomicizer), calldata = _d.calldata, replacementPattern = _d.replacementPattern;
                        paymentToken = paymentTokenAddress || utils_1.NULL_ADDRESS;
                        _e = this._getPriceParameters(paymentToken, startAmount, endAmount), basePrice = _e.basePrice, extra = _e.extra;
                        listingTime = Math.round(Date.now() / 1000 - 100);
                        orderSaleKind = endAmount != null && endAmount !== startAmount
                            ? types_1.SaleKind.DutchAuction
                            : types_1.SaleKind.FixedPrice;
                        return [2 /*return*/, {
                                exchange: lib_1.WyvernProtocol.getExchangeContractAddress(this._networkName),
                                maker: accountAddress,
                                taker: utils_1.NULL_ADDRESS,
                                makerRelayerFee: utils_1.makeBigNumber(sellerFee),
                                takerRelayerFee: utils_1.makeBigNumber(buyerFee),
                                makerProtocolFee: utils_1.makeBigNumber(0),
                                takerProtocolFee: utils_1.makeBigNumber(0),
                                feeMethod: types_1.FeeMethod.SplitFee,
                                feeRecipient: utils_1.feeRecipient,
                                side: types_1.OrderSide.Sell,
                                saleKind: orderSaleKind,
                                target: lib_1.WyvernProtocol.getAtomicizerContractAddress(this._networkName),
                                howToCall: types_1.HowToCall.DelegateCall,
                                calldata: calldata,
                                replacementPattern: replacementPattern,
                                staticTarget: utils_1.NULL_ADDRESS,
                                staticExtradata: '0x',
                                paymentToken: paymentToken,
                                basePrice: basePrice,
                                extra: extra,
                                listingTime: utils_1.makeBigNumber(listingTime),
                                expirationTime: utils_1.makeBigNumber(expirationTime),
                                salt: lib_1.WyvernProtocol.generatePseudoRandomSalt(),
                                metadata: {
                                    bundle: bundle,
                                    schema: schema.name,
                                },
                            }];
                }
            });
        });
    };
    OpenSeaPort.prototype._makeMatchingOrder = function (_a) {
        var _this = this;
        var order = _a.order, accountAddress = _a.accountAddress;
        var schema = this._getSchema();
        var listingTime = Math.round(Date.now() / 1000 - 1000);
        var computeOrderParams = function () {
            if (order.metadata.asset) {
                return order.side == types_1.OrderSide.Buy
                    ? WyvernSchemas.encodeSell(schema, order.metadata.asset, accountAddress)
                    : WyvernSchemas.encodeBuy(schema, order.metadata.asset, accountAddress);
            }
            else if (order.metadata.bundle) {
                // We're matching a bundle order
                var atomicized = order.side == types_1.OrderSide.Buy
                    ? WyvernSchemas.encodeAtomicizedSell(schema, order.metadata.bundle.assets, accountAddress, _this._wyvernProtocol.wyvernAtomicizer)
                    : WyvernSchemas.encodeAtomicizedBuy(schema, order.metadata.bundle.assets, accountAddress, _this._wyvernProtocol.wyvernAtomicizer);
                return {
                    target: lib_1.WyvernProtocol.getAtomicizerContractAddress(_this._networkName),
                    calldata: atomicized.calldata,
                    replacementPattern: atomicized.replacementPattern
                };
            }
            else {
                throw new Error('Invalid order metadata');
            }
        };
        var _b = computeOrderParams(), target = _b.target, calldata = _b.calldata, replacementPattern = _b.replacementPattern;
        var matchingOrder = {
            exchange: order.exchange,
            maker: accountAddress,
            taker: order.maker,
            makerRelayerFee: order.makerRelayerFee,
            takerRelayerFee: order.takerRelayerFee,
            makerProtocolFee: order.makerProtocolFee,
            takerProtocolFee: order.takerProtocolFee,
            feeMethod: order.feeMethod,
            feeRecipient: utils_1.NULL_ADDRESS,
            side: (order.side + 1) % 2,
            saleKind: types_1.SaleKind.FixedPrice,
            target: target,
            howToCall: order.howToCall,
            calldata: calldata,
            replacementPattern: replacementPattern,
            staticTarget: utils_1.NULL_ADDRESS,
            staticExtradata: '0x',
            paymentToken: order.paymentToken,
            basePrice: order.basePrice,
            extra: utils_1.makeBigNumber(0),
            listingTime: utils_1.makeBigNumber(listingTime),
            expirationTime: utils_1.makeBigNumber(0),
            salt: lib_1.WyvernProtocol.generatePseudoRandomSalt(),
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
     */
    OpenSeaPort.prototype._validateMatch = function (_a) {
        var buy = _a.buy, sell = _a.sell, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var ordersCanMatch, orderCalldataCanMatch;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.ordersCanMatch_.callAsync([buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken], [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt], [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall], buy.calldata, sell.calldata, buy.replacementPattern, sell.replacementPattern, buy.staticExtradata, sell.staticExtradata, { from: accountAddress })];
                    case 1:
                        ordersCanMatch = _b.sent();
                        if (!ordersCanMatch) {
                            throw new Error('Unable to match offer with auction. Please restart your wallet/browser and try again!');
                        }
                        this.logger("Orders matching: " + ordersCanMatch);
                        return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.orderCalldataCanMatch.callAsync(buy.calldata, buy.replacementPattern, sell.calldata, sell.replacementPattern)];
                    case 2:
                        orderCalldataCanMatch = _b.sent();
                        this.logger("Order calldata matching: " + orderCalldataCanMatch);
                        if (!orderCalldataCanMatch) {
                            throw new Error('Unable to match offer details with auction. Please restart your wallet/browser and try again!');
                        }
                        return [2 /*return*/, true];
                }
            });
        });
    };
    // Throws
    OpenSeaPort.prototype._validateSellOrderParameters = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAssets, tokenAddress, proxyAddress, proxy, contractsWithApproveAll, minimumAmount, sellValid;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        schema = this._getSchema();
                        wyAssets = order.metadata.bundle
                            ? order.metadata.bundle.assets
                            : order.metadata.asset
                                ? [order.metadata.asset]
                                : [];
                        tokenAddress = order.paymentToken;
                        return [4 /*yield*/, this._getProxy(accountAddress)];
                    case 1:
                        proxyAddress = _b.sent();
                        if (!!proxyAddress) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._initializeProxy(accountAddress)];
                    case 2:
                        proxyAddress = _b.sent();
                        _b.label = 3;
                    case 3:
                        proxy = proxyAddress;
                        contractsWithApproveAll = [];
                        return [4 /*yield*/, Promise.all(wyAssets.map(function (wyAsset) { return __awaiter(_this, void 0, void 0, function () {
                                var where;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, utils_1.findAsset(this.web3, { account: accountAddress, proxy: proxy, wyAsset: wyAsset, schema: schema })];
                                        case 1:
                                            where = _a.sent();
                                            if (where != 'account') {
                                                // small todo: handle the 'proxy' case, which shouldn't happen ever anyway
                                                throw new Error('You do not own this asset.');
                                            }
                                            return [2 /*return*/, this.approveNonFungibleToken({
                                                    tokenId: wyAsset.id.toString(),
                                                    tokenAddress: wyAsset.address,
                                                    accountAddress: accountAddress,
                                                    proxyAddress: proxyAddress,
                                                    skipApproveAllIfTokenAddressIn: contractsWithApproveAll
                                                })];
                                    }
                                });
                            }); }))
                            // For fulfilling bids,
                            // need to approve access to fungible token because of the way fees are paid
                            // This can be done at a higher level to show UI
                        ];
                    case 4:
                        _b.sent();
                        if (!(tokenAddress != utils_1.NULL_ADDRESS)) return [3 /*break*/, 6];
                        minimumAmount = utils_1.makeBigNumber(order.basePrice);
                        return [4 /*yield*/, this.approveFungibleToken({ accountAddress: accountAddress, tokenAddress: tokenAddress, minimumAmount: minimumAmount })];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.validateOrderParameters_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, { from: accountAddress })];
                    case 7:
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
    // Throws
    OpenSeaPort.prototype._validateBuyOrderParameters = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var tokenAddress, balance, minimumAmount, buyValid;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tokenAddress = order.paymentToken;
                        if (!(tokenAddress != utils_1.NULL_ADDRESS)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._getTokenBalance({ accountAddress: accountAddress, tokenAddress: tokenAddress })
                            /* NOTE: no buy-side auctions for now, so sell.saleKind === 0 */
                        ];
                    case 1:
                        balance = _b.sent();
                        minimumAmount = utils_1.makeBigNumber(order.basePrice);
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
                    case 2:
                        // Check token approval
                        // This can be done at a higher level to show UI
                        _b.sent();
                        _b.label = 3;
                    case 3: return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.validateOrderParameters_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, { from: accountAddress })];
                    case 4:
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
     * Compute the `basePrice` and `extra` parameters to be used to price an order.
     * @param tokenAddress Address of the ERC-20 token to use for trading.
     * Use the null address for ETH
     * @param startAmount The base value for the order, in the token's main units (e.g. ETH instead of wei)
     * @param endAmount The end value for the order, in the token's main units (e.g. ETH instead of wei). If unspecified, the order's `extra` attribute will be 0
     */
    OpenSeaPort.prototype._getPriceParameters = function (tokenAddress, startAmount, endAmount) {
        var isEther = tokenAddress == utils_1.NULL_ADDRESS;
        var token = this.getFungibleTokens({ address: tokenAddress })[0];
        var priceDiff = endAmount != null
            ? startAmount - endAmount
            : 0;
        // Note: WyvernProtocol.toBaseUnitAmount(makeBigNumber(startAmount), token.decimals)
        // will fail if too many decimal places, so special-case ether
        var basePrice = isEther
            ? utils_1.makeBigNumber(this.web3.toWei(startAmount, 'ether')).round()
            : lib_1.WyvernProtocol.toBaseUnitAmount(utils_1.makeBigNumber(startAmount), token.decimals);
        var extra = isEther
            ? utils_1.makeBigNumber(this.web3.toWei(priceDiff, 'ether')).round()
            : lib_1.WyvernProtocol.toBaseUnitAmount(utils_1.makeBigNumber(priceDiff), token.decimals);
        return { basePrice: basePrice, extra: extra };
    };
    /**
     * Private helper methods
     */
    OpenSeaPort.prototype._atomicMatch = function (_a) {
        var buy = _a.buy, sell = _a.sell, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var value, orderLookupHash, buyValid, sellValid, txHash, gasPrice, txnData, args, gasEstimate, error_8, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(sell.maker.toLowerCase() == accountAddress.toLowerCase() && sell.feeRecipient == utils_1.NULL_ADDRESS)) return [3 /*break*/, 3];
                        // USER IS THE SELLER
                        return [4 /*yield*/, this._validateSellOrderParameters({ order: sell, accountAddress: accountAddress })];
                    case 1:
                        // USER IS THE SELLER
                        _b.sent();
                        return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.validateOrder_.callAsync([buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken], [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt], buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, buy.calldata, buy.replacementPattern, buy.staticExtradata, buy.v, buy.r, buy.s, { from: accountAddress })];
                    case 2:
                        buyValid = _b.sent();
                        if (!buyValid) {
                            throw new Error('Invalid offer. Please restart your wallet/browser and try again!');
                        }
                        this.logger("Buy order is valid: " + buyValid);
                        orderLookupHash = buy.hash;
                        return [3 /*break*/, 9];
                    case 3:
                        if (!(buy.maker.toLowerCase() == accountAddress.toLowerCase())) return [3 /*break*/, 8];
                        // USER IS THE BUYER
                        return [4 /*yield*/, this._validateBuyOrderParameters({ order: buy, accountAddress: accountAddress })];
                    case 4:
                        // USER IS THE BUYER
                        _b.sent();
                        return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.validateOrder_.callAsync([sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken], [sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt], sell.feeMethod, sell.side, sell.saleKind, sell.howToCall, sell.calldata, sell.replacementPattern, sell.staticExtradata, sell.v, sell.r, sell.s, { from: accountAddress })];
                    case 5:
                        sellValid = _b.sent();
                        if (!sellValid) {
                            throw new Error('Invalid auction. Please restart your wallet/browser and try again!');
                        }
                        this.logger("Sell order validation: " + sellValid);
                        if (!(buy.paymentToken == utils_1.NULL_ADDRESS)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this._getEthValueForTakingSellOrder(sell)];
                    case 6:
                        value = _b.sent();
                        _b.label = 7;
                    case 7:
                        orderLookupHash = sell.hash;
                        return [3 /*break*/, 9];
                    case 8:
                        // User is neither - matching service
                        // TODO
                        orderLookupHash = buy.hash;
                        _b.label = 9;
                    case 9: return [4 /*yield*/, this._validateMatch({ buy: buy, sell: sell, accountAddress: accountAddress })];
                    case 10:
                        _b.sent();
                        this._dispatch(types_1.EventType.MatchOrders, { buy: buy, sell: sell, accountAddress: accountAddress });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 11:
                        gasPrice = _b.sent();
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
                            [buy.v, sell.v],
                            [buy.r, buy.s, sell.r, sell.s,
                                // Use the order hash so that OrdersMatched events can look it up
                                orderLookupHash]
                        ];
                        _b.label = 12;
                    case 12:
                        _b.trys.push([12, 14, , 15]);
                        return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.atomicMatch_.estimateGasAsync(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], txnData)];
                    case 13:
                        gasEstimate = _b.sent();
                        txnData.gas = this._correctGasAmount(gasEstimate);
                        return [3 /*break*/, 15];
                    case 14:
                        error_8 = _b.sent();
                        console.error(error_8);
                        throw new Error("Oops, the Ethereum network rejected this transaction :( The OpenSea devs have been alerted, but this problem is typically due an item being locked or untransferrable. The exact error was \"" + error_8.message.substr(0, utils_1.MAX_ERROR_LENGTH) + "...\"");
                    case 15:
                        _b.trys.push([15, 17, , 18]);
                        this.logger("Fulfilling order with gas set to " + txnData.gas);
                        return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.atomicMatch_.sendTransactionAsync(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], txnData)];
                    case 16:
                        txHash = _b.sent();
                        return [3 /*break*/, 18];
                    case 17:
                        error_9 = _b.sent();
                        console.error(error_9);
                        throw new Error("Failed to authorize transaction: \"" + (error_9.message
                            ? error_9.message
                            : 'user denied') + "...\"");
                    case 18: return [2 /*return*/, txHash];
                }
            });
        });
    };
    OpenSeaPort.prototype._getEthValueForTakingSellOrder = function (sell) {
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
                        sell.takerRelayerFee = utils_1.makeBigNumber(sell.takerRelayerFee.toString());
                        feePercentage = sell.takerRelayerFee.div(utils_1.INVERSE_BASIS_POINT);
                        fee = feePercentage.times(maxPrice);
                        return [2 /*return*/, fee.plus(maxPrice).ceil()];
                }
            });
        });
    };
    // Throws
    OpenSeaPort.prototype._validateAndPostOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, valid, confirmedOrder;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.hashOrder_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata)];
                    case 1:
                        hash = _a.sent();
                        if (hash !== order.hash) {
                            console.error(order);
                            throw new Error("Order couldn't be validated by the exchange due to a hash mismatch. Make sure your wallet is on the right network!");
                        }
                        this.logger('Order hashes match');
                        return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.validateOrder_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, order.v, order.r || '0x', order.s || '0x')];
                    case 2:
                        valid = _a.sent();
                        if (!valid) {
                            console.error(order);
                            throw new Error('Invalid order. Please restart your wallet/browser and try again!');
                        }
                        this.logger('Order is valid');
                        return [4 /*yield*/, this.api.postOrder(utils_1.orderToJSON(order))];
                    case 3:
                        confirmedOrder = _a.sent();
                        return [2 /*return*/, confirmedOrder];
                }
            });
        });
    };
    OpenSeaPort.prototype._signOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var message, signerAddress;
            return __generator(this, function (_a) {
                message = order.hash;
                signerAddress = order.maker;
                this._dispatch(types_1.EventType.CreateOrder, { order: order, accountAddress: order.maker });
                return [2 /*return*/, utils_1.personalSignAsync(this.web3, message, signerAddress)];
            });
        });
    };
    OpenSeaPort.prototype._getSchema = function (schemaName) {
        if (schemaName === void 0) { schemaName = types_1.WyvernSchemaName.ERC721; }
        var schema = WyvernSchemas.schemas[this._networkName].filter(function (s) { return s.name == schemaName; })[0];
        if (!schema) {
            throw new Error('No schema found for this asset; please check back later!');
        }
        return schema;
    };
    OpenSeaPort.prototype._dispatch = function (event, data) {
        this._emitter.emit(event, data);
    };
    OpenSeaPort.prototype._confirmTransaction = function (transactionHash, event, description) {
        return __awaiter(this, void 0, void 0, function () {
            var transactionEventData, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transactionEventData = { transactionHash: transactionHash, event: event };
                        this.logger("Transaction started: " + description);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        this._dispatch(types_1.EventType.TransactionCreated, transactionEventData);
                        return [4 /*yield*/, utils_1.confirmTransaction(this.web3, transactionHash)];
                    case 2:
                        _a.sent();
                        this.logger("Transaction succeeded: " + description);
                        this._dispatch(types_1.EventType.TransactionConfirmed, transactionEventData);
                        return [3 /*break*/, 4];
                    case 3:
                        error_10 = _a.sent();
                        this.logger("Transaction failed: " + description);
                        this._dispatch(types_1.EventType.TransactionFailed, __assign({}, transactionEventData, { error: error_10 }));
                        throw error_10;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return OpenSeaPort;
}());
exports.OpenSeaPort = OpenSeaPort;
//# sourceMappingURL=seaport.js.map