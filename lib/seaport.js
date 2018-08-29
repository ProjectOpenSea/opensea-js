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
var api_1 = require("./api");
var contracts_1 = require("./contracts");
var types_1 = require("./types");
var wyvern_1 = require("./wyvern");
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
        // Extra wei to add to the mean gas price when making transactions
        this.gasPriceAddition = new bignumber_js_1.BigNumber(3);
        apiConfig.networkName = apiConfig.networkName || types_1.Network.Main;
        apiConfig.gasPrice = apiConfig.gasPrice || wyvern_1.makeBigNumber(100000);
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
                        amount = lib_1.WyvernProtocol.toBaseUnitAmount(wyvern_1.makeBigNumber(amountInEth), token.decimals);
                        this._dispatch(types_1.EventType.WrapEth, { accountAddress: accountAddress, amount: amount });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _b.sent();
                        return [4 /*yield*/, wyvern_1.sendRawTransaction(this.web3, {
                                fromAddress: accountAddress,
                                toAddress: token.address,
                                value: amount,
                                data: WyvernSchemas.encodeCall(contracts_1.getMethod(contracts_1.CanonicalWETH, 'deposit'), []),
                                gasPrice: gasPrice
                            })];
                    case 2:
                        txHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.WrapEth)];
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
                        amount = lib_1.WyvernProtocol.toBaseUnitAmount(wyvern_1.makeBigNumber(amountInEth), token.decimals);
                        this._dispatch(types_1.EventType.UnwrapWeth, { accountAddress: accountAddress, amount: amount });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _b.sent();
                        return [4 /*yield*/, wyvern_1.sendRawTransaction(this.web3, {
                                fromAddress: accountAddress,
                                toAddress: token.address,
                                value: 0,
                                data: WyvernSchemas.encodeCall(contracts_1.getMethod(contracts_1.CanonicalWETH, 'withdraw'), [amount.toString()]),
                                gasPrice: gasPrice
                            })];
                    case 2:
                        txHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.UnwrapWeth)];
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
     * @param amountInEth Ether value of the offer
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
     */
    OpenSeaPort.prototype.createBuyOrder = function (_a) {
        var tokenId = _a.tokenId, tokenAddress = _a.tokenAddress, accountAddress = _a.accountAddress, amountInEth = _a.amountInEth, _b = _a.expirationTime, expirationTime = _b === void 0 ? 0 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var token, schema, wyAsset, metadata, listingTime, asset, buyerFee, sellerFee, _c, target, calldata, replacementPattern, order, hashedOrder, signature, error_1, orderWithSignature;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        token = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther;
                        schema = this._getSchema();
                        wyAsset = wyvern_1.getWyvernAsset(schema, tokenId, tokenAddress);
                        metadata = {
                            asset: wyAsset,
                            schema: schema.name,
                        };
                        listingTime = Math.round(Date.now() / 1000 - 100);
                        return [4 /*yield*/, this.api.getAsset(tokenAddress, tokenId)];
                    case 1:
                        asset = _d.sent();
                        if (!asset) {
                            throw new Error('No asset found for this order');
                        }
                        buyerFee = asset.assetContract.buyerFeeBasisPoints;
                        sellerFee = asset.assetContract.sellerFeeBasisPoints;
                        _c = WyvernSchemas.encodeBuy(schema, wyAsset, accountAddress), target = _c.target, calldata = _c.calldata, replacementPattern = _c.replacementPattern;
                        order = {
                            exchange: lib_1.WyvernProtocol.getExchangeContractAddress(this._networkName),
                            maker: accountAddress,
                            taker: lib_1.WyvernProtocol.NULL_ADDRESS,
                            makerRelayerFee: wyvern_1.makeBigNumber(buyerFee),
                            takerRelayerFee: wyvern_1.makeBigNumber(sellerFee),
                            makerProtocolFee: wyvern_1.makeBigNumber(0),
                            takerProtocolFee: wyvern_1.makeBigNumber(0),
                            feeMethod: types_1.FeeMethod.SplitFee,
                            feeRecipient: wyvern_1.feeRecipient,
                            side: types_1.OrderSide.Buy,
                            saleKind: types_1.SaleKind.FixedPrice,
                            target: target,
                            howToCall: types_1.HowToCall.Call,
                            calldata: calldata,
                            replacementPattern: replacementPattern,
                            staticTarget: lib_1.WyvernProtocol.NULL_ADDRESS,
                            staticExtradata: '0x',
                            paymentToken: token.address,
                            basePrice: lib_1.WyvernProtocol.toBaseUnitAmount(wyvern_1.makeBigNumber(amountInEth), token.decimals),
                            extra: lib_1.WyvernProtocol.toBaseUnitAmount(wyvern_1.makeBigNumber(0), token.decimals),
                            listingTime: wyvern_1.makeBigNumber(listingTime),
                            expirationTime: wyvern_1.makeBigNumber(expirationTime),
                            salt: lib_1.WyvernProtocol.generatePseudoRandomSalt(),
                            metadata: metadata,
                        };
                        // NOTE not in Wyvern exchange code:
                        // frontend checks to make sure
                        // token is approved and sufficiently available
                        return [4 /*yield*/, this._validateBuyOrderParameters({ order: order, accountAddress: accountAddress })];
                    case 2:
                        // NOTE not in Wyvern exchange code:
                        // frontend checks to make sure
                        // token is approved and sufficiently available
                        _d.sent();
                        hashedOrder = __assign({}, order, { hash: wyvern_1.getOrderHash(order) });
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this._signOrder(hashedOrder)];
                    case 4:
                        signature = _d.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _d.sent();
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
     * @param startAmountInEth Price of the asset at the start of the auction
     * @param endAmountInEth Optional price of the asset at the end of its expiration time
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire."
     */
    OpenSeaPort.prototype.createSellOrder = function (_a) {
        var tokenId = _a.tokenId, tokenAddress = _a.tokenAddress, accountAddress = _a.accountAddress, startAmountInEth = _a.startAmountInEth, endAmountInEth = _a.endAmountInEth, _b = _a.expirationTime, expirationTime = _b === void 0 ? 0 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAsset, metadata, listingTime, asset, buyerFee, sellerFee, _c, target, calldata, replacementPattern, extraInEth, orderSaleKind, order, hashedOrder, signature, error_2, orderWithSignature;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        schema = this._getSchema();
                        wyAsset = wyvern_1.getWyvernAsset(schema, tokenId, tokenAddress);
                        metadata = {
                            asset: wyAsset,
                            schema: schema.name,
                        };
                        listingTime = Math.round(Date.now() / 1000 - 100);
                        return [4 /*yield*/, this.api.getAsset(tokenAddress, tokenId)];
                    case 1:
                        asset = _d.sent();
                        if (!asset) {
                            throw new Error('No asset found for this order');
                        }
                        buyerFee = asset.assetContract.buyerFeeBasisPoints;
                        sellerFee = asset.assetContract.sellerFeeBasisPoints;
                        _c = WyvernSchemas.encodeSell(schema, wyAsset, accountAddress), target = _c.target, calldata = _c.calldata, replacementPattern = _c.replacementPattern;
                        extraInEth = endAmountInEth != null
                            ? startAmountInEth - endAmountInEth
                            : 0;
                        orderSaleKind = endAmountInEth != null && endAmountInEth !== startAmountInEth
                            ? types_1.SaleKind.DutchAuction
                            : types_1.SaleKind.FixedPrice;
                        order = {
                            exchange: lib_1.WyvernProtocol.getExchangeContractAddress(this._networkName),
                            maker: accountAddress,
                            taker: lib_1.WyvernProtocol.NULL_ADDRESS,
                            makerRelayerFee: wyvern_1.makeBigNumber(sellerFee),
                            takerRelayerFee: wyvern_1.makeBigNumber(buyerFee),
                            makerProtocolFee: wyvern_1.makeBigNumber(0),
                            takerProtocolFee: wyvern_1.makeBigNumber(0),
                            feeMethod: types_1.FeeMethod.SplitFee,
                            feeRecipient: wyvern_1.feeRecipient,
                            side: types_1.OrderSide.Sell,
                            saleKind: orderSaleKind,
                            target: target,
                            howToCall: types_1.HowToCall.Call,
                            calldata: calldata,
                            replacementPattern: replacementPattern,
                            staticTarget: lib_1.WyvernProtocol.NULL_ADDRESS,
                            staticExtradata: '0x',
                            paymentToken: lib_1.WyvernProtocol.NULL_ADDRESS,
                            // Note: WyvernProtocol.toBaseUnitAmount(makeBigNumber(startAmountInEth), token.decimals)
                            // will fail if too many decimal places
                            basePrice: wyvern_1.makeBigNumber(this.web3.toWei(startAmountInEth, 'ether')).round(),
                            extra: wyvern_1.makeBigNumber(this.web3.toWei(extraInEth, 'ether')).round(),
                            listingTime: wyvern_1.makeBigNumber(listingTime),
                            expirationTime: wyvern_1.makeBigNumber(expirationTime),
                            salt: lib_1.WyvernProtocol.generatePseudoRandomSalt(),
                            metadata: metadata,
                        };
                        return [4 /*yield*/, this._validateSellOrderParameters({ order: order, accountAddress: accountAddress })];
                    case 2:
                        _d.sent();
                        hashedOrder = __assign({}, order, { hash: wyvern_1.getOrderHash(order) });
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this._signOrder(hashedOrder)];
                    case 4:
                        signature = _d.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _d.sent();
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
     * Fullfill or "take" an order for an asset, either a buy or sell order
     * @param param0 __namedParamaters Object
     * @param order The order to fulfill, a.k.a. "take"
     * @param accountAddress The taker's wallet address
     */
    OpenSeaPort.prototype.fulfillOrder = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var orderToMatch, buy, sell, transactionHash;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        orderToMatch = this._makeMatchingOrder({ order: order, accountAddress: accountAddress });
                        if (order.side == types_1.OrderSide.Buy) {
                            buy = order;
                            sell = __assign({}, orderToMatch, { v: buy.v, r: buy.r, s: buy.s });
                        }
                        else {
                            sell = order;
                            buy = __assign({}, orderToMatch, { v: sell.v, r: sell.r, s: sell.s });
                        }
                        this._dispatch(types_1.EventType.MatchOrders, { buy: buy, sell: sell, accountAddress: accountAddress });
                        return [4 /*yield*/, this._atomicMatch({ buy: buy, sell: sell, accountAddress: accountAddress })];
                    case 1:
                        transactionHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(transactionHash.toString(), types_1.EventType.MatchOrders)];
                    case 2:
                        _b.sent();
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
            var protocolInstance, gasPrice, transactionHash;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        protocolInstance = this._wyvernProtocol;
                        this._dispatch(types_1.EventType.CancelOrder, { order: order, accountAddress: accountAddress });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _b.sent();
                        return [4 /*yield*/, protocolInstance.wyvernExchange.cancelOrder_.sendTransactionAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, order.v, order.r, order.s, { from: accountAddress, gasPrice: gasPrice })];
                    case 2:
                        transactionHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(transactionHash.toString(), types_1.EventType.CancelOrder)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Approve a non-fungible token for use in trades.
     * Called internally, but exposed for dev flexibility.
     * @param param0 __namedParamters Object
     * @param tokenId Token id to approve, but only used if approve-all isn't
     *  supported by the token contract
     * @param tokenAddress The contract address of the token being approved
     * @param accountAddress The user's wallet address
     * @param proxyAddress Address of the user's proxy contract. If not provided,
     *  will attempt to fetch it from Wyvern.
     * @param tokenAbi ABI of the token's contract. Defaults to a flexible ERC-721
     *  contract.
     */
    OpenSeaPort.prototype.approveNonFungibleToken = function (_a) {
        var tokenId = _a.tokenId, tokenAddress = _a.tokenAddress, accountAddress = _a.accountAddress, _b = _a.proxyAddress, proxyAddress = _b === void 0 ? null : _b, _c = _a.tokenAbi, tokenAbi = _c === void 0 ? contracts_1.ERC721 : _c;
        return __awaiter(this, void 0, void 0, function () {
            var tokenContract, erc721, isApprovedCheckData, isApprovedForAllCallHash, isApprovedForAll, gasPrice, txHash, error_3, approvedAddr, gasPrice, txHash, error_4;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        tokenContract = this.web3.eth.contract(tokenAbi);
                        return [4 /*yield*/, tokenContract.at(tokenAddress)];
                    case 1:
                        erc721 = _d.sent();
                        if (!!proxyAddress) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._getProxy(accountAddress)];
                    case 2:
                        proxyAddress = _d.sent();
                        if (!proxyAddress) {
                            throw new Error('Uninitialized account');
                        }
                        _d.label = 3;
                    case 3:
                        isApprovedCheckData = erc721.isApprovedForAll.getData(accountAddress, proxyAddress);
                        // Decentraland reverses the arguments to isApprovedForAll, so we need to special case that. :(
                        if (erc721.address == contracts_1.DECENTRALAND_AUCTION_CONFIG['1']) {
                            isApprovedCheckData = erc721.isApprovedForAll.getData(proxyAddress, accountAddress);
                        }
                        return [4 /*yield*/, wyvern_1.promisify(function (c) { return _this.web3.eth.call({
                                from: accountAddress,
                                to: erc721.address,
                                data: isApprovedCheckData,
                            }, c); })];
                    case 4:
                        isApprovedForAllCallHash = _d.sent();
                        isApprovedForAll = parseInt(isApprovedForAllCallHash);
                        if (isApprovedForAll == 1) {
                            // Supports ApproveAll
                            // Result was NULL_BLOCK_HASH + 1
                            this.logger('Already approved proxy for all tokens');
                            return [2 /*return*/];
                        }
                        if (!(isApprovedForAll == 0)) return [3 /*break*/, 10];
                        _d.label = 5;
                    case 5:
                        _d.trys.push([5, 9, , 10]);
                        this._dispatch(types_1.EventType.ApproveAllAssets, { accountAddress: accountAddress, proxyAddress: proxyAddress, tokenAddress: tokenAddress });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 6:
                        gasPrice = _d.sent();
                        return [4 /*yield*/, wyvern_1.sendRawTransaction(this.web3, {
                                fromAddress: accountAddress,
                                toAddress: erc721.address,
                                data: erc721.setApprovalForAll.getData(proxyAddress, true),
                                gasPrice: gasPrice
                            })];
                    case 7:
                        txHash = _d.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.ApproveAllAssets)];
                    case 8:
                        _d.sent();
                        return [2 /*return*/];
                    case 9:
                        error_3 = _d.sent();
                        console.error(error_3);
                        throw new Error('Failed to approve access to these tokens. OpenSea has been alerted, but you can also chat with us on Discord.');
                    case 10:
                        // Does not support ApproveAll (ERC721 v1 or v2)
                        this.logger('Contract does not support Approve All');
                        return [4 /*yield*/, wyvern_1.promisify(function (c) { return erc721.getApproved.call(tokenId, c); })];
                    case 11:
                        approvedAddr = _d.sent();
                        if (approvedAddr == proxyAddress) {
                            this.logger('Already approved proxy for this token');
                            return [2 /*return*/];
                        }
                        this.logger("Approve response: " + approvedAddr);
                        if (!(approvedAddr == '0x')) return [3 /*break*/, 13];
                        return [4 /*yield*/, wyvern_1.promisify(function (c) { return erc721.kittyIndexToApproved.call(tokenId, c); })];
                    case 12:
                        // CRYPTOKITTIES check
                        approvedAddr = _d.sent();
                        if (approvedAddr == proxyAddress) {
                            this.logger('Already approved proxy for this kitty');
                            return [2 /*return*/];
                        }
                        this.logger("CryptoKitties approve response: " + approvedAddr);
                        _d.label = 13;
                    case 13:
                        if (!(approvedAddr == '0x')) return [3 /*break*/, 15];
                        return [4 /*yield*/, wyvern_1.promisify(function (c) { return erc721.allowed.call(accountAddress, tokenId, c); })];
                    case 14:
                        // ETHEREMON check
                        approvedAddr = _d.sent();
                        if (approvedAddr == proxyAddress) {
                            this.logger('Already allowed proxy for this token');
                            return [2 /*return*/];
                        }
                        this.logger("\"allowed\" response: " + approvedAddr);
                        _d.label = 15;
                    case 15:
                        _d.trys.push([15, 19, , 20]);
                        this._dispatch(types_1.EventType.ApproveAsset, { accountAddress: accountAddress, proxyAddress: proxyAddress, tokenAddress: tokenAddress, tokenId: tokenId });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 16:
                        gasPrice = _d.sent();
                        return [4 /*yield*/, wyvern_1.sendRawTransaction(this.web3, {
                                fromAddress: accountAddress,
                                toAddress: erc721.address,
                                data: erc721.approve.getData(proxyAddress, tokenId),
                                gasPrice: gasPrice
                            })];
                    case 17:
                        txHash = _d.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.ApproveAsset)];
                    case 18:
                        _d.sent();
                        return [2 /*return*/];
                    case 19:
                        error_4 = _d.sent();
                        console.error(error_4);
                        throw new Error('Failed to approve access to this token. OpenSea has been alerted, but you can also chat with us on Discord.');
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Approve a fungible token (e.g. W-ETH) for use in trades.
     * Called internally, but exposed for dev flexibility.
     * @param param0 __namedParamters Object
     * @param accountAddress The user's wallet address
     * @param tokenAddress The contract address of the token being approved
     */
    OpenSeaPort.prototype.approveFungibleToken = function (_a) {
        var accountAddress = _a.accountAddress, tokenAddress = _a.tokenAddress;
        return __awaiter(this, void 0, void 0, function () {
            var contractAddress, gasPrice, txHash;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        contractAddress = lib_1.WyvernProtocol.getTokenTransferProxyAddress(this._networkName);
                        this._dispatch(types_1.EventType.ApproveCurrency, { accountAddress: accountAddress, tokenAddress: tokenAddress });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _b.sent();
                        return [4 /*yield*/, wyvern_1.sendRawTransaction(this.web3, {
                                fromAddress: accountAddress,
                                toAddress: tokenAddress,
                                data: WyvernSchemas.encodeCall(contracts_1.getMethod(contracts_1.ERC20, 'approve'), [contractAddress, lib_1.WyvernProtocol.MAX_UINT_256.toString()]),
                                gasPrice: gasPrice
                            })];
                    case 2:
                        txHash = _b.sent();
                        return [4 /*yield*/, this._confirmTransaction(txHash, types_1.EventType.ApproveCurrency)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
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
            var protocolInstance, currentPrice;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        protocolInstance = this._wyvernProtocol;
                        return [4 /*yield*/, protocolInstance.wyvernExchange.calculateCurrentPrice_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata)];
                    case 1:
                        currentPrice = _a.sent();
                        return [2 /*return*/, currentPrice];
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
            var meanGas;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, wyvern_1.getCurrentGasPrice(this.web3)];
                    case 1:
                        meanGas = _a.sent();
                        return [2 /*return*/, meanGas.plus(this.gasPriceAddition)];
                }
            });
        });
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
                        if (!(buy.maker == accountAddress)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._getEthValueForTakingSellOrder(sell)];
                    case 1:
                        value = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this._wyvernProtocol.wyvernExchange.atomicMatch_.estimateGasAsync([buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken], [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt], [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall], buy.calldata, sell.calldata, buy.replacementPattern, sell.replacementPattern, buy.staticExtradata, sell.staticExtradata, [buy.v, sell.v], [buy.r, buy.s, sell.r, sell.s,
                            lib_1.WyvernProtocol.NULL_ADDRESS], 
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
     */
    OpenSeaPort.prototype._getProxy = function (accountAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolInstance, proxyAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        protocolInstance = this._wyvernProtocol;
                        return [4 /*yield*/, protocolInstance.wyvernProxyRegistry.proxies.callAsync(accountAddress)];
                    case 1:
                        proxyAddress = _a.sent();
                        if (proxyAddress == '0x') {
                            throw new Error("Couldn't retrieve your account from the blockchain - make sure you're on the correct Ethereum network!");
                        }
                        if (!proxyAddress || proxyAddress == lib_1.WyvernProtocol.NULL_ADDRESS) {
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
            var protocolInstance, gasPrice, transactionHash, proxyAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        protocolInstance = this._wyvernProtocol;
                        this._dispatch(types_1.EventType.InitializeAccount, { accountAddress: accountAddress });
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 1:
                        gasPrice = _a.sent();
                        return [4 /*yield*/, protocolInstance.wyvernProxyRegistry.registerProxy.sendTransactionAsync({
                                from: accountAddress,
                                gasPrice: gasPrice
                            })];
                    case 2:
                        transactionHash = _a.sent();
                        return [4 /*yield*/, this._confirmTransaction(transactionHash, types_1.EventType.InitializeAccount)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this._getProxy(accountAddress)];
                    case 4:
                        proxyAddress = _a.sent();
                        if (!proxyAddress) {
                            throw new Error('Failed to initialize your account, please try again');
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
                        return [4 /*yield*/, wyvern_1.promisify(function (c) { return _this.web3.eth.call({
                                from: accountAddress,
                                to: tokenAddress,
                                data: WyvernSchemas.encodeCall(contracts_1.getMethod(tokenAbi, 'balanceOf'), [accountAddress]),
                            }, c); })];
                    case 1:
                        amount = _c.sent();
                        return [2 /*return*/, wyvern_1.makeBigNumber(amount.toString())];
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
                        return [4 /*yield*/, wyvern_1.promisify(function (c) { return _this.web3.eth.call({
                                from: accountAddress,
                                to: tokenAddress,
                                data: WyvernSchemas.encodeCall(contracts_1.getMethod(contracts_1.ERC20, 'allowance'), [accountAddress, contractAddress]),
                            }, c); })];
                    case 1:
                        approved = _b.sent();
                        return [2 /*return*/, wyvern_1.makeBigNumber(approved)];
                }
            });
        });
    };
    OpenSeaPort.prototype._makeMatchingOrder = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress;
        var schema = this._getSchema();
        var listingTime = Math.round(Date.now() / 1000 - 1000);
        var _b = order.side == types_1.OrderSide.Buy
            ? WyvernSchemas.encodeSell(schema, order.metadata.asset, accountAddress)
            : WyvernSchemas.encodeBuy(schema, order.metadata.asset, accountAddress), target = _b.target, calldata = _b.calldata, replacementPattern = _b.replacementPattern;
        var matchingOrder = {
            exchange: order.exchange,
            maker: accountAddress,
            taker: lib_1.WyvernProtocol.NULL_ADDRESS,
            makerRelayerFee: order.makerRelayerFee,
            takerRelayerFee: order.takerRelayerFee,
            makerProtocolFee: order.makerProtocolFee,
            takerProtocolFee: order.takerProtocolFee,
            feeMethod: order.feeMethod,
            feeRecipient: lib_1.WyvernProtocol.NULL_ADDRESS,
            side: (order.side + 1) % 2,
            saleKind: types_1.SaleKind.FixedPrice,
            target: target,
            howToCall: order.howToCall,
            calldata: calldata,
            replacementPattern: replacementPattern,
            staticTarget: lib_1.WyvernProtocol.NULL_ADDRESS,
            staticExtradata: '0x',
            paymentToken: order.paymentToken,
            basePrice: order.basePrice,
            extra: wyvern_1.makeBigNumber(0),
            listingTime: wyvern_1.makeBigNumber(listingTime),
            expirationTime: wyvern_1.makeBigNumber(0),
            salt: lib_1.WyvernProtocol.generatePseudoRandomSalt(),
            metadata: order.metadata,
        };
        return __assign({}, matchingOrder, { hash: wyvern_1.getOrderHash(matchingOrder) });
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
                            throw new Error('Unable to match offer with auction');
                        }
                        this.logger("Orders matching: " + ordersCanMatch);
                        return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.orderCalldataCanMatch.callAsync(buy.calldata, buy.replacementPattern, sell.calldata, sell.replacementPattern)];
                    case 2:
                        orderCalldataCanMatch = _b.sent();
                        this.logger("Order calldata matching: " + orderCalldataCanMatch);
                        if (!orderCalldataCanMatch) {
                            throw new Error('Unable to match offer with auction, due to the type of offer requested');
                        }
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Private helper methods
     */
    OpenSeaPort.prototype._atomicMatch = function (_a) {
        var buy = _a.buy, sell = _a.sell, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var value, orderLookupHash, buyValid, sellValid, txHash, gasPrice, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(sell.maker.toLowerCase() == accountAddress.toLowerCase() && sell.feeRecipient == lib_1.WyvernProtocol.NULL_ADDRESS)) return [3 /*break*/, 3];
                        // USER IS THE SELLER
                        return [4 /*yield*/, this._validateSellOrderParameters({ order: sell, accountAddress: accountAddress })];
                    case 1:
                        // USER IS THE SELLER
                        _b.sent();
                        return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.validateOrder_.callAsync([buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken], [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt], buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, buy.calldata, buy.replacementPattern, buy.staticExtradata, buy.v, buy.r, buy.s, { from: accountAddress })];
                    case 2:
                        buyValid = _b.sent();
                        if (!buyValid) {
                            throw new Error('Invalid offer');
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
                            throw new Error('Invalid auction');
                        }
                        this.logger("Sell order validation: " + sellValid);
                        if (!(buy.paymentToken == lib_1.WyvernProtocol.NULL_ADDRESS)) return [3 /*break*/, 7];
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
                        return [4 /*yield*/, this._computeGasPrice()];
                    case 11:
                        gasPrice = _b.sent();
                        _b.label = 12;
                    case 12:
                        _b.trys.push([12, 14, , 15]);
                        return [4 /*yield*/, this._wyvernProtocol.wyvernExchange.atomicMatch_.sendTransactionAsync([buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target,
                                buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken], [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt], [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall], buy.calldata, sell.calldata, buy.replacementPattern, sell.replacementPattern, buy.staticExtradata, sell.staticExtradata, [buy.v, sell.v], [buy.r, buy.s, sell.r, sell.s,
                                // Use the order hash so that OrdersMatched events can look it up
                                orderLookupHash], { from: accountAddress, value: value, gasPrice: gasPrice })];
                    case 13:
                        txHash = _b.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        error_5 = _b.sent();
                        console.error(error_5);
                        throw new Error("Failed to authorize transaction: \"" + (error_5.message
                            ? error_5.message
                            : 'user denied') + "...\"");
                    case 15: return [2 /*return*/, txHash];
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
                        estimatedPrice = wyvern_1.estimateCurrentPrice(sell);
                        maxPrice = bignumber_js_1.BigNumber.max(currentPrice, estimatedPrice);
                        // TODO Why is this not always a big number?
                        sell.takerRelayerFee = wyvern_1.makeBigNumber(sell.takerRelayerFee.toString());
                        feePercentage = sell.takerRelayerFee.div(wyvern_1.INVERSE_BASIS_POINT);
                        fee = feePercentage.times(maxPrice);
                        return [2 /*return*/, fee.plus(maxPrice).ceil()];
                }
            });
        });
    };
    // Throws
    OpenSeaPort.prototype._validateSellOrderParameters = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAsset, proxyAddress, where, protocolInstance, sellValid;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        schema = this._getSchema();
                        wyAsset = order.metadata.asset;
                        return [4 /*yield*/, this._getProxy(accountAddress)];
                    case 1:
                        proxyAddress = _b.sent();
                        if (!!proxyAddress) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._initializeProxy(accountAddress)];
                    case 2:
                        proxyAddress = _b.sent();
                        _b.label = 3;
                    case 3: return [4 /*yield*/, wyvern_1.findAsset(this.web3, { account: accountAddress, proxy: proxyAddress, wyAsset: wyAsset, schema: schema })];
                    case 4:
                        where = _b.sent();
                        if (where == 'other') {
                            throw new Error('You do not own this asset.');
                        }
                        // Won't happen - but withdraw needs fixing
                        // if (where === 'proxy') {
                        //   this.logger(`Whether you must first withdraw this asset: ${true}`)
                        //   await this._withdrawAsset(asset, accountAddress, proxyAddress)
                        // }
                        // else where === 'account':
                        return [4 /*yield*/, this.approveNonFungibleToken({
                                tokenId: wyAsset.id.toString(),
                                tokenAddress: wyAsset.address,
                                accountAddress: accountAddress,
                                proxyAddress: proxyAddress
                            })
                            // Check sell parameters
                        ];
                    case 5:
                        // Won't happen - but withdraw needs fixing
                        // if (where === 'proxy') {
                        //   this.logger(`Whether you must first withdraw this asset: ${true}`)
                        //   await this._withdrawAsset(asset, accountAddress, proxyAddress)
                        // }
                        // else where === 'account':
                        _b.sent();
                        protocolInstance = this._wyvernProtocol;
                        return [4 /*yield*/, protocolInstance.wyvernExchange.validateOrderParameters_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, { from: accountAddress })];
                    case 6:
                        sellValid = _b.sent();
                        if (!sellValid) {
                            throw new Error("Failed to validate sell order parameters: " + JSON.stringify(order));
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
            var tokenAddress, balance, required, approved, error_6, protocolInstance, buyValid;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tokenAddress = order.paymentToken;
                        if (!(tokenAddress != lib_1.WyvernProtocol.NULL_ADDRESS)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this._getTokenBalance({ accountAddress: accountAddress, tokenAddress: tokenAddress })];
                    case 1:
                        balance = _b.sent();
                        required = order.basePrice /* NOTE: no buy-side auctions for now, so sell.saleKind === 0 */;
                        // Check WETH balance
                        if (balance.toNumber() < required.toNumber()) {
                            if (tokenAddress == WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address) {
                                throw new Error('Insufficient balance. You may need to wrap Ether.');
                            }
                            else {
                                throw new Error('Insufficient balance.');
                            }
                        }
                        return [4 /*yield*/, this._getApprovedTokenCount({ accountAddress: accountAddress, tokenAddress: tokenAddress })];
                    case 2:
                        approved = _b.sent();
                        if (!(approved.toNumber() < required.toNumber())) return [3 /*break*/, 6];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.approveFungibleToken({ accountAddress: accountAddress, tokenAddress: tokenAddress })];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_6 = _b.sent();
                        console.error(error_6);
                        throw new Error('You declined to approve your W-ETH.');
                    case 6:
                        protocolInstance = this._wyvernProtocol;
                        return [4 /*yield*/, protocolInstance.wyvernExchange.validateOrderParameters_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, { from: accountAddress })];
                    case 7:
                        buyValid = _b.sent();
                        if (!buyValid) {
                            throw new Error("Failed to validate buy order parameters: " + JSON.stringify(order));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // Throws
    OpenSeaPort.prototype._validateAndPostOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolInstance, hash, valid, confirmedOrder;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        protocolInstance = this._wyvernProtocol;
                        return [4 /*yield*/, protocolInstance.wyvernExchange.hashOrder_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata)];
                    case 1:
                        hash = _a.sent();
                        if (hash !== order.hash) {
                            console.error(order);
                            throw new Error("Order couldn't be validated by the exchange due to a hash mismatch. Make sure your wallet is on the right network!");
                        }
                        this.logger('Order hashes match');
                        return [4 /*yield*/, protocolInstance.wyvernExchange.validateOrder_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, order.v, order.r || '0x', order.s || '0x')];
                    case 2:
                        valid = _a.sent();
                        if (!valid) {
                            console.error(order);
                            throw new Error('Invalid order');
                        }
                        this.logger('Order is valid');
                        return [4 /*yield*/, this.api.postOrder(wyvern_1.orderToJSON(order))];
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
                return [2 /*return*/, wyvern_1.personalSignAsync(this.web3, message, signerAddress)];
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
    OpenSeaPort.prototype._confirmTransaction = function (transactionHash, event) {
        return __awaiter(this, void 0, void 0, function () {
            var transactionEventData, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transactionEventData = { transactionHash: transactionHash, event: event };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        this._dispatch(types_1.EventType.TransactionCreated, transactionEventData);
                        return [4 /*yield*/, wyvern_1.confirmTransaction(this.web3, transactionHash)];
                    case 2:
                        _a.sent();
                        this._dispatch(types_1.EventType.TransactionConfirmed, transactionEventData);
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        this._dispatch(types_1.EventType.TransactionFailed, __assign({}, transactionEventData, { error: error_7 }));
                        throw error_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return OpenSeaPort;
}());
exports.OpenSeaPort = OpenSeaPort;
//# sourceMappingURL=seaport.js.map