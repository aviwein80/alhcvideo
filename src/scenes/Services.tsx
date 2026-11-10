import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {Label} from '../components/Label';
import {Leaf} from '../components/Leaf';
import {WordReveal} from '../components/WordReveal';
import {CONTENT} from '../content';
import {pop, ramp} from '../lib/anim';
import {CAPTION_SAFE, COLORS, FONTS, beats} from '../theme';

const Card: React.FC<{lines: readonly string[]; index: number; frame: number; start: number}> = ({
	lines,
	index,
	frame,
	start,
}) => {
	const rise = pop(frame, start, 14);
	return (
		<div
			style={{
				width: 520,
				height: 370,
				backgroundColor: COLORS.white,
				borderRadius: 40,
				boxShadow: '0 24px 60px rgba(124, 38, 30, 0.14)',
				padding: '44px 46px',
				display: 'flex',
				flexDirection: 'column',
				opacity: ramp(frame, start, 10),
				transform: `translateY(${(1 - rise) * 120}px)`,
			}}
		>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
				<Leaf size={72} scale={pop(frame, start + 8)} rotate={-18 + 18 * pop(frame, start + 8)} />
				<div
					style={{
						fontFamily: FONTS.body,
						fontWeight: 900,
						fontSize: 28,
						letterSpacing: '0.18em',
						color: COLORS.orange,
						opacity: ramp(frame, start + 10, 14),
					}}
				>
					{String(index + 1).padStart(2, '0')}
				</div>
			</div>
			<div style={{flex: 1}} />
			<div style={{fontFamily: FONTS.headline, fontWeight: 700, fontSize: 56, lineHeight: 1.08, color: COLORS.maroon, whiteSpace: 'nowrap'}}>
				{lines.map((l) => (
					<div key={l}>{l}</div>
				))}
			</div>
			<div
				style={{
					marginTop: 26,
					height: 8,
					borderRadius: 4,
					backgroundColor: COLORS.orange,
					width: 130 * ramp(frame, start + 12, 22),
				}}
			/>
		</div>
	);
};

/** Scene 4 — three service cards, then the "focused on" line. */
export const Services: React.FC = () => {
	const frame = useCurrentFrame();
	const {label, cards, footer, footerHighlights} = CONTENT.services;
	const words = footer.split(' ');
	const highlights = Object.fromEntries(
		footerHighlights.map((w, i) => [words.indexOf(w), beats(7 + i)] as const),
	);

	return (
		<Background variant="paper">
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: CAPTION_SAFE}}>
				<Label text={label} frame={frame} start={8} color={COLORS.maroon} />
				<div style={{height: 54}} />
				<div style={{display: 'flex', gap: 50}}>
					{cards.map((lines, i) => (
						<Card key={i} lines={lines} index={i} frame={frame} start={beats(1 + i)} />
					))}
				</div>
				<div style={{height: 70}} />
				<WordReveal
					text={footer}
					frame={frame}
					start={beats(5)}
					stagger={3}
					highlights={highlights}
					highlightColor={COLORS.orange}
					style={{fontFamily: FONTS.headline, fontWeight: 600, fontSize: 58, color: COLORS.maroon, whiteSpace: 'nowrap'}}
				/>
			</AbsoluteFill>
		</Background>
	);
};
