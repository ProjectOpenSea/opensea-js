import axios from "axios";
import { Schema } from "../../schema";
import {
  AbiType,
  EventInputKind,
  FunctionInputKind,
  FunctionOutputKind,
  StateMutability,
} from "../../types";

type CryptoKittiesType = string;

export const CryptoKittiesSchema: Schema<CryptoKittiesType> = {
  version: 1,
  deploymentBlock: 4605167,
  name: "CryptoKitties",
  description: "The virtual kitties that started the craze.",
  thumbnail: "https://www.cryptokitties.co/images/kitty-eth.svg",
  website: "https://cryptokitties.co",
  fields: [{ name: "ID", type: "uint256", description: "CryptoKitty number." }],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assetFromFields: (fields: any) => fields.ID,
  assetToFields: (asset) => ({ ID: asset }),
  formatter: async (asset) => {
    const response = await axios
      .get(`https://api.cryptokitties.co/kitties/${asset}`)
      .catch((err) => {
        if (
          err.response &&
          (err.response.status === 404 || err.response.status === 400)
        ) {
          return null;
        } else {
          throw err;
        }
      });
    if (response === null) {
      return {
        thumbnail: "https://www.cryptokitties.co/images/kitty-eth.svg",
        title: "CryptoKitty #" + asset,
        description: "",
        url: "https://www.cryptokitties.co/kitty/" + asset,
        properties: [],
      };
    } else {
      const data = response.data;
      const attrs = data.enhanced_cattributes || data.cattributes || [];
      return {
        thumbnail: data.image_url_cdn,
        title: "CryptoKitty #" + asset,
        description: data.bio,
        url: "https://www.cryptokitties.co/kitty/" + asset,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        properties: attrs.map((c: any) => ({
          key: c.type,
          kind: "string",
          value: c.description,
        })),
      };
    }
  },
  functions: {
    transfer: (asset) => ({
      type: AbiType.Function,
      name: "transfer",
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: "0x06012c8cf97bead5deae237070f9587f8e7a266d",
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
      target: "0x06012c8cf97bead5deae237070f9587f8e7a266d",
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
    assetsOfOwnerByIndex: [],
  },
  events: {
    transfer: [
      {
        type: AbiType.Event,
        name: "Transfer",
        target: "0x06012c8cf97bead5deae237070f9587f8e7a266d",
        anonymous: false,
        inputs: [
          {
            kind: EventInputKind.Source,
            indexed: false,
            name: "from",
            type: "address",
          },
          {
            kind: EventInputKind.Destination,
            indexed: false,
            name: "to",
            type: "address",
          },
          {
            kind: EventInputKind.Asset,
            indexed: false,
            name: "tokenId",
            type: "uint256",
          },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        assetFromInputs: async (inputs: any) => inputs.tokenId,
      },
    ],
  },
  hash: (a) => a,
};
