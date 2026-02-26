import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create a mock async generator for streaming
function createMockStream() {
  return (async function* () {
    yield { choices: [{ delta: { content: 'Hello' } }] }
  })()
}

const mockCreate = vi.fn().mockImplementation(() => createMockStream())

vi.mock('@/backend/openai', () => ({
  openai: vi.fn(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  })),
}))

vi.mock('@/backend/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

vi.mock('@/backend/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({ uid: 'user123', email: 'test@test.com' }),
}))

import { POST } from '@/app/api/chat/route'
import { NextRequest } from 'next/server'
import { checkRateLimit } from '@/backend/rate-limit'
import { requireAuth } from '@/backend/auth'

function createRequest(
  body: object,
  headers?: Record<string, string>
): NextRequest {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

async function readStream(response: Response): Promise<string> {
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let result = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    result += decoder.decode(value, { stream: true })
  }
  return result
}

const validBody = { messages: [{ role: 'user', content: 'Hello' }] }

describe('POST /api/chat — auth enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true })
    vi.mocked(requireAuth).mockResolvedValue({ uid: 'user123', email: 'test@test.com' })
    mockCreate.mockImplementation(() => createMockStream())
  })

  it('returns 401 for unauthenticated requests', async () => {
    vi.mocked(requireAuth).mockResolvedValue(
      new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    )

    const request = createRequest(validBody)
    const response = await POST(request)

    expect(response.status).toBe(401)

    const body = await response.json()
    expect(body.error).toContain('Authentication required')
  })

  it('allows authenticated user to send messages', async () => {
    vi.mocked(requireAuth).mockResolvedValue({ uid: 'user1', email: 'user@test.com' })

    const request = createRequest(validBody)
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/event-stream')

    const streamContent = await readStream(response)
    expect(streamContent).toContain('data: [DONE]')
  })

  it('returns 401 for invalid token and does not stream', async () => {
    vi.mocked(requireAuth).mockResolvedValue(
      new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    )

    const request = createRequest(validBody)
    const response = await POST(request)

    expect(response.status).toBe(401)

    const body = await response.json()
    expect(body.error).toContain('Invalid or expired token')
  })

  it('returns 429 when IP rate limit is exceeded', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false })

    const request = createRequest(validBody)
    const response = await POST(request)

    expect(response.status).toBe(429)
  })
})
