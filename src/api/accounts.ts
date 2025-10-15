import { getPaymentTokenPath, getAccountPath } from "./apiPaths";
import { Chain, OpenSeaAccount, OpenSeaPaymentToken } from "../types";
import { paymentTokenFromJSON, accountFromJSON } from "../utils/converters";

/**
 * Account and payment token related API operations
 */
export class AccountsAPI {
  constructor(
    private get: <T>(apiPath: string, query?: object) => Promise<T>,
    private chain: Chain,
  ) {}

  /**
   * Fetch a payment token.
   */
  async getPaymentToken(
    address: string,
    chain = this.chain,
  ): Promise<OpenSeaPaymentToken> {
    const json = await this.get<OpenSeaPaymentToken>(
      getPaymentTokenPath(chain, address),
    );
    return paymentTokenFromJSON(json);
  }

  /**
   * Fetch account for an address.
   */
  async getAccount(address: string): Promise<OpenSeaAccount> {
    const json = await this.get<OpenSeaAccount>(getAccountPath(address));
    return accountFromJSON(json);
  }
}
