// Brand colors, derived from autumnlakehealthcare.com (see docs/research.md,
// "Visual identity"). Replace with the official palette when available.
export const COLORS = {
	maroon: '#822820',
	maroonDeep: '#7C261E',
	brick: '#AF372C',
	orange: '#E15A2A',
	peach: '#F6CDBF',
	mist: '#F6F6F6',
	ink: '#383839',
	white: '#FFFFFF',
	// Derived tint: peach mixed toward white, for softer light backgrounds.
	paper: '#FDF3EE',
	// Fills inside the logo file. The logo itself is never recolored.
	logoOrange: '#DF5829',
	logoMaroon: '#7F2629',
} as const;

// Supporting colors for the illustrated tour only (skin, hair, wood, plants).
// These are not brand colors; they exist so the brand reds stay the accent.
export const ILLO = {
	skin: ['#F3C9A8', '#E0A57C', '#B97A56', '#8A5A3C'],
	hairGray: '#D9D4CE',
	hairWhite: '#F4F1EC',
	hairBrown: '#5A3A29',
	hairBlack: '#2E2420',
	hairAuburn: '#9A4A2A',
	hairBlonde: '#D9B26A',
	wall: '#FBEDE3',
	wallShade: '#F4DFD1',
	floor: '#E3B98F',
	floorShade: '#D3A578',
	wood: '#B9794C',
	woodDark: '#8F5733',
	sage: '#6E9A7B',
	sageDark: '#4E7A63',
	sky: '#CFE6F2',
	skyDeep: '#A9D2E8',
	steel: '#B8BEC6',
	steelDark: '#7C848F',
	cream: '#FFF8F0',
	khaki: '#CDB48C',
	denim: '#5B6F8C',
	charcoal: '#3F3A3C',
	line: '#4A2A22',
} as const;
