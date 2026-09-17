import type { CollectionEntry, CollectionValidationResult } from '@ox-content/vite-plugin'

import { readingTimeMinutes } from '@ox-content/vite-plugin'

/** Validated frontmatter of a blog post. */
export type PostFrontmatter = {
	title: string
	/** One-sentence summary, shown on the index, as the lead paragraph and in metadata. */
	description: string
	/** Publication date, `YYYY-MM-DD`. Ox Content's publish state also holds a post back until this day. */
	date: string
	/** Date of the last meaningful update, `YYYY-MM-DD`. */
	updated?: string
	/** BCP 47 language of the post; the interface stays English either way. */
	lang: string
}

/** A post's metadata and Markdown body, read from the blog collection. */
export type PostSource = PostFrontmatter & {
	/** URL segment, taken from the name of the post's directory. */
	slug: string
	/** Markdown body without the frontmatter. */
	body: string
}

// Collection sources are relative to srcDir: blog/<slug>/index.md.
const POST_SOURCE = /^blog\/([^/]+)\/index\.md$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
// Lower-case words joined by single hyphens keep URLs readable and free of escaping.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Checks one document of the blog collection, as its `validate` hook in vite.config.ts.
 *
 * Ox Content collects every problem across all posts and fails the build once, naming each file, so
 * a post never renders with a missing title or an `Invalid Date`. Publish-state fields (`draft`,
 * `unlisted`, `scheduled`, `expiry`) are Ox Content's and are not checked here.
 *
 * @param document - The parsed document: its source path relative to srcDir and its frontmatter.
 * @returns Problems found, or nothing when the post is valid.
 * @example
 * validatePost({ source: 'blog/hello/index.md', frontmatter: { title: 'Hello' } })
 * // ['"description" must be a non-empty string', '"date" is required']
 */
export function validatePost(document: {
	source: string
	frontmatter: Record<string, unknown>
}): CollectionValidationResult {
	// Posts live in <slug>/index.md so images sit next to the Markdown that uses them. A loose
	// blog/<slug>.md is most likely a post in the wrong layout, so it fails instead of vanishing.
	const slug = POST_SOURCE.exec(document.source)?.[1]
	if (slug === undefined) {
		return 'posts must be written as blog/<slug>/index.md'
	}
	const problems: string[] = []
	if (!SLUG.test(slug)) {
		problems.push(`directory name "${slug}" must be lower-case words joined by hyphens`)
	}
	const fields = document.frontmatter
	for (const name of ['title', 'description']) {
		const value = fields[name]
		if (typeof value !== 'string' || value.trim() === '') {
			problems.push(`"${name}" must be a non-empty string`)
		}
	}
	if (fields.date === undefined) {
		problems.push('"date" is required')
	}
	for (const name of ['date', 'updated']) {
		const value = fields[name]
		// Anything other than a YYYY-MM-DD string means a typo such as 2026-9-1.
		if (value !== undefined && (typeof value !== 'string' || !DATE.test(value) || Number.isNaN(Date.parse(value)))) {
			problems.push(`"${name}" must be a date written as YYYY-MM-DD`)
		}
	}
	if (fields.lang !== undefined && (typeof fields.lang !== 'string' || fields.lang.trim() === '')) {
		problems.push('"lang" must be a non-empty string such as en or ja')
	}
	// Ox Content only treats JSON true as a draft, so `draft: yes` would silently publish.
	if (fields.draft !== undefined && typeof fields.draft !== 'boolean') {
		problems.push('"draft" must be true or false')
	}
	return problems.length === 0 ? undefined : problems
}

/**
 * Reads a validated blog collection entry as a post.
 *
 * @param entry - Entry from the blog collection, built with `include: ['body']`.
 * @returns The post's metadata and body.
 * @throws If the entry has no body, which means the collection lost its `include` option.
 */
export function postFromEntry(entry: CollectionEntry): PostSource {
	if (entry.body === undefined) {
		throw new Error(`The blog collection must include body: ${entry.source}`)
	}
	// validatePost has already rejected entries without these fields or with the wrong types.
	const fields = entry.frontmatter as Partial<Record<keyof PostFrontmatter, string>>
	return {
		slug: POST_SOURCE.exec(entry.source)?.[1] ?? '',
		title: (fields.title ?? '').trim(),
		description: (fields.description ?? '').trim(),
		date: fields.date ?? '',
		updated: fields.updated,
		lang: fields.lang ?? 'en',
		body: entry.body,
	}
}

