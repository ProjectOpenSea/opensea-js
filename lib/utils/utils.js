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
import BigNumber from "bignumber.js";
import * as ethUtil from "ethereumjs-util";
import * as _ from "lodash";
import * as Web3 from "web3";
import { WyvernProtocol } from "wyvern-js";
import { FunctionInputKind, FunctionOutputKind, StateMutability, Network, } from "wyvern-schemas/dist/types";
import { ENJIN_ADDRESS, ENJIN_COIN_ADDRESS, INVERSE_BASIS_POINT, NULL_ADDRESS, NULL_BLOCK_HASH, FEE_WRAPPER_ADDRESS_MAINNET, FEE_WRAPPER_ADDRESS_RINKEBY, } from "../constants";
import { ERC1155 } from "../contracts";
import { OrderSide, SaleKind, } from "../types";
export { WyvernProtocol };
export var annotateERC721TransferABI = function (asset) { return ({
    constant: false,
    inputs: [
        {
            name: "_to",
            type: "address",
            kind: FunctionInputKind.Replaceable,
        },
        {
            name: "_tokenId",
            type: "uint256",
            kind: FunctionInputKind.Asset,
            value: asset.id,
        },
    ],
    target: asset.address,
    name: "transfer",
    outputs: [],
    payable: false,
    stateMutability: StateMutability.Nonpayable,
    type: Web3.AbiType.Function,
}); };
export var annotateERC20TransferABI = function (asset) { return ({
    constant: false,
    inputs: [
        {
            name: "_to",
            type: "address",
            kind: FunctionInputKind.Replaceable,
        },
        {
            name: "_amount",
            type: "uint256",
            kind: FunctionInputKind.Count,
            value: asset.quantity,
        },
    ],
    target: asset.address,
    name: "transfer",
    outputs: [
        {
            name: "success",
            type: "bool",
            kind: FunctionOutputKind.Other,
        },
    ],
    payable: false,
    stateMutability: StateMutability.Nonpayable,
    type: Web3.AbiType.Function,
}); };
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
export function promisifyCall(callback, onError) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisify(callback)];
                case 1:
                    result = _a.sent();
                    if (typeof result === "string" && result == "0x") {
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
var track = function (web3, txHash, onFinalized) {
    if (txCallbacks[txHash]) {
        txCallbacks[txHash].push(onFinalized);
    }
    else {
        txCallbacks[txHash] = [onFinalized];
        var poll_1 = function () { return __awaiter(void 0, void 0, void 0, function () {
            var tx, receipt, status_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, promisify(function (c) {
                            return web3.eth.getTransaction(txHash, c);
                        })];
                    case 1:
                        tx = _a.sent();
                        if (!(tx && tx.blockHash && tx.blockHash !== NULL_BLOCK_HASH)) return [3 /*break*/, 3];
                        return [4 /*yield*/, promisify(function (c) {
                                return web3.eth.getTransactionReceipt(txHash, c);
                            })];
                    case 2:
                        receipt = _a.sent();
                        if (!receipt) {
                            // Hack: assume success if no receipt
                            console.warn("No receipt found for ", txHash);
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
export var confirmTransaction = function (web3, txHash) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                track(web3, txHash, function (didSucceed) {
                    if (didSucceed) {
                        resolve("Transaction complete!");
                    }
                    else {
                        reject(new Error("Transaction failed :( You might have already completed this action. See more on the mainnet at etherscan.io/tx/".concat(txHash)));
                    }
                });
            })];
    });
}); };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export var assetFromJSON = function (asset) {
    var isAnimated = asset.image_url && asset.image_url.endsWith(".gif");
    var isSvg = asset.image_url && asset.image_url.endsWith(".svg");
    var fromJSON = {
        tokenId: asset.token_id.toString(),
        tokenAddress: asset.asset_contract.address,
        name: asset.name,
        description: asset.description,
        owner: asset.owner,
        assetContract: assetContractFromJSON(asset.asset_contract),
        collection: collectionFromJSON(asset.collection),
        orders: asset.orders ? asset.orders.map(orderFromJSON) : null,
        sellOrders: asset.sell_orders ? asset.sell_orders.map(orderFromJSON) : null,
        buyOrders: asset.buy_orders ? asset.buy_orders.map(orderFromJSON) : null,
        isPresale: asset.is_presale,
        // Don't use previews if it's a special image
        imageUrl: isAnimated || isSvg
            ? asset.image_url
            : asset.image_preview_url || asset.image_url,
        imagePreviewUrl: asset.image_preview_url,
        imageUrlOriginal: asset.image_original_url,
        imageUrlThumbnail: asset.image_thumbnail_url,
        externalLink: asset.external_link,
        openseaLink: asset.permalink,
        traits: asset.traits,
        numSales: asset.num_sales,
        lastSale: asset.last_sale ? assetEventFromJSON(asset.last_sale) : null,
        backgroundColor: asset.background_color
            ? "#".concat(asset.background_color)
            : null,
        transferFee: asset.transfer_fee ? makeBigNumber(asset.transfer_fee) : null,
        transferFeePaymentToken: asset.transfer_fee_payment_token
            ? tokenFromJSON(asset.transfer_fee_payment_token)
            : null,
    };
    // If orders were included, put them in sell/buy order groups
    if (fromJSON.orders && !fromJSON.sellOrders) {
        fromJSON.sellOrders = fromJSON.orders.filter(function (o) { return o.side == OrderSide.Sell; });
    }
    if (fromJSON.orders && !fromJSON.buyOrders) {
        fromJSON.buyOrders = fromJSON.orders.filter(function (o) { return o.side == OrderSide.Buy; });
    }
    return fromJSON;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export var assetEventFromJSON = function (assetEvent) {
    return {
        eventType: assetEvent.event_type,
        eventTimestamp: assetEvent.event_timestamp,
        auctionType: assetEvent.auction_type,
        totalPrice: assetEvent.total_price,
        transaction: assetEvent.transaction
            ? transactionFromJSON(assetEvent.transaction)
            : null,
        paymentToken: assetEvent.payment_token
            ? tokenFromJSON(assetEvent.payment_token)
            : null,
    };
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export var transactionFromJSON = function (transaction) {
    return {
        fromAccount: accountFromJSON(transaction.from_account),
        toAccount: accountFromJSON(transaction.to_account),
        createdDate: new Date("".concat(transaction.created_date, "Z")),
        modifiedDate: new Date("".concat(transaction.modified_date, "Z")),
        transactionHash: transaction.transaction_hash,
        transactionIndex: transaction.transaction_index,
        blockNumber: transaction.block_number,
        blockHash: transaction.block_hash,
        timestamp: new Date("".concat(transaction.timestamp, "Z")),
    };
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export var accountFromJSON = function (account) {
    return {
        address: account.address,
        config: account.config,
        profileImgUrl: account.profile_img_url,
        user: account.user ? userFromJSON(account.user) : null,
    };
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export var userFromJSON = function (user) {
    return {
        username: user.username,
    };
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export var assetBundleFromJSON = function (asset_bundle) {
    var fromJSON = {
        maker: asset_bundle.maker,
        assets: asset_bundle.assets.map(assetFromJSON),
        assetContract: asset_bundle.asset_contract
            ? assetContractFromJSON(asset_bundle.asset_contract)
            : undefined,
        name: asset_bundle.name,
        slug: asset_bundle.slug,
        description: asset_bundle.description,
        externalLink: asset_bundle.external_link,
        permalink: asset_bundle.permalink,
        sellOrders: asset_bundle.sell_orders
            ? asset_bundle.sell_orders.map(orderFromJSON)
            : null,
    };
    return fromJSON;
};
export var assetContractFromJSON = function (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
asset_contract) {
    return {
        name: asset_contract.name,
        description: asset_contract.description,
        type: asset_contract.asset_contract_type,
        schemaName: asset_contract.schema_name,
        address: asset_contract.address,
        tokenSymbol: asset_contract.symbol,
        buyerFeeBasisPoints: +asset_contract.buyer_fee_basis_points,
        sellerFeeBasisPoints: +asset_contract.seller_fee_basis_points,
        openseaBuyerFeeBasisPoints: +asset_contract.opensea_buyer_fee_basis_points,
        openseaSellerFeeBasisPoints: +asset_contract.opensea_seller_fee_basis_points,
        devBuyerFeeBasisPoints: +asset_contract.dev_buyer_fee_basis_points,
        devSellerFeeBasisPoints: +asset_contract.dev_seller_fee_basis_points,
        imageUrl: asset_contract.image_url,
        externalLink: asset_contract.external_link,
        wikiLink: asset_contract.wiki_link,
    };
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export var collectionFromJSON = function (collection) {
    var createdDate = new Date("".concat(collection.created_date, "Z"));
    return {
        createdDate: createdDate,
        name: collection.name,
        description: collection.description,
        slug: collection.slug,
        editors: collection.editors,
        hidden: collection.hidden,
        featured: collection.featured,
        featuredImageUrl: collection.featured_image_url,
        displayData: collection.display_data,
        paymentTokens: (collection.payment_tokens || []).map(tokenFromJSON),
        openseaBuyerFeeBasisPoints: +collection.opensea_buyer_fee_basis_points,
        openseaSellerFeeBasisPoints: +collection.opensea_seller_fee_basis_points,
        devBuyerFeeBasisPoints: +collection.dev_buyer_fee_basis_points,
        devSellerFeeBasisPoints: +collection.dev_seller_fee_basis_points,
        payoutAddress: collection.payout_address,
        imageUrl: collection.image_url,
        largeImageUrl: collection.large_image_url,
        stats: collection.stats,
        traitStats: collection.traits,
        externalLink: collection.external_url,
        wikiLink: collection.wiki_url,
    };
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export var tokenFromJSON = function (token) {
    var fromJSON = {
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        address: token.address,
        imageUrl: token.image_url,
        ethPrice: token.eth_price,
        usdPrice: token.usd_price,
    };
    return fromJSON;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export var orderFromJSON = function (order) {
    var createdDate = new Date("".concat(order.created_date, "Z"));
    var fromJSON = {
        hash: order.order_hash || order.hash,
        cancelledOrFinalized: order.cancelled || order.finalized,
        markedInvalid: order.marked_invalid,
        metadata: order.metadata,
        quantity: new BigNumber(order.quantity || 1),
        exchange: order.exchange,
        makerAccount: order.maker,
        takerAccount: order.taker,
        // Use string address to conform to Wyvern Order schema
        maker: order.maker.address,
        taker: order.taker.address,
        makerRelayerFee: new BigNumber(order.maker_relayer_fee),
        takerRelayerFee: new BigNumber(order.taker_relayer_fee),
        makerProtocolFee: new BigNumber(order.maker_protocol_fee),
        takerProtocolFee: new BigNumber(order.taker_protocol_fee),
        makerReferrerFee: new BigNumber(order.maker_referrer_fee || 0),
        waitingForBestCounterOrder: order.fee_recipient.address == NULL_ADDRESS,
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
        basePrice: new BigNumber(order.base_price),
        extra: new BigNumber(order.extra),
        currentBounty: new BigNumber(order.current_bounty || 0),
        currentPrice: new BigNumber(order.current_price || 0),
        createdTime: new BigNumber(Math.round(createdDate.getTime() / 1000)),
        listingTime: new BigNumber(order.listing_time),
        expirationTime: new BigNumber(order.expiration_time),
        salt: new BigNumber(order.salt),
        v: parseInt(order.v),
        r: order.r,
        s: order.s,
        paymentTokenContract: order.payment_token_contract
            ? tokenFromJSON(order.payment_token_contract)
            : undefined,
        asset: order.asset ? assetFromJSON(order.asset) : undefined,
        assetBundle: order.asset_bundle
            ? assetBundleFromJSON(order.asset_bundle)
            : undefined,
    };
    // Use client-side price calc, to account for buyer fee (not added by server) and latency
    fromJSON.currentPrice = estimateCurrentPrice(fromJSON);
    return fromJSON;
};
/**
 * Convert an order to JSON, hashing it as well if necessary
 * @param order order (hashed or unhashed)
 */
export var orderToJSON = function (order) {
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
        quantity: order.quantity.toString(),
        basePrice: order.basePrice.toString(),
        englishAuctionReservePrice: order.englishAuctionReservePrice
            ? order.englishAuctionReservePrice.toString()
            : undefined,
        extra: order.extra.toString(),
        createdTime: order.createdTime ? order.createdTime.toString() : undefined,
        listingTime: order.listingTime.toString(),
        expirationTime: order.expirationTime.toString(),
        salt: order.salt.toString(),
        metadata: order.metadata,
        v: order.v,
        r: order.r,
        s: order.s,
        hash: order.hash,
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
export function personalSignAsync(web3, message, signerAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var signature, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, promisify(function (c) {
                        return web3.currentProvider.sendAsync({
                            method: "personal_sign",
                            params: [message, signerAddress],
                            from: signerAddress,
                            id: new Date().getTime(),
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        }, c);
                    })];
                case 1:
                    signature = _a.sent();
                    error = signature.error;
                    if (error) {
                        throw new Error(error);
                    }
                    return [2 /*return*/, parseSignatureHex(signature.result)];
            }
        });
    });
}
/**
 * Checks whether a given address contains any code
 * @param web3 Web3 instance
 * @param address input address
 */
export function isContractAddress(web3, address) {
    return __awaiter(this, void 0, void 0, function () {
        var code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, promisify(function (c) { return web3.eth.getCode(address, c); })];
                case 1:
                    code = _a.sent();
                    return [2 /*return*/, code !== "0x"];
            }
        });
    });
}
/**
 * Special fixes for making BigNumbers using web3 results
 * @param arg An arg or the result of a web3 call to turn into a BigNumber
 */
