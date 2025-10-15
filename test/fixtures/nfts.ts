import { NFT, TraitDisplayType } from "../../src/api/types";

export const mockNFT: NFT = {
  identifier: "1",
  collection: "test-collection",
  contract: "0x123",
  token_standard: "erc721",
  name: "Test NFT #1",
  description: "A test NFT",
  image_url: "https://example.com/1.png",
  metadata_url: "https://example.com/metadata/1",
  opensea_url: "https://opensea.io/assets/ethereum/0x123/1",
  updated_at: "2024-01-01T00:00:00Z",
  is_disabled: false,
  is_nsfw: false,
  traits: [],
  creator: "0xCreator",
  owners: [
    {
      address: "0xOwner",
      quantity: 1,
    },
  ],
  rarity: null,
};

export const mockNFTDetailed: NFT = {
  identifier: "1234",
  collection: "test-collection",
  contract: "0xcontract123",
  token_standard: "erc721",
  name: "Test NFT #1234",
  description: "A unique test NFT",
  image_url: "https://example.com/nft/1234.png",
  metadata_url: "https://example.com/metadata/1234",
  opensea_url: "https://opensea.io/assets/ethereum/0xcontract123/1234",
  updated_at: "2024-01-01T00:00:00Z",
  is_disabled: false,
  is_nsfw: false,
  traits: [
    {
      trait_type: "Background",
      display_type: TraitDisplayType.NONE,
      max_value: "0",
      value: "Blue",
    },
  ],
  creator: "0xCreator123",
  owners: [
    {
      address: "0xOwner123",
      quantity: 1,
    },
  ],
  rarity: {
    strategy_id: "openrarity",
    strategy_version: "v1",
    rank: 42,
    score: 0.95,
    calculated_at: "2024-01-01T00:00:00Z",
    max_rank: 10000,
    tokens_scored: 10000,
    ranking_features: {
      unique_attribute_count: 5,
    },
  },
};

export const createMockNFT = (overrides: Partial<NFT> = {}): NFT => ({
  ...mockNFT,
  ...overrides,
});
