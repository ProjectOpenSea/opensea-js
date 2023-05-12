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
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSeaAPI = void 0;
require("isomorphic-unfetch");
var QueryString = __importStar(require("query-string"));
var constants_1 = require("./constants");
var utils_1 = require("./orders/utils");
var types_1 = require("./types");
var utils_2 = require("./utils/utils");
var OpenSeaAPI = /** @class */ (function () {
    /**
     * Create an instance of the OpenSea API
     * @param config OpenSeaAPIConfig for setting up the API, including an optional API key, network name, and base URL
     * @param logger Optional function for logging debug strings before and after requests are made
     */
    function OpenSeaAPI(config, logger) {
        var _a;
        /**
         * Page size to use for fetching orders
         */
        this.pageSize = 20;
        this.retryDelay = 3000;
        this.apiKey = config.apiKey;
        this.networkName = (_a = config.networkName) !== null && _a !== void 0 ? _a : types_1.Network.Main;
        switch (config.networkName) {
            case types_1.Network.Goerli:
                this.apiBaseUrl = config.apiBaseUrl || constants_1.API_BASE_TESTNET;
                break;
            case types_1.Network.Main:
            default:
                this.apiBaseUrl = config.apiBaseUrl || constants_1.API_BASE_MAINNET;
                break;
        }
        // Debugging: default to nothing
        this.logger = logger || (function (arg) { return arg; });
    }
    /**
     * Gets an order from API based on query options. Throws when no order is found.
     */
    OpenSeaAPI.prototype.getOrder = function (_a) {
        var side = _a.side, _b = _a.protocol, protocol = _b === void 0 ? "seaport" : _b, _c = _a.orderDirection, orderDirection = _c === void 0 ? "desc" : _c, _d = _a.orderBy, orderBy = _d === void 0 ? "created_date" : _d, restOptions = __rest(_a, ["side", "protocol", "orderDirection", "orderBy"]);
        return __awaiter(this, void 0, void 0, function () {
            var orders;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.get((0, utils_1.getOrdersAPIPath)(this.networkName, protocol, side), (0, utils_1.serializeOrdersQueryOptions)(__assign({ limit: 1, orderBy: orderBy, orderDirection: orderDirection }, restOptions)))];
                    case 1:
                        orders = (_e.sent()).orders;
                        if (orders.length === 0) {
                            throw new Error("Not found: no matching order found");
                        }
                        return [2 /*return*/, (0, utils_1.deserializeOrder)(orders[0])];
                }
            });
        });
    };
    /**
     * Gets a list of orders from API based on query options and returns orders
     * with next and previous cursors.
     */
    OpenSeaAPI.prototype.getOrders = function (_a) {
        var side = _a.side, _b = _a.protocol, protocol = _b === void 0 ? "seaport" : _b, _c = _a.orderDirection, orderDirection = _c === void 0 ? "desc" : _c, _d = _a.orderBy, orderBy = _d === void 0 ? "created_date" : _d, restOptions = __rest(_a, ["side", "protocol", "orderDirection", "orderBy"]);
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.get((0, utils_1.getOrdersAPIPath)(this.networkName, protocol, side), (0, utils_1.serializeOrdersQueryOptions)(__assign({ limit: this.pageSize, orderBy: orderBy, orderDirection: orderDirection }, restOptions)))];
                    case 1:
                        response = _e.sent();
                        return [2 /*return*/, __assign(__assign({}, response), { orders: response.orders.map(utils_1.deserializeOrder) })];
                }
            });
        });
    };
    /**
     * Generate the data needed to fulfill a listing or an offer
     */
    OpenSeaAPI.prototype.generateFulfillmentData = function (fulfillerAddress, orderHash, protocolAddress, side) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = null;
                        if (side === "ask") {
                            payload = (0, utils_1.getFulfillListingPayload)(fulfillerAddress, orderHash, protocolAddress, this.networkName);
                        }
                        else {
                            payload = (0, utils_1.getFulfillOfferPayload)(fulfillerAddress, orderHash, protocolAddress, this.networkName);
                        }
                        return [4 /*yield*/, this.post((0, utils_1.getFulfillmentDataPath)(side), payload)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    /**
     * Send an order to be posted. Throws when the order is invalid.
     */
    OpenSeaAPI.prototype.postOrder = function (order, apiOptions, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.retries, retries = _c === void 0 ? 2 : _c;
        return __awaiter(this, void 0, void 0, function () {
            var response, _d, protocol, side, protocolAddress, error_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _d = apiOptions.protocol, protocol = _d === void 0 ? "seaport" : _d, side = apiOptions.side, protocolAddress = apiOptions.protocolAddress;
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 5]);
                        return [4 /*yield*/, this.post((0, utils_1.getOrdersAPIPath)(this.networkName, protocol, side), __assign(__assign({}, order), { protocol_address: protocolAddress }))];
                    case 2:
                        response = _e.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _e.sent();
                        _throwOrContinue(error_1, retries);
                        return [4 /*yield*/, (0, utils_2.delay)(this.retryDelay)];
                    case 4:
                        _e.sent();
                        return [2 /*return*/, this.postOrder(order, apiOptions, { retries: retries - 1 })];
                    case 5: return [2 /*return*/, (0, utils_1.deserializeOrder)(response.order)];
                }
            });
        });
    };
    /**
     * Build an offer
     */
    OpenSeaAPI.prototype.buildOffer = function (offererAddress, quantity, collectionSlug) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = (0, utils_1.getBuildCollectionOfferPayload)(offererAddress, quantity, collectionSlug);
                        return [4 /*yield*/, this.post((0, utils_1.getBuildOfferPath)(), payload)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    /**
     * Post collection offer
     */
    OpenSeaAPI.prototype.postCollectionOffer = function (order, slug, retries) {
        if (retries === void 0) { retries = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var payload, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = (0, utils_1.getPostCollectionOfferPayload)(slug, order);
                        console.log("Post Order Payload");
                        console.log(JSON.stringify(payload, null, 4));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 5]);
                        return [4 /*yield*/, this.post((0, utils_1.getPostCollectionOfferPath)(), payload)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_2 = _a.sent();
                        _throwOrContinue(error_2, retries);
                        return [4 /*yield*/, (0, utils_2.delay)(1000)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, this.postCollectionOffer(order, slug, retries - 1)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a whitelist entry for an asset to prevent others from buying.
     * Buyers will have to have verified at least one of the emails
     * on an asset in order to buy.
     * This will throw a 403 if the given API key isn't allowed to create whitelist entries for this contract or asset.
     * @param tokenAddress Address of the asset's contract
     * @param tokenId The asset's token ID
     * @param email The email allowed to buy.
     */
    OpenSeaAPI.prototype.postAssetWhitelist = function (tokenAddress, tokenId, email) {
        return __awaiter(this, void 0, void 0, function () {
            var json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.post("".concat(constants_1.API_PATH, "/asset/").concat(tokenAddress, "/").concat(tokenId, "/whitelist/"), {
                            email: email,
                        })];
                    case 1:
                        json = _a.sent();
                        return [2 /*return*/, !!json.success];
                }
            });
        });
    };
    /**
     * Fetch an asset from the API, throwing if none is found
     * @param tokenAddress Address of the asset's contract
     * @param tokenId The asset's token ID, or null if ERC-20
     * @param retries Number of times to retry if the service is unavailable for any reason
     */
    OpenSeaAPI.prototype.getAsset = function (_a, retries) {
        var tokenAddress = _a.tokenAddress, tokenId = _a.tokenId;
        if (retries === void 0) { retries = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var json, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, this.get("".concat(constants_1.API_PATH, "/asset/").concat(tokenAddress, "/").concat(tokenId || 0, "/"))];
                    case 1:
                        json = _b.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        error_3 = _b.sent();
                        _throwOrContinue(error_3, retries);
                        return [4 /*yield*/, (0, utils_2.delay)(1000)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, this.getAsset({ tokenAddress: tokenAddress, tokenId: tokenId }, retries - 1)];
                    case 4: return [2 /*return*/, (0, utils_2.assetFromJSON)(json)];
                }
            });
        });
    };
    /**
     * Fetch list of assets from the API, returning the page of assets and the count of total assets
     * @param query Query to use for getting orders. A subset of parameters on the `OpenSeaAssetJSON` type is supported
     */
    OpenSeaAPI.prototype.getAssets = function (query) {
        if (query === void 0) { query = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("".concat(constants_1.API_PATH, "/assets/"), __assign({ limit: this.pageSize }, query))];
                    case 1:
                        json = _a.sent();
                        return [2 /*return*/, {
                                assets: json.assets.map(function (j) { return (0, utils_2.assetFromJSON)(j); }),
                                next: json.next,
                                previous: json.previous,
                                estimatedCount: json.estimated_count,
                            }];
                }
            });
        });
    };
    /**
     * Fetch a collection through the API
     */
    OpenSeaAPI.prototype.getCollection = function (slug) {
        return __awaiter(this, void 0, void 0, function () {
            var path, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = (0, utils_1.getCollectionPath)(slug);
                        return [4 /*yield*/, this.get(path)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, (0, utils_2.collectionFromJSON)(response.collection)];
                }
            });
        });
    };
    /**
     * Fetch list of fungible tokens from the API matching parameters
     * @param query Query to use for getting orders. A subset of parameters on the `OpenSeaAssetJSON` type is supported
     * @param page Page number, defaults to 1. Can be overridden by
     * `limit` and `offset` attributes from OpenSeaFungibleTokenQuery
     * @param retries Number of times to retry if the service is unavailable for any reason
     */
    OpenSeaAPI.prototype.getPaymentTokens = function (query, page, retries) {
        if (query === void 0) { query = {}; }
        if (page === void 0) { page = 1; }
        if (retries === void 0) { retries = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var json, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, this.get("".concat(constants_1.API_PATH, "/tokens/"), __assign(__assign({}, query), { limit: this.pageSize, offset: (page - 1) * this.pageSize }))];
                    case 1:
                        json = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        error_4 = _a.sent();
                        _throwOrContinue(error_4, retries);
                        return [4 /*yield*/, (0, utils_2.delay)(1000)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.getPaymentTokens(query, page, retries - 1)];
                    case 4: return [2 /*return*/, {
                            tokens: json.map(function (t) { return (0, utils_2.tokenFromJSON)(t); }),
                        }];
                }
            });
        });
    };
    /**
     * Fetch a bundle from the API, return null if it isn't found
     * @param slug The bundle's identifier
     */
    OpenSeaAPI.prototype.getBundle = function (_a) {
        var slug = _a.slug;
        return __awaiter(this, void 0, void 0, function () {
            var json;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.get("".concat(constants_1.API_PATH, "/bundle/").concat(slug, "/"))];
                    case 1:
                        json = _b.sent();
                        return [2 /*return*/, json ? (0, utils_2.assetBundleFromJSON)(json) : null];
                }
            });
        });
    };
    /**
     * Fetch list of bundles from the API, returning the page of bundles and the count of total bundles
     * @param query Query to use for getting orders. A subset of parameters on the `OpenSeaAssetBundleJSON` type is supported
     * @param page Page number, defaults to 1. Can be overridden by
     * `limit` and `offset` attributes from OpenSeaAssetBundleQuery
     */
    OpenSeaAPI.prototype.getBundles = function (query, page) {
        if (query === void 0) { query = {}; }
        if (page === void 0) { page = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("".concat(constants_1.API_PATH, "/bundles/"), __assign(__assign({}, query), { limit: this.pageSize, offset: (page - 1) * this.pageSize }))];
                    case 1:
                        json = _a.sent();
                        return [2 /*return*/, {
                                bundles: json.bundles.map(function (j) { return (0, utils_2.assetBundleFromJSON)(j); }),
                                estimatedCount: json.estimated_count,
                            }];
                }
            });
        });
    };
    /**
     * Get JSON data from API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param query Data to send. Will be stringified using QueryString
     */
    OpenSeaAPI.prototype.get = function (apiPath, query) {
        if (query === void 0) { query = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var qs, url, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        qs = QueryString.stringify(query);
                        url = "".concat(apiPath, "?").concat(qs);
                        return [4 /*yield*/, this._fetch(url)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        });
    };
    /**
     * POST JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send. Will be JSON.stringified
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    OpenSeaAPI.prototype.post = function (apiPath, body, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var fetchOpts, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fetchOpts = __assign({ method: "POST", body: body ? JSON.stringify(body) : undefined, headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json",
                            } }, opts);
                        return [4 /*yield*/, this._fetch(apiPath, fetchOpts)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        });
    };
    /**
     * PUT JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    OpenSeaAPI.prototype.put = function (apiPath, body, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post(apiPath, body, __assign({ method: "PUT" }, opts))];
            });
        });
    };
    /**
     * Get from an API Endpoint, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param opts RequestInit opts, similar to Fetch API
     */
    OpenSeaAPI.prototype._fetch = function (apiPath, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var apiBase, apiKey, finalUrl, finalOpts;
            var _this = this;
            return __generator(this, function (_a) {
                apiBase = this.apiBaseUrl;
                apiKey = this.apiKey;
                finalUrl = apiBase + apiPath;
                finalOpts = __assign(__assign({}, opts), { headers: __assign(__assign({}, (apiKey ? { "X-API-KEY": apiKey } : {})), (opts.headers || {})) });
                this.logger("Sending request: ".concat(finalUrl, " ").concat(JSON.stringify(finalOpts).substr(0, 100), "..."));
                return [2 /*return*/, fetch(finalUrl, finalOpts).then(function (res) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, this._handleApiResponse(res)];
                    }); }); })];
            });
        });
    };
    OpenSeaAPI.prototype._handleApiResponse = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var result, errorMessage, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (response.ok) {
                            this.logger("Got success: ".concat(response.status));
                            return [2 /*return*/, response];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, response.text()];
                    case 2:
                        result = _b.sent();
                        result = JSON.parse(result);
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        this.logger("Got error ".concat(response.status, ": ").concat(JSON.stringify(result)));
                        switch (response.status) {
                            case 400:
                                errorMessage =
                                    result && result.errors
                                        ? result.errors.join(", ")
                                        : "Invalid request: ".concat(JSON.stringify(result));
                                break;
                            case 401:
                            case 403:
                                errorMessage = "Unauthorized. Full message was '".concat(JSON.stringify(result), "'");
                                break;
                            case 404:
                                errorMessage = "Not found. Full message was '".concat(JSON.stringify(result), "'");
                                break;
                            case 500:
                                errorMessage = "Internal server error. OpenSea has been alerted, but if the problem persists please contact us via Discord: https://discord.gg/opensea - full message was ".concat(JSON.stringify(result));
                                break;
                            case 503:
                                errorMessage = "Service unavailable. Please try again in a few minutes. If the problem persists please contact us via Discord: https://discord.gg/opensea - full message was ".concat(JSON.stringify(result));
                                break;
                            default:
                                errorMessage = "Message: ".concat(JSON.stringify(result));
                                break;
                        }
                        throw new Error("API Error ".concat(response.status, ": ").concat(errorMessage));
                }
            });
        });
    };
    return OpenSeaAPI;
}());
exports.OpenSeaAPI = OpenSeaAPI;
function _throwOrContinue(error, retries) {
    var isUnavailable = error instanceof Error &&
        !!error.message &&
        (error.message.includes("503") || error.message.includes("429"));
    if (retries <= 0 || !isUnavailable) {
        throw error;
    }
}
//# sourceMappingURL=api.js.map