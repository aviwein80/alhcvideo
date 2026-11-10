import React from 'react';
import {pop, ramp} from '../lib/anim';
import {COLORS, FONTS} from '../theme';
import {Leaf} from './Leaf';

/**
 * Title card for a room in the tour: a white card with a leaf bullet, plus an
 * optional second line on a maroon chip. `start`/`end` are frames.
 */
export const RoomLabel: React.FC<{title: string; chip?: string; frame: number; start: number; end: number; chipDelay?: number}> = ({
	title,
	chip,
	frame,
	start,
	end,
	chipDelay = 30,
}) => {
	if (frame < start || frame > end) {
		return null;
	}
	const out = 1 - ramp(frame, end - 8, 8);
	const inCard = pop(frame, start, 13);
	const inChip = pop(frame, start + chipDelay, 13);
	return (
		<div style={{position: 'absolute', left: 96, top: 128, opacity: out, transform: `translateY(${(1 - out) * -30}px)`}}>
			<div
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: 22,
					backgroundColor: COLORS.white,
					borderRadius: 32,
					padding: '20px 44px 24px 32px',
					boxShadow: '0 18px 44px rgba(124, 38, 30, 0.18)',
					transform: `scale(${0.6 + 0.4 * inCard}) rotate(${(1 - inCard) * -4}deg)`,
					transformOrigin: 'left center',
					opacity: Math.min(1, inCard * 2),
				}}
			>
				<Leaf size={52} rotate={-18 + 18 * inCard} />
				<div style={{fontFamily: FONTS.headline, fontWeight: 700, fontSize: 62, lineHeight: 1.1, color: COLORS.maroon, whiteSpace: 'nowrap'}}>
					{title}
				</div>
			</div>
			{chip ? (
				<div style={{marginTop: 16, marginLeft: 28}}>
					<div
						style={{
							display: 'inline-block',
							backgroundColor: COLORS.maroon,
							color: COLORS.white,
							fontFamily: FONTS.body,
							fontWeight: 700,
							fontSize: 32,
							padding: '12px 30px 14px',
							borderRadius: 999,
							transform: `scale(${inChip})`,
							transformOrigin: 'left center',
							whiteSpace: 'nowrap',
						}}
					>
						{chip}
					</div>
				</div>
			) : null}
		</div>
	);
};
