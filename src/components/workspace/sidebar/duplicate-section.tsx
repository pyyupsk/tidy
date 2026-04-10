"use client"

import { Button } from "@/components/ui/button"
import { useEffectiveRows } from "@/hooks/useEffectiveRows"
import { cn } from "@/lib/utils"
import {
  selectDuplicateIndices,
  useSpreadsheetStore,
} from "@/stores/use-spreadsheet-store"

export function DuplicateSection() {
  const headers = useSpreadsheetStore((s) => s.headers)
  const rows = useEffectiveRows()
  const columnLabels = useSpreadsheetStore((s) => s.columnLabels)
  const duplicateKeys = useSpreadsheetStore((s) => s.duplicateKeys)
  const toggleDuplicateKey = useSpreadsheetStore((s) => s.toggleDuplicateKey)

  const dupeCount = selectDuplicateIndices({ rows, duplicateKeys }).size
  const hasKeys = duplicateKeys.length > 0

  return (
    <div>
      <div className="flex items-center justify-between px-3 pb-2 pt-3">
        <span className="text-xs font-medium uppercase tracking-widest text-zinc-600">
          Duplicates
        </span>
      </div>
      <div className="px-3 pb-3">
        <p className="mb-2 text-xs text-zinc-600">Check by columns:</p>
        <div className="flex flex-wrap gap-1">
          {headers.map((h) => {
            const active = duplicateKeys.includes(h)
            return (
              <Button
                key={h}
                title={columnLabels[h] ?? h}
                variant={active ? "secondary" : "outline"}
                size="sm"
                onClick={() => toggleDuplicateKey(h)}
                className="h-5 w-full justify-start gap-1 px-1.5 font-mono text-xs"
              >
                <span
                  className={cn(
                    "inline-block size-1.5 shrink-0 rounded-full",
                    active ? "bg-green-400" : "bg-zinc-700",
                  )}
                />
                <span className="truncate">{columnLabels[h] ?? h}</span>
              </Button>
            )
          })}
        </div>
        {hasKeys && (
          <div className="mt-2 rounded border border-green-900 bg-green-950/40 px-2 py-1.5 font-mono text-xs text-green-400">
            → {dupeCount.toLocaleString()} duplicate{dupeCount === 1 ? "" : "s"}{" "}
            found
          </div>
        )}
      </div>
    </div>
  )
}
