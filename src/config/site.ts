/** Site-wide identity used in page metadata. */
export const SITE = {
	name: '11gather11',
	tagline: 'builds things on the web',
	origin: 'https://11gather11.com',
	// The interface is English; content written in another language marks its own `lang`.
	defaultLang: 'en',
} as const

/** Sections linked from the header on every page, in display order. */
export const NAV = [
	{ label: 'About', href: '/about/' },
	{ label: 'Works', href: '/works/' },
	{ label: 'Blog', href: '/blog/' },
] as const
