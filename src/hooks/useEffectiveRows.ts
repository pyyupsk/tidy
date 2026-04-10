import { useMemo } from "react"
import { useSpreadsheetStore } from "@/stores/use-spreadsheet-store"

export function useEffectiveRows() {
  const rows = useSpreadsheetStore((s) => s.rows)
  const skipFirstRow = useSpreadsheetStore((s) => s.skipFirstRow)
  return useMemo(
    () => (skipFirstRow ? rows.slice(1) : rows),
    [rows, skipFirstRow],
  )
}
