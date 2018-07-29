"use strict";
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
var OpenSea = /** @class */ (function () {
    function OpenSea(provider, apiConfig) {
        if (apiConfig === void 0) { apiConfig = {
            networkName: types_1.Network.Main,
            gasPrice: wyvern_1.makeBigNumber(100000),
        }; }
        // Web3 Config
        this.web3 = new Web3(provider);
        this.networkName = networkName;
        // WyvernJS config
        this.wyvernProtocol = new lib_1.WyvernProtocol(provider, {
            network: this.networkName,
            gasPrice: gasPrice,
        });
        // API config
        this.api = new api_1.OpenSeaAPI(apiConfig);
    }
    OpenSea.prototype.wrapEth = function (_a) {
        var amountInEth = _a.amountInEth, accountAddress = _a.accountAddress, _b = _a.awaitConfirmation, awaitConfirmation = _b === void 0 ? true : _b;
        return __awaiter(this, void 0, void 0, function () {
            var token, baseAmount;
            return __generator(this, function (_c) {
                token = WyvernSchemas.tokens[this.networkName].canonicalWrappedEther;
                baseAmount = lib_1.WyvernProtocol.toBaseUnitAmount(wyvern_1.makeBigNumber(amountInEth), token.decimals);
                return [2 /*return*/, wyvern_1.sendRawTransaction(this.web3, {
                        fromAddress: accountAddress,
                        toAddress: token.address,
                        value: baseAmount,
                        data: wyvern_1.encodeCall(contracts_1.getMethod(contracts_1.CanonicalWETH, 'deposit'), []),
                        awaitConfirmation: awaitConfirmation,
                    })];
            });
        });
    };
    OpenSea.prototype.unwrapWeth = function (_a) {
        var amountInEth = _a.amountInEth, accountAddress = _a.accountAddress, _b = _a.awaitConfirmation, awaitConfirmation = _b === void 0 ? true : _b;
        return __awaiter(this, void 0, void 0, function () {
            var token, baseAmount;
            return __generator(this, function (_c) {
                token = WyvernSchemas.tokens[this.networkName].canonicalWrappedEther;
                baseAmount = lib_1.WyvernProtocol.toBaseUnitAmount(wyvern_1.makeBigNumber(amountInEth), token.decimals);
                return [2 /*return*/, wyvern_1.sendRawTransaction(this.web3, {
                        fromAddress: accountAddress,
                        toAddress: token.address,
                        value: 0,
                        data: wyvern_1.encodeCall(contracts_1.getMethod(contracts_1.CanonicalWETH, 'withdraw'), [baseAmount.toString()]),
                        awaitConfirmation: awaitConfirmation,
                    })];
            });
        });
    };
    OpenSea.prototype.createBuyOrder = function (_a) {
        var tokenId = _a.tokenId, tokenAddress = _a.tokenAddress, accountAddress = _a.accountAddress, amountInEth = _a.amountInEth, _b = _a.expirationTime, expirationTime = _b === void 0 ? 0 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var token, schema, wyAsset, metadata, listingTime, _c, target, calldata, replacementPattern, order, orderJSON, signature, error_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        token = WyvernSchemas.tokens[this.networkName].canonicalWrappedEther;
                        schema = this._getSchema();
                        wyAsset = _getWyvernAsset(schema, { tokenId: tokenId, tokenAddress: tokenAddress });
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
                        orderJSON = wyvern_1.orderToJSON(order);
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this._signOrder({ order: orderJSON })];
                    case 3:
                        signature = _d.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _d.sent();
                        console.error(error_1);
                        throw new Error("You declined to sign your offer. Just a reminder: there's no gas needed anymore to create offers!");
                    case 5:
                        orderJSON.v = signature.v;
                        orderJSON.r = signature.r;
                        orderJSON.s = signature.s;
                        return [2 /*return*/, this._validateAndPostOrder(orderJSON)];
                }
            });
        });
    };
    OpenSea.prototype.createSellOrder = function (_a) {
        var tokenId = _a.tokenId, tokenAddress = _a.tokenAddress, accountAddress = _a.accountAddress, startAmountInEth = _a.startAmountInEth, endAmountInEth = _a.endAmountInEth, _b = _a.expirationTime, expirationTime = _b === void 0 ? 0 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var schema, wyAsset, metadata, listingTime, _c, target, calldata, replacementPattern, extraInEth, orderSaleKind, order, orderJSON, signature, error_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        schema = this._getSchema();
                        wyAsset = this._getWyvernAsset(schema, { tokenId: tokenId, tokenAddress: tokenAddress });
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
                        orderJSON = wyvern_1.orderToJSON(order);
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this._signOrder({ order: orderJSON })];
                    case 3:
                        signature = _d.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _d.sent();
                        console.error(error_2);
                        throw new Error("You declined to sign your auction. Just a reminder: there's no gas needed anymore to create auctions!");
                    case 5:
                        orderJSON.v = signature.v;
                        orderJSON.r = signature.r;
                        orderJSON.s = signature.s;
                        return [2 /*return*/, this._validateAndPostOrder(orderJSON)];
                }
            });
        });
    };
    OpenSea.prototype.fulfillOrder = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var orderToMatch, buy, sell, txHash;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._makeMatchingOrder({ order: order, accountAddress: accountAddress })];
                    case 1:
                        orderToMatch = _b.sent();
                        buy = order.side == types_1.OrderSide.Buy ? order : orderToMatch;
                        sell = order.side == types_1.OrderSide.Buy ? orderToMatch : order;
                        return [4 /*yield*/, this._atomicMatch({ buy: buy, sell: sell, accountAddress: accountAddress })];
                    case 2:
                        txHash = _b.sent();
                        return [2 /*return*/, txHash];
                }
            });
        });
    };
    OpenSea.prototype.cancelOrder = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var protocolInstance, txHash;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        protocolInstance = this.wyvernProtocol;
                        return [4 /*yield*/, protocolInstance.wyvernExchange.cancelOrder_.sendTransactionAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, order.v, order.r, order.s, { from: accountAddress })];
                    case 1:
                        txHash = _b.sent();
                        return [2 /*return*/, txHash];
                }
            });
        });
    };
    OpenSea.prototype.getApprovedTokenCount = function (_a) {
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
                                data: wyvern_1.encodeCall(contracts_1.getMethod(contracts_1.ERC20, 'allowance'), [accountAddress, contractAddress]),
                            }, c); })];
                    case 1:
                        approved = _b.sent();
                        return [2 /*return*/, wyvern_1.makeBigNumber(approved)];
                }
            });
        });
    };
    OpenSea.prototype.approveNonFungibleToken = function (_a) {
        var tokenId = _a.tokenId, tokenAddress = _a.tokenAddress, accountAddress = _a.accountAddress, proxyAddress = _a.proxyAddress, _b = _a.tokenAbi, tokenAbi = _b === void 0 ? contracts_1.ERC721 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var tokenContract, erc721, isApprovedCheckData, isApprovedForAllCallHash, isApprovedForAll, txHash, error_3, approvedAddr, txHash, error_4;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        tokenContract = this.web3.eth.contract(tokenAbi);
                        return [4 /*yield*/, tokenContract.at(tokenAddress)];
                    case 1:
                        erc721 = _c.sent();
                        if (!proxyAddress) {
                            proxyAddress = this._getProxy(accountAddress);
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
                    case 2:
                        isApprovedForAllCallHash = _c.sent();
                        isApprovedForAll = parseInt(isApprovedForAllCallHash);
                        if (isApprovedForAll == 1) {
                            // Supports ApproveAll
                            // Result was NULL_BLOCK_HASH + 1
                            // onCheck(true, 'Already approved proxy for all tokens')
                            return [2 /*return*/];
                        }
                        if (!(isApprovedForAll == 0)) return [3 /*break*/, 6];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, wyvern_1.sendRawTransaction(this.web3, {
                                fromAddress: accountAddress,
                                toAddress: erc721.address,
                                data: erc721.setApprovalForAll.getData(proxyAddress, true),
                                confirmTransaction: true,
                            })];
                    case 4:
                        txHash = _c.sent();
                        return [2 /*return*/];
                    case 5:
                        error_3 = _c.sent();
                        console.error(error_3);
                        throw new Error('Failed to approve access to these tokens. OpenSea has been alerted, but you can also chat with us on Discord.');
                    case 6: return [4 /*yield*/, wyvern_1.promisify(function (c) { return erc721.getApproved.call(tokenId, c); })];
                    case 7:
                        approvedAddr = _c.sent();
                        if (approvedAddr == proxyAddress) {
                            // onCheck(true, 'Already approved proxy for this token')
                            return [2 /*return*/];
                        }
                        if (!(approvedAddr == '0x')) return [3 /*break*/, 9];
                        return [4 /*yield*/, wyvern_1.promisify(function (c) { return erc721.kittyIndexToApproved.call(tokenId, c); })];
                    case 8:
                        // CRYPTOKITTIES check
                        approvedAddr = _c.sent();
                        if (approvedAddr == proxyAddress) {
                            // onCheck(true, 'Already approved proxy for this kitty')
                            return [2 /*return*/];
                        }
                        _c.label = 9;
                    case 9:
                        if (!(approvedAddr == '0x')) return [3 /*break*/, 11];
                        return [4 /*yield*/, wyvern_1.promisify(function (c) { return erc721.allowed.call(accountAddress, tokenId, c); })];
                    case 10:
                        // ETHEREMON check
                        approvedAddr = _c.sent();
                        if (approvedAddr == proxyAddress) {
                            // onCheck(true, 'Already allowed proxy for this token')
                            return [2 /*return*/];
                        }
                        _c.label = 11;
                    case 11:
                        _c.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, wyvern_1.sendRawTransaction(this.web3, {
                                fromAddress: accountAddress,
                                toAddress: erc721.address,
                                data: erc721.approve.getData(proxyAddress, tokenId),
                                confirmTransaction: true,
                            })];
                    case 12:
                        txHash = _c.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        error_4 = _c.sent();
                        console.error(error_4);
                        throw new Error('Failed to approve access to this token. OpenSea has been alerted, but you can also chat with us on Discord.');
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    // Returns transaction hash
    OpenSea.prototype.approveFungibleToken = function (_a) {
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
                                data: wyvern_1.encodeCall(contracts_1.getMethod(contracts_1.ERC20, 'approve'), [contractAddress, lib_1.WyvernProtocol.MAX_UINT_256.toString()]),
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
     * @param {object} order Wyvern order object
     */
    OpenSea.prototype.getCurrentPrice = function (order) {
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
    OpenSea.prototype._atomicMatch = function (_a) {
        var buy = _a.buy, sell = _a.sell, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var _b, protocolInstance, value, orderLookupHash, buyValid, sellValid, currentPrice, estimatedPrice, ordersCanMatch, orderCalldataCanMatch, args, txHash, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        protocolInstance = this.wyvernProtocol;
                        /* This is a bug, short-circuit not working properly. */
                        if (!buy.r || !buy.s) {
                            buy.v = sell.v;
                            buy.r = sell.r;
                            buy.s = sell.s;
                        }
                        else {
                            sell.v = buy.v;
                            sell.r = buy.r;
                            sell.s = buy.s;
                        }
                        if (!(sell.maker.toLowerCase() == accountAddress.toLowerCase() && sell.feeRecipient == lib_1.WyvernProtocol.NULL_ADDRESS)) return [3 /*break*/, 3];
                        // USER IS THE SELLER
                        return [4 /*yield*/, this._validateSellOrderParameters({ order: sell, accountAddress: accountAddress })];
                    case 1:
                        // USER IS THE SELLER
                        _c.sent();
                        return [4 /*yield*/, protocolInstance.wyvernExchange.validateOrder_.callAsync([buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken], [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt], buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, buy.calldata, buy.replacementPattern, buy.staticExtradata, buy.v, buy.r, buy.s, { from: accountAddress })];
                    case 2:
                        buyValid = _c.sent();
                        if (!buyValid) {
                            throw new Error('Invalid offer');
                        }
                        // onCheck(buyValid, 'Buy order is valid')
                        orderLookupHash = buy.hash;
                        _c.label = 3;
                    case 3:
                        if (!(buy.maker.toLowerCase() == accountAddress.toLowerCase())) return [3 /*break*/, 9];
                        // USER IS THE BUYER
                        return [4 /*yield*/, this._validateBuyOrderParameters({ order: buy, accountAddress: accountAddress })];
                    case 4:
                        // USER IS THE BUYER
                        _c.sent();
                        return [4 /*yield*/, protocolInstance.wyvernExchange.validateOrder_.callAsync([sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken], [sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt], sell.feeMethod, sell.side, sell.saleKind, sell.howToCall, sell.calldata, sell.replacementPattern, sell.staticExtradata, sell.v, sell.r, sell.s, { from: accountAddress })];
                    case 5:
                        sellValid = _c.sent();
                        if (!sellValid) {
                            throw new Error('Invalid auction');
                        }
                        if (!(buy.paymentToken == lib_1.WyvernProtocol.NULL_ADDRESS)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.getCurrentPrice(sell)];
                    case 6:
                        currentPrice = _c.sent();
                        return [4 /*yield*/, wyvern_1.computeCurrentPrice(sell)];
                    case 7:
                        estimatedPrice = _c.sent();
                        value = bignumber_js_1.default.max(currentPrice, estimatedPrice);
                        _c.label = 8;
                    case 8:
                        orderLookupHash = sell.hash;
                        _c.label = 9;
                    case 9: return [4 /*yield*/, protocolInstance.wyvernExchange.ordersCanMatch_.callAsync([buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken, sell.exchange, sell.maker, sell.taker, sell.feeRecipient, sell.target, sell.staticTarget, sell.paymentToken], [buy.makerRelayerFee, buy.takerRelayerFee, buy.makerProtocolFee, buy.takerProtocolFee, buy.basePrice, buy.extra, buy.listingTime, buy.expirationTime, buy.salt, sell.makerRelayerFee, sell.takerRelayerFee, sell.makerProtocolFee, sell.takerProtocolFee, sell.basePrice, sell.extra, sell.listingTime, sell.expirationTime, sell.salt], [buy.feeMethod, buy.side, buy.saleKind, buy.howToCall, sell.feeMethod, sell.side, sell.saleKind, sell.howToCall], buy.calldata, sell.calldata, buy.replacementPattern, sell.replacementPattern, buy.staticExtradata, sell.staticExtradata, { from: accountAddress })];
                    case 10:
                        ordersCanMatch = _c.sent();
                        if (!ordersCanMatch) {
                            throw new Error('Unable to match offer with auction');
                        }
                        return [4 /*yield*/, protocolInstance.wyvernExchange.orderCalldataCanMatch.callAsync(buy.calldata, buy.replacementPattern, sell.calldata, sell.replacementPattern)
                            // onCheck(orderCalldataCanMatch, `Order calldata matching`)
                        ];
                    case 11:
                        orderCalldataCanMatch = _c.sent();
                        // onCheck(orderCalldataCanMatch, `Order calldata matching`)
                        if (!orderCalldataCanMatch) {
                            throw new Error('Unable to match offer with auction, due to the type of offer requested');
                        }
                        args = [[buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target,
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
                                orderLookupHash],
                            { from: accountAddress, value: value }];
                        _c.label = 12;
                    case 12:
                        _c.trys.push([12, 14, , 15]);
                        return [4 /*yield*/, (_b = protocolInstance.wyvernExchange.atomicMatch_).sendTransactionAsync.apply(_b, args)];
                    case 13:
                        txHash = _c.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        error_5 = _c.sent();
                        console.error(error_5);
                        throw new Error("Failed to authorize transaction: \"" + (error_5.message
                            ? error_5.message
                            : 'user denied') + "...\"");
                    case 15: return [2 /*return*/, txHash];
                }
            });
        });
    };
    OpenSea.prototype._makeMatchingOrder = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var schema, listingTime, _b, target, calldata, replacementPattern;
            return __generator(this, function (_c) {
                schema = this._getSchema();
                listingTime = Math.round(Date.now() / 1000 - 1000);
                _b = order.side == types_1.OrderSide.Buy
                    ? WyvernSchemas.encodeSell(schema, order.metadata.asset, accountAddress)
                    : WyvernSchemas.encodeBuy(schema, order.metadata.asset, accountAddress), target = _b.target, calldata = _b.calldata, replacementPattern = _b.replacementPattern;
                return [2 /*return*/, {
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
                        extra: 0,
                        listingTime: wyvern_1.makeBigNumber(listingTime),
                        expirationTime: wyvern_1.makeBigNumber(0),
                        salt: lib_1.WyvernProtocol.generatePseudoRandomSalt(),
                        metadata: order.metadata,
                    }];
            });
        });
    };
    // Returns null if no proxy and throws if method not available
    OpenSea.prototype._getProxy = function (accountAddress) {
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
    OpenSea.prototype._initializeProxy = function (accountAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolInstance, txHash, proxyAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        protocolInstance = this.wyvernProtocol;
                        return [4 /*yield*/, protocolInstance.wyvernProxyRegistry.registerProxy.sendTransactionAsync({
                                from: accountAddress,
                            })
                            // TODO dispatch(ExchangeActions._setTransactionHash(txHash))
                        ];
                    case 1:
                        txHash = _a.sent();
                        // TODO dispatch(ExchangeActions._setTransactionHash(txHash))
                        return [4 /*yield*/, wyvern_1.confirmTransaction(txHash)];
                    case 2:
                        // TODO dispatch(ExchangeActions._setTransactionHash(txHash))
                        _a.sent();
                        return [4 /*yield*/, this._getProxy(accountAddress)];
                    case 3:
                        proxyAddress = _a.sent();
                        if (!proxyAddress) {
                            throw new Error('Failed to initialize your account, please try again');
                        }
                        return [2 /*return*/, proxyAddress];
                }
            });
        });
    };
    // Throws
    OpenSea.prototype._validateSellOrderParameters = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var _b, schema, wyAsset, proxyAddress, where, protocolInstance, sellValidArgs, sellValid;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        schema = this._getSchema();
                        wyAsset = order.metadata.asset;
                        return [4 /*yield*/, this._getProxy(accountAddress)];
                    case 1:
                        proxyAddress = _c.sent();
                        return [4 /*yield*/, wyvern_1.findAsset(this.web3, { account: accountAddress, proxy: proxyAddress, wyAsset: wyAsset, schema: schema })];
                    case 2:
                        where = _c.sent();
                        if (where == 'other') {
                            throw new Error('You do not own this asset.');
                        }
                        if (!!proxyAddress) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._initializeProxy(accountAddress)
                            // dispatch({ type: ActionTypes.RESET_EXCHANGE })
                        ];
                    case 3:
                        // TODO dispatch({ type: ActionTypes.INITIALIZE_PROXY })
                        proxyAddress = _c.sent();
                        _c.label = 4;
                    case 4: return [4 /*yield*/, this.approveNonFungibleToken({
                            tokenId: wyAsset.id,
                            tokenAddress: wyAsset.address,
                            accountAddress: accountAddress,
                            proxyAddress: proxyAddress,
                        })
                        // Check sell parameters
                    ];
                    case 5:
                        _c.sent();
                        protocolInstance = this.wyvernProtocol;
                        sellValidArgs = [
                            [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
                            [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
                            order.feeMethod,
                            order.side,
                            order.saleKind,
                            order.howToCall,
                            order.calldata,
                            order.replacementPattern,
                            order.staticExtradata,
                            { from: accountAddress }
                        ];
                        return [4 /*yield*/, (_b = protocolInstance.wyvernExchange.validateOrderParameters_).callAsync.apply(_b, sellValidArgs)];
                    case 6:
                        sellValid = _c.sent();
                        if (!sellValid) {
                            throw new Error("Failed to validate sell order parameters: " + JSON.stringify(sellValidArgs));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // Throws
    OpenSea.prototype._validateBuyOrderParameters = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var _b, tokenAddress, balance, required, approved, error_6, protocolInstance, buyValidArgs, buyValid;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        tokenAddress = order.paymentToken;
                        if (!(tokenAddress != lib_1.WyvernProtocol.NULL_ADDRESS)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this._getTokenBalance({ accountAddress: accountAddress, tokenAddress: tokenAddress })];
                    case 1:
                        balance = _c.sent();
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
                        approved = _c.sent();
                        if (!(approved.toNumber() < required.toNumber())) return [3 /*break*/, 6];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.approveFungibleToken({ accountAddress: accountAddress, tokenAddress: tokenAddress })];
                    case 4:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_6 = _c.sent();
                        console.error(error_6);
                        throw new Error('You declined to approve your W-ETH.');
                    case 6:
                        protocolInstance = this.wyvernProtocol;
                        buyValidArgs = [[order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
                            [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
                            order.feeMethod,
                            order.side,
                            order.saleKind,
                            order.howToCall,
                            order.calldata,
                            order.replacementPattern,
                            order.staticExtradata,
                            { from: accountAddress }];
                        return [4 /*yield*/, (_b = protocolInstance.wyvernExchange.validateOrderParameters_).callAsync.apply(_b, buyValidArgs)];
                    case 7:
                        buyValid = _c.sent();
                        if (!buyValid) {
                            throw new Error("Failed to validate buy order parameters: " + JSON.stringify(buyValidArgs));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    OpenSea.prototype._getTokenBalance = function (_a) {
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
                                data: wyvern_1.encodeCall(contracts_1.getMethod(tokenAbi, 'balanceOf'), [accountAddress]),
                            }, c); })];
                    case 1:
                        amount = _c.sent();
                        return [2 /*return*/, wyvern_1.makeBigNumber(amount)];
                }
            });
        });
    };
    // Throws
    OpenSea.prototype._validateAndPostOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var protocolInstance, hash, valid;
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
                        return [4 /*yield*/, protocolInstance.wyvernExchange.validateOrder_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken], [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt], order.feeMethod, order.side, order.saleKind, order.howToCall, order.calldata, order.replacementPattern, order.staticExtradata, parseInt(order.v), order.r || '0x', order.s || '0x')];
                    case 2:
                        valid = _a.sent();
                        if (!valid) {
                            console.error(order);
                            throw new Error('Invalid order');
                        }
                        // onCheck(true, 'Order is valid')
                        return [4 /*yield*/, this.api.postOrder(order)];
                    case 3:
                        // onCheck(true, 'Order is valid')
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OpenSea.prototype._signOrder = function (_a) {
        var order = _a.order;
        return __awaiter(this, void 0, void 0, function () {
            var message, signerAddress;
            return __generator(this, function (_b) {
                message = order.hash || lib_1.WyvernProtocol.getOrderHashHex(order);
                signerAddress = order.maker;
                return [2 /*return*/, wyvern_1.personalSignAsync(this.web3, { message: message, signerAddress: signerAddress })];
            });
        });
    };
    OpenSea.prototype._getSchema = function (schemaName) {
        if (schemaName === void 0) { schemaName = 'ERC721'; }
        var schema = WyvernSchemas.schemas[this.networkName].filter(function (s) { return s.name == schemaName; })[0];
        if (!schema) {
            throw new Error('No schema found for this asset; please check back later!');
        }
        return schema;
    };
    return OpenSea;
}());
exports.OpenSea = OpenSea;
function _getWyvernAsset(schema, _a) {
    var tokenId = _a.tokenId, tokenAddress = _a.tokenAddress;
    return schema.assetFromFields({
        'ID': tokenId.toString(),
        'Address': tokenAddress,
    });
}
//# sourceMappingURL=index.js.map