"use client"

import { useEffect, useRef, useState } from "react"
import { DropZone } from "@/components/drop-zone/drop-zone"
import { WorkspaceView } from "@/components/workspace/workspace-view"
import {
  hasStoredBuffer,
  markRestored,
  readStoredBuffer,
} from "@/lib/session-storage"
import { useSpreadsheetStore } from "@/stores/use-spreadsheet-store"

type RestoreStage = "pending" | "restoring" | "done"

export function TidyApp() {
  const rows = useSpreadsheetStore((s) => s.rows)
  const restoreSession = useSpreadsheetStore((s) => s.restoreSession)
  const reset = useSpreadsheetStore((s) => s.reset)
  const [stage, setStage] = useState<RestoreStage>("pending")
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    async function hydrateAndRestore() {
      await useSpreadsheetStore.persist.rehydrate()

      if (!hasStoredBuffer()) {
        setStage("done")
        return
      }

      const buffer = readStoredBuffer()
      if (!buffer) {
        reset()
        setStage("done")
        return
      }

      setStage("restoring")
      const err = await restoreSession(buffer)
      if (err) reset()
      else markRestored()
      setStage("done")
    }

    hydrateAndRestore()
  }, [reset, restoreSession])

  if (stage === "pending") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="font-mono text-xs text-zinc-500">loading…</p>
      </div>
    )
  }
  if (stage === "restoring") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="font-mono text-xs text-zinc-500">restoring session…</p>
      </div>
    )
  }
  if (rows.length === 0) return <DropZone />
  return <WorkspaceView />
}
