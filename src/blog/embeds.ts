/**
 * Tells whether rendered Markdown contains an embed card, so the page links the embed stylesheet.
 *
 * Ox Content expands embed tags into elements whose class names start with these prefixes; plain
 * Markdown never produces them.
 *
 * @param html - HTML rendered from a post.
 * @returns True when the HTML has a GitHub, Open Graph, X or Bluesky card.
 * @example
 * hasEmbeds('<a class="ox-ogp-card" href="https://vite.dev">…</a>') // true
 */
export function hasEmbeds(html: string): boolean {
	return /class="ox-(?:github|ogp|tweet|bluesky)\b/.test(html)
}

if (import.meta.vitest) {
	const { expect, test } = import.meta.vitest

	test('detects the root element of each embed card', () => {
		expect(hasEmbeds('<div class="ox-github-card">')).toBe(true)
		expect(hasEmbeds('<a class="ox-ogp-card" href="#">')).toBe(true)
		expect(hasEmbeds('<figure class="ox-tweet ox-tweet--full">')).toBe(true)
		expect(hasEmbeds('<div class="ox-bluesky">')).toBe(true)
	})

	test('ignores other Ox Content markup such as callouts and figures', () => {
		expect(hasEmbeds('<div class="ox-callout"><figure class="ox-figure">')).toBe(false)
		// Markdown text that mentions a class escapes its quotes, so it is not mistaken for a card.
		expect(hasEmbeds('<p>class=&quot;ox-tweet&quot;</p>')).toBe(false)
	})
}
