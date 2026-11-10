import React from 'react';
import {AbsoluteFill, Html5Audio, Sequence, staticFile} from 'remotion';
import {AUDIO_FILES, MIX, VOICE_CUES, hasAsset, scoreVolume} from './audio';
import {Captions} from './components/Captions';
import {PanelWipe} from './components/PanelWipe';
import {COLORS, WIPE_FRAMES} from './theme';
import {SCENES} from './timeline';

export type BrandAdProps = {
	/** Show captions for the spoken lines. */
	showCaptions: boolean;
	/** Play the voiceover. Turn off for a music-only cut. */
	voiceover: boolean;
};

export const BrandAd: React.FC<BrandAdProps> = ({showCaptions, voiceover}) => {
	const voiceCues = voiceover ? VOICE_CUES.filter((cue) => hasAsset(AUDIO_FILES.voice(cue.id))) : [];

	return (
		<AbsoluteFill style={{backgroundColor: COLORS.paper}}>
			{SCENES.map(({id, component: Scene, from, durationInFrames}) => (
				<Sequence key={id} name={id} from={from} durationInFrames={durationInFrames}>
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

			{hasAsset(AUDIO_FILES.score) ? (
				<Html5Audio src={staticFile(AUDIO_FILES.score)} volume={(f) => scoreVolume(f, voiceCues.length > 0)} />
			) : null}
			{hasAsset(AUDIO_FILES.sfx) ? <Html5Audio src={staticFile(AUDIO_FILES.sfx)} volume={MIX.sfx} /> : null}
			{voiceCues.map((cue) => (
				<Sequence key={cue.id} name={`Voice: ${cue.id}`} from={cue.from} layout="none">
					<Html5Audio src={staticFile(AUDIO_FILES.voice(cue.id))} volume={MIX.voice} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
