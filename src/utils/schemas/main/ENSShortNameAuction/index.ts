import { namehash } from "ethers/lib/utils";
import { ENSName, ENSNameBaseSchema, nodehash } from "../../ens";
import { Schema } from "../../schema";
import {
  AbiType,
  EventInputKind,
  FunctionInputKind,
  StateMutability,
} from "../../types";

const ENS_SHORT_NAME_AUCTION_ADDRESS =
  "0x699c7f511c9e2182e89f29b3bfb68bd327919d17";

export const ENSShortNameAuctionSchema: Schema<ENSName> = {
  ...ENSNameBaseSchema,
  version: 0,
  deploymentBlock: 8488908,
  name: "ENSShortNameAuction",
  description: "ERC721 ENS short (3-6 character) names sold via auction.",
  thumbnail: "", // TODO: put SVG body directly here or host a PNG ourselves?
  website: "https://ens.domains/",
  formatter: async ({ name }) => {
    return {
      title: "ENS Short Name: " + name,
      description: "",
      url: "",
      thumbnail: "",
      properties: [],
    };
  },
  functions: {
    transfer: ({ name }) => ({
      type: AbiType.Function,
      name: "register",
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: ENS_SHORT_NAME_AUCTION_ADDRESS,
      inputs: [
        {
          kind: FunctionInputKind.Data,
          name: "name",
          type: "string",
          value: name.split(".")[0],
        },
        { kind: FunctionInputKind.Replaceable, name: "owner", type: "address" },
      ],
      outputs: [],
    }),
    assetsOfOwnerByIndex: [],
  },
  events: {
    transfer: [
      {
        type: AbiType.Event,
        name: "NameRegistered",
        target: ENS_SHORT_NAME_AUCTION_ADDRESS,
        anonymous: false,
        inputs: [
          {
            kind: EventInputKind.Asset,
            indexed: false,
            name: "name",
            type: "string",
          },
          {
            kind: EventInputKind.Destination,
            indexed: false,
            name: "owner",
            type: "address",
          },
        ],
        assetFromInputs: async (inputs: { name: string }) => ({
          name: inputs.name,
          nodeHash: nodehash(inputs.name),
          nameHash: namehash(inputs.name),
        }),
      },
    ],
  },
};
