import { CROSS_CHAIN_SEAPORT_V1_6_ADDRESS } from "@opensea/seaport-js/lib/constants"
import { describe, expect, test } from "vitest"
import {
  ALTERNATE_CONDUIT_ADDRESS,
  ALTERNATE_CONDUIT_KEY,
  ALTERNATE_FEE_RECIPIENT,
  ALTERNATE_SEAPORT_V1_6_ADDRESS,
  ALTERNATE_SIGNED_ZONE_V2_ADDRESS,
  GUNZILLA_FEE_RECIPIENT,
  OPENSEA_CONDUIT_ADDRESS,
  OPENSEA_CONDUIT_ADDRESS_2,
  OPENSEA_CONDUIT_KEY,
  OPENSEA_CONDUIT_KEY_2,
  OPENSEA_FEE_RECIPIENT,
  OPENSEA_SIGNED_ZONE_V2,
  SOMNIA_FEE_RECIPIENT,
  WPOL_ADDRESS,
} from "../../src/constants"
import { Chain } from "../../src/types"
import {
  getChainId,
  getDefaultConduit,
  getFeeRecipient,
  getListingPaymentToken,
  getNativeWrapTokenAddress,
  getOfferPaymentToken,
  getSeaportAddress,
  getSignedZone,
  usesAlternateProtocol,
} from "../../src/utils/chain"

