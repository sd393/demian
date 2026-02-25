"use client"

import { useState, useRef, useCallback } from 'react'
import type { CoachingStage, SetupContext } from '@/lib/coaching-stages'

export function usePresentationStage() {
  const [stage, setStage] = useState<CoachingStage>('define')
  const [setupContext, setSetupContext] = useState<SetupContext | null>(null)
  const [audiencePulseHistory, setAudiencePulseHistory] = useState<{ text: string; emotion: string }[]>([])

  const stageRef = useRef<CoachingStage>('define')
  const setupContextRef = useRef<SetupContext | null>(null)
  const audiencePulseHistoryRef = useRef<{ text: string; emotion: string }[]>([])

  stageRef.current = stage
  setupContextRef.current = setupContext
  audiencePulseHistoryRef.current = audiencePulseHistory

  const startPresentation = useCallback(
    (context: SetupContext) => {
      setSetupContext(context)
      setupContextRef.current = context
      setStage('present')
      stageRef.current = 'present'
    },
    []
  )

  const finishPresentation = useCallback(
    () => {
      setStage('followup')
      stageRef.current = 'followup'
    },
    []
  )

  const appendPulseLabels = useCallback(
    (labels: { text: string; emotion: string }[]) => {
      setAudiencePulseHistory((prev) => [...prev, ...labels])
    },
    []
  )

  const resetStage = useCallback(() => {
    setStage('define')
    stageRef.current = 'define'
    setSetupContext(null)
    setupContextRef.current = null
    setAudiencePulseHistory([])
    audiencePulseHistoryRef.current = []
  }, [])

  return {
    stage,
    stageRef,
    setupContext,
    setupContextRef,
    audiencePulseHistory,
    startPresentation,
    finishPresentation,
    appendPulseLabels,
    resetStage,
  }
}
