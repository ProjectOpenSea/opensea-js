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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_js_1 = require("bignumber.js");
var ethUtil = require("ethereumjs-util");
var _ = require("lodash");
var lib_1 = require("wyvern-js/lib");
var types_1 = require("./types");
exports.NULL_BLOCK_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
exports.feeRecipient = '0x5b3256965e7c3cf26e11fcaf296dfc8807c01073';
// OTHER
var txCallbacks = {};
/**
 * Promisify a callback-syntax web3 function
 * @param inner callback function that accepts a Web3 callback function and passes
 * it to the Web3 function
 */
function promisify(inner) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    return inner(function (err, res) {
                        if (err) {
                            reject(err);
                        }
                        resolve(res);
                    });
                })];
        });
    });
}
exports.promisify = promisify;
var track = function (web3, txHash, onFinalized) {
    if (txCallbacks[txHash]) {
        txCallbacks[txHash].push(onFinalized);
    }
    else {
        txCallbacks[txHash] = [onFinalized];
        var poll_1 = function () { return __awaiter(_this, void 0, void 0, function () {
            var tx, receipt, status_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, promisify(function (c) { return web3.eth.getTransaction(txHash, c); })];
                    case 1:
                        tx = _a.sent();
                        if (!(tx && tx.blockHash && tx.blockHash !== exports.NULL_BLOCK_HASH)) return [3 /*break*/, 3];
                        return [4 /*yield*/, promisify(function (c) { return web3.eth.getTransactionReceipt(txHash, c); })];
                    case 2:
                        receipt = _a.sent();
                        if (!receipt) {
                            // Hack: assume success if no receipt
                            console.warn('No receipt found for ', txHash);
                        }
                        status_1 = receipt
                            ? parseInt((receipt.status || "0").toString()) == 1
                            : true;
                        txCallbacks[txHash].map(function (f) { return f(status_1); });
                        delete txCallbacks[txHash];
                        return [3 /*break*/, 4];
                    case 3:
                        setTimeout(poll_1, 1000);
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        poll_1().catch();
    }
};
exports.confirmTransaction = function (web3, txHash) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                track(web3, txHash, function (didSucceed) {
                    if (didSucceed) {
                        resolve('Transaction complete');
                    }
                    else {
                        reject('Transaction failed');
                    }
                });
            })];
    });
}); };
exports.orderFromJSON = function (order) {
    var hash = lib_1.WyvernProtocol.getOrderHashHex(order);
    if (hash !== order.hash) {
        console.error('Invalid order hash');
    }
    var fromJSON = {
        hash: order.hash,
        cancelledOrFinalized: order.cancelledOrFinalized,
        markedInvalid: order.markedInvalid,
        metadata: order.metadata,
        exchange: order.exchange,
        maker: order.maker,
        taker: order.taker,
        makerRelayerFee: new bignumber_js_1.default(order.makerRelayerFee),
        takerRelayerFee: new bignumber_js_1.default(order.takerRelayerFee),
        makerProtocolFee: new bignumber_js_1.default(order.makerProtocolFee),
        takerProtocolFee: new bignumber_js_1.default(order.takerProtocolFee),
        feeMethod: order.feeMethod,
        feeRecipient: order.feeRecipient,
        side: order.side,
        saleKind: order.saleKind,
        target: order.target,
        howToCall: order.howToCall,
        calldata: order.calldata,
        replacementPattern: order.replacementPattern,
        staticTarget: order.staticTarget,
        staticExtradata: order.staticExtradata,
        paymentToken: order.paymentToken,
        basePrice: new bignumber_js_1.default(order.basePrice),
        extra: new bignumber_js_1.default(order.extra),
        listingTime: new bignumber_js_1.default(order.listingTime),
        expirationTime: new bignumber_js_1.default(order.expirationTime),
        salt: new bignumber_js_1.default(order.salt),
        v: parseInt(order.v),
        r: order.r,
        s: order.s,
    };
    fromJSON.currentPrice = estimateCurrentPrice(order);
    return fromJSON;
};
exports.orderToJSON = function (order) {
    var asJSON = __assign({}, order, { exchange: order.exchange.toLowerCase(), maker: order.maker.toLowerCase(), taker: order.taker.toLowerCase(), makerRelayerFee: order.makerRelayerFee.toString(), takerRelayerFee: order.takerRelayerFee.toString(), makerProtocolFee: order.makerProtocolFee.toString(), takerProtocolFee: order.takerProtocolFee.toString(), feeMethod: order.feeMethod.toString(), feeRecipient: order.feeRecipient.toLowerCase(), side: order.side.toString(), saleKind: order.saleKind.toString(), target: order.target.toLowerCase(), howToCall: order.howToCall.toString(), staticTarget: order.staticTarget.toLowerCase(), paymentToken: order.paymentToken.toLowerCase(), basePrice: order.basePrice.toString(), extra: order.extra.toString(), listingTime: order.listingTime.toString(), expirationTime: order.expirationTime.toString(), salt: order.salt.toString() });
    return asJSON;
};
exports.findAsset = function (web3, _a) {
    var account = _a.account, proxy = _a.proxy, wyAsset = _a.wyAsset, schema = _a.schema;
    return __awaiter(_this, void 0, void 0, function () {
        var owner, ownerOf, abi_1, contract_1, proxyCount, myCount, countOf, abi_2, contract_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    ownerOf = schema.functions.ownerOf;
                    if (!ownerOf) return [3 /*break*/, 2];
                    abi_1 = ownerOf(wyAsset);
                    contract_1 = web3.eth.contract([abi_1]).at(abi_1.target);
                    if (!(abi_1.inputs.filter(function (x) { return x.value === undefined; }).length === 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, promisify(function (c) {
                            var _a;
                            return (_a = contract_1[abi_1.name]).call.apply(_a, abi_1.inputs.map(function (i) { return i.value.toString(); }).concat([c]));
                        })];
                case 1:
                    owner = _b.sent();
                    owner = owner.toLowerCase();
                    _b.label = 2;
                case 2:
                    countOf = schema.functions.countOf;
                    if (!countOf) return [3 /*break*/, 7];
                    abi_2 = countOf(wyAsset);
                    contract_2 = web3.eth.contract([abi_2]).at(abi_2.target);
                    if (!proxy) return [3 /*break*/, 4];
                    return [4 /*yield*/, promisify(function (c) { return contract_2[abi_2.name].call([proxy], c); })];
                case 3:
                    proxyCount = _b.sent();
                    proxyCount = proxyCount.toNumber();
                    return [3 /*break*/, 5];
                case 4:
                    proxyCount = 0;
                    _b.label = 5;
                case 5: return [4 /*yield*/, promisify(function (c) { return contract_2[abi_2.name].call([account], c); })];
                case 6:
                    myCount = _b.sent();
                    myCount = myCount.toNumber();
                    _b.label = 7;
                case 7:
                    if (owner !== undefined) {
                        if (proxy && owner.toLowerCase() === proxy.toLowerCase()) {
                            return [2 /*return*/, 'proxy'];
                        }
                        else if (owner.toLowerCase() === account.toLowerCase()) {
                            return [2 /*return*/, 'account'];
                        }
                        else if (owner === '0x') {
                            return [2 /*return*/, 'unknown'];
                        }
                        else {
                            return [2 /*return*/, 'other'];
                        }
                    }
                    else if (myCount !== undefined && proxyCount !== undefined) {
                        if (proxyCount >= 1000000000000000000) {
                            return [2 /*return*/, 'proxy'];
                        }
                        else if (myCount >= 1000000000000000000) {
                            return [2 /*return*/, 'account'];
                        }
                        else {
                            return [2 /*return*/, 'other'];
                        }
                    }
                    return [2 /*return*/, 'unknown'];
            }
        });
    });
};
/**
 * Sign messages using web3 personal signatures
 * @param web3 Web3 instance
 * @param message message to sign
 * @param signerAddress web3 address signing the message
 */
