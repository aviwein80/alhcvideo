import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {VOICE_CUES} from '../audio';
import {FONTS} from '../theme';

/** Captions for the spoken lines. Text and timing come from src/edit.json. */
export const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const HOLD = 8;
	const cue = VOICE_CUES.find((c) => frame >= c.from && frame < c.from + c.durationInFrames + HOLD);
	if (!cue) {
		return null;
	}
	const end = cue.from + cue.durationInFrames + HOLD;
	const opacity = interpolate(frame, [cue.from, cue.from + 5, end - 5, end], [0, 1, 1, 0], {
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
