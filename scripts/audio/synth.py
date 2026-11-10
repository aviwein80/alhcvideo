"""Small synthesis toolkit shared by the score and sound-effects generators.

Everything here is plain numpy/scipy: oscillators, a few instruments, drums,
effects (delay, reverb, sidechain, limiter) and helpers to measure and encode
audio with ffmpeg. All randomness goes through seeded generators, so every
build produces the same audio.
"""
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.ndimage import minimum_filter1d, uniform_filter1d

SR = 48_000
REPO = Path(__file__).resolve().parents[2]
EDIT = REPO / "src" / "edit.json"
CACHE = REPO / ".cache"
AUDIO_OUT = REPO / "assets" / "audio"

NOTE_INDEX = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


# ----------------------------------------------------------------- timing ---
def load_edit() -> dict:
    """The shared cue sheet for picture and sound."""
    return json.loads(EDIT.read_text())


def total_beats(edit: dict) -> float:
    return float(sum(scene["beats"] for scene in edit["scenes"]))


def beat_seconds(edit: dict) -> float:
    return 60.0 / edit["bpm"]


def n_samples(seconds: float) -> int:
    return int(round(seconds * SR))


def hz(name: str) -> float:
    """'F#5' -> frequency in Hz (A4 = 440)."""
    pitch, octave = name[:-1], int(name[-1])
    midi = 12 * (octave + 1) + NOTE_INDEX[pitch]
    return 440.0 * 2 ** ((midi - 69) / 12)


# ---------------------------------------------------------------- filters ---
def _sos(kind: str, freq, order: int):
    return signal.butter(order, freq, kind, fs=SR, output="sos")


def lowpass(x, freq, order=2):
    return signal.sosfilt(_sos("lowpass", freq, order), x, axis=0)


def highpass(x, freq, order=2):
    return signal.sosfilt(_sos("highpass", freq, order), x, axis=0)


def bandpass(x, lo, hi, order=2):
    return signal.sosfilt(_sos("bandpass", [lo, hi], order), x, axis=0)


def svf_bandpass(x: np.ndarray, cutoff: np.ndarray, q: float = 1.2) -> np.ndarray:
    """Band-pass whose centre frequency can move every sample (for sweeps)."""
    f = 2 * np.sin(np.pi * np.clip(cutoff, 20, 7500) / SR)
    damp = 1.0 / q
    low = band = 0.0
    out = np.empty(len(x))
    for i in range(len(x)):
        low += f[i] * band
        high = x[i] - low - damp * band
        band += f[i] * high
        out[i] = band
    return out


# -------------------------------------------------------------- envelopes ---
def decay(n: int, tau: float) -> np.ndarray:
    return np.exp(-np.arange(n) / (SR * tau))


def edges(x: np.ndarray, attack=0.002, release=0.01) -> np.ndarray:
    """Short fades at both ends so nothing starts or stops with a click."""
    x = x.copy()
    a, r = min(n_samples(attack), len(x) // 2), min(n_samples(release), len(x) // 2)
    shape = (-1,) + (1,) * (x.ndim - 1)  # works for mono and stereo
    if a:
        x[:a] *= np.linspace(0, 1, a).reshape(shape)
    if r:
        x[-r:] *= np.linspace(1, 0, r).reshape(shape)
    return x


def swell(n: int, attack: float, release: float) -> np.ndarray:
    """Slow-attack envelope for pads: rise, hold, fall."""
    env = np.ones(n)
    a, r = min(n_samples(attack), n), min(n_samples(release), n)
    env[:a] = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, a))
    env[n - r:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, r))
    return env


# ------------------------------------------------------------ oscillators ---
def saw(freq: float, n: int, phase0: float = 0.0) -> np.ndarray:
    """Band-limited (PolyBLEP) sawtooth."""
    dt = freq / SR
    t = (phase0 + dt * np.arange(n)) % 1.0
    y = 2 * t - 1
    lo = t < dt
    x = t[lo] / dt
    y[lo] -= x + x - x * x - 1
    hi = t > 1 - dt
    x = (t[hi] - 1) / dt
    y[hi] -= x * x + x + x + 1
    return y


