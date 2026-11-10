"""The original score: 28 bars in D major, written to the picture.

Tempo and length come from src/edit.json. The arrangement below is the
composition itself, bar by bar:

  bars  1-4   intro        pad, ringing plucks, soft piano; swell into bar 5
  bars  5-7   groove A     first drop: kick, clap, bass, muted plucks
  bar   8     build        strips back, snare roll, opens up
  bars  9-16  chorus       full band and the lead melody; a fill into each room change
  bars 17-20  chorus B     same groove, G-D-A-Bm, no lead (room for the voice)
  bars 21-22  breakdown    pad and sparse piano, chord on bar 22 beat 1, short build
  bars 23-26  final chorus full band, lifted melody
  bars 27-28  ending       one D major hit that rings out to silence
"""
from __future__ import annotations

import numpy as np

from synth import (AUDIO_OUT, CACHE, SR, Mix, bandpass, bass_note, beat_seconds, bell, clap, crash, encode_mp3, hat,
                   highpass, hz, kick, kick_click, limiter, load_edit, lowpass, measure, n_samples, piano, ping_pong,
                   pluck, reverb, reverb_ir, shaker, sidechain, snare, supersaw, tom, total_beats, write_wav)

SEED = 20261110
TARGET_LUFS = -16.0
CEILING_DB = -2.6  # sample-peak ceiling; leaves room for true peaks and MP3 overshoot
BARS = 28

CHORDS = {
    "D": {"bass": "D2", "pad": ["A3", "D4", "F#4"], "arp": ["D4", "A4", "D5", "F#5"], "piano": ["D3", "A3", "D4", "F#4", "A4"]},
    "A": {"bass": "A1", "pad": ["A3", "C#4", "E4"], "arp": ["E4", "A4", "C#5", "E5"], "piano": ["A2", "E3", "A3", "C#4", "E4"]},
    "Bm": {"bass": "B1", "pad": ["B3", "D4", "F#4"], "arp": ["D4", "B4", "D5", "F#5"], "piano": ["B2", "F#3", "B3", "D4", "F#4"]},
    "G": {"bass": "G1", "pad": ["B3", "D4", "G4"], "arp": ["D4", "B4", "D5", "G5"], "piano": ["G2", "D3", "G3", "B3", "D4"]},
}
# One chord per bar (index 0 = bar 1).
PROGRESSION = ("D A Bm G " "D A Bm G " "D A Bm G D A Bm G " "G D A Bm " "G A " "D A Bm G " "D D").split()

SECTION = {}
for _bar in range(1, BARS + 1):
    SECTION[_bar] = ("intro" if _bar <= 4 else "groove" if _bar <= 7 else "build" if _bar == 8 else
                     "chorus" if _bar <= 16 else "chorus_b" if _bar <= 20 else "breakdown" if _bar <= 22 else
                     "final" if _bar <= 26 else "ending")

# Lead melody: (eighth-note slot in the bar, note). Chord tones, 3+3+2 feel.
MELODY_A = {
    0: [(0, "F#5"), (3, "A5"), (6, "D6")],
    1: [(0, "C#6"), (3, "A5"), (6, "E5"), (7, "A5")],
    2: [(0, "B5"), (3, "F#5"), (6, "D5"), (7, "F#5")],
    3: [(0, "G5"), (3, "B5"), (6, "D6")],
}
MELODY_LIFT = {
    0: [(0, "F#5"), (3, "A5"), (6, "D6"), (7, "E6")],
    1: [(0, "E6"), (3, "C#6"), (6, "A5"), (7, "C#6")],
    2: [(0, "D6"), (3, "B5"), (6, "F#5"), (7, "B5")],
    3: [(0, "D6"), (3, "B5"), (6, "G5"), (7, "A5")],
}
LEAD = {9: MELODY_A[0], 10: MELODY_A[1], 11: MELODY_A[2], 12: MELODY_A[3],
        13: MELODY_LIFT[0], 14: MELODY_LIFT[1], 15: MELODY_LIFT[2], 16: MELODY_LIFT[3],
        23: MELODY_LIFT[0], 24: MELODY_LIFT[1], 25: MELODY_LIFT[2], 26: MELODY_LIFT[3]}
# Sustained string note above each chorus bar.
STRINGS = {9: "F#5", 10: "E5", 11: "F#5", 12: "G5", 13: "A5", 14: "A5", 15: "B5", 16: "B5",
           23: "A5", 24: "A5", 25: "B5", 26: "B5"}

