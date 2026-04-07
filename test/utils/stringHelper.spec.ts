import { describe, expect, test } from "vitest"
import { pluralize } from "../../src/utils/stringHelper"

describe("Utils: stringHelper", () => {
  describe("pluralize", () => {
    test("returns singular form for count of 1", () => {
      expect(pluralize(1, "listing")).toBe("listing")
      expect(pluralize(1, "offer")).toBe("offer")
      expect(pluralize(1, "operation")).toBe("operation")
    })

    test("returns plural form for count of 0", () => {
      expect(pluralize(0, "listing")).toBe("listings")
      expect(pluralize(0, "offer")).toBe("offers")
      expect(pluralize(0, "operation")).toBe("operations")
    })

    test("returns plural form for count greater than 1", () => {
      expect(pluralize(2, "listing")).toBe("listings")
      expect(pluralize(5, "offer")).toBe("offers")
      expect(pluralize(100, "operation")).toBe("operations")
    })

    test("uses custom plural form when provided", () => {
      expect(pluralize(1, "query", "queries")).toBe("query")
      expect(pluralize(2, "query", "queries")).toBe("queries")
      expect(pluralize(5, "query", "queries")).toBe("queries")
    })

    test("handles irregular plurals with custom plural parameter", () => {
      expect(pluralize(1, "child", "children")).toBe("child")
      expect(pluralize(3, "child", "children")).toBe("children")
      expect(pluralize(1, "person", "people")).toBe("person")
      expect(pluralize(10, "person", "people")).toBe("people")
    })

    test("defaults to adding 's' when no custom plural provided", () => {
      expect(pluralize(2, "item")).toBe("items")
      expect(pluralize(5, "order")).toBe("orders")
    })
  })
})