def to_stereo(mono: np.ndarray, pan: float = 0.0) -> np.ndarray:
    """Equal-power pan. pan = -1 (left) … +1 (right)."""
    angle = (pan + 1) * np.pi / 4
    return np.stack([mono * np.cos(angle), mono * np.sin(angle)], axis=1)


# ------------------------------------------------------------ instruments ---
def pluck(freq: float, dur: float, rng, tau=0.45, bright=3200.0) -> np.ndarray:
    """Karplus-Strong string. Low `tau` and `bright` give a muted guitar."""
    period = max(2, int(round(SR / freq - 0.5)))
    actual = SR / (period + 0.5)
    buf = rng.uniform(-1, 1, period)
    # Mellow the excitation (circular smoothing keeps the loop seamless).
    smooth = max(1, int(SR / bright / 2))
    for _ in range(2):
        buf = uniform_filter1d(buf, size=smooth, mode="wrap")
    buf -= buf.mean()
    buf /= np.max(np.abs(buf)) + 1e-9
    loop_gain = np.exp(-(period / SR) / tau)
    periods = int(np.ceil(dur * max(actual, freq))) + 2  # a little spare for the resample below
    out = np.empty(periods * period)
    for p in range(periods):
        out[p * period:(p + 1) * period] = buf
        buf = loop_gain * 0.5 * (buf + np.roll(buf, 1))
    # The integer delay is slightly off pitch: resample to the exact note.
    ratio = freq / actual
    out = np.interp(np.arange(0, len(out) - 1, ratio), np.arange(len(out)), out)
    n = n_samples(dur)
    out = np.pad(out[:n], (0, max(0, n - len(out))))
    return edges(out, 0.001, 0.02)


def piano(freq: float, dur: float, vel: float = 0.7, rng=None, tone: float = 1.5) -> np.ndarray:
    """Additive piano: decaying, slightly stretched partials + hammer.

    `tone` is how fast the upper partials fall away: 1.5 is soft and felted,
    1.1 is bright enough to cut through a full mix.
    """
    n = n_samples(dur)
    t = np.arange(n) / SR
    out = np.zeros(n)
    stretch = 0.0004
    for k in range(1, 15):
        fk = freq * k * np.sqrt(1 + stretch * k * k)
        if fk > 7000:
            break
        # Harder notes are brighter; upper partials die away sooner.
        amp = vel ** (0.35 * (k - 1)) / k ** tone
        tau = max(0.10, 2.6 / (1 + 0.5 * (k - 1))) * (220 / freq) ** 0.35
        for cents in (-1.2, 1.4):  # two strings, a hair apart
            f = fk * 2 ** (cents / 1200)
            out += 0.5 * amp * np.exp(-t / tau) * np.sin(2 * np.pi * f * t + 0.7 * k)
    if rng is not None:
        thud = bandpass(rng.standard_normal(n), 250, 2200) * decay(n, 0.012)
        out += 0.10 * vel * thud
    return edges(out, 0.003, 0.08) * vel


def bell(freq: float, dur: float, vel: float = 0.7) -> np.ndarray:
    """Glockenspiel-like bell: a few inharmonic partials, capped below 9 kHz."""
    n = n_samples(dur)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for ratio, amp, life in ((1.0, 1.0, 1.0), (2.0, 0.30, 0.55), (2.76, 0.26, 0.32), (5.40, 0.09, 0.16)):
        f = freq * ratio
        if f > 9000:
            continue
        out += amp * np.exp(-t / (0.85 * life)) * np.sin(2 * np.pi * f * t)
    return edges(out, 0.002, 0.05) * vel


def supersaw(freq: float, dur: float, rng, cutoff=2400.0, attack=0.5, release=0.6, voices=7) -> np.ndarray:
    """Warm string pad: detuned saws spread across the stereo field."""
    n = n_samples(dur)
    out = np.zeros((n, 2))
    for cents, pan in zip(np.linspace(-12, 12, voices), np.linspace(-0.8, 0.8, voices)):
        out += to_stereo(saw(freq * 2 ** (cents / 1200), n, rng.uniform()), pan)
    out = highpass(lowpass(out, cutoff, 4), 200)
    return out * swell(n, attack, release)[:, None] / voices


