// Repertoire: complete pieces built from the guide's chords, textures and melody format,
// plus a converter that turns a built sequence into ABC notation for the score view.
import {
  buildSeq,
  chordName,
  chordRoman,
  melodyMidi,
  parseChord,
  texture,
  type KeyDef,
  type MelNote,
  type Seq,
  type SeqEvent,
  type Texture,
} from './music'

export interface Part {
  name: string
  chords: string[] // one token per bar
  texture: Texture | Texture[] // an array cycles bar by bar
  melody?: MelNote[][]
  /** Right-hand chords. Off when the right hand carries the melody alone. */
  rh?: boolean
  /** How this part uses the guide, with the step it comes from. */
  how: string
}

export interface Piece {
  id: string
  title: string
  subtitle: string
  /** Where the melody comes from and what to listen for. */
  note: string
  beats: 3 | 4
  parts: Part[]
}

// ---------- 3/4 textures used by the pieces ----------

/** Flowing, folded into three beats: 1 5 8 10 8 5 under a held right-hand chord. */
export const WALTZ_FLOW: Texture = {
  id: 'waltz-flow',
  name: 'Flowing waltz',
  use: 'Flowing in three: the arpeggio climbs to the tenth and back within the bar.',
  beats: 3,
  lh: [0, 2, 3, 4, 3, 2].map((i, n) => ({
    t: n / 2,
    d: 0.5,
    idx: [i],
    label: ['1', '5', '8', '10', '8', '5'][n],
  })),
  rh: [{ t: 0, d: 3, idx: [], label: 'chord' }],
}

/** Still, in three: octave and chord held for the whole bar. */
export const WALTZ_STILL: Texture = {
  id: 'waltz-still',
  name: 'Still waltz',
  use: 'Endings.',
  beats: 3,
  lh: [{ t: 0, d: 3, idx: [0, 3], label: '1 + 8' }],
  rh: [{ t: 0, d: 3, idx: [], label: 'chord' }],
}

// ---------- pieces ----------

// Bizet's Menuet melody (1872, public domain), written in scale steps so it follows the key selector.
// In E♭: step 0 = E♭5, 4 = B♭5, 7 = E♭6, 9 = G6, -3 = B♭4, -6 = F4. A fourth value of 1 raises the note.
const THEME_1: MelNote[] = [[0, 1, 2], [1, 0.75, 2], [1.75, 0.25, 1], [2, 0.25, 0], [2.25, 0.25, 1], [2.5, 0.25, 2], [2.75, 0.25, 3]]
const THEME_3: MelNote[] = [[0, 1, 1], [1, 0.75, 1], [1.75, 0.25, 2], [2, 0.25, 1], [2.25, 0.25, 0], [2.5, 0.25, -1], [2.75, 0.25, -2]]
const THEME_5: MelNote[] = [[0, 1, 0], [1, 1, 0], [2, 0.25, 1], [2.25, 0.25, 0], [2.5, 0.25, -1], [2.75, 0.25, 0]]
const TURN: MelNote[] = [[2, 0.25, 1], [2.25, 0.25, 0, 1], [2.5, 0.25, 1], [2.75, 0.25, 2]] // F E♮ F G
const RUN_UP: MelNote[] = [[0, 0.25, 1], [0.25, 0.25, 2], [0.5, 0.25, 3], [0.75, 0.25, 4], [1, 1.25, 5], [2.25, 0.25, 4], [2.5, 0.25, 3], [2.75, 0.25, 2]]
const REPEATED_F: MelNote[] = [[0, 0.5, 1], [0.5, 0.5, 1], [1, 0.5, 1], [1.5, 0.5, 1], ...TURN]

