// The avatar link Ox Content renders at the start of a full X card, to the same profile as the author
// name link beside it. Its only content is an image with empty alt text.
const TWEET_AVATAR_LINK = /<a class="ox-tweet__avatar-link"/g

/**
 * Removes the X card avatar link from the accessibility tree and the tab order.
 *
 * The avatar link has no text, so screen readers announce it as an unnamed link and Lighthouse fails
 * the page's link-name audit. It duplicates the author name link next to it, so hiding it loses
 * nothing, while a pointer can still follow it.
 *
 * @param html - Rendered post body.
 * @returns The body with each avatar link hidden from assistive technology.
 * @example
 * hideTweetAvatarLinks('<a class="ox-tweet__avatar-link" href="https://x.com/jack">')
 * // '<a class="ox-tweet__avatar-link" aria-hidden="true" tabindex="-1" href="https://x.com/jack">'
 */
export function hideTweetAvatarLinks(html: string): string {
	return html.replace(TWEET_AVATAR_LINK, '<a class="ox-tweet__avatar-link" aria-hidden="true" tabindex="-1"')
}

if (import.meta.vitest) {
	const { expect, test } = import.meta.vitest

	test('hides every avatar link, including the one in a quoted post', () => {
		const html = hideTweetAvatarLinks(
			'<a class="ox-tweet__avatar-link" href="https://x.com/a"></a><blockquote><a class="ox-tweet__avatar-link" href="https://x.com/b"></a></blockquote>'
		)
		expect(html.match(/aria-hidden="true" tabindex="-1"/g)).toHaveLength(2)
	})

	test('leaves the author name link, which carries the name, focusable', () => {
		const html = '<a class="ox-tweet__author-name" href="https://x.com/a">a</a>'
		expect(hideTweetAvatarLinks(html)).toBe(html)
	})
}
