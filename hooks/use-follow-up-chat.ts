"use client"

import { useState, useRef, useCallback } from "react"

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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${opts.authToken}`,
        },
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
      const decoder = new TextDecoder()
      let buffer = ""
      let accumulated = ""
      let rafId: number | null = null

      function flushToState() {
        const snapshot = accumulated
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId ? { ...m, content: snapshot } : m
          )
        )
        rafId = null
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const data = line.slice(6)
          if (data === "[DONE]") break

          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              accumulated += parsed.content
              if (rafId === null) {
                rafId = requestAnimationFrame(flushToState)
              }
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }

      // Final flush
      if (rafId !== null) cancelAnimationFrame(rafId)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId ? { ...m, content: accumulated } : m
        )
      )
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
