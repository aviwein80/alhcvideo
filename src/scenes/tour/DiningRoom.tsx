import React from 'react';
import {interpolate} from 'remotion';
import {Person, blink} from '../../components/people/Person';
import {CAST} from '../../components/people/cast';
import {EASE_IN_OUT} from '../../lib/anim';
import {COLORS, ILLO, beats} from '../../theme';
import {LeafShape, Note, PERSON_SCALE, Plant, ROOM_H, ROOM_W, RoomShell, STAND_Y, Window} from './parts';

const FLAGS = [COLORS.maroon, COLORS.orange, COLORS.peach, ILLO.sage];

/** How open a clapping pair of hands is: 0 on beats 2 and 4, 1 in between. */
const clapGap = (b: number): number => {
	const toClap = Math.abs(((((b - 1) % 2) + 2) % 2) - 1);
	return 1 - Math.max(0, toClap * 2 - 1);
};

/** Room 4 — good times. Music, a dance, and everyone clapping along. */
export const DiningRoom: React.FC<{t: number}> = ({t}) => {
	const b = t / beats(1);
	const beatSwing = Math.sin(b * Math.PI);
	const bounce = Math.abs(Math.sin(b * Math.PI));
	const gap = clapGap(b);
	// One twirl under the joined hands in the second half of the room.
	const twirl = interpolate(b, [4, 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_IN_OUT});
	const turning = twirl > 0 && twirl < 1;
	const roseX = 900 + beatSwing * 20;
	const walterX = 1096 + beatSwing * 20;
	const handsY = -306 - bounce * 10 - (turning ? 34 : 0);

	return (
		<svg viewBox={`0 0 ${ROOM_W} ${ROOM_H}`} width={ROOM_W} height={ROOM_H}>
			<RoomShell>
				<Window x={1240} y={190} w={380} h={340} frame={t} />

				{/* Bunting */}
				<path d="M-20 34 Q480 120 960 60 T1940 40" fill="none" stroke={ILLO.woodDark} strokeWidth={4} />
				{Array.from({length: 17}, (_, i) => {
					const x = 40 + i * 114;
					const y = 44 + 34 * Math.sin((x / 1920) * Math.PI) - (x > 960 ? (x - 960) * 0.03 : 0);
					return (
						<path
							key={i}
							d="M-30 0 h60 l-30 62 z"
							fill={FLAGS[i % FLAGS.length]}
							transform={`translate(${x} ${y}) rotate(${Math.sin(t / 9 + i) * 7})`}
						/>
					);
				})}

				{/* Sideboard and record player */}
				<rect x={120} y={640} width={400} height={170} rx={14} fill={ILLO.wood} />
				<rect x={140} y={664} width={170} height={120} rx={8} fill={ILLO.woodDark} opacity={0.45} />
				<rect x={330} y={664} width={170} height={120} rx={8} fill={ILLO.woodDark} opacity={0.45} />
				<rect x={140} y={810} width={20} height={56} fill={ILLO.woodDark} />
				<rect x={480} y={810} width={20} height={56} fill={ILLO.woodDark} />
				<rect x={210} y={590} width={220} height={52} rx={10} fill={COLORS.maroon} />
				<ellipse cx={320} cy={588} rx={92} ry={20} fill={ILLO.charcoal} />
				<ellipse cx={320} cy={588} rx={28} ry={6} fill={COLORS.orange} />
				<ellipse
					cx={320}
					cy={588}
					rx={62}
					ry={13}
					fill="none"
					stroke="rgba(255,255,255,0.35)"
					strokeWidth={3}
					strokeDasharray="40 80"
					strokeDashoffset={-t * 6}
				/>
				<path d="M430 560 L372 584" stroke={ILLO.steel} strokeWidth={7} strokeLinecap="round" />
				{[0, 1, 2].map((i) => {
					const s = (((t + i * 20) % 60) + 60) % 60 / 60;
					return <Note key={i} x={300 + i * 46} y={520} t={s} color={i === 1 ? COLORS.orange : COLORS.maroon} />;
				})}

				<Plant x={1830} y={846} frame={t} scale={0.9} />

				{/* Dining chair back */}
				<rect x={1700} y={600} width={22} height={290} rx={8} fill={ILLO.woodDark} />
				<rect x={1560} y={792} width={170} height={20} rx={8} fill={ILLO.woodDark} />
				<rect x={1570} y={806} width={16} height={88} fill={ILLO.woodDark} />
			</RoomShell>

			{/* Host claps along */}
			<Person
				x={590}
				y={STAND_Y}
				scale={PERSON_SCALE}
				look={CAST.host}
				pose={{
					blink: blink(t, 0),
					armNear: {angles: [58 - gap * 16, 62 + gap * 6]},
					armFar: {angles: [58 + gap * 16, 62 - gap * 6]},
					lift: -8 * bounce,
					headTilt: beatSwing * 5,
					lean: 3,
				}}
			/>

			{/* The dance */}
			<Person
				x={walterX}
				y={STAND_Y}
				scale={PERSON_SCALE}
				facing={-1}
				look={CAST.walter}
				pose={{
					blink: blink(t, 19),
					armNear: {reach: [(walterX - roseX) / PERSON_SCALE / 2, handsY]},
					armFar: turning ? {angles: [20, 30]} : {reach: [118, -196]},
					legNear: [8 * beatSwing, 6 + 8 * bounce],
					legFar: [-8 * beatSwing, 6 + 8 * (1 - bounce)],
					lean: 3 + beatSwing * 3,
					lift: -6 * bounce,
					headTilt: -beatSwing * 4,
				}}
			/>
			<g transform={`translate(${roseX} 0) scale(${Math.cos(twirl * Math.PI * 2)} 1) translate(${-roseX} 0)`}>
				<Person
					x={roseX}
					y={STAND_Y}
					scale={PERSON_SCALE}
					look={CAST.rose}
					pose={{
					blink: blink(t, 37),
						armNear: turning ? {angles: [168, 8]} : {reach: [(walterX - roseX) / PERSON_SCALE / 2, handsY]},
						armFar: turning ? {angles: [30, 40]} : {reach: [116, -262]},
						legNear: [-8 * beatSwing, 6 + 8 * bounce],
						legFar: [8 * beatSwing, 6 + 8 * (1 - bounce)],
						lean: 3 - beatSwing * 3,
						lift: -6 * bounce,
						headTilt: beatSwing * 4,
					}}
				/>
			</g>

			{/* Table: tea, cake, and a friend keeping time */}
			<Person
				x={1640}
				y={STAND_Y}
				scale={PERSON_SCALE}
				facing={-1}
				look={CAST.frank}
				pose={{
					blink: blink(t, 58),
					seated: true,
					armNear: {angles: [62 - gap * 14, 66]},
					armFar: {angles: [60 + gap * 14, 66]},
					headTilt: beatSwing * 5,
					lift: -4 * bounce,
				}}
			/>
			<rect x={1440} y={720} width={18} height={150} fill={ILLO.woodDark} />
			<ellipse cx={1449} cy={872} rx={70} ry={10} fill={ILLO.woodDark} />
			<path d="M1280 700 h340 l-14 70 q-156 22 -312 0 z" fill={ILLO.cream} />
			<path d="M1294 770 q156 22 312 0" fill="none" stroke={COLORS.peach} strokeWidth={8} />
			<ellipse cx={1450} cy={700} rx={170} ry={18} fill="#FFFFFF" />
			{/* Cake */}
			<rect x={1328} y={648} width={96} height={46} rx={8} fill={COLORS.peach} />
			<path d="M1328 660 q16 14 32 0 t32 0 t32 0 v-6 q0 -10 -10 -10 h-76 q-10 0 -10 10 z" fill={COLORS.orange} />
			<ellipse cx={1376} cy={696} rx={64} ry={8} fill={ILLO.steel} />
			{/* Teapot */}
			<path d="M1474 694 q-14 -44 26 -46 q40 2 26 46 z" fill={COLORS.maroon} />
			<path d="M1526 664 q22 -6 24 -22" fill="none" stroke={COLORS.maroon} strokeWidth={9} strokeLinecap="round" />
			<circle cx={1500} cy={644} r={7} fill={COLORS.orange} />
			<LeafShape x={1570} y={676} size={34} rotate={30} />
			<LeafShape x={1588} y={670} size={30} rotate={-20} color={ILLO.sageDark} />
			<path d="M1562 696 h36 l-5 -16 h-26 z" fill={COLORS.orange} />
		</svg>
	);
};
