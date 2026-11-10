"""Sound-effects stem: silence except for the cues in src/edit.json -> "sfx".

Each cue has a time in beats (`at`) and a `type`:

  whoosh       air sweep, loudest exactly on the cue (used on wipes and camera moves)
  impact       low boom + burst, starts on the cue
  impact-soft  a gentler impact
  thump        soft low hit
  riser        rising sweep that ENDS at `at + beats`
  zoom         short, fast rising rush that ENDS at `at + beats`
  sparkle      bright bell notes climbing the D major pentatonic over `beats`
  pop          short soft pitched pop
  blip         pitched pluck; `step` 0-4 -> D5, E5, F#5, A5, B5

Effects are kept well under the music: the whole stem peaks below -6 dBFS.
"""
from __future__ import annotations

import numpy as np

from synth import (AUDIO_OUT, CACHE, SR, Mix, bandpass, beat_seconds, bell, decay, edges, encode_mp3, highpass, hz,
                   limiter, load_edit, lowpass, measure, n_samples, ping_pong, pluck, reverb, reverb_ir, saw,
                   svf_bandpass, to_stereo, total_beats, write_wav)

SEED = 4481
CEILING_DB = -6.8  # sample-peak ceiling; the MP3 then stays under -6 dBFS
# Peak level of each effect (1.0 = full scale) before the ceiling.
LEVEL = {"whoosh": 0.20, "impact": 0.46, "impact-soft": 0.30, "thump": 0.26, "riser": 0.27, "zoom": 0.26,
         "sparkle": 0.12, "pop": 0.16, "blip": 0.22}
PENTATONIC = [hz(n) for n in ("D5", "E5", "F#5", "A5", "B5", "D6", "E6", "F#6", "A6", "B6")]
BLIP_NOTES = ("D5", "E5", "F#5", "A5", "B5")


def norm(x: np.ndarray) -> np.ndarray:
    return x / (np.max(np.abs(x)) + 1e-12)


def glide(start: float, end: float, n: int) -> np.ndarray:
    """Frequency curve that moves evenly in pitch from start to end."""
    return start * (end / start) ** np.linspace(0, 1, n)


def whoosh(rng, dur: float = 0.56) -> np.ndarray:
    n = n_samples(dur)
    shape = np.sin(np.linspace(0, np.pi, n))
    air = svf_bandpass(rng.standard_normal(n), 500 + 2300 * shape ** 2, q=1.4)
    air = lowpass(air, 6000) * shape ** 2
    pan = np.linspace(-0.6, 0.6, n)  # travels left to right
    angle = (pan + 1) * np.pi / 4
    return norm(np.stack([air * np.cos(angle), air * np.sin(angle)], axis=1))


def rising(rng, dur: float, lo: float, hi: float, power: float, tone=(0.0, 0.0)) -> np.ndarray:
    """Shared body of riser and zoom: a sweep that swells and stops dead."""
    n = n_samples(dur)
    env = np.linspace(0, 1, n) ** power
    env[-n_samples(0.015):] *= np.linspace(1, 0, n_samples(0.015))
    sweep = glide(lo, hi, n)
    out = np.stack([svf_bandpass(rng.standard_normal(n), sweep, q=1.6) for _ in range(2)], axis=1)
    if tone[0]:
        pitch = glide(tone[0], tone[1], n)
        voice = sum(np.sin(2 * np.pi * np.cumsum(pitch * d) / SR) for d in (0.996, 1.004))
        out += 0.22 * np.max(np.abs(out)) * to_stereo(lowpass(voice, 2500), 0.0)
    return norm(lowpass(out, 7000) * env[:, None])


def impact(rng, soft: bool = False) -> np.ndarray:
    n = n_samples(0.9)
    t = np.arange(n) / SR
    # Settles on F#1, the same note as the score's kick, so the two never beat against each other.
    boom = np.sin(2 * np.pi * np.cumsum(46.25 + 45 * np.exp(-t / 0.05)) / SR) * np.exp(-t / (0.11 if soft else 0.16))
    burst = bandpass(rng.standard_normal(n), 180, 3000 if soft else 4500) * decay(n, 0.035 if soft else 0.05)
    tail = lowpass(rng.standard_normal((n, 2)), 2500) * decay(n, 0.3)[:, None]
    out = to_stereo((0.7 if soft else 1.0) * np.tanh(1.4 * boom) + (0.35 if soft else 0.6) * norm(burst), 0.0)
    return norm(edges(highpass(out + 0.10 * norm(tail), 38), 0.0008, 0.1))


