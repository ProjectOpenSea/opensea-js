import type {
  AuthenticateOptions,
  AuthNonceResponse,
  AuthSigner,
  AuthToken,
  AuthTokenResponse,
  OpenSeaAuthConfig,
} from "./types"

export type {
  AccountType,
  ChainArch,
  CreateSiwxMessageOptions,
  LinkWalletWithSiwxOptions,
  ParseSiwxMessageResult,
} from "./siwx"
export {
  chainArchToAccountType,
  createSiwxMessage,
  linkWalletWithSiwx,
  parseSiwxMessage,
  requestSiwxNonce,
} from "./siwx"
export type {
  AuthenticateOptions,
  AuthNonceResponse,
  AuthSigner,
  AuthToken,
  AuthTokenResponse,
  OpenSeaAuthConfig,
}

const DEFAULT_AUTH_BASE_URL = "https://auth.opensea.io"

/** Buffer (in ms) before expiry at which auto-refresh triggers. */
const REFRESH_BUFFER_MS = 60_000

/**
 * SIWE-based authentication helper for OpenSea.
 *
 * Handles the full sign-in flow: nonce request, EIP-4361 message generation,
 * signature exchange, token caching, and automatic refresh.
 *
 * @example
 * ```ts
 * import { OpenSeaAuth } from "@opensea/sdk"
 *
 * const auth = new OpenSeaAuth()
 * const token = await auth.authenticate(signer, {
 *   scopes: ["read:eligibility", "write:orders"],
 * })
 *
 * // Auto-refresh before expiry
 * const freshToken = await auth.getValidToken()
 *
 * // Revoke
 * await auth.revoke(token.accessToken)
 * ```
 *
 * @category Authentication
 */
export class OpenSeaAuth {
  private readonly authBaseUrl: string
  private cachedToken: AuthToken | undefined

  constructor(config: OpenSeaAuthConfig = {}) {
    this.authBaseUrl = (config.authBaseUrl ?? DEFAULT_AUTH_BASE_URL).replace(
      /\/$/,
      "",
    )
  }

  /**
   * Run the full SIWE authentication flow:
   * 1. Request a nonce from the auth server
   * 2. Build an EIP-4361 SIWE message
   * 3. Sign it with the provided signer
   * 4. Exchange the signature for a scoped JWT token
   *
   * The returned token is cached in memory and will be auto-refreshed
   * by {@link getValidToken}.
   */
  async authenticate(
    signer: AuthSigner,
    options: AuthenticateOptions = {},
  ): Promise<AuthToken> {
    const address = await signer.getAddress()
    const { nonce } = await this.requestNonce()
    const message = generateSiweMessage(
      address,
      options.scopes ?? [],
      nonce,
      this.authBaseUrl,
    )
    const signature = await signer.signMessage(message)
    const tokenResponse = await this.exchangeSignature(message, signature)
    const token = toAuthToken(tokenResponse)
    this.cachedToken = token
    return token
  }

  /**
   * Return a valid access token, refreshing automatically if the cached
   * token is expired or about to expire.
   *
   * @throws If no token has been obtained yet via {@link authenticate}.
   */
  async getValidToken(): Promise<AuthToken> {
    if (!this.cachedToken) {
      throw new Error(
        "No auth token available. Call authenticate() with a signer first.",
      )
    }

    if (this.cachedToken.expiresAt.getTime() - Date.now() < REFRESH_BUFFER_MS) {
      const tokenResponse = await this.refreshToken(
        this.cachedToken.refreshToken,
      )
      this.cachedToken = toAuthToken(tokenResponse)
    }

    return this.cachedToken
  }

  /**
   * Revoke an access token.
   */
  async revoke(accessToken: string): Promise<void> {
    const response = await fetch(`${this.authBaseUrl}/api/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: accessToken }),
    })
    if (!response.ok) {
      throw new Error(
        `Auth server error (${response.status}): ${response.statusText}`,
      )
    }
    if (this.cachedToken?.accessToken === accessToken) {
      this.cachedToken = undefined
    }
  }

  /** Request a nonce from the auth server. */
  async requestNonce(): Promise<AuthNonceResponse> {
    const response = await fetch(`${this.authBaseUrl}/api/nonce`, {
      method: "GET",
      headers: { Accept: "application/json" },
    })
    if (!response.ok) {
      throw new Error(
        `Auth server error (${response.status}): ${response.statusText}`,
      )
    }
    return response.json() as Promise<AuthNonceResponse>
  }

  /** Exchange a signed SIWE message for a JWT token. */
  private async exchangeSignature(
    message: string,
    signature: string,
  ): Promise<AuthTokenResponse> {
    const response = await fetch(`${this.authBaseUrl}/api/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, signature }),
    })
    if (!response.ok) {
      throw new Error(
        `Auth server error (${response.status}): ${response.statusText}`,
      )
    }
    return response.json() as Promise<AuthTokenResponse>
  }

  /** Refresh an access token using a refresh token. */
  private async refreshToken(
    refreshTokenValue: string,
  ): Promise<AuthTokenResponse> {
    const response = await fetch(`${this.authBaseUrl}/api/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshTokenValue }),
    })
    if (!response.ok) {
      throw new Error(
        `Auth server error (${response.status}): ${response.statusText}`,
      )
    }
    return response.json() as Promise<AuthTokenResponse>
  }
}

/** Validity window (in ms) for a generated SIWE message. */
const SIWE_MESSAGE_VALIDITY_MS = 10 * 60_000

/**
 * Build an EIP-4361 (SIWE) message for OpenSea authentication.
 *
 * @see https://eips.ethereum.org/EIPS/eip-4361
 */
export function generateSiweMessage(
  address: string,
  scopes: string[],
  nonce: string,
  authBaseUrl: string,
  chainId = 1,
): string {
  const url = new URL(authBaseUrl)
  const domain = url.host
  const uri = `${authBaseUrl}/api/token`
  const now = Date.now()
  const issuedAt = new Date(now).toISOString()
  const expirationTime = new Date(now + SIWE_MESSAGE_VALIDITY_MS).toISOString()
  const resources =
    scopes.length > 0
      ? `\nResources:${scopes.map(s => `\n- ${s}`).join("")}`
      : ""

  return [
    `${domain} wants you to sign in with your Ethereum account:`,
    address,
    "",
    "Sign in to OpenSea",
    "",
    `URI: ${uri}`,
    "Version: 1",
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
    `Expiration Time: ${expirationTime}`,
    ...(resources ? [resources] : []),
  ].join("\n")
}

/** Convert a raw auth server response to a typed AuthToken. */
function toAuthToken(response: AuthTokenResponse): AuthToken {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresAt: new Date(Date.now() + response.expires_in * 1000),
    scopes: response.scopes,
  }
}
