import { RequestOptions } from "../types";

/**
 * Fetcher context interface for making HTTP requests to the OpenSea API.
 * This interface abstracts the HTTP methods used by specialized API clients.
 */
export interface Fetcher {
  /**
   * Generic fetch method for GET requests with automatic rate limit retry
   * @param apiPath Path to URL endpoint under API
   * @param query URL query params. Will be used to create a URLSearchParams object.
   * @returns The response from the API.
   */
  get<T>(apiPath: string, query?: object): Promise<T>;

  /**
   * Generic post method for POST requests with automatic rate limit retry
   * @param apiPath Path to URL endpoint under API
   * @param body Data to send.
   * @param headers Additional headers to send with the request.
   * @param options Request options like timeout and abort signal.
   * @returns The response from the API.
   */
  post<T>(
    apiPath: string,
    body?: object,
    headers?: object,
    options?: RequestOptions,
  ): Promise<T>;
}
