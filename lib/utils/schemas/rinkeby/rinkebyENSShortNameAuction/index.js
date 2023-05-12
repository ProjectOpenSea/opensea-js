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
exports.rinkebyENSShortNameAuctionSchema = void 0;
var utils_1 = require("ethers/lib/utils");
var ens_1 = require("../../ens");
var types_1 = require("../../types");
var RINKEBY_ENS_SHORT_NAME_AUCTION_ADDRESS = "0x76b6481a334783be36f2fc35b8f0b9bc7835d57b";
exports.rinkebyENSShortNameAuctionSchema = __assign(__assign({}, ens_1.ENSNameBaseSchema), { version: 0, deploymentBlock: 4791629, name: "ENSShortNameAuction", description: "ERC721 ENS short (3-6 character) names sold via auction.", thumbnail: "", website: "https://ens.domains/", formatter: function (_a) {
        var name = _a.name;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, {
                        title: "ENS Short Name: " + name,
                        description: "",
                        url: "",
                        thumbnail: "",
                        properties: [],
                    }];
            });
        });
    }, functions: {
        transfer: function (_a) {
            var name = _a.name;
            return ({
                type: types_1.AbiType.Function,
                name: "register",
                payable: false,
                constant: false,
                stateMutability: types_1.StateMutability.Nonpayable,
                target: RINKEBY_ENS_SHORT_NAME_AUCTION_ADDRESS,
                inputs: [
                    {
                        kind: types_1.FunctionInputKind.Data,
                        name: "name",
                        type: "string",
                        value: name.split(".")[0],
                    },
                    { kind: types_1.FunctionInputKind.Replaceable, name: "owner", type: "address" },
                ],
                outputs: [],
            });
        },
        assetsOfOwnerByIndex: [],
    }, events: {
        transfer: [
            {
                type: types_1.AbiType.Event,
                name: "NameRegistered",
                target: RINKEBY_ENS_SHORT_NAME_AUCTION_ADDRESS,
                anonymous: false,
                inputs: [
                    {
                        kind: types_1.EventInputKind.Asset,
                        indexed: false,
                        name: "name",
                        type: "string",
                    },
                    {
                        kind: types_1.EventInputKind.Destination,
                        indexed: false,
                        name: "owner",
                        type: "address",
                    },
                ],
                assetFromInputs: function (inputs) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, ({
                                name: inputs.name,
                                nodeHash: (0, ens_1.nodehash)(inputs.name),
                                nameHash: (0, utils_1.namehash)(inputs.name),
                            })];
                    });
                }); },
            },
        ],
    } });
//# sourceMappingURL=index.js.map