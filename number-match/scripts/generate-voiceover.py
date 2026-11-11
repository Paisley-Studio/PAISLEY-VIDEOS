"""Generate narration audio for one or more videos from narration/video-XX/script.json.

Writes one MP3 per narration line to public/vo/video-XX/<lineId>.mp3 and
narration/video-XX/timings.json (duration + per-word start times). The video
timeline, burned-in subtitles and SRT/VTT files are all built from timings.json.

Providers
  edge        (default) Microsoft Edge neural voices via edge-tts. Free, no key.
              Voice comes from "voice" in script.json, e.g. en-KE-AsiliaNeural.
  elevenlabs  Needs ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID in the environment
              (locally from .env, or GitHub Secrets in CI). Never commit keys.

Lines whose text has not changed since the last run are skipped (cached).

Usage
  python scripts/generate-voiceover.py 01            # one video
  python scripts/generate-voiceover.py all           # all six
  python scripts/generate-voiceover.py 02 --force    # regenerate every line
  python scripts/generate-voiceover.py all --provider elevenlabs
"""

import asyncio
import base64
import json
import os
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TICKS_PER_SECOND = 10_000_000  # edge-tts offsets are in 100 ns ticks
EDGE_BITS_PER_SECOND = 48_000  # edge-tts default: audio-24khz-48kbitrate-mono-mp3
ELEVEN_BITS_PER_SECOND = 128_000  # mp3_44100_128


def load_dotenv():
    env = ROOT / ".env"
    if env.exists():
        for raw in env.read_text(encoding="utf-8").splitlines():
            if "=" in raw and not raw.strip().startswith("#"):
                key, value = raw.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip().strip('"'))


# ---------- edge-tts ----------

async def _edge_stream(text, voice, rate):
    import edge_tts

    audio = bytearray()
    words = []
    communicate = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            words.append({"t": round(chunk["offset"] / TICKS_PER_SECOND, 3), "w": chunk["text"]})
    return audio, words


async def synth_edge(text, voice, rate, out):
    for attempt in range(12):
        try:
            audio, words = await asyncio.wait_for(_edge_stream(text, voice, rate), timeout=40)
        except Exception as error:  # the service is occasionally flaky
            print(f"  retry {attempt + 1}: {error!r}", flush=True)
            await asyncio.sleep(1.5)
            continue
        if audio:
            out.write_bytes(audio)
            return {"duration": round(len(audio) * 8 / EDGE_BITS_PER_SECOND, 3), "words": words}
    raise RuntimeError(f"Could not synthesize: {text}")


# ---------- ElevenLabs ----------

def synth_elevenlabs(text, out):
    key = os.environ.get("ELEVENLABS_API_KEY")
    voice_id = os.environ.get("ELEVENLABS_VOICE_ID")
    if not key or not voice_id:
        raise SystemExit("ElevenLabs needs ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID.")
    model = os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128"
    body = json.dumps({
        "text": text,
        "model_id": model,
        "voice_settings": {"stability": 0.55, "similarity_boost": 0.75, "style": 0.25},
    }).encode("utf-8")
    request = urllib.request.Request(url, data=body, method="POST", headers={
        "xi-api-key": key, "Content-Type": "application/json", "Accept": "application/json",
    })
    with urllib.request.urlopen(request, timeout=120) as response:
        data = json.loads(response.read())
    audio = base64.b64decode(data["audio_base64"])
    out.write_bytes(audio)
    # character timings -> word start times
    align = data["alignment"]
    words, current, start = [], "", None
    for ch, t in zip(align["characters"], align["character_start_times_seconds"]):
        if ch.isspace():
            if current:
                words.append({"t": round(start, 3), "w": current})
            current, start = "", None
        else:
            if start is None:
                start = t
            current += ch
    if current:
        words.append({"t": round(start, 3), "w": current})
    words = [{"t": w["t"], "w": w["w"].strip(".,!?;:\"'()")} for w in words]
    return {"duration": round(len(audio) * 8 / ELEVEN_BITS_PER_SECOND, 3), "words": words}


# ---------- main ----------

async def generate(video, provider, force):
    folder = ROOT / "narration" / f"video-{video}"
    script = json.loads((folder / "script.json").read_text(encoding="utf-8"))
    timings_path = folder / "timings.json"
    timings = json.loads(timings_path.read_text(encoding="utf-8")) if timings_path.exists() else {}
    out_dir = ROOT / "public" / "vo" / f"video-{video}"
    out_dir.mkdir(parents=True, exist_ok=True)
    voice_key = script["voice"] if provider == "edge" else f"elevenlabs:{os.environ.get('ELEVENLABS_VOICE_ID')}"

    wanted = set()
    for scene in script["scenes"]:
        for line in scene["lines"]:
            wanted.add(line["id"])
            out = out_dir / f"{line['id']}.mp3"
            cached = timings.get(line["id"])
            fresh = cached and cached.get("text") == line["text"] and cached.get("voice") == voice_key
            if not force and out.exists() and fresh:
                continue
            print(f"[video {video}] {line['id']}: {line['text']}", flush=True)
            if provider == "edge":
                result = await synth_edge(line["text"], script["voice"], script["rate"], out)
            else:
                result = synth_elevenlabs(line["text"], out)
            timings[line["id"]] = {"text": line["text"], "voice": voice_key, **result}
            timings_path.write_text(json.dumps(timings, indent=1), encoding="utf-8")

    # drop timings (and audio) for lines that were removed from the script
    for stale in [k for k in timings if k not in wanted]:
        del timings[stale]
        (out_dir / f"{stale}.mp3").unlink(missing_ok=True)
    timings_path.write_text(json.dumps(timings, indent=1), encoding="utf-8")


def main():
    load_dotenv()
    args = sys.argv[1:]
    if not args:
        raise SystemExit(__doc__)
    force = "--force" in args
    provider = "edge"
    if "--provider" in args:
        provider = args[args.index("--provider") + 1]
    target = args[0]
    videos = [f"{n:02d}" for n in range(1, 7)] if target == "all" else [f"{int(target):02d}"]
    for video in videos:
        asyncio.run(generate(video, provider, force))
    print("Done.")


main()
