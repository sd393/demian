import { NextRequest } from 'next/server'
import { openai } from '@/backend/openai'
import { chatRequestSchema, sanitizeInput } from '@/backend/validation'
import { buildSystemPrompt } from '@/backend/system-prompt'
import { checkRateLimit, getClientIp } from '@/backend/rate-limit'
import { requireAuth } from '@/backend/auth'
import { getUserPlan } from '@/backend/subscription'
import { SSE_HEADERS } from '@/backend/request-utils'

export async function handleChat(request: NextRequest) {
  const ip = getClientIp(request)
  if (!checkRateLimit(ip, 10, 60_000).allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait a moment.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const authResult = await requireAuth(request)

  // If requireAuth returned a Response, it's a 401 error
  if (authResult instanceof Response) {
    return authResult
  }

  // Authenticated user — check plan-based limits
  const { plan } = await getUserPlan(authResult.uid)
  if (plan !== 'pro') {
    // Free authenticated users: 20 messages per 24h
    if (!checkRateLimit('free:' + authResult.uid, 20, 86_400_000).allowed) {
      return new Response(
        JSON.stringify({
          error: 'You\'ve reached your daily message limit. Upgrade to Pro for unlimited messages.',
          code: 'free_limit_reached',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  try {
    const body = await request.json()

    const parsed = chatRequestSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { messages, transcript, researchContext, slideContext, stage, setupContext } = parsed.data

    const systemPrompt = buildSystemPrompt({
      stage,
      transcript,
      researchContext,
      slideContext,
      setupContext,
    })

    const openaiMessages: Array<{
      role: 'system' | 'user' | 'assistant'
      content: string
    }> = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: sanitizeInput(m.content),
      })),
    ]

    const client = openai()
    const stream = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: openaiMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: stage === 'feedback' ? 3000 : 2000,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              )
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          console.error('Stream error:', err)
          controller.error(err)
        }
      },
    })

    return new Response(readable, { headers: SSE_HEADERS })
  } catch (error) {
    console.error('Chat error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to generate response. Please try again.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
