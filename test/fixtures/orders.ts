import { CROSS_CHAIN_SEAPORT_V1_6_ADDRESS } from "@opensea/seaport-js/lib/constants";
import { OrderComponents } from "@opensea/seaport-js/lib/types";
import { OrderV2, OrderType } from "../../src/orders/types";
import { OrderSide } from "../../src/types";

export const mockOrderComponents: OrderComponents = {
  offerer: "0xOfferer",
  offer: [
    {
      itemType: 2, // ERC721
      token: "0xNFTContract",
      identifierOrCriteria: "123",
      startAmount: "1",
      endAmount: "1",
    },
  ],
  consideration: [
    {
      itemType: 0, // NATIVE (ETH)
      token: "0x0000000000000000000000000000000000000000",
      identifierOrCriteria: "0",
      startAmount: "1000000000000000000",
      endAmount: "1000000000000000000",
      recipient: "0xSeller",
    },
    {
      itemType: 0, // NATIVE (ETH) - marketplace fee
      token: "0x0000000000000000000000000000000000000000",
      identifierOrCriteria: "0",
      startAmount: "25000000000000000",
      endAmount: "25000000000000000",
      recipient: "0xMarketplace",
    },
  ],
  orderType: 0,
  startTime: "0",
  endTime: "1000000000000",
  zone: "0x0000000000000000000000000000000000000000",
  zoneHash:
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  salt: "0",
  conduitKey:
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  totalOriginalConsiderationItems: 2,
  counter: "0",
};

const mockPrivateListingOrderComponents: OrderComponents = {
  ...mockOrderComponents,
  consideration: [
    {
      itemType: 2, // ERC721 going to private buyer
      token: "0xNFTContract",
      identifierOrCriteria: "123",
      startAmount: "1",
      endAmount: "1",
      recipient: "0xPrivateBuyer",
    },
    {
      itemType: 0, // NATIVE (ETH) payment from buyer
      token: "0x0000000000000000000000000000000000000000",
      identifierOrCriteria: "0",
      startAmount: "1000000000000000000",
      endAmount: "1000000000000000000",
      recipient: "0xSeller",
    },
    {
      itemType: 0, // NATIVE (ETH) - marketplace fee
      token: "0x0000000000000000000000000000000000000000",
      identifierOrCriteria: "0",
      startAmount: "25000000000000000",
      endAmount: "25000000000000000",
      recipient: "0xMarketplace",
    },
  ],
  totalOriginalConsiderationItems: 3,
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
  protocolData: {
    parameters: mockPrivateListingOrderComponents,
    signature: "0xSignature",
  },
};
