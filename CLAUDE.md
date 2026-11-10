# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page, interactive pop piano accompaniment tutorial ("Pop Piano by Ear"), live at https://cdt.is-a.dev/piano/. Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui. All audio is synthesised in the browser with Web Audio; there are no samples, no backend and no router.

## Commands

```
npm run dev      # http://localhost:5173/piano/  (note the /piano/ base path)
npm run build    # tsc -b && vite build  — this is the type check
npm run lint     # oxlint
```

There is no test suite. Verify changes by building and by playing the examples in a browser at phone (≈390px) and desktop widths.

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`. `base: '/piano/'` in `vite.config.ts` must match the repo name.

## Architecture

Three layers, each depending only on the one above it:

1. **`src/lib/music.ts` — pure theory, no React, no audio.** Everything is expressed in scale degrees so it transposes to any key in `KEYS`.
   - Chords are string tokens: `degree[:quality][/bassDegree]`, e.g. `"1"`, `"6:m7"`, `"5/7"`, `"3:7"`. Omitting the quality gives the diatonic triad. `parseChord`, `chordName` (real name in a key) and `chordRoman` all read this grammar.
   - Voicings: `lhLadder` returns the bass note plus chord tones climbing above it (indices 0–5 = 1, 3, 5, 8, 10, 12); `rhVoicing` folds all chord tones into one fixed octave window, which is what produces nearest-inversion voice leading.
   - `TEXTURES` are the accompaniment patterns. Each hit's `idx` indexes into the ladder (LH) or voicing (RH); an empty `idx` means the whole chord. The same data drives both playback and the `BeatGrid` visual, so labels and `idx` must stay in sync.
   - `buildSeq` turns chords + texture(s) + optional melody into a flat `Seq` of timed note events plus per-bar `marks`. One chord token = one bar. Melody notes are `[beat, length, scaleStep]` with step 0 = tonic.
   - `TUNE` / `TUNE_CHORDS` are the original eight-bar practice tune reused across sections.

2. **`src/lib/player.ts` — audio engine and global state.** A module-level store read through `usePlayer(selector)` (`useSyncExternalStore`), holding key, bpm, which example is playing, the current bar, and which keys are lit. `play(id, label, seq)` loops a `Seq` with a look-ahead scheduler; `strike` plays notes immediately. Only one example plays at a time, identified by a unique string `id`. Changing key or tempo calls `stop()`.

3. **UI.**
   - `src/components/kit.tsx` — shared pieces: `Section`, `Panel`, `Tip`, `PlayButton`, `ChordChip`, `Progression`, `BeatGrid`, and the `useSeqPlay(id, label, build)` hook that every playable example uses.
   - `src/components/Dock.tsx` — the fixed bottom bar: SVG keyboard (C2–G6), key selector, tempo. Melody, voicing and ladder ranges in `music.ts` are chosen to stay inside this keyboard range.
   - `src/sections.tsx` — all tutorial copy and the nine sections, plus the `SECTIONS` list that `App.tsx` uses for navigation and scroll-spy.
   - `src/components/ui/` — shadcn-generated components (Base UI flavour, `base-nova` style). Add more with `npx shadcn@latest add <name>`.

## Conventions

- **Content limit:** the guide is intentionally capped at ten sections (currently nine) and kept concise. Extend an existing section before adding a new one.
- **Mobile first:** every layout must work at phone width with no horizontal page scroll; wide content scrolls inside its own container. `main` keeps bottom padding so the dock never covers content.
- **Colour encodes the musical layer:** `lh` (blue) = left hand, `rh` (red) = right-hand chord, `mel` (brass) = melody. Tokens are defined in `src/index.css` (`--lh`, `--rh`, `--mel` and their `-ink` text variants); don't use these colours decoratively. The theme is light-only.
- **Typography:** Bricolage Grotesque for headings (`font-heading`), Instrument Sans for body, both self-hosted via `@fontsource-variable`.
- **Music content:** suited to an intermediate hobbyist who reads notation and likes Ghibli, Mandopop (Jay Chou) and simple classical pieces. Song titles are practice suggestions only; do not reproduce copyrighted melodies or scores, and do not assert a specific song's chords unless certain.
- Import alias `@/` maps to `src/`. `cn` comes from `@/lib/utils`.
