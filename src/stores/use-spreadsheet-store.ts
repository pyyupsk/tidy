import type * as XLSX from "xlsx"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import {
  applyDropColumns,
  applyFillRules,
  computeDuplicateIndices,
  isNullish,
  type Row,
} from "@/lib/clean"
import {
  clearStoredBuffer,
  markSessionSaveSkipped,
  writeStoredBuffer,
} from "@/lib/session-storage"
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
  skipFirstRow: boolean
  headerDetected: boolean
  // internal — workbook kept in memory for sheet switching
  _workbook: XLSX.WorkBook | null
  loadFile: (file: File) => Promise<string | null>
  restoreSession: (buffer: ArrayBuffer) => Promise<string | null>
  switchSheet: (sheetName: string) => void
  toggleDuplicateKey: (col: string) => void
  toggleDropColumn: (col: string) => void
  dropAllNullColumns: () => void
  setFillRule: (col: string, rule: FillRule) => void
  removeFillRule: (col: string) => void
  setSkipFirstRow: (value: boolean) => void
  exportFile: () => Promise<void>
  reset: () => void
}

const PERSIST_KEY = "tidy:store"

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
  skipFirstRow: false,
  headerDetected: false,
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
  | "skipFirstRow"
  | "headerDetected"
  | "_workbook"
>

// Auto-detect whether row 0 looks like a header row.
// Triggers only when every non-null value in row 0 is a non-numeric string.
function detectHeaderRow(headers: string[], rows: Row[]): boolean {
  if (rows.length === 0) return false
  const row0 = rows[0]
  let textCount = 0
  let nonNullCount = 0
  for (const h of headers) {
    const v = row0[h]
    if (v === null || v === undefined || v === "") continue
    nonNullCount++
    if (typeof v === "string" && Number.isNaN(Number(v))) textCount++
  }
  return nonNullCount > 0 && textCount === nonNullCount
}