export function makeBigNumber(arg) {
    // Zero sometimes returned as 0x from contracts
    if (arg === "0x") {
        arg = 0;
    }
    // fix "new BigNumber() number type has more than 15 significant digits"
    arg = arg.toString();
    return new BigNumber(arg);
}
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
export function sendRawTransaction(web3, _a, onError) {
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
                    return [4 /*yield*/, promisify(function (c) {
                            return web3.eth.sendTransaction({
                                from: from,
                                to: to,
                                value: value,
                                data: data,
                                gas: gas,
                                gasPrice: gasPrice,
                            }, c);
                        })];
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
export function rawCall(web3, _a, onError) {
    var from = _a.from, to = _a.to, data = _a.data;
    return __awaiter(this, void 0, void 0, function () {
        var result, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, promisify(function (c) {
                            return web3.eth.call({
                                from: from,
                                to: to,
                                data: data,
                            }, c);
                        })];
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
                    return [2 /*return*/, "0x"];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Estimate Gas usage for a transaction
 * @param web3 Web3 instance
 * @param from address sending transaction
 * @param to destination contract address
 * @param data data to send to contract
 * @param value value in ETH to send with data
 */
export function estimateGas(web3, _a) {
    var from = _a.from, to = _a.to, data = _a.data, _b = _a.value, value = _b === void 0 ? 0 : _b;
    return __awaiter(this, void 0, void 0, function () {
        var amount;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, promisify(function (c) {
                        return web3.eth.estimateGas({
                            from: from,
                            to: to,
                            value: value,
                            data: data,
                        }, c);
                    })];
                case 1:
                    amount = _c.sent();
                    return [2 /*return*/, amount];
            }
        });
    });
}
/**
 * Get mean gas price for sending a txn, in wei
 * @param web3 Web3 instance
 */
