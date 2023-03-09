import { ContractRoleSchema } from "../ContractRole/index";
import { ERC1155Schema } from "../ERC1155";
import { ERC20Schema } from "../ERC20";
import { ERC721Schema, ERC721v3Schema } from "../ERC721/index";
import { Schema } from "../schema";

export const goerliSchemas: Array<Schema<any>> = [
  ERC20Schema,
  ERC721Schema,
  ERC721v3Schema,
  ERC1155Schema,
  ContractRoleSchema,
];
