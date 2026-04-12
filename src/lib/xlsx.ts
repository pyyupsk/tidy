import type { Row as ExcelRow, Workbook } from "exceljs"
import type { Row } from "@/lib/clean"

type ExcelJSModule = typeof import("exceljs")

let excelJsModule: ExcelJSModule | null = null

async function getExcelJs(): Promise<ExcelJSModule> {
  excelJsModule ??= await import("exceljs")
  return excelJsModule
}

/** Eagerly loads the exceljs module — call in test beforeAll so parseSheet/buildWorkbook work without readWorkbook. */
export async function ensureXlsx(): Promise<void> {
  await getExcelJs()
}

function colLetter(index: number): string {
  // index is 1-based: 1 → "A", 2 → "B", 26 → "Z", 27 → "AA"
  let letter = ""
  let n = index
  while (n > 0) {
    const mod = (n - 1) % 26
    letter = String.fromCodePoint(65 + mod) + letter
    n = Math.floor((n - 1) / 26)
  }
  return letter
}

function normalizeCellValue(value: unknown): unknown {
  if (value === null || value === undefined) return null
  if (typeof value === "object") {
    if (value instanceof Date) return String(value)
    // Formula cell: { formula, result } or { sharedFormula, result }
    if ("result" in value) {
      const r = (value as { result?: unknown }).result
      if (r == null || typeof r === "object") return null
      return String(r) // NOSONAR
    }
    // Rich text: { richText: { text: string }[] }
    if ("richText" in value) {
      return (value as { richText: { text: string }[] }).richText
        .map((rt) => rt.text)
        .join("")
    }
    // Hyperlink: { hyperlink: string, text?: string }
    if ("hyperlink" in value) {
      const v = value as { hyperlink: string; text?: string }
      return v.text ?? v.hyperlink
    }
    // Fallback for unrecognised objects — avoid "[object Object]"
    return null
  }
  return String(value) // NOSONAR
}

export async function readWorkbook(
  source: File | ArrayBuffer,
): Promise<Workbook> {
  const ExcelJS = await getExcelJs()
  const buffer =
    source instanceof ArrayBuffer ? source : await source.arrayBuffer()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  return workbook
}

export function parseSheet(
  workbook: Workbook,
  sheetName: string,
): { headers: string[]; rows: Row[]; columnLabels: Record<string, string> } {
  const worksheet = workbook.getWorksheet(sheetName)
  if (!worksheet || worksheet.columnCount === 0) {
    return { headers: [], rows: [], columnLabels: {} }
  }

  const colCount = worksheet.columnCount
  const headers = Array.from({ length: colCount }, (_, i) => colLetter(i + 1))

  const rows: Row[] = []
  worksheet.eachRow({ includeEmpty: true }, (row: ExcelRow) => {
    const r: Row = {}
    for (let c = 1; c <= colCount; c++) {
      r[colLetter(c)] = normalizeCellValue(row.getCell(c).value)
    }
    rows.push(r)
  })

  // Trim trailing all-null rows
  let end = rows.length
  while (end > 0 && headers.every((h) => rows[end - 1][h] === null)) {
    end--
  }
  const trimmed = rows.slice(0, end)

  // Derive display labels from row 0 — non-empty string values in the first row
  const columnLabels: Record<string, string> = {}
  if (trimmed.length > 0) {
    for (const h of headers) {
      const v = trimmed[0][h]
      if (typeof v === "string" && v.trim() !== "") {
        columnLabels[h] = v.trim()
      }
    }
  }

  return { headers, rows: trimmed, columnLabels }
}

export function buildWorkbook(
  headers: string[],
  rows: Row[],
  sheetName: string,
  sourceWorkbook?: Workbook,
): Workbook {
  if (!excelJsModule)
    throw new Error("exceljs not loaded — call readWorkbook first")

  const wb = new excelJsModule.Workbook()

  if (sourceWorkbook) {
    for (const srcWs of sourceWorkbook.worksheets) {
      if (srcWs.name === sheetName) {
        const ws = wb.addWorksheet(sheetName)
        ws.addRow(headers)
        for (const row of rows) {
          ws.addRow(headers.map((h) => row[h]))
        }
      } else {
        const ws = wb.addWorksheet(srcWs.name)
        srcWs.eachRow({ includeEmpty: true }, (row: ExcelRow) => {
          // row.values is 1-indexed ([undefined, val1, val2, ...]) — slice from 1
          ws.addRow((row.values as unknown[]).slice(1))
        })
      }
    }
  } else {
    const ws = wb.addWorksheet(sheetName)
    ws.addRow(headers)
    for (const row of rows) {
      ws.addRow(headers.map((h) => row[h]))
    }
  }

  return wb
}

export async function exportXlsx(
  headers: string[],
  rows: Row[],
  fileName: string,
  sheetName = "Sheet1",
  sourceWorkbook?: Workbook,
): Promise<void> {
  await getExcelJs() // ensure loaded before buildWorkbook
  const wb = buildWorkbook(headers, rows, sheetName, sourceWorkbook)
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}
