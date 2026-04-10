"use client"

import { cn } from "@/lib/utils"
import {
  selectDuplicateIndices,
  useSpreadsheetStore,
} from "@/stores/use-spreadsheet-store"

export function DuplicateSection() {
  const headers = useSpreadsheetStore((s) => s.headers)
  const rows = useSpreadsheetStore((s) => s.rows)
  const duplicateKeys = useSpreadsheetStore((s) => s.duplicateKeys)
  const toggleDuplicateKey = useSpreadsheetStore((s) => s.toggleDuplicateKey)

  const dupeCount = selectDuplicateIndices({ rows, duplicateKeys }).size
  const hasKeys = duplicateKeys.length > 0

  return (
    <div>
      <div className="flex items-center justify-between px-3 pb-2 pt-3">
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Duplicates
        </span>
      </div>
      <div className="px-3 pb-3">
        <p className="mb-2 text-[10px] text-zinc-600">Check by columns:</p>
        <div className="flex flex-wrap gap-1">
          {headers.map((h) => {
            const active = duplicateKeys.includes(h)
            return (
              <button
                key={h}
                type="button"
                onClick={() => toggleDuplicateKey(h)}
                className={cn(
                  "flex cursor-pointer items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] transition-colors",
                  active
                    ? "border-zinc-500 bg-[#111] text-zinc-200"
                    : "border-[#2a2a2a] text-zinc-600 hover:border-zinc-600 hover:text-zinc-400"
                )}
              >
                <span
                  className={cn(
                    "inline-block size-1.5 rounded-full",
                    active ? "bg-green-400" : "bg-zinc-700"
                  )}
                />
                {h}
              </button>
            )
          })}
        </div>
        {hasKeys && (
          <div className="mt-2 rounded border border-green-900 bg-green-950/40 px-2 py-1.5 font-mono text-[10px] text-green-400">
            → {dupeCount.toLocaleString()} duplicate{dupeCount !== 1 ? "s" : ""} found
          </div>
        )}
      </div>
    </div>
  )
}
