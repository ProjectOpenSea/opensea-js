import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import {
  decodeJwtPayload,
  extractWalletAddress,
  OpenSeaOAuth,
} from "../../src/auth/oauth"

const ISSUER = "https://auth.example.com"
const CLIENT_ID = "test-client-id"

const DISCOVERY = {
  issuer: ISSUER,
  authorization_endpoint: `${ISSUER}/oauth/v2/authorize`,
  token_endpoint: `${ISSUER}/oauth/v2/token`,
  device_authorization_endpoint: `${ISSUER}/oauth/v2/device_authorization`,
  revocation_endpoint: `${ISSUER}/oauth/v2/revoke`,
  code_challenge_methods_supported: ["S256"],
}

function jsonResponse(body: unknown, init?: { ok?: boolean; status?: number }) {
  return {
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    statusText: "",
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response
}

function mockDiscovery(fetchMock: ReturnType<typeof vi.fn>) {
  fetchMock.mockImplementationOnce(() =>
    Promise.resolve(jsonResponse(DISCOVERY)),
  )
}

function jwt(payload: Record<string, unknown>): string {
  const encoded = Buffer.from(JSON.stringify(payload))
    .toString("base64url")
    .replace(/=+$/, "")
  return `header.${encoded}.signature`
}

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("OpenSeaOAuth", () => {
  test("throws without a clientId", () => {
    expect(() => new OpenSeaOAuth({ clientId: "" })).toThrow(/clientId/)
  })

  test("throws when the issuer is not https (and not loopback)", () => {
    expect(
      () =>
        new OpenSeaOAuth({
          clientId: CLIENT_ID,
          issuer: "http://auth.example.com",
        }),
    ).toThrow(/https/)
  })

  test("allows an http loopback issuer for local testing", () => {
    expect(
      () =>
        new OpenSeaOAuth({
          clientId: CLIENT_ID,
          issuer: "http://127.0.0.1:8151",
        }),
    ).not.toThrow()
  })

  test("rejects a discovery document whose issuer does not match", async () => {
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        jsonResponse({ ...DISCOVERY, issuer: "https://evil.example.com" }),
      ),
    )
    const oauth = new OpenSeaOAuth({ clientId: CLIENT_ID, issuer: ISSUER })
    await expect(oauth.getDiscovery()).rejects.toThrow(/issuer mismatch/)
  })

  test("rejects a discovery document with an insecure token endpoint", async () => {
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        jsonResponse({
          ...DISCOVERY,
          token_endpoint: "http://auth.example.com/oauth/v2/token",
        }),
      ),
    )
    const oauth = new OpenSeaOAuth({ clientId: CLIENT_ID, issuer: ISSUER })
    await expect(oauth.getDiscovery()).rejects.toThrow(/token_endpoint/)
  })

  test("aborts and surfaces a timeout when a request hangs", async () => {
    fetchMock.mockImplementationOnce((_url: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => {
          reject(Object.assign(new Error("aborted"), { name: "AbortError" }))
        })
      })
    })
    const oauth = new OpenSeaOAuth({
      clientId: CLIENT_ID,
      issuer: ISSUER,
      timeoutMs: 10,
    })
    await expect(oauth.getDiscovery()).rejects.toThrow(/timed out/)
  })

  test("createAuthorizationRequest builds a PKCE authorization URL", async () => {
    mockDiscovery(fetchMock)
    const oauth = new OpenSeaOAuth({ clientId: CLIENT_ID, issuer: ISSUER })

    const req = await oauth.createAuthorizationRequest({
      redirectUri: "http://127.0.0.1:8151/callback",
      scopes: ["read:eligibility"],
    })

    const url = new URL(req.url)
    expect(url.origin + url.pathname).toBe(`${ISSUER}/oauth/v2/authorize`)
    expect(url.searchParams.get("response_type")).toBe("code")
    expect(url.searchParams.get("client_id")).toBe(CLIENT_ID)
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://127.0.0.1:8151/callback",
    )
    expect(url.searchParams.get("code_challenge_method")).toBe("S256")
    expect(url.searchParams.get("code_challenge")).toBeTruthy()
    expect(url.searchParams.get("state")).toBe(req.state)
    const scope = url.searchParams.get("scope") ?? ""
    expect(scope).toContain("openid")
    expect(scope).toContain("offline_access")
    expect(scope).toContain("read:eligibility")
    expect(req.codeVerifier.length).toBeGreaterThan(20)
  })

  test("exchangeCode posts the code + verifier and normalizes the token", async () => {
    mockDiscovery(fetchMock)
    fetchMock.mockImplementationOnce((_url: string, init: RequestInit) => {
      const body = new URLSearchParams(init.body as string)
      expect(body.get("grant_type")).toBe("authorization_code")
      expect(body.get("code")).toBe("the-code")
      expect(body.get("code_verifier")).toBe("the-verifier")
      expect(body.get("client_id")).toBe(CLIENT_ID)
      return Promise.resolve(
        jsonResponse({
          access_token: "at",
          refresh_token: "rt",
          token_type: "Bearer",
          expires_in: 3600,
          scope: "read:eligibility write:orders",
        }),
      )
    })

    const oauth = new OpenSeaOAuth({ clientId: CLIENT_ID, issuer: ISSUER })
    const token = await oauth.exchangeCode({
      code: "the-code",
      codeVerifier: "the-verifier",
      redirectUri: "http://127.0.0.1:8151/callback",
    })

    expect(token.accessToken).toBe("at")
    expect(token.refreshToken).toBe("rt")
    expect(token.scopes).toEqual(["read:eligibility", "write:orders"])
    expect(token.scopeSource).toBe("authorization_server")
    expect(token.expiresAt.getTime()).toBeGreaterThan(Date.now())
  })

  test("exchangeCode throws on a token endpoint error", async () => {
    mockDiscovery(fetchMock)
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        jsonResponse({ error: "invalid_grant" }, { ok: false, status: 400 }),
      ),
    )
    const oauth = new OpenSeaOAuth({ clientId: CLIENT_ID, issuer: ISSUER })
    await expect(
      oauth.exchangeCode({
        code: "x",
        codeVerifier: "y",
        redirectUri: "http://127.0.0.1:8151/callback",
      }),
    ).rejects.toThrow(/Token request failed/)
  })

  test("exchangeCode requires the refresh token requested by offline_access", async () => {
    mockDiscovery(fetchMock)
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        jsonResponse({
          access_token: "at",
          token_type: "Bearer",
          expires_in: 3600,
        }),
      ),
    )
    const oauth = new OpenSeaOAuth({ clientId: CLIENT_ID, issuer: ISSUER })

    await expect(
      oauth.exchangeCode({
        code: "the-code",
        codeVerifier: "the-verifier",
        redirectUri: "http://127.0.0.1:8151/callback",
      }),
    ).rejects.toThrow("missing a refresh token")
  })

  test("reads OpenSea scopes from the access token when scope is omitted", async () => {
    mockDiscovery(fetchMock)
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        jsonResponse({
          access_token: jwt({
            opensea_scopes:
              "write:orders read:eligibility read:rewards unknown:scope",
          }),
          refresh_token: "rt",
          token_type: "Bearer",
          expires_in: 3600,
        }),
      ),
    )

    const oauth = new OpenSeaOAuth({ clientId: CLIENT_ID, issuer: ISSUER })
    const token = await oauth.exchangeCode({
      code: "the-code",
      codeVerifier: "the-verifier",
      redirectUri: "http://127.0.0.1:8151/callback",
    })

    expect(token.scopes).toEqual(["read:eligibility", "write:orders"])
    expect(token.scopeSource).toBe("jwt_claim")
  })

  test("reads array OpenSea scope claims in canonical API order", async () => {
    mockDiscovery(fetchMock)
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        jsonResponse({
          access_token: jwt({
            opensea_scopes: ["write:favorites", "read:favorites"],
          }),
          refresh_token: "rt",
          token_type: "Bearer",
          expires_in: 3600,
        }),
      ),
    )

    const oauth = new OpenSeaOAuth({ clientId: CLIENT_ID, issuer: ISSUER })
    const token = await oauth.exchangeCode({
      code: "the-code",
      codeVerifier: "the-verifier",
      redirectUri: "http://127.0.0.1:8151/callback",
    })

    expect(token.scopes).toEqual(["read:favorites", "write:favorites"])
    expect(token.scopeSource).toBe("jwt_claim")
  })

  test("filters token response scopes through the OpenAPI catalog", async () => {
    mockDiscovery(fetchMock)
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        jsonResponse({
          access_token: "opaque-token",
          refresh_token: "rt",
          token_type: "Bearer",
          expires_in: 3600,
          scope: "read:eligibility read:rewards unknown:scope",
        }),
      ),
    )

    const oauth = new OpenSeaOAuth({ clientId: CLIENT_ID, issuer: ISSUER })
    const token = await oauth.exchangeCode({
      code: "the-code",
      codeVerifier: "the-verifier",
      redirectUri: "http://127.0.0.1:8151/callback",
    })

    expect(token.scopes).toEqual(["read:eligibility"])
    expect(token.scopeSource).toBe("authorization_server")
  })

  test.each([
    ["a JWT without the claim", jwt({ wallet: "0xabc" })],
    [
      "a JWT with only unknown claims",
      jwt({ opensea_scopes: "unknown:scope" }),
    ],
  ])("returns no scopes for %s", async (_label, accessToken) => {
    mockDiscovery(fetchMock)
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        jsonResponse({
          access_token: accessToken,
          refresh_token: "rt",
          token_type: "Bearer",
          expires_in: 3600,
        }),
      ),
    )

    const oauth = new OpenSeaOAuth({ clientId: CLIENT_ID, issuer: ISSUER })
    const token = await oauth.exchangeCode({
      code: "the-code",
      codeVerifier: "the-verifier",
      redirectUri: "http://127.0.0.1:8151/callback",
    })

    expect(token.scopes).toEqual([])
    expect(token.scopeSource).toBe("jwt_claim")
  })

  test("refresh uses the refresh_token grant", async () => {
    mockDiscovery(fetchMock)
    fetchMock.mockImplementationOnce((_url: string, init: RequestInit) => {
      const body = new URLSearchParams(init.body as string)
      expect(body.get("grant_type")).toBe("refresh_token")
      expect(body.get("refresh_token")).toBe("old-rt")
      return Promise.resolve(
        jsonResponse({
          access_token: "at2",
          refresh_token: "rt2",
          token_type: "Bearer",
          expires_in: 3600,
        }),
      )
    })
    const oauth = new OpenSeaOAuth({ clientId: CLIENT_ID, issuer: ISSUER })
    const token = await oauth.refresh("old-rt")
    expect(token.accessToken).toBe("at2")
    expect(token.refreshToken).toBe("rt2")
    expect(token.scopes).toEqual([])
    expect(token.scopeSource).toBe("jwt_claim")
  })

  test("refresh retains the previous token when rotation omits one", async () => {
    mockDiscovery(fetchMock)
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        jsonResponse({
          access_token: "at2",
          token_type: "Bearer",
          expires_in: 3600,
        }),
      ),
    )
    const oauth = new OpenSeaOAuth({ clientId: CLIENT_ID, issuer: ISSUER })

    const token = await oauth.refresh("old-rt")

    expect(token.refreshToken).toBe("old-rt")
  })

  test("revoke posts the token to the revocation endpoint", async () => {
    mockDiscovery(fetchMock)
    fetchMock.mockImplementationOnce((url: string, init: RequestInit) => {
      expect(url).toBe(`${ISSUER}/oauth/v2/revoke`)
      const body = new URLSearchParams(init.body as string)
      expect(body.get("token")).toBe("some-token")
      return Promise.resolve(jsonResponse({}))
    })
    const oauth = new OpenSeaOAuth({ clientId: CLIENT_ID, issuer: ISSUER })
    await expect(oauth.revoke("some-token")).resolves.toBeUndefined()
  })

  test("revoke rejects an insecure revocation endpoint", async () => {
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        jsonResponse({
          ...DISCOVERY,
          revocation_endpoint: "http://auth.example.com/oauth/v2/revoke",
        }),
      ),
    )
    const oauth = new OpenSeaOAuth({ clientId: CLIENT_ID, issuer: ISSUER })
    await expect(oauth.revoke("some-token")).rejects.toThrow(
      /revocation_endpoint/,
    )
  })

  test("requestDeviceAuthorization rejects an insecure device endpoint", async () => {
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        jsonResponse({
          ...DISCOVERY,
          device_authorization_endpoint:
            "http://auth.example.com/oauth/v2/device_authorization",
        }),
      ),
    )
    const oauth = new OpenSeaOAuth({ clientId: CLIENT_ID, issuer: ISSUER })
    await expect(oauth.requestDeviceAuthorization()).rejects.toThrow(
      /device_authorization_endpoint/,
    )
  })

  test("requestDeviceAuthorization returns the device response", async () => {
    mockDiscovery(fetchMock)
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        jsonResponse({
          device_code: "dc",
          user_code: "WXYZ-1234",
          verification_uri: `${ISSUER}/device`,
          verification_uri_complete: `${ISSUER}/device?user_code=WXYZ-1234`,
          expires_in: 600,
          interval: 5,
        }),
      ),
    )
    const oauth = new OpenSeaOAuth({ clientId: CLIENT_ID, issuer: ISSUER })
    const device = await oauth.requestDeviceAuthorization({
      scopes: ["read:eligibility"],
    })
    expect(device.user_code).toBe("WXYZ-1234")
    expect(device.device_code).toBe("dc")
  })

  test("pollDeviceToken waits through authorization_pending then succeeds", async () => {
    vi.useFakeTimers()
    mockDiscovery(fetchMock)
    fetchMock
      .mockImplementationOnce(() =>
        Promise.resolve(
          jsonResponse(
            { error: "authorization_pending" },
            { ok: false, status: 400 },
          ),
        ),
      )
      .mockImplementationOnce(() =>
        Promise.resolve(
          jsonResponse({
            access_token: "device-at",
            refresh_token: "device-rt",
            token_type: "Bearer",
            expires_in: 3600,
            scope: "read:eligibility",
          }),
        ),
      )

    const oauth = new OpenSeaOAuth({ clientId: CLIENT_ID, issuer: ISSUER })
    const promise = oauth.pollDeviceToken({
      device_code: "dc",
      user_code: "WXYZ-1234",
      verification_uri: `${ISSUER}/device`,
      expires_in: 600,
      interval: 1,
    })
    await vi.advanceTimersByTimeAsync(3000)
    const token = await promise
    expect(token.accessToken).toBe("device-at")
    vi.useRealTimers()
  })
})

