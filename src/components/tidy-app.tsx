"use client"

import { DropZone } from "@/components/drop-zone/drop-zone"
import { WorkspaceView } from "@/components/workspace/workspace-view"
import { useSpreadsheetStore } from "@/stores/use-spreadsheet-store"

export function TidyApp() {
  const hasFile = useSpreadsheetStore((s) => s.fileName !== null)
  if (!hasFile) return <DropZone />
  return <WorkspaceView />
}
