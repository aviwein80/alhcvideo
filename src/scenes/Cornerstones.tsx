import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {WordReveal} from '../components/WordReveal';
import {CONTENT} from '../content';
import {pop, ramp} from '../lib/anim';
import {CAPTION_SAFE, COLORS, FONTS, beats} from '../theme';

const BLOCK_W = 770;
const BLOCK_H = 330;

const Block: React.FC<{lines: readonly string[]; color: string; side: 'left' | 'right'; offset: number}> = ({
	lines,
	color,
	side,
	offset,
}) => (
	<div
		style={{
			width: BLOCK_W,
			height: BLOCK_H,
			backgroundColor: color,
			borderRadius: side === 'left' ? '44px 0 0 44px' : '0 44px 44px 0',
			transform: `translateX(${side === 'left' ? -offset : offset}px)`,
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			padding: side === 'left' ? '0 0 0 80px' : '0 0 0 108px',
			fontFamily: FONTS.headline,
			fontWeight: 700,
			fontSize: 92,
			lineHeight: 1.04,
			color: COLORS.white,
		}}
	>
		{lines.map((l) => (
			<div key={l}>{l}</div>
		))}
	</div>
);

/** Scene 3 — two blocks lock together: the cornerstones of each center. */
export const Cornerstones: React.FC = () => {
	const frame = useCurrentFrame();
	const {left, right, lines} = CONTENT.cornerstones;
	const meet = beats(1.5);

	const offset = interpolate(frame, [2, meet], [1150, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.in(Easing.quad),
	});
	// A short, decaying jolt when the blocks meet.
	const since = frame - meet;
	const jolt = since >= 0 ? 1 + 0.045 * Math.exp(-since / 5) * Math.cos(since / 2) : 1;
	const ring = ramp(frame, meet, 26);
	const text: React.CSSProperties = {
		fontFamily: FONTS.headline,
		fontWeight: 600,
		fontSize: 66,
		color: COLORS.maroon,
		textAlign: 'center',
	};

	return (
		<Background variant="paper">
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: CAPTION_SAFE}}>
				<div style={{position: 'relative', display: 'flex', transform: `scale(${jolt})`}}>
					<Block lines={left} color={COLORS.maroon} side="left" offset={offset} />
					<Block lines={right} color={COLORS.orange} side="right" offset={offset} />
					{/* Pulse and "&" badge on the seam. */}
					<div
						style={{
							position: 'absolute',
							left: '50%',
							top: '50%',
							width: 1100,
							height: 1100,
							margin: -550,
							borderRadius: '50%',
							border: `6px solid ${COLORS.peach}`,
							transform: `scale(${ring})`,
							opacity: frame >= meet ? 0.9 * (1 - ring) : 0,
						}}
					/>
					<div
						style={{
							position: 'absolute',
							left: '50%',
							top: '50%',
							width: 132,
							height: 132,
							margin: -66,
							borderRadius: '50%',
							backgroundColor: COLORS.white,
							boxShadow: '0 10px 30px rgba(124, 38, 30, 0.28)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontFamily: FONTS.headline,
							fontWeight: 700,
							fontSize: 84,
							color: COLORS.maroon,
							transform: `scale(${pop(frame, meet + 1)})`,
						}}
					>
						<span style={{marginTop: -6}}>&amp;</span>
					</div>
				</div>
				<div style={{height: 76}} />
				<WordReveal text={lines[0]} frame={frame} start={beats(3.5)} stagger={3} style={text} />
				<WordReveal text={lines[1]} frame={frame} start={beats(3.5) + 14} stagger={3} style={text} />
			</AbsoluteFill>
		</Background>
	);
};
