import { assert } from "chai";
import { parseEther } from "ethers";
import { describe, test } from "mocha";
import type { OpenSeaSDK } from "src";
import { ETH_TO_WRAP, sdk, sdkNoAddressProperty, walletAddress } from "./setup";
import { TokenStandard } from "../../src/types";
import { getWETHAddress } from "../../src/utils";

describe("SDK: WETH", () => {
  async function testWrapAndUnwrap(
    testContext: Mocha.Context,
    sdk: OpenSeaSDK,
  ) {
    if (!ETH_TO_WRAP) {
      return testContext.skip();
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
  }
  test("Wrap ETH and Unwrap", async function () {
    await testWrapAndUnwrap(this, sdk);
  }).timeout(30000);

  test("Wrap ETH and unwrap without address property on ethers.Signer", async function () {
    await testWrapAndUnwrap(this, sdkNoAddressProperty);
  }).timeout(30000);
});
