import { ENSName, ENSNameBaseSchema } from "../../ens";
import { Schema } from "../../schema";
import {
  AbiType,
  FunctionInputKind,
  FunctionOutputKind,
  StateMutability,
} from "../../types";

export const ENSNameSchema: Schema<ENSName> = {
  ...ENSNameBaseSchema,
  version: 2,
  deploymentBlock: 3605331,
  name: "ENSName",
  description: "Ethereum Name Service Name (EIP 137)",
  thumbnail: "https://ens.domains/img/ens.svg",
  website: "https://github.com/ethereum/EIPs/blob/master/EIPS/eip-137.md",
  formatter: async (asset) => {
    return {
      thumbnail: "https://ens.domains/img/ens.svg",
      title:
        "ENS Name " +
        (asset.name ? asset.name : asset.nodeHash.slice(0, 4) + "..."),
      description: "ENS node " + asset.nodeHash,
      url: "https://etherscan.io/enslookup?q=" + asset.name,
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
      target: "0x6090a6e47849629b7245dfa1ca21d94cd15878ef",
      inputs: [
        {
          kind: FunctionInputKind.Asset,
          name: "_hash",
          type: "bytes32",
          value: asset.nodeHash,
        },
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
      target: "0x314159265dD8dbb310642f98f50C066173C1259b",
      inputs: [
        {
          kind: FunctionInputKind.Asset,
          name: "node",
          type: "bytes32",
          value: asset.nameHash,
        },
      ],
      outputs: [{ kind: FunctionOutputKind.Owner, name: "", type: "address" }],
    }),
    assetsOfOwnerByIndex: [],
  },
  events: {
    transfer: [],
  },
};
