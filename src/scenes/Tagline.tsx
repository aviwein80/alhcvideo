import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Flash} from '../components/Flash';
import {LeafBurst} from '../components/LeafBurst';
import {TreeMark} from '../components/TreeMark';
import {CONTENT} from '../content';
import {EASE_IN_OUT, ramp} from '../lib/anim';
import {CAPTION_SAFE, COLORS, HEIGHT, WIDTH, beats} from '../theme';

const WIDTH_PX = 1180;
// The lettering image is 1596 × 975.
const HEIGHT_PX = (WIDTH_PX * 975) / 1596;

// The official lettering is one image. It is revealed in three horizontal
// bands so each line writes on separately: [top %, bottom %, start beat, beats].
const BANDS: [number, number, number, number][] = [
	[0, 37, 0.3, 1.5], // "Good care."
	[37, 75.7, 2, 1.5], // "Good times."
	[75.7, 100, 3.8, 1], // swoosh
];

/**
 * Scene 7 — the payoff. Cuts in hard on the final chorus with a flash and a
 * burst of leaves, then the tagline writes on in the company's own lettering.
 */
export const Tagline: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const push = interpolate(frame, [0, durationInFrames], [0.94, 1.06]);

	return (
		<Background variant="hero">
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<TreeMark height={1100} color={COLORS.peach} opacity={0.05} style={{transform: `scale(${push * 1.05})`}} />
			</AbsoluteFill>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: CAPTION_SAFE - 40}}>
				<div style={{position: 'relative', width: WIDTH_PX, height: HEIGHT_PX, transform: `scale(${push})`}}>
					{BANDS.map(([top, bottom, startBeat, lengthBeats]) => {
						const p = ramp(frame, beats(startBeat), beats(lengthBeats), EASE_IN_OUT);
						// Soft leading edge that travels left to right.
						const edge = -8 + p * 116;
						const mask = `linear-gradient(90deg, #000 ${edge}%, transparent ${edge + 8}%)`;
						return (
							<Img
								key={top}
								src={staticFile(CONTENT.tagline.image)}
								alt={CONTENT.tagline.alt}
								style={{
									position: 'absolute',
									inset: 0,
									width: '100%',
									height: '100%',
									clipPath: `inset(${top}% 0 ${100 - bottom}% 0)`,
									WebkitMaskImage: mask,
									maskImage: mask,
								}}
							/>
						);
					})}
				</div>
			</AbsoluteFill>
			<LeafBurst
				frame={frame}
				start={0}
				x={WIDTH / 2}
				y={HEIGHT / 2 - 60}
				count={40}
				power={1.25}
				colors={[COLORS.peach, COLORS.orange, COLORS.white]}
				seed={3}
			/>
			<Flash frame={frame} strength={0.7} />
		</Background>
	);
};
