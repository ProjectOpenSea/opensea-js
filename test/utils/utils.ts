import { expect } from "chai";
import { OrderV2 } from "src/orders/types";
import { decodeTokenIds } from "src/utils/utils";

export const expectValidOrder = (order: OrderV2) => {
  const requiredFields = [
    "createdDate",
    "closingDate",
    "listingTime",
    "expirationTime",
    "orderHash",
    "maker",
    "taker",
    "protocolData",
    "protocolAddress",
    "currentPrice",
    "makerFees",
    "takerFees",
    "side",
    "orderType",
    "cancelled",
    "finalized",
    "markedInvalid",
    "makerAssetBundle",
    "takerAssetBundle",
    "remainingQuantity",
  ];
  for (const field of requiredFields) {
    expect(field in order).to.be.true;
  }
};

describe("decodeTokenIds", () => {
  it("should return an empty array when given an empty string", () => {
    expect(decodeTokenIds("")).equals([]);
  });

  it('should return ["*"] when given "*" as input', () => {
    expect(decodeTokenIds("*")).equals(["*"]);
  });

  it("should correctly decode a single number", () => {
    expect(decodeTokenIds("123")).equals(["123"]);
  });

  it("should correctly decode multiple comma-separated numbers", () => {
    expect(decodeTokenIds("1,2,3,4")).equals(["1", "2", "3", "4"]);
  });

  it("should correctly decode a range of numbers", () => {
    expect(decodeTokenIds("5:8")).equals(["5", "6", "7", "8"]);
  });

  it("should correctly decode multiple ranges of numbers", () => {
    expect(decodeTokenIds("1:3,7:9")).equals(["1", "2", "3", "7", "8", "9"]);
  });

  it("should correctly decode a mix of single numbers and ranges", () => {
    expect(decodeTokenIds("1,3:5,8")).equals(["1", "3", "4", "5", "8"]);
  });

  it("should handle large ranges correctly", () => {
    expect(decodeTokenIds("10000:10002")).equals(["10000", "10001", "10002"]);
  });

  it("should throw an error for invalid input format", () => {
    expect(() => decodeTokenIds("1:3:5,8")).throws(
      "Invalid input format. Expected a valid comma-separated list of numbers and ranges.",
    );
    expect(() => decodeTokenIds("1,2:4:6")).throws(
      "Invalid input format. Expected a valid comma-separated list of numbers and ranges.",
    );
    expect(() => decodeTokenIds("1;3:5,8")).throws(
      "Invalid input format. Expected a valid comma-separated list of numbers and ranges.",
    );
  });

  it("should throw an error for invalid range format", () => {
    expect(() => decodeTokenIds("5:2")).throws(
      "Invalid range. End value must be greater than or equal to the start value.",
    );
    expect(() => decodeTokenIds("10:10")).throws(
      "Invalid range. End value must be greater than or equal to the start value.",
    );
  });

  it("should handle very large input numbers", () => {
    const encoded = "100000000000000000000:100000000000000000002";
    expect(decodeTokenIds(encoded)).equals([
      "100000000000000000000",
      "100000000000000000001",
      "100000000000000000002",
    ]);
  });
});
