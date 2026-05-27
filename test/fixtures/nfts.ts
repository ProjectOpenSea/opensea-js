import { type NFT, TraitDisplayType } from "../../src/api/types"

export const mockNFT: NFT = {
  identifier: "1",
  collection: "test-collection",
  contract: "0x123",
  tokenStandard: "erc721",
  name: "Test NFT #1",
  description: "A test NFT",
  imageUrl: "https://example.com/1.png",
  metadataUrl: "https://example.com/metadata/1",
  openseaUrl: "https://opensea.io/assets/ethereum/0x123/1",
  updatedAt: "2024-01-01T00:00:00Z",
  isDisabled: false,
  isNsfw: false,
  isSuspicious: false,
  traits: [],
  creator: "0xCreator",
  owners: [
    {
      address: "0xOwner",
      quantity: 1,
      quantityString: "1",
    },
  ],
}

export const mockNFTDetailed: NFT = {
  identifier: "1234",
  collection: "test-collection",
  contract: "0xcontract123",
  tokenStandard: "erc721",
  name: "Test NFT #1234",
  description: "A unique test NFT",
  imageUrl: "https://example.com/nft/1234.png",
  metadataUrl: "https://example.com/metadata/1234",
  openseaUrl: "https://opensea.io/assets/ethereum/0xcontract123/1234",
  updatedAt: "2024-01-01T00:00:00Z",
  isDisabled: false,
  isNsfw: false,
  isSuspicious: false,
  traits: [
    {
      traitType: "Background",
      displayType: TraitDisplayType.NONE,
      maxValue: "0",
      value: "Blue",
    },
  ],
  creator: "0xCreator123",
  owners: [
    {
      address: "0xOwner123",
      quantity: 1,
      quantityString: "1",
    },
  ],
  rarity: {
    strategyId: "openrarity",
    strategyVersion: "v1",
    rank: 42,
  },
}

export const createMockNFT = (overrides: Partial<NFT> = {}): NFT => ({
  ...mockNFT,
  ...overrides,
})
