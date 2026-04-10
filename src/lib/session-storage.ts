const FILE_KEY = "tidy:file"
// Base64 encoding inflates by ~33%, so cap raw input at 75% of 4 MB to stay
// safely under typical sessionStorage quota limits.
const MAX_BYTES = Math.floor(4 * 1024 * 1024 * 0.75) // ~3 MB raw → ~4 MB base64

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCodePoint(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64) // atob output is always in the 0x00–0xFF range (latin-1)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i) // NOSONAR - codePointAt would return undefined at end-of-string and can produce multi-byte code points.
  }
  return bytes.buffer
}

export function writeStoredBuffer(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength > MAX_BYTES) return false
  try {
    sessionStorage.setItem(FILE_KEY, bufferToBase64(buffer))
    return true
  } catch {
    // Quota exceeded or storage unavailable — silently skip persistence
    return false
  }
}

export function readStoredBuffer(): ArrayBuffer | null {
  try {
    const encoded = sessionStorage.getItem(FILE_KEY)
    if (!encoded) return null
    return base64ToBuffer(encoded)
  } catch {
    return null
  }
}

export function clearStoredBuffer(): void {
  try {
    sessionStorage.removeItem(FILE_KEY)
  } catch {
    // ignore
  }
}

export function hasStoredBuffer(): boolean {
  try {
    return sessionStorage.getItem(FILE_KEY) !== null
  } catch {
    return false
  }
}

// Transient in-memory flag set by TidyApp after a successful restore and
// consumed once by TopBar to show the "Session restored" badge. Not persisted.
let justRestored = false

// Transient in-memory flag set when a file is too large to persist to
// sessionStorage — consumed once by TopBar to show a warning badge.
let sessionSaveSkipped = false

export function markRestored(): void {
  justRestored = true
}

export function consumeRestored(): boolean {
  if (!justRestored) return false
  justRestored = false
  return true
}

export function markSessionSaveSkipped(): void {
  sessionSaveSkipped = true
}

export function consumeSessionSaveSkipped(): boolean {
  if (!sessionSaveSkipped) return false
  sessionSaveSkipped = false
  return true
}
