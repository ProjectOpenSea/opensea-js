import { Schema } from "../../schema";
import {
  AbiType,
  EventInputKind,
  FunctionInputKind,
  FunctionOutputKind,
  StateMutability,
} from "../../types";

type TestRinkebyNFTType = string;

export const testRinkebyNFTSchema: Schema<TestRinkebyNFTType> = {
  version: 1,
  deploymentBlock: 0,
  name: "TestRinkebyNFT",
  description: "Rinkeby ERC721 non-fungible token for Wyvern Exchange testing",
  thumbnail:
    "https://cointelegraph.com/storage/uploads/view/f88e17e41f607dc0aef238230dd40cc6.png",
  website: "https://projectwyvern.com",
  fields: [
    {
      name: "ID",
      type: "uint256",
      description: "Token identification number.",
    },
  ],
  assetFromFields: (fields: any) => fields.ID, // eslint-disable-line @typescript-eslint/no-explicit-any
  assetToFields: (asset) => ({ ID: asset }),
  formatter: async (asset) => {
    return {
      thumbnail:
        "https://cointelegraph.com/storage/uploads/view/f88e17e41f607dc0aef238230dd40cc6.png",
      title: "TestRinkebyNFT #" + asset,
      description: "A useless NFT!",
      url: "https://www.projectwyvern.com",
      properties: [],
    };
  },
  functions: {
    transfer: (asset) => ({
      type: AbiType.Function,
      name: "transfer",
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: "0x07a6dc6e3f1120ca03658d473d10aee3af5f8abb",
      inputs: [
        { kind: FunctionInputKind.Replaceable, name: "_to", type: "address" },
        {
          kind: FunctionInputKind.Asset,
          name: "_tokenId",
          type: "uint256",
          value: asset,
        },
      ],
      outputs: [],
    }),
    ownerOf: (asset) => ({
      type: AbiType.Function,
      name: "ownerOf",
      payable: false,
      constant: true,
      stateMutability: StateMutability.View,
      target: "0x07a6dc6e3f1120ca03658d473d10aee3af5f8abb",
      inputs: [
        {
          kind: FunctionInputKind.Asset,
          name: "_tokenId",
          type: "uint256",
          value: asset,
        },
      ],
      outputs: [
        { kind: FunctionOutputKind.Owner, name: "_owner", type: "address" },
      ],
    }),
    assetsOfOwnerByIndex: [],
  },
  events: {
    transfer: [
      {
        type: AbiType.Event,
        name: "Transfer",
        target: "0x07a6dc6e3f1120ca03658d473d10aee3af5f8abb",
        anonymous: false,
        inputs: [
          {
            kind: EventInputKind.Source,
            indexed: true,
            name: "_from",
            type: "address",
          },
          {
            kind: EventInputKind.Destination,
            indexed: true,
            name: "_to",
            type: "address",
          },
          {
            kind: EventInputKind.Asset,
            indexed: false,
            name: "_tokenId",
            type: "uint256",
          },
        ],
        assetFromInputs: async (inputs: any) => inputs._tokenId.toString(), // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    ],
  },
  hash: (a) => a,
};
