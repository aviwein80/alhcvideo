import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {LeafBurst} from '../components/LeafBurst';
import {Logo} from '../components/Logo';
import {ramp} from '../lib/anim';
import {COLORS, HEIGHT, WIDTH, beats} from '../theme';

/** Scene 1 — the logo grows: ground, trunk, leaves, lettering. */
export const LogoIntro: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const push = interpolate(frame, [0, durationInFrames], [0.92, 1.04]);
	const halo = ramp(frame, 6, 50);

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
						opacity: 0.6 * halo,
						transform: `scale(${0.6 + 0.4 * halo})`,
					}}
				/>
				<div style={{transform: `scale(${push})`}}>
					<Logo width={1000} frame={frame - 4} speed={1.5} />
				</div>
			</AbsoluteFill>
			{/* A few leaves let go as the crown fills in. */}
			<LeafBurst
				frame={frame}
				start={beats(2.5)}
				x={WIDTH / 2}
				y={HEIGHT / 2 - 150}
				count={16}
				power={0.75}
				colors={[COLORS.orange, COLORS.peach]}
				seed={7}
			/>
		</Background>
	);
};
