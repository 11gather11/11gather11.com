import { renderMarkdown } from './markdown.ts'
import { listPosts, parsePost, readingTime, type PostSource } from './post.ts'

/** A post ready to render. */
export type Post = PostSource & {
	/** Article body as HTML. */
	html: string
	/** Estimated reading time in minutes. */
	minutes: number
}

// Raw strings rather than a Markdown plugin: the pipeline lives in markdown.ts, and Vite still tracks
// these files, so editing a post reloads the dev server page.
const sources = import.meta.glob<string>('/src/content/blog/*.md', { query: '?raw', import: 'default', eager: true })

/**
 * Loads every post that should be published, newest first.
 *
 * Drafts are included in the dev server (`import.meta.env.DEV`) so they can be previewed, and left
 * out of the build, so they never reach the index, the feed, the sitemap or a URL.
 *
 * @returns Rendered posts.
 * @throws If any post has invalid frontmatter, which fails the build.
 */
export async function loadPosts(): Promise<Post[]> {
	const parsed = Object.entries(sources).map(([file, source]) => parsePost(file.slice(1), source))
	return Promise.all(
		listPosts(parsed, import.meta.env.DEV).map(async (post) => ({
			...post,
			html: await renderMarkdown(post.body),
			minutes: readingTime(post.body, post.lang),
		}))
	)
}
