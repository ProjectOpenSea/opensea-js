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
var _a;
var _this = this;
var bignumber_js_1 = require("bignumber.js");
var wyvern_js_1 = require("wyvern-js");
var ethUtil = require("ethereumjs-util");
var _ = require("lodash");
var Web3 = require("web3");
var WyvernSchemas = require("wyvern-schemas");
var types_1 = require("wyvern-schemas/dist/types");
var contracts_1 = require("./contracts");
var types_2 = require("./types");
exports.NULL_ADDRESS = wyvern_js_1.WyvernProtocol.NULL_ADDRESS;
exports.NULL_BLOCK_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
exports.OPENSEA_FEE_RECIPIENT = '0x5b3256965e7c3cf26e11fcaf296dfc8807c01073';
exports.DEP_INFURA_KEY = 'e8695bce67944848aa95459fac052f8e';
exports.MAINNET_PROVIDER_URL = 'https://eth-mainnet.alchemyapi.io/jsonrpc/y5dLONzfAJh-oCY02DCP3UWCT2pSEXMo';
exports.RINKEBY_PROVIDER_URL = 'https://eth-rinkeby.alchemyapi.io/jsonrpc/-yDg7wmgGw5LdsP4p4kyxRYuDzCkXtoI';
exports.INVERSE_BASIS_POINT = 10000;
exports.MAX_UINT_256 = wyvern_js_1.WyvernProtocol.MAX_UINT_256;
exports.WYVERN_EXCHANGE_ADDRESS_MAINNET = "0x7be8076f4ea4a4ad08075c2508e481d6c946d12b";
exports.WYVERN_EXCHANGE_ADDRESS_RINKEBY = "0x5206e78b21ce315ce284fb24cf05e0585a93b1d9";
exports.ENJIN_COIN_ADDRESS = '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c';
exports.ENJIN_ADDRESS = '0xfaaFDc07907ff5120a76b34b731b278c38d6043C';
exports.ENJIN_LEGACY_ADDRESS = '0x8562c38485B1E8cCd82E44F89823dA76C98eb0Ab';
exports.CK_ADDRESS = '0x06012c8cf97bead5deae237070f9587f8e7a266d';
exports.CK_RINKEBY_ADDRESS = '0x16baf0de678e52367adc69fd067e5edd1d33e3bf';
exports.DEFAULT_BUYER_FEE_BASIS_POINTS = 0;
exports.DEFAULT_SELLER_FEE_BASIS_POINTS = 250;
exports.OPENSEA_SELLER_BOUNTY_BASIS_POINTS = 100;
exports.DEFAULT_MAX_BOUNTY = exports.DEFAULT_SELLER_FEE_BASIS_POINTS;
exports.MAX_ERROR_LENGTH = 120;
exports.MIN_EXPIRATION_SECONDS = 10;
exports.ORDER_MATCHING_LATENCY_SECONDS = 60 * 60 * 24 * 7;
exports.SELL_ORDER_BATCH_SIZE = 3;
exports.DEFAULT_GAS_INCREASE_FACTOR = 1.1;
var proxyABI = { 'constant': false, 'inputs': [{ 'name': 'dest', 'type': 'address' }, { 'name': 'howToCall', 'type': 'uint8' }, { 'name': 'calldata', 'type': 'bytes' }], 'name': 'proxy', 'outputs': [{ 'name': 'success', 'type': 'bool' }], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' };
var proxyAssertABI = { 'constant': false, 'inputs': [{ 'name': 'dest', 'type': 'address' }, { 'name': 'howToCall', 'type': 'uint8' }, { 'name': 'calldata', 'type': 'bytes' }], 'name': 'proxyAssert', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' };
exports.annotateERC721TransferABI = function (asset) { return ({
    "constant": false,
    "inputs": [
        {
            "name": "_to",
            "type": "address",
            "kind": types_1.FunctionInputKind.Replaceable
        },
        {
            "name": "_tokenId",
            "type": "uint256",
            "kind": types_1.FunctionInputKind.Asset,
            "value": asset.id
        }
    ],
    "target": asset.address,
    "name": "transfer",
    "outputs": [],
    "payable": false,
    "stateMutability": types_1.StateMutability.Nonpayable,
    "type": Web3.AbiType.Function
}); };
var SCHEMA_NAME_TO_ASSET_CONTRACT_TYPE = (_a = {},
    _a[types_2.WyvernSchemaName.ERC721] = types_2.AssetContractType.NonFungible,
    _a[types_2.WyvernSchemaName.ERC1155] = types_2.AssetContractType.SemiFungible,
    _a[types_2.WyvernSchemaName.ERC20] = types_2.AssetContractType.Fungible,
    _a[types_2.WyvernSchemaName.LegacyEnjin] = types_2.AssetContractType.SemiFungible,
    _a[types_2.WyvernSchemaName.ENSShortNameAuction] = types_2.AssetContractType.NonFungible,
    _a);
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
/**
 * Promisify a call a method on a contract,
 * handling Parity errors. Returns '0x' if error.
 * Note that if T is not "string", this may return a falsey
 * value when the contract doesn't support the method (e.g. `isApprovedForAll`).
 * @param callback An anonymous function that takes a web3 callback
 * and returns a Web3 Contract's call result, e.g. `c => erc721.ownerOf(3, c)`
 * @param onError callback when user denies transaction
 */
function promisifyCall(callback, onError) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisify(callback)];
                case 1:
                    result = _a.sent();
                    if (result == '0x') {
                        // Geth compatibility
                        return [2 /*return*/, undefined];
                    }
                    return [2 /*return*/, result];
                case 2:
                    error_1 = _a.sent();
                    // Probably method not found, and web3 is a Parity node
                    if (onError) {
                        onError(error_1);
                    }
                    else {
                        console.error(error_1);
                    }
                    return [2 /*return*/, undefined];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.promisifyCall = promisifyCall;
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
                        resolve("Transaction complete!");
                    }
                    else {
                        reject(new Error("Transaction failed :( You might have already completed this action. See more on the mainnet at etherscan.io/txn/" + txHash));
                    }
                });
            })];
    });
}); };
exports.assetFromJSON = function (asset) {
    var isAnimated = asset.image_url && asset.image_url.endsWith('.gif');
    var isSvg = asset.image_url && asset.image_url.endsWith('.svg');
    var fromJSON = {
        tokenId: asset.token_id.toString(),
        tokenAddress: asset.asset_contract.address,
        name: asset.name,
        description: asset.description,
        owner: asset.owner,
        assetContract: exports.assetContractFromJSON(asset.asset_contract),
        orders: asset.orders ? asset.orders.map(exports.orderFromJSON) : null,
        sellOrders: asset.sell_orders ? asset.sell_orders.map(exports.orderFromJSON) : null,
        buyOrders: asset.buy_orders ? asset.buy_orders.map(exports.orderFromJSON) : null,
        isPresale: asset.is_presale,
        // Don't use previews if it's a special image
        imageUrl: isAnimated || isSvg
            ? asset.image_url
            : (asset.image_preview_url || asset.image_url),
        imagePreviewUrl: asset.image_preview_url,
        imageUrlOriginal: asset.image_original_url,
        imageUrlThumbnail: asset.image_thumbnail_url,
        externalLink: asset.external_link,
        openseaLink: asset.permalink,
        traits: asset.traits,
        numSales: asset.num_sales,
        lastSale: asset.last_sale,
        backgroundColor: asset.background_color ? "#" + asset.background_color : null,
        transferFee: asset.transfer_fee
            ? makeBigNumber(asset.transfer_fee)
            : null,
        transferFeePaymentToken: asset.transfer_fee_payment_token
            ? exports.tokenFromJSON(asset.transfer_fee_payment_token)
            : null,
    };
    // If orders were included, put them in sell/buy order groups
    if (fromJSON.orders && !fromJSON.sellOrders) {
        fromJSON.sellOrders = fromJSON.orders.filter(function (o) { return o.side == types_2.OrderSide.Sell; });
    }
    if (fromJSON.orders && !fromJSON.buyOrders) {
        fromJSON.buyOrders = fromJSON.orders.filter(function (o) { return o.side == types_2.OrderSide.Buy; });
    }
    return fromJSON;
};
exports.assetBundleFromJSON = function (asset_bundle) {
    var fromJSON = {
        maker: asset_bundle.maker,
        assets: asset_bundle.assets.map(exports.assetFromJSON),
        assetContract: asset_bundle.asset_contract
            ? exports.assetContractFromJSON(asset_bundle.asset_contract)
            : undefined,
        name: asset_bundle.name,
        slug: asset_bundle.slug,
        description: asset_bundle.description,
        externalLink: asset_bundle.external_link,
        permalink: asset_bundle.permalink,
        sellOrders: asset_bundle.sell_orders ? asset_bundle.sell_orders.map(exports.orderFromJSON) : null
    };
    return fromJSON;
};
exports.assetContractFromJSON = function (asset_contract) {
    return {
        name: asset_contract.name,
        description: asset_contract.description,
        type: asset_contract.asset_contract_type,
        schemaName: asset_contract.schema_name,
        address: asset_contract.address,
        tokenSymbol: asset_contract.symbol,
        buyerFeeBasisPoints: asset_contract.buyer_fee_basis_points,
        sellerFeeBasisPoints: asset_contract.seller_fee_basis_points,
        openseaBuyerFeeBasisPoints: asset_contract.opensea_buyer_fee_basis_points,
        openseaSellerFeeBasisPoints: asset_contract.opensea_seller_fee_basis_points,
        devBuyerFeeBasisPoints: asset_contract.dev_buyer_fee_basis_points,
        devSellerFeeBasisPoints: asset_contract.dev_seller_fee_basis_points,
        imageUrl: asset_contract.image_url,
        stats: asset_contract.stats,
        traits: asset_contract.traits,
        externalLink: asset_contract.external_link,
        wikiLink: asset_contract.wiki_link,
    };
};
exports.tokenFromJSON = function (token) {
    var fromJSON = {
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        address: token.address,
        imageUrl: token.image_url,
        ethPrice: token.eth_price
    };
    return fromJSON;
};
exports.orderFromJSON = function (order) {
    var createdDate = new Date(order.created_date + "Z");
    var fromJSON = {
        hash: order.order_hash || order.hash,
        cancelledOrFinalized: order.cancelled || order.finalized,
        markedInvalid: order.marked_invalid,
        metadata: order.metadata,
        exchange: order.exchange,
        makerAccount: order.maker,
        takerAccount: order.maker,
        // Use string address to conform to Wyvern Order schema
        maker: order.maker.address,
        taker: order.taker.address,
        makerRelayerFee: new bignumber_js_1.default(order.maker_relayer_fee),
        takerRelayerFee: new bignumber_js_1.default(order.taker_relayer_fee),
        makerProtocolFee: new bignumber_js_1.default(order.maker_protocol_fee),
        takerProtocolFee: new bignumber_js_1.default(order.taker_protocol_fee),
        makerReferrerFee: new bignumber_js_1.default(order.maker_referrer_fee || 0),
        waitingForBestCounterOrder: order.fee_recipient.address == exports.NULL_ADDRESS,
        feeMethod: order.fee_method,
        feeRecipientAccount: order.fee_recipient,
        feeRecipient: order.fee_recipient.address,
        side: order.side,
        saleKind: order.sale_kind,
        target: order.target,
        howToCall: order.how_to_call,
        calldata: order.calldata,
        replacementPattern: order.replacement_pattern,
        staticTarget: order.static_target,
        staticExtradata: order.static_extradata,
        paymentToken: order.payment_token,
        basePrice: new bignumber_js_1.default(order.base_price),
        extra: new bignumber_js_1.default(order.extra),
        currentBounty: new bignumber_js_1.default(order.current_bounty || 0),
        currentPrice: new bignumber_js_1.default(order.current_price || 0),
        createdTime: new bignumber_js_1.default(Math.round(createdDate.getTime() / 1000)),
        listingTime: new bignumber_js_1.default(order.listing_time),
        expirationTime: new bignumber_js_1.default(order.expiration_time),
        salt: new bignumber_js_1.default(order.salt),
        v: parseInt(order.v),
        r: order.r,
        s: order.s,
        paymentTokenContract: order.payment_token_contract ? exports.tokenFromJSON(order.payment_token_contract) : undefined,
        asset: order.asset ? exports.assetFromJSON(order.asset) : undefined,
        assetBundle: order.asset_bundle ? exports.assetBundleFromJSON(order.asset_bundle) : undefined,
    };
    // Use client-side price calc, to account for buyer fee (not added by server) and latency
    fromJSON.currentPrice = estimateCurrentPrice(fromJSON);
    return fromJSON;
};
/**
 * Convert an order to JSON, hashing it as well if necessary
 * @param order order (hashed or unhashed)
 */
