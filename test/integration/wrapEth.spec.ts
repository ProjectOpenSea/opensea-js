import { assert } from "chai";
import { parseEther } from "ethers";
import { describe, test } from "mocha";
import { TokenStandard } from "../../src/types";
import { ETH_TO_WRAP, sdk, walletAddress } from "../utils/setup";

describe("SDK: WETH", () => {
  test("Wrap ETH and Unwrap", async function () {
    if (!ETH_TO_WRAP) {
      console.log("ETH_TO_WRAP not set, skipping");
      return;
    }
    const startingBalance = await sdk.getBalance({
      accountAddress: walletAddress,
      asset: {
        tokenAddress: sdk.getNativeWrapTokenAddress(sdk.chain),
        tokenId: null,
        tokenStandard: TokenStandard.ERC20,
      },
    });
    console.log("Starting WETH balance:", startingBalance.toString());

    await sdk.wrapEth({
      accountAddress: walletAddress,
      amountInEth: ETH_TO_WRAP,
    });

    const wethAsset = {
      tokenAddress: sdk.getNativeWrapTokenAddress(sdk.chain),
      tokenId: null,
      tokenStandard: TokenStandard.ERC20,
    };

    const wrappedBalance = await sdk.getBalance({
      accountAddress: walletAddress,
      asset: wethAsset,
    });
    console.log("Wrapped WETH balance:", wrappedBalance.toString());

    const wethAcquired = wrappedBalance - startingBalance;
    console.log("WETH acquired:", wethAcquired.toString());

    const expectedWrappedBalance = parseEther(ETH_TO_WRAP.toString());
    assert.equal(wethAcquired, expectedWrappedBalance, "WETH balance");

    console.log("Unwrapping WETH...");
    await sdk.unwrapWeth({
      accountAddress: walletAddress,
      amountInEth: ETH_TO_WRAP,
    });

    const unwrappedBalance = await sdk.getBalance({
      accountAddress: walletAddress,
      asset: wethAsset,
    });
    console.log("Unwrapped WETH balance:", unwrappedBalance.toString());

    const endingBalance = unwrappedBalance - startingBalance;
    console.log("Final WETH balance:", endingBalance.toString());

    assert.equal(endingBalance, 0n, "WETH balance should be 0");
  }).timeout(30000);
});
