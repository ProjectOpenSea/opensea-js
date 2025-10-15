import { expect } from "chai";
import { suite, test } from "mocha";
import { pluralize } from "../../src/utils/stringHelper";

suite("Utils: stringHelper", () => {
  suite("pluralize", () => {
    test("returns singular form for count of 1", () => {
      expect(pluralize(1, "listing")).to.equal("listing");
      expect(pluralize(1, "offer")).to.equal("offer");
      expect(pluralize(1, "operation")).to.equal("operation");
    });

    test("returns plural form for count of 0", () => {
      expect(pluralize(0, "listing")).to.equal("listings");
      expect(pluralize(0, "offer")).to.equal("offers");
      expect(pluralize(0, "operation")).to.equal("operations");
    });

    test("returns plural form for count greater than 1", () => {
      expect(pluralize(2, "listing")).to.equal("listings");
      expect(pluralize(5, "offer")).to.equal("offers");
      expect(pluralize(100, "operation")).to.equal("operations");
    });

    test("uses custom plural form when provided", () => {
      expect(pluralize(1, "query", "queries")).to.equal("query");
      expect(pluralize(2, "query", "queries")).to.equal("queries");
      expect(pluralize(5, "query", "queries")).to.equal("queries");
    });

    test("handles irregular plurals with custom plural parameter", () => {
      expect(pluralize(1, "child", "children")).to.equal("child");
      expect(pluralize(3, "child", "children")).to.equal("children");
      expect(pluralize(1, "person", "people")).to.equal("person");
      expect(pluralize(10, "person", "people")).to.equal("people");
    });

    test("defaults to adding 's' when no custom plural provided", () => {
      expect(pluralize(2, "item")).to.equal("items");
      expect(pluralize(5, "order")).to.equal("orders");
    });
  });
});