export const useSpreadsheetStore = create<SpreadsheetStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      loadFile: async (file) => {
        const [bufErr, buffer] = await safe(file.arrayBuffer())
        if (bufErr) {
          console.error("Failed to read file:", bufErr.message)
          return bufErr.message
        }
        const [err, workbook] = await safe(readWorkbook(buffer))
        if (err) {
          console.error("Failed to parse xlsx:", err.message)
          return err.message
        }
        const sheetNames = workbook.SheetNames
        const activeSheet = sheetNames[0] ?? null
        const { headers, rows, columnLabels } = activeSheet
          ? parseSheet(workbook, activeSheet)
          : { headers: [], rows: [], columnLabels: {} }
        const headerDetected = detectHeaderRow(headers, rows)
        set({
          ...initialState,
          _workbook: workbook,
          fileName: file.name,
          sheetNames,
          activeSheet,
          headers,
          rows,
          columnLabels,
          skipFirstRow: headerDetected,
          headerDetected,
        })
        const saved = writeStoredBuffer(buffer)
        if (!saved) markSessionSaveSkipped()
        return null
      },

      restoreSession: async (buffer) => {
        const [err, workbook] = await safe(readWorkbook(buffer))
        if (err) {
          clearStoredBuffer()
          return err.message
        }
        const sheetNames = workbook.SheetNames
        const persistedSheet = get().activeSheet
        const activeSheet =
          persistedSheet && sheetNames.includes(persistedSheet)
            ? persistedSheet
            : (sheetNames[0] ?? null)
        const { headers, rows, columnLabels } = activeSheet
          ? parseSheet(workbook, activeSheet)
          : { headers: [], rows: [], columnLabels: {} }
        const headerDetected = detectHeaderRow(headers, rows)
        const { duplicateKeys, droppedColumns } = get()
        set({
          _workbook: workbook,
          sheetNames,
          activeSheet,
          headers,
          rows,
          columnLabels,
          headerDetected,
          duplicateKeys: duplicateKeys.filter((k) => headers.includes(k)),
          droppedColumns: droppedColumns.filter((c) => headers.includes(c)),
        })
        return null
      },

      switchSheet: (sheetName) => {
        const { _workbook } = get()
        if (!_workbook) return
        const { headers, rows, columnLabels } = parseSheet(_workbook, sheetName)
        const headerDetected = detectHeaderRow(headers, rows)
        set({
          activeSheet: sheetName,
          headers,
          rows,
          columnLabels,
          // reset cleaning config when switching sheets
          duplicateKeys: [],
          droppedColumns: [],
          fillRules: {},
          skipFirstRow: headerDetected,
          headerDetected,
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

      dropAllNullColumns: () => {
        const state = get()
        const allNull = selectAllNullColumns(state)
        const next = Array.from(new Set([...state.droppedColumns, ...allNull]))
        set({ droppedColumns: next })
      },

      setFillRule: (col, rule) =>
        set((state) => ({ fillRules: { ...state.fillRules, [col]: rule } })),

      removeFillRule: (col) =>
        set((state) => {
          const { [col]: _removed, ...rest } = state.fillRules
          return { fillRules: rest }
        }),

      setSkipFirstRow: (value) =>
        set({ skipFirstRow: value, headerDetected: false }),

      exportFile: async () => {
        const {
          fileName,
          headers,
          rows,
          duplicateKeys,
          droppedColumns,
          fillRules,
          skipFirstRow,
          activeSheet,
          _workbook,
        } = get()
        if (!fileName) return

        const effectiveRows = skipFirstRow ? rows.slice(1) : rows
        const { headers: cleanHeaders, rows: afterDrop } = applyDropColumns(
          effectiveRows,
          headers,
          droppedColumns,
        )
        // Only use duplicate keys that still exist after dropping columns
        const effectiveDupeKeys = duplicateKeys.filter(
          (k) => !droppedColumns.includes(k),
        )
        const dupeIndices = computeDuplicateIndices(
          afterDrop,
          effectiveDupeKeys,
        )
        const afterDedupe = afterDrop.filter((_, i) => !dupeIndices.has(i))
        const effectiveFillRules = Object.fromEntries(
          Object.entries(fillRules).filter(([col]) =>
            cleanHeaders.includes(col),
          ),
        )
        const cleaned = applyFillRules(afterDedupe, effectiveFillRules)

        const baseName = fileName.replace(/\.xlsx$/i, "")
        await exportXlsx(
          cleanHeaders,
          cleaned,
          `${baseName}-tidy.xlsx`,
          activeSheet ?? "Sheet1",
          _workbook ?? undefined,
        )
      },

      reset: () => {
        clearStoredBuffer()
        set(initialState)
      },
    }),
    {
      name: PERSIST_KEY,
      storage: createJSONStorage(() => sessionStorage),
      // Avoid SSR hydration mismatches by deferring hydration until TidyApp
      // explicitly calls rehydrate() inside a client-side useEffect.
      skipHydration: true,
      partialize: (state) => ({
        fileName: state.fileName,
        activeSheet: state.activeSheet,
        duplicateKeys: state.duplicateKeys,
        droppedColumns: state.droppedColumns,
        fillRules: state.fillRules,
        skipFirstRow: state.skipFirstRow,
      }),
    },
  ),
)

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

export function selectAllNullColumns(
  state: Pick<SpreadsheetStore, "rows" | "headers" | "skipFirstRow">,
): string[] {
  const effectiveRows = state.skipFirstRow ? state.rows.slice(1) : state.rows
  if (effectiveRows.length === 0) return []
  return state.headers.filter((h) =>
    effectiveRows.every((row) => isNullish(row[h])),
  )
}

/**
 * Returns the number of rows that will remain after deduplication.
 *
 * NOTE: `state.rows` must already be the *effective* rows (i.e. with
 * `skipFirstRow` applied). Pass `useEffectiveRows()` output at the call site,
 * not the raw store rows. See `StatsBar` for the correct usage pattern.
 */
export function selectCleanRowCount(state: StoreSlice): number {
  return state.rows.length - selectDuplicateIndices(state).size
}
