import { expect } from "chai";
import { suite, test } from "mocha";
import {
  getCurrentUnixTimestamp,
  getUnixTimestampInSeconds,
  TimeInSeconds,
} from "../../src/utils/dateHelper";

suite("DateHelper", () => {
  suite("getCurrentUnixTimestamp", () => {
    test("returns current time in seconds", () => {
      const before = Math.floor(Date.now() / 1000);
      const timestamp = getCurrentUnixTimestamp();
      const after = Math.floor(Date.now() / 1000);

      expect(timestamp).to.be.at.least(before);
      expect(timestamp).to.be.at.most(after);
    });

    test("returns integer value", () => {
      const timestamp = getCurrentUnixTimestamp();
      expect(Number.isInteger(timestamp)).to.be.true;
    });
  });

  suite("getUnixTimestampInSeconds", () => {
    test("returns future timestamp", () => {
      const now = getCurrentUnixTimestamp();
      const future = getUnixTimestampInSeconds(100);

      expect(future).to.be.greaterThan(now);
      expect(future).to.equal(now + 100);
    });

    test("works with TimeInSeconds constants", () => {
      const now = getCurrentUnixTimestamp();
      const tomorrow = getUnixTimestampInSeconds(TimeInSeconds.DAY);

      expect(tomorrow).to.equal(now + 86400);
    });

    test("handles negative values for past timestamps", () => {
      const now = getCurrentUnixTimestamp();
      const past = getUnixTimestampInSeconds(-100);

      expect(past).to.be.lessThan(now);
      expect(past).to.equal(now - 100);
    });
  });

  suite("TimeInSeconds", () => {
    test("MINUTE equals 60 seconds", () => {
      expect(TimeInSeconds.MINUTE).to.equal(60);
    });

    test("HOUR equals 3600 seconds", () => {
      expect(TimeInSeconds.HOUR).to.equal(3600);
    });

    test("DAY equals 86400 seconds", () => {
      expect(TimeInSeconds.DAY).to.equal(86400);
    });

    test("WEEK equals 604800 seconds", () => {
      expect(TimeInSeconds.WEEK).to.equal(604800);
    });

    test("MONTH equals 2592000 seconds", () => {
      expect(TimeInSeconds.MONTH).to.equal(2592000);
    });

    test("constants are related correctly", () => {
      expect(TimeInSeconds.HOUR).to.equal(TimeInSeconds.MINUTE * 60);
      expect(TimeInSeconds.DAY).to.equal(TimeInSeconds.HOUR * 24);
      expect(TimeInSeconds.WEEK).to.equal(TimeInSeconds.DAY * 7);
      expect(TimeInSeconds.MONTH).to.equal(TimeInSeconds.DAY * 30);
    });
  });
});
