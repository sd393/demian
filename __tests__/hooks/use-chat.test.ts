import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Mock sub-hooks and dependencies before imports
vi.mock('@/lib/api-utils', () => ({
  buildAuthHeaders: vi.fn((token?: string | null) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    return headers
  }),
}))

vi.mock('@/lib/sse-utils', () => ({
  parseSSEStream: vi.fn(),
  createRAFBatcher: vi.fn(() => ({
    append: vi.fn(),
    flush: vi.fn(),
    cancel: vi.fn(),
    accumulated: '',
  })),
}))

import { useChat } from '@/hooks/use-chat'
import { parseSSEStream, createRAFBatcher } from '@/lib/sse-utils'

// Helper: build a mock fetch response with SSE body
function makeSSEResponse(chunks: string[], status = 200): Response {
  const encoder = new TextEncoder()
  const body = new ReadableStream({
    start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(c))
      controller.close()
    },
  })
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/event-stream' },
  })
}

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default parseSSEStream mock: calls onEvent with content, then resolves
    vi.mocked(parseSSEStream).mockImplementation(async (_reader, callbacks) => {
      callbacks?.onEvent?.({ content: 'Hello from Vera' })
    })

    // Default createRAFBatcher mock
    let accumulated = ''
    vi.mocked(createRAFBatcher).mockImplementation((onFlush) => ({
      append: (text: string) => { accumulated += text },
      flush: () => { onFlush(accumulated); accumulated = '' },
      cancel: () => { accumulated = '' },
      get accumulated() { return accumulated },
    }))

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeSSEResponse([
      'data: {"content":"Hello from Vera"}\n\n',
      'data: [DONE]\n\n',
    ])))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with initial assistant message', () => {
    const { result } = renderHook(() => useChat())
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].role).toBe('assistant')
    expect(result.current.messages[0].content).toContain('Vera')
  })

  it('starts with default state values', () => {
    const { result } = renderHook(() => useChat())
    expect(result.current.stage).toBe('define')
    expect(result.current.transcript).toBeNull()
    expect(result.current.researchContext).toBeNull()
    expect(result.current.isStreaming).toBe(false)
    expect(result.current.isCompressing).toBe(false)
    expect(result.current.isTranscribing).toBe(false)
    expect(result.current.isResearching).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.slideContext).toBeNull()
  })

  it('sendMessage adds user message and triggers streaming', async () => {
    const { result } = renderHook(() => useChat('test-token'))

    await act(async () => {
      await result.current.sendMessage('Hello coach')
    })

    // Should have initial message + user message + assistant (streaming) message
    expect(result.current.messages.length).toBeGreaterThanOrEqual(2)

    const userMsg = result.current.messages.find(
      (m) => m.role === 'user' && m.content === 'Hello coach'
    )
    expect(userMsg).toBeDefined()
  })

  it('sendMessage calls fetch with correct endpoint and headers', async () => {
    const fetchSpy = vi.mocked(fetch)
    const { result } = renderHook(() => useChat('my-token'))

    await act(async () => {
      await result.current.sendMessage('Test message')
    })

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, opts] = fetchSpy.mock.calls[0]
    expect(url).toBe('/api/chat')
    expect(opts?.method).toBe('POST')
    const headers = opts?.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer my-token')
  })

  it('sendMessage includes stage in request body', async () => {
    const fetchSpy = vi.mocked(fetch)
    const { result } = renderHook(() => useChat('test-token'))

    await act(async () => {
      await result.current.sendMessage('Check this out')
    })

    const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string)
    expect(body.stage).toBe('define') // default stage
  })

  it('sendMessage ignores empty/whitespace input', async () => {
    const fetchSpy = vi.mocked(fetch)
    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('   ')
    })

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(result.current.messages).toHaveLength(1)
  })

  it('sets error on non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ error: 'Server error' }),
        { status: 500 }
      )
    )

    const { result } = renderHook(() => useChat('test-token'))

    await act(async () => {
      await result.current.sendMessage('Fail please')
    })

    expect(result.current.error).toBe('Server error')
  })

  it('addMessage adds a user message', () => {
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.addMessage('Manual message')
    })

    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[1].role).toBe('user')
    expect(result.current.messages[1].content).toBe('Manual message')
  })

  it('addMessage with attachment includes attachment data', () => {
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.addMessage('Here is my file', {
        name: 'recording.mp4',
        type: 'video/mp4',
        size: 1024,
      })
    })

    const lastMsg = result.current.messages[result.current.messages.length - 1]
    expect(lastMsg.attachment).toBeDefined()
    expect(lastMsg.attachment?.name).toBe('recording.mp4')
  })

  it('startPresentation transitions to present stage', () => {
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.startPresentation({
        topic: 'AI Ethics',
        audience: 'Students',
        goal: 'Educate',
      })
    })

    expect(result.current.stage).toBe('present')
    expect(result.current.setupContext).toEqual({
      topic: 'AI Ethics',
      audience: 'Students',
      goal: 'Educate',
    })
  })

  it('finishPresentation transitions to followup stage', () => {
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.startPresentation({ topic: 'Test', audience: 'VCs', goal: 'Fund' })
    })
    expect(result.current.stage).toBe('present')

    act(() => {
      result.current.finishPresentation()
    })
    expect(result.current.stage).toBe('followup')
  })

  it('resetConversation restores initial state', async () => {
    const { result } = renderHook(() => useChat('test-token'))

    // Modify some state first
    act(() => {
      result.current.addMessage('Some message')
      result.current.startPresentation({ topic: 'T', audience: 'A', goal: 'G' })
      result.current.setSlideContext('slide data')
    })

    expect(result.current.messages.length).toBeGreaterThan(1)
    expect(result.current.stage).toBe('present')
    expect(result.current.slideContext).toBe('slide data')

    act(() => {
      result.current.resetConversation()
    })

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].role).toBe('assistant')
    expect(result.current.stage).toBe('define')
    expect(result.current.slideContext).toBeNull()
    expect(result.current.isStreaming).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('clearError resets error to null', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: 'boom' }), { status: 500 })
    )

    const { result } = renderHook(() => useChat('test-token'))

    await act(async () => {
      await result.current.sendMessage('trigger error')
    })

    expect(result.current.error).toBeTruthy()

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })

  it('appendPulseLabels accumulates audience pulse history', () => {
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.appendPulseLabels([
        { text: 'Interested', emotion: 'engaged' },
        { text: 'Confused', emotion: 'puzzled' },
      ])
    })

    expect(result.current.audiencePulseHistory).toHaveLength(2)
    expect(result.current.audiencePulseHistory[0].text).toBe('Interested')

    act(() => {
      result.current.appendPulseLabels([
        { text: 'Bored', emotion: 'disengaged' },
      ])
    })

    expect(result.current.audiencePulseHistory).toHaveLength(3)
  })

  it('setSlideContext updates slideContext', () => {
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.setSlideContext('Deck: Q4 Strategy\nRating: 75/100')
    })

    expect(result.current.slideContext).toBe('Deck: Q4 Strategy\nRating: 75/100')
  })
})
