/**
 * A scoped JWT token returned by the auth server.
 */
export interface AuthToken {
  /** JWT access token */
  accessToken: string
  /** Refresh token for obtaining a new access token */
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
  /** Auth server base URL. Defaults to `https://auth.opensea.io`. */
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
 * Raw token response from the auth server `/api/token` and `/api/refresh` endpoints.
 */
export interface AuthTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  scopes: string[]
}

/**
 * Nonce response from the auth server `/api/nonce` endpoint.
 */
export interface AuthNonceResponse {
  nonce: string
}
