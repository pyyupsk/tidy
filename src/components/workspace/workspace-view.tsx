"use client"

import { useSpreadsheetStore } from "@/stores/use-spreadsheet-store"
import { Sidebar } from "./sidebar/sidebar"
import { DataTable } from "./table/data-table"
import { StatsBar } from "./table/stats-bar"
import { TopBar } from "./top-bar"

export function WorkspaceView() {
  const headerDetected = useSpreadsheetStore((s) => s.headerDetected)
  const skipFirstRow = useSpreadsheetStore((s) => s.skipFirstRow)
  const setSkipFirstRow = useSpreadsheetStore((s) => s.setSkipFirstRow)
  const showBanner = headerDetected && skipFirstRow

  return (
    <div className="flex h-dvh min-w-[800px] flex-col bg-black">
      <TopBar />
      {showBanner && (
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-amber-950/30 px-4 py-1.5 text-xs text-amber-300">
          <span>First row looks like a header — skipping it.</span>
          <button
            type="button"
            onClick={() => setSkipFirstRow(false)}
            className="cursor-pointer font-medium underline underline-offset-2 hover:text-amber-200"
          >
            Undo
          </button>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          <StatsBar />
          <DataTable />
        </main>
      </div>
    </div>
  )
}
