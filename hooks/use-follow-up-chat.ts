"use client"

import { useState, useRef, useCallback } from "react"
import { buildAuthHeaders } from "@/lib/api-utils"
import { parseSSEStream, createRAFBatcher } from "@/lib/sse-utils"

export interface FollowUpMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

interface UseFollowUpChatOptions {
  authToken: string
  transcript: string | null
  researchContext: string | null
  slideContext: string | null
  setupContext: {
    topic?: string
    audience?: string
    goal?: string
    additionalContext?: string
  } | null
}

export function useFollowUpChat(options: UseFollowUpChatOptions) {
  const [messages, setMessages] = useState<FollowUpMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const messagesRef = useRef<FollowUpMessage[]>([])
  const optionsRef = useRef(options)
  optionsRef.current = options
  messagesRef.current = messages

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return

    // Abort any in-flight request
    abortRef.current?.abort()

    const userMessage: FollowUpMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
    }

    const assistantMessageId = generateId()

    // Snapshot prior messages before updating state
    const priorMessages = messagesRef.current

    const updated = [
      ...priorMessages,
      userMessage,
      { id: assistantMessageId, role: "assistant" as const, content: "" },
    ]
    messagesRef.current = updated
    setMessages(updated)
    setIsStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    const opts = optionsRef.current

    // Build the chat messages for the API
    const apiMessages: { role: "user" | "assistant"; content: string }[] = []

    // Add prior follow-up conversation history
    for (const m of priorMessages) {
      apiMessages.push({ role: m.role, content: m.content })
    }
    apiMessages.push({ role: "user", content: trimmed })

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: buildAuthHeaders(opts.authToken),
        body: JSON.stringify({
          messages: apiMessages,
          transcript: opts.transcript ?? undefined,
          researchContext: opts.researchContext ?? undefined,
          slideContext: opts.slideContext ?? undefined,
          stage: "followup",
          setupContext: opts.setupContext ?? undefined,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const reader = response.body!.getReader()
      const batcher = createRAFBatcher((content) =>
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId ? { ...m, content } : m
          )
        )
      )

      await parseSSEStream<{ content?: string }>(reader, {
        onEvent: (parsed) => {
          if (parsed.content) {
            batcher.append(parsed.content)
          }
        },
      })

      batcher.flush()
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return
      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((m) => m.id !== assistantMessageId))
    } finally {
      setIsStreaming(false)
    }
  }, [])

  return { messages, isStreaming, sendMessage }
}
