import { SemiFungibleTradeType, ERC1155Schema } from "../../ERC1155";
import { Schema } from "../../schema";
import {
  AbiType,
  StateMutability,
  FunctionInputKind,
  FunctionOutputKind,
} from "../../types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const EnjinItemSchema: Schema<SemiFungibleTradeType> = {
  ...ERC1155Schema,
  version: 1,
  deploymentBlock: 0, // Not indexed (for now; need asset-specific indexing strategy)
  name: "Enjin",
  description:
    "Items conforming to the Enjin implementation of the ERC1155 spec.",
  website: "https://enjincoin.io/",
  functions: {
    ...ERC1155Schema.functions,
    ownerOf: (asset) => ({
      type: AbiType.Function,
      name: "ownerOf",
      payable: false,
      constant: true,
      stateMutability: StateMutability.View,
      target: asset.address,
      inputs: [
        {
          kind: FunctionInputKind.Asset,
          name: "_id",
          type: "uint256",
          value: asset.id,
        },
      ],
      outputs: [
        { kind: FunctionOutputKind.Owner, name: "owner", type: "address" },
      ],
    }),
    // Parameters are flipped from 1155
    countOf: (asset) => ({
      type: AbiType.Function,
      name: "balanceOf",
      payable: false,
      constant: true,
      stateMutability: StateMutability.View,
      target: asset.address,
      inputs: [
        {
          kind: FunctionInputKind.Asset,
          name: "_id",
          type: "uint256",
          value: asset.id,
        },
        { kind: FunctionInputKind.Owner, name: "_owner", type: "address" },
      ],
      outputs: [
        { kind: FunctionOutputKind.Count, name: "balance", type: "uint" },
      ],
      assetFromOutputs: (outputs: any) => outputs.balance,
    }),
    assetsOfOwnerByIndex: [],
  },
};

/* eslint-enable @typescript-eslint/no-explicit-any */
