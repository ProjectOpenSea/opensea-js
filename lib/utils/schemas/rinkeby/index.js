"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rinkebySchemas = void 0;
var index_1 = require("./rinkebyCryptoKitties/index");
var index_2 = require("./rinkebyCustom/index");
var index_3 = require("./rinkebyENSName/index");
var index_4 = require("./rinkebyENSShortNameAuction/index");
var index_5 = require("./rinkebyOwnableContract/index");
var index_6 = require("./testRinkebyNFT/index");
var ContractRole_1 = require("../ContractRole");
var ERC1155_1 = require("../ERC1155");
var ERC20_1 = require("../ERC20");
var ERC721_1 = require("../ERC721");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.rinkebySchemas = [
    index_1.rinkebyCryptoKittiesSchema,
    index_2.rinkebyCustomSchema,
    index_3.rinkebyENSNameSchema,
    index_4.rinkebyENSShortNameAuctionSchema,
    index_5.rinkebyOwnableContractSchema,
    index_6.testRinkebyNFTSchema,
    ERC20_1.ERC20Schema,
    ERC721_1.ERC721Schema,
    ERC721_1.ERC721v3Schema,
    ERC1155_1.ERC1155Schema,
    ContractRole_1.ContractRoleSchema,
];
//# sourceMappingURL=index.js.map