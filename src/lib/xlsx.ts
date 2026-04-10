import type * as XLSXType from "xlsx"
import type { Row } from "@/lib/clean"

let xlsxModule: typeof XLSXType | null = null

async function getXlsx(): Promise<typeof XLSXType> {
  if (!xlsxModule) xlsxModule = await import("xlsx")
  return xlsxModule
}

/** Eagerly loads the xlsx module — call in test beforeAll so parseSheet/buildWorkbook work without readWorkbook. */
export async function ensureXlsx(): Promise<void> {
  await getXlsx()
}

export async function readWorkbook(
  source: File | ArrayBuffer,
): Promise<XLSXType.WorkBook> {
  const XLSX = await getXlsx()
  const buffer =
    source instanceof ArrayBuffer ? source : await source.arrayBuffer()
  return XLSX.read(buffer, { type: "array", cellDates: true })
}

export function parseSheet(
  workbook: XLSXType.WorkBook,
  sheetName: string,
): { headers: string[]; rows: Row[]; columnLabels: Record<string, string> } {
  if (!xlsxModule) throw new Error("xlsx not loaded — call readWorkbook first")
  const XLSX = xlsxModule
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) return { headers: [], rows: [], columnLabels: {} }

  const ref = sheet["!ref"]
  if (!ref) return { headers: [], rows: [], columnLabels: {} }

  const range = XLSX.utils.decode_range(ref)

  const headers: string[] = []
  for (let c = range.s.c; c <= range.e.c; c++) {
    headers.push(XLSX.utils.encode_col(c))
  }

  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
    raw: false,
    blankrows: true,
  })

  const rows: Row[] = raw.map((arr) => {
    const row: Row = {}
    headers.forEach((h, i) => {
      row[h] = arr[i] ?? null
    })
    return row
  })

  let end = rows.length
  while (end > 0 && headers.every((h) => rows[end - 1][h] === null)) {
    end--
  }

  const trimmed = rows.slice(0, end)

  // Derive display labels from row 0 — if a cell has a non-empty string value
  // use it as the column label (e.g. A → "id"), otherwise fall back to the letter.
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
  sourceWorkbook?: XLSXType.WorkBook,
): XLSXType.WorkBook {
  if (!xlsxModule) throw new Error("xlsx not loaded — call readWorkbook first")
  const XLSX = xlsxModule
  const ws = XLSX.utils.json_to_sheet(rows, { header: headers })
  const wb = XLSX.utils.book_new()

  if (sourceWorkbook) {
    // Preserve all sheets from the original workbook, replacing only the active one
    for (const name of sourceWorkbook.SheetNames) {
      if (name === sheetName) {
        XLSX.utils.book_append_sheet(wb, ws, name)
      } else {
        XLSX.utils.book_append_sheet(wb, sourceWorkbook.Sheets[name], name)
      }
    }
  } else {
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  }

  return wb
}

export async function exportXlsx(
  headers: string[],
  rows: Row[],
  fileName: string,
  sheetName = "Sheet1",
  sourceWorkbook?: XLSXType.WorkBook,
): Promise<void> {
  const XLSX = await getXlsx()
  XLSX.writeFile(
    buildWorkbook(headers, rows, sheetName, sourceWorkbook),
    fileName,
  )
}