export function getCurrentGasPrice(web3) {
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
/**
 * Get current transfer fees for an asset
 * @param web3 Web3 instance
 * @param asset The asset to check for transfer fees
 */
export function getTransferFeeSettings(web3, _a) {
    var asset = _a.asset, accountAddress = _a.accountAddress;
    return __awaiter(this, void 0, void 0, function () {
        var transferFee, transferFeeTokenAddress, feeContract_1, params;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(asset.tokenAddress.toLowerCase() == ENJIN_ADDRESS.toLowerCase())) return [3 /*break*/, 2];
                    feeContract_1 = web3.eth
                        .contract(ERC1155)
                        .at(asset.tokenAddress);
                    return [4 /*yield*/, promisifyCall(function (c) {
                            return feeContract_1.transferSettings(asset.tokenId, { from: accountAddress }, c);
                        })];
                case 1:
                    params = _b.sent();
                    if (params) {
                        transferFee = makeBigNumber(params[3]);
                        if (params[2] == 0) {
                            transferFeeTokenAddress = ENJIN_COIN_ADDRESS;
                        }
                    }
                    _b.label = 2;
                case 2: return [2 /*return*/, { transferFee: transferFee, transferFeeTokenAddress: transferFeeTokenAddress }];
            }
        });
    });
}
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
    throw new Error("Invalid signature");
    function _parseSignatureHexAsVRS(signatureHex) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
