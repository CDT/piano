import { Minus, Plus, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { KEYS, type Hand } from '@/lib/music'
import { setBpm, setKey, stop, strike, usePlayer } from '@/lib/player'

const LOW = 36 // C2
const HIGH = 91 // G6
const BLACK = [1, 3, 6, 8, 10]
const FILL: Record<Hand, string> = { lh: 'var(--lh)', rh: 'var(--rh)', mel: 'var(--mel)' }

const whites: number[] = []
const blacks: { midi: number; x: number }[] = []
for (let m = LOW; m <= HIGH; m++) {
  if (BLACK.includes(m % 12)) blacks.push({ midi: m, x: whites.length * 10 - 3 })
  else whites.push(m)
}
const WIDTH = whites.length * 10

function Keyboard() {
  const active = usePlayer((s) => s.active)
  const tap = (midi: number) => strike([{ midi, hand: midi < 57 ? 'lh' : 'rh' }], 1)
  return (
    <svg
      viewBox={`0 0 ${WIDTH} 40`}
      preserveAspectRatio="none"
      className="block h-14 w-full touch-manipulation select-none sm:h-20"
      role="img"
      aria-label="Piano keyboard showing the notes being played"
    >
      {whites.map((midi, i) => (
        <rect
          key={midi}
          x={i * 10 + 0.4}
          y={0}
          width={9.2}
          height={40}
          rx={1.2}
          fill={active[midi] ? FILL[active[midi]] : '#f6f8f2'}
          onPointerDown={() => tap(midi)}
        />
      ))}
      {whites.map((midi, i) =>
        midi === 60 ? <rect key="c4" x={i * 10 + 3} y={34} width={4} height={2.5} rx={1} fill="#16211c" opacity={0.4} /> : null,
      )}
      {blacks.map(({ midi, x }) => (
        <rect
          key={midi}
          x={x}
          y={0}
          width={6}
          height={24}
          rx={1}
          fill={active[midi] ? FILL[active[midi]] : '#16211c'}
          stroke="#16211c"
          strokeWidth={0.6}
          onPointerDown={() => tap(midi)}
        />
      ))}
    </svg>
  )
}

function Legend() {
  const items: [string, string][] = [
    ['var(--lh)', 'Left hand'],
    ['var(--rh)', 'Right-hand chord'],
    ['var(--mel)', 'Melody'],
  ]
  return (
    <ul className="hidden items-center gap-4 text-xs text-white/70 lg:flex">
      {items.map(([color, label]) => (
        <li key={label} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: color }} />
          {label}
        </li>
      ))}
    </ul>
  )
}

export function Dock() {
  const keyIndex = usePlayer((s) => s.keyIndex)
  const bpm = usePlayer((s) => s.bpm)
  const playingId = usePlayer((s) => s.playingId)
  const label = usePlayer((s) => s.label)

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-pine text-white shadow-[0_-8px_24px_rgb(22_33_28/0.25)]">
      <div className="mx-auto max-w-6xl px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="mb-2 flex items-center gap-2 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {playingId ? (
              <>
                <Button
                  size="icon"
                  onClick={stop}
                  aria-label="Stop"
                  className="size-9 shrink-0 bg-white text-pine hover:bg-white/85"
                >
                  <Square className="fill-current" />
                </Button>
                <span className="truncate text-sm" aria-live="polite">
                  {label}
                </span>
              </>
            ) : (
              <span className="truncate text-sm text-white/60">Tap any play button</span>
            )}
          </div>

          <Legend />

          <label className="flex shrink-0 items-center gap-1.5 text-sm">
            <span className="hidden text-white/60 sm:inline">Key</span>
            <select
              aria-label="Key"
              value={keyIndex}
              onChange={(e) => setKey(Number(e.target.value))}
              className="h-9 rounded-md border border-white/20 bg-white/10 px-2 font-heading text-base font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-lh"
            >
              {KEYS.map((k, i) => (
                <option key={k.name} value={i} className="text-pine">
                  {k.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex shrink-0 items-center gap-1 text-sm">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Slower"
              onClick={() => setBpm(bpm - 4)}
              className="size-9 text-white hover:bg-white/10 hover:text-white sm:hidden"
            >
              <Minus />
            </Button>
            <span className="w-12 text-center tabular-nums sm:w-16">
              <span className="font-heading text-base font-semibold">{bpm}</span>
              <span className="ml-1 hidden text-xs text-white/60 sm:inline">bpm</span>
            </span>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Faster"
              onClick={() => setBpm(bpm + 4)}
              className="size-9 text-white hover:bg-white/10 hover:text-white sm:hidden"
            >
              <Plus />
            </Button>
            <div className="hidden w-28 sm:block">
              <Slider
                aria-label="Tempo"
                className="[&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-track]]:bg-white/20"
                min={50}
                max={140}
                step={2}
                value={[bpm]}
                onValueChange={(v) => setBpm(Array.isArray(v) ? v[0] : v)}
              />
            </div>
          </div>
        </div>
        <Keyboard />
      </div>
    </div>
  )
}
