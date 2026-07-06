import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { OpenSeaAPI } from "../../src/api/api"
import {
  type AuthSigner,
  type AuthTokenResponse,
  generateSiweMessage,
  OpenSeaAuth,
} from "../../src/auth"

function mockSigner(
  address = "0xABCDEF1234567890abcdef1234567890ABCDEF12",
): AuthSigner {
  return {
    getAddress: vi.fn().mockResolvedValue(address),
    signMessage: vi.fn().mockResolvedValue("0xmocksignature"),
  }
}

const mockTokenResponse: AuthTokenResponse = {
  access_token: "eyJ.mock.token",
  refresh_token: "refresh_mock",
  expires_in: 3600,
  scopes: ["read:eligibility"],
}

describe("OpenSeaAuth", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches existing api.spec.ts pattern
  let fetchSpy: any

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch")
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("authenticate performs full SIWE flow", async () => {
    // Mock nonce request
    fetchSpy
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ nonce: "test-nonce-123" }), {
          status: 200,
        }),
      )
      // Mock token exchange
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockTokenResponse), { status: 200 }),
      )

    const auth = new OpenSeaAuth({
      authBaseUrl: "https://auth.test.opensea.io",
    })
    const signer = mockSigner()
    const token = await auth.authenticate(signer, {
      scopes: ["read:eligibility"],
    })

    expect(token.accessToken).toBe("eyJ.mock.token")
    expect(token.refreshToken).toBe("refresh_mock")
    expect(token.scopes).toEqual(["read:eligibility"])
    expect(token.expiresAt).toBeInstanceOf(Date)

    // Verify nonce was requested
    expect(fetchSpy).toHaveBeenCalledTimes(2)
    const [nonceUrl] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(nonceUrl).toBe("https://auth.test.opensea.io/api/nonce")

    // Verify token exchange
    const [tokenUrl, tokenInit] = fetchSpy.mock.calls[1] as [
      string,
      RequestInit,
    ]
    expect(tokenUrl).toBe("https://auth.test.opensea.io/api/token")
    const body = JSON.parse(tokenInit.body as string) as {
      message: string
      signature: string
    }
    expect(body.signature).toBe("0xmocksignature")
    expect(body.message).toContain("test-nonce-123")

    // Verify signer was called
    expect(signer.getAddress).toHaveBeenCalledOnce()
    expect(signer.signMessage).toHaveBeenCalledOnce()
  })

  test("getValidToken returns cached token when not expired", async () => {
    fetchSpy
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ nonce: "n" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockTokenResponse), { status: 200 }),
      )

    const auth = new OpenSeaAuth()
    await auth.authenticate(mockSigner())

    // Should return cached token without additional fetch calls
    const token = await auth.getValidToken()
    expect(token.accessToken).toBe("eyJ.mock.token")
    expect(fetchSpy).toHaveBeenCalledTimes(2) // Only the initial 2 calls
  })

  test("getValidToken auto-refreshes when token is near expiry", async () => {
    const nearExpiryResponse: AuthTokenResponse = {
      ...mockTokenResponse,
      expires_in: 30, // 30 seconds — within the 60s refresh buffer
    }
    const refreshedResponse: AuthTokenResponse = {
      access_token: "eyJ.refreshed.token",
      refresh_token: "refresh_new",
      expires_in: 3600,
      scopes: ["read:eligibility"],
    }

    fetchSpy
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ nonce: "n" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(nearExpiryResponse), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(refreshedResponse), { status: 200 }),
      )

    const auth = new OpenSeaAuth()
    await auth.authenticate(mockSigner())
    const token = await auth.getValidToken()

    expect(token.accessToken).toBe("eyJ.refreshed.token")
    expect(fetchSpy).toHaveBeenCalledTimes(3)

    // Verify refresh call
    const [refreshUrl, refreshInit] = fetchSpy.mock.calls[2] as [
      string,
      RequestInit,
    ]
    expect(refreshUrl).toBe("https://auth.opensea.io/api/refresh")
    const body = JSON.parse(refreshInit.body as string) as {
      refresh_token: string
    }
    expect(body.refresh_token).toBe("refresh_mock")
  })

  test("getValidToken throws when no token exists", async () => {
    const auth = new OpenSeaAuth()
    await expect(auth.getValidToken()).rejects.toThrow(
      "No auth token available",
    )
  })

  test("revoke calls revoke endpoint and clears cache", async () => {
    fetchSpy
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ nonce: "n" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockTokenResponse), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response("{}", { status: 200 }))

    const auth = new OpenSeaAuth()
    await auth.authenticate(mockSigner())
    await auth.revoke("eyJ.mock.token")

    expect(fetchSpy).toHaveBeenCalledTimes(3)
    const [revokeUrl, revokeInit] = fetchSpy.mock.calls[2] as [
      string,
      RequestInit,
    ]
    expect(revokeUrl).toBe("https://auth.opensea.io/api/revoke")
    const body = JSON.parse(revokeInit.body as string) as { token: string }
    expect(body.token).toBe("eyJ.mock.token")

    // Cache should be cleared
    await expect(auth.getValidToken()).rejects.toThrow(
      "No auth token available",
    )
  })

  test("authenticate throws on nonce server error", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response("", { status: 500, statusText: "Internal Server Error" }),
    )
    const auth = new OpenSeaAuth()
    await expect(auth.authenticate(mockSigner())).rejects.toThrow(
      "Auth server error (500)",
    )
  })

  test("authenticate throws on token exchange error", async () => {
    fetchSpy
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ nonce: "n" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response("", { status: 401, statusText: "Unauthorized" }),
      )
    const auth = new OpenSeaAuth()
    await expect(auth.authenticate(mockSigner())).rejects.toThrow(
      "Auth server error (401)",
    )
  })

  test("trailing slash in authBaseUrl is trimmed", async () => {
    fetchSpy
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ nonce: "n" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockTokenResponse), { status: 200 }),
      )
    const auth = new OpenSeaAuth({
      authBaseUrl: "https://auth.opensea.io/",
    })
    await auth.authenticate(mockSigner())
    const [nonceUrl] = fetchSpy.mock.calls[0] as [string]
    expect(nonceUrl).toBe("https://auth.opensea.io/api/nonce")
  })
})

