"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainSchemas = void 0;
var index_1 = require("./CryptoKitties/index");
var index_2 = require("./CryptoPunks/index");
var EnjinItem_1 = require("./EnjinItem");
var index_3 = require("./ENSName/index");
var index_4 = require("./ENSShortNameAuction/index");
var index_5 = require("./OwnableContract/index");
var ContractRole_1 = require("../ContractRole");
var ERC1155_1 = require("../ERC1155");
var ERC20_1 = require("../ERC20");
var ERC721_1 = require("../ERC721");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.mainSchemas = [
    index_1.CryptoKittiesSchema,
    index_2.CryptoPunksSchema,
    index_3.ENSNameSchema,
    index_4.ENSShortNameAuctionSchema,
    index_5.OwnableContractSchema,
    ERC20_1.ERC20Schema,
    ERC721_1.ERC721Schema,
    ERC721_1.ERC721v3Schema,
    ERC1155_1.ERC1155Schema,
    EnjinItem_1.EnjinItemSchema,
    ContractRole_1.ContractRoleSchema,
];
//# sourceMappingURL=index.js.map