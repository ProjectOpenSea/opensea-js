import { BigNumberish, Contract, parseEther } from "ethers";
import { EventType } from "../types";
import { SDKContext } from "./context";
import { getNativeWrapTokenAddress } from "../utils/chain";

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
    amountInEth: BigNumberish;
    accountAddress: string;
  }) {
    await this.context.requireAccountIsAvailable(accountAddress);

    const value = parseEther(amountInEth.toString());

    this.context.dispatch(EventType.WrapEth, { accountAddress, amount: value });

    const wethContract = new Contract(
      getNativeWrapTokenAddress(this.context.chain),
      ["function deposit() payable"],
      this.context.signerOrProvider,
    );

    try {
      const transaction = await wethContract.deposit({ value });
      await this.context.confirmTransaction(
        transaction.hash,
        EventType.WrapEth,
        "Wrapping native asset",
      );
    } catch (error) {
      console.error(error);
      this.context.dispatch(EventType.TransactionDenied, {
        error,
        accountAddress,
      });
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
    amountInEth: BigNumberish;
    accountAddress: string;
  }) {
    await this.context.requireAccountIsAvailable(accountAddress);

    const amount = parseEther(amountInEth.toString());

    this.context.dispatch(EventType.UnwrapWeth, { accountAddress, amount });

    const wethContract = new Contract(
      getNativeWrapTokenAddress(this.context.chain),
      ["function withdraw(uint wad) public"],
      this.context.signerOrProvider,
    );

    try {
      const transaction = await wethContract.withdraw(amount);
      await this.context.confirmTransaction(
        transaction.hash,
        EventType.UnwrapWeth,
        "Unwrapping wrapped native asset",
      );
    } catch (error) {
      console.error(error);
      this.context.dispatch(EventType.TransactionDenied, {
        error,
        accountAddress,
      });
    }
  }
}