export const MINUET: Piece = {
  id: 'bizet-minuet',
  title: 'Minuet',
  subtitle: "Georges Bizet, from L'Arlésienne Suite No. 2 · melody by Bizet, accompaniment from the nine steps",
  note: "The flute melody is Bizet's, unchanged and in the public domain. In the orchestra a harp accompanies it. Here a new left hand takes the harp's place, built only from the patterns in this guide. Bizet wrote it in E♭; the key selector moves it anywhere.",
  beats: 3,
  parts: [
    {
      name: 'Intro',
      chords: ['1', '1'],
      texture: WALTZ_FLOW,
      rh: false,
      how: "Two bars of I, left hand alone, standing in for the harp: Flowing in three, 1 5 8 10 8 5.",
    },
    {
      name: 'Theme',
      chords: ['1', '1', '5', '5', '6', '2:m7/4', '5:7', '1'],
      texture: WALTZ_FLOW,
      rh: false,
      melody: [
        THEME_1,
        [[0, 0.5, 4], [0.5, 0.5, 2], [1, 0.5, 7], [1.5, 0.5, 4], [2, 0.5, 9]],
        THEME_3,
        [[0, 0.5, -3], [0.5, 0.5, -1], [1, 0.5, 1], [1.5, 0.5, -1], [2, 0.5, 4]],
        THEME_5,
        [[0, 0.5, 1], [0.5, 0.5, 2], [1, 0.5, 3], [1.5, 0.5, 4], [2, 0.5, 5]],
        [[0, 1, 1], [1, 1, 1], ...TURN],
        [[0, 2, 0]],
      ],
      how: "Bizet's melody over Flowing in three. Four chords, I V vi ii, with the bass climbing 1 1 5 5 6 4 5 1. The raised note in bar 7's turn is a passing note, not a new chord.",
    },
    {
      name: 'Middle',
      chords: ['5', '1/5', '5:7', '1/5', '5', '1', '7:M', '3', '1:7', '4', '5:7', '1'],
      texture: texture('waltz'),
      rh: false,
      melody: [
        [[0, 0.5, 1], [0.5, 0.5, 2], [1, 1.5, 3], [2.5, 0.5, 1]],
        [[0, 0.5, 2], [0.5, 0.5, 3], [1, 1.5, 4], [2.5, 0.5, 2]],
        [[0, 0.5, 3], [0.5, 0.5, 4], [1, 1.5, 5], [2.5, 0.5, 6]],
        [[0, 0.5, 4], [0.5, 0.5, 7], [1, 0.5, 5], [1.5, 0.5, 4], [2, 0.5, 2], [2.5, 0.5, 0]],
        [[0, 0.5, 1], [0.5, 0.25, 1], [0.75, 0.25, 2], [1, 1.5, 3], [2.5, 0.5, 1]],
        [[0, 0.5, 2], [0.5, 0.25, 2], [0.75, 0.25, 3], [1, 1.5, 4], [2.5, 0.5, 2]],
        [[0, 0.5, 3, 1], [0.5, 0.25, 3, 1], [0.75, 0.25, 4], [1, 1.5, 5], [2.5, 0.5, 3, 1]],
        [[0, 0.5, 6], [0.5, 0.5, 5], [1, 0.5, 4, 1], [1.5, 0.5, 4], [2, 0.5, 3, 1], [2.5, 0.5, 3]],
        [[0, 0.5, 2], [0.5, 0.5, 2], [1, 0.5, 2], [1.5, 0.5, 2], [2, 0.25, 3], [2.25, 0.25, 2], [2.5, 0.25, 1], [2.75, 0.25, 2]],
        [[0, 0.25, 3], [0.25, 0.25, 4], [0.5, 0.25, 3], [0.75, 0.25, 4], [1, 1.25, 5], [2.25, 0.25, 4], [2.5, 0.25, 3], [2.75, 0.25, 2]],
        REPEATED_F,
        [[0, 1.5, 0]],
      ],
      how: "The one change: the left hand switches to the Waltz pattern. The harmony moves further from home, with VII leading to iii and I7 leading to IV, while the melody climbs and then slides down chromatically over iii.",
    },
    {
      name: 'Return',
      chords: ['1', '1', '5', '5', '6', '2:m7/4', '5:7', '1', '1', '1'],
      texture: [...Array(9).fill(WALTZ_FLOW), WALTZ_STILL],
      rh: false,
      melody: [
        THEME_1,
        [[0, 0.25, 4], [0.25, 0.25, 2], [0.5, 0.25, 4], [0.75, 0.25, 2], [1, 0.25, 7], [1.25, 0.25, 4], [1.5, 0.25, 7], [1.75, 0.25, 4], [2, 0.5, 9]],
        THEME_3,
        [[0, 0.25, -3], [0.25, 0.25, -6], [0.5, 0.25, -3], [0.75, 0.25, -1], [1, 0.25, 1], [1.25, 0.25, -1], [1.5, 0.25, 1], [1.75, 0.25, -1], [2, 0.5, 4]],
        THEME_5,
        RUN_UP,
        REPEATED_F,
        [[0, 2, 0], [2, 1, 2]],
        [[0, 2, 4], [2, 1, 2]],
        [[0, 3, 7]],
      ],
      how: "The theme returns in Bizet's ornamented version, with eighths turned into sixteenth-note arpeggios, and Flowing comes back in the left hand. The last three bars stay on I while the melody climbs the chord, 1 3 5 8, and the final bar is held still under the pedal.",
    },
  ],
}

