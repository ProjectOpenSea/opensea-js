import { CROSS_CHAIN_SEAPORT_V1_6_ADDRESS } from "@opensea/seaport-js/lib/constants";
import { mockOrderComponents } from "./orders";
import { Listing } from "../../src/api/types";
import { OrderType } from "../../src/orders/types";

export const mockListing: Listing = {
  order_hash: "0x123",
  chain: "ethereum",
  type: OrderType.BASIC,
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
  protocol_address: CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
  remaining_quantity: 1,
};

export const mockListingPartiallyFilled: Listing = {
  ...mockListing,
  order_hash: "0x456",
  remaining_quantity: 3,
};

// eslint-disable-next-line import/no-unused-modules
export const mockListingMinimal: Partial<Listing> &
  Pick<Listing, "order_hash"> = {
  order_hash: "0x1",
};
