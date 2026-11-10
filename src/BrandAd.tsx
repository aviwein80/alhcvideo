import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, getStaticFiles, interpolate, useVideoConfig} from 'remotion';
import {Captions} from './components/Captions';
import {PanelWipe} from './components/PanelWipe';
import {COLORS, FPS, WIPE_FRAMES} from './theme';
import {SCENES} from './timeline';

export type BrandAdProps = {
	/** Show the narration script as captions. */
	showCaptions: boolean;
};

/** The first audio file found in assets/music, if any. */
const findMusic = () => getStaticFiles().find((f) => /^music\/.+\.(mp3|wav|m4a|aac)$/i.test(f.name));

export const BrandAd: React.FC<BrandAdProps> = ({showCaptions}) => {
	const {durationInFrames} = useVideoConfig();
	const music = findMusic();

	return (
		<AbsoluteFill style={{backgroundColor: COLORS.paper}}>
			{SCENES.map(({id, component: Scene, from, durationInFrames: length}) => (
				<Sequence key={id} name={id} from={from} durationInFrames={length}>
					<Scene />
				</Sequence>
			))}

			{SCENES.map(({id, from, wipe}) =>
				wipe ? (
					<Sequence key={id} name={`Wipe → ${id}`} from={from - WIPE_FRAMES} durationInFrames={WIPE_FRAMES * 2}>
						<PanelWipe {...wipe} />
					</Sequence>
				) : null,
			)}

			{showCaptions ? <Captions /> : null}

			{music ? (
				<Html5Audio
					src={music.src}
					volume={(f) =>
						interpolate(f, [0, FPS / 2, durationInFrames - FPS * 2, durationInFrames], [0, 1, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})
					}
				/>
			) : null}
		</AbsoluteFill>
	);
};
