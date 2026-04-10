"use client"

import { IconTrashX } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  selectAllNullColumns,
  useSpreadsheetStore,
} from "@/stores/use-spreadsheet-store"

export function ColumnSection() {
  const headers = useSpreadsheetStore((s) => s.headers)
  const columnLabels = useSpreadsheetStore((s) => s.columnLabels)
  const droppedColumns = useSpreadsheetStore((s) => s.droppedColumns)
  const rows = useSpreadsheetStore((s) => s.rows)
  const skipFirstRow = useSpreadsheetStore((s) => s.skipFirstRow)
  const toggleDropColumn = useSpreadsheetStore((s) => s.toggleDropColumn)
  const dropAllNullColumns = useSpreadsheetStore((s) => s.dropAllNullColumns)

  const allNullColumns = selectAllNullColumns({ rows, headers, skipFirstRow })
  const allNullSet = new Set(allNullColumns)
  const suggestCount = allNullColumns.filter(
    (h) => !droppedColumns.includes(h),
  ).length

  return (
    <div>
      <div className="flex items-center justify-between px-3 pb-2 pt-3">
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Drop Columns
        </span>
        {suggestCount > 0 && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={dropAllNullColumns}
                />
              }
            >
              <IconTrashX />
            </TooltipTrigger>
            <TooltipContent>
              Drop {suggestCount} all-null column{suggestCount > 1 ? "s" : ""}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="px-3 pb-3">
        {headers.map((h) => {
          const dropped = droppedColumns.includes(h)
          const isAllNull = allNullSet.has(h)
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
                    : "border-ring bg-transparent hover:border-muted-foreground",
                )}
              >
                {dropped && (
                  <svg
                    width="8"
                    height="6"
                    viewBox="0 0 8 6"
                    fill="none"
                    className="block"
                    aria-label="checked"
                  >
                    <title>checked</title>
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
                title={columnLabels[h] ?? h}
                className={cn(
                  "min-w-0 flex-1 truncate font-mono text-xs transition-colors",
                  dropped ? "text-zinc-500 line-through" : "text-zinc-400",
                )}
              >
                {columnLabels[h] ?? h}
              </span>
              {isAllNull && (
                <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
                  all null
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
