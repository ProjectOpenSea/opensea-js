import { describe, expect, test } from "vitest"
import {
  getCurrentUnixTimestamp,
  getUnixTimestampInSeconds,
  TimeInSeconds,
} from "../../src/utils/dateHelper"

describe("DateHelper", () => {
  describe("getCurrentUnixTimestamp", () => {
    test("returns current time in seconds", () => {
      const before = Math.floor(Date.now() / 1000)
      const timestamp = getCurrentUnixTimestamp()
      const after = Math.floor(Date.now() / 1000)

      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after)
    })

    test("returns integer value", () => {
      const timestamp = getCurrentUnixTimestamp()
      expect(Number.isInteger(timestamp)).toBe(true)
    })
  })

  describe("getUnixTimestampInSeconds", () => {
    test("returns future timestamp", () => {
      const now = getCurrentUnixTimestamp()
      const future = getUnixTimestampInSeconds(100)

      expect(future).toBeGreaterThan(now)
      expect(future).toBe(now + 100)
    })

    test("works with TimeInSeconds constants", () => {
      const now = getCurrentUnixTimestamp()
      const tomorrow = getUnixTimestampInSeconds(TimeInSeconds.DAY)

      expect(tomorrow).toBe(now + 86400)
    })

    test("handles negative values for past timestamps", () => {
      const now = getCurrentUnixTimestamp()
      const past = getUnixTimestampInSeconds(-100)

      expect(past).toBeLessThan(now)
      expect(past).toBe(now - 100)
    })
  })

  describe("TimeInSeconds", () => {
    test("MINUTE equals 60 seconds", () => {
      expect(TimeInSeconds.MINUTE).toBe(60)
    })

    test("HOUR equals 3600 seconds", () => {
      expect(TimeInSeconds.HOUR).toBe(3600)
    })

    test("DAY equals 86400 seconds", () => {
      expect(TimeInSeconds.DAY).toBe(86400)
    })

    test("WEEK equals 604800 seconds", () => {
      expect(TimeInSeconds.WEEK).toBe(604800)
    })

    test("MONTH equals 2592000 seconds", () => {
      expect(TimeInSeconds.MONTH).toBe(2592000)
    })

    test("constants are related correctly", () => {
      expect(TimeInSeconds.HOUR).toBe(TimeInSeconds.MINUTE * 60)
      expect(TimeInSeconds.DAY).toBe(TimeInSeconds.HOUR * 24)
      expect(TimeInSeconds.WEEK).toBe(TimeInSeconds.DAY * 7)
      expect(TimeInSeconds.MONTH).toBe(TimeInSeconds.DAY * 30)
    })
  })
})
