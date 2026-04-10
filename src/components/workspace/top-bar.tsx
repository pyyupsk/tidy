"use client"

import { IconDownload, IconFile, IconHelp, IconUpload } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { consumeRestored } from "@/lib/session-storage"
import { useSpreadsheetStore } from "@/stores/use-spreadsheet-store"

export function TopBar() {
  const fileName = useSpreadsheetStore((s) => s.fileName)
  const rows = useSpreadsheetStore((s) => s.rows)
  const sheetNames = useSpreadsheetStore((s) => s.sheetNames)
  const activeSheet = useSpreadsheetStore((s) => s.activeSheet)
  const skipFirstRow = useSpreadsheetStore((s) => s.skipFirstRow)
  const switchSheet = useSpreadsheetStore((s) => s.switchSheet)
  const setSkipFirstRow = useSpreadsheetStore((s) => s.setSkipFirstRow)
  const exportFile = useSpreadsheetStore((s) => s.exportFile)
  const reset = useSpreadsheetStore((s) => s.reset)
  const [showRestored, setShowRestored] = useState(false)

  useEffect(() => {
    if (!consumeRestored()) return
    setShowRestored(true)
    const timer = setTimeout(() => setShowRestored(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold tracking-tight text-white">
          tidy
        </span>
        {fileName && (
          <div className="flex items-center gap-1.5 rounded border border-border px-2 py-0.5">
            <IconFile size={11} className="text-zinc-600" />
            <span className="font-mono text-xs text-zinc-200">{fileName}</span>
            <span className="text-zinc-700">·</span>
            <span className="font-mono text-xs text-zinc-500">
              {rows.length.toLocaleString()} rows
            </span>
          </div>
        )}
        {fileName && (
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200">
            <input
              type="checkbox"
              checked={skipFirstRow}
              onChange={(e) => setSkipFirstRow(e.target.checked)}
              className="size-3 cursor-pointer accent-white"
            />{" "}
            Skip row 1
          </label>
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
        {showRestored && (
          <span className="rounded border border-green-900 bg-green-950/40 px-1.5 py-0.5 font-mono text-xs text-green-400">
            session restored
          </span>
        )}
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
        <Popover>
          <PopoverTrigger
            render={<Button variant="ghost" size="icon" aria-label="Help" />}
          >
            <IconHelp size={14} />
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-80">
            <div className="flex flex-col gap-3 p-0.5">
              <p className="text-xs font-semibold text-foreground">How tidy works</p>
              <ul className="flex flex-col gap-2.5">
                <li className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs font-medium text-foreground">Skip row 1</span>
                  <span className="text-xs text-muted-foreground">Treats the first row as a header. It's excluded from deduplication, fill, and export.</span>
                </li>
                <li className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs font-medium text-foreground">Drop Columns</span>
                  <span className="text-xs text-muted-foreground">Checked columns are removed from the exported file. Columns with an <span className="rounded bg-zinc-800 px-1 text-zinc-400">all null</span> badge contain no data.</span>
                </li>
                <li className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs font-medium text-foreground">Duplicates</span>
                  <span className="text-xs text-muted-foreground">Select columns as keys. Rows where all selected columns match a previous row are removed on export. More columns = stricter matching.</span>
                </li>
                <li className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs font-medium text-foreground">Fill</span>
                  <span className="text-xs text-muted-foreground">Forward-fill empty cells using the value from the row above, or set a fixed custom value per column.</span>
                </li>
                <li className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs font-medium text-foreground">Export</span>
                  <span className="text-xs text-muted-foreground">Downloads a cleaned <span className="font-mono">-tidy.xlsx</span> file with all rules applied.</span>
                </li>
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
