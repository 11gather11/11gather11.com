/** Site-wide identity used in page metadata. */
export const SITE = {
	name: '11gather11',
	tagline: 'builds things on the web',
	origin: 'https://11gather11.com',
	// The interface is English; content written in another language marks its own `lang`.
	defaultLang: 'en',
	/** X account credited on link cards through `twitter:site`. */
	xHandle: '@11gather11',
	/** UTC offset of the owner's time zone (Asia/Tokyo, no daylight saving), for post dates. */
	utcOffset: '+09:00',
} as const

/** The person behind the site, for the About page and structured data. */
export const OWNER = {
	name: 'Ryusei Igarashi',
	japaneseName: '五十嵐 隆晟',
	handle: '11gather11',
	jobTitle: 'Software engineer',
} as const

/** Profiles linked from the site; also listed as `sameAs` in structured data. */
export const SOCIALS = {
	github: 'https://github.com/11gather11',
	twitch: 'https://www.twitch.tv/igara4ryusei',
	youtube: 'https://www.youtube.com/@igara4ryusei',
} as const

/** Sections linked from the header on every page, in display order. */
export const NAV = [
	{ label: 'About', href: '/about/' },
	{ label: 'Works', href: '/works/' },
	{ label: 'Blog', href: '/blog/' },
] as const
