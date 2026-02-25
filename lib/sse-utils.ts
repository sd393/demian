/**
 * Shared SSE (Server-Sent Events) stream parsing utilities.
 *
 * Used by client-side hooks to consume streaming responses from the backend.
 */

export interface SSECallbacks<T> {
  /** Called for each successfully parsed JSON chunk. */
  onEvent: (data: T) => void
  /** Called when the `[DONE]` sentinel is received. Optional. */
  onDone?: () => void
}

/**
 * Consume a ReadableStream of SSE-framed data, parsing each `data: ...`
 * line as JSON and dispatching to callbacks.
 *
 * Handles:
 * - Buffering across chunk boundaries (split on `\n\n`)
 * - `data:` prefix stripping
 * - `[DONE]` sentinel detection
 * - Malformed JSON (silently skipped)
 *
 * @param reader  A ReadableStreamDefaultReader from `response.body.getReader()`
 * @param callbacks  `onEvent` for each parsed object, optional `onDone`
 * @param separator  Line separator — `'\n\n'` (default) for double-newline SSE,
 *                   `'\n'` for single-newline framing (slides endpoint).
 */
export async function parseSSEStream<T>(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  callbacks: SSECallbacks<T>,
  separator: '\n\n' | '\n' = '\n\n'
): Promise<void> {
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split(separator)
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') {
        callbacks.onDone?.()
        continue
      }

      try {
        callbacks.onEvent(JSON.parse(data) as T)
      } catch {
        // Skip malformed chunks
      }
    }
  }
}

/**
 * Create a `requestAnimationFrame`-batched content accumulator.
 *
 * Streaming chat responses produce many tiny chunks per frame. Rather than
 * calling `setState` per chunk (which causes layout thrashing), this utility
 * batches content behind a single rAF and flushes once per frame.
 *
 * @param onFlush  Called once per frame with the accumulated string so far.
 * @returns `{ append, flush, cancel }` — `append` adds content,
 *          `flush` forces an immediate sync flush, `cancel` tears down the rAF.
 */
export function createRAFBatcher(onFlush: (accumulated: string) => void) {
  let accumulated = ''
  let rafId: number | null = null

  function doFlush() {
    onFlush(accumulated)
    rafId = null
  }

  return {
    /** Append content and schedule a rAF flush if one isn't pending. */
    append(content: string) {
      accumulated += content
      if (rafId === null) {
        rafId = requestAnimationFrame(doFlush)
      }
    },

    /** Force an immediate synchronous flush, cancelling any pending rAF. */
    flush() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      onFlush(accumulated)
    },

    /** Cancel any pending rAF without flushing. */
    cancel() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    },

    /** Read the current accumulated value without flushing. */
    get accumulated() {
      return accumulated
    },
  }
}
