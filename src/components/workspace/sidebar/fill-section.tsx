"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
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
  if (!rule || rule.type !== "literal") return ""
  return String(rule.value)
}

export function FillSection() {
  const rows = useSpreadsheetStore((s) => s.rows)
  const headers = useSpreadsheetStore((s) => s.headers)
  const fillRules = useSpreadsheetStore((s) => s.fillRules)
  const setFillRule = useSpreadsheetStore((s) => s.setFillRule)
  const removeFillRule = useSpreadsheetStore((s) => s.removeFillRule)

  const nullCols = selectColumnsWithNulls({ rows, headers })

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
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
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
              <span className="font-mono text-[10px] text-zinc-500">{col}</span>
              <div className="flex gap-1">
                <Select
                  value={fillType}
                  onValueChange={(v) => handleTypeChange(col, v as FillType)}
                >
                  <SelectTrigger className="h-6 flex-1 font-mono text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="font-mono text-[10px]">
                      —
                    </SelectItem>
                    <SelectItem
                      value="string"
                      className="font-mono text-[10px]"
                    >
                      string
                    </SelectItem>
                    <SelectItem
                      value="number"
                      className="font-mono text-[10px]"
                    >
                      number
                    </SelectItem>
                    <SelectItem
                      value="median"
                      className="font-mono text-[10px]"
                    >
                      median
                    </SelectItem>
                    <SelectItem value="empty" className="font-mono text-[10px]">
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
                    className="h-6 w-20 font-mono text-[10px]"
                  />
                )}
              </div>

              {rule && <FillPill rule={rule} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FillPill({ rule }: Readonly<{ rule: FillRule }>) {
  if (rule.type === "median") {
    return (
      <span className="self-start rounded border border-amber-900 bg-amber-950/40 px-1.5 py-0.5 font-mono text-[9px] text-amber-400">
        median
      </span>
    )
  }
  if (rule.type === "empty") {
    return (
      <span className="self-start rounded border border-green-900 bg-green-950/40 px-1.5 py-0.5 font-mono text-[9px] text-green-400">
        {'""'}
      </span>
    )
  }
  const isNum = typeof rule.value === "number"
  return (
    <span
      className={cn(
        "self-start rounded border px-1.5 py-0.5 font-mono text-[9px]",
        isNum
          ? "border-blue-900 bg-blue-950/40 text-blue-400"
          : "border-green-900 bg-green-950/40 text-green-400",
      )}
    >
      {isNum ? rule.value : `"${rule.value}"`}
    </span>
  )
}
