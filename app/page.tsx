'use client'
import { useState, useRef } from 'react'

type View = 'lyrics' | 'arrangement'

const STRUCTURE_TAGS = [
  '[Intro]','[Verse 1]','[Verse 2]','[Verse 3]',
  '[Pre-Chorus]','[Chorus]','[Post-Chorus]',
  '[Hook]','[Bridge]','[Break]','[Instrumental Break]',
  '[Solo]','[Outro]','[Spoken]','[Ad-lib]','[End]',
]

const GENRES = [
  'Hip-Hop','Trap','Drill','R&B','Soul','Neo-Soul','Pop','Indie Pop',
  'K-Pop','K-R&B','K-Hip-Hop','K-Ballad','J-Pop',
  'Rock','Alternative','Indie Rock','Hard Rock','Metal','Punk','Emo',
  'Country','Americana','Folk','Indie Folk','Electronic','House',
  'Techno','Lo-fi','Jazz','Blues','Gospel','Reggae','Dancehall',
  'Latin','Reggaeton','Cinematic','Ambient','Classical',
]

const MOODS = [
  'Dark','Moody','Melancholic','Sad','Angry','Aggressive',
  'Uplifting','Euphoric','Hype','Energetic','Romantic',
  'Sensual','Nostalgic','Chill','Relaxed','Mysterious',
  'Epic','Cinematic','Playful','Raw','Introspective',
  'Cute','Girl Crush','Boy Group Energy','Dreamy','Bubbly',
  'Longing','Bittersweet','Fierce','Tender','Whimsical',
]

const VOCAL_STYLES = [
  'Smooth','Raspy','Gritty','Falsetto','Powerful','Belting',
  'Breathy','Melodic Rap','Trap Flow','Country Twang',
  'Spoken Word','Choir','Opera','Whispered','Intense',
  'Airy','Sweet','Idol Tone','High Note','Ad-libs',
]

const INSTRUMENTS = [
  '808s','Acoustic Guitar','Electric Guitar','Piano','Synths',
  'Strings','Brass','Drums','Hi-Hats','Bass Guitar',
  'Violin','Cello','Flute','Organ','Rhodes',
  'Distorted Guitar','Fingerpicking','Pad','Sub Bass',
]

const ERAS = ['50s','60s','70s','80s','90s','2000s','2010s','Modern','Timeless']

const PRODUCTION = [
  'Lo-fi','Polished','Raw','Cinematic','Minimal','Wall of Sound',
  'Gritty','Clean','Reverb-Heavy','Punchy','Layered','Sparse',
]

const KEYS = [
  'C Major','C# Major','D Major','D# Major','E Major','F Major',
  'F# Major','G Major','G# Major','A Major','A# Major','B Major',
  'C Minor','C# Minor','D Minor','D# Minor','E Minor','F Minor',
  'F# Minor','G Minor','G# Minor','A Minor','A# Minor','B Minor',
]

interface SongState {
  lyrics: string
  isInstrumental: boolean
  genre: string
  subGenres: string[]
  moods: string[]
  vocalGender: string
  vocalDemo: string
  vocalStyles: string[]
  artistRef: string
  bpm: string
  musicalKey: string
  eras: string[]
  instruments: string[]
  energy: number
  production: string[]
}

function Pills({ options, selected, onToggle, color = 'var(--purple)' }: {
  options: string[]
  selected: string[]
  onToggle: (v: string) => void
  color?: string
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(o => {
        const on = selected.includes(o)
        return (
          <button
            key={o}
            onClick={() => onToggle(o)}
            style={{
              padding: '5px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              border: `1px solid ${on ? color : 'var(--border2)'}`,
              background: on ? color + '22' : 'var(--card2)',
              color: on ? color : 'var(--dim2)',
              cursor: 'pointer', transition: 'all .15s',
            }}
          >{o}</button>
        )
      })}
    </div>
  )
}

function SinglePill({ options, selected, onSelect, color = 'var(--purple)' }: {
  options: string[]
  selected: string
  onSelect: (v: string) => void
  color?: string
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(o => {
        const on = selected === o
        return (
          <button
            key={o}
            onClick={() => onSelect(on ? '' : o)}
            style={{
              padding: '5px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              border: `1px solid ${on ? color : 'var(--border2)'}`,
              background: on ? color + '22' : 'var(--card2)',
              color: on ? color : 'var(--dim2)',
              cursor: 'pointer', transition: 'all .15s',
            }}
          >{o}</button>
        )
      })}
    </div>
  )
}

