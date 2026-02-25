import { NextRequest, NextResponse } from "next/server"
import { openai } from "@/backend/openai"
import { requireAuth } from "@/backend/auth"
import { feedbackScoreRequestSchema } from "@/backend/validation"
import { buildScoringPrompt } from "@/backend/scoring-prompt"
import type { SessionScoresV2 } from "@/lib/sessions"

export async function handleFeedbackScore(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) return authResult

  try {
    const body = await request.json()
    const parsed = feedbackScoreRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      )
    }

    const prompt = buildScoringPrompt(parsed.data)

    const completion = await openai().chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 5000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { error: "No response from scoring model" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { sessionId: parsed.data.sessionId, scores: JSON.parse(content) as SessionScoresV2 }
    )
  } catch (error) {
    console.error("Feedback scoring error:", error)
    return NextResponse.json(
      { error: "Failed to generate scores. Please try again." },
      { status: 500 }
    )
  }
}
