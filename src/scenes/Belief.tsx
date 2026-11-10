import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
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
	const {label, lines, emphasis} = CONTENT.belief;
	const land = beats(4);
	const line: React.CSSProperties = {fontFamily: FONTS.headline, fontWeight: 600, fontSize: 116, color: COLORS.white};

	return (
		<Background variant="maroon">
			<TreeMark
				height={1000}
				color={COLORS.peach}
				opacity={0.07}
				style={{position: 'absolute', right: -220, top: 30, transform: `scale(${1 + frame / 2200})`}}
			/>
			<AbsoluteFill style={{padding: `0 170px ${CAPTION_SAFE}px`, justifyContent: 'center'}}>
				<Label text={label} frame={frame} start={8} color={COLORS.peach} />
				<div style={{height: 40}} />
				<WordReveal text={lines[0]} frame={frame} start={beats(0.75)} stagger={4} style={line} />
				<WordReveal text={lines[1]} frame={frame} start={beats(2)} stagger={5} style={line} />
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
						opacity: ramp(frame, land, 8),
						transform: `scale(${0.8 + 0.2 * pop(frame, land)})`,
						transformOrigin: 'left bottom',
					}}
				>
					{emphasis}
					<Underline frame={frame} start={land + 8} duration={22} color={COLORS.orange} thickness={16} />
				</div>
			</AbsoluteFill>
		</Background>
	);
};
