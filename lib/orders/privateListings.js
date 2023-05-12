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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrivateListingFulfillments = exports.constructPrivateListingCounterOrder = exports.getPrivateListingConsiderations = void 0;
var item_1 = require("@opensea/seaport-js/lib/utils/item");
var order_1 = require("@opensea/seaport-js/lib/utils/order");
var ethers_1 = require("ethers");
var getPrivateListingConsiderations = function (offer, privateSaleRecipient) {
    return offer.map(function (item) {
        return __assign(__assign({}, item), { recipient: privateSaleRecipient });
    });
};
exports.getPrivateListingConsiderations = getPrivateListingConsiderations;
var constructPrivateListingCounterOrder = function (order, privateSaleRecipient) {
    // Counter order offers up all the items in the private listing consideration
    // besides the items that are going to the private listing recipient
    var paymentItems = order.parameters.consideration.filter(function (item) {
        return item.recipient.toLowerCase() !== privateSaleRecipient.toLowerCase();
    });
    if (!paymentItems.every(function (item) { return (0, item_1.isCurrencyItem)(item); })) {
        throw new Error("The consideration for the private listing did not contain only currency items");
    }
    if (!paymentItems.every(function (item) { return item.itemType === paymentItems[0].itemType; })) {
        throw new Error("Not all currency items were the same for private order");
    }
    var _a = paymentItems.reduce(function (_a, item) {
        var aggregatedStartAmount = _a.aggregatedStartAmount, aggregatedEndAmount = _a.aggregatedEndAmount;
        return ({
            aggregatedStartAmount: aggregatedStartAmount.add(item.startAmount),
            aggregatedEndAmount: aggregatedEndAmount.add(item.endAmount),
        });
    }, {
        aggregatedStartAmount: ethers_1.BigNumber.from(0),
        aggregatedEndAmount: ethers_1.BigNumber.from(0),
    }), aggregatedStartAmount = _a.aggregatedStartAmount, aggregatedEndAmount = _a.aggregatedEndAmount;
    var counterOrder = {
        parameters: __assign(__assign({}, order.parameters), { offerer: privateSaleRecipient, offer: [
                {
                    itemType: paymentItems[0].itemType,
                    token: paymentItems[0].token,
                    identifierOrCriteria: paymentItems[0].identifierOrCriteria,
                    startAmount: aggregatedStartAmount.toString(),
                    endAmount: aggregatedEndAmount.toString(),
                },
            ], 
            // The consideration here is empty as the original private listing order supplies
            // the taker address to receive the desired items.
            consideration: [], salt: (0, order_1.generateRandomSalt)(), totalOriginalConsiderationItems: 0 }),
        signature: "0x",
    };
    return counterOrder;
};
exports.constructPrivateListingCounterOrder = constructPrivateListingCounterOrder;
var getPrivateListingFulfillments = function (privateListingOrder) {
    var nftRelatedFulfillments = [];
    // For the original order, we need to match everything offered with every consideration item
    // on the original order that's set to go to the private listing recipient
    privateListingOrder.parameters.offer.forEach(function (offerItem, offerIndex) {
        var considerationIndex = privateListingOrder.parameters.consideration.findIndex(function (considerationItem) {
            return considerationItem.itemType === offerItem.itemType &&
                considerationItem.token === offerItem.token &&
                considerationItem.identifierOrCriteria ===
                    offerItem.identifierOrCriteria;
        });
        if (considerationIndex === -1) {
            throw new Error("Could not find matching offer item in the consideration for private listing");
        }
        nftRelatedFulfillments.push({
            offerComponents: [
                {
                    orderIndex: 0,
                    itemIndex: offerIndex,
                },
            ],
            considerationComponents: [
                {
                    orderIndex: 0,
                    itemIndex: considerationIndex,
                },
            ],
        });
    });
    var currencyRelatedFulfillments = [];
    // For the original order, we need to match everything offered with every consideration item
    // on the original order that's set to go to the private listing recipient
    privateListingOrder.parameters.consideration.forEach(function (considerationItem, considerationIndex) {
        if (!(0, item_1.isCurrencyItem)(considerationItem)) {
            return;
        }
        // We always match the offer item (index 0) of the counter order (index 1)
        // with all of the payment items on the private listing
        currencyRelatedFulfillments.push({
            offerComponents: [
                {
                    orderIndex: 1,
                    itemIndex: 0,
                },
            ],
            considerationComponents: [
                {
                    orderIndex: 0,
                    itemIndex: considerationIndex,
                },
            ],
        });
    });
    return __spreadArray(__spreadArray([], nftRelatedFulfillments, true), currencyRelatedFulfillments, true);
};
exports.getPrivateListingFulfillments = getPrivateListingFulfillments;
//# sourceMappingURL=privateListings.js.map