import React from 'react';
import {interpolate} from 'remotion';
import {Person, blink, stride} from '../../components/people/Person';
import {CAST} from '../../components/people/cast';
import {pop} from '../../lib/anim';
import {COLORS, ILLO, beats} from '../../theme';
import {PERSON_SCALE, Plant, ROOM_H, ROOM_W, RoomShell, STAND_Y, Window} from './parts';

const RAIL_Y = STAND_Y - 258;
const BACK_RAIL_Y = RAIL_Y - 36;

/** Room 2 — therapy gym. A resident walks the parallel bars with a therapist. */
export const TherapyGym: React.FC<{t: number}> = ({t}) => {
	const b = t / beats(1);
	const walk = interpolate(b, [-1, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const walterX = 650 + walk * 330;
	const phase = walterX / 24;
	const therapistX = walterX + 260;
	const cheer = interpolate(b, [5.5, 6.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const nod = Math.sin(t / 5);

	return (
		<svg viewBox={`0 0 ${ROOM_W} ${ROOM_H}`} width={ROOM_W} height={ROOM_H}>
			<RoomShell>
				<Window x={1010} y={160} w={360} h={360} frame={t} />
				<Window x={1450} y={160} w={360} h={360} frame={t} />

				{/* Wall bars */}
				<rect x={130} y={300} width={18} height={500} rx={6} fill={ILLO.wood} />
				<rect x={330} y={300} width={18} height={500} rx={6} fill={ILLO.wood} />
				{[340, 400, 460, 520, 580, 640, 700, 760].map((y) => (
					<rect key={y} x={130} y={y} width={218} height={12} rx={6} fill={ILLO.woodDark} />
				))}

				{/* Exercise ball and step */}
				<ellipse cx={470} cy={STAND_Y - 4} rx={96} ry={12} fill="rgba(74, 42, 34, 0.12)" />
				<circle cx={470} cy={STAND_Y - 96} r={96} fill={ILLO.sage} />
				<path d={`M400 ${STAND_Y - 140} q30 -46 84 -44`} stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.45} />
				<Plant x={1830} y={846} frame={t} scale={0.9} pot={COLORS.maroon} />

				{/* Back rail of the parallel bars */}
				<g stroke={ILLO.steelDark} strokeWidth={12} strokeLinecap="round">
					<line x1={600} y1={BACK_RAIL_Y} x2={600} y2={STAND_Y - 40} />
					<line x1={1380} y1={BACK_RAIL_Y} x2={1380} y2={STAND_Y - 40} />
				</g>
				<line x1={560} y1={BACK_RAIL_Y} x2={1420} y2={BACK_RAIL_Y} stroke={ILLO.steel} strokeWidth={14} strokeLinecap="round" />
			</RoomShell>

			<Person
				x={walterX}
				y={STAND_Y}
				scale={PERSON_SCALE}
				look={CAST.walter}
				pose={{
					blink: blink(t, 0),
					legNear: stride(phase, 15),
					legFar: stride(phase + Math.PI, 15),
					armNear: {reach: [50, (RAIL_Y - STAND_Y) / PERSON_SCALE - 14]},
					armFar: {reach: [64, (BACK_RAIL_Y - STAND_Y) / PERSON_SCALE - 12]},
					lean: 6,
					lift: -3 * Math.abs(Math.sin(phase)),
					headTilt: -4 - cheer * 6,
				}}
			/>
			<Person
				x={therapistX}
				y={STAND_Y}
				scale={PERSON_SCALE}
				facing={-1}
				look={CAST.therapist}
				pose={{
					blink: blink(t, 31),
					legNear: stride(-phase, 13),
					legFar: stride(-phase + Math.PI, 13),
					armNear: {reach: [96, -236 - cheer * 40]},
					armFar: {reach: [104, -250 - cheer * 50]},
					lean: 8 - cheer * 6,
					headTilt: nod * 3,
					lift: -6 * cheer * Math.abs(Math.sin(t / 3)),
				}}
			/>

			{/* Front rail */}
			<g stroke={ILLO.steelDark} strokeWidth={14} strokeLinecap="round">
				<line x1={560} y1={RAIL_Y} x2={560} y2={STAND_Y + 16} />
				<line x1={1340} y1={RAIL_Y} x2={1340} y2={STAND_Y + 16} />
				<line x1={520} y1={STAND_Y + 18} x2={600} y2={STAND_Y + 18} />
				<line x1={1300} y1={STAND_Y + 18} x2={1380} y2={STAND_Y + 18} />
			</g>
			<line x1={520} y1={RAIL_Y} x2={1380} y2={RAIL_Y} stroke={ILLO.steel} strokeWidth={18} strokeLinecap="round" />
			<line x1={520} y1={RAIL_Y - 5} x2={1380} y2={RAIL_Y - 5} stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" opacity={0.5} />

			{/* Plan on a clipboard */}
			<Person
				x={1590}
				y={STAND_Y}
				scale={PERSON_SCALE}
				facing={-1}
				look={CAST.aide}
				pose={{
					blink: blink(t, 57),
					armNear: {reach: [52, -232]},
					armFar: {reach: [70 + Math.sin(t / 2.2) * 6, -262 + Math.cos(t / 2.2) * 5]},
					headTilt: 6 + nod * 2,
				}}
			>
				<g transform="translate(26 -292) rotate(-8)">
					<rect width={84} height={108} rx={8} fill={ILLO.wood} />
					<rect x={8} y={12} width={68} height={88} rx={3} fill={ILLO.cream} />
					<rect x={28} y={-6} width={28} height={14} rx={4} fill={ILLO.steelDark} />
					{[0, 1, 2].map((i) => {
						const p = pop(b * beats(1), beats(1.5 + i * 1.5));
						return (
							<g key={i} transform={`translate(16 ${28 + i * 24})`}>
								<rect x={22} y={-3} width={34} height={6} rx={3} fill={ILLO.steel} />
								<path
									d="M0 0 l5 6 l10 -12"
									fill="none"
									stroke={COLORS.orange}
									strokeWidth={5}
									strokeLinecap="round"
									strokeLinejoin="round"
									transform={`scale(${p})`}
								/>
							</g>
						);
					})}
				</g>
			</Person>
		</svg>
	);
};
