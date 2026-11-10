import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CAPTIONS} from '../captions';
import {FONTS, beats} from '../theme';

/** Caption track for the narration script. Runs over the whole film. */
export const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const cue = CAPTIONS.find((c) => frame >= beats(c.from) && frame < beats(c.to));
	if (!cue) {
		return null;
	}
	const start = beats(cue.from);
	const end = beats(cue.to);
	const opacity = interpolate(frame, [start, start + 6, end - 6, end], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 44}}>
			<div
				style={{
					opacity,
					fontFamily: FONTS.body,
					fontWeight: 700,
					fontSize: 32,
					lineHeight: 1.3,
					color: '#FFFFFF',
					backgroundColor: 'rgba(38, 12, 10, 0.82)',
					padding: '12px 30px 14px',
					borderRadius: 16,
					textAlign: 'center',
					whiteSpace: 'pre-line',
					maxWidth: 1500,
				}}
			>
				{cue.text}
			</div>
		</AbsoluteFill>
	);
};
