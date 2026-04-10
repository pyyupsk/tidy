import { describe, expect, it } from "vitest"
import {
  applyDropColumns,
  applyFillRules,
  computeDuplicateIndices,
  computeMedian,
  isNullish,
} from "@/lib/clean"

describe("isNullish", () => {
  it("returns true for null", () => expect(isNullish(null)).toBe(true))
  it("returns true for undefined", () =>
    expect(isNullish(undefined)).toBe(true))
  it("returns true for empty string", () => expect(isNullish("")).toBe(true))
  it("returns false for 0", () => expect(isNullish(0)).toBe(false))
  it("returns false for non-empty string", () =>
    expect(isNullish("x")).toBe(false))
  it("returns false for false", () => expect(isNullish(false)).toBe(false))
})

describe("computeDuplicateIndices", () => {
  it("returns empty set when no keys selected", () => {
    const rows = [{ a: 1 }, { a: 1 }]
    expect(computeDuplicateIndices(rows, [])).toEqual(new Set())
  })

  it("marks second occurrence as duplicate", () => {
    const rows = [
      { a: 1, b: 2 },
      { a: 1, b: 2 },
      { a: 3, b: 4 },
    ]
    expect(computeDuplicateIndices(rows, ["a", "b"])).toEqual(new Set([1]))
  })

  it("keeps first occurrence, marks later ones", () => {
    const rows = [{ a: 1 }, { a: 1 }, { a: 1 }]
    const result = computeDuplicateIndices(rows, ["a"])
    expect(result.has(0)).toBe(false)
    expect(result.has(1)).toBe(true)
    expect(result.has(2)).toBe(true)
  })

  it("treats null and undefined as equal for key purposes", () => {
    const rows = [{ a: null }, { a: undefined }]
    expect(computeDuplicateIndices(rows, ["a"])).toEqual(new Set([1]))
  })

  it("does not mark rows with different keys as duplicates", () => {
    const rows = [{ a: 1 }, { a: 2 }]
    expect(computeDuplicateIndices(rows, ["a"])).toEqual(new Set())
  })
})

describe("applyDropColumns", () => {
  it("removes specified columns from headers and row data", () => {
    const rows = [{ a: 1, b: 2, c: 3 }]
    const result = applyDropColumns(rows, ["a", "b", "c"], ["b"])
    expect(result.headers).toEqual(["a", "c"])
    expect(result.rows[0]).toEqual({ a: 1, c: 3 })
  })

  it("returns all columns when nothing is dropped", () => {
    const rows = [{ a: 1 }]
    const result = applyDropColumns(rows, ["a"], [])
    expect(result.headers).toEqual(["a"])
    expect(result.rows[0]).toEqual({ a: 1 })
  })

  it("preserves row order", () => {
    const rows = [{ a: 1 }, { a: 2 }, { a: 3 }]
    const result = applyDropColumns(rows, ["a"], [])
    expect(result.rows.map((r) => r.a)).toEqual([1, 2, 3])
  })
})

describe("computeMedian", () => {
  it("returns 0 for empty array", () => {
    expect(computeMedian([])).toBe(0)
  })

  it("returns the single value", () => {
    expect(computeMedian([5])).toBe(5)
  })

  it("returns middle value for odd count", () => {
    expect(computeMedian([1, 3, 5])).toBe(3)
  })

  it("returns average of two middles for even count", () => {
    expect(computeMedian([1, 2, 3, 4])).toBe(2.5)
  })

  it("handles unsorted input", () => {
    expect(computeMedian([5, 1, 3])).toBe(3)
  })
})

describe("applyFillRules", () => {
  it("fills null with a string literal", () => {
    const rows = [{ a: null }]
    const result = applyFillRules(rows, {
      a: { type: "literal", value: "Unknown" },
    })
    expect(result[0].a).toBe("Unknown")
  })

  it("fills null with a numeric literal", () => {
    const rows = [{ a: null }]
    const result = applyFillRules(rows, { a: { type: "literal", value: 0 } })
    expect(result[0].a).toBe(0)
  })

  it("does not overwrite non-null values", () => {
    const rows = [{ a: "existing" }]
    const result = applyFillRules(rows, {
      a: { type: "literal", value: "Unknown" },
    })
    expect(result[0].a).toBe("existing")
  })

  it("fills null with median of non-null numeric values in that column", () => {
    const rows = [{ age: 10 }, { age: 20 }, { age: null }, { age: 30 }]
    const result = applyFillRules(rows, { age: { type: "median" } })
    expect(result[2].age).toBe(20)
  })

  it("fills null with empty string for 'empty' rule", () => {
    const rows = [{ bio: null }]
    const result = applyFillRules(rows, { bio: { type: "empty" } })
    expect(result[0].bio).toBe("")
  })

  it("does not mutate the original rows", () => {
    const rows = [{ a: null }]
    applyFillRules(rows, { a: { type: "literal", value: "x" } })
    expect(rows[0].a).toBe(null)
  })

  it("forward-fills null with the value from the previous non-null row in that column", () => {
    const rows = [{ a: "x" }, { a: null }, { a: null }, { a: "y" }]
    const result = applyFillRules(rows, { a: { type: "forward" } })
    expect(result[0].a).toBe("x")
    expect(result[1].a).toBe("x")
    expect(result[2].a).toBe("x")
    expect(result[3].a).toBe("y")
  })

  it("leaves null as-is for forward-fill when no prior non-null value exists", () => {
    const rows = [{ a: null }, { a: null }, { a: "z" }]
    const result = applyFillRules(rows, { a: { type: "forward" } })
    expect(result[0].a).toBe(null)
    expect(result[1].a).toBe(null)
    expect(result[2].a).toBe("z")
  })

  it("does not mutate the original rows for forward-fill", () => {
    const rows = [{ a: "x" }, { a: null }]
    applyFillRules(rows, { a: { type: "forward" } })
    expect(rows[1].a).toBe(null)
  })

  it("tracks forward-fill state independently per column", () => {
    const rows = [
      { a: "x", b: null },
      { a: null, b: "y" },
      { a: null, b: null },
    ]
    const result = applyFillRules(rows, {
      a: { type: "forward" },
      b: { type: "forward" },
    })
    expect(result[1].a).toBe("x") // a forward-filled from row 0
    expect(result[1].b).toBe("y") // b has its own value
    expect(result[2].a).toBe("x") // a still forward-fills
    expect(result[2].b).toBe("y") // b forward-fills from row 1
  })
})
