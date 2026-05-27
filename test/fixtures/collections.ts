import { type OpenSeaCollection, SafelistStatus } from "../../src/types"

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
  isNsfw: false,
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
  pricingCurrencies: {
    listingCurrency: {
      symbol: "ETH",
      address: "0x0000000000000000000000000000000000000000",
      chain: "ethereum",
      image: "https://example.com/eth.png",
      name: "Ether",
      decimals: 18,
      ethPrice: "1",
      usdPrice: "3000",
    },
    offerCurrency: {
      symbol: "WETH",
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      chain: "ethereum",
      image: "https://example.com/weth.png",
      name: "Wrapped Ether",
      decimals: 18,
      ethPrice: "1",
      usdPrice: "3000",
    },
  },
  totalSupply: 10000,
  uniqueItemCount: 10000,
  createdDate: "2024-01-01T00:00:00Z",
}

export const mockCollectionMinimal: Partial<OpenSeaCollection> &
  Pick<OpenSeaCollection, "collection"> = {
  collection: "test-collection",
  name: "Test Collection",
}
