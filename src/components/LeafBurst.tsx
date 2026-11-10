import React from 'react';
import {rand} from '../lib/anim';
import {FPS} from '../theme';
import {Leaf} from './Leaf';

/**
 * A burst of logo leaves thrown outward from a point, like confetti. Starts
 * at frame `start`; each leaf slows, drifts down and fades over about `life`
 * seconds.
 */
export const LeafBurst: React.FC<{
	frame: number;
	start: number;
	x: number;
	y: number;
	count?: number;
	colors: string[];
	power?: number;
	life?: number;
	seed?: number;
}> = ({frame, start, x, y, count = 28, colors, power = 1, life = 1.7, seed = 1}) => {
	const t = (frame - start) / FPS;
	if (t < 0 || t > life) {
		return null;
	}
	return (
		<>
			{Array.from({length: count}, (_, i) => {
				const angle = rand(seed + i) * Math.PI * 2;
				const speed = (520 + rand(seed + i + 100) * 900) * power;
				// Fast at first, then air resistance takes over.
				const travelled = (speed * (1 - Math.exp(-t * 3.2))) / 3.2;
				const fall = 260 * t * t;
				const size = 34 + rand(seed + i + 200) * 56;
				const fade = Math.min(1, (life - t) / (life * 0.45));
				return (
					<Leaf
						key={i}
						size={size}
						color={colors[i % colors.length]}
						rotate={rand(seed + i + 300) * 360 + t * (120 + rand(seed + i + 400) * 260)}
						style={{
							position: 'absolute',
							left: x + Math.cos(angle) * travelled - size / 4,
							top: y + Math.sin(angle) * travelled * 0.8 + fall - size / 2,
							opacity: fade,
						}}
					/>
				);
			})}
		</>
	);
};