def bass_note(freq: float, dur: float) -> np.ndarray:
    """Sine sub with a low-passed saw on top so it reads on small speakers."""
    n = n_samples(dur)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * freq * t) + 0.45 * lowpass(saw(freq, n), 520, 2)
    return edges(tone * (0.35 + 0.65 * decay(n, 0.22)), 0.004, 0.03)


# ------------------------------------------------------------------ drums ---
def kick(vel: float = 1.0) -> np.ndarray:
    n = n_samples(0.34)
    t = np.arange(n) / SR
    f = 46.25 + 115 * np.exp(-t / 0.028)  # settles on F#1, the third of the key
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.115)
    return edges(np.tanh(1.5 * body) / np.tanh(1.5), 0.0005, 0.03) * vel


def kick_click(rng, vel: float = 1.0) -> np.ndarray:
    n = n_samples(0.03)
    return bandpass(rng.standard_normal(n), 1500, 5000) * decay(n, 0.004) * 0.5 * vel


def clap(rng, vel: float = 1.0) -> np.ndarray:
    n = n_samples(0.32)
    env = np.zeros(n)
    for offset in (0.0, 0.009, 0.019):
        i = n_samples(offset)
        env[i:] = np.maximum(env[i:], decay(n - i, 0.006))
    i = n_samples(0.028)
    env[i:] = np.maximum(env[i:], 0.85 * decay(n - i, 0.075))
    return edges(bandpass(rng.standard_normal(n), 1000, 5200) * env, 0.0005, 0.02) * vel


def snare(rng, vel: float = 1.0) -> np.ndarray:
    n = n_samples(0.22)
    t = np.arange(n) / SR
    noise = bandpass(rng.standard_normal(n), 1400, 6500) * decay(n, 0.07)
    tone = np.sin(2 * np.pi * (185 + 40 * np.exp(-t / 0.02)) * t) * decay(n, 0.05)
    return edges(0.8 * noise + 0.55 * tone, 0.0005, 0.02) * vel


def tom(freq: float, vel: float = 1.0) -> np.ndarray:
    n = n_samples(0.3)
    t = np.arange(n) / SR
    f = freq * (1 + 0.5 * np.exp(-t / 0.03))
    return edges(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.09), 0.001, 0.03) * vel


def hat(rng, vel: float = 1.0, open_: bool = False) -> np.ndarray:
    n = n_samples(0.26 if open_ else 0.06)
    noise = bandpass(rng.standard_normal(n), 5500, 10500, 3)
    return edges(noise * decay(n, 0.075 if open_ else 0.014), 0.0005, 0.01) * vel


def shaker(rng, vel: float = 1.0) -> np.ndarray:
    n = n_samples(0.09)
    env = np.minimum(np.arange(n) / n_samples(0.008), 1.0) * decay(n, 0.022)
    return bandpass(rng.standard_normal(n), 3800, 8500) * env * vel


def crash(rng, dur: float = 2.2, vel: float = 1.0) -> np.ndarray:
    """Stereo cymbal wash."""
    n = n_samples(dur)
    noise = bandpass(rng.standard_normal((n, 2)), 2600, 10000, 2)
    env = (0.35 * decay(n, 0.08) + 0.65 * decay(n, dur / 4.5))[:, None]
    return edges(noise * env, 0.001, 0.2) * vel


# ---------------------------------------------------------------- effects ---
def reverb_ir(rt60: float = 1.9, predelay: float = 0.018, seed: int = 7) -> np.ndarray:
    """Stereo room built from decaying noise; highs die away faster."""
    rng = np.random.default_rng(seed)
    n = n_samples(rt60 * 1.15)
    t = (np.arange(n) / SR)[:, None]
    noise = rng.standard_normal((n, 2))
    low, high = lowpass(noise, 700), highpass(noise, 3200)
    mid = noise - low - high
    k = 6.91  # ln(1000): -60 dB at t = rt60
    ir = low * np.exp(-k * t / (rt60 * 1.1)) + mid * np.exp(-k * t / rt60) + high * np.exp(-k * t / (rt60 * 0.42))
    ir = highpass(ir, 240)
    ir[: n_samples(0.004)] *= np.linspace(0, 1, n_samples(0.004))[:, None]
    ir = np.concatenate([np.zeros((n_samples(predelay), 2)), ir])
    return ir / np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True))


