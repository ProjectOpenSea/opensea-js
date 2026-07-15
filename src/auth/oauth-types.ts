/**
 * Configuration for the {@link OpenSeaOAuth} helper.
 */
export interface OpenSeaOAuthConfig {
  /**
   * Public OAuth client id (Zitadel `auth_method: none` + PKCE client).
   * Provisioned via opensea-infrastructure; required.
   */
  clientId: string
  /** Authorization server issuer. Defaults to `https://auth.opensea.io`. */
  issuer?: string
  /**
   * Per-request network timeout in milliseconds for calls to the
   * authorization server. Defaults to 30000 (30s). Guards against a hung
   * connection stalling `opensea login` (or an SDK consumer) indefinitely.
   */
  timeoutMs?: number
}

/**
 * A token set returned by the OAuth 2.1 code/PKCE or device flow.
 */
export interface OAuthToken {
  /** JWT access token (bearer credential for the OpenSea API). */
  accessToken: string
  /** Refresh token for obtaining a new access token. */
  refreshToken: string
  /** OIDC ID token, if `openid` scope was granted. */
  idToken?: string
  /** When the access token expires. */
  expiresAt: Date
  /** Scopes granted to this token. */
  scopes: string[]
  /** Source of the scopes exposed to consumers. */
  scopeSource: "authorization_server" | "jwt_claim"
}

/**
 * Subset of the OIDC discovery document (`/.well-known/openid-configuration`)
 * this helper relies on.
 */
export interface OAuthDiscoveryDocument {
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  device_authorization_endpoint?: string
  revocation_endpoint?: string
  registration_endpoint?: string
  scopes_supported?: string[]
  code_challenge_methods_supported?: string[]
}

/**
 * Raw token response from the OAuth token endpoint.
 */
export interface OAuthTokenResponse {
  access_token: string
  refresh_token?: string
  id_token?: string
  token_type: string
  expires_in: number
  scope?: string
}

/**
 * Response from the device authorization endpoint (RFC 8628).
 */
export interface DeviceAuthorizationResponse {
  device_code: string
  user_code: string
  verification_uri: string
  verification_uri_complete?: string
  expires_in: number
  interval?: number
}
