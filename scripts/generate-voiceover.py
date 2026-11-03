"""Generate the narration for a video from its script.json using edge-tts.

Writes one MP3 per narration line to public/<video>/vo/<lineId>.mp3 and a
timings file (duration + word start times) next to the script, so the video
can sync visuals to individual spoken words.

Usage:  python scripts/generate-voiceover.py video1 [--force]
"""

import asyncio
import json
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
TICKS_PER_SECOND = 10_000_000  # edge-tts offsets are in 100ns ticks
MP3_BITS_PER_SECOND = 48_000  # edge-tts default: audio-24khz-48kbitrate-mono-mp3


async def _stream(text: str, voice: str, rate: str):
    audio = bytearray()
    words = []
    communicate = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            words.append({"t": round(chunk["offset"] / TICKS_PER_SECOND, 3), "w": chunk["text"]})
    return audio, words


async def synthesize(text: str, voice: str, rate: str, out: Path):
    for attempt in range(12):
        try:
            # a request can occasionally hang, so give each attempt a deadline
            audio, words = await asyncio.wait_for(_stream(text, voice, rate), timeout=40)
        except Exception as error:  # the service is occasionally flaky
            print(f"  retry {attempt + 1}: {error!r}", flush=True)
            await asyncio.sleep(1.5)
            continue
        if audio:
            out.write_bytes(audio)
            return {"duration": round(len(audio) * 8 / MP3_BITS_PER_SECOND, 3), "words": words}
    raise RuntimeError(f"Could not synthesize: {text}")


async def main():
    video = sys.argv[1]
    force = "--force" in sys.argv
    script_path = ROOT / "src" / video / "script.json"
    timings_path = ROOT / "src" / video / "vo-timings.json"
    out_dir = ROOT / "public" / video / "vo"
    out_dir.mkdir(parents=True, exist_ok=True)

    script = json.loads(script_path.read_text(encoding="utf-8"))
    timings = json.loads(timings_path.read_text(encoding="utf-8")) if timings_path.exists() else {}

    for scene in script["scenes"]:
        for line in scene["lines"]:
            out = out_dir / f"{line['id']}.mp3"
            cached = timings.get(line["id"])
            if not force and out.exists() and cached and cached.get("text") == line["text"]:
                continue
            print(f"{line['id']}: {line['text']}", flush=True)
            result = await synthesize(line["text"], script["voice"], script["rate"], out)
            timings[line["id"]] = {"text": line["text"], **result}
            timings_path.write_text(json.dumps(timings, indent=1), encoding="utf-8")

    print("Done.")


asyncio.run(main())
