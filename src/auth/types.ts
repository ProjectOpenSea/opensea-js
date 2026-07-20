/**
 * A scoped JWT token returned by the auth server.
 */
export interface AuthToken {
  /** JWT access token */
  accessToken: string
  /** Scoped token (PAT) used to exchange for a new access token */
  refreshToken: string
  /** When the access token expires */
  expiresAt: Date
  /** Scopes granted to this token */
  scopes: string[]
}

/**
 * Options for the {@link OpenSeaAuth.authenticate} method.
 */
export interface AuthenticateOptions {
  /** Scopes to request (e.g. `["read:eligibility", "write:orders"]`) */
  scopes?: string[]
}

/**
 * Configuration for the {@link OpenSeaAuth} class.
 */
export interface OpenSeaAuthConfig {
  /** OpenSea API base URL. Defaults to `https://api.opensea.io`. */
  apiBaseUrl?: string
  /** @deprecated Use `apiBaseUrl`. */
  authBaseUrl?: string
}

/**
 * Signer interface compatible with both ethers and viem signers.
 * Requires `getAddress()` and `signMessage(message)`.
 */
export interface AuthSigner {
  getAddress(): Promise<string>
  signMessage(message: string): Promise<string>
}

/**
 * Legacy auth response shape retained for source compatibility.
 * @deprecated The public wallet-auth API now returns scoped-token and exchange responses.
 */
export interface AuthTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  scopes: string[]
}

/**
 * Response from the SIWE nonce endpoint.
 */
export interface AuthNonceResponse {
  nonce: string
}
