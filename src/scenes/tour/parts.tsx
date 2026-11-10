import React from 'react';
import {LEAF} from '../../brand/logoParts';
import {COLORS, ILLO} from '../../theme';

// Building blocks shared by the four illustrated rooms. Each room is drawn in
// a 1920 × 1080 SVG; the floor line sits at FLOOR_Y.
export const ROOM_W = 1920;
export const ROOM_H = 1080;
export const FLOOR_Y = 800;
/** Where characters stand (a little way "into" the floor). */
export const STAND_Y = 892;
export const PERSON_SCALE = 1.2;

/** Wall, wainscot, baseboard and plank floor. */
export const RoomShell: React.FC<{wall?: string; children?: React.ReactNode}> = ({wall = ILLO.wall, children}) => (
	<g>
		<rect width={ROOM_W} height={ROOM_H} fill={wall} />
		<rect y={590} width={ROOM_W} height={FLOOR_Y - 590} fill={ILLO.wallShade} />
		<rect y={582} width={ROOM_W} height={10} fill={ILLO.cream} />
		<rect y={FLOOR_Y} width={ROOM_W} height={ROOM_H - FLOOR_Y} fill={ILLO.floor} />
		{[860, 930, 1010].map((y) => (
			<rect key={y} y={y} width={ROOM_W} height={3} fill={ILLO.floorShade} opacity={0.7} />
		))}
		{[180, 620, 1080, 1500].map((x, i) => (
			<rect key={x} x={x + (i % 2) * 90} y={FLOOR_Y} width={3} height={60} fill={ILLO.floorShade} opacity={0.7} />
		))}
		<rect y={FLOOR_Y - 16} width={ROOM_W} height={18} fill={ILLO.cream} />
		{children}
	</g>
);

/** One leaf from the logo, positioned inside a room drawing. */
export const LeafShape: React.FC<{x: number; y: number; size: number; rotate?: number; color?: string; opacity?: number}> = ({
	x,
	y,
	size,
	rotate = 0,
	color = ILLO.sage,
	opacity = 1,
}) => (
	<path
		d={LEAF.d}
		fill={color}
		opacity={opacity}
		transform={`translate(${x} ${y}) rotate(${rotate}) scale(${size / LEAF.h}) translate(${-LEAF.cx} ${-LEAF.cy})`}
	/>
);

/** Potted plant whose leaves sway gently with `frame`. */
export const Plant: React.FC<{x: number; y: number; frame: number; scale?: number; pot?: string}> = ({
	x,
	y,
	frame,
	scale = 1,
	pot = COLORS.orange,
}) => {
	const sway = Math.sin(frame / 22 + x) * 3;
	const leaves: [number, number, number, number][] = [
		[-52, -190, -38, 96],
		[52, -196, 36, 100],
		[0, -250, 0, 118],
		[-84, -128, -68, 78],
		[86, -132, 66, 80],
		[-30, -150, -18, 84],
		[30, -152, 20, 84],
	];
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`}>
			<ellipse cx={0} cy={4} rx={74} ry={9} fill="rgba(74, 42, 34, 0.12)" />
			{leaves.map(([lx, ly, r, s], i) => (
				<LeafShape key={i} x={lx} y={ly} rotate={r + sway * (1 + i * 0.15)} size={s} color={i % 2 ? ILLO.sage : ILLO.sageDark} />
			))}
			<path d="M-56 -92 h112 l-14 92 h-84 z" fill={pot} />
			<rect x={-62} y={-104} width={124} height={22} rx={8} fill={pot} />
			<rect x={-62} y={-104} width={124} height={22} rx={8} fill="rgba(255,255,255,0.18)" />
		</g>
	);
};

/** Window with sky, soft hills and a cross frame. */
export const Window: React.FC<{x: number; y: number; w: number; h: number; frame: number}> = ({x, y, w, h, frame}) => {
	const drift = (frame * 0.35) % (w + 220);
	const id = `win-${x}-${y}`;
	return (
		<g>
			<defs>
				<clipPath id={id}>
					<rect x={x} y={y} width={w} height={h} rx={10} />
				</clipPath>
			</defs>
			<rect x={x - 16} y={y - 16} width={w + 32} height={h + 32} rx={18} fill={ILLO.cream} />
			<g clipPath={`url(#${id})`}>
				<rect x={x} y={y} width={w} height={h} fill={ILLO.sky} />
				<rect x={x} y={y + h * 0.55} width={w} height={h * 0.45} fill={ILLO.skyDeep} opacity={0.35} />
				<g fill="#FFFFFF" opacity={0.9}>
					<ellipse cx={x - 110 + drift} cy={y + h * 0.26} rx={70} ry={22} />
					<ellipse cx={x - 60 + drift} cy={y + h * 0.2} rx={50} ry={24} />
				</g>
				<ellipse cx={x + w * 0.3} cy={y + h + 30} rx={w * 0.5} ry={h * 0.32} fill={ILLO.sage} />
				<ellipse cx={x + w * 0.85} cy={y + h + 40} rx={w * 0.45} ry={h * 0.4} fill={ILLO.sageDark} />
			</g>
			<rect x={x + w / 2 - 5} y={y} width={10} height={h} fill={ILLO.cream} />
			<rect x={x} y={y + h * 0.42} width={w} height={10} fill={ILLO.cream} />
			<rect x={x - 26} y={y + h + 12} width={w + 52} height={16} rx={6} fill={ILLO.cream} />
		</g>
	);
};

