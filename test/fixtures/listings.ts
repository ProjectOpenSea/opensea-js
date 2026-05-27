import { CROSS_CHAIN_SEAPORT_V1_6_ADDRESS } from "@opensea/seaport-js/lib/constants"
import { type Listing, OrderStatus } from "../../src/api/types"
import { OrderType } from "../../src/orders/types"
import { mockOrderComponents } from "./orders"

export const mockListing: Listing = {
  orderHash: "0x123",
  chain: "ethereum",
  type: OrderType.BASIC,
  price: {
    current: {
      currency: "ETH",
      decimals: 18,
      value: "1000000000000000000",
    },
  },
  protocolData: {
    parameters: mockOrderComponents,
    signature: "0xSignature",
  },
  protocolAddress: CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
  remainingQuantity: 1,
  status: OrderStatus.ACTIVE,
}

export const mockListingPartiallyFilled: Listing = {
  ...mockListing,
  orderHash: "0x456",
  remainingQuantity: 3,
}

export const mockListingMinimal: Partial<Listing> & Pick<Listing, "orderHash"> =
  {
    orderHash: "0x1",
  }
