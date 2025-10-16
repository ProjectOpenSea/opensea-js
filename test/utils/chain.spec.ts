import { CROSS_CHAIN_SEAPORT_V1_6_ADDRESS } from "@opensea/seaport-js/lib/constants";
import { expect } from "chai";
import { suite, test } from "mocha";
import {
  OPENSEA_CONDUIT_KEY,
  OPENSEA_CONDUIT_ADDRESS,
  OPENSEA_CONDUIT_KEY_2,
  OPENSEA_CONDUIT_ADDRESS_2,
  GUNZILLA_CONDUIT_KEY,
  GUNZILLA_CONDUIT_ADDRESS,
  GUNZILLA_SEAPORT_1_6_ADDRESS,
  GUNZILLA_SIGNED_ZONE_V2_ADDRESS,
  SIGNED_ZONE,
  OPENSEA_FEE_RECIPIENT,
  GUNZILLA_FEE_RECIPIENT,
  SOMNIA_FEE_RECIPIENT,
} from "../../src/constants";
import { Chain } from "../../src/types";
import {
  getChainId,
  getOfferPaymentToken,
  getListingPaymentToken,
  getDefaultConduit,
  getSeaportAddress,
  getSignedZone,
  getFeeRecipient,
} from "../../src/utils/chain";