export default function Home() {
  const [view, setView] = useState<View>('lyrics')
  const [song, setSong] = useState<SongState>({
    lyrics: '',
    isInstrumental: false,
    genre: '',
    subGenres: [],
    moods: [],
    vocalGender: '',
    vocalDemo: '',
    vocalStyles: [],
    artistRef: '',
    bpm: '',
    musicalKey: '',
    eras: [],
    instruments: [],
    energy: 5,
    production: [],
  })
  const [polishing, setPolishing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [output, setOutput] = useState<{ stylePrompt: string; lyrics: string } | null>(null)
  const [copied, setCopied] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const set = <K extends keyof SongState>(k: K, v: SongState[K]) =>
    setSong(prev => ({ ...prev, [k]: v }))

  const toggle = (k: 'subGenres' | 'moods' | 'vocalStyles' | 'instruments' | 'eras' | 'production', v: string) =>
    setSong(prev => ({
      ...prev,
      [k]: prev[k].includes(v) ? (prev[k] as string[]).filter(x => x !== v) : [...(prev[k] as string[]), v]
    }))

  const insertTag = (tag: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const before = song.lyrics.slice(0, start)
    const after = song.lyrics.slice(end)
    const needsNewline = before.length > 0 && !before.endsWith('\n')
    const inserted = (needsNewline ? '\n' : '') + tag + '\n'
    const newLyrics = before + inserted + after
    set('lyrics', newLyrics)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + inserted.length, start + inserted.length)
    }, 0)
  }

  const polishLyrics = async () => {
    if (!song.lyrics.trim()) return
    setPolishing(true)
    try {
      const res = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyrics: song.lyrics, genre: song.genre, mood: song.moods[0] || '' })
      })
      const data = await res.json()
      if (data.lyrics) set('lyrics', data.lyrics)
    } finally {
      setPolishing(false)
    }
  }

  const generatePrompt = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(song)
      })
      const data = await res.json()
      setOutput(data)
    } finally {
      setGenerating(false)
    }
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const S: Record<string, React.CSSProperties> = {
    section: { marginBottom: 22 },
    label: { fontSize: 9, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: 'var(--dim)', marginBottom: 8, display: 'block' },
    card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' },
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <header style={{ borderBottom: '1px solid var(--border)', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: 3, color: 'var(--purple)' }}>SUNO WRITER</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--dim)', textTransform: 'uppercase' }}>AI Prompt Builder</span>
        </div>
        {/* View toggle — Ableton style */}
        <div style={{ display: 'flex', background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 8, overflow: 'hidden' }}>
          {(['lyrics', 'arrangement'] as View[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '7px 18px', fontSize: 10, fontWeight: 900, letterSpacing: '0.14em',
                textTransform: 'uppercase', border: 'none', cursor: 'pointer', transition: 'all .15s',
                background: view === v ? (v === 'lyrics' ? 'var(--purple)' : 'var(--gold)') : 'transparent',
                color: view === v ? '#fff' : 'var(--dim)',
              }}
            >{v === 'lyrics' ? '✏ Lyrics' : '🎛 Arrangement'}</button>
          ))}
        </div>
      </header>

      {/* MAIN */}
      <div style={{ flex: 1, maxWidth: 900, width: '100%', margin: '0 auto', padding: '28px 20px 200px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── LYRICS VIEW ─────────────────────────────────────── */}
        {view === 'lyrics' && (
          <>
            {/* Instrumental toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => set('isInstrumental', !song.isInstrumental)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                  border: `1px solid ${song.isInstrumental ? 'var(--gold)' : 'var(--border2)'}`,
                  background: song.isInstrumental ? 'rgba(212,168,67,0.15)' : 'var(--card2)',
                  color: song.isInstrumental ? 'var(--gold)' : 'var(--dim2)',
                  cursor: 'pointer', transition: 'all .15s',
                }}
              >🎵 Instrumental Only</button>
              {song.isInstrumental && (
                <span style={{ fontSize: 11, color: 'var(--dim)', fontStyle: 'italic' }}>No lyrics needed — describe the music in Arrangement view</span>
              )}
            </div>

            {!song.isInstrumental && (
              <>
                {/* Structure tags */}
                <div style={S.card}>
                  <span style={S.label}>Insert Structure Tag</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {STRUCTURE_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => insertTag(tag)}
                        style={{
                          padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          border: '1px solid var(--border2)', background: 'var(--card2)',
                          color: 'var(--purple)', cursor: 'pointer', fontFamily: 'monospace',
                          transition: 'all .15s',
                        }}
                      >{tag}</button>
                    ))}
                  </div>
                </div>

                {/* Lyrics textarea */}
                <div style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={S.label as React.CSSProperties}>Lyrics</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--dim)' }}>{song.lyrics.length} chars</span>
                      <button
                        onClick={polishLyrics}
                        disabled={polishing || !song.lyrics.trim()}
                        style={{
                          padding: '5px 14px', borderRadius: 8, fontSize: 10, fontWeight: 800,
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                          border: '1px solid var(--purple)',
                          background: polishing ? 'transparent' : 'rgba(139,92,246,0.12)',
                          color: song.lyrics.trim() ? 'var(--purple)' : 'var(--dim)',
                          cursor: song.lyrics.trim() ? 'pointer' : 'not-allowed', transition: 'all .2s',
                        }}
                      >{polishing ? 'Polishing…' : '✨ Polish for Suno'}</button>
                    </div>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={song.lyrics}
                    onChange={e => set('lyrics', e.target.value)}
                    placeholder={`Write your lyrics here...\n\nTip: Click a tag above to insert [Chorus], [Verse 1], etc.\nOr just dump your raw ideas — hit Polish and the AI formats it.`}
                    style={{
                      width: '100%', minHeight: 340, background: 'var(--card2)',
                      border: '1px solid var(--border2)', borderRadius: 10,
                      padding: '14px', color: 'var(--text)', fontSize: 14,
                      lineHeight: 1.75, fontFamily: 'monospace', outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </>
            )}

            {song.isInstrumental && (
              <div style={{ ...S.card, textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🎼</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Instrumental mode</div>
                <div style={{ fontSize: 12, color: 'var(--dim)' }}>Head to Arrangement view to describe the music</div>
                <button onClick={() => setView('arrangement')} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 10, background: 'var(--gold)', color: '#000', border: 'none', fontWeight: 800, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Go to Arrangement →
                </button>
              </div>
            )}
          </>
        )}

        {/* ── ARRANGEMENT VIEW ─────────────────────────────────── */}
        {view === 'arrangement' && (
          <>
            {/* Genre */}
            <div style={S.card}>
              <span style={S.label}>Genre</span>
              <SinglePill options={GENRES} selected={song.genre} onSelect={v => set('genre', v)} color="var(--gold)" />
            </div>

            {/* Mood */}
            <div style={S.card}>
              <span style={S.label}>Mood / Vibe — pick all that apply</span>
              <Pills options={MOODS} selected={song.moods} onToggle={v => toggle('moods', v)} color="var(--purple)" />
            </div>

            {/* Vocal section — hidden if instrumental */}
            {!song.isInstrumental && (
              <div style={S.card}>
                <span style={S.label}>Vocalist</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <span style={{ ...S.label as React.CSSProperties, fontSize: 8, marginBottom: 6 }}>Gender</span>
                    <SinglePill
                      options={['Male','Female','Duet M/F','Duet F/F','Group']}
                      selected={song.vocalGender}
                      onSelect={v => set('vocalGender', v)}
                      color="var(--blue)"
                    />
                  </div>
                  <div>
                    <span style={{ ...S.label as React.CSSProperties, fontSize: 8, marginBottom: 6 }}>Age / Demo</span>
                    <SinglePill
                      options={['Teen','Young Adult','Adult','Mature']}
                      selected={song.vocalDemo}
                      onSelect={v => set('vocalDemo', v)}
                      color="var(--blue)"
                    />
                  </div>
                  <div>
                    <span style={{ ...S.label as React.CSSProperties, fontSize: 8, marginBottom: 6 }}>Vocal Style — pick all that apply</span>
                    <Pills options={VOCAL_STYLES} selected={song.vocalStyles} onToggle={v => toggle('vocalStyles', v)} color="var(--blue)" />
                  </div>
                </div>
              </div>
            )}

            {/* Artist reference */}
            <div style={S.card}>
              <span style={S.label}>Sounds Like — artist references</span>
              <input
                value={song.artistRef}
                onChange={e => set('artistRef', e.target.value)}
                placeholder="e.g. Post Malone, early Kanye, Phoebe Bridgers, Travis Scott..."
                style={{
                  width: '100%', background: 'var(--card2)', border: '1px solid var(--border2)',
                  borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none',
                }}
              />
            </div>

            {/* Key + BPM */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={S.card}>
                <span style={S.label}>Key</span>
                <select
                  value={song.musicalKey}
                  onChange={e => set('musicalKey', e.target.value)}
                  style={{
                    width: '100%', background: 'var(--card2)', border: '1px solid var(--border2)',
                    borderRadius: 8, padding: '9px 12px', color: song.musicalKey ? 'var(--text)' : 'var(--dim)',
                    fontSize: 13, outline: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="">— no preference —</option>
                  {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div style={S.card}>
                <span style={S.label}>BPM</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="number"
                    min={40} max={220}
                    value={song.bpm}
                    onChange={e => set('bpm', e.target.value)}
                    placeholder="e.g. 90"
                    style={{
                      flex: 1, background: 'var(--card2)', border: '1px solid var(--border2)',
                      borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none',
                    }}
                  />
                  <SinglePill options={['Slow','Mid','Fast']} selected={song.bpm === 'Slow' ? 'Slow' : song.bpm === 'Mid' ? 'Mid' : song.bpm === 'Fast' ? 'Fast' : ''} onSelect={v => set('bpm', v)} color="var(--gold)" />
                </div>
              </div>
            </div>

            {/* Energy */}
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={S.label as React.CSSProperties}>Energy Level</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: song.energy >= 7 ? 'var(--red)' : song.energy >= 4 ? 'var(--gold)' : 'var(--blue)' }}>{song.energy}/10</span>
              </div>
              <input
                type="range" min={1} max={10} value={song.energy}
                onChange={e => set('energy', parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--purple)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 9, color: 'var(--dim)' }}>Quiet / Intimate</span>
                <span style={{ fontSize: 9, color: 'var(--dim)' }}>Full Send</span>
              </div>
            </div>

            {/* Instruments */}
            <div style={S.card}>
              <span style={S.label}>Instruments — pick all that apply</span>
              <Pills options={INSTRUMENTS} selected={song.instruments} onToggle={v => toggle('instruments', v)} color="var(--green)" />
            </div>

            {/* Era */}
            <div style={S.card}>
              <span style={S.label}>Era / Decade</span>
              <Pills options={ERAS} selected={song.eras} onToggle={v => toggle('eras', v)} color="var(--gold)" />
            </div>

            {/* Production style */}
            <div style={S.card}>
              <span style={S.label}>Production Style</span>
              <Pills options={PRODUCTION} selected={song.production} onToggle={v => toggle('production', v)} color="var(--purple)" />
            </div>
          </>
        )}
      </div>

      {/* ── OUTPUT DOCK (always visible) ─────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--border2)', padding: '14px 28px 18px',
        zIndex: 100,
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {!output ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>
                  {song.genre || song.moods.length || song.lyrics.trim()
                    ? `${[song.genre, ...song.moods.slice(0,2)].filter(Boolean).join(' · ')} ${song.bpm ? `· ${song.bpm} BPM` : ''} ${song.musicalKey ? `· ${song.musicalKey}` : ''}`
                    : 'Fill in Lyrics + Arrangement, then generate your Suno prompt'}
                </div>
                <div style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {[
                    song.lyrics.trim() ? '✓ Lyrics' : '○ Lyrics',
                    song.genre ? '✓ Genre' : '○ Genre',
                    song.moods.length ? '✓ Mood' : '○ Mood',
                    (!song.isInstrumental && song.vocalGender) ? '✓ Vocal' : song.isInstrumental ? '✓ Instrumental' : '○ Vocal',
                  ].join('  ')}
                </div>
              </div>
              <button
                onClick={generatePrompt}
                disabled={generating}
                style={{
                  padding: '12px 28px', borderRadius: 12, background: generating ? 'var(--border2)' : 'var(--purple)',
                  color: generating ? 'var(--dim)' : '#fff', border: 'none', fontSize: 13, fontWeight: 900,
                  letterSpacing: '0.08em', textTransform: 'uppercase', cursor: generating ? 'not-allowed' : 'pointer',
                  transition: 'all .2s', whiteSpace: 'nowrap',
                }}
              >{generating ? 'Building…' : '⚡ Generate Suno Prompt'}</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Style prompt */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase' }}>Style Prompt</span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                      background: output.stylePrompt.length > 110 ? 'rgba(224,69,90,0.2)' : 'rgba(0,201,122,0.15)',
                      color: output.stylePrompt.length > 110 ? 'var(--red)' : 'var(--green)',
                    }}>{output.stylePrompt.length}/120</span>
                  </div>
                  <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--text)', lineHeight: 1.5, fontFamily: 'monospace' }}>
                    {output.stylePrompt}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button onClick={() => copy(output.stylePrompt, 'style')} style={{ padding: '7px 14px', borderRadius: 8, background: copied === 'style' ? 'var(--green)' : 'var(--gold)', color: '#000', border: 'none', fontSize: 11, fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {copied === 'style' ? '✓ Copied' : 'Copy Style'}
                  </button>
                  {!song.isInstrumental && (
                    <button onClick={() => copy(output.lyrics, 'lyrics')} style={{ padding: '7px 14px', borderRadius: 8, background: copied === 'lyrics' ? 'var(--green)' : 'var(--purple)', color: '#fff', border: 'none', fontSize: 11, fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {copied === 'lyrics' ? '✓ Copied' : 'Copy Lyrics'}
                    </button>
                  )}
                  <button
                    onClick={() => setOutput(null)}
                    style={{ padding: '7px 14px', borderRadius: 8, background: 'transparent', color: 'var(--dim)', border: '1px solid var(--border2)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                  >Reset</button>
                </div>
              </div>
              {/* Lyrics preview */}
              {!song.isInstrumental && output.lyrics && (
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--dim2)', lineHeight: 1.6, fontFamily: 'monospace', maxHeight: 80, overflowY: 'auto' }}>
                  {output.lyrics.slice(0, 200)}{output.lyrics.length > 200 ? '…' : ''}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
