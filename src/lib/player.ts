// Web Audio piano + looping scheduler + a tiny external store the UI subscribes to.
import { useSyncExternalStore } from 'react'
import { KEYS, type Hand, type KeyDef, type Seq } from './music'

interface State {
  keyIndex: number
  bpm: number
  playingId: string | null
  label: string
  bar: number
  active: Record<number, Hand>
}

let state: State = { keyIndex: 0, bpm: 84, playingId: null, label: '', bar: -1, active: {} }
const listeners = new Set<() => void>()
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function usePlayer<T>(select: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => select(state))
}
export const useKey = (): KeyDef => KEYS[usePlayer((s) => s.keyIndex)]

// ---------- audio ----------

let ctx: AudioContext | null = null
let master: GainNode | null = null
let bus: GainNode | null = null

function audio(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
    const comp = ctx.createDynamicsCompressor()
    master = ctx.createGain()
    master.gain.value = 0.9
    master.connect(comp).connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function newBus(): GainNode {
  const c = audio()
  bus = c.createGain()
  bus.connect(master!)
  return bus
}

function voice(midi: number, when: number, dur: number, vel: number, out: AudioNode) {
  const c = audio()
  const freq = 440 * 2 ** ((midi - 69) / 12)
  const decay = Math.max(0.9, 3.2 - (midi - 36) * 0.035) // low strings ring longer
  const hold = dur + 0.35 // a little pedal
  const gain = c.createGain()
  gain.gain.setValueAtTime(0, when)
  gain.gain.linearRampToValueAtTime(vel * 0.5, when + 0.006)
  gain.gain.exponentialRampToValueAtTime(vel * 0.5 * Math.exp(-hold / (decay * 0.45)) + 0.0001, when + hold)
  gain.gain.exponentialRampToValueAtTime(0.0001, when + hold + 0.3)
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(Math.min(freq * 6, 9000), when)
  filter.frequency.exponentialRampToValueAtTime(Math.min(freq * 2.5, 4000), when + 0.4)
  filter.connect(gain).connect(out)
  const partials: [OscillatorType, number, number][] = [
    ['triangle', 1, 1],
    ['sine', 2, 0.35],
    ['sine', 3, 0.12],
  ]
  for (const [type, mult, level] of partials) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = type
    osc.frequency.value = freq * mult
    g.gain.value = level
    osc.connect(g).connect(filter)
    osc.start(when)
    osc.stop(when + hold + 0.35)
  }
}

// ---------- key highlights ----------

let timers: number[] = []
const owners = new Map<number, number>()
let stamp = 0

function light(midi: number, hand: Hand, inMs: number, forMs: number) {
  const id = ++stamp
  timers.push(
    window.setTimeout(() => {
      owners.set(midi, id)
      set({ active: { ...state.active, [midi]: hand } })
    }, inMs),
    window.setTimeout(() => {
      if (owners.get(midi) !== id) return
      const next = { ...state.active }
      delete next[midi]
      set({ active: next })
    }, inMs + forMs),
  )
}

// ---------- transport ----------

let interval = 0

export function stop() {
  window.clearInterval(interval)
  timers.forEach((t) => window.clearTimeout(t))
  timers = []
  owners.clear()
  if (bus && ctx) {
    const old = bus
    old.gain.setTargetAtTime(0, ctx.currentTime, 0.03)
    window.setTimeout(() => old.disconnect(), 400)
    bus = null
  }
  set({ playingId: null, bar: -1, active: {} })
}

export function play(id: string, label: string, seq: Seq) {
  stop()
  const c = audio()
  const out = newBus()
  const spb = 60 / state.bpm
  const start = c.currentTime + 0.1
  let loop = 0
  let ei = 0
  let mi = 0
  set({ playingId: id, label })

  const tick = () => {
    const horizon = c.currentTime + 0.2
    for (;;) {
      const loopStart = start + loop * seq.total * spb
      const ev = seq.events[ei]
      const mark = seq.marks[mi]
      const evAt = ev ? loopStart + ev.t * spb : Infinity
      const markAt = mark ? loopStart + mark.t * spb : Infinity
      if (!ev && !mark) {
        loop++
        ei = 0
        mi = 0
        continue
      }
      if (Math.min(evAt, markAt) > horizon) break
      if (markAt <= evAt) {
        const bar = mark.bar
        timers.push(window.setTimeout(() => set({ bar }), (markAt - c.currentTime) * 1000))
        mi++
      } else {
        voice(ev.midi, evAt, ev.d * spb, ev.vel, out)
        light(ev.midi, ev.hand, (evAt - c.currentTime) * 1000, Math.max(90, ev.d * spb * 1000 - 40))
        ei++
      }
    }
  }
  tick()
  interval = window.setInterval(tick, 50)
}

/** Play a few notes right now without touching the transport. */
export function strike(notes: { midi: number; hand: Hand }[], seconds = 1.4) {
  const c = audio()
  const out = bus ?? master!
  notes.forEach(({ midi, hand }, i) => {
    const delay = i * 0.012
    voice(midi, c.currentTime + 0.02 + delay, seconds, hand === 'lh' ? 0.5 : 0.45, out)
    light(midi, hand, 20, Math.min(seconds * 1000, 900))
  })
}

export function setKey(keyIndex: number) {
  stop()
  set({ keyIndex })
}

export function setBpm(bpm: number) {
  stop()
  set({ bpm: Math.max(50, Math.min(140, Math.round(bpm))) })
}
