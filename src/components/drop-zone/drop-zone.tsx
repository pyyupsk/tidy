"use client"

import { IconUpload } from "@tabler/icons-react"
import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSpreadsheetStore } from "@/stores/use-spreadsheet-store"

export function DropZone() {
  const loadFile = useSpreadsheetStore((s) => s.loadFile)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".xlsx")) {
        setError("Only .xlsx files are supported")
        return
      }
      setError(null)
      setIsLoading(true)
      await loadFile(file)
      setIsLoading(false)
    },
    [loadFile],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-11 items-center border-b border-border px-4">
        <span className="text-sm font-semibold tracking-tight text-white">
          tidy
        </span>
      </header>

      <main className="flex flex-1 items-center justify-center p-8">
        <Button
          variant="ghost"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          disabled={isLoading}
          className={cn(
            "flex h-auto w-full max-w-sm flex-col items-center gap-4 rounded-lg border border-dashed p-12 focus-visible:ring-white/20",
            isDragging
              ? "border-white/30 bg-white/5"
              : "border-border-subtle bg-card hover:border-border-subtle/60 hover:bg-card",
          )}
        >
          <div className="rounded-full border border-border-subtle p-3">
            <IconUpload size={20} className="text-zinc-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-300">
              {isLoading ? "Parsing file…" : "Drop your .xlsx file here"}
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              or click to browse · .xlsx only
            </p>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={handleChange}
        />
      </main>
    </div>
  )
}