describe("Utils: chain", () => {
  describe("getChainId", () => {
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
      [Chain.Monad, "143"],
      [Chain.MegaETH, "4326"],
    ]

    for (const [chain, expectedId] of chainIdTests) {
      test(`returns correct chain ID for ${chain}`, () => {
        expect(getChainId(chain)).toBe(expectedId)
      })
    }

    test("throws for unknown chain", () => {
      expect(() => getChainId("UNKNOWN_CHAIN" as Chain)).toThrow(
        "Unknown chainId for UNKNOWN_CHAIN",
      )
    })
  })

  describe("getOfferPaymentToken", () => {
    test("returns WETH for Mainnet", () => {
      expect(getOfferPaymentToken(Chain.Mainnet)).toBe(
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      )
    })

    test("returns WETH for Polygon", () => {
      expect(getOfferPaymentToken(Chain.Polygon)).toBe(
        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      )
    })

    test("returns WAVAX for Avalanche", () => {
      expect(getOfferPaymentToken(Chain.Avalanche)).toBe(
        "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      )
    })

    test("returns WETH for Arbitrum", () => {
      expect(getOfferPaymentToken(Chain.Arbitrum)).toBe(
        "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      )
    })

    test("returns WETH for Blast", () => {
      expect(getOfferPaymentToken(Chain.Blast)).toBe(
        "0x4300000000000000000000000000000000000004",
      )
    })

    test("returns WETH for OP chains (same address)", () => {
      const opChains = [
        Chain.Base,
        Chain.Optimism,
        Chain.Zora,
        Chain.B3,
        Chain.Shape,
        Chain.Unichain,
      ]
      const expectedAddress = "0x4200000000000000000000000000000000000006"

      for (const chain of opChains) {
        expect(getOfferPaymentToken(chain)).toBe(expectedAddress)
      }
    })

    test("returns WBERA for BeraChain", () => {
      expect(getOfferPaymentToken(Chain.BeraChain)).toBe(
        "0x6969696969696969696969696969696969696969",
      )
    })

    test("returns WSEI for Sei", () => {
      expect(getOfferPaymentToken(Chain.Sei)).toBe(
        "0xe30fedd158a2e3b13e9badaeabafc5516e95e8c7",
      )
    })

    test("returns WFLOW for Flow", () => {
      expect(getOfferPaymentToken(Chain.Flow)).toBe(
        "0xd3bf53dac106a0290b0483ecbc89d40fcc961f3e",
      )
    })

    test("returns WAPE for ApeChain", () => {
      expect(getOfferPaymentToken(Chain.ApeChain)).toBe(
        "0x48b62137edfa95a428d35c09e44256a739f6b557",
      )
    })

    test("returns WRON for Ronin", () => {
      expect(getOfferPaymentToken(Chain.Ronin)).toBe(
        "0xe514d9deb7966c8be0ca922de8a064264ea6bcd4",
      )
    })

    test("returns WETH for Abstract", () => {
      expect(getOfferPaymentToken(Chain.Abstract)).toBe(
        "0x3439153eb7af838ad19d56e1571fbd09333c2809",
      )
    })

    test("returns WGUN for Gunzilla", () => {
      expect(getOfferPaymentToken(Chain.Gunzilla)).toBe(
        "0x5aad7bba61d95c2c4e525a35f4062040264611f1",
      )
    })

    test("returns WHYPE for HyperEVM", () => {
      expect(getOfferPaymentToken(Chain.HyperEVM)).toBe(
        "0x5555555555555555555555555555555555555555",
      )
    })

    test("returns WSOMI for Somnia", () => {
      expect(getOfferPaymentToken(Chain.Somnia)).toBe(
        "0x046ede9564a72571df6f5e44d0405360c0f4dcab",
      )
    })

    test("returns WETH for MegaETH", () => {
      expect(getOfferPaymentToken(Chain.MegaETH)).toBe(
        "0x4200000000000000000000000000000000000006",
      )
    })

    test("throws for unknown chain", () => {
      expect(() => getOfferPaymentToken("UNKNOWN_CHAIN" as Chain)).toThrow(
        "Unknown offer currency for UNKNOWN_CHAIN",
      )
    })
  })

  describe("getListingPaymentToken", () => {
    test("returns ETH (0x0) for Mainnet", () => {
      expect(getListingPaymentToken(Chain.Mainnet)).toBe(
        "0x0000000000000000000000000000000000000000",
      )
    })

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
        Chain.MegaETH,
      ]

      for (const chain of ethChains) {
        expect(getListingPaymentToken(chain)).toBe(
          "0x0000000000000000000000000000000000000000",
        )
      }
    })

    test("returns WETH for Polygon", () => {
      expect(getListingPaymentToken(Chain.Polygon)).toBe(
        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      )
    })

    test("returns WAVAX for Avalanche", () => {
      expect(getListingPaymentToken(Chain.Avalanche)).toBe(
        "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      )
    })

    test("returns BERA (0x0) for BeraChain", () => {
      expect(getListingPaymentToken(Chain.BeraChain)).toBe(
        "0x0000000000000000000000000000000000000000",
      )
    })

    test("returns SEI (0x0) for Sei", () => {
      expect(getListingPaymentToken(Chain.Sei)).toBe(
        "0x0000000000000000000000000000000000000000",
      )
    })

    test("returns WFLOW for Flow", () => {
      expect(getListingPaymentToken(Chain.Flow)).toBe(
        "0xd3bf53dac106a0290b0483ecbc89d40fcc961f3e",
      )
    })

    test("returns APE (0x0) for ApeChain", () => {
      expect(getListingPaymentToken(Chain.ApeChain)).toBe(
        "0x0000000000000000000000000000000000000000",
      )
    })

    test("returns WETH for Ronin", () => {
      expect(getListingPaymentToken(Chain.Ronin)).toBe(
        "0xe514d9deb7966c8be0ca922de8a064264ea6bcd4",
      )
    })

    test("returns GUN (0x0) for Gunzilla", () => {
      expect(getListingPaymentToken(Chain.Gunzilla)).toBe(
        "0x0000000000000000000000000000000000000000",
      )
    })

    test("throws for unknown chain", () => {
      expect(() => getListingPaymentToken("UNKNOWN_CHAIN" as Chain)).toThrow(
        "Unknown listing currency for UNKNOWN_CHAIN",
      )
    })
  })

  describe("getDefaultConduit", () => {
    test("returns default OpenSea conduit for Mainnet", () => {
      const result = getDefaultConduit(Chain.Mainnet)
      expect(result.key).toBe(OPENSEA_CONDUIT_KEY)
      expect(result.address).toBe(OPENSEA_CONDUIT_ADDRESS)
    })

    test("returns conduit 2 for Abstract", () => {
      const result = getDefaultConduit(Chain.Abstract)
      expect(result.key).toBe(OPENSEA_CONDUIT_KEY_2)
      expect(result.address).toBe(OPENSEA_CONDUIT_ADDRESS_2)
    })

    test("returns conduit 2 for HyperEVM", () => {
      const result = getDefaultConduit(Chain.HyperEVM)
      expect(result.key).toBe(OPENSEA_CONDUIT_KEY_2)
      expect(result.address).toBe(OPENSEA_CONDUIT_ADDRESS_2)
    })

    test("returns alternate conduit for Gunzilla", () => {
      const result = getDefaultConduit(Chain.Gunzilla)
      expect(result.key).toBe(ALTERNATE_CONDUIT_KEY)
      expect(result.address).toBe(ALTERNATE_CONDUIT_ADDRESS)
    })

    test("returns alternate conduit for Somnia", () => {
      const result = getDefaultConduit(Chain.Somnia)
      expect(result.key).toBe(ALTERNATE_CONDUIT_KEY)
      expect(result.address).toBe(ALTERNATE_CONDUIT_ADDRESS)
    })

    test("returns alternate conduit for MegaETH", () => {
      const result = getDefaultConduit(Chain.MegaETH)
      expect(result.key).toBe(ALTERNATE_CONDUIT_KEY)
      expect(result.address).toBe(ALTERNATE_CONDUIT_ADDRESS)
    })

    test("returns default OpenSea conduit for other chains", () => {
      const otherChains = [
        Chain.Polygon,
        Chain.Arbitrum,
        Chain.Base,
        Chain.Optimism,
      ]

      for (const chain of otherChains) {
        const result = getDefaultConduit(chain)
        expect(result.key).toBe(OPENSEA_CONDUIT_KEY)
        expect(result.address).toBe(OPENSEA_CONDUIT_ADDRESS)
      }
    })
  })

  describe("getSeaportAddress", () => {
    test("returns cross-chain Seaport 1.6 for Mainnet", () => {
      expect(getSeaportAddress(Chain.Mainnet)).toBe(
        CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
      )
    })

    test("returns alternate Seaport 1.6 for Gunzilla", () => {
      expect(getSeaportAddress(Chain.Gunzilla)).toBe(
        ALTERNATE_SEAPORT_V1_6_ADDRESS,
      )
    })

    test("returns alternate Seaport 1.6 for Somnia", () => {
      expect(getSeaportAddress(Chain.Somnia)).toBe(
        ALTERNATE_SEAPORT_V1_6_ADDRESS,
      )
    })

    test("returns alternate Seaport 1.6 for MegaETH", () => {
      expect(getSeaportAddress(Chain.MegaETH)).toBe(
        ALTERNATE_SEAPORT_V1_6_ADDRESS,
      )
    })

    test("returns cross-chain Seaport 1.6 for other chains", () => {
      const otherChains = [
        Chain.Polygon,
        Chain.Arbitrum,
        Chain.Base,
        Chain.Optimism,
        Chain.Zora,
      ]

      for (const chain of otherChains) {
        expect(getSeaportAddress(chain)).toBe(CROSS_CHAIN_SEAPORT_V1_6_ADDRESS)
      }
    })
  })

  describe("getSignedZone", () => {
    test("returns OpenSea signed zone for Mainnet", () => {
      expect(getSignedZone(Chain.Mainnet)).toBe(OPENSEA_SIGNED_ZONE_V2)
    })

    test("returns alternate signed zone for Gunzilla", () => {
      expect(getSignedZone(Chain.Gunzilla)).toBe(
        ALTERNATE_SIGNED_ZONE_V2_ADDRESS,
      )
    })

    test("returns alternate signed zone for Somnia", () => {
      expect(getSignedZone(Chain.Somnia)).toBe(ALTERNATE_SIGNED_ZONE_V2_ADDRESS)
    })

    test("returns alternate signed zone for MegaETH", () => {
      expect(getSignedZone(Chain.MegaETH)).toBe(
        ALTERNATE_SIGNED_ZONE_V2_ADDRESS,
      )
    })

    test("returns OpenSea signed zone for other chains", () => {
      const otherChains = [
        Chain.Polygon,
        Chain.Arbitrum,
        Chain.Base,
        Chain.Optimism,
      ]

      for (const chain of otherChains) {
        expect(getSignedZone(chain)).toBe(OPENSEA_SIGNED_ZONE_V2)
      }
    })
  })

  describe("getFeeRecipient", () => {
    test("returns OpenSea fee recipient for Mainnet", () => {
      expect(getFeeRecipient(Chain.Mainnet)).toBe(OPENSEA_FEE_RECIPIENT)
    })

    test("returns Gunzilla fee recipient for Gunzilla", () => {
      expect(getFeeRecipient(Chain.Gunzilla)).toBe(GUNZILLA_FEE_RECIPIENT)
    })

    test("returns Somnia fee recipient for Somnia", () => {
      expect(getFeeRecipient(Chain.Somnia)).toBe(SOMNIA_FEE_RECIPIENT)
    })

    test("returns alternate fee recipient for MegaETH", () => {
      expect(getFeeRecipient(Chain.MegaETH)).toBe(ALTERNATE_FEE_RECIPIENT)
    })

    test("returns OpenSea fee recipient for other chains", () => {
      const otherChains = [
        Chain.Polygon,
        Chain.Arbitrum,
        Chain.Base,
        Chain.Optimism,
        Chain.Zora,
      ]

      for (const chain of otherChains) {
        expect(getFeeRecipient(chain)).toBe(OPENSEA_FEE_RECIPIENT)
      }
    })
  })

  describe("usesAlternateProtocol", () => {
    test("returns true for Gunzilla", () => {
      expect(usesAlternateProtocol(Chain.Gunzilla)).toBe(true)
    })

    test("returns true for Somnia", () => {
      expect(usesAlternateProtocol(Chain.Somnia)).toBe(true)
    })

    test("returns true for MegaETH", () => {
      expect(usesAlternateProtocol(Chain.MegaETH)).toBe(true)
    })

    test("returns false for Mainnet", () => {
      expect(usesAlternateProtocol(Chain.Mainnet)).toBe(false)
    })

    test("returns false for other standard chains", () => {
      const standardChains = [
        Chain.Polygon,
        Chain.Arbitrum,
        Chain.Base,
        Chain.Optimism,
        Chain.Zora,
        Chain.Avalanche,
        Chain.Blast,
        Chain.Sei,
        Chain.BeraChain,
        Chain.Abstract,
        Chain.HyperEVM,
        Chain.Monad,
      ]

      for (const chain of standardChains) {
        expect(usesAlternateProtocol(chain)).toBe(false)
      }
    })
  })

  describe("getNativeWrapTokenAddress", () => {
    test("returns WPOL for Polygon", () => {
      expect(getNativeWrapTokenAddress(Chain.Polygon)).toBe(WPOL_ADDRESS)
    })

    test("returns WETH for Mainnet (same as offer token)", () => {
      expect(getNativeWrapTokenAddress(Chain.Mainnet)).toBe(
        getOfferPaymentToken(Chain.Mainnet),
      )
    })

    test("returns offer payment token for non-Polygon chains", () => {
      const nonPolygonChains = [
        Chain.Mainnet,
        Chain.Arbitrum,
        Chain.Base,
        Chain.Optimism,
        Chain.Avalanche,
        Chain.Blast,
        Chain.Gunzilla,
        Chain.Somnia,
        Chain.MegaETH,
      ]

      for (const chain of nonPolygonChains) {
        expect(getNativeWrapTokenAddress(chain)).toBe(
          getOfferPaymentToken(chain),
        )
      }
    })
  })
})