export const PIECES: Piece[] = [MINUET]

// ---------- building ----------

export interface PieceSeq extends Seq {
  chords: string[] // one per bar, across the whole piece
  parts: { start: number; name: string }[] // bar index where each built part begins
}

const TOP = 91 // G6, the top of the on-screen keyboard

/** Drop the melody an octave in keys where it would run off the top of the keyboard. */
function melodyShift(piece: Piece, key: KeyDef): number {
  const top = Math.max(
    ...piece.parts.flatMap((p) => (p.melody ?? []).flat().map(([, , step, alt = 0]) => melodyMidi(step, key) + alt)),
  )
  return top > TOP ? -12 : 0
}

/** Options for building a partial version of a piece, e.g. melody alone or block chords. */
export interface BuildOpts {
  melody?: boolean
  lh?: boolean
  rh?: boolean
  texture?: Texture | Texture[]
}

/** Build the whole piece, or only some parts, as one sequence. */
export function buildPiece(piece: Piece, key: KeyDef, only?: number[], opts: BuildOpts = {}): PieceSeq {
  const out: PieceSeq = { events: [], marks: [], total: 0, chords: [], parts: [] }
  const shift = melodyShift(piece, key)
  piece.parts.forEach((part, i) => {
    if (only && !only.includes(i)) return
    const seq = buildSeq({
      key,
      chords: part.chords,
      texture: opts.texture ?? part.texture,
      melody: opts.melody === false ? undefined : part.melody,
      lh: opts.lh,
      rh: opts.rh ?? part.rh !== false,
    })
    const bar0 = out.chords.length
    out.parts.push({ start: bar0, name: part.name })
    out.events.push(
      ...seq.events.map((e) => ({ ...e, t: e.t + out.total, midi: e.hand === 'mel' ? e.midi + shift : e.midi })),
    )
    out.marks.push(...seq.marks.map((m) => ({ t: m.t + out.total, bar: m.bar + bar0 })))
    out.chords.push(...part.chords)
    out.total += seq.total
  })
  return out
}

// ---------- ABC notation ----------

const LETTERS = 'CDEFGAB'
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11]
const MAJOR = [0, 2, 4, 5, 7, 9, 11]
const mod = (n: number, m: number) => ((n % m) + m) % m
const signed = (n: number) => mod(n + 6, 12) - 6 // semitones as -6..5
/** Semitones above a chord's root → how many letters above the root the note is written. */
const LETTER_STEPS = [0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6]

const ascii = (s: string) => s.replaceAll('♭', 'b').replaceAll('♯', '#')
const abcKey = (key: KeyDef) => ascii(key.name)

/** The scale degree (0–6) a chord note is written on: counted in letters from the chord's root,
 *  so D major in E♭ spells F♯ rather than G♭. */
function chordDegree(midi: number, token: string, key: KeyDef): number {
  const c = parseChord(token)
  const root = key.pc + MAJOR[c.deg - 1]
  return mod(c.deg - 1 + LETTER_STEPS[mod(midi - root, 12)], 7)
}

/** One pitch in ABC, written on the given scale degree, with an accidental only where it differs
 *  from the key signature. */
function abcPitch(midi: number, key: KeyDef, deg: number): string {
  const letter = mod(LETTERS.indexOf(key.name[0]) + deg, 7)
  const natural = LETTER_PC[letter]
  const alt = signed(midi - natural)
  const keyAlt = signed(key.pc + MAJOR[deg] - natural)
  const octave = (midi - alt - natural) / 12 - 1
  const prefix = alt === keyAlt ? '' : alt === 0 ? '=' : alt > 0 ? '^'.repeat(alt) : '_'.repeat(-alt)
  const name = LETTERS[letter]
  return prefix + (octave >= 5 ? name.toLowerCase() + "'".repeat(octave - 5) : name + ','.repeat(4 - octave))
}

const LENGTHS = [16, 12, 8, 6, 4, 3, 2, 1] // in sixteenths

