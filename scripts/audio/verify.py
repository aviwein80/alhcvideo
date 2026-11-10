"""Measure the generated audio. Nothing here listens; it only measures.

Reports, for the score and the effects stem: length, sample rate, loudness,
true peak, clipping, DC offset, how energy is spread across the spectrum, and
how loud each section is. It also checks that the kick lands on the beat grid
and that every sound effect starts where its cue says. For the voice clips it
prints length against the allowed window, loudness, and what a speech
recogniser heard.
"""
from __future__ import annotations

import json
import subprocess

import numpy as np
from scipy import signal

from synth import (AUDIO_OUT, REPO, SR, bandpass, beat_seconds, decode, highpass, kick, load_edit, lowpass, measure,
                   n_samples, total_beats)

BANDS = (("sub 20-120 Hz", 20, 120), ("low-mid 120-500 Hz", 120, 500), ("mid 500-4k Hz", 500, 4000), ("high 4k-16k Hz", 4000, 16000))
SECTIONS = (("intro", 1, 4), ("groove A", 5, 7), ("build", 8, 8), ("chorus", 9, 16), ("chorus B", 17, 20),
            ("breakdown", 21, 22), ("final chorus", 23, 26), ("ending", 27, 28))


def db(x: float) -> float:
    return 20 * np.log10(max(x, 1e-12))


def rms(x: np.ndarray) -> float:
    return float(np.sqrt(np.mean(x ** 2)))


def probe(path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=sample_rate,channels,codec_name",
         "-of", "json", str(path)], capture_output=True, text=True, check=True).stdout
    return json.loads(out)["streams"][0]


def onsets(x: np.ndarray, threshold: float, refractory: float = 0.12) -> np.ndarray:
    """Times where a signal's short-term level jumps (start of a hit)."""
    win = n_samples(0.002)
    env = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, mode="same"))
    hop = n_samples(0.001)
    env = env[::hop]
    rise = np.maximum(env[5:] - env[:-5], 0)  # growth over 5 ms
    found, last = [], -1e9
    for i in np.nonzero(rise > threshold * rise.max())[0]:
        t = i * hop / SR
        if t - last > refractory:
            found.append(t)
        last = t
    return np.array(found)


def report_stem(name: str, edit: dict) -> np.ndarray:
    path = AUDIO_OUT / f"{name}.mp3"
    x = decode(path)
    info, stats = probe(path), measure(path)
    beat = beat_seconds(edit)
    print(f"\n== {name}.mp3 ==")
    print(f"decoded length {len(x) / SR:.4f} s ({len(x)} samples), film length {total_beats(edit) * beat:.3f} s, "
          f"{info['sample_rate']} Hz, {info['channels']} ch, {info['codec_name']}")
    print(f"integrated loudness {stats['lufs']:.1f} LUFS, true peak {stats['true_peak']:.1f} dBTP, "
          f"sample peak {db(np.max(np.abs(x))):.1f} dBFS, samples at full scale: {int(np.sum(np.abs(x) >= 0.999))}, "
          f"DC offset {db(abs(float(x.mean()))):.0f} dBFS")
    tail = x[-n_samples(0.05):]
    print(f"last 50 ms peak {db(np.max(np.abs(tail))):.0f} dBFS, left/right correlation "
          f"{float(np.corrcoef(x[:, 0], x[:, 1])[0, 1]):.2f}")
    mono = x.mean(axis=1)
    total = rms(mono)
    print("band energy (dB relative to the whole mix): " +
          ", ".join(f"{label} {db(rms(bandpass(mono, lo, hi, 4))) - db(total):+.1f}" for label, lo, hi in BANDS))
    print(f"above 8 kHz: {db(rms(highpass(mono, 8000, 4))) - db(total):+.1f} dB")
    return x


