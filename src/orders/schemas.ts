import Ajv, { JSONSchemaType, ValidateFunction } from "ajv";
import { OrderFee, OrderV2 } from "./types";
import {
  accountSchema,
  assetBundleSchema,
  PartialAssetBundleType,
} from "../schemas";

const ajv = new Ajv();

const feeSchema: JSONSchemaType<OrderFee> = {
  type: "object",
  properties: {
    account: accountSchema,
    basisPoints: { type: "string" },
  },
  required: ["account", "basisPoints"],
};

// TODO: Validate entire OrderV2 type
type PartialOrderV2Type = Omit<
  OrderV2,
  "makerAssetBundle" | "takerAssetBundle" | "protocolData"
> & {
  makerAssetBundle: PartialAssetBundleType;
  takerAssetBundle: PartialAssetBundleType;
  protocolData: object;
};

const orderSchema: JSONSchemaType<PartialOrderV2Type> = {
  type: "object",
  properties: {
    createdDate: { type: "string" },
    closingDate: { type: "string", nullable: true },
    listingTime: { type: "number" },
    expirationTime: { type: "number" },
    orderHash: { type: "string", nullable: true },
    maker: accountSchema,
    taker: { ...accountSchema, nullable: true },
    protocolData: { type: "object" },
    protocolAddress: { type: "string" },
    currentPrice: { type: "string" },
    makerFees: { type: "array", items: feeSchema },
    takerFees: { type: "array", items: feeSchema },
    side: { type: "string" },
    orderType: { type: "string" },
    cancelled: { type: "boolean" },
    finalized: { type: "boolean" },
    markedInvalid: { type: "boolean" },
    clientSignature: { type: "string", nullable: true },
    makerAssetBundle: assetBundleSchema,
    takerAssetBundle: assetBundleSchema,
  },
  required: [
    "createdDate",
    "closingDate",
    "listingTime",
    "expirationTime",
    "orderHash",
    "maker",
    "taker",
    "protocolData",
    "protocolAddress",
    "currentPrice",
    "makerFees",
    "takerFees",
    "side",
    "orderType",
    "cancelled",
    "finalized",
    "markedInvalid",
    "makerAssetBundle",
    "takerAssetBundle",
  ],
};

// TODO: Remove cast once all schemas are written
export const validateOrder = ajv.compile(
  orderSchema
) as ValidateFunction<OrderV2>;
