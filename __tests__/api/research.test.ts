import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/backend/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

vi.mock('@/backend/research/search-terms', () => ({
  generateSearchTerms: vi.fn().mockResolvedValue({
    searchTerms: ['VC investing trends', 'startup pitch tips'],
    audienceSummary: 'Venture capital investors',
  }),
}))

vi.mock('@/backend/research/web-research', () => ({
  conductResearch: vi.fn().mockResolvedValue('VCs look for scalable business models and strong teams.'),
}))

import { handleResearch } from '@/backend/handlers/research'
import { checkRateLimit } from '@/backend/rate-limit'
import { generateSearchTerms } from '@/backend/research/search-terms'
import { conductResearch } from '@/backend/research/web-research'

function createRequest(body: object): NextRequest {
  return new NextRequest('http://localhost/api/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function readSSEStream(response: Response): Promise<Record<string, unknown>[]> {
  const text = await response.text()
  const events: Record<string, unknown>[] = []
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('data: ')) {
      try {
        events.push(JSON.parse(trimmed.slice(6)))
      } catch { /* skip malformed */ }
    }
  }
  return events
}

const VALID_BODY = {
  audienceDescription: 'VC investors who have seen 100 pitches',
  topic: 'Series A pitch',
  goal: 'Secure funding',
}

describe('handleResearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true })
    vi.mocked(generateSearchTerms).mockResolvedValue({
      searchTerms: ['VC investing trends', 'startup pitch tips'],
      audienceSummary: 'Venture capital investors',
    })
    vi.mocked(conductResearch).mockResolvedValue('VCs look for scalable business models.')
  })

  it('returns 429 when rate limited', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false })
    const res = await handleResearch(createRequest(VALID_BODY))
    expect(res.status).toBe(429)
  })

  it('returns 400 for invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    })
    const res = await handleResearch(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid schema (missing audienceDescription)', async () => {
    const res = await handleResearch(createRequest({ topic: 'test' }))
    expect(res.status).toBe(400)
  })

  it('streams terms and complete events on success', async () => {
    const res = await handleResearch(createRequest(VALID_BODY))
    expect(res.headers.get('Content-Type')).toBe('text/event-stream')

    const events = await readSSEStream(res)
    expect(events).toHaveLength(2)

    // First event: terms
    expect(events[0].event).toBe('terms')
    expect(events[0].searchTerms).toEqual(['VC investing trends', 'startup pitch tips'])
    expect(events[0].audienceSummary).toBe('Venture capital investors')

    // Second event: complete
    expect(events[1].event).toBe('complete')
    expect(events[1].researchContext).toBe('VCs look for scalable business models.')
    expect(events[1].searchTerms).toEqual(['VC investing trends', 'startup pitch tips'])
  })

  it('sends error event when generateSearchTerms fails', async () => {
    vi.mocked(generateSearchTerms).mockRejectedValue(new Error('LLM unavailable'))
    const res = await handleResearch(createRequest(VALID_BODY))
    const events = await readSSEStream(res)

    const errorEvent = events.find(e => e.event === 'error')
    expect(errorEvent).toBeDefined()
    expect(errorEvent!.error).toBeTruthy()
    expect(conductResearch).not.toHaveBeenCalled()
  })

  it('sends error event when conductResearch fails', async () => {
    vi.mocked(conductResearch).mockRejectedValue(new Error('Search API down'))
    const res = await handleResearch(createRequest(VALID_BODY))
    const events = await readSSEStream(res)

    // terms event should still be sent before the error
    const termsEvent = events.find(e => e.event === 'terms')
    expect(termsEvent).toBeDefined()

    const errorEvent = events.find(e => e.event === 'error')
    expect(errorEvent).toBeDefined()
  })

  it('passes sanitized inputs to generateSearchTerms', async () => {
    await handleResearch(createRequest(VALID_BODY))
    expect(generateSearchTerms).toHaveBeenCalledOnce()
    // All inputs should be passed (sanitized)
    const args = vi.mocked(generateSearchTerms).mock.calls[0]
    expect(args[0]).toBeTruthy() // audienceDescription
    expect(args[2]).toBeTruthy() // topic
    expect(args[3]).toBeTruthy() // goal
  })

  it('works with minimal body (only audienceDescription)', async () => {
    const res = await handleResearch(createRequest({ audienceDescription: 'Students' }))
    const events = await readSSEStream(res)
    expect(events.length).toBeGreaterThanOrEqual(2)
  })
})
