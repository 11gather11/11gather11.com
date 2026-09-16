import type { PostSource } from './post.ts'

/** Channel-level details of the feed. */
export type FeedChannel = {
	title: string
	description: string
	/** Absolute URL of the site. */
	siteUrl: string
	/** Absolute URL of the feed itself. */
	feedUrl: string
	lang: string
}

/**
 * Escapes text for XML element content and attribute values.
 *
 * @param text - Raw text.
 * @returns Text safe to place between tags or inside double quotes.
 */
function escapeXml(text: string): string {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;')
}

/**
 * Builds an RSS 2.0 feed of the given posts.
 *
 * Items carry the title, the summary rather than the full body (readers follow the link, which keeps
 * the feed small), the permalink as a permanent guid, and the publication date in RFC 822 form as
 * RSS requires. Dates are interpreted as midnight UTC so the feed is identical wherever it is built.
 *
 * @param channel - Feed metadata.
 * @param posts - Posts to include, already filtered and ordered.
 * @returns The feed as an XML document.
 * @example
 * renderRss({ title: 'Blog', ... }, posts)
 */
export function renderRss(
	channel: FeedChannel,
	posts: readonly Pick<PostSource, 'slug' | 'title' | 'description' | 'date'>[]
): string {
	const items = posts.map((post) => {
		const url = new URL(`/blog/${post.slug}/`, channel.siteUrl).href
		return [
			'<item>',
			`<title>${escapeXml(post.title)}</title>`,
			`<link>${escapeXml(url)}</link>`,
			`<guid isPermaLink="true">${escapeXml(url)}</guid>`,
			`<description>${escapeXml(post.description)}</description>`,
			`<pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>`,
			'</item>',
		].join('')
	})
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
		'<channel>',
		`<title>${escapeXml(channel.title)}</title>`,
		`<link>${escapeXml(channel.siteUrl)}</link>`,
		`<description>${escapeXml(channel.description)}</description>`,
		`<language>${escapeXml(channel.lang)}</language>`,
		// Feed readers use the self link to detect a moved feed.
		`<atom:link href="${escapeXml(channel.feedUrl)}" rel="self" type="application/rss+xml"/>`,
		...items,
		'</channel>',
		'</rss>',
		'',
	].join('\n')
}

if (import.meta.vitest) {
	const { describe, expect, test } = import.meta.vitest

	const channel: FeedChannel = {
		title: 'Blog | 11gather11',
		description: 'Posts by 11gather11.',
		siteUrl: 'https://11gather11.com/',
		feedUrl: 'https://11gather11.com/blog/rss.xml',
		lang: 'en',
	}

	describe('renderRss', () => {
		test('writes channel metadata and one item per post', () => {
			const xml = renderRss(channel, [
				{ slug: 'hello-world', title: 'Hello', description: 'First.', date: '2026-09-17' },
			])
			expect(xml).toContain('<title>Blog | 11gather11</title>')
			expect(xml).toContain('<atom:link href="https://11gather11.com/blog/rss.xml" rel="self"')
			expect(xml).toContain('<link>https://11gather11.com/blog/hello-world/</link>')
			expect(xml).toContain('<guid isPermaLink="true">https://11gather11.com/blog/hello-world/</guid>')
			expect(xml).toContain('<pubDate>Thu, 17 Sep 2026 00:00:00 GMT</pubDate>')
		})

		test('escapes XML special characters in post text', () => {
			const xml = renderRss(channel, [{ slug: 'x', title: 'A <b> & "c"', description: "It's", date: '2026-09-17' }])
			expect(xml).toContain('<title>A &lt;b&gt; &amp; &quot;c&quot;</title>')
			expect(xml).toContain('<description>It&apos;s</description>')
		})

		test('produces an empty channel when there are no posts', () => {
			expect(renderRss(channel, [])).not.toContain('<item>')
		})
	})
}
