export type CoachingStage = 'define' | 'present' | 'feedback' | 'followup'

export interface SetupContext {
  topic?: string
  audience?: string
  goal?: string
  additionalContext?: string
  fileContext?: string
}
