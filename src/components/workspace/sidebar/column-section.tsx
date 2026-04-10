"use client"

import { useMemo } from "react"
import { IconTrashX } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
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

  const allNullColumns = useMemo(
    () => selectAllNullColumns({ rows, headers, skipFirstRow }),
    [rows, headers, skipFirstRow],
  )
  const allNullSet = useMemo(() => new Set(allNullColumns), [allNullColumns])
  const suggestCount = useMemo(
    () => allNullColumns.filter((h) => !droppedColumns.includes(h)).length,
    [allNullColumns, droppedColumns],
  )

  return (
    <div>
      <div className="flex items-center justify-between px-3 pb-2 pt-3 relative">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2"
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
            <div key={h} className="flex w-full items-center gap-2 py-1">
              <Checkbox
                checked={dropped}
                onCheckedChange={() => toggleDropColumn(h)}
                className="size-3"
              />
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
