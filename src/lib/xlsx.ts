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

  const ref = sheet["!ref"]
  if (!ref) return { headers: [], rows: [] }

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
      row[h] = (arr)[i] ?? null
    })
    return row
  })

  return { headers, rows }
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