export function estimateCurrentPrice(order, secondsToBacktrack, shouldRoundUp) {
    if (secondsToBacktrack === void 0) { secondsToBacktrack = 30; }
    if (shouldRoundUp === void 0) { shouldRoundUp = true; }
    var basePrice = order.basePrice, listingTime = order.listingTime, expirationTime = order.expirationTime, extra = order.extra;
    var side = order.side, takerRelayerFee = order.takerRelayerFee, saleKind = order.saleKind;
    var now = new BigNumber(Math.round(Date.now() / 1000)).minus(secondsToBacktrack);
    basePrice = new BigNumber(basePrice);
    listingTime = new BigNumber(listingTime);
    expirationTime = new BigNumber(expirationTime);
    extra = new BigNumber(extra);
    var exactPrice = basePrice;
    if (saleKind === SaleKind.FixedPrice) {
        // Do nothing, price is correct
    }
    else if (saleKind === SaleKind.DutchAuction) {
        var diff = extra
            .times(now.minus(listingTime))
            .dividedBy(expirationTime.minus(listingTime));
        exactPrice =
            side == OrderSide.Sell
                ? /* Sell-side - start price: basePrice. End price: basePrice - extra. */
                    basePrice.minus(diff)
                : /* Buy-side - start price: basePrice. End price: basePrice + extra. */
                    basePrice.plus(diff);
    }
    // Add taker fee only for buyers
    if (side === OrderSide.Sell && !order.waitingForBestCounterOrder) {
        // Buyer fee increases sale price
        exactPrice = exactPrice.times(+takerRelayerFee / INVERSE_BASIS_POINT + 1);
    }
    return shouldRoundUp ? exactPrice.ceil() : exactPrice;
}
/**
 * Get the Wyvern representation of a fungible asset
 * @param schema The WyvernSchema needed to access this asset
 * @param asset The asset to trade
 * @param quantity The number of items to trade
 */