exports.orderToJSON = function (order) {
    var asJSON = {
        exchange: order.exchange.toLowerCase(),
        maker: order.maker.toLowerCase(),
        taker: order.taker.toLowerCase(),
        makerRelayerFee: order.makerRelayerFee.toString(),
        takerRelayerFee: order.takerRelayerFee.toString(),
        makerProtocolFee: order.makerProtocolFee.toString(),
        takerProtocolFee: order.takerProtocolFee.toString(),
        makerReferrerFee: order.makerReferrerFee.toString(),
        feeMethod: order.feeMethod,
        feeRecipient: order.feeRecipient.toLowerCase(),
        side: order.side,
        saleKind: order.saleKind,
        target: order.target.toLowerCase(),
        howToCall: order.howToCall,
        calldata: order.calldata,
        replacementPattern: order.replacementPattern,
        staticTarget: order.staticTarget.toLowerCase(),
        staticExtradata: order.staticExtradata,
        paymentToken: order.paymentToken.toLowerCase(),
        basePrice: order.basePrice.toString(),
        extra: order.extra.toString(),
        createdTime: order.createdTime
            ? order.createdTime.toString()
            : undefined,
        listingTime: order.listingTime.toString(),
        expirationTime: order.expirationTime.toString(),
        salt: order.salt.toString(),
        metadata: order.metadata,
        v: order.v,
        r: order.r,
        s: order.s,
        hash: order.hash
    };
    return asJSON;
};
/**
 * Sign messages using web3 personal signatures
 * @param web3 Web3 instance
 * @param message message to sign
 * @param signerAddress web3 address signing the message
 * @returns A signature if provider can sign, otherwise null
 */
