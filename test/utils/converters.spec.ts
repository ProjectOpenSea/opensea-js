import { expect } from "chai";
import { suite, test } from "mocha";
import {
  collectionFromJSON,
  rarityFromJSON,
  paymentTokenFromJSON,
  accountFromJSON,
  feeFromJSON,
} from "../../src/utils/converters";

suite("Utils: converters", () => {
  suite("feeFromJSON", () => {
    test("converts fee JSON to Fee object", () => {
      const feeJSON = {
        fee: 2.5,
        recipient: "0x1234567890123456789012345678901234567890",
        required: true,
      };

      const result = feeFromJSON(feeJSON);

      expect(result).to.deep.equal({
        fee: 2.5,
        recipient: "0x1234567890123456789012345678901234567890",
        required: true,
      });
    });

    test("handles non-required fee", () => {
      const feeJSON = {
        fee: 1.0,
        recipient: "0x0000000000000000000000000000000000000000",
        required: false,
      };

      const result = feeFromJSON(feeJSON);

      expect(result.required).to.be.false;
    });
  });

  suite("rarityFromJSON", () => {
    test("converts rarity JSON to RarityStrategy object", () => {
      const rarityJSON = {
        strategy_id: "openrarity",
        strategy_version: "1.0",
        calculated_at: "2024-01-01T00:00:00Z",
        max_rank: 10000,
        tokens_scored: 9999,
      };

      const result = rarityFromJSON(rarityJSON);

      expect(result).to.deep.equal({
        strategyId: "openrarity",
        strategyVersion: "1.0",
        calculatedAt: "2024-01-01T00:00:00Z",
        maxRank: 10000,
        tokensScored: 9999,
      });
    });

    test("returns null for null input", () => {
      const result = rarityFromJSON(null);
      expect(result).to.be.null;
    });

    test("returns null for undefined input", () => {
      const result = rarityFromJSON(undefined);
      expect(result).to.be.null;
    });
  });

  suite("paymentTokenFromJSON", () => {
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
      };

      const result = paymentTokenFromJSON(tokenJSON);

      expect(result).to.deep.equal({
        name: "Wrapped Ether",
        symbol: "WETH",
        decimals: 18,
        address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        chain: "ethereum",
        imageUrl: "https://example.com/weth.png",
        ethPrice: "1.0",
        usdPrice: "2500.00",
      });
    });

    test("handles missing optional fields", () => {
      const tokenJSON = {
        name: "Test Token",
        symbol: "TEST",
        decimals: 18,
        address: "0x0000000000000000000000000000000000000001",
        chain: "ethereum",
      };

      const result = paymentTokenFromJSON(tokenJSON);

      expect(result.name).to.equal("Test Token");
      expect(result.symbol).to.equal("TEST");
      expect(result.imageUrl).to.be.undefined;
    });
  });

  suite("accountFromJSON", () => {
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
      };

      const result = accountFromJSON(accountJSON);

      expect(result).to.deep.equal({
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
      });
    });

    test("handles missing social media accounts", () => {
      const accountJSON = {
        address: "0x1234567890123456789012345678901234567890",
        username: "testuser",
      };

      const result = accountFromJSON(accountJSON);

      expect(result.socialMediaAccounts).to.deep.equal([]);
    });

    test("handles empty social media accounts array", () => {
      const accountJSON = {
        address: "0x1234567890123456789012345678901234567890",
        username: "testuser",
        social_media_accounts: [],
      };

      const result = accountFromJSON(accountJSON);

      expect(result.socialMediaAccounts).to.deep.equal([]);
    });
  });

  suite("collectionFromJSON", () => {
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
          { address: "0x1234567890123456789012345678901234567890", chain: "ethereum" },
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
        payment_tokens: [
          {
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
            address: "0x0000000000000000000000000000000000000000",
            chain: "ethereum",
          },
        ],
        total_supply: 10000,
        created_date: "2024-01-01",
        required_zone: "0x0000000000000000000000000000000000000000",
      };

      const result = collectionFromJSON(collectionJSON);

      expect(result.name).to.equal("Test Collection");
      expect(result.collection).to.equal("test-collection");
      expect(result.description).to.equal("A test collection");
      expect(result.imageUrl).to.equal("https://example.com/image.png");
      expect(result.bannerImageUrl).to.equal("https://example.com/banner.png");
      expect(result.owner).to.equal("0x1234567890123456789012345678901234567890");
      expect(result.safelistStatus).to.equal("verified");
      expect(result.category).to.equal("art");
      expect(result.isDisabled).to.be.false;
      expect(result.isNSFW).to.be.false;
      expect(result.traitOffersEnabled).to.be.true;
      expect(result.collectionOffersEnabled).to.be.true;
      expect(result.contracts).to.have.length(1);
      expect(result.editors).to.have.length(1);
      expect(result.fees).to.have.length(1);
      expect(result.rarity).to.not.be.null;
      expect(result.paymentTokens).to.have.length(1);
      expect(result.totalSupply).to.equal(10000);
    });

    test("handles missing optional arrays", () => {
      const collectionJSON = {
        name: "Minimal Collection",
        collection: "minimal",
      };

      const result = collectionFromJSON(collectionJSON);

      expect(result.name).to.equal("Minimal Collection");
      expect(result.contracts).to.deep.equal([]);
      expect(result.fees).to.deep.equal([]);
      expect(result.paymentTokens).to.deep.equal([]);
    });

    test("handles null rarity", () => {
      const collectionJSON = {
        name: "No Rarity Collection",
        collection: "no-rarity",
        rarity: null,
      };

      const result = collectionFromJSON(collectionJSON);

      expect(result.rarity).to.be.null;
    });

    test("converts multiple contracts", () => {
      const collectionJSON = {
        name: "Multi Contract Collection",
        collection: "multi-contract",
        contracts: [
          { address: "0x1111111111111111111111111111111111111111", chain: "ethereum" },
          { address: "0x2222222222222222222222222222222222222222", chain: "polygon" },
        ],
      };

      const result = collectionFromJSON(collectionJSON);

      expect(result.contracts).to.have.length(2);
      expect(result.contracts[0].address).to.equal("0x1111111111111111111111111111111111111111");
      expect(result.contracts[1].address).to.equal("0x2222222222222222222222222222222222222222");
    });

    test("converts multiple fees", () => {
      const collectionJSON = {
        name: "Multi Fee Collection",
        collection: "multi-fee",
        fees: [
          { fee: 2.5, recipient: "0x1111111111111111111111111111111111111111", required: false },
          { fee: 1.0, recipient: "0x2222222222222222222222222222222222222222", required: true },
        ],
      };

      const result = collectionFromJSON(collectionJSON);

      expect(result.fees).to.have.length(2);
      expect(result.fees[0].fee).to.equal(2.5);
      expect(result.fees[1].fee).to.equal(1.0);
    });

    test("converts multiple payment tokens", () => {
      const collectionJSON = {
        name: "Multi Token Collection",
        collection: "multi-token",
        payment_tokens: [
          {
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
            address: "0x0000000000000000000000000000000000000000",
            chain: "ethereum",
          },
          {
            name: "Wrapped Ether",
            symbol: "WETH",
            decimals: 18,
            address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            chain: "ethereum",
          },
        ],
      };

      const result = collectionFromJSON(collectionJSON);

      expect(result.paymentTokens).to.have.length(2);
      expect(result.paymentTokens[0].symbol).to.equal("ETH");
      expect(result.paymentTokens[1].symbol).to.equal("WETH");
    });
  });
});
