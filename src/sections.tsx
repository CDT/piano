import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BeatGrid, ChordChip, P, Panel, PlayButton, Progression, Section, Tip, useSeqPlay } from '@/components/kit'
import {
  buildSeq,
  chordDegrees,
  chordName,
  chordRoman,
  melodyMidi,
  noteName,
  rhRootPosition,
  rhVoicing,
  scaleNames,
  strongDegrees,
  texture,
  TEXTURES,
  TUNE,
  TUNE_CHORDS,
} from '@/lib/music'
import { stop, useKey } from '@/lib/player'
import { cn } from '@/lib/utils'

export const SECTIONS = [
  { id: 'recipe', title: 'The recipe' },
  { id: 'numbers', title: 'Chords by number' },
  { id: 'progressions', title: 'Six progressions' },
  { id: 'left-hand', title: 'Left-hand patterns' },
  { id: 'right-hand', title: 'Right hand' },
  { id: 'harmonise', title: 'Chords for a melody' },
  { id: 'colour', title: 'Colour' },
  { id: 'arrange', title: 'Arrange a song' },
  { id: 'practice', title: 'Practice and cheatsheet' },
]

// ---------- hero ----------

export function Hero() {
  const full = useSeqPlay('hero-full', 'Practice tune, fully accompanied', (key) =>
    buildSeq({ key, chords: TUNE_CHORDS, texture: texture('flowing'), melody: TUNE }),
  )
  const bare = useSeqPlay('hero-bare', 'Practice tune, melody only', (key) =>
    buildSeq({ key, chords: TUNE_CHORDS, melody: TUNE }),
  )
  return (
    <header className="pt-10 pb-14 sm:pt-20 sm:pb-20">
      <h1 className="text-[clamp(2.6rem,9vw,5.25rem)] leading-[0.95] font-extrabold tracking-[-0.03em]">
        Hear a melody.
        <br />
        Play the whole song.
      </h1>
      <p className="mt-6 max-w-[54ch] text-lg leading-relaxed text-muted-foreground sm:text-xl">
        Pop piano is a melody, a handful of chords, and a left-hand pattern. This guide teaches the three in nine
        short steps. Every example plays on the keyboard at the bottom of the screen, in whichever key you choose.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <PlayButton playing={bare.playing} onClick={bare.toggle} variant="outline" className="h-12 px-5 text-base">
          {bare.playing ? 'Stop' : 'A melody on its own'}
        </PlayButton>
        <PlayButton playing={full.playing} onClick={full.toggle} className="h-12 px-5 text-base">
          {full.playing ? 'Stop' : 'The same melody, accompanied'}
        </PlayButton>
      </div>
    </header>
  )
}

// ---------- 1 ----------

function Recipe() {
  const mel = useSeqPlay('layers-1', 'Layer 1: melody', (key) => buildSeq({ key, chords: TUNE_CHORDS, melody: TUNE }))
  const chords = useSeqPlay('layers-2', 'Layers 1 and 2: melody and chords', (key) =>
    buildSeq({ key, chords: TUNE_CHORDS, melody: TUNE, texture: texture('still'), lh: false }),
  )
  const all = useSeqPlay('layers-3', 'All three layers', (key) =>
    buildSeq({ key, chords: TUNE_CHORDS, melody: TUNE, texture: texture('ballad') }),
  )
  const layers = [
    {
      color: 'bg-mel',
      name: 'Melody',
      text: 'The tune, on top, played by the outer fingers of your right hand.',
      play: mel,
      label: 'Melody',
    },
    {
      color: 'bg-rh',
      name: 'Chord',
      text: 'One or two chord notes under the melody, played by your right thumb and index finger.',
      play: chords,
      label: 'Add chords',
    },
    {
      color: 'bg-lh',
      name: 'Texture',
      text: 'Bass and rhythm in the left hand. Changing this pattern is what changes the mood.',
      play: all,
      label: 'Add left hand',
    },
  ]
  return (
    <Section
      id="recipe"
      n={1}
      title="The recipe"
      lede="Every pop arrangement is three layers. Learn each one separately, then stack them."
    >
      <ol className="grid gap-3 sm:grid-cols-3">
        {layers.map((l) => (
          <li key={l.name}>
            <Panel className="flex h-full flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className={cn('size-3 rounded-full', l.color)} />
                <h3 className="text-xl font-bold">{l.name}</h3>
              </div>
              <p className="flex-1 text-[0.95rem] leading-relaxed text-foreground/85">{l.text}</p>
              <PlayButton playing={l.play.playing} onClick={l.play.toggle} variant="outline" className="self-start">
                {l.play.playing ? 'Stop' : l.label}
              </PlayButton>
            </Panel>
          </li>
        ))}
      </ol>
      <P>
        You already read notation, so the melody is the easy part. The rest of this guide is about the other two
        layers: which chord goes under each bar, and what your left hand does with it.
      </P>
    </Section>
  )
}