function personalSignAsync(web3, message, signerAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var signature, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, promisify(function (c) { return web3.currentProvider.sendAsync({
                        method: 'personal_sign',
                        params: [message, signerAddress],
                        from: signerAddress,
                    }, c); })];
                case 1:
                    signature = _a.sent();
                    error = signature.error;
                    if (error) {
                        return [2 /*return*/, null];
                    }
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
 * @param param0 __namedParameters
 * @param from address sending transaction
 * @param to destination contract address
 * @param data data to send to contract
 * @param gasPrice gas price to use. If unspecified, uses web3 default (mean gas price)
 * @param value value in ETH to send with data. Defaults to 0
 * @param onError callback when user denies transaction
 */
function sendRawTransaction(web3, _a, onError) {
    var from = _a.from, to = _a.to, data = _a.data, gasPrice = _a.gasPrice, _b = _a.value, value = _b === void 0 ? 0 : _b, gas = _a.gas;
    return __awaiter(this, void 0, void 0, function () {
        var txHashRes, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(gas == null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, estimateGas(web3, { from: from, to: to, data: data, value: value })];
                case 1:
                    // This gas cannot be increased due to an ethjs error
                    gas = _c.sent();
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, promisify(function (c) { return web3.eth.sendTransaction({
                            from: from,
                            to: to,
                            value: value,
                            data: data,
                            gas: gas,
                            gasPrice: gasPrice
                        }, c); })];
                case 3:
                    txHashRes = _c.sent();
                    return [2 /*return*/, txHashRes.toString()];
                case 4:
                    error_2 = _c.sent();
                    onError(error_2);
                    throw error_2;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.sendRawTransaction = sendRawTransaction;
/**
 * Call a method on a contract, sending arbitrary data and
 * handling Parity errors. Returns '0x' if error.
 * @param web3 Web3 instance
 * @param param0 __namedParameters
 * @param from address sending call
 * @param to destination contract address
 * @param data data to send to contract
 * @param onError callback when user denies transaction
 */
function rawCall(web3, _a, onError) {
    var from = _a.from, to = _a.to, data = _a.data;
    return __awaiter(this, void 0, void 0, function () {
        var result, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisify(function (c) { return web3.eth.call({
                            from: from,
                            to: to,
                            data: data
                        }, c); })];
                case 1:
                    result = _b.sent();
                    return [2 /*return*/, result];
                case 2:
                    error_3 = _b.sent();
                    // Probably method not found, and web3 is a Parity node
                    if (onError) {
                        onError(error_3);
                    }
                    // Backwards compatibility with Geth nodes
                    return [2 /*return*/, '0x'];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.rawCall = rawCall;
/**
 * Estimate Gas usage for a transaction
 * @param web3 Web3 instance
 * @param from address sending transaction
 * @param to destination contract address
 * @param data data to send to contract
 * @param value value in ETH to send with data
 */
function estimateGas(web3, _a) {
    var from = _a.from, to = _a.to, data = _a.data, _b = _a.value, value = _b === void 0 ? 0 : _b;
    return __awaiter(this, void 0, void 0, function () {
        var amount;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, promisify(function (c) { return web3.eth.estimateGas({
                        from: from,
                        to: to,
                        value: value,
                        data: data,
                    }, c); })];
                case 1:
                    amount = _c.sent();
                    return [2 /*return*/, amount];
            }
        });
    });
}
exports.estimateGas = estimateGas;
/**
 * Get mean gas price for sending a txn, in wei
 * @param web3 Web3 instance
 */
