import { describe, expect, test } from "vitest"
import { checksumAddress } from "../../src/utils/address"

describe("checksumAddress", () => {
  test("checksums a lowercase address", () => {
    expect(checksumAddress("0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed")).toBe(
      "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    )
  })

  test("checksums an uppercase address", () => {
    expect(checksumAddress("0x5AAEB6053F3E94C9B9A09F33669435E7EF1BEAED")).toBe(
      "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    )
  })

  test("returns same result for already-checksummed address", () => {
    const addr = "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"
    expect(checksumAddress(addr)).toBe(addr)
  })

  test("checksums the zero address", () => {
    expect(checksumAddress("0x0000000000000000000000000000000000000000")).toBe(
      "0x0000000000000000000000000000000000000000",
    )
  })

  test("throws for invalid address (too short)", () => {
    expect(() => checksumAddress("0x123")).toThrow("Invalid address")
  })

  test("throws for invalid address (no 0x prefix)", () => {
    expect(() =>
      checksumAddress("5aaeb6053f3e94c9b9a09f33669435e7ef1beaed"),
    ).toThrow("Invalid address")
  })

  test("throws for invalid characters", () => {
    expect(() =>
      checksumAddress("0xGGGGb6053f3e94c9b9a09f33669435e7ef1beaed"),
    ).toThrow("Invalid address")
  })

  test("throws for incorrect mixed-case checksum", () => {
    // Correct checksum is 0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed
    // Flip one letter to create an invalid checksum
    expect(() =>
      checksumAddress("0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed"),
    ).toThrow("Invalid address checksum")
  })
})
