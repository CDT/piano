// Small music-theory core: keys, chords by scale degree, voicings, textures, sequences.

export type Hand = 'lh' | 'rh' | 'mel'

export interface KeyDef {
  name: string
  pc: number
}

export const KEYS: KeyDef[] = [
  { name: 'C', pc: 0 },
  { name: 'G', pc: 7 },
  { name: 'D', pc: 2 },
  { name: 'A', pc: 9 },
  { name: 'F', pc: 5 },
  { name: 'B♭', pc: 10 },
  { name: 'E♭', pc: 3 },
]

const LETTERS = 'CDEFGAB'
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11]
const MAJOR = [0, 2, 4, 5, 7, 9, 11]
const mod = (n: number, m: number) => ((n % m) + m) % m

/** Names of the seven scale notes, spelled correctly for the key. */
export function scaleNames(key: KeyDef): string[] {
  const start = LETTERS.indexOf(key.name[0])
  return MAJOR.map((semi, i) => {
    const letter = (start + i) % 7
    const diff = mod(key.pc + semi - LETTER_PC[letter], 12)
    return LETTERS[letter] + (diff === 1 ? '♯' : diff === 11 ? '♭' : '')
  })
}

const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']

export function noteName(midi: number, key: KeyDef): string {
  const pc = mod(midi, 12)
  const degree = MAJOR.indexOf(mod(pc - key.pc, 12))
  if (degree >= 0) return scaleNames(key)[degree]
  const flatKey = key.name.includes('♭') || key.name === 'F'
  return (flatKey ? FLAT_NAMES : SHARP_NAMES)[pc]
}

// ---------- chords ----------

export type Quality = 'M' | 'm' | 'dim' | '7' | 'maj7' | 'm7' | 'sus2' | 'sus4' | 'add9'