function getCurrentGasPrice(web3) {
    return __awaiter(this, void 0, void 0, function () {
        var meanGas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, promisify(function (c) { return web3.eth.getGasPrice(c); })];
                case 1:
                    meanGas = _a.sent();
                    return [2 /*return*/, meanGas];
            }
        });
    });
}
exports.getCurrentGasPrice = getCurrentGasPrice;
/**
 * Get current transfer fees for an asset
 * @param web3 Web3 instance
 * @param asset The asset to check for transfer fees
 */
function getTransferFeeSettings(web3, _a) {
    var asset = _a.asset;
    return __awaiter(this, void 0, void 0, function () {
        var transferFee, transferFeeTokenAddress, feeContract_1, params;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(asset.tokenAddress.toLowerCase() == exports.ENJIN_ADDRESS.toLowerCase())) return [3 /*break*/, 2];
                    feeContract_1 = web3.eth.contract(contracts_1.ERC1155).at(asset.tokenAddress);
                    return [4 /*yield*/, promisifyCall(function (c) { return feeContract_1.transferSettings(asset.tokenId, c); })];
                case 1:
                    params = _b.sent();
                    if (params) {
                        transferFee = makeBigNumber(params[3]);
                        if (params[2] == 0) {
                            transferFeeTokenAddress = exports.ENJIN_COIN_ADDRESS;
                        }
                    }
                    _b.label = 2;
                case 2: return [2 /*return*/, { transferFee: transferFee, transferFeeTokenAddress: transferFeeTokenAddress }];
            }
        });
    });
}
exports.getTransferFeeSettings = getTransferFeeSettings;
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
 * Estimates the price of an order
 * @param order The order to estimate price on
 * @param secondsToBacktrack The number of seconds to subtract on current time,
 *  to fix race conditions
 * @param shouldRoundUp Whether to round up fractional wei
 */
