import { assert } from "chai";
import { parseEther } from "ethers";
import { describe, test } from "mocha";
import { TokenStandard, Chain } from "../../src/types";
import {
  ETH_TO_WRAP,
  getSdkForChain,
  walletAddress,
  requireIntegrationEnv,
} from "../utils/setupIntegration";

describe("SDK: WETH", () => {
  beforeEach(() => {
    requireIntegrationEnv();
  });

  test("Wrap ETH and Unwrap", async function () {
    if (!ETH_TO_WRAP) {
      console.log("ETH_TO_WRAP not set, skipping");
      return;
    }
    const startingBalance = await getSdkForChain(Chain.Mainnet).getBalance({
      accountAddress: walletAddress,
      asset: {
        tokenAddress: getSdkForChain(Chain.Mainnet).getNativeWrapTokenAddress(
          getSdkForChain(Chain.Mainnet).chain,
        ),
        tokenId: null,
        tokenStandard: TokenStandard.ERC20,
      },
    });
    console.log("Starting WETH balance:", startingBalance.toString());

    await getSdkForChain(Chain.Mainnet).wrapEth({
      accountAddress: walletAddress,
      amountInEth: ETH_TO_WRAP,
    });

    const wethAsset = {
      tokenAddress: getSdkForChain(Chain.Mainnet).getNativeWrapTokenAddress(
        getSdkForChain(Chain.Mainnet).chain,
      ),
      tokenId: null,
      tokenStandard: TokenStandard.ERC20,
    };

    const wrappedBalance = await getSdkForChain(Chain.Mainnet).getBalance({
      accountAddress: walletAddress,
      asset: wethAsset,
    });
    console.log("Wrapped WETH balance:", wrappedBalance.toString());

    const wethAcquired = wrappedBalance - startingBalance;
    console.log("WETH acquired:", wethAcquired.toString());

    const expectedWrappedBalance = parseEther(ETH_TO_WRAP.toString());
    assert.equal(wethAcquired, expectedWrappedBalance, "WETH balance");

    console.log("Unwrapping WETH...");
    await getSdkForChain(Chain.Mainnet).unwrapWeth({
      accountAddress: walletAddress,
      amountInEth: ETH_TO_WRAP,
    });

    const unwrappedBalance = await getSdkForChain(Chain.Mainnet).getBalance({
      accountAddress: walletAddress,
      asset: wethAsset,
    });
    console.log("Unwrapped WETH balance:", unwrappedBalance.toString());

    const endingBalance = unwrappedBalance - startingBalance;
    console.log("Final WETH balance:", endingBalance.toString());

    assert.equal(endingBalance, 0n, "WETH balance should be 0");
  }).timeout(30000);
});
