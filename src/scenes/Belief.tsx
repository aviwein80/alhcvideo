import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Label} from '../components/Label';
import {TreeMark} from '../components/TreeMark';
import {Underline} from '../components/Underline';
import {WordReveal} from '../components/WordReveal';
import {CONTENT} from '../content';
import {pop, ramp} from '../lib/anim';
import {CAPTION_SAFE, COLORS, FONTS, beats} from '../theme';

/** Scene 2 — the philosophy statement, landing on "holistic." */
export const Belief: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const {label, lines, emphasis} = CONTENT.belief;
	const land = beats(4);
	const line: React.CSSProperties = {fontFamily: FONTS.headline, fontWeight: 600, fontSize: 116, color: COLORS.white};
	// Slow push that tightens through the build into the next scene.
	const push = interpolate(frame, [0, land, durationInFrames], [1, 1.02, 1.09]);

	return (
		<Background variant="maroon">
			<TreeMark
				height={1000}
				color={COLORS.peach}
				opacity={0.07}
				style={{position: 'absolute', right: -220, top: 30, transform: `scale(${1 + frame / 1200})`}}
			/>
			<AbsoluteFill
				style={{
					padding: `0 170px ${CAPTION_SAFE}px`,
					justifyContent: 'center',
					transform: `scale(${push})`,
					transformOrigin: '30% 60%',
				}}
			>
				<Label text={label} frame={frame} start={8} color={COLORS.peach} />
				<div style={{height: 40}} />
				<WordReveal text={lines[0]} frame={frame} start={beats(0.9)} stagger={3} duration={16} style={line} />
				<WordReveal text={lines[1]} frame={frame} start={beats(2.4)} stagger={4} duration={16} style={line} />
				<div
					style={{
						position: 'relative',
						alignSelf: 'flex-start',
						marginTop: 6,
						fontFamily: FONTS.headline,
						fontWeight: 700,
						fontSize: 250,
						lineHeight: 1.05,
						color: COLORS.white,
						opacity: ramp(frame, land, 6),
						transform: `scale(${0.8 + 0.2 * pop(frame, land)})`,
						transformOrigin: 'left bottom',
					}}
				>
					{emphasis}
					<Underline frame={frame} start={land + 6} duration={18} color={COLORS.orange} thickness={16} />
				</div>
			</AbsoluteFill>
		</Background>
	);
};