function estimateCurrentPrice(order, secondsToBacktrack, shouldRoundUp) {
    if (secondsToBacktrack === void 0) { secondsToBacktrack = 30; }
    if (shouldRoundUp === void 0) { shouldRoundUp = true; }
    var basePrice = order.basePrice, listingTime = order.listingTime, expirationTime = order.expirationTime, extra = order.extra;
    var side = order.side, takerRelayerFee = order.takerRelayerFee, makerRelayerFee = order.makerRelayerFee, saleKind = order.saleKind, feeRecipient = order.feeRecipient;
    var now = new bignumber_js_1.default(Date.now() / 1000).minus(secondsToBacktrack);
    basePrice = new bignumber_js_1.default(basePrice);
    listingTime = new bignumber_js_1.default(listingTime);
    expirationTime = new bignumber_js_1.default(expirationTime);
    extra = new bignumber_js_1.default(extra);
    var exactPrice = basePrice;
    if (saleKind == types_2.SaleKind.FixedPrice) {
        // Do nothing, price is correct
    }
    else if (saleKind == types_2.SaleKind.DutchAuction) {
        var diff = extra.times(now.minus(listingTime))
            .dividedBy(expirationTime.minus(listingTime));
        exactPrice = side == types_2.OrderSide.Sell
            /* Sell-side - start price: basePrice. End price: basePrice - extra. */
            ? basePrice.minus(diff)
            /* Buy-side - start price: basePrice. End price: basePrice + extra. */
            : basePrice.plus(diff);
    }
    // Add buyer fee
    if (side == types_2.OrderSide.Sell) {
        // Buyer fee increases sale price
        var buyerFeeBPS = order.waitingForBestCounterOrder
            ? makerRelayerFee
            : takerRelayerFee;
        exactPrice = exactPrice.times(+buyerFeeBPS / exports.INVERSE_BASIS_POINT + 1);
    }
    return shouldRoundUp ? exactPrice.ceil() : exactPrice;
}
exports.estimateCurrentPrice = estimateCurrentPrice;
/**
 * Wrapper function for getting generic Wyvern assets from OpenSea assets
 * @param schema Wyvern schema for the asset
 * @param asset The fungible or nonfungible asset to format
 */
