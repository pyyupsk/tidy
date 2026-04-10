import type { FillRule } from "@/types/spreadsheet"

export type Row = Record<string, unknown>

export function isNullish(value: unknown): boolean {
  return value === null || value === undefined || value === ""
}

export function computeDuplicateIndices(
  rows: Row[],
  keys: string[],
): Set<number> {
  if (keys.length === 0) return new Set()

  const seen = new Map<string, number>()
  const dupes = new Set<number>()

  for (let i = 0; i < rows.length; i++) {
    const key = JSON.stringify(keys.map((k) => rows[i][k] ?? null))
    if (seen.has(key)) {
      dupes.add(i)
    } else {
      seen.set(key, i)
    }
  }

  return dupes
}

export function applyDropColumns(
  rows: Row[],
  headers: string[],
  dropped: string[],
): { headers: string[]; rows: Row[] } {
  const keepHeaders = headers.filter((h) => !dropped.includes(h))
  const keepRows = rows.map((row) => {
    const next: Row = {}
    for (const h of keepHeaders) next[h] = row[h]
    return next
  })
  return { headers: keepHeaders, rows: keepRows }
}

export function computeMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

export function applyFillRules(
  rows: Row[],
  rules: Record<string, FillRule>,
): Row[] {
  // Pre-compute medians for all median rules
  const medians: Record<string, number> = {}
  for (const [col, rule] of Object.entries(rules)) {
    if (rule.type === "median") {
      const nums = rows
        .map((r) => r[col])
        .filter((v): v is number => typeof v === "number" && !isNullish(v))
      medians[col] = computeMedian(nums)
    }
  }

  return rows.map((row) => {
    const next = { ...row }
    for (const [col, rule] of Object.entries(rules)) {
      if (!isNullish(row[col])) continue
      if (rule.type === "literal") next[col] = rule.value
      else if (rule.type === "median") next[col] = medians[col]
      else if (rule.type === "empty") next[col] = ""
    }
    return next
  })
}
