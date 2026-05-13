import { getTransferAssetsPath } from "./apiPaths"
import type { Fetcher } from "./fetcher"
import type { TransferRequest, TransferResponse } from "./types"

/**
 * Asset transfer API operations.
 *
 * Returns ready-to-sign transaction data for moving NFTs or tokens from
 * one wallet to another. The endpoint supports multi-asset transfers in
 * a single request; the response is an ordered list of transactions to
 * submit onchain.
 */
export class AssetsAPI {
  constructor(private fetcher: Fetcher) {}

  /**
   * Build transactions to transfer one or more NFTs or fungible tokens.
   */
  async transferAssets(request: TransferRequest): Promise<TransferResponse> {
    return this.fetcher.post<TransferResponse>(getTransferAssetsPath(), request)
  }
}
