import type React from 'react';
import type {WipeDirection} from './components/PanelWipe';
import edit from './edit.json';
import {Belief} from './scenes/Belief';
import {CallToAction} from './scenes/CallToAction';
import {Cornerstones} from './scenes/Cornerstones';
import {Family} from './scenes/Family';
import {LogoIntro} from './scenes/LogoIntro';
import {Network} from './scenes/Network';
import {Tagline} from './scenes/Tagline';
import {Tour} from './scenes/Tour';
import {COLORS, beats} from './theme';

// The edit itself (scene order, length in beats, wipe per cut) lives in
// src/edit.json so the audio scripts can read the same cue sheet. This file
// attaches a component to each scene id and works out start frames.
const COMPONENTS: Record<string, React.FC> = {
	LogoIntro,
	Belief,
	Cornerstones,
	Tour,
	Network,
	Family,
	Tagline,
	CallToAction,
};

type ColorName = keyof typeof COLORS;
type SceneEntry = {
	id: string;
	beats: number;
	/** Panel wipe that brings the scene in. Without one the cut is hard. */
	wipe?: {direction: string; colors: string[]};
};

let cursor = 0;
export const SCENES = (edit.scenes as SceneEntry[]).map((scene) => {
	const component = COMPONENTS[scene.id];
	if (!component) {
		throw new Error(`src/edit.json names a scene with no component: ${scene.id}`);
	}
	const from = beats(cursor);
	cursor += scene.beats;
	return {
		id: scene.id,
		component,
		from,
		durationInFrames: beats(cursor) - from,
		wipe: scene.wipe
			? {
					direction: scene.wipe.direction as WipeDirection,
					colors: scene.wipe.colors.map((name) => COLORS[name as ColorName]) as [string, string],
				}
			: undefined,
	};
});

export const TOTAL_FRAMES = beats(cursor);
