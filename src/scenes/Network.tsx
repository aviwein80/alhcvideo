import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Label} from '../components/Label';
import {Leaf} from '../components/Leaf';
import {WordReveal} from '../components/WordReveal';
import {CONTENT} from '../content';
import {EASE_IN_OUT, pop, ramp} from '../lib/anim';
import {CAPTION_SAFE, COLORS, FONTS, beats} from '../theme';

const CARD = {width: 900, height: 620, radius: 44};
// Beat on which each photo arrives.
const PHOTO_BEATS = [0, 3, 5.5, 8, 10.5];
const SLIDE = 18;

/** Scene 6 — the network: five states on the left, center photos on the right. */
export const Network: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const {label, lines, states, photos} = CONTENT.network;
	const open = ramp(frame, 6, 30, EASE_IN_OUT);
	const headline: React.CSSProperties = {fontFamily: FONTS.headline, fontWeight: 600, fontSize: 58, color: COLORS.white};

	return (
		<Background variant="maroon">
			<AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', padding: `0 110px ${CAPTION_SAFE - 30}px 130px`}}>
				{/* Left: copy and the list of states. */}
				<div style={{flex: 1}}>
					<Label text={label} frame={frame} start={8} color={COLORS.peach} />
					<div style={{height: 30}} />
					{lines.map((l, i) => (
						<WordReveal key={l} text={l} frame={frame} start={beats(0.75) + i * 12} stagger={3} style={headline} />
					))}
					<div style={{height: 40}} />
					{states.map((state, i) => {
						const at = beats(5 + i);
						const p = ramp(frame, at, 18);
						return (
							<div
								key={state}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 24,
									height: 74,
									opacity: p,
									transform: `translateX(${(1 - p) * -50}px)`,
								}}
							>
								<Leaf size={40} scale={pop(frame, at)} rotate={90} />
								<div style={{fontFamily: FONTS.headline, fontWeight: 700, fontSize: 56, color: COLORS.white}}>{state}</div>
							</div>
						);
					})}
				</div>

				{/* Right: photo card on an offset orange panel. */}
				<div style={{position: 'relative', width: CARD.width, height: CARD.height}}>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							borderRadius: CARD.radius,
							backgroundColor: COLORS.orange,
							transform: `translate(${34 * open}px, ${34 * open}px)`,
							opacity: open,
						}}
					/>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							borderRadius: CARD.radius,
							overflow: 'hidden',
							backgroundColor: COLORS.maroon,
							clipPath: `inset(0 0 0 ${(1 - open) * 100}% round ${CARD.radius}px)`,
						}}
					>
						{photos.map((src, i) => {
							const start = beats(PHOTO_BEATS[i]);
							const end = i < photos.length - 1 ? beats(PHOTO_BEATS[i + 1]) : durationInFrames;
							if (frame < start || frame > end + SLIDE) {
								return null;
							}
							const enter = i === 0 ? 1 : ramp(frame, start, SLIDE, EASE_IN_OUT);
							const leave = ramp(frame, end, SLIDE, EASE_IN_OUT);
							const zoom = interpolate(frame, [start, end + SLIDE], [1.03, 1.12]);
							return (
								<Img
									key={src}
									src={staticFile(src)}
									style={{
										position: 'absolute',
										inset: 0,
										width: '100%',
										height: '100%',
										objectFit: 'cover',
										transform: `translateX(${(1 - enter) * 100 - leave * 22}%) scale(${zoom})`,
									}}
								/>
							);
						})}
					</div>
				</div>
			</AbsoluteFill>
		</Background>
	);
};
