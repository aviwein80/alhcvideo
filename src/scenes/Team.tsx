import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {Leaf} from '../components/Leaf';
import {TreeMark} from '../components/TreeMark';
import {Underline} from '../components/Underline';
import {WordReveal} from '../components/WordReveal';
import {CONTENT} from '../content';
import {ramp} from '../lib/anim';
import {CAPTION_SAFE, COLORS, FONTS, beats} from '../theme';

/** Scene 5 — three roles hit on the beat, then resolve into one team. */
export const Team: React.FC = () => {
	const frame = useCurrentFrame();
	const {roles, headline, lines} = CONTENT.team;
	const turn = beats(4);

	return (
		<Background variant="orange">
			<TreeMark
				height={960}
				color={COLORS.white}
				opacity={0.1}
				style={{position: 'absolute', right: -200, top: 40, transform: `scale(${1 + frame / 2600})`}}
			/>

			{/* Part 1: the roles, stacked. */}
			<AbsoluteFill style={{padding: `0 170px ${CAPTION_SAFE}px`, justifyContent: 'center'}}>
				{roles.map((role, i) => {
					const enter = ramp(frame, 4 + beats(i), 20);
					const exit = ramp(frame, turn - 22 + i * 3, 14, Easing.in(Easing.cubic));
					return (
						<div key={role} style={{overflow: 'hidden', paddingBottom: 26, marginBottom: -26}}>
							<div
								style={{
									fontFamily: FONTS.headline,
									fontWeight: 700,
									fontSize: 196,
									lineHeight: 1.08,
									color: COLORS.white,
									transform: `translateY(${(1 - enter) * 112 - exit * 118}%)`,
								}}
							>
								{role}
							</div>
						</div>
					);
				})}
			</AbsoluteFill>

			{/* Part 2: one team. */}
			<AbsoluteFill style={{padding: `0 170px ${CAPTION_SAFE}px`, justifyContent: 'center'}}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 22,
						fontFamily: FONTS.body,
						fontWeight: 700,
						fontSize: 32,
						letterSpacing: '0.2em',
						textTransform: 'uppercase',
						color: COLORS.white,
						opacity: ramp(frame, turn, 18),
					}}
				>
					{roles.map((role, i) => (
						<React.Fragment key={role}>
							{i > 0 ? <Leaf size={30} color={COLORS.maroonDeep} rotate={90} /> : null}
							<span>{role.replace('.', '')}</span>
						</React.Fragment>
					))}
				</div>
				<div style={{height: 30}} />
				<WordReveal
					text={headline}
					frame={frame}
					start={turn + 4}
					stagger={4}
					style={{fontFamily: FONTS.headline, fontWeight: 700, fontSize: 150, color: COLORS.white, whiteSpace: 'nowrap'}}
				/>
				<div style={{height: 34}} />
				<WordReveal
					text={lines[0]}
					frame={frame}
					start={beats(5.5)}
					stagger={3}
					style={{fontFamily: FONTS.headline, fontWeight: 600, fontSize: 82, color: COLORS.white}}
				/>
				<div style={{position: 'relative', alignSelf: 'flex-start'}}>
					<WordReveal
						text={lines[1]}
						frame={frame}
						start={beats(6.5)}
						stagger={3}
						style={{fontFamily: FONTS.headline, fontWeight: 700, fontSize: 82, color: COLORS.white}}
					/>
					<Underline frame={frame} start={beats(7)} duration={22} color={COLORS.maroonDeep} thickness={11} />
				</div>
			</AbsoluteFill>
		</Background>
	);
};
