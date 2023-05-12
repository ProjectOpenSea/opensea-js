"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.encodeProxyCall = exports.encodeTransferCall = exports.encodeAtomicizedTransfer = exports.encodeDefaultCall = exports.encodeCall = void 0;
var bignumber_js_1 = require("bignumber.js");
var ethABI = __importStar(require("ethereumjs-abi"));
var wyvern_js_1 = require("wyvern-js");
var index_1 = require("./goerli/index");
var index_2 = require("./main/index");
var index_3 = require("./rinkeby/index");
var Proxy_1 = require("../../abi/Proxy");
var types_1 = require("../../types");
/* eslint-enable @typescript-eslint/no-explicit-any */
var encodeCall = function (abi, parameters) {
    var inputTypes = abi.inputs.map(function (i) { return i.type; });
    return ("0x" +
        Buffer.concat([
            ethABI.methodID(abi.name, inputTypes),
            ethABI.rawEncode(inputTypes, parameters),
        ]).toString("hex"));
};
exports.encodeCall = encodeCall;
var encodeDefaultCall = function (abi, address) {
    var parameters = abi.inputs.map(function (input) {
        switch (input.kind) {
            case types_1.FunctionInputKind.Replaceable:
                return wyvern_js_1.WyvernProtocol.generateDefaultValue(input.type);
            case types_1.FunctionInputKind.Owner:
                return address;
            case types_1.FunctionInputKind.Asset:
            default:
                return input.value;
        }
    });
    return (0, exports.encodeCall)(abi, parameters);
};
exports.encodeDefaultCall = encodeDefaultCall;
/**
 * Encode the atomicized transfer of many assets
 * @param schema Wyvern Schema for the assets
 * @param assets List of assets to transfer
 * @param from Current address owning the assets
 * @param to Destination address
 * @param atomicizer Wyvern Atomicizer instance
 */
function encodeAtomicizedTransfer(schemas, assets, from, to, wyvernProtocol, networkName) {
    var atomicizer = wyvernProtocol.wyvernAtomicizer;
    var transactions = assets.map(function (asset, i) {
        var schema = schemas[i];
        var transfer = schema.functions.transfer(asset);
        var calldata = encodeTransferCall(transfer, from, to);
        return {
            calldata: calldata,
            address: transfer.target,
            value: new bignumber_js_1.BigNumber(0),
        };
    });
    var atomicizedCalldata = atomicizer
        .atomicize(transactions.map(function (t) { return t.address; }), transactions.map(function (t) { return t.value; }), transactions.map(function (t) { return new bignumber_js_1.BigNumber((t.calldata.length - 2) / 2); }), // subtract 2 for '0x', divide by 2 for hex
    transactions
        .map(function (t) { return t.calldata; })
        .reduce(function (x, current) { return x + current.slice(2); }, "0x") // cut off the '0x'
    )
        .getABIEncodedTransactionData();
    return {
        calldata: atomicizedCalldata,
        target: wyvern_js_1.WyvernProtocol.getAtomicizerContractAddress(networkName),
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
                    throw new Error("Unsupported function input kind: ".concat(input.kind));
                }
                return input.value;
        }
    });
    return (0, exports.encodeCall)(transferAbi, parameters);
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
    var abi = shouldAssert ? Proxy_1.proxyAssertABI : Proxy_1.proxyABI;
    return (0, exports.encodeCall)(abi, [
        address,
        howToCall,
        Buffer.from(calldata.slice(2), "hex"),
    ]);
}
exports.encodeProxyCall = encodeProxyCall;
exports.schemas = {
    goerli: index_1.goerliSchemas,
    rinkeby: index_3.rinkebySchemas,
    main: index_2.mainSchemas,
};
//# sourceMappingURL=schema.js.map