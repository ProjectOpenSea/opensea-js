import { Schema } from "../../schema";
import {
  AbiType,
  StateMutability,
  FunctionInputKind,
  FunctionOutputKind,
} from "../../types";

interface OwnableContractType {
  name?: string;
  description?: string;
  address: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export const OwnableContractSchema: Schema<OwnableContractType> = {
  version: 1,
  deploymentBlock: 0, // Not indexed (for now; need asset-specific indexing strategy)
  name: "OwnableContract",
  description: "Smart contract with transferrable ownership.",
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
  ],
  assetFromFields: (fields: any) => ({
    name: fields.Name,
    address: fields.Address,
    description: fields.Description,
  }),
  formatter: async (asset) => {
    return {
      thumbnail:
        "https://i.redditmedia.com/NaFzmSbDX2T2RALMxy2tmGJN_gPVNH9lJggCKUDDqcc.jpg?w=320&s=3913239508209aaf6ba1188fe3d3b5fc",
      title: 'Smart Contract: "' + asset.name + '"',
      description:
        asset.description || "Ownable smart contract at " + asset.address,
      url: "https://etherscan.io/address/" + asset.address,
      properties: [],
    };
  },
  functions: {
    transfer: (asset) => ({
      type: AbiType.Function,
      name: "transferOwnership",
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
      name: "owner",
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
/* eslint-enable @typescript-eslint/no-explicit-any */
