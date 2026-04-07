import { parseEther } from "ethers"
import { describe, expect, test } from "vitest"
import { Chain, TokenStandard } from "../../src/types"
import { getNativeWrapTokenAddress } from "../../src/utils/chain"
import {
  ETH_TO_WRAP,
  getSdkForChain,
  requireIntegrationEnv,
  walletAddress,
} from "../utils/setupIntegration"

describe("SDK: WETH", () => {
  beforeEach(() => {
    requireIntegrationEnv()
  })

  test("Wrap ETH and Unwrap", async () => {
    if (!ETH_TO_WRAP) {
      console.log("ETH_TO_WRAP not set, skipping")
      return
    }
    const startingBalance = await getSdkForChain(Chain.Mainnet).getBalance({
      accountAddress: walletAddress,
      asset: {
        tokenAddress: getNativeWrapTokenAddress(Chain.Mainnet),
        tokenId: null,
        tokenStandard: TokenStandard.ERC20,
      },
    })
    console.log("Starting WETH balance:", startingBalance.toString())

    await getSdkForChain(Chain.Mainnet).wrapEth({
      accountAddress: walletAddress,
      amountInEth: ETH_TO_WRAP,
    })

    const wethAsset = {
      tokenAddress: getNativeWrapTokenAddress(Chain.Mainnet),
      tokenId: null,
      tokenStandard: TokenStandard.ERC20,
    }

    const wrappedBalance = await getSdkForChain(Chain.Mainnet).getBalance({
      accountAddress: walletAddress,
      asset: wethAsset,
    })
    console.log("Wrapped WETH balance:", wrappedBalance.toString())

    const wethAcquired = wrappedBalance - startingBalance
    console.log("WETH acquired:", wethAcquired.toString())

    const expectedWrappedBalance = parseEther(ETH_TO_WRAP.toString())
    expect(wethAcquired).toBe(expectedWrappedBalance)

    console.log("Unwrapping WETH...")
    await getSdkForChain(Chain.Mainnet).unwrapWeth({
      accountAddress: walletAddress,
      amountInEth: ETH_TO_WRAP,
    })

    const unwrappedBalance = await getSdkForChain(Chain.Mainnet).getBalance({
      accountAddress: walletAddress,
      asset: wethAsset,
    })
    console.log("Unwrapped WETH balance:", unwrappedBalance.toString())

    const endingBalance = unwrappedBalance - startingBalance
    console.log("Final WETH balance:", endingBalance.toString())

    expect(endingBalance).toBe(0n)
  }, 30000)
})
