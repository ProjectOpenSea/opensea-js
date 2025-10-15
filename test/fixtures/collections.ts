import { OpenSeaCollection } from "../../src/types";

export const mockCollection: OpenSeaCollection = {
  collection: "test-collection",
  name: "Test Collection",
  description: "A test collection",
  image_url: "https://example.com/image.png",
  banner_image_url: "https://example.com/banner.png",
  owner: "0x1234567890123456789012345678901234567890",
  safelist_status: "verified",
  category: "art",
  is_disabled: false,
  is_nsfw: false,
  trait_offers_enabled: true,
  collection_offers_enabled: true,
  opensea_url: "https://opensea.io/collection/test-collection",
  project_url: "https://example.com",
  wiki_url: "https://wiki.example.com",
  discord_url: "https://discord.gg/example",
  telegram_url: "https://t.me/example",
  twitter_username: "testcollection",
  instagram_username: "testcollection",
  contracts: [],
  editors: [],
  fees: [],
  rarity: null,
  payment_tokens: [],
  total_supply: 10000,
  created_date: "2024-01-01T00:00:00Z",
};

export const mockCollectionMinimal: Partial<OpenSeaCollection> & Pick<OpenSeaCollection, "collection"> = {
  collection: "test-collection",
  name: "Test Collection",
};
