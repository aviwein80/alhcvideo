// Everything in the film is timed in beats, so the whole edit follows one
// tempo. With no music supplied the grid runs at 90 BPM (1 beat = 20 frames).
// When a track is added to assets/music, set BPM to its tempo: scene lengths,
// cuts and accents all move with it.
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const BPM = 90;

/** Converts a number of beats to frames. Use for every delay and duration. */
export const beats = (n: number): number => Math.round((n * 60 * FPS) / BPM);

/** Half-length of the panel wipe that covers each cut, in frames. */
export const WIPE_FRAMES = 12;

/** Bottom strip reserved for captions. Scene content stays above it. */
export const CAPTION_SAFE = 150;
