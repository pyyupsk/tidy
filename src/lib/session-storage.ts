const FILE_KEY = "tidy:file"
const MAX_BYTES = 4 * 1024 * 1024 // 4 MB budget for raw file

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

export function writeStoredBuffer(buffer: ArrayBuffer): void {
  if (buffer.byteLength > MAX_BYTES) return
  try {
    sessionStorage.setItem(FILE_KEY, bufferToBase64(buffer))
  } catch {
    // Quota exceeded or storage unavailable — silently skip persistence
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

export function markRestored(): void {
  justRestored = true
}

export function consumeRestored(): boolean {
  if (!justRestored) return false
  justRestored = false
  return true
}
