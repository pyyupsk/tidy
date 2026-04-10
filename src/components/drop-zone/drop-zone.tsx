"use client"

import { IconUpload } from "@tabler/icons-react"
import { useCallback, useRef, useState } from "react"
import { Logo } from "@/components/brand/logo"
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
      const err = await loadFile(file)
      setIsLoading(false)
      if (err) {
        setError(`Failed to read file: ${err}`)
      }
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
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <div className="flex w-full max-w-5xl overflow-hidden rounded-xl border border-border">
          {/* Left panel — branding + copy */}
          <div className="flex flex-1 flex-col justify-center gap-5 border-r border-border px-12 py-10">
            <Logo size="2xl" />
            <div>
              <p className="text-xl font-bold tracking-tight text-foreground">
                Clean your .xlsx in seconds.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                No upload. No server. Everything runs in your browser.
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              <li className="flex items-center gap-2">
                <span className="text-zinc-700">▸</span>
                <span className="text-xs text-zinc-500">
                  Drop empty or unwanted columns
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-zinc-700">▸</span>
                <span className="text-xs text-zinc-500">
                  Remove duplicate rows by key columns
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-zinc-700">▸</span>
                <span className="text-xs text-zinc-500">
                  Fill missing values — forward-fill, median, or fixed
                </span>
              </li>
            </ul>
          </div>

          {/* Right panel — drop zone */}
          <div className="flex flex-1 items-center justify-center bg-card p-10">
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
                "flex h-auto w-full max-w-xs flex-col items-center gap-4 rounded-lg border border-dashed p-12 focus-visible:ring-white/20",
                isDragging
                  ? "border-white/30 bg-white/5"
                  : "border-border bg-card hover:border-border/60 hover:bg-card",
              )}
            >
              <div className="rounded-full border border-border p-3">
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
          </div>
        </div>
        <p className="text-xs text-zinc-600">
          Open source and built with love —{" "}
          <a
            href="https://github.com/pyyupsk/tidy"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-zinc-400"
          >
            view on GitHub
          </a>
        </p>
      </main>
    </div>
  )
}
