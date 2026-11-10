import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {Logo} from '../components/Logo';
import {WordReveal} from '../components/WordReveal';
import {CONTENT} from '../content';
import {pop, ramp} from '../lib/anim';
import {COLORS, FONTS, beats} from '../theme';

/** Scene 9 — logo, call to action, contact details and the disclaimer. */
export const CallToAction: React.FC = () => {
	const frame = useCurrentFrame();
	const {headline, url, phone, disclaimer} = CONTENT.cta;
	const button = pop(frame, beats(4), 13);
	const phoneIn = ramp(frame, beats(5), 20);
	// One pass of light across the button once everything has landed.
	const shine = interpolate(frame, [beats(7), beats(8.5)], [-30, 130], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<Background variant="paper">
			<AbsoluteFill style={{alignItems: 'center', paddingTop: 70}}>
				<Logo width={560} frame={frame - 8} speed={2} />
				<div style={{height: 44}} />
				<WordReveal
					text={headline}
					frame={frame}
					start={beats(3)}
					stagger={3}
					style={{fontFamily: FONTS.headline, fontWeight: 700, fontSize: 100, color: COLORS.maroon}}
				/>
				<div style={{height: 34}} />
				<div
					style={{
						position: 'relative',
						overflow: 'hidden',
						backgroundColor: COLORS.orange,
						borderRadius: 999,
						padding: '24px 70px 28px',
						fontFamily: FONTS.body,
						fontWeight: 900,
						fontSize: 50,
						color: COLORS.white,
						opacity: ramp(frame, beats(4), 8),
						transform: `scale(${0.7 + 0.3 * button})`,
						boxShadow: '0 18px 40px rgba(225, 90, 42, 0.32)',
					}}
				>
					{url}
					<div
						style={{
							position: 'absolute',
							top: 0,
							bottom: 0,
							width: '22%',
							left: `${shine}%`,
							background: 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)',
						}}
					/>
				</div>
				<div
					style={{
						marginTop: 30,
						fontFamily: FONTS.body,
						fontWeight: 700,
						fontSize: 46,
						letterSpacing: '0.04em',
						color: COLORS.maroon,
						opacity: phoneIn,
						transform: `translateY(${(1 - phoneIn) * 24}px)`,
					}}
				>
					{phone}
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 150}}>
				<div
					style={{
						width: 1480,
						fontFamily: FONTS.body,
						fontWeight: 400,
						fontSize: 23,
						lineHeight: 1.5,
						textAlign: 'center',
						color: COLORS.ink,
						opacity: 0.9 * ramp(frame, beats(6), 24),
					}}
				>
					{disclaimer}
				</div>
			</AbsoluteFill>
		</Background>
	);
};
