"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_js_1 = require("bignumber.js");
var ethABI = require("ethereumjs-abi");
var wyvern_js_1 = require("wyvern-js");
var types_1 = require("wyvern-schemas/dist/types");
var wyvern_schemas_1 = require("wyvern-schemas");
exports.AbiType = wyvern_schemas_1.AbiType;
var Proxy_1 = require("../abi/Proxy");
var failWith = function (msg) {
    throw new Error(msg);
};
exports.encodeReplacementPattern = wyvern_js_1.WyvernProtocol.encodeReplacementPattern;
exports.encodeCall = function (abi, parameters) {
    var inputTypes = abi.inputs.map(function (i) { return i.type; });
    return '0x' + Buffer.concat([
        ethABI.methodID(abi.name, inputTypes),
        ethABI.rawEncode(inputTypes, parameters),
    ]).toString('hex');
};
exports.encodeSell = function (schema, asset, address) {
    var transfer = schema.functions.transfer(asset);
    return {
        target: transfer.target,
        calldata: exports.encodeDefaultCall(transfer, address),
        replacementPattern: exports.encodeReplacementPattern(transfer),
    };
};
exports.encodeAtomicizedSell = function (schemas, assets, address, atomicizer) {
    var transactions = assets.map(function (asset, i) {
        var schema = schemas[i];
        var _a = exports.encodeSell(schema, asset, address), target = _a.target, calldata = _a.calldata;
        return {
            calldata: calldata,
            abi: schema.functions.transfer(asset),
            address: target,
            value: new bignumber_js_1.BigNumber(0),
        };
    });
    var atomicizedCalldata = atomicizer.atomicize.getABIEncodedTransactionData(transactions.map(function (t) { return t.address; }), transactions.map(function (t) { return t.value; }), transactions.map(function (t) { return new bignumber_js_1.BigNumber((t.calldata.length - 2) / 2); }), // subtract 2 for '0x', divide by 2 for hex
    transactions.map(function (t) { return t.calldata; }).reduce(function (x, y) { return x + y.slice(2); }));
    var atomicizedReplacementPattern = wyvern_js_1.WyvernProtocol.encodeAtomicizedReplacementPattern(transactions.map(function (t) { return t.abi; }));
    return {
        calldata: atomicizedCalldata,
        replacementPattern: atomicizedReplacementPattern,
    };
};
exports.encodeAtomicizedBuy = function (schemas, assets, address, atomicizer) {
    var transactions = assets.map(function (asset, i) {
        var schema = schemas[i];
        var _a = exports.encodeBuy(schema, asset, address), target = _a.target, calldata = _a.calldata;
        return {
            calldata: calldata,
            abi: schema.functions.transfer(asset),
            address: target,
            value: new bignumber_js_1.BigNumber(0),
        };
    });
    var atomicizedCalldata = atomicizer.atomicize.getABIEncodedTransactionData(transactions.map(function (t) { return t.address; }), transactions.map(function (t) { return t.value; }), transactions.map(function (t) { return new bignumber_js_1.BigNumber((t.calldata.length - 2) / 2); }), // subtract 2 for '0x', divide by 2 for hex
    transactions.map(function (t) { return t.calldata; }).reduce(function (x, y) { return x + y.slice(2); }));
    var atomicizedReplacementPattern = wyvern_js_1.WyvernProtocol.encodeAtomicizedReplacementPattern(transactions.map(function (t) { return t.abi; }), types_1.FunctionInputKind.Owner);
    return {
        calldata: atomicizedCalldata,
        replacementPattern: atomicizedReplacementPattern,
    };
};
exports.encodeBuy = function (schema, asset, address) {
    var transfer = schema.functions.transfer(asset);
    var replaceables = transfer.inputs.filter(function (i) { return i.kind === types_1.FunctionInputKind.Replaceable; });
    var ownerInputs = transfer.inputs.filter(function (i) { return i.kind === types_1.FunctionInputKind.Owner; });
    // Validate
    if (replaceables.length !== 1) {
        failWith('Only 1 input can match transfer destination, but instead ' + replaceables.length + ' did');
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
    var calldata = exports.encodeCall(transfer, parameters);
    // Compute replacement pattern
    var replacementPattern = '0x';
    if (ownerInputs.length > 0) {
        replacementPattern = exports.encodeReplacementPattern(transfer, types_1.FunctionInputKind.Owner);
    }
    return {
        target: transfer.target,
        calldata: calldata,
        replacementPattern: replacementPattern,
    };
};
exports.encodeDefaultCall = function (abi, address) {
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
    return exports.encodeCall(abi, parameters);
};
/**
 * Encode the atomicized transfer of many assets
 * @param schema Wyvern Schema for the assets
 * @param assets List of assets to transfer
 * @param from Current address owning the assets
 * @param to Destination address
 * @param atomicizer Wyvern Atomicizer instance
 */
function encodeAtomicizedTransfer(schemas, assets, from, to, atomicizer) {
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
    transactions.map(function (t) { return t.calldata; }).reduce(function (x, current) { return x + current.slice(2); }, '0x'));
    return {
        calldata: atomicizedCalldata,
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
                    throw new Error("Unsupported function input kind: " + input.kind);
                }
                return input.value;
        }
    });
    return exports.encodeCall(transferAbi, parameters);
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
    return exports.encodeCall(abi, [address, howToCall, Buffer.from(calldata.slice(2), 'hex')]);
}
exports.encodeProxyCall = encodeProxyCall;
//# sourceMappingURL=schema.js.map