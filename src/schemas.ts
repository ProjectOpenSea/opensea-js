import { JSONSchemaType } from "ajv";
import { OpenSeaAccount, OpenSeaAssetBundle, OpenSeaUser } from "./types";

const userSchema: JSONSchemaType<OpenSeaUser> = {
  type: "object",
  properties: {
    username: { type: "string", nullable: true },
  },
};

export const accountSchema: JSONSchemaType<OpenSeaAccount> = {
  type: "object",
  properties: {
    address: { type: "string" },
    config: { type: "string" },
    profileImgUrl: { type: "string" },
    user: { ...userSchema },
  },
  required: ["address", "config", "profileImgUrl", "user"],
};

// TODO: Support entire OpenSeaAssetBundle type
export type PartialAssetBundleType = Omit<
  OpenSeaAssetBundle,
  "assets" | "sellOrders" | "assetContract"
> & {
  assets: object[];
  sellOrders: object[] | null;
  assetContract?: object;
};

export const assetBundleSchema: JSONSchemaType<PartialAssetBundleType> = {
  type: "object",
  properties: {
    maker: { ...accountSchema },
    assets: { type: "array", items: { type: "object" } },
    name: { type: "string" },
    slug: { type: "string" },
    permalink: { type: "string" },

    sellOrders: {
      type: "array",
      items: { type: "object" },
    },

    assetContract: { type: "object", nullable: true },
    description: { type: "string", nullable: true },
    externalLink: { type: "string", nullable: true },
  },
  required: ["maker", "assets", "name", "slug", "permalink", "sellOrders"],
};
