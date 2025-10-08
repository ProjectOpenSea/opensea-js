import { assert } from "chai";
import { ethers } from "ethers";
import { suite, test } from "mocha";
import { TokenStandard } from "../../src/types";
import { client } from "../utils/sdk";

suite("SDK: getBalance", () => {
  const accountAddress = "0x000000000000000000000000000000000000dEaD";

  test("Returns balance for ERC20", async () => {
    const asset = {
      tokenStandard: TokenStandard.ERC20,
      // WETH
      tokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      tokenId: null,
    };
    const balance = await client.getBalance({ accountAddress, asset });
    assert(balance > ethers.parseEther("0.05"));
  });

  test("Returns balance for ERC721", async () => {
    const asset = {
      tokenStandard: TokenStandard.ERC721,
      tokenAddress: "0x0cdd3cb3bcd969c2b389488b51fb093cc0d703b1",
      tokenId: "183",
    };
    const balance = await client.getBalance({ accountAddress, asset });
    assert(balance === 1n);
  });

  test("Returns balance for ERC1155", async () => {
    const asset = {
      tokenStandard: TokenStandard.ERC1155,
      tokenAddress: "0x1e196b7873b8456437309ba3fa748fa6f1602da8",
      tokenId: "21",
    };
    const balance = await client.getBalance({ accountAddress, asset });
    assert(balance >= 2n);
  });
});
