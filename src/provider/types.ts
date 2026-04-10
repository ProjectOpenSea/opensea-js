/**
 * Abstract provider interfaces for the OpenSea SDK.
 * These allow the SDK to work with both ethers and viem (or any other library).
 */

/** Transaction receipt returned after sending a transaction. */
export interface TransactionResponse {
  hash: string
  wait(): Promise<void>
}

/** Minimal signer interface for the OpenSea SDK. */
export interface OpenSeaSigner {
  getAddress(): Promise<string>
  sendTransaction(tx: {
    to: string
    data?: string
    value?: bigint
    from?: string
    overrides?: Record<string, unknown>
  }): Promise<TransactionResponse>
  signTypedData(
    domain: {
      chainId: string | number
      name: string
      version: string
      verifyingContract: string
    },
    types: Record<string, Array<{ name: string; type: string }>>,
    value: Record<string, unknown>,
  ): Promise<string>
}

/** Minimal provider interface for the OpenSea SDK. */
export interface OpenSeaProvider {
  waitForTransaction(hash: string): Promise<void>
}

/** Combined wallet: either signer+provider or provider-only. */
export type OpenSeaWallet =
  | { signer: OpenSeaSigner; provider: OpenSeaProvider }
  | { provider: OpenSeaProvider }

/** Contract read/write interface. */
export interface ContractCaller {
  readContract(params: {
    address: string
    abi: readonly unknown[]
    functionName: string
    args: unknown[]
  }): Promise<unknown>

  writeContract(params: {
    address: string
    abi: readonly unknown[]
    functionName: string
    args: unknown[]
    value?: bigint
    overrides?: Record<string, unknown>
  }): Promise<TransactionResponse>

  encodeFunctionData(params: {
    abi: readonly unknown[]
    functionName: string
    args: unknown[]
  }): string
}
