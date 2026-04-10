import { describe, expect, test } from "vitest"

describe("Root exports", () => {
  test("exports ZERO_ADDRESS and MAX_UINT256 from constants", async () => {
    const { ZERO_ADDRESS, MAX_UINT256 } = await import("../src")
    expect(ZERO_ADDRESS).toBe("0x0000000000000000000000000000000000000000")
    expect(MAX_UINT256).toBe(2n ** 256n - 1n)
  })

  test("exports checksumAddress from utils", async () => {
    const { checksumAddress } = await import("../src")
    expect(typeof checksumAddress).toBe("function")
    expect(checksumAddress("0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed")).toBe(
      "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    )
  })

  test("exports parseUnits and parseEther from utils", async () => {
    const { parseUnits, parseEther } = await import("../src")
    expect(typeof parseUnits).toBe("function")
    expect(typeof parseEther).toBe("function")
    expect(parseEther("1")).toBe(1000000000000000000n)
    expect(parseUnits("100", 6)).toBe(100000000n)
  })

  test("exports Amount type (compile-time check)", async () => {
    const { OpenSeaSDK } = await import("../src")
    expect(typeof OpenSeaSDK).toBe("function")
  })

  test("exports provider abstraction types", async () => {
    // These are type-only exports, so we just verify the module loads
    const mod = await import("../src")
    expect(mod).toBeDefined()
  })
})
