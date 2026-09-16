/**
 * Builds a sitemap of the site's HTML pages.
 *
 * Only directory paths (ending in `/`) are HTML pages; files such as the feed or the sitemap itself
 * are left out, as is the 404 page, which should never be indexed. Drafts never become routes in a
 * build, so they cannot appear.
 *
 * @param origin - Site origin, such as `https://11gather11.com`.
 * @param paths - Every route path of the site.
 * @returns The sitemap as an XML document.
 * @example
 * renderSitemap('https://11gather11.com', ['/', '/about/', '/404.html'])
 */
export function renderSitemap(origin: string, paths: readonly string[]): string {
	const urls = paths
		.filter((path) => path.endsWith('/'))
		.map((path) => `<url><loc>${new URL(path, origin).href}</loc></url>`)
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls,
		'</urlset>',
		'',
	].join('\n')
}

if (import.meta.vitest) {
	const { expect, test } = import.meta.vitest

	test('lists HTML pages only, skipping the 404 page and non-HTML files', () => {
		expect(
			renderSitemap('https://11gather11.com', ['/', '/404.html', '/about/', '/blog/rss.xml', '/sitemap.xml'])
		).toBe(
			[
				'<?xml version="1.0" encoding="UTF-8"?>',
				'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
				'<url><loc>https://11gather11.com/</loc></url>',
				'<url><loc>https://11gather11.com/about/</loc></url>',
				'</urlset>',
				'',
			].join('\n')
		)
	})
}
