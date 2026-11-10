"""Rebuild the ad's audio from src/edit.json.

    python scripts/audio/build.py            # score, effects, voice, then the measurement report
    python scripts/audio/build.py score      # just one part: score | sfx | voice | verify

Run it with the virtualenv described in scripts/audio/README.md.
"""
from __future__ import annotations

import sys

import score
import sfx
import verify
import voice

STEPS = {"score": score.main, "sfx": sfx.main, "voice": voice.build_voice, "verify": verify.main}

if __name__ == "__main__":
    wanted = [a for a in sys.argv[1:] if not a.startswith("-")] or list(STEPS)
    unknown = [name for name in wanted if name not in STEPS]
    if unknown:
        raise SystemExit(f"Unknown step: {', '.join(unknown)}. Choose from: {', '.join(STEPS)}.")
    for name in wanted:
        print(f"--- {name} ---")
        STEPS[name]()