// ---------- 2 ----------

function Numbers() {
  const key = useKey()
  return (
    <Section
      id="numbers"
      n={2}
      title="Chords by number"
      lede="Think in scale degrees, not letter names. A song learned as numbers works in every key."
    >
      <P>
        Build a triad on each note of the major scale and you get the six chords that carry almost all pop music.
        Capital numerals are major, lower-case are minor. Tap each one; change the key in the bar below and the
        numbers stay the same.
      </P>
      <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
        {['1', '2', '3', '4', '5', '6'].map((t) => (
          <ChordChip key={t} token={t} className="min-w-16" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Panel>
          <h3 className="text-lg font-bold">I, IV, V</h3>
          <p className="mt-1 text-[0.95rem] leading-relaxed text-foreground/85">
            The three major chords. I is home, IV leans away, V pulls back home.
          </p>
        </Panel>
        <Panel>
          <h3 className="text-lg font-bold">vi, ii, iii</h3>
          <p className="mt-1 text-[0.95rem] leading-relaxed text-foreground/85">
            The three minor chords. Each shares two notes with a major one: vi with I, ii with IV, iii with V.
          </p>
        </Panel>
        <Panel>
          <h3 className="text-lg font-bold">I/3, V/7</h3>
          <p className="mt-1 text-[0.95rem] leading-relaxed text-foreground/85">
            A slash names the bass note by scale degree. In {key.name}, I/3 is {chordName('1/3', key)}.
          </p>
        </Panel>
      </div>
      <Tip>
        Start in C, G, F and D. Play I, IV, V and vi in each until your hands find them without thinking. That alone
        unlocks a large share of the songs you like.
      </Tip>
    </Section>
  )
}

// ---------- 3 ----------

const PROGRESSIONS = [
  {
    id: 'axis',
    name: 'The four-chord loop',
    chords: ['1', '5', '6', '4'],
    note: 'The default pop progression. The verse of “Let It Be” opens with it.',
  },
  {
    id: 'minor-loop',
    name: 'The same loop, starting on vi',
    chords: ['6', '4', '1', '5'],
    note: 'Identical chords, darker mood. Common in emotional choruses and in “River Flows in You”.',
  },
  {
    id: 'royal',
    name: 'Royal road 王道进行',
    chords: ['4', '5', '3', '6'],
    note: 'The signature of J-pop, anime themes and Mandopop choruses. Bittersweet, always moving forward.',
  },
  {
    id: 'canon',
    name: 'Canon',
    chords: ['1', '5', '6', '3', '4', '1', '4', '5'],
    note: 'Pachelbel’s eight bars. Countless ballads, Jay Chou’s included, borrow it whole or in part.',
  },
  {
    id: 'fifties',
    name: 'The 50s turnaround',
    chords: ['1', '6', '4', '5'],
    note: 'Older and sweeter. Classic Mandarin ballads and anything nostalgic.',
  },
  {
    id: 'descending',
    name: 'Descending bass',
    chords: ['1', '5/7', '6', '1/5', '4', '1/3', '2', '5'],
    note: 'The left hand walks down the scale while the chords follow. A staple of ballad verses.',
  },
]

function Progressions() {
  return (
    <Section
      id="progressions"
      n={3}
      title="Six progressions"
      lede="Most pop songs are built from these, sometimes with a chord swapped. Learn them as sounds you recognise."
    >
      <ul className="space-y-3">
        {PROGRESSIONS.map((p) => (
          <li key={p.id}>
            <Panel>
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="mt-1 mb-3 max-w-[62ch] text-[0.95rem] leading-relaxed text-foreground/85">{p.note}</p>
              <Progression id={`prog-${p.id}`} label={p.name} chords={p.chords} />
            </Panel>
          </li>
        ))}
      </ul>
      <Tip>
        When you listen to a song, follow the bass. Sing its notes as numbers (“1, 5, 6, 4”) and you have usually
        found the progression.
      </Tip>
    </Section>
  )
}

// ---------- 4 ----------

function TexturePanel({ id }: { id: string }) {
  const tex = texture(id)
  const { playing, toggle } = useSeqPlay(`tex-${id}`, `${tex.name} pattern over I – V – vi – IV`, (key) =>
    buildSeq({ key, chords: ['1', '5', '6', '4'], texture: tex }),
  )
  return (
    <Panel className="space-y-4">
      <p className="max-w-[62ch] leading-relaxed">{tex.use}</p>
      <BeatGrid tex={tex} />
      <PlayButton playing={playing} onClick={toggle}>
        {playing ? 'Stop' : `Play ${tex.name.toLowerCase()} over I – V – vi – IV`}
      </PlayButton>
    </Panel>
  )
}

function LeftHand() {
  const [tab, setTab] = useState('still')
  return (
    <Section
      id="left-hand"
      n={4}
      title="Left-hand patterns"
      lede="Seven patterns, in order of energy. The chord stays the same; the pattern sets the mood."
    >
      <P>
        Numbers in the grid are chord notes counted from the root: 1 is the root, 5 the fifth, 8 the root an octave
        up, 10 the third above that. One row of the grid is one bar.
      </P>
      <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="h-11!">
            {TEXTURES.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="px-3 text-sm">
                {t.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {TEXTURES.map((t) => (
          <TabsContent key={t.id} value={t.id}>
            <TexturePanel id={t.id} />
          </TabsContent>
        ))}
      </Tabs>
      <Tip>
        Pedal: press just after each new chord sounds, lift exactly as the next one lands. One pedal change per
        chord is nearly always right.
      </Tip>
    </Section>
  )
}

// ---------- 5 ----------

function RightHand() {
  const key = useKey()
  const chords = ['1', '5', '6', '4']
  const jump = useSeqPlay('rh-jump', 'Root position, jumping', (k) =>
    buildSeq({ key: k, chords, texture: texture('heartbeat'), lh: false, voicing: rhRootPosition }),
  )
  const near = useSeqPlay('rh-near', 'Nearest inversion', (k) =>
    buildSeq({ key: k, chords, texture: texture('heartbeat'), lh: false }),
  )
  const spell = (notes: number[]) => notes.map((m) => noteName(m, key)).join(' ')
  return (
    <Section
      id="right-hand"
      n={5}
      title="Right hand"
      lede="Keep your hand in one place and let the chords come to it."
    >
      <P>
        Root-position chords make your hand leap around. Inversions fix that: move each note to the nearest note of
        the next chord, and keep any note the two chords share. Listen to the difference.
      </P>
      <Panel className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-80 text-left text-[0.95rem]">
            <thead>
              <tr className="text-sm text-muted-foreground">
                <th className="py-1 pr-3 font-medium">Chord</th>
                <th className="py-1 pr-3 font-medium">Root position</th>
                <th className="py-1 font-medium">Nearest inversion</th>
              </tr>
            </thead>
            <tbody>
              {chords.map((t) => (
                <tr key={t} className="border-t border-border">
                  <td className="py-2 pr-3 font-heading font-bold">
                    {chordName(t, key)} <span className="font-sans text-sm font-normal text-muted-foreground">{chordRoman(t)}</span>
                  </td>
                  <td className="py-2 pr-3 tabular-nums">{spell(rhRootPosition(t, key))}</td>
                  <td className="py-2 font-semibold text-rh-ink tabular-nums">{spell(rhVoicing(t, key))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-2">
          <PlayButton playing={jump.playing} onClick={jump.toggle} variant="outline">
            {jump.playing ? 'Stop' : 'Root position'}
          </PlayButton>
          <PlayButton playing={near.playing} onClick={near.toggle}>
            {near.playing ? 'Stop' : 'Nearest inversion'}
          </PlayButton>
        </div>
      </Panel>
      <h3 className="pt-2 text-2xl font-bold">Adding the melody</h3>
      <ol className="max-w-[66ch] list-decimal space-y-2 pl-5 leading-relaxed marker:font-semibold">
        <li>The melody is always the top note. Play it with fingers 3, 4 and 5.</li>
        <li>
          On the first beat of each new chord, add one or two chord notes below the melody with your thumb and index
          finger.
        </li>
        <li>Between chord changes, play the melody alone. The pedal keeps the harmony ringing.</li>
        <li>If the melody note is itself a chord note, you need even less underneath: one note is enough.</li>
      </ol>
    </Section>
  )
}

// ---------- 6 ----------

const CHOICES = ['1', '2', '3', '4', '5', '6']

function Harmonise() {
  const key = useKey()
  const names = scaleNames(key)
  const [picks, setPicks] = useState<string[]>(() => TUNE.map(() => '1'))
  const { playing, bar, toggle } = useSeqPlay('harmonise', 'Your harmonisation', (k) =>
    buildSeq({ key: k, chords: picks, texture: texture('ballad'), melody: TUNE }),
  )
  const change = (next: string[]) => {
    stop()
    setPicks(next)
  }
  const fit = (i: number, token: string) => {
    const strong = strongDegrees(TUNE[i])
    const inChord = chordDegrees(token)
    return strong.filter((d) => inChord.includes(d)).length / strong.length
  }
  const verdict = (score: number) =>
    score === 1 ? ['Fits', 'text-lh-ink'] : score > 0 ? ['Half fits', 'text-mel-ink'] : ['Clashes', 'text-rh-ink']

  return (
    <Section
      id="harmonise"
      n={6}
      title="Chords for a melody"
      lede="The core skill. Given only a tune, choose chords that sound right under it."
    >
      <ol className="max-w-[66ch] list-decimal space-y-2 pl-5 leading-relaxed marker:font-semibold">
        <li>Find the key. The last note of a song is almost always 1, and the key signature confirms it.</li>
        <li>Take one bar at a time and look at the notes on beats 1 and 3. Those are the notes the chord must agree with.</li>
        <li>Pick a chord that contains them. Try I, IV and V first, then vi, ii and iii.</li>
        <li>Start on I, end on I, and put V just before the end. If two chords fit, choose the one that moves the bass.</li>
      </ol>

      <Panel>
        <h3 className="text-xl font-bold">Which chords contain each note</h3>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          {names.map((n, d) => (
            <div key={n} className="flex items-baseline gap-2">
              <span className="w-8 font-heading text-lg font-bold">{n}</span>
              <span className="text-sm text-muted-foreground">
                {['1', '4', '5', '6', '2', '3']
                  .filter((t) => chordDegrees(t).includes(d))
                  .map((t) => chordName(t, key))
                  .join(', ')}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <h3 className="pt-2 text-2xl font-bold">Try it on this tune</h3>
      <P>
        Every bar is set to I to begin with, which is why it sounds flat. The underlined notes fall on beats 1 and 3. Choose a
        chord for each bar, then play it back.
      </P>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {TUNE.map((notes, i) => {
          const [word, tone] = verdict(fit(i, picks[i]))
          return (
            <div
              key={i}
              className={cn(
                'rounded-xl border bg-card p-3 transition-colors',
                playing && bar === i ? 'border-pine ring-2 ring-pine' : 'border-border',
              )}
            >
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">Bar {i + 1}</span>
                <span className={cn('font-semibold', tone)}>{word}</span>
              </div>
              <div className="mt-1 mb-2.5 flex gap-1.5 font-heading text-lg font-bold text-mel-ink">
                {notes.map(([t, , step], n) => (
                  <span key={n} className={cn((t === 0 || t === 2) && 'underline decoration-2 underline-offset-4')}>
                    {noteName(melodyMidi(step, key), key)}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1">
                {CHOICES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={picks[i] === t}
                    onClick={() => change(picks.map((p, n) => (n === i ? t : p)))}
                    className={cn(
                      'h-10 rounded-md border text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                      picks[i] === t
                        ? 'border-pine bg-pine text-white'
                        : 'border-border bg-background hover:border-pine/50',
                    )}
                  >
                    {chordName(t, key)}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <PlayButton playing={playing} onClick={toggle}>
          {playing ? 'Stop' : 'Play my chords'}
        </PlayButton>
        <Button variant="outline" className="h-10 px-4" onClick={() => change([...TUNE_CHORDS])}>
          Show one good answer
        </Button>
        <Button variant="ghost" className="h-10 px-4" onClick={() => change(TUNE.map(() => '1'))}>
          Reset
        </Button>
      </div>
      <Tip>
        There is more than one right answer. Bars 1, 3 and 5 accept either I or vi; trying both is how you develop
        taste.
      </Tip>
    </Section>
  )
}

// ---------- 7 ----------

const COLOURS = [
  {
    id: 'add9',
    name: 'add9 and sus2',
    note: 'Add the second note of the scale to a major chord. The shimmer of modern pop intros.',
    plain: ['1', '5', '6', '4'],
    rich: ['1:add9', '5', '6:m7', '4:add9'],
  },
  {
    id: 'sus4',
    name: 'sus4 before V',
    note: 'Hold the fourth for a moment, then let it fall to the third. Use it at the end of a phrase.',
    plain: ['1', '4', '5', '5'],
    rich: ['1', '4', '5:sus4', '5'],
  },
  {
    id: 'sevenths',
    name: 'Seventh chords',
    note: 'maj7 on I and IV, m7 on ii, iii and vi. Softer and warmer; the Ghibli and city-pop sound.',
    plain: ['1', '6', '2', '5'],
    rich: ['1:maj7', '6:m7', '2:m7', '5'],
  },
  {
    id: 'slash',
    name: 'Slash chords',
    note: 'Change only the bass note so the left hand moves by step instead of leaping.',
    plain: ['1', '5', '6', '1'],
    rich: ['1', '5/7', '6', '1/5'],
  },
  {
    id: 'secondary',
    name: 'III7 into vi',
    note: 'Turn the minor iii into a major seventh chord and it pulls hard towards vi. The lift in many Mandopop choruses.',
    plain: ['4', '5', '3', '6'],
    rich: ['4', '5', '3:7', '6'],
  },
  {
    id: 'minor-iv',
    name: 'Minor iv',
    note: 'After IV, lower its third by a semitone before going home. A nostalgic sigh for endings.',
    plain: ['1', '4', '4', '1'],
    rich: ['1', '4', '4:m', '1'],
  },
]

function ColourRow({ c }: { c: (typeof COLOURS)[number] }) {
  const plain = useSeqPlay(`colour-${c.id}-plain`, `${c.name}: plain`, (key) =>
    buildSeq({ key, chords: c.plain, texture: texture('ballad') }),
  )
  const rich = useSeqPlay(`colour-${c.id}-rich`, `${c.name}: with colour`, (key) =>
    buildSeq({ key, chords: c.rich, texture: texture('ballad') }),
  )
  return (
    <Panel>
      <h3 className="text-xl font-bold">{c.name}</h3>
      <p className="mt-1 mb-3 max-w-[62ch] text-[0.95rem] leading-relaxed text-foreground/85">{c.note}</p>
      <div className="flex flex-wrap items-center gap-2">
        {c.rich.map((t, i) => (
          <ChordChip key={i} token={t} active={(rich.playing && rich.bar === i) || (plain.playing && plain.bar === i)} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <PlayButton playing={plain.playing} onClick={plain.toggle} variant="outline">
          {plain.playing ? 'Stop' : 'Plain'}
        </PlayButton>
        <PlayButton playing={rich.playing} onClick={rich.toggle}>
          {rich.playing ? 'Stop' : 'With colour'}
        </PlayButton>
      </div>
    </Panel>
  )
}

function Colour() {
  return (
    <Section
      id="colour"
      n={7}
      title="Colour"
      lede="Six small changes that make plain chords sound like the records. Compare each one with the plain version."
    >
      <div className="grid gap-3 lg:grid-cols-2">
        {COLOURS.map((c) => (
          <ColourRow key={c.id} c={c} />
        ))}
      </div>
      <Tip>Add one colour per song at first. If the melody note clashes with the added note, go back to the plain chord.</Tip>
    </Section>
  )
}

// ---------- 8 ----------

const FORM = [
  ['Intro', 'Still', 'The last four bars of the chorus, played high and quiet.'],
  ['Verse 1', 'Still', 'Leave space. The singer, or your melody, carries it.'],
  ['Verse 2', 'Ballad', 'Same chords, now with movement in the left hand.'],
  ['Pre-chorus', 'Heartbeat', 'Steady right-hand chords build pressure.'],
  ['Chorus', 'Groove or Flowing', 'The fullest pattern. Play the melody in octaves if you can.'],
  ['Bridge', 'Still', 'Drop right back so the final chorus feels bigger.'],
  ['Ending', 'Still', 'Slow down, roll a I add9 from the bottom up, and let it ring.'],
]

function Arrange() {
  const demo = useSeqPlay('arrange', 'Verse into chorus', (key) =>
    buildSeq({
      key,
      chords: TUNE_CHORDS,
      melody: TUNE,
      texture: [...Array(4).fill(texture('still')), ...Array(4).fill(texture('groove'))],
    }),
  )
  return (
    <Section
      id="arrange"
      n={8}
      title="Arrange a song"
      lede="A song with one pattern throughout gets dull. Change the texture with the section."
    >
      <Panel className="p-0! sm:p-0!">
        <ul>
          {FORM.map(([part, pattern, how], i) => (
            <li
              key={part}
              className={cn('grid grid-cols-[6.5rem_1fr] gap-x-3 px-4 py-3 sm:grid-cols-[8rem_9rem_1fr] sm:px-5', i && 'border-t border-border')}
            >
              <span className="font-heading font-bold">{part}</span>
              <span className="font-semibold text-lh-ink">{pattern}</span>
              <span className="col-span-2 mt-0.5 text-[0.95rem] text-foreground/85 sm:col-span-1 sm:mt-0">{how}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <PlayButton playing={demo.playing} onClick={demo.toggle}>
        {demo.playing ? 'Stop' : 'Hear four bars still, then four bars groove'}
      </PlayButton>
      <ul className="max-w-[66ch] list-disc space-y-2 pl-5 leading-relaxed">
        <li>Change one thing at a time: the pattern, the register, or the volume.</li>
        <li>When the melody holds a long note, fill the gap by rolling the chord upwards in your right hand.</li>
        <li>Moving both hands an octave higher is the cheapest way to make a verse sound new.</li>
      </ul>
    </Section>
  )
}

// ---------- 9 ----------

const WEEKS = [
  ['Week 1', 'I – V – vi – IV in C, G, F and D. Still and Ballad patterns, hands together, with pedal.'],
  ['Week 2', 'All six progressions with nearest inversions. Add Flowing and Heartbeat.'],
  ['Week 3', 'Harmonise three tunes you know from the melody alone. Check against a chord chart afterwards.'],
  ['Week 4', 'Arrange one full song: a pattern for each section, plus one colour chord.'],
]

const PIECES = [
  {
    group: 'Classical and crossover',
    items: [
      ['Canon in D', 'Broken, then Flowing'],
      ['River Flows in You', 'Flowing'],
    ],
  },
  {
    group: 'Studio Ghibli',
    items: [
      ['Always with Me いつも何度でも', 'Waltz'],
      ['Carrying You 君をのせて', 'Ballad'],
      ['Merry-Go-Round of Life', 'Waltz, when you are ready'],
    ],
  },
  {
    group: 'Jay Chou 周杰伦',
    items: [
      ['安静', 'Still into Ballad'],
      ['晴天', 'Ballad into Groove'],
      ['稻香', 'Groove'],
      ['不能说的秘密', 'Flowing'],
    ],
  },
]

function Practice() {
  return (
    <Section
      id="practice"
      n={9}
      title="Practice and cheatsheet"
      lede="Fifteen minutes a day for four weeks, then real songs."
    >
      <ol className="grid gap-3 sm:grid-cols-2">
        {WEEKS.map(([week, task]) => (
          <li key={week}>
            <Panel className="h-full">
              <h3 className="text-lg font-bold">{week}</h3>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-foreground/85">{task}</p>
            </Panel>
          </li>
        ))}
      </ol>

      <h3 className="pt-2 text-2xl font-bold">Pieces to try, with a pattern to start from</h3>
      <div className="grid gap-3 lg:grid-cols-3">
        {PIECES.map((g) => (
          <Panel key={g.group}>
            <h4 className="font-heading text-lg font-bold">{g.group}</h4>
            <ul className="mt-2 space-y-2">
              {g.items.map(([piece, pattern]) => (
                <li key={piece} className="text-[0.95rem] leading-snug">
                  <span className="font-semibold">{piece}</span>
                  <br />
                  <span className="text-lh-ink">{pattern}</span>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
      <P>
        Work from a lead sheet (melody plus chord symbols) rather than a full arrangement, or from the melody alone
        once step 6 feels comfortable.
      </P>

      <div className="rounded-xl bg-pine p-5 text-white sm:p-7">
        <h3 className="text-2xl font-bold text-mel">The whole guide on one card</h3>
        <dl className="mt-4 grid gap-x-8 gap-y-4 text-[0.95rem] leading-relaxed sm:grid-cols-2">
          {[
            ['Chords', 'I IV V major, ii iii vi minor. Think numbers.'],
            ['Progressions', '1564 · 6415 · 4536 · 15634145 · 1645 · bass 1 7 6 5 4 3 2 5'],
            ['Left hand', 'Still → Ballad (1 5 8 5) → Flowing (1 5 8 10 12) → Heartbeat → Groove (3+3+2)'],
            ['Right hand', 'Melody on top, one or two chord notes below, nearest inversion.'],
            ['Finding chords', 'Notes on beats 1 and 3 choose the chord. Start and end on I, V before the end.'],
            ['Colour', 'add9, sus4, maj7 and m7, slash bass, III7 → vi, minor iv.'],
            ['Arranging', 'Quiet verse, busy chorus. Change one thing per section.'],
            ['Pedal', 'Change with every chord, just after you play it.'],
          ].map(([term, text]) => (
            <div key={term}>
              <dt className="font-heading font-bold">{term}</dt>
              <dd className="text-white/80">{text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  )
}

export function Guide() {
  return (
    <>
      <Recipe />
      <Numbers />
      <Progressions />
      <LeftHand />
      <RightHand />
      <Harmonise />
      <Colour />
      <Arrange />
      <Practice />
    </>
  )
}
