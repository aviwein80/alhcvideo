import React from 'react';
import {ramp} from '../lib/anim';

/** A brush-like underline that draws from left to right starting at `start`. */
export const Underline: React.FC<{
	frame: number;
	start: number;
	duration?: number;
	color: string;
	thickness?: number;
	style?: React.CSSProperties;
}> = ({frame, start, duration = 18, color, thickness = 10, style}) => {
	const p = ramp(frame, start, duration);
	return (
		<svg
			viewBox="0 0 600 30"
			preserveAspectRatio="none"
			style={{
				position: 'absolute',
				left: 0,
				bottom: '-0.14em',
				width: '100%',
				height: '0.2em',
				overflow: 'visible',
				// Wipe on from the left; the extra inset keeps the round caps visible.
				clipPath: `inset(-100% ${(1 - p) * 104 - 2}% -100% -2%)`,
				...style,
			}}
		>
			<path
				d="M6 20 C 150 4, 380 2, 594 14"
				fill="none"
				stroke={color}
				strokeWidth={thickness}
				strokeLinecap="round"
				vectorEffect="non-scaling-stroke"
			/>
		</svg>
	);
};
