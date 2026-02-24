import { openai } from '@/backend/openai'

const RESEARCH_PROMPT = `You are a research assistant preparing a detailed briefing for a presentation coach.
The coach will use this briefing to role-play as the audience and give feedback that sounds like it's coming from a real person in that room.

Search the web thoroughly using the provided search terms. Then synthesize everything into a comprehensive AUDIENCE BRIEFING. The briefing must include:

1. **Audience Profile**: Who they are, their role, seniority, what they care about day-to-day, and how they make decisions. Be specific — "VP of Engineering at a Series B startup" is better than "technical leaders."

2. **Domain Context**: Key industry trends, terminology, recent news, or market shifts they'd know about. Include specific numbers, company names, or events where possible. The coach needs to reference these naturally.

3. **What They're Evaluating**: Based on the presenter's goal, what criteria will this audience use to judge the presentation? What's the bar? What have they seen before?

4. **Communication Expectations**: How this audience prefers to receive information. Are they data-driven or narrative-driven? Do they want executive summaries or deep dives? Do they interrupt with questions or wait until the end? What format wins them over?

5. **Likely Objections & Tough Questions**: Specific objections, skepticism, or hard questions this audience would raise about this topic. Not generic concerns — real pushback grounded in their domain. Include 3-5 concrete example questions they might ask.

6. **What Would Impress Them**: Specific things the presenter could say, reference, or demonstrate that would land well with this audience. Name-drop opportunities, data points they'd respect, frameworks they use.

Keep the briefing under 1000 words. Be specific, concrete, and grounded in what you find.
Cite specific facts, statistics, companies, or trends where possible.
Do NOT make up information. If search results are thin for a topic, say so and explain what you couldn't find.`

export async function conductResearch(
  searchTerms: string[],
  audienceSummary: string,
  goal?: string,
): Promise<string> {
  const client = openai()

  const goalLine = goal ? `\nPRESENTER'S GOAL: ${goal}` : ''

  const response = await client.responses.create({
    model: 'gpt-4o-mini',
    tools: [{ type: 'web_search', search_context_size: 'high' }],
    input: [
      { role: 'system', content: RESEARCH_PROMPT },
      {
        role: 'user',
        content: `AUDIENCE: ${audienceSummary}${goalLine}\n\nSEARCH TERMS TO INVESTIGATE:\n${searchTerms.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nPlease search the web using these terms, then compile your findings into the audience briefing format described above.`,
      },
    ],
  })

  const text = response.output_text
  if (!text) {
    throw new Error('No text output from research')
  }

  return text
}
