"use client"

import { cn } from "@/lib/utils"
import { useSpreadsheetStore } from "@/stores/use-spreadsheet-store"

export function ColumnSection() {
  const headers = useSpreadsheetStore((s) => s.headers)
  const droppedColumns = useSpreadsheetStore((s) => s.droppedColumns)
  const toggleDropColumn = useSpreadsheetStore((s) => s.toggleDropColumn)

  return (
    <div>
      <div className="px-3 pb-2 pt-3">
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Drop Columns
        </span>
      </div>
      <div className="px-3 pb-3">
        {headers.map((h) => {
          const dropped = droppedColumns.includes(h)
          return (
            <button
              key={h}
              type="button"
              onClick={() => toggleDropColumn(h)}
              className="flex w-full cursor-pointer items-center gap-2 py-1 text-left"
            >
              <span
                className={cn(
                  "flex size-3 shrink-0 items-center justify-center rounded border transition-colors",
                  dropped
                    ? "border-white bg-white"
                    : "border-[#333] bg-transparent hover:border-zinc-500"
                )}
              >
                {dropped && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none" className="block">
                    <path
                      d="M1 3L3 5L7 1"
                      stroke="#000"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span
                className={cn(
                  "font-mono text-[11px] transition-colors",
                  dropped ? "text-zinc-500 line-through" : "text-zinc-400"
                )}
              >
                {h}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
