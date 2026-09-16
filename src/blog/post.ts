import { parse as parseYaml } from 'yaml'

/** Validated frontmatter of a blog post. */
export type PostFrontmatter = {
	title: string
	/** One-sentence summary, shown on the index, as the lead paragraph and in metadata. */
	description: string
	/** Publication date, `YYYY-MM-DD`. */
	date: string
	/** Date of the last meaningful update, `YYYY-MM-DD`. */
	updated?: string
	/** BCP 47 language of the post; the interface stays English either way. */
	lang: string
	/** Drafts render in the dev server only. */
	draft: boolean
}

/** A post's source split into metadata and Markdown body. */
export type PostSource = PostFrontmatter & {
	/** URL segment, taken from the file name. */
	slug: string
	/** Markdown body without the frontmatter. */
	body: string
}

// Frontmatter is a YAML block fenced by `---` lines at the very start of the file.
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
const DATE = /^\d{4}-\d{2}-\d{2}$/
// Lower-case words joined by single hyphens keep URLs readable and free of escaping.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Parses and validates a post file.
 *
 * Validation fails loudly at build time rather than rendering a page with a missing title or an
 * `Invalid Date`, and names the file and field so the fix is obvious.
 *
 * @param file - Path of the post, used for its slug and in error messages.
 * @param source - Raw file contents.
 * @returns The post's metadata and Markdown body.
 * @throws If the frontmatter is missing, a required field is absent, or a value has the wrong shape.
 * @example
 * parsePost('src/content/blog/hello-world.md', '---\ntitle: Hello\n...')
 */
export function parsePost(file: string, source: string): PostSource {
	const fail = (message: string): never => {
		throw new Error(`Invalid post ${file}: ${message}`)
	}

	const slug = file.slice(file.lastIndexOf('/') + 1).replace(/\.md$/, '')
	if (!SLUG.test(slug)) {
		fail(`file name "${slug}" must be lower-case words joined by hyphens`)
	}

	const match = FRONTMATTER.exec(source)
	if (match === null) {
		return fail('missing the --- frontmatter block')
	}
	const data: unknown = parseYaml(match[1] ?? '')
	if (typeof data !== 'object' || data === null || Array.isArray(data)) {
		return fail('frontmatter must be a mapping')
	}
	const fields = data as Record<string, unknown>

	const requiredString = (name: string): string => {
		const value = fields[name]
		if (typeof value !== 'string' || value.trim() === '') {
			fail(`"${name}" must be a non-empty string`)
		}
		return (value as string).trim()
	}
	const optionalDate = (name: string): string | undefined => {
		const value = fields[name]
		if (value === undefined) {
			return undefined
		}
		// YAML 1.2 keeps unquoted dates as strings; anything else means a typo such as 2026-9-1.
		if (typeof value !== 'string' || !DATE.test(value) || Number.isNaN(Date.parse(value))) {
			fail(`"${name}" must be a date written as YYYY-MM-DD`)
		}
		return value as string
	}

	const lang = fields.lang ?? 'en'
	if (typeof lang !== 'string' || lang.trim() === '') {
		fail('"lang" must be a non-empty string such as en or ja')
	}
	const draft = fields.draft ?? false
	if (typeof draft !== 'boolean') {
		fail('"draft" must be true or false')
	}
	const date = optionalDate('date') ?? fail('"date" is required')

	return {
		slug,
		title: requiredString('title'),
		description: requiredString('description'),
		date,
		updated: optionalDate('updated'),
		lang: lang as string,
		draft: draft as boolean,
		body: source.slice(match[0].length),
	}
}

/**
 * Estimates reading time in whole minutes.
 *
 * English is counted at 200 words a minute. Japanese has no spaces between words, so it is counted
 * at 500 characters a minute instead.
 *
 * @param markdown - Post body.
 * @param lang - Language of the post.
 * @returns Minutes, at least 1.
 * @example
 * readingTime('word '.repeat(450), 'en') // 3
 */
