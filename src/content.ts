// Every word that appears on screen, in one place. Each block names the row
// in docs/research.md ("Claims register") that it comes from. If you change
// copy here, update the register so every claim still has a source.
// Spoken lines and captions live in src/edit.json ("voice").

// T1–T4 — labels for the four illustrated rooms of the tour.
const rooms: {title: string; chip?: string}[] = [
	// T1 — homepage: "...in a warm, supportive environment..."
	{title: 'A warm, supportive environment'},
	// T2 — homepage: "short-term rehabilitation" / "personalized treatment plans"
	{title: 'Short-term rehabilitation', chip: 'Personalized treatment plans'},
	// T3 — homepage: "long-term care" / "...comprise a comprehensive team..."
	{title: 'Long-term care', chip: 'A comprehensive team'},
	// T4 — homepage: "...personalized havens of hospitality..."
	{title: 'Personalized havens of hospitality'},
];

export const CONTENT = {
	// C1 — homepage: "...have a philosophy, and we maintain that the healing
	// process should be holistic."
	belief: {
		label: 'Our philosophy',
		lines: ['The healing process', 'should be'],
		emphasis: 'holistic.',
	},

	// C2 — homepage: "Clinical excellence and compassionate care are the
	// cornerstones of each Autumn Lake Healthcare center."
	cornerstones: {
		left: ['Clinical', 'excellence'],
		// The sentence's "and", shown as a badge where the two blocks meet.
		joiner: '&',
		right: ['Compassionate', 'care'],
		lines: ['The cornerstones of each', 'Autumn Lake Healthcare center.'],
	},

	tour: {
		// T0 — "Welcome Home" heading on center sites (S3, S5).
		doors: ['Welcome', 'home.'],
		rooms,
	},

	// C6 — homepage heading and sentence; "center's" corrected to "centers".
	network: {
		label: 'Meet Autumn Lake Healthcare',
		lines: ['A network of independent', 'nursing homes and', 'rehabilitative care centers'],
		states: ['Connecticut', 'New Jersey', 'Maryland', 'West Virginia', 'Wisconsin'],
		// C12 — exterior photos from the homepage, shown unlabeled.
		photos: [
			'photos/center-02.jpg',
			'photos/center-01.jpg',
			'photos/center-04.jpg',
			'photos/center-05.jpg',
			'photos/center-03.jpg',
		],
	},

	// C7 — careers page subhead.
	family: {
		lines: ['There are many healthcare groups,', "but here you'll find"],
		emphasis: 'family.',
	},

	// C8 — official "Good care. Good times." lettering (image, not type).
	tagline: {
		image: 'brand/tagline-lettering@3x.png',
		alt: 'Good care. Good times.',
	},

	// C9, C10, C11 — homepage footer. The headline is a call to action.
	cta: {
		headline: 'Find a center near you',
		url: 'AutumnLakeHealthcare.com',
		phone: '732-358-6883',
		disclaimer:
			'Autumn Lake Healthcare is a management company that provides non-healthcare services to licensed healthcare centers. Healthcare related services are provided solely by each independently owned and operated Healthcare Center. Autumn Lake Healthcare licenses the use of its name to Autumn Lake Healthcare Facilities.',
	},
};
