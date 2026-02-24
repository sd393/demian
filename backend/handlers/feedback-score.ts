import { NextRequest } from "next/server"
import { openai } from "@/backend/openai"
import { requireAuth } from "@/backend/auth"
import { z } from "zod"
import type { SessionScoresV2 } from "@/lib/sessions"

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
    `You are Vera — you just sat through a presentation as this audience: ${input.setup.audience}.`,
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
Your job is to produce a structured evaluation of this presentation. Respond with valid JSON.

STEP 1 — FEEDBACK LETTER
Write a feedback letter (3-5 paragraphs) as Vera speaking directly to the presenter. Written in first person, in character as the audience. Include what landed, what didn't, and naturally weave in one strong point and one area for improvement. Paragraph form — no headers, no bullet points, no markdown formatting. Just honest, direct prose like you're talking to them afterward.

STEP 2 — DYNAMIC RUBRIC
Generate 4-6 rubric criteria that are SPECIFIC to this audience and goal. Do NOT use generic categories like "clarity" or "engagement". Instead, choose criteria that reflect what THIS audience actually cares about.

Examples:
- For VC investors: "Market Opportunity Clarity", "Traction Evidence", "Team Credibility", "Ask & Use of Funds"
- For a school board: "Policy Alignment", "Budget Justification", "Community Impact", "Implementation Feasibility"
- For an engineering team: "Technical Accuracy", "Scope Definition", "Risk Assessment", "Timeline Realism"

You choose the criteria based on the audience, goal, and what actually matters to them.

STEP 3 — SCORING
Score each criterion 0-100 with a 2-3 sentence summary and 1-3 direct transcript quotes as evidence.

For EACH criterion, also provide "descriptors" — a one-sentence description of what each scoring tier looks like for that specific criterion. This turns the rubric into a proper scoring guide so the presenter understands what each level means.

Scoring tiers:
- Exceptional (85-100): What outstanding performance looks like for this criterion
- Proficient (70-84): What solid, competent performance looks like
- Developing (50-69): What average or incomplete performance looks like
- Needs Work (0-49): What poor or missing performance looks like

Calibration guide:
- 50 = average (gets the point across but nothing special)
- 70 = good (clear, organized, effective for this audience)
- 85+ = exceptional (compelling, memorable, this audience walks away convinced)

Score as the specified audience — what matters to THEM, not a generic coach.

STEP 4 — HIGHLIGHTS
Identify:
- The strongest moment: a direct transcript quote + why it worked for this audience
- One area to improve: a specific issue + a concrete, actionable suggestion

STEP 5 — REFINED METADATA
Generate polished, concise versions of the presentation metadata:
- refinedTitle: A clean, professional title for this presentation (not the raw user input — refine it)
- refinedAudience: A short, polished audience label (e.g. "Series A Venture Capitalists" instead of "vcs")
- refinedGoal: A short, polished goal label (e.g. "Secure Seed Funding" instead of "get funding")

Respond with valid JSON matching this exact schema:
{
  "feedbackLetter": "<string — 3-5 paragraphs, no markdown, plain prose>",
  "rubric": [
    {
      "name": "<criterion name>",
      "score": <number 0-100>,
      "summary": "<2-3 sentences>",
      "evidence": ["<transcript quote>", ...],
      "descriptors": {
        "exceptional": "<one sentence: what 85-100 looks like for this criterion>",
        "proficient": "<one sentence: what 70-84 looks like>",
        "developing": "<one sentence: what 50-69 looks like>",
        "needsWork": "<one sentence: what 0-49 looks like>"
      }
    }
  ],
  "strongestMoment": { "quote": "<direct transcript quote>", "why": "<why it worked>" },
  "areaToImprove": { "issue": "<specific issue>", "suggestion": "<concrete actionable suggestion>" },
  "refinedTitle": "<polished presentation title>",
  "refinedAudience": "<polished audience label>",
  "refinedGoal": "<polished goal label>"
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
      max_tokens: 5000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from scoring model" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    const scores: SessionScoresV2 = JSON.parse(content)

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