describe("generateSiweMessage", () => {
  test("produces valid EIP-4361 message with scopes", () => {
    const message = generateSiweMessage(
      "0xABCD1234",
      ["read:eligibility", "write:orders"],
      "nonce123",
      "https://auth.opensea.io",
    )

    expect(message).toContain(
      "auth.opensea.io wants you to sign in with your Ethereum account:",
    )
    expect(message).toContain("0xABCD1234")
    expect(message).toContain("Sign in to OpenSea")
    expect(message).toContain("URI: https://auth.opensea.io/api/token")
    expect(message).toContain("Version: 1")
    expect(message).toContain("Chain ID: 1")
    expect(message).toContain("Nonce: nonce123")
    expect(message).toContain("Issued At:")
    expect(message).toContain("Expiration Time:")
    expect(message).toContain("Resources:")
    expect(message).toContain("- read:eligibility")
    expect(message).toContain("- write:orders")
  })

  test("produces valid EIP-4361 message without scopes", () => {
    const message = generateSiweMessage(
      "0xABCD1234",
      [],
      "nonce123",
      "https://auth.opensea.io",
    )

    expect(message).not.toContain("Resources:")
    expect(message).not.toMatch(/\n$/)
  })

  test("includes custom chainId", () => {
    const message = generateSiweMessage(
      "0xABCD1234",
      [],
      "nonce123",
      "https://auth.opensea.io",
      137,
    )
    expect(message).toContain("Chain ID: 137")
  })
})

describe("OpenSeaAPI auth header", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches existing api.spec.ts pattern
  let fetchSpy: any

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch")
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("includes Authorization header when authToken is set", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    )

    const api = new OpenSeaAPI({ authToken: "my-jwt-token" })
    // Capture the logger output to verify Authorization is not logged
    const logs: string[] = []
    api.logger = (msg: string) => {
      logs.push(msg)
    }

    await api.get("/api/v2/collections/test")

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe("Bearer my-jwt-token")

    // Authorization header should be sanitized from logs
    const logStr = logs.join(" ")
    expect(logStr).not.toContain("my-jwt-token")
  })

  test("does not include Authorization header when authToken is not set", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    )

    const api = new OpenSeaAPI({ apiKey: "test-key" })
    await api.get("/api/v2/collections/test")

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
  })
})
