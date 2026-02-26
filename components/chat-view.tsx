"use client"

import React, { useState, useRef, useEffect, type FormEvent } from "react"
import ReactMarkdown from "react-markdown"
import dynamic from "next/dynamic"
import { AnimatePresence, motion } from "framer-motion"
import {
  Send,
  Paperclip,
  FileVideo,
  FileAudio,
  FileText,
  Loader2,
  Mic,
  Square,
  X,
  ArrowRight,
  Smile,
} from "lucide-react"

const AudioWaveform = dynamic(() => import("@/components/audio-waveform").then(m => ({ default: m.AudioWaveform })), { ssr: false })
const ResearchCard = dynamic(() => import("@/components/research-card").then(m => ({ default: m.ResearchCard })))
import { StageIndicator } from "@/components/stages/stage-indicator"
import { formatFileSize, formatElapsed } from "@/lib/format-utils"
import type { Message } from "@/hooks/use-chat-messages"
import type { ResearchMeta } from "@/hooks/use-research-pipeline"
import type { CoachingStage } from "@/lib/coaching-stages"

interface ChatViewProps {
  messages: Message[]
  stage: CoachingStage
  chatMode: boolean
  feedbackMessageId: string | null
  researchCardAnchorId: string | null
  researchMeta: ResearchMeta | null
  isResearching: boolean
  isCompressing: boolean
  isTranscribing: boolean
  isStreaming: boolean
  isBusy: boolean
  isInputDisabled: boolean
  showFollowUps: boolean
  followUps: readonly { label: string; message: string }[]
  recorder: {
    isRecording: boolean
    analyserNode: AnalyserNode | null
    elapsed: number
    cancelRecording: () => void
  }
  slideReview: {
    reviews: Record<string, { slideFeedbacks: unknown[]; deckSummary: unknown }>
    activeReviewKey: string | null
    isAnalyzing: boolean
    displayedKey: string | null
    panelOpen: boolean
    openReview: (key: string) => void
    openPanel: () => void
  }
  onSend: (text: string) => void
  onStartRecording: () => void
  onStopRecording: () => void
  onFileClick: () => void
  onPdfClick: () => void
  onPresentationModeEnter: () => void
}

