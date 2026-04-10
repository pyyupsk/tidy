import * as XLSX from "xlsx"
import type { Row } from "@/lib/clean"

export async function readWorkbook(file: File): Promise<XLSX.WorkBook> {
  const buffer = await file.arrayBuffer()
  return XLSX.read(buffer, { type: "array", cellDates: true })
}

export function parseSheet(
  workbook: XLSX.WorkBook,
  sheetName: string,
): { headers: string[]; rows: Row[] } {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) return { headers: [], rows: [] }
  const raw = XLSX.utils.sheet_to_json<Row>(sheet, { defval: null, raw: false })
  if (raw.length === 0) return { headers: [], rows: [] }
  const headers = Object.keys(raw[0])
  return { headers, rows: raw }
}

export function exportXlsx(
  headers: string[],
  rows: Row[],
  fileName: string,
): void {
  const ws = XLSX.utils.json_to_sheet(rows, { header: headers })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
  XLSX.writeFile(wb, fileName)
}
