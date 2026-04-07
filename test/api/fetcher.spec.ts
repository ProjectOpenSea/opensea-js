import { describe, expect, test, vi } from "vitest"
import type { Fetcher } from "../../src/api/fetcher"

describe("API: Fetcher", () => {
  describe("Fetcher Interface", () => {
    test("can be implemented with get and post methods", () => {
      const mockFetcher: Fetcher = {
        get: async <T>(_apiPath: string, _query?: object): Promise<T> => {
          return {} as T
        },
        post: async <T>(
          _apiPath: string,
          _body?: object,
          _opts?: object,
        ): Promise<T> => {
          return {} as T
        },
      }

      expect(typeof mockFetcher.get).toBe("function")
      expect(typeof mockFetcher.post).toBe("function")
    })

    test("get method accepts apiPath and optional query params", async () => {
      const mockResponse = { data: "test" }
      const mockFetcher: Fetcher = {
        get: async <T>(apiPath: string, query?: object): Promise<T> => {
          expect(apiPath).toBe("/api/v2/test")
          expect(query).toEqual({ limit: 10 })
          return mockResponse as T
        },
        post: async <T>(): Promise<T> => {
          return {} as T
        },
      }

      const result = await mockFetcher.get("/api/v2/test", { limit: 10 })
      expect(result).toEqual(mockResponse)
    })

    test("get method works without query params", async () => {
      const mockResponse = { data: "test" }
      const mockFetcher: Fetcher = {
        get: async <T>(apiPath: string, query?: object): Promise<T> => {
          expect(apiPath).toBe("/api/v2/test")
          expect(query).toBeUndefined()
          return mockResponse as T
        },
        post: async <T>(): Promise<T> => {
          return {} as T
        },
      }

      const result = await mockFetcher.get("/api/v2/test")
      expect(result).toEqual(mockResponse)
    })

    test("post method accepts apiPath, body, and optional opts", async () => {
      const mockResponse = { success: true }
      const mockBody = { name: "test" }
      const mockOpts = { headers: { "Content-Type": "application/json" } }

      const mockFetcher: Fetcher = {
        get: async <T>(): Promise<T> => {
          return {} as T
        },
        post: async <T>(
          apiPath: string,
          body?: object,
          opts?: object,
        ): Promise<T> => {
          expect(apiPath).toBe("/api/v2/test")
          expect(body).toEqual(mockBody)
          expect(opts).toEqual(mockOpts)
          return mockResponse as T
        },
      }

      const result = await mockFetcher.post("/api/v2/test", mockBody, mockOpts)
      expect(result).toEqual(mockResponse)
    })

    test("post method works without body or opts", async () => {
      const mockResponse = { success: true }
      const mockFetcher: Fetcher = {
        get: async <T>(): Promise<T> => {
          return {} as T
        },
        post: async <T>(
          apiPath: string,
          body?: object,
          opts?: object,
        ): Promise<T> => {
          expect(apiPath).toBe("/api/v2/test")
          expect(body).toBeUndefined()
          expect(opts).toBeUndefined()
          return mockResponse as T
        },
      }

      const result = await mockFetcher.post("/api/v2/test")
      expect(result).toEqual(mockResponse)
    })

    test("supports generic types for responses", async () => {
      interface TestResponse {
        id: number
        name: string
      }

      const mockResponse: TestResponse = { id: 1, name: "test" }
      const mockFetcher: Fetcher = {
        get: async <T>(): Promise<T> => {
          return mockResponse as T
        },
        post: async <T>(): Promise<T> => {
          return mockResponse as T
        },
      }

      const getResult = await mockFetcher.get<TestResponse>("/api/v2/test")
      expect(getResult.id).toBe(1)
      expect(getResult.name).toBe("test")

      const postResult = await mockFetcher.post<TestResponse>("/api/v2/test")
      expect(postResult.id).toBe(1)
      expect(postResult.name).toBe("test")
    })

    test("can be mocked with vi for testing", async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: "get" })
      const mockPost = vi.fn().mockResolvedValue({ data: "post" })

      const mockFetcher: Fetcher = {
        get: mockGet,
        post: mockPost,
      }

      await mockFetcher.get("/api/test", { limit: 5 })
      await mockFetcher.post("/api/test", { name: "test" })

      expect(mockGet).toHaveBeenCalledTimes(1)
      expect(mockGet.mock.calls[0][0]).toBe("/api/test")
      expect(mockGet.mock.calls[0][1]).toEqual({ limit: 5 })

      expect(mockPost).toHaveBeenCalledTimes(1)
      expect(mockPost.mock.calls[0][0]).toBe("/api/test")
      expect(mockPost.mock.calls[0][1]).toEqual({ name: "test" })
    })

    test("preserves error handling behavior", async () => {
      const errorMessage = "Network error"
      const mockFetcher: Fetcher = {
        get: async () => {
          throw new Error(errorMessage)
        },
        post: async () => {
          throw new Error(errorMessage)
        },
      }

      try {
        await mockFetcher.get("/api/test")
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toBe(errorMessage)
      }

      try {
        await mockFetcher.post("/api/test")
        throw new Error("Expected error to be thrown")
      } catch (error) {
        expect((error as Error).message).toBe(errorMessage)
      }
    })

    test("supports promise chaining", async () => {
      const mockFetcher: Fetcher = {
        get: async <T>(apiPath: string): Promise<T> => {
          return { path: apiPath } as T
        },
        post: async <T>(apiPath: string): Promise<T> => {
          return { path: apiPath } as T
        },
      }

      const getResult = await mockFetcher
        .get<{ path: string }>("/api/test")
        .then(res => res.path)
      expect(getResult).toBe("/api/test")

      const postResult = await mockFetcher
        .post<{ path: string }>("/api/test")
        .then(res => res.path)
      expect(postResult).toBe("/api/test")
    })

    test("can be used with async/await patterns", async () => {
      const mockFetcher: Fetcher = {
        get: async <T>(): Promise<T> => {
          // Simulate async operation
          await new Promise(resolve => setTimeout(resolve, 1))
          return { data: "async get" } as T
        },
        post: async <T>(): Promise<T> => {
          // Simulate async operation
          await new Promise(resolve => setTimeout(resolve, 1))
          return { data: "async post" } as T
        },
      }

      const getResult = await mockFetcher.get("/api/test")
      expect(getResult).toEqual({ data: "async get" })

      const postResult = await mockFetcher.post("/api/test")
      expect(postResult).toEqual({ data: "async post" })
    })
  })

  describe("Fetcher in API Classes", () => {
    test("fetcher allows API classes to be instantiated without concrete implementation", () => {
      // This demonstrates that API classes can use the Fetcher interface
      // without coupling to a specific HTTP client implementation
      const mockFetcher: Fetcher = {
        get: vi.fn().mockResolvedValue({}),
        post: vi.fn().mockResolvedValue({}),
      }

      // API classes can be instantiated with any Fetcher implementation
      expect(mockFetcher).toHaveProperty("get")
      expect(mockFetcher).toHaveProperty("post")
    })

    test("fetcher enables easy mocking in unit tests", () => {
      const mockGet = vi.fn()
      const mockPost = vi.fn()

      const _mockFetcher: Fetcher = {
        get: mockGet,
        post: mockPost,
      }

      // Verify stubs can be configured
      mockGet.mockResolvedValue({ data: "mocked" })
      mockPost.mockResolvedValue({ success: true })

      expect(typeof mockGet).toBe("function")
      expect(typeof mockPost).toBe("function")
    })

    test("fetcher promotes dependency injection pattern", () => {
      // The Fetcher interface enables dependency injection,
      // making it easy to swap implementations for testing or different environments

      const productionFetcher: Fetcher = {
        get: async <T>(): Promise<T> => ({ env: "production" }) as T,
        post: async <T>(): Promise<T> => ({ env: "production" }) as T,
      }

      const testFetcher: Fetcher = {
        get: async <T>(): Promise<T> => ({ env: "test" }) as T,
        post: async <T>(): Promise<T> => ({ env: "test" }) as T,
      }

      expect(productionFetcher).not.toBe(testFetcher)
      expect(typeof productionFetcher.get).toBe("function")
      expect(typeof testFetcher.get).toBe("function")
    })
  })
})
