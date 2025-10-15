import * as sinon from "sinon";
import { Fetcher } from "../../src/api/fetcher";

/**
 * Creates a mock Fetcher for testing purposes
 * @param getStub Optional pre-configured sinon stub for get method
 * @param postStub Optional pre-configured sinon stub for post method
 * @returns Object containing the fetcher and the individual stubs for assertions
 */
export function createMockFetcher(
  getStub?: sinon.SinonStub,
  postStub?: sinon.SinonStub,
): { fetcher: Fetcher; mockGet: sinon.SinonStub; mockPost: sinon.SinonStub } {
  const mockGet = getStub || sinon.stub();
  const mockPost = postStub || sinon.stub();

  return {
    fetcher: { get: mockGet, post: mockPost },
    mockGet,
    mockPost,
  };
}