def reverb(send: np.ndarray, ir: np.ndarray) -> np.ndarray:
    n = len(send)
    return np.stack([signal.fftconvolve(send[:, c], ir[:, c])[:n] for c in (0, 1)], axis=1)


def ping_pong(x: np.ndarray, delay: float, feedback=0.36, repeats=5, tone=3200.0) -> np.ndarray:
    """Echoes that alternate sides and get darker and quieter each time."""
    n = len(x)
    cur = x.mean(axis=1)
    out = np.zeros((n, 2))
    for k in range(1, repeats + 1):
        shift = n_samples(delay * k)
        if shift >= n:
            break
        cur = lowpass(cur, tone, 1) * feedback
        side = k % 2
        out[shift:, side] += 0.9 * cur[: n - shift]
        out[shift:, 1 - side] += 0.3 * cur[: n - shift]
    return out


def sidechain(n: int, hit_times, depth=0.5, recover=0.11) -> np.ndarray:
    """Gain curve that dips on every kick and recovers, for a gentle pump."""
    gain = np.ones(n)
    dip = 1 - depth * decay(n_samples(recover * 6), recover)
    for time in hit_times:
        i = n_samples(time)
        if i >= n:
            continue
        m = min(len(dip), n - i)
        gain[i:i + m] = np.minimum(gain[i:i + m], dip[:m])
    return uniform_filter1d(gain, size=n_samples(0.004))


def limiter(x: np.ndarray, ceiling_db: float, lookahead: float = 0.004) -> np.ndarray:
    """Look-ahead peak limiter: gain drops just before a peak, then recovers."""
    ceiling = 10 ** (ceiling_db / 20)
    peak = np.max(np.abs(x), axis=1)
    gain = np.minimum(1.0, ceiling / np.maximum(peak, 1e-9))
    radius = n_samples(lookahead)
    gain = minimum_filter1d(gain, size=2 * radius + 1)
    gain = uniform_filter1d(gain, size=radius + 1)
    return x * gain[:, None]


class Mix:
    """A stereo canvas you can drop sounds onto at a time in seconds."""

    def __init__(self, seconds: float):
        self.n = n_samples(seconds)
        self.buf = np.zeros((self.n, 2))

    def add(self, sound: np.ndarray, at: float, gain: float = 1.0, pan: float = 0.0) -> None:
        if sound.ndim == 1:
            sound = to_stereo(sound, pan)
        start = n_samples(at)
        if start < 0:
            sound, start = sound[-start:], 0
        if start >= self.n:
            return
        m = min(len(sound), self.n - start)
        self.buf[start:start + m] += gain * sound[:m]


# ------------------------------------------------- measuring and encoding ---
def write_wav(path: Path, x: np.ndarray) -> None:
    import soundfile as sf

    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(path), x, SR, subtype="PCM_24")


def measure(path: Path) -> dict:
    """Integrated loudness (LUFS) and true peak (dBTP) as ffmpeg reports them."""
    log = subprocess.run(
        ["ffmpeg", "-nostats", "-hide_banner", "-i", str(path), "-filter_complex", "ebur128=peak=true", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    summary = log[log.rfind("Summary:"):]
    lufs = re.search(r"I:\s+(-?[\d.]+|-inf|nan) LUFS", summary)
    peak = re.search(r"Peak:\s+(-?[\d.]+|-inf|nan) dBFS", summary)
    return {
        "lufs": float(lufs.group(1)) if lufs else float("nan"),
        "true_peak": float(peak.group(1)) if peak else float("nan"),
    }


def encode_mp3(wav: Path, mp3: Path, bitrate: str = "320k") -> None:
    mp3.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", bitrate,
         "-ar", str(SR), str(mp3)],
        check=True,
    )


def decode(path: Path) -> np.ndarray:
    """Decode any audio file to float samples at SR, shape (n, channels)."""
    raw = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(path), "-f", "f32le", "-ar", str(SR), "-"],
        capture_output=True, check=True,
    ).stdout
    channels = int(subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=channels", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout.strip())
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, channels).astype(np.float64)
