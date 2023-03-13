import { ENSName, ENSNameBaseSchema } from "../../ens";
import { Schema } from "../../schema";
import {
  AbiType,
  StateMutability,
  FunctionInputKind,
  FunctionOutputKind,
} from "../../types";

export const rinkebyENSNameSchema: Schema<ENSName> = {
  ...ENSNameBaseSchema,
  version: 1,
  deploymentBlock: 0,
  name: "ENSName",
  description: "Rinkeby Ethereum Name Service (EIP 137)",
  thumbnail: "https://ens.domains/img/ens.svg",
  website: "https://github.com/ethereum/EIPs/blob/master/EIPS/eip-137.md",
  formatter: async (asset) => {
    return {
      thumbnail: "https://ens.domains/img/ens.svg",
      title: "ENS Name " + asset.name,
      description: "(ENS node " + asset.nodeHash + ")",
      url: "https://github.com/ethereum/EIPs/blob/master/EIPS/eip-137.md",
      properties: [],
    };
  },
  functions: {
    transfer: (asset) => ({
      type: AbiType.Function,
      name: "setOwner",
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: "0xe7410170f87102df0055eb195163a03b7f2bff4a",
      inputs: [
        {
          kind: FunctionInputKind.Asset,
          name: "node",
          type: "bytes32",
          value: asset.nodeHash,
        },
        { kind: FunctionInputKind.Replaceable, name: "owner", type: "address" },
      ],
      outputs: [],
    }),
    ownerOf: (asset) => ({
      type: AbiType.Function,
      name: "owner",
      payable: false,
      constant: true,
      stateMutability: StateMutability.View,
      target: "0xe7410170f87102df0055eb195163a03b7f2bff4a",
      inputs: [
        {
          kind: FunctionInputKind.Asset,
          name: "node",
          type: "bytes32",
          value: asset.nodeHash,
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