/** Split a length in sixteenths into writable note values. */
function split(len: number, beats: number): number[] {
  const out: number[] = []
  for (const l of LENGTHS) {
    if (l > beats * 4) continue
    while (len >= l) {
      out.push(l)
      len -= l
    }
  }
  return out
}

interface Tok {
  text: string
  pos: number // start, in sixteenths from the bar line
  len: number
}

/** One voice for one bar: chords of simultaneous notes, gaps filled with rests. A bar where the voice is
 *  silent becomes `empty` (an invisible spacer for the upper voices). */
function voiceBar(evs: SeqEvent[], start: number, beats: number, key: KeyDef, token: string, empty: 'z' | 'x'): Tok[] {
  const barLen = beats * 4
  if (!evs.length) return [{ text: empty + barLen, pos: 0, len: barLen }]
  const rest = 'z'
  const groups = new Map<number, SeqEvent[]>()
  for (const e of evs) {
    if (Math.round(e.d * 4) === 0) continue
    const at = Math.round((e.t - start) * 4)
    groups.set(at, [...(groups.get(at) ?? []), e])
  }
  const onsets = [...groups.keys()].sort((a, b) => a - b)
  const toks: Tok[] = []
  let pos = 0
  const pushRest = (until: number) => {
    for (const l of split(until - pos, beats)) {
      toks.push({ text: rest + l, pos, len: l })
      pos += l
    }
  }
  onsets.forEach((at, i) => {
    if (at > pos) pushRest(at)
    const group = groups.get(at)!
    const next = onsets[i + 1] ?? barLen
    const len = Math.min(Math.max(...group.map((e) => Math.round(e.d * 4))), next - at, barLen - at)
    const notes = [...new Map(group.map((e) => [e.midi, e])).values()].sort((a, b) => a.midi - b.midi)
    const pitches = notes.map((e) => abcPitch(e.midi, key, e.deg ?? chordDegree(e.midi, token, key)))
    const pitch = pitches.length > 1 ? `[${pitches.join('')}]` : pitches[0]
    const parts = split(len, beats)
    parts.forEach((l, j) => {
      toks.push({ text: pitch + l + (j < parts.length - 1 ? '-' : ''), pos, len: l })
      pos += l
    })
  })
  if (pos < barLen) pushRest(barLen)
  return toks
}

/** Join tokens, beaming eighths and sixteenths that share a beat. */
function joinBar(toks: Tok[]): string {
  return toks
    .map((t, i) => {
      const prev = toks[i - 1]
      const beam = prev && prev.len < 4 && t.len < 4 && Math.floor(prev.pos / 4) === Math.floor(t.pos / 4)
      return (i === 0 || beam ? '' : ' ') + t.text
    })
    .join('')
}

const quote = (s: string) => s.replace(/"/g, '')

/** Grand-staff ABC: voice 1 melody (stems up), voice 2 right-hand chords, voice 3 left hand. */
export function pieceAbc(beats: number, seq: PieceSeq, key: KeyDef): string {
  const lines = { mel: [] as string[], rh: [] as string[], lh: [] as string[] }
  seq.marks.forEach(({ t: start, bar }) => {
    const inBar = seq.events.filter((e) => e.t >= start - 1e-6 && e.t < start + beats - 1e-6)
    const token = seq.chords[bar]
    const part = seq.parts.length > 1 ? seq.parts.find((p) => p.start === bar) : undefined
    const partLabel = part ? `"^${quote(part.name)}"` : ''
    const chordSym = `"${quote(ascii(chordName(token, key)))}"`
    const roman = `"_${quote(chordRoman(token))}"`
    const voice = (hand: SeqEvent['hand'], rest: 'z' | 'x') =>
      joinBar(voiceBar(inBar.filter((e) => e.hand === hand), start, beats, key, token, rest))
    lines.mel.push(partLabel + chordSym + voice('mel', 'x'))
    lines.rh.push(voice('rh', 'x'))
    lines.lh.push(roman + voice('lh', 'z'))
  })
  const body = (v: string[]) => v.join(' | ') + ' |]'
  return [
    'X:1',
    `M:${beats}/4`,
    'L:1/16',
    '%%score {(1 2) | 3}',
    `K:${abcKey(key)}`,
    'V:1 clef=treble',
    'V:2 clef=treble',
    'V:3 clef=bass',
    `[V:1] ${body(lines.mel)}`,
    `[V:2] ${body(lines.rh)}`,
    `[V:3] ${body(lines.lh)}`,
  ].join('\n')
}
