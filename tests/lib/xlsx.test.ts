import { describe, expect, it } from "vitest"
import * as XLSX from "xlsx"
import { buildWorkbook, parseSheet } from "@/lib/xlsx"

function makeWorkbook(data: unknown[][]): XLSX.WorkBook {
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
  return wb
}

describe("parseSheet", () => {
  it("returns empty result for a missing sheet", () => {
    const wb = makeWorkbook([["a", "b"]])
    const result = parseSheet(wb, "DoesNotExist")
    expect(result).toEqual({ headers: [], rows: [], columnLabels: {} })
  })

  it("maps Excel letters as headers and row 0 strings as labels", () => {
    const wb = makeWorkbook([
      ["id", "name"],
      [1, "alice"],
    ])
    const { headers, rows, columnLabels } = parseSheet(wb, "Sheet1")
    expect(headers).toEqual(["A", "B"])
    expect(columnLabels).toEqual({ A: "id", B: "name" })
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({ A: "id", B: "name" })
    expect(rows[1]).toEqual({ A: "1", B: "alice" })
  })

  it("trims trailing all-null rows", () => {
    const wb = makeWorkbook([["x"], [1], [null], [null]])
    const { rows } = parseSheet(wb, "Sheet1")
    expect(rows).toHaveLength(2)
    expect(rows[1]).toEqual({ A: "1" })
  })

  it("does not trim a non-null row that follows a null row", () => {
    const wb = makeWorkbook([["a"], [null], [2]])
    const { rows } = parseSheet(wb, "Sheet1")
    expect(rows).toHaveLength(3)
  })

  it("uses column letter as label when row 0 value is null", () => {
    // With raw:false, numbers become strings — use null to get a non-string label
    const ws = XLSX.utils.aoa_to_sheet([
      [null, null],
      [2, 3],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
    const { columnLabels } = parseSheet(wb, "Sheet1")
    expect(columnLabels).toEqual({})
  })

  it("handles a single-column sheet correctly", () => {
    const wb = makeWorkbook([["value"], [42]])
    const { headers, rows } = parseSheet(wb, "Sheet1")
    expect(headers).toEqual(["A"])
    expect(rows).toHaveLength(2)
  })
})

describe("buildWorkbook", () => {
  it("produces a workbook with the given sheet name", () => {
    const wb = buildWorkbook(["A", "B"], [{ A: 1, B: 2 }], "Sheet1")
    expect(wb.SheetNames).toEqual(["Sheet1"])
  })

  it("preserves other sheets from the source workbook", () => {
    const source = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(
      source,
      XLSX.utils.aoa_to_sheet([["x"]]),
      "Sheet1",
    )
    XLSX.utils.book_append_sheet(
      source,
      XLSX.utils.aoa_to_sheet([["y"]]),
      "Other",
    )

    const wb = buildWorkbook(["A"], [{ A: 1 }], "Sheet1", source)
    expect(wb.SheetNames).toEqual(["Sheet1", "Other"])
  })

  it("replaces only the active sheet while keeping others intact", () => {
    const originalOther = XLSX.utils.aoa_to_sheet([["original"]])
    const source = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(
      source,
      XLSX.utils.aoa_to_sheet([["old"]]),
      "Sheet1",
    )
    XLSX.utils.book_append_sheet(source, originalOther, "Other")

    const wb = buildWorkbook(["A"], [{ A: "new" }], "Sheet1", source)
    expect(wb.Sheets.Other).toBe(originalOther)
  })

  it("uses the new sheet data for the active sheet", () => {
    const source = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(
      source,
      XLSX.utils.aoa_to_sheet([["old"]]),
      "Sheet1",
    )

    const wb = buildWorkbook(["A"], [{ A: "new" }], "Sheet1", source)
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      wb.Sheets.Sheet1,
      {
        header: 1,
      },
    )
    // First cell should be "A" (header) not "old"
    expect((data[0] as unknown as string[])[0]).toBe("A")
  })
})
