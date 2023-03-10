import { CryptoKittiesSchema } from "./CryptoKitties/index";
import { CryptoPunksSchema } from "./CryptoPunks/index";
import { EnjinItemSchema } from "./EnjinItem";
import { ENSNameSchema } from "./ENSName/index";
import { ENSShortNameAuctionSchema } from "./ENSShortNameAuction/index";
import { OwnableContractSchema } from "./OwnableContract/index";
import { ContractRoleSchema } from "../ContractRole";
import { ERC1155Schema } from "../ERC1155";
import { ERC20Schema } from "../ERC20";
import { ERC721Schema, ERC721v3Schema } from "../ERC721";
import { Schema } from "../schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mainSchemas: Array<Schema<any>> = [
  CryptoKittiesSchema,
  CryptoPunksSchema,
  ENSNameSchema,
  ENSShortNameAuctionSchema,
  OwnableContractSchema,
  ERC20Schema,
  ERC721Schema,
  ERC721v3Schema,
  ERC1155Schema,
  EnjinItemSchema,
  ContractRoleSchema,
];
