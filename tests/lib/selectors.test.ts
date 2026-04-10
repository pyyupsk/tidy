import { describe, expect, it } from "vitest"
import {
  selectAllNullColumns,
  selectCleanRowCount,
  selectColumnsWithNulls,
  selectDuplicateIndices,
  selectNullCount,
} from "@/stores/use-spreadsheet-store"

const rows = [
  { A: "alice", B: 1, C: null },
  { A: "bob", B: null, C: null },
  { A: "alice", B: 1, C: null },
]
const headers = ["A", "B", "C"]

describe("selectDuplicateIndices", () => {
  it("returns an empty set when no keys selected", () => {
    expect(selectDuplicateIndices({ rows, duplicateKeys: [] })).toEqual(
      new Set(),
    )
  })

  it("marks the second occurrence as duplicate", () => {
    const result = selectDuplicateIndices({
      rows,
      duplicateKeys: ["A", "B"],
    })
    expect(result).toEqual(new Set([2]))
  })
})

describe("selectNullCount", () => {
  it("counts all nullish cells across all rows and headers", () => {
    // C is null in all 3 rows (3) + B is null in row 1 (1) = 4
    expect(selectNullCount({ rows, headers })).toBe(4)
  })

  it("returns 0 when there are no nulls", () => {
    const dense = [{ A: 1, B: 2 }]
    expect(selectNullCount({ rows: dense, headers: ["A", "B"] })).toBe(0)
  })
})

describe("selectColumnsWithNulls", () => {
  it("returns columns that have at least one null", () => {
    expect(selectColumnsWithNulls({ rows, headers })).toEqual(["B", "C"])
  })

  it("returns empty array when no nulls exist", () => {
    const dense = [{ A: 1 }]
    expect(selectColumnsWithNulls({ rows: dense, headers: ["A"] })).toEqual([])
  })
})

describe("selectAllNullColumns", () => {
  it("returns columns where every effective row is null", () => {
    // C is null in all rows, B is null only in row 1
    expect(
      selectAllNullColumns({ rows, headers, skipFirstRow: false }),
    ).toEqual(["C"])
  })

  it("respects skipFirstRow by excluding row 0 from the check", () => {
    // With skipFirstRow, effective rows are [row1, row2].
    // B is null in row1 and non-null in row2 — so B is not all-null.
    // C is null in both — still all-null.
    expect(selectAllNullColumns({ rows, headers, skipFirstRow: true })).toEqual(
      ["C"],
    )
  })

  it("returns empty array when no rows remain after skip", () => {
    const single = [{ A: null }]
    expect(
      selectAllNullColumns({
        rows: single,
        headers: ["A"],
        skipFirstRow: true,
      }),
    ).toEqual([])
  })
})

describe("selectCleanRowCount", () => {
  it("subtracts duplicate count from total rows", () => {
    // rows[2] is a duplicate of rows[0], so clean count = 3 - 1 = 2
    expect(
      selectCleanRowCount({ rows, headers, duplicateKeys: ["A", "B"] }),
    ).toBe(2)
  })

  it("equals total rows when no duplicate keys are selected", () => {
    expect(selectCleanRowCount({ rows, headers, duplicateKeys: [] })).toBe(
      rows.length,
    )
  })
})
