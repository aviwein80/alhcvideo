import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {TreeMark} from '../components/TreeMark';
import {CONTENT} from '../content';
import {EASE_IN_OUT, ramp} from '../lib/anim';
import {CAPTION_SAFE, COLORS, beats} from '../theme';

const WIDTH_PX = 1180;
// The lettering image is 1596 × 975.
const HEIGHT_PX = (WIDTH_PX * 975) / 1596;

// The official lettering is one image. It is revealed in three horizontal
// bands so each line writes on separately: [top %, bottom %, start beat, beats].
const BANDS: [number, number, number, number][] = [
	[0, 37, 0.25, 1.6], // "Good care."
	[37, 75.7, 2, 1.6], // "Good times."
	[75.7, 100, 4, 0.9], // swoosh
];

/** Scene 8 — the tagline, written on in the company's own lettering. */
export const Tagline: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const push = interpolate(frame, [0, durationInFrames], [0.95, 1.05]);

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
		</Background>
	);
};
