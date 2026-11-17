import { useMemo, type ReactNode } from 'react'
import { BeatGrid, ChordChip, P, Panel, PlayButton, Tip, useSeqPlay } from '@/components/kit'
import { Score } from '@/components/Score'
import {
  chordDegrees,
  chordName,
  chordRoman,
  melodyMidi,
  noteName,
  scaleNames,
  texture,
  type KeyDef,
} from '@/lib/music'
import {
  buildPiece,
  MINUET,
  pieceAbc,
  WALTZ_FLOW,
  WALTZ_STILL,
  type BuildOpts,
  type Piece,
  type PieceSeq,
} from '@/lib/repertoire'
import { useKey } from '@/lib/player'
import { SECTIONS } from '@/sections'
import { cn } from '@/lib/utils'

const toAbc = (seq: PieceSeq, key: KeyDef) => pieceAbc(MINUET.beats, seq, key)

export function Repertoire() {
  return (
    <section id="repertoire" className="border-t border-border py-12 sm:py-16">
      <header className="mb-6">
        <p className="font-heading text-sm font-bold tracking-widest text-mel-ink uppercase">Repertoire</p>
        <h2 className="mt-1 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">Pieces to play</h2>
        <p className="mt-2 max-w-[60ch] text-lg text-muted-foreground">
          Real pieces arranged with the nine steps, shown as a full score and then taken apart one step at a time.
          Everything plays on the keyboard below and follows the key you choose.
        </p>
      </header>
      <PieceView piece={MINUET} />
    </section>
  )
}

// ---------- the piece: header and full score ----------

function PieceView({ piece }: { piece: Piece }) {
  const key = useKey()
  const whole = useSeqPlay(piece.id, piece.title, (k) => buildPiece(piece, k))
  const seq = useMemo(() => buildPiece(piece, key), [piece, key])
  const abc = useMemo(() => toAbc(seq, key), [seq, key])

  const legend: [string, string][] = [
    ['bg-mel', 'Melody'],
    ['bg-rh', 'Right-hand chord'],
    ['bg-lh', 'Left hand'],
  ]

  return (
    <article className="space-y-8">
      <Panel className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold">{piece.title}</h3>
            <p className="text-muted-foreground">
              {piece.subtitle} · {seq.chords.length} bars · key of {key.name}
            </p>
          </div>
          <PlayButton playing={whole.playing} onClick={whole.toggle} className="h-11 px-5 text-base">
            {whole.playing ? 'Stop' : 'Play the piece'}
          </PlayButton>
        </div>
        <Tip>{piece.note}</Tip>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {legend.map(([swatch, label]) => (
            <li key={label} className="flex items-center gap-1.5">
              <span className={cn('size-2.5 rounded-full', swatch)} />
              {label}
            </li>
          ))}
        </ul>
        <ScoreBox abc={abc} bar={whole.bar} />
      </Panel>

      <div>
        <h3 className="text-2xl font-bold">How it is built, step by step</h3>
        <p className="mt-1 max-w-[60ch] text-muted-foreground">
          The same order you would follow for any song. Each step names the part of the guide it comes from.
        </p>
      </div>
      <MinuetLesson piece={piece} />
    </article>
  )
}

function ScoreBox({ abc, bar }: { abc: string; bar: number }) {
  return (
    <div className="-mx-1 overflow-x-auto rounded-lg bg-white px-1 py-2">
      <Score abc={abc} bar={bar} />
    </div>
  )
}

// ---------- lesson building blocks ----------

function guideTitle(id: string) {
  const i = SECTIONS.findIndex((s) => s.id === id)
  return `Step ${i + 1} · ${SECTIONS[i].title}`
}

function LessonStep(props: { n: number; title: string; guide: string[]; children: ReactNode }) {
  return (
    <li>
      <Panel className="space-y-4">
        <header className="flex items-start gap-3">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-pine font-heading font-bold text-mel"
          >
            {props.n}
          </span>
          <div>
            <h4 className="text-xl leading-tight font-bold">{props.title}</h4>
            <p className="mt-1 flex flex-wrap gap-x-3 text-sm">
              {props.guide.map((id) => (
                <a key={id} href={`#${id}`} className="text-muted-foreground underline underline-offset-2">
                  {guideTitle(id)}
                </a>
              ))}
            </p>
          </div>
        </header>
        <div className="space-y-4">{props.children}</div>
      </Panel>
    </li>
  )
}

