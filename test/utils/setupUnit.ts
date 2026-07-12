import { afterEach, beforeEach, vi } from "vitest"

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.reject(
        new Error(
          "Unexpected network request in SDK unit test. Mock the request or move the test to the integration suite.",
        ),
      ),
    ),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})
