import { expect } from "chai";
import { suite, test } from "mocha";
import * as sinon from "sinon";
import { OpenSeaRateLimitError } from "../../src/types";
import {
  executeWithRateLimit,
  executeSequentialWithRateLimit,
} from "../../src/utils/rateLimit";

suite("Utils: rateLimit", () => {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
    sinon.restore();
  });

  suite("executeWithRateLimit", () => {
    test("successfully executes operation on first try", async () => {
      const operation = sinon.stub().resolves("success");

      const result = await executeWithRateLimit(operation);

      expect(result).to.equal("success");
      expect(operation.callCount).to.equal(1);
    });

    test("retries on rate limit error with retry-after header", async () => {
      const rateLimitError: OpenSeaRateLimitError = Object.assign(
        new Error("429 Too Many Requests"),
        {
          retryAfter: 2, // 2 seconds
        },
      );

      const operation = sinon
        .stub()
        .onFirstCall()
        .rejects(rateLimitError)
        .onSecondCall()
        .resolves("success");

      const logger = sinon.stub();

      const promise = executeWithRateLimit(operation, { logger });

      // Advance time by 2 seconds
      await clock.tickAsync(2000);

      const result = await promise;

      expect(result).to.equal("success");
      expect(operation.callCount).to.equal(2);
      expect(logger.calledWith(sinon.match(/Rate limit hit.*2 seconds/))).to.be
        .true;
    });

    test("retries on rate limit error with exponential backoff", async () => {
      const rateLimitError = new Error("429 Too Many Requests");

      const operation = sinon
        .stub()
        .onFirstCall()
        .rejects(rateLimitError)
        .onSecondCall()
        .resolves("success");

      const logger = sinon.stub();

      const promise = executeWithRateLimit(operation, {
        logger,
        baseRetryDelay: 1000,
      });

      // Advance time by 1 second (first retry delay)
      await clock.tickAsync(1000);

      const result = await promise;

      expect(result).to.equal("success");
      expect(operation.callCount).to.equal(2);
      expect(logger.calledWith(sinon.match(/Rate limit hit.*1000ms/))).to.be
        .true;
    });

    test("respects maxRetries and throws after exhausting retries", async () => {
      const rateLimitError = new Error("429 Too Many Requests");

      const operation = sinon.stub().rejects(rateLimitError);
      const logger = sinon.stub();

      const promise = executeWithRateLimit(operation, {
        logger,
        maxRetries: 2,
        baseRetryDelay: 100,
      });

      // Advance time for all retries
      await clock.tickAsync(100); // First retry
      await clock.tickAsync(200); // Second retry

      try {
        await promise;
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("429");
        expect(operation.callCount).to.equal(3); // Initial + 2 retries
      }
    });

    test("throws immediately on non-rate-limit errors", async () => {
      const nonRateLimitError = new Error("Server Error");

      const operation = sinon.stub().rejects(nonRateLimitError);

      try {
        await executeWithRateLimit(operation);
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.equal("Server Error");
        expect(operation.callCount).to.equal(1);
      }
    });

    test("handles 599 custom rate limit code", async () => {
      const rateLimitError = new Error("599 Rate Limit");

      const operation = sinon
        .stub()
        .onFirstCall()
        .rejects(rateLimitError)
        .onSecondCall()
        .resolves("success");

      const logger = sinon.stub();

      const promise = executeWithRateLimit(operation, { logger });

      await clock.tickAsync(1000);

      const result = await promise;

      expect(result).to.equal("success");
      expect(operation.callCount).to.equal(2);
    });
  });

  suite("executeSequentialWithRateLimit", () => {
    test("executes operations sequentially", async () => {
      const operations = [
        sinon.stub().resolves("result1"),
        sinon.stub().resolves("result2"),
        sinon.stub().resolves("result3"),
      ];

      const logger = sinon.stub();

      const results = await executeSequentialWithRateLimit(operations, {
        logger,
        operationName: "test operation",
      });

      expect(results).to.deep.equal(["result1", "result2", "result3"]);
      expect(operations[0].callCount).to.equal(1);
      expect(operations[1].callCount).to.equal(1);
      expect(operations[2].callCount).to.equal(1);
      expect(logger.calledWith(sinon.match(/Starting 3 test operations/))).to.be
        .true;
      expect(logger.calledWith(sinon.match(/Executing test operation 1\/3/))).to
        .be.true;
      expect(logger.calledWith(sinon.match(/All 3 test operations completed/)))
        .to.be.true;
    });

    test("logs progress correctly for single operation", async () => {
      const operations = [sinon.stub().resolves("result")];

      const logger = sinon.stub();

      await executeSequentialWithRateLimit(operations, {
        logger,
        operationName: "test",
      });

      expect(logger.calledWith(sinon.match(/Starting 1 test\.\.\./)));
      expect(logger.calledWith(sinon.match(/All 1 test completed/)));
    });

    test("handles rate limit errors in sequential operations", async () => {
      const rateLimitError = new Error("429 Too Many Requests");

      const operations = [
        sinon.stub().resolves("result1"),
        sinon
          .stub()
          .onFirstCall()
          .rejects(rateLimitError)
          .onSecondCall()
          .resolves("result2"),
        sinon.stub().resolves("result3"),
      ];

      const logger = sinon.stub();

      const promise = executeSequentialWithRateLimit(operations, {
        logger,
        operationName: "listing submission",
        baseRetryDelay: 500,
      });

      // Wait for first operation
      await clock.tickAsync(0);

      // Wait for rate limit retry on second operation
      await clock.tickAsync(500);

      const results = await promise;

      expect(results).to.deep.equal(["result1", "result2", "result3"]);
      expect(logger.calledWith(sinon.match(/Rate limit hit/))).to.be.true;
    });

    test("stops execution if operation fails after retries", async () => {
      const rateLimitError = new Error("429 Too Many Requests");

      const operations = [
        sinon.stub().resolves("result1"),
        sinon.stub().rejects(rateLimitError),
        sinon.stub().resolves("result3"),
      ];

      const logger = sinon.stub();

      const promise = executeSequentialWithRateLimit(operations, {
        logger,
        maxRetries: 1,
        baseRetryDelay: 100,
      });

      // Wait for first operation and retries
      await clock.tickAsync(100);

      try {
        await promise;
        expect.fail("Expected error to be thrown");
      } catch (error) {
        expect((error as Error).message).to.include("429");
        // Third operation should not be called
        expect(operations[2].callCount).to.equal(0);
      }
    });
  });
});
