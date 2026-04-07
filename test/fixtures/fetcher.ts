import { vi } from "vitest"
import type { Fetcher } from "../../src/api/fetcher"

/**
 * Creates a mock Fetcher for testing purposes
 * @param getStub Optional pre-configured vi mock for get method
 * @param postStub Optional pre-configured vi mock for post method
 * @returns Object containing the fetcher and the individual mocks for assertions
 */
export function createMockFetcher(
  getStub?: ReturnType<typeof vi.fn>,
  postStub?: ReturnType<typeof vi.fn>,
): {
  fetcher: Fetcher
  mockGet: ReturnType<typeof vi.fn>
  mockPost: ReturnType<typeof vi.fn>
} {
  const mockGet = getStub || vi.fn()
  const mockPost = postStub || vi.fn()

  return {
    fetcher: { get: mockGet, post: mockPost } as unknown as Fetcher,
    mockGet,
    mockPost,
  }
}
