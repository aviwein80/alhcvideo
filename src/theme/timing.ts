import edit from '../edit.json';

// Everything in the film is timed in beats, so picture and sound follow one
// tempo. FPS and BPM live in src/edit.json, the cue sheet shared with the
// audio scripts in scripts/audio. At 120 BPM, 1 beat = 15 frames and 1 bar
// (4 beats) = 2 seconds.
export const FPS = edit.fps;
export const BPM = edit.bpm;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Converts a number of beats to frames. Use for every delay and duration. */
export const beats = (n: number): number => Math.round((n * 60 * FPS) / BPM);

/** Converts seconds to frames (for audio clip lengths). */
export const seconds = (n: number): number => Math.round(n * FPS);

/** Half-length of the panel wipe that covers a cut, in frames. */
export const WIPE_FRAMES = 12;

/** Bottom strip reserved for captions. Scene content stays above it. */
export const CAPTION_SAFE = 150;