export function getWyvernAsset(schema, asset, quantity) {
    if (quantity === void 0) { quantity = new BigNumber(1); }
    var tokenId = asset.tokenId != null ? asset.tokenId.toString() : undefined;
    return schema.assetFromFields({
        ID: tokenId,
        Quantity: quantity.toString(),
        Address: asset.tokenAddress.toLowerCase(),
        Name: asset.name,
    });
}
/**
 * Get the Wyvern representation of a group of assets
 * Sort order is enforced here. Throws if there's a duplicate.
 * @param assets Assets to bundle
 * @param schemas The WyvernSchemas needed to access each asset, respectively
 * @param quantities The quantity of each asset to bundle, respectively
 */
export function getWyvernBundle(assets, schemas, quantities) {
    if (assets.length != quantities.length) {
        throw new Error("Bundle must have a quantity for every asset");
    }
    if (assets.length != schemas.length) {
        throw new Error("Bundle must have a schema for every asset");
    }
    var wyAssets = assets.map(function (asset, i) {
        return getWyvernAsset(schemas[i], asset, quantities[i]);
    });
    var sorters = [
        function (assetAndSchema) {
            return assetAndSchema.asset.address;
        },
        function (assetAndSchema) {
            return assetAndSchema.asset.id || 0;
        },
    ];
    var wyAssetsAndSchemas = wyAssets.map(function (asset, i) { return ({
        asset: asset,
        schema: schemas[i].name,
    }); });
    var uniqueAssets = _.uniqBy(wyAssetsAndSchemas, function (group) { return "".concat(sorters[0](group), "-").concat(sorters[1](group)); });
    if (uniqueAssets.length != wyAssetsAndSchemas.length) {
        throw new Error("Bundle can't contain duplicate assets");
    }
    var sortedWyAssetsAndSchemas = _.sortBy(wyAssetsAndSchemas, sorters);
    return {
        assets: sortedWyAssetsAndSchemas.map(function (group) { return group.asset; }),
        schemas: sortedWyAssetsAndSchemas.map(function (group) { return group.schema; }),
    };
}
/**
 * Get the non-prefixed hash for the order
 * (Fixes a Wyvern typescript issue and casing issue)
 * @param order order to hash
 */
