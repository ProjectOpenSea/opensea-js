/**
 * Utility functions for working with Unix timestamps (seconds since epoch).
 * OpenSea API and Seaport protocol use Unix timestamps in seconds, not milliseconds.
 */

/**
 * Get the current Unix timestamp in seconds
 * @returns Current time as Unix timestamp (seconds since epoch)
 */
export function getCurrentUnixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Get a Unix timestamp for a future time
 * @param seconds Number of seconds from now
 * @returns Unix timestamp (seconds since epoch)
 * @example
 * // Get timestamp for 1 day from now
 * const tomorrow = getUnixTimestampInSeconds(60 * 60 * 24);
 */
export function getUnixTimestampInSeconds(seconds: number): number {
  return getCurrentUnixTimestamp() + seconds;
}

/**
 * Common time durations in seconds for convenience
 */
export const TimeInSeconds = {
  /** 1 minute = 60 seconds */
  MINUTE: 60,
  /** 1 hour = 3600 seconds */
  HOUR: 60 * 60,
  /** 1 day = 86400 seconds */
  DAY: 60 * 60 * 24,
  /** 1 week = 604800 seconds */
  WEEK: 60 * 60 * 24 * 7,
  /** 30 days = 2592000 seconds */
  MONTH: 60 * 60 * 24 * 30,
} as const;
