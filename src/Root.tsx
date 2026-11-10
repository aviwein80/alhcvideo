import React from 'react';
import {Composition} from 'remotion';
import {BrandAd} from './BrandAd';
import {FPS, HEIGHT, WIDTH} from './theme';
import {TOTAL_FRAMES} from './timeline';

export const RemotionRoot: React.FC = () => (
	<Composition
		id="BrandAd"
		component={BrandAd}
		durationInFrames={TOTAL_FRAMES}
		fps={FPS}
		width={WIDTH}
		height={HEIGHT}
		defaultProps={{showCaptions: true}}
	/>
);