/** A playable slice of the piece: chord chips light up bar by bar, with an optional score. */
function Demo(props: { id: string; label: string; parts: number[]; opts?: BuildOpts; button: string; score?: boolean }) {
  const { parts, opts, score } = props
  const { playing, bar, toggle, key } = useSeqPlay(`lesson-${props.id}`, props.label, (k) =>
    buildPiece(MINUET, k, parts, opts),
  )
  const seq = useMemo(() => buildPiece(MINUET, key, parts, opts), [key, parts, opts])
  const abc = useMemo(() => (score ? toAbc(seq, key) : ''), [score, seq, key])
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {seq.chords.map((token, i) => (
          <ChordChip key={i} token={token} active={playing && bar === i} />
        ))}
      </div>
      <PlayButton playing={playing} onClick={toggle} variant="outline">
        {playing ? 'Stop' : props.button}
      </PlayButton>
      {score && <ScoreBox abc={abc} bar={playing ? bar : -1} />}
    </div>
  )
}

// Module-level so the Demo memo keys stay stable.
const THEME = [1]
const MIDDLE = [2]
const THEME_AND_MIDDLE = [1, 2]
const ALL = [0, 1, 2, 3]
const MELODY_ONLY: BuildOpts = { lh: false, rh: false, texture: WALTZ_STILL }
const BLOCK_CHORDS: BuildOpts = { texture: WALTZ_STILL, rh: true }
const CHORDS_ONLY: BuildOpts = { melody: false, texture: WALTZ_STILL, rh: true }
const LH_ONLY: BuildOpts = { melody: false, rh: false }

