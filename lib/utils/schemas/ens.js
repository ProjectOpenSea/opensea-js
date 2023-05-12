"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENSNameBaseSchema = exports.nodehash = void 0;
var ethereumjs_util_1 = require("ethereumjs-util");
var safe_buffer_1 = require("safe-buffer");
var namehash = function (name) {
    var node = "0000000000000000000000000000000000000000000000000000000000000000";
    if (name !== "") {
        var labels = name.split(".");
        for (var i = labels.length - 1; i >= 0; i--) {
            var labelHash = (0, ethereumjs_util_1.sha3)(labels[i]).toString("hex");
            var buffer = safe_buffer_1.Buffer.from(node + labelHash, "hex");
            node = (0, ethereumjs_util_1.sha3)(buffer).toString("hex");
        }
    }
    return "0x" + node.toString();
};
var nodehash = function (name) {
    var label = name.split(".")[0];
    if (label) {
        return "0x" + (0, ethereumjs_util_1.sha3)(label).toString("hex");
    }
    else {
        return "";
    }
};
exports.nodehash = nodehash;
exports.ENSNameBaseSchema = {
    fields: [
        { name: "Name", type: "string", description: "ENS Name" },
        {
            name: "NodeHash",
            type: "bytes32",
            description: "ENS Node Hash",
            readOnly: true,
        },
        {
            name: "NameHash",
            type: "bytes32",
            description: "ENS Name Hash",
            readOnly: true,
        },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assetFromFields: function (fields) { return ({
        id: fields.ID,
        address: fields.Address,
        name: fields.Name,
        nodeHash: (0, exports.nodehash)(fields.Name),
        nameHash: namehash(fields.Name),
    }); },
    checkAsset: function (asset) {
        return asset.name
            ? namehash(asset.name) === asset.nameHash &&
                (0, exports.nodehash)(asset.name) === asset.nodeHash
            : true;
    },
    hash: function (_a) {
        var nodeHash = _a.nodeHash;
        return nodeHash;
    },
};
//# sourceMappingURL=ens.js.map