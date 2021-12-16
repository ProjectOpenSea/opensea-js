import { BigNumber } from "bignumber.js";
import * as ethABI from "ethereumjs-abi";
import { WyvernProtocol } from "wyvern-js";
import { FunctionInputKind, } from "wyvern-schemas/dist/types";
export { AbiType } from "wyvern-schemas";
import { proxyAssertABI, proxyABI } from "../abi/Proxy";
import { OrderSide } from "../types";
export var encodeReplacementPattern = WyvernProtocol.encodeReplacementPattern;
export var encodeCall = function (abi, parameters) {
    var inputTypes = abi.inputs.map(function (i) { return i.type; });
    return ("0x" +
        Buffer.concat([
            ethABI.methodID(abi.name, inputTypes),
            ethABI.rawEncode(inputTypes, parameters),
        ]).toString("hex"));
};
export var encodeSell = function (schema, asset, address) {
    var transfer = schema.functions.transfer(asset);
    return {
        target: transfer.target,
        calldata: encodeDefaultCall(transfer, address),
        replacementPattern: encodeReplacementPattern(transfer),
    };
};
export var encodeAtomicizedSell = function (schemas, assets, address, wyvernProtocol, networkName) {
    var atomicizer = wyvernProtocol.wyvernAtomicizer;
    var _a = encodeAtomicizedCalldata(atomicizer, schemas, assets, address, OrderSide.Sell), atomicizedCalldata = _a.atomicizedCalldata, atomicizedReplacementPattern = _a.atomicizedReplacementPattern;
    return {
        calldata: atomicizedCalldata,
        replacementPattern: atomicizedReplacementPattern,
        target: WyvernProtocol.getAtomicizerContractAddress(networkName),
    };
};
export var encodeAtomicizedBuy = function (schemas, assets, address, wyvernProtocol, networkName) {
    var atomicizer = wyvernProtocol.wyvernAtomicizer;
    var _a = encodeAtomicizedCalldata(atomicizer, schemas, assets, address, OrderSide.Buy), atomicizedCalldata = _a.atomicizedCalldata, atomicizedReplacementPattern = _a.atomicizedReplacementPattern;
    return {
        calldata: atomicizedCalldata,
        replacementPattern: atomicizedReplacementPattern,
        target: WyvernProtocol.getAtomicizerContractAddress(networkName),
    };
};
export var encodeBuy = function (schema, asset, address) {
    var transfer = schema.functions.transfer(asset);
    var replaceables = transfer.inputs.filter(function (i) { return i.kind === FunctionInputKind.Replaceable; });
    var ownerInputs = transfer.inputs.filter(function (i) { return i.kind === FunctionInputKind.Owner; });
    // Validate
    if (replaceables.length !== 1) {
        throw new Error("Only 1 input can match transfer destination, but instead " +
            replaceables.length +
            " did");
    }
    // Compute calldata
    var parameters = transfer.inputs.map(function (input) {
        switch (input.kind) {
            case FunctionInputKind.Replaceable:
                return address;
            case FunctionInputKind.Owner:
                return WyvernProtocol.generateDefaultValue(input.type);
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
    var calldata = encodeCall(transfer, parameters);
    // Compute replacement pattern
    var replacementPattern = "0x";
    if (ownerInputs.length > 0) {
        replacementPattern = encodeReplacementPattern(transfer, FunctionInputKind.Owner);
    }
    return {
        target: transfer.target,
        calldata: calldata,
        replacementPattern: replacementPattern,
    };
};
export var encodeDefaultCall = function (abi, address) {
    var parameters = abi.inputs.map(function (input) {
        switch (input.kind) {
            case FunctionInputKind.Replaceable:
                return WyvernProtocol.generateDefaultValue(input.type);
            case FunctionInputKind.Owner:
                return address;
            case FunctionInputKind.Asset:
            default:
                return input.value;
        }
    });
    return encodeCall(abi, parameters);
};
/**
 * Encode the atomicized transfer of many assets
 * @param schema Wyvern Schema for the assets
 * @param assets List of assets to transfer
 * @param from Current address owning the assets
 * @param to Destination address
 * @param atomicizer Wyvern Atomicizer instance
 */
export function encodeAtomicizedTransfer(schemas, assets, from, to, wyvernProtocol, networkName) {
    var atomicizer = wyvernProtocol.wyvernAtomicizer;
    var transactions = assets.map(function (asset, i) {
        var schema = schemas[i];
        var transfer = schema.functions.transfer(asset);
        var calldata = encodeTransferCall(transfer, from, to);
        return {
            calldata: calldata,
            address: transfer.target,
            value: new BigNumber(0),
        };
    });
    var atomicizedCalldata = atomicizer.atomicize.getABIEncodedTransactionData(transactions.map(function (t) { return t.address; }), transactions.map(function (t) { return t.value; }), transactions.map(function (t) { return new BigNumber((t.calldata.length - 2) / 2); }), // subtract 2 for '0x', divide by 2 for hex
    transactions
        .map(function (t) { return t.calldata; })
        .reduce(function (x, current) { return x + current.slice(2); }, "0x") // cut off the '0x'
    );
    return {
        calldata: atomicizedCalldata,
        target: WyvernProtocol.getAtomicizerContractAddress(networkName),
    };
}
/**
 * Encode a transfer call for a Wyvern schema function
 * @param transferAbi Annotated Wyvern ABI
 * @param from From address
 * @param to To address
 */
export function encodeTransferCall(transferAbi, from, to) {
    var parameters = transferAbi.inputs.map(function (input) {
        switch (input.kind) {
            case FunctionInputKind.Replaceable:
                return to;
            case FunctionInputKind.Owner:
                return from;
            case FunctionInputKind.Asset:
            default:
                if (input.value == null) {
                    throw new Error("Unsupported function input kind: ".concat(input.kind));
                }
                return input.value;
        }
    });
    return encodeCall(transferAbi, parameters);
}
/**
 * Encode a call to a user's proxy contract
 * @param address The address for the proxy to call
 * @param howToCall How to call the addres
 * @param calldata The data to use in the call
 * @param shouldAssert Whether to assert success in the proxy call
 */
export function encodeProxyCall(address, howToCall, calldata, shouldAssert) {
    if (shouldAssert === void 0) { shouldAssert = true; }
    var abi = shouldAssert ? proxyAssertABI : proxyABI;
    return encodeCall(abi, [
        address,
        howToCall,
        Buffer.from(calldata.slice(2), "hex"),
    ]);
}
// Helpers for atomicizer
function encodeAtomicizedCalldata(atomicizer, schemas, assets, address, side) {
    var encoder = side === OrderSide.Sell ? encodeSell : encodeBuy;
    try {
        var transactions = assets.map(function (asset, i) {
            var schema = schemas[i];
            var _a = encoder(schema, asset, address), target = _a.target, calldata = _a.calldata;
            return {
                calldata: calldata,
                abi: schema.functions.transfer(asset),
                address: target,
                value: new BigNumber(0),
            };
        });
        var atomicizedCalldata = atomicizer.atomicize.getABIEncodedTransactionData(transactions.map(function (t) { return t.address; }), transactions.map(function (t) { return t.value; }), transactions.map(function (t) { return new BigNumber((t.calldata.length - 2) / 2); }), // subtract 2 for '0x', divide by 2 for hex
        transactions.map(function (t) { return t.calldata; }).reduce(function (x, y) { return x + y.slice(2); }) // cut off the '0x'
        );
        var kind = side === OrderSide.Buy ? FunctionInputKind.Owner : undefined;
        var atomicizedReplacementPattern = WyvernProtocol.encodeAtomicizedReplacementPattern(transactions.map(function (t) { return t.abi; }), kind);
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