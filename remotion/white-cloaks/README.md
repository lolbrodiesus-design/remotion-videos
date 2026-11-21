# White Cloaks — Remotion remake

Same 30.44s video as the aiTrends build (`projects/white-cloaks-30s`), rebuilt in
Remotion so the two renders can be compared. The aiTrends studio is untouched —
everything here is a copy/port under `remotion/`. No audio in this composition:
the VO/music/SFX mix stays local via `../audio/mix.py`, same as the aiTrends flow.

## Versions (verified 2026-11-22)

- Remotion **4.0.545** (`remotion`, `@remotion/cli`, `@remotion/fonts`), React 18.3.1,
  TypeScript 5.6.3, Node v24.22.1, npm 10.9.4
- Install: `npm install --no-audit --no-fund` in this dir (248 packages, ~45s)

## Browser — the important bit

- **Working:** Playwright **chrome-headless-shell-1194**
  `/home/hatch/.cache/ms-playwright/chromium_headless_shell-1194/chrome-linux/headless_shell`
- **NOT working:** the full Playwright Chromium (`chromium-1194/chrome`) — Remotion
  4.0.545 launches it with old headless mode, which Chrome 141 removed
  (`Failed to launch the browser process! Old Headless mode has been removed…`).
- `remotion.config.ts` uses the shell only when that path exists (checked with
  `fs.existsSync`); on machines without it (GitHub runners) it falls back to
  Remotion's own browser — run `npx remotion browser install chrome` there first.
- Also set: `Config.setChromiumOpenGlRenderer('swiftshader')`.

## Fonts — gotcha

5 woff2 files live in `public/fonts/` (Fredoka 600/700, Nunito 800/900,
Playfair Display 900 italic), loaded with `@remotion/fonts` `loadFont` +
`delayRender`. **Draw only after fonts are ready:** the canvas is painted in a
`useLayoutEffect`, so if it draws before the fonts arrive the fallback glyphs
get baked in and never repaint (a still's frame never changes). `WhiteCloaks.tsx`
gates the draw on a `fontsReady` state. Symptom of getting this wrong: serif
fallback digits — the VIEWS counter diff vs the aiTrends MP4 was 4.33 before the
fix, 1.19 after.

## Structure

- `src/index.tsx` — `registerRoot`; `src/Root.tsx` — Composition `WhiteCloaks`,
  1920×1080, 24fps, **731 frames** (30.44s)
- `src/WhiteCloaks.tsx` — one `<canvas>`, drawn per frame via `useCurrentFrame`
- `src/engine/` — verbatim ports of the aiTrends engine (loose `any` types,
  `strict: false`): `core.ts`, `styles.ts`, `fx2d.ts`, `rig2d.ts`, `ui2d.ts`,
  plus `player.ts` (shot lookup, transitions whip/zoom/dip/flash/fade, scope bars,
  fade in/out, vignette, deterministic grain — ported from `player.js`)
- `src/scenes/` — verbatim ports: `cast.ts`, `sets/{desert,room,ghosttown}.ts`,
  `shots/{01_room,02_screen,03_ghosttown,04_desert}.ts`
- `src/story/shots.json`, `src/config.json` — copies of the originals (12 shots,
  exact start/end, transitions, fadeIn 0.5 / fadeOut 0.8, no captions)

## Changes vs the aiTrends version (deliberate only)

1. **Bicycle grip** (`src/scenes/sets/desert.ts`, `gripArm`) — a robe-coloured
   sleeve runs from the 8th figure's side to the handlebar grip in `cloakLine`
   and in s009, so the figure reads as *holding* the bike. No other geometry moved.
2. **Layered mesas** (`src/scenes/sets/desert.ts`, sky layer) — each mesa now has
   a hazier back ridge peeking above it, a sunlit top edge and a strata line,
   instead of one flat slab. Same silhouettes, same framing.

Everything else (story, VO timing, shot order, no solved explanation, dusk grade
is identity so no LUT) is byte-for-byte the same logic.

## Parity (measured vs the delivered aiTrends MP4, full-res, per shot)

Mean abs diff /255: s001 1.33, s002 1.54*, s003 1.24, s004 1.23, s005 1.94,
s006 1.46, s007 2.60, s008 1.86, s009 1.25, s010 1.09, s011 1.19*, s012 1.33
(* s002/s011 compared at the adjacent frame — the counter/globe move ~1M/frame,
so the ffmpeg-extracted MP4 frame is one frame off the nominal timestamp.)
Residual is grain + x264 noise. Note the `build/sheets/` stills are STALE for
s007/s008/s010/s012 (rendered before the final `04_desert.js` fix) — compare
against the MP4, not the sheets.

## Render commands

```sh
npx remotion still src/index.tsx WhiteCloaks out.png --frame=366
npx remotion render src/index.tsx WhiteCloaks out.mp4 --frames=334-404
```

`--frames=A-B` is **inclusive** (334–404 = 71 frames) and works for video ranges.
Each frame is computed from the shot definitions only (transitions draw the
previous shot on demand), so chunks have no inter-dependencies — a chunk
starting mid-transition renders correctly.

## Measured speed (this VM, 1.5 shared CPUs)

- 71-frame clip: 31.5s wall (~2.3 fps incl. bundle + browser launch)
- Stills: ~10s each (bundle cached)
- Implied full 731 frames locally: ~5–6 min (aiTrends took 15m27s for the same)

## GitHub 20-VM split render — notes

- Same 20-chunk split as the aiTrends run works: 731 frames, 11×37 + 9×36,
  chunk K = `--frames=<start>-<end>` (frames 0-based, inclusive; chunk 00 = 0–36,
  chunk 19 = 695–730). No code change needed for the split.
- Runner setup per job: Node 20+ (`setup-node`), `npm ci` (or `npm install`),
  `npx remotion browser install chrome` (downloads the matching headless shell),
  then `npx remotion render src/index.tsx WhiteCloaks chunk-KK.mp4
  --frames=A-B`. The repo checkout must include this `remotion/` dir; the
  `remotion.config.ts` browser path is already conditional, so it will not
  force the local path on runners. Pin `runs-on: ubuntu-24.04` (ubuntu-latest is
  now 26.04 and Playwright 1.56 does not support Chromium on it).
- Chunks are silent video-only MP4s; join with `ffmpeg concat` and mix audio
  locally with `../audio/mix.py`, exactly as the aiTrends GitHub run did.
- No blocker found. The only thing not yet tested on a runner is the
  `remotion browser install chrome` download + first render there.

## Proof

- `white-cloaks/proof/s001_f32.png` … `s012_f700.png` — one still per shot at
  the same timestamps as the reference stills (frames 32/86/141/211/283/366/
  426/488/552/598/646/700), 1920×1080 PNG
- `white-cloaks/proof/s006_clip.mp4` — shot s006 desert reveal, frames 334–404,
  2.96s, 1920×1080, 24fps, H.264, 4.5 MB, decode clean (flash → cloaks appear →
  slow push)
