"use client"

import { useMemo, useState } from "react"
import { useEffectiveRows } from "@/hooks/useEffectiveRows"
import { computeMedian, isNullish } from "@/lib/clean"
import { cn } from "@/lib/utils"
import {
  selectDuplicateIndices,
  useSpreadsheetStore,
} from "@/stores/use-spreadsheet-store"
import { TablePagination } from "./table-pagination"

const PAGE_SIZE = 50

function CellContent({
  val,
  fillPreview,
  isNull,
}: Readonly<{ val: unknown; fillPreview: unknown; isNull: boolean }>) {
  if (isNull && fillPreview === undefined) return "null"
  const display = fillPreview === undefined ? val : fillPreview
  return (
    <span className="line-clamp-3 whitespace-pre-line" title={String(display)}>
      {String(display)}
    </span>
  )
}

export function DataTable() {
  const headers = useSpreadsheetStore((s) => s.headers)
  const rows = useEffectiveRows()
  const columnLabels = useSpreadsheetStore((s) => s.columnLabels)
  const droppedColumns = useSpreadsheetStore((s) => s.droppedColumns)
  const duplicateKeys = useSpreadsheetStore((s) => s.duplicateKeys)
  const fillRules = useSpreadsheetStore((s) => s.fillRules)
  const [currentPage, setCurrentPage] = useState(1)

  // Pre-compute fill preview values as per-row arrays indexed by row position
  const fillPreviewValues = useMemo(() => {
    const preview: Record<string, (unknown | undefined)[]> = {}
    for (const [col, rule] of Object.entries(fillRules)) {
      if (rule.type === "forward") {
        let last: unknown
        preview[col] = rows.map((r) => {
          if (!isNullish(r[col])) {
            last = r[col]
            return undefined
          }
          return last
        })
      } else {
        let staticVal: unknown
        if (rule.type === "literal") staticVal = rule.value
        else if (rule.type === "empty") staticVal = '""'
        else if (rule.type === "median") {
          const nums = rows
            .map((r) => r[col])
            .filter((v): v is number => typeof v === "number")
          staticVal = computeMedian(nums)
        }
        preview[col] = rows.map((r) =>
          isNullish(r[col]) ? staticVal : undefined,
        )
      }
    }
    return preview
  }, [fillRules, rows])

  const dupeIndices = selectDuplicateIndices({ rows, duplicateKeys })
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const visibleRows = rows.slice(pageStart, pageStart + PAGE_SIZE)
  const visibleHeaders = headers.filter((h) => !droppedColumns.includes(h))

  function handlePageChange(page: number) {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Scrollable table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky top-0 z-10 w-10 border-b border-r border-border bg-card px-3 py-1.5 text-right font-mono text-xs font-medium uppercase tracking-widest text-zinc-700">
                #
              </th>
              {visibleHeaders.map((h) => (
                <th
                  key={h}
                  className="sticky top-0 z-10 whitespace-nowrap border-b border-r border-border bg-card px-3 py-1.5 text-left font-mono text-xs font-medium uppercase tracking-wide text-zinc-500"
                >
                  {columnLabels[h] ?? h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => {
              const absIndex = pageStart + i
              const isDupe = dupeIndices.has(absIndex)
              return (
                <tr key={absIndex} className={cn(isDupe && "bg-amber-950/10")}>
                  <td className="border-b border-r border-border px-3 py-1.5 text-right font-mono text-xs text-zinc-700 relative">
                    {isDupe && (
                      <div className="absolute left-0 top-0 h-full w-0.5 bg-amber-500/40" />
                    )}
                    {absIndex + 1}
                  </td>
                  {visibleHeaders.map((h) => {
                    const val = row[h]
                    const isNull = isNullish(val)
                    const fillPreview = isNull
                      ? fillPreviewValues[h]?.[absIndex]
                      : undefined
                    const isFilled = fillPreview !== undefined
                    return (
                      <td
                        key={h}
                        className={cn(
                          "max-w-[280px] border-b border-r border-border px-3 py-1.5 font-mono text-zinc-400",
                          isNull &&
                            !isFilled &&
                            "bg-red-950/20 italic text-red-500/50",
                          isFilled &&
                            "bg-green-950/20 italic text-green-400/70",
                        )}
                      >
                        <CellContent
                          val={val}
                          fillPreview={fillPreview}
                          isNull={isNull}
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom bar */}
      <div className="flex shrink-0 items-center justify-between border-t border-border bg-card px-4 py-2">
        <p className="text-xs text-zinc-600">
          Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, rows.length)}{" "}
          of {rows.length.toLocaleString()}
          {" · "}
          <span className="text-amber-500/60">amber rows = duplicates</span>
          {" · "}
          <span className="text-red-500/60">red cells = null</span>
          {" · "}
          <span className="text-green-500/60">
            green cells = will be filled
          </span>
        </p>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}
