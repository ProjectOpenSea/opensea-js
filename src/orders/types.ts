import type { BasicOrderParametersStruct } from "@opensea/seaport-js/lib/typechain-types/seaport/contracts/Seaport"
import type {
  AdvancedOrder,
  OrderWithCounter,
} from "@opensea/seaport-js/lib/types"
import type { OpenSeaAccount, OrderSide } from "../types"

// Protocol data
type OrderProtocolToProtocolData = {
  seaport: OrderWithCounter
}
export type OrderProtocol = keyof OrderProtocolToProtocolData
export type ProtocolData =
  OrderProtocolToProtocolData[keyof OrderProtocolToProtocolData]

export enum OrderType {
  BASIC = "basic",
  ENGLISH = "english",
  CRITERIA = "criteria",
}

type OrderFee = {
  account: OpenSeaAccount
  basisPoints: string
}

/**
 * The latest OpenSea Order schema.
 */
export type OrderV2 = {
  /** The date the order was created. */
  createdDate: string
  /** The date the order was closed. */
  closingDate: string | null
  /** The date the order was listed. Order can be created before the listing time. */
  listingTime: number
  /** The date the order expires. */
  expirationTime: number
  /** The hash of the order. */
  orderHash: string | null
  /** The account that created the order. */
  maker: OpenSeaAccount
  /** The account that filled the order. */
  taker: OpenSeaAccount | null
  /** The protocol data for the order. Only 'seaport' is currently supported. */
  protocolData: ProtocolData
  /** The contract address of the protocol. */
  protocolAddress: string
  /** The current price of the order. */
  currentPrice: bigint
  /** The maker fees for the order. */
  makerFees: OrderFee[]
  /** The taker fees for the order. */
  takerFees: OrderFee[]
  /** The side of the order. Listing/Offer */
  side: OrderSide
  /** The type of the order. Basic/English/Criteria */
  orderType: OrderType
  /** Whether or not the maker has cancelled the order. */
  cancelled: boolean
  /** Whether or not the order is finalized. */
  finalized: boolean
  /** Whether or not the order is marked invalid and therefore not fillable. */
  markedInvalid: boolean
  /** The signature the order is signed with. */
  clientSignature: string | null
  /** Amount of items left in the order which can be taken. */
  remainingQuantity: number
}

export type FulfillmentDataResponse = {
  protocol: string
  fulfillmentData: FulfillmentData
}

type FulfillmentData = {
  transaction: Transaction
  orders: ProtocolData[]
}

type Transaction = {
  function: string
  chain: number
  to: string
  value: string
  inputData:
    | {
        // For fulfillAdvancedOrder
        advancedOrder: AdvancedOrder
        criteriaResolvers?: unknown[]
        fulfillerConduitKey?: string
        recipient: string
      }
    | {
        // For fulfillBasicOrder
        basicOrderParameters: BasicOrderParametersStruct
      }
    | {
        // For fulfillOrder
        order: OrderWithCounter
        fulfillerConduitKey?: string
        recipient: string
      }
    | {
        // Legacy: for backward compatibility
        orders:
          | OrderWithCounter[]
          | AdvancedOrder[]
          | BasicOrderParametersStruct[]
      }
}

// API query types
export type QueryCursors = {
  next: string | null
  previous: string | null
}
