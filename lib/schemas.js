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
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetBundleSchema = exports.accountSchema = void 0;
var userSchema = {
    type: "object",
    properties: {
        username: { type: "string", nullable: true },
    },
};
exports.accountSchema = {
    type: "object",
    properties: {
        address: { type: "string" },
        config: { type: "string" },
        profileImgUrl: { type: "string" },
        user: __assign(__assign({}, userSchema), { nullable: true }),
    },
    required: ["address", "config", "profileImgUrl", "user"],
};
exports.assetBundleSchema = {
    type: "object",
    properties: {
        maker: __assign(__assign({}, exports.accountSchema), { nullable: true }),
        assets: { type: "array", items: { type: "object" } },
        name: { type: "string", nullable: true },
        slug: { type: "string", nullable: true },
        permalink: { type: "string", nullable: true },
        sellOrders: {
            type: "array",
            items: { type: "object" },
            nullable: true,
        },
        assetContract: { type: "object", nullable: true },
        description: { type: "string", nullable: true },
        externalLink: { type: "string", nullable: true },
    },
    required: ["maker", "assets", "name", "slug", "permalink", "sellOrders"],
};
//# sourceMappingURL=schemas.js.map