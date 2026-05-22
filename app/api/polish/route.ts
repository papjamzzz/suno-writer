import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  const { lyrics, genre, mood } = await req.json()
  const key = process.env.OPENAI_API_KEY
  if (!key) return NextResponse.json({ error: 'No API key' }, { status: 400 })

  const openai = new OpenAI({ apiKey: key })

  const system = `You are a professional songwriter and Suno AI expert. Your job is to take raw lyric ideas and format them perfectly for Suno.

Rules:
- Keep the writer's authentic voice, slang, phrasing, and intent. Never sanitize personality.
- Add proper structure tags: [Intro], [Verse 1], [Chorus], [Bridge], [Outro], etc. Place them on their own line.
- Clean up spacing — one blank line between sections.
- If a line is too long or clunky for a melody, suggest a tighter version in parentheses on the next line.
- Do NOT rewrite lines unless they're structurally broken. Preserve the words.
- Suno works best with 2-4 line verses and 4-8 line choruses. Flag if sections seem too long.
- Return ONLY the formatted lyrics — no explanation, no commentary.

Context: Genre is "${genre || 'unspecified'}", mood is "${mood || 'unspecified'}".`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1500,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: lyrics }
    ]
  })

  return NextResponse.json({ lyrics: response.choices[0].message.content || lyrics })
}
