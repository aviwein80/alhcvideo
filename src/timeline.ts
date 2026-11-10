import type React from 'react';
import type {WipeDirection} from './components/PanelWipe';
import {Belief} from './scenes/Belief';
import {CallToAction} from './scenes/CallToAction';
import {Cornerstones} from './scenes/Cornerstones';
import {Family} from './scenes/Family';
import {LogoIntro} from './scenes/LogoIntro';
import {Network} from './scenes/Network';
import {Services} from './scenes/Services';
import {Tagline} from './scenes/Tagline';
import {Team} from './scenes/Team';
import {COLORS, beats} from './theme';

type SceneDef = {
	id: string;
	component: React.FC;
	/** Length in beats. Keep to whole bars (multiples of 4) or half bars. */
	beats: number;
	/** Wipe that brings this scene in: [leading accent, color of this scene]. */
	wipe?: {direction: WipeDirection; colors: [string, string]};
};

// The edit. Reorder, retime or remove scenes here; cuts and wipes follow.
const SCENE_ORDER: SceneDef[] = [
	{id: 'LogoIntro', component: LogoIntro, beats: 8},
	{id: 'Belief', component: Belief, beats: 8, wipe: {direction: 'up', colors: [COLORS.orange, COLORS.maroonDeep]}},
	{id: 'Cornerstones', component: Cornerstones, beats: 8, wipe: {direction: 'left', colors: [COLORS.peach, COLORS.paper]}},
	{id: 'Services', component: Services, beats: 12, wipe: {direction: 'right', colors: [COLORS.orange, COLORS.paper]}},
	{id: 'Team', component: Team, beats: 10, wipe: {direction: 'up', colors: [COLORS.maroonDeep, COLORS.orange]}},
	{id: 'Network', component: Network, beats: 14, wipe: {direction: 'left', colors: [COLORS.peach, COLORS.maroonDeep]}},
	{id: 'Family', component: Family, beats: 8, wipe: {direction: 'right', colors: [COLORS.orange, COLORS.paper]}},
	{id: 'Tagline', component: Tagline, beats: 8, wipe: {direction: 'up', colors: [COLORS.brick, COLORS.maroonDeep]}},
	{id: 'CallToAction', component: CallToAction, beats: 12, wipe: {direction: 'left', colors: [COLORS.peach, COLORS.paper]}},
];

let cursor = 0;
export const SCENES = SCENE_ORDER.map((scene) => {
	const from = beats(cursor);
	cursor += scene.beats;
	return {...scene, from, durationInFrames: beats(cursor) - from};
});

export const TOTAL_FRAMES = beats(cursor);
