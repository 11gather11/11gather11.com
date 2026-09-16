/**
 * Maps a public URL path to the file that serves it from `dist/`.
 *
 * Paths ending in `/` are directories and get an `index.html`; anything else must name a file
 * with an extension. Cloudflare's asset handling serves `about/index.html` at `/about/` and
 * redirects `/about` there, so requiring one of these two shapes keeps every URL canonical.
 *
 * @param path - Public URL path starting with `/`, such as `/`, `/about/` or `/rss.xml`.
 * @returns File path relative to the output directory.
 * @throws If the path is not absolute, or names neither a directory nor a file.
 * @example
 * outputFileName('/about/') // 'about/index.html'
 * outputFileName('/404.html') // '404.html'
 */
export function outputFileName(path: string): string {
	if (!path.startsWith('/')) {
		throw new Error(`Route path must start with "/": ${path}`)
	}
	if (path.endsWith('/')) {
		return `${path.slice(1)}index.html`
	}
	const lastSegment = path.slice(path.lastIndexOf('/') + 1)
	if (!lastSegment.includes('.')) {
		throw new Error(`Route path must end with "/" or a file extension: ${path}`)
	}
	return path.slice(1)
}

if (import.meta.vitest) {
	const { describe, expect, test } = import.meta.vitest

	describe('outputFileName', () => {
		test.each([
			['/', 'index.html'],
			['/about/', 'about/index.html'],
			['/en/blog/hello/', 'en/blog/hello/index.html'],
			['/404.html', '404.html'],
			['/blog/rss.xml', 'blog/rss.xml'],
		])('%s -> %s', (path, fileName) => {
			expect(outputFileName(path)).toBe(fileName)
		})

		test('rejects a relative path', () => {
			expect(() => outputFileName('about/')).toThrow('must start with "/"')
		})

		test('rejects a path that is neither a directory nor a file', () => {
			expect(() => outputFileName('/about')).toThrow('must end with "/" or a file extension')
		})
	})
}
