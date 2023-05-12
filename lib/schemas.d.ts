import { JSONSchemaType } from "ajv";
import { OpenSeaAccount, OpenSeaAssetBundle } from "./types";
export declare const accountSchema: JSONSchemaType<OpenSeaAccount>;
export type PartialAssetBundleType = Omit<OpenSeaAssetBundle, "assets" | "sellOrders" | "assetContract"> & {
    assets: object[];
    sellOrders: object[] | null;
    assetContract?: object;
};
export declare const assetBundleSchema: JSONSchemaType<PartialAssetBundleType>;
