import { expect } from "chai";
import { suite, test } from "mocha";
import * as sinon from "sinon";
import { Fetcher } from "../../src/api/fetcher";

suite("API: Fetcher", () => {
  suite("Fetcher Interface", () => {
    test("can be implemented with get and post methods", () => {
      const mockFetcher: Fetcher = {
        get: async <T>(_apiPath: string, _query?: object): Promise<T> => {
          return {} as T;
        },
        post: async <T>(
          _apiPath: string,
          _body?: object,
          _opts?: object,
        ): Promise<T> => {
          return {} as T;
        },
      };

      expect(mockFetcher.get).to.be.a("function");
      expect(mockFetcher.post).to.be.a("function");
    });

    test("get method accepts apiPath and optional query params", async () => {
      const mockResponse = { data: "test" };
      const mockFetcher: Fetcher = {
        get: async <T>(apiPath: string, query?: object): Promise<T> => {
          expect(apiPath).to.equal("/api/v2/test");
          expect(query).to.deep.equal({ limit: 10 });
          return mockResponse as T;
        },
        post: async <T>(): Promise<T> => {
          return {} as T;
        },
      };

      const result = await mockFetcher.get("/api/v2/test", { limit: 10 });
      expect(result).to.deep.equal(mockResponse);
    });

    test("get method works without query params", async () => {
      const mockResponse = { data: "test" };
      const mockFetcher: Fetcher = {
        get: async <T>(apiPath: string, query?: object): Promise<T> => {
          expect(apiPath).to.equal("/api/v2/test");
          expect(query).to.be.undefined;
          return mockResponse as T;
        },
        post: async <T>(): Promise<T> => {
          return {} as T;
        },
      };

      const result = await mockFetcher.get("/api/v2/test");
      expect(result).to.deep.equal(mockResponse);
    });

    test("post method accepts apiPath, body, and optional opts", async () => {
      const mockResponse = { success: true };
      const mockBody = { name: "test" };
      const mockOpts = { headers: { "Content-Type": "application/json" } };

      const mockFetcher: Fetcher = {
        get: async <T>(): Promise<T> => {
          return {} as T;
        },
        post: async <T>(
          apiPath: string,
          body?: object,
          opts?: object,
        ): Promise<T> => {
          expect(apiPath).to.equal("/api/v2/test");
          expect(body).to.deep.equal(mockBody);
          expect(opts).to.deep.equal(mockOpts);
          return mockResponse as T;
        },
      };

      const result = await mockFetcher.post("/api/v2/test", mockBody, mockOpts);
      expect(result).to.deep.equal(mockResponse);
    });

    test("post method works without body or opts", async () => {
      const mockResponse = { success: true };
      const mockFetcher: Fetcher = {
        get: async <T>(): Promise<T> => {
          return {} as T;
        },
        post: async <T>(
          apiPath: string,
          body?: object,
          opts?: object,
        ): Promise<T> => {
          expect(apiPath).to.equal("/api/v2/test");
          expect(body).to.be.undefined;
          expect(opts).to.be.undefined;
          return mockResponse as T;
        },
      };

      const result = await mockFetcher.post("/api/v2/test");
      expect(result).to.deep.equal(mockResponse);
    });

    test("supports generic types for responses", async () => {
      interface TestResponse {
        id: number;
        name: string;
      }

      const mockResponse: TestResponse = { id: 1, name: "test" };
      const mockFetcher: Fetcher = {
        get: async <T>(): Promise<T> => {
          return mockResponse as T;
        },
        post: async <T>(): Promise<T> => {
          return mockResponse as T;
        },
      };

      const getResult = await mockFetcher.get<TestResponse>("/api/v2/test");
      expect(getResult.id).to.equal(1);
      expect(getResult.name).to.equal("test");

      const postResult = await mockFetcher.post<TestResponse>("/api/v2/test");
      expect(postResult.id).to.equal(1);
      expect(postResult.name).to.equal("test");
    });

    test("can be mocked with sinon for testing", async () => {
      const mockGet = sinon.stub().resolves({ data: "get" });
      const mockPost = sinon.stub().resolves({ data: "post" });

      const mockFetcher: Fetcher = {
        get: mockGet,
        post: mockPost,
      };

      await mockFetcher.get("/api/test", { limit: 5 });
      await mockFetcher.post("/api/test", { name: "test" });

      expect(mockGet.calledOnce).to.be.true;
      expect(mockGet.firstCall.args[0]).to.equal("/api/test");
      expect(mockGet.firstCall.args[1]).to.deep.equal({ limit: 5 });

      expect(mockPost.calledOnce).to.be.true;
      expect(mockPost.firstCall.args[0]).to.equal("/api/test");
      expect(mockPost.firstCall.args[1]).to.deep.equal({ name: "test" });
    });

    test("preserves error handling behavior", async () => {
      const errorMessage = "Network error";
      const mockFetcher: Fetcher = {
        get: async () => {
          throw new Error(errorMessage);
        },
        post: async () => {
          throw new Error(errorMessage);
        },
      };

      try {
        await mockFetcher.get("/api/test");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.equal(errorMessage);
      }

      try {
        await mockFetcher.post("/api/test");
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.equal(errorMessage);
      }
    });

    test("supports promise chaining", async () => {
      const mockFetcher: Fetcher = {
        get: async <T>(apiPath: string): Promise<T> => {
          return { path: apiPath } as T;
        },
        post: async <T>(apiPath: string): Promise<T> => {
          return { path: apiPath } as T;
        },
      };

      const getResult = await mockFetcher
        .get<{ path: string }>("/api/test")
        .then((res) => res.path);
      expect(getResult).to.equal("/api/test");

      const postResult = await mockFetcher
        .post<{ path: string }>("/api/test")
        .then((res) => res.path);
      expect(postResult).to.equal("/api/test");
    });

    test("can be used with async/await patterns", async () => {
      const mockFetcher: Fetcher = {
        get: async <T>(): Promise<T> => {
          // Simulate async operation
          await new Promise((resolve) => setTimeout(resolve, 1));
          return { data: "async get" } as T;
        },
        post: async <T>(): Promise<T> => {
          // Simulate async operation
          await new Promise((resolve) => setTimeout(resolve, 1));
          return { data: "async post" } as T;
        },
      };

      const getResult = await mockFetcher.get("/api/test");
      expect(getResult).to.deep.equal({ data: "async get" });

      const postResult = await mockFetcher.post("/api/test");
      expect(postResult).to.deep.equal({ data: "async post" });
    });
  });

  suite("Fetcher in API Classes", () => {
    test("fetcher allows API classes to be instantiated without concrete implementation", () => {
      // This demonstrates that API classes can use the Fetcher interface
      // without coupling to a specific HTTP client implementation
      const mockFetcher: Fetcher = {
        get: sinon.stub().resolves({}),
        post: sinon.stub().resolves({}),
      };

      // API classes can be instantiated with any Fetcher implementation
      expect(mockFetcher).to.have.property("get");
      expect(mockFetcher).to.have.property("post");
    });

    test("fetcher enables easy mocking in unit tests", () => {
      const mockGet = sinon.stub();
      const mockPost = sinon.stub();

      const _mockFetcher: Fetcher = {
        get: mockGet,
        post: mockPost,
      };

      // Verify stubs can be configured
      mockGet.resolves({ data: "mocked" });
      mockPost.resolves({ success: true });

      expect(mockGet).to.be.a("function");
      expect(mockPost).to.be.a("function");
    });

    test("fetcher promotes dependency injection pattern", () => {
      // The Fetcher interface enables dependency injection,
      // making it easy to swap implementations for testing or different environments

      const productionFetcher: Fetcher = {
        get: async <T>(): Promise<T> => ({ env: "production" }) as T,
        post: async <T>(): Promise<T> => ({ env: "production" }) as T,
      };

      const testFetcher: Fetcher = {
        get: async <T>(): Promise<T> => ({ env: "test" }) as T,
        post: async <T>(): Promise<T> => ({ env: "test" }) as T,
      };

      expect(productionFetcher).to.not.equal(testFetcher);
      expect(productionFetcher.get).to.be.a("function");
      expect(testFetcher.get).to.be.a("function");
    });
  });
});
