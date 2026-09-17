import type { Post } from '../blog/posts.ts'

import { outputFileName } from './output.ts'

type MaybePromise<T> = T | Promise<T>

/** Built files a page links to, resolved by the dev server or the client build. */
export type SiteAssets = {
	/** Stylesheet URLs to link from every HTML page, in order. */
	stylesheets: readonly string[]
	/** Syntax colour stylesheet, linked only by pages that render highlighted code. */
	syntaxStylesheet?: string
	/** Embed card stylesheet URLs, linked only by pages that render an embed. */
	embedStylesheets: readonly string[]
}

/** What a route receives when it renders. */
export type RenderContext = {
	assets: SiteAssets
	/**
	 * Renders Markdown through the Ox Content pipeline configured in vite.config.ts.
	 *
	 * @param source - Markdown body without frontmatter.
	 * @param documentPath - Project-relative path of the source file, used for relative links and
	 *   dev-server invalidation.
	 * @returns HTML.
	 */
	renderMarkdown: (source: string, documentPath: string) => Promise<string>
	/** Absolute project root, for routes that read or render files at build time. */
	root: string
}

/** What a page module receives when it lists its routes. */
export type RoutesContext = {
	/**
	 * Posts that get a page in this run, newest first: every post in the dev server, only published
	 * ones in the build. Loaded once by the host so page modules share one copy.
	 */
	posts: readonly Post[]
}

/** One public URL and how to produce its body. */
export type PageRoute = {
	/** Public URL path; see {@link outputFileName} for the accepted shapes. */
	path: string
	/**
	 * Project-relative file the page is written in, whose git history dates the page in the sitemap.
	 * Defaults to the page module; routes built from content, such as posts, point at that content.
	 */
	inputPath?: string
	/** Keeps the page out of the sitemap, feeds and llms.txt while still building it. */
	unlisted?: boolean
	/** Text for HTML and XML routes; bytes for binary files such as generated images. */
	render: (context: RenderContext) => MaybePromise<string | Uint8Array>
}

/**
 * Lists the URLs a page module serves.
 *
 * A function rather than an array so modules that derive URLs from content (such as one URL per
 * article) can load that content first.
 */
export type PageRoutes = (context: RoutesContext) => MaybePromise<readonly PageRoute[]>

/** The shape `src/pages/**\/index.tsx` modules export. */
export type PageModule = {
	routes: PageRoutes
}

/** Every route of the site, looked up by URL path. */
export type RouteTable = ReadonlyMap<string, PageRoute>

/**
 * Collects the routes of all page modules into one table.
 *
 * @param modules - Page modules keyed by their source path, as `import.meta.glob` returns them.
 * @param context - Passed to every module's `routes`.
 * @returns Routes keyed by URL path.
 * @throws If a path is malformed or two routes claim the same path, since one would silently
 *   overwrite the other's output file.
 * @example
 * const table = await createRouteTable(import.meta.glob('/src/pages/**\/index.tsx', { eager: true }), { posts: [] })
 */
export async function createRouteTable(
	modules: Record<string, PageModule>,
	context: RoutesContext
): Promise<RouteTable> {
	const table = new Map<string, PageRoute>()
	// Remember which module added each path so a clash names both sides.
	const owners = new Map<string, string>()
	for (const [source, module] of Object.entries(modules)) {
		for (const route of await module.routes(context)) {
			// Validate the path shape here, not only at write time, so dev fails as early as build.
			outputFileName(route.path)
			const owner = owners.get(route.path)
			if (owner !== undefined) {
				throw new Error(`Route ${route.path} is defined by both ${owner} and ${source}`)
			}
			owners.set(route.path, source)
			// Glob keys are root-absolute (/src/pages/…); inputPath is project-relative.
			table.set(route.path, { ...route, inputPath: route.inputPath ?? source.replace(/^\//, '') })
		}
	}
	return table
}

if (import.meta.vitest) {
	const { describe, expect, test } = import.meta.vitest

	const route = (path: string): PageRoute => ({ path, render: () => path })
	const context: RoutesContext = { posts: [] }

	describe('createRouteTable', () => {
		test('merges routes from every module', async () => {
			const table = await createRouteTable(
				{
					'/src/pages/index.tsx': { routes: () => [route('/')] },
					'/src/pages/blog/index.tsx': { routes: async () => [route('/blog/'), route('/blog/rss.xml')] },
				},
				context
			)
			expect([...table.keys()]).toEqual(['/', '/blog/', '/blog/rss.xml'])
		})

		test('dates routes by their page module unless they name their own source', async () => {
			const table = await createRouteTable(
				{
					'/src/pages/index.tsx': { routes: () => [route('/')] },
					'/src/pages/blog/[slug]/index.tsx': {
						routes: () => [{ ...route('/blog/hello/'), inputPath: 'src/content/blog/hello/index.md' }],
					},
				},
				context
			)
			expect(table.get('/')?.inputPath).toBe('src/pages/index.tsx')
			expect(table.get('/blog/hello/')?.inputPath).toBe('src/content/blog/hello/index.md')
		})

		test('rejects two modules claiming one path', async () => {
			await expect(
				createRouteTable(
					{
						'/src/pages/a/index.tsx': { routes: () => [route('/same/')] },
						'/src/pages/b/index.tsx': { routes: () => [route('/same/')] },
					},
					context
				)
			).rejects.toThrow('/same/ is defined by both /src/pages/a/index.tsx and /src/pages/b/index.tsx')
		})

		test('rejects a malformed path', async () => {
			await expect(
				createRouteTable({ '/src/pages/index.tsx': { routes: () => [route('/about')] } }, context)
			).rejects.toThrow('must end with "/" or a file extension')
		})
	})
}
