// Every word that appears on screen, in one place. Each block names the row
// in docs/research.md ("Claims register") that it comes from. If you change
// copy here, update the register so every claim still has a source.

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
		right: ['Compassionate', 'care'],
		lines: ['The cornerstones of each', 'Autumn Lake Healthcare center.'],
	},

	// C3, C4 — homepage: "...comprehensive care services, including short-term
	// rehabilitation and long-term care, focused on supporting recovery,
	// comfort, and overall wellness." / "...personalized treatment plans..."
	services: {
		label: 'Comprehensive care services',
		cards: [
			['Short-term', 'rehabilitation'],
			['Long-term', 'care'],
			['Personalized', 'treatment plans'],
		],
		footer: 'Focused on supporting recovery, comfort, and overall wellness.',
		footerHighlights: ['recovery,', 'comfort,', 'wellness.'],
	},

	// C5 — homepage: "...doctors, therapists, and specialists comprise a
	// comprehensive team devoted to creating personalized havens of
	// hospitality..."
	team: {
		roles: ['Doctors.', 'Therapists.', 'Specialists.'],
		headline: 'A comprehensive team',
		lines: ['devoted to creating personalized', 'havens of hospitality.'],
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
} as const;