/** The note on beat 1 of each bar, next to the chord chosen for it. */
function BeatOneTable({ part, k }: { part: number; k: KeyDef }) {
  const p = MINUET.parts[part]
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      {p.chords.map((token, i) => {
        const first = p.melody?.[i]?.find(([t]) => t === 0)
        const step = first?.[2] ?? 0
        const fits = !!first && chordDegrees(token).includes(((step % 7) + 7) % 7)
        return (
          <div key={i} className="rounded-lg border border-border px-2 py-1.5 text-center">
            <div className="text-xs text-muted-foreground">bar {i + 1}</div>
            <div className="font-heading text-lg font-bold text-mel-ink">
              {first ? noteName(melodyMidi(step, k) + (first[3] ?? 0), k) : '–'}
            </div>
            <div className="text-xs text-muted-foreground">{chordRoman(token)}</div>
            <div className="text-sm font-semibold whitespace-nowrap">
              {chordName(token, k)}
              {fits && <span className="ml-1 text-muted-foreground">✓</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------- the Minuet lesson ----------

function MinuetLesson({ piece }: { piece: Piece }) {
  const key = useKey()
  const n = scaleNames(key)
  const chord = (t: string) => <b>{chordName(t, key)}</b>
  const barRange = (i: number) => {
    const start = piece.parts.slice(0, i).reduce((a, p) => a + p.chords.length, 0)
    return `bars ${start + 1}–${start + piece.parts[i].chords.length}`
  }
  return (
    <ol className="space-y-4">
      <LessonStep n={1} title="Listen first: the key and the beat" guide={['harmonise']}>
        <P>
          Start with the melody alone. It counts in three, so it belongs with the waltz patterns. Its last note is{' '}
          <b>{n[0]}</b>, and a melody's last note is almost always 1. So the key is {key.name} major, {n[0]} is 1, and
          every chord below is numbered from it.
        </P>
        <Demo id="melody" label="Minuet: theme, melody alone" parts={THEME} opts={MELODY_ONLY} button="Melody alone" />
      </LessonStep>

      <LessonStep n={2} title="Find the chords from beat 1" guide={['harmonise']}>
        <P>
          Go one bar at a time, read the note on beat 1, and pick a chord that contains it. Bars 1–2 spell out {n[0]},{' '}
          {n[2]} and {n[4]}, so the chord is I. Bars 3–4 spell {n[4]}, {n[6]} and {n[1]}, so the chord is V. Bar 5
          starts on {n[0]}, which fits I or vi. vi is better because it avoids going straight back to I. Bar 6 starts on{' '}
          {n[1]}, which fits V or ii. ii7 is better because V comes next, and with {n[3]} in the bass the bass line
          keeps climbing. Bar 7 is V7, so the phrase lands on I.
        </P>
        <BeatOneTable part={1} k={key} />
        <P>Before adding any pattern, play the melody over plain held chords. If this sounds right, the harmony is right.</P>
        <Demo
          id="block"
          label="Minuet: theme over held chords"
          parts={THEME}
          opts={BLOCK_CHORDS}
          button="Melody over held chords"
          score
        />
      </LessonStep>

      <LessonStep n={3} title="Read it as numbers" guide={['numbers', 'progressions']}>
        <P>
          The theme is I I V V vi ii7 V7 I. That is only four chords: I and V, plus their minor partners vi and ii. It
          ends with the ii–V–I cadence. Tap any chip to hear it. Once you hear the numbers, you can play it in any key
          from the selector below.
        </P>
        <Demo id="numbers" label="Minuet: theme chords" parts={THEME} opts={CHORDS_ONLY} button="Chords only" />
      </LessonStep>

      <LessonStep n={4} title="Spot the colour chords" guide={['colour']}>
        <P>
          Three chords go beyond the basic six. In the theme, {chord('2:m7/4')} is ii7 with 4 in the bass, a slash chord.
          It keeps the bass climbing 1 1 5 5 6 4 5 1 instead of jumping. The middle section adds two borrowed
          dominants. {chord('7:M')} pulls to {chord('3')}, the same way III7 pulls to vi. {chord('1:7')} pulls to{' '}
          {chord('4')}. Over {chord('3')} the melody slides down by half steps, which the score shows with naturals.
        </P>
        <Demo id="colour" label="Minuet: middle chords" parts={MIDDLE} opts={CHORDS_ONLY} button="Middle chords" />
      </LessonStep>

      <LessonStep n={5} title="Choose the left-hand patterns" guide={['left-hand']}>
        <P>
          In the orchestra a harp plays here, and Flowing in three is the closest piano pattern: 1 5 8 10 8 5, climbing
          to the tenth and back each bar. It goes under the theme. For the middle the left hand switches to the Waltz
          pattern, bass on 1 and chord on 2 and 3, which sounds more like dancing. Learn the left hand alone first.
        </P>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h5 className="font-heading font-bold">Theme · Flowing in three</h5>
            <BeatGrid tex={WALTZ_FLOW} />
          </div>
          <div className="space-y-2">
            <h5 className="font-heading font-bold">Middle · Waltz</h5>
            <BeatGrid tex={texture('waltz')} />
          </div>
        </div>
        <Demo id="lh" label="Minuet: left hand alone" parts={THEME_AND_MIDDLE} opts={LH_ONLY} button="Left hand alone" />
      </LessonStep>

      <LessonStep n={6} title="Right hand: the melody, nothing else" guide={['right-hand']}>
        <P>
          The left-hand pattern already plays root, fifth and tenth, so the right hand keeps to the melody. The theme
          runs from {n[4]} up to the high {n[2]} at the end of bar 2, an octave and a sixth. Practise the sixteenth-note
          runs in bars 1, 3 and 5 slowly, and keep them light and even. Once the melody is secure, add one chord note
          below it on beat 1 of each bar, as in step 5, for a fuller sound.
        </P>
        <Demo id="hands" label="Minuet: theme, hands together" parts={THEME} button="Hands together" />
      </LessonStep>

      <LessonStep n={7} title="Arrange the whole piece" guide={['arrange']}>
        <P>
          The arrangement keeps Bizet's outline: theme, a contrasting middle, then the theme again. The A♭ trio is left
          out. Each section changes one thing:
        </P>
        <ol className="space-y-2">
          {piece.parts.map((part, i) => (
            <li key={part.name} className="rounded-lg border border-border p-3">
              <div className="flex items-baseline justify-between gap-3">
                <h5 className="font-heading font-bold">{part.name}</h5>
                <span className="text-sm text-muted-foreground">{barRange(i)}</span>
              </div>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-foreground/85">{part.how}</p>
            </li>
          ))}
        </ol>
        <Demo id="all" label="Minuet: the whole piece" parts={ALL} button="Play it all" />
      </LessonStep>

      <LessonStep n={8} title="Practise it" guide={['practice']}>
        <ol className="max-w-[66ch] list-decimal space-y-2 pl-5 leading-relaxed marker:font-semibold">
          <li>Left hand alone, both patterns, until it runs without looking.</li>
          <li>Melody alone, with the tempo in the bar below set to about 60.</li>
          <li>Hands together one section at a time: theme, then middle, then the return.</li>
          <li>The whole piece at around 76, changing the pedal on every bar.</li>
          <li>Switch the key to F or B♭ and read the score again. The numbers stay the same.</li>
        </ol>
      </LessonStep>
    </ol>
  )
}
