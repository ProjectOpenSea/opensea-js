import { assert } from "chai";
import { parseEther } from "ethers";
import { describe, test } from "mocha";
import { ETH_TO_WRAP, sdk, walletAddress } from "./setup";
import { TokenStandard } from "../../src/types";
import { getWETHAddress } from "../../src/utils";

describe("SDK: WETH", () => {
  test("Wrap ETH and Unwrap", async function () {
    if (!ETH_TO_WRAP) {
      this.skip();
    }

    const wethAsset = {
      tokenAddress: getWETHAddress(sdk.chain),
      tokenId: null,
      tokenStandard: TokenStandard.ERC20,
    };
    const startingWethBalance = await sdk.getBalance({
      accountAddress: walletAddress,
      asset: wethAsset,
    });

    await sdk.wrapEth({
      amountInEth: ETH_TO_WRAP,
      accountAddress: walletAddress,
    });

    const endingWethBalance = await sdk.getBalance({
      accountAddress: walletAddress,
      asset: wethAsset,
    });

    const ethToWrapInWei = parseEther(ETH_TO_WRAP);

    assert.equal(
      startingWethBalance + ethToWrapInWei,
      endingWethBalance,
      "Balances should match.",
    );

    await sdk.unwrapWeth({
      amountInEth: ETH_TO_WRAP,
      accountAddress: walletAddress,
    });

    const finalWethBalance = await sdk.getBalance({
      accountAddress: walletAddress,
      asset: wethAsset,
    });
    assert.equal(
      startingWethBalance.toString(),
      finalWethBalance.toString(),
      "Balances should match.",
    );
  }).timeout(30000);
});
