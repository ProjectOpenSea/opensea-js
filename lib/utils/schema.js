"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.encodeProxyCall = exports.encodeTransferCall = exports.encodeAtomicizedTransfer = exports.encodeDefaultCall = exports.encodeBuy = exports.encodeAtomicizedBuy = exports.encodeAtomicizedSell = exports.encodeSell = exports.encodeCall = exports.encodeReplacementPattern = exports.AbiType = void 0;
var bignumber_js_1 = require("bignumber.js");
var ethABI = __importStar(require("ethereumjs-abi"));
var wyvern_js_1 = require("wyvern-js");
var types_1 = require("wyvern-schemas/dist/types");
var wyvern_schemas_1 = require("wyvern-schemas");
Object.defineProperty(exports, "AbiType", { enumerable: true, get: function () { return wyvern_schemas_1.AbiType; } });
var Proxy_1 = require("../abi/Proxy");
var types_2 = require("../types");
exports.encodeReplacementPattern = wyvern_js_1.WyvernProtocol.encodeReplacementPattern;
var encodeCall = function (abi, parameters) {
    var inputTypes = abi.inputs.map(function (i) { return i.type; });
    return ("0x" +
        Buffer.concat([
            ethABI.methodID(abi.name, inputTypes),
            ethABI.rawEncode(inputTypes, parameters),
        ]).toString("hex"));
};
exports.encodeCall = encodeCall;
var encodeSell = function (schema, asset, address) {
    var transfer = schema.functions.transfer(asset);
    return {
        target: transfer.target,
        calldata: (0, exports.encodeDefaultCall)(transfer, address),
        replacementPattern: (0, exports.encodeReplacementPattern)(transfer),
    };
};
exports.encodeSell = encodeSell;
var encodeAtomicizedSell = function (schemas, assets, address, wyvernProtocol, networkName) {
    var atomicizer = wyvernProtocol.wyvernAtomicizer;
    var _a = encodeAtomicizedCalldata(atomicizer, schemas, assets, address, types_2.OrderSide.Sell), atomicizedCalldata = _a.atomicizedCalldata, atomicizedReplacementPattern = _a.atomicizedReplacementPattern;
    return {
        calldata: atomicizedCalldata,
        replacementPattern: atomicizedReplacementPattern,
        target: wyvern_js_1.WyvernProtocol.getAtomicizerContractAddress(networkName),
    };
};
exports.encodeAtomicizedSell = encodeAtomicizedSell;
var encodeAtomicizedBuy = function (schemas, assets, address, wyvernProtocol, networkName) {
    var atomicizer = wyvernProtocol.wyvernAtomicizer;
    var _a = encodeAtomicizedCalldata(atomicizer, schemas, assets, address, types_2.OrderSide.Buy), atomicizedCalldata = _a.atomicizedCalldata, atomicizedReplacementPattern = _a.atomicizedReplacementPattern;
    return {
        calldata: atomicizedCalldata,
        replacementPattern: atomicizedReplacementPattern,
        target: wyvern_js_1.WyvernProtocol.getAtomicizerContractAddress(networkName),
    };
};
exports.encodeAtomicizedBuy = encodeAtomicizedBuy;
var encodeBuy = function (schema, asset, address) {
    var transfer = schema.functions.transfer(asset);
    var replaceables = transfer.inputs.filter(function (i) { return i.kind === types_1.FunctionInputKind.Replaceable; });
    var ownerInputs = transfer.inputs.filter(function (i) { return i.kind === types_1.FunctionInputKind.Owner; });
    // Validate
    if (replaceables.length !== 1) {
        throw new Error("Only 1 input can match transfer destination, but instead " +
            replaceables.length +
            " did");
    }
    // Compute calldata
    var parameters = transfer.inputs.map(function (input) {
        switch (input.kind) {
            case types_1.FunctionInputKind.Replaceable:
                return address;
            case types_1.FunctionInputKind.Owner:
                return wyvern_js_1.WyvernProtocol.generateDefaultValue(input.type);
            default:
                try {
                    return input.value.toString();
                }
                catch (e) {
                    console.error(schema);
                    console.error(asset);
                    throw e;
                }
        }
    });
    var calldata = (0, exports.encodeCall)(transfer, parameters);
    // Compute replacement pattern
    var replacementPattern = "0x";
    if (ownerInputs.length > 0) {
        replacementPattern = (0, exports.encodeReplacementPattern)(transfer, types_1.FunctionInputKind.Owner);
    }
    return {
        target: transfer.target,
        calldata: calldata,
        replacementPattern: replacementPattern,
    };
};
exports.encodeBuy = encodeBuy;
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
    var atomicizedCalldata = atomicizer.atomicize.getABIEncodedTransactionData(transactions.map(function (t) { return t.address; }), transactions.map(function (t) { return t.value; }), transactions.map(function (t) { return new bignumber_js_1.BigNumber((t.calldata.length - 2) / 2); }), // subtract 2 for '0x', divide by 2 for hex
    transactions
        .map(function (t) { return t.calldata; })
        .reduce(function (x, current) { return x + current.slice(2); }, "0x") // cut off the '0x'
    );
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
// Helpers for atomicizer
function encodeAtomicizedCalldata(atomicizer, schemas, assets, address, side) {
    var encoder = side === types_2.OrderSide.Sell ? exports.encodeSell : exports.encodeBuy;
    try {
        var transactions = assets.map(function (asset, i) {
            var schema = schemas[i];
            var _a = encoder(schema, asset, address), target = _a.target, calldata = _a.calldata;
            return {
                calldata: calldata,
                abi: schema.functions.transfer(asset),
                address: target,
                value: new bignumber_js_1.BigNumber(0),
            };
        });
        var atomicizedCalldata = atomicizer.atomicize.getABIEncodedTransactionData(transactions.map(function (t) { return t.address; }), transactions.map(function (t) { return t.value; }), transactions.map(function (t) { return new bignumber_js_1.BigNumber((t.calldata.length - 2) / 2); }), // subtract 2 for '0x', divide by 2 for hex
        transactions.map(function (t) { return t.calldata; }).reduce(function (x, y) { return x + y.slice(2); }) // cut off the '0x'
        );
        var kind = side === types_2.OrderSide.Buy ? types_1.FunctionInputKind.Owner : undefined;
        var atomicizedReplacementPattern = wyvern_js_1.WyvernProtocol.encodeAtomicizedReplacementPattern(transactions.map(function (t) { return t.abi; }), kind);
        if (!atomicizedCalldata || !atomicizedReplacementPattern) {
            throw new Error("Invalid calldata: ".concat(atomicizedCalldata, ", ").concat(atomicizedReplacementPattern));
        }
        return {
            atomicizedCalldata: atomicizedCalldata,
            atomicizedReplacementPattern: atomicizedReplacementPattern,
        };
    }
    catch (error) {
        console.error({ schemas: schemas, assets: assets, address: address, side: side });
        throw new Error("Failed to construct your order: likely something strange about this type of item. OpenSea has been notified. Please contact us in Discord! Original error: ".concat(error));
    }
}
//# sourceMappingURL=schema.js.map