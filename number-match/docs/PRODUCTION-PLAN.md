# Number Match masterclass: production plan

The full scene-by-scene storyboard and complete narration for all six videos is in [STORYBOARD.md](STORYBOARD.md), which is generated from the scripts.

## 1. Source asset inventory

| Asset | Found | Used as |
|---|---|---|
| Game source (`index.html`, `style.css`, `script.js`) | Supplied in the brief | `course-project/`, improved (see 2.1) |
| Game README | Not supplied | Written: `course-project/README.md` |
| Number-card reference | `Pictures/Screenshots/Screenshot 2026-11-11 224854.png` | `public/references/number-card-reference.png` (card with "1", "One" and an apple; the apple is excluded as briefed) |
| Paisley IDE screenshots | `Screenshot 2026-11-11 223214.png` (HTML file, Save/Run, hint bar, console), `…2026-11-10 220506.png` (folder tree), `…220540.png` (CSS file) | `public/references/`; the IDE is rebuilt as `src/components/PaisleyIDE.tsx` |
| Paisley Studio logo | `Downloads/Paisley Studio Wooden Badge Logo.png` (1254 px), plus `cropped-Paisely-logo-Resized.png` (199 px, too small for 1080p) | Badge cropped to `public/branding/paisley-badge.png` |
| Earlier series infrastructure | This repository (Dino Runner series) | Timeline, voice and SFX approach reused and improved |

**Missing or limited:**
- **No vector or high-resolution flat logo.** The flat teal "Paisley Studio" wordmark exists only at 199×119 px. The wooden badge is used instead. A vector (SVG) or large PNG of the flat wordmark would allow a cleaner closing frame.
- **No screenshots of the IDE's create-file flow** (what appears after clicking new-file, the rename box, or the Emmet `!` suggestion popup). Lessons 2–6 animate these steps. Until real screenshots arrive, the new-file name box is drawn as a simple inline input; please confirm it matches the real behaviour or send a screenshot.
- **No people imagery.** The brief asks for authentic Black African children and educators wherever people appear. I can't produce photographic people, and illustrated stand-ins risk looking generic or caricatured. Video 1 tells its story through the game and the IDE with no people. If you supply licensed photos or illustrations (for example, children at laptops), Videos 1 and 6 have natural slots for them (the hook, and the "I made this!" celebration).

## 2. Decisions made (please review)

### 2.1 Game code improvements (`course-project/README.md` lists every change)
- **Flat colours only**, as you asked: removed the radial-gradient background, the gradient progress bar, the translucent panel and the `backdrop-filter: blur` on the win overlay. The palette is refined: forest `#0e4a3f`, red `#e3242b`, match green `#14936b`, mint `#e4f4ee`.
- **Quicksand weights corrected: 400–700, not 400–800.** Google serves Quicksand from 300 to 700 only. A request for 800 returns HTTP 200, but no 800 face is ever served, so `font-weight: 800` was silently drawn at 700. Teaching children that "800 is bolder" would be wrong, so the link, the CSS and the narration all use 700. **The brief's supplied CDN link therefore differs slightly from what the videos teach.**
- `<title>Number Match</title>`, which matches what Video 2 teaches.
- Removed the duplicate `@import` (the font is linked once, in `<head>`, as Video 3 teaches).
- `setMessage` uses a dedicated `<span id="gameMessage">` (the original relied on `lastChild`, which is fragile).
- Removed the unused `large-board` toggle, and fixed restart during the win delay.

