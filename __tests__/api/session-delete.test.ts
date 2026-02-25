import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/backend/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({ uid: 'user123', email: 'test@test.com' }),
}))

const mockGet = vi.fn()
const mockDelete = vi.fn()
vi.mock('@/backend/firebase-admin', () => ({
  db: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: mockGet,
        delete: mockDelete,
      })),
    })),
  })),
}))

import { handleSessionDelete } from '@/backend/handlers/session-delete'
import { requireAuth } from '@/backend/auth'

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/sessions/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('handleSessionDelete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAuth).mockResolvedValue({ uid: 'user123', email: 'test@test.com' })
    mockDelete.mockResolvedValue(undefined)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockResolvedValue(
      new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401 })
    )
    const res = await handleSessionDelete(createRequest({ sessionId: 'abc' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when sessionId is missing', async () => {
    const res = await handleSessionDelete(createRequest({}))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/sessionId/)
  })

  it('returns 400 when sessionId is not a string', async () => {
    const res = await handleSessionDelete(createRequest({ sessionId: 42 }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when sessionId is empty string', async () => {
    const res = await handleSessionDelete(createRequest({ sessionId: '' }))
    expect(res.status).toBe(400)
  })

  it('returns success when session does not exist (idempotent)', async () => {
    mockGet.mockResolvedValue({ exists: false })
    const res = await handleSessionDelete(createRequest({ sessionId: 'nonexistent' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.deleted).toBe(true)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('returns 403 when user does not own the session', async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ userId: 'other-user' }),
    })
    const res = await handleSessionDelete(createRequest({ sessionId: 'abc' }))
    expect(res.status).toBe(403)
    const data = await res.json()
    expect(data.error).toMatch(/authorized/)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('deletes session when user is the owner', async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ userId: 'user123' }),
    })
    const res = await handleSessionDelete(createRequest({ sessionId: 'abc' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.deleted).toBe(true)
    expect(mockDelete).toHaveBeenCalledOnce()
  })

  it('returns 400 on malformed JSON', async () => {
    const req = new NextRequest('http://localhost/api/sessions/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    })
    const res = await handleSessionDelete(req)
    expect(res.status).toBe(400)
  })

  it('returns 500 on unexpected error', async () => {
    mockGet.mockRejectedValue(new Error('Firestore down'))
    const res = await handleSessionDelete(createRequest({ sessionId: 'abc' }))
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toMatch(/internal/i)
  })
})
