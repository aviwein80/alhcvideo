import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';

/** A quick flash of light on a hard cut, fading over `duration` frames. */
export const Flash: React.FC<{frame: number; start?: number; duration?: number; color?: string; strength?: number}> = ({
	frame,
	start = 0,
	duration = 9,
	color = '#FFFFFF',
	strength = 0.85,
}) => {
	const opacity = interpolate(frame, [start, start + duration], [strength, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	if (frame < start || opacity <= 0) {
		return null;
	}
	return <AbsoluteFill style={{backgroundColor: color, opacity}} />;
};
