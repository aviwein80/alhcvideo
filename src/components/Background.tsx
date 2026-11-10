import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS} from '../theme';

const VARIANTS = {
	paper: {base: COLORS.paper, glow: COLORS.white},
	maroon: {base: COLORS.maroonDeep, glow: COLORS.maroon},
	orange: {base: COLORS.orange, glow: '#EC6F3F'},
	hero: {base: COLORS.maroonDeep, glow: COLORS.brick},
} as const;

/** Full-frame brand background with a soft glow that drifts slowly. */
export const Background: React.FC<{variant: keyof typeof VARIANTS; children?: React.ReactNode}> = ({variant, children}) => {
	const frame = useCurrentFrame();
	const {base, glow} = VARIANTS[variant];
	const gx = 50 + Math.sin(frame / 90) * 12;
	const gy = 42 + Math.cos(frame / 120) * 8;
	return (
		<AbsoluteFill
			style={{
				backgroundColor: base,
				backgroundImage: `radial-gradient(ellipse 75% 70% at ${gx}% ${gy}%, ${glow} 0%, ${base} 100%)`,
			}}
		>
			{children}
		</AbsoluteFill>
	);
};
