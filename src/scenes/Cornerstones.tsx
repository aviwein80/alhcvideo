import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Flash} from '../components/Flash';
import {WordReveal} from '../components/WordReveal';
import {CONTENT} from '../content';
import {pop, ramp, rand} from '../lib/anim';
import {COLORS, FONTS, HEIGHT, WIDTH, beats} from '../theme';

// The two blocks at rest: a pill 1540 wide, centred, split down the middle.
const BLOCK = {left: 190, top: 220, height: 330, radius: 44};

/**
 * Scene 3 — lands on the first drop. Two blocks are already locked together
 * when the scene cuts in, with a flash and a jolt; at the end they swell to
 * fill the frame and become the doors of the next scene.
 */
export const Cornerstones: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const {left, joiner, right, lines} = CONTENT.cornerstones;

	// Impact on the cut: punch-in, a short shake and a ring.
	const punch = interpolate(frame, [0, 10], [1.2, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
	const shake = Math.max(0, 1 - frame / 10) * 16;
	const ring = ramp(frame, 0, 26);

	// Exit: copy clears, then the blocks grow to the full frame.
	const clear = ramp(frame, durationInFrames - beats(1.6), beats(0.5), Easing.in(Easing.quad));
	const grow = ramp(frame, durationInFrames - beats(1), beats(1), Easing.in(Easing.cubic));
	const lerp = (a: number, b: number) => a + (b - a) * grow;
	const top = lerp(BLOCK.top, 0);
	const height = lerp(BLOCK.height, HEIGHT);
	const edge = lerp(BLOCK.left, 0);
	const radius = BLOCK.radius * (1 - grow);

	const blockText: React.CSSProperties = {
		position: 'absolute',
		top: BLOCK.top,
		height: BLOCK.height,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		fontFamily: FONTS.headline,
		fontWeight: 700,
		fontSize: 92,
		lineHeight: 1.04,
		color: COLORS.white,
		opacity: 1 - clear,
	};
	const support: React.CSSProperties = {
		fontFamily: FONTS.headline,
		fontWeight: 600,
		fontSize: 66,
		color: COLORS.maroon,
		textAlign: 'center',
	};

	return (
		<Background variant="paper">
			<AbsoluteFill
				style={{
					transform: `translate(${(rand(frame) - 0.5) * shake}px, ${(rand(frame + 50) - 0.5) * shake}px) scale(${punch})`,
					transformOrigin: `${WIDTH / 2}px ${BLOCK.top + BLOCK.height / 2}px`,
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: edge,
						top,
						width: WIDTH / 2 - edge,
						height,
						backgroundColor: COLORS.maroon,
						borderRadius: `${radius}px 0 0 ${radius}px`,
					}}
				/>
				<div
					style={{
						position: 'absolute',
						left: WIDTH / 2,
						top,
						width: WIDTH / 2 - edge,
						height,
						backgroundColor: COLORS.orange,
						borderRadius: `0 ${radius}px ${radius}px 0`,
					}}
				/>
				<div style={{...blockText, left: BLOCK.left + 80}}>
					{left.map((l) => (
						<div key={l}>{l}</div>
					))}
				</div>
				<div style={{...blockText, left: WIDTH / 2 + 108}}>
					{right.map((l) => (
						<div key={l}>{l}</div>
					))}
				</div>

				{/* Pulse and "&" badge on the seam. */}
				<div
					style={{
						position: 'absolute',
						left: WIDTH / 2 - 700,
						top: BLOCK.top + BLOCK.height / 2 - 700,
						width: 1400,
						height: 1400,
						borderRadius: '50%',
						border: `8px solid ${COLORS.peach}`,
						transform: `scale(${ring})`,
						opacity: 0.9 * (1 - ring),
					}}
				/>
				<div
					style={{
						position: 'absolute',
						left: WIDTH / 2 - 66,
						top: BLOCK.top + BLOCK.height / 2 - 66,
						width: 132,
						height: 132,
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
						transform: `scale(${pop(frame, 3) * (1 - clear)})`,
					}}
				>
					<span style={{marginTop: -6}}>{joiner}</span>
				</div>

				<div style={{position: 'absolute', left: 0, right: 0, top: BLOCK.top + BLOCK.height + 74, opacity: 1 - clear}}>
					<WordReveal text={lines[0]} frame={frame} start={beats(5.5)} stagger={3} duration={16} style={support} />
					<WordReveal text={lines[1]} frame={frame} start={beats(7)} stagger={3} duration={16} style={support} />
				</div>
			</AbsoluteFill>
			<Flash frame={frame} />
		</Background>
	);
};
