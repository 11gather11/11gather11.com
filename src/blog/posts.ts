import type { OxContentCustomHostBaseContext } from '@ox-content/vite-plugin'

import { buildCollectionManifest, classifyPublishState } from '@ox-content/vite-plugin'
import path from 'node:path'

import { postFromEntry, readingTime, sortPosts, type PostSource } from './post.ts'

/** A post's metadata, ready to list or to render through the Markdown pipeline. */
export type Post = PostSource & {
	/** Project-relative path of the source file, for the Markdown renderer and sitemap dates. */
	file: string
	/** Estimated reading time in minutes. */
	minutes: number
	/** False for `unlisted` posts: the page is built but left out of the index, feed and sitemap. */
	listed: boolean
}

/**
 * Loads the posts that get a page in this run, newest first.
 *
 * Posts come from the `blog` collection in vite.config.ts, whose validate hook has already checked
 * their frontmatter. Which ones are built is Ox Content's publish state: drafts, posts dated or
 * scheduled in the future and expired posts are left out of the build, and `unlisted` posts are
 * built but not listed. The dev server previews them all.
 *
 * The manifest is built directly rather than imported from `virtual:ox-content/collections`, so the
 * same function works in vite.config.ts, where virtual modules do not exist.
 *
 * @param context - Any custom-host context: its mode, root and resolved Ox Content options.
 * @returns Posts without rendered HTML; pages render the body when they need it.
 * @throws If a post fails validation, which fails the build.
 */
export async function loadPosts(
	context: Pick<OxContentCustomHostBaseContext, 'mode' | 'root' | 'options'>
): Promise<Post[]> {
	const manifest = await buildCollectionManifest(context.root, context.options)
	const contentDir = path.relative(context.root, path.resolve(context.root, context.options.srcDir))
	// Undefined options turn filtering off, so the dev server keeps every post visible.
	const publishState = context.mode === 'serve' ? undefined : context.options.publishState
	const posts = (manifest.collections.blog ?? []).flatMap((entry): Post[] => {
		const decision = classifyPublishState(entry.frontmatter, publishState)
		if (!decision.output) {
			return []
		}
		const post = postFromEntry(entry)
		return [
			{
				...post,
				file: path.posix.join(contentDir.split(path.sep).join('/'), entry.source),
				minutes: readingTime(post.body),
				listed: decision.listed,
			},
		]
	})
	return sortPosts(posts)
}
