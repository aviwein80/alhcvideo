import React, {useId} from 'react';
import {LOGO_VIEWBOX, type LogoShape} from '../brand/logoPaths';
import {BASE, GROUND, LEAVES, SUBLINE, TRUNK, WORDMARK} from '../brand/logoParts';
import {EASE_IN_OUT, pop, ramp} from '../lib/anim';

const around = (s: LogoShape, inner: string) => `translate(${s.cx} ${s.cy}) ${inner} translate(${-s.cx} ${-s.cy})`;

/**
 * The official logo, drawn from its own shapes (assets/brand/logo.svg).
 * Without `frame` it is static. With `frame` it builds itself: ground line,
 * trunk, leaves, then the lettering. `speed` shortens the build (2 = twice
 * as fast). At speed 1 the build takes about 115 frames.
 */
export const Logo: React.FC<{width: number; frame?: number; speed?: number}> = ({width, frame, speed = 1}) => {
	const clipId = useId();
	const t = frame === undefined ? 10_000 : frame * speed;
	const {x, y, width: vw, height: vh} = LOGO_VIEWBOX;

	const trunkGrow = ramp(t, 6, 30, EASE_IN_OUT);
	const trunkTop = TRUNK.cy - TRUNK.h / 2;

	return (
		<svg width={width} height={(width * vh) / vw} viewBox={`${x} ${y} ${vw} ${vh}`} style={{overflow: 'visible'}}>
			<defs>
				<clipPath id={clipId}>
					<rect
						x={TRUNK.cx - TRUNK.w}
						y={trunkTop + TRUNK.h * (1 - trunkGrow)}
						width={TRUNK.w * 2}
						height={TRUNK.h * trunkGrow}
					/>
				</clipPath>
			</defs>

			{GROUND.map((s) => {
				const innerEdge = s.cx < TRUNK.cx ? s.cx + s.w / 2 : s.cx - s.w / 2;
				const p = ramp(t, 0, 26);
				return (
					<path
						key={s.d}
						d={s.d}
						fill={s.fill}
						opacity={Math.min(1, p * 3)}
						transform={`translate(${innerEdge} 0) scale(${p} 1) translate(${-innerEdge} 0)`}
					/>
				);
			})}

			{BASE.map((s) => (
				<path key={s.d} d={s.d} fill={s.fill} transform={around(s, `scale(${pop(t, 4)})`)} />
			))}

			<path d={TRUNK.d} fill={TRUNK.fill} clipPath={`url(#${clipId})`} />

			{LEAVES.map((s, i) => {
				const p = pop(t, 24 + i * 1.5, 9);
				const side = s.cx < TRUNK.cx ? -1 : 1;
				return (
					<path
						key={s.d}
						d={s.d}
						fill={s.fill}
						transform={around(s, `rotate(${(1 - p) * 40 * side}) scale(${p})`)}
					/>
				);
			})}

			{WORDMARK.map((s, i) => {
				const p = ramp(t, 62 + i * 2.5, 22);
				return <path key={s.d} d={s.d} fill={s.fill} opacity={p} transform={`translate(0 ${(1 - p) * 46})`} />;
			})}

			{SUBLINE.map((s, i) => {
				const p = ramp(t, 88 + i * 1.5, 20);
				// Letters start slightly gathered toward the centre, then space out.
				const gather = (LOGO_VIEWBOX.width / 2 - s.cx) * 0.12 * (1 - p);
				return <path key={s.d} d={s.d} fill={s.fill} opacity={p} transform={`translate(${gather} 0)`} />;
			})}
		</svg>
	);
};