suite("Utils: chain", () => {
  suite("getChainId", () => {
    const chainIdTests: Array<[Chain, string]> = [
      [Chain.Mainnet, "1"],
      [Chain.Polygon, "137"],
      [Chain.Avalanche, "43114"],
      [Chain.Arbitrum, "42161"],
      [Chain.Blast, "238"],
      [Chain.Base, "8453"],
      [Chain.Optimism, "10"],
      [Chain.Zora, "7777777"],
      [Chain.Sei, "1329"],
      [Chain.B3, "8333"],
      [Chain.BeraChain, "80094"],
      [Chain.Flow, "747"],
      [Chain.ApeChain, "33139"],
      [Chain.Ronin, "2020"],
      [Chain.Abstract, "2741"],
      [Chain.Shape, "360"],
      [Chain.Unichain, "130"],
      [Chain.Gunzilla, "43419"],
      [Chain.HyperEVM, "999"],
      [Chain.Somnia, "5031"],
    ];

    for (const [chain, expectedId] of chainIdTests) {
      test(`returns correct chain ID for ${chain}`, () => {
        expect(getChainId(chain)).to.equal(expectedId);
      });
    }

    test("throws for unknown chain", () => {
      expect(() => getChainId("UNKNOWN_CHAIN" as Chain)).to.throw(
        "Unknown chainId for UNKNOWN_CHAIN",
      );
    });
  });

  suite("getOfferPaymentToken", () => {
    test("returns WETH for Mainnet", () => {
      expect(getOfferPaymentToken(Chain.Mainnet)).to.equal(
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      );
    });

    test("returns WETH for Polygon", () => {
      expect(getOfferPaymentToken(Chain.Polygon)).to.equal(
        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      );
    });

    test("returns WAVAX for Avalanche", () => {
      expect(getOfferPaymentToken(Chain.Avalanche)).to.equal(
        "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      );
    });

    test("returns WETH for Arbitrum", () => {
      expect(getOfferPaymentToken(Chain.Arbitrum)).to.equal(
        "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      );
    });

    test("returns WETH for Blast", () => {
      expect(getOfferPaymentToken(Chain.Blast)).to.equal(
        "0x4300000000000000000000000000000000000004",
      );
    });

    test("returns WETH for OP chains (same address)", () => {
      const opChains = [
        Chain.Base,
        Chain.Optimism,
        Chain.Zora,
        Chain.B3,
        Chain.Shape,
        Chain.Unichain,
      ];
      const expectedAddress = "0x4200000000000000000000000000000000000006";

      for (const chain of opChains) {
        expect(getOfferPaymentToken(chain)).to.equal(expectedAddress);
      }
    });

    test("returns WBERA for BeraChain", () => {
      expect(getOfferPaymentToken(Chain.BeraChain)).to.equal(
        "0x6969696969696969696969696969696969696969",
      );
    });

    test("returns WSEI for Sei", () => {
      expect(getOfferPaymentToken(Chain.Sei)).to.equal(
        "0xe30fedd158a2e3b13e9badaeabafc5516e95e8c7",
      );
    });

    test("returns WFLOW for Flow", () => {
      expect(getOfferPaymentToken(Chain.Flow)).to.equal(
        "0xd3bf53dac106a0290b0483ecbc89d40fcc961f3e",
      );
    });

    test("returns WAPE for ApeChain", () => {
      expect(getOfferPaymentToken(Chain.ApeChain)).to.equal(
        "0x48b62137edfa95a428d35c09e44256a739f6b557",
      );
    });

    test("returns WRON for Ronin", () => {
      expect(getOfferPaymentToken(Chain.Ronin)).to.equal(
        "0xe514d9deb7966c8be0ca922de8a064264ea6bcd4",
      );
    });

    test("returns WETH for Abstract", () => {
      expect(getOfferPaymentToken(Chain.Abstract)).to.equal(
        "0x3439153eb7af838ad19d56e1571fbd09333c2809",
      );
    });

    test("returns WGUN for Gunzilla", () => {
      expect(getOfferPaymentToken(Chain.Gunzilla)).to.equal(
        "0x5aad7bba61d95c2c4e525a35f4062040264611f1",
      );
    });

    test("returns WHYPE for HyperEVM", () => {
      expect(getOfferPaymentToken(Chain.HyperEVM)).to.equal(
        "0x5555555555555555555555555555555555555555",
      );
    });

    test("returns WSOMI for Somnia", () => {
      expect(getOfferPaymentToken(Chain.Somnia)).to.equal(
        "0x046ede9564a72571df6f5e44d0405360c0f4dcab",
      );
    });

    test("throws for unknown chain", () => {
      expect(() => getOfferPaymentToken("UNKNOWN_CHAIN" as Chain)).to.throw(
        "Unknown offer currency for UNKNOWN_CHAIN",
      );
    });
  });

  suite("getListingPaymentToken", () => {
    test("returns ETH (0x0) for Mainnet", () => {
      expect(getListingPaymentToken(Chain.Mainnet)).to.equal(
        "0x0000000000000000000000000000000000000000",
      );
    });

    test("returns ETH (0x0) for chains with native ETH", () => {
      const ethChains = [
        Chain.Mainnet,
        Chain.Somnia,
        Chain.HyperEVM,
        Chain.Arbitrum,
        Chain.Blast,
        Chain.Base,
        Chain.Optimism,
        Chain.Zora,
        Chain.B3,
        Chain.Abstract,
        Chain.Shape,
        Chain.Unichain,
      ];

      for (const chain of ethChains) {
        expect(getListingPaymentToken(chain)).to.equal(
          "0x0000000000000000000000000000000000000000",
        );
      }
    });

    test("returns WETH for Polygon", () => {
      expect(getListingPaymentToken(Chain.Polygon)).to.equal(
        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      );
    });

    test("returns WAVAX for Avalanche", () => {
      expect(getListingPaymentToken(Chain.Avalanche)).to.equal(
        "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      );
    });

    test("returns BERA (0x0) for BeraChain", () => {
      expect(getListingPaymentToken(Chain.BeraChain)).to.equal(
        "0x0000000000000000000000000000000000000000",
      );
    });

    test("returns SEI (0x0) for Sei", () => {
      expect(getListingPaymentToken(Chain.Sei)).to.equal(
        "0x0000000000000000000000000000000000000000",
      );
    });

    test("returns WFLOW for Flow", () => {
      expect(getListingPaymentToken(Chain.Flow)).to.equal(
        "0xd3bf53dac106a0290b0483ecbc89d40fcc961f3e",
      );
    });

    test("returns APE (0x0) for ApeChain", () => {
      expect(getListingPaymentToken(Chain.ApeChain)).to.equal(
        "0x0000000000000000000000000000000000000000",
      );
    });

    test("returns WETH for Ronin", () => {
      expect(getListingPaymentToken(Chain.Ronin)).to.equal(
        "0xe514d9deb7966c8be0ca922de8a064264ea6bcd4",
      );
    });

    test("returns GUN (0x0) for Gunzilla", () => {
      expect(getListingPaymentToken(Chain.Gunzilla)).to.equal(
        "0x0000000000000000000000000000000000000000",
      );
    });

    test("throws for unknown chain", () => {
      expect(() => getListingPaymentToken("UNKNOWN_CHAIN" as Chain)).to.throw(
        "Unknown listing currency for UNKNOWN_CHAIN",
      );
    });
  });

  suite("getDefaultConduit", () => {
    test("returns default OpenSea conduit for Mainnet", () => {
      const result = getDefaultConduit(Chain.Mainnet);
      expect(result.key).to.equal(OPENSEA_CONDUIT_KEY);
      expect(result.address).to.equal(OPENSEA_CONDUIT_ADDRESS);
    });

    test("returns conduit 2 for Abstract", () => {
      const result = getDefaultConduit(Chain.Abstract);
      expect(result.key).to.equal(OPENSEA_CONDUIT_KEY_2);
      expect(result.address).to.equal(OPENSEA_CONDUIT_ADDRESS_2);
    });

    test("returns conduit 2 for HyperEVM", () => {
      const result = getDefaultConduit(Chain.HyperEVM);
      expect(result.key).to.equal(OPENSEA_CONDUIT_KEY_2);
      expect(result.address).to.equal(OPENSEA_CONDUIT_ADDRESS_2);
    });

    test("returns Gunzilla conduit for Gunzilla", () => {
      const result = getDefaultConduit(Chain.Gunzilla);
      expect(result.key).to.equal(GUNZILLA_CONDUIT_KEY);
      expect(result.address).to.equal(GUNZILLA_CONDUIT_ADDRESS);
    });

    test("returns Gunzilla conduit for Somnia", () => {
      const result = getDefaultConduit(Chain.Somnia);
      expect(result.key).to.equal(GUNZILLA_CONDUIT_KEY);
      expect(result.address).to.equal(GUNZILLA_CONDUIT_ADDRESS);
    });

    test("returns default OpenSea conduit for other chains", () => {
      const otherChains = [
        Chain.Polygon,
        Chain.Arbitrum,
        Chain.Base,
        Chain.Optimism,
      ];

      for (const chain of otherChains) {
        const result = getDefaultConduit(chain);
        expect(result.key).to.equal(OPENSEA_CONDUIT_KEY);
        expect(result.address).to.equal(OPENSEA_CONDUIT_ADDRESS);
      }
    });
  });

  suite("getSeaportAddress", () => {
    test("returns cross-chain Seaport 1.6 for Mainnet", () => {
      expect(getSeaportAddress(Chain.Mainnet)).to.equal(
        CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
      );
    });

    test("returns Gunzilla Seaport 1.6 for Gunzilla", () => {
      expect(getSeaportAddress(Chain.Gunzilla)).to.equal(
        GUNZILLA_SEAPORT_1_6_ADDRESS,
      );
    });

    test("returns Gunzilla Seaport 1.6 for Somnia", () => {
      expect(getSeaportAddress(Chain.Somnia)).to.equal(
        GUNZILLA_SEAPORT_1_6_ADDRESS,
      );
    });

    test("returns cross-chain Seaport 1.6 for other chains", () => {
      const otherChains = [
        Chain.Polygon,
        Chain.Arbitrum,
        Chain.Base,
        Chain.Optimism,
        Chain.Zora,
      ];

      for (const chain of otherChains) {
        expect(getSeaportAddress(chain)).to.equal(
          CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
        );
      }
    });
  });

  suite("getSignedZone", () => {
    test("returns OpenSea signed zone for Mainnet", () => {
      expect(getSignedZone(Chain.Mainnet)).to.equal(SIGNED_ZONE);
    });

    test("returns Gunzilla signed zone for Gunzilla", () => {
      expect(getSignedZone(Chain.Gunzilla)).to.equal(
        GUNZILLA_SIGNED_ZONE_V2_ADDRESS,
      );
    });

    test("returns Gunzilla signed zone for Somnia", () => {
      expect(getSignedZone(Chain.Somnia)).to.equal(
        GUNZILLA_SIGNED_ZONE_V2_ADDRESS,
      );
    });

    test("returns OpenSea signed zone for other chains", () => {
      const otherChains = [
        Chain.Polygon,
        Chain.Arbitrum,
        Chain.Base,
        Chain.Optimism,
      ];

      for (const chain of otherChains) {
        expect(getSignedZone(chain)).to.equal(SIGNED_ZONE);
      }
    });
  });

  suite("getFeeRecipient", () => {
    test("returns OpenSea fee recipient for Mainnet", () => {
      expect(getFeeRecipient(Chain.Mainnet)).to.equal(OPENSEA_FEE_RECIPIENT);
    });

    test("returns Gunzilla fee recipient for Gunzilla", () => {
      expect(getFeeRecipient(Chain.Gunzilla)).to.equal(GUNZILLA_FEE_RECIPIENT);
    });

    test("returns Somnia fee recipient for Somnia", () => {
      expect(getFeeRecipient(Chain.Somnia)).to.equal(SOMNIA_FEE_RECIPIENT);
    });

    test("returns OpenSea fee recipient for other chains", () => {
      const otherChains = [
        Chain.Polygon,
        Chain.Arbitrum,
        Chain.Base,
        Chain.Optimism,
        Chain.Zora,
      ];

      for (const chain of otherChains) {
        expect(getFeeRecipient(chain)).to.equal(OPENSEA_FEE_RECIPIENT);
      }
    });
  });
});
