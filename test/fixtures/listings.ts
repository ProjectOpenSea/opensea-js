import { Listing } from "../../src/api/types";
import { mockOrderComponents } from "./orders";

export const mockListing: Listing = {
  order_hash: "0x123",
  chain: "ethereum",
  type: "basic",
  price: {
    current: {
      currency: "ETH",
      decimals: 18,
      value: "1000000000000000000",
    },
  },
  protocol_data: {
    parameters: mockOrderComponents,
    signature: "0xSignature",
  },
  protocol_address: "0xabc",
};

export const mockListingMinimal: Partial<Listing> & Pick<Listing, "order_hash"> = {
  order_hash: "0x1",
};
