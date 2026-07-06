import { describe, expect, test } from "vitest"
import { ZERO_ADDRESS } from "../../src/constants"
import { OrderSide } from "../../src/types"
import { sdk } from "../utils/sdk"

describe("SDK: _getPriceParameters", () => {
  test("throws the intended validation error when amount is null", async () => {
    await expect(
      (sdk as any)._getPriceParameters(OrderSide.LISTING, ZERO_ADDRESS, null),
    ).rejects.toThrow("Starting price must be a number >= 0")
  })
})
