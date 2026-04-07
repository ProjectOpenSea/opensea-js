import type { Chain, OpenSeaAccount, OpenSeaPaymentToken } from "../types"
import { accountFromJSON, paymentTokenFromJSON } from "../utils/converters"
import { getAccountPath, getPaymentTokenPath } from "./apiPaths"
import type { Fetcher } from "./fetcher"

/**
 * Account and payment token related API operations
 */
export class AccountsAPI {
  constructor(
    private fetcher: Fetcher,
    private chain: Chain,
  ) {}

  /**
   * Fetch a payment token.
   */
  async getPaymentToken(
    address: string,
    chain = this.chain,
  ): Promise<OpenSeaPaymentToken> {
    const json = await this.fetcher.get<OpenSeaPaymentToken>(
      getPaymentTokenPath(chain, address),
    )
    return paymentTokenFromJSON(json)
  }

  /**
   * Fetch account for an address.
   */
  async getAccount(address: string): Promise<OpenSeaAccount> {
    const json = await this.fetcher.get<OpenSeaAccount>(getAccountPath(address))
    return accountFromJSON(json)
  }
}
