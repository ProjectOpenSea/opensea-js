import { OpenSeaRateLimitError } from "../types";

/**
 * Options for handling rate-limited operations with retries.
 * This is exported for SDK consumers who may want to use executeWithRateLimit
 * for their own OpenSea API integrations.
 */
// eslint-disable-next-line import/no-unused-modules
export interface RateLimitOptions {
  /** Logger function for logging progress */
  logger?: (message: string) => void;
  /** Maximum number of retry attempts for rate limit errors */
  maxRetries?: number;
  /** Base delay in ms to wait after a rate limit error if retry-after header is not present */
  baseRetryDelay?: number;
}

/**
 * Sleep for a specified duration
 * @param ms Duration in milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute an async operation with automatic retry on rate limit errors.
 * Respects the retry-after header when present, otherwise uses exponential backoff.
 *
 * @param operation The async operation to execute
 * @param options Configuration for rate limit handling
 * @returns The result of the operation
 * @throws The last error encountered if all retries are exhausted
 */
export async function executeWithRateLimit<T>(
  operation: () => Promise<T>,
  options: RateLimitOptions = {},
): Promise<T> {
  const { logger = () => {}, maxRetries = 3, baseRetryDelay = 1000 } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      const rateLimitError = error as OpenSeaRateLimitError;

      // Check if this is a rate limit error
      const isRateLimitError =
        rateLimitError.retryAfter !== undefined ||
        (error as Error).message.includes("429") ||
        (error as Error).message.includes("599");

      if (!isRateLimitError || attempt === maxRetries) {
        // Not a rate limit error or out of retries, throw the error
        throw error;
      }

      // Calculate delay
      let delayMs: number;
      if (rateLimitError.retryAfter !== undefined) {
        delayMs = rateLimitError.retryAfter * 1000;
        logger(
          `Rate limit hit. Waiting ${rateLimitError.retryAfter} seconds before retry (attempt ${attempt + 1}/${maxRetries})...`,
        );
      } else {
        // Exponential backoff
        delayMs = baseRetryDelay * Math.pow(2, attempt);
        logger(
          `Rate limit hit. Waiting ${delayMs}ms before retry (attempt ${attempt + 1}/${maxRetries})...`,
        );
      }

      await sleep(delayMs);
      logger(`Retrying operation...`);
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError;
}

/**
 * Execute an array of async operations sequentially with rate limit handling.
 * Logs progress after each operation.
 *
 * @param operations Array of async operations to execute
 * @param options Configuration for rate limit handling and progress logging
 * @returns Array of results from each operation
 */
export async function executeSequentialWithRateLimit<T>(
  operations: Array<() => Promise<T>>,
  options: RateLimitOptions & {
    operationName?: string;
  } = {},
): Promise<T[]> {
  const {
    logger = () => {},
    operationName = "operation",
    ...rateLimitOptions
  } = options;

  const results: T[] = [];
  const total = operations.length;

  logger(`Starting ${total} ${operationName}${total !== 1 ? "s" : ""}...`);

  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i];
    logger(`Executing ${operationName} ${i + 1}/${total}...`);

    const result = await executeWithRateLimit(operation, {
      ...rateLimitOptions,
      logger,
    });

    results.push(result);
    logger(`Completed ${operationName} ${i + 1}/${total}`);
  }

  logger(
    `All ${total} ${operationName}${total !== 1 ? "s" : ""} completed successfully`,
  );

  return results;
}
