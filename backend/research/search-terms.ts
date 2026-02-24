import { openai } from '@/backend/openai'

export interface SearchTermsResult {
  searchTerms: string[]
  audienceSummary: string
}

const SEARCH_TERM_PROMPT = `You are a research assistant for a presentation coaching tool.
Given context about a presentation — who the audience is, what the topic is, what the presenter wants to achieve, and any additional context — generate 6-10 targeted web search queries.

Your search terms should help the coach deeply understand:

1. **Audience mindset**: What this specific audience cares about, how they think, what their day-to-day priorities look like, and what motivates their decisions
2. **Domain knowledge**: Industry terminology, frameworks, metrics, or benchmarks this audience uses daily — the coach needs to speak their language
3. **Objections and concerns**: Common skepticism, pushback patterns, or deal-breakers this audience is known for when evaluating proposals or ideas like this
4. **Recent context**: News, trends, market shifts, or regulatory changes that are top-of-mind for this audience right now
5. **Presentation expectations**: How this audience evaluates presentations — do they want data? Stories? Executive summaries? What format wins them over?
6. **Goal-specific intel**: If the presenter has a specific goal (e.g. "close the deal", "get buy-in"), search for what drives this audience toward that outcome

Return a JSON object with:
- "searchTerms": array of 6-10 specific, diverse search queries (not generic)
- "audienceSummary": a one-sentence summary of who the audience is and what they care about

Each search term should be a complete, specific search query — not just keywords.
Vary the queries across the categories above. Do NOT include generic presentation advice queries.
Focus entirely on understanding THIS audience in THIS context.`

export async function generateSearchTerms(
  audienceDescription: string,
  transcript?: string,
  topic?: string,
  goal?: string,
  additionalContext?: string,
): Promise<SearchTermsResult> {
  const client = openai()

  // Build context from all available fields
  const sections: string[] = []

  if (transcript) {
    sections.push(`PRESENTATION TRANSCRIPT (excerpt):\n"""\n${transcript.slice(0, 3000)}\n"""`)
  }
  if (topic) {
    sections.push(`PRESENTATION TOPIC:\n"""\n${topic}\n"""`)
  }
  if (goal) {
    sections.push(`PRESENTER'S GOAL:\n"""\n${goal}\n"""`)
  }
  if (additionalContext) {
    sections.push(`ADDITIONAL CONTEXT:\n"""\n${additionalContext}\n"""`)
  }

  const contextBlock = sections.length > 0
    ? sections.join('\n\n')
    : '(No transcript or topic provided — generate search terms based on the audience alone.)'

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SEARCH_TERM_PROMPT },
      {
        role: 'user',
        content: `${contextBlock}\n\nTARGET AUDIENCE:\n"""\n${audienceDescription}\n"""`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
    max_tokens: 800,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from search term generation')

  const parsed = JSON.parse(content) as SearchTermsResult
  if (!Array.isArray(parsed.searchTerms) || parsed.searchTerms.length === 0) {
    throw new Error('Invalid search terms response')
  }

  return parsed
}
