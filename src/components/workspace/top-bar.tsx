"use client"

import { IconDownload, IconFile, IconUpload } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSpreadsheetStore } from "@/stores/use-spreadsheet-store"

export function TopBar() {
  const fileName = useSpreadsheetStore((s) => s.fileName)
  const rows = useSpreadsheetStore((s) => s.rows)
  const sheetNames = useSpreadsheetStore((s) => s.sheetNames)
  const activeSheet = useSpreadsheetStore((s) => s.activeSheet)
  const switchSheet = useSpreadsheetStore((s) => s.switchSheet)
  const exportFile = useSpreadsheetStore((s) => s.exportFile)
  const reset = useSpreadsheetStore((s) => s.reset)

  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold tracking-tight text-white">
          tidy
        </span>
        {fileName && (
          <div className="flex items-center gap-1.5 rounded border border-border-subtle px-2 py-0.5">
            <IconFile size={11} className="text-zinc-600" />
            <span className="font-mono text-xs text-zinc-200">{fileName}</span>
            <span className="text-zinc-700">·</span>
            <span className="font-mono text-xs text-zinc-500">
              {rows.length.toLocaleString()} rows
            </span>
          </div>
        )}
        {sheetNames.length > 1 && activeSheet && (
          <Select
            value={activeSheet}
            onValueChange={(v) => v && switchSheet(v)}
          >
            <SelectTrigger className="h-6 w-auto min-w-[100px] font-mono text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sheetNames.map((name) => (
                <SelectItem
                  key={name}
                  value={name}
                  className="font-mono text-xs"
                >
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="gap-1.5 text-xs"
        >
          <IconUpload size={11} />
          Upload new
        </Button>
        <Button size="sm" onClick={exportFile} className="gap-1.5 text-xs">
          <IconDownload size={11} />
          Export .xlsx
        </Button>
      </div>
    </header>
  )
}