export const ChatView = React.memo(function ChatView({
  messages,
  stage,
  chatMode,
  feedbackMessageId,
  researchCardAnchorId,
  researchMeta,
  isResearching,
  isCompressing,
  isTranscribing,
  isStreaming,
  isBusy,
  isInputDisabled,
  showFollowUps,
  followUps,
  recorder,
  slideReview,
  onSend,
  onStartRecording,
  onStopRecording,
  onFileClick,
  onPdfClick,
  onPresentationModeEnter,
}: ChatViewProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  /* ── Auto-scroll ── */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isTranscribing, isStreaming])

  /* ── Handlers ── */
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isInputDisabled) return
    setInput("")
    onSend(trimmed)
  }

  /* ── User message bubble ── */
  function UserBubble({ msg }: { msg: Message }) {
    const isPdfAttachment = !!msg.attachment && (msg.attachment.type === "application/pdf" || msg.attachment.name.toLowerCase().endsWith(".pdf"))
    const hasReview = isPdfAttachment && !!slideReview.reviews[msg.id]
    const isActiveAnalysis = isPdfAttachment && slideReview.activeReviewKey === msg.id && slideReview.isAnalyzing
    const isCurrentlyShown = slideReview.displayedKey === msg.id && slideReview.panelOpen

    return (
      <div className="flex justify-end">
        <div className="max-w-[80%]">
          {msg.attachment && (
            <div className="mb-2 flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
              {msg.attachment.type.startsWith("video") ? <FileVideo className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                : isPdfAttachment ? <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                : <FileAudio className="h-4 w-4 flex-shrink-0 text-muted-foreground" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{msg.attachment.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(msg.attachment.size)}</p>
              </div>
              {(hasReview || isActiveAnalysis) && !isCurrentlyShown && (
                <button type="button"
                  onClick={() => slideReview.reviews[msg.id] ? slideReview.openReview(msg.id) : slideReview.openPanel()}
                  className="ml-1 flex-shrink-0 rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20">
                  {isActiveAnalysis ? "View progress" : "View review"}
                </button>
              )}
            </div>
          )}
          {msg.content && !msg.content.startsWith("[Presentation transcript]") && (
            <div className="rounded-xl bg-muted px-4 py-2.5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{msg.content}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ── Recording overlay ── */
  const recordingContent = (
    <div className="flex w-full items-center gap-2 px-3">
      <div className="relative flex-shrink-0">
        <div className="h-2 w-2 rounded-full bg-red-500" />
        <div className="absolute inset-0 animate-ping rounded-full bg-red-500/60" />
      </div>
      <div className="flex-1 min-w-0">
        <AudioWaveform analyser={recorder.analyserNode} />
      </div>
      <span className="flex-shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
        {formatElapsed(recorder.elapsed)}
      </span>
      <button type="button" onClick={recorder.cancelRecording}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Cancel recording">
        <X className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={onStopRecording}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-red-500 text-white transition-colors hover:bg-red-600"
        aria-label="Stop recording and send">
        <Square className="h-3 w-3 fill-current" />
      </button>
    </div>
  )

  /* ── Render ── */
  return (
    <motion.div
      key="active-chat"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-1 flex-col overflow-hidden"
    >
      {/* Scrollable feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          {/* Stage indicator */}
          <StageIndicator stage={stage} />

          {messages.map((msg) => {
            if (msg.role === "assistant" && !msg.content) return null
            const isFeedbackMessage = msg.id === feedbackMessageId
            const showResearchAfter = researchMeta && !isResearching && msg.id === researchCardAnchorId
            return (
              <React.Fragment key={msg.id}>
                <div>
                  {msg.role === "assistant" ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                      <div className={isFeedbackMessage ? "rounded-xl border border-primary/10 bg-primary/[0.02] p-5" : ""}>
                        <div className="prose prose-sm max-w-none text-[0.9375rem] leading-[1.7] text-foreground/90 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-foreground/70 [&_strong]:text-foreground [&_blockquote]:border-primary/20 [&_blockquote]:text-foreground/70 [&_li]:marker:text-primary/40">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <UserBubble msg={msg} />
                  )}
                </div>
                {showResearchAfter && <ResearchCard meta={researchMeta} />}
              </React.Fragment>
            )
          })}

          {isCompressing && (
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Compressing audio</span>
            </div>
          )}
          {isTranscribing && !isCompressing && (
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Transcribing your recording</span>
            </div>
          )}
          {isResearching && (
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Researching your audience</span>
            </div>
          )}
          {isStreaming && !chatMode && messages.length > 0 && messages[messages.length - 1].role === "assistant" && messages[messages.length - 1].content === "" && (
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Analyzing your presentation</span>
            </div>
          )}

          {showFollowUps && (
            <div className="pt-2">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">Continue with</p>
              <div className="flex flex-wrap gap-2">
                {followUps.map((f) => (
                  <button key={f.label} type="button"
                    onClick={() => { setInput(""); onSend(f.message) }}
                    disabled={isInputDisabled}
                    className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm text-foreground/80 transition-all hover:border-primary/30 hover:bg-accent hover:text-foreground active:scale-[0.98] disabled:opacity-50">
                    {f.label}
                    <ArrowRight className="h-3 w-3 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom input bar */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 sm:px-6">
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
          <div className={`relative flex h-12 sm:h-14 items-center overflow-hidden rounded-2xl border bg-muted transition-colors ${
            recorder.isRecording ? "border-red-500/40" : "border-border focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/20"
          }`}>
            {recorder.isRecording ? recordingContent : (
              <>
                <button type="button" onClick={() => (chatMode ? onPdfClick : onFileClick)()}
                  disabled={isBusy || slideReview.isAnalyzing}
                  className="absolute left-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                  aria-label="Attach a file">
                  <Paperclip className="h-4 w-4" />
                </button>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e) } }}
                  placeholder="Describe your audience or ask for feedback..."
                  disabled={isInputDisabled}
                  className="h-full w-full bg-transparent pl-12 pr-20 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50"
                />
                <button type="button" onClick={onStartRecording}
                  disabled={isBusy || slideReview.isAnalyzing || !!input.trim()}
                  className="absolute right-11 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                  aria-label="Start recording">
                  <Mic className="h-4 w-4" />
                </button>
                {input.trim() || chatMode ? (
                  <button type="submit" disabled={isInputDisabled || !input.trim()}
                    className="absolute right-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-30"
                    aria-label="Send message">
                    {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                ) : (
                  <button type="button"
                    onClick={onPresentationModeEnter}
                    disabled={isBusy}
                    className="absolute right-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-30"
                    aria-label="Enter presentation mode">
                    <Smile className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  )
})
