import React, {useId} from 'react';
import {COLORS, ILLO} from '../../theme';

// A flat, side-view cut-out character for the illustrated tour. Everything is
// authored facing right, with the origin on the floor under the hips and y
// pointing down. Angles are in degrees: 0 hangs straight down, positive
// swings forward (the way the character faces).

const RAD = Math.PI / 180;
const THIGH = 82;
const SHIN = 82;
const UPPER_ARM = 74;
const FOREARM = 70;
const HEAD_R = 44;

type Point = {x: number; y: number};

/** An arm is either two joint angles [shoulder, elbow] or a point to reach. */
export type Arm = {angles: [number, number]} | {reach: [number, number]};
/** A leg is [hip, knee] angles. */
export type Leg = [number, number];

export type Pose = {
	armNear?: Arm;
	armFar?: Arm;
	legNear?: Leg;
	legFar?: Leg;
	/** Forward lean of the upper body, degrees. */
	lean?: number;
	headTilt?: number;
	/** Raises the whole body (negative = up), for bounce. */
	lift?: number;
	seated?: boolean;
	/** 0 = eyes open, 1 = closed. */
	blink?: number;
};

export type Look = {
	skin: string;
	hair: string;
	hairStyle: 'short' | 'bun' | 'bob' | 'curly' | 'bald' | 'ponytail';
	top: string;
	sleeves: 'short' | 'long';
	bottom: string;
	shoes?: string;
	outfit?: 'scrubs' | 'coat' | 'polo' | 'cardigan' | 'sweater' | 'apron';
	/** Second color: scrub trim, blouse under a cardigan, collar. */
	trim?: string;
	skirt?: boolean;
	glasses?: boolean;
	beard?: string;
	stethoscope?: boolean;
	badge?: boolean;
};

const polar = (from: Point, length: number, angle: number): Point => ({
	x: from.x + length * Math.sin(angle * RAD),
	y: from.y + length * Math.cos(angle * RAD),
});

/** Two-bone reach: the joint angles that put the hand on `target`. */
const solveArm = (shoulder: Point, target: Point): [number, number] => {
	const dx = target.x - shoulder.x;
	const dy = target.y - shoulder.y;
	const d = Math.min(Math.hypot(dx, dy), UPPER_ARM + FOREARM - 1);
	const toTarget = Math.atan2(dx, dy) / RAD;
	const alpha = Math.acos((UPPER_ARM ** 2 + d ** 2 - FOREARM ** 2) / (2 * UPPER_ARM * d)) / RAD;
	const gamma = Math.acos((UPPER_ARM ** 2 + FOREARM ** 2 - d ** 2) / (2 * UPPER_ARM * FOREARM)) / RAD;
	return [toTarget - alpha, 180 - gamma];
};

const Limb: React.FC<{from: Point; to: Point; color: string; width: number}> = ({from, to, color, width}) => (
	<line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={width} strokeLinecap="round" />
);

/** 1 while the eyes are shut. Each character blinks about every 2.5 s; `offset` staggers them. */
export const blink = (frame: number, offset = 0): number => ((((frame + offset) % 76) + 76) % 76 < 4 ? 1 : 0);

/** A leg ready for a walk cycle. `phase` is in radians; one step = π. */
export const stride = (phase: number, reach = 20): Leg => [
	reach * Math.sin(phase),
	Math.max(0, 34 * Math.sin(phase - Math.PI / 2)) + 4,
];

