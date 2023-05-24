import { keccak256, namehash } from "ethers/lib/utils";
import { Schema } from "./schema";

export interface ENSName {
  nodeHash: string;
  nameHash: string;
  name: string;
}

export const nodehash = (name: string) => {
  const label = name.split(".")[0];
  return label ? keccak256(label) : "";
};

export const ENSNameBaseSchema: Required<
  Pick<Schema<ENSName>, "fields" | "assetFromFields" | "checkAsset" | "hash">
> = {
  fields: [
    { name: "Name", type: "string", description: "ENS Name" },
    {
      name: "NodeHash",
      type: "bytes32",
      description: "ENS Node Hash",
      readOnly: true,
    },
    {
      name: "NameHash",
      type: "bytes32",
      description: "ENS Name Hash",
      readOnly: true,
    },
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assetFromFields: (fields: any) => ({
    id: fields.ID,
    address: fields.Address,
    name: fields.Name,
    nodeHash: nodehash(fields.Name),
    nameHash: namehash(fields.Name),
  }),
  checkAsset: (asset: ENSName) => {
    return asset.name
      ? namehash(asset.name) === asset.nameHash &&
          nodehash(asset.name) === asset.nodeHash
      : true;
  },
  hash: ({ nodeHash }) => nodeHash,
};
