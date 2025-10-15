import { CROSS_CHAIN_SEAPORT_V1_6_ADDRESS } from "@opensea/seaport-js/lib/constants";
import { OrderComponents } from "@opensea/seaport-js/lib/types";
import { OrderV2, OrderType } from "../../src/orders/types";
import { OrderSide } from "../../src/types";

export const mockOrderComponents: OrderComponents = {
  offerer: "0xOfferer",
  offer: [],
  consideration: [],
  orderType: 0,
  startTime: "0",
  endTime: "1000000000000",
  zone: "0x0000000000000000000000000000000000000000",
  zoneHash:
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  salt: "0",
  conduitKey:
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  totalOriginalConsiderationItems: 0,
  counter: "0",
};

const mockMakerAccount = {
  address: "0xMaker",
  username: "testmaker",
  profileImageUrl: "https://example.com/profile.png",
  bannerImageUrl: "https://example.com/banner.png",
  website: "https://example.com",
  socialMediaAccounts: [],
  bio: "Test maker account",
  joinedDate: "2023-01-01T00:00:00Z",
};

const mockTakerAccount = {
  address: "0xPrivateBuyer",
  username: "testtaker",
  profileImageUrl: "https://example.com/profile2.png",
  bannerImageUrl: "https://example.com/banner2.png",
  website: "https://example.com",
  socialMediaAccounts: [],
  bio: "Test taker account",
  joinedDate: "2023-01-01T00:00:00Z",
};

export const mockOrderV2: OrderV2 = {
  createdDate: "2024-01-01T00:00:00Z",
  closingDate: null,
  listingTime: 0,
  expirationTime: 1000000000000,
  orderHash: "0xOrderHash",
  maker: mockMakerAccount,
  taker: null,
  protocolData: {
    parameters: mockOrderComponents,
    signature: "0xSignature",
  },
  protocolAddress: CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
  currentPrice: BigInt("1000000000000000000"),
  makerFees: [],
  takerFees: [],
  side: OrderSide.LISTING,
  orderType: OrderType.BASIC,
  cancelled: false,
  finalized: false,
  markedInvalid: false,
  clientSignature: null,
  remainingQuantity: 1,
};

export const mockOfferOrderV2: OrderV2 = {
  ...mockOrderV2,
  side: OrderSide.OFFER,
};

export const mockPrivateListingOrderV2: OrderV2 = {
  ...mockOrderV2,
  taker: mockTakerAccount,
};
