import React from 'react';
import {pop, ramp} from '../lib/anim';
import {FONTS} from '../theme';
import {Leaf} from './Leaf';

/** Small tracked-out label with a leaf bullet, used above headlines. */
export const Label: React.FC<{text: string; frame: number; start: number; color: string; leafColor?: string}> = ({
	text,
	frame,
	start,
	color,
	leafColor,
}) => {
	const p = ramp(frame, start, 22);
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
			<Leaf size={38} color={leafColor} scale={pop(frame, start)} rotate={-20} />
			<div
				style={{
					fontFamily: FONTS.body,
					fontWeight: 700,
					fontSize: 30,
					letterSpacing: `${0.34 - 0.1 * p}em`,
					textTransform: 'uppercase',
					whiteSpace: 'nowrap',
					color,
					opacity: p,
				}}
			>
				{text}
			</div>
		</div>
	);
};
