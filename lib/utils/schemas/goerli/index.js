"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goerliSchemas = void 0;
var index_1 = require("../ContractRole/index");
var ERC1155_1 = require("../ERC1155");
var ERC20_1 = require("../ERC20");
var index_2 = require("../ERC721/index");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.goerliSchemas = [
    ERC20_1.ERC20Schema,
    index_2.ERC721Schema,
    index_2.ERC721v3Schema,
    ERC1155_1.ERC1155Schema,
    index_1.ContractRoleSchema,
];
//# sourceMappingURL=index.js.map