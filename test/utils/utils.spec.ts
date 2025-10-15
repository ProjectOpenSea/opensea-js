import { expect } from "chai";
import { suite, test } from "mocha";
import { getNextPowerOfTwo } from "../../src/utils/utils";

suite("Utils: general utilities", () => {
  suite("getNextPowerOfTwo", () => {
    test("returns 2 for n < 2", () => {
      expect(getNextPowerOfTwo(0)).to.equal(2);
      expect(getNextPowerOfTwo(1)).to.equal(2);
    });

    test("returns same number if already power of 2", () => {
      expect(getNextPowerOfTwo(2)).to.equal(2);
      expect(getNextPowerOfTwo(4)).to.equal(4);
      expect(getNextPowerOfTwo(8)).to.equal(8);
      expect(getNextPowerOfTwo(16)).to.equal(16);
      expect(getNextPowerOfTwo(32)).to.equal(32);
      expect(getNextPowerOfTwo(64)).to.equal(64);
      expect(getNextPowerOfTwo(128)).to.equal(128);
      expect(getNextPowerOfTwo(256)).to.equal(256);
      expect(getNextPowerOfTwo(512)).to.equal(512);
      expect(getNextPowerOfTwo(1024)).to.equal(1024);
    });

    test("rounds up to next power of 2", () => {
      expect(getNextPowerOfTwo(3)).to.equal(4);
      expect(getNextPowerOfTwo(5)).to.equal(8);
      expect(getNextPowerOfTwo(7)).to.equal(8);
      expect(getNextPowerOfTwo(9)).to.equal(16);
      expect(getNextPowerOfTwo(15)).to.equal(16);
      expect(getNextPowerOfTwo(17)).to.equal(32);
      expect(getNextPowerOfTwo(25)).to.equal(32);
      expect(getNextPowerOfTwo(33)).to.equal(64);
      expect(getNextPowerOfTwo(100)).to.equal(128);
      expect(getNextPowerOfTwo(1000)).to.equal(1024);
    });

    test("handles edge cases for bulk orders", () => {
      // Common bulk order sizes
      expect(getNextPowerOfTwo(20)).to.equal(32);
      expect(getNextPowerOfTwo(50)).to.equal(64);
      expect(getNextPowerOfTwo(100)).to.equal(128);
      expect(getNextPowerOfTwo(500)).to.equal(512);
    });

    test("throws error for n > 2^24", () => {
      const maxOrders = 2 ** 24;
      expect(() => getNextPowerOfTwo(maxOrders + 1)).to.throw(
        "Bulk orders cannot exceed 2^24 orders",
      );
      expect(() => getNextPowerOfTwo(maxOrders * 2)).to.throw(
        "Bulk orders cannot exceed 2^24 orders",
      );
    });

    test("handles maximum valid value", () => {
      const maxOrders = 2 ** 24;
      expect(getNextPowerOfTwo(maxOrders)).to.equal(maxOrders);
      expect(getNextPowerOfTwo(maxOrders - 1)).to.equal(maxOrders);
    });
  });
});
