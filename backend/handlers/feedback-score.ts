import { NextRequest } from "next/server"
import { openai } from "@/backend/openai"
import { requireAuth } from "@/backend/auth"
import { z } from "zod"
import type { SessionScores } from "@/lib/sessions"

const feedbackScoreRequestSchema = z.object({
  sessionId: z.string().min(1),
  transcript: z.string().max(100_000).optional(),
  setup: z.object({
    topic: z.string().max(500),
    audience: z.string().max(500),
    goal: z.string().max(500),
    additionalContext: z.string().max(2000).optional(),
  }),
  messages: z
    .array(
      z.object({
        role: z.string(),
        content: z.string(),
      })
    )
    .max(200),
  researchContext: z.string().max(20_000).optional(),
  slideContext: z.string().max(30_000).optional(),
})

function buildScoringPrompt(input: z.infer<typeof feedbackScoreRequestSchema>): string {
  const parts: string[] = [
    `You are scoring a presentation as if you ARE the audience: ${input.setup.audience}.`,
    `The presenter's topic: ${input.setup.topic}`,
    `Their goal: ${input.setup.goal}`,
  ]

  if (input.setup.additionalContext) {
    parts.push(`Additional context: ${input.setup.additionalContext}`)
  }

  if (input.researchContext) {
    parts.push(`\nAudience research:\n${input.researchContext}`)
  }

  if (input.transcript) {
    parts.push(`\nFull presentation transcript:\n${input.transcript}`)
  }

  if (input.slideContext) {
    parts.push(`\nSlide deck review:\n${input.slideContext}`)
  }

  const conversationSummary = input.messages
    .filter((m) => m.content.trim())
    .map((m) => `[${m.role}]: ${m.content}`)
    .join("\n")

  if (conversationSummary) {
    parts.push(`\nCoaching conversation:\n${conversationSummary}`)
  }

  parts.push(`
Score this presentation on the following 6 categories. For each, provide a score from 0-100, a 2-3 sentence summary, specific transcript quotes as evidence, and one concrete suggestion for improvement.

Calibration guide:
- 50 = average presenter (gets the point across but nothing special)
- 70 = good (clear, organized, engages audience)
- 85+ = exceptional (compelling, memorable, masterful delivery)

Score as the specified audience — what matters to THEM, not a generic coach.

Categories:
1. clarity — How clear and understandable was the message?
2. structure — How well-organized was the flow and progression?
3. engagement — How well did it hold audience attention?
4. persuasiveness — How convincing were the arguments and evidence?
5. audienceAlignment — How well-tailored was it to this specific audience?
6. delivery — How effective was the speaking style, pacing, and tone?

Also identify:
- The strongest moment (direct quote + why it worked)
- The weakest moment (direct quote + why it fell flat)
- 3 prioritized action items (title, description, impact: high or medium)

Respond with valid JSON matching this exact schema:
{
  "overall": <number 0-100>,
  "categories": {
    "clarity": { "score": <number>, "summary": "<string>", "evidence": ["<quote>", ...], "suggestion": "<string>" },
    "structure": { "score": <number>, "summary": "<string>", "evidence": ["<quote>", ...], "suggestion": "<string>" },
    "engagement": { "score": <number>, "summary": "<string>", "evidence": ["<quote>", ...], "suggestion": "<string>" },
    "persuasiveness": { "score": <number>, "summary": "<string>", "evidence": ["<quote>", ...], "suggestion": "<string>" },
    "audienceAlignment": { "score": <number>, "summary": "<string>", "evidence": ["<quote>", ...], "suggestion": "<string>" },
    "delivery": { "score": <number>, "summary": "<string>", "evidence": ["<quote>", ...], "suggestion": "<string>" }
  },
  "keyMoments": {
    "strongest": { "quote": "<string>", "why": "<string>" },
    "weakest": { "quote": "<string>", "why": "<string>" }
  },
  "actionItems": [
    { "priority": 1, "title": "<string>", "description": "<string>", "impact": "high" | "medium" },
    { "priority": 2, "title": "<string>", "description": "<string>", "impact": "high" | "medium" },
    { "priority": 3, "title": "<string>", "description": "<string>", "impact": "high" | "medium" }
  ]
}`)

  return parts.join("\n")
}

export async function handleFeedbackScore(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  try {
    const body = await request.json()
    const parsed = feedbackScoreRequestSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const prompt = buildScoringPrompt(parsed.data)
    const client = openai()

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from scoring model" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    const scores: SessionScores = JSON.parse(content)

    return new Response(
      JSON.stringify({ sessionId: parsed.data.sessionId, scores }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Feedback scoring error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to generate scores. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
