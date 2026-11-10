import {LOGO_SHAPES, type LogoShape} from './logoPaths';

// Sorts the logo's shapes into the parts the animation needs, by geometry
// rather than by position in the file, so a re-exported logo still works.
const [treeFill] = [LOGO_SHAPES[0].fill];
const tree = LOGO_SHAPES.filter((s) => s.fill === treeFill);
const lettering = LOGO_SHAPES.filter((s) => s.fill !== treeFill);

/** The trunk and branches: the tallest piece of the tree. */
export const TRUNK: LogoShape = tree.reduce((a, b) => (b.h > a.h ? b : a));
/** The two halves of the ground line: wide and flat. */
export const GROUND: LogoShape[] = tree.filter((s) => s !== TRUNK && s.w > 4 * s.h);
const rest = tree.filter((s) => s !== TRUNK && !GROUND.includes(s));
/** The small wedge where the trunk meets the ground. */
export const BASE: LogoShape[] = rest.filter((s) => s.cy > TRUNK.cy + TRUNK.h * 0.25);
/** Leaves, ordered from the middle of the crown outward. */
const crown = {x: TRUNK.cx, y: TRUNK.cy - TRUNK.h * 0.3};
export const LEAVES: LogoShape[] = rest
	.filter((s) => !BASE.includes(s))
	.sort((a, b) => Math.hypot(a.cx - crown.x, a.cy - crown.y) - Math.hypot(b.cx - crown.x, b.cy - crown.y));

const tallest = Math.max(...lettering.map((s) => s.h));
/** "AUTUMN LAKE", left to right. */
export const WORDMARK: LogoShape[] = lettering.filter((s) => s.h > tallest * 0.7).sort((a, b) => a.cx - b.cx);
/** "HEALTHCARE", left to right. */
export const SUBLINE: LogoShape[] = lettering.filter((s) => s.h <= tallest * 0.7).sort((a, b) => a.cx - b.cx);

/** One upright leaf, reused as a bullet and accent. */
export const LEAF: LogoShape = LEAVES.reduce((a, b) => (b.h / b.w > a.h / a.w ? b : a));
