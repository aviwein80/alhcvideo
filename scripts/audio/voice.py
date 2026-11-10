"""Voiceover: one clip per line in src/edit.json -> "voice".

Speech comes from Kokoro-82M (Apache-2.0) running locally through
kokoro-onnx. Each clip is trimmed, high-passed, matched to the same loudness
and written to assets/audio/voice/<id>.mp3. Clip lengths, and word timings
measured by transcribing each clip with faster-whisper, go to
src/generated/voice.json so the picture can follow the voice.

No audio service or API key is involved; the model files live in .cache/.
"""
from __future__ import annotations

import json
import re

import numpy as np
from scipy import signal

from synth import AUDIO_OUT, CACHE, REPO, SR, edges, encode_mp3, highpass, limiter, load_edit, measure, n_samples, write_wav

VOICE = "af_heart"
MODEL = CACHE / "kokoro" / "kokoro-v1.0.onnx"
VOICES = CACHE / "kokoro" / "voices-v1.0.bin"
ASR_MODEL = "small.en"
TARGET_LUFS = -18.0
PEAK_DB = -3.0
# Tried in order until the clip fits its window (maxSeconds in edit.json).
SPEEDS = (1.0, 1.03, 1.06, 1.09, 1.12, 1.15)
WAV_DIR = CACHE / "audio" / "voice"
OUT_JSON = REPO / "src" / "generated" / "voice.json"


def spoken_text(cue: dict) -> str:
    return cue.get("speak") or cue["text"].replace("\n", " ")


def trim(x: np.ndarray, margin: float = 0.03, floor_db: float = -42.0) -> np.ndarray:
    """Cut leading and trailing silence, leaving `margin` seconds each side."""
    level = np.convolve(np.abs(x), np.ones(n_samples(0.01)) / n_samples(0.01), mode="same")
    loud = np.nonzero(level > level.max() * 10 ** (floor_db / 20))[0]
    start = max(0, loud[0] - n_samples(margin))
    end = min(len(x), loud[-1] + n_samples(margin))
    return x[start:end]


def synthesize(kokoro, text: str, speed: float) -> np.ndarray:
    samples, rate = kokoro.create(text, voice=VOICE, speed=speed, lang="en-us")
    x = signal.resample_poly(np.asarray(samples, dtype=np.float64), SR, rate)
    return edges(highpass(trim(x), 80, 2), 0.005, 0.02)


def level_match(x: np.ndarray, scratch) -> np.ndarray:
    """Bring a clip to TARGET_LUFS, then hold its peaks under PEAK_DB."""
    for _ in range(2):
        write_wav(scratch, x)
        x = x * 10 ** ((TARGET_LUFS - measure(scratch)["lufs"]) / 20)
        x = limiter(x[:, None], PEAK_DB)[:, 0]
    return x


def transcribe(model, x: np.ndarray) -> tuple[str, list[dict]]:
    """What a speech recogniser hears in the clip, with a time for every word."""
    audio = signal.resample_poly(x, 1, SR // 16_000).astype(np.float32)  # Whisper expects 16 kHz
    segments, _ = model.transcribe(audio, language="en", beam_size=5, word_timestamps=True)
    words, text = [], []
    for segment in segments:
        text.append(segment.text.strip())
        for word in segment.words or []:
            words.append({
                "w": re.sub(r"[^\w']", "", word.word).lower(),
                "start": round(float(word.start), 2),
                "end": round(float(word.end), 2),
            })
    return " ".join(text), words


def build_voice() -> dict:
    from faster_whisper import WhisperModel
    from kokoro_onnx import Kokoro

    edit = load_edit()
    kokoro = Kokoro(str(MODEL), str(VOICES))
    asr = WhisperModel(ASR_MODEL, device="cpu", compute_type="int8", download_root=str(CACHE / "whisper"))
    out_dir = AUDIO_OUT / "voice"
    clips = {}

    for cue in edit["voice"]:
        text = spoken_text(cue)
        for speed in SPEEDS:
            x = synthesize(kokoro, text, speed)
            if len(x) / SR <= cue["maxSeconds"]:
                break
        wav = WAV_DIR / f"{cue['id']}.wav"
        x = level_match(x, wav)
        write_wav(wav, x)
        encode_mp3(wav, out_dir / f"{cue['id']}.mp3", "160k")
        transcript, words = transcribe(asr, x)
        seconds = round(len(x) / SR, 3)
        clips[cue["id"]] = {
            "seconds": seconds,
            "speed": speed,
            "fits": seconds <= cue["maxSeconds"],
            "transcript": transcript,
            "words": words,
        }
        flag = "" if seconds <= cue["maxSeconds"] else "  <-- LONGER THAN WINDOW"
        print(f"{cue['id']:13s} {seconds:5.2f}s / {cue['maxSeconds']:.1f}s  speed {speed:.2f}  “{transcript}”{flag}")

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps({"voice": VOICE, "clips": clips}, indent=2) + "\n")
    return clips


if __name__ == "__main__":
    build_voice()
