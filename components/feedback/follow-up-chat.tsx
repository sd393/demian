"use client"

import { useState, useRef, useEffect, type FormEvent } from "react"
import { Send, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import type { FollowUpMessage } from "@/hooks/use-follow-up-chat"

interface FollowUpChatProps {
  messages: FollowUpMessage[]
  isStreaming: boolean
  onSend: (text: string) => void
}

export function FollowUpChat({ messages, isStreaming, onSend }: FollowUpChatProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    setInput("")
    onSend(trimmed)
  }

  return (
    <div className="space-y-4">
      {/* Messages */}
      {messages.length > 0 && (
        <div ref={scrollRef} className="max-h-96 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            if (msg.role === "assistant" && !msg.content) return null
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {msg.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-xl bg-muted px-4 py-2.5">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-[0.9375rem] leading-[1.7] text-foreground/90 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_strong]:text-foreground [&_blockquote]:border-primary/20 [&_blockquote]:text-foreground/70">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </motion.div>
            )
          })}
          {isStreaming && messages.length > 0 && messages[messages.length - 1].role === "assistant" && messages[messages.length - 1].content === "" && (
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          )}
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSubmit}>
        <div className="relative flex h-12 items-center overflow-hidden rounded-2xl border border-border bg-muted transition-colors focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/20">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question..."
            disabled={isStreaming}
            className="h-full w-full bg-transparent px-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="absolute right-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-30"
            aria-label="Send message"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
