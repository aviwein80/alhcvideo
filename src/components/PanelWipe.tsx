import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EASE_IN_OUT} from '../lib/anim';
import {WIPE_FRAMES} from '../theme';

export type WipeDirection = 'up' | 'left' | 'right';

/**
 * Two colored panels sweep across the frame to hide a cut. Place it in a
 * Sequence that starts WIPE_FRAMES before the cut and lasts 2 × WIPE_FRAMES:
 * the second panel covers the whole frame exactly on the cut.
 */
export const PanelWipe: React.FC<{direction: WipeDirection; colors: [string, string]}> = ({direction, colors}) => {
	const frame = useCurrentFrame();
	const lead = 5;
	// -100 = waiting off-screen, 0 = covering the frame, 100 = gone.
	const travel = (f: number) =>
		interpolate(f, [0, WIPE_FRAMES * 2], [-100, 100], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: EASE_IN_OUT,
		});
	const transform = (pos: number) =>
		direction === 'up' ? `translateY(${-pos}%)` : `translateX(${direction === 'left' ? -pos : pos}%)`;

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{backgroundColor: colors[0], transform: transform(travel(frame + lead))}} />
			<AbsoluteFill style={{backgroundColor: colors[1], transform: transform(travel(frame))}} />
		</AbsoluteFill>
	);
};