### 2.2 Production decisions
- **Voice:** `en-US-ChristopherNeural` (mature American male, as requested) through edge-tts, at −4% for the intro and −6% for the lessons. Alternatives are in `narration/voice-samples/`. Note the licensing caveat in `LICENSES.md`: for a public or commercial release, re-voice with a licensed provider (the pipeline supports ElevenLabs through GitHub Secrets or a local `.env`).
- **Narration rewrites for speech:** code terms are written so the voice pronounces them well ("index dot html", "create deck"), and each such line has a `caption` with the correct spelling (`index.html`, `createDeck`) for the subtitles.
- **Lesson lengths:** Video 1 is 1:21 and Videos 2–6 run 4:39 to 7:42 (see STORYBOARD.md). They are longer than "generally 3–6 min" because the narration is deliberately slow and thorough. To shorten them: raise `rate` to −4% (saves about 5%), or trim lines (Video 3's layout scene is the best candidate).
- **Video 3 limitation:** at the end of Video 3 the grid is still empty, because JavaScript creates the cards. The card-design scene therefore designs one card on a stage, and the narration says why.
- **Google Fonts in Video 3** is planned as a simplified, unbranded browser mock. A real screen recording of fonts.google.com would be more accurate and would stay correct if Google's interface changes. Remotion can embed a supplied MP4.
- **Student checkpoints** (the project as it stands at the end of each lesson) are planned at `course-project/checkpoints/video-2…5`, built alongside each lesson.

## 3. Remotion architecture

```
src/Root.tsx                 registers only finished lessons
src/compositions/Paisley*.tsx  one per video: VideoShell + that video's scenes
src/scenes/<video>/*.tsx     one file per storyboard scene
src/components/
  PaisleyIDE        faithful IDE: top bar, sidebar (new file/folder/upload, rename/delete),
                    editor (CodeMirror-5 colours, typing, marks, selection, caret), hint bar,
                    preview, console; exports IDE_RECTS for highlights and cursor targets
  NumberCard        3D flip card, exact game proportions or "hero" proportions
  GamePage          the styled game page, win overlay, and a browser frame with zoom/scroll
  Cursor            eased pointer with click ripple
  Subtitles         burned-in captions in the reserved bottom zone
  Sfx / GameSounds  sound effects; GameSounds plays the simulator's sound events
  Stage             parallax card backdrop and flat sparks
  Brand             Number Match logotype, Paisley badge, lesson bug
  VideoShell        scenes + narration + music ducked under speech + subtitles
src/lib/
  timeline.ts       narration-driven timing; cues.word(line, word) gives a frame
  gameSim.ts        frame-exact copy of script.js's rules (850 ms miss, 450 ms win,
                    lockBoard, moves, timer, progress transition) plus sound events
src/subtitles/captions.ts  one cue builder for the burned-in, SRT and VTT subtitles
```

Output: 1920×1080, 30 fps, H.264 CRF 18, yuv420p, AAC 192 kb/s.

## 4. GitHub Actions rendering

`.github/workflows/render-number-match.yml` (repository root), run manually through `workflow_dispatch` with `video_selection` = `all | intro | html | css | javascript | game-logic | finale`.

1. **plan** (one job): `npm ci` from the lockfile, `tsc`, and `remotion compositions` to see which lessons are built. It produces a matrix of the selected, built videos; unbuilt ones get a visible warning.
2. **render** (one job per video, in parallel, `fail-fast: false`): installs the Linux libraries for Chrome Headless Shell, runs `remotion browser ensure`, the asset check (fails if any narration is missing or stale), builds the SRT and VTT files, renders, and verifies the MP4 with `remotion ffprobe` (1920×1080, 30/1, H.264, audio present). It uploads one artifact per video containing the MP4, SRT and VTT, with 30-day retention.

No paid services and no secrets are needed to render. ElevenLabs (optional) is used only when generating narration, never during the render.

## 5. External dependencies

| Need | Where | Cost |
|---|---|---|
| GitHub Actions minutes | Rendering | Free for public repos; private repos use the plan's minutes (about 3–5 runner-minutes per minute of video) |
| edge-tts (Python) | Generating narration, run locally | Free; licensing caveat above |
| ElevenLabs (optional) | Generating narration | Paid plan; `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` |
| Remotion licence | Rendering | Free for teams of up to 3; a company licence is needed above that |

## 6. Technical risks and mitigations

| Risk | Mitigation |
|---|---|
| The Chrome headless browser is missing on the runner | Explicit apt libraries + `remotion browser ensure` before rendering |
| Long renders time out | One job per video in parallel; 150-minute timeout; the longest lesson is about 7.7 min |
| Narration missing or out of date | `verify-assets.ts` fails the job, naming the line; never silent |
| Subtitles drift from the voice | Cues come from measured word timings through the same code that burns them in |
| Game shown inaccurately | `gameSim.ts` follows `script.js`'s rules; stats on screen are computed, not hand-typed |
| IDE misrepresented | Built only from the screenshots; unknown flows flagged in section 1 for confirmation |
| Font weights mis-taught | Corrected to Quicksand's real 300–700 range |
| Voice licence for public release | Documented; one-command re-voice with a licensed provider |
| A render is claimed to work without a real run | Video 1 has only been checked locally as still frames. **The first GitHub Actions run is the proof**; see the final report |

## 7. Next steps

1. Review Video 1 by rendering it on GitHub (Actions → `intro`). Tell me about voice, pacing, palette and animation feel, since they set the standard for Videos 2–6.
2. Confirm or supply: the IDE's new-file and Emmet popup screenshots, a vector logo, and optionally licensed people imagery.
3. Build Videos 2 → 6 in order, reusing the same components, with student checkpoints for each.
