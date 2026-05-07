import { getTransactionReceiptPath } from "./apiPaths"
import type { Fetcher } from "./fetcher"
import type {
  TransactionReceiptRequest,
  TransactionReceiptResponse,
} from "./types"

/**
 * Transaction-related API operations
 */
export class TransactionsAPI {
  constructor(private fetcher: Fetcher) {}

  /**
   * Get the receipt/status for a submitted transaction.
   * Works for all transaction types: listing fulfillments, cross-chain buys,
   * sweeps, offer fulfillments, and token swaps. Poll this endpoint to check
   * completion status.
   */
  async getTransactionReceipt(
    request: TransactionReceiptRequest,
  ): Promise<TransactionReceiptResponse> {
    return this.fetcher.post<TransactionReceiptResponse>(
      getTransactionReceiptPath(),
      request,
    )
  }
}