def report_sections(x: np.ndarray, edit: dict) -> None:
    beat = beat_seconds(edit)
    mono = x.mean(axis=1)
    print("section levels (RMS dBFS; and share above 4 kHz):")
    for label, first, last in SECTIONS:
        seg = mono[n_samples(4 * (first - 1) * beat):n_samples(4 * last * beat)]
        print(f"  bars {first:2d}-{last:2d} {label:13s} {db(rms(seg)):6.1f} dBFS   highs {db(rms(highpass(seg, 4000, 4))) - db(rms(seg)):+.1f} dB"
              f"   sub {db(rms(lowpass(seg, 120, 4))) - db(rms(seg)):+.1f} dB")


def report_kick_grid(x: np.ndarray, edit: dict) -> None:
    """Slide the kick's own waveform along the mix and see where it fits best."""
    beat = beat_seconds(edit)
    template = kick()
    mono = x.mean(axis=1)
    reach = n_samples(0.06)
    lags, on_beat, off_beat = [], [], []
    for b in range(32, 64):  # bars 9-16: a kick is written on every beat
        for target, store in ((b, on_beat), (b + 0.5, off_beat)):
            start = n_samples(target * beat) - reach
            match = signal.correlate(mono[start:start + 2 * reach + len(template)], template, mode="valid")
            store.append(match.max())
            if target == b:
                lags.append(1000 * (np.argmax(match) - reach) / SR)
    present = int(np.sum(np.array(on_beat) > 2 * np.median(off_beat)))
    print(f"kick grid, bars 9-16: kick found on {present} of 32 beats; best fit is {np.mean(lags):+.2f} ms from the "
          f"grid on average, worst {max(lags, key=abs):+.2f} ms")


def report_sfx_cues(x: np.ndarray, edit: dict) -> None:
    beat = beat_seconds(edit)
    mono = x.mean(axis=1)
    win = n_samples(0.002)
    env = np.convolve(np.abs(mono), np.ones(win) / win, mode="same")
    jump = env[n_samples(0.003):] - env[:-n_samples(0.003)]  # growth over 3 ms
    print("sound effects against their cues:")
    worst = 0.0
    for cue in edit["sfx"]:
        at = cue["at"] * beat
        length = cue.get("beats", 0) * beat
        kind = cue["type"]
        if kind in ("riser", "zoom"):          # these END on their target: where does the hiss of the swell peak?
            a, b = n_samples(at), n_samples(at + length)
            hiss = np.abs(highpass(mono[a:b], 1500, 4))
            smooth = np.convolve(hiss, np.ones(n_samples(0.05)) / n_samples(0.05), mode="same")
            found, target, what = at + np.argmax(smooth) / SR, at + length, "peaks"
        elif kind == "whoosh":                 # loudest on the cue
            a = n_samples(at - 0.4)
            smooth = np.convolve(np.abs(mono[a:n_samples(at + 0.4)]), np.ones(n_samples(0.03)) / n_samples(0.03), mode="same")
            found, target, what = at - 0.4 + np.argmax(smooth) / SR, at, "loudest"
        else:                                  # these START on the cue: find the sharpest jump in level
            a = n_samples(at - 0.05)
            found, target, what = at - 0.05 + np.argmax(jump[a:n_samples(at + 0.05)]) / SR, at, "starts"
        error = 1000 * (found - target)
        if kind not in ("riser", "zoom"):
            worst = max(worst, abs(error))
        print(f"  beat {cue['at']:6.2f} {kind:11s} {what:7s} {found:7.3f} s, target {target:7.3f} s ({error:+.0f} ms)")
    print(f"  worst offset for effects that start or peak on a cue: {worst:.0f} ms (one video frame is 33 ms); "
          "risers and zooms swell until just before their target, then stop")