function personalSignAsync(web3, message, signerAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var signature;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, promisify(function (c) { return web3.currentProvider.sendAsync({
                        method: 'personal_sign',
                        params: [message, signerAddress],
                        from: signerAddress,
                    }, c); })];
                case 1:
                    signature = _a.sent();
                    return [2 /*return*/, parseSignatureHex(signature.result)];
            }
        });
    });
}
exports.personalSignAsync = personalSignAsync;
/**
 * Special fixes for making BigNumbers using web3 results
 * @param arg An arg or the result of a web3 call to turn into a BigNumber
 */
function makeBigNumber(arg) {
    // Zero sometimes returned as 0x from contracts
    if (arg === '0x') {
        arg = 0;
    }
    // fix "new BigNumber() number type has more than 15 significant digits"
    arg = arg.toString();
    return new bignumber_js_1.default(arg);
}
exports.makeBigNumber = makeBigNumber;
/**
 * Send a transaction to the blockchain and optionally confirm it
 * @param web3 Web3 instance
 * @param fromAddress address sending transaction
 * @param toAddress destination contract address
 * @param data data to send to contract
 * @param value value in ETH to send with data
 * @param awaitConfirmation whether we should wait for blockchain to confirm
 */
function sendRawTransaction(web3, _a) {
    var fromAddress = _a.fromAddress, toAddress = _a.toAddress, data = _a.data, _b = _a.value, value = _b === void 0 ? 0 : _b, _c = _a.awaitConfirmation, awaitConfirmation = _c === void 0 ? true : _c;
    return __awaiter(this, void 0, void 0, function () {
        var txHash;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, promisify(function (c) { return web3.eth.sendTransaction({
                        from: fromAddress,
                        to: toAddress,
                        value: value,
                        data: data,
                    }, c); })];
                case 1:
                    txHash = _d.sent();
                    if (!awaitConfirmation) return [3 /*break*/, 3];
                    return [4 /*yield*/, exports.confirmTransaction(web3, txHash.toString())];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3: return [2 /*return*/, txHash];
            }
        });
    });
}
exports.sendRawTransaction = sendRawTransaction;
// sourced from 0x.js:
// https://github.com/ProjectWyvern/wyvern-js/blob/39999cb93ce5d80ea90b4382182d1bd4339a9c6c/src/utils/signature_utils.ts
function parseSignatureHex(signature) {
    // HACK: There is no consensus on whether the signatureHex string should be formatted as
    // v + r + s OR r + s + v, and different clients (even different versions of the same client)
    // return the signature params in different orders. In order to support all client implementations,
    // we parse the signature in both ways, and evaluate if either one is a valid signature.
    var validVParamValues = [27, 28];
    var ecSignatureRSV = _parseSignatureHexAsRSV(signature);
    if (_.includes(validVParamValues, ecSignatureRSV.v)) {
        return ecSignatureRSV;
    }
    // For older clients
    var ecSignatureVRS = _parseSignatureHexAsVRS(signature);
    if (_.includes(validVParamValues, ecSignatureVRS.v)) {
        return ecSignatureVRS;
    }
    throw new Error('Invalid signature');
    function _parseSignatureHexAsVRS(signatureHex) {
        var signatureBuffer = ethUtil.toBuffer(signatureHex);
        var v = signatureBuffer[0];
        if (v < 27) {
            v += 27;
        }
        var r = signatureBuffer.slice(1, 33);
        var s = signatureBuffer.slice(33, 65);
        var ecSignature = {
            v: v,
            r: ethUtil.bufferToHex(r),
            s: ethUtil.bufferToHex(s),
        };
        return ecSignature;
    }
    function _parseSignatureHexAsRSV(signatureHex) {
        var _a = ethUtil.fromRpcSig(signatureHex), v = _a.v, r = _a.r, s = _a.s;
        var ecSignature = {
            v: v,
            r: ethUtil.bufferToHex(r),
            s: ethUtil.bufferToHex(s),
        };
        return ecSignature;
    }
}
/**
 * Estimates the price 30 seconds ago
 */
