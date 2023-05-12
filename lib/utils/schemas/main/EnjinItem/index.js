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
exports.EnjinItemSchema = void 0;
var ERC1155_1 = require("../../ERC1155");
var types_1 = require("../../types");
/* eslint-disable @typescript-eslint/no-explicit-any */
exports.EnjinItemSchema = __assign(__assign({}, ERC1155_1.ERC1155Schema), { version: 1, deploymentBlock: 0, name: "Enjin", description: "Items conforming to the Enjin implementation of the ERC1155 spec.", website: "https://enjincoin.io/", functions: __assign(__assign({}, ERC1155_1.ERC1155Schema.functions), { ownerOf: function (asset) { return ({
            type: types_1.AbiType.Function,
            name: "ownerOf",
            payable: false,
            constant: true,
            stateMutability: types_1.StateMutability.View,
            target: asset.address,
            inputs: [
                {
                    kind: types_1.FunctionInputKind.Asset,
                    name: "_id",
                    type: "uint256",
                    value: asset.id,
                },
            ],
            outputs: [
                { kind: types_1.FunctionOutputKind.Owner, name: "owner", type: "address" },
            ],
        }); }, 
        // Parameters are flipped from 1155
        countOf: function (asset) { return ({
            type: types_1.AbiType.Function,
            name: "balanceOf",
            payable: false,
            constant: true,
            stateMutability: types_1.StateMutability.View,
            target: asset.address,
            inputs: [
                {
                    kind: types_1.FunctionInputKind.Asset,
                    name: "_id",
                    type: "uint256",
                    value: asset.id,
                },
                { kind: types_1.FunctionInputKind.Owner, name: "_owner", type: "address" },
            ],
            outputs: [
                { kind: types_1.FunctionOutputKind.Count, name: "balance", type: "uint" },
            ],
            assetFromOutputs: function (outputs) { return outputs.balance; },
        }); }, assetsOfOwnerByIndex: [] }) });
/* eslint-enable @typescript-eslint/no-explicit-any */
//# sourceMappingURL=index.js.map