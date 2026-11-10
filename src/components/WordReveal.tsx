import React from 'react';
import {ramp} from '../lib/anim';
import {Underline} from './Underline';

/**
 * Kinetic line of type: each word rises into place through a mask, one after
 * another. `start` is the frame the first word begins; `stagger` is the gap
 * between words. `highlights` underlines (and recolors) specific words at a
 * given frame: {wordIndex: frame}.
 */
export const WordReveal: React.FC<{
	text: string;
	frame: number;
	start: number;
	stagger?: number;
	duration?: number;
	style?: React.CSSProperties;
	highlights?: Record<number, number>;
	highlightColor?: string;
}> = ({text, frame, start, stagger = 3, duration = 20, style, highlights, highlightColor}) => {
	const words = text.split(' ');
	return (
		<div style={{lineHeight: 1.12, ...style}}>
			{words.map((word, i) => {
				const p = ramp(frame, start + i * stagger, duration);
				const at = highlights?.[i];
				const lit = at !== undefined && frame >= at;
				return (
					<React.Fragment key={i}>
						<span
							style={{
								display: 'inline-block',
								position: 'relative',
								overflow: at === undefined ? 'hidden' : 'visible',
								verticalAlign: 'top',
								// Room for descenders inside the mask.
								paddingBottom: '0.16em',
								marginBottom: '-0.16em',
							}}
						>
							<span
								style={{
									display: 'inline-block',
									transform: `translateY(${(1 - p) * 112}%)`,
									opacity: at === undefined ? 1 : p,
									color: lit ? highlightColor : undefined,
								}}
							>
								{word}
							</span>
							{at !== undefined && highlightColor ? (
								<Underline frame={frame} start={at} color={highlightColor} thickness={7} style={{bottom: '0.02em'}} />
							) : null}
						</span>
						{i < words.length - 1 ? ' ' : null}
					</React.Fragment>
				);
			})}
		</div>
	);
};
