import { OWNER, SITE, SOCIALS } from '../config/site.ts'

/** A schema.org JSON-LD document. */
export type StructuredData = Readonly<Record<string, unknown>>

// Stable node ids let pages refer to the same person and site instead of repeating them, so search
// engines merge the nodes into one entity.
const PERSON_ID = `${SITE.origin}/#person`
const WEBSITE_ID = `${SITE.origin}/#website`

/**
 * The site owner as a schema.org Person.
 *
 * @returns The Person node, with the Japanese name and handle as alternate names and the linked
 *   profiles as `sameAs`.
 */
function person(): StructuredData {
	return {
		'@type': 'Person',
		'@id': PERSON_ID,
		name: OWNER.name,
		alternateName: [OWNER.japaneseName, OWNER.handle],
		jobTitle: OWNER.jobTitle,
		url: `${SITE.origin}/`,
		sameAs: Object.values(SOCIALS),
	}
}

/**
 * Structured data for the home page: the website and the person who runs it.
 *
 * @returns A JSON-LD graph with WebSite and Person nodes.
 * @example
 * <Document structuredData={homeStructuredData()} … />
 */
export function homeStructuredData(): StructuredData {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebSite',
				'@id': WEBSITE_ID,
				name: SITE.name,
				url: `${SITE.origin}/`,
				description: `${SITE.name} ${SITE.tagline}.`,
				inLanguage: SITE.defaultLang,
				publisher: { '@id': PERSON_ID },
			},
			person(),
		],
	}
}

/**
 * Structured data for the About page: a profile page about the site owner.
 *
 * @param pathname - Public URL path of the page.
 * @returns A JSON-LD graph with ProfilePage and Person nodes.
 */
export function profileStructuredData(pathname: string): StructuredData {
	const url = new URL(pathname, SITE.origin).href
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'ProfilePage',
				'@id': url,
				url,
				isPartOf: { '@id': WEBSITE_ID },
				mainEntity: { '@id': PERSON_ID },
			},
			person(),
		],
	}
}

/** Fields of a blog post that its structured data describes. */
export type BlogPostingInput = {
	title: string
	description: string
	/** Public URL path of the post. */
	pathname: string
	/** Site-relative path of the post's Open Graph image. */
	image: string
	/** Publication date, `YYYY-MM-DD`. */
	date: string
	/** Date of the last update, `YYYY-MM-DD`. */
	updated?: string
	lang: string
}

/**
 * Structured data for a blog post.
 *
 * `dateModified` falls back to the publication date, since Google recommends both and an unedited
 * post was last modified when it was published.
 *
 * @param post - Title, dates, language, URL and image of the post.
 * @returns A BlogPosting JSON-LD document whose author is the site's Person.
 * @example
 * blogPostingStructuredData({ title: 'Hello', description: '…', pathname: '/blog/hello/', image: '/og/blog/hello.png', date: '2026-09-17', lang: 'en' })
 */
export function blogPostingStructuredData(post: BlogPostingInput): StructuredData {
	const url = new URL(post.pathname, SITE.origin).href
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		'@id': url,
		url,
		mainEntityOfPage: url,
		headline: post.title,
		description: post.description,
		image: new URL(post.image, SITE.origin).href,
		datePublished: post.date,
		dateModified: post.updated ?? post.date,
		inLanguage: post.lang,
		isPartOf: { '@id': WEBSITE_ID },
		author: person(),
	}
}

/**
 * Serialises structured data for a `<script type="application/ld+json">` element.
 *
 * JSON.stringify leaves `<` as is, so a title containing `</script>` would end the element early.
 * Escaping `<` as `\u003c` keeps the JSON identical once parsed.
 *
 * @param data - JSON-LD document.
 * @returns Script-safe JSON text.
 * @example
 * serializeStructuredData({ name: '</script>' }) // '{"name":"\\u003c/script>"}'
 */
export function serializeStructuredData(data: StructuredData): string {
	return JSON.stringify(data).replaceAll('<', '\\u003c')
}

if (import.meta.vitest) {
	const { describe, expect, test } = import.meta.vitest

	describe('blogPostingStructuredData', () => {
		const input: BlogPostingInput = {
			title: 'Hello',
			description: 'A first post.',
			pathname: '/blog/hello/',
			image: '/og/blog/hello.png',
			date: '2026-09-17',
			lang: 'ja',
		}

		test('describes the post with absolute URLs and the site owner as author', () => {
			expect(blogPostingStructuredData(input)).toMatchObject({
				'@type': 'BlogPosting',
				url: 'https://11gather11.com/blog/hello/',
				image: 'https://11gather11.com/og/blog/hello.png',
				datePublished: '2026-09-17',
				inLanguage: 'ja',
				author: { '@type': 'Person', '@id': 'https://11gather11.com/#person', name: 'Ryusei Igarashi' },
			})
		})

		test('uses the publication date as dateModified until the post is updated', () => {
			expect(blogPostingStructuredData(input).dateModified).toBe('2026-09-17')
			expect(blogPostingStructuredData({ ...input, updated: '2026-10-01' }).dateModified).toBe('2026-10-01')
		})
	})

	describe('serializeStructuredData', () => {
		test('escapes < so the JSON cannot close its script element', () => {
			const text = serializeStructuredData({ name: '</script><script>alert(1)</script>' })
			expect(text).not.toContain('</script>')
			expect(JSON.parse(text)).toEqual({ name: '</script><script>alert(1)</script>' })
		})
	})

	test('the home graph links the website to the person who publishes it', () => {
		const graph = homeStructuredData()['@graph'] as StructuredData[]
		expect(graph[0]).toMatchObject({ '@type': 'WebSite', publisher: { '@id': 'https://11gather11.com/#person' } })
		expect(graph[1]).toMatchObject({
			'@type': 'Person',
			sameAs: ['https://github.com/11gather11', expect.any(String), expect.any(String)],
		})
	})
}