export function getOrderHash(order) {
    var orderWithStringTypes = __assign(__assign({}, order), { maker: order.maker.toLowerCase(), taker: order.taker.toLowerCase(), feeRecipient: order.feeRecipient.toLowerCase(), side: order.side.toString(), saleKind: order.saleKind.toString(), howToCall: order.howToCall.toString(), feeMethod: order.feeMethod.toString() });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return WyvernProtocol.getOrderHashHex(orderWithStringTypes);
}
/**
 * Assign an order and a new matching order to their buy/sell sides
 * @param order Original order
 * @param matchingOrder The result of _makeMatchingOrder
 */
export function assignOrdersToSides(order, matchingOrder) {
    var isSellOrder = order.side == OrderSide.Sell;
    var buy;
    var sell;
    if (!isSellOrder) {
        buy = order;
        sell = __assign(__assign({}, matchingOrder), { v: buy.v, r: buy.r, s: buy.s });
    }
    else {
        sell = order;
        buy = __assign(__assign({}, matchingOrder), { v: sell.v, r: sell.r, s: sell.s });
    }
    return { buy: buy, sell: sell };
}
/**
 * Delay using setTimeout
 * @param ms milliseconds to wait
 */
export function delay(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res) { return setTimeout(res, ms); })];
        });
    });
}
/**
 * Validates that an address exists, isn't null, and is properly
 * formatted for Wyvern and OpenSea
 * @param address input address
 */
export function validateAndFormatWalletAddress(web3, address) {
    if (!address) {
        throw new Error("No wallet address found");
    }
    if (!web3.isAddress(address)) {
        throw new Error("Invalid wallet address");
    }
    if (address == NULL_ADDRESS) {
        throw new Error("Wallet cannot be the null address");
    }
    return address.toLowerCase();
}
/**
 * Notify developer when a pattern will be deprecated
 * @param msg message to log to console
 */
export function onDeprecated(msg) {
    console.warn("DEPRECATION NOTICE: ".concat(msg));
}
/**
 * Get special-case approval addresses for an erc721 contract
 * @param erc721Contract contract to check
 */
export function getNonCompliantApprovalAddress(erc721Contract, tokenId, _accountAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        // CRYPTOKITTIES check
                        promisifyCall(function (c) {
                            return erc721Contract.kittyIndexToApproved.call(tokenId, c);
                        }),
                        // Etherbots check
                        promisifyCall(function (c) {
                            return erc721Contract.partIndexToApproved.call(tokenId, c);
                        }),
                    ])];
                case 1:
                    results = _a.sent();
                    return [2 /*return*/, _.compact(results)[0]];
            }
        });
    });
}
export var isFeeWrapperFlow = function (order, network) {
    var feeWrapperAddress = getFeeWrapperAddress(network);
    var isCorrectFeeRecipient = order.side === OrderSide.Sell
        ? order.feeRecipient === feeWrapperAddress
        : true;
    return order.staticTarget === feeWrapperAddress && isCorrectFeeRecipient;
};
export var getFeeWrapperAddress = function (network) {
    return network === Network.Main
        ? FEE_WRAPPER_ADDRESS_MAINNET
        : FEE_WRAPPER_ADDRESS_RINKEBY;
};
//# sourceMappingURL=utils.js.map