import { SITE } from '../config/site.ts'

/**
 * Turns a post's calendar date into an ISO 8601 date-time at midnight in the owner's time zone.
 *
 * Frontmatter dates are plain `YYYY-MM-DD`. Google's Rich Results Test flags such values in
 * `datePublished` and `dateModified` as invalid date-times without a time zone, and consumers of
 * `article:published_time` would otherwise have to guess one. Posts are dated in Japan, so the
 * midnight that starts that day there is used.
 *
 * @param date - Calendar date, `YYYY-MM-DD`.
 * @returns The date-time with the site's UTC offset.
 * @example
 * postDateTime('2026-09-17') // '2026-09-17T00:00:00+09:00'
 */
export function postDateTime(date: string): string {
	return `${date}T00:00:00${SITE.utcOffset}`
}

if (import.meta.vitest) {
	const { expect, test } = import.meta.vitest

	test('postDateTime is the start of that day in Japan', () => {
		expect(postDateTime('2026-09-17')).toBe('2026-09-17T00:00:00+09:00')
		expect(new Date(postDateTime('2026-09-17')).toISOString()).toBe('2026-09-16T15:00:00.000Z')
	})
}
