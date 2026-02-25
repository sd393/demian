import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { parseSSEStream, createRAFBatcher } from '@/lib/sse-utils'

/* ── Helpers ── */

/** Build a ReadableStream from an array of string chunks. */
function streamFrom(chunks: string[]): ReadableStreamDefaultReader<Uint8Array> {
  const encoder = new TextEncoder()
  let i = 0
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (i < chunks.length) {
        controller.enqueue(encoder.encode(chunks[i]))
        i++
      } else {
        controller.close()
      }
    },
  })
  return stream.getReader()
}

/* ── parseSSEStream ── */

describe('parseSSEStream', () => {
  it('parses a simple stream with [DONE]', async () => {
    const reader = streamFrom([
      'data: {"content":"hello"}\n\n',
      'data: {"content":" world"}\n\n',
      'data: [DONE]\n\n',
    ])

    const events: { content: string }[] = []
    let doneCalled = false

    await parseSSEStream<{ content: string }>(reader, {
      onEvent: (data) => events.push(data),
      onDone: () => { doneCalled = true },
    })

    expect(events).toEqual([
      { content: 'hello' },
      { content: ' world' },
    ])
    expect(doneCalled).toBe(true)
  })

  it('handles chunks split across boundaries', async () => {
    // The JSON message is split across two chunks
    const reader = streamFrom([
      'data: {"con',
      'tent":"split"}\n\ndata: {"content":"ok"}\n\n',
    ])

    const events: { content: string }[] = []
    await parseSSEStream<{ content: string }>(reader, {
      onEvent: (data) => events.push(data),
    })

    expect(events).toEqual([
      { content: 'split' },
      { content: 'ok' },
    ])
  })

  it('skips malformed JSON', async () => {
    const reader = streamFrom([
      'data: not-json\n\n',
      'data: {"content":"valid"}\n\n',
    ])

    const events: { content: string }[] = []
    await parseSSEStream<{ content: string }>(reader, {
      onEvent: (data) => events.push(data),
    })

    expect(events).toEqual([{ content: 'valid' }])
  })

  it('ignores lines without data: prefix', async () => {
    const reader = streamFrom([
      'event: message\n\ndata: {"content":"hello"}\n\n',
    ])

    const events: { content: string }[] = []
    await parseSSEStream<{ content: string }>(reader, {
      onEvent: (data) => events.push(data),
    })

    expect(events).toEqual([{ content: 'hello' }])
  })

  it('works without onDone callback', async () => {
    const reader = streamFrom([
      'data: {"content":"hello"}\n\ndata: [DONE]\n\n',
    ])

    const events: { content: string }[] = []
    await parseSSEStream<{ content: string }>(reader, {
      onEvent: (data) => events.push(data),
    })

    expect(events).toEqual([{ content: 'hello' }])
  })

  it('supports single-newline separator for slides endpoint', async () => {
    const reader = streamFrom([
      'data: {"type":"status","data":{"step":"downloading"}}\n',
      'data: {"type":"slide_feedback","data":{"slideNumber":1}}\n',
      'data: [DONE]\n',
    ])

    const events: { type: string; data: unknown }[] = []
    let doneCalled = false

    await parseSSEStream(reader, {
      onEvent: (data) => events.push(data),
      onDone: () => { doneCalled = true },
    }, '\n')

    expect(events).toHaveLength(2)
    expect(events[0]).toEqual({ type: 'status', data: { step: 'downloading' } })
    expect(doneCalled).toBe(true)
  })

  it('handles empty stream gracefully', async () => {
    const reader = streamFrom([])
    const events: unknown[] = []

    await parseSSEStream(reader, {
      onEvent: (data) => events.push(data),
    })

    expect(events).toEqual([])
  })

  it('handles [DONE] with surrounding whitespace', async () => {
    const reader = streamFrom([
      'data:  [DONE]  \n\n',
    ])

    let doneCalled = false
    await parseSSEStream(reader, {
      onEvent: () => {},
      onDone: () => { doneCalled = true },
    })

    expect(doneCalled).toBe(true)
  })
})

/* ── createRAFBatcher ── */

describe('createRAFBatcher', () => {
  let rafCallbacks: FrameRequestCallback[]

  beforeEach(() => {
    rafCallbacks = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      // Remove the callback at the given 1-based index
      rafCallbacks[id - 1] = (() => {}) as FrameRequestCallback
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('batches multiple appends into a single rAF flush', () => {
    const onFlush = vi.fn()
    const batcher = createRAFBatcher(onFlush)

    batcher.append('hello')
    batcher.append(' world')

    // onFlush not called yet — waiting for rAF
    expect(onFlush).not.toHaveBeenCalled()

    // Simulate rAF firing
    rafCallbacks[0](0)

    expect(onFlush).toHaveBeenCalledOnce()
    expect(onFlush).toHaveBeenCalledWith('hello world')
  })

  it('flush() forces immediate synchronous flush', () => {
    const onFlush = vi.fn()
    const batcher = createRAFBatcher(onFlush)

    batcher.append('content')
    batcher.flush()

    expect(onFlush).toHaveBeenCalledOnce()
    expect(onFlush).toHaveBeenCalledWith('content')
  })

  it('cancel() prevents pending rAF from firing', () => {
    const onFlush = vi.fn()
    const batcher = createRAFBatcher(onFlush)

    batcher.append('content')
    batcher.cancel()

    // Simulate rAF — should be a no-op since we cancelled
    rafCallbacks.forEach((cb) => cb(0))

    expect(onFlush).not.toHaveBeenCalled()
  })

  it('accumulated getter returns current content', () => {
    const onFlush = vi.fn()
    const batcher = createRAFBatcher(onFlush)

    batcher.append('hello')
    batcher.append(' world')

    expect(batcher.accumulated).toBe('hello world')
  })

  it('schedules new rAF after flush completes and more content arrives', () => {
    const onFlush = vi.fn()
    const batcher = createRAFBatcher(onFlush)

    batcher.append('first')
    rafCallbacks[0](0) // Fire first rAF

    batcher.append(' second')
    expect(rafCallbacks).toHaveLength(2) // New rAF scheduled

    rafCallbacks[1](0) // Fire second rAF
    expect(onFlush).toHaveBeenCalledTimes(2)
    expect(onFlush).toHaveBeenLastCalledWith('first second')
  })
})
