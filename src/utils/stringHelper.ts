/**
 * Utility functions for string formatting and manipulation.
 */

/**
 * Pluralizes a word based on count.
 *
 * @param count The number of items
 * @param singular The singular form of the word
 * @param plural Optional custom plural form. If not provided, adds 's' to singular
 * @returns The appropriately pluralized word
 *
 * @example
 * pluralize(1, 'listing') // 'listing'
 * pluralize(5, 'listing') // 'listings'
 * pluralize(1, 'query', 'queries') // 'query'
 * pluralize(3, 'query', 'queries') // 'queries'
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
): string {
  return count === 1 ? singular : plural || `${singular}s`;
}
