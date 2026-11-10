import type { ReactNode } from 'react'
import { Play, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  buildSeq,
  chordName,
  chordRoman,
  lhLadder,
  rhVoicing,
  texture,
  type KeyDef,
  type Seq,
  type Texture,
} from '@/lib/music'
import { play, stop, strike, useKey, usePlayer } from '@/lib/player'

// ---------- page structure ----------

export function Section(props: { id: string; n: number; title: string; lede: string; children: ReactNode }) {
  return (
    <section id={props.id} className="border-t border-border py-12 sm:py-16">
      <header className="mb-6 flex items-start gap-4">
        {/* The step number sits on a black key. */}
        <span
          aria-hidden
          className="mt-1 flex h-14 w-8 shrink-0 items-end justify-center rounded-b-md bg-pine pb-1.5 font-heading text-lg font-bold text-mel"
        >
          {props.n}
        </span>
        <div>
          <h2 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">{props.title}</h2>
          <p className="mt-2 max-w-[60ch] text-lg text-muted-foreground">{props.lede}</p>
        </div>
      </header>
      <div className="space-y-6">{props.children}</div>
    </section>
  )
}

export function P({ children }: { children: ReactNode }) {
  return <p className="max-w-[66ch] leading-relaxed">{children}</p>
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-xl border border-border bg-card p-4 sm:p-5', className)}>{children}</div>
}

export function Tip({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-[66ch] border-l-4 border-mel py-1 pl-4 leading-relaxed text-foreground/85">{children}</p>
  )
}

// ---------- playback ----------

export function useSeqPlay(id: string, label: string, build: (key: KeyDef) => Seq) {
  const key = useKey()
  const playing = usePlayer((s) => s.playingId === id)
  const bar = usePlayer((s) => (s.playingId === id ? s.bar : -1))
  const toggle = () => (playing ? stop() : play(id, label, build(key)))
  return { playing, bar, toggle, key }
}

export function PlayButton(props: {
  playing: boolean
  onClick: () => void
  children?: ReactNode
  variant?: 'default' | 'outline'
  className?: string
}) {
  return (
    <Button
      variant={props.variant ?? 'default'}
      onClick={props.onClick}
      aria-pressed={props.playing}
      className={cn('h-10 gap-2 px-4 text-sm', props.className)}
    >
      {props.playing ? <Square className="fill-current" /> : <Play className="fill-current" />}
      {props.children ?? (props.playing ? 'Stop' : 'Play')}
    </Button>
  )
}

/** One chord: numeral above, real name below. Tap to hear it. */
export function ChordChip(props: { token: string; active?: boolean; className?: string }) {
  const key = useKey()
  const hit = () =>
    strike([
      { midi: lhLadder(props.token, key)[0], hand: 'lh' },
      ...rhVoicing(props.token, key).map((midi) => ({ midi, hand: 'rh' as const })),
    ])
  return (
    <button
      type="button"
      onClick={hit}
      className={cn(
        'flex min-h-14 min-w-14 flex-col items-center justify-center rounded-lg border px-2.5 py-1.5 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        props.active
          ? 'border-pine bg-pine text-white'
          : 'border-border bg-card hover:border-pine/50 active:bg-secondary',
        props.className,
      )}
    >
      <span className={cn('text-xs font-medium', props.active ? 'text-mel' : 'text-muted-foreground')}>
        {chordRoman(props.token)}
      </span>
      <span className="font-heading text-lg leading-tight font-bold whitespace-nowrap">
        {chordName(props.token, key)}
      </span>
    </button>
  )
}

/** A playable progression: chips light up bar by bar. */
export function Progression(props: {
  id: string
  label: string
  chords: string[]
  textureId?: string
  playLabel?: string
}) {
  const tex = texture(props.textureId ?? 'ballad')
  const { playing, bar, toggle } = useSeqPlay(props.id, props.label, (key) =>
    buildSeq({ key, chords: props.chords, texture: tex }),
  )
  return (
    <div className="flex flex-wrap items-center gap-2">
      {props.chords.map((token, i) => (
        <ChordChip key={i} token={token} active={playing && bar === i} />
      ))}
      <PlayButton playing={playing} onClick={toggle} variant="outline" className="ml-auto sm:ml-2">
        {props.playLabel}
      </PlayButton>
    </div>
  )
}

// ---------- beat grid ----------

export function BeatGrid({ tex }: { tex: Texture }) {
  const cols = tex.beats * 2
  const counts = Array.from({ length: cols }, (_, i) => (i % 2 ? '&' : String(i / 2 + 1)))
  const row = (hits: Texture['lh'], hand: 'lh' | 'rh') => (
    <>
      <div className={cn('pr-2 text-xs font-semibold', hand === 'lh' ? 'text-lh-ink' : 'text-rh-ink')}>
        {hand === 'lh' ? 'LH' : 'RH'}
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {hits.map((h, i) => (
          <div
            key={i}
            style={{ gridColumn: `${h.t * 2 + 1} / span ${h.d * 2}` }}
            className={cn(
              'flex h-9 items-center rounded-md px-1.5 text-xs font-semibold text-white sm:text-sm',
              h.d <= 0.5 && 'justify-center px-0',
              hand === 'lh' ? 'bg-lh' : 'bg-rh',
            )}
          >
            {h.label}
          </div>
        ))}
      </div>
    </>
  )
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-y-1.5">
      <div />
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {counts.map((c, i) => (
          <div
            key={i}
            className={cn('text-center text-xs tabular-nums', i % 2 ? 'text-muted-foreground/60' : 'font-semibold')}
          >
            {c}
          </div>
        ))}
      </div>
      {row(tex.rh, 'rh')}
      {row(tex.lh, 'lh')}
    </div>
  )
}
