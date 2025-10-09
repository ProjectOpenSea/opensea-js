import { assert, expect } from "chai";
import { suite, test } from "mocha";
import { Chain } from "../../src/types";
import { getSdkForChain } from "../utils/setupIntegration";

suite("SDK: NFTs", () => {
  test("Get NFTs By Collection", async () => {
    const response = await getSdkForChain(
      Chain.Mainnet,
    ).api.getNFTsByCollection("moonbirds");
    assert(response, "Response should exist.");
    assert.equal(response.nfts.length, 50, "Response should include 50 NFTs");
    assert(response.next, "Response should have a next cursor");
  });

  test("Get NFTs By Contract", async () => {
    const tokenAddress = "0x4768cbf202f365fbf704b9b9d397551a0443909b"; // Roo Troop
    const response = await getSdkForChain(Chain.Mainnet).api.getNFTsByContract(
      tokenAddress,
      undefined,
      undefined,
      Chain.Polygon,
    );
    assert(response, "Response should exist.");
    assert.equal(response.nfts.length, 50, "Response should include 50 NFTs");
    assert(response.next, "Response should have a next cursor");
  });

  test("Get NFTs By Account", async () => {
    const address = "0xfBa662e1a8e91a350702cF3b87D0C2d2Fb4BA57F";
    const response = await getSdkForChain(Chain.Mainnet).api.getNFTsByAccount(
      address,
    );
    assert(response, "Response should exist.");
    assert.equal(response.nfts.length, 50, "Response should include 50 NFTs");
    assert(response.next, "Response should have a next cursor");
  });

  test("Get NFT", async () => {
    const tokenAddress = "0x4768cbf202f365fbf704b9b9d397551a0443909b"; // Roo Troop
    const tokenId = "2";
    const response = await getSdkForChain(Chain.Mainnet).api.getNFT(
      tokenAddress,
      tokenId,
      Chain.Polygon,
    );
    assert(response.nft, "Response should contain nft.");
    assert.equal(response.nft.contract, tokenAddress, "The address matches");
    assert.equal(response.nft.identifier, tokenId, "The token id matches");
  });

  test("Refresh NFT", async () => {
    const tokenAddress = "0x4768cbf202f365fbf704b9b9d397551a0443909b"; // Roo Troop
    const identifier = "3";
    const response = await getSdkForChain(Chain.Mainnet).api.refreshNFTMetadata(
      tokenAddress,
      identifier,
      Chain.Polygon,
    );
    assert(response, "Response should exist.");
    expect(response).to.contain(`contract ${tokenAddress}`);
    expect(response).to.contain(`token_id ${identifier}`);
  });
});