def thump(rng) -> np.ndarray:
    n = n_samples(0.3)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(hz("D2") + 60 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.07)
    tick = lowpass(rng.standard_normal(n), 1200) * decay(n, 0.006)
    return norm(edges(body + 0.25 * norm(tick), 0.001, 0.04))


def pop() -> np.ndarray:
    n = n_samples(0.11)
    t = np.arange(n) / SR
    pitch = 880 - 360 * np.exp(-t / 0.012)  # quick upward chirp, settles on A5
    phase = 2 * np.pi * np.cumsum(pitch) / SR
    return norm(edges((np.sin(phase) + 0.2 * np.sin(2 * phase)) * np.exp(-t / 0.03), 0.002, 0.02))


def blip(step: int, rng) -> np.ndarray:
    f = hz(BLIP_NOTES[step])
    dur = 0.7
    return norm(pluck(f, dur, rng, tau=0.5, bright=4500) + 0.45 * bell(f, dur, 0.8))


def build_sfx(edit: dict) -> np.ndarray:
    beat = beat_seconds(edit)
    seconds = total_beats(edit) * beat
    rng = np.random.default_rng(SEED)
    dry, echo, wet_send = Mix(seconds), Mix(seconds), Mix(seconds)

    for cue in edit["sfx"]:
        kind, at = cue["type"], cue["at"] * beat
        length = cue.get("beats", 0) * beat
        level = LEVEL[kind]
        if kind == "whoosh":
            sound = whoosh(rng)
            dry.add(sound, at - len(sound) / SR / 2, level)
        elif kind == "riser":
            sound = rising(rng, length, 400, 5500, 2.2, tone=(hz("D4"), hz("D5")))
            dry.add(sound, at, level)
        elif kind == "zoom":
            sound = rising(rng, length, 300, 5000, 2.0, tone=(200, 900))
            dry.add(sound, at, level)
        elif kind in ("impact", "impact-soft"):
            sound = impact(rng, soft=kind == "impact-soft")
            dry.add(sound, at, level)
            wet_send.add(highpass(sound, 300), at, level * 0.35)
        elif kind == "thump":
            dry.add(thump(rng), at, level)
        elif kind == "sparkle":
            count = max(6, int(round(cue.get("beats", 2) * 5)))
            for i in range(count):
                when = at + length * i / count + rng.uniform(-0.03, 0.03) * (i > 0)
                climb = i / (count - 1) * (len(PENTATONIC) - 1)
                note = PENTATONIC[int(np.clip(round(climb + rng.integers(-1, 2)), 0, len(PENTATONIC) - 1))]
                sound = bell(note, 0.7, rng.uniform(0.55, 1.0))
                dry.add(sound, when, level, pan=rng.uniform(-0.7, 0.7))
                wet_send.add(sound, when, level * 0.8, pan=rng.uniform(-0.7, 0.7))
        elif kind == "pop":
            dry.add(pop(), at, level)
        elif kind == "blip":
            sound = blip(cue["step"], rng)
            dry.add(sound, at, level)
            echo.add(sound, at, level)
            wet_send.add(sound, at, level * 0.5)
        else:
            raise SystemExit(f"Unknown sfx type in edit.json: {kind}")

    out = dry.buf + 0.3 * ping_pong(echo.buf, beat * 0.75, feedback=0.35, repeats=3)
    out += 0.4 * reverb(wet_send.buf, reverb_ir(rt60=1.4, seed=11))
    out = limiter(highpass(out, 30), CEILING_DB)
    out[-n_samples(0.02):] = 0.0
    return out


def main() -> None:
    wav = CACHE / "audio" / "sfx.wav"
    write_wav(wav, build_sfx(load_edit()))
    encode_mp3(wav, AUDIO_OUT / "sfx.mp3")
    stats = measure(wav)
    print(f"sfx: {stats['lufs']:.1f} LUFS, true peak {stats['true_peak']:.1f} dBTP (WAV master) -> assets/audio/sfx.mp3")


if __name__ == "__main__":
    main()
