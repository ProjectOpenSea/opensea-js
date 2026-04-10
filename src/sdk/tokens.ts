import { WETH_DEPOSIT_ABI, WETH_WITHDRAW_ABI } from "../abi/abis"
import { type Amount, EventType } from "../types"
import { getNativeWrapTokenAddress } from "../utils/chain"
import { parseEther } from "../utils/units"
import type { SDKContext } from "./context"

/**
 * Token wrapping and unwrapping operations
 */
export class TokensManager {
  constructor(private context: SDKContext) {}

  /**
   * Wrap native asset into wrapped native asset (e.g. ETH into WETH, POL into WPOL).
   * Wrapped native assets are needed for making offers.
   * @param options
   * @param options.amountInEth Amount of native asset to wrap
   * @param options.accountAddress Address of the user's wallet containing the native asset
   */
  async wrapEth({
    amountInEth,
    accountAddress,
  }: {
    amountInEth: Amount
    accountAddress: string
  }) {
    await this.context.requireAccountIsAvailable(accountAddress)

    const value = parseEther(amountInEth.toString())

    this.context.dispatch(EventType.WrapEth, { accountAddress, amount: value })

    try {
      const transaction = await this.context.contractCaller.writeContract({
        address: getNativeWrapTokenAddress(this.context.chain),
        abi: WETH_DEPOSIT_ABI,
        functionName: "deposit",
        args: [],
        value,
      })
      await this.context.confirmTransaction(
        transaction.hash,
        EventType.WrapEth,
        "Wrapping native asset",
      )
    } catch (error) {
      console.error(error)
      this.context.dispatch(EventType.TransactionDenied, {
        error,
        accountAddress,
      })
    }
  }

  /**
   * Unwrap wrapped native asset into native asset (e.g. WETH into ETH, WPOL into POL).
   * Emits the `UnwrapWeth` event when the transaction is prompted.
   * @param options
   * @param options.amountInEth How much wrapped native asset to unwrap
   * @param options.accountAddress Address of the user's wallet containing the wrapped native asset
   */
  async unwrapWeth({
    amountInEth,
    accountAddress,
  }: {
    amountInEth: Amount
    accountAddress: string
  }) {
    await this.context.requireAccountIsAvailable(accountAddress)

    const amount = parseEther(amountInEth.toString())

    this.context.dispatch(EventType.UnwrapWeth, { accountAddress, amount })

    try {
      const transaction = await this.context.contractCaller.writeContract({
        address: getNativeWrapTokenAddress(this.context.chain),
        abi: WETH_WITHDRAW_ABI,
        functionName: "withdraw",
        args: [amount],
      })
      await this.context.confirmTransaction(
        transaction.hash,
        EventType.UnwrapWeth,
        "Unwrapping wrapped native asset",
      )
    } catch (error) {
      console.error(error)
      this.context.dispatch(EventType.TransactionDenied, {
        error,
        accountAddress,
      })
    }
  }
}
