"use client"

import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffectiveRows } from "@/hooks/useEffectiveRows"
import { computeMedian } from "@/lib/clean"
import {
  selectColumnsWithNulls,
  useSpreadsheetStore,
} from "@/stores/use-spreadsheet-store"
import type { FillRule } from "@/types/spreadsheet"

type FillType = "none" | "string" | "number" | "median" | "empty"

function ruleToFillType(rule: FillRule | undefined): FillType {
  if (!rule) return "none"
  if (rule.type === "median") return "median"
  if (rule.type === "empty") return "empty"
  if (typeof rule.value === "number") return "number"
  return "string"
}

function ruleToInputValue(rule: FillRule | undefined): string {
  if (rule?.type !== "literal") return ""
  return String(rule.value)
}

function formatDisplay(rule: FillRule, medianDisplay: string): string {
  if (rule.type === "median") return `median (${medianDisplay})`
  if (rule.type === "empty") return '""'
  if (typeof rule.value === "number") return String(rule.value)
  return `"${rule.value}"`
}

export function FillSection() {
  const rows = useEffectiveRows()
  const headers = useSpreadsheetStore((s) => s.headers)
  const columnLabels = useSpreadsheetStore((s) => s.columnLabels)
  const fillRules = useSpreadsheetStore((s) => s.fillRules)
  const setFillRule = useSpreadsheetStore((s) => s.setFillRule)
  const removeFillRule = useSpreadsheetStore((s) => s.removeFillRule)

  const nullCols = selectColumnsWithNulls({ rows, headers })

  const medianDisplays = useMemo(() => {
    const result: Record<string, string> = {}
    for (const col of nullCols) {
      const nums = rows
        .map((r) => r[col])
        .filter((v): v is number => typeof v === "number")
      result[col] = nums.length > 0 ? String(computeMedian(nums)) : "—"
    }
    return result
  }, [rows, nullCols])

  if (nullCols.length === 0) return null

  function handleTypeChange(col: string, fillType: FillType) {
    if (fillType === "none") {
      removeFillRule(col)
      return
    }
    if (fillType === "median") {
      setFillRule(col, { type: "median" })
      return
    }
    if (fillType === "empty") {
      setFillRule(col, { type: "empty" })
      return
    }
    const currentVal = ruleToInputValue(fillRules[col])
    if (fillType === "number") {
      const num = Number.parseFloat(currentVal)
      setFillRule(col, { type: "literal", value: Number.isNaN(num) ? 0 : num })
    } else {
      setFillRule(col, { type: "literal", value: currentVal })
    }
  }

  function handleValueChange(
    col: string,
    fillType: FillType,
    rawValue: string,
  ) {
    if (fillType === "number") {
      const num = Number.parseFloat(rawValue)
      setFillRule(col, { type: "literal", value: Number.isNaN(num) ? 0 : num })
    } else {
      setFillRule(col, { type: "literal", value: rawValue })
    }
  }

  return (
    <div>
      <div className="px-3 pb-2 pt-3">
        <span className="text-xs font-medium uppercase tracking-widest text-zinc-600">
          Fill Missing
        </span>
      </div>
      <div className="px-3 pb-3">
        {nullCols.map((col) => {
          const rule = fillRules[col]
          const fillType = ruleToFillType(rule)
          const inputVal = ruleToInputValue(rule)
          const showInput = fillType === "string" || fillType === "number"

          return (
            <div
              key={col}
              className="mb-2 flex flex-col gap-1 border-b border-border pb-2 last:border-none last:pb-0"
            >
              <span className="font-mono text-xs text-zinc-500">
                {columnLabels[col] ?? col}
              </span>
              <div className="flex gap-1">
                <Select
                  value={fillType}
                  onValueChange={(v) => handleTypeChange(col, v as FillType)}
                >
                  <SelectTrigger className="h-6 flex-1 font-mono text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="font-mono text-xs">
                      —
                    </SelectItem>
                    <SelectItem value="string" className="font-mono text-xs">
                      string
                    </SelectItem>
                    <SelectItem value="number" className="font-mono text-xs">
                      number
                    </SelectItem>
                    <SelectItem value="median" className="font-mono text-xs">
                      median
                    </SelectItem>
                    <SelectItem value="empty" className="font-mono text-xs">
                      empty ""
                    </SelectItem>
                  </SelectContent>
                </Select>

                {showInput && (
                  <Input
                    type={fillType === "number" ? "number" : "text"}
                    value={inputVal}
                    onChange={(e) =>
                      handleValueChange(col, fillType, e.target.value)
                    }
                    placeholder={fillType === "number" ? "0" : "value"}
                    className="h-6 w-20 font-mono text-xs"
                  />
                )}
              </div>

              {rule && (
                <FillTag
                  displayValue={formatDisplay(rule, medianDisplays[col] ?? "—")}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FillTag({ displayValue }: Readonly<{ displayValue: string }>) {
  return (
    <span className="self-start rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
      <span className="font-normal">fill: </span>
      <span className="font-mono">{displayValue}</span>
    </span>
  )
}
