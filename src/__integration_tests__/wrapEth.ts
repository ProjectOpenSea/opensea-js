import { assert } from "chai";
import { formatEther } from "ethers/lib/utils";
import { describe, test } from "mocha";
import { ETH_TO_WRAP, sdk, walletAddress } from "./init";
import { Network, TokenStandard } from "../types";
import { getCanonicalWrappedEther } from "../utils/tokens";

// Skip this test if there is no ETH to wrap/unwrap
(ETH_TO_WRAP ? describe.only : describe.skip)("SDK: WETH", () => {
  test("Wrap ETH and Unwrap", async () => {
    const wethAsset = {
      tokenAddress: getCanonicalWrappedEther(Network.Main).address,
      tokenId: null,
      tokenStandard: TokenStandard.ERC20,
    };
    const startingWethBalance = await sdk.getBalance({
      accountAddress: walletAddress,
      asset: wethAsset,
    });
    const startingWeth = formatEther(startingWethBalance.toString());
    console.log(`Starting Weth: ${startingWeth}`);

    const ethToWrap = Number(ETH_TO_WRAP);
    await sdk.wrapEth({
      amountInEth: ethToWrap,
      accountAddress: walletAddress,
    });

    const newWethBalance = await sdk.getBalance({
      accountAddress: walletAddress,
      asset: wethAsset,
    });

    const newWeth = formatEther(newWethBalance.toString());
    console.log(`New Weth: ${newWeth}`);

    assert(
      Number(startingWeth) + Number(ethToWrap) === Number(newWeth),
      "Balances should match."
    );

    await sdk.unwrapWeth({
      amountInEth: ethToWrap,
      accountAddress: walletAddress,
    });

    const finalWethBalance = await sdk.getBalance({
      accountAddress: walletAddress,
      asset: wethAsset,
    });
    const finalWeth = formatEther(finalWethBalance.toString());
    console.log(`Final Weth: ${finalWeth}`);
    assert(
      Number(startingWeth) === Number(finalWeth),
      "Balances should match."
    );
  }).timeout(30000);
});
