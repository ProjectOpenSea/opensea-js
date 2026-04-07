import { describe, expect, test } from "vitest"
import { Chain } from "../../src/types"
import { getSdkForChain } from "../utils/setupIntegration"

describe("SDK: NFTs", () => {
  test("Get NFTs By Collection", async () => {
    const response = await getSdkForChain(
      Chain.Mainnet,
    ).api.getNFTsByCollection("moonbirds")
    expect(response).toBeTruthy()
    expect(response.nfts.length).toBe(50)
    expect(response.next).toBeTruthy()
  })

  test("Get NFTs By Contract", async () => {
    const tokenAddress = "0x4768cbf202f365fbf704b9b9d397551a0443909b" // Roo Troop
    const response = await getSdkForChain(Chain.Mainnet).api.getNFTsByContract(
      tokenAddress,
      undefined,
      undefined,
      Chain.Polygon,
    )
    expect(response).toBeTruthy()
    expect(response.nfts.length).toBe(50)
    expect(response.next).toBeTruthy()
  })

  test("Get NFTs By Account", async () => {
    const address = "0xfBa662e1a8e91a350702cF3b87D0C2d2Fb4BA57F"
    const response = await getSdkForChain(Chain.Mainnet).api.getNFTsByAccount(
      address,
    )
    expect(response).toBeTruthy()
    expect(response.nfts.length).toBe(50)
    expect(response.next).toBeTruthy()
  })

  test("Get NFT", async () => {
    const tokenAddress = "0x4768cbf202f365fbf704b9b9d397551a0443909b" // Roo Troop
    const tokenId = "2"
    const response = await getSdkForChain(Chain.Mainnet).api.getNFT(
      tokenAddress,
      tokenId,
      Chain.Polygon,
    )
    expect(response.nft).toBeTruthy()
    expect(response.nft.contract).toBe(tokenAddress)
    expect(response.nft.identifier).toBe(tokenId)
  })

  test("Refresh NFT", async () => {
    const tokenAddress = "0x4768cbf202f365fbf704b9b9d397551a0443909b" // Roo Troop
    const identifier = "3"
    const response = await getSdkForChain(Chain.Mainnet).api.refreshNFTMetadata(
      tokenAddress,
      identifier,
      Chain.Polygon,
    )
    expect(response, "Response should exist.").toBeTruthy()
    expect(response).toContain(`contract ${tokenAddress}`)
    expect(response).toContain(`token_id ${identifier}`)
  })
})