# Mix levels, tuned from the stem sheet (`python score.py --stems`).
LEVEL = {
    "kick": 0.64, "kick_click": 0.40, "clap": 0.60, "snare_layer": 0.26, "snare_roll": 0.46, "tom": 0.55,
    "hat": 0.42, "hat_light": 0.30, "open_hat": 0.30, "shaker": 0.26, "crash": 0.42, "splash": 0.32,
    "bass": 0.54, "bass_octave": 0.42, "pluck": 0.62, "pluck_intro": 0.40, "piano": 0.27, "piano_soft": 0.40,
    "pad": 0.34, "strings": 0.20, "bell": 0.30, "lead_pluck": 0.24, "reverb": 0.50,
}

ARP_8THS = [0, 1, 2, 1, 3, 1, 2, 1]
ARP_16THS = [0, 1, 2, 1, 3, 1, 2, 1, 0, 1, 2, 1, 3, 2, 1, 2]
ACCENTS_16THS = {0, 3, 6, 8, 11, 14}
STAB_SLOTS = (0, 3, 6)


def noise_swell(dur: float, rng) -> np.ndarray:
    """Reverse-cymbal style swell that peaks at its very end."""
    n = n_samples(dur)
    noise = bandpass(rng.standard_normal((n, 2)), 900, 6500)
    env = (np.arange(n) / n) ** 2.6
    env[-n_samples(0.012):] *= np.linspace(1, 0, n_samples(0.012))
    return noise * env[:, None]


