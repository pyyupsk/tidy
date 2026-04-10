"use client"

import { Separator } from "@/components/ui/separator"
import { ColumnSection } from "./column-section"
import { DuplicateSection } from "./duplicate-section"
import { FillSection } from "./fill-section"

export function Sidebar() {
  return (
    <aside className="flex w-[200px] shrink-0 flex-col overflow-y-auto border-r border-[#1a1a1a] bg-[#080808]">
      <DuplicateSection />
      <Separator className="mx-3 w-auto" />
      <ColumnSection />
      <Separator className="mx-3 w-auto" />
      <FillSection />
    </aside>
  )
}
