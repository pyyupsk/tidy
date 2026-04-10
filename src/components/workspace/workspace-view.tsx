"use client"

import { Sidebar } from "./sidebar/sidebar"
import { DataTable } from "./table/data-table"
import { StatsBar } from "./table/stats-bar"
import { TopBar } from "./top-bar"

export function WorkspaceView() {
  return (
    <div className="flex h-dvh flex-col bg-black">
      <TopBar />
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
