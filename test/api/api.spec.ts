import { describe, expect, test, vi } from "vitest"
import { Chain, type OpenSeaRateLimitError } from "../../src"
import { OpenSeaAPI } from "../../src/api/api"
import { getOfferPaymentToken } from "../../src/utils"
import { BAYC_CONTRACT_ADDRESS } from "../utils/constants"
import { OPENSEA_API_KEY } from "../utils/env"
import { api } from "../utils/sdk"

/**
 * Helper to create a Response-like object with headers.get() method
 * for testing _parseRetryAfter which now expects native Response objects.
 */
function mockResponse(headers: Record<string, string>) {
  return {
    headers: {
      get: (key: string) => headers[key.toLowerCase()] ?? headers[key] ?? null,
    },
  }
}

describe("API", () => {
  let fetchStub: any

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    // Restore any stubs after each test
    if (fetchStub) {
      fetchStub.mockRestore()
      fetchStub = undefined
    }
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test("API has correct base url", () => {
    expect(api.apiBaseUrl).toBe("https://api.opensea.io")
  })

  test("Includes API key in request", async () => {
    // Restore real timers for this test since it makes a real API call
    vi.useRealTimers()

    const oldLogger = api.logger

    // The API key is now deliberately sanitized from log output.
    // Verify the request is logged with the expected app-id header.
    const logPromise = new Promise<void>((resolve, reject) => {
      api.logger = log => {
        try {
          expect(log).toContain(`"x-app-id":"opensea-js"`)
          resolve()
        } catch (e) {
          reject(e)
        } finally {
          api.logger = oldLogger
        }
      }
      const offerPaymentToken = getOfferPaymentToken(Chain.Mainnet)
      api.getPaymentToken(offerPaymentToken)
    })

    await logPromise
  })

  test("API handles errors", async () => {
    // Restore real timers for this test since it makes a real API call
    vi.useRealTimers()

    // 404 Not found for random token id
    try {
      await api.getNFT(BAYC_CONTRACT_ADDRESS, "404040")
    } catch (error) {
      expect((error as Error).message).toContain("not found")
    }
  })

  test("API handles rate limit errors with retry-after", async () => {
    // Mock the _fetch method directly to simulate rate limit response followed by success
    const rateLimitError = new Error(
      "429 Too Many Requests",
    ) as OpenSeaRateLimitError
    rateLimitError.statusCode = 429
    rateLimitError.retryAfter = 1 // 1 second retry delay
    rateLimitError.responseBody = { error: "Rate limited" }

    const successResponse = {
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      eth_price: "1",
      name: "Ether",
      symbol: "ETH",
      usd_price: "1800",
    }

    // First call fails with rate limit, second call succeeds
    fetchStub = vi
      .spyOn(api as unknown as { _fetch: () => Promise<unknown> }, "_fetch")
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce(successResponse)

    // Start the operation (will hit rate limit and start waiting)
    const promise = api.getPaymentToken(
      "0x0000000000000000000000000000000000000000",
    )

    // Advance time by 1 second to complete the retry delay
    await vi.advanceTimersByTimeAsync(1000)

    // This should auto-retry and eventually succeed
    const result = await promise

    expect(fetchStub.mock.calls.length).toBe(2) // Should have retried once
    expect(result.address).toBe("0x0000000000000000000000000000000000000000")
  })

  test("API parses Retry-After HTTP-date header", () => {
    // Pin system time for deterministic date math
    vi.setSystemTime(new Date("2020-01-01T00:00:00.000Z"))

    const response = mockResponse({
      "retry-after": "Wed, 01 Jan 2020 00:00:01 GMT",
    })

    const retryAfter = (
      api as unknown as { _parseRetryAfter: (r: unknown) => number | undefined }
    )._parseRetryAfter(response)

    expect(retryAfter).toBe(1)
  })

  test("API returns undefined for past Retry-After HTTP-date header", () => {
    vi.setSystemTime(new Date("2020-01-01T00:00:10.000Z"))

    const response = mockResponse({
      "retry-after": "Wed, 01 Jan 2020 00:00:01 GMT",
    })

    const retryAfter = (
      api as unknown as { _parseRetryAfter: (r: unknown) => number | undefined }
    )._parseRetryAfter(response)

    expect(retryAfter).toBe(undefined)
  })

  test("API caps numeric Retry-After at 5 minutes", () => {
    const response = mockResponse({
      "retry-after": "9999",
    })

    const retryAfter = (
      api as unknown as { _parseRetryAfter: (r: unknown) => number | undefined }
    )._parseRetryAfter(response)

    expect(retryAfter).toBe(300) // Capped at 5 minutes
  })

  test("API caps HTTP-date Retry-After at 5 minutes", () => {
    vi.setSystemTime(new Date("2020-01-01T00:00:00.000Z"))

    const response = mockResponse({
      // 1 hour in the future
      "retry-after": "Wed, 01 Jan 2020 01:00:00 GMT",
    })

    const retryAfter = (
      api as unknown as { _parseRetryAfter: (r: unknown) => number | undefined }
    )._parseRetryAfter(response)

    expect(retryAfter).toBe(300) // Capped at 5 minutes
  })

  test("API returns undefined for invalid Retry-After string", () => {
    const response = mockResponse({
      "retry-after": "invalid-string",
    })

    const retryAfter = (
      api as unknown as { _parseRetryAfter: (r: unknown) => number | undefined }
    )._parseRetryAfter(response)

    expect(retryAfter).toBe(undefined)
  })

  test("API returns undefined for negative Retry-After", () => {
    const response = mockResponse({
      "retry-after": "-5",
    })

    const retryAfter = (
      api as unknown as { _parseRetryAfter: (r: unknown) => number | undefined }
    )._parseRetryAfter(response)

    expect(retryAfter).toBe(undefined)
  })

  test("API returns undefined for zero Retry-After", () => {
    const response = mockResponse({
      "retry-after": "0",
    })

    const retryAfter = (
      api as unknown as { _parseRetryAfter: (r: unknown) => number | undefined }
    )._parseRetryAfter(response)

    expect(retryAfter).toBe(undefined)
  })

  test("API trims whitespace from Retry-After header", () => {
    const response = mockResponse({
      "retry-after": "  5  ",
    })

    const retryAfter = (
      api as unknown as { _parseRetryAfter: (r: unknown) => number | undefined }
    )._parseRetryAfter(response)

    expect(retryAfter).toBe(5)
  })

  test("API returns undefined for malformed numeric Retry-After suffixes", () => {
    const response = mockResponse({
      "retry-after": "5s",
    })

    const retryAfter = (
      api as unknown as { _parseRetryAfter: (r: unknown) => number | undefined }
    )._parseRetryAfter(response)

    expect(retryAfter).toBe(undefined)
  })

  test("API returns undefined for fractional numeric Retry-After values", () => {
    const response = mockResponse({
      "retry-after": "1.5",
    })

    const retryAfter = (
      api as unknown as { _parseRetryAfter: (r: unknown) => number | undefined }
    )._parseRetryAfter(response)

    expect(retryAfter).toBe(undefined)
  })

  test("API handles custom 599 rate limit errors with retry-after", async () => {
    // Mock the _fetch method to simulate 599 rate limit response followed by success
    const rateLimitError = new Error(
      "599 Network Connect Timeout Error",
    ) as OpenSeaRateLimitError
    rateLimitError.statusCode = 599
    rateLimitError.retryAfter = 1 // 1 second retry delay
    rateLimitError.responseBody = { message: "Custom rate limit" }

    const successResponse = {
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      eth_price: "1",
      name: "Ether",
      symbol: "ETH",
      usd_price: "1800",
    }

    // First call fails with 599, second call succeeds
    fetchStub = vi
      .spyOn(api as unknown as { _fetch: () => Promise<unknown> }, "_fetch")
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce(successResponse)

    // Start the operation (will hit rate limit and start waiting)
    const promise = api.getPaymentToken(
      "0x0000000000000000000000000000000000000000",
    )

    // Advance time by 1 second to complete the retry delay
    await vi.advanceTimersByTimeAsync(1000)

    // This should auto-retry and eventually succeed
    const result = await promise

    expect(fetchStub.mock.calls.length).toBe(2) // Should have retried once
    expect(result.address).toBe("0x0000000000000000000000000000000000000000")
  })

  test("API handles invalid retry-after header gracefully", async () => {
    // Test the robust header parsing by simulating an invalid retry-after header
    const rateLimitError = new Error(
      "429 Too Many Requests",
    ) as OpenSeaRateLimitError
    rateLimitError.statusCode = 429
    rateLimitError.retryAfter = undefined // Simulate invalid header parsing
    rateLimitError.responseBody = { error: "Rate limited" }

    const successResponse = {
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      eth_price: "1",
      name: "Ether",
      symbol: "ETH",
      usd_price: "1800",
    }

    // First call fails, second call succeeds (tests exponential backoff)
    fetchStub = vi
      .spyOn(api as unknown as { _fetch: () => Promise<unknown> }, "_fetch")
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce(successResponse)

    // Start the operation (will hit rate limit and use exponential backoff)
    const promise = api.getPaymentToken(
      "0x0000000000000000000000000000000000000000",
    )

    // Advance time by 1 second (default baseRetryDelay for first retry)
    await vi.advanceTimersByTimeAsync(1000)

    // This should auto-retry with exponential backoff and eventually succeed
    const result = await promise

    expect(fetchStub.mock.calls.length).toBe(2) // Should have retried once
    expect(result.address).toBe("0x0000000000000000000000000000000000000000")
  })

  test("API post supports timeout option", async () => {
    const fetchStubLocal = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      )

    await api.post("/api/v2/test", undefined, undefined, { timeout: 5000 })

    expect(fetchStubLocal).toHaveBeenCalledTimes(1)
    const callArgs = fetchStubLocal.mock.calls[0]
    // Verify the signal was provided (timeout creates an AbortController)
    expect(callArgs[1]?.signal).toBeDefined()

    fetchStubLocal.mockRestore()
  })

  test("API post registers abort signal handler", async () => {
    const fetchStubLocal = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      )

    const controller = new AbortController()

    await api.post("/api/v2/test", undefined, undefined, {
      signal: controller.signal,
    })

    expect(fetchStubLocal).toHaveBeenCalledTimes(1)
    const callArgs = fetchStubLocal.mock.calls[0]
    // Verify the signal was passed through to fetch
    expect(callArgs[1]?.signal).toBeDefined()

    fetchStubLocal.mockRestore()
  })

  test("API post throws immediately for pre-aborted signal", async () => {
    const controller = new AbortController()
    controller.abort()

    try {
      await api.post("/api/v2/test", undefined, undefined, {
        signal: controller.signal,
      })
      throw new Error("Should have thrown")
    } catch (error) {
      expect((error as Error).message).toContain("aborted")
    }
  })

  test("API get supports timeout option", async () => {
    const fetchStubLocal = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      )

    await api.get("/api/v2/test", {}, { timeout: 3000 })

    expect(fetchStubLocal).toHaveBeenCalledTimes(1)
    const callArgs = fetchStubLocal.mock.calls[0]
    // Verify the signal was provided (timeout creates an AbortController)
    expect(callArgs[1]?.signal).toBeDefined()

    fetchStubLocal.mockRestore()
  })

  test("API get throws immediately for pre-aborted signal", async () => {
    const controller = new AbortController()
    controller.abort()

    try {
      await api.get("/api/v2/test", {}, { signal: controller.signal })
      throw new Error("Should have thrown")
    } catch (error) {
      expect((error as Error).message).toContain("aborted")
    }
  })

  test("API get serializes falsy query params (0 and false)", async () => {
    const successResponse = { ok: true }

    fetchStub = vi
      .spyOn(api as unknown as { _fetch: () => Promise<unknown> }, "_fetch")
      .mockResolvedValue(successResponse)

    await api.get("/api/v2/test", { limit: 0, include: false })

    expect(fetchStub.mock.calls.length).toBe(1)
    const url = fetchStub.mock.calls[0][0] as string
    expect(url).toContain("limit=0")
    expect(url).toContain("include=false")
  })

  test("API get serializes empty string query params", async () => {
    const successResponse = { ok: true }

    fetchStub = vi
      .spyOn(api as unknown as { _fetch: () => Promise<unknown> }, "_fetch")
      .mockResolvedValue(successResponse)

    await api.get("/api/v2/test", { name: "" })

    expect(fetchStub.mock.calls.length).toBe(1)
    const url = fetchStub.mock.calls[0][0] as string
    expect(url).toContain("name=")
  })

  test("API get excludes null and undefined query params", async () => {
    const successResponse = { ok: true }

    fetchStub = vi
      .spyOn(api as unknown as { _fetch: () => Promise<unknown> }, "_fetch")
      .mockResolvedValue(successResponse)

    await api.get("/api/v2/test", {
      valid: "value",
      nullParam: null,
      undefinedParam: undefined,
    })

    expect(fetchStub.mock.calls.length).toBe(1)
    const url = fetchStub.mock.calls[0][0] as string
    expect(url).toContain("valid=value")
    expect(url).not.toContain("nullParam")
    expect(url).not.toContain("undefinedParam")
  })

  test("API get serializes arrays with falsy values", async () => {
    const successResponse = { ok: true }

    fetchStub = vi
      .spyOn(api as unknown as { _fetch: () => Promise<unknown> }, "_fetch")
      .mockResolvedValue(successResponse)

    await api.get("/api/v2/test", { ids: [0, 1, 2] })

    expect(fetchStub.mock.calls.length).toBe(1)
    const url = fetchStub.mock.calls[0][0] as string
    expect(url).toContain("ids=0")
    expect(url).toContain("ids=1")
    expect(url).toContain("ids=2")
  })

  test("API get filters null and undefined from array params", async () => {
    const successResponse = { ok: true }

    fetchStub = vi
      .spyOn(api as unknown as { _fetch: () => Promise<unknown> }, "_fetch")
      .mockResolvedValue(successResponse)

    await api.get("/api/v2/test", { ids: ["a", null, "b", undefined, "c"] })

    expect(fetchStub.mock.calls.length).toBe(1)
    const url = fetchStub.mock.calls[0][0] as string
    expect(url).toContain("ids=a")
    expect(url).toContain("ids=b")
    expect(url).toContain("ids=c")
    // URL should not contain "null" or "undefined" as string values
    expect(url).not.toContain("ids=null")
    expect(url).not.toContain("ids=undefined")
  })

  test("API get does not append trailing '?' when query is empty", async () => {
    const successResponse = { ok: true }

    fetchStub = vi
      .spyOn(api as unknown as { _fetch: () => Promise<unknown> }, "_fetch")
      .mockResolvedValue(successResponse)

    await api.get("/api/v2/test")

    expect(fetchStub.mock.calls.length).toBe(1)
    const url = fetchStub.mock.calls[0][0] as string
    expect(url).toBe(`${api.apiBaseUrl}/api/v2/test`)
    expect(url).not.toContain("?")
  })

  describe("requestInstantApiKey (static)", () => {
    test("POSTs to /api/v2/auth/keys without auth header", async () => {
      const mockBody = { api_key: "test-key-123" }
      const fetchStubLocal = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(
          new Response(JSON.stringify(mockBody), { status: 201 }),
        )

      const result = await OpenSeaAPI.requestInstantApiKey()

      expect(fetchStubLocal).toHaveBeenCalledTimes(1)
      const [url, init] = fetchStubLocal.mock.calls[0] as [
        string,
        RequestInit & { headers: Record<string, string> },
      ]
      expect(url).toBe("https://api.opensea.io/api/v2/auth/keys")
      expect(init.method).toBe("POST")
      // No api-key header in any casing — endpoint is unauthenticated.
      const headerKeys = Object.keys(init.headers).map(k => k.toLowerCase())
      expect(headerKeys).not.toContain("x-api-key")
      expect(result).toEqual(mockBody)

      fetchStubLocal.mockRestore()
    })

    test("respects apiBaseUrl override", async () => {
      const fetchStubLocal = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(new Response("{}", { status: 201 }))

      await OpenSeaAPI.requestInstantApiKey("https://testnets-api.opensea.io")

      const url = fetchStubLocal.mock.calls[0][0] as string
      expect(url).toBe("https://testnets-api.opensea.io/api/v2/auth/keys")

      fetchStubLocal.mockRestore()
    })

    test("throws on non-2xx response", async () => {
      const fetchStubLocal = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(
          new Response("{}", { status: 429, statusText: "Too Many Requests" }),
        )

      await expect(OpenSeaAPI.requestInstantApiKey()).rejects.toThrow(/429/)

      fetchStubLocal.mockRestore()
    })
  })
})