export function readingTime(markdown: string, lang: string): number {
	const units = lang.startsWith('ja')
		? markdown.replace(/\s/g, '').length / 500
		: markdown.split(/\s+/).filter(Boolean).length / 200
	return Math.max(1, Math.ceil(units))
}

/**
 * Orders posts newest first and drops drafts unless they are wanted.
 *
 * @param posts - Parsed posts in any order.
 * @param includeDrafts - Whether drafts stay in, as in the dev server.
 * @returns A new array, newest first; posts with the same date are ordered by slug.
 */
export function listPosts<T extends Pick<PostSource, 'date' | 'draft' | 'slug'>>(
	posts: readonly T[],
	includeDrafts: boolean
): T[] {
	return posts
		.filter((post) => includeDrafts || !post.draft)
		.toSorted((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
}

if (import.meta.vitest) {
	const { describe, expect, test } = import.meta.vitest

	const file = 'src/content/blog/hello-world.md'
	const post = (frontmatter: string, body = 'Body text.') => `---\n${frontmatter}\n---\n${body}`

	describe('parsePost', () => {
		test('reads required and optional fields and applies defaults', () => {
			expect(parsePost(file, post('title: Hello\ndescription: A first post.\ndate: 2026-09-17'))).toEqual({
				slug: 'hello-world',
				title: 'Hello',
				description: 'A first post.',
				date: '2026-09-17',
				updated: undefined,
				lang: 'en',
				draft: false,
				body: 'Body text.',
			})
		})

		test('keeps lang, updated and draft when given', () => {
			const parsed = parsePost(
				file,
				post('title: こんにちは\ndescription: 説明\ndate: 2026-09-17\nupdated: 2026-09-18\nlang: ja\ndraft: true')
			)
			expect(parsed).toMatchObject({ lang: 'ja', updated: '2026-09-18', draft: true })
		})

		test.each([
			['missing frontmatter', 'No frontmatter here.', 'missing the --- frontmatter block'],
			['missing title', post('description: d\ndate: 2026-09-17'), '"title" must be a non-empty string'],
			['empty description', post('title: t\ndescription: ""\ndate: 2026-09-17'), '"description" must be a non-empty'],
			['missing date', post('title: t\ndescription: d'), '"date" is required'],
			['malformed date', post('title: t\ndescription: d\ndate: 2026-9-1'), '"date" must be a date'],
			['non-boolean draft', post('title: t\ndescription: d\ndate: 2026-09-17\ndraft: yes please'), '"draft" must be'],
		])('rejects %s', (_, source, message) => {
			expect(() => parsePost(file, source)).toThrow(`Invalid post ${file}: ${message}`)
		})

		test('rejects a slug that would need escaping in a URL', () => {
			expect(() => parsePost('src/content/blog/Hello World.md', post('title: t'))).toThrow(
				'must be lower-case words joined by hyphens'
			)
		})
	})

	describe('readingTime', () => {
		test('counts English at 200 words a minute, rounding up', () => {
			expect(readingTime('word '.repeat(201), 'en')).toBe(2)
		})

		test('counts Japanese at 500 characters a minute', () => {
			expect(readingTime('あ'.repeat(1001), 'ja')).toBe(3)
		})

		test('never reports less than a minute', () => {
			expect(readingTime('', 'en')).toBe(1)
		})
	})

	describe('listPosts', () => {
		const posts = [
			{ slug: 'b', date: '2026-01-01', draft: false },
			{ slug: 'draft', date: '2026-12-01', draft: true },
			{ slug: 'a', date: '2026-01-01', draft: false },
			{ slug: 'newest', date: '2026-06-01', draft: false },
		]

		test('orders newest first, then by slug, and drops drafts', () => {
			expect(listPosts(posts, false).map((post) => post.slug)).toEqual(['newest', 'a', 'b'])
		})

		test('keeps drafts when asked', () => {
			expect(listPosts(posts, true).map((post) => post.slug)).toEqual(['draft', 'newest', 'a', 'b'])
		})
	})
}
