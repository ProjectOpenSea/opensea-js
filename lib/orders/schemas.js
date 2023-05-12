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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOrder = void 0;
var ajv_1 = __importDefault(require("ajv"));
var schemas_1 = require("../schemas");
var ajv = new ajv_1.default();
var feeSchema = {
    type: "object",
    properties: {
        account: schemas_1.accountSchema,
        basisPoints: { type: "string" },
    },
    required: ["account", "basisPoints"],
};
var orderSchema = {
    type: "object",
    properties: {
        createdDate: { type: "string" },
        closingDate: { type: "string", nullable: true },
        listingTime: { type: "number" },
        expirationTime: { type: "number" },
        orderHash: { type: "string", nullable: true },
        maker: schemas_1.accountSchema,
        taker: __assign(__assign({}, schemas_1.accountSchema), { nullable: true }),
        protocolData: { type: "object" },
        protocolAddress: { type: "string" },
        currentPrice: { type: "string" },
        makerFees: { type: "array", items: feeSchema },
        takerFees: { type: "array", items: feeSchema },
        side: { type: "string" },
        orderType: { type: "string" },
        cancelled: { type: "boolean" },
        finalized: { type: "boolean" },
        markedInvalid: { type: "boolean" },
        clientSignature: { type: "string", nullable: true },
        makerAssetBundle: schemas_1.assetBundleSchema,
        takerAssetBundle: schemas_1.assetBundleSchema,
    },
    required: [
        "createdDate",
        "closingDate",
        "listingTime",
        "expirationTime",
        "orderHash",
        "maker",
        "taker",
        "protocolData",
        "protocolAddress",
        "currentPrice",
        "makerFees",
        "takerFees",
        "side",
        "orderType",
        "cancelled",
        "finalized",
        "markedInvalid",
        "makerAssetBundle",
        "takerAssetBundle",
    ],
};
// TODO: Remove cast once all schemas are written
exports.validateOrder = ajv.compile(orderSchema);
//# sourceMappingURL=schemas.js.map