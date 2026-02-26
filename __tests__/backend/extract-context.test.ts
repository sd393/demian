import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock rate-limit
vi.mock('@/backend/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

// Mock audio utilities
vi.mock('@/backend/audio', () => ({
  downloadToTmp: vi.fn().mockResolvedValue('/tmp/vera-test.pdf'),
  processFileForWhisper: vi.fn().mockResolvedValue({
    chunkPaths: ['/tmp/vera-chunk0.mp3'],
    allTempPaths: ['/tmp/vera-test.mp3', '/tmp/vera-chunk0.mp3'],
  }),
  cleanupTempFiles: vi.fn().mockResolvedValue(undefined),
}))

// Mock unpdf
vi.mock('unpdf', () => ({
  extractText: vi.fn().mockResolvedValue({
    totalPages: 2,
    text: ['Page one content.', 'Page two content.'],
  }),
}))

// Mock mammoth
vi.mock('mammoth', () => ({
  default: {
    extractRawText: vi.fn().mockResolvedValue({ value: 'Docx extracted text.' }),
  },
}))

// Mock fs/promises
vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn().mockResolvedValue('Plain text file content.'),
    unlink: vi.fn().mockResolvedValue(undefined),
  },
}))

// Mock fs (createReadStream for audio transcription)
vi.mock('fs', () => ({
  default: {
    createReadStream: vi.fn().mockReturnValue('mock-stream'),
  },
  createReadStream: vi.fn().mockReturnValue('mock-stream'),
}))

// Mock openai
vi.mock('@/backend/openai', () => ({
  openai: vi.fn().mockReturnValue({
    audio: {
      transcriptions: {
        create: vi.fn().mockResolvedValue({ text: 'Transcribed audio content.' }),
      },
    },
  }),
}))

// Mock @vercel/blob
vi.mock('@vercel/blob', () => ({
  del: vi.fn().mockResolvedValue(undefined),
}))

import { checkRateLimit } from '@/backend/rate-limit'
import { downloadToTmp, cleanupTempFiles, processFileForWhisper } from '@/backend/audio'
import { extractText } from 'unpdf'
import mammoth from 'mammoth'
import fs from 'fs/promises'
import { del } from '@vercel/blob'
import { handleExtractContext } from '@/backend/handlers/extract-context'

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/extract-context', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('handleExtractContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, remaining: 4 })
  })

  it('returns 429 when rate limited', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, remaining: 0 })
    const res = await handleExtractContext(makeRequest({ blobUrl: 'https://example.com/f.pdf', fileName: 'f.pdf' }))
    expect(res.status).toBe(429)
  })

  it('returns 400 for invalid request body', async () => {
    const res = await handleExtractContext(makeRequest({ bad: 'data' }))
    expect(res.status).toBe(400)
  })

  it('extracts text from PDF', async () => {
    const res = await handleExtractContext(makeRequest({ blobUrl: 'https://example.com/doc.pdf', fileName: 'doc.pdf' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.text).toContain('Page one content.')
    expect(data.text).toContain('Page two content.')
    expect(extractText).toHaveBeenCalled()
  })

  it('reads .txt file content', async () => {
    const res = await handleExtractContext(makeRequest({ blobUrl: 'https://example.com/notes.txt', fileName: 'notes.txt' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.text).toBe('Plain text file content.')
    expect(fs.readFile).toHaveBeenCalledWith('/tmp/vera-test.pdf', 'utf-8')
  })

  it('extracts text from .docx', async () => {
    const res = await handleExtractContext(makeRequest({ blobUrl: 'https://example.com/brief.docx', fileName: 'brief.docx' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.text).toBe('Docx extracted text.')
    expect(mammoth.extractRawText).toHaveBeenCalled()
  })

  it('transcribes audio file', async () => {
    const res = await handleExtractContext(makeRequest({ blobUrl: 'https://example.com/rec.mp3', fileName: 'rec.mp3' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.text).toBe('Transcribed audio content.')
    expect(processFileForWhisper).toHaveBeenCalled()
  })

  it('truncates output exceeding 50,000 characters', async () => {
    const longText = 'x'.repeat(60_000)
    vi.mocked(fs.readFile).mockResolvedValueOnce(longText)
    const res = await handleExtractContext(makeRequest({ blobUrl: 'https://example.com/big.txt', fileName: 'big.txt' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.text.length).toBe(50_000)
  })

  it('cleans up temp files on success', async () => {
    await handleExtractContext(makeRequest({ blobUrl: 'https://example.com/doc.pdf', fileName: 'doc.pdf' }))
    expect(cleanupTempFiles).toHaveBeenCalledWith(['/tmp/vera-test.pdf'])
  })

  it('cleans up temp files on error', async () => {
    vi.mocked(extractText).mockRejectedValueOnce(new Error('corrupt pdf'))
    await handleExtractContext(makeRequest({ blobUrl: 'https://example.com/bad.pdf', fileName: 'bad.pdf' }))
    expect(cleanupTempFiles).toHaveBeenCalledWith(['/tmp/vera-test.pdf'])
  })

  it('deletes blob after processing', async () => {
    await handleExtractContext(makeRequest({ blobUrl: 'https://example.com/doc.pdf', fileName: 'doc.pdf' }))
    expect(del).toHaveBeenCalledWith('https://example.com/doc.pdf')
  })

  it('returns friendly error for empty PDF', async () => {
    vi.mocked(extractText).mockResolvedValueOnce({ totalPages: 1, text: ['   '] })
    const res = await handleExtractContext(makeRequest({ blobUrl: 'https://example.com/empty.pdf', fileName: 'empty.pdf' }))
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toContain("doesn't contain extractable text")
  })
})