describe("decodeJwtPayload", () => {
  test("decodes the payload of a JWT without verifying", () => {
    const payload = {
      sub: "acct-1",
      wallet: "0xabc",
      scope: "read:eligibility",
    }
    const encoded = Buffer.from(JSON.stringify(payload))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
    const jwt = `header.${encoded}.signature`
    const decoded = decodeJwtPayload(jwt)
    expect(decoded.sub).toBe("acct-1")
    expect(decoded.wallet).toBe("0xabc")
  })

  test("throws when the token is not a JWT", () => {
    expect(() => decodeJwtPayload("not-a-jwt")).toThrow(/Not a JWT/)
  })

  test("decodes a payload whose base64url length needs re-padding", () => {
    // Choose a payload whose base64 encoding length is not a multiple of 4
    // (so it would require padding). `atob` rejects unpadded input.
    const payload = { wallet: "0xabcd" }
    const encoded = Buffer.from(JSON.stringify(payload))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
    expect(encoded.length % 4).not.toBe(0)
    const decoded = decodeJwtPayload(`header.${encoded}.signature`)
    expect(decoded.wallet).toBe("0xabcd")
  })
})

describe("extractWalletAddress", () => {
  test("prefers the top-level wallet claim", () => {
    expect(extractWalletAddress({ wallet: "0xabc", sub: "acct-1" })).toBe(
      "0xabc",
    )
  })

  test("does not treat the account subject as a wallet address", () => {
    expect(extractWalletAddress({ sub: "acct-1" })).toBeUndefined()
  })

  test("returns undefined when neither claim is present", () => {
    expect(extractWalletAddress({})).toBeUndefined()
    expect(extractWalletAddress({ wallet: "" })).toBeUndefined()
  })
})
