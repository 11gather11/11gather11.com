import { readdirSync, readFileSync, type Dirent } from 'node:fs'
import path from 'node:path'

import { listPosts, parsePost, readingTime, type PostSource } from './post.ts'

/** A post's metadata, ready to list or to render through the Markdown pipeline. */
export type Post = PostSource & {
	/** Project-relative path of the source file, for the Markdown renderer. */
	file: string
	/** Estimated reading time in minutes. */
	minutes: number
}

// Read from disk rather than imported: Ox Content's Vite plugin transforms every Markdown import
// under its srcDir, even with `?raw`, which strips the frontmatter this module validates. The dev
// server still reloads on edits through the host's `routeDependencies` on this directory.
const POSTS_DIR = 'src/content/blog'

/**
 * Loads every post that should be published, newest first.
 *
 * Whether drafts are included comes from the caller rather than `import.meta.env.DEV`: Ox Content's
 * build loads this module through a Vite server, where `DEV` would wrongly be true.
 *
 * @param includeDrafts - True in the dev server, false in the build.
 * @returns Posts without rendered HTML; pages render the body when they need it.
 * @throws If any post has invalid frontmatter, which fails the build.
 */
export function loadPosts(includeDrafts: boolean): Post[] {
	let entries: Dirent[]
	try {
		entries = readdirSync(POSTS_DIR, { withFileTypes: true })
	} catch (error) {
		// No posts directory yet simply means no posts.
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return []
		}
		throw error
	}
	const parsed = entries
		// Dotfiles such as .DS_Store are editor and OS noise, not posts.
		.filter((entry) => !entry.name.startsWith('.'))
		.map((entry) => {
			// A loose file here is almost certainly a post in the old <slug>.md layout; fail loudly rather
			// than silently leaving it unpublished.
			const file = entry.isDirectory()
				? path.posix.join(POSTS_DIR, entry.name, 'index.md')
				: path.posix.join(POSTS_DIR, entry.name)
			let source: string
			try {
				source = readFileSync(file, 'utf8')
			} catch (error) {
				if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
					throw new Error(`Invalid post ${file}: every directory in ${POSTS_DIR} needs an index.md`)
				}
				throw error
			}
			return { ...parsePost(file, source), file }
		})
	return listPosts(parsed, includeDrafts).map((post) => ({ ...post, minutes: readingTime(post.body, post.lang) }))
}
