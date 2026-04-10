"use client"

import { useState } from "react"
import { isNullish } from "@/lib/clean"
import { cn } from "@/lib/utils"
import {
  selectDuplicateIndices,
  useSpreadsheetStore,
} from "@/stores/use-spreadsheet-store"
import { TablePagination } from "./table-pagination"

const PAGE_SIZE = 50

export function DataTable() {
  const headers = useSpreadsheetStore((s) => s.headers)
  const rows = useSpreadsheetStore((s) => s.rows)
  const droppedColumns = useSpreadsheetStore((s) => s.droppedColumns)
  const duplicateKeys = useSpreadsheetStore((s) => s.duplicateKeys)
  const [currentPage, setCurrentPage] = useState(1)

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
              <th className="sticky top-0 z-10 w-10 border-b border-r border-[#1a1a1a] bg-[#080808] px-3 py-1.5 text-right font-mono text-[10px] font-medium uppercase tracking-widest text-zinc-700">
                #
              </th>
              {visibleHeaders.map((h) => (
                <th
                  key={h}
                  className="sticky top-0 z-10 whitespace-nowrap border-b border-r border-[#1a1a1a] bg-[#080808] px-3 py-1.5 text-left font-mono text-[10px] font-medium uppercase tracking-wide text-zinc-500"
                >
                  {h}
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
                  <td
                    className={cn(
                      "border-b border-r border-[#0f0f0f] px-3 py-1.5 text-right font-mono text-[10px] text-zinc-700",
                      isDupe && "border-l-2 border-l-amber-500/40",
                    )}
                  >
                    {absIndex + 1}
                  </td>
                  {visibleHeaders.map((h) => {
                    const val = row[h]
                    const isNull = isNullish(val)
                    return (
                      <td
                        key={h}
                        className={cn(
                          "max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap border-b border-r border-[#0f0f0f] px-3 py-1.5 font-mono text-zinc-400",
                          isNull && "bg-red-950/20 italic text-red-500/50",
                        )}
                        title={isNull ? undefined : String(val)}
                      >
                        {isNull ? "null" : String(val)}
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
      <div className="flex shrink-0 items-center justify-between border-t border-[#1a1a1a] bg-[#080808] px-4 py-2">
        <p className="text-[10px] text-zinc-600">
          Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, rows.length)}{" "}
          of {rows.length.toLocaleString()}
          {" · "}
          <span className="text-amber-500/60">amber rows = duplicates</span>
          {" · "}
          <span className="text-red-500/60">red cells = null</span>
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
