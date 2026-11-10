import React from 'react';
import {BASE, GROUND, LEAVES, TRUNK} from '../brand/logoParts';

const PARTS = [...GROUND, ...BASE, TRUNK, ...LEAVES];
const x1 = Math.min(...PARTS.map((s) => s.cx - s.w / 2));
const x2 = Math.max(...PARTS.map((s) => s.cx + s.w / 2));
const y1 = Math.min(...PARTS.map((s) => s.cy - s.h / 2));
const y2 = Math.max(...PARTS.map((s) => s.cy + s.h / 2));

/**
 * The tree from the logo as a single-colour watermark, the way the website
 * uses it behind its intro copy. Decorative only; it is not the logo lockup.
 */
export const TreeMark: React.FC<{height: number; color: string; opacity?: number; style?: React.CSSProperties}> = ({
	height,
	color,
	opacity = 0.08,
	style,
}) => (
	<svg
		height={height}
		width={(height * (x2 - x1)) / (y2 - y1)}
		viewBox={`${x1} ${y1} ${x2 - x1} ${y2 - y1}`}
		style={{opacity, ...style}}
	>
		{PARTS.map((s) => (
			<path key={s.d} d={s.d} fill={color} />
		))}
	</svg>
);
