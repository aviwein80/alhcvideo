import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {Leaf} from '../components/Leaf';
import {Underline} from '../components/Underline';
import {WordReveal} from '../components/WordReveal';
import {CONTENT} from '../content';
import {pop, ramp, rand} from '../lib/anim';
import {CAPTION_SAFE, COLORS, FONTS, HEIGHT, WIDTH, beats} from '../theme';

const LEAF_COUNT = 9;

/** Scene 7 — the emotional turn: "here you'll find family." */
export const Family: React.FC = () => {
	const frame = useCurrentFrame();
	const {lines, emphasis} = CONTENT.family;
	const land = beats(4);
	const line: React.CSSProperties = {
		fontFamily: FONTS.headline,
		fontWeight: 600,
		fontSize: 76,
		color: COLORS.maroon,
		textAlign: 'center',
	};

	return (
		<Background variant="paper">
			{/* Leaves from the logo drifting down the edges of the frame. */}
			{Array.from({length: LEAF_COUNT}, (_, i) => {
				// Keep leaves to the outer edges so they never cross the type.
				const side = i % 2 === 0 ? 0 : 1;
				const x = (side ? 0.8 : 0.02) * WIDTH + rand(i + 1) * 0.18 * WIDTH + Math.sin(frame / 34 + i) * 30;
				const y = ((rand(i + 11) * HEIGHT + frame * (1.6 + rand(i + 21) * 1.6)) % (HEIGHT + 200)) - 100;
				return (
					<Leaf
						key={i}
						size={46 + rand(i + 31) * 54}
						color={i % 3 === 0 ? COLORS.orange : COLORS.peach}
						rotate={rand(i + 41) * 360 + frame * (0.5 + rand(i + 51))}
						style={{position: 'absolute', left: x, top: y, opacity: 0.75}}
					/>
				);
			})}

			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: CAPTION_SAFE}}>
				<WordReveal text={lines[0]} frame={frame} start={8} stagger={4} style={line} />
				<WordReveal text={lines[1]} frame={frame} start={beats(2)} stagger={4} style={line} />
				<div
					style={{
						position: 'relative',
						fontFamily: FONTS.headline,
						fontWeight: 700,
						fontSize: 330,
						lineHeight: 1.02,
						color: COLORS.orange,
						opacity: ramp(frame, land, 8),
						transform: `scale(${0.78 + 0.22 * pop(frame, land)})`,
					}}
				>
					{emphasis}
					<Underline frame={frame} start={land + 8} duration={24} color={COLORS.maroon} thickness={18} />
				</div>
			</AbsoluteFill>
		</Background>
	);
};
