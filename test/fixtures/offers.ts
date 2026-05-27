import { type Offer, OrderStatus } from "../../src/api/types"
import { mockOrderComponents } from "./orders"

export const mockOffer: Offer = {
  orderHash: "0xabc123",
  chain: "ethereum",
  protocolData: {
    parameters: mockOrderComponents,
    signature: "0xSignature",
  },
  protocolAddress: "0xdef456",
  price: {
    currency: "WETH",
    decimals: 18,
    value: "1500000000000000000",
  },
  remainingQuantity: 1,
  status: OrderStatus.ACTIVE,
}

export const mockOfferMinimal: Partial<Offer> & Pick<Offer, "orderHash"> = {
  orderHash: "0x123",
}
