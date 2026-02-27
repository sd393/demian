"use client"

import { useState, useRef, useCallback } from 'react'
import { buildAuthHeaders } from '@/lib/api-utils'
import { parseSSEStream } from '@/lib/sse-utils'
import type { Message } from '@/hooks/use-message-context'
import type { SetupContext } from '@/lib/coaching-stages'

export interface ResearchMeta {
  searchTerms: string[]
  audienceSummary: string
  briefing: string
}

interface ResearchSSEEvent {
  event: string
  searchTerms?: string[]
  audienceSummary?: string
  researchContext?: string
  error?: string
}

interface UseResearchPipelineDeps {
  authTokenRef: React.RefObject<string | null>
  setupContextRef: React.RefObject<SetupContext | null>
}

export function useResearchPipeline(deps: UseResearchPipelineDeps) {
  const { authTokenRef, setupContextRef } = deps
  const [isResearching, setIsResearching] = useState(false)
  const [researchContext, setResearchContext] = useState<string | null>(null)
  const [researchMeta, setResearchMeta] = useState<ResearchMeta | null>(null)
  const [researchSearchTerms, setResearchSearchTerms] = useState<string[] | null>(null)
  const researchContextRef = useRef<string | null>(null)
  researchContextRef.current = researchContext

  const handleResearchEvent = useCallback(
    (data: ResearchSSEEvent, resultRef: { current: string | null }) => {
      if (data.event === 'terms') {
        setResearchSearchTerms(data.searchTerms ?? null)
      } else if (data.event === 'complete') {
        setResearchContext(data.researchContext ?? null)
        researchContextRef.current = data.researchContext ?? null
        setResearchMeta({
          searchTerms: data.searchTerms ?? [],
          audienceSummary: data.audienceSummary ?? '',
          briefing: data.researchContext ?? '',
        })
        resultRef.current = data.researchContext ?? null
      } else if (data.event === 'error') {
        console.warn('[research] Server-side pipeline error:', data.error)
      }
    },
    []
  )

  const startResearchEarly = useCallback(
    async (audience: string, opts?: { topic?: string; goal?: string; additionalContext?: string }) => {
      setIsResearching(true)
      setResearchSearchTerms(null)
      try {
        const response = await fetch('/api/research', {
          method: 'POST',
          headers: buildAuthHeaders(authTokenRef.current),
          body: JSON.stringify({
            audienceDescription: audience,
            topic: opts?.topic || undefined,
            goal: opts?.goal || undefined,
            additionalContext: opts?.additionalContext || undefined,
          }),
        })

        if (!response.ok) {
          console.warn('[research] Early research failed:', response.status)
          return null
        }

        const reader = response.body!.getReader()
        const resultRef = { current: null as string | null }

        await parseSSEStream<ResearchSSEEvent>(reader, {
          onEvent: (data) => handleResearchEvent(data, resultRef),
        })

        return resultRef.current
      } catch (err) {
        console.warn('[research] Early research error, proceeding without enrichment', err)
        return null
      } finally {
        setIsResearching(false)
        setResearchSearchTerms(null)
      }
    },
    [authTokenRef, handleResearchEvent]
  )

  const runResearchPipeline = useCallback(
    async (currentTranscript: string, currentMessages: Message[]) => {
      setIsResearching(true)
      setResearchSearchTerms(null)
      try {
        const uploadIndex = currentMessages.findIndex((m) => m.attachment)
        const audienceMessages = currentMessages
          .slice(uploadIndex + 1)
          .filter((m) => m.role === 'user')
          .map((m) => m.content)

        if (audienceMessages.length === 0) return null

        const audienceDescription = audienceMessages.join('\n')

        console.log('[research] Starting pipeline...', { audienceDescription })

        const setup = setupContextRef.current
        const response = await fetch('/api/research', {
          method: 'POST',
          headers: buildAuthHeaders(authTokenRef.current),
          body: JSON.stringify({
            transcript: currentTranscript,
            audienceDescription,
            topic: setup?.topic || undefined,
            goal: setup?.goal || undefined,
            additionalContext: setup?.additionalContext || undefined,
          }),
        })

        if (!response.ok) {
          console.warn('[research] Pipeline failed:', response.status)
          return null
        }

        const reader = response.body!.getReader()
        const resultRef = { current: null as string | null }

        await parseSSEStream<ResearchSSEEvent>(reader, {
          onEvent: (data) => handleResearchEvent(data, resultRef),
        })

        return resultRef.current
      } catch (err) {
        console.warn('[research] Pipeline error, proceeding without enrichment', err)
        return null
      } finally {
        setIsResearching(false)
        setResearchSearchTerms(null)
      }
    },
    [authTokenRef, setupContextRef, handleResearchEvent]
  )

  const resetResearch = useCallback(() => {
    setResearchContext(null)
    setResearchMeta(null)
    setResearchSearchTerms(null)
    researchContextRef.current = null
    setIsResearching(false)
  }, [])

  return {
    researchContext,
    researchContextRef,
    researchMeta,
    researchSearchTerms,
    isResearching,
    startResearchEarly,
    runResearchPipeline,
    resetResearch,
  }
}