def build_score(edit: dict) -> np.ndarray:
    beats = total_beats(edit)
    if beats != BARS * 4:
        raise SystemExit(f"The score is written for {BARS} bars ({BARS * 4} beats); edit.json has {beats:g} beats.")
    beat = beat_seconds(edit)
    seconds = beats * beat
    rng = np.random.default_rng(SEED)

    def at(bar: int, beat_in_bar: float = 0.0) -> float:
        """Seconds at a position in a bar (bars count from 1, beats from 0)."""
        return (4 * (bar - 1) + beat_in_bar) * beat

    low_drums, top_drums, wet_drums = Mix(seconds), Mix(seconds), Mix(seconds)
    bass, plucks, keys, pad, lead, fx = (Mix(seconds) for _ in range(6))
    kick_times: list[float] = []

    def hit_kick(time: float, vel: float = 1.0) -> None:
        low_drums.add(kick(vel), time, LEVEL["kick"])
        low_drums.add(kick_click(rng, vel), time, LEVEL["kick_click"])
        kick_times.append(time)

    def roll(bar: int, start: float, vel_from: float, vel_to: float) -> None:
        """Snare roll to the end of the bar: 16ths, then 32nds in the last beat."""
        positions = [p for p in np.arange(start, 4, 0.25) if p < 3] + list(np.arange(max(start, 3), 4, 0.125))
        for i, pos in enumerate(positions):
            vel = vel_from + (vel_to - vel_from) * (i / max(1, len(positions) - 1)) ** 1.5
            wet_drums.add(snare(rng, vel), at(bar, pos), LEVEL["snare_roll"])

    def fill(bar: int, big: bool) -> None:
        """Tom fill at the end of a bar, leading into the next downbeat."""
        if big:
            steps = [(2.0, "s"), (2.25, "s"), (2.5, "A3"), (2.75, "A3"), (3.0, "F#3"), (3.25, "F#3"), (3.5, "D3"), (3.75, "D3")]
        else:
            steps = [(3.0, "s"), (3.5, "F#3"), (3.75, "D3")]
        for i, (pos, what) in enumerate(steps):
            vel = 0.55 + 0.4 * i / len(steps)
            sound = snare(rng, vel) if what == "s" else tom(hz(what), vel)  # toms are tuned to the key
            wet_drums.add(sound, at(bar, pos), LEVEL["snare_roll"] if what == "s" else LEVEL["tom"],
                          pan=-0.4 + 0.8 * i / len(steps))
        fx.add(noise_swell(beat * 1.5, rng), at(bar, 2.5), 0.16)

    for bar in range(1, BARS + 1):
        chord = CHORDS[PROGRESSION[bar - 1]]
        section = SECTION[bar]
        driving = section in ("groove", "chorus", "chorus_b", "final")
        full = section in ("chorus", "final")

        # --- pad -----------------------------------------------------------
        if section != "ending":
            cutoff = {"intro": 1000 + 300 * (bar - 1), "groove": 1700, "build": 1600, "chorus": 2100,
                      "chorus_b": 1700, "breakdown": 1200 + 700 * (bar - 21), "final": 2300}[section]
            level = LEVEL["pad"] * {"intro": 1.25, "groove": 0.95, "build": 1.05, "chorus": 1.0, "chorus_b": 0.8,
                                    "breakdown": 1.35, "final": 1.05}[section]
            for name in chord["pad"]:
                pad.add(supersaw(hz(name), 4 * beat + 0.5, rng, cutoff, attack=0.9 if section in ("intro", "breakdown") else 0.25),
                        at(bar), level)
        if bar in STRINGS:
            pad.add(supersaw(hz(STRINGS[bar]), 4 * beat + 0.4, rng, 3200, attack=0.3), at(bar), LEVEL["strings"])

        # --- plucks --------------------------------------------------------
        if section == "intro":
            for slot, tone in enumerate(ARP_8THS):
                vel = 0.30 + 0.11 * (bar - 1) + (0.08 if slot % 4 == 0 else 0)
                plucks.add(pluck(hz(chord["arp"][tone]), 1.4, rng, tau=0.9, bright=2600), at(bar, slot / 2),
                           LEVEL["pluck_intro"] * vel,
                           pan=-0.35 if slot % 2 else 0.35)
        elif driving or section == "build":
            level = {"groove": 0.80, "build": 0.55, "chorus": 1.0, "chorus_b": 0.70, "final": 1.0}[section]
            for step, tone in enumerate(ARP_16THS):
                if section == "build" and step >= 8:
                    break
                vel = 0.78 if step in ACCENTS_16THS else 0.46
                plucks.add(pluck(hz(chord["arp"][tone]), 0.5, rng, tau=0.28, bright=4400 if full else 3600),
                           at(bar, step / 4), LEVEL["pluck"] * vel * level, pan=-0.4 if step % 2 else 0.4)
        elif bar == 22:
            for slot in range(4, 8):  # quiet rising pickup into the final chorus
                plucks.add(pluck(hz(chord["arp"][slot - 4]), 1.0, rng, tau=0.7, bright=2600), at(bar, slot / 2),
                           0.10 + 0.05 * (slot - 4), pan=0.3 if slot % 2 else -0.3)

        # --- piano ---------------------------------------------------------
        voicing = [hz(name) for name in chord["piano"]]
        if section == "intro":
            for i, f in enumerate(voicing[:1] + voicing[2:4]):
                keys.add(piano(f, 2.4, 0.36 + 0.05 * (bar - 1), rng), at(bar) + 0.012 * i, LEVEL["piano_soft"], pan=-0.1)
        elif driving:
            vel = 0.72 if full else 0.6
            for slot in STAB_SLOTS:
                notes = voicing[1:] if slot == 0 else voicing[2:]  # the bass has the root
                for i, f in enumerate(notes):
                    keys.add(piano(f, 1.0 if slot == 0 else 0.55, vel if slot == 0 else vel * 0.78, rng, tone=1.1),
                             at(bar, slot / 2) + 0.006 * i, LEVEL["piano"], pan=-0.1)
        elif section == "build":
            for i, f in enumerate(voicing):
                keys.add(piano(f, 2.6, 0.55, rng, tone=1.3), at(bar) + 0.012 * i, LEVEL["piano_soft"], pan=-0.1)

        # --- bass ----------------------------------------------------------
        if driving or section == "build":
            root = hz(chord["bass"])
            slots = range(8) if driving else range(4)
            for slot in slots:
                octave = 2 if (slot == 7 or (full and slot == 3)) else 1
                bass.add(bass_note(root * octave, beat * 0.46), at(bar, slot / 2),
                         LEVEL["bass"] if octave == 1 else LEVEL["bass_octave"])

        # --- drums ---------------------------------------------------------
        if driving:
            for b in range(4):
                hit_kick(at(bar, b))
            for b in (1, 3):
                wet_drums.add(clap(rng), at(bar, b), LEVEL["clap"])
                if full:
                    wet_drums.add(snare(rng, 0.8), at(bar, b), LEVEL["snare_layer"])
            for step in range(16):
                top_drums.add(shaker(rng, (0.9, 0.45, 0.7, 0.45)[step % 4]), at(bar, step / 4), LEVEL["shaker"], pan=-0.3)
            for slot in range(8):
                offbeat = slot % 2 == 1
                if section == "groove" and not offbeat:
                    continue
                if full and slot == 7:
                    top_drums.add(hat(rng, 0.9, open_=True), at(bar, slot / 2), LEVEL["open_hat"], pan=0.25)
                else:
                    top_drums.add(hat(rng, 0.85 if offbeat else 0.5), at(bar, slot / 2),
                                  LEVEL["hat"] if full else LEVEL["hat_light"], pan=0.25)
        elif section == "build":
            hit_kick(at(bar, 0))
            hit_kick(at(bar, 1), 0.85)
            roll(bar, 2.0, 0.18, 0.95)
            fx.add(noise_swell(beat * 2, rng), at(bar, 2), 0.20)

        # --- lead ----------------------------------------------------------
        for slot, name in LEAD.get(bar, []):
            f = hz(name)
            lead.add(bell(f, 1.3, 0.8), at(bar, slot / 2), LEVEL["bell"], pan=0.15)
            lead.add(pluck(f / 2, 0.9, rng, tau=0.5, bright=4200), at(bar, slot / 2), LEVEL["lead_pluck"], pan=0.15)

    # --- one-off events ----------------------------------------------------
    fx.add(noise_swell(beat * 3, rng), at(4, 1), 0.16)                      # swell into the first drop
    for step in range(8):                                                    # plucks quicken into the drop
        plucks.add(pluck(hz(CHORDS["G"]["arp"][ARP_16THS[step]]), 0.6, rng, tau=0.4, bright=2800),
                   at(4, 2 + step / 4), 0.10 + 0.02 * step, pan=0.3 if step % 2 else -0.3)
    for bar, vel, dur in ((5, 0.8, 2.2), (9, 1.0, 2.6), (13, 0.9, 2.4), (17, 0.8, 2.2), (23, 1.0, 2.6), (25, 0.8, 2.2)):
        fx.add(crash(rng, dur, vel), at(bar), LEVEL["crash"])
    for bar in (11, 15):                                                     # lighter splash on the other room changes
        fx.add(crash(rng, 1.0, 0.6), at(bar), LEVEL["splash"])
    for bar, big in ((10, False), (12, True), (14, False), (16, True), (20, False), (24, False), (26, True)):
        fill(bar, big)

    # Breakdown: sparse piano, with the chord exactly on bar 22 beat 1.
    for i, name in enumerate(("G3", "D4", "B4")):
        keys.add(piano(hz(name), 3.2, 0.46, rng, tone=1.3), at(21) + 0.012 * i, LEVEL["piano_soft"], pan=-0.1)
    keys.add(piano(hz("D5"), 2.0, 0.36, rng, tone=1.3), at(21, 2), LEVEL["piano_soft"])
    keys.add(piano(hz("B4"), 1.6, 0.32, rng, tone=1.3), at(21, 3), LEVEL["piano_soft"])
    for name in ("A3", "E4", "C#5"):  # all three notes start together, exactly on the beat
        keys.add(piano(hz(name), 3.2, 0.56, rng, tone=1.3), at(22), LEVEL["piano_soft"] * 1.1, pan=-0.1)
    keys.add(piano(hz("E5"), 2.0, 0.40, rng, tone=1.3), at(22, 2), LEVEL["piano_soft"])
    roll(22, 3.0, 0.15, 0.85)
    fx.add(noise_swell(beat * 1.5, rng), at(22, 2.5), 0.20)

    # Ending: one D major hit, left to ring.
    end = at(27)
    hit_kick(end)
    fx.add(crash(rng, 4.2, 1.0), end, LEVEL["crash"])
    t = np.arange(n_samples(3.0)) / SR
    low_drums.add(np.sin(2 * np.pi * hz("D2") * t) * np.exp(-t / 0.7), end, 0.38)
    for i, name in enumerate(("D2", "A2", "D3", "A3", "D4", "F#4", "A4", "D5")):
        keys.add(piano(hz(name), 5.0, 0.8, rng, tone=1.15), end + 0.008 * i, LEVEL["piano"] * 1.2, pan=-0.1)
    for name in ("A3", "D4", "F#4", "A4"):
        pad.add(supersaw(hz(name), 4.5, rng, 2300, attack=0.02, release=3.2), end, LEVEL["pad"])
    pad.add(supersaw(hz("A5"), 4.5, rng, 3200, attack=0.05, release=3.2), end, LEVEL["strings"])
    for name in ("F#5", "A5", "D6"):
        lead.add(bell(hz(name), 3.0, 0.8), end, 0.24, pan=0.15)
    for i, name in enumerate(("D5", "F#5", "A5", "D6")):                    # gentle rising bells, done by beat 106
        lead.add(bell(hz(name), 2.6, 0.55), at(27, 0.5 + i * 0.5), 0.17, pan=-0.3 + 0.2 * i)

    # --- mix ---------------------------------------------------------------
    n = n_samples(seconds)
    dotted_eighth = beat * 0.75
    pluck_bus = plucks.buf + 0.34 * ping_pong(plucks.buf, dotted_eighth)
    lead_bus = lead.buf + 0.32 * ping_pong(lead.buf, dotted_eighth, feedback=0.4)
    pump = lambda depth: sidechain(n, kick_times, depth)[:, None]
    bass_bus = lowpass(bass.buf, 2500) * pump(0.55)
    pad_bus = pad.buf * pump(0.28)
    pluck_bus *= pump(0.12)
    keys_bus = highpass(keys.buf, 110)

    send = (0.22 * pluck_bus + 0.26 * keys_bus + 0.34 * pad_bus + 0.42 * lead_bus + 0.30 * wet_drums.buf + 0.45 * fx.buf)
    wet = reverb(send, reverb_ir())

    stems = {"kick": low_drums.buf, "hats+shaker": top_drums.buf, "clap+snare+toms": wet_drums.buf, "bass": bass_bus,
             "plucks": pluck_bus, "piano": keys_bus, "pad+strings": pad_bus, "lead": lead_bus, "swells+crashes": fx.buf,
             "reverb": LEVEL["reverb"] * wet}
    mix = highpass(sum(stems.values()), 28)

    # Ring out to true silence at the end of the film.
    fade_from = n_samples(at(27, 2.5))
    mix[fade_from:] *= (0.5 + 0.5 * np.cos(np.linspace(0, np.pi, n - fade_from)))[:, None] ** 1.5
    mix[-n_samples(0.02):] = 0.0
    return mix, stems


