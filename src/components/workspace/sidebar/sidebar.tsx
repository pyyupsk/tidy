"use client"

import { ColumnSection } from "./column-section"
import { DuplicateSection } from "./duplicate-section"
import { FillSection } from "./fill-section"

export function Sidebar() {
  return (
    <aside className="flex w-52 shrink-0 flex-col overflow-y-auto border-r border-[#1a1a1a] bg-[#080808]">
      <DuplicateSection />
      <div className="mx-3 h-px bg-[#1a1a1a]" />
      <ColumnSection />
      <div className="mx-3 h-px bg-[#1a1a1a]" />
      <FillSection />
    </aside>
  )
}
