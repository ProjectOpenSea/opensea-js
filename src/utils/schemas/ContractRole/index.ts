import { Schema } from "../schema";
import {
  AbiType,
  FunctionInputKind,
  FunctionOutputKind,
  StateMutability,
} from "../types";

interface ContractRoleType {
  roleGetter: string;
  roleSetter: string;
  address: string;
  name?: string;
  description?: string;
}

export const ContractRoleSchema: Schema<ContractRoleType> = {
  version: 1,
  deploymentBlock: 0, // Not indexed (for now; need asset-specific indexing strategy)
  name: "ContractRole",
  description: "Transferrable role on a smart contract.",
  thumbnail:
    "https://i.redditmedia.com/NaFzmSbDX2T2RALMxy2tmGJN_gPVNH9lJggCKUDDqcc.jpg?w=320&s=3913239508209aaf6ba1188fe3d3b5fc",
  website:
    "https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/ownership/Ownable.sol",
  fields: [
    { name: "Name", type: "string", description: "Contract Name" },
    {
      name: "Description",
      type: "string",
      description: "Contract Description",
    },
    { name: "Address", type: "address", description: "Contract Address" },
    {
      name: "RoleGetter",
      type: "string",
      description:
        "Name of method to get value of role. Should take no arguments.",
    },
    {
      name: "RoleSetter",
      type: "string",
      description:
        "Name of method to set value of role. Should take one argument, an address.",
    },
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assetFromFields: (fields: any) => ({
    name: fields.Name,
    address: fields.Address,
    description: fields.Description,
    roleGetter: fields.RoleGetter,
    roleSetter: fields.RoleSetter,
  }),
  formatter: async (asset) => {
    return {
      thumbnail:
        "https://i.redditmedia.com/NaFzmSbDX2T2RALMxy2tmGJN_gPVNH9lJggCKUDDqcc.jpg?w=320&s=3913239508209aaf6ba1188fe3d3b5fc",
      title: `Smart Contract Role: ${asset.roleGetter} for ${asset.name}`,
      description:
        asset.description ||
        `${asset.roleGetter} for smart contract at ${asset.address}`,
      url: "https://etherscan.io/address/" + asset.address,
      properties: [],
    };
  },
  functions: {
    transfer: (asset) => ({
      type: AbiType.Function,
      name: asset.roleSetter,
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: asset.address,
      inputs: [
        {
          kind: FunctionInputKind.Replaceable,
          name: "newOwner",
          type: "address",
        },
      ],
      outputs: [],
    }),
    ownerOf: (asset) => ({
      type: AbiType.Function,
      name: asset.roleGetter,
      payable: false,
      constant: true,
      stateMutability: StateMutability.View,
      target: asset.address,
      inputs: [],
      outputs: [
        { kind: FunctionOutputKind.Owner, name: "owner", type: "address" },
      ],
    }),
    assetsOfOwnerByIndex: [],
  },
  events: {
    transfer: [],
  },
  hash: (a) => a.address,
};
