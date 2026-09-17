import type {
	FeedItemInput,
	OxContentCustomHostDependency,
	OxContentCustomHostModule,
	OxContentCustomHostRenderContext,
	OxContentCustomHostRoute,
	OxContentCustomHostRoutesContext,
} from '@ox-content/vite-plugin'

import { rewriteCollectionAssetUrls } from '@ox-content/vite-plugin'

import { loadPosts } from './blog/posts.ts'
import { labelTaskListItems } from './blog/task-list.ts'
import { SITE } from './config/site.ts'
import { createRouteTable, type PageModule, type PageRoute } from './ssg/route.ts'

// Eager so the build contains every page and nothing lists them by hand.
const modules = import.meta.glob<PageModule>('/src/pages/**/index.tsx', { eager: true })

/** The Tailwind entry, built as a client input so the manifest knows its hashed URL. */
export const STYLESHEET = 'src/styles/global.css'

/**
 * Decides whether drafts are part of this run: previewed in the dev server, never built.
 *
 * @param context - Any custom-host context.
 * @returns True only while serving.
 */
function includeDrafts(context: Pick<OxContentCustomHostRoutesContext, 'mode'>): boolean {
	return context.mode === 'serve'
}

/**
 * Picks the Content-Type for a non-HTML route from its path.
 *
 * @param path - Route path with a file extension.
 * @returns A Content-Type header value.
 */
function contentType(path: string): string {
	if (path.endsWith('.xml')) {
		return 'application/xml; charset=utf-8'
	}
	if (path.endsWith('.png')) {
		return 'image/png'
	}
	return 'text/plain; charset=utf-8'
}

/**
 * Resolves the URLs of the site stylesheet for the current run.
 *
 * The build reads the hashed URL from the client manifest. The dev server links the source path
 * instead: Ox Content resolves dev stylesheets from Vite's module graph, which has no entry for the
 * stylesheet until a browser has requested it once, so the first page load would fail.
 *
 * @param context - Route render context.
 * @returns Stylesheet URLs to link, in order.
 * @throws If the build manifest has no entry for the stylesheet.
 */
function stylesheetHrefs(context: OxContentCustomHostRenderContext): string[] {
	if (context.mode === 'serve') {
		return [`/${STYLESHEET}`]
	}
	const css = context.assets.stylesheets({ modules: [STYLESHEET] })
	if (css.diagnostics.length > 0) {
		throw new Error(css.diagnostics.map(({ message }) => message).join('\n'))
	}
	return css.stylesheets.map(({ href }) => href)
}

/**
 * Reads a page's title and description back out of its rendered HTML.
 *
 * Page modules already put both into the document head, so the host recovers them here for Ox
 * Content's crawl manifests instead of making every page declare them twice.
 *
 * @param html - Rendered document.
 * @returns The decoded title and description, when present.
 */
export function readHeadMetadata(html: string): { title?: string; description?: string } {
	// React escapes these characters in text and attribute values; nothing else needs decoding.
	const decode = (text: string) =>
		text
			.replaceAll('&quot;', '"')
			.replaceAll('&#x27;', "'")
			.replaceAll('&lt;', '<')
			.replaceAll('&gt;', '>')
			.replaceAll('&amp;', '&')
	const title = /<title>([^<]*)<\/title>/.exec(html)?.[1]
	const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1]
	return {
		title: title === undefined ? undefined : decode(title),
		description: description === undefined ? undefined : decode(description),
	}
}

/** Route whose page is shown for unknown URLs, matching `not_found_handling` in wrangler.jsonc. */
const NOT_FOUND_PATH = '/404.html'

/**
 * Renders one page of the route table into an Ox Content render result.
 *
 * @param page - Route from the table.
 * @param renderContext - Ox Content's render context for the current request or build output.
 * @returns HTML with head metadata, or text with a Content-Type, plus dev-server dependencies.
 */
async function renderPage(page: PageRoute, renderContext: OxContentCustomHostRenderContext) {
	const dependencies: OxContentCustomHostDependency[] = []
	const body = await page.render({
		assets: {
			stylesheets: stylesheetHrefs(renderContext),
			// Syntax colours, written by Ox Content from the theme tokens in vite.config.ts.
			syntaxStylesheet: renderContext.assets.themeTokens?.href,
		},
		root: renderContext.root,
		async renderMarkdown(source, documentPath) {
			const result = await renderContext.markdown.render({ source, documentPath })
			dependencies.push(...result.dependencies)
			const html = labelTaskListItems(result.html)
			// Point relative image URLs at the hashed copies planned in vite.config.ts.
			const manifest = await renderContext.assets.collectionManifest()
			return manifest === undefined ? html : rewriteCollectionAssetUrls({ html, pagePath: page.path, manifest }).html
		},
	})
	if (body instanceof Uint8Array) {
		return { body, contentType: contentType(page.path), dependencies }
	}
	const isHtml = page.path.endsWith('/') || page.path.endsWith('.html')
	return isHtml
		? { html: body, ...readHeadMetadata(body), dependencies }
		: { text: body, contentType: contentType(page.path), dependencies }
}

/**
 * Ox Content custom host: our page modules own every URL, layout and publication rule, while Ox
 * Content owns the Vite dev/build lifecycle, Markdown rendering, the feed, the sitemap and
 * robots.txt.
 */
const host = {
	async routes(context) {
		const table = await context.memo('routes', () =>
			createRouteTable(modules, { includeDrafts: includeDrafts(context) })
		)
		return [...table.values()].map((page): OxContentCustomHostRoute => ({
			path: page.path,
			inputPath: page.inputPath,
			// Only directory paths are real pages; /404.html is served for every unknown URL and must
			// stay out of the sitemap and llms.txt.
			unlisted: !page.path.endsWith('/'),
			render: (renderContext) => renderPage(page, renderContext),
		}))
	},

	// Dev only: Cloudflare already answers unknown URLs with 404.html in production. Without this the
	// dev server falls through to a bare "Cannot GET" page, so the 404 design could not be checked.
	async notFound(context) {
		// The host runs before Vite's own middleware, so this also sees requests for Vite's client, source
		// modules and stylesheets. Only page navigations, which ask for HTML, get the 404 page; everything
		// else falls through to Vite.
		if (!(context.request.headers.get('accept') ?? '').includes('text/html')) {
			return undefined
		}
		const table = await createRouteTable(modules, { includeDrafts: includeDrafts(context) })
		const page = table.get(NOT_FOUND_PATH)
		if (page === undefined) {
			return undefined
		}
		const result = await renderPage(page, { ...context, route: { path: NOT_FOUND_PATH, render: () => undefined } })
		return { ...result, status: 404 }
	},

	outputs(context) {
		const posts = loadPosts(includeDrafts(context))
		return {
			siteDescription: `${SITE.name} ${SITE.tagline}.`,
			collections: {
				blog: posts.map((post): FeedItemInput => ({
					title: post.title,
					description: post.description,
					path: `blog/${post.slug}/`,
					date: post.date,
					language: post.lang,
				})),
			},
		}
	},
} satisfies OxContentCustomHostModule

export default host

if (import.meta.vitest) {
	const { expect, test } = import.meta.vitest

	test('readHeadMetadata decodes the title and description React rendered', () => {
		expect(
			readHeadMetadata(
				'<head><title>A &amp; B | 11gather11</title><meta name="description" content="It&#x27;s &quot;fine&quot;"/></head>'
			)
		).toEqual({ title: 'A & B | 11gather11', description: 'It\'s "fine"' })
	})
}
