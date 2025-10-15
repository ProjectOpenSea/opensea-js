import {
  BigNumberish,
  Contract,
  Signer,
  parseEther,
  JsonRpcProvider,
} from "ethers";
import { EventType, Chain } from "../types";

/**
 * Token wrapping and unwrapping operations
 */
export class TokensManager {
  constructor(
    private signerOrProvider: Signer | JsonRpcProvider,
    private chain: Chain,
    private dispatch: (event: EventType, data: any) => void,
    private confirmTransaction: (
      hash: string,
      event: EventType,
      description: string,
    ) => Promise<void>,
    private getNativeWrapTokenAddress: (chain: Chain) => string,
  ) {}

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
    const value = parseEther(amountInEth.toString());

    this.dispatch(EventType.WrapEth, { accountAddress, amount: value });

    const wethContract = new Contract(
      this.getNativeWrapTokenAddress(this.chain),
      ["function deposit() payable"],
      this.signerOrProvider,
    );

    try {
      const transaction = await wethContract.deposit({ value });
      await this.confirmTransaction(
        transaction.hash,
        EventType.WrapEth,
        "Wrapping native asset",
      );
    } catch (error) {
      console.error(error);
      this.dispatch(EventType.TransactionDenied, { error, accountAddress });
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
    const amount = parseEther(amountInEth.toString());

    this.dispatch(EventType.UnwrapWeth, { accountAddress, amount });

    const wethContract = new Contract(
      this.getNativeWrapTokenAddress(this.chain),
      ["function withdraw(uint wad) public"],
      this.signerOrProvider,
    );

    try {
      const transaction = await wethContract.withdraw(amount);
      await this.confirmTransaction(
        transaction.hash,
        EventType.UnwrapWeth,
        "Unwrapping wrapped native asset",
      );
    } catch (error) {
      console.error(error);
      this.dispatch(EventType.TransactionDenied, { error, accountAddress });
    }
  }
}
