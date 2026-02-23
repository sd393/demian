export type CoachingStage = 'define' | 'present' | 'qa' | 'feedback' | 'followup'

export interface SetupContext {
  topic?: string
  audience?: string
  goal?: string
  additionalContext?: string
}
