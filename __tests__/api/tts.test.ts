import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Save original env
const originalEnv = { ...process.env }

import { handleTTS } from '@/backend/handlers/tts'

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// Build a mock NDJSON ElevenLabs response
function makeNDJSON(chunks: unknown[]): string {
  return chunks.map(c => JSON.stringify(c)).join('\n')
}

const MOCK_ALIGNMENT = {
  characters: ['H', 'i', '.', ' ', 'B', 'y', 'e', '!'],
  character_start_times_seconds: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
  character_end_times_seconds: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
}

describe('handleTTS', () => {
  beforeEach(() => {
    process.env.ELEVENLABS_API_KEY = 'test-api-key'
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  it('returns 500 when API key is missing', async () => {
    delete process.env.ELEVENLABS_API_KEY
    const res = await handleTTS(createRequest({ text: 'Hello' }))
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toMatch(/ELEVENLABS_API_KEY/)
  })

  it('returns 400 for invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    })
    const res = await handleTTS(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when text is missing', async () => {
    const res = await handleTTS(createRequest({}))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/text/)
  })

  it('returns 400 when text is empty string', async () => {
    const res = await handleTTS(createRequest({ text: '   ' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when text is all markdown (empty after cleaning)', async () => {
    const res = await handleTTS(createRequest({ text: '---\n---' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toMatch(/empty after cleaning/)
  })

  it('returns audio and sentences on success', async () => {
    const ndjson = makeNDJSON([
      { audio_base64: 'AAAA', alignment: MOCK_ALIGNMENT },
    ])

    vi.mocked(fetch).mockResolvedValue(
      new Response(ndjson, { status: 200 })
    )

    const res = await handleTTS(createRequest({ text: 'Hi. Bye!' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.audio).toBe('AAAA')
    expect(data.sentences).toHaveLength(2)
    expect(data.sentences[0].text).toBe('Hi.')
    expect(data.sentences[1].text).toBe('Bye!')
  })

  it('concatenates audio from multiple NDJSON chunks', async () => {
    const ndjson = makeNDJSON([
      { audio_base64: 'AAAA' },
      { audio_base64: 'BBBB' },
    ])

    vi.mocked(fetch).mockResolvedValue(
      new Response(ndjson, { status: 200 })
    )

    const res = await handleTTS(createRequest({ text: 'Hello' }))
    const data = await res.json()
    expect(data.audio).toBe('AAAABBBB')
  })

  it('returns 500 when ElevenLabs returns no audio', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(makeNDJSON([{ alignment: MOCK_ALIGNMENT }]), { status: 200 })
    )

    const res = await handleTTS(createRequest({ text: 'Hello' }))
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toMatch(/no audio/i)
  })

  it('forwards ElevenLabs error status', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('Rate limited', { status: 429 })
    )

    const res = await handleTTS(createRequest({ text: 'Hello' }))
    expect(res.status).toBe(429)
  })

  it('strips markdown before sending to ElevenLabs', async () => {
    const ndjson = makeNDJSON([{ audio_base64: 'AAAA' }])
    vi.mocked(fetch).mockResolvedValue(new Response(ndjson, { status: 200 }))

    await handleTTS(createRequest({ text: '## Hello **world**!' }))

    const fetchCall = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse(fetchCall[1]!.body as string)
    expect(body.text).not.toContain('##')
    expect(body.text).not.toContain('**')
    expect(body.text).toContain('Hello world!')
  })

  it('handles trailing text without punctuation', async () => {
    const alignment = {
      characters: ['H', 'e', 'l', 'l', 'o'],
      character_start_times_seconds: [0, 0.1, 0.2, 0.3, 0.4],
      character_end_times_seconds: [0.1, 0.2, 0.3, 0.4, 0.5],
    }
    const ndjson = makeNDJSON([{ audio_base64: 'AAAA', alignment }])
    vi.mocked(fetch).mockResolvedValue(new Response(ndjson, { status: 200 }))

    const res = await handleTTS(createRequest({ text: 'Hello' }))
    const data = await res.json()
    expect(data.sentences).toHaveLength(1)
    expect(data.sentences[0].text).toBe('Hello')
    expect(data.sentences[0].start).toBe(0)
    expect(data.sentences[0].end).toBe(0.5)
  })

  it('skips malformed NDJSON lines gracefully', async () => {
    const ndjson = '{"audio_base64":"AAAA"}\nnot-json\n{"audio_base64":"BBBB"}'
    vi.mocked(fetch).mockResolvedValue(new Response(ndjson, { status: 200 }))

    const res = await handleTTS(createRequest({ text: 'Hello' }))
    const data = await res.json()
    expect(data.audio).toBe('AAAABBBB')
  })

  it('sends correct model params to ElevenLabs', async () => {
    const ndjson = makeNDJSON([{ audio_base64: 'AAAA' }])
    vi.mocked(fetch).mockResolvedValue(new Response(ndjson, { status: 200 }))

    await handleTTS(createRequest({ text: 'Test' }))

    const [url, opts] = vi.mocked(fetch).mock.calls[0]
    expect(url).toContain('with-timestamps')
    const body = JSON.parse(opts!.body as string)
    expect(body.model_id).toBe('eleven_turbo_v2_5')
    expect(body.voice_settings.stability).toBe(0.5)
    expect(body.voice_settings.similarity_boost).toBe(0.75)
  })
})