/**
 * Estimates reading time in whole minutes with Ox Content's estimator, which counts Japanese by
 * characters and other text by words.
 *
 * @param markdown - Post body.
 * @returns Minutes, at least 1 so an empty draft does not read "0 min".
 * @example
 * readingTime('word '.repeat(450)) // 3
 */
export function readingTime(markdown: string): number {
	return Math.max(1, readingTimeMinutes(markdown))
}

/**
 * Orders posts newest first.
 *
 * @param posts - Posts in any order.
 * @returns A new array, newest first; posts with the same date are ordered by slug.
 */
export function sortPosts<T extends Pick<PostSource, 'date' | 'slug'>>(posts: readonly T[]): T[] {
	return posts.toSorted((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
}

if (import.meta.vitest) {
	const { describe, expect, test } = import.meta.vitest

	const valid = { title: 'Hello', description: 'A first post.', date: '2026-09-17' }
	const document = (frontmatter: Record<string, unknown>, source = 'blog/hello-world/index.md') => ({
		source,
		frontmatter,
	})

	describe('validatePost', () => {
		test('accepts required fields alone and with every optional field', () => {
			expect(validatePost(document(valid))).toBeUndefined()
			expect(
				validatePost(document({ ...valid, updated: '2026-09-18', lang: 'ja', draft: true, unlisted: true }))
			).toBeUndefined()
		})

		test.each([
			['missing title', { description: 'd', date: '2026-09-17' }, '"title" must be a non-empty string'],
			['empty description', { ...valid, description: ' ' }, '"description" must be a non-empty string'],
			['missing date', { title: 't', description: 'd' }, '"date" is required'],
			['malformed date', { ...valid, date: '2026-9-1' }, '"date" must be a date written as YYYY-MM-DD'],
			['malformed updated', { ...valid, updated: 'tomorrow' }, '"updated" must be a date written as YYYY-MM-DD'],
			['empty lang', { ...valid, lang: '' }, '"lang" must be a non-empty string'],
			['non-boolean draft', { ...valid, draft: 'yes please' }, '"draft" must be true or false'],
		])('rejects %s', (_, frontmatter, message) => {
			expect(validatePost(document(frontmatter))).toContainEqual(expect.stringContaining(message))
		})

		test('reports every problem of a post at once', () => {
			expect(validatePost(document({}))).toHaveLength(3)
		})

		test('rejects a slug that would need escaping in a URL', () => {
			expect(validatePost(document(valid, 'blog/Hello World/index.md'))).toContainEqual(
				expect.stringContaining('must be lower-case words joined by hyphens')
			)
		})

		test.each(['blog/hello-world.md', 'blog/hello-world/notes.md', 'blog/a/b/index.md'])(
			'rejects %s, which is not blog/<slug>/index.md',
			(source) => {
				expect(validatePost(document(valid, source))).toBe('posts must be written as blog/<slug>/index.md')
			}
		)
	})

	test('postFromEntry reads the slug from the directory and defaults lang to en', () => {
		const entry = {
			id: 'blog/blog/hello-world/index.md',
			collection: 'blog',
			path: '/blog/hello-world',
			stem: 'blog/hello-world/index',
			source: 'blog/hello-world/index.md',
			extension: '.md',
			title: 'Hello',
			frontmatter: valid,
			body: 'Body text.',
		} satisfies CollectionEntry
		expect(postFromEntry(entry)).toEqual({
			slug: 'hello-world',
			...valid,
			updated: undefined,
			lang: 'en',
			body: 'Body text.',
		})
	})

	test('readingTime never reports less than a minute', () => {
		expect(readingTime('')).toBe(1)
	})

	test('sortPosts orders newest first, then by slug', () => {
		const posts = [
			{ slug: 'b', date: '2026-01-01' },
			{ slug: 'a', date: '2026-01-01' },
			{ slug: 'newest', date: '2026-06-01' },
		]
		expect(sortPosts(posts).map((post) => post.slug)).toEqual(['newest', 'a', 'b'])
	})
}
