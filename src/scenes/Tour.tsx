import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {RoomLabel} from '../components/RoomLabel';
import {WordReveal} from '../components/WordReveal';
import {CONTENT} from '../content';
import {EASE_IN_OUT, ramp} from '../lib/anim';
import {COLORS, FONTS, HEIGHT, WIDTH, beats} from '../theme';
import {DiningRoom} from './tour/DiningRoom';
import {Lobby} from './tour/Lobby';
import {Suite} from './tour/Suite';
import {TherapyGym} from './tour/TherapyGym';

const ROOMS = [Lobby, TherapyGym, Suite, DiningRoom];
/** Beats the doors stay on screen before the first room. */
const DOOR_BEATS = 4;
/** Beats spent in each room. */
const ROOM_BEATS = 8;
/** Width of the wall the camera passes through between rooms. */
const WALL = 120;
const PITCH = WIDTH + WALL;
/** Frames the camera takes to travel to the next room. */
const MOVE = 18;

const Door: React.FC<{side: 'left' | 'right'; open: number; word: string; frame: number}> = ({side, open, word, frame}) => {
	const left = side === 'left';
	const detail = ramp(frame, 2, 14);
	return (
		<div
			style={{
				position: 'absolute',
				top: 0,
				left: left ? 0 : WIDTH / 2,
				width: WIDTH / 2,
				height: HEIGHT,
				backgroundColor: left ? COLORS.maroon : COLORS.orange,
				transform: `translateX(${(left ? -1 : 1) * open * 102}%)`,
				display: 'flex',
				alignItems: 'center',
				justifyContent: left ? 'flex-end' : 'flex-start',
				boxShadow: open > 0 ? '0 0 80px rgba(0,0,0,0.25)' : undefined,
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: '70px 70px',
					border: '6px solid rgba(255,255,255,0.16)',
					borderRadius: 30,
					opacity: detail,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: '50%',
					[left ? 'right' : 'left']: 30,
					width: 18,
					height: 190 * detail,
					marginTop: 130,
					borderRadius: 9,
					backgroundColor: COLORS.peach,
				}}
			/>
			<WordReveal
				text={word}
				frame={frame}
				start={left ? 5 : 11}
				duration={18}
				style={{
					fontFamily: FONTS.headline,
					fontWeight: 700,
					fontSize: 190,
					color: COLORS.white,
					padding: left ? '0 36px 0 0' : '0 0 0 36px',
					marginTop: -150,
				}}
			/>
		</div>
	);
};

/**
 * Scene 4 — the tour. Doors open on four illustrated rooms and the camera
 * travels through them, one room every two bars. The people shown are
 * illustrations, not real residents or staff.
 */
export const Tour: React.FC = () => {
	const frame = useCurrentFrame();
	const {doors, rooms} = CONTENT.tour;
	const open = ramp(frame, beats(DOOR_BEATS - 1.5), beats(1.5), EASE_IN_OUT);

	// Camera: hold on a room, then travel so the move is centred on the bar line.
	let room = 0;
	for (let i = 1; i < ROOMS.length; i++) {
		const cut = beats(DOOR_BEATS + ROOM_BEATS * i);
		room += interpolate(frame, [cut - MOVE / 2, cut + MOVE / 2], [0, 1], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: EASE_IN_OUT,
		});
	}
	const settled = 1 - Math.abs(room - Math.round(room)) * 2;
	const zoom = 1 + 0.03 * settled + 0.02 * Math.sin(frame / 60);

	return (
		<AbsoluteFill style={{backgroundColor: COLORS.maroonDeep, overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `scale(${zoom})`}}>
				{ROOMS.map((Room, i) => {
					const offset = (i - room) * PITCH;
					if (Math.abs(offset) >= PITCH) {
						return null;
					}
					return (
						<div key={i} style={{position: 'absolute', left: 0, top: 0, transform: `translateX(${offset}px)`}}>
							<Room t={frame - beats(DOOR_BEATS + ROOM_BEATS * i)} />
						</div>
					);
				})}
			</AbsoluteFill>

			{rooms.map(({title, chip}, i) => {
				const start = beats(DOOR_BEATS + ROOM_BEATS * i + 1);
				const end = beats(DOOR_BEATS + ROOM_BEATS * (i + 1)) - MOVE / 2 - 2;
				return <RoomLabel key={title} title={title} chip={chip} frame={frame} start={start} end={end} chipDelay={beats(2)} />;
			})}

			{open < 1 ? (
				<AbsoluteFill>
					<Door side="left" open={open} word={doors[0]} frame={frame} />
					<Door side="right" open={open} word={doors[1]} frame={frame} />
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};
