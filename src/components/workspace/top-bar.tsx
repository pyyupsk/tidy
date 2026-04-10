"use client"

import { IconDownload, IconFile, IconUpload } from "@tabler/icons-react"
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
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-[#1a1a1a] bg-black px-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold tracking-tight text-white">
          tidy
        </span>
        {fileName && (
          <div className="flex items-center gap-1.5 rounded border border-[#2a2a2a] px-2 py-0.5">
            <IconFile size={11} className="text-zinc-600" />
            <span className="font-mono text-xs text-zinc-200">{fileName}</span>
            <span className="text-zinc-700">·</span>
            <span className="font-mono text-xs text-zinc-500">
              {rows.length.toLocaleString()} rows
            </span>
          </div>
        )}
        {sheetNames.length > 1 && activeSheet && (
          <select
            value={activeSheet}
            onChange={(e) => switchSheet(e.target.value)}
            className="cursor-pointer rounded border border-[#2a2a2a] bg-transparent px-1.5 py-0.5 font-mono text-xs text-zinc-400 outline-none focus:border-zinc-600"
          >
            {sheetNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="flex cursor-pointer items-center gap-1.5 rounded border border-[#2a2a2a] px-2.5 py-1 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <IconUpload size={11} />
          Upload new
        </button>
        <button
          type="button"
          onClick={exportFile}
          className="flex cursor-pointer items-center gap-1.5 rounded bg-white px-2.5 py-1 text-xs font-medium text-black transition-colors hover:bg-zinc-200"
        >
          <IconDownload size={11} />
          Export .xlsx
        </button>
      </div>
    </header>
  )
}
