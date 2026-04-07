import { describe, expect, test } from "vitest"
import {
  accountFromJSON,
  collectionFromJSON,
  feeFromJSON,
  paymentTokenFromJSON,
  pricingCurrenciesFromJSON,
  rarityFromJSON,
} from "../../src/utils/converters"

describe("Utils: converters", () => {
  describe("feeFromJSON", () => {
    test("converts fee JSON to Fee object", () => {
      const feeJSON = {
        fee: 2.5,
        recipient: "0x1234567890123456789012345678901234567890",
        required: true,
      }

      const result = feeFromJSON(feeJSON)

      expect(result).toEqual({
        fee: 2.5,
        recipient: "0x1234567890123456789012345678901234567890",
        required: true,
      })
    })

    test("handles non-required fee", () => {
      const feeJSON = {
        fee: 1.0,
        recipient: "0x0000000000000000000000000000000000000000",
        required: false,
      }

      const result = feeFromJSON(feeJSON)

      expect(result.required).toBe(false)
    })
  })

  describe("rarityFromJSON", () => {
    test("converts rarity JSON to RarityStrategy object", () => {
      const rarityJSON = {
        strategy_id: "openrarity",
        strategy_version: "1.0",
        calculated_at: "2024-01-01T00:00:00Z",
        max_rank: 10000,
        tokens_scored: 9999,
      }

      const result = rarityFromJSON(rarityJSON)

      expect(result).toEqual({
        strategyId: "openrarity",
        strategyVersion: "1.0",
        calculatedAt: "2024-01-01T00:00:00Z",
        maxRank: 10000,
        tokensScored: 9999,
      })
    })

    test("returns null for null input", () => {
      const result = rarityFromJSON(null)
      expect(result).toBeNull()
    })

    test("returns null for undefined input", () => {
      const result = rarityFromJSON(undefined)
      expect(result).toBeNull()
    })
  })

  describe("paymentTokenFromJSON", () => {
    test("converts payment token JSON to OpenSeaPaymentToken object", () => {
      const tokenJSON = {
        name: "Wrapped Ether",
        symbol: "WETH",
        decimals: 18,
        address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        chain: "ethereum",
        image: "https://example.com/weth.png",
        eth_price: "1.0",
        usd_price: "2500.00",
      }

      const result = paymentTokenFromJSON(tokenJSON)

      expect(result).toEqual({
        name: "Wrapped Ether",
        symbol: "WETH",
        decimals: 18,
        address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        chain: "ethereum",
        imageUrl: "https://example.com/weth.png",
        ethPrice: "1.0",
        usdPrice: "2500.00",
      })
    })

    test("handles missing optional fields", () => {
      const tokenJSON = {
        name: "Test Token",
        symbol: "TEST",
        decimals: 18,
        address: "0x0000000000000000000000000000000000000001",
        chain: "ethereum",
      }

      const result = paymentTokenFromJSON(tokenJSON)

      expect(result.name).toBe("Test Token")
      expect(result.symbol).toBe("TEST")
      expect(result.imageUrl).toBeUndefined()
    })
  })

  describe("pricingCurrenciesFromJSON", () => {
    test("converts full pricing currencies JSON", () => {
      const json = {
        listing_currency: {
          name: "Ether",
          symbol: "ETH",
          decimals: 18,
          address: "0x0000000000000000000000000000000000000000",
          chain: "ethereum",
          image: "https://example.com/eth.png",
          eth_price: "1.0",
          usd_price: "2500.00",
        },
        offer_currency: {
          name: "Wrapped Ether",
          symbol: "WETH",
          decimals: 18,
          address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          chain: "ethereum",
          image: "https://example.com/weth.png",
          eth_price: "1.0",
          usd_price: "2500.00",
        },
      }

      const result = pricingCurrenciesFromJSON(json)

      expect(result).toBeDefined()
      expect(result?.listingCurrency).toEqual({
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
        address: "0x0000000000000000000000000000000000000000",
        chain: "ethereum",
        imageUrl: "https://example.com/eth.png",
        ethPrice: "1.0",
        usdPrice: "2500.00",
      })
      expect(result?.offerCurrency).toEqual({
        name: "Wrapped Ether",
        symbol: "WETH",
        decimals: 18,
        address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        chain: "ethereum",
        imageUrl: "https://example.com/weth.png",
        ethPrice: "1.0",
        usdPrice: "2500.00",
      })
    })

    test("returns undefined for null input", () => {
      const result = pricingCurrenciesFromJSON(null)
      expect(result).toBeUndefined()
    })

    test("returns undefined for undefined input", () => {
      const result = pricingCurrenciesFromJSON(undefined)
      expect(result).toBeUndefined()
    })

    test("handles partial data with only listing currency", () => {
      const json = {
        listing_currency: {
          name: "Ether",
          symbol: "ETH",
          decimals: 18,
          address: "0x0000000000000000000000000000000000000000",
          chain: "ethereum",
        },
      }

      const result = pricingCurrenciesFromJSON(json)

      expect(result).toBeDefined()
      expect(result?.listingCurrency).toBeDefined()
      expect(result?.listingCurrency?.symbol).toBe("ETH")
      expect(result?.offerCurrency).toBeUndefined()
    })

    test("handles partial data with only offer currency", () => {
      const json = {
        offer_currency: {
          name: "Wrapped Ether",
          symbol: "WETH",
          decimals: 18,
          address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          chain: "ethereum",
        },
      }

      const result = pricingCurrenciesFromJSON(json)

      expect(result).toBeDefined()
      expect(result?.listingCurrency).toBeUndefined()
      expect(result?.offerCurrency).toBeDefined()
      expect(result?.offerCurrency?.symbol).toBe("WETH")
    })
  })

  describe("accountFromJSON", () => {
    test("converts account JSON to OpenSeaAccount object", () => {
      const accountJSON = {
        address: "0x1234567890123456789012345678901234567890",
        username: "testuser",
        profile_image_url: "https://example.com/profile.png",
        banner_image_url: "https://example.com/banner.png",
        website: "https://example.com",
        social_media_accounts: [
          { platform: "twitter", username: "testuser" },
          { platform: "instagram", username: "testuser_ig" },
        ],
        bio: "Test bio",
        joined_date: "2024-01-01",
      }

      const result = accountFromJSON(accountJSON)

      expect(result).toEqual({
        address: "0x1234567890123456789012345678901234567890",
        username: "testuser",
        profileImageUrl: "https://example.com/profile.png",
        bannerImageUrl: "https://example.com/banner.png",
        website: "https://example.com",
        socialMediaAccounts: [
          { platform: "twitter", username: "testuser" },
          { platform: "instagram", username: "testuser_ig" },
        ],
        bio: "Test bio",
        joinedDate: "2024-01-01",
      })
    })

    test("handles missing social media accounts", () => {
      const accountJSON = {
        address: "0x1234567890123456789012345678901234567890",
        username: "testuser",
      }

      const result = accountFromJSON(accountJSON)

      expect(result.socialMediaAccounts).toEqual([])
    })

    test("handles empty social media accounts array", () => {
      const accountJSON = {
        address: "0x1234567890123456789012345678901234567890",
        username: "testuser",
        social_media_accounts: [],
      }

      const result = accountFromJSON(accountJSON)

      expect(result.socialMediaAccounts).toEqual([])
    })
  })

  describe("collectionFromJSON", () => {
    test("converts collection JSON to OpenSeaCollection object", () => {
      const collectionJSON = {
        name: "Test Collection",
        collection: "test-collection",
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
        discord_url: "https://discord.gg/test",
        telegram_url: "https://t.me/test",
        twitter_username: "testcollection",
        instagram_username: "testcollection_ig",
        contracts: [
          {
            address: "0x1234567890123456789012345678901234567890",
            chain: "ethereum",
          },
        ],
        editors: ["0x0987654321098765432109876543210987654321"],
        fees: [
          {
            fee: 2.5,
            recipient: "0x1111111111111111111111111111111111111111",
            required: false,
          },
        ],
        rarity: {
          strategy_id: "openrarity",
          strategy_version: "1.0",
          calculated_at: "2024-01-01T00:00:00Z",
          max_rank: 10000,
          tokens_scored: 9999,
        },
        pricing_currencies: {
          listing_currency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
            address: "0x0000000000000000000000000000000000000000",
            chain: "ethereum",
          },
          offer_currency: {
            name: "Wrapped Ether",
            symbol: "WETH",
            decimals: 18,
            address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            chain: "ethereum",
          },
        },
        total_supply: 10000,
        created_date: "2024-01-01",
        required_zone: "0x0000000000000000000000000000000000000000",
      }

      const result = collectionFromJSON(collectionJSON)

      expect(result.name).toBe("Test Collection")
      expect(result.collection).toBe("test-collection")
      expect(result.description).toBe("A test collection")
      expect(result.imageUrl).toBe("https://example.com/image.png")
      expect(result.bannerImageUrl).toBe("https://example.com/banner.png")
      expect(result.owner).toBe("0x1234567890123456789012345678901234567890")
      expect(result.safelistStatus).toBe("verified")
      expect(result.category).toBe("art")
      expect(result.isDisabled).toBe(false)
      expect(result.isNSFW).toBe(false)
      expect(result.traitOffersEnabled).toBe(true)
      expect(result.collectionOffersEnabled).toBe(true)
      expect(result.contracts).toHaveLength(1)
      expect(result.editors).toHaveLength(1)
      expect(result.fees).toHaveLength(1)
      expect(result.rarity).not.toBeNull()
      expect(result.pricingCurrencies).toBeDefined()
      expect(result.pricingCurrencies?.listingCurrency?.symbol).toBe("ETH")
      expect(result.pricingCurrencies?.offerCurrency?.symbol).toBe("WETH")
      expect(result.totalSupply).toBe(10000)
    })

    test("handles missing optional arrays", () => {
      const collectionJSON = {
        name: "Minimal Collection",
        collection: "minimal",
      }

      const result = collectionFromJSON(collectionJSON)

      expect(result.name).toBe("Minimal Collection")
      expect(result.contracts).toEqual([])
      expect(result.fees).toEqual([])
      expect(result.pricingCurrencies).toBeUndefined()
    })

    test("handles null rarity", () => {
      const collectionJSON = {
        name: "No Rarity Collection",
        collection: "no-rarity",
        rarity: null,
      }

      const result = collectionFromJSON(collectionJSON)

      expect(result.rarity).toBeNull()
    })

    test("converts multiple contracts", () => {
      const collectionJSON = {
        name: "Multi Contract Collection",
        collection: "multi-contract",
        contracts: [
          {
            address: "0x1111111111111111111111111111111111111111",
            chain: "ethereum",
          },
          {
            address: "0x2222222222222222222222222222222222222222",
            chain: "polygon",
          },
        ],
      }

      const result = collectionFromJSON(collectionJSON)

      expect(result.contracts).toHaveLength(2)
      expect(result.contracts[0].address).toBe(
        "0x1111111111111111111111111111111111111111",
      )
      expect(result.contracts[1].address).toBe(
        "0x2222222222222222222222222222222222222222",
      )
    })

    test("converts multiple fees", () => {
      const collectionJSON = {
        name: "Multi Fee Collection",
        collection: "multi-fee",
        fees: [
          {
            fee: 2.5,
            recipient: "0x1111111111111111111111111111111111111111",
            required: false,
          },
          {
            fee: 1.0,
            recipient: "0x2222222222222222222222222222222222222222",
            required: true,
          },
        ],
      }

      const result = collectionFromJSON(collectionJSON)

      expect(result.fees).toHaveLength(2)
      expect(result.fees[0].fee).toBe(2.5)
      expect(result.fees[1].fee).toBe(1.0)
    })

    test("converts pricing currencies", () => {
      const collectionJSON = {
        name: "Currency Collection",
        collection: "currency-collection",
        pricing_currencies: {
          listing_currency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
            address: "0x0000000000000000000000000000000000000000",
            chain: "ethereum",
          },
          offer_currency: {
            name: "Wrapped Ether",
            symbol: "WETH",
            decimals: 18,
            address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            chain: "ethereum",
          },
        },
      }

      const result = collectionFromJSON(collectionJSON)

      expect(result.pricingCurrencies).toBeDefined()
      expect(result.pricingCurrencies?.listingCurrency?.symbol).toBe("ETH")
      expect(result.pricingCurrencies?.offerCurrency?.symbol).toBe("WETH")
    })
  })
})