/** Wall sconce with a warm glow that breathes. */
export const Sconce: React.FC<{x: number; y: number; frame: number}> = ({x, y, frame}) => {
	const glow = 0.5 + 0.08 * Math.sin(frame / 14 + x);
	const id = `glow-${x}-${y}`;
	return (
		<g>
			<defs>
				<radialGradient id={id}>
					<stop offset="0%" stopColor="#FFE2B8" stopOpacity={glow} />
					<stop offset="100%" stopColor="#FFE2B8" stopOpacity={0} />
				</radialGradient>
			</defs>
			<circle cx={x} cy={y} r={170} fill={`url(#${id})`} />
			<rect x={x - 5} y={y + 16} width={10} height={44} fill={ILLO.woodDark} />
			<path d={`M${x - 34} ${y + 20} h68 l-14 -50 h-40 z`} fill="#FFE9C9" />
		</g>
	);
};

/** Simple framed picture: an abstract landscape in brand colors. */
export const Frame: React.FC<{x: number; y: number; w: number; h: number; tone?: string}> = ({x, y, w, h, tone = COLORS.peach}) => (
	<g>
		<rect x={x} y={y} width={w} height={h} rx={6} fill={ILLO.wood} />
		<rect x={x + 12} y={y + 12} width={w - 24} height={h - 24} fill={ILLO.cream} />
		<circle cx={x + w * 0.68} cy={y + h * 0.4} r={Math.min(w, h) * 0.13} fill={COLORS.orange} />
		<path d={`M${x + 12} ${y + h - 12} l${(w - 24) * 0.4} ${-h * 0.34} l${(w - 24) * 0.6} ${h * 0.34} z`} fill={tone} />
	</g>
);

/** Musical note that floats up and fades; `t` runs 0 → 1. */
export const Note: React.FC<{x: number; y: number; t: number; color: string}> = ({x, y, t, color}) => (
	<g transform={`translate(${x + Math.sin(t * 6) * 16} ${y - t * 170}) rotate(${Math.sin(t * 5) * 14})`} opacity={Math.sin(Math.min(1, t) * Math.PI)}>
		<ellipse cx={0} cy={0} rx={13} ry={10} fill={color} transform="rotate(-20)" />
		<rect x={10} y={-48} width={5} height={50} fill={color} />
		<path d="M10 -48 q22 4 24 26 q-10 -12 -24 -12 z" fill={color} />
	</g>
);
