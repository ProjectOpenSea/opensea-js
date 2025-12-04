import { OpenSeaCollection, SafelistStatus } from "../../src/types";

// eslint-disable-next-line import/no-unused-modules
export const mockCollection: OpenSeaCollection = {
  collection: "test-collection",
  name: "Test Collection",
  description: "A test collection",
  imageUrl: "https://example.com/image.png",
  bannerImageUrl: "https://example.com/banner.png",
  owner: "0x1234567890123456789012345678901234567890",
  safelistStatus: SafelistStatus.VERIFIED,
  category: "art",
  isDisabled: false,
  isNSFW: false,
  traitOffersEnabled: true,
  collectionOffersEnabled: true,
  openseaUrl: "https://opensea.io/collection/test-collection",
  projectUrl: "https://example.com",
  wikiUrl: "https://wiki.example.com",
  discordUrl: "https://discord.gg/example",
  telegramUrl: "https://t.me/example",
  twitterUsername: "testcollection",
  instagramUsername: "testcollection",
  contracts: [],
  editors: [],
  fees: [],
  rarity: null,
  paymentTokens: [],
  totalSupply: 10000,
  uniqueItemCount: 10000,
  createdDate: "2024-01-01T00:00:00Z",
};

// eslint-disable-next-line import/no-unused-modules
export const mockCollectionMinimal: Partial<OpenSeaCollection> &
  Pick<OpenSeaCollection, "collection"> = {
  collection: "test-collection",
  name: "Test Collection",
};
