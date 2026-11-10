import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Logo} from '../components/Logo';
import {ramp} from '../lib/anim';
import {COLORS} from '../theme';

/** Scene 1 — the logo grows: ground, trunk, leaves, lettering. */
export const LogoIntro: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const push = interpolate(frame, [0, durationInFrames], [0.94, 1.03]);
	const halo = ramp(frame, 10, 70);

	return (
		<Background variant="paper">
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				{/* Soft halo behind the crown of the tree. */}
				<div
					style={{
						position: 'absolute',
						width: 900,
						height: 900,
						borderRadius: '50%',
						marginTop: -220,
						background: `radial-gradient(circle, ${COLORS.peach} 0%, rgba(246, 205, 191, 0) 68%)`,
						opacity: 0.55 * halo,
						transform: `scale(${0.6 + 0.4 * halo})`,
					}}
				/>
				<div style={{transform: `scale(${push})`}}>
					<Logo width={1000} frame={frame - 6} />
				</div>
			</AbsoluteFill>
		</Background>
	);
};
