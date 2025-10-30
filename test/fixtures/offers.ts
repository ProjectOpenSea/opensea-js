import { mockOrderComponents } from "./orders";
import { Offer, RestOrderStatus } from "../../src/api/types";

// eslint-disable-next-line import/no-unused-modules
export const mockOffer: Offer = {
  order_hash: "0xabc123",
  chain: "ethereum",
  protocol_data: {
    parameters: mockOrderComponents,
    signature: "0xSignature",
  },
  protocol_address: "0xdef456",
  price: {
    currency: "WETH",
    decimals: 18,
    value: "1500000000000000000",
  },
  status: RestOrderStatus.ACTIVE,
};

// eslint-disable-next-line import/no-unused-modules
export const mockOfferMinimal: Partial<Offer> & Pick<Offer, "order_hash"> = {
  order_hash: "0x123",
};
