"use client"

import type { PropsWithChildren } from "react"
import { useMemo } from "react"
import { useEffectiveRows } from "@/hooks/useEffectiveRows"
import { cn } from "@/lib/utils"
import {
  selectDuplicateIndices,
  selectNullCount,
  useSpreadsheetStore,
} from "@/stores/use-spreadsheet-store"

export function StatsBar() {
  const headers = useSpreadsheetStore((s) => s.headers)
  const rows = useEffectiveRows()
  const duplicateKeys = useSpreadsheetStore((s) => s.duplicateKeys)
  const droppedColumns = useSpreadsheetStore((s) => s.droppedColumns)

  const dupeCount = useMemo(
    () => selectDuplicateIndices({ rows, duplicateKeys }).size,
    [rows, duplicateKeys],
  )
  const nullCount = useMemo(
    () => selectNullCount({ rows, headers }),
    [rows, headers],
  )
  const cleanCount = rows.length - dupeCount
  const effectiveCols = headers.length - droppedColumns.length

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-card px-4 py-2">
      <StatItem label="Rows" value={rows.length.toLocaleString()} />
      <Sep />
      <StatItem label="Cols" value={effectiveCols.toString()} />
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
          {cleanCount.toLocaleString()} rows × {effectiveCols} cols
        </span>
      </StatItem>
    </div>
  )
}

function Sep() {
  return <div className="h-3 w-px bg-border" />
}

function StatItem({
  label,
  value,
  children,
}: Readonly<PropsWithChildren<{ label: string; value?: string }>>) {
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
        !warn && "bg-zinc-900 text-zinc-500",
      )}
    >
      {value.toLocaleString()}
    </span>
  )
}