function getWyvernAsset(schema, asset, quantity) {
    if (quantity === void 0) { quantity = new bignumber_js_1.default(1); }
    if (SCHEMA_NAME_TO_ASSET_CONTRACT_TYPE[schema.name] == types_2.AssetContractType.NonFungible) {
        return getWyvernNFTAsset(schema, asset);
    }
    else {
        return getWyvernFTAsset(schema, asset, quantity);
    }
}
exports.getWyvernAsset = getWyvernAsset;
/**
 * Get the Wyvern representation of an NFT asset
 * @param schema The WyvernSchema needed to access this asset
 * @param asset The asset
 */
function getWyvernNFTAsset(schema, asset) {
    return schema.assetFromFields({
        'ID': asset.tokenId != null
            ? asset.tokenId.toString()
            : undefined,
        'Address': asset.tokenAddress.toLowerCase(),
        'Name': asset.name,
    });
}
exports.getWyvernNFTAsset = getWyvernNFTAsset;
/**
 * Get the Wyvern representation of a fungible asset
 * @param schema The WyvernSchema needed to access this asset
 * @param asset The asset to trade
 * @param quantity The number of items to trade
 */
function getWyvernFTAsset(schema, asset, quantity) {
    var tokenId = asset.tokenId != null
        ? asset.tokenId
        : undefined;
    return schema.assetFromFields({
        'ID': tokenId,
        'Quantity': quantity.toString(),
        'Address': asset.tokenAddress.toLowerCase(),
    });
}
exports.getWyvernFTAsset = getWyvernFTAsset;
/**
 * Get the Wyvern representation of a group of NFT assets
 * Sort order is enforced here
 * @param schema The WyvernSchema needed to access these assets
 * @param assets Assets to bundle
 */
function getWyvernBundle(schema, assets) {
    var wyAssets = assets.map(function (asset) { return getWyvernNFTAsset(schema, asset); });
    var sortedWyAssets = _.sortBy(wyAssets, [function (a) { return a.address; }, function (a) { return a.id; }]);
    return {
        assets: sortedWyAssets
    };
}
exports.getWyvernBundle = getWyvernBundle;
/**
 * Get the non-prefixed hash for the order
 * (Fixes a Wyvern typescript issue and casing issue)
 * @param order order to hash
 */
function getOrderHash(order) {
    var orderWithStringTypes = __assign({}, order, { maker: order.maker.toLowerCase(), taker: order.taker.toLowerCase(), feeRecipient: order.feeRecipient.toLowerCase(), side: order.side.toString(), saleKind: order.saleKind.toString(), howToCall: order.howToCall.toString(), feeMethod: order.feeMethod.toString() });
    return wyvern_js_1.WyvernProtocol.getOrderHashHex(orderWithStringTypes);
}
exports.getOrderHash = getOrderHash;
/**
 * Assign an order and a new matching order to their buy/sell sides
 * @param order Original order
 * @param matchingOrder The result of _makeMatchingOrder
 */
function assignOrdersToSides(order, matchingOrder) {
    var isSellOrder = order.side == types_2.OrderSide.Sell;
    var buy;
    var sell;
    if (!isSellOrder) {
        buy = order;
        sell = __assign({}, matchingOrder, { v: buy.v, r: buy.r, s: buy.s });
    }
    else {
        sell = order;
        buy = __assign({}, matchingOrder, { v: sell.v, r: sell.r, s: sell.s });
    }
    return { buy: buy, sell: sell };
}
exports.assignOrdersToSides = assignOrdersToSides;
// BROKEN
// TODO fix this calldata for buy orders
function canSettleOrder(client, order, matchingOrder) {
    return __awaiter(this, void 0, void 0, function () {
        var calldata, seller, proxy, contract;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    calldata = order.calldata.slice(0, 98) + "1111111111111111111111111111111111111111" + order.calldata.slice(138);
                    seller = order.side == types_2.OrderSide.Buy ? matchingOrder.maker : order.maker;
                    return [4 /*yield*/, client._getProxy(seller)];
                case 1:
                    proxy = _a.sent();
                    if (!proxy) {
                        console.warn("No proxy found for seller " + seller);
                        return [2 /*return*/, false];
                    }
                    contract = (client.web3.eth.contract([proxyABI])).at(proxy);
                    return [2 /*return*/, promisify(function (c) {
                            return contract.proxy.call(order.target, order.howToCall, calldata, { from: seller }, c);
                        })];
            }
        });
    });
}
/**
 * Delay using setTimeout
 * @param ms milliseconds to wait
 */
