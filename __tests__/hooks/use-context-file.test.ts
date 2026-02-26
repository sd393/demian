import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useContextFile } from '@/hooks/use-context-file'

// Mock @vercel/blob/client upload
vi.mock('@vercel/blob/client', () => ({
  upload: vi.fn(),
}))

// Mock validateContextFile
vi.mock('@/backend/validation', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/backend/validation')>()
  return {
    ...original,
    validateContextFile: vi.fn().mockReturnValue({ valid: true }),
  }
})

import { upload } from '@vercel/blob/client'
import { validateContextFile } from '@/backend/validation'

describe('useContextFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(upload).mockResolvedValue({
      url: 'https://example.vercel-storage.com/doc.pdf',
      downloadUrl: 'https://example.vercel-storage.com/doc.pdf',
      pathname: 'doc.pdf',
      contentType: 'application/pdf',
      contentDisposition: 'inline',
      etag: '"abc123"',
    })
    vi.mocked(validateContextFile).mockReturnValue({ valid: true })

    // Mock fetch for the extract-context API
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: 'Extracted text from file.' }),
    }))
  })

  it('starts with empty state', () => {
    const { result } = renderHook(() => useContextFile('token'))
    expect(result.current.contextFile).toBeNull()
    expect(result.current.extractedText).toBeNull()
    expect(result.current.isExtracting).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('stores file metadata and extracted text on successful upload', async () => {
    const { result } = renderHook(() => useContextFile('token'))

    const file = new File(['hello'], 'notes.pdf', { type: 'application/pdf' })

    await act(async () => {
      await result.current.uploadContextFile(file)
    })

    expect(result.current.contextFile).toEqual({
      name: 'notes.pdf',
      type: 'application/pdf',
      size: 5,
    })
    expect(result.current.extractedText).toBe('Extracted text from file.')
    expect(result.current.isExtracting).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets error when validation fails without uploading', async () => {
    vi.mocked(validateContextFile).mockReturnValue({ valid: false, error: 'File is too large' })

    const { result } = renderHook(() => useContextFile('token'))

    const file = new File(['x'], 'big.exe', { type: 'application/octet-stream' })

    await act(async () => {
      await result.current.uploadContextFile(file)
    })

    expect(result.current.error).toBe('File is too large')
    expect(result.current.contextFile).toBeNull()
    expect(upload).not.toHaveBeenCalled()
  })

  it('removeContextFile clears all state', async () => {
    const { result } = renderHook(() => useContextFile('token'))

    const file = new File(['hello'], 'notes.pdf', { type: 'application/pdf' })
    await act(async () => {
      await result.current.uploadContextFile(file)
    })

    expect(result.current.contextFile).not.toBeNull()

    act(() => {
      result.current.removeContextFile()
    })

    expect(result.current.contextFile).toBeNull()
    expect(result.current.extractedText).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.isExtracting).toBe(false)
  })

  it('sets isExtracting during upload', async () => {
    // Make upload take some time so we can observe isExtracting
    let resolveUpload: (value: unknown) => void
    vi.mocked(upload).mockReturnValue(new Promise(r => { resolveUpload = r }))

    const { result } = renderHook(() => useContextFile('token'))
    const file = new File(['hello'], 'notes.pdf', { type: 'application/pdf' })

    // Start upload but don't await
    let uploadPromise: Promise<void>
    act(() => {
      uploadPromise = result.current.uploadContextFile(file)
    })

    // Should be extracting
    expect(result.current.isExtracting).toBe(true)
    expect(result.current.contextFile).not.toBeNull()

    // Resolve the upload
    await act(async () => {
      resolveUpload!({
        url: 'https://example.vercel-storage.com/doc.pdf',
        downloadUrl: 'https://example.vercel-storage.com/doc.pdf',
        pathname: 'doc.pdf',
        contentType: 'application/pdf',
        contentDisposition: 'inline',
        etag: '"abc123"',
      })
      await uploadPromise!
    })

    expect(result.current.isExtracting).toBe(false)
  })

  it('handles API error and clears context file', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Extraction failed' }),
    }))

    const { result } = renderHook(() => useContextFile('token'))
    const file = new File(['hello'], 'notes.pdf', { type: 'application/pdf' })

    await act(async () => {
      await result.current.uploadContextFile(file)
    })

    expect(result.current.error).toBe('Extraction failed')
    expect(result.current.contextFile).toBeNull()
    expect(result.current.extractedText).toBeNull()
  })
})
