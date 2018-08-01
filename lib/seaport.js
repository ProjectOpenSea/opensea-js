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
    function OpenSeaPort(provider, apiConfig, logger) {
        if (apiConfig === void 0) { apiConfig = {}; }
        apiConfig.networkName = apiConfig.networkName || types_1.Network.Main;
        apiConfig.gasPrice = apiConfig.gasPrice || wyvern_1.makeBigNumber(100000);
        // Web3 Config
        this.web3 = new Web3(provider);
        this.networkName = apiConfig.networkName;
        // WyvernJS config
        this.wyvernProtocol = new lib_1.WyvernProtocol(provider, {
            network: this.networkName,
            gasPrice: apiConfig.gasPrice,
        });
        // API config
        this.api = new api_1.OpenSeaAPI(apiConfig);
        // Emit events
        this.emitter = new fbemitter_1.EventEmitter();
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
            ? this.emitter.once(event, listener)
            : this.emitter.addListener(event, listener);
        return subscription;
    };
    /**
     * Remove an event listener, included here for completeness.
     * Simply calls `.remove()` on a subscription
     * @param subscription The event subscription returned from `addListener`
     */
    OpenSeaPort.prototype.removeListener = function (subscription) {
        // Kill tslint "no this used" warning
        if (!this.emitter) {
            return;
        }
        subscription.remove();
    };
    OpenSeaPort.prototype.removeAllListeners = function (event) {
        this.emitter.removeAllListeners(event);
    };
    OpenSeaPort.prototype.wrapEth = function (_a) {
        var amountInEth = _a.amountInEth, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var token, amount, txHash, transactionHash;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        token = WyvernSchemas.tokens[this.networkName].canonicalWrappedEther;
                        amount = lib_1.WyvernProtocol.toBaseUnitAmount(wyvern_1.makeBigNumber(amountInEth), token.decimals);
                        return [4 /*yield*/, wyvern_1.sendRawTransaction(this.web3, {
                                fromAddress: accountAddress,
                                toAddress: token.address,
                                value: amount,
                                data: WyvernSchemas.encodeCall(contracts_1.getMethod(contracts_1.CanonicalWETH, 'deposit'), []),
                                awaitConfirmation: false,
                            })];
                    case 1:
                        txHash = _b.sent();
                        transactionHash = txHash.toString();
                        this._dispatch(types_1.EventType.WrapEth, { accountAddress: accountAddress, amount: amount, transactionHash: transactionHash });
                        return [4 /*yield*/, wyvern_1.confirmTransaction(this.web3, transactionHash)];
                    case 2:
                        _b.sent();
                        this._dispatch(types_1.EventType.WrapEthComplete, { accountAddress: accountAddress, amount: amount });
                        return [2 /*return*/];
                }
            });
        });
    };
    OpenSeaPort.prototype.unwrapWeth = function (_a) {
        var amountInEth = _a.amountInEth, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var token, amount, txHash, transactionHash;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        token = WyvernSchemas.tokens[this.networkName].canonicalWrappedEther;
                        amount = lib_1.WyvernProtocol.toBaseUnitAmount(wyvern_1.makeBigNumber(amountInEth), token.decimals);
                        txHash = wyvern_1.sendRawTransaction(this.web3, {
                            fromAddress: accountAddress,
                            toAddress: token.address,
                            value: 0,
                            data: WyvernSchemas.encodeCall(contracts_1.getMethod(contracts_1.CanonicalWETH, 'withdraw'), [amount.toString()]),
                            awaitConfirmation: false,
                        });
                        transactionHash = txHash.toString();
                        this._dispatch(types_1.EventType.UnwrapWeth, { accountAddress: accountAddress, amount: amount, transactionHash: transactionHash });
                        return [4 /*yield*/, wyvern_1.confirmTransaction(this.web3, transactionHash)];
                    case 1:
                        _b.sent();
                        this._dispatch(types_1.EventType.UnwrapWethComplete, { accountAddress: accountAddress, amount: amount });
                        return [2 /*return*/];
                }
            });
        });
    };
    OpenSeaPort.prototype.createBuyOrder = function (_a) {
        var tokenId = _a.tokenId, tokenAddress = _a.tokenAddress, accountAddress = _a.accountAddress, amountInEth = _a.amountInEth, _b = _a.expirationTime, expirationTime = _b === void 0 ? 0 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var token, schema, wyAsset, metadata, listingTime, _c, target, calldata, replacementPattern, order, hashedOrder, signature, error_1, orderWithSignature;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        token = WyvernSchemas.tokens[this.networkName].canonicalWrappedEther;
                        schema = this._getSchema();
                        wyAsset = wyvern_1.getWyvernAsset(schema, tokenId, tokenAddress);
                        metadata = {
                            asset: wyAsset,
                            schema: schema.name,
                        };
                        listingTime = Math.round(Date.now() / 1000 - 100);
                        _c = WyvernSchemas.encodeBuy(schema, wyAsset, accountAddress), target = _c.target, calldata = _c.calldata, replacementPattern = _c.replacementPattern;
                        order = {
                            exchange: lib_1.WyvernProtocol.getExchangeContractAddress(this.networkName),
                            maker: accountAddress,
                            taker: lib_1.WyvernProtocol.NULL_ADDRESS,
                            makerRelayerFee: wyvern_1.makeBigNumber(0),
                            takerRelayerFee: wyvern_1.makeBigNumber(0),
                            makerProtocolFee: wyvern_1.makeBigNumber(0),
                            takerProtocolFee: wyvern_1.makeBigNumber(0),
                            feeMethod: types_1.FeeMethod.ProtocolFee,
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
                    case 1:
                        // NOTE not in Wyvern exchange code:
                        // frontend checks to make sure
                        // token is approved and sufficiently available
                        _d.sent();
                        hashedOrder = __assign({}, order, { 
                            // TS Bug with wyvern 0x schemas
                            hash: lib_1.WyvernProtocol.getOrderHashHex(wyvern_1.orderToJSON(order)) });
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this._signOrder(hashedOrder)];
                    case 3:
                        signature = _d.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _d.sent();
                        console.error(error_1);
                        throw new Error("You declined to sign your offer. Just a reminder: there's no gas needed anymore to create offers!");
                    case 5:
                        orderWithSignature = __assign({}, hashedOrder, signature);
                        return [2 /*return*/, this._validateAndPostOrder(orderWithSignature)];
                }
            });
        });
    };
    OpenSeaPort.prototype.createSellOrder = function (_a) {
        var tokenId = _a.tokenId, tokenAddress = _a.tokenAddress, accountAddress = _a.accountAddress, startAmountInEth = _a.startAmountInEth, endAmountInEth = _a.endAmountInEth, _b = _a.expirationTime, expirationTime = _b === void 0 ? 0 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAsset, metadata, listingTime, _c, target, calldata, replacementPattern, extraInEth, orderSaleKind, order, hashedOrder, signature, error_2, orderWithSignature;
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
                        _c = WyvernSchemas.encodeSell(schema, wyAsset, accountAddress), target = _c.target, calldata = _c.calldata, replacementPattern = _c.replacementPattern;
                        extraInEth = endAmountInEth != null
                            ? startAmountInEth - endAmountInEth
                            : 0;
                        orderSaleKind = endAmountInEth != null && endAmountInEth !== startAmountInEth
                            ? types_1.SaleKind.DutchAuction
                            : types_1.SaleKind.FixedPrice;
                        order = {
                            exchange: lib_1.WyvernProtocol.getExchangeContractAddress(this.networkName),
                            maker: accountAddress,
                            taker: lib_1.WyvernProtocol.NULL_ADDRESS,
                            makerRelayerFee: wyvern_1.makeBigNumber(0),
                            takerRelayerFee: wyvern_1.makeBigNumber(0),
                            makerProtocolFee: wyvern_1.makeBigNumber(0),
                            takerProtocolFee: wyvern_1.makeBigNumber(0),
                            feeMethod: types_1.FeeMethod.ProtocolFee,
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
                    case 1:
                        _d.sent();
                        hashedOrder = __assign({}, order, { 
                            // TS Bug with wyvern 0x schemas
                            hash: lib_1.WyvernProtocol.getOrderHashHex(wyvern_1.orderToJSON(order)) });
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this._signOrder(hashedOrder)];
                    case 3:
                        signature = _d.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _d.sent();
                        console.error(error_2);
                        throw new Error("You declined to sign your auction. Just a reminder: there's no gas needed anymore to create auctions!");
                    case 5:
                        orderWithSignature = __assign({}, hashedOrder, signature);
                        return [2 /*return*/, this._validateAndPostOrder(orderWithSignature)];
                }
            });
        });
    };
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
                        return [4 /*yield*/, this._atomicMatch({ buy: buy, sell: sell, accountAddress: accountAddress })];
                    case 1:
                        transactionHash = _b.sent();
                        this._dispatch(types_1.EventType.MatchOrders, { buy: buy, sell: sell, accountAddress: accountAddress, transactionHash: transactionHash });
                        return [4 /*yield*/, wyvern_1.confirmTransaction(this.web3, transactionHash.toString())];
                    case 2:
                        _b.sent();
                        this._dispatch(types_1.EventType.MatchOrdersComplete, { buy: buy, sell: sell, accountAddress: accountAddress });
                        return [2 /*return*/];
                }
            });
        });
    };
    OpenSeaPort.prototype.cancelOrder = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var protocolInstance, transactionHash;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        protocolInstance = this.wyvernProtocol;
                        return [4 /*yield*/, protocolInstance.wyvernExchange.cancelOrder_.sendTransactionAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, order.v, order.r, order.s, { from: accountAddress })];
                    case 1:
                        transactionHash = _b.sent();
                        this._dispatch(types_1.EventType.CancelOrder, { order: order, accountAddress: accountAddress, transactionHash: transactionHash });
                        return [4 /*yield*/, wyvern_1.confirmTransaction(this.web3, transactionHash.toString())];
                    case 2:
                        _b.sent();
                        this._dispatch(types_1.EventType.CancelOrderComplete, { order: order, accountAddress: accountAddress });
                        return [2 /*return*/];
                }
            });
        });
    };
    OpenSeaPort.prototype.getApprovedTokenCount = function (_a) {
        var accountAddress = _a.accountAddress, tokenAddress = _a.tokenAddress;
        return __awaiter(this, void 0, void 0, function () {
            var contractAddress, approved;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        contractAddress = lib_1.WyvernProtocol.getTokenTransferProxyAddress(this.networkName);
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
    OpenSeaPort.prototype.approveNonFungibleToken = function (_a) {
        var tokenId = _a.tokenId, tokenAddress = _a.tokenAddress, accountAddress = _a.accountAddress, _b = _a.proxyAddress, proxyAddress = _b === void 0 ? null : _b, _c = _a.tokenAbi, tokenAbi = _c === void 0 ? contracts_1.ERC721 : _c;
        return __awaiter(this, void 0, void 0, function () {
            var tokenContract, erc721, isApprovedCheckData, isApprovedForAllCallHash, isApprovedForAll, txHash, transactionHash, error_3, approvedAddr, txHash, transactionHash, error_4;
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
                        _d.label = 3;
                    case 3:
                        if (!proxyAddress) {
                            throw new Error('Uninitialized account');
                        }
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
                        if (!(isApprovedForAll == 0)) return [3 /*break*/, 9];
                        _d.label = 5;
                    case 5:
                        _d.trys.push([5, 8, , 9]);
                        return [4 /*yield*/, wyvern_1.sendRawTransaction(this.web3, {
                                fromAddress: accountAddress,
                                toAddress: erc721.address,
                                data: erc721.setApprovalForAll.getData(proxyAddress, true),
                                awaitConfirmation: false,
                            })];
                    case 6:
                        txHash = _d.sent();
                        transactionHash = txHash.toString();
                        this._dispatch(types_1.EventType.ApproveAllAssets, { accountAddress: accountAddress, proxyAddress: proxyAddress, tokenAddress: tokenAddress, transactionHash: transactionHash });
                        return [4 /*yield*/, wyvern_1.confirmTransaction(this.web3, transactionHash)];
                    case 7:
                        _d.sent();
                        this._dispatch(types_1.EventType.ApproveAllAssetsComplete, { accountAddress: accountAddress, proxyAddress: proxyAddress, tokenAddress: tokenAddress });
                        return [2 /*return*/];
                    case 8:
                        error_3 = _d.sent();
                        console.error(error_3);
                        throw new Error('Failed to approve access to these tokens. OpenSea has been alerted, but you can also chat with us on Discord.');
                    case 9:
                        // Does not support ApproveAll (ERC721 v1 or v2)
                        this.logger('Contract does not support Approve All');
                        return [4 /*yield*/, wyvern_1.promisify(function (c) { return erc721.getApproved.call(tokenId, c); })];
                    case 10:
                        approvedAddr = _d.sent();
                        if (approvedAddr == proxyAddress) {
                            this.logger('Already approved proxy for this token');
                            return [2 /*return*/];
                        }
                        this.logger("Approve response: " + approvedAddr);
                        if (!(approvedAddr == '0x')) return [3 /*break*/, 12];
                        return [4 /*yield*/, wyvern_1.promisify(function (c) { return erc721.kittyIndexToApproved.call(tokenId, c); })];
                    case 11:
                        // CRYPTOKITTIES check
                        approvedAddr = _d.sent();
                        if (approvedAddr == proxyAddress) {
                            this.logger('Already approved proxy for this kitty');
                            return [2 /*return*/];
                        }
                        this.logger("CryptoKitties approve response: " + approvedAddr);
                        _d.label = 12;
                    case 12:
                        if (!(approvedAddr == '0x')) return [3 /*break*/, 14];
                        return [4 /*yield*/, wyvern_1.promisify(function (c) { return erc721.allowed.call(accountAddress, tokenId, c); })];
                    case 13:
                        // ETHEREMON check
                        approvedAddr = _d.sent();
                        if (approvedAddr == proxyAddress) {
                            this.logger('Already allowed proxy for this token');
                            return [2 /*return*/];
                        }
                        this.logger("\"allowed\" response: " + approvedAddr);
                        _d.label = 14;
                    case 14:
                        _d.trys.push([14, 17, , 18]);
                        return [4 /*yield*/, wyvern_1.sendRawTransaction(this.web3, {
                                fromAddress: accountAddress,
                                toAddress: erc721.address,
                                data: erc721.approve.getData(proxyAddress, tokenId),
                                awaitConfirmation: false
                            })];
                    case 15:
                        txHash = _d.sent();
                        transactionHash = txHash.toString();
                        this._dispatch(types_1.EventType.ApproveAsset, { accountAddress: accountAddress, proxyAddress: proxyAddress, tokenAddress: tokenAddress, tokenId: tokenId, transactionHash: transactionHash });
                        return [4 /*yield*/, wyvern_1.confirmTransaction(this.web3, transactionHash)];
                    case 16:
                        _d.sent();
                        this._dispatch(types_1.EventType.ApproveAssetComplete, { accountAddress: accountAddress, proxyAddress: proxyAddress, tokenAddress: tokenAddress, tokenId: tokenId });
                        return [2 /*return*/];
                    case 17:
                        error_4 = _d.sent();
                        console.error(error_4);
                        throw new Error('Failed to approve access to this token. OpenSea has been alerted, but you can also chat with us on Discord.');
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    // Returns transaction hash
    OpenSeaPort.prototype.approveFungibleToken = function (_a) {
        var accountAddress = _a.accountAddress, tokenAddress = _a.tokenAddress;
        return __awaiter(this, void 0, void 0, function () {
            var contractAddress, txHash;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        contractAddress = lib_1.WyvernProtocol.getTokenTransferProxyAddress(this.networkName);
                        return [4 /*yield*/, wyvern_1.sendRawTransaction(this.web3, {
                                fromAddress: accountAddress,
                                toAddress: tokenAddress,
                                data: WyvernSchemas.encodeCall(contracts_1.getMethod(contracts_1.ERC20, 'approve'), [contractAddress, lib_1.WyvernProtocol.MAX_UINT_256.toString()]),
                                awaitConfirmation: true,
                            })];
                    case 1:
                        txHash = _b.sent();
                        return [2 /*return*/, txHash];
                }
            });
        });
    };
    /**
     * Gets the price for the order using the contract
     */
    OpenSeaPort.prototype.getCurrentPrice = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolInstance, currentPrice;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        protocolInstance = this.wyvernProtocol;
                        return [4 /*yield*/, protocolInstance.wyvernExchange.calculateCurrentPrice_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata)];
                    case 1:
                        currentPrice = _a.sent();
                        return [2 /*return*/, currentPrice];
                }
            });
        });
    };
    /**
     * Helper methods
     */
    OpenSeaPort.prototype._atomicMatch = function (_a) {
        var buy = _a.buy, sell = _a.sell, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var protocolInstance, value, orderLookupHash, buyValid, sellValid, currentPrice, estimatedPrice, ordersCanMatch, orderCalldataCanMatch, txHash, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        protocolInstance = this.wyvernProtocol;
                        if (!(sell.maker.toLowerCase() == accountAddress.toLowerCase() && sell.feeRecipient == lib_1.WyvernProtocol.NULL_ADDRESS)) return [3 /*break*/, 3];
                        // USER IS THE SELLER
                        return [4 /*yield*/, this._validateSellOrderParameters({ order: sell, accountAddress: accountAddress })];
                    case 1:
                        // USER IS THE SELLER
                        _b.sent();
                        return [4 /*yield*/, protocolInstance.wyvernExchange.validateOrder_.callAsync([buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken], [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt], buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, buy.calldata, buy.replacementPattern, buy.staticExtradata, buy.v, buy.r, buy.s, { from: accountAddress })];
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
                        return [4 /*yield*/, protocolInstance.wyvernExchange.validateOrder_.callAsync([sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken], [sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt], sell.feeMethod, sell.side, sell.saleKind, sell.howToCall, sell.calldata, sell.replacementPattern, sell.staticExtradata, sell.v, sell.r, sell.s, { from: accountAddress })];
                    case 5:
                        sellValid = _b.sent();
                        if (!sellValid) {
                            throw new Error('Invalid auction');
                        }
                        this.logger("Sell order validation: " + sellValid);
                        if (!(buy.paymentToken == lib_1.WyvernProtocol.NULL_ADDRESS)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.getCurrentPrice(sell)];
                    case 6:
                        currentPrice = _b.sent();
                        estimatedPrice = wyvern_1.estimateCurrentPrice(sell);
                        value = bignumber_js_1.BigNumber.max(currentPrice, estimatedPrice);
                        _b.label = 7;
                    case 7:
                        orderLookupHash = sell.hash;
                        return [3 /*break*/, 9];
                    case 8:
                        // User is neither - matching service
                        // TODO
                        orderLookupHash = buy.hash;
                        _b.label = 9;
                    case 9: return [4 /*yield*/, protocolInstance.wyvernExchange.ordersCanMatch_.callAsync([buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken], [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt], [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall], buy.calldata, sell.calldata, buy.replacementPattern, sell.replacementPattern, buy.staticExtradata, sell.staticExtradata, { from: accountAddress })];
                    case 10:
                        ordersCanMatch = _b.sent();
                        if (!ordersCanMatch) {
                            throw new Error('Unable to match offer with auction');
                        }
                        this.logger("Orders matching: " + ordersCanMatch);
                        return [4 /*yield*/, protocolInstance.wyvernExchange.orderCalldataCanMatch.callAsync(buy.calldata, buy.replacementPattern, sell.calldata, sell.replacementPattern)];
                    case 11:
                        orderCalldataCanMatch = _b.sent();
                        this.logger("Order calldata matching: " + orderCalldataCanMatch);
                        if (!orderCalldataCanMatch) {
                            throw new Error('Unable to match offer with auction, due to the type of offer requested');
                        }
                        _b.label = 12;
                    case 12:
                        _b.trys.push([12, 14, , 15]);
                        return [4 /*yield*/, protocolInstance.wyvernExchange.atomicMatch_.sendTransactionAsync([buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target,
                                buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken], [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt], [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall], buy.calldata, sell.calldata, buy.replacementPattern, sell.replacementPattern, buy.staticExtradata, sell.staticExtradata, [buy.v, sell.v], [buy.r, buy.s, sell.r, sell.s,
                                // Use the order hash so that OrdersMatched events can look it up
                                orderLookupHash], { from: accountAddress, value: value })];
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
    // Returns null if no proxy and throws if method not available
    OpenSeaPort.prototype._getProxy = function (accountAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolInstance, proxyAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        protocolInstance = this.wyvernProtocol;
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
    OpenSeaPort.prototype._initializeProxy = function (accountAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolInstance, transactionHash, proxyAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        protocolInstance = this.wyvernProtocol;
                        return [4 /*yield*/, protocolInstance.wyvernProxyRegistry.registerProxy.sendTransactionAsync({
                                from: accountAddress,
                            })];
                    case 1:
                        transactionHash = _a.sent();
                        this._dispatch(types_1.EventType.InitializeAccount, { accountAddress: accountAddress, transactionHash: transactionHash });
                        return [4 /*yield*/, wyvern_1.confirmTransaction(this.web3, transactionHash)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._getProxy(accountAddress)];
                    case 3:
                        proxyAddress = _a.sent();
                        if (!proxyAddress) {
                            throw new Error('Failed to initialize your account, please try again');
                        }
                        this._dispatch(types_1.EventType.InitializeAccountComplete, { accountAddress: accountAddress, proxyAddress: proxyAddress });
                        return [2 /*return*/, proxyAddress];
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
                        protocolInstance = this.wyvernProtocol;
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
                            if (tokenAddress == WyvernSchemas.tokens[this.networkName].canonicalWrappedEther.address) {
                                throw new Error('Insufficient balance. You may need to wrap Ether.');
                            }
                            else {
                                throw new Error('Insufficient balance.');
                            }
                        }
                        return [4 /*yield*/, this.getApprovedTokenCount({ accountAddress: accountAddress, tokenAddress: tokenAddress })];
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
                        protocolInstance = this.wyvernProtocol;
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
    OpenSeaPort.prototype._getTokenBalance = function (_a) {
        var accountAddress = _a.accountAddress, tokenAddress = _a.tokenAddress, _b = _a.tokenAbi, tokenAbi = _b === void 0 ? contracts_1.ERC20 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var amount;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!tokenAddress) {
                            tokenAddress = WyvernSchemas.tokens[this.networkName].canonicalWrappedEther.address;
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
    // Throws
    OpenSeaPort.prototype._validateAndPostOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolInstance, hash, valid, confirmedOrder;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        protocolInstance = this.wyvernProtocol;
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
    /**
     * Private methods
     */
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
            makerRelayerFee: wyvern_1.makeBigNumber(0),
            takerRelayerFee: wyvern_1.makeBigNumber(0),
            makerProtocolFee: wyvern_1.makeBigNumber(0),
            takerProtocolFee: wyvern_1.makeBigNumber(0),
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
        return __assign({}, matchingOrder, { hash: lib_1.WyvernProtocol.getOrderHashHex(matchingOrder) });
    };
    OpenSeaPort.prototype._getSchema = function (schemaName) {
        if (schemaName === void 0) { schemaName = SchemaName.ERC721; }
        var schema = WyvernSchemas.schemas[this.networkName].filter(function (s) { return s.name == schemaName; })[0];
        if (!schema) {
            throw new Error('No schema found for this asset; please check back later!');
        }
        return schema;
    };
    OpenSeaPort.prototype._dispatch = function (event, data) {
        this.emitter.emit(event, data);
    };
    return OpenSeaPort;
}());
exports.OpenSeaPort = OpenSeaPort;
//# sourceMappingURL=seaport.js.map