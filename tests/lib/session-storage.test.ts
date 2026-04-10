import { beforeEach, describe, expect, it } from "vitest"
import {
  clearStoredBuffer,
  consumeRestored,
  consumeSessionSaveSkipped,
  hasStoredBuffer,
  markRestored,
  markSessionSaveSkipped,
  readStoredBuffer,
  writeStoredBuffer,
} from "@/lib/session-storage"

// Minimal sessionStorage mock for node environment
const store: Record<string, string> = {}
const sessionStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = value
  },
  removeItem: (key: string) => {
    delete store[key]
  },
}

beforeEach(() => {
  for (const key of Object.keys(store)) delete store[key]
  Object.defineProperty(globalThis, "sessionStorage", {
    value: sessionStorageMock,
    writable: true,
    configurable: true,
  })
})

describe("writeStoredBuffer / readStoredBuffer", () => {
  it("round-trips an ArrayBuffer through sessionStorage", () => {
    const original = new Uint8Array([1, 2, 3, 255]).buffer
    writeStoredBuffer(original)
    const result = readStoredBuffer()
    if (result === null) {
      throw new Error("Expected buffer to be stored")
    }
    expect(new Uint8Array(result)).toEqual(new Uint8Array([1, 2, 3, 255]))
  })

  it("returns null when nothing has been written", () => {
    expect(readStoredBuffer()).toBeNull()
  })

  it("returns true on a successful write", () => {
    const buf = new Uint8Array([1, 2, 3]).buffer
    expect(writeStoredBuffer(buf)).toBe(true)
  })

  it("returns false and does not store when buffer exceeds the raw limit (~3 MB)", () => {
    const big = new ArrayBuffer(Math.floor(4 * 1024 * 1024 * 0.75) + 1)
    expect(writeStoredBuffer(big)).toBe(false)
    expect(readStoredBuffer()).toBeNull()
  })

  it("accepts a buffer exactly at the raw limit", () => {
    const atLimit = new ArrayBuffer(Math.floor(4 * 1024 * 1024 * 0.75))
    expect(writeStoredBuffer(atLimit)).toBe(true)
  })

  it("chunked base64 round-trip near 0x8000 bytes", () => {
    // Verifies the chunked btoa path handles buffers that straddle chunk boundaries
    const size = 0x8000 + 7
    const bytes = new Uint8Array(size)
    for (let i = 0; i < size; i++) bytes[i] = i % 256
    writeStoredBuffer(bytes.buffer)
    const result = readStoredBuffer()
    if (!result) throw new Error("Expected buffer to be stored")
    expect(new Uint8Array(result)).toEqual(bytes)
  })
})

describe("clearStoredBuffer", () => {
  it("removes the stored buffer so readStoredBuffer returns null", () => {
    writeStoredBuffer(new Uint8Array([42]).buffer)
    clearStoredBuffer()
    expect(readStoredBuffer()).toBeNull()
  })
})

describe("hasStoredBuffer", () => {
  it("returns false when nothing is stored", () => {
    expect(hasStoredBuffer()).toBe(false)
  })

  it("returns true after writing a buffer", () => {
    writeStoredBuffer(new Uint8Array([1]).buffer)
    expect(hasStoredBuffer()).toBe(true)
  })

  it("returns false after clearing", () => {
    writeStoredBuffer(new Uint8Array([1]).buffer)
    clearStoredBuffer()
    expect(hasStoredBuffer()).toBe(false)
  })
})

describe("markSessionSaveSkipped / consumeSessionSaveSkipped", () => {
  it("consumeSessionSaveSkipped returns false before markSessionSaveSkipped is called", () => {
    expect(consumeSessionSaveSkipped()).toBe(false)
  })

  it("consumeSessionSaveSkipped returns true exactly once after markSessionSaveSkipped", () => {
    markSessionSaveSkipped()
    expect(consumeSessionSaveSkipped()).toBe(true)
    expect(consumeSessionSaveSkipped()).toBe(false)
  })
})

describe("markRestored / consumeRestored", () => {
  it("consumeRestored returns false before markRestored is called", () => {
    expect(consumeRestored()).toBe(false)
  })

  it("consumeRestored returns true exactly once after markRestored", () => {
    markRestored()
    expect(consumeRestored()).toBe(true)
    expect(consumeRestored()).toBe(false)
  })

  it("is a one-shot flag — second call always returns false", () => {
    markRestored()
    consumeRestored()
    markRestored()
    expect(consumeRestored()).toBe(true)
    expect(consumeRestored()).toBe(false)
  })
})
