import type * as XLSX from "xlsx"
import { create } from "zustand"
import {
  applyDropColumns,
  applyFillRules,
  computeDuplicateIndices,
  isNullish,
  type Row,
} from "@/lib/clean"
import { exportXlsx, parseSheet, readWorkbook } from "@/lib/xlsx"
import type { FillRule } from "@/types/spreadsheet"
import { safe } from "@/utils/safe"

type SpreadsheetStore = {
  fileName: string | null
  sheetNames: string[]
  activeSheet: string | null
  headers: string[]
  rows: Row[]
  columnLabels: Record<string, string>
  duplicateKeys: string[]
  droppedColumns: string[]
  fillRules: Record<string, FillRule>
  // internal — workbook kept in memory for sheet switching
  _workbook: XLSX.WorkBook | null
  loadFile: (file: File) => Promise<string | null>
  switchSheet: (sheetName: string) => void
  toggleDuplicateKey: (col: string) => void
  toggleDropColumn: (col: string) => void
  setFillRule: (col: string, rule: FillRule) => void
  removeFillRule: (col: string) => void
  exportFile: () => void
  reset: () => void
}

const initialState = {
  fileName: null,
  sheetNames: [],
  activeSheet: null,
  headers: [],
  rows: [],
  columnLabels: {},
  duplicateKeys: [],
  droppedColumns: [],
  fillRules: {},
  _workbook: null,
} satisfies Pick<
  SpreadsheetStore,
  | "fileName"
  | "sheetNames"
  | "activeSheet"
  | "headers"
  | "rows"
  | "columnLabels"
  | "duplicateKeys"
  | "droppedColumns"
  | "fillRules"
  | "_workbook"
>

export const useSpreadsheetStore = create<SpreadsheetStore>((set, get) => ({
  ...initialState,

  loadFile: async (file) => {
    const [err, workbook] = await safe(readWorkbook(file))
    if (err) {
      console.error("Failed to parse xlsx:", err.message)
      return err.message
    }
    const sheetNames = workbook.SheetNames
    const activeSheet = sheetNames[0] ?? null
    const { headers, rows, columnLabels } = activeSheet
      ? parseSheet(workbook, activeSheet)
      : { headers: [], rows: [], columnLabels: {} }
    set({
      ...initialState,
      _workbook: workbook,
      fileName: file.name,
      sheetNames,
      activeSheet,
      headers,
      rows,
      columnLabels,
    })
    return null
  },

  switchSheet: (sheetName) => {
    const { _workbook } = get()
    if (!_workbook) return
    const { headers, rows, columnLabels } = parseSheet(_workbook, sheetName)
    set({
      activeSheet: sheetName,
      headers,
      rows,
      columnLabels,
      // reset cleaning config when switching sheets
      duplicateKeys: [],
      droppedColumns: [],
      fillRules: {},
    })
  },

  toggleDuplicateKey: (col) => {
    const { duplicateKeys } = get()
    set({
      duplicateKeys: duplicateKeys.includes(col)
        ? duplicateKeys.filter((k) => k !== col)
        : [...duplicateKeys, col],
    })
  },

  toggleDropColumn: (col) => {
    const { droppedColumns } = get()
    set({
      droppedColumns: droppedColumns.includes(col)
        ? droppedColumns.filter((c) => c !== col)
        : [...droppedColumns, col],
    })
  },

  setFillRule: (col, rule) =>
    set((state) => ({ fillRules: { ...state.fillRules, [col]: rule } })),

  removeFillRule: (col) =>
    set((state) => {
      const { [col]: _removed, ...rest } = state.fillRules
      return { fillRules: rest }
    }),

  exportFile: () => {
    const {
      fileName,
      headers,
      rows,
      duplicateKeys,
      droppedColumns,
      fillRules,
    } = get()
    if (!fileName) return

    const { headers: cleanHeaders, rows: afterDrop } = applyDropColumns(
      rows,
      headers,
      droppedColumns,
    )
    // Only use duplicate keys that still exist after dropping columns
    const effectiveDupeKeys = duplicateKeys.filter(
      (k) => !droppedColumns.includes(k),
    )
    const dupeIndices = computeDuplicateIndices(afterDrop, effectiveDupeKeys)
    const afterDedupe = afterDrop.filter((_, i) => !dupeIndices.has(i))
    const cleaned = applyFillRules(afterDedupe, fillRules)

    const baseName = fileName.replace(/\.xlsx$/i, "")
    exportXlsx(cleanHeaders, cleaned, `${baseName}-tidy.xlsx`)
  },

  reset: () => set(initialState),
}))

// ─── Selectors (called as plain functions, not subscriptions) ────────────────

type StoreSlice = Pick<SpreadsheetStore, "rows" | "headers" | "duplicateKeys">

export function selectDuplicateIndices(
  state: Pick<StoreSlice, "rows" | "duplicateKeys">,
): Set<number> {
  return computeDuplicateIndices(state.rows, state.duplicateKeys)
}

export function selectNullCount(
  state: Pick<StoreSlice, "rows" | "headers">,
): number {
  return state.rows.reduce(
    (count, row) =>
      count + state.headers.filter((h) => isNullish(row[h])).length,
    0,
  )
}

export function selectColumnsWithNulls(
  state: Pick<StoreSlice, "rows" | "headers">,
): string[] {
  return state.headers.filter((h) =>
    state.rows.some((row) => isNullish(row[h])),
  )
}

export function selectCleanRowCount(state: StoreSlice): number {
  return state.rows.length - selectDuplicateIndices(state).size
}
