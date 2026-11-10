import {Easing, interpolate, spring} from 'remotion';
import {FPS} from '../theme/timing';

/** Fast start, long soft landing. The default ease for anything entering. */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

/** 0 → 1 between `start` and `start + duration`, clamped, eased. */
export const ramp = (
	frame: number,
	start: number,
	duration: number,
	easing: (t: number) => number = EASE_OUT,
): number =>
	interpolate(frame, [start, start + duration], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing,
	});

/** 0 → 1 spring with a slight overshoot, starting at `start`. */
export const pop = (frame: number, start: number, damping = 12): number =>
	spring({frame: frame - start, fps: FPS, config: {damping, mass: 0.6, stiffness: 140}});

/** Deterministic pseudo-random number in [0, 1) for a given seed. */
export const rand = (seed: number): number => {
	const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};
