import React from 'react';
import {LEAF} from '../brand/logoParts';

/** A single leaf lifted from the logo, used as a bullet and accent. */
export const Leaf: React.FC<{size: number; color?: string; rotate?: number; scale?: number; style?: React.CSSProperties}> = ({
	size,
	color = LEAF.fill,
	rotate = 0,
	scale = 1,
	style,
}) => (
	<svg
		height={size}
		width={(size * LEAF.w) / LEAF.h}
		viewBox={`${LEAF.cx - LEAF.w / 2} ${LEAF.cy - LEAF.h / 2} ${LEAF.w} ${LEAF.h}`}
		style={{overflow: 'visible', transform: `rotate(${rotate}deg) scale(${scale})`, flexShrink: 0, ...style}}
	>
		<path d={LEAF.d} fill={color} />
	</svg>
);