const DIATONIC: Quality[] = ['M', 'm', 'm', 'M', 'M', 'm', 'dim']
const INTERVALS: Record<Quality, number[]> = {
  M: [0, 4, 7],
  m: [0, 3, 7],
  dim: [0, 3, 6],
  '7': [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  add9: [0, 4, 7, 14],
}
const NAME_SUFFIX: Record<Quality, string> = {
  M: '', m: 'm', dim: 'dim', '7': '7', maj7: 'maj7', m7: 'm7', sus2: 'sus2', sus4: 'sus4', add9: 'add9',
}
const ROMAN_SUFFIX: Record<Quality, string> = {
  M: '', m: '', dim: '°', '7': '7', maj7: 'maj7', m7: '7', sus2: 'sus2', sus4: 'sus4', add9: 'add9',
}
const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

export interface Chord {
  deg: number // 1–7
  quality: Quality
  bass?: number // scale degree in the bass, for slash chords
}

/** Token grammar: `degree[:quality][/bassDegree]`, e.g. "1", "6:m7", "5/7", "3:7". */
export function parseChord(token: string): Chord {
  const [head, bass] = token.split('/')
  const [deg, quality] = head.split(':')
  const d = Number(deg)
  return {
    deg: d,
    quality: (quality as Quality) ?? DIATONIC[d - 1],
    bass: bass ? Number(bass) : undefined,
  }
}

export function chordName(token: string, key: KeyDef): string {
  const c = parseChord(token)
  const names = scaleNames(key)
  return names[c.deg - 1] + NAME_SUFFIX[c.quality] + (c.bass ? '/' + names[c.bass - 1] : '')
}

export function chordRoman(token: string): string {
  const c = parseChord(token)
  const minor = c.quality === 'm' || c.quality === 'm7' || c.quality === 'dim'
  const numeral = minor ? NUMERALS[c.deg - 1].toLowerCase() : NUMERALS[c.deg - 1]
  return numeral + ROMAN_SUFFIX[c.quality] + (c.bass ? '/' + c.bass : '')
}

const rootPc = (c: Chord, key: KeyDef) => mod(key.pc + MAJOR[c.deg - 1], 12)

/** Left-hand ladder: the bass note, then chord tones climbing above it (1, 3, 5, 8, 10, 12). */
export function lhLadder(token: string, key: KeyDef): number[] {
  const c = parseChord(token)
  const root = rootPc(c, key)
  const triad = INTERVALS[c.quality].slice(0, 3).map((i) => mod(root + i, 12))
  const bassPc = c.bass ? mod(key.pc + MAJOR[c.bass - 1], 12) : root
  const bass = 36 + bassPc
  const ladder = [bass]
  for (let m = bass + 1; ladder.length < 6; m++) {
    if (triad.includes(mod(m, 12))) ladder.push(m)
  }
  return ladder
}

/** Right-hand voicing: every chord tone folded into one octave around middle C,
 *  which gives nearest-inversion voice leading for free. */
export function rhVoicing(token: string, key: KeyDef): number[] {
  const c = parseChord(token)
  const root = rootPc(c, key)
  return INTERVALS[c.quality]
    .map((i) => 57 + mod(root + i - 57, 12))
    .sort((a, b) => a - b)
}

/** Root-position voicing, for showing what jumping around sounds like. */
export function rhRootPosition(token: string, key: KeyDef): number[] {
  const c = parseChord(token)
  const root = 60 + mod(rootPc(c, key) - 60, 12)
  return INTERVALS[c.quality].map((i) => root + i)
}

/** Scale degrees (0–6) contained in a chord, for melody-fit checks. */
export function chordDegrees(token: string): number[] {
  const c = parseChord(token)
  return [0, 2, 4].map((s) => mod(c.deg - 1 + s, 7))
}

// ---------- textures (accompaniment patterns) ----------

interface Hit {
  t: number // beat within the bar
  d: number // length in beats
  idx: number[] // indices into the ladder (LH) or voicing (RH); [] = whole chord
  label: string
}

export interface Texture {
  id: string
  name: string
  use: string
  beats: 3 | 4
  lh: Hit[]
  rh: Hit[]
}

const eighths = (idx: number[], labels: string[]): Hit[] =>
  idx.map((i, n) => ({ t: n / 2, d: 0.5, idx: [i], label: labels[n] }))
const chordOn = (beats: number[], d: number): Hit[] =>
  beats.map((t) => ({ t, d, idx: [], label: 'chord' }))

export const TEXTURES: Texture[] = [
  {
    id: 'still',
    name: 'Still',
    use: 'Intros, first verses, anything quiet. One octave in the left hand, one chord in the right, held for the bar.',
    beats: 4,
    lh: [{ t: 0, d: 4, idx: [0, 3], label: '1 + 8' }],
    rh: chordOn([0], 4),
  },
  {
    id: 'ballad',
    name: 'Ballad',
    use: 'The default for slow songs. Left hand rocks root, fifth, octave in eighth notes.',
    beats: 4,
    lh: eighths([0, 2, 3, 2, 0, 2, 3, 2], ['1', '5', '8', '5', '1', '5', '8', '5']),
    rh: chordOn([0], 4),
  },
  {
    id: 'flowing',
    name: 'Flowing',
    use: 'The Ghibli sound. The arpeggio climbs past the octave to the tenth and comes back, all under one pedal.',
    beats: 4,
    lh: eighths([0, 2, 3, 4, 5, 4, 3, 2], ['1', '5', '8', '10', '12', '10', '8', '5']),
    rh: chordOn([0], 4),
  },
  {
    id: 'heartbeat',
    name: 'Heartbeat',
    use: 'Pre-choruses and gentle choruses. Right hand repeats the chord on every beat while the left holds octaves.',
    beats: 4,
    lh: [
      { t: 0, d: 2, idx: [0, 3], label: '1 + 8' },
      { t: 2, d: 2, idx: [0, 3], label: '1 + 8' },
    ],
    rh: chordOn([0, 1, 2, 3], 1),
  },
  {
    id: 'groove',
    name: 'Groove',
    use: 'Up-tempo choruses. Left hand plays the 3 + 3 + 2 pop rhythm against steady right-hand beats.',
    beats: 4,
    lh: [
      { t: 0, d: 1.5, idx: [0, 3], label: '1 + 8' },
      { t: 1.5, d: 1.5, idx: [0, 3], label: '1 + 8' },
      { t: 3, d: 1, idx: [0, 3], label: '1 + 8' },
    ],
    rh: chordOn([0, 1, 2, 3], 1),
  },
  {
    id: 'broken',
    name: 'Broken',
    use: 'Canon and other classical-flavoured pieces. The right hand ripples through the chord over a held bass.',
    beats: 4,
    lh: [{ t: 0, d: 4, idx: [0, 3], label: '1 + 8' }],
    rh: [0, 1, 2, 1, 0, 1, 2, 1].map((i, n) => ({
      t: n / 2,
      d: 0.5,
      idx: [i],
      label: ['low', 'mid', 'top', 'mid'][n % 4],
    })),
  },
  {
    id: 'waltz',
    name: 'Waltz',
    use: 'Songs in 3/4, which Ghibli scores love. Bass note on one, the chord on two and three.',
    beats: 3,
    lh: [
      { t: 0, d: 1, idx: [0], label: '1' },
      { t: 1, d: 1, idx: [3, 4, 5], label: 'chord' },
      { t: 2, d: 1, idx: [3, 4, 5], label: 'chord' },
    ],
    rh: chordOn([0], 3),
  },
]

export const texture = (id: string) => TEXTURES.find((t) => t.id === id)!

// ---------- sequences ----------

/** Melody note: [beat in bar, length in beats, scale step]. Step 0 = tonic, 7 = tonic an octave up. */
export type MelNote = [number, number, number]

export interface SeqEvent {
  t: number
  d: number
  midi: number
  hand: Hand
  vel: number
}

export interface Seq {
  events: SeqEvent[]
  marks: { t: number; bar: number }[]
  total: number
}

export function melodyMidi(step: number, key: KeyDef): number {
  const tonic = 66 + mod(key.pc - 66, 12)
  return tonic + 12 * Math.floor(step / 7) + MAJOR[mod(step, 7)]
}

export function buildSeq(o: {
  key: KeyDef
  chords: string[]
  texture?: Texture | Texture[]
  melody?: MelNote[][]
  lh?: boolean
  rh?: boolean
  voicing?: (token: string, key: KeyDef) => number[]
}): Seq {
  const bars = Math.max(o.chords.length, o.melody?.length ?? 0)
  const events: SeqEvent[] = []
  const marks: Seq['marks'] = []
  const voice = o.voicing ?? rhVoicing
  let at = 0
  for (let bar = 0; bar < bars; bar++) {
    const token = o.chords[bar % o.chords.length]
    const tex = Array.isArray(o.texture) ? o.texture[bar % o.texture.length] : o.texture
    marks.push({ t: at, bar })
    if (tex && o.lh !== false) {
      const ladder = lhLadder(token, o.key)
      for (const h of tex.lh)
        for (const i of h.idx)
          events.push({ t: at + h.t, d: h.d, midi: ladder[i], hand: 'lh', vel: 0.5 })
    }
    if (tex && o.rh !== false) {
      const notes = voice(token, o.key)
      for (const h of tex.rh) {
        const picked = h.idx.length ? h.idx.map((i) => notes[Math.min(i, notes.length - 1)]) : notes
        for (const midi of picked)
          events.push({ t: at + h.t, d: h.d, midi, hand: 'rh', vel: o.melody ? 0.28 : 0.4 })
      }
    }
    for (const [t, d, step] of o.melody?.[bar] ?? [])
      events.push({ t: at + t, d, midi: melodyMidi(step, o.key), hand: 'mel', vel: 0.8 })
    at += tex?.beats ?? 4
  }
  events.sort((a, b) => a.t - b.t)
  return { events, marks, total: at }
}

// ---------- the practice tune used across the guide (original, eight bars) ----------

export const TUNE: MelNote[][] = [
  [[0, 1, 2], [1, 0.5, 2], [1.5, 0.5, 3], [2, 2, 4]],
  [[0, 1, 4], [1, 0.5, 3], [1.5, 0.5, 2], [2, 2, 1]],
  [[0, 1, 0], [1, 0.5, 0], [1.5, 0.5, 1], [2, 2, 2]],
  [[0, 1, 3], [1, 0.5, 2], [1.5, 0.5, 1], [2, 2, 0]],
  [[0, 1, 2], [1, 1, 4], [2, 2, 7]],
  [[0, 1, 5], [1, 0.5, 5], [1.5, 0.5, 4], [2, 2, 3]],
  [[0, 1, 4], [1, 0.5, 4], [1.5, 0.5, 3], [2, 2, 1]],
  [[0, 4, 0]],
]

export const TUNE_CHORDS = ['1', '5', '6', '4', '1', '4', '5', '1']

/** Scale degrees (0–6) sounding on beats 1 and 3 of a bar. */
export function strongDegrees(bar: MelNote[]): number[] {
  return [0, 2]
    .map((beat) => bar.find(([t, d]) => t <= beat && beat < t + d))
    .filter((n): n is MelNote => !!n)
    .map(([, , step]) => mod(step, 7))
}
