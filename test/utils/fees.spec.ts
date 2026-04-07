import { describe, expect, test } from "vitest"
import type { Fee } from "../../src/types"
import {
  basisPointsForFee,
  totalBasisPointsForFees,
} from "../../src/utils/fees"

describe("Utils: fees", () => {
  describe("basisPointsForFee", () => {
    test("converts 2.5% fee to 250 basis points", () => {
      const fee: Fee = {
        fee: 2.5,
        recipient: "0x0000000000000000000000000000000000000000",
        required: false,
      }
      expect(basisPointsForFee(fee)).toBe(250n)
    })

    test("converts 0.5% fee to 50 basis points", () => {
      const fee: Fee = {
        fee: 0.5,
        recipient: "0x0000000000000000000000000000000000000000",
        required: false,
      }
      expect(basisPointsForFee(fee)).toBe(50n)
    })

    test("converts 10% fee to 1000 basis points", () => {
      const fee: Fee = {
        fee: 10,
        recipient: "0x0000000000000000000000000000000000000000",
        required: false,
      }
      expect(basisPointsForFee(fee)).toBe(1000n)
    })

    test("converts 0% fee to 0 basis points", () => {
      const fee: Fee = {
        fee: 0,
        recipient: "0x0000000000000000000000000000000000000000",
        required: false,
      }
      expect(basisPointsForFee(fee)).toBe(0n)
    })

    test("converts 100% fee to 10000 basis points", () => {
      const fee: Fee = {
        fee: 100,
        recipient: "0x0000000000000000000000000000000000000000",
        required: false,
      }
      expect(basisPointsForFee(fee)).toBe(10000n)
    })

    test("handles fractional percentages correctly", () => {
      const fee: Fee = {
        fee: 1.25,
        recipient: "0x0000000000000000000000000000000000000000",
        required: false,
      }
      expect(basisPointsForFee(fee)).toBe(125n)
    })

    test("handles very small percentages", () => {
      const fee: Fee = {
        fee: 0.01,
        recipient: "0x0000000000000000000000000000000000000000",
        required: false,
      }
      expect(basisPointsForFee(fee)).toBe(1n)
    })
  })

  describe("totalBasisPointsForFees", () => {
    test("returns 0 for empty fees array", () => {
      expect(totalBasisPointsForFees([])).toBe(0n)
    })

    test("returns correct total for single fee", () => {
      const fees: Fee[] = [
        {
          fee: 2.5,
          recipient: "0x0000000000000000000000000000000000000000",
          required: false,
        },
      ]
      expect(totalBasisPointsForFees(fees)).toBe(250n)
    })

    test("returns correct total for multiple fees", () => {
      const fees: Fee[] = [
        {
          fee: 2.5,
          recipient: "0x0000000000000000000000000000000000000001",
          required: false,
        },
        {
          fee: 1.0,
          recipient: "0x0000000000000000000000000000000000000002",
          required: true,
        },
        {
          fee: 0.5,
          recipient: "0x0000000000000000000000000000000000000003",
          required: false,
        },
      ]
      // 250 + 100 + 50 = 400
      expect(totalBasisPointsForFees(fees)).toBe(400n)
    })

    test("handles mix of required and non-required fees", () => {
      const fees: Fee[] = [
        {
          fee: 5.0,
          recipient: "0x0000000000000000000000000000000000000001",
          required: true,
        },
        {
          fee: 2.5,
          recipient: "0x0000000000000000000000000000000000000002",
          required: false,
        },
      ]
      // 500 + 250 = 750
      expect(totalBasisPointsForFees(fees)).toBe(750n)
    })

    test("handles all zero fees", () => {
      const fees: Fee[] = [
        {
          fee: 0,
          recipient: "0x0000000000000000000000000000000000000001",
          required: false,
        },
        {
          fee: 0,
          recipient: "0x0000000000000000000000000000000000000002",
          required: false,
        },
      ]
      expect(totalBasisPointsForFees(fees)).toBe(0n)
    })

    test("handles fractional fee totals", () => {
      const fees: Fee[] = [
        {
          fee: 1.25,
          recipient: "0x0000000000000000000000000000000000000001",
          required: false,
        },
        {
          fee: 0.75,
          recipient: "0x0000000000000000000000000000000000000002",
          required: false,
        },
      ]
      // 125 + 75 = 200
      expect(totalBasisPointsForFees(fees)).toBe(200n)
    })

    test("handles many fees", () => {
      const fees: Fee[] = Array.from({ length: 10 }, (_, i) => ({
        fee: 1.0,
        recipient: `0x000000000000000000000000000000000000000${i}`,
        required: i % 2 === 0,
      }))
      // 10 * 100 = 1000
      expect(totalBasisPointsForFees(fees)).toBe(1000n)
    })
  })
})
