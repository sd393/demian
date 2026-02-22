export const FOLLOW_UPS_EARLY = [
  {
    label: "Define my target audience",
    message:
      "Help me clearly define who I'm presenting to — their role, expectations, and what they care about.",
  },
  {
    label: "Clarify my key message",
    message:
      "What should be the single most important takeaway my audience remembers?",
  },
]

export const FOLLOW_UPS_LATER = [
  {
    label: "Strengthen my opening",
    message:
      "Help me craft a stronger opening that grabs attention in the first 30 seconds.",
  },
  {
    label: "Challenge my weakest point",
    message:
      "Play devil's advocate — where would a skeptical audience push back on my argument?",
  },
  {
    label: "Polish my closing",
    message: "Help me end with a memorable, actionable closing statement.",
  },
]

export const STEP_LABELS: Record<string, string> = {
  idle: "Ready",
  uploading: "Uploading to secure storage...",
  downloading: "Downloading for processing...",
  rendering: "Extracting slide content...",
  analyzing: "Analyzing slides...",
  summarizing: "Writing summary...",
  done: "Analysis complete",
  error: "Error",
}
