"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeOrder = exports.serializeOrdersQueryOptions = exports.getFulfillOfferPayload = exports.getFulfillListingPayload = exports.getFulfillmentDataPath = exports.getBuildCollectionOfferPayload = exports.getPostCollectionOfferPayload = exports.getPostCollectionOfferPath = exports.getBuildOfferPath = exports.getCollectionPath = exports.getOrdersAPIPath = exports.DEFAULT_SEAPORT_CONTRACT_ADDRESS = void 0;
var constants_1 = require("@opensea/seaport-js/lib/constants");
var types_1 = require("../types");
var utils_1 = require("../utils");
var NETWORK_TO_CHAIN = (_a = {},
    _a[types_1.Network.Main] = "ethereum",
    _a[types_1.Network.Rinkeby] = "rinkeby",
    _a[types_1.Network.Goerli] = "goerli",
    _a);
exports.DEFAULT_SEAPORT_CONTRACT_ADDRESS = constants_1.CROSS_CHAIN_SEAPORT_V1_5_ADDRESS;
var getOrdersAPIPath = function (network, protocol, side) {
    var chain = NETWORK_TO_CHAIN[network];
    var sidePath = side === "ask" ? "listings" : "offers";
    return "/v2/orders/".concat(chain, "/").concat(protocol, "/").concat(sidePath);
};
exports.getOrdersAPIPath = getOrdersAPIPath;
var getCollectionPath = function (slug) {
    return "/api/v1/collection/".concat(slug);
};
exports.getCollectionPath = getCollectionPath;
var getBuildOfferPath = function () {
    return "/v2/offers/build";
};
exports.getBuildOfferPath = getBuildOfferPath;
var getPostCollectionOfferPath = function () {
    return "/v2/offers";
};
exports.getPostCollectionOfferPath = getPostCollectionOfferPath;
var getPostCollectionOfferPayload = function (collectionSlug, protocol_data) {
    return {
        criteria: {
            collection: { slug: collectionSlug },
        },
        protocol_data: protocol_data,
        protocol_address: exports.DEFAULT_SEAPORT_CONTRACT_ADDRESS,
    };
};
exports.getPostCollectionOfferPayload = getPostCollectionOfferPayload;
var getBuildCollectionOfferPayload = function (offererAddress, quantity, collectionSlug) {
    return {
        offerer: offererAddress,
        quantity: quantity,
        criteria: {
            collection: {
                slug: collectionSlug,
            },
        },
        protocol_address: exports.DEFAULT_SEAPORT_CONTRACT_ADDRESS,
    };
};
exports.getBuildCollectionOfferPayload = getBuildCollectionOfferPayload;
var getFulfillmentDataPath = function (side) {
    var sidePath = side === "ask" ? "listings" : "offers";
    return "/v2/".concat(sidePath, "/fulfillment_data");
};
exports.getFulfillmentDataPath = getFulfillmentDataPath;
var getFulfillListingPayload = function (fulfillerAddress, order_hash, protocolAddress, network) {
    var chain = NETWORK_TO_CHAIN[network];
    return {
        listing: {
            hash: order_hash,
            chain: chain,
            protocol_address: protocolAddress,
        },
        fulfiller: {
            address: fulfillerAddress,
        },
    };
};
exports.getFulfillListingPayload = getFulfillListingPayload;
var getFulfillOfferPayload = function (fulfillerAddress, order_hash, protocolAddress, network) {
    var chain = NETWORK_TO_CHAIN[network];
    return {
        offer: {
            hash: order_hash,
            chain: chain,
            protocol_address: protocolAddress,
        },
        fulfiller: {
            address: fulfillerAddress,
        },
    };
};
exports.getFulfillOfferPayload = getFulfillOfferPayload;
var serializeOrdersQueryOptions = function (options) {
    var _a;
    return {
        limit: options.limit,
        cursor: options.cursor,
        payment_token_address: options.paymentTokenAddress,
        maker: options.maker,
        taker: options.taker,
        owner: options.owner,
        bundled: options.bundled,
        include_bundled: options.includeBundled,
        listed_after: options.listedAfter,
        listed_before: options.listedBefore,
        token_ids: (_a = options.tokenIds) !== null && _a !== void 0 ? _a : [options.tokenId],
        asset_contract_address: options.assetContractAddress,
        order_by: options.orderBy,
        order_direction: options.orderDirection,
        only_english: options.onlyEnglish,
    };
};
exports.serializeOrdersQueryOptions = serializeOrdersQueryOptions;
var deserializeOrder = function (order) {
    return {
        createdDate: order.created_date,
        closingDate: order.closing_date,
        listingTime: order.listing_time,
        expirationTime: order.expiration_time,
        orderHash: order.order_hash,
        maker: (0, utils_1.accountFromJSON)(order.maker),
        taker: order.taker ? (0, utils_1.accountFromJSON)(order.taker) : null,
        protocolData: order.protocol_data,
        protocolAddress: order.protocol_address,
        currentPrice: order.current_price,
        makerFees: order.maker_fees.map(function (_a) {
            var account = _a.account, basis_points = _a.basis_points;
            return ({
                account: (0, utils_1.accountFromJSON)(account),
                basisPoints: basis_points,
            });
        }),
        takerFees: order.taker_fees.map(function (_a) {
            var account = _a.account, basis_points = _a.basis_points;
            return ({
                account: (0, utils_1.accountFromJSON)(account),
                basisPoints: basis_points,
            });
        }),
        side: order.side,
        orderType: order.order_type,
        cancelled: order.cancelled,
        finalized: order.finalized,
        markedInvalid: order.marked_invalid,
        clientSignature: order.client_signature,
        makerAssetBundle: (0, utils_1.assetBundleFromJSON)(order.maker_asset_bundle),
        takerAssetBundle: (0, utils_1.assetBundleFromJSON)(order.taker_asset_bundle),
    };
};
exports.deserializeOrder = deserializeOrder;
//# sourceMappingURL=utils.js.map