def stem_sheet(mix: np.ndarray, stems: dict, edit: dict) -> None:
    """How loud each instrument group sits in the chorus, relative to the mix."""
    beat = beat_seconds(edit)
    a, b = n_samples(32 * beat), n_samples(64 * beat)  # bars 9-16
    level = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
    ref = level(mix[a:b])
    print("chorus stem levels (RMS dB relative to the mix | share of each stem above 4 kHz | below 120 Hz):")
    for name, stem in stems.items():
        seg = stem[a:b].mean(axis=1)
        print(f"  {name:16s} {level(stem[a:b]) - ref:+6.1f} dB   highs {level(highpass(seg, 4000, 4)) - level(seg):+6.1f}   "
              f"sub {level(lowpass(seg, 120, 4)) - level(seg):+6.1f}")


def master(mix: np.ndarray, wav) -> dict:
    """Set loudness to TARGET_LUFS, then hold peaks under the ceiling."""
    x = mix / np.max(np.abs(mix))
    for _ in range(4):
        write_wav(wav, x)
        boosted = x * 10 ** ((TARGET_LUFS - measure(wav)["lufs"]) / 20)
        x = limiter(boosted, CEILING_DB)
    x[-n_samples(0.02):] = 0.0
    write_wav(wav, x)
    stats = measure(wav)
    # How hard the limiter is working: a few dB on the loudest hits is normal.
    stats["limiting_db"] = float(20 * np.log10(np.max(np.abs(boosted)) / np.max(np.abs(x))))
    return stats


def main() -> None:
    import sys

    edit = load_edit()
    wav = CACHE / "audio" / "score.wav"
    mix, stems = build_score(edit)
    if "--stems" in sys.argv:
        stem_sheet(mix, stems, edit)
    stats = master(mix, wav)
    encode_mp3(wav, AUDIO_OUT / "score.mp3")
    print(f"score: {stats['lufs']:.1f} LUFS, true peak {stats['true_peak']:.1f} dBTP, limiter working up to "
          f"{stats['limiting_db']:.1f} dB (WAV master) -> assets/audio/score.mp3")


if __name__ == "__main__":
    main()
