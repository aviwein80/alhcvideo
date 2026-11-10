import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Font files live in assets/fonts. loadFont() holds the render until each
// file is ready, so no frame is drawn in a fallback font.
//
// HEADLINE is a stand-in. The website sets headlines in DecourSoft, a
// commercial font that was not supplied. To switch once you have licensed
// files:
//   1. Put DecourSoft-Regular.woff2 and DecourSoft-Bold.woff2 in assets/fonts.
//   2. Change HEADLINE to 'DecourSoft' and point the two headline entries
//      below at those files (weights 600 and 700).
export const HEADLINE = 'Zilla Slab';
export const BODY = 'Lato';

const FILES: {family: string; file: string; weight: string}[] = [
	{family: HEADLINE, file: 'ZillaSlab-SemiBold.woff2', weight: '600'},
	{family: HEADLINE, file: 'ZillaSlab-Bold.woff2', weight: '700'},
	{family: BODY, file: 'Lato-Regular.woff2', weight: '400'},
	{family: BODY, file: 'Lato-Bold.woff2', weight: '700'},
	{family: BODY, file: 'Lato-Black.woff2', weight: '900'},
];

for (const {family, file, weight} of FILES) {
	loadFont({family, url: staticFile(`fonts/${file}`), weight});
}

export const FONTS = {
	headline: `'${HEADLINE}', Georgia, serif`,
	body: `'${BODY}', Arial, Helvetica, sans-serif`,
} as const;
