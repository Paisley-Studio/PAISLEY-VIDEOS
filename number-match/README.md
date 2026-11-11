# Paisley Studio: Number Match masterclass

This is a six-part video course for children who are learning HTML, CSS and JavaScript. They build a working memory game, **Number Match**, inside the Paisley Studio IDE. The course is built with [Remotion](https://www.remotion.dev) and rendered on **GitHub Actions**.

| # | Composition | Lesson | Length |
|---|---|---|---|
| 1 | `PaisleyIntro` | The Big Reveal: Imagine It. Build It. Play It. | 1:19 |
| 2 | `PaisleyHTML` | HTML: Building the Foundation | 6:27 |
| 3 | `PaisleyCSS` | CSS: Making the Game Beautiful | 7:30 |
| 4 | `PaisleyJavaScript` | JavaScript: Giving Our Game a Brain | 5:41 |
| 5 | `PaisleyGameLogic` | Making the Game Work | 5:50 |
| 6 | `PaisleyFinale` | Testing, Creativity and the Grand Finale | 4:36 |

All six lessons are built and registered in `src/Root.tsx`.

## Rendering the videos (GitHub Actions)

1. Push this repository to GitHub.
2. Open **Actions → Render Number Match videos → Run workflow**.
3. Choose `video_selection`: `all`, `intro`, `html`, `css`, `javascript`, `game-logic` or `finale`.
4. When the run finishes, download the artifacts from the run page. Each video is a separate artifact containing:
   - `Paisley-Number-Match-0X-….mp4`: 1920×1080, 30 fps, H.264 (CRF 18), AAC 192 kb/s, with burned-in subtitles
   - `….srt` and `….vtt`: separate subtitle files

The workflow installs Node 22, the npm lockfile dependencies, Chrome Headless Shell and the Linux libraries it needs. It then type-checks the project, checks that every narration line has audio, renders, and checks the MP4's size, frame rate and audio stream with ffprobe. Artifacts are kept for 30 days. Rendered MP4s are never committed to the repository.

## Project layout

```
number-match/
├── course-project/        The finished game students build (source of truth)
├── narration/video-0X/    script.json = narration + storyboard; timings.json = measured voice timings
├── narration/voice-samples/  The same sentence in five African-English voices
├── subtitles/video-0X/    Generated .srt and .vtt (same cues as the burned-in subtitles)
├── public/vo/video-0X/    Narration audio, one MP3 per line
├── public/audio/          Synthesized sound effects and music bed (original, licence-free)
├── public/branding/       Paisley Studio badge
├── public/images/         The real Paisley IDE screenshot (shown in Lesson 2)
├── public/references/     IDE screenshots and the number-card reference
├── src/
│   ├── Root.tsx           Registers the compositions
│   ├── compositions/      One file per video
│   ├── scenes/<video>/    Scenes for each video
│   ├── components/        PaisleyIDE, NumberCard, GamePage, Cursor, Subtitles, Sfx, Brand, Stage, VideoShell
│   ├── lib/               timeline (narration-driven timing), gameSim (the game's real rules), anim
│   ├── subtitles/         Caption cue builder (shared by the video and the SRT/VTT files)
│   └── styles/theme.ts    Design tokens (flat colours, IDE colours)
├── scripts/               Voice, audio, subtitles, storyboard, asset check, QA stills
├── docs/                  PRODUCTION-PLAN.md, STORYBOARD.md
└── videos.json            Mapping from workflow choice to composition and output name
```

The workflow lives at the repository root: `.github/workflows/render-number-match.yml`.

## How timing works

Every scene lasts as long as its narration. `src/lib/timeline.ts` reads `script.json` and the measured `timings.json`, including when each spoken word starts. Animations are keyed to spoken words, for example `cues.word("h1", "match")`. When you change a line and regenerate the voice, the whole video re-times itself, and so do the subtitles.

## Narration

Narration comes from `narration/video-0X/script.json`. Each line has `text`, which is what is spoken, and an optional `caption`, which is what the subtitle shows. For example, the voice says "index dot html" while the subtitle shows `index.html`.

```
python scripts/generate-voiceover.py 01        # one video (unchanged lines are cached)
python scripts/generate-voiceover.py all
```

- **Default provider: edge-tts** (Microsoft Edge neural voices). It is free and needs no API key. The current voice is `en-US-ChristopherNeural`, a mature American male voice. Compare alternatives (Andrew, Guy, Brian, Eric) in `narration/voice-samples/`, then change `"voice"` in the scripts and regenerate.
- **Optional: ElevenLabs.** It gives a more expressive voice. Put `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` in a local `.env` file (it is git-ignored) and run `python scripts/generate-voiceover.py all --provider elevenlabs`. Never commit keys.
- Audio files are named `public/vo/video-0X/<lineId>.mp3`, for example `public/vo/video-01/h1.mp3`. The render fails if any line is missing or out of date. It never substitutes silence.
- After changing narration, also run `node scripts/build-subtitles.ts all` and `node scripts/build-storyboard.ts`, then commit.

Generating narration is an asset step, like recording a voice-over. Commit the MP3s and `timings.json` so the GitHub render is reproducible and needs no network voice service.

## Other scripts

| Command | What it does |
|---|---|
| `node scripts/generate-audio.mjs` | Re-synthesizes every sound effect and the music bed |
| `node scripts/build-subtitles.ts all` | Writes the SRT and VTT files |
| `node scripts/build-storyboard.ts` | Writes `docs/STORYBOARD.md` |
| `node scripts/verify-assets.ts 01 02` | The same asset check the render runs |
| `node scripts/sync-course-code.ts` | Copies course-project/ code into the videos (run after editing the game) |
| `node scripts/scene-frames.ts 02` | Prints each scene's frame range |
| `node scripts/qa-stills.mjs PaisleyIntro 100 900` | Renders single PNG frames for visual review (not the video render) |
| `npx tsc` | Type-check |

The tools need Node 22.18 or later (it runs `.ts` scripts directly) and Python 3 with `pip install edge-tts`.

## Design rules

- Flat colours only: no gradients, no glassmorphism, no blur. Depth comes from scale, parallax and hard offset shadows.
- Palette: deep forest green, rich red, clean white, soft mint, plus gold for highlights. Language colours stay the same in every video: **HTML red · CSS green · JavaScript gold**.
- Quicksand for all UI text. JetBrains Mono for code, at 22px or larger whenever code is being taught.
- The bottom of the frame (y ≥ 950) is reserved for subtitles. Code being explained never goes there.
