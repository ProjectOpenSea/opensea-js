import { Schema } from "../../schema";
import {
  AbiType,
  EventInputKind,
  FunctionInputKind,
  FunctionOutputKind,
  StateMutability,
} from "../../types";

type RinkebyCryptoKittiesType = string;

/* eslint-disable @typescript-eslint/no-explicit-any */
export const rinkebyCryptoKittiesSchema: Schema<RinkebyCryptoKittiesType> = {
  version: 1,
  deploymentBlock: 0,
  name: "RinkebyCryptoKitties",
  description: "Rinkeby Testnet CryptoKitties",
  thumbnail: "https://www.cryptokitties.co/images/kitty-eth.svg",
  website: "https://cryptokitties.co",
  fields: [{ name: "ID", type: "uint256", description: "CryptoKitty number." }],
  assetFromFields: (fields: any) => fields.ID,
  assetToFields: (asset) => ({ ID: asset }),
  formatter: async (asset) => {
    return {
      thumbnail: "https://www.cryptokitties.co/images/kitty-eth.svg",
      title: "RinkebyCryptoKitty #" + asset,
      description: "A Rinkeby kitten!",
      url: "https://www.cryptokitties.co/kitty/" + asset,
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
      target: "0x16baf0de678e52367adc69fd067e5edd1d33e3bf",
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
      target: "0x16baf0de678e52367adc69fd067e5edd1d33e3bf",
      inputs: [
        {
          kind: FunctionInputKind.Asset,
          name: "_tokenId",
          type: "uint256",
          value: asset,
        },
      ],
      outputs: [
        { kind: FunctionOutputKind.Owner, name: "owner", type: "address" },
      ],
    }),
    assetsOfOwnerByIndex: [
      {
        type: AbiType.Function,
        name: "tokensOfOwnerByIndex",
        payable: false,
        constant: true,
        stateMutability: StateMutability.View,
        target: "0x16baf0de678e52367adc69fd067e5edd1d33e3bf",
        inputs: [
          { kind: FunctionInputKind.Owner, name: "_owner", type: "address" },
          { kind: FunctionInputKind.Index, name: "_index", type: "uint" },
        ],
        outputs: [
          { kind: FunctionOutputKind.Asset, name: "tokenId", type: "uint" },
        ],
        assetFromOutputs: (output: any) => {
          if (output.toNumber() === 0) {
            return null;
          } else {
            return output.toString();
          }
        },
      },
    ],
  },
  events: {
    transfer: [
      {
        type: AbiType.Event,
        name: "Transfer",
        target: "0x16baf0de678e52367adc69fd067e5edd1d33e3bf",
        anonymous: false,
        inputs: [
          {
            kind: EventInputKind.Source,
            indexed: true,
            name: "from",
            type: "address",
          },
          {
            kind: EventInputKind.Destination,
            indexed: true,
            name: "to",
            type: "address",
          },
          {
            kind: EventInputKind.Asset,
            indexed: true,
            name: "tokenId",
            type: "uint256",
          },
        ],
        assetFromInputs: async (inputs: any) => inputs.tokenId,
      },
    ],
  },
  hash: (a) => a,
};

/* eslint-enable @typescript-eslint/no-explicit-any */
