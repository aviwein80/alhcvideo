// The narration script, shown as captions. Times are in beats from the start
// of the film (see src/theme/timing.ts). Sources for each line are in
// docs/research.md under "Caption (narration script) lines".
export type Cue = {from: number; to: number; text: string};

export const CAPTIONS: Cue[] = [
	{from: 8.5, to: 15.5, text: 'We maintain that the healing process should be holistic.'},
	{
		from: 16.5,
		to: 23.5,
		text: 'Clinical excellence and compassionate care are the cornerstones\nof each Autumn Lake Healthcare center.',
	},
	{
		from: 24.5,
		to: 30.5,
		text: 'These centers provide comprehensive care services,\nincluding short-term rehabilitation and long-term care,',
	},
	{from: 30.5, to: 35.5, text: 'focused on supporting recovery, comfort, and overall wellness.'},
	{from: 36.5, to: 40.5, text: 'Doctors, therapists, and specialists comprise a comprehensive team'},
	{from: 40.5, to: 45.5, text: 'devoted to creating personalized havens of hospitality.'},
	{
		from: 46.5,
		to: 52.5,
		text: 'Autumn Lake Healthcare maintains a network of independent\nnursing homes and rehabilitative care centers',
	},
	{from: 52.5, to: 59.5, text: 'across Connecticut, New Jersey, Maryland, West Virginia and Wisconsin.'},
	{from: 60.5, to: 67.5, text: "There are many healthcare groups, but here you'll find family."},
	{from: 68.5, to: 75.5, text: 'Good care. Good times.'},
	{from: 76.5, to: 81.5, text: 'Find a center near you at AutumnLakeHealthcare.com.'},
];
