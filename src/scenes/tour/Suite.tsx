import React from 'react';
import {Easing, interpolate} from 'remotion';
import {Person, blink, stride} from '../../components/people/Person';
import {CAST} from '../../components/people/cast';
import {COLORS, ILLO, beats} from '../../theme';
import {Frame, LeafShape, PERSON_SCALE, ROOM_H, ROOM_W, RoomShell, STAND_Y, Sconce, Window} from './parts';

/** Room 3 — a resident's suite. A nurse brings tea; the doctor stops by. */
export const Suite: React.FC<{t: number}> = ({t}) => {
	const b = t / beats(1);
	const arrive = interpolate(b, [-1.5, 3], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});
	const nurseX = 480 + arrive * 300;
	const moving = Math.min(1, (1 - arrive) * 5);
	const phase = nurseX / 28;
	const delight = interpolate(b, [2.5, 3.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const sway = Math.sin(t / 3.2);
	const nod = Math.sin(t / 6);
	const curtain = Math.sin(t / 26) * 6;

	return (
		<svg viewBox={`0 0 ${ROOM_W} ${ROOM_H}`} width={ROOM_W} height={ROOM_H}>
			<RoomShell>
				{/* Window with curtains */}
				<Window x={980} y={170} w={380} h={360} frame={t} />
				<rect x={930} y={136} width={480} height={14} rx={7} fill={ILLO.woodDark} />
				<path d={`M944 150 h80 q${10 + curtain} 200 -40 410 h-40 z`} fill={COLORS.peach} />
				<path d={`M1396 150 h-80 q${-10 - curtain} 200 40 410 h40 z`} fill={COLORS.peach} />

				<Frame x={1500} y={250} w={130} h={160} tone={ILLO.sage} />
				<Frame x={1660} y={280} w={150} h={120} />
				<Sconce x={560} y={420} frame={t} />

				{/* Bed */}
				<rect x={60} y={500} width={40} height={330} rx={12} fill={ILLO.woodDark} />
				<rect x={90} y={700} width={560} height={90} rx={18} fill={ILLO.cream} />
				<rect x={110} y={664} width={150} height={56} rx={26} fill="#FFFFFF" />
				<path d="M250 700 q10 -34 60 -34 h330 q24 0 24 30 v104 h-414 z" fill={COLORS.peach} />
				<rect x={250} y={748} width={414} height={18} fill={COLORS.orange} opacity={0.8} />
				<rect x={90} y={786} width={580} height={30} rx={8} fill={ILLO.wood} />
				<rect x={110} y={816} width={22} height={50} fill={ILLO.woodDark} />
				<rect x={630} y={816} width={22} height={50} fill={ILLO.woodDark} />

				{/* Rug */}
				<ellipse cx={1190} cy={940} rx={470} ry={62} fill={COLORS.peach} opacity={0.75} />
				<ellipse cx={1190} cy={940} rx={400} ry={46} fill="none" stroke={COLORS.orange} strokeWidth={5} opacity={0.55} />

				{/* Side table with flowers */}
				<rect x={1058} y={720} width={12} height={150} fill={ILLO.woodDark} />
				<ellipse cx={1064} cy={872} rx={50} ry={9} fill={ILLO.woodDark} />
				<ellipse cx={1064} cy={720} rx={74} ry={13} fill={ILLO.wood} />
				<path d="M1044 714 q-8 -44 20 -50 q28 6 20 50 z" fill={ILLO.cream} />
				{[-26, 0, 26].map((r, i) => (
					<g key={r} transform={`translate(1064 664) rotate(${r + sway * 2})`}>
						<rect x={-2} y={-64} width={4} height={64} fill={ILLO.sageDark} />
						<LeafShape x={12} y={-30} size={30} rotate={50} />
						<circle cx={0} cy={-70} r={15} fill={i === 1 ? COLORS.orange : COLORS.maroon} />
						<circle cx={0} cy={-70} r={6} fill="#FFD9A0" />
					</g>
				))}

				{/* Armchair back */}
				<rect x={1262} y={548} width={96} height={300} rx={40} fill={ILLO.sage} />
			</RoomShell>

			{/* Resident */}
			<Person
				x={1250}
				y={STAND_Y}
				scale={PERSON_SCALE}
				facing={-1}
				look={CAST.june}
				pose={{
					blink: blink(t, 11),
					seated: true,
					armNear: {angles: [30 + delight * 100, 40 + delight * (20 + sway * 16)]},
					armFar: {angles: [26 + delight * 86, 44 + delight * (26 - sway * 16)]},
					headTilt: -delight * 5 + nod * 2,
				}}
			/>
			{/* Seat, lap blanket and armrest */}
			<rect x={1150} y={806} width={200} height={48} rx={18} fill={ILLO.sageDark} />
			<rect x={1164} y={848} width={180} height={34} rx={10} fill={ILLO.sage} />
			<rect x={1172} y={878} width={18} height={22} fill={ILLO.woodDark} />
			<rect x={1318} y={878} width={18} height={22} fill={ILLO.woodDark} />
			<path d="M1272 766 H1150 Q1112 766 1110 800 V874 Q1150 890 1192 874 V814 H1272 Z" fill={COLORS.peach} />
			<path d="M1110 826 H1192 M1110 852 H1192" stroke={COLORS.orange} strokeWidth={7} opacity={0.8} />
			<rect x={1196} y={736} width={160} height={34} rx={17} fill={ILLO.sage} />
			<rect x={1196} y={736} width={34} height={110} rx={17} fill={ILLO.sage} />

			{/* Nurse with the tea tray */}
			<Person
				x={nurseX}
				y={STAND_Y}
				scale={PERSON_SCALE}
				look={CAST.nurse}
				pose={{
					blink: blink(t, 0),
					legNear: stride(phase, 18 * moving),
					legFar: stride(phase + Math.PI, 18 * moving),
					armNear: {reach: [70, -226]},
					armFar: {reach: [84, -226]},
					lean: 3 + (1 - moving) * 5,
					lift: -4 * moving * Math.abs(Math.sin(phase)),
					headTilt: (1 - moving) * nod * 3,
				}}
			>
				<g transform="translate(44 -238)">
					<rect x={0} y={0} width={124} height={10} rx={5} fill={ILLO.wood} />
					<path d="M54 0 v-30 h36 v30 z" fill={ILLO.cream} />
					<path d="M90 -24 q16 2 14 12 q-2 8 -14 8" fill="none" stroke={ILLO.cream} strokeWidth={6} />
					<rect x={50} y={-34} width={44} height={6} rx={3} fill={COLORS.orange} />
					<ellipse cx={24} cy={-4} rx={20} ry={5} fill={ILLO.cream} />
					<path d="M12 -6 q12 -16 24 0 z" fill={COLORS.peach} />
					{[0, 1].map((i) => {
						const s = ((t + i * 14) % 28) / 28;
						return (
							<path
								key={i}
								d="M0 0 q-8 -12 0 -22 q8 -10 0 -22"
								transform={`translate(${64 + i * 16} ${-40 - s * 26})`}
								fill="none"
								stroke="#FFFFFF"
								strokeWidth={5}
								strokeLinecap="round"
								opacity={0.8 * Math.sin(s * Math.PI)}
							/>
						);
					})}
				</g>
			</Person>

			{/* Doctor */}
			<Person
				x={1610}
				y={STAND_Y}
				scale={PERSON_SCALE}
				facing={-1}
				look={CAST.doctor}
				pose={{
					blink: blink(t, 40),
					armNear: {reach: [50, -238]},
					armFar: {angles: [34 + delight * 20, 70 + nod * 10]},
					headTilt: 4 + nod * 4,
				}}
			>
				<g transform="translate(26 -296) rotate(-6)">
					<rect width={76} height={100} rx={8} fill={ILLO.wood} />
					<rect x={8} y={12} width={60} height={80} rx={3} fill={ILLO.cream} />
					<rect x={24} y={-6} width={28} height={14} rx={4} fill={ILLO.steelDark} />
				</g>
			</Person>
		</svg>
	);
};
