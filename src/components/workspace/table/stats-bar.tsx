"use client"

import { cn } from "@/lib/utils"
import {
  selectCleanRowCount,
  selectDuplicateIndices,
  selectNullCount,
  useSpreadsheetStore,
} from "@/stores/use-spreadsheet-store"

export function StatsBar() {
  const headers = useSpreadsheetStore((s) => s.headers)
  const rows = useSpreadsheetStore((s) => s.rows)
  const duplicateKeys = useSpreadsheetStore((s) => s.duplicateKeys)

  const dupeCount = selectDuplicateIndices({ rows, duplicateKeys }).size
  const nullCount = selectNullCount({ rows, headers })
  const cleanCount = selectCleanRowCount({ rows, headers, duplicateKeys })

  return (
    <div className="flex shrink-0 items-center gap-4 border-b border-[#1a1a1a] bg-[#080808] px-4 py-2">
      <StatItem label="Rows" value={rows.length.toLocaleString()} />
      <Sep />
      <StatItem label="Cols" value={headers.length.toString()} />
      <Sep />
      <StatItem label="Nulls">
        <Badge value={nullCount} warn={nullCount > 0} color="red" />
      </StatItem>
      <Sep />
      <StatItem label="Dupes">
        <Badge value={dupeCount} warn={dupeCount > 0} color="amber" />
      </StatItem>
      <Sep />
      <StatItem label="After clean">
        <span className="rounded bg-green-950 px-1.5 py-0.5 font-mono text-xs text-green-400">
          {cleanCount.toLocaleString()} rows
        </span>
      </StatItem>
    </div>
  )
}

function Sep() {
  return <div className="h-3 w-px bg-[#222]" />
}

function StatItem({
  label,
  value,
  children,
}: Readonly<{ label: string; value?: string; children?: React.ReactNode }>) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
      <span>{label}</span>
      {value && <span className="font-mono text-zinc-200">{value}</span>}
      {children}
    </div>
  )
}

function Badge({
  value,
  warn,
  color,
}: Readonly<{ value: number; warn: boolean; color: "red" | "amber" }>) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 font-mono text-xs",
        warn && color === "red" && "bg-red-950 text-red-400",
        warn && color === "amber" && "bg-amber-950 text-amber-400",
        !warn && "bg-zinc-900 text-zinc-500"
      )}
    >
      {value.toLocaleString()}
    </span>
  )
}
