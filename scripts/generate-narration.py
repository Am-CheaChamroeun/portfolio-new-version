#!/usr/bin/env python3
"""
Generate the About Me voice narration as MP3 files with Edge TTS (free, no API key).

    pip install edge-tts
    python3 scripts/generate-narration.py            # all three languages
    python3 scripts/generate-narration.py km         # just one (en | km | zh-CN)
    python3 scripts/generate-narration.py --dry-run  # only print the text that would be read

It reads your bio from src/i18n/locales/*.json (content.about.paragraphs), skips any
[BRACKETED PLACEHOLDER] paragraphs, and writes public/audio/about-<lang>.mp3.
Re-run it whenever you change your bio. To change a voice, edit VOICES below
(list all voices with:  edge-tts --list-voices).
"""
import asyncio
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCALES = ROOT / "src" / "i18n" / "locales"
OUT = ROOT / "public" / "audio"

VOICES = {
    "en": "en-US-AriaNeural",  # or en-US-AndrewNeural (male)
    "km": "km-KH-SreymomNeural",  # or km-KH-PisethNeural (male)
    "zh-CN": "zh-CN-XiaoxiaoNeural",  # or zh-CN-YunxiNeural (male)
}
RATE = "-3%"  # a touch slower than default sounds more natural for a bio


def bio_text(lang: str) -> str:
    data = json.loads((LOCALES / f"{lang}.json").read_text(encoding="utf-8"))
    paragraphs = data["content"]["about"]["paragraphs"]
    cleaned = [re.sub(r"\[[^\]]*\]", "", p).strip() for p in paragraphs]  # same rule as the website player
    return " ".join(p for p in cleaned if p)


async def generate(lang: str) -> None:
    import edge_tts

    OUT.mkdir(parents=True, exist_ok=True)
    target = OUT / f"about-{lang}.mp3"
    await edge_tts.Communicate(bio_text(lang), VOICES[lang], rate=RATE).save(str(target))
    print(f"  ✓ {target.relative_to(ROOT)}  ({target.stat().st_size // 1024} KB, {VOICES[lang]})")


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    langs = args or list(VOICES)
    unknown = [l for l in langs if l not in VOICES]
    if unknown:
        sys.exit(f"Unknown language {unknown}. Use: {', '.join(VOICES)}")

    if "--dry-run" in sys.argv:
        for lang in langs:
            print(f"[{lang}] {VOICES[lang]}\n{bio_text(lang)}\n")
        return

    try:
        import edge_tts  # noqa: F401
    except ImportError:
        sys.exit("edge-tts is not installed. Run:  pip install edge-tts")

    print("Generating narration…")
    for lang in langs:
        asyncio.run(generate(lang))
    print("Done. Restart `npm run dev` if it is running.")


if __name__ == "__main__":
    main()