function estimateCurrentPrice(order, shouldRoundUp) {
    if (shouldRoundUp === void 0) { shouldRoundUp = true; }
    var basePrice = order.basePrice, listingTime = order.listingTime, expirationTime = order.expirationTime, extra = order.extra;
    var side = order.side;
    var now = new bignumber_js_1.default(Date.now() / 1000).minus(30);
    basePrice = new bignumber_js_1.default(basePrice);
    listingTime = new bignumber_js_1.default(listingTime);
    expirationTime = new bignumber_js_1.default(expirationTime);
    extra = new bignumber_js_1.default(extra);
    var exactPrice = basePrice;
    if (order.saleKind == types_1.SaleKind.FixedPrice) {
        // Do nothing, price is correct
    }
    else if (order.saleKind == types_1.SaleKind.DutchAuction) {
        var diff = extra.times(now.minus(listingTime))
            .dividedBy(expirationTime.minus(listingTime));
        exactPrice = side == types_1.OrderSide.Sell
            /* Sell-side - start price: basePrice. End price: basePrice - extra. */
            ? basePrice.minus(diff)
            /* Buy-side - start price: basePrice. End price: basePrice + extra. */
            : basePrice.plus(diff);
    }
    return shouldRoundUp ? exactPrice.ceil() : exactPrice;
}
exports.estimateCurrentPrice = estimateCurrentPrice;
//# sourceMappingURL=wyvern.js.map