import { outputFileName } from './output.ts'
import { createRouteTable, type PageModule, type RenderContext } from './route.ts'

// Eager so the SSR bundle contains every page and nothing lists them by hand.
const modules = import.meta.glob<PageModule>('/src/pages/**/index.tsx', { eager: true })

/** One file of the built site. */
export type RenderedFile = {
	/** Path relative to the output directory. */
	fileName: string
	body: string
}

/**
 * Renders the route at a URL path, for the dev server.
 *
 * @param pathname - Requested URL path.
 * @param context - Assets as the dev server serves them.
 * @returns The response body, or `undefined` when no route has this path.
 */
export async function renderPath(pathname: string, context: RenderContext): Promise<string | undefined> {
	const route = (await createRouteTable(modules)).get(pathname)
	return route?.render(context)
}

/**
 * Lists every route path, so the dev server can tell a missing trailing slash from a missing page.
 *
 * @returns All route paths of the site.
 */
export async function listPaths(): Promise<string[]> {
	return [...(await createRouteTable(modules)).keys()]
}

/**
 * Renders every route of the site, for the build.
 *
 * @param context - Assets as the client build emitted them.
 * @returns One file per route.
 */
export async function renderSite(context: RenderContext): Promise<RenderedFile[]> {
	const table = await createRouteTable(modules)
	return Promise.all(
		[...table.values()].map(async (route) => ({
			fileName: outputFileName(route.path),
			body: await route.render(context),
		}))
	)
}