export const Person: React.FC<{
	x: number;
	y: number;
	scale?: number;
	facing?: 1 | -1;
	look: Look;
	pose?: Pose;
	/** Drawn in the character's own space, under the near arm (held items). */
	children?: React.ReactNode;
}> = ({x, y, scale = 1, facing = 1, look, pose = {}, children}) => {
	const id = useId();
	const seated = pose.seated ?? false;
	const lean = pose.lean ?? 0;
	const hip: Point = {x: 0, y: (seated ? -(SHIN + 8) : -(THIGH + SHIN + 8)) + (pose.lift ?? 0)};
	const shoulder: Point = {x: 0, y: hip.y - 116};
	const head: Point = {x: 6, y: hip.y - 186};
	const torsoTop = hip.y - 138;
	const shoes = look.shoes ?? ILLO.charcoal;

	const leg = (pivotX: number, [hipAngle, knee]: Leg) => {
		const pivot = {x: pivotX, y: hip.y};
		const kneePoint = polar(pivot, THIGH, hipAngle);
		const shinAngle = hipAngle - knee;
		const ankle = polar(kneePoint, SHIN, shinAngle);
		const legColor = look.skirt ? look.skin : look.bottom;
		return (
			<g>
				<Limb from={pivot} to={kneePoint} color={legColor} width={36} />
				<Limb from={kneePoint} to={ankle} color={legColor} width={32} />
				<g transform={`translate(${ankle.x} ${ankle.y}) rotate(${-shinAngle})`}>
					<path d="M-18 -6 h30 a16 13 0 0 1 16 13 v5 h-46 z" fill={shoes} />
				</g>
			</g>
		);
	};

	const arm = (pivotX: number, spec: Arm | undefined, fallback: [number, number]) => {
		const pivot = {x: pivotX, y: shoulder.y};
		let angles = fallback;
		if (spec && 'angles' in spec) {
			angles = spec.angles;
		} else if (spec) {
			// The reach target is given in upright space; undo the lean first.
			const c = Math.cos(-lean * RAD);
			const s = Math.sin(-lean * RAD);
			const rx = spec.reach[0] - hip.x;
			const ry = spec.reach[1] - hip.y;
			angles = solveArm(pivot, {x: hip.x + rx * c - ry * s, y: hip.y + rx * s + ry * c});
		}
		const elbow = polar(pivot, UPPER_ARM, angles[0]);
		const wrist = polar(elbow, FOREARM, angles[0] + angles[1]);
		const hand = polar(elbow, FOREARM + 8, angles[0] + angles[1]);
		const long = look.sleeves === 'long';
		const sleeve = look.outfit === 'coat' ? ILLO.cream : look.top;
		return (
			<g>
				<Limb from={pivot} to={elbow} color={long ? sleeve : look.skin} width={28} />
				<Limb from={elbow} to={wrist} color={long ? sleeve : look.skin} width={25} />
				{long ? null : <Limb from={pivot} to={polar(pivot, UPPER_ARM * 0.6, angles[0])} color={sleeve} width={31} />}
				<circle cx={hand.x} cy={hand.y} r={15} fill={look.skin} />
			</g>
		);
	};

	const legNear = pose.legNear ?? (seated ? [86, 86] : [2, 2]);
	const legFar = pose.legFar ?? (seated ? [80, 82] : [-3, 2]);
	const coat = look.outfit === 'coat';
	const bodyColor = coat ? ILLO.cream : look.top;
	const eyeOpen = 1 - (pose.blink ?? 0) * 0.9;

	return (
		<g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
			<defs>
				<clipPath id={`${id}-head`}>
					<circle cx={head.x} cy={head.y} r={HEAD_R} />
				</clipPath>
			</defs>

			<ellipse cx={seated ? 40 : 4} cy={6} rx={seated ? 96 : 70} ry={10} fill="rgba(74, 42, 34, 0.12)" />
			{leg(6, legFar as Leg)}
			<g transform={`rotate(${lean} ${hip.x} ${hip.y})`}>{arm(8, pose.armFar, [-6, 10])}</g>
			{leg(-4, legNear as Leg)}

			{look.skirt ? (
				<path
					d={
						seated
							? `M-34 ${hip.y - 20} h66 l88 6 q14 26 -4 52 h-150 z`
							: `M-34 ${hip.y - 20} h68 l22 128 q-56 16 -112 0 z`
					}
					fill={look.bottom}
				/>
			) : null}

			<g transform={`rotate(${lean} ${hip.x} ${hip.y})`}>
				{/* Torso */}
				<rect x={-37} y={torsoTop} width={74} height={coat ? 206 : 152} rx={coat ? 26 : 32} fill={bodyColor} />
				{look.outfit === 'cardigan' ? (
					<path d={`M6 ${torsoTop + 4} h22 q9 0 9 12 v${118} q0 14 -12 14 h-19 z`} fill={look.trim ?? ILLO.cream} />
				) : null}
				{look.outfit === 'apron' ? (
					<g>
						<path d={`M-4 ${torsoTop + 46} h41 v${150} q0 14 -14 14 h-27 z`} fill={ILLO.cream} />
						<path d={`M8 ${torsoTop + 46} L16 ${torsoTop + 6}`} stroke={ILLO.cream} strokeWidth={6} />
					</g>
				) : null}
				{look.outfit === 'sweater' ? (
					<ellipse cx={8} cy={torsoTop + 6} rx={24} ry={10} fill="rgba(0,0,0,0.14)" />
				) : null}

				{/* Neck and neckline */}
				<rect x={-8} y={torsoTop - 14} width={24} height={30} rx={8} fill={look.skin} />
				{look.outfit === 'scrubs' || coat ? (
					<path
						d={`M-6 ${torsoTop} L30 ${torsoTop} L16 ${torsoTop + 30} Z`}
						fill={coat ? look.top : look.skin}
						stroke={coat ? ILLO.cream : look.trim ?? 'rgba(255,255,255,0.5)'}
						strokeWidth={coat ? 0 : 5}
						strokeLinejoin="round"
					/>
				) : null}
				{coat ? (
					<path d={`M16 ${torsoTop + 30} V${torsoTop + 200}`} stroke={ILLO.wallShade} strokeWidth={4} />
				) : null}
				{look.outfit === 'polo' ? (
					<path
						d={`M-8 ${torsoTop + 2} L10 ${torsoTop + 22} L16 ${torsoTop + 4} L24 ${torsoTop + 22} L34 ${torsoTop + 2} Z`}
						fill={look.trim ?? ILLO.cream}
					/>
				) : null}
				{look.badge ? (
					<g>
						<rect x={12} y={torsoTop + 52} width={18} height={24} rx={4} fill={ILLO.cream} />
						<rect x={16} y={torsoTop + 46} width={10} height={8} rx={2} fill={COLORS.orange} />
					</g>
				) : null}
				{look.stethoscope ? (
					<g fill="none" stroke={ILLO.charcoal} strokeWidth={5} strokeLinecap="round">
						<path d={`M-6 ${torsoTop + 2} Q4 ${torsoTop + 62} 22 ${torsoTop + 66} Q34 ${torsoTop + 60} 30 ${torsoTop + 4}`} />
						<circle cx={22} cy={torsoTop + 74} r={7} fill={ILLO.steel} strokeWidth={3} />
					</g>
				) : null}

				{/* Head */}
				<g transform={`rotate(${pose.headTilt ?? 0} ${head.x - 6} ${head.y + 36})`}>
					{look.hairStyle === 'short' || look.hairStyle === 'bun' || look.hairStyle === 'ponytail' ? (
						<circle cx={head.x - 5} cy={head.y - 4} r={47} fill={look.hair} />
					) : null}
					{look.hairStyle === 'bun' ? <circle cx={head.x - 38} cy={head.y - 38} r={19} fill={look.hair} /> : null}
					{look.hairStyle === 'ponytail' ? (
						<path
							d={`M${head.x - 40} ${head.y - 10} q-26 22 -14 74`}
							stroke={look.hair}
							strokeWidth={20}
							strokeLinecap="round"
							fill="none"
						/>
					) : null}
					{look.hairStyle === 'bob' ? <ellipse cx={head.x - 9} cy={head.y + 6} rx={48} ry={52} fill={look.hair} /> : null}
					{look.hairStyle === 'curly'
						? [200, 240, 280, 320, 0, 40, 160].map((a) => (
								<circle
									key={a}
									cx={head.x - 4 + 32 * Math.cos(a * RAD)}
									cy={head.y - 6 + 32 * Math.sin(a * RAD)}
									r={25}
									fill={look.hair}
								/>
							))
						: null}

					<circle cx={head.x} cy={head.y} r={HEAD_R} fill={look.skin} />
					<ellipse cx={head.x + 43} cy={head.y + 6} rx={6} ry={5} fill={look.skin} />
					{look.hairStyle === 'bald' ? null : <circle cx={head.x - 18} cy={head.y + 5} r={8} fill={look.skin} />}
					{look.hairStyle === 'bald' ? null : <circle cx={head.x - 18} cy={head.y + 5} r={8} fill="rgba(0,0,0,0.08)" />}

					{look.hairStyle === 'bald' ? (
						<path
							clipPath={`url(#${id}-head)`}
							d={`M${head.x - 50} ${head.y - 8} L${head.x - 22} ${head.y - 10} L${head.x - 12} ${head.y + 50} L${head.x - 50} ${head.y + 50} Z`}
							fill={look.hair}
						/>
					) : null}
					{look.hairStyle !== 'bald' ? (
						<path
							clipPath={`url(#${id}-head)`}
							d={`M${head.x - 50} ${head.y - 50} h100 v24 l-30 6 L${head.x - 24} ${head.y - 8} L${head.x - 50} ${head.y + 14} Z`}
							fill={look.hair}
						/>
					) : null}

					{look.beard ? (
						<path
							d={`M${head.x - 10} ${head.y + 8} Q${head.x - 6} ${head.y + 52} ${head.x + 20} ${head.y + 50} Q${head.x + 42} ${head.y + 46} ${head.x + 38} ${head.y + 12} Q${head.x + 14} ${head.y + 26} ${head.x - 10} ${head.y + 8} Z`}
							fill={look.beard}
						/>
					) : null}

					<circle cx={head.x + 8} cy={head.y + 13} r={8} fill={COLORS.orange} opacity={0.22} />
					<ellipse cx={head.x + 13} cy={head.y - 3} rx={3.6} ry={4.8 * eyeOpen} fill={ILLO.line} />
					<ellipse cx={head.x + 30} cy={head.y - 3} rx={3.2} ry={4.4 * eyeOpen} fill={ILLO.line} />
					<path
						d={`M${head.x + 10} ${head.y + 13} Q${head.x + 22} ${head.y + 26} ${head.x + 33} ${head.y + 12}`}
						fill="none"
						stroke={ILLO.line}
						strokeWidth={3.6}
						strokeLinecap="round"
					/>
					{look.glasses ? (
						<g fill="rgba(255,255,255,0.35)" stroke={ILLO.line} strokeWidth={3}>
							<circle cx={head.x + 13} cy={head.y - 3} r={10} />
							<circle cx={head.x + 31} cy={head.y - 3} r={9} />
							<path d={`M${head.x + 3} ${head.y - 4} L${head.x - 16} ${head.y - 1}`} fill="none" />
						</g>
					) : null}
				</g>

				{children}
				{arm(-2, pose.armNear, [4, 8])}
			</g>
		</g>
	);
};