function delay(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res) { return setTimeout(res, ms); })];
        });
    });
}
exports.delay = delay;
/**
 * Encode the atomicized transfer of many assets
 * @param schema Wyvern Schema for the assets
 * @param assets List of assets to transfer
 * @param from Current address owning the assets
 * @param to Destination address
 * @param atomicizer Wyvern Atomicizer instance
 */
function encodeAtomicizedTransfer(schema, assets, from, to, atomicizer) {
    var transactions = assets.map(function (asset) {
        var transfer = schema.functions.transfer(asset);
        var calldata = encodeTransferCall(transfer, from, to);
        return {
            calldata: calldata,
            address: transfer.target,
            value: new bignumber_js_1.default(0),
        };
    });
    var atomicizedCalldata = atomicizer.atomicize.getABIEncodedTransactionData(transactions.map(function (t) { return t.address; }), transactions.map(function (t) { return t.value; }), transactions.map(function (t) { return new bignumber_js_1.default((t.calldata.length - 2) / 2); }), // subtract 2 for '0x', divide by 2 for hex
    transactions.map(function (t) { return t.calldata; }).reduce(function (x, current) { return x + current.slice(2); }, '0x'));
    return {
        calldata: atomicizedCalldata,
    };
}
exports.encodeAtomicizedTransfer = encodeAtomicizedTransfer;
/**
 * Encode a transfer call for a Wyvern schema function
 * @param transferAbi Annotated Wyvern ABI
 * @param from From address
 * @param to To address
 */
function encodeTransferCall(transferAbi, from, to) {
    var parameters = transferAbi.inputs.map(function (input) {
        switch (input.kind) {
            case types_1.FunctionInputKind.Replaceable:
                return to;
            case types_1.FunctionInputKind.Owner:
                return from;
            case types_1.FunctionInputKind.Asset:
            default:
                if (input.value == null) {
                    throw new Error("Unsupported function input kind: " + input.kind);
                }
                return input.value;
        }
    });
    return WyvernSchemas.encodeCall(transferAbi, parameters);
}
exports.encodeTransferCall = encodeTransferCall;
/**
 * Encode a call to a user's proxy contract
 * @param address The address for the proxy to call
 * @param howToCall How to call the addres
 * @param calldata The data to use in the call
 * @param shouldAssert Whether to assert success in the proxy call
 */
function encodeProxyCall(address, howToCall, calldata, shouldAssert) {
    if (shouldAssert === void 0) { shouldAssert = true; }
    var abi = shouldAssert ? proxyAssertABI : proxyABI;
    return WyvernSchemas.encodeCall(abi, [address, howToCall, Buffer.from(calldata.slice(2), 'hex')]);
}
exports.encodeProxyCall = encodeProxyCall;
/**
 * Validates that an address exists, isn't null, and is properly
 * formatted for Wyvern and OpenSea
 * @param address input address
 */
function validateAndFormatWalletAddress(web3, address) {
    if (!address) {
        throw new Error('No wallet address found');
    }
    if (!web3.isAddress(address)) {
        throw new Error('Invalid wallet address');
    }
    if (address == exports.NULL_ADDRESS) {
        throw new Error('Wallet cannot be the null address');
    }
    return address.toLowerCase();
}
exports.validateAndFormatWalletAddress = validateAndFormatWalletAddress;
/**
 * Notify developer when a pattern will be deprecated
 * @param msg message to log to console
 */
function onDeprecated(msg) {
    console.warn("DEPRECATION NOTICE: " + msg);
}
exports.onDeprecated = onDeprecated;
//# sourceMappingURL=utils.js.map