import React from 'react';
import {Easing, interpolate} from 'remotion';
import {TreeMark} from '../../components/TreeMark';
import {Person, blink, stride} from '../../components/people/Person';
import {CAST} from '../../components/people/cast';
import {COLORS, ILLO, beats} from '../../theme';
import {Frame, PERSON_SCALE, Plant, ROOM_H, ROOM_W, RoomShell, STAND_Y, Sconce} from './parts';

const WHEEL_R = 70;

/** Side-view wheelchair, drawn at character scale around a seated person. */
const Wheelchair: React.FC<{x: number; spin: number; children: React.ReactNode}> = ({x, spin, children}) => (
	<g transform={`translate(${x} ${STAND_Y}) scale(${PERSON_SCALE})`}>
		<ellipse cx={30} cy={6} rx={130} ry={11} fill="rgba(74, 42, 34, 0.12)" />
		<line x1={-30} y1={-112} x2={-44} y2={-250} stroke={ILLO.steelDark} strokeWidth={9} strokeLinecap="round" />
		<line x1={-44} y1={-250} x2={-80} y2={-256} stroke={ILLO.charcoal} strokeWidth={12} strokeLinecap="round" />
		<rect x={-46} y={-238} width={16} height={116} rx={8} fill={COLORS.maroon} />
		{children}
		<rect x={-36} y={-114} width={124} height={16} rx={8} fill={COLORS.maroon} />
		<g stroke={ILLO.steelDark} strokeWidth={8} strokeLinecap="round" fill="none">
			<path d="M-32 -160 H58 L62 -104" />
			<path d="M86 -104 L114 -32" />
			<path d="M86 -104 L96 -24" />
		</g>
		<line x1={104} y1={-28} x2={152} y2={-28} stroke={ILLO.charcoal} strokeWidth={10} strokeLinecap="round" />
		<circle cx={96} cy={-20} r={20} fill={ILLO.charcoal} />
		<circle cx={96} cy={-20} r={7} fill={ILLO.steel} />
		<g transform={`translate(-14 ${-WHEEL_R - 2}) rotate(${spin})`}>
			<circle r={WHEEL_R} fill="none" stroke={ILLO.charcoal} strokeWidth={11} />
			<circle r={WHEEL_R - 10} fill="rgba(255,255,255,0.25)" stroke={ILLO.steel} strokeWidth={4} />
			{[0, 45, 90, 135].map((a) => (
				<line key={a} x1={-WHEEL_R + 10} y1={0} x2={WHEEL_R - 10} y2={0} stroke={ILLO.steel} strokeWidth={3} transform={`rotate(${a})`} />
			))}
			<circle r={11} fill={ILLO.steelDark} />
		</g>
	</g>
);

/** Room 1 — arrival. A caregiver wheels a resident in; the front desk waves. */
export const Lobby: React.FC<{t: number}> = ({t}) => {
	const b = t / beats(1);
	const travel = interpolate(b, [-2, 4.5], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});
	const chairX = 380 + travel * 500;
	const moving = Math.min(1, (1 - travel) * 5);
	const phase = chairX / 30;
	const wave = Math.sin(t / 2.6);
	const greet = interpolate(b, [0.5, 1.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const roseGreets = interpolate(b, [2.5, 3.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const aideX = chairX - 222;

	return (
		<svg viewBox={`0 0 ${ROOM_W} ${ROOM_H}`} width={ROOM_W} height={ROOM_H}>
			<RoomShell>
				{/* Entrance */}
				<rect x={70} y={236} width={300} height={566} rx={14} fill={COLORS.maroon} />
				<rect x={92} y={258} width={122} height={544} fill={ILLO.sky} />
				<rect x={226} y={258} width={122} height={544} fill={ILLO.sky} />
				<path d="M92 802 V640 q60 -50 122 -10 V802 z M226 802 V630 q60 30 122 -20 V802 z" fill={ILLO.sage} />
				<rect x={200} y={500} width={10} height={70} rx={5} fill={ILLO.cream} />
				<rect x={230} y={500} width={10} height={70} rx={5} fill={ILLO.cream} />
				<path d="M70 800 H370 L520 1080 H-40 Z" fill="#FFFFFF" opacity={0.28} />
				<rect x={110} y={846} width={330} height={52} rx={20} fill={COLORS.maroon} opacity={0.9} />

				<Sconce x={560} y={330} frame={t} />
				<Frame x={700} y={300} w={230} h={160} />
				<Sconce x={1080} y={330} frame={t} />
				<Plant x={1090} y={846} frame={t} />

				{/* Sign above the desk: the tree from the logo, as decoration. */}
				<circle cx={1470} cy={330} r={122} fill={ILLO.cream} />
				<circle cx={1470} cy={330} r={122} fill="none" stroke={COLORS.peach} strokeWidth={8} />
				<g transform="translate(1373 268)">
					<TreeMark height={110} color={COLORS.orange} opacity={1} />
				</g>
			</RoomShell>

			{/* Front desk */}
			<Person
				x={1440}
				y={STAND_Y - 26}
				scale={PERSON_SCALE}
				facing={-1}
				look={CAST.receptionist}
				pose={{
					blink: blink(t, 0),
					armNear: {angles: [4 + greet * 146, 8 + greet * (16 + wave * 22)]},
					headTilt: greet * wave * 3,
					lift: -6 * greet * Math.abs(wave),
				}}
			/>
			<rect x={1190} y={628} width={600} height={270} rx={20} fill={ILLO.wood} />
			<rect x={1190} y={700} width={600} height={14} fill={ILLO.woodDark} opacity={0.5} />
			<rect x={1166} y={610} width={648} height={30} rx={12} fill={COLORS.maroon} />
			<rect x={1600} y={520} width={130} height={86} rx={8} fill={ILLO.charcoal} />
			<rect x={1608} y={528} width={114} height={66} rx={4} fill={ILLO.sky} />
			<rect x={1655} y={600} width={20} height={14} fill={ILLO.steelDark} />
			<path d="M1250 610 q22 -40 44 0 z" fill={COLORS.orange} />
			<circle cx={1272} cy={572} r={6} fill={COLORS.orange} />

			{/* Arrival */}
			<Person
				x={aideX}
				y={STAND_Y}
				scale={PERSON_SCALE}
				look={CAST.aide}
				pose={{
					blink: blink(t, 23),
					legNear: stride(phase, 20 * moving),
					legFar: stride(phase + Math.PI, 20 * moving),
					armNear: {reach: [(222 - 96) / PERSON_SCALE, -254]},
					armFar: {reach: [(222 - 90) / PERSON_SCALE, -250]},
					lean: 4 + 5 * moving,
					lift: -4 * moving * Math.abs(Math.sin(phase)),
				}}
			/>
			<Wheelchair x={chairX} spin={(chairX / (WHEEL_R * PERSON_SCALE)) * (180 / Math.PI)}>
				<Person
					x={10}
					y={0}
					look={CAST.rose}
					pose={{
					blink: blink(t, 51),
						seated: true,
						lift: -22,
						armNear: {angles: [30 + roseGreets * 110, 30 + roseGreets * (10 + wave * 24)]},
						headTilt: -roseGreets * 4,
					}}
				/>
			</Wheelchair>
		</svg>
	);
};
