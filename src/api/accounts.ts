import { getPaymentTokenPath, getAccountPath } from "./apiPaths";
import { Fetcher } from "./fetcher";
import { Chain, OpenSeaAccount, OpenSeaPaymentToken } from "../types";
import { paymentTokenFromJSON, accountFromJSON } from "../utils/converters";

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
    );
    return paymentTokenFromJSON(json);
  }

  /**
   * Fetch account for an address.
   */
  async getAccount(address: string): Promise<OpenSeaAccount> {
    const json = await this.fetcher.get<OpenSeaAccount>(
      getAccountPath(address),
    );
    return accountFromJSON(json);
  }
}
