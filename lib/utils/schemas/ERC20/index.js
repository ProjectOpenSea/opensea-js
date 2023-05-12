"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERC20Schema = void 0;
var types_1 = require("../types");
exports.ERC20Schema = {
    version: 1,
    deploymentBlock: 0,
    name: "ERC20",
    description: "Items conforming to the ERC20 spec, using transferFrom.",
    thumbnail: "https://opensea.io/static/images/opensea-icon.png",
    website: "https://github.com/ethereum/eips/issues/20",
    fields: [
        { name: "Address", type: "address", description: "Asset Contract Address" },
        { name: "Quantity", type: "uint256", description: "Quantity to transfer" },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assetFromFields: function (fields) { return ({
        address: fields.Address,
        quantity: fields.Quantity,
    }); },
    assetToFields: function (asset) { return ({
        Address: asset.address,
        Quantity: asset.quantity,
    }); },
    formatter: function (asset) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, {
                    title: "ERC20 Asset at " + asset.address,
                    description: "Trading " + asset.quantity.toString(),
                    url: "",
                    thumbnail: "",
                    properties: [],
                }];
        });
    }); },
    functions: {
        transfer: function (asset) { return ({
            type: types_1.AbiType.Function,
            name: "transferFrom",
            payable: false,
            constant: false,
            stateMutability: types_1.StateMutability.Nonpayable,
            target: asset.address,
            inputs: [
                { kind: types_1.FunctionInputKind.Owner, name: "_from", type: "address" },
                { kind: types_1.FunctionInputKind.Replaceable, name: "_to", type: "address" },
                {
                    kind: types_1.FunctionInputKind.Count,
                    name: "_value",
                    type: "uint256",
                    value: asset.quantity,
                },
            ],
            outputs: [],
        }); },
        countOf: function (asset) { return ({
            type: types_1.AbiType.Function,
            name: "balanceOf",
            payable: false,
            constant: true,
            stateMutability: types_1.StateMutability.View,
            target: asset.address,
            inputs: [
                { kind: types_1.FunctionInputKind.Owner, name: "_owner", type: "address" },
            ],
            outputs: [
                { kind: types_1.FunctionOutputKind.Count, name: "balance", type: "uint" },
            ],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            assetFromOutputs: function (outputs) { return outputs.balance; },
        }); },
        assetsOfOwnerByIndex: [],
    },
    events: {
        transfer: [],
    },
    hash: function (asset) { return asset.address; },
};
//# sourceMappingURL=index.js.map