def report_harmony(x: np.ndarray, edit: dict) -> None:
    """Is the music in key, and does the bass follow the written chords?"""
    from score import CHORDS, PROGRESSION, SECTION

    beat = beat_seconds(edit)
    mono = x.mean(axis=1)
    names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    in_key = {"D", "E", "F#", "G", "A", "B", "C#"}
    # Energy per pitch class from 100 Hz to 2 kHz over the whole piece.
    f, p = signal.welch(mono, SR, nperseg=1 << 16)
    keep = (f >= 100) & (f <= 2000)
    pitch_class = np.round(12 * np.log2(f[keep] / 440.0) + 69).astype(int) % 12
    energy = np.array([p[keep][pitch_class == k].sum() for k in range(12)])
    inside = sum(energy[k] for k in range(12) if names[k] in in_key)
    outside = sum(energy[k] for k in range(12) if names[k] not in in_key)
    order = np.argsort(energy)[::-1]
    print(f"pitch classes, strongest first: {' '.join(names[k] for k in order)}; notes outside D major carry "
          f"{10 * np.log10(outside / inside):.1f} dB relative to notes inside it")
    # Low register per bar, in the sections that have a bass line: the strongest
    # note between 98 and 185 Hz (bass overtones and the bottom of the piano)
    # should be a tone of the chord written for that bar.
    tones = {"D": "D F# A", "A": "A C# E", "Bm": "B D F#", "G": "G B D"}
    low_notes = {"G": 98.00, "A": 110.00, "B": 123.47, "C#": 138.59, "D": 146.83, "E": 164.81, "F#": 185.00}
    right = total = 0
    wrong = []
    for bar, chord in enumerate(PROGRESSION, start=1):
        if SECTION[bar] not in ("groove", "chorus", "chorus_b", "final"):
            continue
        seg = mono[n_samples(4 * (bar - 1) * beat):n_samples(4 * bar * beat)]
        spectrum = np.abs(np.fft.rfft(seg * np.hanning(len(seg))))
        freqs = np.fft.rfftfreq(len(seg), 1 / SR)
        strength = {note: spectrum[(freqs > f0 - 2) & (freqs < f0 + 2)].max() for note, f0 in low_notes.items()}
        heard = max(strength, key=strength.get)
        total += 1
        if heard in tones[chord].split():
            right += 1
        else:
            wrong.append(f"bar {bar} ({chord}): strongest low note {heard}")
    print(f"strongest low note is a tone of the written chord in {right} of {total} bars" + (": " + "; ".join(wrong) if wrong else ""))
    # The breakdown chord that the picture lands on.
    a = n_samples(84 * beat - 0.05)
    mid = signal.sosfiltfilt(signal.butter(2, [150, 1500], "bandpass", fs=SR, output="sos"), mono)  # no filter delay
    env = np.convolve(np.abs(mid), np.ones(n_samples(0.002)) / n_samples(0.002), mode="same")
    jump = env[n_samples(0.004):] - env[:-n_samples(0.004)]
    found = 84 * beat - 0.05 + np.argmax(jump[a:n_samples(84 * beat + 0.05)]) / SR
    print(f"breakdown piano chord starts at {found:.3f} s, written for {84 * beat:.3f} s ({1000 * (found - 84 * beat):+.0f} ms)")
    left, right_ = rms(x[:, 0]), rms(x[:, 1])
    print(f"left/right balance {db(left) - db(right_):+.2f} dB")


def report_voice(edit: dict) -> None:
    data = json.loads((REPO / "src" / "generated" / "voice.json").read_text())
    print(f"\n== voice ({data['voice']}) ==")
    for cue in edit["voice"]:
        clip = data["clips"][cue["id"]]
        path = AUDIO_OUT / "voice" / f"{cue['id']}.mp3"
        x = decode(path)
        stats = measure(path)
        fits = "ok" if clip["seconds"] <= cue["maxSeconds"] else "TOO LONG"
        print(f"{cue['id']:13s} {clip['seconds']:5.2f} s of {cue['maxSeconds']:.1f} s {fits:8s} speed {clip['speed']:.2f}  "
              f"{stats['lufs']:6.1f} LUFS  peak {db(np.max(np.abs(x))):5.1f} dBFS")
        print(f"   wanted: {cue.get('speak') or cue['text'].replace(chr(10), ' ')}")
        print(f"   heard:  {clip['transcript']}")


def main() -> None:
    edit = load_edit()
    score = report_stem("score", edit)
    report_sections(score, edit)
    report_kick_grid(score, edit)
    report_harmony(score, edit)
    sfx = report_stem("sfx", edit)
    report_sfx_cues(sfx, edit)
    report_voice(edit)


if __name__ == "__main__":
    main()
