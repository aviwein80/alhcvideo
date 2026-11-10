# Audio for the brand ad

Everything the ad plays is generated here, in code, from the same cue sheet
the picture uses (`src/edit.json`). No samples, no stock music, no paid
services and no API keys.

| Output | What it is |
|--------|------------|
| `assets/audio/score.mp3` | The original score: 28 bars, D major, 120 BPM, 56.0 s |
| `assets/audio/sfx.mp3` | Sound effects, one stem the same length as the film |
| `assets/audio/voice/<id>.mp3` | One voiceover clip per line in `edit.json` → `voice` |
| `src/generated/voice.json` | Length of each voice clip, the speed used, and word timings |

## Scripts

| File | Job |
|------|-----|
| `synth.py` | Shared toolkit: oscillators, instruments, drums, delay, reverb, limiter, measuring and MP3 encoding |
| `score.py` | The composition, bar by bar, and its mix and master. `--stems` prints how loud each instrument group sits |
| `sfx.py` | Builds every effect listed in `edit.json` → `sfx` at its cue time |
| `voice.py` | Speaks each line with Kokoro, trims and level-matches it, then transcribes it to get word timings |
| `verify.py` | Measurement report (see below) |
| `build.py` | Runs all of the above in order, or one step by name |

Timing (tempo, cue times, voice lines and their allowed lengths) is read from
`src/edit.json`. The score itself is written for 28 bars; if the film's length
in beats changes, `score.py` stops and says so, because the music has to be
re-arranged, not just re-rendered.

## Set up (once)

```bash
python3 -m venv .cache/venv
```

```bash
.cache/venv/bin/pip install numpy scipy soundfile kokoro-onnx faster-whisper
```

```bash
mkdir -p .cache/kokoro && curl -L -o .cache/kokoro/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
```

```bash
curl -L -o .cache/kokoro/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```

`ffmpeg` and `ffprobe` must be on the PATH. `.cache/` is git-ignored: the
virtualenv, the voice model (about 350 MB) and the speech-recognition model
are never committed. The score and effects need only numpy, scipy and
soundfile; the voice step needs the rest.

## Rebuild

```bash
.cache/venv/bin/python scripts/audio/build.py
```

One step at a time: `build.py score`, `build.py sfx`, `build.py voice`,
`build.py verify`. Builds are deterministic (fixed random seeds), so the same
inputs give the same audio. Uncompressed masters are kept in `.cache/audio/`.

## The voice

- Model: **Kokoro-82M** (Apache-2.0), run locally through `kokoro-onnx`.
  Model files come from the `model-files-v1.0` release of
  `thewh1teagle/kokoro-onnx` on GitHub.
- Voice: `af_heart`. Change `VOICE` in `voice.py` to try another.
- Each line is spoken at normal speed. If it runs longer than its `maxSeconds`
  in `edit.json`, the speed is raised in small steps (up to 1.15×) until it
  fits; `voice.json` records the speed used.
- Word timings come from transcribing the finished clip with
  `faster-whisper` (`small.en`, MIT-licensed code, runs on CPU). The same
  transcript is the check that the right words were spoken.
- To write a pronunciation that differs from the caption, add `speak` to the
  line in `edit.json` (the web address is done this way).

## What `verify.py` measures

Nothing in this folder listens to the audio. The report is measurement only:

- Score and effects: decoded length, sample rate, integrated loudness and
  true peak (ffmpeg `ebur128`), clipping, DC offset, how energy is spread
  across four frequency bands, and the level of each section of the song.
- Kick drum timing: the kick's own waveform is matched against the mix on
  every beat of bars 9–16 and the offset from the beat grid is reported.
- Harmony: which pitch classes carry the energy (are they the notes of
  D major?) and whether the low register follows the written chords.
- Effects: where each one starts, peaks or ends, against its cue.
- Voice: length against its window, loudness, and the transcript next to
  the intended line.

Targets: score about −16 LUFS with true peak under −1.5 dBTP; effects stem
peaking under −6 dBFS; every voice clip about −18 LUFS with peaks under
−3 dBFS.
