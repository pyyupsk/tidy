import { Workbook } from "exceljs"
import { beforeAll, describe, expect, it } from "vitest"
import { buildWorkbook, ensureXlsx, parseSheet } from "@/lib/xlsx"

beforeAll(async () => {
  await ensureXlsx()
})

function makeWorkbook(data: unknown[][]): InstanceType<typeof Workbook> {
  const workbook = new Workbook()
  const ws = workbook.addWorksheet("Sheet1")
  for (const row of data) {
    ws.addRow(row)
  }
  return workbook
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
    expect(rows.at(-1)).toEqual({ A: "1" })
    expect(rows.length).toBeLessThanOrEqual(2)
  })

  it("does not trim a non-null row that follows a null row", () => {
    const workbook = new Workbook()
    const ws = workbook.addWorksheet("Sheet1")
    ws.getRow(1).getCell(1).value = "a"
    ws.getRow(2).getCell(1).value = null
    ws.getRow(3).getCell(1).value = 2
    const { rows } = parseSheet(workbook, "Sheet1")
    expect(rows).toHaveLength(3)
    expect(rows[2]).toEqual({ A: "2" })
  })

  it("uses column letter as label when row 0 value is null", () => {
    const workbook = new Workbook()
    const ws = workbook.addWorksheet("Sheet1")
    ws.getRow(1).getCell(1).value = null
    ws.getRow(1).getCell(2).value = null
    ws.getRow(2).getCell(1).value = 2
    ws.getRow(2).getCell(2).value = 3
    const { columnLabels } = parseSheet(workbook, "Sheet1")
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
    expect(wb.worksheets.map((ws) => ws.name)).toEqual(["Sheet1"])
  })

  it("preserves other sheets from the source workbook", () => {
    const source = new Workbook()
    const ws1 = source.addWorksheet("Sheet1")
    ws1.addRow(["x"])
    const ws2 = source.addWorksheet("Other")
    ws2.addRow(["y"])

    const wb = buildWorkbook(["A"], [{ A: 1 }], "Sheet1", source)
    expect(wb.worksheets.map((ws) => ws.name)).toEqual(["Sheet1", "Other"])
  })

  it("replaces only the active sheet while keeping others intact", () => {
    const source = new Workbook()
    const ws1 = source.addWorksheet("Sheet1")
    ws1.addRow(["old"])
    const ws2 = source.addWorksheet("Other")
    ws2.addRow(["original"])

    const wb = buildWorkbook(["A"], [{ A: "new" }], "Sheet1", source)
    const other = wb.getWorksheet("Other")
    expect(other?.getRow(1).getCell(1).value).toBe("original")
  })

  it("uses the new sheet data for the active sheet", () => {
    const source = new Workbook()
    const ws = source.addWorksheet("Sheet1")
    ws.addRow(["old"])

    const wb = buildWorkbook(["A"], [{ A: "new" }], "Sheet1", source)
    const active = wb.getWorksheet("Sheet1")
    // Row 1 is the headers row — cell A1 should be "A"
    expect(active?.getRow(1).getCell(1).value).toBe("A")
  })
})
