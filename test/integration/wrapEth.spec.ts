import { assert } from "chai";
import { parseEther } from "ethers/lib/utils";
import { describe, test } from "mocha";
import { ETH_TO_WRAP, sdk, walletAddress } from "./setup";
import { Chain, TokenStandard } from "../../src/types";
import { getCanonicalWrappedEther } from "../../src/utils/tokens";

describe("SDK: WETH", () => {
  test("Wrap ETH and Unwrap", async function () {
    if (!ETH_TO_WRAP) {
      this.skip();
      return;
    }

    const wethAsset = {
      tokenAddress: getCanonicalWrappedEther(Chain.Mainnet).address,
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
      startingWethBalance.add(ethToWrapInWei).toString(),
      endingWethBalance.toString(),
      "Balances should match."
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
      "Balances should match."
    );
  }).timeout(30000);
});
