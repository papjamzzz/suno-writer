import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  const song = await req.json()
  const key = process.env.OPENAI_API_KEY
  if (!key) return NextResponse.json({ error: 'No API key' }, { status: 400 })

  const openai = new OpenAI({ apiKey: key })

  const {
    lyrics, isInstrumental, genre, subGenres, moods, vocalGender,
    vocalDemo, vocalStyles, artistRef, bpm, musicalKey, eras,
    instruments, energy, production
  } = song

  const system = `You are a Suno AI expert who has studied thousands of successful Suno prompts. You know exactly how Suno interprets language — what it responds to and what it ignores.

Your job: Take all the song parameters and produce the most effective Suno style prompt possible.

SUNO STYLE PROMPT RULES:
1. Max 120 characters. Every word must earn its place. Cut ruthlessly.
2. Lead with genre + core descriptor. Suno anchors on the first 2-3 words.
3. Vocal description is powerful: "male raspy vocals", "female breathy falsetto", "soulful female voice"
4. Tempo and key hints work: "90 BPM", "Dm minor", "slow tempo", "driving 4/4"
5. Artist references are highly effective: "in the style of X" — use them if provided.
6. Mood adjectives that Suno understands well: dark, melancholic, aggressive, uplifting, cinematic, intimate, haunting, euphoric
7. Instrument specifics help: "heavy 808s", "fingerpicked acoustic", "distorted guitar", "lush strings"
8. Avoid vague filler: "beautiful", "amazing", "great" — these add nothing.
9. Production terms: "lo-fi", "reverb-heavy", "punchy drums", "wall of sound", "sparse arrangement"
10. Energy: translate 1-3 as "intimate/sparse", 4-6 as "mid-energy", 7-8 as "energetic", 9-10 as "explosive/full send"

LYRICS RULES (if not instrumental):
- Return the lyrics exactly as provided but make sure structure tags are properly placed
- Each section tag on its own line: [Verse 1], [Chorus], etc.
- One blank line between sections
- If lyrics are missing tags, add sensible ones based on content

Return JSON only, no markdown:
{
  "stylePrompt": "the complete suno style prompt under 120 chars",
  "lyrics": "the formatted lyrics string (or empty string if instrumental)"
}`

  const userMsg = `
Genre: ${genre || 'not set'}
Sub-genres: ${subGenres?.join(', ') || 'none'}
Mood: ${moods?.join(', ') || 'none'}
Instrumental: ${isInstrumental ? 'YES' : 'No'}
Vocal Gender: ${vocalGender || 'not specified'}
Vocal Demo: ${vocalDemo || 'not specified'}
Vocal Styles: ${vocalStyles?.join(', ') || 'not specified'}
Artist References: ${artistRef || 'none'}
BPM: ${bpm || 'not set'}
Key: ${musicalKey || 'not set'}
Era: ${eras?.join(', ') || 'none'}
Instruments: ${instruments?.join(', ') || 'none'}
Energy: ${energy}/10
Production: ${production?.join(', ') || 'none'}
Lyrics:
${isInstrumental ? '[INSTRUMENTAL — no lyrics]' : (lyrics || '[no lyrics provided]')}
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1500,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userMsg }
    ]
  })

  const text = response.choices[0].message.content || ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return NextResponse.json({ stylePrompt: text.slice(0, 120), lyrics: lyrics || '' })

  try {
    const result = JSON.parse(match[0])
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ stylePrompt: text.slice(0, 120), lyrics: lyrics || '' })
  }
}
